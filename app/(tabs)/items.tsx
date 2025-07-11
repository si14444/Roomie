import React from "react";
import { StyleSheet, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "@/constants/Colors";
import { useNotificationContext } from "@/contexts/NotificationContext";

// Import items components
import { ItemQuickActions } from "@/components/items/ItemQuickActions";
import { PurchaseRequests } from "@/components/items/PurchaseRequests";
import { ItemsStatusList } from "@/components/items/ItemsStatusList";

export default function ItemsScreen() {
  const { createNotification } = useNotificationContext();

  const handleAddItem = () => {
    Alert.prompt(
      "물품 요청",
      "어떤 물품이 필요한지 입력해주세요:",
      [
        { text: "취소", style: "cancel" },
        {
          text: "요청",
          onPress: (itemName) => {
            if (itemName && itemName.trim()) {
              createNotification({
                title: "물품 요청",
                message: `${itemName.trim()} 구매 요청이 등록되었습니다`,
                type: "item_request",
                relatedId: Date.now().toString(),
              });
              Alert.alert("완료", "물품 요청이 등록되었습니다!");
            }
          },
        },
      ],
      "plain-text"
    );
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
