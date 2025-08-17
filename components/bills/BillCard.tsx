import { Text, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity } from "react-native";
import { RoommatePaymentItem } from "./RoommatePaymentItem";
import type { Bill } from "@/hooks/useBills";

interface BillCardProps {
  bill: Bill;
  roommates: string[];
  calculateSplit: (amount: number, splitType: "equal" | "custom", customSplit?: { [roommate: string]: number }, roommate?: string) => number;
  onTogglePayment: (billId: number, roommate: string) => void;
  onPressPaymentLink: (bill: Bill) => void;
  onShowBillOptions: (bill: Bill) => void;
  canEditPayment: (roommate: string) => boolean;
}

export function BillCard({
  bill,
  roommates,
  calculateSplit,
  onTogglePayment,
  onPressPaymentLink,
  onShowBillOptions,
  canEditPayment,
}: BillCardProps) {
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

  return (
    <View style={styles.billCard}>
      <View style={styles.billCardHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name={bill.icon} size={24} color={Colors.light.primary} />
        </View>
        <View style={styles.billInfo}>
          <Text style={styles.billName}>{bill.name}</Text>
          <Text style={styles.totalAmount}>
            총액: ₩{bill.amount.toLocaleString()}
          </Text>
          <Text style={styles.splitAmount}>
            {bill.splitType === "equal" ? "1인당" : "개별분할"}: ₩
            {bill.splitType === "equal" 
              ? calculateSplit(bill.amount, bill.splitType).toLocaleString()
              : "개별설정"
            }
          </Text>
          <Text style={styles.dueDate}>마감일: {bill.dueDate}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(bill.status) },
          ]}
        >
          <Text style={styles.statusText}>{getStatusText(bill.status)}</Text>
        </View>
      </View>

      <View style={styles.paymentSection}>
        <Text style={styles.paymentSectionTitle}>개인별 지불 현황</Text>
        <View style={styles.roommatePayments}>
          {roommates.map((roommate) => {
            const isPaid = bill.payments[roommate];
            const amount = calculateSplit(bill.amount, bill.splitType, bill.customSplit, roommate);

            return (
              <RoommatePaymentItem
                key={roommate}
                roommate={roommate}
                isPaid={isPaid}
                amount={amount}
                onToggle={() => onTogglePayment(bill.id, roommate)}
                canEdit={canEditPayment(roommate)}
              />
            );
          })}
        </View>
      </View>

      <View style={styles.billActions}>
        <TouchableOpacity
          style={styles.paymentButton}
          onPress={() => onPressPaymentLink(bill)}
        >
          <Ionicons name="card" size={16} color="white" />
          <Text style={styles.paymentButtonText}>계좌보기</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.detailButton}
          onPress={() => onShowBillOptions(bill)}
        >
          <Ionicons
            name="settings-outline"
            size={16}
            color={Colors.light.mutedText}
          />
          <Text style={styles.detailButtonText}>관리</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  paymentSection: {
    marginBottom: 16,
  },
  paymentSectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 12,
  },
  roommatePayments: {
    gap: 8,
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
});
