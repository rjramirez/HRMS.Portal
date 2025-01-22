import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Employee } from './employee.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private employees: Employee[] = [
    {
      employeeId: 1,
      employeeEmail: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      supervisorId: null,
      active: true,
      createdAt: new Date(),
      createdBy: 'admin',
      updatedAt: null,
      updatedBy: null
    },
    {
      employeeId: 2,
      employeeEmail: 'jane.smith@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      supervisorId: 1,
      active: true,
      createdAt: new Date(),
      createdBy: 'admin',
      updatedAt: null,
      updatedBy: null
    }
  ];

  constructor(private http: HttpClient) {}

  getEmployees(): Observable<Employee[]> {
    // For now, return mock data. Later, replace with actual HTTP call
    return of(this.employees);
  }

  addEmployee(employee: Employee): Observable<Employee> {
    return of(employee);
  }

  updateEmployee(employee: Employee): Observable<Employee> {
    return of(employee);
  }

  deleteEmployee(id: number): Observable<void> {
    return of(void 0);
  }
}
