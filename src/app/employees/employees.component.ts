import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeeService } from './employee.service';
import { Employee, roleDetail } from './employee.model';
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
  roles: roleDetail[] = [];
  selectedEmployee: Employee | null = null;
  isModalOpen: boolean = false;
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
          Supervisor: emp.supervisor ? {
            EmployeeId: emp.supervisor.employeeId || 0,
            EmployeeNumber: emp.supervisor.employeeNumber || 0,
            EmployeeEmail: emp.supervisor.employeeEmail || '',
            FirstName: emp.supervisor.firstName || '',
            LastName: emp.supervisor.lastName || '',
            SupervisorId: emp.supervisor.supervisorId || 0,
            EmployeeRoles: emp.supervisor.employeeRoles?.map((role: any) => ({
              roleId: role.roleId || 0,
              roleName: role.roleName || '',
              roleDescription: role.roleDescription || '',
              active: role.active || false
            })) || [],
            Active: emp.supervisor.active || false,
            CreatedDate: emp.supervisor.createdDate || new Date(),
            CreatedBy: emp.supervisor.createdBy || '',
            UpdatedDate: emp.supervisor.updatedDate || new Date(),
            UpdatedBy: emp.supervisor.updatedBy || ''
          } : {
            EmployeeId: 0,
            EmployeeEmail: '',
            FirstName: '',
            LastName: '',
            SupervisorId: emp.supervisorId || 0,
            EmployeeRoles: [],
            Active: false,
            CreatedDate: new Date(),
            CreatedBy: '',
            UpdatedDate: new Date(),
            UpdatedBy: ''
          }
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
  openModal(employee: Employee | null = null) {
    
    // Ensure roles and supervisors are populated
    if (!this.roles || this.roles.length === 0) {
      this.fetchRoles();
    }
    if (!this.supervisors || this.supervisors.length === 0) {
      this.fetchSupervisors();
    }

    this.selectedEmployee = employee;
    this.isModalOpen = true;
    
    // Reset the form when opening the modal
    if (employee) {
      // Populate form for edit
      this.employeeForm = this.formBuilder.group({
        firstName: [employee.FirstName, [Validators.required, Validators.minLength(2)]],
        lastName: [employee.LastName, [Validators.required, Validators.minLength(2)]],
        email: [employee.EmployeeEmail, [Validators.required, Validators.email]],
        employeeNumber: [employee.EmployeeNumber],
        supervisorId: [employee.SupervisorId],
        roles: [employee.EmployeeRoles || []]
      });
    } else {
      // Reset form for new employee
      this.employeeForm = this.formBuilder.group({
        firstName: ['', [Validators.required, Validators.minLength(2)]],
        lastName: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        employeeNumber: [''],
        supervisorId: [''],
        roles: [[]]
      });
    }
  }

  // Add methods to fetch roles and supervisors if not already populated
  fetchRoles() {
    this.employeeService.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
      },
      error: (err) => {
        console.error('Error fetching roles:', err);
      }
    });
  }

  fetchSupervisors() {
    this.employeeService.getEmployees().subscribe({
      next: (supervisors) => {
        this.supervisors = supervisors;
        console.log('Supervisors fetched:', this.supervisors);
      },
      error: (err) => {
        console.error('Error fetching supervisors:', err);
      }
    });
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedEmployee = null;
    this.employeeForm.reset(); // Reset form when closing
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