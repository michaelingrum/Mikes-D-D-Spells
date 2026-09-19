import confetti from 'canvas-confetti';
import { Layers, RotateCcw, Sparkles, Sun, X, Zap } from 'lucide-react';
import React from 'react';
import { CharacterFeature, SpellSlotState } from '../types';

interface ShortRestModalProps {
  slots: SpellSlotState;
  features?: CharacterFeature[];
  onClose: () => void;
  onConfirmRest: () => void;
}

export const ShortRestModal: React.FC<ShortRestModalProps> = ({
  slots,
  features = [],
  onClose,
  onConfirmRest,
}) => {
  // Count how many Pact slots will be recovered
  const pactSlotsToRecover = slots.pact ? slots.pact.max - slots.pact.current : 0;

  // Short rest features that need replenishment
  const shortRestFeatures = features.filter((f) => f.resetType === 'short');
  const recoveringFeatures = shortRestFeatures.filter((f) => f.current < f.max);

  const handleRest = () => {
    confetti({
      particleCount: 40,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#fbbf24', '#d97706', '#ffffff'],
    });
    onConfirmRest();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#121212] border border-zinc-800 rounded-2xl p-5 shadow-2xl overflow-hidden text-center">
        {/* Top Amber Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Title */}
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-950/40 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg">
          <RotateCcw className="w-6 h-6" />
        </div>

        <h2 className="text-lg font-serif font-bold text-amber-300 mb-1">
          Take a Short Rest
        </h2>
        <p className="text-xs text-zinc-400 mb-4 max-w-xs mx-auto">
          A period of downtime, at least 1 hour long. You catch your breath, bandage wounds, and regain short-rest abilities and pact magic.
        </p>

        {/* Recovery details */}
        <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2 mb-5 text-left">
          {slots.pact && slots.pact.max > 0 ? (
            <div className="flex items-center justify-between text-xs text-zinc-300 font-mono">
              <span className="flex items-center gap-1.5 text-zinc-300 font-sans">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Warlock Pact Slots:
              </span>
              <strong className="text-amber-400 font-mono text-sm">
                {pactSlotsToRecover > 0 ? `+${pactSlotsToRecover} Slot(s)` : 'Full'}
              </strong>
            </div>
          ) : null}

          {/* Features to restore */}
          <div className="flex items-center justify-between text-xs text-zinc-300 font-mono">
            <span className="flex items-center gap-1.5 text-zinc-300 font-sans">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              Short-Rest Features:
            </span>
            <strong className="text-amber-300 font-mono text-sm">
              {recoveringFeatures.length > 0
                ? `Refill ${recoveringFeatures.length}`
                : shortRestFeatures.length > 0
                ? 'All Ready'
                : 'None configured'}
            </strong>
          </div>

          {/* List feature names */}
          {shortRestFeatures.length > 0 && (
            <div className="pt-2 border-t border-zinc-800 space-y-1">
              <span className="text-[10px] uppercase font-mono text-zinc-500 tracking-wider block">
                Short-Rest Trackers
              </span>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {shortRestFeatures.map((f) => (
                  <span
                    key={f.id}
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      f.current < f.max
                        ? 'bg-amber-950/50 border-amber-700/50 text-amber-300'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    {f.name} ({f.current} &rarr; {f.max})
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-zinc-500 pt-1.5 border-t border-zinc-800">
            <span className="flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-500/70" />
              Duration:
            </span>
            <span className="font-mono">1 hour</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-center gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleRest}
            className="flex-1 py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-black text-xs font-bold transition-all shadow-lg shadow-amber-950/40 flex items-center justify-center gap-1.5 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 fill-black" />
            <span>Finish Short Rest</span>
          </button>
        </div>
      </div>
    </div>
  );
};
