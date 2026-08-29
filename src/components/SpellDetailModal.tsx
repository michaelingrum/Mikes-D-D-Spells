import {
  BookOpen,
  Check,
  Clock,
  Compass,
  FileText,
  Flame,
  Globe,
  Layers,
  Shield,
  Sparkles,
  Star,
  Trash2,
  X,
  Zap
} from 'lucide-react';
import React from 'react';
import { PreparationStatus, Spell } from '../types';
import {
  clean5eTags,
  formatCastingTime,
  formatComponents,
  formatDuration,
  formatRange,
  formatSpellLevel,
  getSchoolInfo,
  parseEntries,
} from '../utils/textParser';

interface SpellDetailModalProps {
  spell: Spell | null;
  onClose: () => void;
  onTogglePrep: (spellId: string) => void;
  onSetPrep: (spellId: string, status: PreparationStatus) => void;
  onToggleFavorite: (spellId: string) => void;
  onCast: (spell: Spell) => void;
  onDeleteSpell?: (spellId: string) => void;
  spellSaveDC?: number;
  spellAttackMod?: number;
}

export const SpellDetailModal: React.FC<SpellDetailModalProps> = ({
  spell,
  onClose,
  onTogglePrep,
  onSetPrep,
  onToggleFavorite,
  onCast,
  onDeleteSpell,
  spellSaveDC,
  spellAttackMod,
}) => {
  if (!spell) return null;

  const school = getSchoolInfo(spell.school);
  const durationInfo = formatDuration(spell.duration);
  const castingTime = formatCastingTime(spell.time);
  const range = formatRange(spell.range);
  const components = formatComponents(spell.components);
  const parsedEntries = parseEntries(spell.entries);

  // Check if spell mentions spell attack
  const fullText = Array.isArray(spell.entries)
    ? spell.entries.map((e) => (typeof e === 'string' ? e : JSON.stringify(e))).join(' ')
    : '';
  const hasSpellAttack = /spell attack/i.test(fullText);

  const isCantrip = spell.level === 0;
  const isPrepared = spell.preparationStatus === 'prepared';
  const isAlwaysAvailable = isCantrip || spell.preparationStatus === 'always_available';

  // Extract class names
  const classNames: string[] = [];
  if (spell.classes?.fromClassList) {
    spell.classes.fromClassList.forEach((c) => classNames.push(c.name));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[92vh] sm:max-h-[88vh] bg-[#121212] border border-zinc-800 rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slideUp">
        {/* Top Decorative Gold Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#c5a059] via-[#dfc384] to-[#c5a059]" />

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-start justify-between gap-3 bg-[#161616]">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-200 border border-zinc-800">
                {formatSpellLevel(spell.level)}
              </span>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded border ${school.bgLight} ${school.color} ${school.border}`}
              >
                {school.name}
              </span>
              {spell.meta?.ritual && (
                <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-teal-950 border border-teal-700/60 text-teal-300">
                  RITUAL
                </span>
              )}
              {durationInfo.isConcentration && (
                <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-rose-950 border border-rose-700/60 text-rose-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                  CONCENTRATION
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#c5a059] tracking-tight flex items-center gap-2">
              <span>{spell.name}</span>
            </h2>

            {spell.source && (
              <p className="text-xs text-zinc-500 font-mono mt-0.5">
                Source: {spell.source} {spell.page ? `pg. ${spell.page}` : ''}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Star Favorite */}
            <button
              onClick={() => onToggleFavorite(spell.id)}
              className="p-2 rounded-xl text-zinc-500 hover:text-amber-400 hover:bg-zinc-800 transition-colors"
              title={spell.isFavorite ? 'Remove Favorite' : 'Star Favorite'}
            >
              <Star
                className={`w-5 h-5 ${
                  spell.isFavorite ? 'text-amber-400 fill-amber-400' : ''
                }`}
              />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-sm text-zinc-200">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-[#18181b] border border-zinc-800">
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-500 block tracking-widest font-mono">
                Casting Time
              </span>
              <span className="text-xs font-semibold text-zinc-200 mt-0.5 block">
                {castingTime}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-500 block tracking-widest font-mono">
                Range / Area
              </span>
              <span className="text-xs font-semibold text-zinc-200 mt-0.5 block">
                {range}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-500 block tracking-widest font-mono">
                Components
              </span>
              <span className="text-xs font-semibold text-zinc-200 mt-0.5 block">
                {components.label}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-500 block tracking-widest font-mono">
                Duration
              </span>
              <span className="text-xs font-semibold text-zinc-200 mt-0.5 block">
                {durationInfo.text}
              </span>
            </div>
          </div>

          {/* Material Components Detail if any */}
          {components.details && (
            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs">
              <span className="font-bold text-[#c5a059] mr-1">Material Component:</span>
              <span className="text-zinc-300">{components.details}</span>
              {components.hasCost && (
                <span className="ml-2 px-1.5 py-0.2 rounded bg-amber-500/20 text-[#c5a059] font-bold border border-amber-500/30">
                  Valuable Item Required
                </span>
              )}
            </div>
          )}

          {/* Spell Description Entries */}
          <div className="space-y-3 pt-1">
            {parsedEntries.map((entry, index) => (
              <div key={index} className="space-y-1">
                {entry.title && (
                  <h4 className="text-sm font-serif font-bold text-[#c5a059]">{entry.title}</h4>
                )}
                <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line">
                  {entry.text}
                </p>
              </div>
            ))}
          </div>

          {/* Higher Level / Upcast Section */}
          {spell.entriesHigherLevel && spell.entriesHigherLevel.length > 0 && (
            <div className="p-3.5 rounded-xl bg-[#18181b] border border-[#c5a059]/40 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#c5a059] uppercase tracking-wider font-mono">
                <Sparkles className="w-4 h-4 text-[#c5a059]" />
                <span>{spell.entriesHigherLevel[0].name || 'At Higher Levels'}</span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                {spell.entriesHigherLevel[0].entries.map((e) => clean5eTags(e)).join('\n\n')}
              </p>
            </div>
          )}

          {/* Tags & Classes */}
          <div className="pt-2 border-t border-zinc-800 space-y-2">
            {classNames.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-zinc-500 font-medium font-mono">Classes:</span>
                {classNames.map((cls) => (
                  <span
                    key={cls}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-300 font-medium border border-zinc-800"
                  >
                    {cls}
                  </span>
                ))}
              </div>
            )}

            {/* Damage, Condition, Saving Throw & Spell Attack tags */}
            {(spell.damageInflict?.length || spell.conditionInflict?.length || spell.savingThrow?.length || hasSpellAttack) ? (
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                {spell.damageInflict?.map((dmg) => (
                  <span
                    key={dmg}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950/70 border border-rose-800/40 text-rose-300 uppercase font-mono"
                  >
                    {dmg} DMG
                  </span>
                ))}
                {spell.conditionInflict?.map((cond) => (
                  <span
                    key={cond}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/70 border border-amber-800/40 text-amber-300 uppercase font-mono"
                  >
                    {cond}
                  </span>
                ))}
                {spell.savingThrow?.map((save) => (
                  <span
                    key={save}
                    className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 border border-[#c5a059]/40 text-[#c5a059] uppercase font-mono font-bold flex items-center gap-1"
                  >
                    <span>{save} Save</span>
                    {spellSaveDC !== undefined && (
                      <span className="text-zinc-300 font-normal">(DC {spellSaveDC})</span>
                    )}
                  </span>
                ))}
                {hasSpellAttack && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 border border-amber-500/40 text-amber-300 uppercase font-mono font-bold flex items-center gap-1">
                    <span>Spell Attack</span>
                    {spellAttackMod !== undefined && (
                      <span className="text-zinc-300 font-normal">
                        ({spellAttackMod >= 0 ? `+${spellAttackMod}` : spellAttackMod} to hit)
                      </span>
                    )}
                  </span>
                )}
              </div>
            ) : null}
          </div>
        </div>

        {/* Bottom Actions Toolbar */}
        <div className="p-4 border-t border-zinc-800 bg-[#161616] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Preparation Status Picker */}
          {!isCantrip ? (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-zinc-500 mr-1 hidden xs:inline uppercase tracking-wider font-mono">Status:</span>
              <button
                onClick={() => onSetPrep(spell.id, 'prepared')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1 ${
                  isPrepared
                    ? 'bg-[#c5a059] text-black shadow-md font-bold'
                    : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>Prepared</span>
              </button>

              <button
                onClick={() => onSetPrep(spell.id, 'always_available')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1 ${
                  spell.preparationStatus === 'always_available'
                    ? 'bg-[#c5a059] text-black shadow-md font-bold'
                    : 'bg-zinc-900 text-amber-300 hover:bg-zinc-800 border border-amber-900/30'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Always Avail</span>
              </button>

              <button
                onClick={() => onSetPrep(spell.id, 'unprepared')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                  spell.preparationStatus === 'unprepared'
                    ? 'bg-zinc-700 text-white shadow-md'
                    : 'bg-zinc-900 text-zinc-500 hover:bg-zinc-800 border border-zinc-800'
                }`}
              >
                Unprepared
              </button>
            </div>
          ) : (
            <div className="text-xs text-[#c5a059] font-medium">
              Cantrip is always ready to cast
            </div>
          )}

          {/* Cast CTA Button & Delete (if custom) */}
          <div className="flex items-center gap-2 ml-auto">
            {spell.isCustom && onDeleteSpell && (
              <button
                onClick={() => {
                  if (confirm(`Delete "${spell.name}" from your spellbook?`)) {
                    onDeleteSpell(spell.id);
                    onClose();
                  }
                }}
                className="p-2 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800/40 text-rose-300 text-xs transition-colors"
                title="Delete custom spell"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => {
                onCast(spell);
              }}
              className="flex-1 sm:flex-initial px-6 py-2.5 rounded-lg bg-[#c5a059] hover:bg-[#d4af37] text-black text-sm font-bold shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <Zap className="w-4 h-4 fill-black text-black" />
              <span>Cast Spell</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
