import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http'; // Importa HttpClientModule

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { ProductsComponent } from './components/products/products.component';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { CartComponent } from './components/cart/cart.component';
import { DetailsComponent } from './components/details/details.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { ErrorpageComponent } from './components/errorpage/errorpage.component';
import { PaymentSuccessComponent } from './components/payment-success/payment-success.component';
import { AdminPanelComponent } from './admin-panel/admin-panel/admin-panel.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ProductsComponent,
    AdminPanelComponent,
    LoginComponent,
    RegisterComponent,
    CartComponent,
    DetailsComponent,
    NavbarComponent,
    FooterComponent,
    ErrorpageComponent,
    PaymentSuccessComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
