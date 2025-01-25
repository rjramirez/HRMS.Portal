export interface Employee {
    EmployeeId: number;
    EmployeeNumber: number;
    EmployeeEmail: string;
    FirstName: string;
    LastName: string;
    SupervisorId: number;
    EmployeeRoles: RoleDetail[];
    Active: boolean;
    CreatedDate: Date;
    CreatedBy: string;
    UpdatedDate: Date;
    UpdatedBy: string;
  }


  export interface RoleDetail {
    roleId: number;
    roleName: string;
    roleDescription: string;
    active?: boolean;
  }

  export interface EmployeeForm {
    EmployeeId: number;
    EmployeeEmail: string;
    FirstName: string;
    LastName: string;
    SupervisorId: number;
    EmployeeRoles: RoleDetail[];
    Active: boolean;
  }