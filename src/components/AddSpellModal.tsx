import { Plus, Sparkles, X } from 'lucide-react';
import React, { useState } from 'react';
import { PreparationStatus, SchoolCode, Spell } from '../types';
import { SCHOOL_MAP } from '../utils/textParser';

interface AddSpellModalProps {
  onClose: () => void;
  onAddSpell: (spell: Omit<Spell, 'id'>) => void;
}

export const AddSpellModal: React.FC<AddSpellModalProps> = ({
  onClose,
  onAddSpell,
}) => {
  const [name, setName] = useState('');
  const [level, setLevel] = useState<number>(1);
  const [school, setSchool] = useState<SchoolCode>('V');
  const [castingTimeNumber, setCastingTimeNumber] = useState<number>(1);
  const [castingTimeUnit, setCastingTimeUnit] = useState<string>('action');
  const [rangeType, setRangeType] = useState<string>('point');
  const [rangeDistance, setRangeDistance] = useState<number>(60);
  const [hasV, setHasV] = useState(true);
  const [hasS, setHasS] = useState(true);
  const [hasM, setHasM] = useState(false);
  const [materialText, setMaterialText] = useState('');
  const [durationAmount, setDurationAmount] = useState<number>(1);
  const [durationType, setDurationType] = useState<string>('instant');
  const [isConcentration, setIsConcentration] = useState(false);
  const [isRitual, setIsRitual] = useState(false);
  const [entriesText, setEntriesText] = useState('');
  const [higherLevelsText, setHigherLevelsText] = useState('');
  const [prepStatus, setPrepStatus] = useState<PreparationStatus>('prepared');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newSpell: Omit<Spell, 'id'> = {
      name: name.trim(),
      level,
      school,
      source: 'Homebrew',
      time: [{ number: castingTimeNumber, unit: castingTimeUnit }],
      range: {
        type: rangeType,
        distance: rangeType === 'touch' || rangeType === 'self' ? { type: rangeType } : { type: 'feet', amount: rangeDistance },
      },
      components: {
        v: hasV,
        s: hasS,
        m: hasM ? materialText || 'a pinch of dust' : undefined,
      },
      duration: [
        durationType === 'instant'
          ? { type: 'instant' }
          : {
              type: 'timed',
              duration: { type: durationType, amount: durationAmount },
              concentration: isConcentration,
            },
      ],
      meta: isRitual ? { ritual: true } : undefined,
      entries: entriesText ? entriesText.split('\n\n').filter(Boolean) : ['Custom homebrew spell.'],
      entriesHigherLevel: higherLevelsText
        ? [
            {
              type: 'entries',
              name: 'At Higher Levels',
              entries: [higherLevelsText],
            },
          ]
        : undefined,
      preparationStatus: level === 0 ? 'always_available' : prepStatus,
    };

    onAddSpell(newSpell);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl max-h-[92vh] bg-[#121212] border border-zinc-800 rounded-2xl p-5 shadow-2xl flex flex-col overflow-hidden">
        {/* Top Gold Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#c5a059] via-[#dfc384] to-[#c5a059]" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-[#c5a059]/40 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#c5a059]" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-[#c5a059]">Add New Spell</h2>
              <p className="text-xs text-zinc-400">
                Create a custom homebrew or reference spell
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto space-y-4 pr-1">
          {/* Name & Level */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1 font-mono">
                Spell Name: *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Arcane Barrier"
                className="w-full px-3 py-2 bg-[#161616] border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-[#c5a059]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1 font-mono">
                Level:
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-[#161616] border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-[#c5a059]"
              >
                <option value={0}>Cantrip (0)</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => (
                  <option key={lvl} value={lvl}>
                    Level {lvl}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* School & Initial Preparation Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1 font-mono">
                Magic School:
              </label>
              <select
                value={school}
                onChange={(e) => setSchool(e.target.value as SchoolCode)}
                className="w-full px-3 py-2 bg-[#161616] border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-[#c5a059]"
              >
                {Object.entries(SCHOOL_MAP).map(([code, info]) => (
                  <option key={code} value={code}>
                    {info.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1 font-mono">
                Initial Status:
              </label>
              <select
                disabled={level === 0}
                value={prepStatus}
                onChange={(e) => setPrepStatus(e.target.value as PreparationStatus)}
                className="w-full px-3 py-2 bg-[#161616] border border-zinc-700 rounded-xl text-sm text-zinc-100 disabled:opacity-50 focus:outline-none focus:border-[#c5a059]"
              >
                <option value="prepared">Prepared</option>
                <option value="always_available">Always Available</option>
                <option value="unprepared">Unprepared (Spellbook)</option>
              </select>
            </div>
          </div>

          {/* Casting Time & Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1 font-mono">
                Casting Time:
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={1}
                  value={castingTimeNumber}
                  onChange={(e) => setCastingTimeNumber(parseInt(e.target.value) || 1)}
                  className="w-16 px-2 py-2 bg-[#161616] border border-zinc-700 rounded-xl text-sm text-center font-mono text-zinc-100"
                />
                <select
                  value={castingTimeUnit}
                  onChange={(e) => setCastingTimeUnit(e.target.value)}
                  className="flex-1 px-2 py-2 bg-[#161616] border border-zinc-700 rounded-xl text-sm text-zinc-100"
                >
                  <option value="action">Action</option>
                  <option value="bonus action">Bonus Action</option>
                  <option value="reaction">Reaction</option>
                  <option value="minute">Minute</option>
                  <option value="hour">Hour</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1 font-mono">
                Range:
              </label>
              <div className="flex gap-2">
                <select
                  value={rangeType}
                  onChange={(e) => setRangeType(e.target.value)}
                  className="flex-1 px-2 py-2 bg-[#161616] border border-zinc-700 rounded-xl text-sm text-zinc-100"
                >
                  <option value="point">Distance (ft)</option>
                  <option value="self">Self</option>
                  <option value="touch">Touch</option>
                  <option value="sight">Sight</option>
                </select>
                {rangeType === 'point' && (
                  <input
                    type="number"
                    min={5}
                    step={5}
                    value={rangeDistance}
                    onChange={(e) => setRangeDistance(parseInt(e.target.value) || 30)}
                    className="w-20 px-2 py-2 bg-[#161616] border border-zinc-700 rounded-xl text-sm text-center font-mono text-zinc-100"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Components & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1 font-mono">
                Components:
              </label>
              <div className="flex items-center gap-3 pt-1">
                <label className="flex items-center gap-1.5 text-xs text-zinc-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasV}
                    onChange={(e) => setHasV(e.target.checked)}
                    className="accent-[#c5a059]"
                  />
                  <span>V (Verbal)</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-zinc-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasS}
                    onChange={(e) => setHasS(e.target.checked)}
                    className="accent-[#c5a059]"
                  />
                  <span>S (Somatic)</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-zinc-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasM}
                    onChange={(e) => setHasM(e.target.checked)}
                    className="accent-[#c5a059]"
                  />
                  <span>M (Material)</span>
                </label>
              </div>
              {hasM && (
                <input
                  type="text"
                  placeholder="e.g. a diamond worth 100gp"
                  value={materialText}
                  onChange={(e) => setMaterialText(e.target.value)}
                  className="w-full mt-2 px-3 py-1.5 bg-[#161616] border border-zinc-700 rounded-lg text-xs text-zinc-200"
                />
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1 font-mono">
                Flags:
              </label>
              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-1.5 text-xs text-amber-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isConcentration}
                    onChange={(e) => setIsConcentration(e.target.checked)}
                    className="accent-[#c5a059]"
                  />
                  <span>Concentration</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-[#c5a059] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRitual}
                    onChange={(e) => setIsRitual(e.target.checked)}
                    className="accent-[#c5a059]"
                  />
                  <span>Ritual</span>
                </label>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1 font-mono">
              Spell Description:
            </label>
            <textarea
              rows={4}
              value={entriesText}
              onChange={(e) => setEntriesText(e.target.value)}
              placeholder="Describe the spell effect, damage, conditions, and saving throws..."
              className="w-full p-3 bg-[#161616] border border-zinc-700 rounded-xl text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-[#c5a059]"
            />
          </div>

          {/* Higher Levels */}
          <div>
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1 font-mono">
              At Higher Levels (Optional):
            </label>
            <input
              type="text"
              value={higherLevelsText}
              onChange={(e) => setHigherLevelsText(e.target.value)}
              placeholder="e.g. Damage increases by 1d8 for each slot level above 2nd."
              className="w-full px-3 py-2 bg-[#161616] border border-zinc-700 rounded-xl text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-[#c5a059]"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold transition-colors border border-zinc-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#c5a059] hover:bg-[#d4af37] text-black text-xs font-bold shadow-lg flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 text-black" />
              <span>Save & Add Spell</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
