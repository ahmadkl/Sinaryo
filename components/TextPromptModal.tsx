import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { radius, rowDir, rtlText, useTheme } from '@/lib/theme';

interface Props {
  visible: boolean;
  title: string;
  initialValue: string;
  placeholder?: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: (value: string) => void;
}

/** Cross-platform replacement for Alert.prompt (which only exists on iOS). */
export function TextPromptModal({
  visible,
  title,
  initialValue,
  placeholder,
  confirmLabel = 'حفظ',
  onCancel,
  onConfirm,
}: Props) {
  const t = useTheme();
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (visible) setValue(initialValue);
  }, [visible, initialValue]);

  const canConfirm = value.trim().length > 0;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.backdrop, { backgroundColor: t.overlay }]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} accessibilityLabel="إغلاق" />
        <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.border }]}>
          <Text style={[styles.title, { color: t.text }, rtlText]}>{title}</Text>
          <TextInput
            value={value}
            onChangeText={setValue}
            placeholder={placeholder}
            placeholderTextColor={t.placeholder}
            autoFocus
            selectTextOnFocus
            maxLength={80}
            returnKeyType="done"
            onSubmitEditing={() => canConfirm && onConfirm(value.trim())}
            style={[
              styles.input,
              { color: t.text, backgroundColor: t.surfaceAlt, borderColor: t.border },
              rtlText,
            ]}
          />
          <View style={[styles.buttons, { flexDirection: rowDir }]}>
            <Pressable
              onPress={onCancel}
              style={[styles.btn, { backgroundColor: t.surfaceAlt }]}
              accessibilityRole="button"
            >
              <Text style={[styles.btnText, { color: t.text }]}>إلغاء</Text>
            </Pressable>
            <Pressable
              onPress={() => canConfirm && onConfirm(value.trim())}
              disabled={!canConfirm}
              style={[styles.btn, { backgroundColor: t.gold, opacity: canConfirm ? 1 : 0.5 }]}
              accessibilityRole="button"
            >
              <Text style={[styles.btnText, { color: '#0B1F3A' }]}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    borderRadius: radius.card,
    borderWidth: 1,
    padding: 20,
    gap: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  input: {
    borderRadius: radius.input,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 17,
  },
  buttons: {
    gap: 10,
  },
  btn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: radius.button,
    alignItems: 'center',
  },
  btnText: {
    fontSize: 16,
    fontWeight: '800',
  },
});
