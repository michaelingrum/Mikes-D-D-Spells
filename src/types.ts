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
  notes?: string;
}

export interface FilterOptions {
  searchQuery: string;
  level: number | 'all' | 'cantrips' | 'leveled';
  school: string | 'all';
  preparation: PreparationStatus | 'all' | 'favorites' | 'rituals' | 'concentration';
  castingTime: string | 'all';
  characterClass: string | 'all';
  sortBy: 'level-asc' | 'level-desc' | 'name-asc' | 'name-desc' | 'school';
}
