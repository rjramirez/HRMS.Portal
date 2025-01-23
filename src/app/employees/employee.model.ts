export interface Employee {
    EmployeeId: number;
    EmployeeNumber: number;
    EmployeeEmail: string;
    FirstName: string;
    LastName: string;
    SupervisorId: number;
    EmployeeRoles: EmployeeRole[];
    Active: boolean;
    CreatedDate: Date;
    CreatedBy: string;
    UpdatedDate: Date;
    UpdatedBy: string;
  }


  export interface EmployeeRole {
    employeeRoleId: number;
    employeeId: number;
    roleDetail: RoleDetail;
    active: boolean;
    createdDate: Date;
    createdBy: string;
    updatedDate: Date;
    updatedBy: string;
  }

  export interface RoleDetail {
    roleId: number;
    roleName: string;
    roleDescription: string;
    active: boolean;
  }

  export interface EmployeeForm {
    EmployeeId: number;
    EmployeeEmail: string;
    FirstName: string;
    LastName: string;
    SupervisorId: number;
    Active: boolean;
  }
  