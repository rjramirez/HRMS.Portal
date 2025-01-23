import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Employee } from '../employee.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-employee-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './employee-modal.component.html',
  styleUrls: ['./employee-modal.component.scss']
})
export class EmployeeModalComponent {
  @Input() employee: Employee | null = null; // Allow null
  @Output() save = new EventEmitter<Employee>(); // Event to emit when saving
  @Output() close = new EventEmitter<void>(); // Event to emit when closing

  onSave() {
    if (this.employee) {
      this.save.emit(this.employee); // Emit the employee data
    }
  }

  onClose() {
    this.close.emit(); // Emit close event
  }
}
