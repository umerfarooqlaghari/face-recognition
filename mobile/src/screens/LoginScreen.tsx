import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { loginWithPassword, loginWithBiometrics, checkBiometricsAvailable, signupTenant } from '../services/auth';
import { getDeviceTelemetry } from '../services/device';
import { AuthTokens, DeviceTelemetry } from '../types';
import { ShieldIcon, FingerprintIcon, KeyIcon, MailIcon, BuildingIcon, UserIcon } from '../components/SvgIcons';

interface LoginScreenProps {
  onLoginSuccess: (tokens: AuthTokens) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Sign In fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register Organization fields
  const [companyName, setCompanyName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [officeName, setOfficeName] = useState('Headquarters');

  const [loading, setLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<DeviceTelemetry | null>(null);

  useEffect(() => {
    (async () => {
      const bio = await checkBiometricsAvailable();
      setBiometricAvailable(bio.hasHardware && bio.isEnrolled);
      const tele = await getDeviceTelemetry();
      setDeviceInfo(tele);
    })();
  }, []);

  const handlePasswordLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Required', 'Please enter your work email and password');
      return;
    }
    setLoading(true);
    try {
      const tokens = await loginWithPassword(email.trim().toLowerCase(), password);
      onLoginSuccess(tokens);
    } catch (err: any) {
      Alert.alert('Authentication Failed', err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleTenantSignup = async () => {
    if (!companyName.trim() || !adminName.trim() || !adminEmail.trim() || !adminPassword) {
      Alert.alert('Required Fields', 'Please complete all fields to register your organization');
      return;
    }
    setLoading(true);
    try {
      const tokens = await signupTenant({
        company_name: companyName.trim(),
        admin_name: adminName.trim(),
        admin_email: adminEmail.trim().toLowerCase(),
        admin_password: adminPassword,
        office_name: officeName.trim() || 'Headquarters',
      });
      Alert.alert('Organization Registered', `Welcome to ${companyName}! You can now add employees.`);
      onLoginSuccess(tokens);
    } catch (err: any) {
      Alert.alert('Registration Failed', err.message || 'Could not register organization');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    setLoading(true);
    try {
      const tokens = await loginWithBiometrics();
      if (tokens) {
        onLoginSuccess(tokens);
      }
    } catch (err: any) {
      Alert.alert('Biometrics', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Brand Header */}
        <View style={styles.headerContainer}>
          <Image
            source={require('../../assets/image.png')}
            style={styles.brandLogo}
            resizeMode="contain"
          />
          <View style={styles.logoBadge}>
            <ShieldIcon size={14} color="#1e3a8a" />
            <Text style={styles.logoBadgeText}>ENTERPRISE PORTAL</Text>
          </View>
          <Text style={styles.title}>Biometric Attendance</Text>
          <Text style={styles.subtitle}>
            {authMode === 'signin'
              ? 'Sign in to your organization account'
              : 'Register your organization & create admin'}
          </Text>
        </View>

        {/* Auth Mode Tabs (Sign In vs Register Organization) */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, authMode === 'signin' && styles.tabButtonActive]}
            onPress={() => setAuthMode('signin')}
          >
            <Text style={[styles.tabButtonText, authMode === 'signin' && styles.tabButtonTextActive]}>
              Sign In
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, authMode === 'signup' && styles.tabButtonActive]}
            onPress={() => setAuthMode('signup')}
          >
            <Text style={[styles.tabButtonText, authMode === 'signup' && styles.tabButtonTextActive]}>
              Register Organization
            </Text>
          </TouchableOpacity>
        </View>

        {/* Main Card */}
        <View style={styles.card}>
          {authMode === 'signin' ? (
            /* --- SIGN IN FORM --- */
            <>
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <MailIcon size={14} color="#64748b" />
                  <Text style={styles.label}>Work Email</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="name@company.com"
                  placeholderTextColor="#94a3b8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <View style={[styles.inputGroup, { marginTop: 16 }]}>
                <View style={styles.labelRow}>
                  <KeyIcon size={14} color="#64748b" />
                  <Text style={styles.label}>Password</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your assigned password"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, loading && styles.buttonDisabled]}
                onPress={handlePasswordLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Sign In</Text>
                )}
              </TouchableOpacity>

              {biometricAvailable && (
                <TouchableOpacity
                  style={styles.biometricButton}
                  onPress={handleBiometricLogin}
                  disabled={loading}
                >
                  <FingerprintIcon size={18} color="#0f172a" />
                  <Text style={styles.biometricButtonText}>Sign In with Face ID / Touch ID</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.switchModeRow}
                onPress={() => setAuthMode('signup')}
              >
                <Text style={styles.switchModeText}>
                  New organization? <Text style={styles.switchModeLink}>Sign up as Management</Text>
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            /* --- REGISTER ORGANIZATION FORM --- */
            <>
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <BuildingIcon size={14} color="#64748b" />
                  <Text style={styles.label}>Company / Organization Name</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Apex Corporation"
                  placeholderTextColor="#94a3b8"
                  value={companyName}
                  onChangeText={setCompanyName}
                />
              </View>

              <View style={[styles.inputGroup, { marginTop: 14 }]}>
                <View style={styles.labelRow}>
                  <UserIcon size={14} color="#64748b" />
                  <Text style={styles.label}>Administrator Full Name</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Umer Farooq"
                  placeholderTextColor="#94a3b8"
                  value={adminName}
                  onChangeText={setAdminName}
                />
              </View>

              <View style={[styles.inputGroup, { marginTop: 14 }]}>
                <View style={styles.labelRow}>
                  <MailIcon size={14} color="#64748b" />
                  <Text style={styles.label}>Administrator Work Email</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="admin@company.com"
                  placeholderTextColor="#94a3b8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={adminEmail}
                  onChangeText={setAdminEmail}
                />
              </View>

              <View style={[styles.inputGroup, { marginTop: 14 }]}>
                <View style={styles.labelRow}>
                  <KeyIcon size={14} color="#64748b" />
                  <Text style={styles.label}>Admin Password</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Create master password"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry
                  value={adminPassword}
                  onChangeText={setAdminPassword}
                />
              </View>

              <View style={[styles.inputGroup, { marginTop: 14 }]}>
                <View style={styles.labelRow}>
                  <BuildingIcon size={14} color="#64748b" />
                  <Text style={styles.label}>Office Name (Optional)</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Headquarters"
                  placeholderTextColor="#94a3b8"
                  value={officeName}
                  onChangeText={setOfficeName}
                />
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, loading && styles.buttonDisabled]}
                onPress={handleTenantSignup}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Register Organization</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.switchModeRow}
                onPress={() => setAuthMode('signin')}
              >
                <Text style={styles.switchModeText}>
                  Already have an account? <Text style={styles.switchModeLink}>Sign In</Text>
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {deviceInfo && (
          <View style={styles.deviceCard}>
            <Text style={styles.deviceTitle}>HARDWARE SECURITY BINDING</Text>
            <Text style={styles.deviceText}>Model: {deviceInfo.device_model} ({deviceInfo.os_name} {deviceInfo.os_version})</Text>
            <Text style={styles.deviceIdText}>Device ID: {deviceInfo.device_id}</Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 24,
    paddingTop: 48,
    paddingBottom: 48,
    justifyContent: 'center',
    minHeight: '100%',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  brandLogo: {
    width: 68,
    height: 68,
    borderRadius: 16,
    marginBottom: 14,
  },
  logoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    marginBottom: 14,
  },
  logoBadgeText: {
    color: '#1e3a8a',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 6,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  tabButtonTextActive: {
    color: '#0f172a',
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  inputGroup: {
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#0f172a',
    fontSize: 15,
  },
  primaryButton: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 22,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingVertical: 13,
    marginTop: 12,
  },
  biometricButtonText: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '600',
  },
  switchModeRow: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchModeText: {
    fontSize: 13,
    color: '#64748b',
  },
  switchModeLink: {
    color: '#1e3a8a',
    fontWeight: '700',
  },
  deviceCard: {
    marginTop: 24,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  deviceTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  deviceText: {
    fontSize: 12,
    color: '#334155',
  },
  deviceIdText: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});
