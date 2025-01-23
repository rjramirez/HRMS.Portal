export interface Employee {
    EmployeeId: number;
    EmployeeNumber: number;
    EmployeeEmail: string;
    FirstName: string;
    LastName: string;
    SupervisorId: number;
    Active: boolean;
    CreatedDate: Date;
    CreatedBy: string;
    UpdatedDate: Date;
    UpdatedBy: string;
  }

  export interface EmployeeForm {
    EmployeeId: number;
    EmployeeEmail: string;
    FirstName: string;
    LastName: string;
    SupervisorId: number;
    Active: boolean;
  }
  