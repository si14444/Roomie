import Colors from "@/constants/Colors";
import type { PaymentLinkModalData } from "@/hooks/useBills";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Alert, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Clipboard from "expo-clipboard";

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
  const [copied, setCopied] = useState(false);

  if (!data) return null;

  const handleCopyAccount = async () => {
    const accountInfo = "국민은행 123456-78-901234 김철수";
    try {
      await Clipboard.setStringAsync(accountInfo);
      setCopied(true);
      Alert.alert("복사 완료", "계좌 정보가 클립보드에 복사되었습니다!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      Alert.alert("복사 실패", "계좌 정보 복사에 실패했습니다.");
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <Text style={styles.title}>송금 정보</Text>
          <Text style={styles.billName}>{data.bill.name}</Text>
          <Text style={styles.amount}>
            금액: ₩{data.amount.toLocaleString()}
          </Text>
          <Text style={styles.desc}>계좌번호:</Text>
          <View style={styles.accountInfo}>
            <Text style={styles.bankName}>국민은행</Text>
            <Text style={styles.accountNumber}>123456-78-901234</Text>
            <Text style={styles.accountHolder}>김철수</Text>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.copyButton, copied && styles.copyButtonSuccess]}
              onPress={handleCopyAccount}
            >
              <Ionicons 
                name={copied ? "checkmark" : "copy"} 
                size={16} 
                color="white" 
              />
              <Text style={styles.copyButtonText}>
                {copied ? "복사됨" : "계좌 복사"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Text style={styles.closeText}>
                닫기
              </Text>
            </TouchableOpacity>
          </View>
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
  accountInfo: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.borderColor,
  },
  bankName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.primary,
    marginBottom: 8,
  },
  accountNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.light.text,
    letterSpacing: 1,
    marginBottom: 8,
  },
  accountHolder: {
    fontSize: 14,
    color: Colors.light.mutedText,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    marginBottom: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  copyButton: {
    backgroundColor: Colors.light.subColor,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    flex: 1,
  },
  copyButtonSuccess: {
    backgroundColor: Colors.light.successColor,
  },
  copyButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
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
    backgroundColor: Colors.light.surfaceVariant,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    flex: 1,
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
