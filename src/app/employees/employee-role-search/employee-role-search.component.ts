import { Component, OnInit, Input, Output, EventEmitter, CUSTOM_ELEMENTS_SCHEMA, OnChanges, SimpleChanges } from '@angular/core';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Observable, of, BehaviorSubject, combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { roleDetail } from '../employee.model';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { MatCommonModule } from '@angular/material/core';

// Extended interface to include checked status
interface SearchableRole extends roleDetail {
  isChecked: boolean;
}

@Component({
  selector: 'app-employee-role-search',
  templateUrl: './employee-role-search.component.html',
  styleUrls: ['./employee-role-search.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule, 
    FormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    MatCommonModule,
    CommonModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class EmployeeRoleSearchComponent implements OnInit, OnChanges {
  @Input() roles: roleDetail[] = [];
  @Input() selectedRoles: roleDetail[] = [];
  @Output() roleSelected = new EventEmitter<roleDetail>();

  roleSearchControl = new FormControl('');
  private rolesSubject = new BehaviorSubject<SearchableRole[]>([]);
  filteredRoles: Observable<SearchableRole[]> = of([]);

  ngOnInit() {
    this.initRoleFiltering();
  }

  ngOnChanges(changes: SimpleChanges) {
    // Reinitialize filtering when roles or selected roles change
    if (changes['roles'] || changes['selectedRoles']) {
      this.prepareSearchableRoles();
    }
  }

  private prepareSearchableRoles() {
    // Combine all unique roles from both input sources
    const allRoleIds = new Set([
      ...this.roles.map(r => r.roleId),
      ...this.selectedRoles.map(r => r.roleId)
    ]);

    const combinedRoles: SearchableRole[] = Array.from(allRoleIds).map(roleId => {
      // Find role from input roles or selected roles
      const role = this.roles.find(r => r.roleId === roleId) || 
                   this.selectedRoles.find(r => r.roleId === roleId);
      
      return {
        ...role!,
        isChecked: this.selectedRoles.some(selectedRole => selectedRole.roleId === roleId)
      };
    });

    this.rolesSubject.next(combinedRoles);
  }

  private initRoleFiltering() {
    this.filteredRoles = combineLatest([
      this.rolesSubject.asObservable(),
      this.roleSearchControl.valueChanges.pipe(startWith(''))
    ]).pipe(
      map(([roles, searchValue]) => this._filterRoles(roles, searchValue || ''))
    );
  }

  private _filterRoles(roles: SearchableRole[], value: string): SearchableRole[] {
    const filterValue = value.toLowerCase();
    
    return roles.filter(role => 
      role.roleName.toLowerCase().includes(filterValue) || 
      role.roleDescription.toLowerCase().includes(filterValue)
    );
  }

  onRoleSelected(role: SearchableRole) {
    // If role is already checked, uncheck it
    if (role.isChecked) {
      role.isChecked = false;
      this.roleSelected.emit(role);
    } else {
      // Check the role
      role.isChecked = true;
      this.roleSelected.emit(role);
    }

    // Update the roles subject to reflect the changes
    const currentRoles = this.rolesSubject.value;
    const updatedRoles = currentRoles.map(r => 
      r.roleId === role.roleId ? { ...r, isChecked: role.isChecked } : r
    );
    this.rolesSubject.next(updatedRoles);

    // Clear the search input
    this.roleSearchControl.setValue('');
  }

  displayRoleName(role?: SearchableRole): string {
    return role ? `${role.roleName} (${role.roleDescription})` : '';
  }
}
