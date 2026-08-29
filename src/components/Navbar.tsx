import { BookOpen, Download, Moon, Plus, Sparkles, Smartphone, Upload, User } from 'lucide-react';
import React from 'react';
import { CharacterProfile, SpellSlotState } from '../types';
import { getAbilityModifier } from '../utils/spellSlotPresets';

interface NavbarProps {
  profile: CharacterProfile;
  slots: SpellSlotState;
  onOpenCharacter: () => void;
  onOpenImport: () => void;
  onOpenAddSpell: () => void;
  onOpenLongRest: () => void;
  onOpenInstall: () => void;
  isStandalone?: boolean;
  totalPrepared: number;
  maxPrepared: number | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  slots,
  onOpenCharacter,
  onOpenImport,
  onOpenAddSpell,
  onOpenLongRest,
  onOpenInstall,
  isStandalone = false,
  totalPrepared,
  maxPrepared,
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
    <header className="sticky top-0 z-30 bg-[#161616] border-b border-zinc-800 px-3 py-3 sm:px-6 shadow-2xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: App Title & Character Quick Info */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          <div className="relative flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-zinc-900 border border-[#c5a059]/40 flex items-center justify-center shadow-lg shadow-black">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-[#c5a059]" />
            <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#c5a059] border border-[#161616]" />
          </div>

          <div className="min-w-0 flex-1">
            <button
              onClick={onOpenCharacter}
              className="text-left group block focus:outline-none max-w-full"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <h1 className="text-sm sm:text-lg md:text-xl font-serif text-[#c5a059] tracking-wide group-hover:text-[#d4af37] transition-colors truncate">
                  {profile.name || 'My Character'}
                </h1>
                <span className="text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono hidden sm:inline flex-shrink-0">
                  5e
                </span>
              </div>
              <p className="text-[10px] sm:text-xs uppercase tracking-widest text-zinc-500 font-semibold truncate">
                Level {profile.level} {profile.characterClass}
              </p>
            </button>
          </div>
        </div>

        {/* Center: Stat Badges (DC, Attack, Prepared Count) */}
        <div className="hidden md:flex items-center gap-2 flex-shrink-0">
          {/* Spell Save DC */}
          <button
            onClick={onOpenCharacter}
            className="bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-[#c5a059]/40 rounded-md px-3 py-1 flex items-center gap-2 shadow-sm transition-all text-left group"
            title={`Spell Save DC: ${spellSaveDC} (Click to adjust stats or item modifiers)`}
          >
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 group-hover:text-zinc-400 font-semibold">Save DC</span>
            <div className="flex items-center gap-1">
              <span className="text-sm font-bold text-[#c5a059] font-mono">{spellSaveDC}</span>
              {dcBonus !== 0 && (
                <span className="text-[9px] font-mono font-bold text-amber-400/90">
                  ({dcBonus > 0 ? `+${dcBonus}` : dcBonus})
                </span>
              )}
            </div>
          </button>

          {/* Spell Attack */}
          <button
            onClick={onOpenCharacter}
            className="bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-amber-400/40 rounded-md px-3 py-1 flex items-center gap-2 shadow-sm transition-all text-left group"
            title={`Spell Attack Bonus: ${spellAttackMod >= 0 ? `+${spellAttackMod}` : spellAttackMod} (Click to adjust stats or item modifiers)`}
          >
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 group-hover:text-zinc-400 font-semibold">Atk Bonus</span>
            <div className="flex items-center gap-1">
              <span className="text-sm font-bold text-amber-300 font-mono">
                {spellAttackMod >= 0 ? `+${spellAttackMod}` : spellAttackMod}
              </span>
              {attackBonus !== 0 && (
                <span className="text-[9px] font-mono font-bold text-amber-400/90">
                  ({attackBonus > 0 ? `+${attackBonus}` : attackBonus})
                </span>
              )}
            </div>
          </button>

          {/* Prepared limit */}
          <button
            onClick={onOpenCharacter}
            className="bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 rounded-md px-3 py-1 flex items-center gap-2 shadow-sm transition-all text-left"
            title="Prepared Spells Count (Click to adjust class & max prepared limits)"
          >
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">Prepared</span>
            <span className="text-sm font-bold text-zinc-100 font-mono">
              <span className="text-[#c5a059]">{totalPrepared}</span>
              {maxPrepared !== null ? <span className="text-zinc-600 font-normal">/{maxPrepared}</span> : ''}
            </span>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Long Rest Button in signature crimson aesthetic - Compact on mobile */}
          <button
            onClick={onOpenLongRest}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded bg-[#8b0000] hover:bg-[#a31a1a] border border-[#a31a1a] text-white text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold transition-all active:scale-95 shadow-md shadow-red-950/40"
            title="Take a Long Rest to restore all spell slots"
          >
            <Moon className="w-3.5 h-3.5 text-red-200 flex-shrink-0" />
            <span className="hidden sm:inline">Long Rest</span>
            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-black/40 text-red-200">
              {remainingSlots}/{maxSlots}
            </span>
          </button>

          {/* Import JSON - Hidden on mobile because it is in bottom bar */}
          <button
            onClick={onOpenImport}
            className="hidden sm:flex p-1.5 sm:px-2.5 sm:py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs sm:text-sm font-medium transition-colors items-center gap-1.5"
            title="Import Spells from JSON"
          >
            <Upload className="w-4 h-4 text-[#c5a059]" />
            <span className="text-xs">Import</span>
          </button>

          {/* Add Spell - Hidden on mobile because it is in bottom bar */}
          <button
            onClick={onOpenAddSpell}
            className="hidden sm:flex p-1.5 sm:px-2.5 sm:py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-[#c5a059]/40 text-[#c5a059] hover:text-[#d4af37] text-xs sm:text-sm font-medium transition-colors items-center gap-1.5"
            title="Add Custom Spell"
          >
            <Plus className="w-4 h-4 text-[#c5a059]" />
            <span className="text-xs">Add</span>
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
            className={`hidden sm:flex p-1.5 sm:px-2.5 sm:py-1.5 rounded-md border text-xs font-semibold transition-all items-center gap-1.5 ${
              isStandalone
                ? 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                : 'bg-zinc-900 hover:bg-zinc-800 border-[#c5a059]/60 text-[#c5a059] hover:text-[#dfc384] shadow-sm'
            }`}
            title={isStandalone ? 'App is installed on your device' : 'Install App to Home Screen for Offline Access'}
          >
            <Download className="w-4 h-4" />
            <span className="text-xs">{isStandalone ? 'Installed' : 'Install'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Stat Bar */}
      <div className="md:hidden flex items-center justify-between text-[11px] pt-2 mt-2 border-t border-zinc-800 text-zinc-400">
        <div className="flex items-center gap-2">
          <span>Save DC: <strong className="text-[#c5a059] font-mono">{spellSaveDC}</strong></span>
          <span className="text-zinc-700">•</span>
          <span>Atk: <strong className="text-amber-300 font-mono">+{spellAttackMod}</strong></span>
        </div>
        <div>
          <span>Prepared: <strong className="text-[#c5a059] font-mono">{totalPrepared}</strong>{maxPrepared !== null ? <span className="text-zinc-600 font-normal">/{maxPrepared}</span> : ''}</span>
        </div>
      </div>
    </header>
  );
};
