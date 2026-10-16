import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  Platform,
  Image,
} from 'react-native';
import { User } from '../types';
import {
  setWorkModeOverride,
  getManagementEmployees,
  getManagementTenantStats,
  getTenantLeaves,
  reviewLeave,
  resendEmployeeInvite,
  createManagementEmployee,
  updateManagementEmployee,
  deleteManagementEmployee,
  getTenantOffices,
  createTenantOffice,
  deleteTenantOffice,
  LeaveItem,
  OfficeItem,
} from '../services/api';
import { getCurrentGPSLocation } from '../services/location';
import * as Clipboard from 'expo-clipboard';
import {
  GlobeIcon,
  LocationPinIcon,
  CheckIcon,
  AlertIcon,
  ChevronRightIcon,
  LogOutIcon,
  MailIcon,
  ShieldIcon,
  RefreshIcon,
  PlusIcon,
  UserPlusIcon,
  CameraIcon,
  CloseIcon,
  TrashIcon,
  PencilIcon,
  GpsIcon,
  BuildingIcon,
  UserIcon,
  CopyIcon,
} from '../components/SvgIcons';
import { MobileOsmMapPicker } from '../components/MobileOsmMapPicker';

interface ManagementPortalProps {
  user: User;
  onLogout: () => void;
  onSwitchPortal: () => void;
  onEnrollEmployee?: (employeeId: string, employeeName: string) => void;
}

interface EmployeeItem {
  id: string;
  tenant_id: string;
  email: string;
  full_name: string;
  first_name?: string | null;
  last_name?: string | null;
  department?: string | null;
  designation?: string | null;
  phone_number?: string | null;
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
}

