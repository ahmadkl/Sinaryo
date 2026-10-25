import { newId } from './id';
import type { Block, Project } from './types';

function b(kind: Block['kind'], text: string, character?: string): Block {
  return character === undefined
    ? { id: newId(), kind, text }
    : { id: newId(), kind, text, character };
}

export function buildSeedProjects(): Project[] {
  const now = Date.now();

  const film: Project = {
    id: newId(),
    title: 'الطريق إلى البحر',
    type: 'film',
    createdAt: now - 1000,
    updatedAt: now - 1000,
    blocks: [
      b('scene', 'خارجي — طريق ترابي — فجر'),
      b(
        'action',
        'غبار خفيف يعلو خلف دراجة هوائية قديمة. يزن، فتى في الثانية عشرة، يدفعها صعودًا وعلى كتفه حقيبة قماشية مهترئة.',
      ),
      b('dialogue', '(يهمس لنفسه) قالوا إنه خلف التلة… سأراه قبل أن تستيقظ القرية.', 'يزن'),
      b(
        'action',
        'يتوقف عند قمة التلة. يمتد أمامه بحر فضي ساكن، وتخترق الشمس الغيوم بخيط ذهبي.',
      ),
      b('transition', 'قطع إلى:'),
      b('scene', 'داخلي — بيت الجدة — صباح'),
      b('action', 'الجدة سعدى تسكب القهوة في فنجانين، ثم تلاحظ أن سرير يزن فارغ.'),
      b('dialogue', '(تبتسم) ذهب ليلاقي البحر… كما فعل أبوه من قبل.', 'الجدة'),
      b('transition', 'قطع إلى:'),
      b('scene', 'خارجي — الشاطئ — صباح'),
      b(
        'action',
        'يزن يجلس على صخرة ويفتح حقيبته: بوصلة نحاسية قديمة ورسالة مطوية بعناية.',
      ),
      b('dialogue', 'يا بحر… هل تعرف أين ذهب؟', 'يزن'),
    ],
  };

  const series: Project = {
    id: newId(),
    title: 'حارة القمر',
    type: 'series',
    createdAt: now - 2000,
    updatedAt: now - 2000,
    blocks: [
      b('episode', 'الحلقة ١ — بداية الحكاية'),
      b('scene', 'داخلي — مقهى الحارة — مساء'),
      b(
        'action',
        'أبو سليم يمسح الطاولات ببطء بينما يعلو صوت المذياع بأغنية قديمة. يدخل غريب يحمل حقيبة جلدية ويقف عند الباب.',
      ),
      b('dialogue', 'أهلًا بك… الحارة صغيرة، وكل من يدخلها يصبح منها.', 'أبو سليم'),
      b(
        'dialogue',
        '(بصوت هادئ) أبحث عن بيت قديم يُقال إنه ما زال يحمل اسم عائلتي.',
        'الغريب',
      ),
      b('action', 'يتبادل رجلان على الطاولة المجاورة نظرة قلقة، ثم يخفضان رأسيهما.'),
      b('transition', 'قطع إلى:'),
      b('scene', 'خارجي — زقاق الحارة — ليل'),
      b(
        'action',
        'ضوء فانوس وحيد يتأرجح فوق باب خشبي متآكل. يقف الغريب أمامه ويمد يده إلى المقبض.',
      ),
      b('dialogue', 'هل ما زال أحد يتذكرنا؟', 'الغريب'),
    ],
  };

  return [film, series];
}
