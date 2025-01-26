import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { EmployeeModalComponent } from './employee-modal/employee-modal.component';
import { EmployeeRoleSearchComponent } from './employee-role-search/employee-role-search.component';

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    EmployeeModalComponent,
    EmployeeRoleSearchComponent
  ],
  exports: [
    EmployeeModalComponent,
    EmployeeRoleSearchComponent
  ]
})
export class EmployeesModule { }
