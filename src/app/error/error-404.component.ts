import { Component } from '@angular/core';
import { ErrorComponent } from './error.component';

@Component({
  selector: 'app-error-404',
  standalone: true,
  imports: [ErrorComponent],
  template: `
    <app-error
      errorCode="404"
      title="Page Not Found"
      message="The page you are looking for might have been removed or is temporarily unavailable."
    ></app-error>
  `
})
export class Error404Component {}
