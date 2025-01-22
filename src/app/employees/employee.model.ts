export interface Employee {
    employeeId: number;
    employeeEmail: string;
    firstName: string;
    lastName: string;
    supervisorId: number | null;
    active: boolean;
    createdAt: Date;
    createdBy: string;
    updatedAt: Date | null;
    updatedBy: string | null;
  }

  export interface EmployeeForm {
    employeeId: number;
    employeeEmail: string;
    firstName: string;
    lastName: string;
    supervisorId: number | null;
    active: boolean;
  }
  