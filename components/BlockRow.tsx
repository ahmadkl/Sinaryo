import { Ionicons } from '@expo/vector-icons';
import { memo, useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { radius, rowDir, rtlText, useTheme } from '@/lib/theme';
import type { Block } from '@/lib/types';

interface Props {
  block: Block;
  sceneNumber?: number;
  focused: boolean;
  autoFocus: boolean;
  onFocus: (id: string) => void;
  onChangeText: (id: string, text: string) => void;
  onChangeCharacter: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onAutoFocused: () => void;
}

function BlockRowImpl({
  block,
  sceneNumber,
  focused,
  autoFocus,
  onFocus,
  onChangeText,
  onChangeCharacter,
  onDelete,
  onAutoFocused,
}: Props) {
  const t = useTheme();
  const mainRef = useRef<TextInput>(null);
  const nameRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!autoFocus) return;
    const timer = setTimeout(() => {
      if (block.kind === 'dialogue') nameRef.current?.focus();
      else mainRef.current?.focus();
      onAutoFocused();
    }, 60);
    return () => clearTimeout(timer);
  }, [autoFocus, block.kind, onAutoFocused]);

  const common = {
    placeholderTextColor: t.placeholder,
    onFocus: () => onFocus(block.id),
    multiline: true,
    scrollEnabled: false,
    textAlignVertical: 'top' as const,
  };

  let label = '';
  let icon: keyof typeof Ionicons.glyphMap = 'create-outline';
  switch (block.kind) {
    case 'episode':
      label = 'حلقة';
      icon = 'albums-outline';
      break;
    case 'scene':
      label = sceneNumber ? `مشهد ${sceneNumber}` : 'مشهد';
      icon = 'videocam-outline';
      break;
    case 'action':
      label = 'وصف حركة';
      icon = 'walk-outline';
      break;
    case 'dialogue':
      label = 'حوار';
      icon = 'chatbubble-ellipses-outline';
      break;
    case 'transition':
      label = 'انتقال';
      icon = 'git-compare-outline';
      break;
  }

  const borderColor = focused ? t.gold : t.border;

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: block.kind === 'scene' ? t.surfaceAlt : t.surface,
          borderColor,
          borderWidth: focused ? 2 : 1,
        },
      ]}
    >
      <View style={[styles.labelRow, { flexDirection: rowDir }]}>
        <Ionicons name={icon} size={15} color={t.gold} />
        <Text style={[styles.label, { color: t.gold }]}>{label}</Text>
        <View style={styles.spacer} />
        <Pressable
          onPress={() => onDelete(block.id)}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={`حذف ${label}`}
          style={styles.delBtn}
        >
          <Ionicons name="trash-outline" size={18} color={t.textMuted} />
        </Pressable>
      </View>

      {block.kind === 'dialogue' ? (
        <TextInput
          ref={nameRef}
          value={block.character ?? ''}
          onChangeText={(v) => onChangeCharacter(block.id, v)}
          onFocus={() => onFocus(block.id)}
          placeholder="اسم الشخصية"
          placeholderTextColor={t.placeholder}
          maxLength={40}
          returnKeyType="next"
          onSubmitEditing={() => mainRef.current?.focus()}
          style={[styles.character, { color: t.gold, borderColor: t.border }, rtlText]}
        />
      ) : null}

      <TextInput
        ref={mainRef}
        value={block.text}
        onChangeText={(v) => onChangeText(block.id, v)}
        placeholder={
          block.kind === 'scene'
            ? 'داخلي/خارجي — المكان — الوقت'
            : block.kind === 'dialogue'
              ? 'نص الحوار…'
              : block.kind === 'transition'
                ? 'قطع إلى:'
                : block.kind === 'episode'
                  ? 'عنوان الحلقة'
                  : 'اكتب وصف الحركة…'
        }
        {...common}
        style={[
          styles.input,
          { color: t.text },
          rtlText,
          block.kind === 'scene' && styles.sceneInput,
          block.kind === 'episode' && styles.episodeInput,
          block.kind === 'transition' && styles.transitionInput,
          block.kind === 'dialogue' && styles.dialogueInput,
        ]}
      />
    </View>
  );
}

export const BlockRow = memo(BlockRowImpl);

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.card,
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 10,
  },
  labelRow: {
    alignItems: 'center',
    gap: 6,
    minHeight: 28,
  },
  spacer: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
  },
  delBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  character: {
    fontSize: 17,
    fontWeight: '800',
    borderBottomWidth: 1,
    paddingVertical: 6,
    marginBottom: 4,
  },
  input: {
    fontSize: 18,
    lineHeight: 30,
    paddingVertical: 4,
    minHeight: 40,
  },
  sceneInput: {
    fontWeight: '800',
  },
  episodeInput: {
    fontSize: 21,
    fontWeight: '900',
  },
  transitionInput: {
    fontWeight: '700',
    textAlign: 'left',
  },
  dialogueInput: {
    paddingHorizontal: 10,
  },
});
