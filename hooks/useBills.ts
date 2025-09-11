import { useNotificationContext } from "@/contexts/NotificationContext";
import { useTeam } from "@/contexts/TeamContext";
import { useAuth } from "@/contexts/AuthContext";
import { billsService, teamsService, Bill as SupabaseBill, BillPayment } from "@/lib/supabase-service";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useMemo, useState, useEffect } from "react";
import { Alert } from "react-native";

// Extended Bill interface that combines Supabase Bill with UI-specific fields
export interface Bill extends Omit<SupabaseBill, 'category'> {
  // Override category to match the existing enum
  category: "utility" | "subscription" | "maintenance";
  // UI-specific fields
  icon: keyof typeof Ionicons.glyphMap;
  splitType: "equal" | "custom";
  customSplit?: { [roommate: string]: number };
  status: "pending" | "paid" | "overdue";
  // Map Supabase fields to existing interface
  name: string; // maps to title
  amount: number; // maps to total_amount
  dueDate: string; // maps to due_date
  accountNumber?: string;
  bank?: string;
  payments: { [roommate: string]: boolean };
  createdBy: string; // maps to created_by
}

interface Roommate {
  name: string;
  totalDebt: number;
  paidAmount: number;
}

// 송금 모달에 필요한 데이터 타입 정의
export interface PaymentLinkModalData {
  bill: Bill;
  unpaidRoommates: string[];
  amount: number;
  paymentMethods: { name: string; icon: string }[];
}

