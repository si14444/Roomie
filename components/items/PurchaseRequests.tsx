import React from "react";
import { StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Text, View } from "@/components/Themed";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { PurchaseRequest } from "@/services/itemService";

interface PurchaseRequestsProps {
  requests: PurchaseRequest[];
  isLoading: boolean;
  onAcceptRequest?: (requestId: string) => void;
  onIgnoreRequest?: (requestId: string) => void;
}

export function PurchaseRequests({
  requests,
  isLoading,
  onAcceptRequest,
  onIgnoreRequest,
}: PurchaseRequestsProps) {
  if (isLoading) {
    return (
      <View style={styles.requestsSection}>
        <Text style={styles.sectionTitle}>구매 요청</Text>
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.emptyText}>로딩 중...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.requestsSection}>
      <Text style={styles.sectionTitle}>구매 요청</Text>
      {requests.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="bag-check-outline" size={48} color={Colors.light.mutedText} />
          <Text style={styles.emptyText}>현재 구매 요청이 없습니다</Text>
        </View>
      ) : (
        requests.map((request) => (
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
                  <Text style={styles.requestItem}>
                    {request.item_name || '알 수 없는 물품'}
                  </Text>
                  {request.urgency === 'urgent' && (
                    <View style={styles.urgentBadge}>
                      <Ionicons name="flame" size={12} color="white" />
                      <Text style={styles.urgentText}>긴급</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.requesterText}>
                  요청자: {request.requested_by_name || '알 수 없음'}
                </Text>
                <Text style={styles.quantityText}>
                  수량: {request.quantity}개
                </Text>
                {request.notes && (
                  <Text style={styles.notesText}>{request.notes}</Text>
                )}
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
        ))
      )}
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
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.light.mutedText,
    marginTop: 12,
    textAlign: "center",
  },
});
