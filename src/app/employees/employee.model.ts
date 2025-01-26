export interface Employee {
    EmployeeId: number;
    EmployeeNumber: number;
    EmployeeEmail: string;
    FirstName: string;
    LastName: string;
    Supervisor?: EmployeeForm;
    SupervisorId: string;
    EmployeeRoles: EmployeeRole[];
    Active: boolean;
    CreatedDate: Date;
    CreatedBy: string;
    UpdatedDate: Date;
    UpdatedBy: string;
  }


  export interface roleDetail {
    roleId: number;
    roleName: string;
    roleDescription: string;
    active?: boolean;
    createdDate?: string;
  }

  export interface EmployeeForm {
    EmployeeId: number;
    EmployeeEmail: string;
    FirstName: string;
    LastName: string;
    SupervisorId: number;
    EmployeeRoles: roleDetail[];
    Active: boolean;
    CreatedDate: Date;
    CreatedBy: string;
    UpdatedDate: Date;
    UpdatedBy: string;
  }

  export interface roleDetail {
    roleId: number;
    roleName: string;
    roleDescription: string;
  }

  export interface EmployeeRole {
    employeeRoleId: number;
    employeeId: number;
    roleDetail: roleDetail;
    active: boolean;
  }