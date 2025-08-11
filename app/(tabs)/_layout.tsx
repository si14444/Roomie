import React, { useState } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View } from "react-native";
import { Tabs } from "expo-router";

import Colors from "@/constants/Colors";
import { useNotificationContext } from "@/contexts/NotificationContext";
import { NotificationsModal } from "@/components/notifications/NotificationsModal";
import { useTeam } from "@/contexts/TeamContext";
import { useAuth } from "@/contexts/AuthContext";
import { Alert } from "react-native";

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />;
}

function HeaderRightButtons() {
  const [showNotifications, setShowNotifications] = useState(false);
  const { logout } = useAuth();
  const {
    notifications,
    unreadCount,
    markAllAsRead,
    clearReadNotifications,
    deleteNotification,
    handleNotificationClick,
    getNotificationIcon,
    getRelativeTime,
  } = useNotificationContext();

  const handleNotificationPress = () => {
    setShowNotifications(true);
  };

  const handleCloseNotifications = () => {
    setShowNotifications(false);
  };

  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '로그아웃', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('오류', '로그아웃에 실패했습니다.');
            }
          }
        }
      ]
    );
  };

  return (
    <>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <TouchableOpacity
          style={{ position: "relative", padding: 8 }}
          onPress={handleNotificationPress}
        >
          <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
          {unreadCount > 0 && (
            <View
              style={{
                position: "absolute",
                top: 6,
                right: 6,
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: "#EF4444",
              }}
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={{ padding: 8 }}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <NotificationsModal
        visible={showNotifications}
        onClose={handleCloseNotifications}
        notifications={notifications}
        unreadCount={unreadCount}
        onNotificationPress={(notification) => {
          handleNotificationClick(notification);
          handleCloseNotifications();
        }}
        onMarkAllAsRead={markAllAsRead}
        onClearReadNotifications={clearReadNotifications}
        onDeleteNotification={deleteNotification}
        getNotificationIcon={getNotificationIcon}
        getRelativeTime={getRelativeTime}
      />
    </>
  );
}

export default function TabLayout() {
  // 항상 라이트 테마를 사용하도록 고정
  const colorScheme = "light";
  const { currentTeam } = useTeam();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
        tabBarInactiveTintColor: Colors[colorScheme].tabIconDefault,
        tabBarStyle: {
          backgroundColor: Colors[colorScheme].background,
          borderTopColor: Colors[colorScheme].borderColor,
          borderTopWidth: 1,
          paddingBottom: 35,
          paddingTop: 12,
          height: 108,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        // 헤더를 표시하도록 변경
        headerShown: true,
        headerStyle: {
          backgroundColor: Colors[colorScheme].primary,
        },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: {
          fontWeight: "bold",
          fontSize: 18,
        },
        headerTitleAlign: "center",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "홈",
          headerTitle: currentTeam ? `${currentTeam.name} - 홈` : "룸메이트 관리",
          headerRight: () => <HeaderRightButtons />,
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="routines"
        options={{
          title: "루틴관리",
          headerTitle: "루틴 관리",
          headerRight: () => <HeaderRightButtons />,
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="calendar" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bills"
        options={{
          title: "공과금",
          headerTitle: "공과금 관리",
          headerRight: () => <HeaderRightButtons />,
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="calculator" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="items"
        options={{
          title: "공용물품",
          headerTitle: "공용물품 관리",
          headerRight: () => <HeaderRightButtons />,
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="shopping-cart" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
