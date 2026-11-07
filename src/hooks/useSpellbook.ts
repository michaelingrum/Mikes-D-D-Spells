import { useEffect, useMemo, useState } from 'react';
import { DEFAULT_SPELLS_DATA } from '../data/defaultSpells';
import {
  AbilityScore,
  ActiveConcentration,
  CasterClass,
  CharacterFeature,
  CharacterProfile,
  CharacterRecord,
  DatabaseBackup,
  PreparationStatus,
  Spell,
  SpellSlotState,
} from '../types';
import { getDefaultSpellSlotsForClass, getProficiencyBonus } from '../utils/spellSlotPresets';
import { formatDuration } from '../utils/textParser';

const STORAGE_KEYS = {
  CHARACTERS: 'dnd_spellbook_characters_v4',
  ACTIVE_CHAR_ID: 'dnd_spellbook_active_char_id_v4',
  LEGACY_SPELLS: 'dnd_spellbook_spells_v3',
  LEGACY_SLOTS: 'dnd_spellbook_slots_v3',
  LEGACY_PROFILE: 'dnd_spellbook_profile_v3',
  LEGACY_CONCENTRATION: 'dnd_spellbook_concentration_v1',
  LEGACY_FEATURES: 'dnd_spellbook_features_v1',
};

const DEFAULT_FEATURES: CharacterFeature[] = [
  {
    id: 'feat-flash-of-genius',
    name: 'Flash of Genius',
    source: 'Artificer (Level 7)',
    description:
      'When you or another creature you can see within 30 feet of you makes an ability check or a saving throw, you can use your reaction to add your Intelligence modifier to the roll.',
    current: 5,
    max: 5,
    resetType: 'long',
    displayType: 'pips',
    unitLabel: 'Uses',
    category: 'class',
    colorTheme: 'gold',
  },
  {
    id: 'feat-metamagic-adept',
    name: 'Metamagic Adept (Sorcery Points)',
    source: 'Feat: Metamagic Adept',
    description:
      'You gain 2 sorcery points to spend on Metamagic options you learned from this feat. You regain all spent sorcery points when you finish a long rest.',
    current: 2,
    max: 2,
    resetType: 'long',
    displayType: 'pips',
    unitLabel: 'Points',
    category: 'feat',
    colorTheme: 'violet',
  },
];

const DEFAULT_PROFILE: CharacterProfile = {
  name: 'My Character',
  characterClass: 'Wizard',
  level: 1,
  spellcastingAbility: 'INT',
  abilityScoreValue: 16,
  proficiencyBonus: 2,
  dcBonus: 0,
  attackBonus: 0,
  enableDailyCantrips: true,
  enableFeaturesTracker: true,
};

