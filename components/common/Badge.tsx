import { StyleSheet, View } from "react-native";
import { Text } from "@/components/Themed";
import Colors from "@/constants/Colors";

interface BadgeProps {
  text: string;
  variant?: "primary" | "success" | "warning" | "error" | "info";
  size?: "small" | "medium";
}

const VARIANT_COLORS = {
  primary: {
    background: Colors.light.accentBlue,
    text: Colors.light.primary,
  },
  success: {
    background: Colors.light.successColor,
    text: "#fff",
  },
  warning: {
    background: Colors.light.warningColor,
    text: "#fff",
  },
  error: {
    background: Colors.light.errorColor,
    text: "#fff",
  },
  info: {
    background: Colors.light.surface,
    text: Colors.light.text,
  },
};

const SIZE_STYLES = {
  small: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    fontSize: 10,
  },
  medium: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 12,
  },
};

export function Badge({ text, variant = "primary", size = "small" }: BadgeProps) {
  const colors = VARIANT_COLORS[variant];
  const sizeStyle = SIZE_STYLES[size];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.background,
          paddingHorizontal: sizeStyle.paddingHorizontal,
          paddingVertical: sizeStyle.paddingVertical,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: colors.text,
            fontSize: sizeStyle.fontSize,
          },
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  text: {
    fontWeight: "600",
  },
});
