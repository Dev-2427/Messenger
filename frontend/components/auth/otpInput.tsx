import React, { useRef } from "react";
import { View, TextInput } from "react-native";

type OtpInputProps = {
  value: string;
  onChange: (val: string) => void;
  onBlur?: () => void;
  length?: number;
};

export default function OtpInput({
  value,
  onChange,
  onBlur,
  length = 6,
}: OtpInputProps) {
  const inputsRef = useRef<(TextInput | null)[]>([]);

  const digits = value ? value.split("") : [];
  const codeArray = Array.from({ length }, (_, i) => digits[i] || "");

  const handleChangeText = (text: string, index: number) => {
    const char = text.slice(-1);
    const updated = [...codeArray];
    updated[index] = char;

    onChange(updated.join(""));

    if (char && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !codeArray[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <View style={{ flexDirection: "row", justifyContent: "center", gap: 12, marginTop: 20 }}>
      {codeArray.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => {
            inputsRef.current[index] = ref;
          }}
          value={digit}
          keyboardType="number-pad"
          maxLength={1}
          textAlign="center"
          onChangeText={(text) => handleChangeText(text, index)}
          onKeyPress={(e) => handleKeyPress(e.nativeEvent.key, index)}
          onBlur={onBlur}
          className={`rounded-xl border-2 text-xl font-semibold text-center ${
            digit ? "border-[#648DDB]" : "border-[#e1e1e1]"
          } bg-white text-[#545454]`}
          style={{
            width: 48,
            height: 56,
            borderRadius: 12,
            borderWidth: 2,
          }}
        />
      ))}
    </View>
  );
}
