import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { radius, rowDir, useTheme } from '@/lib/theme';
import type { BlockKind, ProjectType } from '@/lib/types';

interface Item {
  kind: BlockKind;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const ITEMS: Item[] = [
  { kind: 'scene', label: 'مشهد', icon: 'videocam-outline' },
  { kind: 'action', label: 'حركة', icon: 'walk-outline' },
  { kind: 'dialogue', label: 'حوار', icon: 'chatbubble-ellipses-outline' },
  { kind: 'transition', label: 'قطع إلى', icon: 'git-compare-outline' },
];

const EPISODE_ITEM: Item = { kind: 'episode', label: 'حلقة', icon: 'albums-outline' };

interface Props {
  projectType: ProjectType;
  onInsert: (kind: BlockKind) => void;
  /** True while the keyboard is open: drops the bottom safe-area padding. */
  compact?: boolean;
}

/** Bottom bar placed within thumb reach for one-handed writing. */
export function InsertToolbar({ projectType, onInsert, compact }: Props) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const items = projectType === 'series' ? [...ITEMS, EPISODE_ITEM] : ITEMS;

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: t.surface,
          borderTopColor: t.border,
          paddingBottom: compact ? 8 : Math.max(insets.bottom, 8),
        },
      ]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.content, { flexDirection: rowDir }]}
        keyboardShouldPersistTaps="always"
      >
        {items.map((item) => (
          <Pressable
            key={item.kind}
            onPress={() => onInsert(item.kind)}
            accessibilityRole="button"
            accessibilityLabel={`إدراج ${item.label}`}
            style={({ pressed }) => [
              styles.btn,
              { flexDirection: rowDir, backgroundColor: t.navy, opacity: pressed ? 0.75 : 1 },
            ]}
          >
            <Ionicons name={item.icon} size={20} color={t.gold} />
            <Text style={styles.btnText}>{item.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderTopWidth: 1,
    paddingTop: 8,
  },
  content: {
    paddingHorizontal: 10,
    gap: 8,
    alignItems: 'center',
  },
  btn: {
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    height: 48,
    borderRadius: radius.button,
  },
  btnText: {
    color: '#F7EFD8',
    fontSize: 15,
    fontWeight: '800',
  },
});
