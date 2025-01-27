import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeeService } from './employee.service';
import { Employee, roleDetail } from './employee.model';
import { EmployeeModalComponent } from './employee-modal/employee-modal.component';
import { NotificationService } from '../services/notification.service';
import { LoadingService } from '../core/services/loading.service';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    EmployeeModalComponent
  ],
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss']
})
export class EmployeesComponent implements OnInit {
  allEmployees: Employee[] = [];
  employees: Employee[] = [];
  currentPage = 1;
  itemsPerPage = 10;
  pageSizes = [10, 20, 50, 100];
  searchTerm = '';
  supervisors: Employee[] = [];
  roles: roleDetail[] = [];
  selectedEmployee: Employee | null = null;
  isModalOpen: boolean = false;
  employeeForm!: FormGroup;

  constructor(
    private employeeService: EmployeeService, 
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private loadingService: LoadingService
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
    this.supervisors = [];
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
        this.notificationService.error('Failed to load employees');
        this.loadingService.hide();
      }
    });
  }

  applySearchAndPagination() {
    let filteredEmployees = this.allEmployees.filter(emp => 
      this.matchesSearchTerm(emp)
    );

    const totalPages = Math.ceil(filteredEmployees.length / this.itemsPerPage);
    this.currentPage = Math.min(this.currentPage, totalPages);

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.employees = filteredEmployees.slice(startIndex, startIndex + this.itemsPerPage);
  }

  matchesSearchTerm(employee: Employee): boolean {
    if (!this.searchTerm) return true;
    
    const searchLower = this.searchTerm.toLowerCase();
    return (
      employee.FirstName.toLowerCase().includes(searchLower) ||
      employee.LastName.toLowerCase().includes(searchLower) ||
      employee.EmployeeEmail.toLowerCase().includes(searchLower) ||
      employee.EmployeeNumber.toString().includes(searchLower)
    );
  }

  onSearch() {
    this.currentPage = 1;
    this.applySearchAndPagination();
  }

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

  openModal(employee: Employee | null = null) {

    if (!this.roles || this.roles.length === 0) {
      this.fetchRoles();
    }
    if (!this.supervisors || this.supervisors.length === 0) {
      this.fetchSupervisors();
    }

    this.selectedEmployee = employee;
    this.isModalOpen = true;
    
    if (employee) {
      this.supervisors = this.supervisors.filter(s => s.EmployeeNumber.toString() !== employee.EmployeeNumber.toString());

      this.employeeForm = this.formBuilder.group({
        firstName: [employee.FirstName, [Validators.required, Validators.minLength(2)]],
        lastName: [employee.LastName, [Validators.required, Validators.minLength(2)]],
        email: [employee.EmployeeEmail, [Validators.required, Validators.email]],
        employeeNumber: [employee.EmployeeNumber],
        supervisorId: [employee.SupervisorId],
        roles: [employee.EmployeeRoles || []]
      });
    } else {
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
      },
      error: (err) => {
        console.error('Error fetching supervisors:', err);
      }
    });
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedEmployee = null;
    this.employeeForm.reset();
  }

  saveEmployee(employee: Employee) {
    this.loadingService.show();
    
    const isNewEmployee = !employee.EmployeeId || employee.EmployeeId === 0;
    
    const saveObservable = isNewEmployee 
      ? this.employeeService.addEmployee(employee)
      : this.employeeService.updateEmployee(employee);
    
    saveObservable.subscribe({
      next: (data) => {
        this.notificationService.success(
          isNewEmployee 
            ? `Employee created successfully ${data?.EmployeeNumber ? `(${data.EmployeeNumber})` : ''} ${data?.FirstName || ''} ${data?.LastName || ''}`.trim()
            : `Employee updated successfully ${data?.EmployeeNumber ? `(${data.EmployeeNumber})` : ''} ${data?.FirstName || ''} ${data?.LastName || ''}`.trim()
        ,5000);
        
        this.closeModal();
        this.loadEmployees();
        console.log(`${isNewEmployee ? 'Added' : 'Updated'} Employee Data:`, data);
      },
      error: (error) => {
        this.notificationService.error(
          isNewEmployee ? 'Failed to create employee' : 'Failed to update employee'
        );
        console.error('Save employee error:', error);
        this.loadingService.hide();
      },
      complete: () => {
        this.loadingService.hide();
      }
    });
  }

  editEmployee(employee: Employee) {
    this.openModal(employee);
  }

  deleteEmployee(employeeNumber: number) {
    if (confirm(`Are you sure you want to delete this employee (${employeeNumber})?`)) {
      this.employeeService.deleteEmployee(employeeNumber).subscribe(() => {
        this.allEmployees = this.allEmployees.filter(emp => emp.EmployeeNumber !== employeeNumber);
        this.applySearchAndPagination();
        this.notificationService.success(`Employee (${employeeNumber}) deleted successfully`);
      }, error => {
        this.notificationService.error(`Error deleting employee (${employeeNumber})`);
      });
    }
  }

  get formControls() {
    return this.employeeForm.controls;
  }

  get Math() {
    return Math;
  }
}