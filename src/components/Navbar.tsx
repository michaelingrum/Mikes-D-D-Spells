import {
  BookOpen,
  ChevronDown,
  Database,
  Download,
  Layers,
  Moon,
  Plus,
  RotateCcw,
  Sparkles,
  Upload,
  User,
  Users,
} from 'lucide-react';
import React from 'react';
import { CharacterProfile, SpellSlotState } from '../types';
import { getAbilityModifier } from '../utils/spellSlotPresets';

interface NavbarProps {
  profile: CharacterProfile;
  slots: SpellSlotState;
  featuresCount?: number;
  charactersCount?: number;
  onOpenCharacter: () => void;
  onOpenCharacterSwitcher?: () => void;
  onOpenFeatures: () => void;
  onOpenImport: () => void;
  onOpenAddSpell: () => void;
  onOpenLongRest: () => void;
  onOpenShortRest: () => void;
  onOpenInstall: () => void;
  isStandalone?: boolean;
  totalPrepared: number;
  maxPrepared: number | null;
  preparedCantripsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  slots,
  featuresCount = 0,
  charactersCount = 1,
  onOpenCharacter,
  onOpenCharacterSwitcher,
  onOpenFeatures,
  onOpenImport,
  onOpenAddSpell,
  onOpenLongRest,
  onOpenShortRest,
  onOpenInstall,
  isStandalone = false,
  totalPrepared,
  maxPrepared,
  preparedCantripsCount = 0,
}) => {
  const abilityMod = getAbilityModifier(profile.abilityScoreValue);
  const dcBonus = profile.dcBonus || 0;
  const attackBonus = profile.attackBonus || 0;
  const spellSaveDC = 8 + profile.proficiencyBonus + abilityMod + dcBonus;
  const spellAttackMod = profile.proficiencyBonus + abilityMod + attackBonus;

  // Calculate total remaining slots
  let remainingSlots = 0;
  let maxSlots = 0;
  for (let i = 1; i <= 9; i++) {
    const s = slots[i as keyof SpellSlotState] as { max: number; current: number };
    if (s && s.max > 0) {
      remainingSlots += s.current;
      maxSlots += s.max;
    }
  }
  if (slots.pact && slots.pact.max > 0) {
    remainingSlots += slots.pact.current;
    maxSlots += slots.pact.max;
  }

  return (
    <header className="sticky top-0 z-30 bg-[#161616] border-b border-zinc-800 px-3 py-2.5 sm:px-6 shadow-2xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Character Info, Active Roster Trigger, and Core Combat Stats */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          {/* Spellbook Crest Icon */}
          <div className="relative flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-zinc-900 border border-[#c5a059]/40 flex items-center justify-center shadow-lg shadow-black">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-[#c5a059]" />
            <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#c5a059] border border-[#161616]" />
          </div>

          <div className="min-w-0 flex-1">
            {/* Top row: Character Name + 5e badge + Roster switch button */}
            <div className="flex items-center gap-1.5 min-w-0">
              <button
                onClick={onOpenCharacter}
                className="text-left group flex items-center gap-1.5 focus:outline-none min-w-0"
                title="Open Character & Slot Settings"
              >
                <h1 className="text-sm sm:text-base md:text-lg font-serif font-bold text-[#c5a059] tracking-wide group-hover:text-[#d4af37] transition-colors truncate">
                  {profile.name || 'My Character'}
                </h1>
                <span className="text-[9px] uppercase tracking-widest px-1.5 py-0.2 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono hidden sm:inline flex-shrink-0">
                  5e
                </span>
              </button>

              {onOpenCharacterSwitcher && (
                <button
                  onClick={onOpenCharacterSwitcher}
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-[#c5a059]/50 text-zinc-400 hover:text-[#dfc384] transition-all flex-shrink-0 shadow-sm"
                  title="Switch Active Character or Manage Roster"
                >
                  <Users className="w-3.5 h-3.5 text-[#c5a059]" />
                  {charactersCount > 1 && (
                    <span className="text-[10px] font-mono font-bold text-[#dfc384]">
                      {charactersCount}
                    </span>
                  )}
                  <ChevronDown className="w-3 h-3 text-zinc-500" />
                </button>
              )}
            </div>

            {/* Subtitle row: Class/Level + Save DC + Attack Bonus + Prepared Spells */}
            <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5 flex-wrap">
              <button
                onClick={onOpenCharacter}
                className="text-zinc-400 hover:text-zinc-200 transition-colors uppercase tracking-wider font-semibold text-[10px] sm:text-[11px] truncate"
                title="View Character Details"
              >
                Lvl {profile.level} {profile.characterClass}
              </button>

              <span className="text-zinc-700 hidden xs:inline">•</span>

              {/* Spell Save DC Badge */}
              <button
                onClick={onOpenCharacter}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 hover:border-[#c5a059]/50 transition-colors group/dc shadow-xs"
                title={`Spell Save DC: ${spellSaveDC} (Click to view or adjust stats/magic items)`}
              >
                <span className="text-[9px] uppercase tracking-wider text-zinc-500 group-hover/dc:text-zinc-400 font-semibold font-mono">
                  DC
                </span>
                <span className="font-mono font-bold text-[#c5a059] text-xs">
                  {spellSaveDC}
                </span>
                {dcBonus !== 0 && (
                  <span className="text-[9px] font-mono font-bold text-amber-400/90">
                    ({dcBonus > 0 ? `+${dcBonus}` : dcBonus})
                  </span>
                )}
              </button>

              <span className="text-zinc-700 hidden xs:inline">•</span>

              {/* Spell Attack Modifier Badge */}
              <button
                onClick={onOpenCharacter}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 hover:border-amber-400/50 transition-colors group/atk shadow-xs"
                title={`Spell Attack Bonus: +${spellAttackMod} (Click to view or adjust stats/magic items)`}
              >
                <span className="text-[9px] uppercase tracking-wider text-zinc-500 group-hover/atk:text-zinc-400 font-semibold font-mono">
                  Atk
                </span>
                <span className="font-mono font-bold text-amber-300 text-xs">
                  +{spellAttackMod}
                </span>
                {attackBonus !== 0 && (
                  <span className="text-[9px] font-mono font-bold text-amber-400/90">
                    ({attackBonus > 0 ? `+${attackBonus}` : attackBonus})
                  </span>
                )}
              </button>

              <span className="text-zinc-700 hidden sm:inline">•</span>

              {/* Prepared Spells Badge */}
              <button
                onClick={onOpenCharacter}
                className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 transition-colors group/prep shadow-xs"
                title={`Prepared Spells: ${totalPrepared}${maxPrepared !== null ? `/${maxPrepared}` : ''}${preparedCantripsCount > 0 ? ` (+${preparedCantripsCount} prepared cantrip)` : ''}`}
              >
                <span className="text-[9px] uppercase tracking-wider text-zinc-500 group-hover/prep:text-zinc-400 font-semibold font-mono">
                  Prep
                </span>
                <span className="font-mono font-bold text-[#c5a059] text-xs">
                  {totalPrepared}
                </span>
                {maxPrepared !== null && (
                  <span className="text-zinc-600 font-mono text-[11px]">/{maxPrepared}</span>
                )}
                {profile.enableDailyCantrips !== false && preparedCantripsCount > 0 && (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-[#c5a059]/20 text-[#c5a059] font-mono font-semibold ml-0.5">
                    +{preparedCantripsCount}c
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Action Buttons (Responsive & Clean) */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Short Rest Button */}
          <button
            onClick={onOpenShortRest}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-amber-600/40 hover:border-amber-500 text-amber-300 hover:text-amber-200 text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold transition-all active:scale-95 shadow-sm"
            title="Take a Short Rest to regain Pact slots & short-rest features (1 hour)"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span className="hidden md:inline">Short Rest</span>
          </button>

          {/* Long Rest Button in signature crimson aesthetic */}
          <button
            onClick={onOpenLongRest}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded bg-[#8b0000] hover:bg-[#a31a1a] border border-[#a31a1a] text-white text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold transition-all active:scale-95 shadow-md shadow-red-950/40"
            title="Take a Long Rest to restore all spell slots & daily features (8 hours)"
          >
            <Moon className="w-3.5 h-3.5 text-red-200 flex-shrink-0" />
            <span className="hidden sm:inline">Long Rest</span>
            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-black/40 text-red-200">
              {remainingSlots}/{maxSlots}
            </span>
          </button>

          {/* Features Setup Button */}
          {profile.enableFeaturesTracker !== false && (
            <button
              onClick={onOpenFeatures}
              className="flex p-1.5 sm:px-2.5 sm:py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-[#c5a059]/40 text-zinc-300 hover:text-white text-xs sm:text-sm font-medium transition-colors items-center gap-1.5"
              title="Manage Features & Limited-Use Trackers"
            >
              <Layers className="w-4 h-4 text-[#dfc384]" />
              <span className="hidden lg:inline text-xs">Features</span>
              {featuresCount > 0 && (
                <span className="text-[10px] font-mono px-1 rounded bg-zinc-800 text-[#dfc384]">
                  {featuresCount}
                </span>
              )}
            </button>
          )}

          {/* Character Roster / Switcher */}
          {onOpenCharacterSwitcher && (
            <button
              onClick={onOpenCharacterSwitcher}
              className="flex p-1.5 sm:px-2.5 sm:py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-[#c5a059]/40 text-zinc-300 hover:text-white text-xs sm:text-sm font-medium transition-colors items-center gap-1.5"
              title="Characters Roster & Switcher"
            >
              <Users className="w-4 h-4 text-[#c5a059]" />
              <span className="hidden lg:inline text-xs">Roster</span>
              {charactersCount > 1 && (
                <span className="text-[10px] font-mono px-1 rounded bg-zinc-800 text-[#dfc384]">
                  {charactersCount}
                </span>
              )}
            </button>
          )}

          {/* Full Database Backup & Spell Import */}
          <button
            onClick={onOpenImport}
            className="hidden sm:flex p-1.5 sm:px-2.5 sm:py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs sm:text-sm font-medium transition-colors items-center gap-1.5"
            title="Backup Database or Import Spells"
          >
            <Database className="w-4 h-4 text-[#c5a059]" />
            <span className="hidden xl:inline text-xs">Backup / Import</span>
          </button>

          {/* Add Spell */}
          <button
            onClick={onOpenAddSpell}
            className="hidden sm:flex p-1.5 sm:px-2.5 sm:py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-[#c5a059]/40 text-[#c5a059] hover:text-[#d4af37] text-xs sm:text-sm font-medium transition-colors items-center gap-1.5"
            title="Add Custom Spell"
          >
            <Plus className="w-4 h-4 text-[#c5a059]" />
            <span className="hidden xl:inline text-xs">Add</span>
          </button>

          {/* Character Config */}
          <button
            onClick={onOpenCharacter}
            className="p-1.5 sm:p-2 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Character and Slot Settings"
          >
            <User className="w-4 h-4" />
          </button>

          {/* PWA Install Button */}
          <button
            onClick={onOpenInstall}
            className={`hidden md:flex p-1.5 sm:px-2 sm:py-1.5 rounded-md border text-xs font-semibold transition-all items-center gap-1 ${
              isStandalone
                ? 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                : 'bg-zinc-900 hover:bg-zinc-800 border-[#c5a059]/60 text-[#c5a059] hover:text-[#dfc384] shadow-sm'
            }`}
            title={isStandalone ? 'App is installed on your device' : 'Install App to Home Screen for Offline Access'}
          >
            <Download className="w-4 h-4" />
            <span className="hidden xl:inline text-xs">{isStandalone ? 'Installed' : 'Install'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
