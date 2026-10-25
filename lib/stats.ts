import type { Block, Project } from './types';

export function countWords(text: string): number {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}

export interface ProjectStats {
  words: number;
  scenes: number;
  episodes: number;
}

export function projectStats(project: Project): ProjectStats {
  let words = 0;
  let scenes = 0;
  let episodes = 0;
  for (const b of project.blocks) {
    words += countWords(b.text);
    if (b.kind === 'dialogue' && b.character) {
      words += countWords(b.character);
    }
    if (b.kind === 'scene') scenes += 1;
    if (b.kind === 'episode') episodes += 1;
  }
  return { words, scenes, episodes };
}

/**
 * Scene numbers by block id. Numbering restarts after each episode block
 * (so series episodes each start from scene 1).
 */
export function sceneNumbers(blocks: Block[]): Map<string, number> {
  const map = new Map<string, number>();
  let n = 0;
  for (const b of blocks) {
    if (b.kind === 'episode') n = 0;
    if (b.kind === 'scene') {
      n += 1;
      map.set(b.id, n);
    }
  }
  return map;
}

/** Character names used in dialogue, most frequent first. */
export function characterNames(blocks: Block[]): string[] {
  const counts = new Map<string, number>();
  for (const b of blocks) {
    if (b.kind !== 'dialogue') continue;
    const name = (b.character ?? '').trim();
    if (!name) continue;
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([name]) => name);
}
