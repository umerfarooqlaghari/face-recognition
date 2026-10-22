import * as SecureStore from 'expo-secure-store';
import { File as ExpoFile } from 'expo-file-system';
import { AuthTokens, User } from '../types';
import { getDeviceTelemetry } from './device';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://face-recognition-nx5p.onrender.com/api';

/**
 * Universal file attacher for modern Expo / React Native fetch (WinterCG compliant).
 * Prevents "Unsupported FormData part implementation" error on iOS/Android.
 */
async function appendFileToFormData(
  formData: FormData,
  fieldName: string,
  imageUri: string,
  filename?: string
): Promise<void> {
  const safeName = filename || imageUri.split('/').pop() || 'photo.jpg';

  try {
    // 1. Modern Expo File (Blob compatible)
    const file = new ExpoFile(imageUri);
    formData.append(fieldName, file as any);
    return;
  } catch {}

  try {
    // 2. Fetch local URI and convert to standard Blob
    const res = await fetch(imageUri);
    const blob = await res.blob();
    formData.append(fieldName, blob, safeName);
    return;
  } catch {}

  // 3. Fallback to legacy RN object
  // @ts-ignore
  formData.append(fieldName, {
    uri: imageUri,
    name: safeName,
    type: 'image/jpeg',
  });
}

const TOKEN_KEY = 'attend_access_token_v1';
const REFRESH_KEY = 'attend_refresh_token_v1';
const USER_KEY = 'attend_user_profile_v1';

export async function storeSession(tokens: AuthTokens): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, tokens.access_token);
  await SecureStore.setItemAsync(REFRESH_KEY, tokens.refresh_token);
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(tokens.user));
}

export async function clearSession(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_KEY);
  await SecureStore.deleteItemAsync(USER_KEY);
}

export async function getStoredUser(): Promise<User | null> {
  try {
    const raw = await SecureStore.getItemAsync(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function getAccessToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function refreshSession(): Promise<AuthTokens | null> {
  try {
    const refreshToken = await SecureStore.getItemAsync(REFRESH_KEY);
    if (!refreshToken) return null;

    const telemetry = await getDeviceTelemetry();
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        refresh_token: refreshToken,
        device_id: telemetry.device_id,
      }),
    });

    if (!res.ok) {
      await clearSession();
      return null;
    }

    const tokens: AuthTokens = await res.json();
    await storeSession(tokens);
    return tokens;
  } catch {
    return null;
  }
}

export async function authFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  let token = await getAccessToken();

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // If 401 Unauthorized, attempt 7-day refresh token rotation
  if (response.status === 401) {
    const newTokens = await refreshSession();
    if (newTokens) {
      headers.set('Authorization', `Bearer ${newTokens.access_token}`);
      response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });
    }
  }

  return response;
}

// ---------------- Biometrics & Invites API ----------------

export async function generateFaceScanInvite(userId: string): Promise<{
  invite_token: string;
  user_id: string;
  employee_name: string;
  employee_code: string;
  expires_at: string;
  invite_url: string;
}> {
  const res = await authFetch('/biometrics/invites/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, expires_hours: 48 }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to generate face scan invite');
  }

  return res.json();
}

