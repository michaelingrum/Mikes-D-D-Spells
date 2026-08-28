import { CasterClass, SpellSlotState } from '../types';

export const FULL_CASTER_SLOTS: Record<number, number[]> = {
  1:  [2, 0, 0, 0, 0, 0, 0, 0, 0],
  2:  [3, 0, 0, 0, 0, 0, 0, 0, 0],
  3:  [4, 2, 0, 0, 0, 0, 0, 0, 0],
  4:  [4, 3, 0, 0, 0, 0, 0, 0, 0],
  5:  [4, 3, 2, 0, 0, 0, 0, 0, 0],
  6:  [4, 3, 3, 0, 0, 0, 0, 0, 0],
  7:  [4, 3, 3, 1, 0, 0, 0, 0, 0],
  8:  [4, 3, 3, 2, 0, 0, 0, 0, 0],
  9:  [4, 3, 3, 3, 1, 0, 0, 0, 0],
  10: [4, 3, 3, 3, 2, 0, 0, 0, 0],
  11: [4, 3, 3, 3, 2, 1, 0, 0, 0],
  12: [4, 3, 3, 3, 2, 1, 0, 0, 0],
  13: [4, 3, 3, 3, 2, 1, 1, 0, 0],
  14: [4, 3, 3, 3, 2, 1, 1, 0, 0],
  15: [4, 3, 3, 3, 2, 1, 1, 1, 0],
  16: [4, 3, 3, 3, 2, 1, 1, 1, 0],
  17: [4, 3, 3, 3, 2, 1, 1, 1, 1],
  18: [4, 3, 3, 3, 3, 1, 1, 1, 1],
  19: [4, 3, 3, 3, 3, 2, 1, 1, 1],
  20: [4, 3, 3, 3, 3, 2, 2, 1, 1],
};

export const HALF_CASTER_SLOTS: Record<number, number[]> = {
  1:  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  2:  [2, 0, 0, 0, 0, 0, 0, 0, 0],
  3:  [3, 0, 0, 0, 0, 0, 0, 0, 0],
  4:  [3, 0, 0, 0, 0, 0, 0, 0, 0],
  5:  [4, 2, 0, 0, 0, 0, 0, 0, 0],
  6:  [4, 2, 0, 0, 0, 0, 0, 0, 0],
  7:  [4, 3, 0, 0, 0, 0, 0, 0, 0],
  8:  [4, 3, 0, 0, 0, 0, 0, 0, 0],
  9:  [4, 3, 2, 0, 0, 0, 0, 0, 0],
  10: [4, 3, 2, 0, 0, 0, 0, 0, 0],
  11: [4, 3, 3, 0, 0, 0, 0, 0, 0],
  12: [4, 3, 3, 0, 0, 0, 0, 0, 0],
  13: [4, 3, 3, 1, 0, 0, 0, 0, 0],
  14: [4, 3, 3, 1, 0, 0, 0, 0, 0],
  15: [4, 3, 3, 2, 0, 0, 0, 0, 0],
  16: [4, 3, 3, 2, 0, 0, 0, 0, 0],
  17: [4, 3, 3, 3, 1, 0, 0, 0, 0],
  18: [4, 3, 3, 3, 1, 0, 0, 0, 0],
  19: [4, 3, 3, 3, 2, 0, 0, 0, 0],
  20: [4, 3, 3, 3, 2, 0, 0, 0, 0],
};

export const THIRD_CASTER_SLOTS: Record<number, number[]> = {
  1:  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  2:  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  3:  [2, 0, 0, 0, 0, 0, 0, 0, 0],
  4:  [3, 0, 0, 0, 0, 0, 0, 0, 0],
  5:  [3, 0, 0, 0, 0, 0, 0, 0, 0],
  6:  [3, 0, 0, 0, 0, 0, 0, 0, 0],
  7:  [4, 2, 0, 0, 0, 0, 0, 0, 0],
  8:  [4, 2, 0, 0, 0, 0, 0, 0, 0],
  9:  [4, 2, 0, 0, 0, 0, 0, 0, 0],
  10: [4, 3, 0, 0, 0, 0, 0, 0, 0],
  11: [4, 3, 0, 0, 0, 0, 0, 0, 0],
  12: [4, 3, 0, 0, 0, 0, 0, 0, 0],
  13: [4, 3, 2, 0, 0, 0, 0, 0, 0],
  14: [4, 3, 2, 0, 0, 0, 0, 0, 0],
  15: [4, 3, 2, 0, 0, 0, 0, 0, 0],
  16: [4, 3, 3, 0, 0, 0, 0, 0, 0],
  17: [4, 3, 3, 0, 0, 0, 0, 0, 0],
  18: [4, 3, 3, 0, 0, 0, 0, 0, 0],
  19: [4, 3, 3, 1, 0, 0, 0, 0, 0],
  20: [4, 3, 3, 1, 0, 0, 0, 0, 0],
};

