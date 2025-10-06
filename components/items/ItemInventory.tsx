import React, { useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Text, View } from "@/components/Themed";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { InventoryItem, InventoryStatus, StatusUpdate } from "@/types/item.types";
import { AddInventoryItemModal } from "./AddInventoryItemModal";
import { Item } from "@/services/itemService";

interface ItemInventoryProps {
  items: Item[];
  isLoading: boolean;
  onUpdateItem?: (itemId: string, quantity: number) => void;
  onUpdateStatus?: (update: StatusUpdate) => void;
  onAddItem?: (item: InventoryItem) => void;
  onAddNewItemToFirebase?: (itemData: any) => Promise<boolean>; // Firebase 저장 함수
  onDeleteItem?: (itemId: string) => Promise<boolean>; // Firebase 삭제 함수
}

export function ItemInventory({ items, isLoading, onUpdateItem, onUpdateStatus, onAddItem, onAddNewItemToFirebase, onDeleteItem }: ItemInventoryProps) {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<InventoryStatus>("보통");

  const getStatusColor = (currentQuantity: number, minQuantity: number) => {
    const ratio = currentQuantity / minQuantity;
    if (ratio >= 2) {
      return Colors.light.successColor; // 충분
    } else if (ratio >= 1) {
      return Colors.light.warningColor; // 보통
    } else {
      return Colors.light.errorColor; // 부족
    }
  };

  const getStatusText = (currentQuantity: number, minQuantity: number) => {
    const ratio = currentQuantity / minQuantity;
    if (ratio >= 2) {
      return '충분';
    } else if (ratio >= 1) {
      return '보통';
    } else {
      return '부족';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "food":
        return Colors.light.secondary;
      case "household":
        return Colors.light.primary;
      case "cleaning":
        return Colors.light.successColor;
      case "toiletries":
        return "#9333EA";
      case "other":
      default:
        return Colors.light.mutedText;
    }
  };

  const getCategoryIcon = (category: string) => {
    // Firebase Item에는 icon이 없으므로 category로 기본 아이콘 반환
    switch (category) {
      case "food":
        return "nutrition-outline";
      case "household":
        return "home-outline";
      case "cleaning":
        return "water-outline";
      case "toiletries":
        return "sparkles-outline";
      case "other":
      default:
        return "cube-outline";
    }
  };

  const handleItemPress = (item: Item) => {
    setSelectedItem(item);
    const currentStatus = getStatusText(item.current_quantity, item.min_quantity);
    setSelectedStatus(currentStatus as InventoryStatus);
    setShowUpdateModal(true);
  };

  const handleUpdateStatus = () => {
    if (!selectedItem) {
      return;
    }

    // 상태를 수량으로 변환
    const statusToQuantity: Record<InventoryStatus, number> = {
      '충분': selectedItem.min_quantity * 2,
      '보통': selectedItem.min_quantity,
      '부족': Math.max(1, Math.floor(selectedItem.min_quantity / 2))
    };

    const newQuantity = statusToQuantity[selectedStatus];

    // 부모 컴포넌트의 update 함수 호출
    onUpdateItem?.(selectedItem.id, newQuantity);

    // 부모 컴포넌트에 상태 변경 알림
    const update: StatusUpdate = {
      itemId: selectedItem.id,
      newStatus: selectedStatus,
      updatedBy: "현재사용자",
    };

    onUpdateStatus?.(update);

    setShowUpdateModal(false);
    setSelectedItem(null);
  };

  const handleDeleteItem = () => {
    if (!selectedItem) {
      return;
    }

    Alert.alert(
      "물품 삭제",
      `${selectedItem.name}을(를) 삭제하시겠습니까?`,
      [
        {
          text: "취소",
          style: "cancel"
        },
        {
          text: "삭제",
          style: "destructive",
          onPress: async () => {
            if (onDeleteItem) {
              const success = await onDeleteItem(selectedItem.id);
              if (success) {
                setShowUpdateModal(false);
                setSelectedItem(null);
              }
            }
          }
        }
      ]
    );
  };

  const handleAddItem = async (newItemData: InventoryItem) => {
    console.log('📦 [ItemInventory] handleAddItem 시작:', newItemData);

    if (onAddNewItemToFirebase) {
      // InventoryItem의 status를 수량으로 변환
      const statusToQuantity = {
        '충분': 10,
        '보통': 5,
        '부족': 1
      };

      const currentQuantity = statusToQuantity[newItemData.status] || 5;

      // Firebase에 저장
      const success = await onAddNewItemToFirebase({
        name: newItemData.name,
        description: newItemData.notes || '',
        category: newItemData.category,
        currentQuantity: currentQuantity,
        minQuantity: 3, // 기본 최소 수량
        unit: '개',
        estimatedPrice: undefined,
        preferredStore: undefined,
      });

      if (success) {
        setShowAddModal(false);
        // 부모 컴포넌트에 알림 (UI 피드백용)
        onAddItem?.(newItemData);
      }
    }
  };

  const formatLastUpdated = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diff === 0) return "오늘";
    if (diff === 1) return "어제";
    if (diff <= 7) return `${diff}일 전`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.sectionTitle}>물품 현황</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons name="add" size={20} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.emptyText}>물품 목록을 불러오는 중...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.sectionTitle}>물품 현황</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={20} color="white" />
        </TouchableOpacity>
      </View>
      
      {items.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="cube-outline" size={48} color={Colors.light.mutedText} />
          <Text style={styles.emptyText}>등록된 물품이 없습니다</Text>
          <Text style={styles.emptySubtext}>+ 버튼을 눌러 물품을 추가해보세요</Text>
        </View>
      ) : (
        items.map((item) => {
          const statusColor = getStatusColor(item.current_quantity, item.min_quantity);
          const statusText = getStatusText(item.current_quantity, item.min_quantity);
          const categoryColor = getCategoryColor(item.category);
          const categoryIcon = getCategoryIcon(item.category);
          
          return (
            <TouchableOpacity
              key={item.id}
              style={styles.itemCard}
              onPress={() => handleItemPress(item)}
            >
              <View style={styles.itemHeader}>
                <View style={[styles.iconContainer, { backgroundColor: categoryColor + "20" }]}>
                  <Ionicons
                    name={categoryIcon as any}
                    size={24}
                    color={categoryColor}
                  />
                </View>
                
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.updateText}>
                    {formatLastUpdated(item.updated_at || item.created_at)}
                  </Text>
                  {item.description && (
                    <Text style={styles.descriptionText}>{item.description}</Text>
                  )}
                </View>
                
                <View style={styles.statusContainer}>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                    <Text style={styles.statusText}>{statusText}</Text>
                  </View>
                  <Text style={styles.quantityText}>
                    {item.current_quantity}/{item.min_quantity}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })
      )}

      {/* 물품 수정/삭제 모달 */}
      <Modal
        visible={showUpdateModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowUpdateModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>물품 관리</Text>
            {selectedItem && (
              <>
                <Text style={styles.modalItemName}>{selectedItem.name}</Text>

                <View style={styles.statusUpdateContainer}>
                  <Text style={styles.inputLabel}>상태</Text>
                  <View style={styles.statusGrid}>
                    {(['충분', '보통', '부족'] as InventoryStatus[]).map((status) => {
                      const statusColors = {
                        '충분': Colors.light.successColor,
                        '보통': Colors.light.warningColor,
                        '부족': Colors.light.errorColor
                      };
                      const color = statusColors[status];

                      return (
                        <TouchableOpacity
                          key={status}
                          style={[
                            styles.statusButton,
                            selectedStatus === status && {
                              backgroundColor: color + "20",
                              borderColor: color,
                            },
                          ]}
                          onPress={() => setSelectedStatus(status)}
                        >
                          <View style={[styles.statusIndicator, { backgroundColor: color }]} />
                          <Text
                            style={[
                              styles.statusButtonText,
                              selectedStatus === status && { color: color, fontWeight: "600" },
                            ]}
                          >
                            {status}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.deleteButton]}
                    onPress={handleDeleteItem}
                  >
                    <Ionicons name="trash-outline" size={18} color="white" />
                    <Text style={styles.deleteButtonText}>삭제</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.updateButton]}
                    onPress={handleUpdateStatus}
                  >
                    <Text style={styles.updateButtonText}>수정</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Add Item Modal */}
      <AddInventoryItemModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddItem={handleAddItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.light.text,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 4,
  },
  updateText: {
    fontSize: 12,
    color: Colors.light.mutedText,
  },
  descriptionText: {
    fontSize: 11,
    color: Colors.light.mutedText,
    fontStyle: 'italic',
    marginTop: 2,
  },
  quantityText: {
    fontSize: 10,
    color: Colors.light.mutedText,
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.light.mutedText,
    marginTop: 12,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.light.mutedText,
    marginTop: 4,
    textAlign: 'center',
  },
  statusContainer: {
    alignItems: "flex-end",
    gap: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    minHeight: 300,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.light.text,
    textAlign: "center",
    marginBottom: 8,
  },
  modalItemName: {
    fontSize: 16,
    color: Colors.light.mutedText,
    textAlign: "center",
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.light.text,
    marginBottom: 8,
  },
  quantityInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
  },
  quantityInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
  },
  unitText: {
    fontSize: 14,
    color: Colors.light.mutedText,
    marginLeft: 8,
  },
  reasonContainer: {
    marginBottom: 24,
  },
  reasonButtons: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  reasonButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.light.inputBackground,
    borderWidth: 1,
    borderColor: Colors.light.inputBackground,
  },
  reasonButtonActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  reasonButtonText: {
    fontSize: 12,
    color: Colors.light.mutedText,
    fontWeight: "500",
  },
  reasonButtonTextActive: {
    color: "white",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: Colors.light.inputBackground,
  },
  updateButton: {
    backgroundColor: Colors.light.primary,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.light.mutedText,
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "white",
  },
  statusUpdateContainer: {
    marginBottom: 24,
  },
  statusGrid: {
    gap: 12,
  },
  statusButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  statusIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  statusButtonText: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
  },
  deleteButton: {
    backgroundColor: Colors.light.errorColor,
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    flex: 1,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "white",
  },
});