import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, SafeAreaView, StatusBar, Alert, Image } from 'react-native';
import { User, AuthTokens } from './src/types';
import { getStoredUser, clearSession } from './src/services/api';
import LoginScreen from './src/screens/LoginScreen';
import EmployeePortal from './src/screens/EmployeePortal';
import ManagementPortal from './src/screens/ManagementPortal';
import EnrollmentScreen from './src/screens/EnrollmentScreen';
import AttendanceCameraScreen from './src/screens/AttendanceCameraScreen';

import { registerForPushNotificationsAsync } from './src/services/notifications';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePortal, setActivePortal] = useState<'employee' | 'management'>('employee');
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollingTarget, setEnrollingTarget] = useState<{ id: string; name: string } | null>(null);
  const [isScanningAttendance, setIsScanningAttendance] = useState(false);
  const [scanIsRemote, setScanIsRemote] = useState(false);
  const [attendanceKey, setAttendanceKey] = useState(0);

  useEffect(() => {
    registerForPushNotificationsAsync();
    (async () => {
      try {
        const stored = await getStoredUser();
        if (stored) {
          setUser(stored);
          setActivePortal(stored.role === 'admin' || stored.role === 'manager' || stored.role === 'super_admin' ? 'management' : 'employee');
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleLoginSuccess = (tokens: AuthTokens) => {
    setUser(tokens.user);
    setActivePortal(tokens.user.role === 'admin' || tokens.user.role === 'manager' || tokens.user.role === 'super_admin' ? 'management' : 'employee');
  };

  const handleLogout = async () => {
    await clearSession();
    setUser(null);
    setActivePortal('employee');
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Image
          source={require('./assets/image.png')}
          style={styles.splashLogo}
          resizeMode="contain"
        />
        <ActivityIndicator size="small" color="#38bdf8" style={{ marginTop: 24 }} />
      </View>
    );
  }

  if (isEnrolling && user) {
    const targetUserId = enrollingTarget ? enrollingTarget.id : user.id;
    const targetName = enrollingTarget ? enrollingTarget.name : user.full_name;
    return (
      <EnrollmentScreen
        userId={targetUserId}
        targetName={targetName}
        onSuccess={() => {
          setIsEnrolling(false);
          const enrolledName = enrollingTarget?.name;
          setEnrollingTarget(null);
          Alert.alert(
            'Enrollment Complete',
            enrolledName
              ? `Biometric profile for ${enrolledName} registered with 512D ArcFace vector embedding!`
              : 'Your biometric profile is registered with 512D ArcFace vector embedding!'
          );
        }}
        onCancel={() => {
          setIsEnrolling(false);
          setEnrollingTarget(null);
        }}
      />
    );
  }

  if (isScanningAttendance && user) {
    return (
      <AttendanceCameraScreen
        userId={user.id}
        isRemote={scanIsRemote}
        onSuccess={(result) => {
          setIsScanningAttendance(false);
          setAttendanceKey((k) => k + 1);
          Alert.alert(
            'Check-In Successful!',
            `Status: ${result.status?.toUpperCase() || 'PRESENT'}\nMode: ${result.verification_type === 'face_geo' ? 'On-Site (Face + Geofence)' : 'Remote (Face Scan)'}\nArcFace Match: ${((result.similarity_score ?? 0.95) * 100).toFixed(1)}%`
          );
        }}
        onCancel={() => setIsScanningAttendance(false)}
      />
    );
  }

  const isManagerOrAdmin = user && (user.role === 'admin' || user.role === 'manager' || user.role === 'super_admin');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      {!user ? (
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      ) : activePortal === 'management' && isManagerOrAdmin ? (
        <ManagementPortal
          user={user}
          onLogout={handleLogout}
          onSwitchPortal={() => setActivePortal('employee')}
          onEnrollEmployee={(empId, empName) => {
            setEnrollingTarget({ id: empId, name: empName });
            setIsEnrolling(true);
          }}
        />
      ) : (
        <EmployeePortal
          key={attendanceKey}
          user={user}
          onLogout={handleLogout}
          onSwitchPortal={isManagerOrAdmin ? () => setActivePortal('management') : undefined}
          onOpenEnrollment={() => {
            setEnrollingTarget(null);
            setIsEnrolling(true);
          }}
          onOpenAttendanceScan={(remote) => {
            setScanIsRemote(remote);
            setIsScanningAttendance(true);
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  center: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashLogo: {
    width: 100,
    height: 100,
    borderRadius: 22,
  },
});
