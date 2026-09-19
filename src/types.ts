export type SchoolCode = 'A' | 'C' | 'D' | 'E' | 'V' | 'I' | 'N' | 'T' | string;

export type PreparationStatus = 'prepared' | 'always_available' | 'unprepared';

export interface SpellTime {
  number: number;
  unit: string;
  condition?: string;
}

export interface SpellDistance {
  type: string;
  amount?: number;
}

export interface SpellRange {
  type: string;
  distance?: SpellDistance;
}

export interface SpellComponents {
  v?: boolean;
  s?: boolean;
  m?: string | {
    text: string;
    cost?: number;
    consume?: boolean;
  };
}

export interface SpellDuration {
  type: string;
  duration?: {
    type: string;
    amount: number;
  };
  concentration?: boolean;
  ends?: string[];
}

export interface HigherLevelEntry {
  type: string;
  name: string;
  entries: string[];
}

export interface ClassItem {
  name: string;
  source: string;
}

export interface SubclassItem {
  class: {
    name: string;
    source?: string;
  };
  subclass: {
    name: string;
    shortName?: string;
    source?: string;
  };
}

export interface SpellClasses {
  fromClassList?: ClassItem[];
  fromSubclass?: SubclassItem[];
}

export interface Spell {
  id: string; // generated unique id or name-source
  name: string;
  source?: string;
  page?: number;
  level: number; // 0 for cantrip, 1-9 for leveled spells
  school: SchoolCode;
  time: SpellTime[];
  range: SpellRange;
  components: SpellComponents;
  duration: SpellDuration[];
  meta?: {
    ritual?: boolean;
  };
  entries: (string | { type: string; name?: string; entries?: (string | object)[] })[];
  entriesHigherLevel?: HigherLevelEntry[];
  classes?: SpellClasses;
  damageInflict?: string[];
  conditionInflict?: string[];
  savingThrow?: string[];
  abilityCheck?: string[];
  miscTags?: string[];
  areaTags?: string[];
  
  // Custom tracking state
  preparationStatus?: PreparationStatus; // default based on level/flags
  isFavorite?: boolean;
  customNotes?: string;
  isCustom?: boolean;
}

export interface SlotLevelInfo {
  max: number;
  current: number;
}

export interface SpellSlotState {
  1: SlotLevelInfo;
  2: SlotLevelInfo;
  3: SlotLevelInfo;
  4: SlotLevelInfo;
  5: SlotLevelInfo;
  6: SlotLevelInfo;
  7: SlotLevelInfo;
  8: SlotLevelInfo;
  9: SlotLevelInfo;
  pact?: {
    max: number;
    current: number;
    level: number; // e.g. 5th level slots
  };
}

export type CasterClass = 
  | 'Wizard'
  | 'Sorcerer'
  | 'Cleric'
  | 'Druid'
  | 'Bard'
  | 'Paladin'
  | 'Ranger'
  | 'Warlock'
  | 'Artificer'
  | 'Eldritch Knight'
  | 'Arcane Trickster'
  | 'Custom';

export type AbilityScore = 'INT' | 'WIS' | 'CHA';

export interface CharacterProfile {
  name: string;
  characterClass: CasterClass;
  level: number;
  spellcastingAbility: AbilityScore;
  abilityScoreValue: number; // e.g. 18 (+4)
  proficiencyBonus: number; // e.g. +3
  customPreparedMax?: number;
  dcBonus?: number; // e.g. +1, +2, +3 from Arcane Grimoire, Robe of the Archmagi, etc.
  attackBonus?: number; // e.g. +1, +2, +3 from Wand of the War Mage, etc.
  notes?: string;
}

export interface ActiveConcentration {
  spellId: string;
  spellName: string;
  level: number;
  school: SchoolCode;
  castAtLevel?: number;
  startedAt: number; // timestamp
  durationText?: string;
}

export type ResetType = 'long' | 'short' | 'special' | 'none';

export type FeatureDisplayType = 'pips' | 'counter';

export interface CharacterFeature {
  id: string;
  name: string;
  source?: string; // e.g. 'Artificer 7', 'Feat: Metamagic Adept', 'Paladin 1'
  description?: string;
  current: number;
  max: number;
  resetType: ResetType; // 'long', 'short', etc.
  displayType: FeatureDisplayType; // 'pips' (orbs/dots) or 'counter' (pool number with +/- or direct spend)
  unitLabel?: string; // e.g. "Points", "HP", "Uses", "Dice"
  category?: 'class' | 'feat' | 'species' | 'item' | 'other';
  colorTheme?: 'gold' | 'emerald' | 'crimson' | 'violet' | 'amber' | 'blue';
}

export type PreparationFilterItem = PreparationStatus | 'favorites' | 'rituals' | 'concentration';

export interface FilterOptions {
  searchQuery: string;
  levels: number[];
  schools: string[];
  preparations: PreparationFilterItem[];
  castingTimes: string[];
  characterClasses: string[];
  sortBy: 'level-asc' | 'level-desc' | 'name-asc' | 'name-desc' | 'school';
}

