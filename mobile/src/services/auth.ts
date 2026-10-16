import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { AuthTokens } from '../types';
import { getDeviceTelemetry } from './device';
import { storeSession, clearSession } from './api';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api';
const REMEMBERED_EMAIL_KEY = 'attend_remembered_email_v1';

export async function loginWithPassword(email: string, password: string): Promise<AuthTokens> {
  const telemetry = await getDeviceTelemetry();
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      device: telemetry,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Login failed. Please verify credentials.');
  }

  const tokens: AuthTokens = await response.json();
  await storeSession(tokens);
  await SecureStore.setItemAsync(REMEMBERED_EMAIL_KEY, email);
  return tokens;
}

export async function signupTenant(payload: {
  company_name: string;
  admin_name: string;
  admin_email: string;
  admin_password: string;
  office_name?: string;
}): Promise<AuthTokens> {
  const response = await fetch(`${API_BASE_URL}/auth/tenant/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Organization registration failed.');
  }

  const tokens: AuthTokens = await response.json();
  await storeSession(tokens);
  await SecureStore.setItemAsync(REMEMBERED_EMAIL_KEY, payload.admin_email);
  return tokens;
}


export async function checkBiometricsAvailable(): Promise<{ hasHardware: boolean; isEnrolled: boolean; types: LocalAuthentication.AuthenticationType[] }> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
  return { hasHardware, isEnrolled, types };
}

export async function loginWithBiometrics(): Promise<AuthTokens | null> {
  const { hasHardware, isEnrolled } = await checkBiometricsAvailable();
  if (!hasHardware || !isEnrolled) {
    throw new Error('Biometrics not available or not enrolled on this device');
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Sign in to Attendance Portal',
    fallbackLabel: 'Use Password',
    cancelLabel: 'Cancel',
  });

  if (!result.success) {
    return null;
  }

  // Attempt to refresh existing 7-day session
  const { refreshSession } = await import('./api');
  const tokens = await refreshSession();
  if (!tokens) {
    throw new Error('No active session found. Please enter password once to register device biometrics.');
  }
  return tokens;
}

export async function logout(): Promise<void> {
  await clearSession();
}
