import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { radius, rowDir, rtlText, useTheme } from '@/lib/theme';

export interface SheetAction {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  destructive?: boolean;
  onPress: () => void;
}

interface Props {
  visible: boolean;
  title?: string;
  actions: SheetAction[];
  onClose: () => void;
}

/** Bottom sheet with large touch targets, easy to reach with one thumb. */
export function ActionSheet({ visible, title, actions, onClose }: Props) {
  const t = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <View style={[styles.backdrop, { backgroundColor: t.overlay }]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="إغلاق"
        />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: t.surface,
              borderColor: t.border,
              paddingBottom: Math.max(insets.bottom, 12) + 4,
            },
          ]}
        >
          <View style={[styles.grabber, { backgroundColor: t.border }]} />
          {title ? (
            <Text numberOfLines={1} style={[styles.title, { color: t.textMuted }, rtlText]}>
              {title}
            </Text>
          ) : null}
          {actions.map((a) => {
            const color = a.destructive ? t.danger : t.text;
            return (
              <Pressable
                key={a.key}
                onPress={() => {
                  onClose();
                  a.onPress();
                }}
                accessibilityRole="button"
                accessibilityLabel={a.label}
                style={({ pressed }) => [
                  styles.item,
                  { flexDirection: rowDir, backgroundColor: pressed ? t.surfaceAlt : 'transparent' },
                ]}
              >
                <Ionicons name={a.icon} size={22} color={a.destructive ? t.danger : t.gold} />
                <Text style={[styles.itemText, { color }, rtlText]}>{a.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  grabber: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: radius.pill,
    marginBottom: 10,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    paddingHorizontal: 12,
    paddingBottom: 6,
  },
  item: {
    alignItems: 'center',
    gap: 14,
    minHeight: 56,
    paddingHorizontal: 12,
    borderRadius: radius.button,
  },
  itemText: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
  },
});
