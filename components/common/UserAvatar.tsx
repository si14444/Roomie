import { Image, StyleSheet, View } from "react-native";
import { Text } from "@/components/Themed";
import Colors from "@/constants/Colors";

interface UserAvatarProps {
  name: string;
  profileImage?: string;
  size?: "small" | "medium" | "large";
  backgroundColor?: string;
  showBadge?: boolean;
  badgeColor?: string;
  badgeIcon?: React.ReactNode;
}

const SIZES = {
  small: { container: 32, text: 14, badge: 14 },
  medium: { container: 48, text: 18, badge: 18 },
  large: { container: 64, text: 24, badge: 20 },
};

export function UserAvatar({
  name,
  profileImage,
  size = "medium",
  backgroundColor = Colors.light.primary,
  showBadge = false,
  badgeColor,
  badgeIcon,
}: UserAvatarProps) {
  const dimensions = SIZES[size];
  const initial = name.charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      {profileImage ? (
        <Image
          source={{ uri: profileImage }}
          style={[
            styles.image,
            {
              width: dimensions.container,
              height: dimensions.container,
              borderRadius: dimensions.container / 2,
            },
          ]}
        />
      ) : (
        <View
          style={[
            styles.placeholder,
            {
              width: dimensions.container,
              height: dimensions.container,
              borderRadius: dimensions.container / 2,
              backgroundColor,
            },
          ]}
        >
          <Text
            style={[
              styles.initial,
              { fontSize: dimensions.text },
            ]}
          >
            {initial}
          </Text>
        </View>
      )}
      {showBadge && badgeIcon && (
        <View
          style={[
            styles.badge,
            {
              width: dimensions.badge,
              height: dimensions.badge,
              borderRadius: dimensions.badge / 2,
              backgroundColor: badgeColor || Colors.light.warningColor,
            },
          ]}
        >
          {badgeIcon}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  image: {
    // Dynamic styles applied inline
  },
  placeholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  initial: {
    color: "#fff",
    fontWeight: "bold",
  },
  badge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    borderWidth: 2,
    borderColor: Colors.light.cardBackground,
    alignItems: "center",
    justifyContent: "center",
  },
});
