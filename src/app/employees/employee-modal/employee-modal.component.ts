import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { Employee, EmployeeRole, RoleDetail } from '../employee.model';
import { EmployeeService } from '../employee.service';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-employee-modal',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './employee-modal.component.html',
  styleUrls: ['./employee-modal.component.scss']
})
export class EmployeeModalComponent implements OnInit {
  @Input() employee: Employee | null = null;
  @Input() supervisors!: Employee[];
  @Input() employeeRoles!: EmployeeRole[];
  @Output() save = new EventEmitter<Employee>();
  @Output() close = new EventEmitter<void>();

  employeeForm: FormGroup;

  filteredRoles: RoleDetail[] = [];
  roleSearchControl = new FormControl('');
  availableRoles: RoleDetail[] = [];
  supervisorSearchControl = new FormControl('');
  filteredSupervisors: Employee[] = [];
  showRoleDropdown = false;
  showSupervisorDropdown = false;

  constructor(
    private employeeService: EmployeeService,
    private fb: FormBuilder
  ) {
    this.employeeForm = this.fb.group({
      firstName: ['', [
        Validators.required, 
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      lastName: ['', [
        Validators.required, 
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      email: ['', [
        Validators.required, 
        Validators.email
      ]],
      employeeNumber: [''],
      supervisor: [''],
      roles: [[]],
      roleSearchControl: this.roleSearchControl,
      supervisorSearchControl: this.supervisorSearchControl
    });
  }

  ngOnInit() {
    // Fetch employee roles if not provided
    if (!this.employeeRoles || this.employeeRoles.length === 0) {
      this.fetchEmployeeRoles();
    } else {
      this.availableRoles = this.employeeRoles.flatMap(role => role.roleDetail);
      this.filteredRoles = this.availableRoles;
    }

    // Populate form if editing existing employee
    if (this.employee) {
      this.employeeForm.patchValue({
        firstName: this.employee.FirstName,
        lastName: this.employee.LastName,
        email: this.employee.EmployeeEmail,
        employeeNumber: this.employee.EmployeeNumber,
        roles: this.employee.EmployeeRoles
      });

      // Set the supervisor search based on the employee's SupervisorId
      if (this.employee.SupervisorId) {
        const supervisor = this.supervisors.find(s => s.EmployeeNumber === this.employee!.SupervisorId);
        if (supervisor) {
          this.supervisorSearchControl.setValue(`${supervisor.FirstName} ${supervisor.LastName}`);
          this.employeeForm.get('supervisor')?.setValue(supervisor);
        }
      }
    }
  }

  // Getter for easy access to form controls
  get formControls() {
    return this.employeeForm.controls;
  }

  // Fetch employee roles from service
  fetchEmployeeRoles() {
    this.employeeService.getEmployeeRoles().subscribe({
      next: (roles) => {
        // Map roles to roleDetail, handling different possible data structures
        this.employeeRoles = roles.map((role: any) => {
          const roleDetails = Array.isArray(role.roleDetail) 
            ? role.roleDetail.filter((r: any) => r.active).map((r: any) => ({
                roleId: r.roleId,
                roleName: r.roleName,
                roleDescription: r.roleDescription,
                active: r.active,
                createdDate: r.createdDate,
                createdBy: r.createdBy,
                updatedDate: r.updatedDate,
                updatedBy: r.updatedBy
              }))
            : role.roleDetail ? [role.roleDetail] : [];

          return {
            employeeRoleId: role.employeeRoleId,
            employeeId: role.employeeId,
            roleDetail: roleDetails,
            createdDate: role.createdDate,
            createdBy: role.createdBy,
          };
        });

        // Set available roles and filtered roles
        this.availableRoles = this.employeeRoles.flatMap(role => role.roleDetail);
        this.filteredRoles = this.availableRoles;
      },
      error: (error) => {
        console.error('Error fetching employee roles:', error);
      }
    });
  }

  filterRoles() {
    const searchTerm = this.roleSearchControl.value?.toLowerCase();
    this.filteredRoles = this.availableRoles.filter(role => 
      role.roleName.toLowerCase().includes(searchTerm ?? '')
    );
    this.showRoleDropdown = this.filteredRoles.length > 0;
  }

  selectRole(role: RoleDetail) {
    const currentRoles = this.employeeForm.get('roles')?.value || [];
    
    // Check if role already exists to prevent duplicates
    const roleExists = currentRoles.some((r: RoleDetail) => r.roleId === role.roleId);
    
    if (!roleExists) {
      const updatedRoles = [...currentRoles, role];
      this.employeeForm.get('roles')?.setValue(updatedRoles);
    }
    
    this.roleSearchControl.setValue(''); 
    this.filteredRoles = [...this.availableRoles];
    this.showRoleDropdown = false; 
  }

  removeRole(roleToRemove: RoleDetail) {
    const currentRoles = this.employeeForm.get('roles')?.value || [];
    const updatedRoles = currentRoles.filter((role: RoleDetail) => role.roleId !== roleToRemove.roleId);
    this.employeeForm.get('roles')?.setValue(updatedRoles);
  }

  filterSupervisors() {
    const searchTerm = this.supervisorSearchControl.value?.toLowerCase();
    this.filteredSupervisors = this.supervisors.filter(supervisor => 
      supervisor.FirstName.toLowerCase().includes(searchTerm ?? '') || 
      supervisor.LastName.toLowerCase().includes(searchTerm ?? '') || 
      supervisor.EmployeeNumber.toString().includes(searchTerm ?? '')
    );
    this.showSupervisorDropdown = this.filteredSupervisors.length > 0;
  }

  selectSupervisor(supervisor: Employee) {
    if (!this.employee) {
      this.employee = {} as Employee;
    }
    console.log("Selected supervisor: ",supervisor);
    this.employee.SupervisorId = supervisor.EmployeeNumber;
    this.supervisorSearchControl.setValue(`${supervisor.FirstName} ${supervisor.LastName}`);
    this.employeeForm.get('supervisor')?.setValue(supervisor);
    this.filteredSupervisors = this.supervisors;
    this.showSupervisorDropdown = false;
  }

  onRoleBlur() {
    setTimeout(() => {
      this.showRoleDropdown = false;
    }, 200);
  }

  onRoleFocus() {
    this.showRoleDropdown = true;
    this.filterRoles();
  }

  onSupervisorBlur() {
    setTimeout(() => {
      this.showSupervisorDropdown = false;
    }, 200);
  }

  onSupervisorFocus() {
    this.showSupervisorDropdown = true;
    this.filterSupervisors();
  }

  onSave() {
    if (this.employeeForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.employeeForm.controls).forEach(field => {
        const control = this.employeeForm.get(field);
        control?.markAsTouched({ onlySelf: true });
      });
      return;
    }

    // Prepare employee data from form
    const employeeData: Employee = {
      EmployeeId: this.employee?.EmployeeId || 0,
      EmployeeNumber: 0,
      FirstName: this.formControls['firstName'].value,
      LastName: this.formControls['lastName'].value,
      EmployeeEmail: this.formControls['email'].value,
      SupervisorId: this.formControls['supervisor'].value?.EmployeeNumber || 0,
      EmployeeRoles: this.formControls['roles'].value || [],
      Active: true,
      CreatedBy: 'user',
      CreatedDate: new Date(),
      UpdatedBy: 'user',
      UpdatedDate: new Date()
    };

    // Emit save event with employee data
    this.save.emit(employeeData);
  }

  hasError(controlName: string, errorType: string): boolean {
    const control = this.employeeForm.get(controlName);
    return control ? (control.hasError(errorType) && control.touched) : false;
  }

  onClose() {
    this.close.emit();
  }
}
