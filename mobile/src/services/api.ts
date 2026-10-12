import * as SecureStore from 'expo-secure-store';
import { AuthTokens, User } from '../types';
import { getDeviceTelemetry } from './device';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api';

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

  const filename = imageUri.split('/').pop() || 'face_enrollment.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';

  // @ts-ignore
  formData.append('file', {
    uri: imageUri,
    name: filename,
    type,
  });

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

  const res = await fetch(`${API_BASE_URL}/biometrics/enroll`, {
    method: 'POST',
    headers,
    body: formData,
  });

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

  const filename = params.imageUri.split('/').pop() || 'probe_face.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';

  // @ts-ignore
  formData.append('file', {
    uri: params.imageUri,
    name: filename,
    type,
  });

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

  const res = await fetch(`${API_BASE_URL}/attendance/check-in`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Attendance check-in verification failed');
  }

  return res.json();
}

export async function markAttendanceCheckOut(): Promise<{
  id: string;
  check_out_time: string;
  message: string;
}> {
  const res = await authFetch('/attendance/check-out', {
    method: 'POST',
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
