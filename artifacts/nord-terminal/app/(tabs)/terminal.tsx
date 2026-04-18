import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";
import { useTerminal, TerminalLine } from "@/context/TerminalContext";
import { useShizuku } from "@/context/ShizukuContext";

const HISTORY_MAX = 50;

function TerminalRow({ line }: { line: TerminalLine }) {
  const colors = useColors();

  const color =
    line.type === "input"
      ? colors.frost2
      : line.type === "error"
      ? colors.aurora1
      : line.type === "info"
      ? colors.aurora5
      : colors.nord4;

  return (
    <Text
      style={[styles.termLine, { color }]}
      selectable
    >
      {line.content}
    </Text>
  );
}

export default function TerminalScreen() {
  const colors = useColors();
  const { lines, clearTerminal, executeCommand } = useTerminal();
  const { isAuthorized } = useShizuku();
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [running, setRunning] = useState(false);
  const listRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  const handleSubmit = async () => {
    if (!input.trim() || running) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const cmd = input.trim();
    setInput("");
    setHistoryIdx(-1);

    setHistory((prev) => {
      const updated = [cmd, ...prev.filter((h) => h !== cmd)];
      return updated.slice(0, HISTORY_MAX);
    });

    setRunning(true);
    try {
      await executeCommand(cmd);
    } finally {
      setRunning(false);
    }
  };

  const handleClear = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    clearTerminal();
  };

  const handleHistoryUp = () => {
    const nextIdx = historyIdx + 1;
    if (nextIdx < history.length) {
      setHistoryIdx(nextIdx);
      setInput(history[nextIdx]);
    }
  };

  const handleHistoryDown = () => {
    if (historyIdx <= 0) {
      setHistoryIdx(-1);
      setInput("");
    } else {
      const nextIdx = historyIdx - 1;
      setHistoryIdx(nextIdx);
      setInput(history[nextIdx]);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.toolbar, { backgroundColor: colors.nord1, borderBottomColor: colors.border }]}>
        <View style={styles.toolbarLeft}>
          <View style={[styles.dot, { backgroundColor: colors.aurora1 }]} />
          <View style={[styles.dot, { backgroundColor: colors.aurora3 }]} />
          <View style={[styles.dot, { backgroundColor: colors.aurora4 }]} />
        </View>
        <View style={styles.toolbarCenter}>
          <Text style={[styles.toolbarTitle, { color: colors.frost2 }]}>shizuku@shell</Text>
          {isAuthorized && (
            <View style={[styles.authBadge, { backgroundColor: colors.aurora4 + "30" }]}>
              <View style={[styles.authDot, { backgroundColor: colors.aurora4 }]} />
              <Text style={[styles.authText, { color: colors.aurora4 }]}>authorized</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={handleClear} style={styles.toolbarBtn}>
          <Feather name="trash-2" size={18} color={colors.aurora1} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <FlatList
          ref={listRef}
          data={lines}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TerminalRow line={item} />}
          style={styles.output}
          contentContainerStyle={styles.outputContent}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          showsVerticalScrollIndicator={false}
        />

        {!isAuthorized && (
          <View style={[styles.noAuthBanner, { backgroundColor: colors.aurora3 + "18", borderColor: colors.aurora3 }]}>
            <Feather name="alert-triangle" size={14} color={colors.aurora3} />
            <Text style={[styles.noAuthText, { color: colors.aurora3 }]}>
              Shizuku not authorized — some commands may be limited
            </Text>
          </View>
        )}

        <View style={[styles.inputBar, { backgroundColor: colors.nord1, borderTopColor: colors.border }]}>
          <View style={styles.historyBtns}>
            <TouchableOpacity onPress={handleHistoryUp} style={styles.histBtn}>
              <Feather name="chevron-up" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleHistoryDown} style={styles.histBtn}>
              <Feather name="chevron-down" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.prompt, { color: colors.frost2 }]}>$</Text>

          <TextInput
            ref={inputRef}
            style={[styles.input, { color: colors.foreground }]}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSubmit}
            placeholder="type a command..."
            placeholderTextColor={colors.mutedForeground}
            returnKeyType="send"
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            editable={!running}
            blurOnSubmit={false}
            autoComplete="off"
          />

          <TouchableOpacity
            onPress={handleSubmit}
            style={[styles.sendBtn, { backgroundColor: running ? colors.nord2 : colors.frost4 }]}
            disabled={running || !input.trim()}
          >
            <Feather name="corner-down-left" size={16} color={running ? colors.mutedForeground : colors.foreground} />
          </TouchableOpacity>
        </View>

        {Platform.OS === "web" && <View style={{ height: 34 }} />}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
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
  toolbarCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  toolbarTitle: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    letterSpacing: 0.5,
  },
  authBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  authDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  authText: {
    fontFamily: "Inter_500Medium",
    fontSize: 10,
  },
  toolbarBtn: {
    padding: 4,
    width: 32,
    alignItems: "flex-end",
  },
  output: {
    flex: 1,
  },
  outputContent: {
    padding: 12,
    paddingBottom: 8,
  },
  termLine: {
    fontFamily: "Inter_400Regular",
    fontSize: 12.5,
    lineHeight: 20,
  },
  noAuthBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 12,
    marginBottom: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  noAuthText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    flex: 1,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    gap: 8,
  },
  historyBtns: {
    flexDirection: "row",
    gap: 2,
  },
  histBtn: {
    padding: 4,
  },
  prompt: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
  input: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    paddingVertical: 4,
  },
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});
