import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, Subject, catchError, map, tap, throwError } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { UserInterface } from '../interfaces/user.interface';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnInit {
  private accessTokenKey = 'access_token';
  private refreshTokenKey = 'refresh_token';

  private usernameSubject = new Subject<string>();
  username$ = this.usernameSubject.asObservable();

  // TOKEN EXPIRED SESSION
  private isLogged: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isLogged$ = this.isLogged.asObservable()

  urlLogin = 'http://localhost:8000/api/auth/login';
  urlRegister = 'http://localhost:8000/api/users/register';
  urlLogout = 'http://localhost:8000/api/auth/logout';

  constructor(private http: HttpClient, private cookieService: CookieService, private router: Router) { }

  ngOnInit(): void {
    this.isUserLogged()
  }



  login(user: any): Observable<any> {
    return this.http.post(this.urlLogin, user);
  }

  register(user: UserInterface): Observable<any> {
    return this.http.post(this.urlRegister, user);
  }

  saveTokens(accessToken: string, refreshToken: string) {
    this.cookieService.set(this.accessTokenKey, accessToken, undefined, '/', undefined, true, 'Strict');
    this.cookieService.set(this.refreshTokenKey, refreshToken, undefined, '/', undefined, true, 'Strict');
  }

  getAccessToken(): string | null {
    return this.cookieService.get(this.accessTokenKey);
  }

  getRefreshToken(): string | null {
    return this.cookieService.get(this.refreshTokenKey);
  }

  emitUsername(user: any) {
    const refreshToken = this.getRefreshToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${refreshToken}`
    });
    // Aca hacer un get para obtener el primer nombre en el back
    this.http.get(`http://localhost:8000/api/users/get-by-email/${user}`, { headers }).subscribe((resp: any) => {
      console.log(resp)
      this.usernameSubject.next(resp.firstName);
      localStorage.setItem('username', resp.firstName); // Almacenar en localStorage
    })
  }

  emitInfo(userInfo: any) {
    localStorage.setItem('userInfo', userInfo); // Almacenar en localStorage
  }

  getUserData(user: any) {
    this.usernameSubject.next(user);
    localStorage.setItem('username', user); // Almacenar en localStorage
  }

  clearTokens() {
    this.cookieService.delete(this.accessTokenKey, '/');
    this.cookieService.delete(this.refreshTokenKey, '/');
  }

  logout() {
    const refreshTokenKey = this.cookieService.get(this.refreshTokenKey);
    localStorage.removeItem('username');
    if (refreshTokenKey) {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${refreshTokenKey}`
      });
      this.clearTokens();
      this.http.get(this.urlLogout, { headers }).subscribe(resp => {
        console.log(resp)
      })
    }

    setTimeout(() => {
      window.location.reload();
    }, 100);

    this.router.navigateByUrl('/home')
    localStorage.clear();
    return throwError(() => new Error('No se encontró el token de acceso'));
  }

  isUserLogged(): Observable<boolean> {
    let userJSON = localStorage.getItem('userInfo');
    if (!userJSON) {
      throw new Error('No user detected');
    } else {
      const user = JSON.parse(userJSON);
      const username = user.username;
      return this.http.post('http://localhost:8000/api/auth/is-logged', { username }).pipe(
        map((resp: any) => {
          console.log(resp);
          return !!resp; // Convertimos la respuesta a un booleano
        })
      );
    }
  }

  forExpirationOfToken(): boolean {
    let userJSON: any = localStorage.getItem('userInfo');
    if (!userJSON) {
      throw new Error('No user detected');
    }
    else {
      const user = JSON.parse(userJSON);
      const username = user.username;
      console.log(username)
      this.http.post('http://localhost:8000/api/auth/expire-token', { username }).subscribe(resp => {
        console.log(resp)
      })
      return true
    }
  }



}
