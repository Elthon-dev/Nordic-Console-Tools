import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { BlurView } from "expo-blur";

import { useColors } from "@/hooks/useColors";

export default function TabLayout() {
  const colors = useColors();
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.frost2,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.nord1,
        },
        headerTintColor: colors.frost2,
        headerTitleStyle: {
          fontFamily: "Inter_600SemiBold",
          fontSize: 16,
          letterSpacing: 0.5,
          color: colors.frost2,
        },
        headerShadowVisible: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : colors.nord1,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 0,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarLabelStyle: {
          fontFamily: "Inter_500Medium",
          fontSize: 11,
          letterSpacing: 0.5,
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={80}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
          ) : isWeb ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.nord1 }]} />
          ) : null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="console"
        options={{
          title: "Console",
          tabBarIcon: ({ color }) => (
            <Feather name="activity" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="shizuku"
        options={{
          title: "Shizuku",
          tabBarIcon: ({ color }) => (
            <Feather name="shield" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="terminal"
        options={{
          title: "Terminal",
          tabBarIcon: ({ color }) => (
            <Feather name="terminal" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
