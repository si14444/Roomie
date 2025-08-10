import React from "react";
import { StyleSheet, TouchableOpacity, View, Image } from "react-native";
import { Text } from "@/components/Themed";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";

interface Roommate {
  id: string;
  name: string;
  profileImage?: string;
  status: "online" | "offline" | "busy";
  role?: string;
  joinedDate: string;
}

interface CurrentRoommatesProps {
  onAddRoommate?: () => void;
}

export function CurrentRoommates({ onAddRoommate }: CurrentRoommatesProps) {
  // 임시 데이터 - 실제로는 Context나 API에서 가져올 데이터
  const roommates: Roommate[] = [
    {
      id: "1",
      name: "김철수",
      status: "online",
      role: "방장",
      joinedDate: "2024-01-15",
    },
    {
      id: "2", 
      name: "이영희",
      status: "offline",
      joinedDate: "2024-02-01",
    },
    {
      id: "3",
      name: "박민준",
      status: "busy",
      joinedDate: "2024-02-10",
    },
  ];

  const getStatusColor = (status: Roommate["status"]) => {
    switch (status) {
      case "online":
        return Colors.light.successColor;
      case "busy":
        return Colors.light.warningColor;
      case "offline":
        return Colors.light.mutedText;
      default:
        return Colors.light.mutedText;
    }
  };

  const getStatusText = (status: Roommate["status"]) => {
    switch (status) {
      case "online":
        return "접속중";
      case "busy":
        return "바쁨";
      case "offline":
        return "오프라인";
      default:
        return "오프라인";
    }
  };

  const getProfileInitials = (name: string) => {
    return name.charAt(0);
  };

  const formatJoinedDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays < 30) {
      return `${diffInDays}일 전 입주`;
    } else if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30);
      return `${months}개월 전 입주`;
    } else {
      const years = Math.floor(diffInDays / 365);
      return `${years}년 전 입주`;
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.cardTitle}>현재 룸메이트</Text>
        <Text style={styles.countBadge}>{roommates.length}명</Text>
      </View>
      
      <View style={styles.roommatesContainer}>
        {roommates.map((roommate) => (
          <View key={roommate.id} style={styles.roommateItem}>
            <View style={styles.roommateInfo}>
              <View style={styles.profileContainer}>
                {roommate.profileImage ? (
                  <Image 
                    source={{ uri: roommate.profileImage }} 
                    style={styles.profileImage}
                  />
                ) : (
                  <View style={[styles.profilePlaceholder, { backgroundColor: Colors.light.primary }]}>
                    <Text style={styles.profileInitials}>
                      {getProfileInitials(roommate.name)}
                    </Text>
                  </View>
                )}
              </View>
              
              <View style={styles.roommateDetails}>
                <View style={styles.nameRow}>
                  <Text style={styles.roommateName}>{roommate.name}</Text>
                  {roommate.role && (
                    <View style={styles.roleBadge}>
                      <Text style={styles.roleText}>{roommate.role}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.roommateStatus}>
                  룸메이트
                </Text>
              </View>
            </View>
          </View>
        ))}
        
        {/* 룸메이트 추가 버튼 */}
        <TouchableOpacity 
          style={styles.addRoommateButton}
          onPress={onAddRoommate}
          activeOpacity={0.7}
        >
          <View style={styles.addButtonIcon}>
            <Ionicons name="person-add" size={20} color={Colors.light.primary} />
          </View>
          <Text style={styles.addButtonText}>룸메이트 초대</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.cardBackground,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.light.text,
  },
  countBadge: {
    backgroundColor: Colors.light.primary,
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: "hidden",
  },
  roommatesContainer: {
    gap: 12,
  },
  roommateItem: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 16,
  },
  roommateInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileContainer: {
    position: "relative",
    marginRight: 12,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  profilePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  profileInitials: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  statusIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.light.cardBackground,
  },
  roommateDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  roommateName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginRight: 8,
  },
  roleBadge: {
    backgroundColor: Colors.light.accentBlue,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roleText: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.light.primary,
  },
  roommateStatus: {
    fontSize: 13,
    color: Colors.light.mutedText,
  },
  addRoommateButton: {
    backgroundColor: Colors.light.surfaceVariant,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.light.borderColor,
    borderStyle: "dashed",
  },
  addButtonIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${Colors.light.primary}20`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.primary,
  },
});