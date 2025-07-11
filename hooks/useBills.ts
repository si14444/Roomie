import { useState, useMemo } from "react";
import { Alert } from "react-native";
import { useNotificationContext } from "@/contexts/NotificationContext";
import { Ionicons } from "@expo/vector-icons";

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

export function useBills() {
  const { createNotification } = useNotificationContext();
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

  const addNewBill = (newBill: {
    name: string;
    amount: string;
    splitType: "equal" | "custom";
    dueDate: string;
    category: "utility" | "subscription" | "maintenance";
  }) => {
    if (!newBill.name.trim() || !newBill.amount.trim()) {
      Alert.alert("오류", "공과금 이름과 금액을 입력해주세요.");
      return false;
    }

    if (!newBill.dueDate.trim()) {
      Alert.alert("오류", "마감일을 입력해주세요.");
      return false;
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

    // 알림 생성
    createNotification({
      title: "공과금 추가",
      message: `${
        bill.name
      } 청구서가 등록되었습니다 (₩${bill.amount.toLocaleString()})`,
      type: "bill_added",
      relatedId: bill.id.toString(),
    });

    Alert.alert("성공", "새 공과금이 추가되었습니다!");
    return true;
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
          const wasJustCompleted = allPaid && bill.status !== "paid";

          // 지불이 방금 완료되었을 때 알림 생성
          if (wasJustCompleted) {
            createNotification({
              title: "지불 완료",
              message: `${bill.name} 공과금 정산이 완료되었습니다`,
              type: "payment_received",
              relatedId: bill.id.toString(),
            });
          }

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

  return {
    bills,
    roommates,
    statistics,
    calculateSplit,
    addNewBill,
    togglePayment,
    showBillOptions,
    generatePaymentLink,
    showSettlement,
    showStatistics,
  };
}
