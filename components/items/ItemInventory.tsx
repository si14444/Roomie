import React, { useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Text, View } from "@/components/Themed";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { InventoryItem, InventoryStatus, StatusUpdate } from "@/types/item.types";
import { AddInventoryItemModal } from "./AddInventoryItemModal";

interface ItemInventoryProps {
  onUpdateStatus?: (update: StatusUpdate) => void;
  onAddItem?: (item: InventoryItem) => void;
}

export function ItemInventory({ onUpdateStatus, onAddItem }: ItemInventoryProps) {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStatus, setNewStatus] = useState<InventoryStatus>("보통");

  // Mock data - 실제로는 Context나 API에서 가져와야 함
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([
    {
      id: "1",
      name: "화장지",
      category: "household",
      status: "충분",
      lastUpdated: new Date("2024-12-20"),
      lastUpdatedBy: "김철수",
      icon: "flower-outline",
    },
    {
      id: "2",
      name: "주방세제",
      category: "household",
      status: "부족",
      lastUpdated: new Date("2024-12-18"),
      lastUpdatedBy: "이영희",
      icon: "water-outline",
    },
    {
      id: "3",
      name: "쌀",
      category: "food",
      status: "부족",
      lastUpdated: new Date("2024-12-15"),
      lastUpdatedBy: "박민수",
      icon: "nutrition-outline",
    },
    {
      id: "4",
      name: "샴푸",
      category: "personal",
      status: "보통",
      lastUpdated: new Date("2024-12-19"),
      lastUpdatedBy: "이영희",
      icon: "sparkles-outline",
    },
  ]);

  const getStatusColor = (status: InventoryStatus) => {
    switch (status) {
      case "충분":
        return Colors.light.successColor;
      case "보통":
        return Colors.light.warningColor;
      case "부족":
        return Colors.light.errorColor;
      default:
        return Colors.light.mutedText;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "food":
        return Colors.light.secondary;
      case "household":
        return Colors.light.primary;
      case "personal":
        return Colors.light.successColor;
      case "electronics":
        return "#9333EA";
      default:
        return Colors.light.mutedText;
    }
  };

  const handleItemPress = (item: InventoryItem) => {
    setSelectedItem(item);
    setNewStatus(item.status);
    setShowUpdateModal(true);
  };

  const handleUpdateStatus = () => {
    if (!selectedItem) {
      return;
    }

    // 로컬 상태 업데이트
    setInventoryItems(prev =>
      prev.map(item =>
        item.id === selectedItem.id
          ? {
              ...item,
              status: newStatus,
              lastUpdated: new Date(),
              lastUpdatedBy: "현재사용자", // 실제로는 인증된 사용자명
            }
          : item
      )
    );

    // 부모 컴포넌트에 알림
    const update: StatusUpdate = {
      itemId: selectedItem.id,
      newStatus: newStatus,
      updatedBy: "현재사용자",
    };

    onUpdateStatus?.(update);

    setShowUpdateModal(false);
    setSelectedItem(null);
    setNewStatus("보통");
  };

  const handleAddItem = (newItem: InventoryItem) => {
    // 로컬 상태 업데이트
    setInventoryItems(prev => [...prev, newItem]);
    
    // 부모 컴포넌트에 알림
    onAddItem?.(newItem);
    
    Alert.alert("완료", `${newItem.name}이(가) 물품 목록에 추가되었습니다!`);
  };

  const formatLastUpdated = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diff === 0) return "오늘";
    if (diff === 1) return "어제";
    if (diff <= 7) return `${diff}일 전`;
    return date.toLocaleDateString();
  };

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
      
      {inventoryItems.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.itemCard}
          onPress={() => handleItemPress(item)}
        >
          <View style={styles.itemHeader}>
            <View style={[styles.iconContainer, { backgroundColor: getCategoryColor(item.category) + "20" }]}>
              <Ionicons
                name={item.icon as any}
                size={24}
                color={getCategoryColor(item.category)}
              />
            </View>
            
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.updateText}>
                {formatLastUpdated(item.lastUpdated)} • {item.lastUpdatedBy}
              </Text>
            </View>
            
            <View style={styles.statusContainer}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      ))}

      {/* 상태 업데이트 모달 */}
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
            <Text style={styles.modalTitle}>상태 업데이트</Text>
            {selectedItem && (
              <>
                <Text style={styles.modalItemName}>{selectedItem.name}</Text>
                
                <View style={styles.statusUpdateContainer}>
                  <Text style={styles.inputLabel}>현재 상태</Text>
                  <View style={styles.statusOptions}>
                    {(["충분", "보통", "부족"] as const).map((status) => (
                      <TouchableOpacity
                        key={status}
                        style={[
                          styles.statusOption,
                          newStatus === status && {
                            backgroundColor: getStatusColor(status) + "20",
                            borderColor: getStatusColor(status),
                          }
                        ]}
                        onPress={() => setNewStatus(status)}
                      >
                        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(status) }]} />
                        <Text
                          style={[
                            styles.statusOptionText,
                            newStatus === status && { 
                              color: getStatusColor(status), 
                              fontWeight: "600" 
                            }
                          ]}
                        >
                          {status}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setShowUpdateModal(false)}
                  >
                    <Text style={styles.cancelButtonText}>취소</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.modalButton, styles.updateButton]}
                    onPress={handleUpdateStatus}
                  >
                    <Text style={styles.updateButtonText}>업데이트</Text>
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
  statusOptions: {
    gap: 8,
  },
  statusOption: {
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
  statusOptionText: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
  },
});