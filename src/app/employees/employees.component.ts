import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeService } from './employee.service';
import { Employee } from './employee.model';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss']
})
export class EmployeesComponent implements OnInit {
  employees: Employee[] = [];

  constructor(private employeeService: EmployeeService) {}

  ngOnInit() {
    this.employeeService.getEmployees().subscribe(data => {
      this.employees = data;
    });
  }

  openModal() {
    // Implementation for opening modal
  }

  editEmployee(employee: Employee) {
    // Implementation for editing employee
  }

  deleteEmployee(id: number) {
    // Implementation for deleting employee
  }
}
