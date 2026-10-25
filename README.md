# قِصّة — كاتب السيناريو

تطبيق أندرويد عربي بالكامل (من اليمين إلى اليسار) لكتابة سيناريوهات الأفلام والمسلسلات.

- **بدون حساب، بدون تسجيل دخول، بدون رمز أو كلمة مرور، بدون أي API Key.**
- **يعمل بالكامل دون إنترنت.** كل المشاريع تُحفظ محليًا على الهاتف (AsyncStorage).
- **Google Drive اختياري** وبشكل يدوي فقط: زر المشاركة يفتح قائمة المشاركة في أندرويد (TXT أو JSON) ويختار المستخدم «Drive» بنفسه. لا توجد مزامنة مباشرة ولا أي رموز Google داخل التطبيق.
- يتبع الوضع الفاتح/الداكن حسب إعداد الهاتف.

التقنيات: React Native + Expo SDK 54 + Expo Router + TypeScript + AsyncStorage + expo-sharing.

---

## المزايا

| الميزة | التفاصيل |
|---|---|
| الشاشة الرئيسية | قائمة المشاريع المحفوظة، مع عدد الكلمات والمشاهد وتاريخ آخر تعديل |
| مشروع جديد | قالب «سيناريو فيلم» أو «سيناريو مسلسل» (المسلسل يضيف عنصر «حلقة» ويعيد ترقيم المشاهد في كل حلقة) |
| المحرر | عنوان المشروع ونوعه، كتابة RTL، عداد كلمات وعداد مشاهد، إدراج: مشهد، وصف حركة، شخصية + حوار، «قطع إلى»، (حلقة للمسلسل) |
| اختيار الشخصية | عند الوقوف على حوار تظهر أسماء الشخصيات المستخدمة سابقًا لاختيارها بلمسة واحدة |
| الحفظ التلقائي | بعد 0.5 ثانية من آخر تعديل، وعند تصغير التطبيق، وعند الخروج من المحرر بأي طريقة |
| إدارة المشاريع | إعادة تسمية، تحويل النوع (فيلم/مسلسل)، حذف مع رسالة تأكيد |
| المشاركة | TXT أو JSON لمشروع واحد، أو نسخة احتياطية JSON لكل المشاريع، عبر Android Share Sheet |
| أول تشغيل | مشروعان تجريبيان: فيلم «الطريق إلى البحر» ومسلسل «حارة القمر» |
| التصميم | كحلي داكن + ذهبي + خلفية عاجية، بطاقات مستديرة، أزرار كبيرة أسفل الشاشة للكتابة بيد واحدة |

---

## المتطلبات

- Node.js 20 أو أحدث (يُفضّل 22)
- npm
- للتجربة على الهاتف: تطبيق **Expo Go** (أو بناء APK كما في الأسفل)

## التثبيت

```bash
npm install
npx expo install --check     # يتأكد أن كل الحزم بإصدارات متوافقة مع Expo SDK 54، ويصلحها إن لزم
```

## التشغيل أثناء التطوير

```bash
npm start            # ثم امسح رمز QR بتطبيق Expo Go على أندرويد
# أو، مع هاتف موصول/محاكي:
npm run android
```

## فحص الكود

```bash
npm run typecheck    # tsc --noEmit
npm run lint         # expo lint
npm run check        # الاثنان معًا
npm run doctor       # expo-doctor: فحص إعدادات المشروع
```

---

## بناء ملف APK

### الطريقة 1 — EAS Build (سحابي، لا يحتاج Android Studio)

> الحساب هنا خاص بالمطوّر الذي يبني الملف فقط. **التطبيق نفسه لا يطلب حسابًا من المستخدمين.**

```bash
npm install -g eas-cli
eas login
npm run build:apk            # = eas build --platform android --profile preview
```

