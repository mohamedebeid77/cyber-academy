import type { Module, Lesson } from '../types';
import { m01 } from './lessons/m01';
import { m02 } from './lessons/m02';
import { m03 } from './lessons/m03';
import { m04 } from './lessons/m04';
import { m05 } from './lessons/m05';
import { m06 } from './lessons/m06';
import { m07 } from './lessons/m07';
import { m08 } from './lessons/m08';
import { m09 } from './lessons/m09';
import { m10 } from './lessons/m10';
import { m11 } from './lessons/m11';
import { m12 } from './lessons/m12';
import { m13 } from './lessons/m13';
import { m14 } from './lessons/m14';

/** Built-in curriculum, in learning order. */
export const BUILT_IN_MODULES: Module[] = [
  m01, m02, m03, m04, m05, m06, m07, m08, m09, m10, m11, m12, m13, m14
];

/** Merge custom modules (appended at the end) and custom lessons (attached by moduleId). */
export function mergeModules(builtIn: Module[], customModules: Module[], customLessons: Lesson[]): Module[] {
  const byId = new Map<string, Module>();
  for (const m of builtIn) byId.set(m.id, { ...m, lessons: [...m.lessons] });
  for (const m of customModules) {
    const existing = byId.get(m.id);
    if (existing) {
      byId.set(m.id, { ...existing, lessons: [...existing.lessons, ...m.lessons] });
    } else {
      byId.set(m.id, { ...m, level: Math.max(m.level, 10), lessons: [...m.lessons] });
    }
  }
  for (const l of customLessons) {
    const host = byId.get(l.moduleId);
    if (host) {
      if (!host.lessons.some((x) => x.id === l.id)) host.lessons.push(l);
    } else {
      byId.set(l.moduleId, {
        id: l.moduleId,
        title: `Custom: ${l.moduleId}`,
        level: 10,
        description: 'Custom module created in the Content Studio.',
        outcomes: [],
        lessons: [l]
      });
    }
  }
  return [...byId.values()].sort((a, b) => a.level - b.level);
}
