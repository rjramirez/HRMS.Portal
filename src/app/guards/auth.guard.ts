import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  constructor(private authService: AuthService, private router: Router) {}

  async canActivate(): Promise<boolean> {
    // Force a session check
    await this.authService.loadUser();
    
    if (this.authService.user()) {
      return true;
    }

    // If not logged in, check if we're already on the login page
    if (window.location.pathname.startsWith('/auth/login')) {
      return true;
    }

    // If trying to access protected route while not logged in, show 403
    this.router.navigate(['/403']);
    return false;
  }
}
