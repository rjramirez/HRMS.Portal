import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee } from './employee.model';
import { environment } from '../environments/environment.dev';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = `${environment.apiUrl}/Employee`;

  constructor(private http: HttpClient) {}

  // Get All Employees
  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.apiUrl}/GetEmployees`);
  }

  // Add a new Employee
  addEmployee(employee: Employee): Observable<Employee> {
    return this.http.post<Employee>(`${this.apiUrl}/AddEmployee`, employee);
  }

  // Update an existing Employee
  updateEmployee(employee: Employee): Observable<Employee> {
    return this.http.put<Employee>(`${this.apiUrl}/UpdateEmployee`, employee);
  }

  // Delete an Employee
  deleteEmployee(employeeNumber: number): Observable<number> {
    return this.http.delete<number>(`${this.apiUrl}/DeleteEmployee/${employeeNumber}`);
  }
}
