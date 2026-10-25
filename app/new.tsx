import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import { saveProject } from '@/lib/storage';
import { createProjectFromTemplate, defaultTitle, TEMPLATES } from '@/lib/templates';
import { radius, rowDir, rtlText, useTheme } from '@/lib/theme';
import type { ProjectType } from '@/lib/types';

export default function NewProjectScreen() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [type, setType] = useState<ProjectType>('film');
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);

  const create = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const project = createProjectFromTemplate(type, title);
      const ok = await saveProject(project);
      if (!ok) {
        Alert.alert('تعذّر الحفظ', 'لم يتمكن التطبيق من حفظ المشروع. تحقق من مساحة التخزين وحاول مجددًا.');
        return;
      }
      router.replace(`/editor/${project.id}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: t.bg }]}>
      <ScreenHeader title="مشروع جديد" subtitle="اختر القالب" onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: 120 + insets.bottom }]}
        keyboardShouldPersistTaps="handled"
      >
        {TEMPLATES.map((tpl) => {
          const selected = tpl.type === type;
          return (
            <Pressable
              key={tpl.type}
              onPress={() => setType(tpl.type)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={tpl.title}
              style={[
                styles.card,
                {
                  flexDirection: rowDir,
                  backgroundColor: t.surface,
                  borderColor: selected ? t.gold : t.border,
                  borderWidth: selected ? 2 : 1,
                },
              ]}
            >
              <View style={[styles.badge, { backgroundColor: t.navy }]}>
                <Ionicons name={tpl.icon} size={30} color={t.gold} />
              </View>
              <View style={styles.cardBody}>
                <Text style={[styles.cardTitle, { color: t.text }, rtlText]}>{tpl.title}</Text>
                <Text style={[styles.cardDesc, { color: t.textMuted }, rtlText]}>
                  {tpl.description}
                </Text>
              </View>
              <Ionicons
                name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                size={26}
                color={selected ? t.gold : t.border}
              />
            </Pressable>
          );
        })}

        <Text style={[styles.label, { color: t.textMuted }, rtlText]}>عنوان المشروع</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder={defaultTitle(type)}
          placeholderTextColor={t.placeholder}
          maxLength={80}
          returnKeyType="done"
          onSubmitEditing={() => void create()}
          style={[
            styles.input,
            { color: t.text, backgroundColor: t.surface, borderColor: t.border },
            rtlText,
          ]}
        />
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: t.bg,
            borderTopColor: t.border,
            paddingBottom: Math.max(insets.bottom, 12) + 4,
          },
        ]}
      >
        <Pressable
          onPress={() => void create()}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel="إنشاء المشروع"
          style={({ pressed }) => [
            styles.createBtn,
            { backgroundColor: t.gold, opacity: busy ? 0.6 : pressed ? 0.88 : 1 },
          ]}
        >
          <Text style={styles.createText}>إنشاء وبدء الكتابة</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, gap: 12 },
  card: {
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radius.card,
  },
  badge: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { flex: 1, gap: 4 },
  cardTitle: { fontSize: 18, fontWeight: '800' },
  cardDesc: { fontSize: 13.5, lineHeight: 21 },
  label: { fontSize: 14, fontWeight: '800', marginTop: 12 },
  input: {
    borderRadius: radius.input,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 18,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  createBtn: {
    height: 58,
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createText: { color: '#0B1F3A', fontSize: 18, fontWeight: '900' },
});
