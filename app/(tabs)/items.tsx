import React, { useState } from "react";
import { StyleSheet, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "@/constants/Colors";
import { useNotificationContext } from "@/contexts/NotificationContext";
import { NewItemInput, StatusUpdate, InventoryItem } from "@/types/item.types";
// TODO: Implement items service in api-service.ts
// import { itemsService } from "@/lib/api-service";
import { useTeam } from "@/contexts/TeamContext";

// Import items components
import { ItemQuickActions } from "@/components/items/ItemQuickActions";
import { PurchaseRequests } from "@/components/items/PurchaseRequests";
import { ItemInventory } from "@/components/items/ItemInventory";
import { AddItemModal } from "@/components/items/AddItemModal";

export default function ItemsScreen() {
  const { createNotification } = useNotificationContext();
  const { currentTeam } = useTeam();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState<NewItemInput>({
    name: "",
    description: "",
    category: "general",
    priority: "medium",
    estimatedPrice: "",
    store: "",
  });

  const handleAddItem = () => {
    setShowAddModal(true);
  };

  const handleModalClose = () => {
    setShowAddModal(false);
    // Reset form
    setNewItem({
      name: "",
      description: "",
      category: "general",
      priority: "medium",
      estimatedPrice: "",
      store: "",
    });
  };

  const handleConfirmAddItem = async () => {
    if (!currentTeam?.id || !newItem.name.trim()) {
      Alert.alert("오류", "팀을 선택하고 물품명을 입력해주세요.");
      return;
    }

    try {
      // 구매 요청 생성
      await itemsService.createPurchaseRequest({
        team_id: currentTeam.id,
        item_name: newItem.name.trim(),
        quantity: 1,
        urgency: newItem.priority === "high" ? "urgent" : "normal",
        notes: newItem.description,
        estimated_price: newItem.estimatedPrice ? parseFloat(newItem.estimatedPrice) : undefined,
        preferred_store: newItem.store,
      });
      
      const itemDescription = newItem.description 
        ? `${newItem.name.trim()} - ${newItem.description}`
        : newItem.name.trim();
      
      createNotification({
        title: "물품 요청",
        message: `${itemDescription} 구매 요청이 등록되었습니다`,
        type: "item_request",
        relatedId: Date.now().toString(),
      });
      
      Alert.alert("완료", "물품 요청이 등록되었습니다!");
      handleModalClose();
    } catch (error) {
      console.error('Error creating purchase request:', error);
      Alert.alert("오류", "물품 요청 등록 중 오류가 발생했습니다.");
    }
  };


  const handleAcceptRequest = async (requestId: string) => {
    Alert.alert("구매 요청 수락", "이 물품을 구매하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "구매 완료",
        onPress: async () => {
          try {
            await itemsService.approvePurchaseRequest(requestId);
            
            createNotification({
              title: "물품 구매 완료",
              message: "요청하신 물품이 구매되었습니다",
              type: "item_purchased",
              relatedId: requestId,
            });
            
            Alert.alert("완료", "구매가 완료되었습니다!");
          } catch (error) {
            console.error('Error approving request:', error);
            Alert.alert("오류", "구매 요청 승인 중 오류가 발생했습니다.");
          }
        },
      },
    ]);
  };

  const handleIgnoreRequest = async (requestId: string) => {
    try {
      await itemsService.rejectPurchaseRequest(requestId);
    } catch (error) {
      console.error('Error rejecting request:', error);
      Alert.alert("오류", "구매 요청 거절 중 오류가 발생했습니다.");
    }
  };

  const handleStatusUpdate = (update: StatusUpdate) => {
    // 상태 업데이트 시 알림 생성
    const message = `상태가 ${update.newStatus}(으)로 변경되었습니다`;

    createNotification({
      title: "물품 상태 변경",
      message: message,
      type: "item_update",
      relatedId: update.itemId,
    });
  };

  const handleAddInventoryItem = (item: InventoryItem) => {
    // 새 인벤토리 아이템 추가 시 알림 생성
    createNotification({
      title: "새 물품 등록",
      message: `${item.name}이(가) 물품 목록에 등록되었습니다`,
      type: "system",
      relatedId: item.id,
    });
  };


  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <ItemQuickActions
          onAddItem={handleAddItem}
        />
        <PurchaseRequests
          onAcceptRequest={handleAcceptRequest}
          onIgnoreRequest={handleIgnoreRequest}
        />
        <ItemInventory
          onUpdateStatus={handleStatusUpdate}
          onAddItem={handleAddInventoryItem}
        />
      </ScrollView>

      <AddItemModal
        visible={showAddModal}
        newItem={newItem}
        setNewItem={setNewItem}
        onClose={handleModalClose}
        onAddItem={handleConfirmAddItem}
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
});
