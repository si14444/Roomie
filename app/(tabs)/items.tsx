import React, { useState } from "react";
import { StyleSheet, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "@/constants/Colors";
import { useNotificationContext } from "@/contexts/NotificationContext";
import { NewItemInput } from "@/types/item.types";

// Import items components
import { ItemQuickActions } from "@/components/items/ItemQuickActions";
import { PurchaseRequests } from "@/components/items/PurchaseRequests";
import { ItemsStatusList } from "@/components/items/ItemsStatusList";
import { AddItemModal } from "@/components/items/AddItemModal";

export default function ItemsScreen() {
  const { createNotification } = useNotificationContext();
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

  const handleConfirmAddItem = () => {
    if (newItem.name.trim()) {
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
    }
  };

  const handleScanBarcode = () => {
    console.log("Scan barcode");
  };

  const handleOpenShoppingList = () => {
    console.log("Open shopping list");
  };

  const handleAcceptRequest = (requestId: number) => {
    Alert.alert("구매 요청 수락", "이 물품을 구매하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "구매 완료",
        onPress: () => {
          createNotification({
            title: "물품 구매 완료",
            message: "요청하신 물품이 구매되었습니다",
            type: "item_purchased",
            relatedId: requestId.toString(),
          });
          Alert.alert("완료", "구매가 완료되었습니다!");
        },
      },
    ]);
  };

  const handleIgnoreRequest = (requestId: number) => {
    console.log("Ignore request:", requestId);
  };

  const handleItemPress = (itemId: number) => {
    console.log("Item pressed:", itemId);
  };

  const handleFilterByCategory = (category: string) => {
    console.log("Filter by category:", category);
  };

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <ItemQuickActions
          onAddItem={handleAddItem}
          onScanBarcode={handleScanBarcode}
          onOpenShoppingList={handleOpenShoppingList}
        />
        <PurchaseRequests
          onAcceptRequest={handleAcceptRequest}
          onIgnoreRequest={handleIgnoreRequest}
        />
        <ItemsStatusList
          onItemPress={handleItemPress}
          onFilterByCategory={handleFilterByCategory}
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