export const WARLOCK_SLOTS: Record<number, { slots: number; level: number }> = {
  1: { slots: 1, level: 1 },
  2: { slots: 2, level: 1 },
  3: { slots: 2, level: 2 },
  4: { slots: 2, level: 2 },
  5: { slots: 2, level: 3 },
  6: { slots: 2, level: 3 },
  7: { slots: 2, level: 4 },
  8: { slots: 2, level: 4 },
  9: { slots: 2, level: 5 },
  10: { slots: 2, level: 5 },
  11: { slots: 3, level: 5 },
  12: { slots: 3, level: 5 },
  13: { slots: 3, level: 5 },
  14: { slots: 3, level: 5 },
  15: { slots: 3, level: 5 },
  16: { slots: 3, level: 5 },
  17: { slots: 4, level: 5 },
  18: { slots: 4, level: 5 },
  19: { slots: 4, level: 5 },
  20: { slots: 4, level: 5 },
};

export function getProficiencyBonus(level: number): number {
  if (level >= 17) return 6;
  if (level >= 13) return 5;
  if (level >= 9) return 4;
  if (level >= 5) return 3;
  return 2;
}

export function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function getDefaultSpellSlotsForClass(casterClass: CasterClass, level: number): SpellSlotState {
  const safeLevel = Math.max(1, Math.min(20, level));
  let counts = [4, 3, 3, 3, 2, 1, 1, 1, 1]; // default lvl 11 full caster

  if (['Wizard', 'Sorcerer', 'Cleric', 'Druid', 'Bard'].includes(casterClass)) {
    counts = FULL_CASTER_SLOTS[safeLevel] || FULL_CASTER_SLOTS[1];
  } else if (['Paladin', 'Ranger', 'Artificer'].includes(casterClass)) {
    counts = HALF_CASTER_SLOTS[safeLevel] || HALF_CASTER_SLOTS[1];
  } else if (['Eldritch Knight', 'Arcane Trickster'].includes(casterClass)) {
    counts = THIRD_CASTER_SLOTS[safeLevel] || THIRD_CASTER_SLOTS[1];
  } else if (casterClass === 'Warlock') {
    const pact = WARLOCK_SLOTS[safeLevel] || { slots: 2, level: 5 };
    return {
      1: { max: 0, current: 0 },
      2: { max: 0, current: 0 },
      3: { max: 0, current: 0 },
      4: { max: 0, current: 0 },
      5: { max: 0, current: 0 },
      6: { max: 0, current: 0 },
      7: { max: 0, current: 0 },
      8: { max: 0, current: 0 },
      9: { max: 0, current: 0 },
      pact: {
        max: pact.slots,
        current: pact.slots,
        level: pact.level
      }
    };
  }

  return {
    1: { max: counts[0] || 0, current: counts[0] || 0 },
    2: { max: counts[1] || 0, current: counts[1] || 0 },
    3: { max: counts[2] || 0, current: counts[2] || 0 },
    4: { max: counts[3] || 0, current: counts[3] || 0 },
    5: { max: counts[4] || 0, current: counts[4] || 0 },
    6: { max: counts[5] || 0, current: counts[5] || 0 },
    7: { max: counts[6] || 0, current: counts[6] || 0 },
    8: { max: counts[7] || 0, current: counts[7] || 0 },
    9: { max: counts[8] || 0, current: counts[8] || 0 },
  };
}

export function calculateMaxPrepared(casterClass: CasterClass, level: number, abilityScore: number): number | null {
  const mod = getAbilityModifier(abilityScore);
  if (['Wizard', 'Cleric', 'Druid'].includes(casterClass)) {
    return Math.max(1, level + mod);
  }
  if (['Paladin', 'Artificer'].includes(casterClass)) {
    return Math.max(1, Math.floor(level / 2) + mod);
  }
  // Sorcerer, Bard, Ranger, Warlock typically use "spells known", though 2024 rules use prepared.
  return null;
}
