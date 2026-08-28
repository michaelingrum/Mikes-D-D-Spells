import { BookOpen, Moon, Plus, Sparkles, Upload, User } from 'lucide-react';
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
  totalPrepared,
  maxPrepared,
}) => {
  const abilityMod = getAbilityModifier(profile.abilityScoreValue);
  const spellSaveDC = 8 + profile.proficiencyBonus + abilityMod;
  const spellAttackMod = profile.proficiencyBonus + abilityMod;

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
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-zinc-900 border border-[#c5a059]/40 flex items-center justify-center shadow-lg shadow-black">
            <BookOpen className="w-5 h-5 text-[#c5a059]" />
            <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-[#c5a059] border border-[#161616]" />
          </div>

          <div className="min-w-0">
            <button
              onClick={onOpenCharacter}
              className="text-left group block focus:outline-none"
            >
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-xl font-serif text-[#c5a059] tracking-wide group-hover:text-[#d4af37] transition-colors truncate">
                  {profile.name || 'Thalric Moonwhisper'}
                </h1>
                <span className="text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono hidden sm:inline">
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
        <div className="hidden md:flex items-center gap-2">
          {/* Spell Save DC */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-md px-3 py-1 flex items-center gap-2 shadow-sm">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">Save DC</span>
            <span className="text-sm font-bold text-[#c5a059] font-mono">{spellSaveDC}</span>
          </div>

          {/* Spell Attack */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-md px-3 py-1 flex items-center gap-2 shadow-sm">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">Atk Bonus</span>
            <span className="text-sm font-bold text-amber-300 font-mono">+{spellAttackMod}</span>
          </div>

          {/* Prepared limit */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-md px-3 py-1 flex items-center gap-2 shadow-sm">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">Prepared</span>
            <span className="text-sm font-bold text-zinc-100 font-mono">
              <span className="text-[#c5a059]">{totalPrepared}</span>
              {maxPrepared !== null ? <span className="text-zinc-600 font-normal">/{maxPrepared}</span> : ''}
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Long Rest Button in signature crimson aesthetic */}
          <button
            onClick={onOpenLongRest}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#8b0000] hover:bg-[#a31a1a] border border-[#a31a1a] text-white text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold transition-all active:scale-95 shadow-md shadow-red-950/40"
            title="Take a Long Rest to restore all spell slots"
          >
            <Moon className="w-3.5 h-3.5 text-red-200" />
            <span>Long Rest</span>
            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-black/40 text-red-200 ml-0.5">
              {remainingSlots}/{maxSlots}
            </span>
          </button>

          {/* Import JSON */}
          <button
            onClick={onOpenImport}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5"
            title="Import Spells from JSON"
          >
            <Upload className="w-4 h-4 text-[#c5a059]" />
            <span className="hidden sm:inline text-xs">Import</span>
          </button>

          {/* Add Spell */}
          <button
            onClick={onOpenAddSpell}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-[#c5a059]/40 text-[#c5a059] hover:text-[#d4af37] text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5"
            title="Add Custom Spell"
          >
            <Plus className="w-4 h-4 text-[#c5a059]" />
            <span className="hidden sm:inline text-xs">Add</span>
          </button>

          {/* Character Config */}
          <button
            onClick={onOpenCharacter}
            className="p-1.5 sm:p-2 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Character and Slot Settings"
          >
            <User className="w-4 h-4" />
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
