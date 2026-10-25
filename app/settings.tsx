import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import { shareAllProjects } from '@/lib/export';
import { ar } from '@/lib/format';
import { listProjects } from '@/lib/storage';
import { radius, rowDir, rtlText, useTheme } from '@/lib/theme';

function InfoCard({
  icon,
  title,
  children,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  children: ReactNode;
}) {
  const t = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.border }]}>
      <View style={[styles.cardHead, { flexDirection: rowDir }]}>
        <Ionicons name={icon} size={22} color={t.gold} />
        <Text style={[styles.cardTitle, { color: t.text }, rtlText]}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

export default function SettingsScreen() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const version = Constants.expoConfig?.version ?? '1.0.0';

  const backupAll = async () => {
    try {
      const projects = await listProjects();
      if (projects.length === 0) {
        Alert.alert('لا توجد مشاريع', 'أنشئ مشروعًا أولًا ثم أعد المحاولة.');
        return;
      }
      await shareAllProjects(projects);
    } catch (e) {
      Alert.alert('تعذّرت المشاركة', e instanceof Error ? e.message : 'حدث خطأ غير متوقع.');
    }
  };

  const body = [styles.body, { color: t.textMuted }, rtlText];

  return (
    <View style={[styles.screen, { backgroundColor: t.bg }]}>
      <ScreenHeader title="الإعدادات" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 32 + insets.bottom }]}>
        <InfoCard icon="shield-checkmark-outline" title="يعمل بدون حساب">
          <Text style={body}>
            لا يطلب التطبيق تسجيل دخول ولا بريدًا إلكترونيًا ولا كلمة مرور ولا أي رمز. كل مشاريعك
            محفوظة على هاتفك فقط، ويعمل التطبيق بالكامل دون إنترنت.
          </Text>
        </InfoCard>

        <InfoCard icon="logo-google" title="Google Drive اختياري">
          <Text style={body}>
            لا يوجد ربط مباشر مع Google Drive. إن كان لديك حساب Google وأردت نسخة سحابية، اضغط زر
            المشاركة داخل أي سيناريو (أو النسخة الاحتياطية أدناه) ثم اختر «Drive» من قائمة
            المشاركة في أندرويد. لا يخرج أي شيء من هاتفك إلا عندما تختار ذلك بنفسك.
          </Text>
          <Pressable
            onPress={() => void backupAll()}
            accessibilityRole="button"
            accessibilityLabel="مشاركة نسخة احتياطية من كل المشاريع"
            style={({ pressed }) => [
              styles.btn,
              { backgroundColor: t.navy, flexDirection: rowDir, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Ionicons name="share-outline" size={22} color={t.gold} />
            <Text style={styles.btnText}>مشاركة نسخة احتياطية (JSON)</Text>
          </Pressable>
        </InfoCard>

        <InfoCard icon="save-outline" title="الحفظ التلقائي">
          <Text style={body}>
            يُحفظ كل تعديل تلقائيًا بعد لحظات من توقفك عن الكتابة، ويُحفظ النص أيضًا عند الخروج من
            المحرر أو تصغير التطبيق.
          </Text>
        </InfoCard>

        <InfoCard icon="contrast-outline" title="المظهر">
          <Text style={body}>
            يتبع التطبيق إعداد الهاتف تلقائيًا: فاتح أو داكن ({t.isDark ? 'الحالي: داكن' : 'الحالي: فاتح'}).
          </Text>
        </InfoCard>

        <Text style={[styles.version, { color: t.textMuted }]}>
          قِصّة — كاتب السيناريو · الإصدار {ar(Number(version.split('.')[0]))}.
          {ar(Number(version.split('.')[1] ?? 0))}.{ar(Number(version.split('.')[2] ?? 0))}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, gap: 14 },
  card: {
    borderRadius: radius.card,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  cardHead: { alignItems: 'center', gap: 10 },
  cardTitle: { flex: 1, fontSize: 18, fontWeight: '800' },
  body: { fontSize: 15, lineHeight: 25 },
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: radius.button,
    marginTop: 4,
  },
  btnText: { color: '#F7EFD8', fontSize: 16, fontWeight: '800' },
  version: { textAlign: 'center', fontSize: 13, marginTop: 8 },
});
