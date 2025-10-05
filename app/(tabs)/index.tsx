import Colors from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { useTeam } from "@/contexts/TeamContext";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@/components/common/BottomSheetModal";

// Import home components
import { CurrentRoommates } from "@/components/home/CurrentRoommates";
import { RoommateFeedback } from "@/components/home/RoommateFeedback";
import { StatusSummaryCard } from "@/components/home/StatusSummaryCard";

export default function HomeScreen() {
  const { isAuthenticated } = useAuth();
  const { currentTeam } = useTeam();
  const router = useRouter();
  const [inviteModalVisible, setInviteModalVisible] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated]);

  const handleInvite = () => {
    if (!currentTeam) {
      Alert.alert("오류", "팀을 먼저 선택해주세요.");
      return;
    }
    setInviteModalVisible(true);
  };

  const handleCopyInviteCode = async () => {
    if (!currentTeam?.invite_code && !currentTeam?.inviteCode) {
      Alert.alert("오류", "초대 코드를 찾을 수 없습니다.");
      return;
    }

    const inviteCode = currentTeam.invite_code || currentTeam.inviteCode || "";
    await Clipboard.setStringAsync(inviteCode);

    if (Platform.OS === "android") {
      ToastAndroid.show("초대 코드가 복사되었습니다!", ToastAndroid.SHORT);
    } else {
      Alert.alert("복사 완료", "초대 코드가 복사되었습니다!");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <StatusSummaryCard />
        <RoommateFeedback />
        <CurrentRoommates onAddRoommate={handleInvite} />
      </ScrollView>

      {/* 초대 모달 */}
      <BottomSheetModal
        visible={inviteModalVisible}
        onClose={() => setInviteModalVisible(false)}
        title="룸메이트 초대"
        showCloseButton={false}
      >
        <Text style={styles.modalDesc}>
          아래 초대 코드를 복사해서 친구에게 공유하세요!
        </Text>

        {/* 초대 코드 표시 */}
        <View style={styles.inviteCodeContainer}>
          <View style={styles.inviteCodeBox}>
            <Ionicons name="key" size={20} color={Colors.light.primary} />
            <Text style={styles.inviteCodeText}>
              {currentTeam?.invite_code || currentTeam?.inviteCode || "코드 없음"}
            </Text>
          </View>
        </View>

        {/* 복사 버튼 */}
        <TouchableOpacity
          style={styles.copyButton}
          onPress={handleCopyInviteCode}
        >
          <Ionicons name="copy-outline" size={20} color="#fff" />
          <Text style={styles.copyButtonText}>초대 코드 복사</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setInviteModalVisible(false)}
        >
          <Text style={styles.closeButtonText}>닫기</Text>
        </TouchableOpacity>
      </BottomSheetModal>
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
  inviteCodeContainer: {
    width: "100%",
    marginVertical: 20,
  },
  inviteCodeBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: Colors.light.primary,
    borderStyle: "dashed",
    gap: 12,
  },
  inviteCodeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.light.primary,
    letterSpacing: 2,
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
    width: "100%",
    marginBottom: 12,
  },
  copyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
