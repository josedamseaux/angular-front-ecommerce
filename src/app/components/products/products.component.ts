import { Component, ElementRef, ViewChild } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { Router } from '@angular/router';
import { CartService } from 'src/app/services/cart.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent {

  products: any;

  constructor(private productService: ProductService, private authService: AuthService, private router: Router, private cartService: CartService) {
    this.getData();
  }

  getData() {
    this.productService.getProductsConverted().subscribe(data => {
      console.log(data);
      this.products = data;
    });
  }

  arrayOfImagesOfProduct = []

  nextImage(product: any) {
    this.arrayOfImagesOfProduct = product.imges
    let firstElement = this.arrayOfImagesOfProduct.shift();
    this.arrayOfImagesOfProduct.push(firstElement!);
    console.log(this.arrayOfImagesOfProduct)
  }

  productDetails(i: number) {
    this.router.navigate(['/product', i]);
  }

  addToCart(product: any) {
    this.authService.isUserLogged().subscribe(resp=>{
      console.log(resp)
      if (resp == false) {
        const toggleSessionErrorButton = document.getElementById('toggleSessionError');
        toggleSessionErrorButton?.click()
        setTimeout(() => {
          this.authService.logout()
        }, 3000)
      } else {
        this.cartService.addToCart(product.product_id)
      }
    })
  }

}

export interface Product {
  createdAt: string;
  description: string;
  id: number; // Hacer age opcional
  imges: string[];
  imageData: any;
  productName: string;
  quantity: number;
  totalAmount: number;
  updatedAt: string;
}
