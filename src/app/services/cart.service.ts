import { Product } from './../components/products/products.component';
import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject, EMPTY, Observable, forkJoin, map, of, switchMap } from 'rxjs';
import { AuthService } from './auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { ProductService } from './product.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private apiUrlForShoppingCart = 'http://localhost:8000/api/shoppingcart'
  private apiUrlForProducts = 'http://localhost:8000/api/products/get-product/'

  constructor(private http: HttpClient, private authService: AuthService, private cookieService: CookieService, private productService: ProductService) {
    this.getIdsFromItemsFromShoppingCart()
    this.createCokkieWithIdForTemporalCart()
    this.mergeTemporalCartWithNormalCart()
  }

  // NORMAL SHOPPING CART
  private shoppingCart: BehaviorSubject<ShoppingCart> = new BehaviorSubject<ShoppingCart>({
    shoppingCart_id: '',
    shoppingCart_created_at: '',
    shoppingCart_updated_at: '',
    shoppingCart_items: [],
    shoppingCart_user_id: ''
  });
  shoppingCart$ = this.shoppingCart.asObservable()
  shoppingCartAmount: BehaviorSubject<any> = new BehaviorSubject<any>(0);
  shoppingCartAmount$ = this.shoppingCartAmount.asObservable()

  // TEMPORAL SHOPPING CART
  private temporalShoppingCart: BehaviorSubject<TemporalShoppingCart> = new BehaviorSubject<TemporalShoppingCart>({
    temporalShoppingCart_id: '',
    temporalShoppingCart_id_cookie: '',
    temporalShoppingCart_created_at: '',
    shoppingCart_updated_at: '',
    temporalShoppingCart_items: [],
    temporalShoppingCart_updated_at: '',
  });
  temporalShoppingCart$ = this.temporalShoppingCart.asObservable()
  private temporalShoppingCartAmount: BehaviorSubject<any> = new BehaviorSubject<any>(0);
  temporalShoppingCartAmount$ = this.temporalShoppingCartAmount.asObservable()



  currentAmount: number = 0

  getHeadersAndToken() {
    const refreshToken = this.authService.getRefreshToken();
    if (refreshToken) {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${refreshToken}`
        });
        return headers
    }
    return null
  }

  mergeTemporalCartWithNormalCart() {
    let headers = this.getHeadersAndToken()
    let idForTemporalCart = this.cookieService.get('idForTempCart')
    if (idForTemporalCart) {
      this.http.get<any>(`${this.apiUrlForShoppingCart}/get-items-from-temporal-cart?idForTemporalCart=${idForTemporalCart}`)
        .subscribe(dataTemporalCart => {
          if(!dataTemporalCart){ return }

          this.shoppingCart$.subscribe(normalShoppingCart => {
            let finalData = normalShoppingCart.shoppingCart_items.concat(dataTemporalCart.temporalShoppingCart_items)
            if (headers) {
              this.http.post<any>(`${this.apiUrlForShoppingCart}/add-to-merge`, { items: finalData }, { headers }).subscribe(data => {
              })
              this.http.delete(`${this.apiUrlForShoppingCart}/delete-entry-temp-cart/${idForTemporalCart}`).subscribe(resp => {
              })
            }
          })
        })
    }

  }

  getIdsFromItemsFromShoppingCart(): Observable<ShoppingCart> {
    let headers = this.getHeadersAndToken()

    if (headers) {
      const itemsFromCart = this.http.get<ShoppingCart>(`${this.apiUrlForShoppingCart}/get-items-from-cart`, { headers })
      itemsFromCart.subscribe((data: ShoppingCart) => {
        console.log(data)
        this.shoppingCart.next(data);
        this.getAmountOfItemsOnCart()
      })
    }

    if (!headers) {
      console.log('toy adentro !headers')
      let idForTemporalCart = this.cookieService.get('idForTempCart')
      if (idForTemporalCart) {
        const apiUrl = `${this.apiUrlForShoppingCart}/get-items-from-temporal-cart?idForTemporalCart=${idForTemporalCart}`;
        console.log('apiUrl')
        const itemsFromTemporalCart = this.http.get<any>(apiUrl);
        itemsFromTemporalCart.subscribe(data => {
          if(data){
            this.temporalShoppingCart.next(data)
          }
          this.getAmountOfItemsOnCart()
        })
      }
    }
    return EMPTY
  }

  // Metodo que devuelve items del carrito desde la BD. La complejidad
  // radica en que el backend devuelve un objeto con propiedad img1,2,3,4,5,6... porque admite hasta 6 imagenes
  // y si falta alguna, devuelve null, y en el front se desace de los atrributos null

  getItemsOnCartConverted(): Observable<any[]> {
    let headers = this.getHeadersAndToken();

    let shoppingCart$: Observable<any>;
    if (headers) {
      shoppingCart$ = this.shoppingCart$;
    } else {
      shoppingCart$ = this.temporalShoppingCart$;
    }

    return shoppingCart$.pipe(
      switchMap(data => {
        if (data == null) { return of([]); }
        let items;
        if (headers) {
          items = data.shoppingCart_items;
        } else {
          items = data.temporalShoppingCart_items;
        }
        const observables: Observable<any>[] = items.map((itemId: any) => {
          const url = `${this.apiUrlForProducts}${itemId}`;
          return this.http.get(url);
        });
        return forkJoin(observables).pipe(
          map((productsArrays: any[]) => {
            // Flatten the array of arrays
            const flattenedProducts = productsArrays.reduce((acc, val) => acc.concat(val), []);
            flattenedProducts.forEach((element: any) => {
              for (let i = 1; i <= 6; i++) {
                const imageDataField = 'image_image_data' + i;
                if (element[imageDataField] === null) {
                  delete element[imageDataField];
                }
                if (element[imageDataField] && element[imageDataField].data) {
                  if (!element.imges) {
                    element.imges = [];
                  }
                  const base64Image = this.productService.arrayBufferToBase64(element[imageDataField].data);
                  element.imges.push('data:' + element[imageDataField].type + ';base64,' + base64Image);
                  delete element[imageDataField]; // Eliminar el campo después de procesarlo
                }
              }
            });
            return flattenedProducts;
          })
        );
      })
    );
  }

  createCokkieWithIdForTemporalCart() {
    let idForTemporalCart = this.cookieService.get('idForTempCart')
    if (idForTemporalCart) {
      return idForTemporalCart
    } else {
      let randomNumber = Math.floor(Math.random() * 1000000); // Genera un número aleatorio entre 0 y 999999
      let idForCookie = `${randomNumber.toString()}`
      this.cookieService.set('idForTempCart', idForCookie, undefined, '/', undefined, true, 'Strict');
      let idForTemporalCart = this.cookieService.get('idForTempCart')
      return idForTemporalCart
    }
  }

  addToCart(itemId: string) {
    let headers = this.getHeadersAndToken()

    if (!headers) {
      console.log('entro en !headers')
      let idForTemporalCart = this.cookieService.get('idForTempCart')
      if (idForTemporalCart) {
        return this.http.post<any>(`${this.apiUrlForShoppingCart}/add`, { items: itemId, idForTemporalCart }).subscribe(data => {
          this.getIdsFromItemsFromShoppingCart()
        })
      } else if (!idForTemporalCart) {



        let idForTemporalCart = this.createCokkieWithIdForTemporalCart()
        return this.http.post<any>(`${this.apiUrlForShoppingCart}/add`, { items: itemId, idForTemporalCart }).subscribe(data => {
          this.getIdsFromItemsFromShoppingCart()
        })
      }
    }

    if (headers) {
      let userIsLogged = this.authService.isUserLogged()

      if(userIsLogged){
        return this.http.post<any>(`${this.apiUrlForShoppingCart}/add`, { items: itemId }, { headers }).subscribe(data => {
          this.getIdsFromItemsFromShoppingCart()
        })
      } else {
        console.log('this.tokenExpiredSession.next(true)')
        console.log('token expired')
      }
    }
    return null
  }

  getAmountOfItemsOnCart() {
    let headers = this.getHeadersAndToken()

    this.getItemsOnCartConverted().subscribe((data: any[]) => {
      if (data === null) {
        this.shoppingCartAmount.next(0);
      }
      const sum = data.reduce((total, item) => {
        const priceAsFloat = parseFloat(item.product_price);
        return total + priceAsFloat;
      }, 0);

      if (headers) {
        this.shoppingCartAmount.next(sum);
      }
      if (!headers) {
        this.temporalShoppingCartAmount.next(sum)
      }
    });
  }

  deleteItemInCart(id: string) {
    let headers = this.getHeadersAndToken()
    if (headers) {
      return this.http.put(`${this.apiUrlForShoppingCart}/delete/${id}`, { id }, { headers }).subscribe(resp => {
        console.log(resp)
        this.getIdsFromItemsFromShoppingCart()
      });
    }

    let idForCookie = this.createCokkieWithIdForTemporalCart()
    console.log(idForCookie)
    if (!headers && idForCookie) {
      return this.http.put(`${this.apiUrlForShoppingCart}/delete-item-from-temporal-cart/${id}?idForTemporalCart=${idForCookie}`, { idForCookie }).subscribe(resp => {
        console.log(resp)
        this.getIdsFromItemsFromShoppingCart()
      });
    }
    return EMPTY;
  }

  clearShoppingCart() {
    this.shoppingCart$.subscribe(resp => {
      resp.shoppingCart_items.forEach(id => {
        this.deleteItemInCart(id)
        this.shoppingCartAmount.next(0);
      })
    })
  }

  purchaseSuccessful() {
    localStorage.removeItem('sessionId');
    localStorage.removeItem('sessionId');
    this.clearShoppingCart()
  }

  ngOnDestroy() {
    this.shoppingCart.unsubscribe()
    this.shoppingCartAmount.unsubscribe()
  }

}

interface ShoppingCart {
  shoppingCart_id: string;
  shoppingCart_created_at: string;
  shoppingCart_updated_at: string;
  shoppingCart_items: string[];
  shoppingCart_user_id: string;
}


interface TemporalShoppingCart {
  temporalShoppingCart_id: string;
  temporalShoppingCart_id_cookie: string;
  temporalShoppingCart_created_at: string;
  shoppingCart_updated_at: string;
  temporalShoppingCart_items: string[];
  temporalShoppingCart_updated_at: string;
}

export class ShippingInfo {
  direccion!: string;
  ciudad!: string;
  codigoPostal!: string;
}

export class AdditionalInfo {
  additionalInfo!: string;
}
