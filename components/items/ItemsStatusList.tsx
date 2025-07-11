import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Text, View } from "@/components/Themed";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";

interface Item {
  id: number;
  name: string;
  buyer: string;
  date: string;
  cost: number;
  category: "bathroom" | "kitchen" | "cleaning";
  status: "active" | "low" | "empty";
  icon: keyof typeof Ionicons.glyphMap;
}

interface ItemsStatusListProps {
  onItemPress?: (itemId: number) => void;
  onFilterByCategory?: (category: string) => void;
}

export function ItemsStatusList({
  onItemPress,
  onFilterByCategory,
}: ItemsStatusListProps) {
  const items: Item[] = [
    {
      id: 1,
      name: "화장지",
      buyer: "김철수",
      date: "2024-12-20",
      cost: 25000,
      category: "bathroom",
      status: "active",
      icon: "flower-outline",
    },
    {
      id: 2,
      name: "세제",
      buyer: "이영희",
      date: "2024-12-18",
      cost: 15000,
      category: "kitchen",
      status: "active",
      icon: "water-outline",
    },
    {
      id: 3,
      name: "샴푸",
      buyer: "박민수",
      date: "2024-12-15",
      cost: 18000,
      category: "bathroom",
      status: "low",
      icon: "sparkles-outline",
    },
    {
      id: 4,
      name: "쌀",
      buyer: "김철수",
      date: "2024-12-10",
      cost: 35000,
      category: "kitchen",
      status: "empty",
      icon: "nutrition-outline",
    },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "kitchen":
        return Colors.light.secondary;
      case "bathroom":
        return Colors.light.primary;
      case "cleaning":
        return Colors.light.successColor;
      default:
        return Colors.light.mutedText;
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case "kitchen":
        return "주방";
      case "bathroom":
        return "욕실";
      case "cleaning":
        return "청소";
      default:
        return "기타";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return Colors.light.successColor;
      case "low":
        return Colors.light.warningColor;
      case "empty":
        return Colors.light.errorColor;
      default:
        return Colors.light.mutedText;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "충분";
      case "low":
        return "부족";
      case "empty":
        return "소진";
      default:
        return "알 수 없음";
    }
  };

  return (
    <View style={styles.itemsList}>
      <Text style={styles.sectionTitle}>현재 물품 현황</Text>
      {items.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.itemCard}
          onPress={() => onItemPress?.(item.id)}
        >
          <View style={styles.itemCardHeader}>
            <View style={styles.iconContainer}>
              <Ionicons
                name={item.icon}
                size={24}
                color={getCategoryColor(item.category)}
              />
            </View>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.buyerText}>구매자: {item.buyer}</Text>
              <Text style={styles.dateText}>구매일: {item.date}</Text>
              <Text style={styles.costText}>
                가격: ₩{item.cost.toLocaleString()}
              </Text>
            </View>
            <View style={styles.itemStatus}>
              <View
                style={[
                  styles.categoryBadge,
                  { backgroundColor: getCategoryColor(item.category) },
                ]}
              >
                <Text style={styles.categoryText}>
                  {getCategoryText(item.category)}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(item.status) },
                ]}
              >
                <Text style={styles.statusText}>
                  {getStatusText(item.status)}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  itemsList: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: 16,
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
  itemCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.accent,
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
  buyerText: {
    fontSize: 12,
    color: Colors.light.mutedText,
    marginBottom: 2,
  },
  dateText: {
    fontSize: 12,
    color: Colors.light.mutedText,
    marginBottom: 2,
  },
  costText: {
    fontSize: 12,
    color: Colors.light.mutedText,
  },
  itemStatus: {
    alignItems: "flex-end",
    gap: 6,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
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
});
