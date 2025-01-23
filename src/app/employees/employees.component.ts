import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from './employee.service';
import { Employee } from './employee.model';
import { EmployeeModalComponent } from './employee-modal/employee-modal.component';
import { ToastrService } from 'ngx-toastr';
import { LoadingService } from '../core/services/loading.service';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule, EmployeeModalComponent],
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss']
})
export class EmployeesComponent implements OnInit {
  employees: Employee[] = [];
  supervisors: Employee[] = [];
  selectedEmployee: Employee | null = null;
  isModalOpen = false;

  constructor(
    private employeeService: EmployeeService, 
    private toastr: ToastrService,
    private loadingService: LoadingService
  ) {}

  ngOnInit() {
    this.loadEmployees();
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
          SupervisorId: emp.supervisorId,
          CreatedDate: emp.createdDate,
          CreatedBy: emp.createdBy,
          UpdatedDate: emp.updatedDate,
          UpdatedBy: emp.updatedBy,
        }));

        this.supervisors = this.employees;
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
    this.selectedEmployee = employee ? { ...employee } : { 
      EmployeeId: 0, 
      EmployeeNumber: 0, 
      EmployeeEmail: '', 
      FirstName: '', 
      LastName: '', 
      Active: true,
      SupervisorId: 0, 
      CreatedDate: new Date(), 
      CreatedBy: '', 
      UpdatedDate: new Date(), 
      UpdatedBy: '' 
    };
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
      this.employeeService.updateEmployee(employee).subscribe(
        (response) => {
          this.loadingService.hide();
          this.closeModal();
          this.toastr.success('Employee updated successfully');
          this.loadEmployees();
        }, 
        error => {
          this.loadingService.hide();
          this.toastr.error('Error updating employee');
          console.error('Error updating employee:', error);
        }
      );
    } else {
      // Add new employee
      this.employeeService.addEmployee(employee).subscribe(
        (response) => {
          this.loadingService.hide();
          this.closeModal();
          this.toastr.success('Employee added successfully');
          this.loadEmployees();
        }, 
        error => {
          this.loadingService.hide();
          this.toastr.error('Error adding employee');
          console.error('Error adding employee:', error);
        }
      );
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
}