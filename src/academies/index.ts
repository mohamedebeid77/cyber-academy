import type { AcademyDefinition } from './types';
import { androidAcademy } from './android';
import { networkAcademy } from './network';
import { iosAcademy } from './ios';

/** All academies of the Cyber Academy platform, in display order. */
export const ACADEMIES: AcademyDefinition[] = [androidAcademy, networkAcademy, iosAcademy];

export function getAcademy(id: string): AcademyDefinition | undefined {
  return ACADEMIES.find((a) => a.id === id);
}

export { androidAcademy, networkAcademy, iosAcademy };
export type { AcademyDefinition };
