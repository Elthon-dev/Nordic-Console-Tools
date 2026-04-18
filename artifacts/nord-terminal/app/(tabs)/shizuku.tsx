import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";
import { useShizuku } from "@/context/ShizukuContext";
import { useConsole } from "@/context/ConsoleContext";

interface Step {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: "done" | "active" | "pending";
}

const SETUP_STEPS: Omit<Step, "status">[] = [
  {
    id: "1",
    title: "Install Shizuku",
    description: "Download Shizuku from the Play Store. Shizuku enables elevated shell access through a local ADB bridge.",
    icon: "download",
  },
  {
    id: "2",
    title: "Enable via ADB / MIUI",
    description: "Connect your device to a PC and run:\nadb shell sh /sdcard/Android/data/moe.shizuku.privileged.api/start.sh\n\nOn MIUI, enable Wireless debugging and pair via the built-in option.",
    icon: "terminal",
  },
  {
    id: "3",
    title: "Grant Permission",
    description: "Press the button below to grant Nord Terminal permission to use Shizuku's IPC interface. A dialog will appear asking for confirmation.",
    icon: "shield",
  },
  {
    id: "4",
    title: "Ready",
    description: "Shizuku is active and Nord Terminal has full shell access. Use the Terminal tab to run commands.",
    icon: "check-circle",
  },
];

function getStepStatuses(authorized: boolean, currentStep: number): Step["status"][] {
  if (authorized) return ["done", "done", "done", "done"];
  return SETUP_STEPS.map((_, i) => {
    if (i < currentStep) return "done";
    if (i === currentStep) return "active";
    return "pending";
  });
}

