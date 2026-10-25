import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ar, formatDate, typeLabel } from '@/lib/format';
import { projectStats } from '@/lib/stats';
import { radius, rowDir, rtlText, useTheme } from '@/lib/theme';
import type { Project } from '@/lib/types';

interface Props {
  project: Project;
  onOpen: () => void;
  onMenu: () => void;
}

export function ProjectCard({ project, onOpen, onMenu }: Props) {
  const t = useTheme();
  const stats = projectStats(project);
  const isSeries = project.type === 'series';

  return (
    <Pressable
      onPress={onOpen}
      accessibilityRole="button"
      accessibilityLabel={`فتح ${project.title}`}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: t.surface,
          borderColor: t.border,
          flexDirection: rowDir,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <View style={[styles.badge, { backgroundColor: t.navy }]}>
        <Ionicons name={isSeries ? 'tv-outline' : 'film-outline'} size={26} color={t.gold} />
      </View>

      <View style={styles.body}>
        <Text numberOfLines={1} style={[styles.title, { color: t.text }, rtlText]}>
          {project.title}
        </Text>
        <View style={[styles.metaRow, { flexDirection: rowDir }]}>
          <View style={[styles.pill, { backgroundColor: t.goldSoft }]}>
            <Text style={[styles.pillText, { color: t.isDark ? t.gold : '#6B5217' }]}>
              {typeLabel(project.type)}
            </Text>
          </View>
          <Text style={[styles.meta, { color: t.textMuted }]}>
            {ar(stats.words)} كلمة · {ar(stats.scenes)} مشهد
          </Text>
        </View>
        <Text style={[styles.date, { color: t.textMuted }, rtlText]}>
          آخر تعديل: {formatDate(project.updatedAt)}
        </Text>
      </View>

      <Pressable
        onPress={onMenu}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`خيارات ${project.title}`}
        style={styles.menuBtn}
      >
        <Ionicons name="ellipsis-vertical" size={22} color={t.textMuted} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    borderRadius: radius.card,
    borderWidth: 1,
    padding: 14,
    gap: 12,
    elevation: 2,
    shadowColor: '#0B1F3A',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  badge: {
    width: 54,
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  metaRow: {
    alignItems: 'center',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '800',
  },
  meta: {
    fontSize: 13,
  },
  date: {
    fontSize: 12,
  },
  menuBtn: {
    width: 40,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
