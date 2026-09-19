import {
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Flame,
  Info,
  Layers,
  Minus,
  Moon,
  Plus,
  RotateCcw,
  Sparkles,
  Zap,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { CharacterFeature } from '../types';
import { FeatureSortOption, SORT_OPTION_LABELS, sortFeaturesList } from '../utils/featureUtils';

interface FeaturesTrackerStripProps {
  features: CharacterFeature[];
  onAdjustFeature: (id: string, delta: number) => void;
  onSetFeatureCurrent: (id: string, value: number) => void;
  onResetFeature: (id: string) => void;
  onOpenFeaturesManager: () => void;
  onReorderFeatures?: (features: CharacterFeature[]) => void;
  onTakeShortRest?: () => void;
}

export const FeaturesTrackerStrip: React.FC<FeaturesTrackerStripProps> = ({
  features,
  onAdjustFeature,
  onSetFeatureCurrent,
  onResetFeature,
  onOpenFeaturesManager,
  onReorderFeatures,
  onTakeShortRest,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);

  // Spend modal/prompt for numeric pools (e.g. Lay on Hands)
  const [customSpendId, setCustomSpendId] = useState<string | null>(null);
  const [spendAmount, setSpendAmount] = useState<number>(5);

  const shortRestFeaturesCount = features.filter((f) => f.resetType === 'short').length;

  const handleQuickSort = (option: FeatureSortOption) => {
    setIsSortMenuOpen(false);
    if (onReorderFeatures) {
      const sorted = sortFeaturesList(features, option);
      onReorderFeatures(sorted);
    }
  };

  const checkScroll = () => {
    if (!scrollerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollerRef.current;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [features, isExpanded]);

  const scrollByAmount = (delta: number) => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollBy({ left: delta, behavior: 'smooth' });
    }
  };

  // Theme helper for badge styling
  const getThemeStyles = (theme?: string) => {
    switch (theme) {
      case 'emerald':
        return {
          cardBorder: 'hover:border-emerald-500/40',
          badge: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/40',
          pipActive: 'bg-emerald-400 border-emerald-200 shadow-[0_0_8px_rgba(52,211,153,0.6)]',
          textActive: 'text-emerald-300',
        };
      case 'violet':
        return {
          cardBorder: 'hover:border-purple-500/40',
          badge: 'text-purple-300 border-purple-500/30 bg-purple-950/40',
          pipActive: 'bg-purple-400 border-purple-200 shadow-[0_0_8px_rgba(192,132,252,0.6)]',
          textActive: 'text-purple-300',
        };
      case 'crimson':
        return {
          cardBorder: 'hover:border-rose-500/40',
          badge: 'text-rose-400 border-rose-500/30 bg-rose-950/40',
          pipActive: 'bg-rose-500 border-rose-200 shadow-[0_0_8px_rgba(244,63,94,0.6)]',
          textActive: 'text-rose-300',
        };
      case 'blue':
        return {
          cardBorder: 'hover:border-sky-500/40',
          badge: 'text-sky-400 border-sky-500/30 bg-sky-950/40',
          pipActive: 'bg-sky-400 border-sky-200 shadow-[0_0_8px_rgba(56,189,248,0.6)]',
          textActive: 'text-sky-300',
        };
      case 'amber':
        return {
          cardBorder: 'hover:border-amber-500/40',
          badge: 'text-amber-400 border-amber-500/30 bg-amber-950/40',
          pipActive: 'bg-amber-400 border-amber-200 shadow-[0_0_8px_rgba(251,191,36,0.6)]',
          textActive: 'text-amber-300',
        };
      case 'gold':
      default:
        return {
          cardBorder: 'hover:border-[#c5a059]/40',
          badge: 'text-[#c5a059] border-[#c5a059]/30 bg-amber-950/30',
          pipActive: 'bg-[#c5a059] border-[#f0dfba] shadow-[0_0_8px_rgba(197,160,89,0.6)]',
          textActive: 'text-[#c5a059]',
        };
    }
  };

  return (
    <div className="bg-[#0f0f10] border-b border-zinc-800/80 px-3 py-2 sm:px-6 transition-all">
      <div className="max-w-7xl mx-auto">
        {/* Section Bar Header */}
        <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 text-xs font-serif uppercase tracking-widest text-[#dfc384] font-bold">
              <Layers className="w-3.5 h-3.5 text-[#c5a059]" />
              Limited-Use Features
            </span>
            <span className="text-xs text-zinc-400 font-mono bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
              {features.length} {features.length === 1 ? 'tracker' : 'trackers'} active
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Quick Short Rest trigger if available */}
            {onTakeShortRest && (
              <button
                onClick={onTakeShortRest}
                className="text-[11px] px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-amber-300 hover:text-amber-200 border border-amber-700/50 flex items-center gap-1 transition-all shadow-sm"
                title="Take Short Rest (Restore short-rest features and pact slots)"
              >
                <RotateCcw className="w-3 h-3 text-amber-400" />
                <span>Short Rest</span>
                {shortRestFeaturesCount > 0 && (
                  <span className="text-[9px] font-mono px-1 rounded bg-amber-950/60 text-amber-300">
                    {shortRestFeaturesCount}
                  </span>
                )}
              </button>
            )}

            {/* Sort Menu Dropdown */}
            {onReorderFeatures && features.length > 1 && (
              <div className="relative">
                <button
                  onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
                  className="text-[11px] px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 flex items-center gap-1 transition-all shadow-sm"
                  title="Sort active features"
                >
                  <ArrowUpDown className="w-3 h-3 text-[#c5a059]" />
                  <span className="hidden xs:inline">Sort</span>
                </button>

                {isSortMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setIsSortMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 z-30 w-52 bg-[#141415] border border-zinc-700 rounded-xl p-1.5 shadow-2xl space-y-0.5 animate-fadeIn text-left">
                      <div className="px-2 py-1 text-[10px] font-mono text-zinc-400 uppercase tracking-wider border-b border-zinc-800 mb-1">
                        Sort Features By
                      </div>
                      <button
                        onClick={() => handleQuickSort('short-first')}
                        className="w-full text-left px-2 py-1.5 rounded-lg text-xs text-zinc-300 hover:text-amber-300 hover:bg-zinc-800/80 transition-colors flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3 h-3 text-amber-400 flex-shrink-0" />
                        <span>Short Rest First</span>
                      </button>
                      <button
                        onClick={() => handleQuickSort('long-first')}
                        className="w-full text-left px-2 py-1.5 rounded-lg text-xs text-zinc-300 hover:text-red-300 hover:bg-zinc-800/80 transition-colors flex items-center gap-1.5"
                      >
                        <Moon className="w-3 h-3 text-red-400 flex-shrink-0" />
                        <span>Long Rest First</span>
                      </button>
                      <button
                        onClick={() => handleQuickSort('name-asc')}
                        className="w-full text-left px-2 py-1.5 rounded-lg text-xs text-zinc-300 hover:text-[#c5a059] hover:bg-zinc-800/80 transition-colors flex items-center gap-1.5"
                      >
                        <span className="font-mono text-[10px] font-bold text-[#c5a059]">AZ</span>
                        <span>Name (A to Z)</span>
                      </button>
                      <button
                        onClick={() => handleQuickSort('depleted-first')}
                        className="w-full text-left px-2 py-1.5 rounded-lg text-xs text-zinc-300 hover:text-amber-300 hover:bg-zinc-800/80 transition-colors flex items-center gap-1.5"
                      >
                        <Flame className="w-3 h-3 text-amber-400 flex-shrink-0" />
                        <span>Depleted First</span>
                      </button>
                      <button
                        onClick={() => handleQuickSort('category')}
                        className="w-full text-left px-2 py-1.5 rounded-lg text-xs text-zinc-300 hover:text-purple-300 hover:bg-zinc-800/80 transition-colors flex items-center gap-1.5"
                      >
                        <Layers className="w-3 h-3 text-purple-400 flex-shrink-0" />
                        <span>Category (Class, Feat...)</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            <button
              onClick={onOpenFeaturesManager}
              className="text-[11px] px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-[#c5a059] hover:text-[#dfc384] border border-[#c5a059]/40 flex items-center gap-1 transition-all shadow-sm"
              title="Add, edit, or configure feature trackers and 5e presets"
            >
              <Plus className="w-3 h-3 text-[#c5a059]" />
              <span className="hidden sm:inline">Manage</span>
              <span className="sm:hidden">Edit</span>
            </button>

            {/* Collapse toggle */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
              aria-label={isExpanded ? 'Collapse features tracker' : 'Expand features tracker'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Expanded View */}
        {isExpanded ? (
          <div className="relative group/feat">
            {canScrollLeft && (
              <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center pr-2 bg-gradient-to-r from-[#0f0f10] via-[#0f0f10]/90 to-transparent">
                <button
                  onClick={() => scrollByAmount(-180)}
                  className="w-5 h-8 rounded bg-zinc-900 border border-zinc-700 text-[#c5a059] flex items-center justify-center shadow-md hover:bg-zinc-800 transition-colors"
                  title="Scroll features left"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div
              ref={scrollerRef}
              onScroll={checkScroll}
              className="flex items-stretch gap-2.5 overflow-x-auto pb-1.5 pt-1 overscroll-x-contain touch-pan-x scrollbar-thin scrollbar-thumb-zinc-700/60 hover:scrollbar-thumb-[#c5a059]/60"
            >
              {features.length === 0 ? (
                <div className="py-2.5 px-3 rounded-lg bg-[#141415] border border-dashed border-zinc-800 text-xs text-zinc-400 flex items-center gap-3">
                  <span>No feature trackers set up. Track Flash of Genius, Sorcery Points, Lay on Hands & more!</span>
                  <button
                    onClick={onOpenFeaturesManager}
                    className="px-2.5 py-1 rounded bg-[#c5a059] text-black font-bold text-xs hover:bg-[#d4af37] transition-all flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3 fill-black text-black" />
                    <span>Setup Features</span>
                  </button>
                </div>
              ) : (
                features.map((f) => {
                  const styles = getThemeStyles(f.colorTheme);
                  const isDepleted = f.current <= 0;

                  return (
                    <div
                      key={f.id}
                      className={`flex-shrink-0 bg-[#161618] border rounded-lg p-2.5 min-w-[155px] max-w-[210px] shadow-sm flex flex-col justify-between transition-all ${
                        isDepleted
                          ? 'border-zinc-800/70 opacity-60 bg-zinc-950/50'
                          : `border-zinc-800 ${styles.cardBorder}`
                      }`}
                    >
                      {/* Card Title & Meta Info */}
                      <div>
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <h4
                            className="text-xs font-serif font-bold text-zinc-100 truncate flex-1 tracking-wide"
                            title={f.name}
                          >
                            {f.name}
                          </h4>

                          {f.description && (
                            <button
                              type="button"
                              onClick={() =>
                                setActiveTooltipId(activeTooltipId === f.id ? null : f.id)
                              }
                              className="text-zinc-500 hover:text-zinc-300 p-0.5"
                              title="Toggle feature rules"
                            >
                              <Info className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono mb-1.5">
                          <span
                            className={`px-1 py-0.2 rounded border ${styles.badge} uppercase text-[9px]`}
                          >
                            {f.resetType === 'long' ? 'Long Rest' : f.resetType === 'short' ? 'Short Rest' : f.resetType}
                          </span>
                          <span className={`font-bold ${isDepleted ? 'text-zinc-500' : styles.textActive}`}>
                            {f.current} / {f.max} {f.unitLabel ? f.unitLabel : ''}
                          </span>
                        </div>

                        {/* Rules accordion / tooltip */}
                        {activeTooltipId === f.id && f.description && (
                          <div className="p-2 mb-2 bg-zinc-950 border border-zinc-800 rounded text-[11px] text-zinc-300 leading-relaxed max-h-28 overflow-y-auto">
                            {f.description}
                          </div>
                        )}
                      </div>

                      {/* Display Mode 1: Interactive Pips (Orbs) */}
                      {f.displayType === 'pips' ? (
                        <div className="space-y-1.5 my-1">
                          <div className="flex items-center justify-center gap-1.5 flex-wrap min-h-[22px]">
                            {Array.from({ length: f.max }).map((_, idx) => {
                              const isAvailable = idx < f.current;
                              return (
                                <button
                                  key={idx}
                                  onClick={() => onAdjustFeature(f.id, isAvailable ? -1 : 1)}
                                  className={`w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full border transition-all transform active:scale-90 ${
                                    isAvailable
                                      ? styles.pipActive
                                      : 'bg-zinc-800 border-zinc-700 opacity-40 hover:opacity-80'
                                  }`}
                                  title={
                                    isAvailable
                                      ? `Use 1 ${f.unitLabel || 'charge'}`
                                      : `Restore 1 ${f.unitLabel || 'charge'}`
                                  }
                                />
                              );
                            })}
                          </div>

                          <div className="flex items-center justify-between gap-1 pt-1 border-t border-zinc-800/80">
                            <button
                              onClick={() => onAdjustFeature(f.id, -1)}
                              disabled={f.current <= 0}
                              className="flex-1 py-0.5 flex items-center justify-center rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 disabled:opacity-25 text-zinc-300 transition-colors"
                              title="Use 1"
                            >
                              <Minus className="w-3 h-3" />
                            </button>

                            <button
                              onClick={() => onResetFeature(f.id)}
                              className="px-1.5 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-amber-300 transition-colors text-[10px]"
                              title="Refill to max"
                            >
                              <RotateCcw className="w-2.5 h-2.5" />
                            </button>

                            <button
                              onClick={() => onAdjustFeature(f.id, 1)}
                              disabled={f.current >= f.max}
                              className="flex-1 py-0.5 flex items-center justify-center rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 disabled:opacity-25 text-zinc-300 transition-colors"
                              title="Restore 1"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Display Mode 2: Numeric Pool (e.g. Lay on Hands 25 HP) */
                        <div className="space-y-2 my-1">
                          {/* Progress bar visual */}
                          <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-800">
                            <div
                              className={`h-full transition-all ${
                                f.colorTheme === 'emerald'
                                  ? 'bg-emerald-400'
                                  : f.colorTheme === 'violet'
                                  ? 'bg-purple-400'
                                  : 'bg-[#c5a059]'
                              }`}
                              style={{ width: `${Math.min(100, Math.max(0, (f.current / f.max) * 100))}%` }}
                            />
                          </div>

                          {/* Quick spend row */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onAdjustFeature(f.id, -1)}
                              disabled={f.current <= 0}
                              className="flex-1 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 disabled:opacity-25 text-zinc-300 text-[10px] font-mono transition-colors"
                              title="Spend 1"
                            >
                              -1
                            </button>
                            <button
                              onClick={() => onAdjustFeature(f.id, -5)}
                              disabled={f.current < 5}
                              className="flex-1 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 disabled:opacity-25 text-zinc-300 text-[10px] font-mono transition-colors"
                              title="Spend 5 (e.g. cure disease/poison)"
                            >
                              -5
                            </button>
                            <button
                              onClick={() => setCustomSpendId(f.id)}
                              className="px-1.5 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-[10px] font-mono transition-colors"
                              title="Spend custom amount"
                            >
                              Spend...
                            </button>
                            <button
                              onClick={() => onResetFeature(f.id)}
                              className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-amber-300 transition-colors"
                              title="Refill to max"
                            >
                              <RotateCcw className="w-2.5 h-2.5" />
                            </button>
                          </div>

                          {/* Custom spend modal/inline prompt */}
                          {customSpendId === f.id && (
                            <div className="p-2 rounded bg-zinc-950 border border-zinc-800 space-y-1.5">
                              <div className="flex items-center justify-between text-[10px] text-zinc-400">
                                <span>Spend from pool:</span>
                                <button
                                  onClick={() => setCustomSpendId(null)}
                                  className="text-zinc-500 hover:text-zinc-300"
                                >
                                  Cancel
                                </button>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  min={1}
                                  max={f.current}
                                  value={spendAmount}
                                  onChange={(e) => setSpendAmount(parseInt(e.target.value) || 0)}
                                  className="w-14 px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-xs font-mono font-bold text-[#c5a059] focus:outline-none"
                                />
                                <button
                                  onClick={() => {
                                    onAdjustFeature(f.id, -spendAmount);
                                    setCustomSpendId(null);
                                  }}
                                  disabled={spendAmount <= 0 || spendAmount > f.current}
                                  className="flex-1 py-0.5 rounded bg-[#c5a059] hover:bg-[#d4af37] text-black text-xs font-bold transition-all disabled:opacity-40"
                                >
                                  Spend {spendAmount}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {canScrollRight && (
              <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center pl-2 bg-gradient-to-l from-[#0f0f10] via-[#0f0f10]/90 to-transparent">
                <button
                  onClick={() => scrollByAmount(180)}
                  className="w-5 h-8 rounded bg-zinc-900 border border-zinc-700 text-[#c5a059] flex items-center justify-center shadow-md hover:bg-zinc-800 transition-colors animate-pulse hover:animate-none"
                  title="Scroll features right"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Compact Collapsed Mode */
          <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
            {features.map((f) => (
              <button
                key={f.id}
                onClick={() => onAdjustFeature(f.id, f.current > 0 ? -1 : 1)}
                className={`text-[11px] font-mono px-2 py-0.5 rounded border transition-colors flex items-center gap-1.5 ${
                  f.current > 0
                    ? 'bg-zinc-900 border-[#c5a059]/40 text-[#dfc384]'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-600 opacity-60'
                }`}
                title={`${f.name}: ${f.current}/${f.max} left. Click to use/restore.`}
              >
                <span className="truncate max-w-[90px]">{f.name}:</span>
                <span className="font-bold">{f.current}/{f.max}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
