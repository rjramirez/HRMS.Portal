import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee } from './employee.model';
import { environment } from '../environments/environment.dev';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = `${environment.apiUrl}/Employee/GetEmployees`; // Define the API URL

  constructor(private http: HttpClient) {} // Inject HttpClient

  //Get All Employees
  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.apiUrl); // Implement the getEmployees method
  }

  // Add a new Employee
  addEmployee(employee: Employee): Observable<Employee> {
    return this.http.post<Employee>(this.apiUrl, employee); // Example for adding an employee
  }

  // Update an existing Employee
  updateEmployee(employee: Employee): Observable<Employee> {
    return this.http.put<Employee>(`${this.apiUrl}/${employee.EmployeeId}`, employee); // Example for updating an employee
  }

  // Delete an Employee
  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`); // Example for deleting an employee
  }
}
