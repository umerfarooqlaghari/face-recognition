import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  CheckIcon,
  CloseIcon,
} from './SvgIcons';

interface LeaveCalendarPickerProps {
  selectedDates: string[]; // Format: 'YYYY-MM-DD'
  onSelectDates: (dates: string[]) => void;
  minDate?: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function LeaveCalendarPicker({
  selectedDates,
  onSelectDates,
  minDate,
}: LeaveCalendarPickerProps) {
  const today = new Date();
  const todayStr = minDate || today.toISOString().split('T')[0];

  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth()); // 0-indexed

  // Format helper YYYY-MM-DD
  const formatDateStr = (y: number, m: number, d: number): string => {
    const monthPart = String(m + 1).padStart(2, '0');
    const dayPart = String(d).padStart(2, '0');
    return `${y}-${monthPart}-${dayPart}`;
  };

  // Nice human format (e.g., "Oct 17")
  const formatReadableDate = (dateStr: string): string => {
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const dt = new Date(y, m - 1, d);
      return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const isCurrentMonthOrPast =
    currentYear < today.getFullYear() ||
    (currentYear === today.getFullYear() && currentMonth <= today.getMonth());

  const handlePrevMonth = () => {
    if (isCurrentMonthOrPast) return;
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Toggle single date
  const handleToggleDate = (dateStr: string) => {
    if (dateStr < todayStr) return; // Prevent past dates

    if (selectedDates.includes(dateStr)) {
      onSelectDates(selectedDates.filter(d => d !== dateStr));
    } else {
      const next = [...selectedDates, dateStr].sort();
      onSelectDates(next);
    }
  };

  // Quick Preset: Tomorrow
  const handleSelectTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const dStr = d.toISOString().split('T')[0];
    if (!selectedDates.includes(dStr)) {
      onSelectDates([...selectedDates, dStr].sort());
    }
  };

  // Quick Preset: Next 3 Days
  const handleSelectNext3Days = () => {
    const result = new Set(selectedDates);
    for (let i = 1; i <= 3; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      result.add(d.toISOString().split('T')[0]);
    }
    onSelectDates(Array.from(result).sort());
  };

  const handleClearAll = () => {
    onSelectDates([]);
  };

  // Compute month layout
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun
  const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Empty leading slots
  const leadingSlots = Array.from({ length: firstDayOfWeek });
  // Month days
  const daysArray = Array.from({ length: totalDaysInMonth }, (_, i) => i + 1);

  return (
    <View style={styles.calendarContainer}>
      {/* Month Navigation Header */}
      <View style={styles.monthHeader}>
        <TouchableOpacity
          style={[styles.navArrow, isCurrentMonthOrPast && styles.navArrowDisabled]}
          onPress={handlePrevMonth}
          disabled={isCurrentMonthOrPast}
          accessibilityLabel="Previous Month"
        >
          <ChevronLeftIcon size={18} color={isCurrentMonthOrPast ? '#cbd5e1' : '#1e3a8a'} />
        </TouchableOpacity>

        <View style={styles.monthTitleBox}>
          <CalendarIcon size={16} color="#1e3a8a" />
          <Text style={styles.monthTitleText}>
            {MONTH_NAMES[currentMonth]} {currentYear}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.navArrow}
          onPress={handleNextMonth}
          accessibilityLabel="Next Month"
        >
          <ChevronRightIcon size={18} color="#1e3a8a" />
        </TouchableOpacity>
      </View>

      {/* Weekday Labels */}
      <View style={styles.weekDaysRow}>
        {DAY_NAMES.map(day => (
          <View key={day} style={styles.weekDayCell}>
            <Text
              style={[
                styles.weekDayText,
                (day === 'Sun' || day === 'Sat') && styles.weekEndText,
              ]}
            >
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* Days Grid */}
      <View style={styles.daysGrid}>
        {/* Leading empty slots */}
        {leadingSlots.map((_, idx) => (
          <View key={`leading-${idx}`} style={styles.dayCell} />
        ))}

        {/* Calendar days */}
        {daysArray.map(day => {
          const dateStr = formatDateStr(currentYear, currentMonth, day);
          const isPast = dateStr < todayStr;
          const isToday = dateStr === todayStr;
          const isSelected = selectedDates.includes(dateStr);

          return (
            <TouchableOpacity
              key={dateStr}
              style={[
                styles.dayCell,
                isSelected && styles.dayCellSelected,
                isToday && !isSelected && styles.dayCellToday,
                isPast && styles.dayCellPast,
              ]}
              onPress={() => handleToggleDate(dateStr)}
              disabled={isPast}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.dayText,
                  isSelected && styles.dayTextSelected,
                  isToday && !isSelected && styles.dayTextToday,
                  isPast && styles.dayTextPast,
                ]}
              >
                {day}
              </Text>
              {isSelected && (
                <View style={styles.selectedDot}>
                  <CheckIcon size={10} color="#ffffff" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Quick Select Preset Buttons */}
      <View style={styles.presetsRow}>
        <TouchableOpacity style={styles.presetButton} onPress={handleSelectTomorrow}>
          <Text style={styles.presetButtonText}>+ Tomorrow</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.presetButton} onPress={handleSelectNext3Days}>
          <Text style={styles.presetButtonText}>+ Next 3 Days</Text>
        </TouchableOpacity>
        {selectedDates.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={handleClearAll}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Selected Dates Summary Badge */}
      <View style={styles.selectionSummaryCard}>
        <View style={styles.selectionSummaryHeader}>
          <Text style={styles.selectionSummaryTitle}>
            {selectedDates.length === 0
              ? 'Select days on the calendar above'
              : `${selectedDates.length} ${selectedDates.length === 1 ? 'day' : 'days'} selected for leave`}
          </Text>
          {selectedDates.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{selectedDates.length} Days</Text>
            </View>
          )}
        </View>

        {selectedDates.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.selectedPillsScroll}
          >
            {selectedDates.map(dStr => (
              <View key={dStr} style={styles.datePill}>
                <Text style={styles.datePillText}>{formatReadableDate(dStr)}</Text>
                <TouchableOpacity
                  style={styles.datePillRemove}
                  onPress={() => handleToggleDate(dStr)}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <CloseIcon size={12} color="#1e3a8a" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  calendarContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    marginBottom: 16,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  monthTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  monthTitleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  navArrow: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navArrowDisabled: {
    backgroundColor: '#f8fafc',
    opacity: 0.5,
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    marginBottom: 6,
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
  },
  weekDayText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  weekEndText: {
    color: '#94a3b8',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
    borderRadius: 8,
  },
  dayCellSelected: {
    backgroundColor: '#1e3a8a',
  },
  dayCellToday: {
    borderWidth: 1.5,
    borderColor: '#38bdf8',
  },
  dayCellPast: {
    opacity: 0.35,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  dayTextSelected: {
    color: '#ffffff',
    fontWeight: '700',
  },
  dayTextToday: {
    color: '#0284c7',
    fontWeight: '700',
  },
  dayTextPast: {
    color: '#94a3b8',
  },
  selectedDot: {
    position: 'absolute',
    bottom: 2,
  },
  presetsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  presetButton: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  presetButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#15803d',
  },
  clearButton: {
    marginLeft: 'auto',
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  clearButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#dc2626',
  },
  selectionSummaryCard: {
    marginTop: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  selectionSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectionSummaryTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  countBadge: {
    backgroundColor: '#1e3a8a',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  countBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  selectedPillsScroll: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
    paddingVertical: 2,
  },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    borderWidth: 1,
    borderColor: '#bae6fd',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 6,
  },
  datePillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0369a1',
  },
  datePillRemove: {
    marginLeft: 2,
  },
});
