export type UserRole = 'employee' | 'manager' | 'super_admin' | 'admin';
export type WorkMode = 'on_site' | 'remote';

export interface User {
  id: string;
  email: string;
  full_name: string;
  employee_code: string;
  role: UserRole;
  default_work_mode: WorkMode;
  office_id?: string | null;
  is_active: boolean;
}

export interface DeviceTelemetry {
  device_id: string;
  device_model?: string;
  os_name?: string;
  os_version?: string;
  app_version?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}
