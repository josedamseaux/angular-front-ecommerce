import { Component } from '@angular/core';
import { UserInterface } from '../../interfaces/user.interface';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {

  user: UserInterface = {
    firstName: '',
    lastName: '',
    age: '',
    email: '',
    username: '',
    password: '',
  }

  confirmPassword: string | undefined;

  constructor(public authService: AuthService, private router: Router) { }

  register() {

    if(this.confirmPassword != this.user.password){
      console.log('contraseñas no coinciden')
    }

    if(this.user.age){
      +this.user.age
    }

    console.log(this.user);

    this.authService.register(this.user).subscribe((data) => {
      console.log(data);
      const user = data.username
      const accessToken = data.accessToken;
      const refreshToken = data.refreshToken;
      this.authService.saveTokens(accessToken, refreshToken);
      console.log('user created succesfully')
      this.router.navigateByUrl('/home')

    });
  }
}
