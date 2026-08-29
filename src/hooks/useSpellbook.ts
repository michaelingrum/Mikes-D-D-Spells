import { useEffect, useState } from 'react';
import { DEFAULT_SPELLS_DATA } from '../data/defaultSpells';
import {
  ActiveConcentration,
  CharacterProfile,
  PreparationStatus,
  Spell,
  SpellSlotState
} from '../types';
import { getDefaultSpellSlotsForClass, getProficiencyBonus } from '../utils/spellSlotPresets';
import { formatDuration } from '../utils/textParser';

const STORAGE_KEYS = {
  SPELLS: 'dnd_spellbook_spells_v3',
  SLOTS: 'dnd_spellbook_slots_v3',
  PROFILE: 'dnd_spellbook_profile_v3',
  CONCENTRATION: 'dnd_spellbook_concentration_v1',
};

const DEFAULT_PROFILE: CharacterProfile = {
  name: 'My Character',
  characterClass: 'Wizard',
  level: 1,
  spellcastingAbility: 'INT',
  abilityScoreValue: 16,
  proficiencyBonus: 2,
  dcBonus: 0,
  attackBonus: 0,
};

export function useSpellbook() {
  // Load spells - Starts empty/blank by default
  const [spells, setSpells] = useState<Spell[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SPELLS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse saved spells:', e);
    }
    return []; // Blank start
  });

  // Load character profile
  const [profile, setProfile] = useState<CharacterProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse saved profile:', e);
    }
    return DEFAULT_PROFILE;
  });

  // Load spell slots
  const [slots, setSlots] = useState<SpellSlotState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SLOTS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse saved slots:', e);
    }
    return getDefaultSpellSlotsForClass(DEFAULT_PROFILE.characterClass, DEFAULT_PROFILE.level);
  });

  // Load Active Concentration
  const [activeConcentration, setActiveConcentration] = useState<ActiveConcentration | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONCENTRATION);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse saved concentration:', e);
    }
    return null;
  });

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SPELLS, JSON.stringify(spells));
    } catch (e) {
      console.error('Failed to save spells:', e);
    }
  }, [spells]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile:', e);
    }
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SLOTS, JSON.stringify(slots));
    } catch (e) {
      console.error('Failed to save slots:', e);
    }
  }, [slots]);

  useEffect(() => {
    try {
      if (activeConcentration) {
        localStorage.setItem(STORAGE_KEYS.CONCENTRATION, JSON.stringify(activeConcentration));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CONCENTRATION);
      }
    } catch (e) {
      console.error('Failed to save concentration:', e);
    }
  }, [activeConcentration]);

  // Concentration Helpers
  const isConcentrationSpell = (spell: Spell): boolean => {
    return Boolean(spell.duration?.some((d) => d.concentration));
  };

  const startConcentration = (spell: Spell, castAtLevel?: number) => {
    const dur = formatDuration(spell.duration);
    setActiveConcentration({
      spellId: spell.id,
      spellName: spell.name,
      level: spell.level,
      school: spell.school,
      castAtLevel: castAtLevel ?? spell.level,
      startedAt: Date.now(),
      durationText: dur.text,
    });
  };

  const stopConcentration = () => {
    setActiveConcentration(null);
  };

  // Actions
  const togglePreparation = (spellId: string) => {
    setSpells((prev) =>
      prev.map((s) => {
        if (s.id !== spellId) return s;
        if (s.level === 0) return s; // Cantrips are always prepared
        let nextStatus: PreparationStatus = 'prepared';
        if (s.preparationStatus === 'prepared') nextStatus = 'always_available';
        else if (s.preparationStatus === 'always_available') nextStatus = 'unprepared';
        else nextStatus = 'prepared';

        return { ...s, preparationStatus: nextStatus };
      })
    );
  };

  const setPreparationStatus = (spellId: string, status: PreparationStatus) => {
    setSpells((prev) =>
      prev.map((s) => (s.id === spellId ? { ...s, preparationStatus: status } : s))
    );
  };

  const toggleFavorite = (spellId: string) => {
    setSpells((prev) =>
      prev.map((s) => (s.id === spellId ? { ...s, isFavorite: !s.isFavorite } : s))
    );
  };

  // Consume a spell slot
  const castSpell = (spell: Spell, slotLevel: number): { success: boolean; message: string; brokeConcentration?: string } => {
    const isConc = isConcentrationSpell(spell);
    const previousConcName = activeConcentration ? activeConcentration.spellName : null;

    if (slotLevel === 0 || spell.level === 0) {
      if (isConc) {
        startConcentration(spell, 0);
      }
      let msg = `Cast ${spell.name} (Cantrip, no slot used)`;
      if (isConc) {
        msg = previousConcName && previousConcName !== spell.name
          ? `Cast ${spell.name}! Dropped concentration on ${previousConcName}, now concentrating on ${spell.name}.`
          : `Cast ${spell.name}! Now concentrating on ${spell.name}.`;
      }
      return {
        success: true,
        message: msg,
        brokeConcentration: isConc && previousConcName ? previousConcName : undefined,
      };
    }

    // Check if slot level is valid
    if (slotLevel < 1 || slotLevel > 9) {
      return { success: false, message: 'Invalid spell slot level' };
    }

    const currentSlot = slots[slotLevel as keyof typeof slots] as { max: number; current: number };
    if (!currentSlot || currentSlot.current <= 0) {
      return { success: false, message: `No remaining Level ${slotLevel} spell slots!` };
    }

    setSlots((prev) => {
      const levelKey = slotLevel as keyof SpellSlotState;
      const target = prev[levelKey] as { max: number; current: number };
      return {
        ...prev,
        [levelKey]: {
          ...target,
          current: Math.max(0, target.current - 1),
        },
      };
    });

    if (isConc) {
      startConcentration(spell, slotLevel);
    }

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
  const castPactSlot = (spell: Spell): { success: boolean; message: string; brokeConcentration?: string } => {
    if (!slots.pact || slots.pact.current <= 0) {
      return { success: false, message: 'No remaining Pact Magic slots!' };
    }

    const isConc = isConcentrationSpell(spell);
    const previousConcName = activeConcentration ? activeConcentration.spellName : null;

    setSlots((prev) => {
      if (!prev.pact) return prev;
      return {
        ...prev,
        pact: {
          ...prev.pact,
          current: Math.max(0, prev.pact.current - 1),
        },
      };
    });

    if (isConc) {
      startConcentration(spell, slots.pact.level);
    }

    let msg = `Cast ${spell.name} using Level ${slots.pact.level} Pact Slot!`;
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
    setSlots((prev) => {
      if (level === 'pact') {
        if (!prev.pact) return prev;
        const nextCurrent = Math.max(0, Math.min(prev.pact.max, prev.pact.current + delta));
        return {
          ...prev,
          pact: { ...prev.pact, current: nextCurrent },
        };
      }

      const key = level as keyof SpellSlotState;
      const slot = prev[key] as { max: number; current: number };
      if (!slot) return prev;

      const nextCurrent = Math.max(0, Math.min(slot.max, slot.current + delta));
      return {
        ...prev,
        [key]: { ...slot, current: nextCurrent },
      };
    });
  };

  // Set slot max directly
  const setSlotMax = (level: number | 'pact', max: number) => {
    setSlots((prev) => {
      if (level === 'pact') {
        if (!prev.pact) {
          return {
            ...prev,
            pact: { max: Math.max(0, max), current: Math.max(0, max), level: 5 },
          };
        }
        const safeMax = Math.max(0, max);
        return {
          ...prev,
          pact: { ...prev.pact, max: safeMax, current: Math.min(prev.pact.current, safeMax) },
        };
      }

      const key = level as keyof SpellSlotState;
      const slot = prev[key] as { max: number; current: number };
      const safeMax = Math.max(0, max);
      return {
        ...prev,
        [key]: {
          max: safeMax,
          current: Math.min(slot ? slot.current : 0, safeMax),
        },
      };
    });
  };

  // Long Rest
  const takeLongRest = () => {
    setSlots((prev) => {
      const next: SpellSlotState = {
        1: { max: prev[1].max, current: prev[1].max },
        2: { max: prev[2].max, current: prev[2].max },
        3: { max: prev[3].max, current: prev[3].max },
        4: { max: prev[4].max, current: prev[4].max },
        5: { max: prev[5].max, current: prev[5].max },
        6: { max: prev[6].max, current: prev[6].max },
        7: { max: prev[7].max, current: prev[7].max },
        8: { max: prev[8].max, current: prev[8].max },
        9: { max: prev[9].max, current: prev[9].max },
      };
      if (prev.pact) {
        next.pact = {
          ...prev.pact,
          current: prev.pact.max,
        };
      }
      return next;
    });
    // Concentration ends on long rest
    setActiveConcentration(null);
  };

  // Short Rest
  const takeShortRest = () => {
    setSlots((prev) => {
      if (!prev.pact) return prev;
      return {
        ...prev,
        pact: {
          ...prev.pact,
          current: prev.pact.max,
        },
      };
    });
  };

  // Apply class / level presets
  const applyPresetSlots = (casterClass = profile.characterClass, level = profile.level) => {
    const preset = getDefaultSpellSlotsForClass(casterClass, level);
    setSlots(preset);
  };

  // Update profile
  const updateProfile = (updates: Partial<CharacterProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...updates };
      if (updates.level !== undefined) {
        next.proficiencyBonus = getProficiencyBonus(next.level);
      }
      return next;
    });
  };

  // Add custom spell
  const addSpell = (spellData: Omit<Spell, 'id'>) => {
    const newId = `spell-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newSpell: Spell = {
      ...spellData,
      id: newId,
      isCustom: true,
      preparationStatus: spellData.level === 0 ? 'always_available' : (spellData.preparationStatus || 'unprepared'),
    };
    setSpells((prev) => [newSpell, ...prev]);
    return newSpell;
  };

  // Edit spell
  const updateSpell = (spellId: string, updates: Partial<Spell>) => {
    setSpells((prev) =>
      prev.map((s) => (s.id === spellId ? { ...s, ...updates } : s))
    );
    if (activeConcentration && activeConcentration.spellId === spellId && updates.name) {
      setActiveConcentration((prev) => prev ? { ...prev, spellName: updates.name! } : null);
    }
  };

  // Delete spell
  const deleteSpell = (spellId: string) => {
    setSpells((prev) => prev.filter((s) => s.id !== spellId));
    if (activeConcentration && activeConcentration.spellId === spellId) {
      setActiveConcentration(null);
    }
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
            entries: Array.isArray(item.entries) ? item.entries : (item.entries ? [item.entries] : ['No description available.']),
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

      if (mode === 'replace') {
        setSpells(formattedSpells);
      } else {
        // Merge: update existing, add new
        setSpells((prev) => {
          const map = new Map<string, Spell>();
          prev.forEach((s) => map.set(s.name.toLowerCase(), s));
          formattedSpells.forEach((s) => {
            const existing = map.get(s.name.toLowerCase());
            if (existing) {
              // preserve user preparation status if existing
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
          return Array.from(map.values());
        });
      }

      return { count: formattedSpells.length };
    } catch (e: any) {
      console.error('Import error:', e);
      return { count: 0, error: e.message || 'Failed to parse spell JSON' };
    }
  };

  // Reset to default sample spells
  const resetToDefaultSample = () => {
    setSpells(DEFAULT_SPELLS_DATA);
  };

  return {
    spells,
    slots,
    profile,
    activeConcentration,
    startConcentration,
    stopConcentration,
    togglePreparation,
    setPreparationStatus,
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
  };
}
