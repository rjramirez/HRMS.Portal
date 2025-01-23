import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Employee } from '../employee.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-employee-modal',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './employee-modal.component.html',
  styleUrls: ['./employee-modal.component.scss']
})
export class EmployeeModalComponent {
  @Input() employee: Employee | null = null;
  @Input() supervisors: Employee[] = [];
  @Output() save = new EventEmitter<Employee>();
  @Output() close = new EventEmitter<void>();

  onSave() {
    if (this.employee) {
      this.save.emit(this.employee);
    }
  }

  onClose() {
    this.close.emit();
  }
}
