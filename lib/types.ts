export type ProjectType = 'film' | 'series';

export type BlockKind = 'episode' | 'scene' | 'action' | 'dialogue' | 'transition';

export const BLOCK_KINDS: readonly BlockKind[] = [
  'episode',
  'scene',
  'action',
  'dialogue',
  'transition',
];

export interface Block {
  id: string;
  kind: BlockKind;
  /** Main text: scene heading, action line, dialogue, transition, or episode title. */
  text: string;
  /** Only used by `dialogue` blocks. */
  character?: string;
}

export interface Project {
  id: string;
  title: string;
  type: ProjectType;
  blocks: Block[];
  createdAt: number;
  updatedAt: number;
}

export interface ExportEnvelope {
  app: 'qissa';
  version: 1;
  exportedAt: string;
  projects: Project[];
}