export default function ManagementPortal({
  user,
  onLogout,
  onSwitchPortal,
  onEnrollEmployee,
}: ManagementPortalProps) {
  const [activeTab, setActiveTab] = useState<'roster' | 'offices' | 'leaves'>('roster');
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [offices, setOffices] = useState<OfficeItem[]>([]);
  const [pendingLeaves, setPendingLeaves] = useState<LeaveItem[]>([]);
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Enroll Employee Modal State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [department, setDepartment] = useState<string>('Engineering');
  const [designation, setDesignation] = useState<string>('Software Engineer');
  const [employeeCode, setEmployeeCode] = useState<string>('');
  const [defaultWorkMode, setDefaultWorkMode] = useState<'on_site' | 'remote'>('on_site');
  const [employeeRole, setEmployeeRole] = useState<'employee' | 'manager' | 'admin'>('employee');
  const [selectedOfficeId, setSelectedOfficeId] = useState<string>('');
  const [selectedManagerId, setSelectedManagerId] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [createdResult, setCreatedResult] = useState<{
    id: string;
    name: string;
    email: string;
    code: string;
    tempPass: string;
    inviteToken: string;
  } | null>(null);

  // Edit Employee Modal State
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeItem | null>(null);
  const [editFirstName, setEditFirstName] = useState<string>('');
  const [editLastName, setEditLastName] = useState<string>('');
  const [editDepartment, setEditDepartment] = useState<string>('');
  const [editDesignation, setEditDesignation] = useState<string>('');
  const [editPhoneNumber, setEditPhoneNumber] = useState<string>('');
  const [editWorkMode, setEditWorkMode] = useState<'on_site' | 'remote'>('on_site');
  const [editRole, setEditRole] = useState<string>('employee');
  const [editOfficeId, setEditOfficeId] = useState<string>('');
  const [editManagerId, setEditManagerId] = useState<string>('');

  // Office Location Modal State
  const [showOfficeModal, setShowOfficeModal] = useState<boolean>(false);
  const [officeName, setOfficeName] = useState<string>('');
  const [officeAddress, setOfficeAddress] = useState<string>('');
  const [officeRadius, setOfficeRadius] = useState<string>('200');
  const [officeLat, setOfficeLat] = useState<string>('');
  const [officeLng, setOfficeLng] = useState<string>('');
  const [fetchingGps, setFetchingGps] = useState<boolean>(false);
  const [savingOffice, setSavingOffice] = useState<boolean>(false);

  useEffect(() => {
    loadManagementData();
  }, []);

  const loadManagementData = async () => {
    try {
      setLoading(true);
      const [empList, officeList, leaveList, statsData] = await Promise.all([
        getManagementEmployees(),
        getTenantOffices(),
        getTenantLeaves('pending'),
        getManagementTenantStats(),
      ]);

      setEmployees(empList);
      setOffices(officeList);
      setPendingLeaves(leaveList);
      setStats(statsData);
    } catch (err: any) {
      Alert.alert('Load Error', err.message || 'Failed to fetch management data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadManagementData();
  };

  const handleSendInvite = async (emp: EmployeeItem) => {
    try {
      const res = await resendEmployeeInvite(emp.id);
      Alert.alert(
        'Face Scan Invite Generated',
        `48-Hour Face Scan Enrollment Token generated for ${emp.full_name} (${emp.employee_code}).\n\nInvite Token:\n${res.invite_token}`,
        [
          {
            text: 'Copy Token',
            onPress: async () => {
              await Clipboard.setStringAsync(res.invite_token);
              Alert.alert('Copied!', 'Invite token copied to clipboard.');
            },
          },
          { text: 'Done', style: 'cancel' },
        ]
      );
      await loadManagementData();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to generate invite');
    }
  };

  const handleEnrollSubmit = async () => {
    const fName = firstName.trim();
    const lName = lastName.trim();
    const resolvedFullName = (fName && lName ? `${fName} ${lName}` : fullName.trim()) || fName;

    if (!resolvedFullName) {
      Alert.alert('Missing Name', 'Please provide employee first and last name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Invalid Email', 'Please provide a valid employee work email address.');
      return;
    }
    if (defaultWorkMode === 'on_site' && offices.length > 0 && !selectedOfficeId) {
      Alert.alert('Office Required', 'Please assign exactly one office campus for this on-site employee.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await createManagementEmployee({
        fullName: resolvedFullName,
        firstName: fName || undefined,
        lastName: lName || undefined,
        department: department.trim() || 'General',
        designation: designation.trim() || 'Team Member',
        phoneNumber: phoneNumber.trim() || undefined,
        email: email.trim().toLowerCase(),
        employeeCode: employeeCode.trim() || undefined,
        defaultWorkMode,
        role: employeeRole,
        officeId: defaultWorkMode === 'on_site' ? selectedOfficeId || offices[0]?.id : undefined,
        managerId: selectedManagerId || undefined,
      });

      setCreatedResult({
        id: res.user.id,
        name: res.user.full_name,
        email: res.user.email,
        code: res.user.employee_code,
        tempPass: res.auto_generated_password,
        inviteToken: res.invite_token,
      });

      await loadManagementData();
    } catch (err: any) {
      Alert.alert('Enrollment Error', err.message || 'Failed to enroll new employee');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!editingEmployee) return;
    const fName = editFirstName.trim();
    const lName = editLastName.trim();
    const resolvedFullName = fName && lName ? `${fName} ${lName}` : (fName || editingEmployee.full_name);

    if (editWorkMode === 'on_site' && offices.length > 0 && !editOfficeId) {
      Alert.alert('Office Required', 'Please assign an office campus for this on-site employee.');
      return;
    }

    // Protect self from losing super_admin privileges:
    const isSelf = editingEmployee.id === user.id;
    const targetRole = isSelf && user.role === 'super_admin' ? 'super_admin' : editRole;

    try {
      setSubmitting(true);
      await updateManagementEmployee(editingEmployee.id, {
        fullName: resolvedFullName,
        firstName: fName || undefined,
        lastName: lName || undefined,
        department: editDepartment.trim() || undefined,
        designation: editDesignation.trim() || undefined,
        phoneNumber: editPhoneNumber.trim() || undefined,
        role: targetRole,
        defaultWorkMode: editWorkMode,
        officeId: editWorkMode === 'remote' ? null : (editOfficeId ? editOfficeId : null),
        managerId: editManagerId ? editManagerId : null,
      });
      setShowEditModal(false);
      setEditingEmployee(null);
      Alert.alert('Updated', `${resolvedFullName}'s details and assignments have been updated.`);
      await loadManagementData();
    } catch (err: any) {
      Alert.alert('Update Failed', err.message || 'Failed to update employee');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEmployee = (emp: EmployeeItem) => {
    Alert.alert(
      'Remove Employee',
      `Are you sure you want to remove ${emp.full_name} (${emp.employee_code})? This will delete their profile and biometric record.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteManagementEmployee(emp.id);
              Alert.alert('Removed', `${emp.full_name} has been removed.`);
              await loadManagementData();
            } catch (err: any) {
              Alert.alert('Delete Failed', err.message);
            }
          },
        },
      ]
    );
  };

  const handleCapturePhoneGps = async () => {
    try {
      setFetchingGps(true);
      const coords = await getCurrentGPSLocation();
      setOfficeLat(coords.latitude.toFixed(6));
      setOfficeLng(coords.longitude.toFixed(6));
      Alert.alert('GPS Acquired', `Location pinned: Lat ${coords.latitude.toFixed(5)}, Lng ${coords.longitude.toFixed(5)}`);
    } catch (err: any) {
      Alert.alert('GPS Error', err.message || 'Unable to capture location coordinates.');
    } finally {
      setFetchingGps(false);
    }
  };

  const handleSaveOffice = async () => {
    if (!officeName.trim()) {
      Alert.alert('Missing Field', 'Please enter a name for this office/branch.');
      return;
    }
    const lat = parseFloat(officeLat);
    const lng = parseFloat(officeLng);
    if (isNaN(lat) || isNaN(lng)) {
      Alert.alert('Invalid Coordinates', 'Please enter valid latitude and longitude, or tap "Capture My GPS".');
      return;
    }
    const rad = parseInt(officeRadius, 10) || 200;

    try {
      setSavingOffice(true);
      await createTenantOffice({
        name: officeName.trim(),
        address: officeAddress.trim() || undefined,
        latitude: lat,
        longitude: lng,
        radius_meters: rad,
      });
      setShowOfficeModal(false);
      setOfficeName('');
      setOfficeAddress('');
      setOfficeLat('');
      setOfficeLng('');
      Alert.alert('Success', `Office "${officeName}" has been registered.`);
      await loadManagementData();
    } catch (err: any) {
      Alert.alert('Office Error', err.message || 'Failed to create office location');
    } finally {
      setSavingOffice(false);
    }
  };

  const handleDeleteOffice = (off: OfficeItem) => {
    Alert.alert(
      'Remove Office Location',
      `Are you sure you want to remove "${off.name}"? Staff assigned here will fallback to nearest branch.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTenantOffice(off.id);
              Alert.alert('Removed', `Office "${off.name}" deleted.`);
              await loadManagementData();
            } catch (err: any) {
              Alert.alert('Error', err.message);
            }
          },
        },
      ]
    );
  };

  const handleModeAction = (emp: EmployeeItem) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    const todayStr = new Date().toISOString().split('T')[0];

    Alert.alert(
      `Manage Mode: ${emp.full_name}`,
      `Default: ${emp.default_work_mode === 'remote' ? 'Remote' : 'On-Site (200m)'}\n` +
      `${emp.date_override ? `Active Override: ${emp.date_override}` : 'No date override active.'}`,
      [
        {
          text: `Mark Remote Today (${todayStr})`,
          onPress: async () => {
            try {
              await setWorkModeOverride({
                userId: emp.id,
                effectiveDate: todayStr,
                assignedMode: 'remote',
                reason: 'Manager single-day remote override for today',
              });
              Alert.alert('Applied', `${emp.full_name} set as Remote for today.`);
              await loadManagementData();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to set override');
            }
          },
        },
        {
          text: `Mark Remote Tomorrow (${tomorrowStr})`,
          onPress: async () => {
            try {
              await setWorkModeOverride({
                userId: emp.id,
                effectiveDate: tomorrowStr,
                assignedMode: 'remote',
                reason: 'Manager single-day remote override for tomorrow',
              });
              Alert.alert('Scheduled', `${emp.full_name} scheduled as Remote for tomorrow.`);
              await loadManagementData();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to set override');
            }
          },
        },
        {
          text: 'Mark On-Site (Require Geofence)',
          onPress: async () => {
            try {
              await setWorkModeOverride({
                userId: emp.id,
                effectiveDate: todayStr,
                assignedMode: 'on_site',
                reason: 'Manager mandated on-site check-in with 200m geofence',
              });
              Alert.alert('Applied', `${emp.full_name} marked On-Site for today.`);
              await loadManagementData();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to set override');
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleReviewLeaveAction = async (
    leaveId: string,
    decision: 'approved' | 'rejected' | 'bypass',
    empName: string
  ) => {
    try {
      await reviewLeave(leaveId, decision, undefined, decision === 'bypass');
      let msg = '';
      if (decision === 'bypass') {
        msg = `Leave for ${empName} was approved directly (Admin Bypassed Manager Level 1).`;
      } else if (decision === 'approved') {
        msg = `Leave for ${empName} approved!`;
      } else {
        msg = `Leave for ${empName} was rejected.`;
      }
      Alert.alert('Leave Decision', msg);
      await loadManagementData();
    } catch (err: any) {
      Alert.alert('Review Error', err.message || 'Failed to review leave request');
    }
  };

  const isAdmin = user.role === 'admin' || user.role === 'super_admin';
  const totalEmployees = stats?.total_employees ?? employees.length;
  const todayCheckins = stats?.today_checkins ?? 0;
  const onSiteEmployees = stats?.on_site_employees ?? employees.filter(e => e.default_work_mode === 'on_site').length;
  const remoteEmployees = stats?.remote_employees ?? employees.filter(e => e.default_work_mode === 'remote').length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38bdf8" />}
    >
      {/* Sleek Single-Line Executive Header */}
      <View style={styles.sleekHeader}>
        <View style={styles.sleekProfile}>
          <Image
            source={require('../../assets/image.png')}
            style={styles.sleekLogo}
            resizeMode="contain"
          />
          <View style={{ flexShrink: 1 }}>
            <Text style={styles.sleekName} numberOfLines={1}>{user.full_name}</Text>
            <Text style={styles.sleekRole}>
              {user.role.toUpperCase()} • {user.employee_code}
            </Text>
          </View>
        </View>

        <View style={styles.sleekActions}>
          <TouchableOpacity
            style={styles.sleekPortalBtn}
            onPress={onSwitchPortal}
            accessibilityLabel="Switch to Staff View"
          >
            <UserIcon size={12} color="#38bdf8" />
            <Text style={styles.sleekPortalBtnText}>Staff View</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sleekIconBtn}
            onPress={onRefresh}
            accessibilityLabel="Refresh Data"
          >
            <RefreshIcon size={13} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sleekIconBtn, { borderColor: 'rgba(239, 68, 68, 0.3)' }]}
            onPress={onLogout}
            accessibilityLabel="Sign Out"
          >
            <LogOutIcon size={13} color="#f87171" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 2x2 Metrics Grid - Never cramped or wrapping awkwardly */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricNumber}>{totalEmployees}</Text>
          <Text style={styles.metricLabel}>Total Staff</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={[styles.metricNumber, { color: '#10b981' }]}>{todayCheckins}</Text>
          <Text style={styles.metricLabel}>Present Today</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={[styles.metricNumber, { color: '#38bdf8' }]}>{remoteEmployees}</Text>
          <Text style={styles.metricLabel}>Remote Staff</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={[styles.metricNumber, { color: '#f59e0b' }]}>{pendingLeaves.length}</Text>
          <Text style={styles.metricLabel}>Pending Leaves</Text>
        </View>
      </View>

      {/* Segmented Section Navigation */}
      <View style={styles.segmentedTabs}>
        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'roster' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('roster')}
        >
          <UserIcon size={14} color={activeTab === 'roster' ? '#ffffff' : '#94a3b8'} />
          <Text style={[styles.segmentBtnText, activeTab === 'roster' && styles.segmentBtnTextActive]}>
            Staff ({employees.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'offices' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('offices')}
        >
          <BuildingIcon size={14} color={activeTab === 'offices' ? '#ffffff' : '#94a3b8'} />
          <Text style={[styles.segmentBtnText, activeTab === 'offices' && styles.segmentBtnTextActive]}>
            Offices ({offices.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'leaves' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('leaves')}
        >
          <AlertIcon size={14} color={activeTab === 'leaves' ? '#ffffff' : '#94a3b8'} />
          <Text style={[styles.segmentBtnText, activeTab === 'leaves' && styles.segmentBtnTextActive]}>
            Leaves ({pendingLeaves.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* ============================================================== */}
      {/* TAB 1: STAFF ROSTER & ENROLLMENT */}
      {/* ============================================================== */}
      {activeTab === 'roster' && (
        <View style={styles.sectionCard}>
          <View style={styles.singleLineSectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 }}>
              <Text style={styles.singleLineSectionTitle}>Staff Roster</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{employees.length}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.compactPrimaryBtn}
              onPress={() => {
                setCreatedResult(null);
                setFirstName('');
                setLastName('');
                setFullName('');
                setEmail('');
                setPhoneNumber('');
                setDepartment('Engineering');
                setDesignation('Software Engineer');
                setEmployeeCode('');
                setDefaultWorkMode('on_site');
                setEmployeeRole('employee');
                setSelectedOfficeId(offices[0]?.id || '');
                setSelectedManagerId('');
                setShowAddModal(true);
              }}
            >
              <PlusIcon size={11} color="#ffffff" />
              <Text style={styles.compactPrimaryBtnText}>Add Employee</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="small" color="#0284c7" style={{ marginVertical: 24 }} />
          ) : employees.length === 0 ? (
            <Text style={styles.emptyNote}>No employees registered yet.</Text>
          ) : (
            <View style={styles.employeeListCard}>
              {employees.map((emp, index) => (
                <View
                  key={emp.id}
                  style={[
                    styles.empRow,
                    index !== employees.length - 1 && styles.empRowBorder,
                  ]}
                >
                  {/* Avatar Circle */}
                  <View style={styles.empRowAvatar}>
                    <Text style={styles.empRowAvatarText}>
                      {emp.full_name ? emp.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'EM'}
                    </Text>
                  </View>

                  {/* Employee Details Column */}
                  <View style={styles.empRowInfo}>
                    <View style={styles.empRowHeader}>
                      <Text style={styles.empRowName} numberOfLines={1}>
                        {emp.full_name}
                      </Text>
                      <View style={styles.roleTag}>
                        <Text style={styles.roleTagText}>{emp.role.toUpperCase()}</Text>
                      </View>
                      <View style={[styles.enrollPill, emp.face_enrolled ? styles.enrollPillSuccess : styles.enrollPillWarning]}>
                        {emp.face_enrolled ? (
                          <CheckIcon size={9} color="#10b981" />
                        ) : (
                          <AlertIcon size={9} color="#d97706" />
                        )}
                        <Text style={emp.face_enrolled ? styles.enrollTextSuccess : styles.enrollTextWarning}>
                          {emp.face_enrolled ? 'Enrolled' : 'Pending'}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.empRowSub} numberOfLines={1}>
                      {emp.employee_code} • {emp.designation || 'Staff'} ({emp.department || 'General'})
                    </Text>

                    <View style={styles.empRowMetaLine}>
                      <TouchableOpacity
                        style={[
                          styles.compactModeBadge,
                          emp.default_work_mode === 'remote' ? styles.remoteModeBadge : styles.onSiteModeBadge,
                        ]}
                        onPress={() => handleModeAction(emp)}
                      >
                        {emp.default_work_mode === 'remote' ? (
                          <GlobeIcon size={10} color="#0284c7" />
                        ) : (
                          <LocationPinIcon size={10} color="#059669" />
                        )}
                        <Text style={emp.default_work_mode === 'remote' ? styles.remoteModeBadgeText : styles.onSiteModeBadgeText}>
                          {emp.default_work_mode === 'remote' ? 'Remote' : (emp.office_name || 'Assigned Office')}
                        </Text>
                      </TouchableOpacity>

                      {emp.manager_name ? (
                        <Text style={styles.empRowMgrText} numberOfLines={1}>
                          Mgr: {emp.manager_name}
                        </Text>
                      ) : null}

                      {emp.date_override ? (
                        <View style={styles.overridePillCompact}>
                          <Text style={styles.overridePillTextCompact}>[{emp.date_override}]</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>

                  {/* Actions Column */}
                  <View style={styles.empRowActions}>
                    {!emp.face_enrolled && (
                      <TouchableOpacity
                        style={styles.empRowActionBtn}
                        onPress={() => handleSendInvite(emp)}
                        accessibilityLabel="Copy/Send Invite"
                      >
                        <MailIcon size={13} color="#0284c7" />
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={styles.empRowActionBtn}
                      onPress={() => {
                        setEditingEmployee(emp);
                        setEditFirstName(emp.first_name || (emp.full_name ? emp.full_name.split(' ')[0] : ''));
                        setEditLastName(emp.last_name || (emp.full_name ? emp.full_name.split(' ').slice(1).join(' ') : ''));
                        setEditDepartment(emp.department || '');
                        setEditDesignation(emp.designation || '');
                        setEditPhoneNumber(emp.phone_number || '');
                        setEditWorkMode(emp.default_work_mode || 'on_site');
                        setEditRole(emp.role);
                        setEditOfficeId(emp.office_id || (offices[0]?.id || ''));
                        setEditManagerId(emp.manager_id || '');
                        setShowEditModal(true);
                      }}
                      accessibilityLabel="Edit Employee"
                    >
                      <PencilIcon size={13} color="#0284c7" />
                    </TouchableOpacity>

                    {emp.id !== user.id && (
                      <TouchableOpacity
                        style={styles.empRowActionBtn}
                        onPress={() => handleDeleteEmployee(emp)}
                        accessibilityLabel="Delete Employee"
                      >
                        <TrashIcon size={13} color="#ef4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* ============================================================== */}
      {/* TAB 2: OFFICE LOCATIONS & GEOFENCES */}
      {/* ============================================================== */}
      {activeTab === 'offices' && (
        <View style={styles.sectionCard}>
          <View style={styles.singleLineSectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 }}>
              <Text style={styles.singleLineSectionTitle}>Office Campuses</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{offices.length}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.compactPrimaryBtn}
              onPress={() => {
                setOfficeName('');
                setOfficeAddress('');
                setOfficeRadius('200');
                setOfficeLat('');
                setOfficeLng('');
                setShowOfficeModal(true);
              }}
            >
              <PlusIcon size={11} color="#ffffff" />
              <Text style={styles.compactPrimaryBtnText}>Add Campus</Text>
            </TouchableOpacity>
          </View>

          {offices.length === 0 ? (
            <Text style={styles.emptyNote}>
              No office locations created. Tap "Add Office" to set up your company branches.
            </Text>
          ) : (
            offices.map(off => (
              <View key={off.id} style={styles.officeCard}>
                <View style={styles.officeCardHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <BuildingIcon size={18} color="#38bdf8" />
                    <Text style={styles.officeName}>{off.name}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteOffice(off)}
                    style={{ padding: 4 }}
                  >
                    <TrashIcon size={15} color="#ef4444" />
                  </TouchableOpacity>
                </View>

                {off.address ? (
                  <Text style={styles.officeAddress}>{off.address}</Text>
                ) : null}

                <View style={styles.officeMetaRow}>
                  <View style={styles.officeMetaBadge}>
                    <LocationPinIcon size={12} color="#10b981" />
                    <Text style={styles.officeMetaText}>Radius: {off.radius_meters}m</Text>
                  </View>
                  <View style={styles.officeMetaBadge}>
                    <GpsIcon size={12} color="#38bdf8" />
                    <Text style={styles.officeMetaText}>
                      {off.latitude.toFixed(4)}, {off.longitude.toFixed(4)}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      )}

      {/* ============================================================== */}
      {/* TAB 3: LEAVE APPROVALS (MULTI-LEVEL WORKFLOW) */}
      {/* ============================================================== */}
      {activeTab === 'leaves' && (
        <View style={styles.sectionCard}>
          <View style={styles.singleLineSectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 }}>
              <Text style={styles.singleLineSectionTitle}>Leave Requests</Text>
              <View style={[styles.countBadge, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                <Text style={[styles.countBadgeText, { color: '#fbbf24' }]}>{pendingLeaves.length}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.compactGhostBtn} onPress={onRefresh}>
              <RefreshIcon size={11} color="#94a3b8" />
              <Text style={styles.compactGhostBtnText}>Refresh</Text>
            </TouchableOpacity>
          </View>

          {pendingLeaves.length === 0 ? (
            <Text style={styles.emptyNote}>No pending leave requests at this time.</Text>
          ) : (
            pendingLeaves.map(lv => {
              const isLevel1 = lv.status === 'pending_manager';
              const isLevel2 = lv.status === 'pending_admin' || lv.status === 'pending';

              return (
                <View key={lv.id} style={styles.leaveCard}>
                  <View style={styles.leaveCardHeader}>
                    <View>
                      <Text style={styles.leaveEmployeeName}>{lv.employee_name || 'Staff'}</Text>
                      <Text style={styles.leaveDates}>
                        {lv.start_date} to {lv.end_date}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.leaveStatusPill,
                        isLevel1 ? styles.leavePillAmber : styles.leavePillCyan,
                      ]}
                    >
                      <Text
                        style={[
                          styles.leaveStatusPillText,
                          isLevel1 ? styles.leavePillTextAmber : styles.leavePillTextCyan,
                        ]}
                      >
                        {isLevel1 ? 'Level 1: Manager' : 'Level 2: Admin/HR'}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.leaveReasonText}>"{lv.reason}"</Text>

                  {lv.manager_name && (
                    <Text style={styles.leaveManagerMeta}>
                      Direct Manager: {lv.manager_name}
                      {lv.level1_approver_name ? ` (L1 Approved by ${lv.level1_approver_name})` : ''}
                    </Text>
                  )}

                  {/* Multi-Level Decision Buttons */}
                  <View style={styles.leaveActionsRow}>
                    {/* Level 1 Approval (Direct Manager or Manager) */}
                    {isLevel1 && (
                      <TouchableOpacity
                        style={[styles.leaveBtn, styles.leaveApproveBtn]}
                        onPress={() => handleReviewLeaveAction(lv.id, 'approved', lv.employee_name || 'Staff')}
                      >
                        <Text style={styles.leaveBtnTextApprove}>Approve (Level 1)</Text>
                      </TouchableOpacity>
                    )}

                    {/* Level 2 Final Approval */}
                    {isLevel2 && isAdmin && (
                      <TouchableOpacity
                        style={[styles.leaveBtn, styles.leaveApproveBtn]}
                        onPress={() => handleReviewLeaveAction(lv.id, 'approved', lv.employee_name || 'Staff')}
                      >
                        <Text style={styles.leaveBtnTextApprove}>Final Approve (L2)</Text>
                      </TouchableOpacity>
                    )}

                    {/* Admin Bypass Button for Level 1 */}
                    {isLevel1 && isAdmin && (
                      <TouchableOpacity
                        style={[styles.leaveBtn, styles.leaveBypassBtn]}
                        onPress={() => handleReviewLeaveAction(lv.id, 'bypass', lv.employee_name || 'Staff')}
                      >
                        <Text style={styles.leaveBtnTextBypass}>Admin Bypass</Text>
                      </TouchableOpacity>
                    )}

                    {/* Reject Button */}
                    <TouchableOpacity
                      style={[styles.leaveBtn, styles.leaveRejectBtn]}
                      onPress={() => handleReviewLeaveAction(lv.id, 'rejected', lv.employee_name || 'Staff')}
                    >
                      <Text style={styles.leaveBtnTextReject}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>
      )}

      {/* Sign Out Button */}
      <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
        <LogOutIcon size={16} color="#ef4444" />
        <Text style={styles.logoutBtnText}>Sign Out from Management</Text>
      </TouchableOpacity>

      {/* ============================================================== */}
      {/* MODAL: ENROLL NEW EMPLOYEE */}
      {/* ============================================================== */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowAddModal(false);
          setCreatedResult(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <UserPlusIcon size={20} color="#38bdf8" />
                <Text style={styles.modalTitle}>
                  {createdResult ? 'Staff Registered' : 'Enroll Employee'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setShowAddModal(false);
                  setCreatedResult(null);
                }}
                style={styles.modalCloseBtn}
              >
                <CloseIcon size={18} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 520 }} showsVerticalScrollIndicator={false}>
              {createdResult ? (
                <View style={styles.modalBodyGap}>
                  <View style={styles.successBadge}>
                    <CheckIcon size={16} color="#059669" />
                    <Text style={styles.successBadgeText}>Staff Enrolled & Invite Ready</Text>
                  </View>

                  <Text style={styles.successDesc}>
                    An invite token has been generated for {createdResult.name}. Copy and share this token so they can log in and onboard their mobile device.
                  </Text>

                  <View style={styles.tokenBox}>
                    <Text style={styles.tokenBoxLabel}>Enrollment Token</Text>
                    <Text style={styles.tokenMonoText} numberOfLines={2} selectable>
                      {createdResult.inviteToken}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.copyActionBtn}
                    onPress={async () => {
                      await Clipboard.setStringAsync(createdResult.inviteToken);
                      Alert.alert('Copied!', 'Invite token copied to clipboard.');
                    }}
                  >
                    <CopyIcon size={16} color="#ffffff" />
                    <Text style={styles.copyActionBtnText}>Copy to Clipboard</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalSecondaryBtn}
                    onPress={() => {
                      setShowAddModal(false);
                      setCreatedResult(null);
                    }}
                  >
                    <Text style={styles.modalSecondaryBtnText}>Done</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.modalBodyGap}>
                  <View style={styles.twoColRow}>
                    <View style={styles.colInput}>
                      <Text style={styles.fieldLabel}>First Name *</Text>
                      <TextInput
                        style={styles.darkInput}
                        placeholder="e.g. Alex"
                        placeholderTextColor="#64748b"
                        value={firstName}
                        onChangeText={setFirstName}
                      />
                    </View>
                    <View style={styles.colInput}>
                      <Text style={styles.fieldLabel}>Last Name *</Text>
                      <TextInput
                        style={styles.darkInput}
                        placeholder="e.g. Morgan"
                        placeholderTextColor="#64748b"
                        value={lastName}
                        onChangeText={setLastName}
                      />
                    </View>
                  </View>

                  <View style={styles.twoColRow}>
                    <View style={styles.colInput}>
                      <Text style={styles.fieldLabel}>Department *</Text>
                      <TextInput
                        style={styles.darkInput}
                        placeholder="e.g. Engineering"
                        placeholderTextColor="#64748b"
                        value={department}
                        onChangeText={setDepartment}
                      />
                    </View>
                    <View style={styles.colInput}>
                      <Text style={styles.fieldLabel}>Designation *</Text>
                      <TextInput
                        style={styles.darkInput}
                        placeholder="e.g. Software Engineer"
                        placeholderTextColor="#64748b"
                        value={designation}
                        onChangeText={setDesignation}
                      />
                    </View>
                  </View>

                  <Text style={styles.fieldLabel}>Work Email *</Text>
                  <TextInput
                    style={styles.darkInput}
                    placeholder="e.g. alex@company.com"
                    placeholderTextColor="#64748b"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />

                  <View style={styles.twoColRow}>
                    <View style={styles.colInput}>
                      <Text style={styles.fieldLabel}>Phone Number (Optional)</Text>
                      <TextInput
                        style={styles.darkInput}
                        placeholder="e.g. +1 555 123 4567"
                        placeholderTextColor="#64748b"
                        keyboardType="phone-pad"
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                      />
                    </View>
                    <View style={styles.colInput}>
                      <Text style={styles.fieldLabel}>Employee Code (Optional)</Text>
                      <TextInput
                        style={styles.darkInput}
                        placeholder="Auto EMP-XXX"
                        placeholderTextColor="#64748b"
                        autoCapitalize="characters"
                        value={employeeCode}
                        onChangeText={setEmployeeCode}
                      />
                    </View>
                  </View>

                  <Text style={styles.fieldLabel}>Work Location Mode *</Text>
                  <View style={styles.toggleRow}>
                    <TouchableOpacity
                      style={[styles.toggleBtn, defaultWorkMode === 'on_site' && styles.toggleBtnActive]}
                      onPress={() => {
                        setDefaultWorkMode('on_site');
                        if (!selectedOfficeId && offices.length > 0) {
                          setSelectedOfficeId(offices[0].id);
                        }
                      }}
                    >
                      <LocationPinIcon size={14} color={defaultWorkMode === 'on_site' ? '#ffffff' : '#94a3b8'} />
                      <Text style={[styles.toggleBtnText, defaultWorkMode === 'on_site' && styles.toggleBtnTextActive]}>
                        On-Site Campus
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.toggleBtn, defaultWorkMode === 'remote' && styles.toggleBtnActive]}
                      onPress={() => {
                        setDefaultWorkMode('remote');
                        setSelectedOfficeId('');
                      }}
                    >
                      <GlobeIcon size={14} color={defaultWorkMode === 'remote' ? '#ffffff' : '#94a3b8'} />
                      <Text style={[styles.toggleBtnText, defaultWorkMode === 'remote' && styles.toggleBtnTextActive]}>
                        Remote (WFA)
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Single Location Assignment (When On-Site) or Remote Info */}
                  {defaultWorkMode === 'on_site' ? (
                    <>
                      <Text style={styles.fieldLabel}>Assigned Campus (Single Location) *</Text>
                      {offices.length === 0 ? (
                        <Text style={styles.warningNote}>
                          No office campuses created yet. Please create one in the Campuses tab.
                        </Text>
                      ) : (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 4 }}>
                          <View style={{ flexDirection: 'row', gap: 6 }}>
                            {offices.map(o => (
                              <TouchableOpacity
                                key={o.id}
                                style={[styles.chipBtn, selectedOfficeId === o.id && styles.chipBtnActive]}
                                onPress={() => setSelectedOfficeId(o.id)}
                              >
                                <Text style={[styles.chipBtnText, selectedOfficeId === o.id && styles.chipBtnTextActive]}>
                                  {o.name}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </ScrollView>
                      )}
                    </>
                  ) : (
                    <View style={styles.infoBox}>
                      <GlobeIcon size={14} color="#38bdf8" />
                      <Text style={styles.infoBoxText}>
                        Remote Employee: Geofence validation is waived. Staff can check in from anywhere without office radius restrictions.
                      </Text>
                    </View>
                  )}

                  <Text style={styles.fieldLabel}>System Role</Text>
                  <View style={styles.toggleRow}>
                    <TouchableOpacity
                      style={[styles.toggleBtn, employeeRole === 'employee' && styles.toggleBtnActive]}
                      onPress={() => setEmployeeRole('employee')}
                    >
                      <Text style={[styles.toggleBtnText, employeeRole === 'employee' && styles.toggleBtnTextActive]}>
                        Employee
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.toggleBtn, employeeRole === 'manager' && styles.toggleBtnActive]}
                      onPress={() => setEmployeeRole('manager')}
                    >
                      <Text style={[styles.toggleBtnText, employeeRole === 'manager' && styles.toggleBtnTextActive]}>
                        Manager
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Direct Manager Assignment */}
                  <Text style={styles.fieldLabel}>Assign Direct Manager (Level 1 Reviewer)</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 4 }}>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      <TouchableOpacity
                        style={[styles.chipBtn, selectedManagerId === '' && styles.chipBtnActive]}
                        onPress={() => setSelectedManagerId('')}
                      >
                        <Text style={[styles.chipBtnText, selectedManagerId === '' && styles.chipBtnTextActive]}>
                          None (Direct to Admin)
                        </Text>
                      </TouchableOpacity>
                      {employees
                        .filter(e => e.role === 'manager' || e.role === 'admin' || e.role === 'super_admin')
                        .map(m => (
                          <TouchableOpacity
                            key={m.id}
                            style={[styles.chipBtn, selectedManagerId === m.id && styles.chipBtnActive]}
                            onPress={() => setSelectedManagerId(m.id)}
                          >
                            <Text style={[styles.chipBtnText, selectedManagerId === m.id && styles.chipBtnTextActive]}>
                              {m.full_name}
                            </Text>
                          </TouchableOpacity>
                        ))}
                    </View>
                  </ScrollView>

                  <TouchableOpacity
                    style={[styles.modalPrimaryBtn, submitting && { opacity: 0.6 }]}
                    onPress={handleEnrollSubmit}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Text style={styles.modalPrimaryBtnText}>Register & Generate Invite</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ============================================================== */}
      {/* MODAL: EDIT EMPLOYEE (ASSIGN OFFICE & MANAGER) */}
      {/* ============================================================== */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowEditModal(false);
          setEditingEmployee(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <PencilIcon size={18} color="#38bdf8" />
                <Text style={styles.modalTitle}>
                  Edit: {editingEmployee?.full_name}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setShowEditModal(false);
                  setEditingEmployee(null);
                }}
                style={styles.modalCloseBtn}
              >
                <CloseIcon size={18} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 480 }} showsVerticalScrollIndicator={false}>
              <View style={styles.modalBodyGap}>
                <View style={styles.twoColRow}>
                  <View style={styles.colInput}>
                    <Text style={styles.fieldLabel}>First Name *</Text>
                    <TextInput
                      style={styles.darkInput}
                      placeholder="e.g. Alex"
                      placeholderTextColor="#64748b"
                      value={editFirstName}
                      onChangeText={setEditFirstName}
                    />
                  </View>
                  <View style={styles.colInput}>
                    <Text style={styles.fieldLabel}>Last Name *</Text>
                    <TextInput
                      style={styles.darkInput}
                      placeholder="e.g. Morgan"
                      placeholderTextColor="#64748b"
                      value={editLastName}
                      onChangeText={setEditLastName}
                    />
                  </View>
                </View>

                <View style={styles.twoColRow}>
                  <View style={styles.colInput}>
                    <Text style={styles.fieldLabel}>Department</Text>
                    <TextInput
                      style={styles.darkInput}
                      placeholder="e.g. Engineering"
                      placeholderTextColor="#64748b"
                      value={editDepartment}
                      onChangeText={setEditDepartment}
                    />
                  </View>
                  <View style={styles.colInput}>
                    <Text style={styles.fieldLabel}>Designation</Text>
                    <TextInput
                      style={styles.darkInput}
                      placeholder="e.g. Senior Lead"
                      placeholderTextColor="#64748b"
                      value={editDesignation}
                      onChangeText={setEditDesignation}
                    />
                  </View>
                </View>

                <Text style={styles.fieldLabel}>Phone Number</Text>
                <TextInput
                  style={styles.darkInput}
                  placeholder="e.g. +1 555 123 4567"
                  placeholderTextColor="#64748b"
                  keyboardType="phone-pad"
                  value={editPhoneNumber}
                  onChangeText={setEditPhoneNumber}
                />

                <Text style={styles.fieldLabel}>Role</Text>
                {editingEmployee?.id === user.id && user.role === 'super_admin' ? (
                  <View style={styles.protectedRoleBox}>
                    <ShieldIcon size={14} color="#38bdf8" />
                    <Text style={styles.protectedRoleText}>Super Admin (Self - Protected)</Text>
                  </View>
                ) : (
                  <View style={styles.toggleRow}>
                    <TouchableOpacity
                      style={[styles.toggleBtn, editRole === 'employee' && styles.toggleBtnActive]}
                      onPress={() => setEditRole('employee')}
                    >
                      <Text style={[styles.toggleBtnText, editRole === 'employee' && styles.toggleBtnTextActive]}>
                        Employee
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.toggleBtn, editRole === 'manager' && styles.toggleBtnActive]}
                      onPress={() => setEditRole('manager')}
                    >
                      <Text style={[styles.toggleBtnText, editRole === 'manager' && styles.toggleBtnTextActive]}>
                        Manager
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.toggleBtn, editRole === 'admin' && styles.toggleBtnActive]}
                      onPress={() => setEditRole('admin')}
                    >
                      <Text style={[styles.toggleBtnText, editRole === 'admin' && styles.toggleBtnTextActive]}>
                        Admin
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                <Text style={styles.fieldLabel}>Work Location Mode *</Text>
                <View style={styles.toggleRow}>
                  <TouchableOpacity
                    style={[styles.toggleBtn, editWorkMode === 'on_site' && styles.toggleBtnActive]}
                    onPress={() => {
                      setEditWorkMode('on_site');
                      if (!editOfficeId && offices.length > 0) {
                        setEditOfficeId(offices[0].id);
                      }
                    }}
                  >
                    <LocationPinIcon size={14} color={editWorkMode === 'on_site' ? '#ffffff' : '#94a3b8'} />
                    <Text style={[styles.toggleBtnText, editWorkMode === 'on_site' && styles.toggleBtnTextActive]}>
                      On-Site Campus
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.toggleBtn, editWorkMode === 'remote' && styles.toggleBtnActive]}
                    onPress={() => {
                      setEditWorkMode('remote');
                      setEditOfficeId('');
                    }}
                  >
                    <GlobeIcon size={14} color={editWorkMode === 'remote' ? '#ffffff' : '#94a3b8'} />
                    <Text style={[styles.toggleBtnText, editWorkMode === 'remote' && styles.toggleBtnTextActive]}>
                      Remote (WFA)
                    </Text>
                  </TouchableOpacity>
                </View>

                {editWorkMode === 'on_site' ? (
                  <>
                    <Text style={styles.fieldLabel}>Assigned Campus (Single Location) *</Text>
                    {offices.length === 0 ? (
                      <Text style={styles.warningNote}>No offices configured yet.</Text>
                    ) : (
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={{ flexDirection: 'row', gap: 6 }}>
                          {offices.map(o => (
                            <TouchableOpacity
                              key={o.id}
                              style={[styles.chipBtn, editOfficeId === o.id && styles.chipBtnActive]}
                              onPress={() => setEditOfficeId(o.id)}
                            >
                              <Text style={[styles.chipBtnText, editOfficeId === o.id && styles.chipBtnTextActive]}>
                                {o.name}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </ScrollView>
                    )}
                  </>
                ) : (
                  <View style={styles.infoBox}>
                    <GlobeIcon size={14} color="#38bdf8" />
                    <Text style={styles.infoBoxText}>
                      Remote Employee: Staff is not tied to any physical office and geofence is waived.
                    </Text>
                  </View>
                )}

                <Text style={styles.fieldLabel}>Assign Direct Manager (Level 1 Reviewer)</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <TouchableOpacity
                      style={[styles.chipBtn, editManagerId === '' && styles.chipBtnActive]}
                      onPress={() => setEditManagerId('')}
                    >
                      <Text style={[styles.chipBtnText, editManagerId === '' && styles.chipBtnTextActive]}>
                        None (Direct to Admin)
                      </Text>
                    </TouchableOpacity>
                    {employees
                      .filter(e => e.id !== editingEmployee?.id && (e.role === 'manager' || e.role === 'admin' || e.role === 'super_admin'))
                      .map(m => (
                        <TouchableOpacity
                          key={m.id}
                          style={[styles.chipBtn, editManagerId === m.id && styles.chipBtnActive]}
                          onPress={() => setEditManagerId(m.id)}
                        >
                          <Text style={[styles.chipBtnText, editManagerId === m.id && styles.chipBtnTextActive]}>
                            {m.full_name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                  </View>
                </ScrollView>

                <TouchableOpacity
                  style={[styles.modalPrimaryBtn, submitting && { opacity: 0.6 }]}
                  onPress={handleEditSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.modalPrimaryBtnText}>Save Assignments</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ============================================================== */}
      {/* MODAL: ADD OFFICE LOCATION (MAP PINPOINT & GPS) */}
      {/* ============================================================== */}
      <Modal
        visible={showOfficeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowOfficeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <BuildingIcon size={20} color="#38bdf8" />
                <Text style={styles.modalTitle}>New Office Location</Text>
              </View>
              <TouchableOpacity onPress={() => setShowOfficeModal(false)} style={styles.modalCloseBtn}>
                <CloseIcon size={18} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 520 }} showsVerticalScrollIndicator={false}>
              <View style={styles.modalBodyGap}>
                <Text style={styles.fieldLabel}>Branch / Office Name *</Text>
                <TextInput
                  style={styles.darkInput}
                  placeholder="e.g. Headquarters, Tech Park Branch"
                  placeholderTextColor="#64748b"
                  value={officeName}
                  onChangeText={setOfficeName}
                />

                <Text style={styles.fieldLabel}>Address (Optional)</Text>
                <TextInput
                  style={styles.darkInput}
                  placeholder="e.g. 100 Innovation Blvd, Suite 400"
                  placeholderTextColor="#64748b"
                  value={officeAddress}
                  onChangeText={setOfficeAddress}
                />

                <Text style={styles.fieldLabel}>Geofence Radius (Meters)</Text>
                <TextInput
                  style={styles.darkInput}
                  placeholder="200"
                  placeholderTextColor="#64748b"
                  keyboardType="numeric"
                  value={officeRadius}
                  onChangeText={setOfficeRadius}
                />

                {/* GPS Pinpoint Section */}
                <View style={styles.gpsBannerCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.gpsBannerTitle}>Current GPS Pinpoint</Text>
                    <Text style={styles.gpsBannerSub}>
                      Tap to auto-grab phone coordinates, or tap & drag directly on the OpenStreetMap below.
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.captureGpsBtn, fetchingGps && { opacity: 0.6 }]}
                    onPress={handleCapturePhoneGps}
                    disabled={fetchingGps}
                  >
                    {fetchingGps ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <>
                        <GpsIcon size={14} color="#ffffff" />
                        <Text style={styles.captureGpsBtnText}>Pin GPS</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>

                {/* OpenStreetMap Interactive Pinpoint */}
                <MobileOsmMapPicker
                  lat={parseFloat(officeLat) || 0}
                  lng={parseFloat(officeLng) || 0}
                  radius={parseInt(officeRadius, 10) || 200}
                  onChange={(newLat, newLng) => {
                    setOfficeLat(newLat.toString());
                    setOfficeLng(newLng.toString());
                  }}
                  height={220}
                />

                {/* Manual Lat/Long Inputs */}
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>Latitude *</Text>
                    <TextInput
                      style={styles.darkInput}
                      placeholder="e.g. 37.7749"
                      placeholderTextColor="#64748b"
                      keyboardType="numeric"
                      value={officeLat}
                      onChangeText={setOfficeLat}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>Longitude *</Text>
                    <TextInput
                      style={styles.darkInput}
                      placeholder="e.g. -122.4194"
                      placeholderTextColor="#64748b"
                      keyboardType="numeric"
                      value={officeLng}
                      onChangeText={setOfficeLng}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.modalPrimaryBtn, savingOffice && { opacity: 0.6 }]}
                  onPress={handleSaveOffice}
                  disabled={savingOffice}
                >
                  {savingOffice ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.modalPrimaryBtnText}>Save Office Location</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    paddingTop: Platform.OS === 'ios' ? 20 : 36,
    paddingBottom: 48,
  },
  sleekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
    gap: 8,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sleekProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1,
  },
  sleekLogo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sleekName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  sleekRole: {
    fontSize: 10,
    color: '#0284c7',
    fontWeight: '600',
    marginTop: 1,
  },
  sleekActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  sleekPortalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  sleekPortalBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0284c7',
  },
  sleekIconBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  singleLineSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  singleLineSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  countBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0284c7',
  },
  compactPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0284c7',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 7,
  },
  compactPrimaryBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
  },
  compactGhostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 7,
  },
  compactGhostBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  empCardMeta: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 10,
  },
  colInput: {
    flex: 1,
  },
  protectedRoleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  protectedRoleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284c7',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 10,
    padding: 10,
    marginVertical: 4,
  },
  infoBoxText: {
    fontSize: 11,
    color: '#1e40af',
    flex: 1,
    lineHeight: 16,
  },
  warningNote: {
    fontSize: 12,
    color: '#b45309',
    marginVertical: 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  metricCard: {
    width: '48.5%',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 14,
    justifyContent: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  metricNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  segmentedTabs: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    gap: 4,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  segmentBtnActive: {
    backgroundColor: '#0284c7',
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  segmentBtnTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  emptyNote: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginVertical: 20,
  },
  employeeCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  employeeListCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  empRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 10,
    backgroundColor: '#ffffff',
  },
  empRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  empRowAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  empRowAvatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0284c7',
  },
  empRowInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  empRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  empRowName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    maxWidth: 140,
  },
  empRowSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  empRowMetaLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
    flexWrap: 'wrap',
  },
  compactModeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  onSiteModeBadge: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  onSiteModeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#059669',
  },
  remoteModeBadge: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  remoteModeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#0284c7',
  },
  empRowMgrText: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '500',
  },
  overridePillCompact: {
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e9d5ff',
  },
  overridePillTextCompact: {
    fontSize: 9,
    fontWeight: '700',
    color: '#7e22ce',
  },
  empRowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  empRowActionBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  empCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  empAvatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  empAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0284c7',
  },
  empCardName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  empCardSub: {
    fontSize: 11,
    color: '#0284c7',
    fontWeight: '600',
    marginTop: 1,
  },
  roleTag: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#dbeafe',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  roleTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#0284c7',
  },
  enrollPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  enrollPillSuccess: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  enrollPillWarning: {
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  enrollTextSuccess: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  enrollTextWarning: {
    fontSize: 10,
    fontWeight: '700',
    color: '#d97706',
  },
  assignmentsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  assignmentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  assignmentBadgeText: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '500',
  },
  modeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
  onSiteModeButton: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  remoteModeButton: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  modeButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0f172a',
  },
  overridePill: {
    backgroundColor: '#f3e8ff',
    borderWidth: 1,
    borderColor: '#e9d5ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  overridePillText: {
    fontSize: 10,
    color: '#7e22ce',
    fontWeight: '700',
  },
  empActionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 8,
  },
  empPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0284c7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  empPrimaryBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  empSecondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  empSecondaryBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  empIconActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  officeCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  officeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  officeName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  officeAddress: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 8,
  },
  officeMetaRow: {
    flexDirection: 'row',
    gap: 8,
  },
  officeMetaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  officeMetaText: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '600',
  },
  leaveCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  leaveCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  leaveEmployeeName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  leaveDates: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  leaveStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  leavePillAmber: {
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  leavePillCyan: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  leaveStatusPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  leavePillTextAmber: {
    color: '#d97706',
  },
  leavePillTextCyan: {
    color: '#0284c7',
  },
  leaveReasonText: {
    fontSize: 12,
    color: '#334155',
    fontStyle: 'italic',
    marginVertical: 4,
  },
  leaveManagerMeta: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
    marginBottom: 8,
  },
  leaveActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  leaveBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaveApproveBtn: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#10b981',
  },
  leaveBtnTextApprove: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  leaveBypassBtn: {
    backgroundColor: '#f3e8ff',
    borderWidth: 1,
    borderColor: '#c084fc',
  },
  leaveBtnTextBypass: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7e22ce',
  },
  leaveRejectBtn: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  leaveBtnTextReject: {
    fontSize: 11,
    fontWeight: '700',
    color: '#dc2626',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  logoutBtnText: {
    color: '#ef4444',
    fontWeight: '700',
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalBodyGap: {
    gap: 12,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  darkInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0f172a',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
  },
  toggleBtnActive: {
    backgroundColor: '#0284c7',
    borderColor: '#0284c7',
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  toggleBtnTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  chipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  chipBtnActive: {
    backgroundColor: '#0284c7',
    borderColor: '#0284c7',
  },
  chipBtnText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  chipBtnTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  gpsBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 10,
    padding: 12,
    gap: 10,
  },
  gpsBannerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0369a1',
  },
  gpsBannerSub: {
    fontSize: 10,
    color: '#1e40af',
    marginTop: 2,
  },
  captureGpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0284c7',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  captureGpsBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  modalPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0284c7',
    borderRadius: 10,
    paddingVertical: 13,
    marginTop: 8,
  },
  modalPrimaryBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  modalSecondaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
  },
  modalSecondaryBtnText: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '600',
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  successBadgeText: {
    color: '#059669',
    fontWeight: '700',
    fontSize: 12,
  },
  successDesc: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  tokenBox: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    padding: 12,
    gap: 6,
    marginVertical: 4,
  },
  tokenBoxLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tokenMonoText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#0284c7',
    fontSize: 13,
    fontWeight: '700',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
  },
  copyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0284c7',
    borderRadius: 10,
    paddingVertical: 13,
    marginTop: 4,
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  copyActionBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});
