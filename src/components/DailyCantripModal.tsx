import confetti from 'canvas-confetti';
import { BookOpen, Check, Lock, Plus, Sparkles, Wand2, X, Zap } from 'lucide-react';
import React from 'react';
import { Spell } from '../types';
import { clean5eTags, formatCastingTime, formatRange, getSchoolInfo } from '../utils/textParser';

interface DailyCantripModalProps {
  cantrips: Spell[];
  onClose: () => void;
  onSelectDailyCantrip: (spellId: string) => void;
  onSetPrep: (spellId: string, status: 'prepared' | 'always_available' | 'unprepared') => void;
  onOpenAddSpell: () => void;
  onOpenSpellDetail: (spell: Spell) => void;
}

export const DailyCantripModal: React.FC<DailyCantripModalProps> = ({
  cantrips,
  onClose,
  onSelectDailyCantrip,
  onSetPrep,
  onOpenAddSpell,
  onOpenSpellDetail,
}) => {
  const preparedCantrips = cantrips.filter((s) => s.preparationStatus === 'prepared');
  const fixedCantrips = cantrips.filter((s) => s.preparationStatus === 'always_available');
  const reserveCantrips = cantrips.filter((s) => s.preparationStatus === 'unprepared' || !s.preparationStatus);

  const handleChoose = (spell: Spell) => {
    confetti({
      particleCount: 45,
      spread: 70,
      origin: { y: 0.65 },
      colors: ['#c5a059', '#dfc384', '#ffffff', '#eab308'],
    });
    onSelectDailyCantrip(spell.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[92vh] bg-[#121212] border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slideUp">
        {/* Top Gold Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#c5a059] via-[#dfc384] to-[#c5a059]" />

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-start justify-between gap-3 bg-[#161616]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-[#c5a059]/40 flex items-center justify-center shadow-md shadow-black flex-shrink-0">
              <Wand2 className="w-5 h-5 text-[#c5a059]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-serif font-bold text-[#c5a059] tracking-tight">
                  Choose Daily Cantrip
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-[#dfc384] border border-[#c5a059]/30">
                  1 / Long Rest
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Swap your prepared cantrip for the day while keeping fixed cantrips always ready
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

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-sm text-zinc-200">
          {/* Quick Helper Banner */}
          <div className="p-3 rounded-xl bg-[#18181b] border border-zinc-800 text-xs text-zinc-300 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-[#c5a059] flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-[#c5a059]">How this works:</strong> Cantrips you cannot change are marked{' '}
              <span className="text-amber-300 font-semibold">Always Available</span> (★). Use this modal once per day to choose which reserve cantrip is{' '}
              <span className="text-[#c5a059] font-semibold">Prepared</span> (✓) for today.
            </p>
          </div>

          {/* Section 1: Current Daily Prepared Cantrip */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#c5a059] flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#c5a059]" />
                <span>Today&apos;s Prepared Cantrip ({preparedCantrips.length})</span>
              </h3>
            </div>

            {preparedCantrips.length > 0 ? (
              <div className="grid grid-cols-1 gap-2">
                {preparedCantrips.map((spell) => {
                  const school = getSchoolInfo(spell.school);
                  const castTime = formatCastingTime(spell.time);
                  const range = formatRange(spell.range);

                  return (
                    <div
                      key={spell.id}
                      className="p-3 rounded-xl bg-gradient-to-r from-[#1b1710] to-[#161616] border border-[#c5a059] flex items-center justify-between gap-3 shadow-md"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-serif font-bold text-base text-[#dfc384]">
                            {spell.name}
                          </span>
                          <span
                            className={`text-[10px] font-medium px-1.5 py-0.2 rounded border ${school.bgLight} ${school.color} ${school.border}`}
                          >
                            {school.name}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#c5a059]/20 text-[#c5a059] border border-[#c5a059]/40 font-bold">
                            Active Choice
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 font-mono">
                          {castTime} • {range}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => onOpenSpellDetail(spell)}
                          className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium border border-zinc-700"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => onSetPrep(spell.id, 'unprepared')}
                          className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs border border-zinc-800"
                          title="Unprepare back to reserve"
                        >
                          Unprepare
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-zinc-800 bg-[#141414] text-center">
                <p className="text-xs text-zinc-400">
                  No daily cantrip currently prepared. Select one from your reserve below!
                </p>
              </div>
            )}
          </div>

          {/* Section 2: Reserve / Available Cantrips to Swap into */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
                <span>Reserve Cantrips in Spellbook ({reserveCantrips.length})</span>
              </h3>
              <button
                onClick={onOpenAddSpell}
                className="text-xs text-[#c5a059] hover:text-[#dfc384] font-medium flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>Add Cantrip</span>
              </button>
            </div>

            {reserveCantrips.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {reserveCantrips.map((spell) => {
                  const school = getSchoolInfo(spell.school);
                  let preview = '';
                  if (spell.entries?.[0]) {
                    preview = clean5eTags(typeof spell.entries[0] === 'string' ? spell.entries[0] : '');
                  }

                  return (
                    <div
                      key={spell.id}
                      className="p-3 rounded-xl bg-[#161616] hover:bg-[#1a1a1e] border border-zinc-800 flex flex-col justify-between gap-2.5 transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className="font-serif font-bold text-sm text-zinc-200 hover:text-[#c5a059] cursor-pointer" onClick={() => onOpenSpellDetail(spell)}>
                            {spell.name}
                          </h4>
                          <span
                            className={`text-[9px] font-medium px-1.5 py-0.2 rounded border ${school.bgLight} ${school.color} ${school.border}`}
                          >
                            {school.name}
                          </span>
                        </div>
                        {preview && (
                          <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                            {preview}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-800/80">
                        <button
                          onClick={() => onSetPrep(spell.id, 'always_available')}
                          className="text-[10px] text-zinc-500 hover:text-amber-300 transition-colors"
                          title="Mark as permanent fixed cantrip"
                        >
                          Make Fixed ★
                        </button>

                        <button
                          onClick={() => handleChoose(spell)}
                          className="px-3 py-1.5 rounded-lg bg-[#c5a059] hover:bg-[#d4af37] text-black text-xs font-bold shadow-md flex items-center gap-1 active:scale-95 transition-all"
                        >
                          <Zap className="w-3 h-3 fill-black text-black" />
                          <span>Prepare for Today</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-zinc-800 bg-[#141414] text-center space-y-2">
                <p className="text-xs text-zinc-400">
                  No reserve cantrips in your spellbook yet.
                </p>
                <button
                  onClick={onOpenAddSpell}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-[#c5a059]/40 text-[#c5a059] text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Cantrips to Spellbook</span>
                </button>
              </div>
            )}
          </div>

          {/* Section 3: Fixed Cantrips (Cannot Change) */}
          <div className="space-y-2 pt-2 border-t border-zinc-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300/80 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Fixed Cantrips ({fixedCantrips.length})</span>
              </h3>
              <span className="text-[10px] text-zinc-500 font-mono">Always Available / Permanent</span>
            </div>

            {fixedCantrips.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {fixedCantrips.map((spell) => {
                  const school = getSchoolInfo(spell.school);

                  return (
                    <div
                      key={spell.id}
                      className="p-2.5 rounded-xl bg-[#161616] border border-amber-900/30 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-serif font-bold text-sm text-zinc-200 truncate">
                            {spell.name}
                          </span>
                          <span className="text-[10px] text-amber-400">★</span>
                        </div>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {school.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => onOpenSpellDetail(spell)}
                          className="px-2 py-1 rounded bg-zinc-900 text-zinc-300 text-[11px] hover:bg-zinc-800 border border-zinc-800"
                        >
                          View
                        </button>
                        <button
                          onClick={() => onSetPrep(spell.id, 'unprepared')}
                          className="px-2 py-1 rounded bg-zinc-900 text-zinc-500 hover:text-zinc-300 text-[11px] border border-zinc-800"
                          title="Convert to swappable reserve cantrip"
                        >
                          Make Swappable
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 italic">No fixed cantrips designated.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-[#161616] flex items-center justify-between">
          <button
            onClick={onOpenAddSpell}
            className="px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-[#c5a059] text-xs font-semibold border border-[#c5a059]/40 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Cantrip</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-[#c5a059] hover:bg-[#d4af37] text-black text-xs font-bold shadow-md transition-all active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
