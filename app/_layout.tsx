import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { TeamProvider } from "@/contexts/TeamContext";
import AppNavigator from "@/components/navigation/AppNavigator";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { initializeKakaoSDK } from "@react-native-kakao/core";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // 카카오 SDK 초기화를 useEffect 내부로 이동
  useEffect(() => {
    const initKakao = async () => {
      try {
        await initializeKakaoSDK("5fdc09b5ccda187fc82936305ec8308c");
        console.log("Kakao SDK initialized successfully");
      } catch (error) {
        console.error("Failed to initialize Kakao SDK:", error);
      }
    };
    
    initKakao();
  }, []);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  // 항상 라이트 테마를 사용하도록 고정
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <TeamProvider>
          <NotificationProvider>
            <AppNavigator>
              <ThemeProvider value={DefaultTheme}>
                <Stack>
                  <Stack.Screen
                    name="(tabs)"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen name="login" options={{ headerShown: false }} />
                  <Stack.Screen
                    name="modal"
                    options={{ presentation: "modal" }}
                  />
                  <Stack.Screen
                    name="team-selection"
                    options={{ headerShown: false }}
                  />
                </Stack>
              </ThemeProvider>
            </AppNavigator>
          </NotificationProvider>
        </TeamProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
