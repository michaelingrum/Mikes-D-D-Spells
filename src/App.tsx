/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Download,
  Filter,
  Flame,
  Moon,
  Plus,
  RotateCcw,
  Sparkles,
  Upload,
  Zap,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { AddSpellModal } from './components/AddSpellModal';
import { CastSpellModal } from './components/CastSpellModal';
import { CharacterModal } from './components/CharacterModal';
import { FilterBar } from './components/FilterBar';
import { ImportModal } from './components/ImportModal';
import { InstallModal } from './components/InstallModal';
import { LongRestModal } from './components/LongRestModal';
import { Navbar } from './components/Navbar';
import { SlotTracker } from './components/SlotTracker';
import { SpellCard } from './components/SpellCard';
import { SpellDetailModal } from './components/SpellDetailModal';
import { useSpellbook } from './hooks/useSpellbook';
import { FilterOptions, Spell, SpellSlotState } from './types';
import { calculateMaxPrepared, getAbilityModifier } from './utils/spellSlotPresets';
import { clean5eTags, formatSpellLevel, getSchoolInfo } from './utils/textParser';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export default function App() {
  const {
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
    deleteSpell,
    importSpells,
    resetToDefaultSample,
  } = useSpellbook();

  // Filter & Search State
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    level: 'all',
    school: 'all',
    preparation: 'all',
    castingTime: 'all',
    characterClass: 'all',
    sortBy: 'level-asc',
  });

  // Modal State
  const [activeModal, setActiveModal] = useState<
    'character' | 'import' | 'addSpell' | 'longRest' | 'install' | null
  >(null);
  const [detailSpell, setDetailSpell] = useState<Spell | null>(null);
  const [castingSpell, setCastingSpell] = useState<Spell | null>(null);

  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
      showToast('Spellbook successfully installed to your device!', 'success');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(
    null
  );

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  // Filter handler
  const handleFilterChange = (updates: Partial<FilterOptions>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      level: 'all',
      school: 'all',
      preparation: 'all',
      castingTime: 'all',
      characterClass: 'all',
      sortBy: 'level-asc',
    });
  };

  // Calculate Prepared Spells Count
  const totalPreparedCount = useMemo(() => {
    return spells.filter((s) => s.level > 0 && s.preparationStatus === 'prepared').length;
  }, [spells]);

  const maxPreparedLimit = useMemo(() => {
    return calculateMaxPrepared(profile.characterClass, profile.level, profile.abilityScoreValue);
  }, [profile]);

  // Calculate DC & Attack Bonus (including magic item bonuses)
  const spellSaveDC = useMemo(() => {
    const abilityMod = getAbilityModifier(profile.abilityScoreValue);
    const dcBonus = profile.dcBonus || 0;
    return 8 + profile.proficiencyBonus + abilityMod + dcBonus;
  }, [profile]);

  const spellAttackMod = useMemo(() => {
    const abilityMod = getAbilityModifier(profile.abilityScoreValue);
    const attackBonus = profile.attackBonus || 0;
    return profile.proficiencyBonus + abilityMod + attackBonus;
  }, [profile]);

  // Filter & Sort Logic
  const filteredSpells = useMemo(() => {
    return spells.filter((spell) => {
      // Search query filter
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase().trim();
        const nameMatch = spell.name.toLowerCase().includes(q);
        const schoolMatch = getSchoolInfo(spell.school).name.toLowerCase().includes(q);
        const classMatch = spell.classes?.fromClassList?.some((c) =>
          c.name.toLowerCase().includes(q)
        );
        const entriesMatch = spell.entries?.some((e) =>
          typeof e === 'string' ? clean5eTags(e).toLowerCase().includes(q) : false
        );

        if (!nameMatch && !schoolMatch && !classMatch && !entriesMatch) {
          return false;
        }
      }

      // Level filter
      if (filters.level !== 'all') {
        if (typeof filters.level === 'number' && spell.level !== filters.level) {
          return false;
        }
      }

      // School filter
      if (filters.school !== 'all') {
        const schoolUpper = filters.school.toUpperCase();
        if (
          spell.school.toUpperCase() !== schoolUpper &&
          getSchoolInfo(spell.school).name.toUpperCase() !== schoolUpper
        ) {
          return false;
        }
      }

      // Preparation filter
      if (filters.preparation !== 'all') {
        if (filters.preparation === 'prepared') {
          if (spell.level === 0 || spell.preparationStatus !== 'prepared') return false;
        } else if (filters.preparation === 'always_available') {
          if (spell.level !== 0 && spell.preparationStatus !== 'always_available') return false;
        } else if (filters.preparation === 'unprepared') {
          if (spell.level === 0 || spell.preparationStatus !== 'unprepared') return false;
        } else if (filters.preparation === 'favorites') {
          if (!spell.isFavorite) return false;
        } else if (filters.preparation === 'rituals') {
          if (!spell.meta?.ritual) return false;
        } else if (filters.preparation === 'concentration') {
          const isConc = spell.duration?.some((d) => d.concentration);
          if (!isConc) return false;
        }
      }

      // Casting time filter
      if (filters.castingTime !== 'all') {
        const unit = filters.castingTime.toLowerCase();
        const hasTime = spell.time?.some((t) => t.unit.toLowerCase().includes(unit));
        if (!hasTime) return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'level-asc') {
        if (a.level !== b.level) return a.level - b.level;
        return a.name.localeCompare(b.name);
      }
      if (filters.sortBy === 'level-desc') {
        if (a.level !== b.level) return b.level - a.level;
        return a.name.localeCompare(b.name);
      }
      if (filters.sortBy === 'name-asc') {
        return a.name.localeCompare(b.name);
      }
      if (filters.sortBy === 'name-desc') {
        return b.name.localeCompare(a.name);
      }
      if (filters.sortBy === 'school') {
        return getSchoolInfo(a.school).name.localeCompare(getSchoolInfo(b.school).name);
      }
      return 0;
    });
  }, [spells, filters]);

  // Group spells by Level for display
  const groupedSpells = useMemo(() => {
    const groups: { level: number; label: string; spells: Spell[] }[] = [];
    const levelMap = new Map<number, Spell[]>();

    filteredSpells.forEach((s) => {
      if (!levelMap.has(s.level)) {
        levelMap.set(s.level, []);
      }
      levelMap.get(s.level)!.push(s);
    });

    // Sort level keys
    const sortedLevels = Array.from(levelMap.keys()).sort((a, b) => a - b);
    sortedLevels.forEach((lvl) => {
      groups.push({
        level: lvl,
        label: formatSpellLevel(lvl),
        spells: levelMap.get(lvl) || [],
      });
    });

    return groups;
  }, [filteredSpells]);

  // Quick Cast handler
  const handleQuickCast = (spell: Spell) => {
    if (spell.level === 0) {
      // Cantrip: cast immediately
      const res = castSpell(spell, 0);
      showToast(res.message, 'success');
    } else {
      // Leveled spell: open casting dialog to choose slot level / upcasting
      setCastingSpell(spell);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-zinc-100 flex flex-col font-sans selection:bg-[#c5a059] selection:text-black">
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div
            className={`px-4 py-2 rounded-xl shadow-2xl border text-xs sm:text-sm font-bold flex items-center gap-2 backdrop-blur-md ${
              toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-600 text-rose-200'
                : 'bg-[#161616] border-[#c5a059] text-[#c5a059] shadow-black/80'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-[#c5a059]" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Top Sticky Navigation */}
      <Navbar
        profile={profile}
        slots={slots}
        onOpenCharacter={() => setActiveModal('character')}
        onOpenImport={() => setActiveModal('import')}
        onOpenAddSpell={() => setActiveModal('addSpell')}
        onOpenLongRest={() => setActiveModal('longRest')}
        onOpenInstall={() => setActiveModal('install')}
        isStandalone={isStandalone}
        totalPrepared={totalPreparedCount}
        maxPrepared={maxPreparedLimit}
      />

      {/* Interactive Spell Slot Tracker */}
      <SlotTracker
        slots={slots}
        onAdjustSlot={adjustSlot}
        onTakeLongRest={() => {
          takeLongRest();
          showToast('Long Rest taken! All spell slots replenished.', 'success');
        }}
        onTakeShortRest={() => {
          takeShortRest();
          showToast('Short Rest taken! Pact slots replenished.', 'success');
        }}
        onConfigureSlots={() => setActiveModal('character')}
        activeConcentration={activeConcentration}
        onStopConcentration={() => {
          stopConcentration();
          showToast('Concentration ended.', 'info');
        }}
        onSelectConcentrationSpell={(spellId) => {
          const found = spells.find((s) => s.id === spellId);
          if (found) {
            setDetailSpell(found);
          }
        }}
      />

      {/* Filter and Search Bar */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        spells={spells}
      />

      {/* Main Spellbook Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 py-4 sm:px-6 space-y-6 pb-24">
        {/* Active Filter Info Banner if filtered */}
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-2 flex-wrap">
            <span>
              Showing <strong className="text-zinc-200 font-mono">{filteredSpells.length}</strong> of{' '}
              <strong className="text-zinc-200 font-mono">{spells.length}</strong> spells
            </span>
            {filters.preparation !== 'all' && (
              <span className="px-2 py-0.5 rounded-full bg-zinc-900 border border-[#c5a059]/40 text-[#c5a059] text-[11px] capitalize font-mono">
                Status: {filters.preparation.replace('_', ' ')}
              </span>
            )}
            {filters.level !== 'all' && (
              <span className="px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-300 text-[11px] font-mono">
                {filters.level === 0 ? 'Cantrips' : `Level ${filters.level}`}
              </span>
            )}
            {filters.school !== 'all' && (
              <span className="px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-300 text-[11px]">
                {getSchoolInfo(filters.school).name}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveModal('addSpell')}
              className="text-[#c5a059] hover:text-[#dfc384] font-semibold text-xs flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Spell</span>
            </button>
          </div>
        </div>

        {/* Grouped Spell Cards Grid */}
        {groupedSpells.length > 0 ? (
          <div className="space-y-7">
            {groupedSpells.map((group) => {
              const groupLevel = group.level;
              const slotInfo =
                groupLevel > 0
                  ? (slots[groupLevel as keyof SpellSlotState] as { max: number; current: number })
                  : null;

              return (
                <section key={group.level} className="space-y-3">
                  {/* Level Section Header */}
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-serif font-bold text-[#c5a059] tracking-wide flex items-center gap-2">
                        <span>{group.label}</span>
                      </h2>
                      <span className="text-xs text-zinc-500 font-mono">
                        ({group.spells.length} {group.spells.length === 1 ? 'spell' : 'spells'})
                      </span>
                    </div>

                    {/* Quick Slot Count indicator for this level */}
                    {slotInfo && slotInfo.max > 0 && (
                      <div className="flex items-center gap-1.5 text-xs font-mono bg-zinc-900 px-2.5 py-0.5 rounded-lg border border-zinc-800">
                        <span className="text-zinc-400">Slots:</span>
                        <span
                          className={`font-bold ${
                            slotInfo.current > 0 ? 'text-[#c5a059]' : 'text-rose-400'
                          }`}
                        >
                          {slotInfo.current}/{slotInfo.max}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {group.spells.map((spell) => (
                      <SpellCard
                        key={spell.id}
                        spell={spell}
                        onSelect={(s) => setDetailSpell(s)}
                        onTogglePrep={(id) => {
                          togglePreparation(id);
                          const updated = spells.find((s) => s.id === id);
                          if (updated) {
                            showToast(`Toggled preparation status for ${updated.name}`, 'info');
                          }
                        }}
                        onSetPrep={(id, status) => setPreparationStatus(id, status)}
                        onToggleFavorite={(id) => toggleFavorite(id)}
                        onQuickCast={handleQuickCast}
                        isConcentrating={activeConcentration?.spellId === spell.id}
                        onStopConcentration={() => {
                          stopConcentration();
                          showToast('Concentration ended.', 'info');
                        }}
                        hasSlotsAvailable={
                          spell.level === 0 ||
                          Boolean(
                            slots[spell.level as keyof SpellSlotState] &&
                              (slots[spell.level as keyof SpellSlotState] as any).current > 0
                          )
                        }
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        ) : spells.length === 0 ? (
          /* Blank Spellbook Initial State */
          <div className="text-center py-16 px-4 bg-[#121212] border border-zinc-800 rounded-2xl max-w-lg mx-auto space-y-4 shadow-xl">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-zinc-900 border border-[#c5a059]/40 flex items-center justify-center text-[#c5a059] shadow-lg shadow-black">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-zinc-100">Your Spellbook is Blank</h3>
              <p className="text-xs text-zinc-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
                Start building your spell list by importing your 5e spells (JSON or 5etools format) or creating custom homebrew spells.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
              <button
                onClick={() => setActiveModal('import')}
                className="px-4 py-2.5 rounded-lg bg-[#c5a059] hover:bg-[#d4af37] text-black text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg active:scale-95"
              >
                <Upload className="w-3.5 h-3.5 fill-black text-black" />
                <span>Import Spells (JSON)</span>
              </button>
              <button
                onClick={() => setActiveModal('addSpell')}
                className="px-4 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-[#c5a059] text-xs font-semibold flex items-center gap-1.5 transition-all border border-[#c5a059]/40"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Custom Spell</span>
              </button>
              <button
                onClick={() => {
                  resetToDefaultSample();
                  showToast('Loaded 5e starter spells!', 'success');
                }}
                className="w-full text-zinc-500 hover:text-zinc-300 text-[11px] underline underline-offset-4 pt-1 transition-colors"
              >
                or load 5e sample spells to preview
              </button>
            </div>
          </div>
        ) : (
          /* Filtered Out Empty State */
          <div className="text-center py-16 px-4 bg-[#121212] border border-zinc-800 rounded-2xl max-w-lg mx-auto space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 shadow-lg">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-zinc-200">No spells match your filters</h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                Try adjusting your search keyword, magic school, preparation status, or level filters.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-zinc-800"
              >
                <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
                <span>Reset Filters</span>
              </button>
              <button
                onClick={() => setActiveModal('import')}
                className="px-4 py-2 rounded-lg bg-[#c5a059] hover:bg-[#d4af37] text-black text-xs font-bold flex items-center gap-1.5 transition-colors shadow-lg"
              >
                <Upload className="w-3.5 h-3.5 fill-black text-black" />
                <span>Import Spells</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Floating Mobile Bottom Rest Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-[#121212]/95 backdrop-blur-md border-t border-zinc-800 p-2 sm:hidden flex items-center justify-between gap-1.5 shadow-2xl">
        <button
          onClick={() => setActiveModal('longRest')}
          className="flex-1 py-2 px-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-[#c5a059]/40 text-[#c5a059] text-xs font-bold flex items-center justify-center gap-1"
        >
          <Moon className="w-3.5 h-3.5 text-[#c5a059]" />
          <span>Long Rest</span>
        </button>

        <button
          onClick={() => setActiveModal('import')}
          className="py-2 px-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-semibold flex items-center gap-1"
          title="Import / Export"
        >
          <Upload className="w-3.5 h-3.5 text-zinc-400" />
          <span>Import</span>
        </button>

        <button
          onClick={() => setActiveModal('install')}
          className={`py-2 px-2.5 rounded-lg border text-xs font-semibold flex items-center gap-1 ${
            isStandalone
              ? 'bg-zinc-900 border-zinc-800 text-zinc-500'
              : 'bg-zinc-900 border-[#c5a059]/50 text-[#c5a059]'
          }`}
          title="Install App"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{isStandalone ? 'App' : 'Install'}</span>
        </button>

        <button
          onClick={() => setActiveModal('addSpell')}
          className="py-2 px-3 rounded-lg bg-[#c5a059] hover:bg-[#d4af37] text-black text-xs font-bold shadow-lg flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5 text-black" />
          <span>Add</span>
        </button>
      </div>

      {/* Modals */}
      {/* 0. PWA Install Modal */}
      <InstallModal
        isOpen={activeModal === 'install'}
        onClose={() => setActiveModal(null)}
        deferredPrompt={deferredPrompt}
        onInstalled={() => {
          setIsStandalone(true);
          setDeferredPrompt(null);
          showToast('App installed to your device!', 'success');
        }}
      />
      {/* 1. Character & Slot Preset Modal */}
      {activeModal === 'character' && (
        <CharacterModal
          profile={profile}
          slots={slots}
          onClose={() => setActiveModal(null)}
          onUpdateProfile={(p) => {
            updateProfile(p);
            showToast('Character profile updated!', 'success');
          }}
          onApplyPresetSlots={(cls, lvl) => {
            applyPresetSlots(cls, lvl);
            showToast(`Applied ${cls} Level ${lvl} spell slot table!`, 'success');
          }}
          onSetSlotMax={setSlotMax}
        />
      )}

      {/* 2. Import / Export JSON Modal */}
      {activeModal === 'import' && (
        <ImportModal
          onClose={() => setActiveModal(null)}
          onImport={(json, mode) => {
            const res = importSpells(json, mode);
            if (res.count > 0) {
              showToast(`Imported ${res.count} spells successfully!`, 'success');
            }
            return res;
          }}
          currentSpells={spells}
        />
      )}

      {/* 3. Add Custom Spell Modal */}
      {activeModal === 'addSpell' && (
        <AddSpellModal
          onClose={() => setActiveModal(null)}
          onAddSpell={(newSpellData) => {
            const created = addSpell(newSpellData);
            showToast(`Created spell: ${created.name}!`, 'success');
          }}
        />
      )}

      {/* 4. Long Rest Modal */}
      {activeModal === 'longRest' && (
        <LongRestModal
          slots={slots}
          onClose={() => setActiveModal(null)}
          onConfirmRest={() => {
            takeLongRest();
            showToast('Long Rest completed! All spell slots replenished.', 'success');
          }}
        />
      )}

      {/* 5. Cast Spell Slot Modal */}
      {castingSpell && (
        <CastSpellModal
          spell={castingSpell}
          slots={slots}
          onClose={() => setCastingSpell(null)}
          activeConcentration={activeConcentration}
          onCast={(spell, slotLevel) => {
            const res = castSpell(spell, slotLevel);
            if (res.success) {
              showToast(res.message, 'success');
            }
            return res;
          }}
          onCastPact={(spell) => {
            const res = castPactSlot(spell);
            if (res.success) {
              showToast(res.message, 'success');
            }
            return res;
          }}
        />
      )}

      {/* 6. Spell Detail Sheet Modal */}
      {detailSpell && (
        <SpellDetailModal
          spell={detailSpell}
          onClose={() => setDetailSpell(null)}
          onTogglePrep={(id) => togglePreparation(id)}
          onSetPrep={(id, status) => setPreparationStatus(id, status)}
          onToggleFavorite={(id) => toggleFavorite(id)}
          onCast={(spell) => {
            setDetailSpell(null);
            handleQuickCast(spell);
          }}
          onDeleteSpell={(id) => {
            deleteSpell(id);
            showToast('Spell removed from spellbook', 'info');
          }}
          spellSaveDC={spellSaveDC}
          spellAttackMod={spellAttackMod}
          isConcentrating={activeConcentration?.spellId === detailSpell.id}
          onStartConcentration={(spell) => {
            startConcentration(spell);
            showToast(`Now concentrating on ${spell.name}`, 'info');
          }}
          onStopConcentration={() => {
            stopConcentration();
            showToast('Concentration ended.', 'info');
          }}
        />
      )}
    </div>
  );
}