عند انتهاء البناء يعطيك EAS رابط تنزيل ملف `.apk` جاهز للتثبيت على أي هاتف أندرويد.
(الملف `eas.json` يحتوي على ثلاثة ملفات بناء: `preview` و`release-apk` لإنتاج APK، و`production` لإنتاج AAB لمتجر Google Play.)

### الطريقة 3 — GitHub Actions (تلقائي بعد رفع الكود)

بعد رفع المشروع إلى GitHub: افتح تبويب **Actions ▸ Build APK ▸ Run workflow**. عند انتهاء البناء نزّل الملف `qissa-screenwriter-apk` من قسم **Artifacts** (بداخله `app-release.apk`). لا يحتاج أي حساب خارجي ولا Secrets. (الملف: `.github/workflows/build-apk.yml`، ويشغّل أيضًا `typecheck` و`lint` قبل البناء.)

### الطريقة 2 — محلي عبر Android Studio / Gradle (APK Release)

المتطلبات: JDK 17 وAndroid SDK (يأتي مع Android Studio) ومتغير `ANDROID_HOME`.

```bash
npm run build:apk:local
# يعادل:
#   npx expo prebuild --platform android --clean
#   cd android && ./gradlew assembleRelease
```

الناتج:

```
android/app/build/outputs/apk/release/app-release.apk
```

ملاحظات:

- قالب Expo يوقّع نسخة Release بمفتاح debug افتراضيًا، وهذا مناسب للتثبيت اليدوي والتجربة. **للنشر على Google Play** أنشئ مفتاح توقيع خاصًا بك (أو استخدم `eas build --profile production` ودع EAS يديره).
- يمكنك أيضًا فتح مجلد `android/` (بعد `expo prebuild`) في Android Studio واختيار **Build ▸ Build Bundle(s) / APK(s) ▸ Build APK(s)**.
- المجلد `android/` مُولَّد تلقائيًا ومستثنى في `.gitignore`.

لتثبيت الـ APK على الهاتف: انقله إلى الهاتف وافتحه (قد يطلب السماح بالتثبيت من مصدر غير معروف)، أو استخدم `adb install app-release.apk`.

---

## هيكل المشروع

```
app/
  _layout.tsx          التخطيط العام، شاشة البداية، إنشاء البيانات التجريبية
  index.tsx            الشاشة الرئيسية (قائمة المشاريع)
  new.tsx              مشروع جديد (اختيار القالب)
  settings.tsx         الإعدادات
  editor/[id].tsx      محرر السيناريو + الحفظ التلقائي
components/
  ActionSheet.tsx      قائمة سفلية
  BlockRow.tsx         عنصر واحد في السيناريو (مشهد/حركة/حوار/انتقال/حلقة)
  InsertToolbar.tsx    شريط الإدراج السفلي
  ProjectCard.tsx      بطاقة مشروع
  ScreenHeader.tsx     الترويسة
  TextPromptModal.tsx  نافذة إدخال نص (إعادة التسمية)
lib/
  types.ts  storage.ts  seed.ts  templates.ts  stats.ts
  export.ts format.ts  theme.ts  id.ts  useKeyboardInset.ts
assets/
  icon.png  adaptive-icon.png  splash-icon.png
app.json  eas.json  package.json  tsconfig.json  eslint.config.js  babel.config.js
```

## أين تُحفظ البيانات؟

في AsyncStorage داخل مساحة التطبيق الخاصة على الهاتف، بمفتاح مستقل لكل مشروع (`qissa:project:<id>`). حذف التطبيق أو مسح بياناته يحذف المشاريع، لذلك استخدم **الإعدادات ▸ مشاركة نسخة احتياطية** من وقت لآخر واحفظ الملف في Drive أو أي مكان تريده.

## الأذونات

لا يطلب التطبيق أي إذن من المستخدم (لا تخزين، لا ميكروفون، لا موقع). المشاركة تتم عبر ملف مؤقت في مجلد الكاش وقائمة المشاركة في النظام.
