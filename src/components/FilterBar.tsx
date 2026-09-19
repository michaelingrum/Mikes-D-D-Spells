import { ChevronLeft, ChevronRight, Filter, RotateCcw, Search, Sparkles, Star, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { FilterOptions, PreparationFilterItem, Spell } from '../types';
import { SCHOOL_MAP } from '../utils/textParser';

interface FilterBarProps {
  filters: FilterOptions;
  onFilterChange: (filters: Partial<FilterOptions>) => void;
  onResetFilters: () => void;
  spells: Spell[];
}

/**
 * Reusable wrapper that adds visual fade masks, scroll arrows, and clear visual cues for horizontal scrolling
 */
const ScrollableRow: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (!containerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [children]);

  const scrollByAmount = (delta: number) => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: delta, behavior: 'smooth' });
    }
  };

  return (
    <div className={`relative group/row ${className}`}>
      {/* Left Scroll Button / Fade Indicator */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center pr-2 bg-gradient-to-r from-[#0f0f10] via-[#0f0f10]/90 to-transparent">
          <button
            onClick={() => scrollByAmount(-180)}
            className="w-5 h-7 rounded bg-zinc-900/90 border border-zinc-700 text-[#c5a059] flex items-center justify-center shadow-md hover:bg-zinc-800 transition-colors"
            title="Scroll left"
            aria-label="Scroll filters left"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Horizontally Scrollable Content with touch pan and styled thin scrollbar */}
      <div
        ref={containerRef}
        onScroll={checkScroll}
        className="flex items-center gap-1.5 overflow-x-auto py-1 overscroll-x-contain touch-pan-x scrollbar-thin scrollbar-thumb-zinc-700/60 hover:scrollbar-thumb-[#c5a059]/60 scrollbar-track-transparent"
      >
        {children}
      </div>

      {/* Right Scroll Button / Fade Indicator */}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center pl-2 bg-gradient-to-l from-[#0f0f10] via-[#0f0f10]/90 to-transparent">
          <button
            onClick={() => scrollByAmount(180)}
            className="w-5 h-7 rounded bg-zinc-900/90 border border-zinc-700 text-[#c5a059] flex items-center justify-center shadow-md hover:bg-zinc-800 transition-colors animate-pulse hover:animate-none"
            title="Scroll right"
            aria-label="Scroll filters right"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  spells,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Compute counts for quick badges
  const levelCounts: Record<string, number> = {
    all: spells.length,
    cantrips: spells.filter((s) => s.level === 0).length,
  };
  for (let i = 1; i <= 9; i++) {
    levelCounts[i.toString()] = spells.filter((s) => s.level === i).length;
  }

  const prepCounts = {
    all: spells.length,
    prepared: spells.filter((s) => s.level > 0 && s.preparationStatus === 'prepared').length,
    always_available: spells.filter(
      (s) => s.level === 0 || s.preparationStatus === 'always_available'
    ).length,
    unprepared: spells.filter((s) => s.level > 0 && s.preparationStatus === 'unprepared').length,
    favorites: spells.filter((s) => s.isFavorite).length,
    rituals: spells.filter((s) => s.meta?.ritual).length,
  };

  const isFiltered =
    filters.searchQuery !== '' ||
    filters.levels.length > 0 ||
    filters.schools.length > 0 ||
    filters.preparations.length > 0 ||
    filters.castingTimes.length > 0 ||
    filters.characterClasses.length > 0;

  const handleTogglePreparation = (item: PreparationFilterItem) => {
    const isSelected = filters.preparations.includes(item);
    const next = isSelected
      ? filters.preparations.filter((p) => p !== item)
      : [...filters.preparations, item];
    onFilterChange({ preparations: next });
  };

  const handleToggleLevel = (lvl: number) => {
    const isSelected = filters.levels.includes(lvl);
    const next = isSelected
      ? filters.levels.filter((l) => l !== lvl)
      : [...filters.levels, lvl];
    onFilterChange({ levels: next });
  };

  const handleToggleSchool = (code: string) => {
    const upper = code.toUpperCase();
    const isSelected = filters.schools.some((s) => s.toUpperCase() === upper);
    const next = isSelected
      ? filters.schools.filter((s) => s.toUpperCase() !== upper)
      : [...filters.schools, code];
    onFilterChange({ schools: next });
  };

  const handleToggleCastingTime = (time: string) => {
    const isSelected = filters.castingTimes.includes(time);
    const next = isSelected
      ? filters.castingTimes.filter((t) => t !== time)
      : [...filters.castingTimes, time];
    onFilterChange({ castingTimes: next });
  };

  const hasAdvancedActive = filters.schools.length > 0 || filters.castingTimes.length > 0;

  return (
    <div className="bg-[#0f0f10] border-b border-zinc-800 px-3 py-2.5 sm:px-6 space-y-2">
      <div className="max-w-7xl mx-auto space-y-2">
        {/* Search Bar & Preparation Pills */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search spells by name, text, tags..."
              value={filters.searchQuery}
              onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
              className="w-full pl-9 pr-8 py-2 bg-[#121212] border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059]/40 transition-all shadow-inner"
            />
            {filters.searchQuery && (
              <button
                onClick={() => onFilterChange({ searchQuery: '' })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Clear / Advanced Toggle */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            {isFiltered && (
              <button
                onClick={onResetFilters}
                className="px-2.5 py-2 text-xs rounded-lg bg-zinc-900 hover:bg-zinc-800 text-rose-300 hover:text-rose-200 flex items-center gap-1.5 transition-colors border border-rose-900/40"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden xs:inline text-[11px] uppercase tracking-wider font-semibold">Reset</span>
              </button>
            )}

            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`px-3 py-2 text-xs rounded-lg border flex items-center gap-1.5 transition-colors font-medium ${
                showAdvanced || hasAdvancedActive
                  ? 'bg-zinc-900 border-[#c5a059] text-[#c5a059] shadow-sm'
                  : 'bg-[#121212] border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Filter className="w-3.5 h-3.5 text-[#c5a059]" />
              <span className="text-[11px] uppercase tracking-wider">
                Schools & More {hasAdvancedActive && `(${filters.schools.length + filters.castingTimes.length})`}
              </span>
            </button>
          </div>
        </div>

        {/* Primary Filter Tabs: Preparation Status (Scrollable with visual indicators) */}
        <ScrollableRow>
          {/* All Spells Pill */}
          <button
            onClick={() => onFilterChange({ preparations: [] })}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              filters.preparations.length === 0
                ? 'bg-[#c5a059] text-black shadow-md font-bold'
                : 'bg-[#18181b] text-zinc-400 hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            <span>All Spells</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              filters.preparations.length === 0 ? 'bg-black/30 text-black font-bold' : 'bg-black/50 text-zinc-400'
            }`}>
              {prepCounts.all}
            </span>
          </button>

          {/* Prepared Pill */}
          <button
            onClick={() => handleTogglePreparation('prepared')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              filters.preparations.includes('prepared')
                ? 'bg-[#c5a059] text-black shadow-md font-bold ring-1 ring-[#c5a059]'
                : 'bg-[#18181b] text-zinc-300 hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${filters.preparations.includes('prepared') ? 'bg-black' : 'bg-[#c5a059]'}`} />
            <span>Prepared</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              filters.preparations.includes('prepared') ? 'bg-black/30 text-black font-bold' : 'bg-black/50 text-[#c5a059]'
            }`}>
              {prepCounts.prepared}
            </span>
          </button>

          {/* Always Available Pill */}
          <button
            onClick={() => handleTogglePreparation('always_available')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              filters.preparations.includes('always_available')
                ? 'bg-[#c5a059] text-black shadow-md font-bold ring-1 ring-[#c5a059]'
                : 'bg-[#18181b] text-amber-300 hover:bg-zinc-800 border border-amber-900/30'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Always Avail</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              filters.preparations.includes('always_available') ? 'bg-black/30 text-black font-bold' : 'bg-black/50 text-amber-200'
            }`}>
              {prepCounts.always_available}
            </span>
          </button>

          {/* Unprepared Pill */}
          <button
            onClick={() => handleTogglePreparation('unprepared')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              filters.preparations.includes('unprepared')
                ? 'bg-zinc-600 text-white font-bold ring-1 ring-zinc-400'
                : 'bg-[#18181b] text-zinc-400 hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            <span>Unprepared</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/50 font-mono text-zinc-400">
              {prepCounts.unprepared}
            </span>
          </button>

          {/* Favorites Pill */}
          <button
            onClick={() => handleTogglePreparation('favorites')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              filters.preparations.includes('favorites')
                ? 'bg-amber-400 text-black font-bold ring-1 ring-amber-300 shadow-md'
                : 'bg-[#18181b] text-amber-300 hover:bg-zinc-800 border border-amber-900/30'
            }`}
          >
            <Star className="w-3 h-3 fill-current" />
            <span>Favorites</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              filters.preparations.includes('favorites') ? 'bg-black/30 text-black font-bold' : 'bg-black/50 text-amber-200'
            }`}>
              {prepCounts.favorites}
            </span>
          </button>

          {/* Rituals Pill */}
          <button
            onClick={() => handleTogglePreparation('rituals')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              filters.preparations.includes('rituals')
                ? 'bg-teal-600 text-white font-bold ring-1 ring-teal-400 shadow-md'
                : 'bg-[#18181b] text-teal-300 hover:bg-zinc-800 border border-teal-900/30'
            }`}
          >
            <span>Rituals</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/50 font-mono">
              {prepCounts.rituals}
            </span>
          </button>
        </ScrollableRow>

        {/* Level Filter Tabs (0 to 9) (Scrollable with visual indicators) */}
        <ScrollableRow>
          {/* All Levels */}
          <button
            onClick={() => onFilterChange({ levels: [] })}
            className={`flex-shrink-0 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              filters.levels.length === 0
                ? 'bg-[#c5a059] text-black font-bold shadow-sm'
                : 'bg-[#18181b] text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            All Lvl
          </button>

          {/* Cantrips */}
          <button
            onClick={() => handleToggleLevel(0)}
            className={`flex-shrink-0 px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
              filters.levels.includes(0)
                ? 'bg-[#c5a059] text-black font-bold shadow-sm ring-1 ring-[#c5a059]'
                : 'bg-[#18181b] text-zinc-300 hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            <span>Cantrips</span>
            <span className="text-[10px] opacity-75 font-mono">({levelCounts.cantrips || 0})</span>
          </button>

          {/* Levels 1 to 9 */}
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => {
            const count = levelCounts[lvl.toString()] || 0;
            const isSelected = filters.levels.includes(lvl);
            return (
              <button
                key={lvl}
                onClick={() => handleToggleLevel(lvl)}
                className={`flex-shrink-0 px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                  isSelected
                    ? 'bg-[#c5a059] text-black font-bold shadow-sm ring-1 ring-[#c5a059]'
                    : count > 0
                    ? 'bg-[#18181b] text-zinc-300 hover:bg-zinc-800 border border-zinc-800'
                    : 'bg-zinc-950 text-zinc-600 border border-zinc-900'
                }`}
              >
                <span>{lvl}{lvl === 1 ? 'st' : lvl === 2 ? 'nd' : lvl === 3 ? 'rd' : 'th'}</span>
                {count > 0 && <span className="text-[10px] opacity-75 font-mono">({count})</span>}
              </button>
            );
          })}
        </ScrollableRow>

        {/* Advanced Filters (School, Casting Time, Sort) */}
        {showAdvanced && (
          <div className="pt-2 border-t border-zinc-800 space-y-2.5 animate-fadeIn">
            {/* School Selector */}
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-1.5 block font-mono">
                Magic School
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => onFilterChange({ schools: [] })}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    filters.schools.length === 0
                      ? 'bg-zinc-200 text-zinc-950 font-semibold'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                  }`}
                >
                  All Schools
                </button>

                {Object.entries(SCHOOL_MAP).map(([code, info]) => {
                  const isSelected = filters.schools.some(
                    (s) => s.toUpperCase() === code.toUpperCase()
                  );
                  return (
                    <button
                      key={code}
                      onClick={() => handleToggleSchool(code)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
                        isSelected
                          ? `${info.bgLight} ${info.color} ${info.border} font-bold ring-2 ring-[#c5a059]`
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                      }`}
                    >
                      {info.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Casting Time & Sort */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mr-1 font-mono">
                  Cast Time:
                </span>
                <button
                  onClick={() => onFilterChange({ castingTimes: [] })}
                  className={`px-2 py-0.5 rounded text-xs capitalize transition-colors ${
                    filters.castingTimes.length === 0
                      ? 'bg-[#c5a059] text-black font-semibold'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                  }`}
                >
                  Any
                </button>
                {['action', 'bonus action', 'reaction', 'minute'].map((time) => {
                  const isSelected = filters.castingTimes.includes(time);
                  return (
                    <button
                      key={time}
                      onClick={() => handleToggleCastingTime(time)}
                      className={`px-2 py-0.5 rounded text-xs capitalize transition-colors ${
                        isSelected
                          ? 'bg-[#c5a059] text-black font-semibold ring-1 ring-[#c5a059]'
                          : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                      }`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mr-1 font-mono">
                  Sort:
                </span>
                <select
                  value={filters.sortBy}
                  onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
                  className="bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 rounded-lg px-2 py-1 focus:outline-none focus:border-[#c5a059]"
                >
                  <option value="level-asc">Level (Low → High)</option>
                  <option value="level-desc">Level (High → Low)</option>
                  <option value="name-asc">Name (A → Z)</option>
                  <option value="name-desc">Name (Z → A)</option>
                  <option value="school">School</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
