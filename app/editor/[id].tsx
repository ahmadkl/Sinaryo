import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  AppState,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ActionSheet, type SheetAction } from '@/components/ActionSheet';
import { BlockRow } from '@/components/BlockRow';
import { InsertToolbar } from '@/components/InsertToolbar';
import { HeaderIconButton, ScreenHeader } from '@/components/ScreenHeader';
import { TextPromptModal } from '@/components/TextPromptModal';
import { shareProject } from '@/lib/export';
import { ar, typeLabel } from '@/lib/format';
import { newId } from '@/lib/id';
import { projectStats, sceneNumbers, characterNames } from '@/lib/stats';
import { deleteProject, loadProject, saveProject } from '@/lib/storage';
import { radius, rowDir, rtlText, useTheme } from '@/lib/theme';
import type { Block, BlockKind, Project } from '@/lib/types';
import { useKeyboardInset } from '@/lib/useKeyboardInset';

type SaveState = 'saved' | 'saving' | 'error';

const AUTOSAVE_DELAY_MS = 500;

export default function EditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useTheme();
  const router = useRouter();
  const { containerRef, inset, onLayout } = useKeyboardInset();

  const [project, setProject] = useState<Project | null>(null);
  const [missing, setMissing] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>('saved');
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [autoFocusId, setAutoFocusId] = useState<string | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [menu, setMenu] = useState<'share' | 'more' | null>(null);

  // The ref always holds the newest text, so a save never uses stale state.
  const projectRef = useRef<Project | null>(null);
  const dirtyRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listRef = useRef<FlatList<Block>>(null);

  /* ------------------------------ load ------------------------------ */

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const p = id ? await loadProject(String(id)) : null;
      if (cancelled) return;
      if (!p) {
        setMissing(true);
        return;
      }
      projectRef.current = p;
      setProject(p);
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  /* ----------------------------- autosave ---------------------------- */

  /** Writes pending changes now. Resolves to false if the write failed. */
  const flush = useCallback(async (): Promise<boolean> => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const p = projectRef.current;
    if (!p || !dirtyRef.current) return true;
    dirtyRef.current = false;
    setSaveState('saving');
    const ok = await saveProject(p);
    if (!ok) {
      dirtyRef.current = true;
      setSaveState('error');
    } else if (!dirtyRef.current) {
      setSaveState('saved');
    }
    return ok;
  }, []);

  const apply = useCallback(
    (mutate: (p: Project) => Project) => {
      const current = projectRef.current;
      if (!current) return;
      const next: Project = { ...mutate(current), updatedAt: Date.now() };
      projectRef.current = next;
      dirtyRef.current = true;
      setProject(next);
      setSaveState('saving');
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        void flush();
      }, AUTOSAVE_DELAY_MS);
    },
    [flush],
  );

  // Never lose text: save when the app goes to background...
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') void flush();
    });
    return () => sub.remove();
  }, [flush]);

  // ...and when leaving the editor by any route (back button, gesture, ...).
  useEffect(() => {
    return () => {
      void flush();
    };
  }, [flush]);

  /* ----------------------------- editing ----------------------------- */

  const changeText = useCallback(
    (blockId: string, text: string) => {
      apply((p) => ({
        ...p,
        blocks: p.blocks.map((b) => (b.id === blockId ? { ...b, text } : b)),
      }));
    },
    [apply],
  );

  const changeCharacter = useCallback(
    (blockId: string, character: string) => {
      apply((p) => ({
        ...p,
        blocks: p.blocks.map((b) => (b.id === blockId ? { ...b, character } : b)),
      }));
    },
    [apply],
  );

  const removeBlock = useCallback(
    (blockId: string) => {
      const remove = () =>
        apply((p) => ({ ...p, blocks: p.blocks.filter((b) => b.id !== blockId) }));
      const block = projectRef.current?.blocks.find((b) => b.id === blockId);
      if (!block) return;
      if (block.text.trim() || (block.character ?? '').trim()) {
        Alert.alert('حذف هذا العنصر؟', 'سيُحذف النص الذي كتبته فيه.', [
          { text: 'إلغاء', style: 'cancel' },
          { text: 'حذف', style: 'destructive', onPress: remove },
        ]);
      } else {
        remove();
      }
    },
    [apply],
  );

  const insert = useCallback(
    (kind: BlockKind) => {
      const current = projectRef.current;
      if (!current) return;

      let text = '';
      if (kind === 'transition') text = 'قطع إلى:';
      if (kind === 'episode') {
        const count = current.blocks.filter((b) => b.kind === 'episode').length;
        text = `الحلقة ${ar(count + 1)}`;
      }
      const block: Block =
        kind === 'dialogue'
          ? { id: newId(), kind, text, character: '' }
          : { id: newId(), kind, text };

      const focusedIndex = focusedId ? current.blocks.findIndex((b) => b.id === focusedId) : -1;
      const index = focusedIndex >= 0 ? focusedIndex + 1 : current.blocks.length;

      apply((p) => {
        const blocks = [...p.blocks];
        blocks.splice(index, 0, block);
        return { ...p, blocks };
      });
      setFocusedId(block.id);
      setAutoFocusId(block.id);
      setTimeout(() => {
        listRef.current?.scrollToIndex({ index, viewPosition: 0.25, animated: true });
      }, 120);
    },
    [apply, focusedId],
  );

  const clearAutoFocus = useCallback(() => setAutoFocusId(null), []);

  /* ----------------------------- actions ----------------------------- */

  const goBack = useCallback(async () => {
    const ok = await flush();
    if (!ok) {
      Alert.alert('تعذّر الحفظ', 'لم يُحفظ آخر تعديل. هل تريد البقاء في المحرر؟', [
        { text: 'البقاء', style: 'cancel' },
        { text: 'الخروج رغم ذلك', style: 'destructive', onPress: () => leave() },
      ]);
      return;
    }
    leave();

    function leave() {
      if (router.canGoBack()) router.back();
      else router.replace('/');
    }
  }, [flush, router]);

  const rename = async (title: string) => {
    setRenaming(false);
    apply((p) => ({ ...p, title }));
    await flush();
  };

  const share = async (format: 'txt' | 'json') => {
    try {
      await flush();
      const p = projectRef.current;
      if (p) await shareProject(p, format);
    } catch (e) {
      Alert.alert('تعذّرت المشاركة', e instanceof Error ? e.message : 'حدث خطأ غير متوقع.');
    }
  };

  const confirmDelete = () => {
    const p = projectRef.current;
    if (!p) return;
    Alert.alert(
      'حذف المشروع؟',
      `سيتم حذف «${p.title}» نهائيًا من هذا الهاتف، ولا يمكن التراجع عن ذلك.`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            // Stop autosave first so the deleted project is not written back.
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = null;
            dirtyRef.current = false;
            await deleteProject(p.id);
            if (router.canGoBack()) router.back();
            else router.replace('/');
          },
        },
      ],
    );
  };

  const switchType = () => {
    apply((p) => ({ ...p, type: p.type === 'film' ? 'series' : 'film' }));
  };

  /* ----------------------------- derived ----------------------------- */

  const stats = useMemo(() => (project ? projectStats(project) : null), [project]);
  const numbers = useMemo(() => (project ? sceneNumbers(project.blocks) : new Map()), [project]);
  const names = useMemo(() => (project ? characterNames(project.blocks) : []), [project]);
  const focusedBlock = project?.blocks.find((b) => b.id === focusedId);
  const showNameChips = focusedBlock?.kind === 'dialogue' && names.length > 0;

  if (missing) {
    return (
      <View style={[styles.screen, { backgroundColor: t.bg }]}>
        <ScreenHeader title="المشروع" onBack={() => router.replace('/')} />
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={56} color={t.gold} />
          <Text style={[styles.centerText, { color: t.text }]}>تعذّر العثور على هذا المشروع.</Text>
        </View>
      </View>
    );
  }

  if (!project || !stats) {
    return (
      <View style={[styles.screen, { backgroundColor: t.bg }]}>
        <ScreenHeader title="…" onBack={() => router.replace('/')} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={t.gold} />
        </View>
      </View>
    );
  }

  const shareActions: SheetAction[] = [
    {
      key: 'txt',
      label: 'مشاركة كنص (TXT)',
      icon: 'document-text-outline',
      onPress: () => void share('txt'),
    },
    {
      key: 'json',
      label: 'مشاركة كملف JSON',
      icon: 'code-slash-outline',
      onPress: () => void share('json'),
    },
  ];

  const moreActions: SheetAction[] = [
    {
      key: 'rename',
      label: 'إعادة تسمية المشروع',
      icon: 'pencil-outline',
      onPress: () => setRenaming(true),
    },
    {
      key: 'type',
      label: project.type === 'film' ? 'تحويل إلى مسلسل' : 'تحويل إلى فيلم',
      icon: project.type === 'film' ? 'tv-outline' : 'film-outline',
      onPress: switchType,
    },
    {
      key: 'delete',
      label: 'حذف المشروع',
      icon: 'trash-outline',
      destructive: true,
      onPress: confirmDelete,
    },
  ];

  const saveLabel =
    saveState === 'saved' ? 'تم الحفظ' : saveState === 'saving' ? 'جارٍ الحفظ…' : 'تعذّر الحفظ';
  const saveColor = saveState === 'error' ? t.danger : t.textMuted;

  return (
    <View style={[styles.screen, { backgroundColor: t.bg }]}>
      <ScreenHeader
        title={project.title}
        subtitle={typeLabel(project.type)}
        onBack={() => void goBack()}
        onTitlePress={() => setRenaming(true)}
        actions={
          <>
            <HeaderIconButton
              icon="share-social-outline"
              label="مشاركة السيناريو"
              onPress={() => setMenu('share')}
            />
            <HeaderIconButton
              icon="ellipsis-vertical"
              label="المزيد"
              onPress={() => setMenu('more')}
            />
          </>
        }
      />

      <View ref={containerRef} onLayout={onLayout} style={styles.body} collapsable={false}>
        <View style={[styles.flex, { paddingBottom: inset }]}>
          <View
            style={[
              styles.statsBar,
              { backgroundColor: t.surface, borderBottomColor: t.border, flexDirection: rowDir },
            ]}
          >
            <Stat icon="text-outline" value={ar(stats.words)} label="كلمة" />
            <Stat icon="videocam-outline" value={ar(stats.scenes)} label="مشهد" />
            {project.type === 'series' ? (
              <Stat icon="albums-outline" value={ar(stats.episodes)} label="حلقة" />
            ) : null}
            <View style={styles.flex} />
            <Pressable
              onPress={() => {
                if (saveState === 'error') void flush();
              }}
              accessibilityRole="text"
              accessibilityLabel={saveLabel}
              style={[styles.saveBox, { flexDirection: rowDir }]}
            >
              <Ionicons
                name={
                  saveState === 'saved'
                    ? 'checkmark-circle'
                    : saveState === 'saving'
                      ? 'sync'
                      : 'warning'
                }
                size={16}
                color={saveState === 'saved' ? t.gold : saveColor}
              />
              <Text style={[styles.saveText, { color: saveColor }]}>{saveLabel}</Text>
            </Pressable>
          </View>

          <FlatList
            ref={listRef}
            data={project.blocks}
            keyExtractor={(b) => b.id}
            contentContainerStyle={styles.list}
            ItemSeparatorComponent={() => <View style={styles.sep} />}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            removeClippedSubviews={false}
            initialNumToRender={20}
            windowSize={15}
            onScrollToIndexFailed={(info) => {
              listRef.current?.scrollToOffset({
                offset: info.averageItemLength * info.index,
                animated: true,
              });
            }}
            ListEmptyComponent={
              <View style={styles.emptyList}>
                <Ionicons name="create-outline" size={48} color={t.gold} />
                <Text style={[styles.emptyText, { color: t.textMuted }]}>
                  السيناريو فارغ. استخدم الأزرار بالأسفل لإضافة مشهد أو حوار.
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <BlockRow
                block={item}
                sceneNumber={numbers.get(item.id)}
                focused={item.id === focusedId}
                autoFocus={item.id === autoFocusId}
                onFocus={setFocusedId}
                onChangeText={changeText}
                onChangeCharacter={changeCharacter}
                onDelete={removeBlock}
                onAutoFocused={clearAutoFocus}
              />
            )}
          />

          {showNameChips && focusedBlock ? (
            <View style={[styles.chipsWrap, { backgroundColor: t.surface, borderTopColor: t.border }]}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                keyboardShouldPersistTaps="always"
                contentContainerStyle={[styles.chips, { flexDirection: rowDir }]}
              >
                {names.map((name) => (
                  <Pressable
                    key={name}
                    onPress={() => changeCharacter(focusedBlock.id, name)}
                    accessibilityRole="button"
                    accessibilityLabel={`الشخصية ${name}`}
                    style={[styles.chip, { backgroundColor: t.goldSoft }]}
                  >
                    <Text
                      style={[styles.chipText, { color: t.isDark ? t.gold : '#6B5217' }, rtlText]}
                    >
                      {name}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ) : null}

          <InsertToolbar projectType={project.type} onInsert={insert} compact={inset > 0} />
        </View>
      </View>

      <ActionSheet
        visible={menu === 'share'}
        title="مشاركة السيناريو عبر قائمة أندرويد"
        actions={shareActions}
        onClose={() => setMenu(null)}
      />
      <ActionSheet
        visible={menu === 'more'}
        title={project.title}
        actions={moreActions}
        onClose={() => setMenu(null)}
      />
      <TextPromptModal
        visible={renaming}
        title="إعادة تسمية المشروع"
        initialValue={project.title}
        placeholder="عنوان المشروع"
        onCancel={() => setRenaming(false)}
        onConfirm={(v) => void rename(v)}
      />
    </View>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
}) {
  const t = useTheme();
  return (
    <View style={[styles.stat, { flexDirection: rowDir }]} accessible accessibilityLabel={`${value} ${label}`}>
      <Ionicons name={icon} size={16} color={t.gold} />
      <Text style={[styles.statText, { color: t.text }]}>
        {value} {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  flex: { flex: 1 },
  body: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  centerText: { fontSize: 17, fontWeight: '700', textAlign: 'center' },
  statsBar: {
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderBottomWidth: 1,
  },
  stat: { alignItems: 'center', gap: 5 },
  statText: { fontSize: 13, fontWeight: '800' },
  saveBox: { alignItems: 'center', gap: 4 },
  saveText: { fontSize: 12, fontWeight: '700' },
  list: { padding: 12, paddingBottom: 40, flexGrow: 1 },
  sep: { height: 10 },
  emptyList: { alignItems: 'center', gap: 10, paddingTop: 60, paddingHorizontal: 32 },
  emptyText: { fontSize: 15, lineHeight: 24, textAlign: 'center' },
  chipsWrap: { borderTopWidth: 1, paddingVertical: 8 },
  chips: { paddingHorizontal: 10, gap: 8, alignItems: 'center' },
  chip: {
    paddingHorizontal: 16,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: { fontSize: 15, fontWeight: '800' },
});
