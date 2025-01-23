import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from './employee.service';
import { Employee } from './employee.model';
import { EmployeeModalComponent } from './employee-modal/employee-modal.component';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule, EmployeeModalComponent],
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss']
})
export class EmployeesComponent implements OnInit {
  employees: Employee[] = [];
  selectedEmployee: Employee | null = null; // For editing
  isModalOpen = false; // For modal visibility

  constructor(private employeeService: EmployeeService) {}

  ngOnInit() {
    this.loadEmployees();
  }

  loadEmployees() {
    this.employeeService.getEmployees().subscribe(
      (response: any) => {
        const employeeData = response.data || response;
        this.employees = employeeData.map((emp: any) => ({
          EmployeeId: emp.employeeId,
          EmployeeNumber: emp.employeeNumber,
          EmployeeEmail: emp.employeeEmail,
          FirstName: emp.firstName,
          LastName: emp.lastName,
          Active: emp.active || true,
          CreatedDate: emp.createdDate,
          CreatedBy: emp.createdBy,
          UpdatedDate: emp.updatedDate,
          UpdatedBy: emp.updatedBy,
        }));
      },
      error => {
        console.error('Error fetching employees:', error);
      }
    );
  }

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
    }; // Initialize new employee
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedEmployee = null;
  }

  saveEmployee(employee: Employee) {
    if (employee.EmployeeId) {
      // Update existing employee
      this.employeeService.updateEmployee(employee).subscribe(() => {
        this.loadEmployees();
        this.closeModal();
      });
    } else {
      // Add new employee
      this.employeeService.addEmployee(employee).subscribe(() => {
        this.loadEmployees();
        this.closeModal();
      });
    }
  }

  editEmployee(employee: Employee) {
    this.openModal(employee);
  }

  deleteEmployee(id: number) {
    if (confirm('Are you sure you want to delete this employee?')) {
      this.employeeService.deleteEmployee(id).subscribe(() => {
        this.loadEmployees();
      });
    }
  }
}
