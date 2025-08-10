import React from "react";
import { StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Text, View } from "@/components/Themed";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";

export function PaymentMethods() {
  const handleKakaoPay = () => {
    Alert.alert("카카오페이", "카카오페이 송금 링크가 생성되었습니다!");
  };

  const handleToss = () => {
    Alert.alert("토스", "토스 송금 링크가 생성되었습니다!");
  };

  const handleBankAccount = () => {
    Alert.alert(
      "계좌복사",
      "계좌번호가 클립보드에 복사되었습니다!\n\n국민은행 123-456-789012"
    );
  };

  return (
    <View style={styles.paymentMethods}>
      <Text style={styles.sectionTitle}>간편 송금</Text>
      <View style={styles.methodButtons}>
        <TouchableOpacity
          style={[styles.methodButton, styles.kakaoButton]}
          onPress={handleKakaoPay}
        >
          <Ionicons name="chatbubble" size={20} color="#FFFFFF" />
          <Text style={[styles.methodButtonText, { color: "#FFFFFF" }]}>
            카카오페이
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.methodButton, styles.tossButton]}
          onPress={handleToss}
        >
          <Ionicons name="card" size={20} color="white" />
          <Text style={styles.methodButtonText}>토스</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.methodButton, styles.bankButton]}
          onPress={handleBankAccount}
        >
          <Ionicons name="copy" size={20} color="white" />
          <Text style={styles.methodButtonText}>계좌복사</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  paymentMethods: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: 16,
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
    backgroundColor: Colors.light.subColor,
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
});
