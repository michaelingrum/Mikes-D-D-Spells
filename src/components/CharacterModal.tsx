import { Check, Flame, RefreshCw, Sparkles, User, X } from 'lucide-react';
import React, { useState } from 'react';
import { AbilityScore, CasterClass, CharacterProfile, SpellSlotState } from '../types';
import {
  calculateMaxPrepared,
  getAbilityModifier,
  getDefaultSpellSlotsForClass,
  getProficiencyBonus,
} from '../utils/spellSlotPresets';

interface CharacterModalProps {
  profile: CharacterProfile;
  slots: SpellSlotState;
  onClose: () => void;
  onUpdateProfile: (profile: Partial<CharacterProfile>) => void;
  onApplyPresetSlots: (casterClass: CasterClass, level: number) => void;
  onSetSlotMax: (level: number | 'pact', max: number) => void;
}

const CLASSES: CasterClass[] = [
  'Wizard',
  'Sorcerer',
  'Cleric',
  'Druid',
  'Bard',
  'Warlock',
  'Paladin',
  'Ranger',
  'Artificer',
  'Eldritch Knight',
  'Arcane Trickster',
  'Custom',
];

export const CharacterModal: React.FC<CharacterModalProps> = ({
  profile,
  slots,
  onClose,
  onUpdateProfile,
  onApplyPresetSlots,
  onSetSlotMax,
}) => {
  const [name, setName] = useState(profile.name);
  const [characterClass, setCharacterClass] = useState<CasterClass>(profile.characterClass);
  const [level, setLevel] = useState<number>(profile.level);
  const [ability, setAbility] = useState<AbilityScore>(profile.spellcastingAbility);
  const [abilityScore, setAbilityScore] = useState<number>(profile.abilityScoreValue);
  const [pactSlotCount, setPactSlotCount] = useState<number>(slots.pact?.max || 2);
  const [pactSlotLevel, setPactSlotLevel] = useState<number>(slots.pact?.level || 5);

  const mod = getAbilityModifier(abilityScore);
  const prof = getProficiencyBonus(level);
  const dc = 8 + prof + mod;
  const atk = prof + mod;
  const maxPrepared = calculateMaxPrepared(characterClass, level, abilityScore);

  const handleSave = () => {
    onUpdateProfile({
      name,
      characterClass,
      level,
      spellcastingAbility: ability,
      abilityScoreValue: abilityScore,
      proficiencyBonus: prof,
    });
    onClose();
  };

  const handleApplyPreset = () => {
    onApplyPresetSlots(characterClass, level);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg max-h-[92vh] bg-[#121212] border border-zinc-800 rounded-2xl p-5 shadow-2xl flex flex-col overflow-hidden">
        {/* Top Gold Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#c5a059] via-[#dfc384] to-[#c5a059]" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-[#c5a059]/40 flex items-center justify-center">
              <User className="w-5 h-5 text-[#c5a059]" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-[#c5a059]">Character & Spell Slot Config</h2>
              <p className="text-xs text-zinc-400">
                Configure your class, level, ability scores, and spell slot maximums
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto space-y-4 pr-1">
          {/* Character Name */}
          <div>
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1 font-mono">
              Character Name:
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mordenkainen"
              className="w-full px-3 py-2 bg-[#161616] border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-[#c5a059]"
            />
          </div>

          {/* Class & Level */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1 font-mono">
                Class:
              </label>
              <select
                value={characterClass}
                onChange={(e) => {
                  const newClass = e.target.value as CasterClass;
                  setCharacterClass(newClass);
                  // auto suggest standard ability
                  if (['Wizard', 'Artificer', 'Eldritch Knight', 'Arcane Trickster'].includes(newClass)) setAbility('INT');
                  else if (['Cleric', 'Druid', 'Ranger'].includes(newClass)) setAbility('WIS');
                  else if (['Sorcerer', 'Warlock', 'Bard', 'Paladin'].includes(newClass)) setAbility('CHA');
                }}
                className="w-full px-3 py-2 bg-[#161616] border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-[#c5a059]"
              >
                {CLASSES.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1 font-mono">
                Level (1-20):
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={level}
                onChange={(e) => setLevel(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                className="w-full px-3 py-2 bg-[#161616] border border-zinc-700 rounded-xl text-sm text-zinc-100 font-mono focus:outline-none focus:border-[#c5a059]"
              />
            </div>
          </div>

          {/* Spellcasting Ability & Score */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1 font-mono">
                Spell Ability:
              </label>
              <select
                value={ability}
                onChange={(e) => setAbility(e.target.value as AbilityScore)}
                className="w-full px-3 py-2 bg-[#161616] border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-[#c5a059]"
              >
                <option value="INT">Intelligence (INT)</option>
                <option value="WIS">Wisdom (WIS)</option>
                <option value="CHA">Charisma (CHA)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1 font-mono">
                Ability Score (1-30):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={abilityScore}
                  onChange={(e) => setAbilityScore(parseInt(e.target.value) || 10)}
                  className="w-full px-3 py-2 bg-[#161616] border border-zinc-700 rounded-xl text-sm text-zinc-100 font-mono focus:outline-none focus:border-[#c5a059]"
                />
                <span className="text-xs font-mono font-bold px-2.5 py-2 rounded-lg bg-zinc-900 border border-[#c5a059]/40 text-[#c5a059] whitespace-nowrap">
                  {mod >= 0 ? `+${mod}` : mod}
                </span>
              </div>
            </div>
          </div>

          {/* Computed Stat Cards */}
          <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-[#161616] border border-zinc-800 text-center">
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-400 block font-mono">Spell Save DC</span>
              <span className="text-base font-bold text-[#c5a059] font-mono">{dc}</span>
              <span className="text-[9px] text-zinc-500 block">8+Prof+Mod</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-400 block font-mono">Spell Attack</span>
              <span className="text-base font-bold text-[#dfc384] font-mono">+{atk}</span>
              <span className="text-[9px] text-zinc-500 block">Prof+Mod</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-400 block font-mono">Max Prepared</span>
              <span className="text-base font-bold text-emerald-400 font-mono">
                {maxPrepared !== null ? maxPrepared : 'N/A'}
              </span>
              <span className="text-[9px] text-zinc-500 block">Class Formula</span>
            </div>
          </div>

          {/* Spell Slot Override / Custom Maxima */}
          <div className="pt-2 border-t border-zinc-800">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono">
                Max Spell Slots by Level:
              </label>
              <button
                type="button"
                onClick={handleApplyPreset}
                className="text-xs text-[#c5a059] hover:text-[#dfc384] flex items-center gap-1 font-semibold transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Auto-fill for Lv{level} {characterClass}</span>
              </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => {
                const s = slots[lvl as keyof SpellSlotState] as { max: number; current: number };
                return (
                  <div key={lvl} className="p-2 rounded-xl bg-[#161616] border border-zinc-800 text-center">
                    <span className="text-[10px] font-bold text-zinc-400 block font-mono">
                      Level {lvl}
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={9}
                      value={s?.max ?? 0}
                      onChange={(e) => onSetSlotMax(lvl, parseInt(e.target.value) || 0)}
                      className="w-full mt-1 text-center bg-zinc-900 border border-zinc-700 rounded-lg text-xs font-mono font-bold text-[#c5a059] py-1 focus:border-[#c5a059] focus:outline-none"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold transition-colors border border-zinc-800"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-lg bg-[#c5a059] hover:bg-[#d4af37] text-black text-xs font-bold shadow-lg flex items-center gap-1.5 active:scale-95 transition-all"
          >
            <Check className="w-3.5 h-3.5 fill-black text-black" />
            <span>Save Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};
