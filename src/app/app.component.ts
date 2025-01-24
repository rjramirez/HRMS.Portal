import { Component, signal, HostListener, ElementRef, ViewChild } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { LoadingSpinnerComponent } from './shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule, LoadingSpinnerComponent],
  template: `
    <app-loading-spinner></app-loading-spinner>
    <ng-container *ngIf="!isErrorPage(); else fullPageContent">
      <div class="min-h-screen bg-gray-50">
        <!-- Sidebar -->
        <aside 
          #sidebar
          *ngIf="authService.user()"
          [class]="isSidebarOpen() ? 'translate-x-0' : '-translate-x-64'"
          class="fixed top-0 left-0 z-40 w-64 h-screen transition-transform bg-white border-r border-gray-200"
          (mouseenter)="onSidebarHover(true)"
          (mouseleave)="onSidebarHover(false)"
          (focusin)="onSidebarHover(true)"
          (focusout)="onSidebarHover(false)"
        >
          <!-- Sidebar Header -->
          <div class="flex items-center justify-between p-4 border-b">
            <span class="text-2xl font-bold text-indigo-600">HRMS</span>
            <button 
              (click)="toggleSidebar()"
              class="p-2 rounded-lg lg:hidden hover:bg-gray-100"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <!-- Sidebar Menu -->
          <nav class="p-4 space-y-2">
            <a 
              routerLink="/dashboard" 
              class="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group"
            >
              <svg class="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 5v14h16V5H4zm1 1h14v12H5V6zm2 2h10v2H7V8zm0 4h10v2H7v-2z"/>
              </svg>
              <span class="ml-3">Dashboard</span>
            </a>
            <a 
              routerLink="/employees" 
              class="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group"
            >
              <svg class="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0-8a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z"/>
                <path d="M12 14c-5.34 0-10.76 2.46-10.99 7.14A1 1 0 0 0 2 22h20a1 1 0 0 0 .99-.86C22.76 16.46 17.34 14 12 14Z"/>
              </svg>
              <span class="ml-3">Employees</span>
            </a>
          </nav>
        </aside>

        <!-- Main Content -->
        <div [class]="isSidebarOpen() ? 'lg:ml-64' : ''" class="transition-margin duration-300">
          <!-- Top Navigation -->
          <nav class="bg-white border-b border-gray-200">
            <div class="px-4 py-2.5 lg:px-6">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <button 
                    (click)="toggleSidebar()"
                    class="p-2 rounded-lg hover:bg-gray-100"
                  >
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path>
                    </svg>
                  </button>
                </div>

                <!-- User Profile Dropdown -->
                <div class="relative" *ngIf="authService.user()">
                  <button 
                    (click)="showDropdown = !showDropdown"
                    class="flex items-center text-sm rounded-full focus:ring-4 focus:ring-gray-100"
                  >
                    <img 
                      class="w-8 h-8 rounded-full"
                      [src]="authService.user()?.user_metadata?.['avatar_url'] || 'https://ui-avatars.com/api/?name=' + (authService.user()?.email || 'User')"
                      alt="user photo"
                    />
                    <span class="ml-2 text-gray-700">{{ authService.user()?.email }}</span>
                    <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </button>

                  <!-- Dropdown menu -->
                  <div *ngIf="showDropdown" 
                    class="absolute right-0 z-50 w-56 mt-2 bg-white rounded-lg shadow-lg"
                    (clickOutside)="showDropdown = false"
                  >
                    <div class="p-4 border-b">
                      <span class="block text-sm text-gray-900">{{ authService.user()?.user_metadata?.['full_name'] || 'User' }}</span>
                      <span class="block text-sm text-gray-500 truncate">{{ authService.user()?.email }}</span>
                    </div>
                    <ul class="py-2">
                      <li>
                        <button 
                          (click)="signOut()" 
                          class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          Sign out
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          <!-- Page Content -->
          <main class="p-4 lg:p-6">
            <router-outlet></router-outlet>
          </main>
        </div>
      </div>
    </ng-container>
    <ng-template #fullPageContent>
      <router-outlet></router-outlet>
    </ng-template>
  `
})
export class AppComponent {
  showDropdown = false;
  isSidebarOpen = signal(false);
  isLargeScreen = signal(window.innerWidth >= 1024); // 1024px is the lg breakpoint in Tailwind
  @ViewChild('sidebar') sidebar!: ElementRef;

  constructor(
    public authService: AuthService
  ) {
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  checkScreenSize() {
    this.isLargeScreen.set(window.innerWidth >= 1024);
    if (this.isLargeScreen()) {
      this.isSidebarOpen.set(true);
    } else {
      this.isSidebarOpen.set(false);
    }
  }

  toggleSidebar() {
    this.isSidebarOpen.update(value => !value);
  }

  onSidebarHover(isHovered: boolean) {
    if (!this.isLargeScreen()) {
      this.isSidebarOpen.set(isHovered);
    }
  }

  signOut() {
    this.authService.signOut();
  }

  isErrorPage(): boolean {
    const path = window.location.pathname;
    return path === '/403' || path === '/404' || path.startsWith('/auth/');
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.showDropdown = false;
    }
  }
}