function createInitialCharacter(): CharacterRecord {
  return {
    id: `char-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    profile: DEFAULT_PROFILE,
    spells: [],
    slots: getDefaultSpellSlotsForClass(DEFAULT_PROFILE.characterClass, DEFAULT_PROFILE.level),
    features: DEFAULT_FEATURES,
    activeConcentration: null,
    createdAt: Date.now(),
    lastPlayedAt: Date.now(),
  };
}

function loadInitialCharacters(): CharacterRecord[] {
  // 1. Try to load v4 multi-character storage
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CHARACTERS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse saved characters:', e);
  }

  // 2. Try migrating from legacy v3 storage
  try {
    let legacyProfile = DEFAULT_PROFILE;
    let legacySpells: Spell[] = [];
    let legacySlots = getDefaultSpellSlotsForClass(DEFAULT_PROFILE.characterClass, DEFAULT_PROFILE.level);
    let legacyFeatures = DEFAULT_FEATURES;
    let legacyConcentration: ActiveConcentration | null = null;
    let hadLegacyData = false;

    const savedProfile = localStorage.getItem(STORAGE_KEYS.LEGACY_PROFILE);
    if (savedProfile) {
      legacyProfile = { ...DEFAULT_PROFILE, ...JSON.parse(savedProfile) };
      hadLegacyData = true;
    }

    const savedSpells = localStorage.getItem(STORAGE_KEYS.LEGACY_SPELLS);
    if (savedSpells) {
      const parsed = JSON.parse(savedSpells);
      if (Array.isArray(parsed) && parsed.length > 0) {
        legacySpells = parsed;
        hadLegacyData = true;
      }
    }

    const savedSlots = localStorage.getItem(STORAGE_KEYS.LEGACY_SLOTS);
    if (savedSlots) {
      legacySlots = JSON.parse(savedSlots);
      hadLegacyData = true;
    }

    const savedFeatures = localStorage.getItem(STORAGE_KEYS.LEGACY_FEATURES);
    if (savedFeatures) {
      const parsed = JSON.parse(savedFeatures);
      if (Array.isArray(parsed)) {
        legacyFeatures = parsed;
        hadLegacyData = true;
      }
    }

    const savedConc = localStorage.getItem(STORAGE_KEYS.LEGACY_CONCENTRATION);
    if (savedConc) {
      legacyConcentration = JSON.parse(savedConc);
    }

    if (hadLegacyData) {
      const migratedChar: CharacterRecord = {
        id: `char-migrated-${Date.now()}`,
        profile: legacyProfile,
        spells: legacySpells,
        slots: legacySlots,
        features: legacyFeatures,
        activeConcentration: legacyConcentration,
        createdAt: Date.now(),
        lastPlayedAt: Date.now(),
      };
      return [migratedChar];
    }
  } catch (e) {
    console.error('Migration from legacy spellbook failed:', e);
  }

  // 3. Fallback: single fresh character
  return [createInitialCharacter()];
}

function loadInitialActiveCharId(charactersList: CharacterRecord[]): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_CHAR_ID);
    if (saved && charactersList.some((c) => c.id === saved)) {
      return saved;
    }
  } catch (e) {
    console.error('Failed to parse active character id:', e);
  }
  return charactersList[0]?.id || '';
}

export function useSpellbook() {
  const [characters, setCharacters] = useState<CharacterRecord[]>(loadInitialCharacters);
  const [activeCharacterId, setActiveCharacterId] = useState<string>(() =>
    loadInitialActiveCharId(characters)
  );

  // Synchronize characters list to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CHARACTERS, JSON.stringify(characters));
    } catch (e) {
      console.error('Failed to save characters:', e);
    }
  }, [characters]);

  // Synchronize active character ID to localStorage
  useEffect(() => {
    try {
      if (activeCharacterId) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_CHAR_ID, activeCharacterId);
      }
    } catch (e) {
      console.error('Failed to save active character id:', e);
    }
  }, [activeCharacterId]);

  // Ensure activeCharacterId always points to an existing character
  useEffect(() => {
    if (characters.length > 0 && !characters.some((c) => c.id === activeCharacterId)) {
      setActiveCharacterId(characters[0].id);
    }
  }, [characters, activeCharacterId]);

  // Derive active character record
  const activeCharacter: CharacterRecord = useMemo(() => {
    return characters.find((c) => c.id === activeCharacterId) || characters[0] || createInitialCharacter();
  }, [characters, activeCharacterId]);

  // Derived properties from active character for seamless backward-compatibility
  const spells = activeCharacter.spells;
  const slots = activeCharacter.slots;
  const profile = activeCharacter.profile;
  const features = activeCharacter.features;
  const activeConcentration = activeCharacter.activeConcentration;

  // Immutable updater helper for active character
  const updateActiveChar = (updater: (prev: CharacterRecord) => CharacterRecord) => {
    setCharacters((prevList) => {
      const idx = prevList.findIndex((c) => c.id === activeCharacter.id);
      if (idx === -1) {
        if (prevList.length > 0) {
          const updated = updater(prevList[0]);
          const next = [...prevList];
          next[0] = { ...updated, lastPlayedAt: Date.now() };
          return next;
        }
        return prevList;
      }
      const updated = updater(prevList[idx]);
      const next = [...prevList];
      next[idx] = { ...updated, lastPlayedAt: Date.now() };
      return next;
    });
  };

  // Concentration Helpers
  const isConcentrationSpell = (spell: Spell): boolean => {
    return Boolean(spell.duration?.some((d) => d.concentration));
  };

  const startConcentration = (spell: Spell, castAtLevel?: number) => {
    const dur = formatDuration(spell.duration);
    updateActiveChar((prev) => ({
      ...prev,
      activeConcentration: {
        spellId: spell.id,
        spellName: spell.name,
        level: spell.level,
        school: spell.school,
        castAtLevel: castAtLevel ?? spell.level,
        startedAt: Date.now(),
        durationText: dur.text,
      },
    }));
  };

  const stopConcentration = () => {
    updateActiveChar((prev) => ({
      ...prev,
      activeConcentration: null,
    }));
  };

  // Spell Preparation & Status Actions
  const togglePreparation = (spellId: string) => {
    updateActiveChar((prev) => ({
      ...prev,
      spells: prev.spells.map((s) => {
        if (s.id !== spellId) return s;
        let nextStatus: PreparationStatus = 'prepared';
        if (s.preparationStatus === 'prepared') nextStatus = 'always_available';
        else if (s.preparationStatus === 'always_available') nextStatus = 'unprepared';
        else nextStatus = 'prepared';

        return { ...s, preparationStatus: nextStatus };
      }),
    }));
  };

  const selectDailyCantrip = (spellId: string) => {
    updateActiveChar((prev) => ({
      ...prev,
      spells: prev.spells.map((s) => {
        if (s.level !== 0) return s;
        // Keep fixed cantrips that are marked always_available unchanged
        if (s.preparationStatus === 'always_available') return s;
        if (s.id === spellId) {
          return { ...s, preparationStatus: 'prepared' };
        }
        // If another non-fixed cantrip was prepared, swap it back to unprepared
        if (s.preparationStatus === 'prepared') {
          return { ...s, preparationStatus: 'unprepared' };
        }
        return s;
      }),
    }));
  };

  const setPreparationStatus = (spellId: string, status: PreparationStatus) => {
    updateActiveChar((prev) => ({
      ...prev,
      spells: prev.spells.map((s) => (s.id === spellId ? { ...s, preparationStatus: status } : s)),
    }));
  };

  const toggleFavorite = (spellId: string) => {
    updateActiveChar((prev) => ({
      ...prev,
      spells: prev.spells.map((s) => (s.id === spellId ? { ...s, isFavorite: !s.isFavorite } : s)),
    }));
  };

  // Consume a spell slot
  const castSpell = (
    spell: Spell,
    slotLevel: number
  ): { success: boolean; message: string; brokeConcentration?: string } => {
    const isConc = isConcentrationSpell(spell);
    const previousConcName = activeConcentration ? activeConcentration.spellName : null;

    if (slotLevel === 0 || spell.level === 0) {
      if (isConc) {
        startConcentration(spell, 0);
      }
      let msg = `Cast ${spell.name} (Cantrip, no slot used)`;
      if (isConc) {
        msg =
          previousConcName && previousConcName !== spell.name
            ? `Cast ${spell.name}! Dropped concentration on ${previousConcName}, now concentrating on ${spell.name}.`
            : `Cast ${spell.name}! Now concentrating on ${spell.name}.`;
      }
      return {
        success: true,
        message: msg,
        brokeConcentration: isConc && previousConcName ? previousConcName : undefined,
      };
    }

    if (slotLevel < 1 || slotLevel > 9) {
      return { success: false, message: 'Invalid spell slot level' };
    }

    const currentSlot = slots[slotLevel as keyof typeof slots] as { max: number; current: number };
    if (!currentSlot || currentSlot.current <= 0) {
      return { success: false, message: `No remaining Level ${slotLevel} spell slots!` };
    }

    updateActiveChar((prev) => {
      const levelKey = slotLevel as keyof SpellSlotState;
      const target = prev.slots[levelKey] as { max: number; current: number };
      const nextSlots: SpellSlotState = {
        ...prev.slots,
        [levelKey]: {
          ...target,
          current: Math.max(0, target.current - 1),
        },
      };

      let nextConc = prev.activeConcentration;
      if (isConc) {
        const dur = formatDuration(spell.duration);
        nextConc = {
          spellId: spell.id,
          spellName: spell.name,
          level: spell.level,
          school: spell.school,
          castAtLevel: slotLevel,
          startedAt: Date.now(),
          durationText: dur.text,
        };
      }

      return {
        ...prev,
        slots: nextSlots,
        activeConcentration: nextConc,
      };
    });

    const isUpcast = slotLevel > spell.level;
    let msg = isUpcast
      ? `Cast ${spell.name} upcast at Level ${slotLevel}! (1 slot used)`
      : `Cast ${spell.name} at Level ${slotLevel}! (1 slot used)`;

    if (isConc) {
      if (previousConcName && previousConcName !== spell.name) {
        msg += ` (Dropped concentration on ${previousConcName}, now concentrating on ${spell.name})`;
      } else {
        msg += ` (Concentrating on ${spell.name})`;
      }
    }

    return {
      success: true,
      message: msg,
      brokeConcentration: isConc && previousConcName ? previousConcName : undefined,
    };
  };

  // Cast pact slot
  const castPactSlot = (
    spell: Spell
  ): { success: boolean; message: string; brokeConcentration?: string } => {
    if (!slots.pact || slots.pact.current <= 0) {
      return { success: false, message: 'No remaining Pact Magic slots!' };
    }

    const isConc = isConcentrationSpell(spell);
    const previousConcName = activeConcentration ? activeConcentration.spellName : null;
    const pactLevel = slots.pact.level;

    updateActiveChar((prev) => {
      if (!prev.slots.pact) return prev;
      const nextPact = {
        ...prev.slots.pact,
        current: Math.max(0, prev.slots.pact.current - 1),
      };

      let nextConc = prev.activeConcentration;
      if (isConc) {
        const dur = formatDuration(spell.duration);
        nextConc = {
          spellId: spell.id,
          spellName: spell.name,
          level: spell.level,
          school: spell.school,
          castAtLevel: pactLevel,
          startedAt: Date.now(),
          durationText: dur.text,
        };
      }

      return {
        ...prev,
        slots: {
          ...prev.slots,
          pact: nextPact,
        },
        activeConcentration: nextConc,
      };
    });

    let msg = `Cast ${spell.name} using Level ${pactLevel} Pact Slot!`;
    if (isConc) {
      if (previousConcName && previousConcName !== spell.name) {
        msg += ` (Dropped concentration on ${previousConcName}, now concentrating on ${spell.name})`;
      } else {
        msg += ` (Concentrating on ${spell.name})`;
      }
    }

    return {
      success: true,
      message: msg,
      brokeConcentration: isConc && previousConcName ? previousConcName : undefined,
    };
  };

  // Adjust slots directly
  const adjustSlot = (level: number | 'pact', delta: number) => {
    updateActiveChar((prev) => {
      if (level === 'pact') {
        if (!prev.slots.pact) return prev;
        const nextCurrent = Math.max(0, Math.min(prev.slots.pact.max, prev.slots.pact.current + delta));
        return {
          ...prev,
          slots: {
            ...prev.slots,
            pact: { ...prev.slots.pact, current: nextCurrent },
          },
        };
      }

      const key = level as keyof SpellSlotState;
      const slot = prev.slots[key] as { max: number; current: number };
      if (!slot) return prev;

      const nextCurrent = Math.max(0, Math.min(slot.max, slot.current + delta));
      return {
        ...prev,
        slots: {
          ...prev.slots,
          [key]: { ...slot, current: nextCurrent },
        },
      };
    });
  };

  // Set slot max directly
  const setSlotMax = (level: number | 'pact', max: number) => {
    updateActiveChar((prev) => {
      if (level === 'pact') {
        if (!prev.slots.pact) {
          return {
            ...prev,
            slots: {
              ...prev.slots,
              pact: { max: Math.max(0, max), current: Math.max(0, max), level: 5 },
            },
          };
        }
        const safeMax = Math.max(0, max);
        return {
          ...prev,
          slots: {
            ...prev.slots,
            pact: {
              ...prev.slots.pact,
              max: safeMax,
              current: Math.min(prev.slots.pact.current, safeMax),
            },
          },
        };
      }

      const key = level as keyof SpellSlotState;
      const slot = prev.slots[key] as { max: number; current: number };
      const safeMax = Math.max(0, max);
      return {
        ...prev,
        slots: {
          ...prev.slots,
          [key]: {
            max: safeMax,
            current: Math.min(slot ? slot.current : 0, safeMax),
          },
        },
      };
    });
  };

  // Long Rest - refills slots and resets long-rest features
  const takeLongRest = () => {
    updateActiveChar((prev) => {
      const nextSlots: SpellSlotState = {
        1: { max: prev.slots[1].max, current: prev.slots[1].max },
        2: { max: prev.slots[2].max, current: prev.slots[2].max },
        3: { max: prev.slots[3].max, current: prev.slots[3].max },
        4: { max: prev.slots[4].max, current: prev.slots[4].max },
        5: { max: prev.slots[5].max, current: prev.slots[5].max },
        6: { max: prev.slots[6].max, current: prev.slots[6].max },
        7: { max: prev.slots[7].max, current: prev.slots[7].max },
        8: { max: prev.slots[8].max, current: prev.slots[8].max },
        9: { max: prev.slots[9].max, current: prev.slots[9].max },
      };
      if (prev.slots.pact) {
        nextSlots.pact = {
          ...prev.slots.pact,
          current: prev.slots.pact.max,
        };
      }

      const nextFeatures = prev.features.map((f) => {
        if (f.resetType === 'long' || f.resetType === 'short') {
          return { ...f, current: f.max };
        }
        return f;
      });

      return {
        ...prev,
        slots: nextSlots,
        features: nextFeatures,
        activeConcentration: null,
      };
    });
  };

  // Short Rest - refills pact slots and short-rest features
  const takeShortRest = () => {
    updateActiveChar((prev) => {
      let nextSlots = prev.slots;
      if (prev.slots.pact) {
        nextSlots = {
          ...prev.slots,
          pact: {
            ...prev.slots.pact,
            current: prev.slots.pact.max,
          },
        };
      }

      const nextFeatures = prev.features.map((f) => {
        if (f.resetType === 'short') {
          return { ...f, current: f.max };
        }
        return f;
      });

      return {
        ...prev,
        slots: nextSlots,
        features: nextFeatures,
      };
    });
  };

  // Feature manipulation methods
  const adjustFeature = (featureId: string, delta: number) => {
    updateActiveChar((prev) => ({
      ...prev,
      features: prev.features.map((f) => {
        if (f.id !== featureId) return f;
        const nextCurrent = Math.max(0, Math.min(f.max, f.current + delta));
        return { ...f, current: nextCurrent };
      }),
    }));
  };

  const setFeatureCurrent = (featureId: string, value: number) => {
    updateActiveChar((prev) => ({
      ...prev,
      features: prev.features.map((f) => {
        if (f.id !== featureId) return f;
        const nextCurrent = Math.max(0, Math.min(f.max, value));
        return { ...f, current: nextCurrent };
      }),
    }));
  };

  const resetFeature = (featureId: string) => {
    updateActiveChar((prev) => ({
      ...prev,
      features: prev.features.map((f) => (f.id === featureId ? { ...f, current: f.max } : f)),
    }));
  };

  const addFeature = (newFeatureData: Omit<CharacterFeature, 'id'>) => {
    const newId = `feat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newFeature: CharacterFeature = {
      ...newFeatureData,
      id: newId,
    };
    updateActiveChar((prev) => ({
      ...prev,
      features: [...prev.features, newFeature],
    }));
    return newFeature;
  };

  const updateFeature = (featureId: string, updates: Partial<CharacterFeature>) => {
    updateActiveChar((prev) => ({
      ...prev,
      features: prev.features.map((f) => {
        if (f.id !== featureId) return f;
        const updated = { ...f, ...updates };
        if (updated.max !== undefined && updated.current > updated.max) {
          updated.current = updated.max;
        }
        return updated;
      }),
    }));
  };

  const deleteFeature = (featureId: string) => {
    updateActiveChar((prev) => ({
      ...prev,
      features: prev.features.filter((f) => f.id !== featureId),
    }));
  };

  const reorderFeatures = (newFeatures: CharacterFeature[]) => {
    updateActiveChar((prev) => ({
      ...prev,
      features: newFeatures,
    }));
  };

  // Apply class / level presets
  const applyPresetSlots = (casterClass = profile.characterClass, level = profile.level) => {
    const preset = getDefaultSpellSlotsForClass(casterClass, level);
    updateActiveChar((prev) => ({
      ...prev,
      slots: preset,
    }));
  };

  // Update profile
  const updateProfile = (updates: Partial<CharacterProfile>) => {
    updateActiveChar((prev) => {
      const nextProfile = { ...prev.profile, ...updates };
      if (updates.level !== undefined) {
        nextProfile.proficiencyBonus = getProficiencyBonus(nextProfile.level);
      }
      return {
        ...prev,
        profile: nextProfile,
      };
    });
  };

  // Add custom spell
  const addSpell = (spellData: Omit<Spell, 'id'>) => {
    const newId = `spell-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newSpell: Spell = {
      ...spellData,
      id: newId,
      isCustom: true,
      preparationStatus:
        spellData.preparationStatus || (spellData.level === 0 ? 'always_available' : 'unprepared'),
    };
    updateActiveChar((prev) => ({
      ...prev,
      spells: [newSpell, ...prev.spells],
    }));
    return newSpell;
  };

  // Edit spell
  const updateSpell = (spellId: string, updates: Partial<Spell>) => {
    updateActiveChar((prev) => {
      const nextSpells = prev.spells.map((s) => (s.id === spellId ? { ...s, ...updates } : s));
      let nextConc = prev.activeConcentration;
      if (nextConc && nextConc.spellId === spellId && updates.name) {
        nextConc = { ...nextConc, spellName: updates.name };
      }
      return {
        ...prev,
        spells: nextSpells,
        activeConcentration: nextConc,
      };
    });
  };

  // Delete spell
  const deleteSpell = (spellId: string) => {
    updateActiveChar((prev) => ({
      ...prev,
      spells: prev.spells.filter((s) => s.id !== spellId),
      activeConcentration:
        prev.activeConcentration?.spellId === spellId ? null : prev.activeConcentration,
    }));
  };

  // Import spells from JSON
  const importSpells = (
    rawJson: any,
    mode: 'merge' | 'replace'
  ): { count: number; error?: string } => {
    try {
      let spellList: any[] = [];

      if (Array.isArray(rawJson)) {
        spellList = rawJson;
      } else if (rawJson && typeof rawJson === 'object') {
        if (Array.isArray(rawJson.spell)) {
          spellList = rawJson.spell;
        } else if (Array.isArray(rawJson.spells)) {
          spellList = rawJson.spells;
        } else if (rawJson.name && rawJson.level !== undefined) {
          spellList = [rawJson];
        }
      }

      if (spellList.length === 0) {
        return { count: 0, error: 'No valid spell items found in JSON structure.' };
      }

      const formattedSpells: Spell[] = spellList
        .filter((item) => item && typeof item === 'object' && item.name)
        .map((item, index) => {
          const id =
            item.id ||
            `${item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${item.source || 'imp'}-${index}`;
          const level = typeof item.level === 'number' ? item.level : 0;
          return {
            id,
            name: item.name,
            source: item.source || 'Custom',
            page: item.page,
            level,
            school: item.school || 'V',
            time: Array.isArray(item.time) ? item.time : [{ number: 1, unit: 'action' }],
            range: item.range || { type: 'point', distance: { type: 'feet', amount: 30 } },
            components: item.components || { v: true, s: true },
            duration: Array.isArray(item.duration) ? item.duration : [{ type: 'instant' }],
            meta: item.meta,
            entries: Array.isArray(item.entries)
              ? item.entries
              : item.entries
              ? [item.entries]
              : ['No description available.'],
            entriesHigherLevel: item.entriesHigherLevel,
            classes: item.classes,
            damageInflict: item.damageInflict,
            conditionInflict: item.conditionInflict,
            savingThrow: item.savingThrow,
            abilityCheck: item.abilityCheck,
            miscTags: item.miscTags,
            areaTags: item.areaTags,
            preparationStatus: item.preparationStatus || (level === 0 ? 'always_available' : 'unprepared'),
            isFavorite: Boolean(item.isFavorite),
            customNotes: item.customNotes,
          };
        });

      updateActiveChar((prev) => {
        if (mode === 'replace') {
          return { ...prev, spells: formattedSpells };
        } else {
          const map = new Map<string, Spell>();
          prev.spells.forEach((s) => map.set(s.name.toLowerCase(), s));
          formattedSpells.forEach((s) => {
            const existing = map.get(s.name.toLowerCase());
            if (existing) {
              map.set(s.name.toLowerCase(), {
                ...s,
                id: existing.id,
                preparationStatus: existing.preparationStatus || s.preparationStatus,
                isFavorite: existing.isFavorite || s.isFavorite,
              });
            } else {
              map.set(s.name.toLowerCase(), s);
            }
          });
          return { ...prev, spells: Array.from(map.values()) };
        }
      });

      return { count: formattedSpells.length };
    } catch (e: any) {
      console.error('Import error:', e);
      return { count: 0, error: e.message || 'Failed to parse spell JSON' };
    }
  };

  // Reset to default sample spells
  const resetToDefaultSample = () => {
    updateActiveChar((prev) => ({
      ...prev,
      spells: JSON.parse(JSON.stringify(DEFAULT_SPELLS_DATA)),
    }));
  };

  // -------------------------------------------------------------
  // MULTI-CHARACTER MANAGEMENT METHODS
  // -------------------------------------------------------------

  const switchCharacter = (charId: string): boolean => {
    const target = characters.find((c) => c.id === charId);
    if (!target) return false;
    setActiveCharacterId(charId);
    return true;
  };

  const createCharacter = (options?: {
    name?: string;
    characterClass?: CasterClass;
    level?: number;
    spellcastingAbility?: AbilityScore;
    abilityScoreValue?: number;
    startWithDefaultSpells?: boolean;
    copyCurrentFeatures?: boolean;
  }): CharacterRecord => {
    const cClass = options?.characterClass || 'Wizard';
    const lvl = options?.level || 1;
    const prof = getProficiencyBonus(lvl);
    const ability =
      options?.spellcastingAbility ||
      (['Cleric', 'Druid', 'Ranger'].includes(cClass)
        ? 'WIS'
        : ['Bard', 'Sorcerer', 'Warlock', 'Paladin'].includes(cClass)
        ? 'CHA'
        : 'INT');

    const newProfile: CharacterProfile = {
      ...DEFAULT_PROFILE,
      name: options?.name?.trim() || `New Hero ${characters.length + 1}`,
      characterClass: cClass,
      level: lvl,
      spellcastingAbility: ability,
      abilityScoreValue: options?.abilityScoreValue || 16,
      proficiencyBonus: prof,
      enableDailyCantrips: true,
      enableFeaturesTracker: true,
    };

    const newRecord: CharacterRecord = {
      id: `char-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      profile: newProfile,
      spells: options?.startWithDefaultSpells
        ? JSON.parse(JSON.stringify(DEFAULT_SPELLS_DATA))
        : [],
      slots: getDefaultSpellSlotsForClass(cClass, lvl),
      features: options?.copyCurrentFeatures
        ? JSON.parse(JSON.stringify(activeCharacter.features))
        : JSON.parse(JSON.stringify(DEFAULT_FEATURES)),
      activeConcentration: null,
      createdAt: Date.now(),
      lastPlayedAt: Date.now(),
    };

    setCharacters((prev) => [...prev, newRecord]);
    setActiveCharacterId(newRecord.id);
    return newRecord;
  };

  const duplicateCharacter = (characterId: string, customName?: string): CharacterRecord | null => {
    const target = characters.find((c) => c.id === characterId);
    if (!target) return null;

    const clonedName = customName?.trim() || `${target.profile.name || 'Hero'} (Copy)`;
    const newRecord: CharacterRecord = {
      id: `char-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      profile: {
        ...JSON.parse(JSON.stringify(target.profile)),
        name: clonedName,
      },
      spells: JSON.parse(JSON.stringify(target.spells)),
      slots: JSON.parse(JSON.stringify(target.slots)),
      features: JSON.parse(JSON.stringify(target.features)),
      activeConcentration: null, // do not clone active concentration
      createdAt: Date.now(),
      lastPlayedAt: Date.now(),
    };

    setCharacters((prev) => [...prev, newRecord]);
    setActiveCharacterId(newRecord.id);
    return newRecord;
  };

  const deleteCharacter = (characterId: string): { success: boolean; message: string } => {
    if (characters.length <= 1) {
      return { success: false, message: 'Cannot delete the only remaining character in the roster.' };
    }

    const target = characters.find((c) => c.id === characterId);
    if (!target) {
      return { success: false, message: 'Character not found.' };
    }

    const remaining = characters.filter((c) => c.id !== characterId);
    setCharacters(remaining);

    if (activeCharacterId === characterId) {
      setActiveCharacterId(remaining[0].id);
    }

    return {
      success: true,
      message: `Deleted ${target.profile.name || 'character'} successfully.`,
    };
  };

  // Full Database Export / Backup
  const exportFullDatabase = (): DatabaseBackup => {
    let totalSpells = 0;
    characters.forEach((c) => {
      totalSpells += c.spells?.length || 0;
    });

    return {
      format: 'dnd-spellbook-backup-v1',
      version: 1,
      exportedAt: new Date().toISOString(),
      timestamp: Date.now(),
      activeCharacterId,
      charactersCount: characters.length,
      totalSpellsCount: totalSpells,
      characters: JSON.parse(JSON.stringify(characters)),
    };
  };

  // Full Database Import / Restore
  const importFullDatabase = (
    rawJson: any,
    mode: 'replace' | 'merge'
  ): { success: boolean; message: string; count?: number } => {
    try {
      if (!rawJson || typeof rawJson !== 'object') {
        return { success: false, message: 'Invalid backup file: Not a valid JSON object.' };
      }

      let incomingList: any[] = [];
      let targetActiveId: string | undefined = undefined;

      if (Array.isArray(rawJson)) {
        incomingList = rawJson;
      } else if (Array.isArray(rawJson.characters)) {
        incomingList = rawJson.characters;
        targetActiveId = rawJson.activeCharacterId;
      } else if (rawJson.profile && (rawJson.spells || rawJson.slots)) {
        // Single character backup
        incomingList = [rawJson];
      } else {
        return {
          success: false,
          message: 'Unrecognized backup structure. Expected a database backup or characters array.',
        };
      }

      if (incomingList.length === 0) {
        return { success: false, message: 'Backup file contains no characters.' };
      }

      // Sanitize and normalize incoming characters
      const sanitizedCharacters: CharacterRecord[] = incomingList
        .filter((item) => item && typeof item === 'object')
        .map((item, index) => {
          const profile: CharacterProfile = {
            ...DEFAULT_PROFILE,
            ...(item.profile || {}),
            name: item.profile?.name || `Restored Hero ${index + 1}`,
            characterClass: item.profile?.characterClass || 'Wizard',
            level: typeof item.profile?.level === 'number' ? item.profile.level : 1,
            spellcastingAbility: item.profile?.spellcastingAbility || 'INT',
            abilityScoreValue: item.profile?.abilityScoreValue || 16,
            proficiencyBonus:
              item.profile?.proficiencyBonus ||
              getProficiencyBonus(item.profile?.level || 1),
            enableDailyCantrips:
              item.profile?.enableDailyCantrips !== undefined
                ? item.profile.enableDailyCantrips
                : true,
            enableFeaturesTracker:
              item.profile?.enableFeaturesTracker !== undefined
                ? item.profile.enableFeaturesTracker
                : true,
          };

          const charId =
            item.id || `char-restored-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

          const spells: Spell[] = Array.isArray(item.spells)
            ? item.spells.filter((s: any) => s && s.name)
            : [];

          const slots: SpellSlotState =
            item.slots && item.slots[1]
              ? item.slots
              : getDefaultSpellSlotsForClass(profile.characterClass, profile.level);

          const features: CharacterFeature[] = Array.isArray(item.features)
            ? item.features
            : DEFAULT_FEATURES;

          return {
            id: charId,
            profile,
            spells,
            slots,
            features,
            activeConcentration: item.activeConcentration || null,
            createdAt: item.createdAt || Date.now(),
            lastPlayedAt: item.lastPlayedAt || Date.now(),
          };
        });

      if (sanitizedCharacters.length === 0) {
        return { success: false, message: 'No valid character records found in backup.' };
      }

      if (mode === 'replace') {
        setCharacters(sanitizedCharacters);
        const nextActiveId =
          targetActiveId && sanitizedCharacters.some((c) => c.id === targetActiveId)
            ? targetActiveId
            : sanitizedCharacters[0].id;
        setActiveCharacterId(nextActiveId);
        return {
          success: true,
          message: `Entire database successfully restored with ${sanitizedCharacters.length} characters!`,
          count: sanitizedCharacters.length,
        };
      } else {
        // Merge mode: re-key IDs if collision to avoid clobbering existing characters
        const existingIds = new Set(characters.map((c) => c.id));
        const mergedIncoming = sanitizedCharacters.map((c) => {
          if (existingIds.has(c.id)) {
            return {
              ...c,
              id: `char-merged-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              profile: {
                ...c.profile,
                name: `${c.profile.name} (Restored)`,
              },
            };
          }
          return c;
        });

        setCharacters((prev) => [...prev, ...mergedIncoming]);
        return {
          success: true,
          message: `Successfully merged ${mergedIncoming.length} characters into your roster!`,
          count: mergedIncoming.length,
        };
      }
    } catch (e: any) {
      console.error('Backup restore error:', e);
      return { success: false, message: e.message || 'Failed to restore database from backup.' };
    }
  };

  return {
    // Current Active Character State
    spells,
    slots,
    profile,
    activeConcentration,
    startConcentration,
    stopConcentration,
    togglePreparation,
    setPreparationStatus,
    selectDailyCantrip,
    toggleFavorite,
    castSpell,
    castPactSlot,
    adjustSlot,
    setSlotMax,
    takeLongRest,
    takeShortRest,
    applyPresetSlots,
    updateProfile,
    addSpell,
    updateSpell,
    deleteSpell,
    importSpells,
    resetToDefaultSample,
    // Character Features
    features,
    adjustFeature,
    setFeatureCurrent,
    resetFeature,
    addFeature,
    updateFeature,
    deleteFeature,
    reorderFeatures,
    // Multi-Character Management
    characters,
    activeCharacterId,
    activeCharacter,
    switchCharacter,
    createCharacter,
    duplicateCharacter,
    deleteCharacter,
    // Full Database Backup & Restore
    exportFullDatabase,
    importFullDatabase,
  };
}
