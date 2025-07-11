import { StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Text, View } from "@/components/Themed";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";

export default function BillsScreen() {
  const bills = [
    {
      id: 1,
      name: "전기요금",
      amount: 120000,
      split: "equal",
      status: "pending",
      dueDate: "2024-12-31",
      icon: "flash-outline" as keyof typeof Ionicons.glyphMap,
    },
    {
      id: 2,
      name: "가스요금",
      amount: 85000,
      split: "equal",
      status: "paid",
      dueDate: "2024-12-28",
      icon: "flame-outline" as keyof typeof Ionicons.glyphMap,
    },
    {
      id: 3,
      name: "넷플릭스",
      amount: 17000,
      split: "custom",
      status: "pending",
      dueDate: "2025-01-01",
      icon: "play-circle-outline" as keyof typeof Ionicons.glyphMap,
    },
    {
      id: 4,
      name: "인터넷",
      amount: 35000,
      split: "equal",
      status: "overdue",
      dueDate: "2024-12-25",
      icon: "wifi-outline" as keyof typeof Ionicons.glyphMap,
    },
  ];

  const roommates = ["김철수", "이영희", "박민수"];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return Colors.light.successColor;
      case "overdue":
        return Colors.light.errorColor;
      default:
        return Colors.light.warningColor;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "완료";
      case "overdue":
        return "연체";
      default:
        return "대기";
    }
  };

  const calculateSplit = (amount: number, splitType: string) => {
    if (splitType === "equal") {
      return Math.round(amount / roommates.length);
    }
    return amount; // 커스텀 분할의 경우 별도 계산 필요
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View
        style={[
          styles.welcomeSection,
          { backgroundColor: Colors.light.accent },
        ]}
      >
        <View style={styles.welcomeContent}>
          <Text style={[styles.greeting, { color: Colors.light.primary }]}>
            가계부 정리! 💰
          </Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons
            name="notifications-outline"
            size={24}
            color={Colors.light.primary}
          />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <LinearGradient
            colors={Colors.light.gradientPrimary as any}
            style={styles.summaryGradient}
          >
            <Ionicons name="card-outline" size={32} color="white" />
            <Text style={styles.summaryTitle}>이번 달 총 공과금</Text>
            <Text style={styles.summaryAmount}>₩257,000</Text>
            <Text style={styles.summaryPerPerson}>1인당 ₩85,667</Text>
          </LinearGradient>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionCard}>
            <Ionicons
              name="add-circle"
              size={24}
              color={Colors.light.primary}
            />
            <Text style={styles.actionText}>새 공과금</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Ionicons
              name="calculator"
              size={24}
              color={Colors.light.secondary}
            />
            <Text style={styles.actionText}>정산하기</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Ionicons
              name="stats-chart"
              size={24}
              color={Colors.light.warningColor}
            />
            <Text style={styles.actionText}>통계</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.billsList}>
          <Text style={styles.sectionTitle}>이번 달 청구서</Text>
          {bills.map((bill) => (
            <View key={bill.id} style={styles.billCard}>
              <View style={styles.billCardHeader}>
                <View style={styles.iconContainer}>
                  <Ionicons
                    name={bill.icon}
                    size={24}
                    color={Colors.light.primary}
                  />
                </View>
                <View style={styles.billInfo}>
                  <Text style={styles.billName}>{bill.name}</Text>
                  <Text style={styles.totalAmount}>
                    총액: ₩{bill.amount.toLocaleString()}
                  </Text>
                  <Text style={styles.splitAmount}>
                    1인당: ₩
                    {calculateSplit(bill.amount, bill.split).toLocaleString()}
                  </Text>
                  <Text style={styles.dueDate}>마감일: {bill.dueDate}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(bill.status) },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {getStatusText(bill.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.billActions}>
                <TouchableOpacity style={styles.paymentButton}>
                  <Ionicons name="send" size={16} color="white" />
                  <Text style={styles.paymentButtonText}>송금링크</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.detailButton}>
                  <Ionicons
                    name="information-circle-outline"
                    size={16}
                    color={Colors.light.mutedText}
                  />
                  <Text style={styles.detailButtonText}>상세보기</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.paymentMethods}>
          <Text style={styles.sectionTitle}>간편 송금</Text>
          <View style={styles.methodButtons}>
            <TouchableOpacity style={[styles.methodButton, styles.kakaoButton]}>
              <Ionicons name="chatbubble" size={20} color="#000" />
              <Text style={[styles.methodButtonText, { color: "#000" }]}>
                카카오페이
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.methodButton, styles.tossButton]}>
              <Ionicons name="card" size={20} color="white" />
              <Text style={styles.methodButtonText}>토스</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.methodButton, styles.bankButton]}>
              <Ionicons name="copy" size={20} color="white" />
              <Text style={styles.methodButtonText}>계좌복사</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statistics}>
          <Text style={styles.sectionTitle}>정산 현황</Text>
          <View style={styles.roommateStats}>
            {roommates.map((roommate, index) => {
              const isCompleted = Math.random() > 0.5;
              const debt = Math.floor(Math.random() * 100000);
              return (
                <View key={index} style={styles.roommateCard}>
                  <View style={styles.roommateInfo}>
                    <View style={styles.avatarContainer}>
                      <Ionicons
                        name="person"
                        size={20}
                        color={Colors.light.primary}
                      />
                    </View>
                    <View style={styles.roommateDetails}>
                      <Text style={styles.roommateName}>{roommate}</Text>
                      <Text style={styles.roommateDebt}>
                        {isCompleted
                          ? "완납"
                          : `미납액: ₩${debt.toLocaleString()}`}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.paymentStatus,
                      {
                        backgroundColor: isCompleted
                          ? Colors.light.successColor
                          : Colors.light.errorColor,
                      },
                    ]}
                  >
                    <Ionicons
                      name={isCompleted ? "checkmark" : "close"}
                      size={16}
                      color="white"
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  notificationButton: {
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
  },
  content: {
    flex: 1,
  },
  summaryCard: {
    margin: 20,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  summaryGradient: {
    padding: 24,
    alignItems: "center",
  },
  summaryTitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    marginTop: 12,
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: "700",
    color: "white",
    marginBottom: 4,
  },
  summaryPerPerson: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
  },
  quickActions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: Colors.light.cardBackground,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.light.borderColor,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.light.text,
  },
  billsList: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: 16,
  },
  billCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.light.borderColor,
  },
  billCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: Colors.light.accent,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  billInfo: {
    flex: 1,
  },
  billName: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 2,
  },
  splitAmount: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: "600",
    marginBottom: 2,
  },
  dueDate: {
    fontSize: 12,
    color: Colors.light.mutedText,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  billActions: {
    flexDirection: "row",
    gap: 12,
  },
  paymentButton: {
    flex: 1,
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  paymentButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  detailButton: {
    flex: 1,
    backgroundColor: Colors.light.surfaceVariant,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  detailButtonText: {
    color: Colors.light.mutedText,
    fontSize: 14,
    fontWeight: "600",
  },
  paymentMethods: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  methodButtons: {
    flexDirection: "row",
    gap: 12,
  },
  methodButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  kakaoButton: {
    backgroundColor: "#FEE500",
  },
  tossButton: {
    backgroundColor: Colors.light.primary,
  },
  bankButton: {
    backgroundColor: Colors.light.secondary,
  },
  methodButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
  statistics: {
    margin: 20,
  },
  roommateStats: {
    gap: 12,
  },
  roommateCard: {
    backgroundColor: Colors.light.cardBackground,
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.borderColor,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  roommateInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 40,
    height: 40,
    backgroundColor: Colors.light.accent,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  roommateDetails: {
    flex: 1,
  },
  roommateName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 2,
  },
  roommateDebt: {
    fontSize: 14,
    color: Colors.light.mutedText,
  },
  paymentStatus: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  greeting: {
    fontSize: 18,
    color: "white",
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
  },
  welcomeSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 16,
  },
  welcomeContent: {
    flex: 1,
  },
  welcomeSubtitle: {
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },
});
