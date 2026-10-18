import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { getEmployeeAttendanceCalendar } from '../services/api';
import {
  CalendarIcon,
  CloseIcon,
  CheckIcon,
  ClockIcon,
  AlertIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from './SvgIcons';

interface AttendanceCalendarModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
  employeeName: string;
  employeeCode: string;
}

export default function AttendanceCalendarModal({
  visible,
  onClose,
  userId,
  employeeName,
  employeeCode,
}: AttendanceCalendarModalProps) {
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [calendarData, setCalendarData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedDay, setSelectedDay] = useState<any>(null);

  useEffect(() => {
    if (visible && userId) {
      const now = new Date();
      setYear(now.getFullYear());
      setMonth(now.getMonth() + 1);
      fetchData(userId, now.getFullYear(), now.getMonth() + 1);
    }
  }, [visible, userId]);

  const fetchData = async (uId: string, y: number, m: number) => {
    try {
      setLoading(true);
      const data = await getEmployeeAttendanceCalendar(uId, y, m);
      setCalendarData(data);

      // Default selected day to today (if in current month) or first present/late day
      const todayStr = new Date().toISOString().split('T')[0];
      const matchToday = data?.days?.find((d: any) => d.date === todayStr);
      if (matchToday) {
        setSelectedDay(matchToday);
      } else if (data?.days?.length > 0) {
        setSelectedDay(data.days[0]);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handlePrevMonth = () => {
    let nextMonth = month - 1;
    let nextYear = year;
    if (nextMonth < 1) {
      nextMonth = 12;
      nextYear -= 1;
    }
    setMonth(nextMonth);
    setYear(nextYear);
    fetchData(userId, nextYear, nextMonth);
  };

  const handleNextMonth = () => {
    let nextMonth = month + 1;
    let nextYear = year;
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    }
    setMonth(nextMonth);
    setYear(nextYear);
    fetchData(userId, nextYear, nextMonth);
  };

  // Determine starting weekday offset (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
  // Adjust so Monday is 0, Sunday is 6
  const startDayOffset = (firstDayOfMonth + 6) % 7;

  const summary = calendarData?.summary;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, marginRight: 8 }}>
              <View style={styles.headerIconBox}>
                <CalendarIcon size={18} color="#0284c7" />
              </View>
              <View style={{ flexShrink: 1 }}>
                <Text style={styles.headerTitle} numberOfLines={1}>
                  {employeeName || 'Attendance Calendar'}
                </Text>
                <Text style={styles.headerSub}>
                  {employeeCode} • {calendarData?.shift_name || 'Standard'} ({calendarData?.scheduled_start_time || '09:00'} - {calendarData?.scheduled_end_time || '18:00'})
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <CloseIcon size={16} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Month Navigation */}
          <View style={styles.monthNavRow}>
            <TouchableOpacity onPress={handlePrevMonth} style={styles.monthNavBtn}>
              <ArrowLeftIcon size={14} color="#0284c7" />
              <Text style={styles.monthNavBtnText}>Prev</Text>
            </TouchableOpacity>

            <View style={{ alignItems: 'center' }}>
              <Text style={styles.monthNameText}>
                {calendarData?.month_name || `Month ${month}`} {year}
              </Text>
              <Text style={styles.monthTimezoneText}>
                Timezone: {calendarData?.timezone || 'Local'}
              </Text>
            </View>

            <TouchableOpacity onPress={handleNextMonth} style={styles.monthNavBtn}>
              <Text style={styles.monthNavBtnText}>Next</Text>
              <ArrowRightIcon size={14} color="#0284c7" />
            </TouchableOpacity>
          </View>

          {/* Summary KPI Strip */}
          {summary && (
            <View style={styles.kpiStrip}>
              <View style={[styles.kpiItem, { borderLeftColor: '#059669' }]}>
                <Text style={styles.kpiLabel}>PRESENT</Text>
                <Text style={[styles.kpiValue, { color: '#059669' }]}>{summary.present_days}</Text>
              </View>
              <View style={[styles.kpiItem, { borderLeftColor: '#d97706' }]}>
                <Text style={styles.kpiLabel}>LATE</Text>
                <Text style={[styles.kpiValue, { color: '#d97706' }]}>{summary.late_days}</Text>
              </View>
              <View style={[styles.kpiItem, { borderLeftColor: '#dc2626' }]}>
                <Text style={styles.kpiLabel}>ABSENT</Text>
                <Text style={[styles.kpiValue, { color: '#dc2626' }]}>{summary.absent_days}</Text>
              </View>
              <View style={[styles.kpiItem, { borderLeftColor: '#7c3aed' }]}>
                <Text style={styles.kpiLabel}>LEAVE</Text>
                <Text style={[styles.kpiValue, { color: '#7c3aed' }]}>{summary.leave_days}</Text>
              </View>
              <View style={[styles.kpiItem, { borderLeftColor: '#0284c7' }]}>
                <Text style={styles.kpiLabel}>TOTAL HRS</Text>
                <Text style={[styles.kpiValue, { color: '#0284c7' }]}>{summary.total_hours_worked}h</Text>
              </View>
            </View>
          )}

          {loading ? (
            <View style={{ paddingVertical: 60, alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#0284c7" />
              <Text style={{ fontSize: 13, color: '#64748b', marginTop: 12 }}>Loading month schedule...</Text>
            </View>
          ) : (
            <ScrollView style={{ flexShrink: 1 }} showsVerticalScrollIndicator={false}>
              {/* Day Headers (Mon - Sun) */}
              <View style={styles.weekdayRow}>
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((dayChar, i) => (
                  <View key={i} style={styles.weekdayCol}>
                    <Text style={[styles.weekdayText, (i === 5 || i === 6) && styles.weekendText]}>
                      {dayChar}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Monthly Calendar Grid */}
              <View style={styles.gridContainer}>
                {/* Blank cells for offset */}
                {Array.from({ length: startDayOffset }).map((_, i) => (
                  <View key={`empty-${i}`} style={styles.emptyDayCell} />
                ))}

                {/* Actual Days */}
                {calendarData?.days?.map((d: any) => {
                  const isSelected = selectedDay?.date === d.date;
                  const isPresent = d.status === 'present';
                  const isLate = d.status === 'late';
                  const isOnLeave = d.status === 'on_leave';
                  const isAbsent = d.status === 'absent';
                  const isWeekend = d.is_weekend;

                  let dotColor = '#cbd5e1';
                  if (isPresent) dotColor = '#059669';
                  else if (isLate) dotColor = '#d97706';
                  else if (isOnLeave) dotColor = '#7c3aed';
                  else if (isAbsent) dotColor = '#dc2626';

                  return (
                    <TouchableOpacity
                      key={d.date}
                      style={[
                        styles.dayCell,
                        isWeekend && styles.dayCellWeekend,
                        isPresent && styles.dayCellPresent,
                        isLate && styles.dayCellLate,
                        isOnLeave && styles.dayCellLeave,
                        isSelected && styles.dayCellSelected,
                      ]}
                      onPress={() => setSelectedDay(d)}
                    >
                      <Text
                        style={[
                          styles.dayNumText,
                          isWeekend && styles.dayNumWeekend,
                          (isPresent || isLate || isOnLeave) && styles.dayNumActive,
                          isSelected && styles.dayNumSelected,
                        ]}
                      >
                        {d.day}
                      </Text>

                      {/* Small Status Indicator Dot */}
                      {!isWeekend && (
                        <View style={[styles.statusDot, { backgroundColor: dotColor }]} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Selected Day Agenda Detail Card */}
              {selectedDay && (
                <View style={styles.agendaCard}>
                  <View style={styles.agendaHeaderRow}>
                    <View>
                      <Text style={styles.agendaDateTitle}>
                        {selectedDay.day_of_week}, {selectedDay.date}
                      </Text>
                      <Text style={styles.agendaSub}>
                        {selectedDay.is_weekend ? 'Non-Working Weekend' : 'Scheduled Work Day'}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        selectedDay.status === 'present'
                          ? styles.statusBadgePresent
                          : selectedDay.status === 'late'
                          ? styles.statusBadgeLate
                          : selectedDay.status === 'on_leave'
                          ? styles.statusBadgeLeave
                          : selectedDay.status === 'absent'
                          ? styles.statusBadgeAbsent
                          : styles.statusBadgeWeekend,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusBadgeText,
                          selectedDay.status === 'present'
                            ? styles.statusBadgeTextPresent
                            : selectedDay.status === 'late'
                            ? styles.statusBadgeTextLate
                            : selectedDay.status === 'on_leave'
                            ? styles.statusBadgeTextLeave
                            : selectedDay.status === 'absent'
                            ? styles.statusBadgeTextAbsent
                            : styles.statusBadgeTextWeekend,
                        ]}
                      >
                        {selectedDay.status.replace('_', ' ').toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  {/* Attendance Log Details */}
                  {selectedDay.check_in_time ? (
                    <View style={styles.agendaDetailsBox}>
                      <View style={styles.agendaDetailRow}>
                        <View style={styles.detailCol}>
                          <Text style={styles.detailColLabel}>CHECKED IN</Text>
                          <Text style={styles.detailColTime}>{selectedDay.check_in_time}</Text>
                        </View>
                        <View style={styles.detailCol}>
                          <Text style={styles.detailColLabel}>CHECKED OUT</Text>
                          <Text style={styles.detailColTime}>
                            {selectedDay.check_out_time || 'In Progress'}
                          </Text>
                        </View>
                        <View style={styles.detailCol}>
                          <Text style={styles.detailColLabel}>HOURS WORKED</Text>
                          <Text style={styles.detailColTime}>
                            {selectedDay.hours_worked_formatted || (selectedDay.hours_worked ? `${selectedDay.hours_worked}h` : '--')}
                          </Text>
                        </View>
                      </View>

                      {selectedDay.is_late && (
                        <View style={styles.lateAlertBanner}>
                          <AlertIcon size={13} color="#b45309" />
                          <Text style={styles.lateAlertText}>
                            Arrived {selectedDay.minutes_late} minutes past shift grace period
                          </Text>
                        </View>
                      )}
                    </View>
                  ) : selectedDay.status === 'on_leave' ? (
                    <View style={styles.leaveDetailBox}>
                      <Text style={styles.leaveDetailTitle}>Approved Leave of Absence</Text>
                      {selectedDay.leave_reason && (
                        <Text style={styles.leaveDetailReason}>
                          Reason: "{selectedDay.leave_reason}"
                        </Text>
                      )}
                    </View>
                  ) : selectedDay.is_weekend ? (
                    <Text style={styles.agendaEmptyText}>Weekend holiday. No attendance required.</Text>
                  ) : (
                    <Text style={styles.agendaEmptyText}>
                      No check-in recorded for this work day.
                    </Text>
                  )}
                </View>
              )}
            </ScrollView>
          )}

          {/* Footer Done Button */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
              <Text style={styles.doneBtnText}>Close Calendar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '92%',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
    backgroundColor: '#ffffff',
  },
  headerIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#e0f2fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  headerSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
  },
  monthNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  monthNavBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284c7',
  },
  monthNameText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  monthTimezoneText: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 1,
  },
  kpiStrip: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
  },
  kpiItem: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    borderLeftWidth: 2,
  },
  kpiLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.2,
  },
  kpiValue: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  weekdayRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 4,
  },
  weekdayCol: {
    flex: 1,
    alignItems: 'center',
  },
  weekdayText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  weekendText: {
    color: '#94a3b8',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  emptyDayCell: {
    width: '14.28%',
    height: 44,
  },
  dayCell: {
    width: '14.28%',
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginVertical: 1,
    backgroundColor: '#ffffff',
  },
  dayCellWeekend: {
    backgroundColor: '#f8fafc',
  },
  dayCellPresent: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  dayCellLate: {
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  dayCellLeave: {
    backgroundColor: '#f5f3ff',
    borderWidth: 1,
    borderColor: '#ddd6fe',
  },
  dayCellSelected: {
    borderColor: '#0284c7',
    borderWidth: 2,
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  dayNumText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  dayNumWeekend: {
    color: '#94a3b8',
  },
  dayNumActive: {
    fontWeight: '800',
    color: '#0f172a',
  },
  dayNumSelected: {
    color: '#0284c7',
    fontWeight: '900',
  },
  statusDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 3,
  },
  agendaCard: {
    marginHorizontal: 14,
    marginBottom: 14,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  agendaHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  agendaDateTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  agendaSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgePresent: { backgroundColor: '#d1fae5' },
  statusBadgeLate: { backgroundColor: '#fef3c7' },
  statusBadgeLeave: { backgroundColor: '#ede9fe' },
  statusBadgeAbsent: { backgroundColor: '#fee2e2' },
  statusBadgeWeekend: { backgroundColor: '#e2e8f0' },
  statusBadgeText: { fontSize: 10, fontWeight: '800' },
  statusBadgeTextPresent: { color: '#059669' },
  statusBadgeTextLate: { color: '#d97706' },
  statusBadgeTextLeave: { color: '#7c3aed' },
  statusBadgeTextAbsent: { color: '#dc2626' },
  statusBadgeTextWeekend: { color: '#475569' },
  agendaDetailsBox: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  agendaDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailCol: {
    alignItems: 'center',
    flex: 1,
  },
  detailColLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 2,
  },
  detailColTime: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  lateAlertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fffbeb',
    borderRadius: 6,
    padding: 6,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#fef3c7',
  },
  lateAlertText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#92400e',
  },
  leaveDetailBox: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  leaveDetailTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7c3aed',
  },
  leaveDetailReason: {
    fontSize: 12,
    color: '#475569',
    marginTop: 2,
    fontStyle: 'italic',
  },
  agendaEmptyText: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
    paddingVertical: 6,
  },
  footer: {
    padding: 12,
    backgroundColor: '#f8fafc',
    borderTopWidth: 1,
    borderColor: '#f1f5f9',
  },
  doneBtn: {
    backgroundColor: '#0284c7',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
});
