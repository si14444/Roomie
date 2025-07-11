import { StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Text, View } from "@/components/Themed";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";

export default function ItemsScreen() {
  const items = [
    {
      id: 1,
      name: "화장지",
      buyer: "김철수",
      date: "2024-12-20",
      cost: 25000,
      category: "bathroom",
      status: "active",
      icon: "flower-outline" as keyof typeof Ionicons.glyphMap,
    },
    {
      id: 2,
      name: "세제",
      buyer: "이영희",
      date: "2024-12-18",
      cost: 15000,
      category: "kitchen",
      status: "active",
      icon: "water-outline" as keyof typeof Ionicons.glyphMap,
    },
    {
      id: 3,
      name: "샴푸",
      buyer: "박민수",
      date: "2024-12-15",
      cost: 18000,
      category: "bathroom",
      status: "low",
      icon: "sparkles-outline" as keyof typeof Ionicons.glyphMap,
    },
    {
      id: 4,
      name: "쌀",
      buyer: "김철수",
      date: "2024-12-10",
      cost: 35000,
      category: "kitchen",
      status: "empty",
      icon: "nutrition-outline" as keyof typeof Ionicons.glyphMap,
    },
  ];

  const requests = [
    { id: 1, item: "휴지", requester: "이영희", urgent: true },
    { id: 2, item: "주방세제", requester: "박민수", urgent: false },
    { id: 3, item: "우유", requester: "김철수", urgent: false },
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
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View
        style={[
          styles.welcomeSection,
          { backgroundColor: Colors.light.accent },
        ]}
      >
        <View style={styles.welcomeContent}>
          <Text style={[styles.greeting, { color: Colors.light.primary }]}>
            쇼핑 준비! 🛍️
          </Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons
            name="notifications-outline"
            size={24}
            color={Colors.light.primary}
          />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionCard}>
            <Ionicons
              name="add-circle"
              size={24}
              color={Colors.light.primary}
            />
            <Text style={styles.actionText}>새 물품</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Ionicons
              name="scan-outline"
              size={24}
              color={Colors.light.secondary}
            />
            <Text style={styles.actionText}>바코드 스캔</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Ionicons
              name="list-outline"
              size={24}
              color={Colors.light.warningColor}
            />
            <Text style={styles.actionText}>쇼핑 리스트</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.requestsSection}>
          <Text style={styles.sectionTitle}>구매 요청</Text>
          {requests.map((request) => (
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
                    <Text style={styles.requestItem}>{request.item}</Text>
                    {request.urgent && (
                      <View style={styles.urgentBadge}>
                        <Ionicons name="flame" size={12} color="white" />
                        <Text style={styles.urgentText}>긴급</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.requesterText}>
                    요청자: {request.requester}
                  </Text>
                </View>
              </View>
              <View style={styles.requestActions}>
                <TouchableOpacity style={styles.acceptButton}>
                  <Ionicons name="checkmark" size={16} color="white" />
                  <Text style={styles.acceptButtonText}>수락</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.ignoreButton}>
                  <Ionicons
                    name="close"
                    size={16}
                    color={Colors.light.mutedText}
                  />
                  <Text style={styles.ignoreButtonText}>무시</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.itemsList}>
          <Text style={styles.sectionTitle}>현재 물품 현황</Text>
          {items.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemCardHeader}>
                <View style={styles.iconContainer}>
                  <Ionicons
                    name={item.icon}
                    size={24}
                    color={Colors.light.primary}
                  />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.buyerText}>구매자: {item.buyer}</Text>
                  <Text style={styles.dateText}>구매일: {item.date}</Text>
                  <Text style={styles.costText}>
                    비용: ₩{item.cost.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.badges}>
                  <View
                    style={[
                      styles.categoryBadge,
                      { backgroundColor: getCategoryColor(item.category) },
                    ]}
                  >
                    <Text style={styles.badgeText}>
                      {getCategoryText(item.category)}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(item.status) },
                    ]}
                  >
                    <Text style={styles.badgeText}>
                      {getStatusText(item.status)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.itemActions}>
                <TouchableOpacity style={styles.updateButton}>
                  <Ionicons name="refresh" size={16} color="white" />
                  <Text style={styles.updateButtonText}>상태 업데이트</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.requestButton}>
                  <Ionicons
                    name="cart-outline"
                    size={16}
                    color={Colors.light.mutedText}
                  />
                  <Text style={styles.requestButtonText}>구매 요청</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.statistics}>
          <Text style={styles.sectionTitle}>이번 달 구매 통계</Text>
          <View style={styles.statsCard}>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Ionicons
                  name="wallet-outline"
                  size={24}
                  color={Colors.light.primary}
                />
                <Text style={styles.statNumber}>₩93,000</Text>
                <Text style={styles.statLabel}>총 지출</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons
                  name="bag-outline"
                  size={24}
                  color={Colors.light.secondary}
                />
                <Text style={styles.statNumber}>4</Text>
                <Text style={styles.statLabel}>구매 횟수</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons
                  name="trophy-outline"
                  size={24}
                  color={Colors.light.warningColor}
                />
                <Text style={styles.statNumber}>김철수</Text>
                <Text style={styles.statLabel}>이번 달 MVP</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  quickActions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: Colors.light.cardBackground,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.light.borderColor,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.light.text,
  },
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
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.light.borderColor,
  },
  requestCardContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  requestIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: Colors.light.accent,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  requestInfo: {
    flex: 1,
  },
  requestHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  requestItem: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginRight: 8,
  },
  urgentBadge: {
    backgroundColor: Colors.light.errorColor,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  urgentText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
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
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 4,
  },
  acceptButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  ignoreButton: {
    flex: 1,
    backgroundColor: Colors.light.surfaceVariant,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 4,
  },
  ignoreButtonText: {
    color: Colors.light.mutedText,
    fontSize: 14,
    fontWeight: "600",
  },
  itemsList: {
    paddingHorizontal: 20,
  },
  itemCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.light.borderColor,
  },
  itemCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: Colors.light.accent,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 4,
  },
  buyerText: {
    fontSize: 13,
    color: Colors.light.mutedText,
    marginBottom: 2,
  },
  dateText: {
    fontSize: 13,
    color: Colors.light.mutedText,
    marginBottom: 2,
  },
  costText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.primary,
  },
  badges: {
    gap: 4,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  itemActions: {
    flexDirection: "row",
    gap: 12,
  },
  updateButton: {
    flex: 1,
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  updateButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  requestButton: {
    flex: 1,
    backgroundColor: Colors.light.surfaceVariant,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  requestButtonText: {
    color: Colors.light.mutedText,
    fontSize: 14,
    fontWeight: "600",
  },
  statistics: {
    margin: 20,
  },
  statsCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.light.borderColor,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
    gap: 8,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.light.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.mutedText,
    textAlign: "center",
  },
  greeting: {
    fontSize: 18,
    color: "white",
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
  },
  notificationButton: {
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  welcomeSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 16,
  },
  welcomeContent: {
    flex: 1,
  },
  welcomeSubtitle: {
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },
});
