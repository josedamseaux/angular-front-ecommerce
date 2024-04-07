import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EMPTY, combineLatest, map, of } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { CartService } from 'src/app/services/cart.service';

@Component({
  selector: 'app-payment-success',
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.css']
})
export class PaymentSuccessComponent implements OnInit {
  sessionId: string | undefined;
  purchaseId: string | undefined;

  paymentStatus: string | undefined;
  messageForPayment: string | undefined;

  constructor(private http: HttpClient, private cartService: CartService) { }

  ngOnInit(): void {
    // this.addPurchaseToDb()
    const sessionId = localStorage.getItem('sessionId');
    const purchaseId = localStorage.getItem('purchaseId');
    console.log(sessionId)
    console.log(purchaseId)

    if (sessionId && purchaseId) {
      this.sessionId = sessionId
      this.purchaseId = purchaseId
      this.getPaymentStatus();
    } else {
      // El sessionId no está presente en el almacenamiento local
      console.log('Session ID no encontrado.');
    }
  }

  getPaymentStatus() {
    const apiUrl = 'http://localhost:8000/api/payments/get-payment-status';

    const data = {
      sessionId: this.sessionId,
      purchaseId: this.purchaseId
    };

    const headers = this.cartService.getHeadersAndToken();

    if (headers) {
      return this.http.post(apiUrl, data, { headers }).subscribe((response: any) => {
        console.log(response)
        this.paymentStatus = response.payment_status;
        console.log(response)
        if (response.payment_status === 'paid') {
          this.cartService.purchaseSuccessful()
          console.log('entro en el if check DB')
        } else {
          this.messageForPayment = '¡Lo sentimos! Hubo un problema con el pago'
        }
      });
    }
    // Devolver un observable vacío en caso de que no haya headers válidos
    return of();
  }


  addPurchaseToDb() {

    const urlForPurchase = 'http://localhost:8000/api/purchases/new-purchase'

    combineLatest([this.cartService.shoppingCart$, this.cartService.shoppingCartAmount$]).pipe(
      map(([shoppingCart, shoppingCartAmount]) => {
        return {
          products: shoppingCart.shoppingCart_items,
          total: shoppingCartAmount
        };
      })
    ).subscribe(data => {
      console.log(data);

      const headers = this.cartService.getHeadersAndToken()

      if (headers) {
        return this.http.post(urlForPurchase, { data }, { headers }).subscribe(resp => {
          console.log(resp)
        })
      }
      return null
    });






  }



}