export default function ShizukuScreen() {
  const colors = useColors();
  const { status, isAuthorized, requestPermission } = useShizuku();
  const { addLog } = useConsole();
  const [requesting, setRequesting] = useState(false);
  const [currentStep, setCurrentStep] = useState(isAuthorized ? 4 : 2);

  const handleRequestPermission = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRequesting(true);
    addLog("Requesting Shizuku permission...", "info", "SHIZUKU");

    try {
      const granted = await requestPermission();
      if (granted) {
        setCurrentStep(4);
        addLog("Shizuku permission granted. Full shell access enabled.", "success", "SHIZUKU");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        addLog("Shizuku permission denied.", "error", "SHIZUKU");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (e) {
      addLog("Shizuku connection failed: " + String(e), "error", "SHIZUKU");
    } finally {
      setRequesting(false);
    }
  };

  const statuses = getStepStatuses(isAuthorized, currentStep);

  const statusColor = isAuthorized ? colors.aurora4 : colors.aurora3;
  const statusLabel = isAuthorized ? "Authorized" : status === "not_running" ? "Not Running" : "Not Installed";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.nord1, borderBottomColor: colors.border }]}>
        <View style={styles.statusRow}>
          <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusLabel, { color: colors.foreground }]}>
            Shizuku: <Text style={{ color: statusColor }}>{statusLabel}</Text>
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, Platform.OS === "web" ? { paddingBottom: 54 } : {}]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.bannerCard, { backgroundColor: colors.nord2, borderColor: colors.frost4 }]}>
          <Feather name="info" size={18} color={colors.frost3} />
          <Text style={[styles.bannerText, { color: colors.nord5 }]}>
            Shizuku is a service that provides apps with elevated ADB shell access without root. Follow these steps to enable full terminal support.
          </Text>
        </View>

        <View style={styles.stepsContainer}>
          {SETUP_STEPS.map((step, index) => {
            const stepStatus = statuses[index];
            const isActive = stepStatus === "active";
            const isDone = stepStatus === "done";
            const isPending = stepStatus === "pending";

            return (
              <View key={step.id} style={styles.stepWrapper}>
                <View style={styles.stepLine}>
                  <View
                    style={[
                      styles.stepCircle,
                      {
                        backgroundColor: isDone
                          ? colors.aurora4
                          : isActive
                          ? colors.frost2
                          : colors.nord2,
                        borderColor: isDone
                          ? colors.aurora4
                          : isActive
                          ? colors.frost2
                          : colors.border,
                      },
                    ]}
                  >
                    {isDone ? (
                      <Feather name="check" size={14} color={colors.nord0} />
                    ) : (
                      <Text
                        style={[
                          styles.stepNumber,
                          { color: isActive ? colors.nord0 : colors.mutedForeground },
                        ]}
                      >
                        {index + 1}
                      </Text>
                    )}
                  </View>
                  {index < SETUP_STEPS.length - 1 && (
                    <View
                      style={[
                        styles.connector,
                        { backgroundColor: isDone ? colors.aurora4 : colors.border },
                      ]}
                    />
                  )}
                </View>

                <View
                  style={[
                    styles.stepCard,
                    {
                      backgroundColor: isActive ? colors.nord2 : colors.nord1,
                      borderColor: isActive ? colors.frost4 : colors.border,
                      opacity: isPending ? 0.5 : 1,
                    },
                  ]}
                >
                  <View style={styles.stepCardHeader}>
                    <Feather
                      name={step.icon as any}
                      size={16}
                      color={isDone ? colors.aurora4 : isActive ? colors.frost2 : colors.mutedForeground}
                    />
                    <Text
                      style={[
                        styles.stepTitle,
                        {
                          color: isDone
                            ? colors.aurora4
                            : isActive
                            ? colors.frost2
                            : colors.mutedForeground,
                        },
                      ]}
                    >
                      {step.title}
                    </Text>
                  </View>
                  <Text style={[styles.stepDescription, { color: colors.nord5 }]}>
                    {step.description}
                  </Text>

                  {step.id === "3" && !isAuthorized && (
                    <TouchableOpacity
                      style={[
                        styles.grantButton,
                        {
                          backgroundColor: isActive ? colors.frost2 : colors.nord2,
                          borderColor: isActive ? colors.frost2 : colors.border,
                          opacity: requesting ? 0.7 : 1,
                        },
                      ]}
                      onPress={handleRequestPermission}
                      disabled={requesting || !isActive}
                    >
                      {requesting ? (
                        <ActivityIndicator size="small" color={colors.nord0} />
                      ) : (
                        <>
                          <Feather
                            name="shield"
                            size={16}
                            color={isActive ? colors.nord0 : colors.mutedForeground}
                          />
                          <Text
                            style={[
                              styles.grantButtonText,
                              { color: isActive ? colors.nord0 : colors.mutedForeground },
                            ]}
                          >
                            Grant Shizuku Permission
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {isAuthorized && (
          <View style={[styles.successBanner, { backgroundColor: colors.aurora4 + "20", borderColor: colors.aurora4 }]}>
            <Feather name="check-circle" size={22} color={colors.aurora4} />
            <View style={styles.successTextContainer}>
              <Text style={[styles.successTitle, { color: colors.aurora4 }]}>
                Shizuku Active
              </Text>
              <Text style={[styles.successDesc, { color: colors.nord5 }]}>
                Full shell access is available. Switch to the Terminal tab to start running commands.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  bannerCard: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "flex-start",
  },
  bannerText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 19,
    flex: 1,
  },
  stepsContainer: {
    gap: 0,
  },
  stepWrapper: {
    flexDirection: "row",
    gap: 12,
  },
  stepLine: {
    alignItems: "center",
    width: 32,
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumber: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
  },
  connector: {
    width: 2,
    flex: 1,
    minHeight: 20,
    marginVertical: 4,
  },
  stepCard: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
    gap: 8,
  },
  stepCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  stepDescription: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 19,
  },
  grantButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 4,
  },
  grantButtonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  successTextContainer: {
    flex: 1,
    gap: 4,
  },
  successTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
  },
  successDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 18,
  },
});
