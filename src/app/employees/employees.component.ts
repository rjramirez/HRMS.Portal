import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeeService } from './employee.service';
import { Employee, RoleDetail } from './employee.model';
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
  // Original full list of employees
  allEmployees: Employee[] = [];
  
  // Filtered and paginated employees to display
  employees: Employee[] = [];
  
  // Pagination properties
  currentPage = 1;
  itemsPerPage = 10;
  pageSizes = [10, 20, 50, 100];
  
  // Search property
  searchTerm = '';

  // Other existing properties
  supervisors: Employee[] = [];
  roles: RoleDetail[] = [];
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

  loadEmployees() {
    this.loadingService.show();
    this.employeeService.getEmployees().subscribe({
      next: (response) => {
        this.allEmployees = response.map((emp: any) => ({
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
        this.applySearchAndPagination();
        this.supervisors = this.allEmployees;
        this.employeeService.getRoles().subscribe((response) => {
          this.roles = response.map((role: any) => ({
            roleId: role.roleId,
            roleName: role.roleName,
            roleDescription: role.roleDescription,
            active: role.active
          }));
        });
        console.log('All employees:', this.allEmployees);
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.toastr.error('Failed to load employees');
        this.loadingService.hide();
      }
    });
  }

  // Search and filter method
  applySearchAndPagination() {
    // Filter employees based on search term
    let filteredEmployees = this.allEmployees.filter(emp => 
      emp.FirstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      emp.LastName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      emp.EmployeeEmail.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      emp.EmployeeNumber.toString().includes(this.searchTerm)
    );

    // Calculate total pages
    const totalPages = Math.ceil(filteredEmployees.length / this.itemsPerPage);

    // Ensure current page is within bounds
    this.currentPage = Math.min(this.currentPage, totalPages);

    // Slice employees for current page
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.employees = filteredEmployees.slice(startIndex, startIndex + this.itemsPerPage);
  }

  // Pagination methods
  changePageSize(size: number) {
    this.itemsPerPage = size;
    this.currentPage = 1;
    this.applySearchAndPagination();
  }

  nextPage() {
    const totalPages = Math.ceil(this.allEmployees.length / this.itemsPerPage);
    if (this.currentPage < totalPages) {
      this.currentPage++;
      this.applySearchAndPagination();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applySearchAndPagination();
    }
  }

  // Search method
  onSearch() {
    this.currentPage = 1;
    this.applySearchAndPagination();
  }

  // Existing methods remain the same
  openModal(employee?: Employee) {
    if (employee) {
      // Edit operation: create a deep copy of the existing employee to avoid direct mutation
      this.selectedEmployee = JSON.parse(JSON.stringify(employee));
      console.log("Editing existing employee: ", this.selectedEmployee);
    } else {
      // Add operation: create a new empty employee object
      this.selectedEmployee = {
        EmployeeId: 0,
        EmployeeNumber: null!, // Use null or undefined to indicate a new employee
        FirstName: '',
        LastName: '',
        EmployeeEmail: '',
        SupervisorId: 0,
        EmployeeRoles: [],
        Active: true,
        CreatedBy: '',
        CreatedDate: new Date(),
        UpdatedBy: '',
        UpdatedDate: new Date()
      };
      console.log("Adding new employee: ", this.selectedEmployee);
    }
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedEmployee = null;
  }

  saveEmployee(employee: Employee) {
    this.loadingService.show();

    // Explicitly check if this is an edit or add operation
    const isEditOperation = !!employee.EmployeeId && employee.EmployeeNumber !== null;

    if (isEditOperation) {
      // Update existing employee
      this.employeeService.updateEmployee(employee).subscribe({
        next: (updatedEmployee) => {
          // Ensure loading is hidden and toast is shown before any potential navigation
          this.loadingService.hide();
          this.toastr.success('Employee updated successfully');

          // Update the employee in the list
          const index = this.allEmployees.findIndex(e => e.EmployeeId === updatedEmployee.EmployeeId);
          if (index !== -1) {
            this.allEmployees[index] = updatedEmployee;
          }
          this.applySearchAndPagination();
          this.closeModal();
        },
        error: (error) => {
          this.loadingService.hide();
          this.toastr.error('Error updating employee');
          console.error('Update employee error:', error);
        }
      });
    } else {
      // Create new employee
      this.employeeService.addEmployee(employee).subscribe({
        next: (newEmployee) => {
          // Ensure loading is hidden and toast is shown before any potential navigation
          this.loadingService.hide();
          this.toastr.success('Employee created successfully');

          this.allEmployees.push(newEmployee);
          this.applySearchAndPagination();
          this.closeModal();
        },
        error: (error) => {
          this.loadingService.hide();
          this.toastr.error('Error creating employee');
          console.error('Create employee error:', error);
        }
      });
    }
  }

  editEmployee(employee: Employee) {
    this.openModal(employee);
  }

  deleteEmployee(employeeNumber: number) {
    if (confirm('Are you sure you want to delete this employee?')) {
      this.employeeService.deleteEmployee(employeeNumber).subscribe(() => {
        this.allEmployees = this.allEmployees.filter(emp => emp.EmployeeNumber !== employeeNumber);
        this.applySearchAndPagination();
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

  // Add this getter method
  get Math() {
    return Math;
  }
}