export async function verifyInviteToken(token: string): Promise<{
  valid: boolean;
  user_id: string;
  full_name: string;
  employee_code: string;
  expires_at: string;
}> {
  const res = await fetch(`${API_BASE_URL}/biometrics/invites/verify/${token}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Invalid or expired invite token');
  }
  return res.json();
}

export async function enrollFaceReference(
  imageUri: string,
  options: { inviteToken?: string; userId?: string }
): Promise<{ success: boolean; message: string; user_id: string }> {
  const formData = new FormData();

  await appendFileToFormData(formData, 'file', imageUri);

  if (options.inviteToken) {
    formData.append('invite_token', options.inviteToken);
  }
  if (options.userId) {
    formData.append('user_id', options.userId);
  }

  let token = await getAccessToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let res = await fetch(`${API_BASE_URL}/biometrics/enroll`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (res.status === 401) {
    const newTokens = await refreshSession();
    if (newTokens) {
      headers['Authorization'] = `Bearer ${newTokens.access_token}`;
      res = await fetch(`${API_BASE_URL}/biometrics/enroll`, {
        method: 'POST',
        headers,
        body: formData,
      });
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Face enrollment failed. Please retry.');
  }

  return res.json();
}

export async function getBiometricProfile(userId: string): Promise<{
  user_id: string;
  is_verified: boolean;
  enrolled_at: string;
} | null> {
  try {
    const res = await authFetch(`/biometrics/profile/${userId}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ---------------- Work Modes & Geofencing API ----------------

export async function getWorkModeStatus(
  userId: string,
  targetDate?: string
): Promise<{
  user_id: string;
  date: string;
  effective_work_mode: 'on_site' | 'remote';
  is_override: boolean;
  override_reason?: string | null;
  office?: {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    radius_meters: number;
    address?: string | null;
  } | null;
  requires_geofence: boolean;
  radius_meters: number;
}> {
  const query = targetDate ? `?target_date=${targetDate}` : '';
  const res = await authFetch(`/work-modes/status/${userId}${query}`);
  if (!res.ok) {
    throw new Error('Failed to fetch work mode status');
  }
  return res.json();
}

export async function validateGeofence(payload: {
  userId: string;
  latitude: number;
  longitude: number;
  isMocked?: boolean;
  targetDate?: string;
}): Promise<{
  allowed: boolean;
  work_mode: string;
  distance_meters?: number | null;
  radius_limit_meters: number;
  is_within_geofence: boolean;
  message: string;
}> {
  const res = await authFetch('/work-modes/validate-geofence', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: payload.userId,
      latitude: payload.latitude,
      longitude: payload.longitude,
      is_mocked: payload.isMocked || false,
      target_date: payload.targetDate || null,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Geofence validation failed');
  }

  return res.json();
}

export async function setWorkModeOverride(payload: {
  userId: string;
  effectiveDate: string;
  assignedMode: 'on_site' | 'remote';
  reason?: string;
}): Promise<any> {
  const res = await authFetch('/work-modes/override', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: payload.userId,
      effective_date: payload.effectiveDate,
      assigned_mode: payload.assignedMode,
      reason: payload.reason,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to update work mode override');
  }

  return res.json();
}

// ---------------- Attendance API ----------------

export async function markAttendanceCheckIn(params: {
  imageUri: string;
  latitude: number;
  longitude: number;
  deviceId?: string;
  isMocked?: boolean;
}): Promise<{
  id: string;
  user_id: string;
  date: string;
  check_in_time: string;
  status: string;
  verification_type: string;
  similarity_score: number;
  liveness_score: number;
  distance_from_office_meters?: number | null;
  message: string;
}> {
  const formData = new FormData();

  await appendFileToFormData(formData, 'file', params.imageUri);

  formData.append('latitude', String(params.latitude));
  formData.append('longitude', String(params.longitude));
  if (params.deviceId) {
    formData.append('device_id', params.deviceId);
  }
  formData.append('is_mocked', String(params.isMocked || false));

  let token = await getAccessToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let res = await fetch(`${API_BASE_URL}/attendance/check-in`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (res.status === 401) {
    const newTokens = await refreshSession();
    if (newTokens) {
      headers['Authorization'] = `Bearer ${newTokens.access_token}`;
      res = await fetch(`${API_BASE_URL}/attendance/check-in`, {
        method: 'POST',
        headers,
        body: formData,
      });
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Attendance check-in verification failed');
  }

  return res.json();
}

export async function markAttendanceCheckOut(coords?: {
  latitude?: number;
  longitude?: number;
}): Promise<{
  id: string;
  user_id: string;
  check_in_time: string;
  check_out_time: string;
  hours_worked?: number | null;
  message: string;
}> {
  const res = await authFetch('/attendance/check-out', {
    method: 'POST',
    body: JSON.stringify(coords || {}),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to check out');
  }

  return res.json();
}

export async function getTodayAttendance(userId: string): Promise<{
  has_checked_in: boolean;
  has_checked_out: boolean;
  record?: {
    id: string;
    date: string;
    check_in_time: string;
    check_out_time?: string | null;
    status: string;
    verification_type: string;
    similarity_score: number;
    distance_from_office_meters?: number | null;
  } | null;
  is_on_leave?: boolean;
  leave_status?: string | null;
  leave_reason?: string | null;
}> {
  const res = await authFetch(`/attendance/today/${userId}`);
  if (!res.ok) {
    return { has_checked_in: false, has_checked_out: false };
  }
  return res.json();
}

export async function getAttendanceHistory(userId: string): Promise<Array<{
  id: string;
  date: string;
  check_in_time: string;
  check_out_time?: string | null;
  status: string;
  verification_type: string;
  similarity_score: number;
  distance_from_office_meters?: number | null;
}>> {
  const res = await authFetch(`/attendance/history/${userId}`);
  if (!res.ok) return [];
  return res.json();
}

// ---------------- Leave Management API ----------------

export interface LeaveItem {
  id: string;
  tenant_id: string;
  user_id: string;
  employee_name?: string | null;
  employee_code?: string | null;
  manager_name?: string | null;
  start_date: string;
  end_date: string;
  reason: string;
  leave_type?: string | null;
  status: 'pending_manager' | 'pending_admin' | 'pending' | 'approved' | 'rejected';
  approved_by?: string | null;
  level1_approved_by?: string | null;
  level1_approver_name?: string | null;
  level1_approved_at?: string | null;
  level2_approved_by?: string | null;
  level2_approver_name?: string | null;
  level2_approved_at?: string | null;
  admin_bypassed?: boolean;
  rejection_reason?: string | null;
  created_at: string;
}

export async function applyLeave(payload: {
  startDate?: string;
  endDate?: string;
  dates?: string[];
  reason: string;
}): Promise<LeaveItem> {
  const sortedDates = payload.dates && payload.dates.length > 0 ? [...payload.dates].sort() : [];
  const startDate = payload.startDate || sortedDates[0];
  const endDate = payload.endDate || sortedDates[sortedDates.length - 1];

  const res = await authFetch('/leaves/apply', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      start_date: startDate,
      end_date: endDate,
      dates: sortedDates.length > 0 ? sortedDates : undefined,
      reason: payload.reason,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to submit leave request');
  }

  return res.json();
}

export async function getMyLeaves(): Promise<LeaveItem[]> {
  const res = await authFetch('/leaves/my-leaves');
  if (!res.ok) return [];
  return res.json();
}

export async function updateLeave(
  leaveId: string,
  payload: {
    startDate?: string;
    endDate?: string;
    dates?: string[];
    reason?: string;
  }
): Promise<LeaveItem> {
  const sortedDates = payload.dates && payload.dates.length > 0 ? [...payload.dates].sort() : [];
  const startDate = payload.startDate || (sortedDates.length > 0 ? sortedDates[0] : undefined);
  const endDate = payload.endDate || (sortedDates.length > 0 ? sortedDates[sortedDates.length - 1] : undefined);

  const res = await authFetch(`/leaves/${leaveId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      start_date: startDate,
      end_date: endDate,
      dates: sortedDates.length > 0 ? sortedDates : undefined,
      reason: payload.reason,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to update leave request');
  }

  return res.json();
}

export async function cancelLeave(leaveId: string): Promise<void> {
  const res = await authFetch(`/leaves/${leaveId}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to cancel leave request');
  }
}

export async function getTenantLeaves(status?: string): Promise<LeaveItem[]> {
  const query = status ? `?status=${status}` : '';
  const res = await authFetch(`/leaves/tenant-leaves${query}`);
  if (!res.ok) return [];
  return res.json();
}

export async function reviewLeave(
  leaveId: string,
  status: 'approved' | 'rejected' | 'bypass',
  reviewNote?: string,
  bypass?: boolean
): Promise<LeaveItem> {
  const res = await authFetch(`/leaves/${leaveId}/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status,
      review_note: reviewNote,
      bypass: bypass || status === 'bypass',
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to review leave');
  }

  return res.json();
}

export interface OfficeItem {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  address?: string | null;
}

export async function getTenantOffices(): Promise<OfficeItem[]> {
  const res = await authFetch('/work-modes/offices');
  if (!res.ok) return [];
  return res.json();
}

export async function createTenantOffice(payload: {
  name: string;
  latitude: number;
  longitude: number;
  radius_meters?: number;
  address?: string;
}): Promise<OfficeItem> {
  const res = await authFetch('/work-modes/offices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to create office location');
  }
  return res.json();
}

export async function deleteTenantOffice(officeId: string): Promise<any> {
  const res = await authFetch(`/work-modes/offices/${officeId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to delete office location');
  }
  return res.json();
}

// ---------------- Management Portal API ----------------

export async function getManagementEmployees(): Promise<Array<{
  id: string;
  tenant_id: string;
  email: string;
  full_name: string;
  employee_code: string;
  role: string;
  default_work_mode: 'on_site' | 'remote';
  office_id?: string | null;
  office_name?: string;
  manager_id?: string | null;
  manager_name?: string | null;
  is_active: boolean;
  face_enrolled: boolean;
  date_override?: string | null;
  created_at: string;
}>> {
  const res = await authFetch('/management/employees');
  if (!res.ok) return [];
  return res.json();
}

export async function getManagementTenantStats(): Promise<any> {
  const res = await authFetch('/management/tenant');
  if (!res.ok) return null;
  return res.json();
}

export async function getManagementTodayAttendance(): Promise<any[]> {
  const res = await authFetch('/management/attendance/today');
  if (!res.ok) return [];
  return res.json();
}

export async function resendEmployeeInvite(employeeId: string): Promise<any> {
  const res = await authFetch(`/management/employees/${employeeId}/resend-invite`, {
    method: 'POST',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to resend invite');
  }
  return res.json();
}

export async function createManagementEmployee(payload: {
  fullName?: string;
  firstName?: string;
  lastName?: string;
  department?: string;
  designation?: string;
  phoneNumber?: string;
  email: string;
  employeeCode?: string;
  defaultWorkMode: 'on_site' | 'remote';
  role?: string;
  officeId?: string;
  managerId?: string;
}): Promise<{
  user: User;
  auto_generated_password: string;
  invite_token: string;
  email_dispatch: any;
}> {
  const res = await authFetch('/management/employees', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      full_name: payload.fullName,
      first_name: payload.firstName,
      last_name: payload.lastName,
      department: payload.department,
      designation: payload.designation,
      phone_number: payload.phoneNumber,
      email: payload.email,
      employee_code: payload.employeeCode || undefined,
      default_work_mode: payload.defaultWorkMode,
      role: payload.role || 'employee',
      office_id: payload.officeId || undefined,
      manager_id: payload.managerId || undefined,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to enroll employee');
  }
  return res.json();
}

export async function updateManagementEmployee(
  employeeId: string,
  payload: {
    fullName?: string;
    firstName?: string;
    lastName?: string;
    department?: string;
    designation?: string;
    phoneNumber?: string;
    role?: string;
    defaultWorkMode?: 'on_site' | 'remote';
    officeId?: string | null;
    managerId?: string | null;
  }
): Promise<any> {
  const res = await authFetch(`/management/employees/${employeeId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      full_name: payload.fullName,
      first_name: payload.firstName,
      last_name: payload.lastName,
      department: payload.department,
      designation: payload.designation,
      phone_number: payload.phoneNumber,
      role: payload.role,
      default_work_mode: payload.defaultWorkMode,
      office_id: payload.officeId,
      manager_id: payload.managerId,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to update employee');
  }
  return res.json();
}

export async function deleteManagementEmployee(employeeId: string): Promise<any> {
  const res = await authFetch(`/management/employees/${employeeId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to delete employee');
  }
  return res.json();
}

export async function deleteMyAccount(): Promise<any> {
  const res = await authFetch('/auth/me', {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to delete account');
  }
  return res.json();
}

// ---------------- CSV Employee Import API ----------------

export async function downloadEmployeeImportTemplate(): Promise<string> {
  const res = await authFetch('/management/employees/import/template');
  if (!res.ok) {
    throw new Error('Failed to download template');
  }
  return res.text();
}

export async function previewEmployeeImport(formData: FormData): Promise<{
  total_rows: number;
  valid_rows: number;
  invalid_rows: number;
  preview: Array<{
    row: number;
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
    employee_code?: string | null;
    department?: string | null;
    designation?: string | null;
    phone_number?: string | null;
    work_mode?: string | null;
    valid: boolean;
    is_duplicate: boolean;
    errors: string[];
  }>;
}> {
  const res = await authFetch('/management/employees/import/preview', {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to preview CSV file');
  }
  return res.json();
}

export async function commitEmployeeImport(formData: FormData): Promise<{
  total_rows: number;
  created: number;
  skipped: number;
  created_records: Array<{
    row: number;
    employee_code: string;
    first_name: string;
    last_name: string;
    email: string;
  }>;
  skipped_records: Array<{
    row: number;
    first_name: string;
    last_name: string;
    email: string;
    reason: string;
  }>;
}> {
  const res = await authFetch('/management/employees/import', {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to import CSV');
  }
  return res.json();
}

export async function getEmployeeAttendanceCalendar(
  userId: string,
  year?: number,
  month?: number
): Promise<{
  user_id: string;
  employee_name: string;
  year: number;
  month: number;
  month_name: string;
  timezone: string;
  resolved_shift: {
    shift_name: string;
    work_start_time: string;
    work_end_time: string;
    grace_period_minutes: number;
    timezone: string;
    is_custom: boolean;
  };
  summary: {
    days_present: number;
    days_late: number;
    days_absent: number;
    days_on_leave: number;
    total_hours_worked: number;
    on_time_rate_pct: number;
  };
  days: Array<{
    date: string;
    day_of_month: number;
    day_name: string;
    is_weekend: boolean;
    is_future: boolean;
    status: 'present' | 'late' | 'absent' | 'leave' | 'weekend';
    check_in_time?: string | null;
    check_out_time?: string | null;
    check_in_local?: string | null;
    check_out_local?: string | null;
    hours_worked?: number | null;
    is_late: boolean;
    minutes_late: number;
    is_on_leave: boolean;
    leave_type?: string | null;
  }>;
}> {
  const query = new URLSearchParams();
  if (year) query.set('year', String(year));
  if (month) query.set('month', String(month));
  const qs = query.toString() ? `?${query.toString()}` : '';

  const res = await authFetch(`/attendance/calendar/${userId}${qs}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to fetch attendance calendar');
  }
  return res.json();
}

export async function updateEmployeeShift(
  userId: string,
  data: {
    work_start_time?: string | null;
    work_end_time?: string | null;
    grace_period_minutes?: number | null;
    timezone?: string | null;
    shift_name?: string | null;
  }
): Promise<any> {
  const res = await authFetch(`/management/employees/${userId}/shift`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to update employee shift');
  }
  return res.json();
}

export async function resetEmployeeShift(userId: string): Promise<any> {
  return updateEmployeeShift(userId, {
    work_start_time: null,
    work_end_time: null,
    grace_period_minutes: null,
    timezone: null,
    shift_name: null,
  });
}

export async function updateTenantTimings(data: {
  default_timezone?: string;
  default_work_start_time?: string;
  default_work_end_time?: string;
  default_grace_period_minutes?: number;
}): Promise<any> {
  const res = await authFetch('/management/tenant/timings', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to update company office timings');
  }
  return res.json();
}

export async function updateOfficeTimings(
  officeId: string,
  data: {
    timezone?: string;
    work_start_time?: string;
    work_end_time?: string;
    grace_period_minutes?: number;
  }
): Promise<any> {
  const res = await authFetch(`/management/offices/${officeId}/timings`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to update campus office timings');
  }
  return res.json();
}

export async function sendLateDigest(dateStr?: string): Promise<{
  status: string;
  target_date: string;
  late_count: number;
  recipients: string[];
  message: string;
}> {
  const qs = dateStr ? `?target_date=${encodeURIComponent(dateStr)}` : '';
  const res = await authFetch(`/attendance/send-late-digest${qs}`, {
    method: 'POST',
    body: dateStr ? JSON.stringify({ target_date: dateStr }) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to send late arrivals digest');
  }
  return res.json();
}




