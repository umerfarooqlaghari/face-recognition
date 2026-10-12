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
import {
  UserIcon,
  CameraIcon,
  RefreshIcon,
  GlobeIcon,
  LocationPinIcon,
  AlertIcon,
  CheckIcon,
  LogOutIcon,
  ChevronRightIcon,
  ClockIcon,
} from '../components/SvgIcons';

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
      Alert.alert('Checked Out', 'Your check-out time has been recorded successfully.');
      loadAttendanceData();
    } catch (err: any) {
      Alert.alert('Check-Out Failed', err.message);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{user.full_name}</Text>
          <Text style={styles.userCode}>CODE: {user.employee_code}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
          <LogOutIcon size={14} color="#64748b" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Switch to Management if authorized */}
      {user.role !== 'employee' && onSwitchPortal && (
        <TouchableOpacity style={styles.switchButton} onPress={onSwitchPortal}>
          <Text style={styles.switchButtonText}>Management Dashboard</Text>
          <ChevronRightIcon size={14} color="#1e3a8a" />
        </TouchableOpacity>
      )}

      {/* Work Mode Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.modePill}>
            {isRemote ? (
              <GlobeIcon size={14} color="#1e3a8a" />
            ) : (
              <LocationPinIcon size={14} color="#1e3a8a" />
            )}
            <Text style={styles.modePillText}>
              {isRemote ? 'REMOTE WORKER' : 'ON-SITE WORKER'}
            </Text>
          </View>
          {isOverride && (
            <View style={styles.overridePill}>
              <Text style={styles.overridePillText}>Date Override Active</Text>
            </View>
          )}
        </View>

        <Text style={styles.modeDescription}>
          {isRemote
            ? overrideReason
              ? `Override reason: "${overrideReason}". Approved for remote check-in today.`
              : 'Configured for Remote attendance. Geofencing requirement is waived.'
            : `Scheduled for On-Site attendance at ${officeName}. You must be within ${radiusMeters}m to mark attendance.`}
        </Text>

        {/* GPS Geofence Status */}
        <View style={styles.locSection}>
          <View style={styles.locStatusRow}>
            <Text style={styles.locStatusLabel}>GEOFENCE AUDIT STATUS</Text>
            <TouchableOpacity onPress={loadWorkModeAndLocation} disabled={locLoading} style={styles.refreshLocBtn}>
              {locLoading ? (
                <ActivityIndicator size="small" color="#1e3a8a" />
              ) : (
                <View style={styles.inlineRow}>
                  <RefreshIcon size={12} color="#1e3a8a" />
                  <Text style={styles.refreshLocText}>Refresh GPS</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {locError ? (
            <View style={styles.errorBox}>
              <AlertIcon size={16} color="#dc2626" />
              <Text style={styles.errorText}>{locError}</Text>
            </View>
          ) : isRemote ? (
            <View style={styles.statusBoxInfo}>
              <View style={styles.inlineRow}>
                <GlobeIcon size={15} color="#1e40af" />
                <Text style={styles.statusBoxTitle}>Geofence Constraint Waived</Text>
              </View>
              <Text style={styles.statusBoxSubtitle}>
                GPS Coordinates recorded for audit trail: {coords ? `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}` : 'Detecting...'}
              </Text>
            </View>
          ) : isWithinGeofence ? (
            <View style={styles.statusBoxSuccess}>
              <View style={styles.inlineRow}>
                <CheckIcon size={15} color="#059669" />
                <Text style={styles.statusBoxTitleSuccess}>Inside Office Zone ({distanceMeters?.toFixed(0)}m)</Text>
              </View>
              <Text style={styles.statusBoxSubtitleSuccess}>
                Authorized to mark attendance at {officeName}
              </Text>
            </View>
          ) : (
            <View style={styles.statusBoxWarning}>
              <View style={styles.inlineRow}>
                <AlertIcon size={15} color="#b45309" />
                <Text style={styles.statusBoxTitleWarning}>Outside Office Zone ({distanceMeters?.toFixed(0)}m)</Text>
              </View>
              <Text style={styles.statusBoxSubtitleWarning}>
                Move within {radiusMeters}m of {officeName} to verify
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Today Attendance Action Card */}
      <View style={styles.card}>
        <Text style={styles.cardSectionTitle}>TODAY'S VERIFICATION STATUS</Text>

        {todayAttendance?.checked_in ? (
          <View style={styles.checkedInBox}>
            <View style={styles.checkedInRow}>
              <View style={styles.inlineRow}>
                <CheckIcon size={18} color="#059669" />
                <Text style={styles.checkedInText}>Present</Text>
              </View>
              <Text style={styles.checkInTimeText}>
                {new Date(todayAttendance.record?.check_in_time).toLocaleTimeString()}
              </Text>
            </View>

            {!todayAttendance?.checked_out ? (
              <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckOut}>
                <Text style={styles.checkoutButtonText}>Check Out for the Day</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.completedBox}>
                <CheckIcon size={14} color="#059669" />
                <Text style={styles.completedText}>Day Completed (Checked out)</Text>
              </View>
            )}
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.scanButton,
              !isRemote && isWithinGeofence === false && styles.scanButtonDisabled,
            ]}
            onPress={handleFaceScanTrigger}
            disabled={!isRemote && isWithinGeofence === false}
          >
            <CameraIcon size={20} color="#ffffff" />
            <Text style={styles.scanButtonText}>
              {!isRemote && isWithinGeofence === false
                ? `Outside ${radiusMeters}m Zone (${distanceMeters?.toFixed(0)}m)`
                : 'Scan Face to Check In'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Attendance History */}
      <View style={styles.card}>
        <Text style={styles.cardSectionTitle}>ATTENDANCE LOG HISTORY</Text>
        {history.length === 0 ? (
          <Text style={styles.emptyText}>No previous attendance records found.</Text>
        ) : (
          history.slice(0, 5).map((rec: any) => (
            <View key={rec.id} style={styles.historyRow}>
              <View>
                <Text style={styles.historyDate}>{rec.date}</Text>
                <View style={[styles.inlineRow, { marginTop: 2 }]}>
                  {rec.verification_type === 'face_geo' ? (
                    <LocationPinIcon size={12} color="#64748b" />
                  ) : (
                    <GlobeIcon size={12} color="#64748b" />
                  )}
                  <Text style={styles.historyType}>
                    {rec.verification_type === 'face_geo' ? 'Face + Geofence' : 'Face Remote'}
                  </Text>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.historyTime}>
                  {new Date(rec.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
                <Text style={styles.historyScore}>{(rec.similarity_score * 100).toFixed(0)}% match</Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Biometric Reference Enrollment CTA */}
      {onOpenEnrollment && (
        <TouchableOpacity style={styles.enrollmentCTA} onPress={onOpenEnrollment}>
          <UserIcon size={18} color="#0f172a" />
          <Text style={styles.enrollmentCTAText}>Update Face Biometric Reference</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 20,
    paddingTop: 54,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  userCode: {
    fontSize: 11,
    color: '#1e3a8a',
    fontWeight: '700',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  logoutText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  switchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  switchButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e3a8a',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  modePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  modePillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1e3a8a',
    letterSpacing: 0.5,
  },
  overridePill: {
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  overridePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400e',
  },
  modeDescription: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 14,
  },
  locSection: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
  },
  locStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  locStatusLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.8,
  },
  refreshLocBtn: {
    padding: 4,
  },
  refreshLocText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1e3a8a',
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    padding: 10,
  },
  errorText: {
    fontSize: 12,
    color: '#dc2626',
    flex: 1,
  },
  statusBoxInfo: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 8,
    padding: 12,
  },
  statusBoxTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1e40af',
  },
  statusBoxSubtitle: {
    fontSize: 11,
    color: '#3b82f6',
    marginTop: 4,
  },
  statusBoxSuccess: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: 8,
    padding: 12,
  },
  statusBoxTitleSuccess: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065f46',
  },
  statusBoxSubtitleSuccess: {
    fontSize: 11,
    color: '#059669',
    marginTop: 4,
  },
  statusBoxWarning: {
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 8,
    padding: 12,
  },
  statusBoxTitleWarning: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400e',
  },
  statusBoxSubtitleWarning: {
    fontSize: 11,
    color: '#b45309',
    marginTop: 4,
  },
  cardSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0f172a',
    borderRadius: 10,
    paddingVertical: 14,
  },
  scanButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  scanButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  checkedInBox: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 14,
  },
  checkedInRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkedInText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#059669',
  },
  checkInTimeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  checkoutButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  checkoutButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  completedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
    paddingVertical: 6,
  },
  completedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  emptyText: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    paddingVertical: 12,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  historyDate: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  historyType: {
    fontSize: 11,
    color: '#64748b',
  },
  historyTime: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  historyScore: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
  },
  enrollmentCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 4,
  },
  enrollmentCTAText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
});
