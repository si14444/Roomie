import { Text, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Import new components
import { AddBillModal, type NewBill } from "@/components/bills/AddBillModal";
import { BillCard } from "@/components/bills/BillCard";
import { BillOptionsModal } from "@/components/bills/BillOptionsModal";
import { PaymentLinkModal } from "@/components/bills/PaymentLinkModal";
import { QuickActions } from "@/components/bills/QuickActions";
import { SummaryCard } from "@/components/bills/SummaryCard";

// Import custom hook
import type { Bill } from "@/hooks/useBillsFirebase";
import { PaymentLinkModalData, useBillsFirebase as useBills } from "@/hooks/useBillsFirebase";
import { AdBanner } from "@/components/ads/AdBanner";
import { useInterstitialAd } from "@/hooks/useInterstitialAd";

export default function BillsScreen() {
  const {
    bills,
    roommates,
    statistics,
    calculateSplit,
    addNewBill,
    togglePayment,
    getPaymentLinkModalData,
    showSettlement,
    showStatistics,
    canEditPayment,
    markBillAsPaid,
    extendDueDate,
    deleteBill,
    canDeleteBill, // 삭제 권한 체크 함수
  } = useBills();

  // 전면 광고 훅
  const { incrementAction, showAd } = useInterstitialAd();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newBill, setNewBill] = useState<NewBill>({
    name: "",
    amount: "",
    accountNumber: "",
    bank: "",
    splitType: "equal",
    customSplit: undefined,
    dueDate: "",
    category: "utility",
    icon: "flash-outline",
  });

  const handleAddBill = async () => {
    const success = await addNewBill(newBill);
    if (success) {
      setNewBill({
        name: "",
        amount: "",
        accountNumber: "",
        bank: "",
        splitType: "equal",
        customSplit: undefined,
        dueDate: "",
        category: "utility",
        icon: "flash-outline",
      });
      setShowAddModal(false);

      // 액션 카운트 증가 및 전면 광고 표시
      await incrementAction();
      await showAd();
    }
    // 실패 시 모달 유지 (오류 Alert만 표시)
  };

  // 송금 모달 상태
  const [paymentModalData, setPaymentModalData] =
    useState<PaymentLinkModalData | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // 공과금 옵션 모달 상태
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [showBillOptionsModal, setShowBillOptionsModal] = useState(false);

  const handlePressPaymentLink = (bill: Bill) => {
    const modalData = getPaymentLinkModalData(bill);
    if (modalData) {
      setPaymentModalData(modalData);
      setShowPaymentModal(true);
    } else {
      // 이미 모두 지불한 경우 등 Alert 대체
      // TODO: 커스텀 Alert로 대체 가능
      alert("모든 인원이 이미 지불했습니다.");
    }
  };

  const handleShowBillOptions = (bill: Bill) => {
    setSelectedBill(bill);
    setShowBillOptionsModal(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <SummaryCard
          totalAmount={statistics.totalAmount}
          perPersonAmount={statistics.perPersonAmount}
        />

        <QuickActions
          onAddBill={() => setShowAddModal(true)}
          onShowSettlement={showSettlement}
        />

        <View style={styles.billsList}>
          <Text style={styles.sectionTitle}>이번 달 청구서</Text>
          {bills.map((bill) => (
            <BillCard
              key={bill.id}
              bill={bill}
              roommates={roommates}
              calculateSplit={calculateSplit}
              onTogglePayment={togglePayment}
              onPressPaymentLink={handlePressPaymentLink}
              onShowBillOptions={handleShowBillOptions}
              canEditPayment={canEditPayment}
            />
          ))}
        </View>

        {/* <PaymentMethods /> */}

        {/* <RoommateStats roommateStats={statistics.roommateStats} /> */}
      </ScrollView>

      {/* 하단 배너 광고 */}
      <AdBanner position="bottom" />

      <AddBillModal
        visible={showAddModal}
        newBill={newBill}
        setNewBill={setNewBill}
        onClose={() => setShowAddModal(false)}
        onAddBill={handleAddBill}
      />
      {showPaymentModal && paymentModalData && (
        <PaymentLinkModal
          visible={showPaymentModal}
          data={paymentModalData}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
      
      <BillOptionsModal
        visible={showBillOptionsModal}
        bill={selectedBill}
        onClose={() => setShowBillOptionsModal(false)}
        onMarkAsPaid={markBillAsPaid}
        onExtendDueDate={extendDueDate}
        onDelete={deleteBill}
        canDelete={selectedBill ? canDeleteBill(selectedBill) : false}
      />
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
  billsList: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: 16,
  },
});
