import { Component } from '@angular/core';
import { ErrorComponent } from './error.component';

@Component({
  selector: 'app-error-403',
  standalone: true,
  imports: [ErrorComponent],
  template: `
    <app-error
      errorCode="403"
      title="Access Denied"
      message="You don't have permission to access this page. Please log in or contact your administrator."
    ></app-error>
  `
})
export class Error403Component {}
