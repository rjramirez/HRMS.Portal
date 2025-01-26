import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Employee, EmployeeRole, roleDetail } from '../employee.model';
import { EmployeeService } from '../employee.service';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EmployeeRoleSearchComponent } from '../employee-role-search/employee-role-search.component';

@Component({
  selector: 'app-employee-modal',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, EmployeeRoleSearchComponent],
  templateUrl: './employee-modal.component.html',
  styleUrls: ['./employee-modal.component.scss']
})
export class EmployeeModalComponent implements OnInit, OnChanges {
  @Input() employee: Employee | null = null;
  @Input() supervisors!: Employee[];
  @Input() roles!: roleDetail[];
  @Output() save = new EventEmitter<Employee>();
  @Output() close = new EventEmitter<void>();

  employeeForm: FormGroup;

  availableRoles: roleDetail[] = [];
  
  // Define properties for ngModel
  selectedSupervisor: Employee | null = null; // For the selected supervisor
  selectedEmployeeRoles: roleDetail[] = []; // For the selected roles


  // Define the showSupervisorDropdown property
  showSupervisorDropdown: boolean = false; // Initialize as false

  constructor(
    private fb: FormBuilder
  ) {
    this.employeeForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      employeeNumber: [''],
      supervisor: [null],
      roles: [[]],
      roleSearch: ['']
    });
  }

  ngOnInit() {
    // Fetch roles from the service
    this.fetchEmployeeRoles();

    // Populate form with employee data if editing
    if (this.employee) {
      // Find the supervisor by EmployeeNumber
      const supervisor = this.supervisors?.find(s => s.EmployeeNumber.toString() === this.employee?.SupervisorId.toString());

      this.employeeForm.patchValue({
        firstName: this.employee.FirstName,
        lastName: this.employee.LastName,
        email: this.employee.EmployeeEmail,
        employeeNumber: this.employee.EmployeeNumber,
        supervisor: supervisor ? supervisor.EmployeeNumber : null,
        roles: this.employee.EmployeeRoles || []
      });

      // Set selected supervisor and roles
      this.selectedSupervisor = supervisor || null;
      this.selectedEmployeeRoles = this.employee.EmployeeRoles.map(employeeRole => ({
        roleId: employeeRole.roleDetail.roleId,
        roleName: employeeRole.roleDetail.roleName,
        roleDescription: employeeRole.roleDetail.roleDescription,
        active: employeeRole.roleDetail.active,
        createdDate: employeeRole.roleDetail.createdDate || new Date().toISOString()
      })) || [];

      // Ensure available roles are updated after setting selected roles
      this.fetchEmployeeRoles();
    } else {
      // Reset form for new employee
      this.employeeForm.reset();
      this.selectedSupervisor = null;
      this.selectedEmployeeRoles = [];
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['employee'] && this.employee) {
      // Find the supervisor by EmployeeNumber
      const supervisor = this.supervisors?.find(s => s.EmployeeNumber.toString() === this.employee?.SupervisorId.toString());

      // Populate form with existing employee data
      this.employeeForm.patchValue({
        firstName: this.employee.FirstName,
        lastName: this.employee.LastName,
        email: this.employee.EmployeeEmail,
        employeeNumber: this.employee.EmployeeNumber,
        supervisor: supervisor ? supervisor.EmployeeNumber : null,
        roles: this.employee.EmployeeRoles
      });

      // Set selected employee roles
      this.selectedEmployeeRoles = this.employee.EmployeeRoles.map(employeeRole => ({
        roleId: employeeRole.roleDetail.roleId,
        roleName: employeeRole.roleDetail.roleName,
        roleDescription: employeeRole.roleDetail.roleDescription,
        active: employeeRole.roleDetail.active,
        createdDate: employeeRole.roleDetail.createdDate || new Date().toISOString()
      })) || [];

      // Set selected supervisor
      this.selectedSupervisor = supervisor || null;

      // Ensure available roles are updated after setting selected roles
      this.fetchEmployeeRoles();
    }
  }

  fetchEmployeeRoles() {
    // Fetch available roles, filtering out already selected roles
    this.availableRoles = (this.roles || []).filter(
      role => !this.selectedEmployeeRoles.some(selectedRole => selectedRole.roleId === role.roleId)
    );
  }

  // Method to add a role to selected roles
  addEmployeeRole(role: roleDetail) {
    // Check if role is already selected
    if (!this.selectedEmployeeRoles.some(r => r.roleId === role.roleId)) {
      this.selectedEmployeeRoles.push({
        roleId: role.roleId,
        roleName: role.roleName,
        roleDescription: role.roleDescription,
        active: role.active ?? true,
        createdDate: role.createdDate || new Date().toISOString()
      });
    }
  }

  // Remove a role from selected roles
  removeEmployeeRole(role: roleDetail) {
    // Remove from selected roles
    this.selectedEmployeeRoles = this.selectedEmployeeRoles.filter(r => r.roleId !== role.roleId);
    
    // Restore the role to available roles if it's not already there
    if (!this.availableRoles.some(r => r.roleId === role.roleId)) {
      this.availableRoles.push(role);
    }
  }

  onSave() {
    if (this.employeeForm.valid) {
      const formValue = this.employeeForm.value;

      // Map selected roles to EmployeeRole format
      const employeeRoles: EmployeeRole[] = this.selectedEmployeeRoles.map(role => ({
        employeeRoleId: 0, 
        employeeId: 0, 
        roleDetail: {
          roleId: role.roleId,
          roleName: role.roleName,
          roleDescription: role.roleDescription,
          active: role.active ?? true,
          createdDate: role.createdDate || new Date().toISOString()
        },
        active: role.active ?? true,
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString(),
        updatedBy: 'user'
      }));

      // Construct employee object
      const employee: Employee = {
        EmployeeId: this.employee?.EmployeeId || 0,
        EmployeeNumber: formValue.employeeNumber,
        FirstName: formValue.firstName,
        LastName: formValue.lastName,
        EmployeeEmail: formValue.email,
        SupervisorId: formValue.supervisor ? formValue.supervisor : '',
        EmployeeRoles: employeeRoles,
        Active: true,
        CreatedDate: new Date(),
        CreatedBy: 'system',
        UpdatedDate: new Date(),
        UpdatedBy: 'system'
      };

      // Emit save event
      this.save.emit(employee);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.employeeForm.controls).forEach(field => {
        const control = this.employeeForm.get(field);
        control?.markAsTouched();
      });
    }
  }

  hasError(controlName: string, errorType: string): boolean {
    const control = this.employeeForm.get(controlName);
    return control ? (control.hasError(errorType) && (control.dirty || control.touched)) : false;
  }

  onClose() {
    this.close.emit();
  }

  onSupervisorFocus() {
    this.showSupervisorDropdown = true; // Show the dropdown when the input is focused
  }

  onSupervisorBlur() {
    setTimeout(() => {
        this.showSupervisorDropdown = false; // Hide the dropdown when the input loses focus
    }, 200); // Optional delay to allow for click events on dropdown items
  }
}