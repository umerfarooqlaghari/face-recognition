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
} from 'react-native';
import { loginWithPassword, loginWithBiometrics, checkBiometricsAvailable } from '../services/auth';
import { getDeviceTelemetry } from '../services/device';
import { AuthTokens, DeviceTelemetry } from '../types';
import { ShieldIcon, FingerprintIcon, KeyIcon, MailIcon } from '../components/SvgIcons';

interface LoginScreenProps {
  onLoginSuccess: (tokens: AuthTokens) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      Alert.alert('Required', 'Please enter your email and password');
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
        <View style={styles.headerContainer}>
          <View style={styles.logoBadge}>
            <ShieldIcon size={16} color="#1e3a8a" />
            <Text style={styles.logoBadgeText}>ENTERPRISE PORTAL</Text>
          </View>
          <Text style={styles.title}>Biometric Attendance</Text>
          <Text style={styles.subtitle}>Sign in with your organization credentials</Text>
        </View>

        <View style={styles.card}>
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
    justifyContent: 'center',
    minHeight: '100%',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
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
    marginBottom: 16,
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
