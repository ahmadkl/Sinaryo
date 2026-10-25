import AsyncStorage from '@react-native-async-storage/async-storage';

import { buildSeedProjects } from './seed';
import { BLOCK_KINDS, type Block, type BlockKind, type Project, type ProjectType } from './types';

const PROJECT_PREFIX = 'qissa:project:';
const SEEDED_KEY = 'qissa:seeded:v1';

const keyFor = (id: string) => PROJECT_PREFIX + id;

function normalizeBlock(raw: unknown): Block | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== 'string' || !r.id) return null;
  if (typeof r.kind !== 'string' || !BLOCK_KINDS.includes(r.kind as BlockKind)) return null;
  const block: Block = {
    id: r.id,
    kind: r.kind as BlockKind,
    text: typeof r.text === 'string' ? r.text : '',
  };
  if (typeof r.character === 'string') block.character = r.character;
  return block;
}

/** Validate and repair data read from disk. Returns null if unusable. */
export function normalizeProject(raw: unknown): Project | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== 'string' || !r.id) return null;
  const type: ProjectType = r.type === 'series' ? 'series' : 'film';
  const blocks: Block[] = [];
  if (Array.isArray(r.blocks)) {
    for (const item of r.blocks) {
      const block = normalizeBlock(item);
      if (block) blocks.push(block);
    }
  }
  const now = Date.now();
  return {
    id: r.id,
    title: typeof r.title === 'string' && r.title.trim() ? r.title : 'بلا عنوان',
    type,
    blocks,
    createdAt: typeof r.createdAt === 'number' ? r.createdAt : now,
    updatedAt: typeof r.updatedAt === 'number' ? r.updatedAt : now,
  };
}

function parseProject(raw: string | null): Project | null {
  if (!raw) return null;
  try {
    return normalizeProject(JSON.parse(raw));
  } catch {
    return null;
  }
}

export async function listProjects(): Promise<Project[]> {
  try {
    const keys = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith(PROJECT_PREFIX));
    if (keys.length === 0) return [];
    const pairs = await AsyncStorage.multiGet(keys);
    const projects: Project[] = [];
    for (const [, value] of pairs) {
      const p = parseProject(value);
      if (p) projects.push(p);
    }
    return projects.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

export async function loadProject(id: string): Promise<Project | null> {
  try {
    return parseProject(await AsyncStorage.getItem(keyFor(id)));
  } catch {
    return null;
  }
}

let writeChain: Promise<void> = Promise.resolve();

/** Saves a project. Writes are serialized so the last call always wins. */
export function saveProject(project: Project): Promise<boolean> {
  const next = writeChain.then(async () => {
    try {
      await AsyncStorage.setItem(keyFor(project.id), JSON.stringify(project));
      return true;
    } catch {
      return false;
    }
  });
  writeChain = next.then(() => undefined);
  return next;
}

export async function deleteProject(id: string): Promise<void> {
  await writeChain;
  await AsyncStorage.removeItem(keyFor(id));
}

let seedPromise: Promise<void> | null = null;

/** On the very first launch, create one sample film and one sample series. */
export function ensureSeeded(): Promise<void> {
  if (!seedPromise) {
    seedPromise = (async () => {
      try {
        const already = await AsyncStorage.getItem(SEEDED_KEY);
        if (already) return;
        const existing = await listProjects();
        if (existing.length === 0) {
          for (const p of buildSeedProjects()) {
            await saveProject(p);
          }
        }
        await AsyncStorage.setItem(SEEDED_KEY, '1');
      } catch {
        seedPromise = null;
      }
    })();
  }
  return seedPromise;
}
