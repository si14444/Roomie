import Colors from "@/constants/Colors";
import type { PaymentLinkModalData } from "@/hooks/useBills";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface PaymentLinkModalProps {
  visible: boolean;
  data: PaymentLinkModalData;
  onClose: () => void;
}

export function PaymentLinkModal({
  visible,
  data,
  onClose,
}: PaymentLinkModalProps) {
  const [completed, setCompleted] = useState<string | null>(null);

  if (!data) return null;

  const handleSelect = (method: { name: string; icon: string }) => {
    setCompleted(method.name);
    // 실제 송금 링크 생성/복사 로직은 추후 구현
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <Text style={styles.title}>송금 링크 생성</Text>
          <Text style={styles.billName}>{data.bill.name}</Text>
          <Text style={styles.amount}>
            금액: ₩{data.amount.toLocaleString()}
          </Text>
          <Text style={styles.desc}>송금 방법을 선택하세요:</Text>
          <View style={styles.methodRow}>
            <TouchableOpacity
              style={styles.methodButton}
              onPress={() => handleSelect(data.paymentMethods[0])}
              disabled={!!completed}
            >
              <Ionicons
                name={data.paymentMethods[0].icon as any}
                size={22}
                color={Colors.light.primary}
              />
              <Text style={styles.methodText}>
                {data.paymentMethods[0].name}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.methodButton, styles.closeButtonHorizon]}
              onPress={onClose}
            >
              <Ionicons name="close" size={22} color={Colors.light.mutedText} />
              <Text style={[styles.methodText, styles.closeTextHorizon]}>
                닫기
              </Text>
            </TouchableOpacity>
          </View>
          {completed && (
            <View style={styles.resultBox}>
              <Text style={styles.resultText}>
                {completed} 링크가 생성되어 미납자들에게 전송되었습니다!
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    minWidth: 300,
    maxWidth: 340,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.light.primary,
    marginBottom: 8,
  },
  billName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 4,
  },
  amount: {
    fontSize: 15,
    color: Colors.light.text,
    marginBottom: 10,
  },
  desc: {
    fontSize: 14,
    color: Colors.light.mutedText,
    marginBottom: 12,
  },
  methodRow: {
    flexDirection: "row",
    gap: 14,
    width: "100%",
    marginBottom: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  methodButton: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    paddingVertical: 22,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 0,
    flexDirection: "column",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    minWidth: 120,
    maxWidth: 200,
  },
  methodText: {
    marginTop: 8,
    fontSize: 16,
    color: Colors.light.primary,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  resultBox: {
    marginBottom: 10,
    marginTop: 8,
    backgroundColor: Colors.light.accent,
    borderRadius: 8,
    padding: 10,
  },
  resultText: {
    color: Colors.light.primary,
    fontSize: 14,
    textAlign: "center",
  },
  closeButton: {
    marginTop: 8,
    alignItems: "center",
    width: "100%",
    borderRadius: 8,
    paddingVertical: 10,
    backgroundColor: "#F5F5F5",
    minHeight: 36,
    alignSelf: "center",
  },
  closeText: {
    color: Colors.light.mutedText,
    fontSize: 15,
    fontWeight: "600",
  },
  closeButtonHorizon: {
    backgroundColor: "#F5F5F5",
  },
  closeTextHorizon: {
    color: Colors.light.mutedText,
    fontWeight: "600",
  },
});
