import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { Employee, EmployeeRole, RoleDetail } from '../employee.model';
import { EmployeeService } from '../employee.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-employee-modal',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './employee-modal.component.html',
  styleUrls: ['./employee-modal.component.scss']
})
export class EmployeeModalComponent implements OnInit {
  @Input() employee: Employee | null = null;
  @Input() supervisors!: Employee[];
  @Input() employeeRoles!: EmployeeRole[];
  @Output() save = new EventEmitter<Employee>();
  @Output() close = new EventEmitter<void>();

  filteredRoles: RoleDetail[] = [];
  roleSearch: string = '';
  availableRoles: RoleDetail[] = [];
  supervisorSearch: string = '';
  filteredSupervisors: Employee[] = [];
  showRoleDropdown = false;
  showSupervisorDropdown = false;

  constructor(private employeeService: EmployeeService) {}

  ngOnInit() {
    this.fetchEmployeeRoles();
    this.filteredRoles = this.availableRoles;
    this.filteredSupervisors = this.supervisors;

    // Set the supervisor search based on the employee's SupervisorId
    if (this.employee && this.employee.SupervisorId) {
      const supervisor = this.supervisors.find(s => s.EmployeeNumber === this.employee!.SupervisorId);
      if (supervisor) {
        this.supervisorSearch = `${supervisor.FirstName} ${supervisor.LastName}`;
      }
    }
  }

  fetchEmployeeRoles() {
    this.employeeService.getEmployeeRoles().subscribe(roles => {
      this.availableRoles = roles.map(role => role.roleDetail);
      this.filteredRoles = this.availableRoles;
    });
  }

  filterRoles() {
    const searchTerm = this.roleSearch.toLowerCase();
    this.filteredRoles = this.availableRoles.filter(role => 
      role.roleName.toLowerCase().includes(searchTerm)
    );
  }

  selectRole(role: RoleDetail) {
    if (!this.employee?.EmployeeRoles.some(r => r.roleDetail.roleId === role.roleId)) {
      this.employee?.EmployeeRoles.push({
        employeeRoleId: 0,
        employeeId: this.employee?.EmployeeId,
        roleDetail: role,
        createdDate: new Date(),
        createdBy: 'User'
      });
    }
    this.roleSearch = '';
    this.showRoleDropdown = false;
  }

  removeRole(role: EmployeeRole) {
    if (this.employee) {
      this.employee.EmployeeRoles = this.employee.EmployeeRoles.filter(r => r.roleDetail.roleId !== role.roleDetail.roleId);
    }
  }

  filterSupervisors() {
    const searchTerm = this.supervisorSearch.toLowerCase();
    this.filteredSupervisors = this.supervisors.filter(supervisor => 
      supervisor.FirstName.toLowerCase().includes(searchTerm) ||
      supervisor.LastName.toLowerCase().includes(searchTerm) ||
      supervisor.EmployeeNumber.toString().includes(searchTerm)
    );
  }

  selectSupervisor(supervisor: Employee) {
    this.employee!.SupervisorId = supervisor.EmployeeId;
    this.supervisorSearch = `${supervisor.FirstName} ${supervisor.LastName}`;
    this.filteredSupervisors = this.supervisors;
    this.showSupervisorDropdown = false;
  }

  onRoleBlur() {
    // Use setTimeout to allow click event to fire before closing
    setTimeout(() => {
      this.showRoleDropdown = false;
    }, 200);
  }

  onRoleFocus() {
    this.showRoleDropdown = true;
    this.filterRoles();
  }

  onSupervisorBlur() {
    // Use setTimeout to allow click event to fire before closing
    setTimeout(() => {
      this.showSupervisorDropdown = false;
    }, 200);
  }

  onSupervisorFocus() {
    this.showSupervisorDropdown = true;
    this.filterSupervisors();
  }

  onSave() {
    if (this.employee) {
      this.save.emit(this.employee);
    }
  }

  onClose() {
    this.close.emit();
  }
}
