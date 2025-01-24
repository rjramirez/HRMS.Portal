import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeeService } from './employee.service';
import { Employee, EmployeeRole } from './employee.model';
import { EmployeeModalComponent } from './employee-modal/employee-modal.component';
import { ToastrService } from 'ngx-toastr';
import { LoadingService } from '../core/services/loading.service';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, EmployeeModalComponent],
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss']
})
export class EmployeesComponent implements OnInit {
  employees: Employee[] = [];
  supervisors: Employee[] = [];
  employeeRoles: EmployeeRole[] = [];
  selectedEmployee: Employee | null = null;
  isModalOpen = false;
  employeeForm!: FormGroup;

  constructor(
    private employeeService: EmployeeService, 
    private toastr: ToastrService,
    private loadingService: LoadingService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.loadEmployees();
    this.employeeForm = this.formBuilder.group({
      employeeId: [null],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      department: ['', Validators.required],
      position: ['', Validators.required],
      joinDate: ['', Validators.required]
    });
  }

  // Load all employees and supervisors
  loadEmployees() {
    this.loadingService.show();
    this.employeeService.getEmployees().subscribe({
      next: (response) => {
        this.employees = response.map((emp: any) => ({
          EmployeeId: emp.employeeId,
          EmployeeNumber: emp.employeeNumber,
          EmployeeEmail: emp.employeeEmail,
          FirstName: emp.firstName,
          LastName: emp.lastName,
          Active: emp.active,
          EmployeeRoles: emp.employeeRoles,
          SupervisorId: emp.supervisorId,
          CreatedDate: emp.createdDate,
          CreatedBy: emp.createdBy,
          UpdatedDate: emp.updatedDate,
          UpdatedBy: emp.updatedBy,
        }));
        this.supervisors = this.employees;
        this.employeeService.getEmployeeRoles().subscribe((response) => {
          this.employeeRoles = response.map((role: any) => {
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
        });
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.toastr.error('Failed to load employees');
        this.loadingService.hide();
      }
    });
  }

  // Open modal for creating or editing employee
  openModal(employee?: Employee) {
    this.selectedEmployee = employee || null;
    this.isModalOpen = true;
  }

  // Close the employee modal
  closeModal() {
    this.isModalOpen = false;
    this.selectedEmployee = null;
  }

  // Save or update employee
  saveEmployee(employee: Employee) {
    this.loadingService.show();

    if (employee.EmployeeId) {
      // Update existing employee
      this.employeeService.updateEmployee(employee).subscribe({
        next: (updatedEmployee) => {
          // Update the employee in the list
          const index = this.employees.findIndex(e => e.EmployeeId === updatedEmployee.EmployeeId);
          if (index !== -1) {
            this.employees[index] = updatedEmployee;
          }
          
          this.toastr.success('Employee updated successfully');
          this.closeModal();
          this.loadingService.hide();
        },
        error: (error) => {
          this.toastr.error('Error updating employee');
          this.loadingService.hide();
          console.error('Update employee error:', error);
        }
      });
    } else {
      // Create new employee
      this.employeeService.addEmployee(employee).subscribe({
        next: (newEmployee) => {
          this.employees.push(newEmployee);
          this.toastr.success('Employee created successfully');
          this.closeModal();
          this.loadingService.hide();
        },
        error: (error) => {
          this.toastr.error('Error creating employee');
          this.loadingService.hide();
          console.error('Create employee error:', error);
        }
      });
    }
  }

  // Edit an existing employee
  editEmployee(employee: Employee) {
    this.openModal(employee);
  }

  // Delete an employee
  deleteEmployee(employeeNumber: number) {
    if (confirm('Are you sure you want to delete this employee?')) {
      this.employeeService.deleteEmployee(employeeNumber).subscribe(() => {
        this.loadEmployees();
        this.toastr.success('Employee deleted successfully');
      }, error => {
        this.toastr.error('Error deleting employee');
      });
    }
  }

  // Validation check method
  get formControls() {
    return this.employeeForm.controls;
  }
}