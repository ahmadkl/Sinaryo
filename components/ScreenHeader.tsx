import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { rowDir, rtlText, useTheme } from '@/lib/theme';

interface Props {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  onTitlePress?: () => void;
  actions?: ReactNode;
}

export function ScreenHeader({ title, subtitle, onBack, onTitlePress, actions }: Props) {
  const t = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { backgroundColor: t.headerBg, paddingTop: insets.top + 8 }]}>
      <View style={[styles.row, { flexDirection: rowDir }]}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="رجوع"
            hitSlop={10}
            style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
          >
            {/* In RTL, "back" points to the right. */}
            <Ionicons name="chevron-forward" size={26} color={t.headerText} />
          </Pressable>
        ) : null}

        <Pressable
          style={styles.titleBox}
          onPress={onTitlePress}
          disabled={!onTitlePress}
          accessibilityRole={onTitlePress ? 'button' : 'header'}
          accessibilityHint={onTitlePress ? 'اضغط لإعادة تسمية المشروع' : undefined}
        >
          <Text numberOfLines={1} style={[styles.title, { color: t.headerText }, rtlText]}>
            {title}
          </Text>
          {subtitle ? (
            <Text numberOfLines={1} style={[styles.subtitle, { color: t.gold }, rtlText]}>
              {subtitle}
            </Text>
          ) : null}
        </Pressable>

        {actions ? <View style={[styles.actions, { flexDirection: rowDir }]}>{actions}</View> : null}
      </View>
      <View style={[styles.goldLine, { backgroundColor: t.gold }]} />
    </View>
  );
}

interface IconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}

export function HeaderIconButton({ icon, label, onPress }: IconButtonProps) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
    >
      <Ionicons name={icon} size={24} color={t.headerText} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 12,
    paddingBottom: 0,
  },
  row: {
    alignItems: 'center',
    minHeight: 52,
    gap: 4,
  },
  titleBox: {
    flex: 1,
    paddingHorizontal: 6,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '600',
  },
  actions: {
    alignItems: 'center',
    gap: 2,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
  goldLine: {
    height: 2,
    opacity: 0.85,
    marginHorizontal: -12,
    marginTop: 6,
  },
});
