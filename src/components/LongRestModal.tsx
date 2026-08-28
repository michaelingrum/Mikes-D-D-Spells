import confetti from 'canvas-confetti';
import { Moon, Sparkles, Sun, X, Zap } from 'lucide-react';
import React from 'react';
import { SpellSlotState } from '../types';

interface LongRestModalProps {
  slots: SpellSlotState;
  onClose: () => void;
  onConfirmRest: () => void;
}

export const LongRestModal: React.FC<LongRestModalProps> = ({
  slots,
  onClose,
  onConfirmRest,
}) => {
  // Count how many slots will be recovered
  let slotsToRecover = 0;
  for (let i = 1; i <= 9; i++) {
    const s = slots[i as keyof SpellSlotState] as { max: number; current: number };
    if (s && s.max > 0) {
      slotsToRecover += s.max - s.current;
    }
  }
  if (slots.pact) {
    slotsToRecover += slots.pact.max - slots.pact.current;
  }

  const handleRest = () => {
    confetti({
      particleCount: 60,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#c5a059', '#dfc384', '#ffffff', '#eab308'],
    });
    onConfirmRest();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#121212] border border-zinc-800 rounded-2xl p-5 shadow-2xl overflow-hidden text-center">
        {/* Top Gold Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#c5a059] via-[#dfc384] to-[#c5a059]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Moon Icon */}
        <div className="w-14 h-14 mx-auto rounded-2xl bg-zinc-900 border border-[#c5a059]/40 flex items-center justify-center shadow-lg mb-3 mt-2">
          <Moon className="w-7 h-7 text-[#c5a059]" />
        </div>

        <h2 className="text-xl font-serif font-bold text-[#c5a059] tracking-tight mb-1">
          Take a Long Rest
        </h2>
        <p className="text-xs text-zinc-400 mb-4 max-w-xs mx-auto">
          A period of extended downtime, at least 8 hours long. You will awake refreshed with all magical spell slots restored.
        </p>

        {/* Recovery details */}
        <div className="bg-[#161616] border border-zinc-800 rounded-xl p-3.5 mb-5 space-y-2 text-left">
          <div className="flex items-center justify-between text-xs text-zinc-300 font-mono">
            <span className="flex items-center gap-1.5 text-zinc-300 font-sans">
              <Zap className="w-3.5 h-3.5 text-[#c5a059]" />
              Spell Slots to Restore:
            </span>
            <strong className="text-[#c5a059] font-mono text-sm">
              +{slotsToRecover} slots
            </strong>
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-400 pt-1.5 border-t border-zinc-800">
            <span className="flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              Hit Points & Hit Dice:
            </span>
            <span className="text-zinc-200 font-medium">Fully Replenished</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold transition-colors border border-zinc-800"
          >
            Cancel
          </button>

          <button
            onClick={handleRest}
            className="flex-1 py-2.5 rounded-lg bg-[#c5a059] hover:bg-[#d4af37] text-black text-xs font-bold shadow-lg flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <Moon className="w-4 h-4 text-black fill-black" />
            <span>Awaken Rested</span>
          </button>
        </div>
      </div>
    </div>
  );
};
