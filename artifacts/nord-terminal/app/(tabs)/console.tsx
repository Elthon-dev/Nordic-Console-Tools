import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useRef } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";
import { useConsole, LogEntry, LogLevel } from "@/context/ConsoleContext";

function getLevelColor(level: LogLevel, colors: ReturnType<typeof useColors>) {
  switch (level) {
    case "error":
      return colors.aurora1;
    case "warn":
      return colors.aurora3;
    case "success":
      return colors.aurora4;
    case "info":
      return colors.frost2;
    case "system":
      return colors.aurora5;
    default:
      return colors.nord4;
  }
}

function getLevelPrefix(level: LogLevel) {
  switch (level) {
    case "error":
      return "ERR ";
    case "warn":
      return "WARN";
    case "success":
      return " OK ";
    case "info":
      return "INFO";
    case "system":
      return " SYS";
    default:
      return " LOG";
  }
}

function LogRow({ item }: { item: LogEntry }) {
  const colors = useColors();
  const levelColor = getLevelColor(item.level, colors);
  const prefix = getLevelPrefix(item.level);
  const time = item.timestamp.toTimeString().split(" ")[0];

  return (
    <View style={styles.logRow}>
      <Text style={[styles.logTime, { color: colors.mutedForeground }]}>{time}</Text>
      <View style={[styles.levelBadge, { backgroundColor: levelColor + "22" }]}>
        <Text style={[styles.levelText, { color: levelColor }]}>{prefix}</Text>
      </View>
      {item.tag ? (
        <Text style={[styles.logTag, { color: colors.frost3 }]}>[{item.tag}] </Text>
      ) : null}
      <Text style={[styles.logMessage, { color: colors.foreground }]} numberOfLines={6}>
        {item.message}
      </Text>
    </View>
  );
}

export default function ConsoleScreen() {
  const colors = useColors();
  const { logs, addLog, clearLogs } = useConsole();
  const listRef = useRef<FlatList>(null);

  const handleClear = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    clearLogs();
  };

  const handleAddTestLog = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const levels: LogLevel[] = ["log", "info", "warn", "error", "success"];
    const msgs = [
      "Test log entry generated",
      "Process spawned with PID 2048",
      "Warning: low memory condition",
      "Error: permission denied /data/system",
      "Shizuku binder connected",
    ];
    const idx = Math.floor(Math.random() * levels.length);
    addLog(msgs[idx], levels[idx], "TEST");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.toolbar, { borderBottomColor: colors.border, backgroundColor: colors.nord1 }]}>
        <View style={styles.toolbarLeft}>
          <View style={[styles.dot, { backgroundColor: colors.aurora1 }]} />
          <View style={[styles.dot, { backgroundColor: colors.aurora3 }]} />
          <View style={[styles.dot, { backgroundColor: colors.aurora4 }]} />
        </View>
        <Text style={[styles.toolbarTitle, { color: colors.frost2 }]}>console</Text>
        <View style={styles.toolbarRight}>
          <TouchableOpacity onPress={handleAddTestLog} style={styles.toolbarBtn}>
            <Feather name="plus-circle" size={18} color={colors.frost3} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleClear} style={styles.toolbarBtn}>
            <Feather name="trash-2" size={18} color={colors.aurora1} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        ref={listRef}
        data={logs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <LogRow item={item} />}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="terminal" size={36} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No logs yet</Text>
          </View>
        }
      />

      <View style={[styles.statusBar, { backgroundColor: colors.nord1, borderTopColor: colors.border }]}>
        <View style={[styles.statusDot, { backgroundColor: colors.aurora4 }]} />
        <Text style={[styles.statusText, { color: colors.mutedForeground }]}>
          {logs.length} entries
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  toolbarLeft: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    width: 60,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  toolbarTitle: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    letterSpacing: 1,
  },
  toolbarRight: {
    flexDirection: "row",
    gap: 12,
    width: 60,
    justifyContent: "flex-end",
  },
  toolbarBtn: {
    padding: 4,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 12,
    gap: 4,
  },
  logRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingVertical: 4,
    flexWrap: "wrap",
  },
  logTime: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    marginTop: 2,
    minWidth: 64,
  },
  levelBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    minWidth: 40,
    alignItems: "center",
  },
  levelText: {
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    letterSpacing: 0.5,
  },
  logTag: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    marginTop: 1,
  },
  logMessage: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingTop: 80,
  },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
  statusBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    ...(Platform.OS === "web" ? { paddingBottom: 34 } : {}),
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
  },
});
