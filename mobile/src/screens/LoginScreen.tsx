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
      Alert.alert('Login Failed', err.message || 'Invalid credentials');
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoBadgeText}>⚡ ATTEND</Text>
          </View>
          <Text style={styles.title}>Biometric Attendance</Text>
          <Text style={styles.subtitle}>Sign in to your Employee or Management portal</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Work Email</Text>
          <TextInput
            style={styles.input}
            placeholder="john.doe@company.com"
            placeholderTextColor="#94a3b8"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={[styles.label, { marginTop: 16 }]}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••••••"
            placeholderTextColor="#94a3b8"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handlePasswordLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.primaryButtonText}>Sign In with Password</Text>
            )}
          </TouchableOpacity>

          {biometricAvailable && (
            <TouchableOpacity
              style={styles.biometricButton}
              onPress={handleBiometricLogin}
              disabled={loading}
            >
              <Text style={styles.biometricButtonText}>Touch ID / Face ID / Thumb</Text>
            </TouchableOpacity>
          )}
        </View>

        {deviceInfo && (
          <View style={styles.deviceCard}>
            <Text style={styles.deviceTitle}>BOUND DEVICE HARDWARE</Text>
            <Text style={styles.deviceText}>Model: {deviceInfo.device_model} ({deviceInfo.os_name} {deviceInfo.os_version})</Text>
            <Text style={styles.deviceIdText}>ID: {deviceInfo.device_id}</Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
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
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 12,
  },
  logoBadgeText: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#f8fafc',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 6,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#131b2e',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1e293b',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#cbd5e1',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#0b1120',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#f8fafc',
    fontSize: 15,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
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
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#38bdf8',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 12,
  },
  biometricButtonText: {
    color: '#38bdf8',
    fontSize: 14,
    fontWeight: '700',
  },
  deviceCard: {
    marginTop: 24,
    backgroundColor: '#0d1526',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  deviceTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  deviceText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  deviceIdText: {
    fontSize: 10,
    color: '#475569',
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});
