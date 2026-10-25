import { newId } from './id';
import type { Block, Project, ProjectType } from './types';

export interface TemplateInfo {
  type: ProjectType;
  title: string;
  description: string;
  icon: 'film-outline' | 'tv-outline';
}

export const TEMPLATES: TemplateInfo[] = [
  {
    type: 'film',
    title: 'سيناريو فيلم',
    description: 'مشاهد متتابعة، وصف حركة، حوار، وانتقالات — لفيلم قصير أو طويل.',
    icon: 'film-outline',
  },
  {
    type: 'series',
    title: 'سيناريو مسلسل',
    description: 'حلقات يبدأ ترقيم المشاهد في كل منها من جديد، مع كل أدوات الفيلم.',
    icon: 'tv-outline',
  },
];

export function defaultTitle(type: ProjectType): string {
  return type === 'series' ? 'مسلسل بلا عنوان' : 'فيلم بلا عنوان';
}

export function createProjectFromTemplate(type: ProjectType, title: string): Project {
  const now = Date.now();
  const blocks: Block[] =
    type === 'series'
      ? [
          { id: newId(), kind: 'episode', text: 'الحلقة ١' },
          { id: newId(), kind: 'scene', text: '' },
          { id: newId(), kind: 'action', text: '' },
        ]
      : [
          { id: newId(), kind: 'scene', text: '' },
          { id: newId(), kind: 'action', text: '' },
        ];
  return {
    id: newId(),
    title: title.trim() || defaultTitle(type),
    type,
    blocks,
    createdAt: now,
    updatedAt: now,
  };
}
