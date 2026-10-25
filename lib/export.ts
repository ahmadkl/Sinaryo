import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import { ar, typeLabel } from './format';
import { sceneNumbers } from './stats';
import type { ExportEnvelope, Project } from './types';

export type ExportFormat = 'txt' | 'json';

function indent(text: string, spaces = 4): string {
  const pad = ' '.repeat(spaces);
  return text
    .split('\n')
    .map((line) => pad + line)
    .join('\n');
}

/** Plain-text rendering of a script (UTF-8, readable in any editor). */
export function projectToText(project: Project): string {
  const numbers = sceneNumbers(project.blocks);
  const out: string[] = [];
  out.push(project.title);
  out.push(`النوع: ${typeLabel(project.type)}`);
  out.push('='.repeat(32));
  out.push('');

  for (const b of project.blocks) {
    const text = b.text.trim();
    switch (b.kind) {
      case 'episode':
        out.push('');
        out.push(text || 'حلقة');
        out.push('-'.repeat(24));
        out.push('');
        break;
      case 'scene':
        out.push(`مشهد ${ar(numbers.get(b.id) ?? 0)}${text ? ' — ' + text : ''}`);
        out.push('');
        break;
      case 'action':
        if (text) {
          out.push(text);
          out.push('');
        }
        break;
      case 'dialogue': {
        const name = (b.character ?? '').trim();
        if (name || text) {
          out.push(`${name || '…'}:`);
          if (text) out.push(indent(text));
          out.push('');
        }
        break;
      }
      case 'transition':
        out.push(text || 'قطع إلى:');
        out.push('');
        break;
    }
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';
}

export function projectsToJson(projects: Project[]): string {
  const envelope: ExportEnvelope = {
    app: 'qissa',
    version: 1,
    exportedAt: new Date().toISOString(),
    projects,
  };
  return JSON.stringify(envelope, null, 2);
}

function safeFileName(title: string, fallback: string): string {
  const cleaned = title
    // eslint-disable-next-line no-control-regex
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 60);
  return cleaned || fallback;
}

async function shareTextFile(
  fileName: string,
  content: string,
  mimeType: string,
  uti: string,
  dialogTitle: string,
): Promise<void> {
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('المشاركة غير متاحة على هذا الجهاز.');
  }
  const dir = FileSystem.cacheDirectory;
  if (!dir) throw new Error('تعذّر الوصول إلى مجلد الملفات المؤقتة.');
  const uri = dir + fileName;
  await FileSystem.writeAsStringAsync(uri, content, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  await Sharing.shareAsync(uri, { mimeType, UTI: uti, dialogTitle });
}

/** Share one project as .txt or .json through the Android share sheet. */
export async function shareProject(project: Project, format: ExportFormat): Promise<void> {
  const base = safeFileName(project.title, 'qissa-script');
  if (format === 'txt') {
    // Leading BOM helps some Windows editors detect UTF-8 for Arabic text.
    await shareTextFile(
      `${base}.txt`,
      '﻿' + projectToText(project),
      'text/plain',
      'public.plain-text',
      'مشاركة السيناريو',
    );
  } else {
    await shareTextFile(
      `${base}.json`,
      projectsToJson([project]),
      'application/json',
      'public.json',
      'مشاركة السيناريو',
    );
  }
}

/** Share every project in one JSON backup file. */
export async function shareAllProjects(projects: Project[]): Promise<void> {
  const stamp = new Date().toISOString().slice(0, 10);
  await shareTextFile(
    `qissa-backup-${stamp}.json`,
    projectsToJson(projects),
    'application/json',
    'public.json',
    'نسخة احتياطية من المشاريع',
  );
}