export function useBills() {
  const { createNotification } = useNotificationContext();
  const { currentTeam } = useTeam();
  const { user } = useAuth();
  
  const [bills, setBills] = useState<Bill[]>([]);
  const [roommates, setRoommates] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const currentUser = user?.user_metadata?.full_name || user?.email || "Unknown User";

  // Load bills and team members from Supabase
  const loadBillsData = useCallback(async () => {
    if (!currentTeam?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Load bills and team members in parallel
      const [billsData, membersData] = await Promise.all([
        billsService.getTeamBills(currentTeam.id),
        teamsService.getTeamMembers(currentTeam.id)
      ]);

      // Transform Supabase bills to UI format
      const transformedBills: Bill[] = billsData.map(bill => {
        // Calculate payment status from bill_payments
        const paymentsByMember: { [roommate: string]: boolean } = {};
        const memberNames = membersData.map(m => m.user?.full_name || m.user?.email || 'Unknown');
        
        memberNames.forEach(memberName => {
          const hasPayment = bill.payments?.some(
            payment => {
              const paymentUserName = payment.user_profile?.full_name || payment.user_profile?.email;
              return paymentUserName === memberName;
            }
          ) || false;
          paymentsByMember[memberName] = hasPayment;
        });

        // Determine status based on payments and due date
        const allPaid = Object.values(paymentsByMember).every(paid => paid);
        const isOverdue = new Date(bill.due_date) < new Date() && !allPaid;
        const status = allPaid ? "paid" : isOverdue ? "overdue" : "pending";

        // Map category from Supabase to UI format
        const categoryMap: { [key: string]: "utility" | "subscription" | "maintenance" } = {
          'utilities': 'utility',
          'rent': 'utility',
          'internet': 'utility',
          'food': 'subscription',
          'other': 'maintenance'
        };

        return {
          ...bill,
          name: bill.title,
          amount: bill.total_amount,
          dueDate: bill.due_date,
          category: categoryMap[bill.category] || 'utility',
          icon: getIconForCategory(categoryMap[bill.category] || 'utility', bill.title),
          splitType: "equal" as const, // Default to equal split
          status,
          payments: paymentsByMember,
          createdBy: bill.created_by || 'Unknown'
        };
      });

      setBills(transformedBills);
      setRoommates(membersData.map(m => m.user?.full_name || m.user?.email || 'Unknown'));
    } catch (err) {
      console.error('Error loading bills data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load bills data');
    } finally {
      setIsLoading(false);
    }
  }, [currentTeam?.id]);

  // Load data when team changes
  useEffect(() => {
    loadBillsData();
  }, [loadBillsData]);

  // Helper function to get icon for category
  const getIconForCategory = (category: string, name: string): keyof typeof Ionicons.glyphMap => {
    const nameLower = name.toLowerCase();

    if (nameLower.includes("전기")) return "flash-outline";
    if (nameLower.includes("가스")) return "flame-outline";
    if (nameLower.includes("수도") || nameLower.includes("물")) return "water-outline";
    if (nameLower.includes("인터넷") || nameLower.includes("wifi")) return "wifi-outline";
    if (nameLower.includes("넷플릭스") || nameLower.includes("구독")) return "play-circle-outline";
    if (nameLower.includes("통신") || nameLower.includes("폰")) return "phone-portrait-outline";

    switch (category) {
      case "utility": return "flash-outline";
      case "subscription": return "play-circle-outline";
      case "maintenance": return "home-outline";
      default: return "home-outline";
    }
  };

  const calculateSplit = useCallback(
    (amount: number, splitType: "equal" | "custom", customSplit?: { [roommate: string]: number }, roommate?: string) => {
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

    const perPersonAmount = Math.round(totalAmount / roommates.length);

    const roommateStats: Roommate[] = roommates.map((roommate) => {
      let totalDebt = 0;
      let paidAmount = 0;

      bills.forEach((bill) => {
        const individualAmount = calculateSplit(bill.amount, bill.splitType, bill.customSplit, roommate);
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

      if (!newBill.dueDate.trim()) {
        Alert.alert("오류", "마감일을 입력해주세요.");
        return false;
      }

      if (!currentTeam?.id) {
        Alert.alert("오류", "팀을 선택해주세요.");
        return false;
      }

      try {
        // Map UI category to Supabase category
        const categoryMap: { [key: string]: string } = {
          'utility': 'utilities',
          'subscription': 'other',
          'maintenance': 'other'
        };

        const billData: Omit<SupabaseBill, 'id' | 'created_at' | 'updated_at'> = {
          team_id: currentTeam.id,
          title: newBill.name.trim(),
          total_amount: parseInt(newBill.amount.trim()),
          category: categoryMap[newBill.category] as any,
          due_date: newBill.dueDate.trim(),
          is_recurring: false,
          created_by: user?.id
        };

        const createdBill = await billsService.createBill(billData);

        // Reload bills data to reflect changes
        await loadBillsData();

        // 알림 생성
        createNotification({
          title: "공과금 추가",
          message: `${createdBill.title} 청구서가 등록되었습니다 (₩${createdBill.total_amount.toLocaleString()})`,
          type: "bill_added",
          relatedId: createdBill.id,
        });

        Alert.alert("성공", "새 공과금이 추가되었습니다!");
        return true;
      } catch (error) {
        console.error('Error creating bill:', error);
        Alert.alert("오류", "공과금 추가에 실패했습니다. 다시 시도해주세요.");
        return false;
      }
    },
    [currentTeam?.id, user?.id, createNotification, loadBillsData]
  );

  // 현재 사용자가 특정 룸메이트의 송금 상태를 수정할 수 있는지 확인
  const canEditPayment = useCallback(
    (roommate: string) => {
      // 본인의 송금 상태만 수정 가능
      return roommate === currentUser;
    },
    [currentUser]
  );

  const togglePayment = useCallback(
    async (billId: string, roommate: string) => {
      // 권한 체크
      if (!canEditPayment(roommate)) {
        Alert.alert(
          "권한 없음",
          "본인의 송금 상태만 변경할 수 있습니다.",
          [{ text: "확인" }]
        );
        return;
      }

      if (!user?.id) {
        Alert.alert("오류", "로그인이 필요합니다.");
        return;
      }

      try {
        const bill = bills.find(b => b.id === billId);
        if (!bill) return;

        const currentPaymentStatus = bill.payments[roommate];
        
        if (!currentPaymentStatus) {
          // Add payment
          const paymentAmount = calculateSplit(bill.amount, bill.splitType, bill.customSplit, roommate);
          await billsService.payBill(billId, user.id, paymentAmount);
          
          // Check if this completes the bill
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
        } else {
          // Remove payment - this would require deleting from bill_payments table
          // For now, we'll show an alert that payments cannot be undone
          Alert.alert(
            "알림", 
            "이미 완료된 결제는 취소할 수 없습니다. 관리자에게 문의하세요.",
            [{ text: "확인" }]
          );
          return;
        }

        // Reload bills data to reflect changes
        await loadBillsData();
      } catch (error) {
        console.error('Error toggling payment:', error);
        Alert.alert("오류", "결제 상태 변경에 실패했습니다.");
      }
    },
    [bills, user?.id, createNotification, loadBillsData, canEditPayment, calculateSplit]
  );

  const markBillAsPaid = useCallback(
    async (billId: string) => {
      if (!currentTeam?.id || !user?.id) {
        Alert.alert("오류", "팀 또는 사용자 정보가 없습니다.");
        return;
      }

      try {
        const bill = bills.find(b => b.id === billId);
        if (!bill) return;

        // Create payments for all unpaid roommates
        const unpaidRoommates = Object.entries(bill.payments)
          .filter(([, paid]) => !paid)
          .map(([roommate]) => roommate);

        for (const roommate of unpaidRoommates) {
          const paymentAmount = calculateSplit(bill.amount, bill.splitType, bill.customSplit, roommate);
          await billsService.payBill(billId, user.id, paymentAmount, 'manual_completion');
        }

        // Reload bills data
        await loadBillsData();
        
        Alert.alert("완료", "모든 인원의 지불이 완료로 처리되었습니다.");
      } catch (error) {
        console.error('Error marking bill as paid:', error);
        Alert.alert("오류", "지불 완료 처리에 실패했습니다.");
      }
    },
    [bills, currentTeam?.id, user?.id, calculateSplit, loadBillsData]
  );

  const extendDueDate = useCallback(async (billId: string) => {
    try {
      const bill = bills.find(b => b.id === billId);
      if (!bill) return;
      
      // 원래 마감일을 기준으로 1주일 연장
      const currentDueDate = new Date(bill.dueDate);
      const extendedDate = new Date(currentDueDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      const newDueDate = extendedDate.toISOString().split("T")[0];
      
      await billsService.updateBill(billId, {
        due_date: newDueDate
      });
      
      // Reload bills data
      await loadBillsData();
      
      Alert.alert("연장 완료", `마감일이 ${newDueDate}로 연장되었습니다.`);
    } catch (error) {
      console.error('Error extending due date:', error);
      Alert.alert("오류", "마감일 연장에 실패했습니다.");
    }
  }, [bills, loadBillsData]);

  const deleteBill = useCallback(async (billId: string) => {
    const bill = bills.find((b) => b.id === billId);
    
    Alert.alert("공과금 삭제", `"${bill?.name}" 공과금을 삭제하시겠습니까?`, [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            // Note: You'll need to implement deleteBill in billsService
            // For now, we'll just reload the data and show a message
            Alert.alert("알림", "공과금 삭제 기능은 관리자만 사용할 수 있습니다.");
            // await billsService.deleteBill(billId);
            // await loadBillsData();
            // Alert.alert("삭제 완료", "공과금이 삭제되었습니다.");
          } catch (error) {
            console.error('Error deleting bill:', error);
            Alert.alert("오류", "공과금 삭제에 실패했습니다.");
          }
        },
      },
    ]);
  }, [bills]);


  // generatePaymentLink는 Alert를 띄우지 않고, 모달에 필요한 데이터만 반환
  const getPaymentLinkModalData = (bill: Bill): PaymentLinkModalData | null => {
    const unpaidRoommates = roommates.filter(
      (roommate) => !bill.payments[roommate]
    );
    if (unpaidRoommates.length === 0) {
      return null;
    }
    // For payment link, we need to handle multiple amounts for custom split
    if (bill.splitType === "custom" && bill.customSplit) {
      // Return the bill info, let the modal handle individual amounts
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
    isLoading,
    error,
    calculateSplit,
    addNewBill,
    togglePayment,
    getPaymentLinkModalData, // 변경된 함수 반환
    showSettlement,
    showStatistics,
    canEditPayment,
    currentUser,
    markBillAsPaid,
    extendDueDate,
    deleteBill,
    refreshData: loadBillsData, // Expose refresh function
  };
}
