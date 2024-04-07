import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { CartService } from 'src/app/services/cart.service';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

  constructor(private cartService: CartService,
    private authService: AuthService,
    private router: Router,
    private productService: ProductService) {}

  private usernameSubscription: Subscription | undefined;

  storedUsername = localStorage.getItem('username');
  isLoggedIn: boolean = false

  user: string | null = '';
  shoppingCartCount: number = 0;
  shoppingCartTotal: number = 0;

  // OffCanvas
  productsInCart: any

  ngOnInit() {
    this.getItems();
    this.getUsername()
    this.getItemsInCart()
  }

  getUsername() {
    if (this.user == ''){
      this.user = 'visitante'
      this.isLoggedIn = false
    }
    if (this.storedUsername) {
      this.user = this.storedUsername;
      this.isLoggedIn = true
    } else {
      this.usernameSubscription = this.authService.username$.subscribe(data => {
        this.user = data;
        localStorage.setItem('username', data); // Almacenar en localStorage
      });
    }
  }

  getItems() {
    if (!this.storedUsername){
      this.cartService.temporalShoppingCart$.subscribe(data => {
        if(data.temporalShoppingCart_items.length){
          this.shoppingCartCount = data.temporalShoppingCart_items.length
        }
      })
      this.cartService.temporalShoppingCartAmount$.subscribe(resp => {
        this.shoppingCartTotal = resp
      })
    }
    else if (this.user != 'visitante'){

      this.cartService.shoppingCart$.subscribe(data => {
        console.log(data)
        this.shoppingCartCount = data.shoppingCart_items.length
      })
      this.cartService.shoppingCartAmount$.subscribe(data => {
        console.log(data)
        this.shoppingCartTotal = data
      })
    }
  }

  logIn(){
    this.router.navigateByUrl('/login');
    }

  logOut(){
    this.authService.logout()
  }

  isLogged(){
    this.authService.isUserLogged()
  }

  forceExpiration(){
    this.authService.forExpirationOfToken()

  }


  getItemsInCart() {
    this.cartService.getItemsOnCartConverted().subscribe( data => {
      console.log(data)
      this.productsInCart = data
      console.log(this.productsInCart)
    });
  }

  shoppingCart(){
    this.router.navigateByUrl('/cart');
  }

  ngOnDestroy() {
    if (this.usernameSubscription) {
      this.usernameSubscription.unsubscribe();
    }
  }
}
