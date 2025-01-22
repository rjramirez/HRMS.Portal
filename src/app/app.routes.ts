import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'employees',
    loadComponent: () => import('./employees/employees.component').then(m => m.EmployeesComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'auth/signup',
    loadComponent: () => import('./auth/signup/signup.component').then(m => m.SignupComponent)
  },
  {
    path: 'auth/callback',
    loadComponent: () => import('./auth/callback/callback.component').then(m => m.CallbackComponent)
  },
  {
    path: '403',
    loadComponent: () => import('./error/error-403.component').then(m => m.Error403Component)
  },
  {
    path: '404',
    loadComponent: () => import('./error/error-404.component').then(m => m.Error404Component)
  },
  {
    path: '**',
    redirectTo: '404'
  }
];
