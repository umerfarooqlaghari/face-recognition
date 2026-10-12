import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { User } from '../types';
import { generateFaceScanInvite, setWorkModeOverride } from '../services/api';
import {
  UsersIcon,
  GlobeIcon,
  LocationPinIcon,
  CheckIcon,
  AlertIcon,
  ChevronRightIcon,
  LogOutIcon,
  MailIcon,
  ShieldIcon,
} from '../components/SvgIcons';

interface ManagementPortalProps {
  user: User;
  onLogout: () => void;
  onSwitchPortal: () => void;
}

interface MockEmployee {
  id: string;
  name: string;
  code: string;
  mode: 'on_site' | 'remote';
  faceEnrolled: boolean;
  dateOverride?: string;
}

export default function ManagementPortal({ user, onLogout, onSwitchPortal }: ManagementPortalProps) {
  const [employees, setEmployees] = useState<MockEmployee[]>([
    { id: '1', name: 'Alex Johnson', code: 'EMP-101', mode: 'on_site', faceEnrolled: true },
    { id: '2', name: 'Sarah Miller', code: 'EMP-102', mode: 'remote', faceEnrolled: true },
    { id: '3', name: 'Michael Chen', code: 'EMP-103', mode: 'on_site', faceEnrolled: false },
    { id: '4', name: 'Jessica Davis', code: 'EMP-104', mode: 'remote', faceEnrolled: true },
  ]);

  const handleSendInvite = async (emp: MockEmployee) => {
    try {
      let inviteUrl = `attendapp://enroll?token=inv_demo_${emp.code.toLowerCase()}`;
      try {
        const res = await generateFaceScanInvite(emp.id);
        inviteUrl = res.invite_url;
      } catch {
        // Fallback for mock demo IDs
      }

      Alert.alert(
        'Face Scan Invite Generated',
        `48-Hour Face Scan Enrollment Token generated for ${emp.name} (${emp.code}).\n\nInvite Token: ${inviteUrl}`,
        [{ text: 'Done' }]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to generate invite');
    }
  };

  const handleModeAction = (emp: MockEmployee) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    Alert.alert(
      `Manage Mode: ${emp.name}`,
      `Current Mode: ${emp.mode === 'remote' ? 'Remote' : 'On-Site (200m)'}`,
      [
        {
          text: `Switch to ${emp.mode === 'on_site' ? 'Remote' : 'On-Site'} (Default)`,
          onPress: () => {
            setEmployees(prev =>
              prev.map(e =>
                e.id === emp.id
                  ? { ...e, mode: e.mode === 'on_site' ? 'remote' : 'on_site' }
                  : e
              )
            );
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
                reason: 'Manager approved single-day remote override',
              });
            } catch {
              // Ignore for mock ID
            }
            setEmployees(prev =>
              prev.map(e =>
                e.id === emp.id
                  ? { ...e, dateOverride: `Remote on ${tomorrowStr}` }
                  : e
              )
            );
            Alert.alert('Scheduled', `${emp.name} scheduled as Remote for ${tomorrowStr}.`);
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <View style={styles.roleBadge}>
            <ShieldIcon size={12} color="#1e3a8a" />
            <Text style={styles.roleBadgeText}>MANAGEMENT PORTAL</Text>
          </View>
          <Text style={styles.name}>{user.full_name}</Text>
          <Text style={styles.roleDetail}>Role: {user.role.toUpperCase()}</Text>
        </View>

        <TouchableOpacity style={styles.switchButton} onPress={onSwitchPortal}>
          <Text style={styles.switchButtonText}>Employee View</Text>
          <ChevronRightIcon size={14} color="#1e3a8a" />
        </TouchableOpacity>
      </View>

      {/* Metrics Row */}
      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>42</Text>
          <Text style={styles.metricLabel}>Total Staff</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={[styles.metricValue, { color: '#059669' }]}>38</Text>
          <Text style={styles.metricLabel}>Present</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={[styles.metricValue, { color: '#1e3a8a' }]}>9</Text>
          <Text style={styles.metricLabel}>Remote</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={[styles.metricValue, { color: '#d97706' }]}>2</Text>
          <Text style={styles.metricLabel}>Leaves</Text>
        </View>
      </View>

      {/* Employee Management Section */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>Employee Roster & Work Modes</Text>
          <Text style={styles.countText}>{employees.length} Members</Text>
        </View>

        {employees.map(emp => (
          <View key={emp.id} style={styles.empRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.empName}>{emp.name}</Text>
              <Text style={styles.empCode}>{emp.code}</Text>
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                <TouchableOpacity
                  style={[styles.modeToggle, emp.mode === 'remote' ? styles.remoteToggle : styles.onSiteToggle]}
                  onPress={() => handleModeAction(emp)}
                >
                  {emp.mode === 'remote' ? (
                    <GlobeIcon size={12} color="#1e3a8a" />
                  ) : (
                    <LocationPinIcon size={12} color="#1e3a8a" />
                  )}
                  <Text style={styles.modeToggleText}>
                    {emp.mode === 'remote' ? 'Remote' : 'On-Site (200m)'}
                  </Text>
                </TouchableOpacity>

                {emp.dateOverride && (
                  <View style={styles.overrideBadge}>
                    <Text style={styles.overrideBadgeText}>{emp.dateOverride}</Text>
                  </View>
                )}

                {!emp.faceEnrolled && (
                  <TouchableOpacity
                    style={styles.inviteButton}
                    onPress={() => handleSendInvite(emp)}
                  >
                    <MailIcon size={11} color="#1e3a8a" />
                    <Text style={styles.inviteButtonText}>Send Face Invite</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
              <View style={[styles.statusIndicator, emp.faceEnrolled ? styles.enrolled : styles.pendingEnroll]}>
                {emp.faceEnrolled ? (
                  <CheckIcon size={12} color="#059669" />
                ) : (
                  <AlertIcon size={12} color="#d97706" />
                )}
                <Text style={emp.faceEnrolled ? styles.enrolledText : styles.pendingEnrollText}>
                  {emp.faceEnrolled ? 'Face Enrolled' : 'Pending'}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Pending Leaves Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Pending Leave Approvals</Text>
        <View style={styles.leaveRow}>
          <View>
            <Text style={styles.leaveName}>Michael Chen</Text>
            <Text style={styles.leaveDates}>Oct 15 - Oct 17 • Sick Leave</Text>
          </View>
          <View style={styles.leaveActions}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.approveBtn]}
              onPress={() => Alert.alert('Approved', 'Leave approved.')}
            >
              <Text style={styles.actionBtnText}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.rejectBtn]}
              onPress={() => Alert.alert('Rejected', 'Leave rejected.')}
            >
              <Text style={[styles.actionBtnText, { color: '#dc2626' }]}>Reject</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
        <LogOutIcon size={15} color="#dc2626" />
        <Text style={styles.logoutBtnText}>Sign Out from Management</Text>
      </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  roleBadgeText: {
    color: '#1e3a8a',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  roleDetail: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  switchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  switchButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  metricLabel: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '600',
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
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  countText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  empRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  empName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  empCode: {
    fontSize: 11,
    color: '#64748b',
    fontFamily: 'monospace',
    marginTop: 1,
  },
  modeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  onSiteToggle: {
    backgroundColor: '#f1f5f9',
    borderColor: '#cbd5e1',
  },
  remoteToggle: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  modeToggleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1e3a8a',
  },
  overrideBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  overrideBadgeText: {
    fontSize: 10,
    color: '#92400e',
    fontWeight: '600',
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  inviteButtonText: {
    fontSize: 10,
    color: '#1e3a8a',
    fontWeight: '700',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  enrolled: {
    backgroundColor: '#ecfdf5',
  },
  enrolledText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  pendingEnroll: {
    backgroundColor: '#fffbeb',
  },
  pendingEnrollText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#d97706',
  },
  leaveRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 8,
  },
  leaveName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  leaveDates: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  leaveActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  approveBtn: {
    backgroundColor: '#0f172a',
    borderColor: '#0f172a',
  },
  rejectBtn: {
    backgroundColor: '#ffffff',
    borderColor: '#fecaca',
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 10,
    backgroundColor: '#fef2f2',
    marginTop: 8,
  },
  logoutBtnText: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '700',
  },
});
