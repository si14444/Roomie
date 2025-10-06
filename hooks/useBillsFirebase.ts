import { useState, useMemo, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNotificationContext } from "@/contexts/NotificationContext";
import { useTeam } from "@/contexts/TeamContext";
import { useAuth } from "@/contexts/AuthContext";
import * as teamService from "@/services/teamService";
import * as billService from "@/services/billService";
import {
  useBillsQuery,
  useCreateBill,
  useUpdateBill,
  useDeleteBill,
  useCreateBillPayment,
} from "./useBillsQuery";

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  category: "utility" | "subscription" | "maintenance";
  icon: keyof typeof Ionicons.glyphMap;
  splitType: "equal" | "custom";
  customSplit?: { [roommate: string]: number };
  status: "pending" | "paid" | "overdue";
  accountNumber?: string;
  bank?: string;
  payments: { [roommate: string]: boolean };
  createdBy: string;
}

interface Roommate {
  name: string;
  totalDebt: number;
  paidAmount: number;
}

export interface PaymentLinkModalData {
  bill: Bill;
  unpaidRoommates: string[];
  amount: number;
  paymentMethods: { name: string; icon: string }[];
}

export function useBillsFirebase() {
  const { createNotification } = useNotificationContext();
  const { currentTeam } = useTeam();
  const { user } = useAuth();
  const [roommates, setRoommates] = useState<string[]>([]);
  const [paymentsMap, setPaymentsMap] = useState<Record<string, billService.BillPayment[]>>({});
  const [currentUserIsLeader, setCurrentUserIsLeader] = useState(false);

  // TanStack Query hooks for Firebase
  const { data: firebaseBills = [], isLoading } = useBillsQuery(currentTeam?.id);
  const createBillMutation = useCreateBill();
  const updateBillMutation = useUpdateBill();
  const deleteBillMutation = useDeleteBill();
  const createPaymentMutation = useCreateBillPayment();

  const currentUser = user?.name || user?.email || "Unknown User";

  // Load team members and check if current user is leader
  useEffect(() => {
    const loadTeamMembers = async () => {
      if (!currentTeam?.id || !user?.id) return;

      try {
        const members = await teamService.getTeamMembers(currentTeam.id);
        const { getUserFromFirestore } = await import("@/services/authService");

        const memberNames = await Promise.all(
          members.map(async (member) => {
            const userData = await getUserFromFirestore(member.user_id);

            // 현재 사용자가 방장인지 확인
            if (member.user_id === user.id && member.is_leader) {
              setCurrentUserIsLeader(true);
            }

            return userData?.name || userData?.email || "Unknown";
          })
        );

        setRoommates(memberNames);
      } catch (error) {
        console.error("Error loading team members:", error);
        setRoommates([]);
        setCurrentUserIsLeader(false);
      }
    };

    if (currentTeam?.id && user?.id) {
      loadTeamMembers();
    }
  }, [currentTeam?.id, user?.id]);

  // Subscribe to bill payments real-time updates (TanStack Query 실시간 리스너)
  useEffect(() => {
    if (firebaseBills.length === 0) {
      setPaymentsMap({});
      return;
    }

    const billIds = firebaseBills.map(bill => bill.id);

    const unsubscribe = billService.subscribeToTeamBillPayments(
      currentTeam?.id || '',
      billIds,
      (paymentsData) => {
        // 실시간 업데이트로 paymentsMap 자동 갱신
        setPaymentsMap(paymentsData);
      },
      (error) => {
        console.error('Bill payments subscription error:', error);
      }
    );

    return () => unsubscribe();
  }, [firebaseBills, currentTeam?.id]);

  const mapFirebaseToLocal = (
    fbBill: billService.Bill,
    payments: billService.BillPayment[]
  ): Bill => {
    // Map category
    const categoryMap: { [key: string]: "utility" | "subscription" | "maintenance" } = {
      utilities: "utility",
      rent: "utility",
      internet: "utility",
      food: "subscription",
      other: "maintenance",
    };

    // Create payments map - 개인별 지불 현황 Firebase 연동
    const paymentsByMember: { [roommate: string]: boolean } = {};
    roommates.forEach((roommate) => {
      const hasPayment = payments.some((p) => p.paid_by_name === roommate);
      paymentsByMember[roommate] = hasPayment;
    });

    // Determine status - 전부 지불했는지 확인
    const allPaid = roommates.length > 0 && Object.values(paymentsByMember).every((paid) => paid);
    const isOverdue = new Date(fbBill.due_date) < new Date() && !allPaid;
    const status = allPaid ? "paid" : isOverdue ? "overdue" : "pending";

    return {
      id: fbBill.id,
      name: fbBill.title,
      amount: fbBill.total_amount,
      dueDate: fbBill.due_date,
      category: categoryMap[fbBill.category] || "utility",
      icon: getIconForCategory(categoryMap[fbBill.category] || "utility", fbBill.title),
      splitType: "equal",
      status,
      accountNumber: fbBill.account_number,
      bank: fbBill.bank_name,
      payments: paymentsByMember,
      createdBy: fbBill.created_by,
    };
  };

  const getIconForCategory = (
    category: string,
    name: string
  ): keyof typeof Ionicons.glyphMap => {
    const nameLower = name.toLowerCase();

    if (nameLower.includes("전기")) return "flash-outline";
    if (nameLower.includes("가스")) return "flame-outline";
    if (nameLower.includes("수도") || nameLower.includes("물")) return "water-outline";
    if (nameLower.includes("인터넷") || nameLower.includes("wifi")) return "wifi-outline";
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

  // Transform Firebase bills to local format
  const bills: Bill[] = useMemo(() => {
    return firebaseBills.map((fbBill) => mapFirebaseToLocal(fbBill, paymentsMap[fbBill.id] || []));
  }, [firebaseBills, paymentsMap]);

  const calculateSplit = useCallback(
    (
      amount: number,
      splitType: "equal" | "custom",
      customSplit?: { [roommate: string]: number },
      roommate?: string
    ) => {
      if (splitType === "equal") {
        return Math.round(amount / roommates.length);
      } else if (splitType === "custom" && customSplit && roommate) {
        return customSplit[roommate] || 0;
      }
      return Math.round(amount / roommates.length);
    },
    [roommates.length]
  );

  const statistics = useMemo(() => {
    const totalAmount = bills.reduce((sum, bill) => sum + bill.amount, 0);
    const paidAmount = bills
      .filter((bill) => bill.status === "paid")
      .reduce((sum, bill) => sum + bill.amount, 0);

    const overdueAmount = bills
      .filter((bill) => bill.status === "overdue")
      .reduce((sum, bill) => sum + bill.amount, 0);

    const perPersonAmount = Math.round(totalAmount / (roommates.length || 1));

    const roommateStats: Roommate[] = roommates.map((roommate) => {
      let totalDebt = 0;
      let paidAmount = 0;

      bills.forEach((bill) => {
        const individualAmount = calculateSplit(
          bill.amount,
          bill.splitType,
          bill.customSplit,
          roommate
        );
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
  }, [bills, roommates, calculateSplit]);

  const addNewBill = useCallback(
    async (newBill: {
      name: string;
      amount: string;
      accountNumber: string;
      bank: string;
      splitType: "equal" | "custom";
      customSplit?: { [roommate: string]: number };
      dueDate: string;
      category: "utility" | "subscription" | "maintenance";
    }) => {
      if (!newBill.name.trim() || !newBill.amount.trim()) {
        Alert.alert("오류", "공과금 이름과 금액을 입력해주세요.");
        return false;
      }

      // 총액이 숫자인지 확인
      if (isNaN(Number(newBill.amount.trim()))) {
        Alert.alert("오류", "총액은 숫자만 입력 가능합니다.");
        return false;
      }

      // 계좌번호가 입력되었고, 숫자가 아니면 오류
      if (newBill.accountNumber.trim() && isNaN(Number(newBill.accountNumber.trim()))) {
        Alert.alert("오류", "계좌번호는 숫자만 입력 가능합니다.");
        return false;
      }

      if (!newBill.dueDate.trim()) {
        Alert.alert("오류", "마감일을 입력해주세요.");
        return false;
      }

      if (!currentTeam?.id || !user?.id) {
        Alert.alert("오류", "팀 또는 사용자 정보가 없습니다.");
        return false;
      }

      try {
        const categoryMap: { [key: string]: billService.Bill["category"] } = {
          utility: "utilities",
          subscription: "other",
          maintenance: "other",
        };

        const billData = {
          team_id: currentTeam.id,
          title: newBill.name.trim(),
          total_amount: parseInt(newBill.amount.trim()),
          category: categoryMap[newBill.category],
          due_date: newBill.dueDate.trim(),
          is_recurring: false,
          account_number: newBill.accountNumber,
          bank_name: newBill.bank,
          created_by: user.id,
        };

        const createdBill = await createBillMutation.mutateAsync(billData);

        createNotification({
          title: "공과금 추가",
          message: `${createdBill.title} 청구서가 등록되었습니다 (₩${createdBill.total_amount.toLocaleString()})`,
          type: "bill_added",
          relatedId: createdBill.id,
        });

        Alert.alert("성공", "새 공과금이 추가되었습니다!");
        return true;
      } catch (error) {
        console.error("Error creating bill:", error);
        Alert.alert("오류", "공과금 추가에 실패했습니다. 다시 시도해주세요.");
        return false;
      }
    },
    [currentTeam?.id, user?.id, createNotification, createBillMutation]
  );

  const canEditPayment = useCallback(
    (roommate: string) => {
      return roommate === currentUser;
    },
    [currentUser]
  );

  const togglePayment = useCallback(
    async (billId: string, roommate: string) => {
      if (!canEditPayment(roommate)) {
        Alert.alert("권한 없음", "본인의 송금 상태만 변경할 수 있습니다.", [{ text: "확인" }]);
        return;
      }

      if (!user?.id) {
        Alert.alert("오류", "로그인이 필요합니다.");
        return;
      }

      try {
        const bill = bills.find((b) => b.id === billId);
        if (!bill) return;

        const currentPaymentStatus = bill.payments[roommate];

        if (!currentPaymentStatus) {
          const paymentAmount = calculateSplit(
            bill.amount,
            bill.splitType,
            bill.customSplit,
            roommate
          );

          // Optimistic Update: 즉시 로컬 상태 업데이트
          const optimisticPayment: billService.BillPayment = {
            id: `temp-${Date.now()}`,
            bill_id: billId,
            paid_by: user.id,
            paid_by_name: user.name || user.email || "사용자",
            amount: paymentAmount,
            paid_at: new Date().toISOString(),
            payment_method: '',
          };

          setPaymentsMap((prev) => ({
            ...prev,
            [billId]: [...(prev[billId] || []), optimisticPayment],
          }));

          // Firebase에 실제 저장
          await createPaymentMutation.mutateAsync({
            bill_id: billId,
            paid_by: user.id,
            paid_by_name: user.name || user.email || "사용자",
            amount: paymentAmount,
          });

          const allOthersPaid = Object.entries(bill.payments)
            .filter(([name]) => name !== roommate)
            .every(([, paid]) => paid);

          if (allOthersPaid) {
            createNotification({
              title: "지불 완료",
              message: `${bill.name} 공과금 정산이 완료되었습니다`,
              type: "payment_received",
              relatedId: billId,
            });
          }

          Alert.alert("완료", "결제가 완료되었습니다.");
        } else {
          Alert.alert("알림", "이미 완료된 결제는 취소할 수 없습니다. 관리자에게 문의하세요.", [
            { text: "확인" },
          ]);
        }
      } catch (error) {
        console.error("Error toggling payment:", error);
        Alert.alert("오류", "결제 상태 변경에 실패했습니다.");

        // 에러 발생 시 Optimistic Update 롤백은 실시간 리스너가 처리
      }
    },
    [bills, user, createNotification, canEditPayment, calculateSplit, createPaymentMutation]
  );

  const markBillAsPaid = useCallback(
    async (billId: string) => {
      if (!currentTeam?.id || !user?.id) {
        Alert.alert("오류", "팀 또는 사용자 정보가 없습니다.");
        return;
      }

      try {
        const bill = bills.find((b) => b.id === billId);
        if (!bill) return;

        const unpaidRoommates = Object.entries(bill.payments)
          .filter(([, paid]) => !paid)
          .map(([roommate]) => roommate);

        for (const roommate of unpaidRoommates) {
          const paymentAmount = calculateSplit(
            bill.amount,
            bill.splitType,
            bill.customSplit,
            roommate
          );
          await createPaymentMutation.mutateAsync({
            bill_id: billId,
            paid_by: user.id,
            paid_by_name: roommate,
            amount: paymentAmount,
            payment_method: "manual_completion",
          });
        }

        Alert.alert("완료", "모든 인원의 지불이 완료로 처리되었습니다.");
      } catch (error) {
        console.error("Error marking bill as paid:", error);
        Alert.alert("오류", "지불 완료 처리에 실패했습니다.");
      }
    },
    [bills, currentTeam?.id, user?.id, calculateSplit, createPaymentMutation]
  );

  const extendDueDate = useCallback(
    async (billId: string) => {
      try {
        const bill = bills.find((b) => b.id === billId);
        if (!bill) return;

        const currentDueDate = new Date(bill.dueDate);
        const extendedDate = new Date(currentDueDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        const newDueDate = extendedDate.toISOString().split("T")[0];

        await updateBillMutation.mutateAsync({
          billId,
          updates: {
            due_date: newDueDate,
          },
        });

        Alert.alert("연장 완료", `마감일이 ${newDueDate}로 연장되었습니다.`);
      } catch (error) {
        console.error("Error extending due date:", error);
        Alert.alert("오류", "마감일 연장에 실패했습니다.");
      }
    },
    [bills, updateBillMutation]
  );

  const deleteBill = useCallback(
    async (billId: string) => {
      const bill = bills.find((b) => b.id === billId);

      // 삭제 권한 확인: 작성자 또는 방장만 삭제 가능
      const isCreator = bill?.createdBy === user?.id;
      const canDelete = isCreator || currentUserIsLeader;

      if (!canDelete) {
        Alert.alert("권한 없음", "공과금을 삭제할 권한이 없습니다. 작성자 또는 방장만 삭제할 수 있습니다.", [
          { text: "확인" }
        ]);
        return;
      }

      Alert.alert("공과금 삭제", `"${bill?.name}" 공과금을 삭제하시겠습니까?`, [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteBillMutation.mutateAsync(billId);
              Alert.alert("삭제 완료", "공과금이 삭제되었습니다.");
            } catch (error) {
              console.error("Error deleting bill:", error);
              Alert.alert("오류", "공과금 삭제에 실패했습니다.");
            }
          },
        },
      ]);
    },
    [bills, deleteBillMutation, user?.id, currentUserIsLeader]
  );

  const getPaymentLinkModalData = (bill: Bill): PaymentLinkModalData | null => {
    const unpaidRoommates = roommates.filter((roommate) => !bill.payments[roommate]);
    if (unpaidRoommates.length === 0) {
      return null;
    }
    if (bill.splitType === "custom" && bill.customSplit) {
      const paymentMethods = [{ name: "계좌복사", icon: "copy" }];
      return { bill, unpaidRoommates, amount: 0, paymentMethods };
    }
    const amount = calculateSplit(bill.amount, bill.splitType);
    const paymentMethods = [{ name: "계좌복사", icon: "copy" }];
    return { bill, unpaidRoommates, amount, paymentMethods };
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
    if (statistics.roommateStats.length === 0) return "없음";
    const mvp = statistics.roommateStats.reduce((max, current) =>
      current.paidAmount > max.paidAmount ? current : max
    );
    return mvp.name;
  };

  const sendPaymentReminder = () => {
    Alert.alert("송금 요청", "모든 룸메이트에게 미납 공과금 알림을 보냈습니다!", [
      { text: "확인" },
    ]);
  };

  // Helper function to check delete permission
  const canDeleteBill = useCallback(
    (bill: Bill): boolean => {
      const isCreator = bill.createdBy === user?.id;
      return isCreator || currentUserIsLeader;
    },
    [user?.id, currentUserIsLeader]
  );

  return {
    bills,
    roommates,
    statistics,
    isLoading,
    error: null,
    calculateSplit,
    addNewBill,
    togglePayment,
    getPaymentLinkModalData,
    showSettlement,
    showStatistics,
    canEditPayment,
    currentUser,
    markBillAsPaid,
    extendDueDate,
    deleteBill,
    canDeleteBill, // 삭제 권한 체크 함수 export
    refreshData: () => {}, // Real-time updates handle this
  };
}
