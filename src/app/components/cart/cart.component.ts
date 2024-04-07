import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import {
  AdditionalInfo,
  CartService,
  ShippingInfo,
} from 'src/app/services/cart.service';
import { ProductService } from 'src/app/services/product.service';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent implements OnInit {
  constructor(
    private router: Router,
    private authService: AuthService,
    private cartService: CartService,
    private http: HttpClient,
    private usersService: UsersService
  ) {}

  productsInCart: any = [];

  private apiForPurchase = 'http://localhost:8000/api/payments/pay-with-stripe';

  sessionId!: string;
  paymentStatus!: string;
  messageForPayment: string | undefined;
  shoppingCartTotal!: string;
  user: any
  storedJsonString:any = localStorage.getItem('userInfo');

  shippingInfo: ShippingInfo = new ShippingInfo(); // Instancia del modelo
  additionalInfo: AdditionalInfo = new AdditionalInfo(); // Instancia del modelo

  ngOnInit() {
    this.messageForPayment = '';
    this.getItemsInCart();
    this.getShoppingCartAmount();
    this. getUser()
  }

  getUser(){
    const storedData = JSON.parse(this.storedJsonString);
    console.log(storedData)
    this.usersService.findUser(storedData!.email).subscribe(resp=>{
      console.log(resp)
      this.user = resp
    })

  }

  getPaymentStatus(sessionId: string) {
    const apiUrl = 'http://localhost:8000/api/payments/get-payment-status'; // Cambia la URL según tu configuración
    const data = { sessionId: sessionId };

    return this.http.post(apiUrl, data).subscribe((response: any) => {
      console.log(response);
      this.paymentStatus = response.payment_status;
      if (response.payment_status === 'paid') {
        this.router.navigateByUrl('/payment');
        this.clearCartAfterSuccessfullPurchase();
        // localStorage.removeItem('sessionId');
      } else {
        this.messageForPayment = '¡Lo sentimos! Hubo un problema con el pago';
      }
    });
  }

  getItemsInCart() {
    this.cartService.getItemsOnCartConverted().subscribe((data) => {
      console.log(data);
      this.productsInCart = data;
    });
  }

  getShoppingCartAmount() {
    this.cartService.shoppingCartAmount$.subscribe((data) => {
      console.log(data);
      this.shoppingCartTotal = data;
    });
  }

  deleteFromCart(product: any) {
    let id: string = product.product_id;
    this.cartService.deleteItemInCart(id);
    this.cartService.shoppingCart$.subscribe((resp) => {
      if (resp.shoppingCart_items.length === 0) {
        this.productsInCart = [];
        this.cartService.shoppingCartAmount.next(0);
      }
    });
  }

  async payWithStripe() {
    let cart = JSON.parse(JSON.stringify(this.productsInCart));

    for (let i = 0; i < cart.length; i++) {
      delete cart[i].imges;
      cart[i].product_price = parseFloat(cart[i].product_price);
    }

    console.log(this.productsInCart);

    const refreshToken = this.authService.getRefreshToken();
    // const storedJsonString = localStorage.getItem('userInfo');
    if (this.storedJsonString) {
      const storedData = JSON.parse(this.storedJsonString);

      const cartWithUserInfo = {
        cart: cart,
        shippingInfo: `${this.shippingInfo.direccion}. ${this.shippingInfo.ciudad}, ${this.shippingInfo.codigoPostal}`,
        additionalInfo: this.additionalInfo.additionalInfo,
        status: '',
        user: this.user,
      };

      console.log(cartWithUserInfo);
      if (refreshToken) {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${refreshToken}`,
        });

        return this.http
          .post<any>(this.apiForPurchase, { cartWithUserInfo }, { headers })
          .subscribe((resp) => {
            console.log(resp);
            const sessionUrl = resp.url;
            localStorage.setItem('sessionId', resp.sessionResp.id);
            localStorage.setItem('purchaseId', resp.resp);
            window.location.href = sessionUrl;

            const sessionId = localStorage.getItem('sessionId');
            const purchaseId = localStorage.getItem('purchaseId');
          });
      }
    } else {
      console.log('No hay datos almacenados en localStorage.');
    }
    return null;
  }

  clearCartAfterSuccessfullPurchase() {
    this.cartService.clearShoppingCart();
  }
}
