import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CartService } from 'src/app/services/cart.service';
import { BehaviorSubject } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {

  email!: string;
  password!: string;


  constructor(private authService: AuthService, private router: Router, private cartService: CartService) { }

  login() {
    const user = { username: this.email, password: this.password };

    this.authService.login(user).subscribe((data) => {
      const username = data.username;
      const accessToken = data.accessToken;
      const refreshToken = data.refreshToken;

      const jsonString = JSON.stringify(data);
      localStorage.setItem('userInfo', jsonString);
      this.authService.saveTokens(accessToken, refreshToken);
      if (data.username) {
        setTimeout(() => {
          window.location.reload();
        }, 100);
        this.router.navigateByUrl('/home')
        this.cartService.mergeTemporalCartWithNormalCart()
        this.cartService.getIdsFromItemsFromShoppingCart()
        this.authService.emitUsername(username)
        this.authService.emitInfo(jsonString)
      }
    });
  }

  register(){
    this.router.navigateByUrl('/register')
  }
}
