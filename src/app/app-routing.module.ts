import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { isAdminGuard } from './guards/isadmin.guard';
import { ErrorpageComponent } from './components/errorpage/errorpage.component';
import { ProductsComponent } from './components/products/products.component';
import { CartComponent } from './components/cart/cart.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AdminPanelComponent } from './admin-panel/admin-panel/admin-panel.component';
import { HomeComponent } from './components/home/home.component';
import { PaymentSuccessComponent } from './components/payment-success/payment-success.component';
// import { isAuthGuard } from './guards/isauth.guard';

const routes: Routes = [
  {path:'home', component: HomeComponent},
  // {path:'profile', component: ProfileComponent},
  // {path:'profile', component: ProfileComponent, canActivate:[isAuthGuard]},
  {path:'products', component: ProductsComponent},
  {path:'not-found', component: ErrorpageComponent},
  {path:'cart', component: CartComponent},
  {path:'payment', component: PaymentSuccessComponent},
  {path:'admin-panel', component: AdminPanelComponent, canActivate:[isAdminGuard]},
  {path:'login', component: LoginComponent},
  {path:'register', component: RegisterComponent},
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
