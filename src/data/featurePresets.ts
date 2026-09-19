import { CharacterFeature } from '../types';

export interface FeaturePresetTemplate {
  name: string;
  source: string;
  category: 'class' | 'feat' | 'species' | 'item' | 'other';
  description: string;
  resetType: 'long' | 'short';
  displayType: 'pips' | 'counter';
  unitLabel: string;
  defaultMax: number;
  colorTheme: 'gold' | 'emerald' | 'crimson' | 'violet' | 'amber' | 'blue';
  calculateMax?: (profile: { level: number; abilityScoreValue: number; characterClass: string }) => number;
}

export const FEATURE_PRESETS: FeaturePresetTemplate[] = [
  {
    name: 'Flash of Genius',
    source: 'Artificer (Level 7)',
    category: 'class',
    description: 'When you or another creature you can see within 30 feet of you makes an ability check or a saving throw, you can use your reaction to add your Intelligence modifier to the roll.',
    resetType: 'long',
    displayType: 'pips',
    unitLabel: 'Uses',
    defaultMax: 5,
    colorTheme: 'gold',
    calculateMax: (p) => {
      const mod = Math.floor((p.abilityScoreValue - 10) / 2);
      return Math.max(1, mod);
    },
  },
  {
    name: 'Sorcery Points (Metamagic Adept)',
    source: 'Feat: Metamagic Adept',
    category: 'feat',
    description: 'You gain 2 sorcery points to spend on Metamagic options you learned from this feat. You regain all spent sorcery points when you finish a long rest.',
    resetType: 'long',
    displayType: 'pips',
    unitLabel: 'Points',
    defaultMax: 2,
    colorTheme: 'violet',
  },
  {
    name: 'Lay on Hands',
    source: 'Paladin (Level 1+)',
    category: 'class',
    description: 'You have a pool of healing power that replenishes when you take a long rest. With that pool, you can restore a total number of hit points equal to your paladin level × 5. Alternatively, spend 5 hit points to cure a disease or neutralize a poison.',
    resetType: 'long',
    displayType: 'counter',
    unitLabel: 'HP',
    defaultMax: 25,
    colorTheme: 'emerald',
    calculateMax: (p) => Math.max(5, p.level * 5),
  },
  {
    name: 'Channel Divinity',
    source: 'Paladin / Cleric',
    category: 'class',
    description: 'Channel divine energy fueling various magical effects granted by your Oath or Domain (e.g. Sacred Weapon, Harness Divine Power, Turn Undead).',
    resetType: 'short',
    displayType: 'pips',
    unitLabel: 'Uses',
    defaultMax: 1,
    colorTheme: 'amber',
    calculateMax: (p) => {
      if (p.characterClass === 'Cleric') {
        if (p.level >= 18) return 3;
        if (p.level >= 6) return 2;
        return 1;
      }
      // Paladin
      return p.level >= 3 ? 1 : 0;
    },
  },
  {
    name: 'Divine Sense',
    source: 'Paladin (Level 1)',
    category: 'class',
    description: 'The presence of strong evil registers on your senses like a noxious odor, and powerful good rings like heavenly music in your ears. Detect celestials, fiends, and undead within 60 ft.',
    resetType: 'long',
    displayType: 'pips',
    unitLabel: 'Uses',
    defaultMax: 4,
    colorTheme: 'gold',
    calculateMax: (p) => {
      const mod = Math.floor((p.abilityScoreValue - 10) / 2);
      return Math.max(1, 1 + mod);
    },
  },
  {
    name: 'Cleansing Touch',
    source: 'Paladin (Level 14)',
    category: 'class',
    description: 'You can use your action to end one spell on yourself or on one willing creature that you touch.',
    resetType: 'long',
    displayType: 'pips',
    unitLabel: 'Uses',
    defaultMax: 3,
    colorTheme: 'emerald',
    calculateMax: (p) => {
      const mod = Math.floor((p.abilityScoreValue - 10) / 2);
      return Math.max(1, mod);
    },
  },
  {
    name: 'Action Surge',
    source: 'Fighter (Level 2+)',
    category: 'class',
    description: 'On your turn, you can take one additional action on top of your regular action and possible bonus action.',
    resetType: 'short',
    displayType: 'pips',
    unitLabel: 'Uses',
    defaultMax: 1,
    colorTheme: 'crimson',
    calculateMax: (p) => (p.level >= 17 ? 2 : 1),
  },
  {
    name: 'Second Wind',
    source: 'Fighter (Level 1)',
    category: 'class',
    description: 'You have a limited well of stamina that you can draw on to protect yourself from harm. On your turn, you can use a bonus action to regain hit points equal to 1d10 + fighter level.',
    resetType: 'short',
    displayType: 'pips',
    unitLabel: 'Uses',
    defaultMax: 1,
    colorTheme: 'amber',
  },
  {
    name: 'Bardic Inspiration',
    source: 'Bard (Level 1+)',
    category: 'class',
    description: 'You can inspire others through stirring words or music. A creature within 60 ft adds your Inspiration Die to one ability check, attack roll, or saving throw.',
    resetType: 'short',
    displayType: 'pips',
    unitLabel: 'Dice',
    defaultMax: 4,
    colorTheme: 'violet',
    calculateMax: (p) => {
      const mod = Math.floor((p.abilityScoreValue - 10) / 2);
      return Math.max(1, mod);
    },
  },
  {
    name: 'Wild Shape',
    source: 'Druid (Level 2+)',
    category: 'class',
    description: 'You can use your action to magically assume the shape of a beast that you have seen before.',
    resetType: 'short',
    displayType: 'pips',
    unitLabel: 'Uses',
    defaultMax: 2,
    colorTheme: 'emerald',
    calculateMax: (p) => (p.level >= 20 ? 99 : 2),
  },
  {
    name: 'Lucky',
    source: 'Feat: Lucky',
    category: 'feat',
    description: 'You have 3 luck points. Whenever you make an attack roll, ability check, or saving throw, you can spend one luck point to roll an additional d20.',
    resetType: 'long',
    displayType: 'pips',
    unitLabel: 'Points',
    defaultMax: 3,
    colorTheme: 'gold',
  },
  {
    name: 'Fey Step',
    source: 'Species: Eladrin',
    category: 'species',
    description: 'As a bonus action, you can magically teleport up to 30 feet to an unoccupied space you can see.',
    resetType: 'short',
    displayType: 'pips',
    unitLabel: 'Uses',
    defaultMax: 1,
    colorTheme: 'blue',
  },
  {
    name: 'Healing Light',
    source: 'Celestial Warlock',
    category: 'class',
    description: 'You gain the ability to channel celestial energy to heal wounds. You have a pool of d6s that you spend to heal creatures within 60 feet as a bonus action.',
    resetType: 'long',
    displayType: 'counter',
    unitLabel: 'd6 dice',
    defaultMax: 6,
    colorTheme: 'gold',
    calculateMax: (p) => 1 + p.level,
  },
];
