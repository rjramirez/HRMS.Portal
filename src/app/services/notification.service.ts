import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private toastr: ToastrService) {}

  success(message: string, title: string = 'Success', options: any = {}) {
    const defaultOptions = { 
      positionClass: 'toast-top-right',
      timeOut: 3000 
    };
    this.toastr.success(message, title, { ...defaultOptions, ...options });
  }

  error(message: string, title: string = 'Error', options: any = {}) {
    const defaultOptions = { 
      positionClass: 'toast-top-right',
      timeOut: 3000 
    };
    this.toastr.error(message, title, { ...defaultOptions, ...options });
  }

  warning(message: string, title: string = 'Warning', options: any = {}) {
    const defaultOptions = { 
      positionClass: 'toast-top-right',
      timeOut: 3000 
    };
    this.toastr.warning(message, title, { ...defaultOptions, ...options });
  }

  info(message: string, title: string = 'Information', options: any = {}) {
    const defaultOptions = { 
      positionClass: 'toast-top-right',
      timeOut: 3000 
    };
    this.toastr.info(message, title, { ...defaultOptions, ...options });
  }
}