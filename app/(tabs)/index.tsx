import Colors from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { useNotificationContext } from "@/contexts/NotificationContext";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Import hooks for actual data integration
import { useBills } from "@/hooks/useBills";
import { useRoutines } from "@/hooks/useRoutines";

// Import home components
import { HomeQuickActions } from "@/components/home/HomeQuickActions";
import { RecentActivity } from "@/components/home/RecentActivity";
import { StatusSummaryCard } from "@/components/home/StatusSummaryCard";
import { TodayTasks } from "@/components/home/TodayTasks";

// Import modals for direct functionality
import { AddBillModal } from "@/components/bills/AddBillModal";
import { FontAwesome } from "@expo/vector-icons";

export default function HomeScreen() {
  const { createNotification } = useNotificationContext();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated]);

  // Connect to actual data hooks
  const { completeRoutine, routines, addNewRoutine } = useRoutines();
  const { addNewBill: addBill } = useBills();

  // Modal states
  const [showAddBillModal, setShowAddBillModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newBill, setNewBill] = useState({
    name: "",
    amount: "",
    splitType: "equal" as "equal" | "custom",
    dueDate: "",
    category: "utility" as "utility" | "subscription" | "maintenance",
    icon: "flash-outline" as any,
  });
  const [inviteModalVisible, setInviteModalVisible] = useState(false);

  const handleQuickAction = (actionId: number) => {
    switch (actionId) {
      case 1: // 설거지 완료
        handleRoutineComplete("설거지");
        break;
      case 2: // 청소 완료
        handleRoutineComplete("청소");
        break;
      case 3: // 공과금 추가
        handleAddBill();
        break;
      case 4: // 물품 요청
        handleItemRequest();
        break;
      default:
        break;
    }
  };

  const handleRoutineComplete = (routineType: string) => {
    // 현재 사용자 (실제로는 로그인 시스템에서 가져올 값)
    const currentUser = "김철수";

    // 해당 루틴 찾기
    const targetRoutine = routines.find(
      (r) =>
        r.task.includes(routineType) &&
        r.assignee === currentUser &&
        r.status === "pending"
    );

    if (targetRoutine) {
      // 실제 루틴 완료 처리
      completeRoutine(targetRoutine.id);
      Alert.alert("완료", `${routineType} 루틴이 완료되었습니다!`);
    } else {
      // 새 루틴으로 간주하고 즉시 완료 처리
      createNotification({
        title: "루틴 완료",
        message: `${currentUser}가 ${routineType}를 완료했습니다`,
        type: "routine_completed",
        relatedId: Date.now().toString(),
      });
      Alert.alert("완료", `${routineType}가 완료 처리되었습니다!`);
    }
  };

  const handleAddBill = () => {
    // 오늘 날짜를 기본값으로 설정
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    setNewBill({
      ...newBill,
      dueDate: nextWeek.toISOString().split("T")[0],
    });
    setShowAddBillModal(true);
  };

  const handleItemRequest = () => {
    Alert.prompt(
      "🛒 물품 요청",
      "어떤 물품이 필요한지 입력해주세요:",
      [
        { text: "취소", style: "cancel" },
        {
          text: "요청하기",
          onPress: (itemName) => {
            if (itemName && itemName.trim()) {
              // 물품 요청 데이터 저장 (실제로는 상태관리에 저장)
              const currentUser = "김철수";
              createNotification({
                title: "물품 요청",
                message: `${currentUser}가 "${itemName.trim()}" 구매를 요청했습니다`,
                type: "item_request",
                relatedId: Date.now().toString(),
                actionData: {
                  requester: currentUser,
                  itemName: itemName.trim(),
                  requestDate: new Date().toISOString(),
                },
              });
              Alert.alert(
                "✅ 요청 완료",
                `"${itemName.trim()}" 구매 요청이 룸메이트들에게 전송되었습니다!`
              );
            }
          },
        },
      ],
      "plain-text"
    );
  };

  const handleBillModalSubmit = () => {
    const success = addBill(newBill);
    if (success) {
      setNewBill({
        name: "",
        amount: "",
        splitType: "equal",
        dueDate: "",
        category: "utility",
        icon: "flash-outline",
      });
      setShowAddBillModal(false);
      Alert.alert(
        "🎉 성공",
        "새 공과금이 추가되어 룸메이트들에게 알림이 전송되었습니다!"
      );
    }
  };

  const handleAddTask = () => {
    Alert.prompt(
      "📝 새 할 일 추가",
      "오늘 할 일을 입력해주세요:",
      [
        { text: "취소", style: "cancel" },
        {
          text: "추가하기",
          onPress: (taskName) => {
            if (taskName && taskName.trim()) {
              // 현재 사용자
              const currentUser = "김철수";

              // 새 루틴 추가 (일회성 작업으로)
              addNewRoutine({
                task: taskName.trim(),
                assignee: currentUser,
                frequency: "daily",
              });

              createNotification({
                title: "새 할 일 추가",
                message: `"${taskName.trim()}" 작업이 오늘 할 일에 추가되었습니다`,
                type: "system",
                relatedId: Date.now().toString(),
              });

              Alert.alert(
                "✅ 추가 완료",
                `"${taskName.trim()}"이 오늘 할 일에 추가되었습니다!`
              );
            }
          },
        },
      ],
      "plain-text"
    );
  };

  const handleTaskPress = (taskId: number) => {
    Alert.alert("작업 관리", "이 작업을 어떻게 처리하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "✅ 완료 처리",
        onPress: () => {
          // 해당 루틴 완료 처리
          const routine = routines.find((r) => r.id === taskId);
          if (routine) {
            completeRoutine(taskId);
            Alert.alert("완료", `"${routine.task}"가 완료되었습니다!`);
          }
        },
      },
      {
        text: "⏰ 내일로 미루기",
        onPress: () => {
          Alert.alert("미루기", "작업이 내일로 연기되었습니다.");
        },
      },
    ]);
  };

  // 초대 링크 (임시)
  const inviteLink = "https://roomie.app/invite?code=ABC123";

  const handleInvite = () => {
    setInviteModalVisible(true);
  };

  const handleCopy = async () => {
    await Clipboard.setStringAsync(inviteLink);
    if (Platform.OS === "android") {
      ToastAndroid.show("초대 링크가 복사되었습니다!", ToastAndroid.SHORT);
    } else {
      Alert.alert("복사 완료", "초대 링크가 복사되었습니다!");
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({ message: inviteLink });
    } catch (error) {
      Alert.alert("공유 실패", "초대 링크를 공유하는 데 실패했습니다.");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <StatusSummaryCard />
        <HomeQuickActions onActionPress={handleQuickAction} />
        <TodayTasks onAddTask={handleAddTask} onTaskPress={handleTaskPress} />
        <RecentActivity />
      </ScrollView>
      {/* 초대 버튼 UI */}
      <TouchableOpacity style={styles.inviteButton} onPress={handleInvite}>
        <Text style={styles.inviteButtonText}>룸메이트 초대</Text>
      </TouchableOpacity>
      {/* 공과금 추가 모달 */}
      <AddBillModal
        visible={showAddBillModal}
        newBill={newBill}
        setNewBill={setNewBill}
        onClose={() => setShowAddBillModal(false)}
        onAddBill={handleBillModalSubmit}
      />
      {/* 초대 모달 */}
      <Modal
        visible={inviteModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setInviteModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setInviteModalVisible(false)}
        />
        <View style={styles.inviteModal}>
          <View style={styles.dragBar} />
          <Text style={styles.modalTitle}>룸메이트 초대</Text>
          <Text style={styles.modalDesc}>
            아래 버튼을 눌러 카카오톡으로 초대 링크를 공유하세요!
          </Text>
          <View style={styles.modalButtonRow}>
            <TouchableOpacity style={styles.kakaoButton} onPress={handleShare}>
              <FontAwesome
                name="comment"
                size={20}
                color="#3C1E1E"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.kakaoButtonText}>카카오톡으로 공유</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setInviteModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>닫기</Text>
          </TouchableOpacity>
        </View>
      </Modal>
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
  inviteButton: {
    position: "absolute",
    bottom: 32,
    right: 24,
    backgroundColor: Colors.light.primary,
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 28,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inviteButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  inviteModal: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
    alignItems: "center",
    // marginBottom 제거
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.light.primary,
    marginBottom: 8,
  },
  modalDesc: {
    fontSize: 15,
    color: Colors.light.mutedText,
    marginBottom: 18,
    textAlign: "center",
  },
  modalButtonRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 12,
    width: "100%",
    marginTop: 2,
  },
  modalButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 13,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 4,
    backgroundColor: "transparent",
  },
  shareButton: {
    backgroundColor: Colors.light.accentBlue,
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.2,
  },
  closeButton: {
    marginTop: 8,
    alignItems: "center",
    width: "100%",
    borderRadius: 8,
    paddingVertical: 10,
    backgroundColor: "#F5F5F5",
    minHeight: 36,
    alignSelf: "center",
  },
  closeButtonText: {
    color: Colors.light.mutedText,
    fontSize: 14,
    padding: 4,
    fontWeight: "500",
    textAlign: "center",
    width: "100%",
  },
  dragBar: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#D1C4E9",
    alignSelf: "center",
    marginBottom: 12,
    marginTop: 4,
    opacity: 0.5,
  },
  kakaoButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEE500",
    borderRadius: 8,
    paddingVertical: 14,
    marginBottom: 8,
    marginTop: 8,
    minHeight: 48,
  },
  kakaoButtonText: {
    color: "#3C1E1E",
    fontSize: 16,
    fontWeight: "bold",
  },
});
