import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-callback',
  standalone: true,
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="text-center">
        <h2 class="text-xl font-semibold mb-2">Completing sign in...</h2>
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
      </div>
    </div>
  `
})
export class CallbackComponent implements OnInit {
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.handleAuthCallback().then(() => {
      // Redirect to the dashboard after successful login
      this.router.navigate(['/dashboard']);
    }).catch((error) => {
      console.error('Authentication error:', error);
      // Redirect to login if there's an error
      this.router.navigate(['/auth/login']);
    });
  }
}
