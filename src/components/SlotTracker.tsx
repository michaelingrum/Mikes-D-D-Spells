import { ChevronDown, ChevronUp, Flame, Minus, Moon, Plus, RotateCcw, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import { SpellSlotState } from '../types';

interface SlotTrackerProps {
  slots: SpellSlotState;
  onAdjustSlot: (level: number | 'pact', delta: number) => void;
  onTakeLongRest: () => void;
  onTakeShortRest: () => void;
  onConfigureSlots: () => void;
}

export const SlotTracker: React.FC<SlotTrackerProps> = ({
  slots,
  onAdjustSlot,
  onTakeLongRest,
  onTakeShortRest,
  onConfigureSlots,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Determine which spell slot levels have max > 0
  const activeLevels: number[] = [];
  let totalRemaining = 0;
  let totalMax = 0;

  for (let i = 1; i <= 9; i++) {
    const s = slots[i as keyof SpellSlotState] as { max: number; current: number };
    if (s && s.max > 0) {
      activeLevels.push(i);
      totalRemaining += s.current;
      totalMax += s.max;
    }
  }

  const hasPact = slots.pact && slots.pact.max > 0;
  if (hasPact && slots.pact) {
    totalRemaining += slots.pact.current;
    totalMax += slots.pact.max;
  }

  return (
    <div className="bg-[#121212] border-b border-zinc-800 px-3 py-2.5 sm:px-6 transition-all">
      <div className="max-w-7xl mx-auto">
        {/* Header with Slot Summary and Controls */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-serif uppercase tracking-widest text-[#c5a059] font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[#c5a059]" />
              Spell Slots
            </span>
            <span className="text-xs text-zinc-400 font-mono bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
              <strong className="text-[#c5a059]">{totalRemaining}</strong> / {totalMax} left
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Quick Long Rest trigger */}
            <button
              onClick={onTakeLongRest}
              className="text-[11px] px-2 py-1 rounded bg-[#8b0000]/80 hover:bg-[#8b0000] text-red-100 border border-[#a31a1a]/60 flex items-center gap-1 transition-colors"
              title="Restore all spell slots"
            >
              <Moon className="w-3 h-3 text-red-200" />
              <span>Restore All</span>
            </button>

            {hasPact && (
              <button
                onClick={onTakeShortRest}
                className="text-[11px] px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-zinc-700 flex items-center gap-1 transition-colors"
                title="Restore Pact slots"
              >
                <RotateCcw className="w-3 h-3 text-amber-400" />
                <span>Short Rest</span>
              </button>
            )}

            {/* Toggle collapse */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
              aria-label={isExpanded ? 'Collapse slot tracker' : 'Expand slot tracker'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Slot Grid / Horizontal Scroller */}
        {isExpanded ? (
          <div className="flex items-stretch gap-2 overflow-x-auto pb-1 pt-1 scrollbar-thin scrollbar-thumb-zinc-700">
            {/* Pact Magic Slots (if enabled) */}
            {hasPact && slots.pact && (
              <div className="flex-shrink-0 bg-[#18181b] border border-amber-800/40 rounded-lg p-2.5 min-w-[120px] shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="text-[10px] font-bold tracking-wider text-amber-400 font-mono uppercase flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-500" />
                    Pact (Lv{slots.pact.level})
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-300">
                    {slots.pact.current}/{slots.pact.max}
                  </span>
                </div>

                {/* Orbs */}
                <div className="flex items-center justify-center gap-1.5 my-1.5">
                  {Array.from({ length: slots.pact.max }).map((_, idx) => {
                    const isAvailable = idx < (slots.pact?.current ?? 0);
                    return (
                      <button
                        key={idx}
                        onClick={() => onAdjustSlot('pact', isAvailable ? -1 : 1)}
                        className={`w-5 h-5 rounded-full border transition-all transform active:scale-90 ${
                          isAvailable
                            ? 'bg-gradient-to-tr from-amber-500 to-amber-300 border-amber-200 shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                            : 'bg-zinc-900 border-zinc-700 opacity-40 hover:opacity-75'
                        }`}
                        title={isAvailable ? 'Click to expend slot' : 'Click to restore slot'}
                      />
                    );
                  })}
                </div>

                {/* Plus / Minus Buttons */}
                <div className="flex items-center justify-between gap-1 mt-1">
                  <button
                    onClick={() => onAdjustSlot('pact', -1)}
                    disabled={slots.pact.current <= 0}
                    className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 disabled:opacity-30 text-zinc-300 transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onAdjustSlot('pact', 1)}
                    disabled={slots.pact.current >= slots.pact.max}
                    className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 disabled:opacity-30 text-zinc-300 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Standard Levels 1 to 9 */}
            {activeLevels.length > 0 ? (
              activeLevels.map((lvl) => {
                const s = slots[lvl as keyof SpellSlotState] as { max: number; current: number };
                const isCompletelyDepleted = s.current === 0;

                return (
                  <div
                    key={lvl}
                    className={`flex-shrink-0 bg-[#18181b] border rounded-lg p-2.5 min-w-[110px] shadow-sm flex flex-col justify-between transition-colors ${
                      isCompletelyDepleted
                        ? 'border-zinc-800/80 opacity-60 bg-zinc-950/40'
                        : 'border-zinc-800 hover:border-[#c5a059]/40'
                    }`}
                  >
                    {/* Level label & count */}
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 font-mono">
                        {lvl === 1 ? '1st' : lvl === 2 ? '2nd' : lvl === 3 ? '3rd' : `${lvl}th`}
                      </span>
                      <span
                        className={`text-xs font-mono font-bold ${
                          isCompletelyDepleted ? 'text-zinc-500' : 'text-[#c5a059]'
                        }`}
                      >
                        {s.current}/{s.max}
                      </span>
                    </div>

                    {/* Orbs */}
                    <div className="flex items-center justify-center gap-1.5 my-1.5 flex-wrap max-w-[100px]">
                      {Array.from({ length: s.max }).map((_, idx) => {
                        const isAvailable = idx < s.current;
                        return (
                          <button
                            key={idx}
                            onClick={() => onAdjustSlot(lvl, isAvailable ? -1 : 1)}
                            className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border transition-all transform active:scale-90 ${
                              isAvailable
                                ? 'bg-[#c5a059] border-[#e2cc9b] shadow-[0_0_8px_rgba(197,160,89,0.6)]'
                                : 'bg-zinc-800 border-zinc-700 opacity-40 hover:opacity-80'
                            }`}
                            title={isAvailable ? `Expend Level ${lvl} slot` : `Restore Level ${lvl} slot`}
                          />
                        );
                      })}
                    </div>

                    {/* Plus / Minus quick buttons */}
                    <div className="flex items-center justify-between gap-1 mt-1 pt-1 border-t border-zinc-800/80">
                      <button
                        onClick={() => onAdjustSlot(lvl, -1)}
                        disabled={s.current <= 0}
                        className="flex-1 py-0.5 flex items-center justify-center rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 disabled:opacity-25 text-zinc-300 transition-colors"
                        title="Use 1 slot"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onAdjustSlot(lvl, 1)}
                        disabled={s.current >= s.max}
                        className="flex-1 py-0.5 flex items-center justify-center rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 disabled:opacity-25 text-zinc-300 transition-colors"
                        title="Restore 1 slot"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-2 text-xs text-zinc-500 italic flex items-center gap-2">
                <span>No spell slots configured for this level.</span>
                <button
                  onClick={onConfigureSlots}
                  className="text-[#c5a059] underline hover:text-[#d4af37]"
                >
                  Configure slots
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Compact Mini Slot Bar when Collapsed */
          <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
            {activeLevels.map((lvl) => {
              const s = slots[lvl as keyof SpellSlotState] as { max: number; current: number };
              return (
                <button
                  key={lvl}
                  onClick={() => onAdjustSlot(lvl, s.current > 0 ? -1 : 1)}
                  className={`text-[11px] font-mono px-2 py-0.5 rounded border transition-colors flex items-center gap-1.5 ${
                    s.current > 0
                      ? 'bg-zinc-900 border-[#c5a059]/40 text-[#c5a059]'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-600 opacity-60'
                  }`}
                  title={`Level ${lvl}: ${s.current}/${s.max} slots. Click to use/restore.`}
                >
                  <span>L{lvl}:</span>
                  <span className="font-bold">{s.current}/{s.max}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
