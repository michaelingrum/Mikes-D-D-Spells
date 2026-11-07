import {
  AlertTriangle,
  BookOpen,
  Check,
  Copy,
  Database,
  Flame,
  Layers,
  Plus,
  Shield,
  Sparkles,
  Trash2,
  User,
  Users,
  Wand2,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { AbilityScore, CasterClass, CharacterRecord, SpellSlotState } from '../types';
import { getAbilityModifier, getProficiencyBonus } from '../utils/spellSlotPresets';

interface CharacterSwitcherModalProps {
  characters: CharacterRecord[];
  activeCharacterId: string;
  onClose: () => void;
  onSwitchCharacter: (id: string) => void;
  onCreateCharacter: (options?: {
    name?: string;
    characterClass?: CasterClass;
    level?: number;
    spellcastingAbility?: AbilityScore;
    abilityScoreValue?: number;
    startWithDefaultSpells?: boolean;
    copyCurrentFeatures?: boolean;
  }) => CharacterRecord;
  onDuplicateCharacter: (id: string, customName?: string) => CharacterRecord | null;
  onDeleteCharacter: (id: string) => { success: boolean; message: string };
  onOpenCharacterSettings: () => void;
  onOpenBackup?: () => void;
}

const AVAILABLE_CLASSES: CasterClass[] = [
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

export const CharacterSwitcherModal: React.FC<CharacterSwitcherModalProps> = ({
  characters,
  activeCharacterId,
  onClose,
  onSwitchCharacter,
  onCreateCharacter,
  onDuplicateCharacter,
  onDeleteCharacter,
  onOpenCharacterSettings,
  onOpenBackup,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [charToDelete, setCharToDelete] = useState<CharacterRecord | null>(null);

  // New Character Form State
  const [newName, setNewName] = useState('');
  const [newClass, setNewClass] = useState<CasterClass>('Wizard');
  const [newLevel, setNewLevel] = useState<number>(1);
  const [newAbility, setNewAbility] = useState<AbilityScore>('INT');
  const [newScore, setNewScore] = useState<number>(16);
  const [startWithStarterSpells, setStartWithStarterSpells] = useState(true);

  // Auto-set recommended ability score when class changes
  const handleClassChange = (selectedClass: CasterClass) => {
    setNewClass(selectedClass);
    if (['Cleric', 'Druid', 'Ranger'].includes(selectedClass)) {
      setNewAbility('WIS');
    } else if (['Bard', 'Sorcerer', 'Warlock', 'Paladin'].includes(selectedClass)) {
      setNewAbility('CHA');
    } else {
      setNewAbility('INT');
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created = onCreateCharacter({
      name: newName.trim() || undefined,
      characterClass: newClass,
      level: newLevel,
      spellcastingAbility: newAbility,
      abilityScoreValue: newScore,
      startWithDefaultSpells: startWithStarterSpells,
    });
    setIsCreating(false);
    // Reset form
    setNewName('');
    setNewClass('Wizard');
    setNewLevel(1);
    setNewAbility('INT');
    setNewScore(16);
    setStartWithStarterSpells(true);
  };

  const confirmDelete = () => {
    if (!charToDelete) return;
    onDeleteCharacter(charToDelete.id);
    setCharToDelete(null);
  };

  // Helper to compute slot totals
  const getSlotSummary = (slots: SpellSlotState) => {
    let remaining = 0;
    let max = 0;
    for (let i = 1; i <= 9; i++) {
      const s = slots[i as keyof SpellSlotState] as { max: number; current: number };
      if (s && s.max > 0) {
        remaining += s.current;
        max += s.max;
      }
    }
    const pact = slots.pact;
    return {
      remaining,
      max,
      pactRemaining: pact && pact.max > 0 ? pact.current : 0,
      pactMax: pact && pact.max > 0 ? pact.max : 0,
      pactLevel: pact?.level || 0,
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[92vh] bg-[#121212] border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col overflow-hidden">
        {/* Top Gold Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#c5a059] via-[#dfc384] to-[#c5a059]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-[#c5a059]/40 flex items-center justify-center shadow-lg shadow-black flex-shrink-0">
              <Users className="w-5 h-5 text-[#c5a059]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-serif font-bold text-[#c5a059]">
                  Character Roster
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                  {characters.length} {characters.length === 1 ? 'Character' : 'Characters'}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Switch active spellcaster, create new heroes, or duplicate existing builds
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenBackup && (
              <button
                onClick={() => {
                  onClose();
                  onOpenBackup();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold transition-all active:scale-95 shadow-sm"
                title="Backup all characters or restore database from file"
              >
                <Database className="w-3.5 h-3.5 text-[#c5a059]" />
                <span className="hidden sm:inline">Backup & Restore</span>
                <span className="sm:hidden">Backup</span>
              </button>
            )}

            {!isCreating && (
              <button
                onClick={() => setIsCreating(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-[#c5a059]/20 border border-[#c5a059]/50 text-[#c5a059] hover:text-[#d4af37] text-xs font-semibold transition-all active:scale-95 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Character</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Create Character Panel */}
        {isCreating && (
          <form
            onSubmit={handleCreateSubmit}
            className="mb-4 p-4 rounded-xl bg-zinc-900/90 border border-[#c5a059]/40 shadow-xl animate-fadeIn flex flex-col gap-3.5"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#c5a059]" />
                <h3 className="text-sm font-serif font-bold text-[#dfc384]">Create New Character</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="text-xs text-zinc-400 hover:text-zinc-200"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-zinc-400 font-semibold mb-1">
                  Character Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mordenkainen or Elminster"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-[#161616] border border-zinc-800 focus:border-[#c5a059] rounded-lg px-3 py-1.5 text-sm text-zinc-100 focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-zinc-400 font-semibold mb-1">
                  Caster Class
                </label>
                <select
                  value={newClass}
                  onChange={(e) => handleClassChange(e.target.value as CasterClass)}
                  className="w-full bg-[#161616] border border-zinc-800 focus:border-[#c5a059] rounded-lg px-3 py-1.5 text-sm text-zinc-100 focus:outline-none"
                >
                  {AVAILABLE_CLASSES.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-zinc-400 font-semibold mb-1">
                    Level (1-20)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={newLevel}
                    onChange={(e) => setNewLevel(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                    className="w-full bg-[#161616] border border-zinc-800 focus:border-[#c5a059] rounded-lg px-3 py-1.5 text-sm text-zinc-100 focus:outline-none text-center"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-zinc-400 font-semibold mb-1">
                    Spell Ability
                  </label>
                  <select
                    value={newAbility}
                    onChange={(e) => setNewAbility(e.target.value as AbilityScore)}
                    className="w-full bg-[#161616] border border-zinc-800 focus:border-[#c5a059] rounded-lg px-3 py-1.5 text-sm text-zinc-100 focus:outline-none"
                  >
                    <option value="INT">INT</option>
                    <option value="WIS">WIS</option>
                    <option value="CHA">CHA</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-zinc-400 font-semibold mb-1">
                    Ability Score
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={newScore}
                    onChange={(e) => setNewScore(Math.max(1, Math.min(30, parseInt(e.target.value) || 10)))}
                    className="w-full bg-[#161616] border border-zinc-800 focus:border-[#c5a059] rounded-lg px-3 py-1.5 text-sm text-zinc-100 focus:outline-none text-center"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <div className="text-xs text-zinc-400 bg-[#161616] border border-zinc-800 rounded-lg px-3 py-1.5 text-center">
                    Modifier:{' '}
                    <strong className="text-[#c5a059] font-mono">
                      {getAbilityModifier(newScore) >= 0 ? `+${getAbilityModifier(newScore)}` : getAbilityModifier(newScore)}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="starterSpells"
                checked={startWithStarterSpells}
                onChange={(e) => setStartWithStarterSpells(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-[#c5a059] focus:ring-0 cursor-pointer"
              />
              <label htmlFor="starterSpells" className="text-xs text-zinc-300 cursor-pointer">
                Pre-populate with starter 5e spellbook sample (otherwise start empty)
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-1 border-t border-zinc-800/80">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#c5a059] hover:bg-[#d4af37] text-black font-semibold text-xs shadow-md transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Hero</span>
              </button>
            </div>
          </form>
        )}

        {/* Delete Confirmation Modal Overlay */}
        {charToDelete && (
          <div className="absolute inset-0 z-20 bg-black/90 p-6 flex flex-col items-center justify-center text-center animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-red-950/80 border border-red-500/50 flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-lg font-serif font-bold text-red-200 mb-1">
              Delete {charToDelete.profile.name || 'Character'}?
            </h3>
            <p className="text-xs text-zinc-400 max-w-sm mb-4">
              This will permanently delete this character, their complete spellbook ({charToDelete.spells.length} spells), custom notes, slot configuration, and feature trackers. This cannot be undone.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCharToDelete(null)}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-red-800 hover:bg-red-700 text-white text-xs font-semibold shadow-lg shadow-red-950"
              >
                Yes, Delete Character
              </button>
            </div>
          </div>
        )}

        {/* Characters List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {characters.map((char) => {
            const isActive = char.id === activeCharacterId;
            const slotSummary = getSlotSummary(char.slots);
            const abilityMod = getAbilityModifier(char.profile.abilityScoreValue);
            const prof = char.profile.proficiencyBonus || getProficiencyBonus(char.profile.level);
            const dc = 8 + prof + abilityMod + (char.profile.dcBonus || 0);
            const atk = prof + abilityMod + (char.profile.attackBonus || 0);
            const preparedCount = char.spells.filter(
              (s) => s.level > 0 && (s.preparationStatus === 'prepared' || s.preparationStatus === 'always_available')
            ).length;
            const cantripsCount = char.spells.filter((s) => s.level === 0).length;

            return (
              <div
                key={char.id}
                className={`relative rounded-xl p-4 transition-all border ${
                  isActive
                    ? 'bg-zinc-900/90 border-[#c5a059] shadow-lg shadow-black/80 ring-1 ring-[#c5a059]/40'
                    : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/40'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left: Name, Class, Level & Status */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-serif font-bold text-zinc-100 truncate">
                        {char.profile.name || 'Unnamed Character'}
                      </h3>

                      {isActive && (
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#c5a059]/20 border border-[#c5a059]/60 text-[#dfc384]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059] animate-pulse" />
                          Active
                        </span>
                      )}

                      <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono">
                        Level {char.profile.level} {char.profile.characterClass}
                      </span>
                    </div>

                    {/* Stats bar */}
                    <div className="flex items-center gap-2 sm:gap-3 text-xs text-zinc-400 mt-2 flex-wrap">
                      <span className="text-zinc-300">
                        {char.profile.spellcastingAbility}:{' '}
                        <strong className="text-[#dfc384] font-mono">
                          {abilityMod >= 0 ? `+${abilityMod}` : abilityMod}
                        </strong>
                      </span>
                      <span className="text-zinc-600">•</span>
                      <span>
                        Save DC: <strong className="text-zinc-200 font-mono">{dc}</strong>
                      </span>
                      <span className="text-zinc-600">•</span>
                      <span>
                        Atk: <strong className="text-zinc-200 font-mono">+{atk}</strong>
                      </span>
                      <span className="text-zinc-600">•</span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-zinc-500" />
                        <span className="text-zinc-300 font-mono">{char.spells.length}</span> spells ({preparedCount} prep, {cantripsCount} ctrp)
                      </span>
                    </div>

                    {/* Spell slot indicator */}
                    <div className="flex items-center gap-3 text-[11px] text-zinc-400 mt-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-zinc-500 uppercase tracking-wider font-semibold">Slots:</span>
                        <span className="font-mono font-bold text-[#c5a059]">
                          {slotSummary.remaining}/{slotSummary.max}
                        </span>
                        {slotSummary.pactMax > 0 && (
                          <span className="text-violet-400 font-mono ml-1">
                            (+{slotSummary.pactRemaining}/{slotSummary.pactMax} Pact L{slotSummary.pactLevel})
                          </span>
                        )}
                      </div>

                      {char.features && char.features.length > 0 && (
                        <>
                          <span className="text-zinc-700">•</span>
                          <span className="flex items-center gap-1 text-zinc-400">
                            <Layers className="w-3 h-3 text-[#dfc384]" />
                            {char.features.length} features
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                    {!isActive ? (
                      <button
                        onClick={() => {
                          onSwitchCharacter(char.id);
                          onClose();
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#c5a059] hover:bg-[#d4af37] text-black text-xs font-semibold shadow-md transition-all active:scale-95"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Switch</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          onClose();
                          onOpenCharacterSettings();
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[#dfc384] text-xs font-semibold transition-all border border-zinc-700"
                        title="Edit Character Profile & Spell Slot Maxima"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>Settings</span>
                      </button>
                    )}

                    {/* Duplicate button */}
                    <button
                      onClick={() => onDuplicateCharacter(char.id)}
                      className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
                      title="Duplicate character and full spellbook"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete button (disabled if only 1 character) */}
                    <button
                      onClick={() => setCharToDelete(char)}
                      disabled={characters.length <= 1}
                      className={`p-1.5 rounded-lg transition-colors border ${
                        characters.length <= 1
                          ? 'bg-zinc-950 border-zinc-900 text-zinc-700 cursor-not-allowed'
                          : 'bg-zinc-900 hover:bg-red-950/60 border-zinc-800 hover:border-red-800/80 text-zinc-400 hover:text-red-400'
                      }`}
                      title={
                        characters.length <= 1
                          ? 'Cannot delete the only character in roster'
                          : 'Delete character and all associated spell records'
                      }
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="pt-3 mt-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span>All characters & spellbooks are saved independently to your device.</span>
            {onOpenBackup && (
              <button
                onClick={() => {
                  onClose();
                  onOpenBackup();
                }}
                className="text-[#c5a059] hover:underline font-medium"
              >
                Backup Database...
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
