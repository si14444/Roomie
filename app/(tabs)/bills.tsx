import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { Text, View } from "@/components/Themed";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState, useMemo } from "react";
import Colors from "@/constants/Colors";

interface Bill {
  id: number;
  name: string;
  amount: number;
  splitType: "equal" | "custom";
  status: "pending" | "paid" | "overdue";
  dueDate: string;
  icon: keyof typeof Ionicons.glyphMap;
  category: "utility" | "subscription" | "maintenance";
  payments: { [roommate: string]: boolean };
}

interface Roommate {
  name: string;
  totalDebt: number;
  paidAmount: number;
}

export default function BillsScreen() {
  const [bills, setBills] = useState<Bill[]>([
    {
      id: 1,
      name: "전기요금",
      amount: 120000,
      splitType: "equal",
      status: "pending",
      dueDate: "2024-12-31",
      icon: "flash-outline" as keyof typeof Ionicons.glyphMap,
      category: "utility",
      payments: { 김철수: false, 이영희: false, 박민수: false, 정지수: false },
    },
    {
      id: 2,
      name: "가스요금",
      amount: 85000,
      splitType: "equal",
      status: "paid",
      dueDate: "2024-12-28",
      icon: "flame-outline" as keyof typeof Ionicons.glyphMap,
      category: "utility",
      payments: { 김철수: true, 이영희: true, 박민수: true, 정지수: true },
    },
    {
      id: 3,
      name: "넷플릭스",
      amount: 17000,
      splitType: "custom",
      status: "pending",
      dueDate: "2025-01-01",
      icon: "play-circle-outline" as keyof typeof Ionicons.glyphMap,
      category: "subscription",
      payments: { 김철수: true, 이영희: false, 박민수: false, 정지수: false },
    },
    {
      id: 4,
      name: "인터넷",
      amount: 35000,
      splitType: "equal",
      status: "overdue",
      dueDate: "2024-12-25",
      icon: "wifi-outline" as keyof typeof Ionicons.glyphMap,
      category: "utility",
      payments: { 김철수: false, 이영희: false, 박민수: true, 정지수: false },
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newBill, setNewBill] = useState({
    name: "",
    amount: "",
    splitType: "equal" as "equal" | "custom",
    dueDate: "",
    category: "utility" as "utility" | "subscription" | "maintenance",
    icon: "flash-outline" as keyof typeof Ionicons.glyphMap,
  });

  const roommates = ["김철수", "이영희", "박민수", "정지수"];

  const calculateSplit = (amount: number, splitType: "equal" | "custom") => {
    if (splitType === "equal") {
      return Math.round(amount / roommates.length);
    }
    return Math.round(amount / 2);
  };

  const statistics = useMemo(() => {
    const totalAmount = bills.reduce((sum, bill) => sum + bill.amount, 0);
    const paidAmount = bills
      .filter((bill) => bill.status === "paid")
      .reduce((sum, bill) => sum + bill.amount, 0);

    const overdueAmount = bills
      .filter((bill) => bill.status === "overdue")
      .reduce((sum, bill) => sum + bill.amount, 0);

    const perPersonAmount = Math.round(totalAmount / roommates.length);

    const roommateStats: Roommate[] = roommates.map((roommate) => {
      let totalDebt = 0;
      let paidAmount = 0;

      bills.forEach((bill) => {
        const individualAmount = calculateSplit(bill.amount, bill.splitType);
        totalDebt += individualAmount;
        if (bill.payments[roommate]) {
          paidAmount += individualAmount;
        }
      });

      return {
        name: roommate,
        totalDebt,
        paidAmount,
      };
    });

    const completionRate =
      totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;

    return {
      totalAmount,
      paidAmount,
      overdueAmount,
      perPersonAmount,
      completionRate,
      roommateStats,
    };
  }, [bills]);

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

  const addNewBill = () => {
    if (!newBill.name.trim() || !newBill.amount.trim()) {
      Alert.alert("오류", "공과금 이름과 금액을 입력해주세요.");
      return;
    }

    if (!newBill.dueDate.trim()) {
      Alert.alert("오류", "마감일을 입력해주세요.");
      return;
    }

    const getIconForCategory = (category: string, name: string) => {
      const nameLower = name.toLowerCase();

      if (nameLower.includes("전기")) return "flash-outline";
      if (nameLower.includes("가스")) return "flame-outline";
      if (nameLower.includes("수도") || nameLower.includes("물"))
        return "water-outline";
      if (nameLower.includes("인터넷") || nameLower.includes("wifi"))
        return "wifi-outline";
      if (nameLower.includes("넷플릭스") || nameLower.includes("구독"))
        return "play-circle-outline";
      if (nameLower.includes("통신") || nameLower.includes("폰"))
        return "phone-portrait-outline";

      switch (category) {
        case "utility":
          return "flash-outline";
        case "subscription":
          return "play-circle-outline";
        case "maintenance":
          return "home-outline";
        default:
          return "home-outline";
      }
    };

    const bill: Bill = {
      id: Date.now(),
      name: newBill.name.trim(),
      amount: parseInt(newBill.amount.trim()),
      splitType: newBill.splitType,
      status: "pending",
      dueDate: newBill.dueDate.trim(),
      icon: getIconForCategory(
        newBill.category,
        newBill.name
      ) as keyof typeof Ionicons.glyphMap,
      category: newBill.category,
      payments: roommates.reduce((acc, roommate) => {
        acc[roommate] = false;
        return acc;
      }, {} as { [roommate: string]: boolean }),
    };

    setBills((prev) => [...prev, bill]);
    setNewBill({
      name: "",
      amount: "",
      splitType: "equal",
      dueDate: "",
      category: "utility",
      icon: "flash-outline",
    });
    setShowAddModal(false);
    Alert.alert("성공", "새 공과금이 추가되었습니다!");
  };

  const togglePayment = (billId: number, roommate: string) => {
    setBills((prev) =>
      prev.map((bill) => {
        if (bill.id === billId) {
          const updatedPayments = {
            ...bill.payments,
            [roommate]: !bill.payments[roommate],
          };

          const allPaid = Object.values(updatedPayments).every((paid) => paid);

          return {
            ...bill,
            payments: updatedPayments,
            status: allPaid ? "paid" : "pending",
          };
        }
        return bill;
      })
    );
  };

  const showBillOptions = (bill: Bill) => {
    Alert.alert(`${bill.name} 관리`, "어떤 작업을 하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "지불 완료 처리",
        onPress: () => markBillAsPaid(bill.id),
      },
      {
        text: "마감일 연장",
        onPress: () => extendDueDate(bill.id),
      },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => deleteBill(bill.id),
      },
    ]);
  };

  const markBillAsPaid = (billId: number) => {
    setBills((prev) =>
      prev.map((bill) =>
        bill.id === billId
          ? {
              ...bill,
              status: "paid",
              payments: roommates.reduce((acc, roommate) => {
                acc[roommate] = true;
                return acc;
              }, {} as { [roommate: string]: boolean }),
            }
          : bill
      )
    );
    Alert.alert("완료", "모든 인원의 지불이 완료로 처리되었습니다.");
  };

  const extendDueDate = (billId: number) => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const newDueDate = nextWeek.toISOString().split("T")[0];

    setBills((prev) =>
      prev.map((bill) =>
        bill.id === billId
          ? { ...bill, dueDate: newDueDate, status: "pending" }
          : bill
      )
    );
    Alert.alert("연장 완료", `마감일이 ${newDueDate}로 연장되었습니다.`);
  };

  const deleteBill = (billId: number) => {
    const bill = bills.find((b) => b.id === billId);
    Alert.alert("공과금 삭제", `"${bill?.name}" 공과금을 삭제하시겠습니까?`, [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => {
          setBills((prev) => prev.filter((b) => b.id !== billId));
          Alert.alert("삭제 완료", "공과금이 삭제되었습니다.");
        },
      },
    ]);
  };

  const showSettlement = () => {
    const settlementDetails = statistics.roommateStats
      .map((roommate) => {
        const remaining = roommate.totalDebt - roommate.paidAmount;
        return remaining > 0
          ? `${roommate.name}: ₩${remaining.toLocaleString()} 미납`
          : `${roommate.name}: 완납`;
      })
      .join("\n");

    Alert.alert(
      "정산 현황",
      `이번 달 공과금 정산 상세:\n\n${settlementDetails}\n\n총 미납액: ₩${statistics.roommateStats
        .reduce((sum, r) => sum + Math.max(0, r.totalDebt - r.paidAmount), 0)
        .toLocaleString()}`,
      [
        { text: "확인", style: "default" },
        { text: "송금 요청", onPress: sendPaymentReminder },
      ]
    );
  };

  const showStatistics = () => {
    const monthlyTotal = statistics.totalAmount;
    const completionRate = statistics.completionRate;
    const overdueCount = bills.filter((b) => b.status === "overdue").length;

    Alert.alert(
      "이번 달 통계",
      `총 공과금: ₩${monthlyTotal.toLocaleString()}\n1인당 평균: ₩${statistics.perPersonAmount.toLocaleString()}\n\n완료율: ${completionRate}%\n연체 항목: ${overdueCount}개\n\n가장 많이 완료한 사람: ${getMVPRoommate()}`,
      [{ text: "확인" }]
    );
  };

  const getMVPRoommate = () => {
    const mvp = statistics.roommateStats.reduce((max, current) =>
      current.paidAmount > max.paidAmount ? current : max
    );
    return mvp.name;
  };

  const sendPaymentReminder = () => {
    Alert.alert(
      "송금 요청",
      "모든 룸메이트에게 미납 공과금 알림을 보냈습니다!",
      [{ text: "확인" }]
    );
  };

  const generatePaymentLink = (bill: Bill) => {
    const unpaidRoommates = roommates.filter(
      (roommate) => !bill.payments[roommate]
    );

    if (unpaidRoommates.length === 0) {
      Alert.alert("알림", "모든 인원이 이미 지불했습니다.");
      return;
    }

    const amount = calculateSplit(bill.amount, bill.splitType);
    const paymentMethods = [
      { name: "카카오페이", icon: "chatbubble" },
      { name: "토스", icon: "card" },
      { name: "계좌복사", icon: "copy" },
    ];

    Alert.alert(
      "송금 링크 생성",
      `${
        bill.name
      }\n금액: ₩${amount.toLocaleString()}\n\n송금 방법을 선택하세요:`,
      [
        { text: "취소", style: "cancel" },
        ...paymentMethods.map((method) => ({
          text: method.name,
          onPress: () =>
            Alert.alert(
              "송금 링크",
              `${method.name} 링크가 생성되어 미납자들에게 전송되었습니다!`
            ),
        })),
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryContent}>
            <Ionicons name="card-outline" size={32} color="white" />
            <Text style={styles.summaryTitle}>이번 달 총 공과금</Text>
            <Text style={styles.summaryAmount}>
              ₩{statistics.totalAmount.toLocaleString()}
            </Text>
            <Text style={styles.summaryPerPerson}>
              1인당 ₩{statistics.perPersonAmount.toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons
              name="add-circle"
              size={24}
              color={Colors.light.primary}
            />
            <Text style={styles.actionText}>새 공과금</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={showSettlement}>
            <Ionicons
              name="calculator"
              size={24}
              color={Colors.light.secondary}
            />
            <Text style={styles.actionText}>정산하기</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={showStatistics}>
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
                    {calculateSplit(
                      bill.amount,
                      bill.splitType
                    ).toLocaleString()}
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

              <View style={styles.paymentSection}>
                <Text style={styles.paymentSectionTitle}>개인별 지불 현황</Text>
                <View style={styles.roommatePayments}>
                  {roommates.map((roommate) => {
                    const isPaid = bill.payments[roommate];
                    return (
                      <TouchableOpacity
                        key={roommate}
                        style={[
                          styles.roommatePayment,
                          isPaid && styles.roommatePaymentPaid,
                        ]}
                        onPress={() => togglePayment(bill.id, roommate)}
                      >
                        <Ionicons
                          name={isPaid ? "checkmark-circle" : "ellipse-outline"}
                          size={16}
                          color={
                            isPaid
                              ? Colors.light.successColor
                              : Colors.light.mutedText
                          }
                        />
                        <Text
                          style={[
                            styles.roommatePaymentText,
                            isPaid && styles.roommatePaymentTextPaid,
                          ]}
                        >
                          {roommate}
                        </Text>
                        <Text
                          style={[
                            styles.roommatePaymentAmount,
                            isPaid && styles.roommatePaymentAmountPaid,
                          ]}
                        >
                          ₩
                          {calculateSplit(
                            bill.amount,
                            bill.splitType
                          ).toLocaleString()}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.billActions}>
                <TouchableOpacity
                  style={styles.paymentButton}
                  onPress={() => generatePaymentLink(bill)}
                >
                  <Ionicons name="send" size={16} color="white" />
                  <Text style={styles.paymentButtonText}>송금링크</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.detailButton}
                  onPress={() => showBillOptions(bill)}
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
          ))}
        </View>

        <View style={styles.paymentMethods}>
          <Text style={styles.sectionTitle}>간편 송금</Text>
          <View style={styles.methodButtons}>
            <TouchableOpacity
              style={[styles.methodButton, styles.kakaoButton]}
              onPress={() =>
                Alert.alert(
                  "카카오페이",
                  "카카오페이 송금 링크가 생성되었습니다!"
                )
              }
            >
              <Ionicons name="chatbubble" size={20} color="#000" />
              <Text style={[styles.methodButtonText, { color: "#000" }]}>
                카카오페이
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.methodButton, styles.tossButton]}
              onPress={() =>
                Alert.alert("토스", "토스 송금 링크가 생성되었습니다!")
              }
            >
              <Ionicons name="card" size={20} color="white" />
              <Text style={styles.methodButtonText}>토스</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.methodButton, styles.bankButton]}
              onPress={() =>
                Alert.alert(
                  "계좌복사",
                  "계좌번호가 클립보드에 복사되었습니다!\n\n국민은행 123-456-789012"
                )
              }
            >
              <Ionicons name="copy" size={20} color="white" />
              <Text style={styles.methodButtonText}>계좌복사</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statistics}>
          <Text style={styles.sectionTitle}>정산 현황</Text>
          <View style={styles.roommateStats}>
            {statistics.roommateStats.map((roommate, index) => {
              const remainingDebt = roommate.totalDebt - roommate.paidAmount;
              const isCompleted = remainingDebt === 0;
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
                      <Text style={styles.roommateName}>{roommate.name}</Text>
                      <Text style={styles.roommateDebt}>
                        {isCompleted
                          ? "완납"
                          : `미납액: ₩${remainingDebt.toLocaleString()}`}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.completionStatus,
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

      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>새 공과금 추가</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons
                  name="close"
                  size={24}
                  color={Colors.light.mutedText}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>공과금 이름</Text>
                <TextInput
                  style={styles.textInput}
                  value={newBill.name}
                  onChangeText={(text) =>
                    setNewBill((prev) => ({ ...prev, name: text }))
                  }
                  placeholder="예: 전기요금, 가스요금, 넷플릭스"
                  placeholderTextColor={Colors.light.placeholderText}
                  autoFocus
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>금액</Text>
                <TextInput
                  style={styles.textInput}
                  value={newBill.amount}
                  onChangeText={(text) =>
                    setNewBill((prev) => ({ ...prev, amount: text }))
                  }
                  placeholder="예: 120000"
                  placeholderTextColor={Colors.light.placeholderText}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>마감일</Text>
                <TextInput
                  style={styles.textInput}
                  value={newBill.dueDate}
                  onChangeText={(text) =>
                    setNewBill((prev) => ({ ...prev, dueDate: text }))
                  }
                  placeholder="예: 2024-12-31"
                  placeholderTextColor={Colors.light.placeholderText}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>분할 방식</Text>
                <View style={styles.splitOptions}>
                  {[
                    { key: "equal", label: "균등분할", icon: "people" },
                    { key: "custom", label: "커스텀", icon: "settings" },
                  ].map((split) => (
                    <TouchableOpacity
                      key={split.key}
                      style={[
                        styles.splitButton,
                        newBill.splitType === split.key &&
                          styles.splitButtonSelected,
                      ]}
                      onPress={() =>
                        setNewBill((prev) => ({
                          ...prev,
                          splitType: split.key as any,
                        }))
                      }
                    >
                      <Ionicons
                        name={split.icon as any}
                        size={20}
                        color={
                          newBill.splitType === split.key
                            ? "white"
                            : Colors.light.primary
                        }
                      />
                      <Text
                        style={[
                          styles.splitText,
                          newBill.splitType === split.key &&
                            styles.splitTextSelected,
                        ]}
                      >
                        {split.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>카테고리</Text>
                <View style={styles.categoryOptions}>
                  {[
                    { key: "utility", label: "공공요금" },
                    { key: "subscription", label: "구독서비스" },
                    { key: "maintenance", label: "관리비" },
                  ].map((category) => (
                    <TouchableOpacity
                      key={category.key}
                      style={[
                        styles.categoryButton,
                        newBill.category === category.key &&
                          styles.categoryButtonSelected,
                      ]}
                      onPress={() =>
                        setNewBill((prev) => ({
                          ...prev,
                          category: category.key as any,
                        }))
                      }
                    >
                      <Text
                        style={[
                          styles.categoryText,
                          newBill.category === category.key &&
                            styles.categoryTextSelected,
                        ]}
                      >
                        {category.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  (!newBill.name.trim() || !newBill.amount.trim()) &&
                    styles.confirmButtonDisabled,
                ]}
                onPress={addNewBill}
                disabled={!newBill.name.trim() || !newBill.amount.trim()}
              >
                <Text
                  style={[
                    styles.confirmButtonText,
                    (!newBill.name.trim() || !newBill.amount.trim()) &&
                      styles.confirmButtonTextDisabled,
                  ]}
                >
                  추가하기
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
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
  summaryContent: {
    padding: 24,
    alignItems: "center",
    backgroundColor: Colors.light.primary,
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
  roommatePayment: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.borderColor,
  },
  roommatePaymentPaid: {
    backgroundColor: Colors.light.accent,
    borderColor: Colors.light.successColor,
  },
  roommatePaymentText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: Colors.light.text,
    marginLeft: 8,
  },
  roommatePaymentTextPaid: {
    color: Colors.light.successColor,
  },
  roommatePaymentAmount: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.light.mutedText,
  },
  roommatePaymentAmountPaid: {
    color: Colors.light.successColor,
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
  completionStatus: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 24,
    flex: 1,
    maxHeight: "90%",
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderColor,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.light.text,
  },
  modalContent: {
    flex: 1,
    padding: 20,
    paddingBottom: 0,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.borderColor,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.light.text,
  },
  splitOptions: {
    flexDirection: "row",
    gap: 8,
  },
  splitButton: {
    flex: 1,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.borderColor,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "center",
  },
  splitButtonSelected: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  splitText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.light.text,
  },
  splitTextSelected: {
    color: "white",
  },
  categoryOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryButton: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.borderColor,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: "center",
  },
  categoryButtonSelected: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.light.text,
  },
  categoryTextSelected: {
    color: "white",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderColor,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.light.surfaceVariant,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.mutedText,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: Colors.light.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  confirmButtonDisabled: {
    backgroundColor: Colors.light.surfaceVariant,
    borderRadius: 12,
    opacity: 0.7,
  },
  confirmButtonTextDisabled: {
    color: Colors.light.mutedText,
  },
});
