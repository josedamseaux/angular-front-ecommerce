import { Component, OnInit } from '@angular/core';
import { Subscription, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ProductInterface } from 'src/app/interfaces/product.interface';
import { AuthService } from 'src/app/services/auth.service';
import { ProductService } from 'src/app/services/product.service';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css']
})
export class AdminPanelComponent implements OnInit {

  usersData: any = {
    users: [],
    totalCount: 0,
    totalPages: 0,
  };

  currentPage: number = 1;

  product: ProductInterface = {
    productName: '',
    description: '',
    price: 0,
    quantity: 0
  };

  response: any;

  imgs: any[] = [];

  private productAddedSubscription: Subscription;

  searchValue: string = ''

  selectedFiles: File[] = [];
  filesAdded: number = 0
  maxFilesLimitReached = ''

  userFound: any;
  userPurchases: any = [];


  constructor(private authService: AuthService, private productService: ProductService, private usersService: UsersService, private http: HttpClient) {
    this.getData();
    this.productAddedSubscription = this.productService.onProductChange().subscribe(() => {
      this.getData();
    });
  }

  ngOnInit(): void {
    this.getUsers(this.currentPage);
  }

  onKey(event: any) {
    this.searchValue = event.target.value;
  }

  // PRODUCT METHODS****************
  deleteItem(i: any) {
    this.productService.deleteItem(i)
  }

  onFileSelected(event: any) {
    for (let i = 0; i < event.target.files.length; i++) {
      this.selectedFiles.push(event.target.files[i]);
    }
    this.filesAdded = this.selectedFiles.length
    if (this.selectedFiles.length === 6) {
      this.maxFilesLimitReached = 'Max files reached'
    }
  }


  getData() {
    this.productService.getProductsConverted().subscribe(resp=>{
      console.log(resp)
    })
  }

  submitProduct(form: any) {
    if (form.valid && this.selectedFiles) {
      this.productService.addProduct(this.product, this.selectedFiles)
        .subscribe(response => {
          form.reset();
          if (response) {
            console.log('Producto agregado exitosamente:', response);
          }
        });
    }
  }

  // USERS METHODS  ****************
  async getUsers(page: number) {
    const data: any = await this.usersService.getUsers(page).toPromise();
    console.log(data);
    this.usersData.users = data.users;
    this.usersData.totalCount = data.totalCount;
    this.usersData.totalPages = data.totalPages;
  }

  async findUserAndPurchases() {
    if (this.searchValue === '') {
      this.userFound = []
    }
    const data: any = await this.usersService.findUser(this.searchValue).toPromise()
    this.userFound = data
    console.log(data);
  }

  async clickOnUser(i: any) {
    console.log(i)
    console.log(this.userPurchases)

    const user: any = await this.usersService.findUser(i.email).toPromise()
    const userPurchases = await this.usersService.findUserPurchases(i.id).subscribe(data => {
      this.userPurchases = data
      console.log(data)
    })
    this.userFound = user
  }

  getPageNumbers(): number[] {
    return Array.from({ length: this.usersData.totalPages }, (_, i) => i + 1);
  }

  goToPage(pageNumber: number): void {
    this.currentPage = pageNumber;
    this.getUsers(this.currentPage);
  }

  deletePurchase(id: string) {
    const refreshToken = this.authService.getRefreshToken();
    if (refreshToken) {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${refreshToken}`
      });
      return this.http.delete<any>(`http://localhost:8000/api/purchases/delete-purchase-by-id/${id}`,
        { headers }).subscribe(data => {
          console.log(data)
          // this.getIdsFromItemsFromShoppingCart()
        })
    }
    return of()
  }

  // COUPON METHODS ****************

  coupon = {
    name: '',
    code: '',
    discountPercentage: 0, // Porcentaje de descuento
    discountAmount: 0, // Monto del descuento
    maxUsesPerUser: 0, // Límite de usos por usuario
    isActive: false, // Estado del cupón: activo o inactivo
    eligibleProducts: [], // Productos específicos elegibles para el descuento
    expirationDate: '',// Fecha de expiración del cupón
    uses: 0
  };


  submitCoupon(couponForm: any) {
    // console.log(couponForm.value)
    console.log(this.coupon)

    this.productService.addCoupon(this.coupon).subscribe(data => {
      console.log(data)
    })
  }

  ngOnDestroy() {
    this.productAddedSubscription.unsubscribe();
  }

}
