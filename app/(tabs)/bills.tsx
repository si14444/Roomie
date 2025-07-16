import { Text, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Import new components
import { AddBillModal } from "@/components/bills/AddBillModal";
import { BillCard } from "@/components/bills/BillCard";
import { PaymentLinkModal } from "@/components/bills/PaymentLinkModal";
import { PaymentMethods } from "@/components/bills/PaymentMethods";
import { QuickActions } from "@/components/bills/QuickActions";
import { RoommateStats } from "@/components/bills/RoommateStats";
import { SummaryCard } from "@/components/bills/SummaryCard";

// Import custom hook
import type { Bill } from "@/hooks/useBills";
import { PaymentLinkModalData, useBills } from "@/hooks/useBills";

export default function BillsScreen() {
  const {
    bills,
    roommates,
    statistics,
    calculateSplit,
    addNewBill,
    togglePayment,
    showBillOptions,
    getPaymentLinkModalData,
    showSettlement,
    showStatistics,
  } = useBills();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newBill, setNewBill] = useState({
    name: "",
    amount: "",
    splitType: "equal" as "equal" | "custom",
    dueDate: "",
    category: "utility" as "utility" | "subscription" | "maintenance",
    icon: "flash-outline" as any,
  });

  const handleAddBill = () => {
    const success = addNewBill(newBill);
    if (success) {
      setNewBill({
        name: "",
        amount: "",
        splitType: "equal",
        dueDate: "",
        category: "utility",
        icon: "flash-outline",
      });
      setShowAddModal(false);
    }
  };

  // 송금 모달 상태
  const [paymentModalData, setPaymentModalData] =
    useState<PaymentLinkModalData | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

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
          onShowStatistics={showStatistics}
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
              onShowBillOptions={showBillOptions}
            />
          ))}
        </View>

        <PaymentMethods />

        <RoommateStats roommateStats={statistics.roommateStats} />
      </ScrollView>

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
