import React from "react";
import { StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "@/constants/Colors";

// Import items components
import { ItemQuickActions } from "@/components/items/ItemQuickActions";
import { PurchaseRequests } from "@/components/items/PurchaseRequests";
import { ItemsStatusList } from "@/components/items/ItemsStatusList";

export default function ItemsScreen() {
  const handleAddItem = () => {
    console.log("Add new item");
  };

  const handleScanBarcode = () => {
    console.log("Scan barcode");
  };

  const handleOpenShoppingList = () => {
    console.log("Open shopping list");
  };

  const handleAcceptRequest = (requestId: number) => {
    console.log("Accept request:", requestId);
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
