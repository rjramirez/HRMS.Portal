import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="bg-white rounded-lg shadow-lg p-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
        
        <!-- Dashboard content will go here -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Example card -->
          <div class="bg-white border rounded-lg p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-2">Welcome!</h2>
            <p class="text-gray-600">This is your HRMS dashboard. More features coming soon.</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent {}
