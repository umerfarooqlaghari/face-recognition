import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { User } from '../types';
import {
  CloseIcon,
  ShieldIcon,
  UserIcon,
  CalendarIcon,
  FaceScanIcon,
  FileTextIcon,
  HelpCircleIcon,
  LogOutIcon,
  ChevronRightIcon,
} from './SvgIcons';

interface HamburgerMenuModalProps {
  visible: boolean;
  onClose: () => void;
  user: User;
  currentPortal: 'employee' | 'management';
  onSwitchPortal?: () => void;
  onOpenCalendar?: () => void;
  onOpenEnrollment?: () => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
}

export default function HamburgerMenuModal({
  visible,
  onClose,
  user,
  currentPortal,
  onSwitchPortal,
  onOpenCalendar,
  onOpenEnrollment,
  onLogout,
  onDeleteAccount,
}: HamburgerMenuModalProps) {
  const isManager = user.role === 'manager' || user.role === 'admin' || user.role === 'super_admin';

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const handleOpenPrivacy = () => {
    onClose();
    Linking.openURL('https://face-scan.alpha-devs.cloud/privacy');
  };

  const handleOpenTerms = () => {
    onClose();
    Linking.openURL('https://face-scan.alpha-devs.cloud/terms');
  };

  const handleOpenSupport = () => {
    onClose();
    Linking.openURL('https://face-scan.alpha-devs.cloud/support');
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Account & Settings</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <CloseIcon size={16} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            {/* User Profile Card */}
            <View style={styles.profileCard}>
              <View style={styles.avatarBox}>
                <Text style={styles.avatarText}>{getInitials(user.full_name)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.userName} numberOfLines={1}>{user.full_name}</Text>
                <Text style={styles.userEmail} numberOfLines={1}>{user.email}</Text>
                <View style={styles.roleRow}>
                  <View style={styles.roleBadge}>
                    <Text style={styles.roleBadgeText}>{user.role.toUpperCase()}</Text>
                  </View>
                  <Text style={styles.codeText}>{user.employee_code}</Text>
                </View>
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.menuSection}>
              <Text style={styles.sectionHeader}>NAVIGATION & TOOLS</Text>

              {isManager && onSwitchPortal && (
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    onClose();
                    onSwitchPortal();
                  }}
                >
                  <View style={styles.menuItemIcon}>
                    {currentPortal === 'employee' ? (
                      <ShieldIcon size={18} color="#0284c7" />
                    ) : (
                      <UserIcon size={18} color="#0284c7" />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.menuItemTitle}>
                      {currentPortal === 'employee' ? 'Switch to Management Portal' : 'Switch to Staff Portal'}
                    </Text>
                    <Text style={styles.menuItemSub}>
                      {currentPortal === 'employee' ? 'Manage employees, offices & leaves' : 'Mark daily personal attendance'}
                    </Text>
                  </View>
                  <ChevronRightIcon size={16} color="#94a3b8" />
                </TouchableOpacity>
              )}

              {onOpenCalendar && (
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    onClose();
                    onOpenCalendar();
                  }}
                >
                  <View style={styles.menuItemIcon}>
                    <CalendarIcon size={18} color="#0284c7" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.menuItemTitle}>Monthly Attendance Calendar</Text>
                    <Text style={styles.menuItemSub}>View hours worked, check-in and checkout history</Text>
                  </View>
                  <ChevronRightIcon size={16} color="#94a3b8" />
                </TouchableOpacity>
              )}

              {onOpenEnrollment && (
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    onClose();
                    onOpenEnrollment();
                  }}
                >
                  <View style={styles.menuItemIcon}>
                    <FaceScanIcon size={18} color="#0284c7" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.menuItemTitle}>Update Face Biometric Reference</Text>
                    <Text style={styles.menuItemSub}>Re-scan your face model for 3D verification</Text>
                  </View>
                  <ChevronRightIcon size={16} color="#94a3b8" />
                </TouchableOpacity>
              )}
            </View>

            {/* Help & Policies */}
            <View style={styles.menuSection}>
              <Text style={styles.sectionHeader}>SUPPORT & LEGAL</Text>

              <TouchableOpacity style={styles.menuItem} onPress={handleOpenSupport}>
                <View style={styles.menuItemIcon}>
                  <HelpCircleIcon size={18} color="#64748b" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.menuItemTitle}>Help & Support Desk</Text>
                  <Text style={styles.menuItemSub}>Guides, documentation & administrator contact</Text>
                </View>
                <ChevronRightIcon size={16} color="#94a3b8" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={handleOpenPrivacy}>
                <View style={styles.menuItemIcon}>
                  <ShieldIcon size={18} color="#64748b" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.menuItemTitle}>Privacy Policy</Text>
                  <Text style={styles.menuItemSub}>Data privacy & biometric retention guidelines</Text>
                </View>
                <ChevronRightIcon size={16} color="#94a3b8" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={handleOpenTerms}>
                <View style={styles.menuItemIcon}>
                  <FileTextIcon size={18} color="#64748b" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.menuItemTitle}>Terms of Service</Text>
                  <Text style={styles.menuItemSub}>End-user attendance platform license</Text>
                </View>
                <ChevronRightIcon size={16} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {/* Danger / Logout Zone */}
            <View style={styles.menuSection}>
              <Text style={styles.sectionHeader}>ACCOUNT MANAGEMENT</Text>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  onClose();
                  onLogout();
                }}
              >
                <View style={[styles.menuItemIcon, { backgroundColor: '#fee2e2' }]}>
                  <LogOutIcon size={18} color="#dc2626" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.menuItemTitle, { color: '#dc2626' }]}>Sign Out</Text>
                  <Text style={styles.menuItemSub}>Sign out of your session on this device</Text>
                </View>
                <ChevronRightIcon size={16} color="#94a3b8" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.menuItem, { borderBottomWidth: 0 }]}
                onPress={() => {
                  onClose();
                  onDeleteAccount();
                }}
              >
                <View style={[styles.menuItemIcon, { backgroundColor: '#fef2f2' }]}>
                  <CloseIcon size={18} color="#b91c1c" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.menuItemTitle, { color: '#b91c1c' }]}>
                    Delete Account & Face Data
                  </Text>
                  <Text style={styles.menuItemSub}>
                    Permanently delete your account and 512D biometric vectors
                  </Text>
                </View>
                <ChevronRightIcon size={16} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {/* Version */}
            <View style={styles.versionFootnote}>
              <Text style={styles.versionText}>Face Attendance v1.0.0 (Build 8)</Text>
              <Text style={styles.versionSub}>Enterprise Biometric Verification</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    width: '85%',
    maxWidth: 360,
    height: '100%',
    backgroundColor: '#ffffff',
    paddingTop: 54,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0284c7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  userEmail: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 1,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  roleBadge: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0284c7',
  },
  codeText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
  menuSection: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 0.8,
    marginBottom: 8,
    paddingLeft: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderBottomWidth: 1,
    borderColor: '#f8fafc',
  },
  menuItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  menuItemSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  versionFootnote: {
    alignItems: 'center',
    paddingVertical: 24,
    marginTop: 8,
  },
  versionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
  },
  versionSub: {
    fontSize: 10,
    color: '#cbd5e1',
    marginTop: 2,
  },
});
