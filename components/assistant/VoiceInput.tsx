import React, { useState } from "react";
import { TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants/tokens";

interface VoiceInputProps {
  onResult: (text: string) => void;
}

export default function VoiceInput({ onResult }: VoiceInputProps) {
  const [recording, setRecording] = useState(false);

  const handlePress = () => {
    Alert.alert("قريباً", "ميزة الإدخال الصوتي ستكون متاحة قريباً");
  };

  return (
    <TouchableOpacity
      style={[styles.btn, recording && styles.btnActive]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Ionicons
        name={recording ? "mic" : "mic-outline"}
        size={22}
        color={recording ? colors.danger : colors.textMuted}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  btnActive: {
    backgroundColor: `${colors.danger}15`,
    borderRadius: 20,
  },
});
