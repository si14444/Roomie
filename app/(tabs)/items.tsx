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
import { AdBanner } from "@/components/ads/AdBanner";
import { useInterstitialAd } from "@/hooks/useInterstitialAd";

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
    deleteItem,
  } = useItemsFirebase();

  // 전면 광고 훅
  const { incrementAction, showAd } = useInterstitialAd();

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
    if (!newItem.name.trim()) {
      Alert.alert("오류", "물품명을 입력해주세요.");
      return;
    }

    const urgency = newItem.priority === "high" ? "urgent" : "normal";
    const estimatedPrice = newItem.estimatedPrice ? parseFloat(newItem.estimatedPrice) : undefined;

    // 구매 요청 생성
    const success = await addPurchaseRequest({
      itemName: newItem.name.trim(),
      quantity: 1,
      urgency,
      notes: newItem.description,
      estimatedPrice,
      preferredStore: newItem.store,
    });

    if (success) {
      // 상세한 알림 메시지 생성
      const urgencyEmoji = urgency === "urgent" ? "🔥 " : "";
      const priceInfo = estimatedPrice ? ` (약 ${estimatedPrice.toLocaleString()}원)` : '';
      const storeInfo = newItem.store ? ` - ${newItem.store}` : '';

      createNotification({
        title: `📦 ${urgencyEmoji}새로운 구매 요청`,
        message: `${newItem.name.trim()} 1개${priceInfo}${storeInfo}`,
        type: "item_request",
        relatedId: Date.now().toString(),
      });

      handleModalClose();

      // 액션 카운트 증가 및 전면 광고 표시
      await incrementAction();
      await showAd();
    }
  };


  const handleAcceptRequest = async (requestId: string) => {
    // 구매 요청 정보 찾기
    const request = purchaseRequests.find(r => r.id === requestId);

    Alert.alert("구매 요청 수락", "이 물품을 구매하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "구매 완료",
        onPress: async () => {
          const success = await markAsPurchased(requestId);

          if (success && request) {
            const itemName = request.item_name || '물품';
            const quantity = request.quantity;
            const price = request.estimated_price
              ? ` (약 ${request.estimated_price.toLocaleString()}원)`
              : '';

            createNotification({
              title: "🛒 물품 구매 완료",
              message: `${itemName} ${quantity}개${price}가 구매되었습니다`,
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
    // 상태 업데이트 시 알림 생성 - 물품 이름과 상세 정보 포함
    const item = items.find(i => i.id === update.itemId);
    if (!item) return;

    const statusDetails = {
      '충분': `재고가 충분합니다 (${item.current_quantity}${item.unit})`,
      '보통': `재고가 보통입니다 (${item.current_quantity}${item.unit})`,
      '부족': `재고가 부족합니다 (${item.current_quantity}${item.unit}, 최소 ${item.min_quantity}${item.unit} 필요)`
    };

    const message = statusDetails[update.newStatus as keyof typeof statusDetails] ||
                   `상태가 ${update.newStatus}(으)로 변경되었습니다`;

    createNotification({
      title: `📦 ${item.name} 상태 변경`,
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
          onDeleteItem={deleteItem}
        />
      </ScrollView>

      {/* 하단 배너 광고 */}
      <AdBanner position="bottom" />

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
