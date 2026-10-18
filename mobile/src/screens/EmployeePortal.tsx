import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
  Image,
} from 'react-native';
import { User } from '../types';
import { getCurrentGPSLocation, LocationCoordinates } from '../services/location';
import {
  getWorkModeStatus,
  validateGeofence,
  getTodayAttendance,
  getAttendanceHistory,
  markAttendanceCheckOut,
  applyLeave,
  getMyLeaves,
  deleteMyAccount,
  clearSession,
  LeaveItem,
} from '../services/api';
import {
  UserIcon,
  ShieldIcon,
  CameraIcon,
  GlobeIcon,
  LocationPinIcon,
  AlertIcon,
  CheckIcon,
  MenuIcon,
  CalendarIcon,
  ClockIcon,
  ChevronRightIcon,
} from '../components/SvgIcons';
import LeaveCalendarPicker from '../components/LeaveCalendarPicker';
import HamburgerMenuModal from '../components/HamburgerMenuModal';
import AttendanceCalendarModal from '../components/AttendanceCalendarModal';

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
  const [isWithinGeofence, setIsWithinGeofence] = useState<boolean | null>(null);
  const [locLoading, setLocLoading] = useState(false);

  const [todayAttendance, setTodayAttendance] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  // Navigation & Modals
  const [showHamburger, setShowHamburger] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  // Leave Management State
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const [leavesList, setLeavesList] = useState<LeaveItem[]>([]);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [selectedLeaveDates, setSelectedLeaveDates] = useState<string[]>([tomorrowStr]);
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveSubmitting, setLeaveSubmitting] = useState(false);

  useEffect(() => {
    loadWorkModeAndLocation();
    loadAttendanceData();
  }, []);

  const loadAttendanceData = async () => {
    try {
      const [todayData, histData, myLeaves] = await Promise.all([
        getTodayAttendance(user.id),
        getAttendanceHistory(user.id),
        getMyLeaves(),
      ]);
      setTodayAttendance(todayData);
      setHistory(histData);
      setLeavesList(myLeaves);
    } catch {
      // Offline fallback
    }
  };

  const handleApplyLeave = async () => {
    if (selectedLeaveDates.length === 0) {
      Alert.alert('Dates Required', 'Please select at least one day on the calendar for your leave request.');
      return;
    }
    if (!leaveReason.trim()) {
      Alert.alert('Reason Required', 'Please enter a reason for the leave request.');
      return;
    }
    try {
      setLeaveSubmitting(true);
      const sorted = [...selectedLeaveDates].sort();
      await applyLeave({
        dates: sorted,
        startDate: sorted[0],
        endDate: sorted[sorted.length - 1],
        reason: leaveReason.trim(),
      });

      const datesSummary =
        sorted.length === 1
          ? sorted[0]
          : `${sorted.length} days (${sorted[0]} to ${sorted[sorted.length - 1]})`;

      Alert.alert(
        'Leave Request Submitted',
        `Your request for ${datesSummary} has been submitted for management review.`
      );
      setLeaveReason('');
      setSelectedLeaveDates([tomorrowStr]);
      setShowLeaveForm(false);
      const updated = await getMyLeaves();
      setLeavesList(updated);
    } catch (err: any) {
      Alert.alert('Submission Error', err.message || 'Could not submit leave request');
    } finally {
      setLeaveSubmitting(false);
    }
  };

  const loadWorkModeAndLocation = async () => {
    try {
      setLocLoading(true);

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
    } catch {
      // Handled silently for background geofence check
    } finally {
      setLocLoading(false);
    }
  };

  const isRemote = effectiveMode === 'remote';

  const handleFaceScanTrigger = () => {
    if (!isRemote && isWithinGeofence === false) {
      Alert.alert(
        'Out of Office Bounds',
        `You must be within the authorized office area at ${officeName} to mark attendance.`,
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
      const res = await markAttendanceCheckOut();
      const workedMsg = res.hours_worked != null ? ` Total worked: ${res.hours_worked} hrs.` : '';
      Alert.alert('Checked Out', `Your check-out time has been recorded successfully.${workedMsg}`);
      loadAttendanceData();
    } catch (err: any) {
      Alert.alert('Check-Out Failed', err.message);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account & Biometric Data',
      'Are you sure you want to permanently delete your account? This will erase your personal profile, face biometric reference embedding, and all attendance logs. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Permanently Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMyAccount();
              await clearSession();
              Alert.alert('Account Deleted', 'Your account and biometric data have been permanently removed.');
              onLogout();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete account');
            }
          },
        },
      ]
    );
  };

  // Today Date String
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const hasCheckedIn = todayAttendance?.has_checked_in || todayAttendance?.checked_in;
  const hasCheckedOut = todayAttendance?.checked_out || todayAttendance?.has_checked_out;
  const record = todayAttendance?.record;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Sleek App Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <Image
            source={require('../../assets/image.png')}
            style={styles.portalLogo}
            resizeMode="contain"
          />
          <View style={{ flexShrink: 1 }}>
            <Text style={styles.userName} numberOfLines={1}>{user.full_name}</Text>
            <Text style={styles.userCode}>{user.employee_code} • {isRemote ? 'Remote' : officeName}</Text>
          </View>
        </View>

        <View style={styles.topBarRight}>
          {user.role !== 'employee' && onSwitchPortal && (
            <TouchableOpacity style={styles.switchButton} onPress={onSwitchPortal}>
              <ShieldIcon size={12} color="#0284c7" />
              <Text style={styles.switchButtonText}>Admin</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setShowHamburger(true)}
            accessibilityLabel="Open Menu"
          >
            <MenuIcon size={20} color="#0f172a" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Hero Attendance Action Card */}
      <View style={styles.heroCard}>
        <View style={styles.heroCardHeader}>
          <View>
            <Text style={styles.todayDateText}>{todayFormatted}</Text>
            <View style={styles.workModeRow}>
              {isRemote ? (
                <GlobeIcon size={13} color="#0284c7" />
              ) : (
                <LocationPinIcon size={13} color="#0284c7" />
              )}
              <Text style={styles.workModeText}>
                {isRemote ? 'Remote Attendance' : `On-Site at ${officeName}`}
              </Text>
              {isOverride && (
                <View style={styles.overrideBadge}>
                  <Text style={styles.overrideBadgeText}>Override</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Dynamic Status Section */}
        {todayAttendance?.is_on_leave && !hasCheckedIn ? (
          <View style={styles.leaveBanner}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <CheckIcon size={18} color="#059669" />
              <Text style={styles.leaveBannerTitle}>On Approved Leave Today</Text>
            </View>
            <Text style={styles.leaveBannerSub}>
              {todayAttendance.leave_reason ? `Reason: "${todayAttendance.leave_reason}"` : 'You are exempt from daily check-in.'}
            </Text>
          </View>
        ) : hasCheckedIn ? (
          <View style={styles.activeAttendanceBox}>
            <View style={styles.timeInfoRow}>
              <View style={styles.timeCol}>
                <Text style={styles.timeColLabel}>CHECK-IN</Text>
                <Text style={styles.timeColValue}>
                  {record?.check_in_time
                    ? new Date(record.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : 'Recorded'}
                </Text>
                {record?.is_late && (
                  <View style={styles.latePill}>
                    <Text style={styles.latePillText}>+{record.minutes_late}m late</Text>
                  </View>
                )}
              </View>

              <View style={styles.timeColDivider} />

              <View style={styles.timeCol}>
                <Text style={styles.timeColLabel}>CHECK-OUT</Text>
                <Text style={styles.timeColValue}>
                  {hasCheckedOut && record?.check_out_time
                    ? new Date(record.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : '--:--'}
                </Text>
                {hasCheckedOut && (
                  <View style={styles.completedPill}>
                    <Text style={styles.completedPillText}>Completed</Text>
                  </View>
                )}
              </View>
            </View>

            {hasCheckedOut ? (
              <View style={styles.durationBanner}>
                <ClockIcon size={15} color="#0284c7" />
                <Text style={styles.durationBannerText}>
                  Total Time Worked: <Text style={{ fontWeight: '800' }}>{record?.hours_worked || 0} hours</Text>
                </Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckOut}>
                <Text style={styles.checkoutBtnText}>Check Out for the Day</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.scanSection}>
            <TouchableOpacity
              style={[
                styles.primaryScanBtn,
                !isRemote && isWithinGeofence === false && styles.primaryScanBtnDisabled,
              ]}
              onPress={handleFaceScanTrigger}
              disabled={!isRemote && isWithinGeofence === false}
            >
              <CameraIcon size={20} color="#ffffff" />
              <Text style={styles.primaryScanBtnText}>Scan Face to Check In</Text>
            </TouchableOpacity>

            {!isRemote && isWithinGeofence === false && (
              <View style={styles.outOfBoundsNotice}>
                <AlertIcon size={13} color="#b45309" />
                <Text style={styles.outOfBoundsNoticeText}>
                  Connect from within {officeName} to enable check-in.
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Quick Access Card: Monthly Attendance Calendar */}
      <TouchableOpacity
        style={styles.calendarBannerCard}
        onPress={() => setShowCalendarModal(true)}
        activeOpacity={0.8}
      >
        <View style={styles.calendarBannerLeft}>
          <View style={styles.calendarIconBox}>
            <CalendarIcon size={20} color="#0284c7" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.calendarBannerTitle}>My Attendance Calendar</Text>
            <Text style={styles.calendarBannerSub}>
              View monthly hours, working days, and clock in/out timeline
            </Text>
          </View>
        </View>
        <ChevronRightIcon size={18} color="#94a3b8" />
      </TouchableOpacity>

      {/* Time Off & Leave Requests */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardSectionTitle}>TIME OFF & LEAVES</Text>
          <TouchableOpacity
            style={styles.requestLeaveToggle}
            onPress={() => setShowLeaveForm(!showLeaveForm)}
          >
            <Text style={styles.requestLeaveToggleText}>
              {showLeaveForm ? 'Close' : '+ Request Leave'}
            </Text>
          </TouchableOpacity>
        </View>

        {showLeaveForm && (
          <View style={styles.leaveForm}>
            <Text style={styles.formLabel}>Select Leave Date(s)</Text>
            <LeaveCalendarPicker
              selectedDates={selectedLeaveDates}
              onSelectDates={setSelectedLeaveDates}
            />

            <Text style={styles.formLabel}>Reason for Leave</Text>
            <TextInput
              style={[styles.input, { height: 60, textAlignVertical: 'top' }]}
              value={leaveReason}
              onChangeText={setLeaveReason}
              placeholder="e.g. Medical, personal appointment, travel..."
              placeholderTextColor="#94a3b8"
              multiline
            />

            <TouchableOpacity
              style={[
                styles.submitLeaveBtn,
                (selectedLeaveDates.length === 0 || !leaveReason.trim()) && styles.submitLeaveBtnDisabled,
              ]}
              onPress={handleApplyLeave}
              disabled={leaveSubmitting || selectedLeaveDates.length === 0}
            >
              {leaveSubmitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.submitLeaveBtnText}>
                  {selectedLeaveDates.length === 0
                    ? 'Select Dates on Calendar'
                    : `Submit Request (${selectedLeaveDates.length} ${
                        selectedLeaveDates.length === 1 ? 'Day' : 'Days'
                      })`}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {leavesList.length === 0 ? (
          <Text style={styles.emptyText}>No leave requests submitted yet.</Text>
        ) : (
          leavesList.slice(0, 3).map(lv => (
            <View key={lv.id} style={styles.leaveHistoryRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.leaveDateRange}>
                  {lv.start_date} to {lv.end_date}
                </Text>
                <Text style={styles.leaveReasonText} numberOfLines={1}>
                  {lv.reason}
                </Text>
              </View>
              <View
                style={[
                  styles.leaveStatusPill,
                  lv.status === 'approved'
                    ? styles.pillApproved
                    : lv.status === 'rejected'
                    ? styles.pillRejected
                    : styles.pillPending,
                ]}
              >
                <Text
                  style={[
                    styles.leaveStatusPillText,
                    lv.status === 'approved'
                      ? styles.pillApprovedText
                      : lv.status === 'rejected'
                      ? styles.pillRejectedText
                      : styles.pillPendingText,
                  ]}
                >
                  {lv.status.toUpperCase()}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Recent Attendance Activity (Clean Duration / Times Only - No Coordinates) */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardSectionTitle}>RECENT ATTENDANCE</Text>
          <TouchableOpacity onPress={() => setShowCalendarModal(true)}>
            <Text style={styles.viewAllText}>View Calendar</Text>
          </TouchableOpacity>
        </View>

        {history.length === 0 ? (
          <Text style={styles.emptyText}>No attendance records recorded yet.</Text>
        ) : (
          history.slice(0, 4).map((rec: any) => (
            <View key={rec.id} style={styles.historyRow}>
              <View>
                <Text style={styles.historyDate}>{rec.date}</Text>
                <Text style={styles.historyMode}>
                  {rec.verification_type === 'face_geo' ? 'On-Site' : 'Remote'}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.historyTime}>
                  In: {new Date(rec.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {rec.check_out_time ? ` • Out: ${new Date(rec.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                </Text>
                {rec.hours_worked != null && (
                  <Text style={styles.historyWorked}>{rec.hours_worked} hrs</Text>
                )}
              </View>
            </View>
          ))
        )}
      </View>

      {/* Monthly Attendance Calendar Modal */}
      <AttendanceCalendarModal
        visible={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        userId={user.id}
        employeeName={user.full_name}
        employeeCode={user.employee_code}
      />

      {/* Clean Hamburger Menu Modal (Apple 5.1.1(v) Compliant & Clutter-Free) */}
      <HamburgerMenuModal
        visible={showHamburger}
        onClose={() => setShowHamburger(false)}
        user={user}
        currentPortal="employee"
        onSwitchPortal={onSwitchPortal}
        onOpenCalendar={() => setShowCalendarModal(true)}
        onOpenEnrollment={onOpenEnrollment}
        onLogout={onLogout}
        onDeleteAccount={handleDeleteAccount}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
    paddingTop: 54,
    paddingBottom: 36,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  portalLogo: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  userCode: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  switchButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284c7',
  },
  menuButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  heroCardHeader: {
    marginBottom: 14,
  },
  todayDateText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  workModeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 3,
  },
  workModeText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  overrideBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 4,
  },
  overrideBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#b45309',
  },
  scanSection: {
    marginTop: 4,
  },
  primaryScanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0284c7',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryScanBtnDisabled: {
    backgroundColor: '#94a3b8',
    shadowOpacity: 0,
  },
  primaryScanBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  outOfBoundsNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fffbeb',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  outOfBoundsNoticeText: {
    fontSize: 11,
    color: '#92400e',
    fontWeight: '600',
    flex: 1,
  },
  activeAttendanceBox: {
    marginTop: 4,
  },
  timeInfoRow: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10,
  },
  timeCol: {
    flex: 1,
    alignItems: 'center',
  },
  timeColDivider: {
    width: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 4,
  },
  timeColLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 2,
  },
  timeColValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  latePill: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    marginTop: 4,
  },
  latePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#d97706',
  },
  completedPill: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    marginTop: 4,
  },
  completedPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  checkoutBtn: {
    backgroundColor: '#0f172a',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  durationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#eff6ff',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  durationBannerText: {
    fontSize: 13,
    color: '#1e40af',
  },
  leaveBanner: {
    backgroundColor: '#ecfdf5',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  leaveBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#059669',
  },
  leaveBannerSub: {
    fontSize: 12,
    color: '#065f46',
    marginTop: 2,
  },
  calendarBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  calendarBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 8,
  },
  calendarIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#e0f2fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  calendarBannerSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 0.6,
  },
  requestLeaveToggle: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  requestLeaveToggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284c7',
  },
  viewAllText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284c7',
  },
  leaveForm: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },
  formLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    color: '#0f172a',
    marginBottom: 12,
  },
  submitLeaveBtn: {
    backgroundColor: '#0284c7',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitLeaveBtnDisabled: {
    backgroundColor: '#94a3b8',
  },
  submitLeaveBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
    paddingVertical: 6,
  },
  leaveHistoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
  },
  leaveDateRange: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  leaveReasonText: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  leaveStatusPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pillApproved: { backgroundColor: '#d1fae5' },
  pillRejected: { backgroundColor: '#fee2e2' },
  pillPending: { backgroundColor: '#fef3c7' },
  leaveStatusPillText: { fontSize: 9, fontWeight: '800' },
  pillApprovedText: { color: '#059669' },
  pillRejectedText: { color: '#dc2626' },
  pillPendingText: { color: '#d97706' },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
  },
  historyDate: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  historyMode: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  historyTime: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
  },
  historyWorked: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284c7',
    marginTop: 1,
  },
});
