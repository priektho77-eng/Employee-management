export interface Department {
  DepartmentID: string;
  DepartmentName: string;
  Note: string;
}

export interface Employee {
  EmployeeID: string;
  Name: string;
  Gender: 'Male' | 'Female' | 'Other' | string;
  Phone: string;
  Address: string;
  DepartmentID: string;
}

export interface ConnectionConfig {
  webAppUrl: string;
  spreadsheetName?: string;
  spreadsheetId?: string;
  lastSyncedAt?: string;
  isConnected: boolean;
  mode: 'connected' | 'emulated';
}

export type ActiveTab = 'employees' | 'departments' | 'analytics' | 'script-setup';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}
