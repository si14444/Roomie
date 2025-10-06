import React, { useState } from "react";
import { StyleSheet, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "@/constants/Colors";
import { useNotificationContext } from "@/contexts/NotificationContext";
import { NewItemInput, StatusUpdate, InventoryItem } from "@/types/item.types";
import { useItemsFirebase } from "@/hooks/useItemsFirebase";

// Import items components
import { ItemQuickActions } from "@/components/items/ItemQuickActions";
import { PurchaseRequests } from "@/components/items/PurchaseRequests";
import { ItemInventory } from "@/components/items/ItemInventory";
import { AddItemModal } from "@/components/items/AddItemModal";

export default function ItemsScreen() {
  const { createNotification } = useNotificationContext();
  const {
    items,
    purchaseRequests,
    pendingRequests,
    itemsLoading,
    requestsLoading,
    addNewItem,
    addPurchaseRequest,
    approvePurchaseRequest,
    rejectPurchaseRequest,
    markAsPurchased,
    updateItem,
  } = useItemsFirebase();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState<NewItemInput>({
    name: "",
    description: "",
    category: "other",
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
      category: "other",
      priority: "medium",
      estimatedPrice: "",
      store: "",
    });
  };

  const handleConfirmAddItem = async () => {
    console.log('🎬 [Screen] handleConfirmAddItem 시작');
    console.log('🎬 [Screen] newItem:', newItem);

    if (!newItem.name.trim()) {
      Alert.alert("오류", "물품명을 입력해주세요.");
      return;
    }

    // 실제 물품 재고에 추가
    const itemToAdd = {
      name: newItem.name.trim(),
      description: newItem.description,
      category: newItem.category,
      currentQuantity: 1,
      minQuantity: 1,
      unit: '개',
      estimatedPrice: newItem.estimatedPrice ? parseFloat(newItem.estimatedPrice) : undefined,
      preferredStore: newItem.store,
    };

    console.log('🎬 [Screen] addNewItem 호출:', itemToAdd);
    const success = await addNewItem(itemToAdd);
    console.log('🎬 [Screen] addNewItem 결과:', success);

    if (success) {
      const itemDescription = newItem.description
        ? `${newItem.name.trim()} - ${newItem.description}`
        : newItem.name.trim();

      createNotification({
        title: "물품 등록",
        message: `${itemDescription}이(가) 물품 목록에 추가되었습니다`,
        type: "item_update",
        relatedId: Date.now().toString(),
      });

      handleModalClose();
    }
  };


  const handleAcceptRequest = async (requestId: string) => {
    Alert.alert("구매 요청 수락", "이 물품을 구매하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "구매 완료",
        onPress: async () => {
          const success = await markAsPurchased(requestId);

          if (success) {
            createNotification({
              title: "물품 구매 완료",
              message: "요청하신 물품이 구매되었습니다",
              type: "item_purchased",
              relatedId: requestId,
            });
          }
        },
      },
    ]);
  };

  const handleIgnoreRequest = async (requestId: string) => {
    await rejectPurchaseRequest(requestId);
  };

  const handleUpdateItem = async (itemId: string, quantity: number) => {
    await updateItem(itemId, { currentQuantity: quantity });
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
          requests={pendingRequests}
          isLoading={requestsLoading}
          onAcceptRequest={handleAcceptRequest}
          onIgnoreRequest={handleIgnoreRequest}
        />
        <ItemInventory
          items={items}
          isLoading={itemsLoading}
          onUpdateItem={handleUpdateItem}
          onUpdateStatus={handleStatusUpdate}
          onAddItem={handleAddInventoryItem}
          onAddNewItemToFirebase={addNewItem}
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
