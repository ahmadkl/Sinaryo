import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActionSheet, type SheetAction } from '@/components/ActionSheet';
import { ProjectCard } from '@/components/ProjectCard';
import { HeaderIconButton, ScreenHeader } from '@/components/ScreenHeader';
import { TextPromptModal } from '@/components/TextPromptModal';
import { shareProject } from '@/lib/export';
import { ar } from '@/lib/format';
import { deleteProject, ensureSeeded, listProjects, saveProject } from '@/lib/storage';
import { radius, rowDir, rtlText, useTheme } from '@/lib/theme';
import type { Project } from '@/lib/types';

export default function HomeScreen() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [projects, setProjects] = useState<Project[] | null>(null);
  const [menuFor, setMenuFor] = useState<Project | null>(null);
  const [renameFor, setRenameFor] = useState<Project | null>(null);

  const load = useCallback(async () => {
    await ensureSeeded();
    setProjects(await listProjects());
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const open = (p: Project) => router.push(`/editor/${p.id}`);

  const share = async (p: Project, format: 'txt' | 'json') => {
    try {
      await shareProject(p, format);
    } catch (e) {
      Alert.alert('تعذّرت المشاركة', e instanceof Error ? e.message : 'حدث خطأ غير متوقع.');
    }
  };

  const confirmDelete = (p: Project) => {
    Alert.alert(
      'حذف المشروع؟',
      `سيتم حذف «${p.title}» نهائيًا من هذا الهاتف، ولا يمكن التراجع عن ذلك.`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            await deleteProject(p.id);
            await load();
          },
        },
      ],
    );
  };

  const doRename = async (title: string) => {
    const target = renameFor;
    setRenameFor(null);
    if (!target) return;
    await saveProject({ ...target, title, updatedAt: Date.now() });
    await load();
  };

  const actions: SheetAction[] = menuFor
    ? [
        { key: 'open', label: 'فتح وتعديل', icon: 'create-outline', onPress: () => open(menuFor) },
        {
          key: 'rename',
          label: 'إعادة تسمية',
          icon: 'pencil-outline',
          onPress: () => setRenameFor(menuFor),
        },
        {
          key: 'txt',
          label: 'مشاركة كنص (TXT)',
          icon: 'document-text-outline',
          onPress: () => void share(menuFor, 'txt'),
        },
        {
          key: 'json',
          label: 'مشاركة كملف JSON',
          icon: 'code-slash-outline',
          onPress: () => void share(menuFor, 'json'),
        },
        {
          key: 'delete',
          label: 'حذف المشروع',
          icon: 'trash-outline',
          destructive: true,
          onPress: () => confirmDelete(menuFor),
        },
      ]
    : [];

  return (
    <View style={[styles.screen, { backgroundColor: t.bg }]}>
      <ScreenHeader
        title="قِصّة"
        subtitle="كاتب السيناريو"
        actions={
          <HeaderIconButton
            icon="settings-outline"
            label="الإعدادات"
            onPress={() => router.push('/settings')}
          />
        }
      />

      {projects === null ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={t.gold} />
        </View>
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(p) => p.id}
          contentContainerStyle={[styles.list, { paddingBottom: 110 + insets.bottom }]}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          ListHeaderComponent={
            projects.length > 0 ? (
              <Text style={[styles.sectionTitle, { color: t.textMuted }, rtlText]}>
                مشاريعي ({ar(projects.length)})
              </Text>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="film-outline" size={64} color={t.gold} />
              <Text style={[styles.emptyTitle, { color: t.text }]}>لا توجد مشاريع بعد</Text>
              <Text style={[styles.emptyText, { color: t.textMuted }]}>
                ابدأ سيناريو جديدًا لفيلم أو مسلسل، وسيُحفظ تلقائيًا على هاتفك.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <ProjectCard project={item} onOpen={() => open(item)} onMenu={() => setMenuFor(item)} />
          )}
        />
      )}

      <View
        pointerEvents="box-none"
        style={[styles.fabWrap, { paddingBottom: Math.max(insets.bottom, 12) + 4 }]}
      >
        <Pressable
          onPress={() => router.push('/new')}
          accessibilityRole="button"
          accessibilityLabel="مشروع جديد"
          style={({ pressed }) => [
            styles.fab,
            { backgroundColor: t.gold, flexDirection: rowDir, opacity: pressed ? 0.88 : 1 },
          ]}
        >
          <Ionicons name="add-circle" size={26} color="#0B1F3A" />
          <Text style={styles.fabText}>مشروع جديد</Text>
        </Pressable>
      </View>

      <ActionSheet
        visible={menuFor !== null}
        title={menuFor?.title}
        actions={actions}
        onClose={() => setMenuFor(null)}
      />
      <TextPromptModal
        visible={renameFor !== null}
        title="إعادة تسمية المشروع"
        initialValue={renameFor?.title ?? ''}
        placeholder="عنوان المشروع"
        onCancel={() => setRenameFor(null)}
        onConfirm={(v) => void doRename(v)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, flexGrow: 1 },
  sep: { height: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '800', marginBottom: 12 },
  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 32, gap: 10 },
  emptyTitle: { fontSize: 20, fontWeight: '800' },
  emptyText: { fontSize: 15, lineHeight: 24, textAlign: 'center' },
  fabWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
  },
  fab: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 58,
    borderRadius: radius.button,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  fabText: { color: '#0B1F3A', fontSize: 18, fontWeight: '900' },
});
