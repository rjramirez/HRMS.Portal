import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8 text-center">
        <!-- Logo -->
        <div class="mb-8">
          <h1 class="text-2xl font-bold text-indigo-600">HRMS</h1>
        </div>
        
        <!-- Error Content -->
        <div>
          <h2 class="text-9xl font-extrabold text-indigo-600 mb-4">{{ errorCode }}</h2>
          <h3 class="text-3xl font-bold text-gray-900 mb-2">
            {{ title }}
          </h3>
          <p class="text-lg text-gray-600 mb-8">
            {{ message }}
          </p>
        </div>

        <!-- Action Button -->
        <div>
          <button 
            (click)="navigateBack()"
            class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
            {{ authService.user() ? 'Back to Dashboard' : 'Back to Login' }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class ErrorComponent {
  @Input() errorCode: string = '404';
  @Input() title: string = 'Page Not Found';
  @Input() message: string = 'The page you are looking for might have been removed or is temporarily unavailable.';

  constructor(
    private router: Router,
    public authService: AuthService
  ) {}

  navigateBack() {
    const route = this.authService.user() ? '/dashboard' : '/auth/login';
    this.router.navigate([route]);
  }
}
