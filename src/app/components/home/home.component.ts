import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { CartService } from 'src/app/services/cart.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {

  constructor(private router: Router, private authService: AuthService){}

  shoppingCartCount: number = 0;

  ngOnInit() {
  }

  logout(){
    this.authService.logout().subscribe(resp=>{
      console.log(resp)
    })
  }

  login(){
    this.router.navigateByUrl('/login')
  }

  register(){
    this.router.navigateByUrl('/register')
  }

}
