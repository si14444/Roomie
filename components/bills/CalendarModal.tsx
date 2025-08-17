import React, { useState, useEffect } from "react";
import { StyleSheet, TouchableOpacity, Modal, Pressable } from "react-native";
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

  // Reset to current month when modal opens
  useEffect(() => {
    if (visible) {
      const now = new Date();
      setCurrentMonth(now.getMonth());
      setCurrentYear(now.getFullYear());
    }
  }, [visible]);

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

  const handleBackdropPress = () => {
    onClose();
  };

  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const today = new Date();
    const isCurrentMonth = currentMonth === today.getMonth() && currentYear === today.getFullYear();

    const totalCells = 42; // 6 weeks × 7 days
    const days = [];

    // Add empty cells for days before the first day
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <View key={`empty-${i}`} style={styles.dayCell} />
      );
    }

    // Add actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = formatDate(currentYear, currentMonth, day);
      const isSelected = selectedDate === dateString;
      const isToday = isCurrentMonth && day === today.getDate();

      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.dayCell,
            styles.dayButton,
          ]}
          onPress={() => handleDateSelect(day)}
          activeOpacity={0.7}
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
              {day}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }

    // Fill remaining cells
    const remainingCells = totalCells - (firstDay + daysInMonth);
    for (let i = 0; i < remainingCells; i++) {
      days.push(
        <View key={`empty-end-${i}`} style={styles.dayCell} />
      );
    }

    return days;
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={handleBackdropPress}>
        <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => navigateMonth('prev')}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={20} color={Colors.light.primary} />
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
              <Ionicons name="chevron-forward" size={20} color={Colors.light.primary} />
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

          {/* Calendar grid */}
          <View style={styles.calendarGrid}>
            {renderCalendarGrid()}
          </View>

          {/* Bottom actions */}
          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.todayButton} 
              onPress={() => {
                const today = new Date();
                setCurrentMonth(today.getMonth());
                setCurrentYear(today.getFullYear());
                handleDateSelect(today.getDate());
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.todayButtonText}>오늘</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.closeButtonText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
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
    borderRadius: 20,
    padding: 20,
    width: "100%",
    maxWidth: 350,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  weekDayCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
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
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  dayCell: {
    width: "14.285714%", // 100% / 7
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 2,
  },
  dayButton: {
    // No additional styles needed
  },
  dayContent: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedDay: {
    backgroundColor: Colors.light.primary,
  },
  todayDay: {
    backgroundColor: Colors.light.surface,
    borderWidth: 2,
    borderColor: Colors.light.primary,
  },
  dayText: {
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: "500",
    textAlign: "center",
  },
  selectedDayText: {
    color: "white",
    fontWeight: "bold",
  },
  todayDayText: {
    color: Colors.light.primary,
    fontWeight: "bold",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 8,
    justifyContent: "space-between",
  },
  todayButton: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.light.surface,
    alignItems: "center",
  },
  todayButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.primary,
  },
  closeButton: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
});