import React, { useState } from "react";
import { StyleSheet, ScrollView } from "react-native";
import { Text, View } from "@/components/Themed";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "@/constants/Colors";

// Import new components
import { SummaryCard } from "@/components/bills/SummaryCard";
import { QuickActions } from "@/components/bills/QuickActions";
import { BillCard } from "@/components/bills/BillCard";
import { PaymentMethods } from "@/components/bills/PaymentMethods";
import { RoommateStats } from "@/components/bills/RoommateStats";
import { AddBillModal } from "@/components/bills/AddBillModal";

// Import custom hook
import { useBills } from "@/hooks/useBills";

export default function BillsScreen() {
  const {
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
              onGeneratePaymentLink={generatePaymentLink}
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
