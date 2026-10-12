import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { User } from '../types';
import { getCurrentGPSLocation, LocationCoordinates } from '../services/location';
import {
  getWorkModeStatus,
  validateGeofence,
  getTodayAttendance,
  getAttendanceHistory,
  markAttendanceCheckOut,
} from '../services/api';

interface EmployeePortalProps {
  user: User;
  onLogout: () => void;
  onSwitchPortal?: () => void;
  onOpenEnrollment?: () => void;
  onOpenAttendanceScan?: (isRemote: boolean) => void;
}

export default function EmployeePortal({
  user,
  onLogout,
  onSwitchPortal,
  onOpenEnrollment,
  onOpenAttendanceScan,
}: EmployeePortalProps) {
  const [effectiveMode, setEffectiveMode] = useState<'on_site' | 'remote'>(user.default_work_mode);
  const [isOverride, setIsOverride] = useState(false);
  const [overrideReason, setOverrideReason] = useState<string | null>(null);
  const [officeName, setOfficeName] = useState<string>('Assigned Office');
  const [radiusMeters, setRadiusMeters] = useState<number>(200);

  const [coords, setCoords] = useState<LocationCoordinates | null>(null);
  const [distanceMeters, setDistanceMeters] = useState<number | null>(null);
  const [isWithinGeofence, setIsWithinGeofence] = useState<boolean | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);

  const [todayAttendance, setTodayAttendance] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    loadWorkModeAndLocation();
    loadAttendanceData();
  }, []);

  const loadAttendanceData = async () => {
    try {
      const [todayData, histData] = await Promise.all([
        getTodayAttendance(user.id),
        getAttendanceHistory(user.id),
      ]);
      setTodayAttendance(todayData);
      setHistory(histData);
    } catch {
      // Ignored if offline
    }
  };

  const loadWorkModeAndLocation = async () => {
    try {
      setLocLoading(true);
      setLocError(null);

      try {
        const modeStatus = await getWorkModeStatus(user.id);
        setEffectiveMode(modeStatus.effective_work_mode);
        setIsOverride(modeStatus.is_override);
        setOverrideReason(modeStatus.override_reason || null);
        if (modeStatus.office) {
          setOfficeName(modeStatus.office.name);
          setRadiusMeters(modeStatus.office.radius_meters);
        }
      } catch {
        setEffectiveMode(user.default_work_mode);
      }

      const currentLoc = await getCurrentGPSLocation();
      setCoords(currentLoc);

      const validation = await validateGeofence({
        userId: user.id,
        latitude: currentLoc.latitude,
        longitude: currentLoc.longitude,
        isMocked: currentLoc.isMocked,
      });

      setIsWithinGeofence(validation.is_within_geofence);
      setDistanceMeters(validation.distance_meters ?? null);
    } catch (err: any) {
      setLocError(err.message || 'Unable to retrieve location');
    } finally {
      setLocLoading(false);
    }
  };

  const isRemote = effectiveMode === 'remote';

  const handleFaceScanTrigger = () => {
    if (!isRemote && isWithinGeofence === false) {
      Alert.alert(
        'Out of Office Bounds',
        `You are currently ${distanceMeters?.toFixed(0) || 'unknown'}m away from ${officeName}. You must be within the ${radiusMeters}m geofence radius to mark attendance.`,
        [{ text: 'OK' }]
      );
      return;
    }

    if (onOpenAttendanceScan) {
      onOpenAttendanceScan(isRemote);
    }
  };

  const handleCheckOut = async () => {
    try {
      await markAttendanceCheckOut();
      Alert.alert('Checked Out', 'Your check-out timestamp has been logged.');
      await loadAttendanceData();
    } catch (err: any) {
      Alert.alert('Check-Out Error', err.message);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.name}>{user.full_name}</Text>
          <Text style={styles.code}>{user.employee_code} • {user.email}</Text>
        </View>

        {onSwitchPortal && (
          <TouchableOpacity style={styles.switchButton} onPress={onSwitchPortal}>
            <Text style={styles.switchButtonText}>Manager View ➔</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Work Mode Card with Override Notice */}
      <View style={[styles.card, styles.modeCard]}>
        <View style={styles.badgeRow}>
          <View style={[styles.badge, isRemote ? styles.remoteBadge : styles.onSiteBadge]}>
            <Text style={[styles.badgeText, isRemote ? styles.remoteBadgeText : styles.onSiteBadgeText]}>
              {isRemote ? '🌐 REMOTE WORKER' : '📍 ON-SITE WORKER'}
            </Text>
          </View>
          {isOverride && (
            <View style={styles.overridePill}>
              <Text style={styles.overridePillText}>★ Date Override Active</Text>
            </View>
          )}
        </View>

        <Text style={styles.modeDescription}>
          {isRemote
            ? overrideReason
              ? `Override reason: "${overrideReason}". You are approved to check in remotely today without geofence limits.`
              : 'You are approved for remote attendance today. Face scan verification will mark your check-in from any location.'
            : `You are scheduled for On-Site attendance at ${officeName}. You must be within ${radiusMeters}m of the office to check in.`}
        </Text>
      </View>

      {/* Geofence Live GPS Distance Widget */}
      <View style={styles.card}>
        <View style={styles.widgetHeader}>
          <Text style={styles.cardTitle}>Location & Geofence</Text>
          <TouchableOpacity
            style={styles.refreshLocBtn}
            onPress={loadWorkModeAndLocation}
            disabled={locLoading}
          >
            {locLoading ? (
              <ActivityIndicator size="small" color="#38bdf8" />
            ) : (
              <Text style={styles.refreshLocText}>🔄 Refresh GPS</Text>
            )}
          </TouchableOpacity>
        </View>

        {locError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {locError}</Text>
          </View>
        ) : isRemote ? (
          <View style={[styles.statusBox, styles.remoteBox]}>
            <Text style={styles.statusBoxTitle}>🌐 Geofence Constraint Waived</Text>
            <Text style={styles.statusBoxSubtitle}>
              GPS Coordinates recorded for audit log: {coords ? `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}` : 'Fetching...'}
            </Text>
          </View>
        ) : isWithinGeofence === true ? (
          <View style={[styles.statusBox, styles.successBox]}>
            <Text style={styles.statusBoxTitle}>✓ Inside Office Zone ({distanceMeters?.toFixed(0)}m away)</Text>
            <Text style={styles.statusBoxSubtitle}>
              You are within the {radiusMeters}m geofence of {officeName}. Attendance ready to mark.
            </Text>
          </View>
        ) : isWithinGeofence === false ? (
          <View style={[styles.statusBox, styles.warningBox]}>
            <Text style={styles.statusBoxTitle}>⚠️ Outside Office Zone ({distanceMeters?.toFixed(0)}m away)</Text>
            <Text style={styles.statusBoxSubtitle}>
              Limit is {radiusMeters}m. Please step closer to {officeName} to enable check-in.
            </Text>
          </View>
        ) : (
          <ActivityIndicator size="small" color="#38bdf8" style={{ marginVertical: 12 }} />
        )}
      </View>

      {/* Check In Action Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Today's Attendance</Text>
        <Text style={styles.cardSubtitle}>
          Status:{' '}
          <Text style={todayAttendance?.has_checked_in ? styles.statusPresent : styles.statusPending}>
            {todayAttendance?.has_checked_in
              ? `Present (Checked in at ${new Date(todayAttendance.record?.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`
              : 'Pending Check-In'}
          </Text>
        </Text>

        {!todayAttendance?.has_checked_in ? (
          <TouchableOpacity
            style={[
              styles.scanButton,
              !isRemote && isWithinGeofence === false && styles.scanButtonBlocked
            ]}
            onPress={handleFaceScanTrigger}
          >
            <Text style={styles.scanButtonIcon}>📸</Text>
            <Text style={styles.scanButtonText}>
              {!isRemote && isWithinGeofence === false
                ? `Outside 200m Zone (${distanceMeters?.toFixed(0)}m)`
                : 'Mark Attendance with Face Scan'}
            </Text>
          </TouchableOpacity>
        ) : !todayAttendance?.has_checked_out ? (
          <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckOut}>
            <Text style={styles.checkoutButtonText}>👋 Tap to Check Out</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.completedBox}>
            <Text style={styles.completedText}>✓ Day Completed (Checked out)</Text>
          </View>
        )}

        <Text style={styles.scanHint}>
          Liveness detection enabled. Photos or screen recordings will be rejected.
        </Text>
      </View>

      {/* Attendance History */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recent Activity</Text>
        {history.length === 0 ? (
          <Text style={{ color: '#64748b', fontSize: 13, marginTop: 8 }}>No attendance punches logged yet.</Text>
        ) : (
          history.slice(0, 5).map((rec, i) => (
            <View key={rec.id || i} style={styles.historyItem}>
              <View>
                <Text style={styles.historyDate}>{rec.date}</Text>
                <Text style={styles.historyType}>
                  {rec.verification_type === 'face_geo' ? '📍 Face + Geo (On-Site)' : '🌐 Face Scan (Remote)'}
                </Text>
              </View>
              <Text style={styles.historyStatus}>
                {new Date(rec.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {rec.status.toUpperCase()}
              </Text>
            </View>
          ))
        )}
      </View>

      {/* Face Reference Profile Status Card */}
      {onOpenEnrollment && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Biometric Face Reference</Text>
          <Text style={styles.cardSubtitle}>
            Your reference scan is encoded into a 512D ArcFace vector stored in Render PostgreSQL with pgvector.
          </Text>
          <TouchableOpacity
            style={[styles.scanButton, { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#38bdf8' }]}
            onPress={onOpenEnrollment}
          >
            <Text style={styles.scanButtonIcon}>👤</Text>
            <Text style={[styles.scanButtonText, { color: '#38bdf8' }]}>Enroll / Update Face Profile</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
        <Text style={styles.logoutButtonText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  content: {
    padding: 20,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600',
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f8fafc',
    marginTop: 2,
  },
  code: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  switchButton: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#38bdf8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  switchButtonText: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#131b2e',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  modeCard: {
    backgroundColor: '#0f172a',
    borderColor: '#334155',
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  onSiteBadge: {
    backgroundColor: '#14532d',
  },
  onSiteBadgeText: {
    color: '#4ade80',
    fontSize: 11,
    fontWeight: '800',
  },
  remoteBadge: {
    backgroundColor: '#1e1b4b',
  },
  remoteBadgeText: {
    color: '#a78bfa',
    fontSize: 11,
    fontWeight: '800',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  overridePill: {
    backgroundColor: '#854d0e',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  overridePillText: {
    color: '#fef08a',
    fontSize: 10,
    fontWeight: '800',
  },
  modeDescription: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 18,
  },
  widgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  refreshLocBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  refreshLocText: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '700',
  },
  statusBox: {
    borderRadius: 12,
    padding: 12,
  },
  successBox: {
    backgroundColor: '#14532d33',
    borderColor: '#15803d',
    borderWidth: 1,
  },
  warningBox: {
    backgroundColor: '#7f1d1d33',
    borderColor: '#b91c1c',
    borderWidth: 1,
  },
  remoteBox: {
    backgroundColor: '#3b076433',
    borderColor: '#7e22ce',
    borderWidth: 1,
  },
  statusBoxTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f8fafc',
  },
  statusBoxSubtitle: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 4,
  },
  errorBox: {
    backgroundColor: '#450a0a',
    borderRadius: 8,
    padding: 10,
  },
  errorText: {
    color: '#f87171',
    fontSize: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 16,
  },
  statusPending: {
    color: '#f59e0b',
    fontWeight: '700',
  },
  statusPresent: {
    color: '#4ade80',
    fontWeight: '700',
  },
  scanButton: {
    backgroundColor: '#2563eb',
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  scanButtonBlocked: {
    backgroundColor: '#475569',
  },
  scanButtonIcon: {
    fontSize: 20,
  },
  scanButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  checkoutButton: {
    backgroundColor: '#ea580c',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  completedBox: {
    backgroundColor: '#14532d',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  completedText: {
    color: '#4ade80',
    fontSize: 14,
    fontWeight: '700',
  },
  scanHint: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 10,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#1e293b',
    marginTop: 6,
  },
  historyDate: {
    color: '#f1f5f9',
    fontSize: 13,
    fontWeight: '600',
  },
  historyType: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 2,
  },
  historyStatus: {
    color: '#4ade80',
    fontSize: 12,
    fontWeight: '700',
  },
  logoutButton: {
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 30,
  },
  logoutButtonText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '700',
  },
});
