import confetti from 'canvas-confetti';
import { AlertCircle, AlertTriangle, Check, Eye, Flame, Sparkles, X, Zap } from 'lucide-react';
import React, { useState } from 'react';
import { ActiveConcentration, Spell, SpellSlotState } from '../types';
import { clean5eTags, formatSpellLevel, getSchoolInfo } from '../utils/textParser';

interface CastSpellModalProps {
  spell: Spell | null;
  slots: SpellSlotState;
  onClose: () => void;
  onCast: (spell: Spell, slotLevel: number) => { success: boolean; message: string };
  onCastPact: (spell: Spell) => { success: boolean; message: string };
  activeConcentration?: ActiveConcentration | null;
}

export const CastSpellModal: React.FC<CastSpellModalProps> = ({
  spell,
  slots,
  onClose,
  onCast,
  onCastPact,
  activeConcentration,
}) => {
  if (!spell) return null;

  const isCantrip = spell.level === 0;
  const school = getSchoolInfo(spell.school);
  const isConcentration = Boolean(spell.duration?.some((d) => d.concentration));

  // Available leveled slots from spell.level up to 9
  const availableSlotLevels: Array<{ level: number; current: number; max: number }> = [];
  if (!isCantrip) {
    for (let lvl = spell.level; lvl <= 9; lvl++) {
      const slot = slots[lvl as keyof SpellSlotState] as { max: number; current: number };
      if (slot && slot.max > 0) {
        availableSlotLevels.push({
          level: lvl,
          current: slot.current,
          max: slot.max,
        });
      }
    }
  }

  // Find first available slot level that has current > 0, default to base spell level
  const defaultSelectedLevel =
    availableSlotLevels.find((s) => s.current > 0)?.level || spell.level;

  const [selectedSlotLevel, setSelectedSlotLevel] = useState<number>(defaultSelectedLevel);
  const [castMessage, setCastMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const hasPactAvailable =
    slots.pact && slots.pact.max > 0 && slots.pact.level >= spell.level;

  // Higher level info text
  let higherLevelDesc = '';
  if (spell.entriesHigherLevel && spell.entriesHigherLevel.length > 0) {
    const hl = spell.entriesHigherLevel[0];
    higherLevelDesc = hl.entries.map((e) => clean5eTags(e)).join(' ');
  }

  const handleExecuteCast = () => {
    if (isCantrip) {
      confetti({
        particleCount: 25,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#c5a059', '#dfc384', '#e2e8f0'],
      });
      const res = onCast(spell, 0);
      setCastMessage({ text: res.message, isError: false });
      setTimeout(() => {
        onClose();
      }, 1000);
      return;
    }

    const res = onCast(spell, selectedSlotLevel);
    if (res.success) {
      confetti({
        particleCount: 35,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#c5a059', '#dfc384', '#10b981'],
      });
      setCastMessage({ text: res.message, isError: false });
      setTimeout(() => {
        onClose();
      }, 1100);
    } else {
      setCastMessage({ text: res.message, isError: true });
    }
  };

  const handleExecutePactCast = () => {
    const res = onCastPact(spell);
    if (res.success) {
      confetti({
        particleCount: 35,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#c5a059', '#f59e0b', '#ef4444'],
      });
      setCastMessage({ text: res.message, isError: false });
      setTimeout(() => {
        onClose();
      }, 1100);
    } else {
      setCastMessage({ text: res.message, isError: true });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#121212] border border-zinc-800 rounded-2xl p-5 shadow-2xl overflow-hidden">
        {/* Top Gold Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#c5a059] via-[#dfc384] to-[#c5a059]" />

        {/* Header */}
        <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-[#c5a059]/40 flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#c5a059]" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-[#c5a059]">{spell.name}</h2>
              <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
                <span>{formatSpellLevel(spell.level)}</span>
                <span>•</span>
                <span className={school.color}>{school.name}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 my-3">
          {/* Concentration Warning / Notice Banner */}
          {isConcentration && (
            <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
              activeConcentration && activeConcentration.spellId !== spell.id
                ? 'bg-rose-950/40 border-rose-700/60 text-rose-200'
                : 'bg-amber-950/30 border-amber-600/50 text-amber-200'
            }`}>
              {activeConcentration && activeConcentration.spellId !== spell.id ? (
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              ) : (
                <Eye className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <span className="font-bold block uppercase tracking-wider text-[10px]">
                  {activeConcentration && activeConcentration.spellId !== spell.id
                    ? 'Replaces Concentration'
                    : 'Concentration Spell'}
                </span>
                <p className="text-zinc-300">
                  {activeConcentration && activeConcentration.spellId !== spell.id
                    ? `Casting this will break and end your active concentration on "${activeConcentration.spellName}".`
                    : 'This spell requires maintaining concentration. Casting another concentration spell will end it.'}
                </p>
              </div>
            </div>
          )}

          {isCantrip ? (
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-center space-y-1">
              <p className="text-sm font-semibold text-[#c5a059]">Cantrip (No Slot Required)</p>
              <p className="text-xs text-zinc-400">
                Cantrips can be cast at will without consuming any spell slots.
              </p>
            </div>
          ) : (
            <>
              <div>
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-2 font-mono">
                  Select Spell Slot Level to Expend:
                </label>

                <div className="grid grid-cols-3 gap-2">
                  {availableSlotLevels.map((s) => {
                    const isSelected = selectedSlotLevel === s.level;
                    const isAvailable = s.current > 0;
                    const isUpcast = s.level > spell.level;

                    return (
                      <button
                        key={s.level}
                        disabled={!isAvailable}
                        onClick={() => setSelectedSlotLevel(s.level)}
                        className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-between gap-1 relative ${
                          isSelected && isAvailable
                            ? 'bg-zinc-900 border-[#c5a059] text-[#c5a059] shadow-md ring-2 ring-[#c5a059]/40 font-bold'
                            : isAvailable
                            ? 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                            : 'bg-zinc-950/50 border-zinc-900 text-zinc-600 opacity-40 cursor-not-allowed'
                        }`}
                      >
                        {isUpcast && (
                          <span className="absolute -top-1.5 right-1 px-1 rounded bg-[#c5a059] text-black text-[9px] font-bold">
                            UPCAST
                          </span>
                        )}
                        <span className="text-xs font-bold font-mono">
                          {s.level === 1 ? '1st' : s.level === 2 ? '2nd' : s.level === 3 ? '3rd' : `${s.level}th`} Lvl
                        </span>
                        <div className="flex items-center gap-1">
                          <span
                            className={`text-xs font-mono font-bold ${
                              s.current > 0 ? 'text-[#c5a059]' : 'text-rose-500'
                            }`}
                          >
                            {s.current}/{s.max}
                          </span>
                          <span className="text-[10px] text-zinc-500">left</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {availableSlotLevels.length === 0 && (
                  <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-900/40 text-xs text-rose-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>No spell slots configured for level {spell.level} or higher.</span>
                  </div>
                )}
              </div>

              {/* Upcasting description if applicable */}
              {selectedSlotLevel > spell.level && higherLevelDesc && (
                <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs text-amber-200">
                  <strong className="text-[#c5a059] block mb-0.5 flex items-center gap-1 font-serif">
                    <Sparkles className="w-3.5 h-3.5 text-[#c5a059]" />
                    Upcast Benefit:
                  </strong>
                  <p className="text-zinc-300">{higherLevelDesc}</p>
                </div>
              )}
            </>
          )}

          {/* Feedback Message */}
          {castMessage && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                castMessage.isError
                  ? 'bg-rose-950 border border-rose-800 text-rose-300'
                  : 'bg-zinc-900 border border-[#c5a059] text-[#c5a059]'
              }`}
            >
              {castMessage.isError ? (
                <AlertCircle className="w-4 h-4" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>{castMessage.text}</span>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="mt-5 pt-3 border-t border-zinc-800 flex items-center justify-between gap-2">
          {hasPactAvailable && !isCantrip && (
            <button
              onClick={handleExecutePactCast}
              disabled={Boolean(slots.pact && slots.pact.current <= 0)}
              className="px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-[#c5a059]/50 text-[#c5a059] disabled:opacity-40 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Use Pact Slot ({slots.pact?.current}/{slots.pact?.max})</span>
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold transition-colors border border-zinc-800"
            >
              Cancel
            </button>

            <button
              onClick={handleExecuteCast}
              className="px-5 py-2 rounded-lg bg-[#c5a059] hover:bg-[#d4af37] text-black text-xs font-bold shadow-lg flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <Zap className="w-4 h-4 fill-black text-black" />
              <span>{isCantrip ? 'Cast Cantrip' : `Cast at Level ${selectedSlotLevel}`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
