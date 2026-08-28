import { useEffect, useState } from 'react';
import { DEFAULT_SPELLS_DATA } from '../data/defaultSpells';
import {
  CharacterProfile,
  PreparationStatus,
  Spell,
  SpellSlotState
} from '../types';
import { getDefaultSpellSlotsForClass, getProficiencyBonus } from '../utils/spellSlotPresets';

const STORAGE_KEYS = {
  SPELLS: 'dnd_spellbook_spells_v2',
  SLOTS: 'dnd_spellbook_slots_v2',
  PROFILE: 'dnd_spellbook_profile_v2',
};

const DEFAULT_PROFILE: CharacterProfile = {
  name: 'Mage Elyndor',
  characterClass: 'Wizard',
  level: 7,
  spellcastingAbility: 'INT',
  abilityScoreValue: 18,
  proficiencyBonus: 3,
};

export function useSpellbook() {
  // Load spells
  const [spells, setSpells] = useState<Spell[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SPELLS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse saved spells:', e);
    }
    return DEFAULT_SPELLS_DATA;
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
  const castSpell = (spell: Spell, slotLevel: number): { success: boolean; message: string } => {
    if (slotLevel === 0 || spell.level === 0) {
      return { success: true, message: `Cast ${spell.name} (Cantrip, no slot used)` };
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

    const isUpcast = slotLevel > spell.level;
    return {
      success: true,
      message: isUpcast
        ? `Cast ${spell.name} upcast at Level ${slotLevel}! (1 slot used)`
        : `Cast ${spell.name} at Level ${slotLevel}! (1 slot used)`,
    };
  };

  // Cast pact slot
  const castPactSlot = (spell: Spell): { success: boolean; message: string } => {
    if (!slots.pact || slots.pact.current <= 0) {
      return { success: false, message: 'No remaining Pact Magic slots!' };
    }

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

    return {
      success: true,
      message: `Cast ${spell.name} using Level ${slots.pact.level} Pact Slot!`,
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
  };

  // Delete spell
  const deleteSpell = (spellId: string) => {
    setSpells((prev) => prev.filter((s) => s.id !== spellId));
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
