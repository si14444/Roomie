import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Text, View } from "@/components/Themed";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";

interface PurchaseRequest {
  id: number;
  item: string;
  requester: string;
  urgent: boolean;
}

interface PurchaseRequestsProps {
  onAcceptRequest?: (requestId: number) => void;
  onIgnoreRequest?: (requestId: number) => void;
}

export function PurchaseRequests({
  onAcceptRequest,
  onIgnoreRequest,
}: PurchaseRequestsProps) {
  const requests: PurchaseRequest[] = [
    { id: 1, item: "휴지", requester: "이영희", urgent: true },
    { id: 2, item: "주방세제", requester: "박민수", urgent: false },
    { id: 3, item: "우유", requester: "김철수", urgent: false },
  ];

  return (
    <View style={styles.requestsSection}>
      <Text style={styles.sectionTitle}>구매 요청</Text>
      {requests.map((request) => (
        <View key={request.id} style={styles.requestCard}>
          <View style={styles.requestCardContent}>
            <View style={styles.requestIconContainer}>
              <Ionicons
                name="bag-handle-outline"
                size={20}
                color={Colors.light.primary}
              />
            </View>
            <View style={styles.requestInfo}>
              <View style={styles.requestHeader}>
                <Text style={styles.requestItem}>{request.item}</Text>
                {request.urgent && (
                  <View style={styles.urgentBadge}>
                    <Ionicons name="flame" size={12} color="white" />
                    <Text style={styles.urgentText}>긴급</Text>
                  </View>
                )}
              </View>
              <Text style={styles.requesterText}>
                요청자: {request.requester}
              </Text>
            </View>
          </View>
          <View style={styles.requestActions}>
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={() => onAcceptRequest?.(request.id)}
            >
              <Ionicons name="checkmark" size={16} color="white" />
              <Text style={styles.acceptButtonText}>수락</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.ignoreButton}
              onPress={() => onIgnoreRequest?.(request.id)}
            >
              <Ionicons name="close" size={16} color={Colors.light.mutedText} />
              <Text style={styles.ignoreButtonText}>무시</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  requestsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: 16,
  },
  requestCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    gap: 12,
  },
  requestCardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  requestIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.accent,
    justifyContent: "center",
    alignItems: "center",
  },
  requestInfo: {
    flex: 1,
  },
  requestHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  requestItem: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
  },
  urgentBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.errorColor,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  urgentText: {
    fontSize: 10,
    fontWeight: "600",
    color: "white",
  },
  requesterText: {
    fontSize: 14,
    color: Colors.light.mutedText,
  },
  requestActions: {
    flexDirection: "row",
    gap: 8,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: Colors.light.successColor,
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  acceptButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  ignoreButton: {
    flex: 1,
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.light.borderColor,
  },
  ignoreButtonText: {
    color: Colors.light.mutedText,
    fontSize: 14,
    fontWeight: "600",
  },
});
