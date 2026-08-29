import { Check, Clock, Compass, Eye, Flame, Shield, Sparkles, Star, X, Zap } from 'lucide-react';
import React from 'react';
import { PreparationStatus, Spell } from '../types';
import {
  clean5eTags,
  formatCastingTime,
  formatComponents,
  formatDuration,
  formatRange,
  formatShortSpellLevel,
  getSchoolInfo,
} from '../utils/textParser';

interface SpellCardProps {
  spell: Spell;
  onSelect: (spell: Spell) => void;
  onTogglePrep: (spellId: string) => void;
  onSetPrep: (spellId: string, status: PreparationStatus) => void;
  onToggleFavorite: (spellId: string) => void;
  onQuickCast: (spell: Spell) => void;
  hasSlotsAvailable: boolean;
  isConcentrating?: boolean;
  onStopConcentration?: () => void;
}

export const SpellCard: React.FC<SpellCardProps> = ({
  spell,
  onSelect,
  onTogglePrep,
  onSetPrep,
  onToggleFavorite,
  onQuickCast,
  hasSlotsAvailable,
  isConcentrating,
  onStopConcentration,
}) => {
  const school = getSchoolInfo(spell.school);
  const durationInfo = formatDuration(spell.duration);
  const castingTime = formatCastingTime(spell.time);
  const range = formatRange(spell.range);
  const components = formatComponents(spell.components);

  // Short preview of description
  let previewText = '';
  if (spell.entries && spell.entries.length > 0) {
    const first = spell.entries[0];
    if (typeof first === 'string') {
      previewText = clean5eTags(first);
    } else if (typeof first === 'object' && first.entries) {
      previewText = clean5eTags(String(first.entries[0] || ''));
    }
  }
  if (previewText.length > 115) {
    previewText = previewText.substring(0, 112) + '...';
  }

  const isCantrip = spell.level === 0;
  const isPrepared = spell.preparationStatus === 'prepared';
  const isAlwaysAvailable = isCantrip || spell.preparationStatus === 'always_available';

  return (
    <div
      onClick={() => onSelect(spell)}
      className={`group relative rounded-xl border bg-[#161616] hover:bg-[#1a1a1e] transition-all cursor-pointer shadow-lg hover:shadow-2xl hover:border-zinc-700 p-3.5 flex flex-col justify-between overflow-hidden active:scale-[0.99] ${
        isConcentrating
          ? 'border-amber-500/80 ring-2 ring-amber-500/60 shadow-[0_0_18px_rgba(245,158,11,0.22)] bg-[#1b150c]'
          : isPrepared
          ? 'border-l-4 border-l-[#c5a059] border-zinc-800'
          : isAlwaysAvailable && !isCantrip
          ? 'border-l-4 border-l-[#c5a059]/70 border-zinc-800'
          : isCantrip
          ? 'border-l-4 border-l-[#c5a059]/40 border-zinc-800'
          : 'border-l-4 border-l-transparent border-zinc-800/80 opacity-75 hover:opacity-100'
      }`}
    >
      <div>
        {/* Top Bar: Level/School & Favorite Button */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Active Concentration Badge */}
            {isConcentrating && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500 text-black flex items-center gap-1 animate-pulse">
                <Eye className="w-3 h-3" />
                CONCENTRATING
              </span>
            )}

            {/* Level Tag */}
            <span
              className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                isCantrip
                  ? 'bg-zinc-900 border-[#c5a059]/30 text-[#c5a059]'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-300'
              }`}
            >
              {formatShortSpellLevel(spell.level)}
            </span>

            {/* School Tag */}
            <span
              className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${school.bgLight} ${school.color} ${school.border}`}
            >
              {school.name}
            </span>

            {/* Ritual Tag */}
            {spell.meta?.ritual && (
              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-teal-950/80 border border-teal-700/50 text-teal-300">
                RITUAL
              </span>
            )}

            {/* Concentration Tag */}
            {!isConcentrating && durationInfo.isConcentration && (
              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-rose-950/80 border border-rose-700/50 text-rose-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                CONC
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Quick Stop Concentration Button if active */}
            {isConcentrating && onStopConcentration && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStopConcentration();
                }}
                className="p-1 rounded bg-rose-950/80 hover:bg-rose-900 border border-rose-700/60 text-rose-300 text-[10px] font-bold flex items-center gap-0.5 transition-colors"
                title="Stop concentration on this spell"
              >
                <X className="w-3 h-3" />
                <span>Stop</span>
              </button>
            )}

            {/* Favorite Star */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(spell.id);
              }}
              className="p-1 rounded-md text-zinc-600 hover:text-amber-400 hover:bg-zinc-800 transition-colors"
              title={spell.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star
                className={`w-4 h-4 ${
                  spell.isFavorite ? 'text-amber-400 fill-amber-400' : 'text-zinc-600'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Spell Title */}
        <div className="mb-1.5">
          <h3 className="text-base sm:text-lg font-serif font-bold text-zinc-100 group-hover:text-[#c5a059] transition-colors flex items-center justify-between tracking-tight">
            <span>{spell.name}</span>
            {spell.source && (
              <span className="text-[10px] font-mono text-zinc-500 group-hover:text-zinc-400 font-normal">
                {spell.source}
              </span>
            )}
          </h3>
        </div>

        {/* Stats Row: Cast Time, Range, Duration */}
        <div className="grid grid-cols-3 gap-1 py-1.5 mb-2 border-y border-zinc-800/80 text-[11px] text-zinc-400 font-medium">
          <div className="flex items-center gap-1 truncate" title={`Casting time: ${castingTime}`}>
            <Clock className="w-3 h-3 text-[#c5a059] flex-shrink-0" />
            <span className="truncate">{castingTime}</span>
          </div>
          <div className="flex items-center gap-1 truncate" title={`Range: ${range}`}>
            <Compass className="w-3 h-3 text-zinc-400 flex-shrink-0" />
            <span className="truncate">{range}</span>
          </div>
          <div className="flex items-center gap-1 truncate" title={`Duration: ${durationInfo.text}`}>
            <Shield className="w-3 h-3 text-amber-300/80 flex-shrink-0" />
            <span className="truncate">{durationInfo.text.replace('Concentration, up to ', 'Conc: ')}</span>
          </div>
        </div>

        {/* Snippet preview */}
        {previewText && (
          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-3">
            {previewText}
          </p>
        )}
      </div>

      {/* Bottom Action Footer */}
      <div className="pt-2 flex items-center justify-between gap-2 border-t border-zinc-800/80">
        {/* Preparation Status Toggle Button */}
        {isCantrip ? (
          <div className="flex items-center gap-1.5 text-xs text-[#c5a059] font-medium">
            <span className="w-2 h-2 rounded-full bg-[#c5a059]" />
            <span className="text-[11px] uppercase tracking-wider font-semibold">At Will</span>
          </div>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTogglePrep(spell.id);
            }}
            className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all flex items-center gap-2 active:scale-95 ${
              isPrepared
                ? 'bg-zinc-900 border-[#c5a059] text-[#c5a059] hover:border-[#d4af37]'
                : isAlwaysAvailable
                ? 'bg-zinc-900 border-amber-500/50 text-amber-300 hover:bg-zinc-800'
                : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
            }`}
            title="Click to cycle: Prepared → Always Available → Unprepared"
          >
            {/* Signature circular indicator pip matching Sophisticated Dark design */}
            <span
              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                isPrepared
                  ? 'border-[#c5a059] bg-[#c5a059]/20'
                  : isAlwaysAvailable
                  ? 'border-amber-400 bg-amber-400/20'
                  : 'border-zinc-700 bg-zinc-800'
              }`}
            >
              {isPrepared ? (
                <span className="w-2 h-2 rounded-full bg-[#c5a059]" />
              ) : isAlwaysAvailable ? (
                <span className="text-[8px] text-amber-300">★</span>
              ) : null}
            </span>

            <span className="text-[11px] uppercase tracking-wider">
              {isPrepared ? 'Prepared' : isAlwaysAvailable ? 'Always Avail' : 'Unprepared'}
            </span>
          </button>
        )}

        {/* Quick Cast Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuickCast(spell);
          }}
          className="px-3.5 py-1 rounded-lg bg-[#c5a059] hover:bg-[#d4af37] text-black text-xs font-bold shadow-md flex items-center gap-1 active:scale-95 transition-all"
        >
          <Zap className="w-3.5 h-3.5 fill-black text-black" />
          <span>Cast</span>
        </button>
      </div>
    </div>
  );
};
