import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { User } from '../types';
import { generateFaceScanInvite, setWorkModeOverride } from '../services/api';

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
        `48-Hour Face Scan Enrollment Token generated for ${emp.name} (${emp.code}).\n\nInvite Link: ${inviteUrl}`,
        [{ text: 'Share Link' }, { text: 'Done' }]
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
            Alert.alert('Scheduled', `${emp.name} scheduled as Remote for ${tomorrowStr} (Geofence waived for that day).`);
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>MANAGEMENT PORTAL</Text>
          </View>
          <Text style={styles.name}>{user.full_name}</Text>
          <Text style={styles.roleDetail}>Role: {user.role.toUpperCase()}</Text>
        </View>

        <TouchableOpacity style={styles.switchButton} onPress={onSwitchPortal}>
          <Text style={styles.switchButtonText}>Employee View ➔</Text>
        </TouchableOpacity>
      </View>

      {/* Metrics Row */}
      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>42</Text>
          <Text style={styles.metricLabel}>Total Staff</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={[styles.metricValue, { color: '#4ade80' }]}>38</Text>
          <Text style={styles.metricLabel}>Present</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={[styles.metricValue, { color: '#a78bfa' }]}>9</Text>
          <Text style={styles.metricLabel}>Remote</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={[styles.metricValue, { color: '#f59e0b' }]}>2</Text>
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
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                <TouchableOpacity
                  style={[styles.modeToggle, emp.mode === 'remote' ? styles.remoteToggle : styles.onSiteToggle]}
                  onPress={() => handleModeAction(emp)}
                >
                  <Text style={styles.modeToggleText}>
                    {emp.mode === 'remote' ? '🌐 Remote' : '📍 On-Site (200m)'} ⚙️
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
                    <Text style={styles.inviteButtonText}>+ Send Face Invite</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.statusIndicator, emp.faceEnrolled ? styles.enrolled : styles.pendingEnroll]}>
                {emp.faceEnrolled ? '✓ Face Enrolled' : '⚠️ No Face Data'}
              </Text>
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
              onPress={() => Alert.alert('Approved', 'Leave approved and attendance waived.')}
            >
              <Text style={styles.actionBtnText}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.rejectBtn]}
              onPress={() => Alert.alert('Rejected', 'Leave rejected.')}
            >
              <Text style={styles.actionBtnText}>Reject</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

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
  roleBadge: {
    backgroundColor: '#7c3aed22',
    borderColor: '#7c3aed',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  roleBadgeText: {
    color: '#a78bfa',
    fontSize: 10,
    fontWeight: '800',
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f8fafc',
  },
  roleDetail: {
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
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#131b2e',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f8fafc',
  },
  metricLabel: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#131b2e',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
  },
  countText: {
    fontSize: 12,
    color: '#64748b',
  },
  empRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: '#1e293b',
  },
  empName: {
    color: '#f1f5f9',
    fontSize: 14,
    fontWeight: '700',
  },
  empCode: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 1,
  },
  modeToggle: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  onSiteToggle: {
    backgroundColor: '#14532d33',
    borderColor: '#15803d',
  },
  remoteToggle: {
    backgroundColor: '#581c8733',
    borderColor: '#7e22ce',
  },
  modeToggleText: {
    color: '#e2e8f0',
    fontSize: 10,
    fontWeight: '700',
  },
  overrideBadge: {
    backgroundColor: '#854d0e',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  overrideBadgeText: {
    color: '#fef08a',
    fontSize: 10,
    fontWeight: '700',
  },
  inviteButton: {
    backgroundColor: '#0284c722',
    borderColor: '#0284c7',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  inviteButtonText: {
    color: '#38bdf8',
    fontSize: 10,
    fontWeight: '700',
  },
  statusIndicator: {
    fontSize: 11,
    fontWeight: '700',
  },
  enrolled: {
    color: '#4ade80',
  },
  pendingEnroll: {
    color: '#f59e0b',
  },
  leaveRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  leaveName: {
    color: '#f1f5f9',
    fontSize: 14,
    fontWeight: '700',
  },
  leaveDates: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  leaveActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  approveBtn: {
    backgroundColor: '#16a34a',
  },
  rejectBtn: {
    backgroundColor: '#dc2626',
  },
  actionBtnText: {
    color: '#ffffff',
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
