import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, Modal, Dimensions } from "react-native";
import { Text, View } from "@/components/Themed";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";

interface CalendarModalProps {
  visible: boolean;
  selectedDate: string;
  onClose: () => void;
  onSelectDate: (date: string) => void;
}

export function CalendarModal({
  visible,
  selectedDate,
  onClose,
  onSelectDate,
}: CalendarModalProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const monthNames = [
    "1월", "2월", "3월", "4월", "5월", "6월",
    "7월", "8월", "9월", "10월", "11월", "12월"
  ];

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const handleDateSelect = (day: number) => {
    const dateString = formatDate(currentYear, currentMonth, day);
    onSelectDate(dateString);
    onClose();
  };

  const renderCalendarWeeks = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const today = new Date();
    const isCurrentMonth = currentMonth === today.getMonth() && currentYear === today.getFullYear();

    const weeks = [];
    let dayCount = 1;
    
    // Create 6 weeks to ensure consistent height
    for (let week = 0; week < 6; week++) {
      const weekDays = [];
      
      for (let day = 0; day < 7; day++) {
        let dayElement;
        
        if (week === 0 && day < firstDay) {
          // Empty cell before first day of month
          dayElement = <View key={`empty-${day}`} style={styles.dayCell} />;
        } else if (dayCount > daysInMonth) {
          // Empty cell after last day of month
          dayElement = <View key={`empty-after-${day}`} style={styles.dayCell} />;
        } else {
          // Actual day
          const dateString = formatDate(currentYear, currentMonth, dayCount);
          const isSelected = selectedDate === dateString;
          const isToday = isCurrentMonth && dayCount === today.getDate();
          
          dayElement = (
            <TouchableOpacity
              key={dayCount}
              style={[
                styles.dayCell,
                styles.dayButton,
              ]}
              onPress={() => handleDateSelect(dayCount)}
              activeOpacity={0.6}
            >
              <View style={[
                styles.dayContent,
                isSelected && styles.selectedDay,
                isToday && !isSelected && styles.todayDay,
              ]}>
                <Text
                  style={[
                    styles.dayText,
                    isSelected && styles.selectedDayText,
                    isToday && !isSelected && styles.todayDayText,
                  ]}
                >
                  {dayCount}
                </Text>
              </View>
            </TouchableOpacity>
          );
          dayCount++;
        }
        
        weekDays.push(dayElement);
      }
      
      weeks.push(
        <View key={`week-${week}`} style={styles.calendarWeek}>
          {weekDays}
        </View>
      );
      
      // Break if we've rendered all days
      if (dayCount > daysInMonth) break;
    }

    return weeks;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header with navigation */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => navigateMonth('prev')}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={18} color={Colors.light.primary} />
            </TouchableOpacity>
            
            <View style={styles.titleContainer}>
              <Text style={styles.monthTitle}>
                {currentYear}년 {monthNames[currentMonth]}
              </Text>
            </View>
            
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => navigateMonth('next')}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-forward" size={18} color={Colors.light.primary} />
            </TouchableOpacity>
          </View>

          {/* Week days header */}
          <View style={styles.weekDaysHeader}>
            {weekDays.map((day, index) => (
              <View key={day} style={styles.weekDayCell}>
                <Text style={[
                  styles.weekDayText,
                  index === 0 && styles.sundayText,
                  index === 6 && styles.saturdayText,
                ]}>
                  {day}
                </Text>
              </View>
            ))}
          </View>

          {/* Calendar weeks */}
          <View style={styles.calendarContainer}>
            {renderCalendarWeeks()}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 340,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    height: 44,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.light.text,
    textAlign: "center",
  },
  weekDaysHeader: {
    flexDirection: "row",
    marginBottom: 8,
    height: 32,
    justifyContent: "space-around",
  },
  weekDayCell: {
    width: 44,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.light.mutedText,
    textAlign: "center",
  },
  sundayText: {
    color: "#FF6B6B",
  },
  saturdayText: {
    color: "#4DABF7",
  },
  calendarContainer: {
    marginBottom: 16,
  },
  calendarWeek: {
    flexDirection: "row",
    height: 46,
    marginBottom: 3,
    justifyContent: "space-around",
  },
  dayCell: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  dayButton: {
    borderRadius: 22,
  },
  dayContent: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedDay: {
    backgroundColor: Colors.light.primary,
  },
  todayDay: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
  },
  dayText: {
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 20,
  },
  selectedDayText: {
    color: "white",
    fontWeight: "700",
  },
  todayDayText: {
    color: Colors.light.primary,
    fontWeight: "700",
  },
  actions: {
    alignItems: "center",
    paddingTop: 8,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: Colors.light.surface,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.text,
  },
});