import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private snackBar: MatSnackBar) {}

  success(message: string, duration: number = 3000) {
    this.snackBar.open(message, 'Close', {
      duration,
      verticalPosition: 'top',
      horizontalPosition: 'center',
      panelClass: ['success-snackbar']
    });
  }

  error(message: string, duration: number = 3000) {
    this.snackBar.open(message, 'Close', {
      duration,
      verticalPosition: 'top',
      horizontalPosition: 'center',
      panelClass: ['error-snackbar']
    });
  }

  warning(message: string, duration: number = 3000) {
    this.snackBar.open(message, 'Close', {
      duration,
      verticalPosition: 'top',
      horizontalPosition: 'center',
      panelClass: ['warning-snackbar']
    });
  }

  info(message: string, duration: number = 3000) {
    this.snackBar.open(message, 'Close', {
      duration,
      verticalPosition: 'top',
      horizontalPosition: 'center',
      panelClass: ['info-snackbar']
    });
  }
}