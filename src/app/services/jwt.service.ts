import { Injectable } from '@angular/core';
import { jwtDecode } from "jwt-decode";

@Injectable({
  providedIn: 'root'
})
export class JwtService {

  decodeToken(token: string | null): JwtToken | null {
    try {
      if (token) {
        const decodedToken = jwtDecode<JwtToken>(token);
        return decodedToken;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
}

interface JwtToken {
  sub: string;
  username: string;
  roles: string[];
}
