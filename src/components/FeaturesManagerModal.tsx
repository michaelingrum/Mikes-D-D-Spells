import {
  AlertCircle,
  ArrowDownAZ,
  ArrowUpDown,
  Check,
  ChevronDown,
  ChevronUp,
  Flame,
  Info,
  Layers,
  Minus,
  Moon,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  X,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import { FEATURE_PRESETS, FeaturePresetTemplate } from '../data/featurePresets';
import { CharacterFeature, CharacterProfile, FeatureDisplayType, ResetType } from '../types';
import { FeatureSortOption, SORT_OPTION_LABELS, sortFeaturesList } from '../utils/featureUtils';

interface FeaturesManagerModalProps {
  features: CharacterFeature[];
  profile: CharacterProfile;
  onClose: () => void;
  onAddFeature: (feature: Omit<CharacterFeature, 'id'>) => void;
  onUpdateFeature: (id: string, updates: Partial<CharacterFeature>) => void;
  onDeleteFeature: (id: string) => void;
  onResetFeature: (id: string) => void;
  onReorderFeatures: (features: CharacterFeature[]) => void;
}

export const FeaturesManagerModal: React.FC<FeaturesManagerModalProps> = ({
  features,
  profile,
  onClose,
  onAddFeature,
  onUpdateFeature,
  onDeleteFeature,
  onResetFeature,
  onReorderFeatures,
}) => {
  const [activeTab, setActiveTab] = useState<'current' | 'new' | 'presets'>('current');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentSort, setCurrentSort] = useState<FeatureSortOption>('custom');

  // Handle manual move
  const handleMove = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= features.length) return;
    const newFeatures = [...features];
    const temp = newFeatures[index];
    newFeatures[index] = newFeatures[targetIndex];
    newFeatures[targetIndex] = temp;
    setCurrentSort('custom');
    onReorderFeatures(newFeatures);
  };

  // Handle quick sort
  const handleApplySort = (sortOption: FeatureSortOption) => {
    setCurrentSort(sortOption);
    if (sortOption !== 'custom') {
      const sorted = sortFeaturesList(features, sortOption);
      onReorderFeatures(sorted);
    }
  };

  // Form State for New / Edited Feature
  const [name, setName] = useState('');
  const [source, setSource] = useState('');
  const [description, setDescription] = useState('');
  const [max, setMax] = useState<number>(3);
  const [resetType, setResetType] = useState<ResetType>('long');
  const [displayType, setDisplayType] = useState<FeatureDisplayType>('pips');
  const [unitLabel, setUnitLabel] = useState('Uses');
  const [category, setCategory] = useState<'class' | 'feat' | 'species' | 'item' | 'other'>('class');
  const [colorTheme, setColorTheme] = useState<'gold' | 'emerald' | 'crimson' | 'violet' | 'amber' | 'blue'>('gold');

  // Load editing state
  const startEditing = (f: CharacterFeature) => {
    setEditingId(f.id);
    setName(f.name);
    setSource(f.source || '');
    setDescription(f.description || '');
    setMax(f.max);
    setResetType(f.resetType);
    setDisplayType(f.displayType);
    setUnitLabel(f.unitLabel || 'Uses');
    setCategory(f.category || 'class');
    setColorTheme(f.colorTheme || 'gold');
    setActiveTab('new');
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setSource('');
    setDescription('');
    setMax(3);
    setResetType('long');
    setDisplayType('pips');
    setUnitLabel('Uses');
    setCategory('class');
    setColorTheme('gold');
  };

  const handleSaveFeature = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId) {
      onUpdateFeature(editingId, {
        name: name.trim(),
        source: source.trim() || undefined,
        description: description.trim() || undefined,
        max: Math.max(1, max),
        resetType,
        displayType,
        unitLabel: unitLabel.trim() || 'Uses',
        category,
        colorTheme,
      });
      setEditingId(null);
    } else {
      onAddFeature({
        name: name.trim(),
        source: source.trim() || undefined,
        description: description.trim() || undefined,
        current: Math.max(1, max),
        max: Math.max(1, max),
        resetType,
        displayType,
        unitLabel: unitLabel.trim() || 'Uses',
        category,
        colorTheme,
      });
    }

    resetForm();
    setActiveTab('current');
  };

  const handleApplyPreset = (preset: FeaturePresetTemplate) => {
    let calculatedMax = preset.defaultMax;
    if (preset.calculateMax) {
      calculatedMax = preset.calculateMax(profile);
    }

    onAddFeature({
      name: preset.name,
      source: preset.source,
      description: preset.description,
      current: calculatedMax,
      max: calculatedMax,
      resetType: preset.resetType,
      displayType: preset.displayType,
      unitLabel: preset.unitLabel,
      category: preset.category,
      colorTheme: preset.colorTheme,
    });

    setActiveTab('current');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-[#121212] border border-zinc-800 rounded-2xl p-5 shadow-2xl flex flex-col overflow-hidden">
        {/* Top Gold Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#c5a059] via-[#dfc384] to-[#c5a059]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-[#c5a059]/40 flex items-center justify-center shadow-md shadow-black">
              <Layers className="w-5 h-5 text-[#c5a059]" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-[#c5a059] flex items-center gap-2">
                Features & Limited-Use Tracker Setup
              </h2>
              <p className="text-xs text-zinc-400">
                Track Flash of Genius, Sorcery Points, Lay on Hands, Channel Divinity, and custom resources
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 mb-4 p-1 bg-zinc-950 border border-zinc-800 rounded-xl flex-shrink-0">
          <button
            onClick={() => {
              resetForm();
              setActiveTab('current');
            }}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'current'
                ? 'bg-zinc-800 text-[#c5a059] shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>Active Trackers</span>
            <span className="px-1.5 py-0.2 text-[10px] font-mono rounded-full bg-zinc-900 border border-zinc-700">
              {features.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('presets')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'presets'
                ? 'bg-zinc-800 text-[#c5a059] shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#c5a059]" />
            <span>Class & Feat Presets</span>
          </button>

          <button
            onClick={() => {
              if (activeTab !== 'new') resetForm();
              setActiveTab('new');
            }}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'new'
                ? 'bg-zinc-800 text-[#c5a059] shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{editingId ? 'Edit Feature' : 'Create Custom'}</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          {/* TAB 1: CURRENT ACTIVE TRACKERS */}
          {activeTab === 'current' && (
            <div className="space-y-3">
              {/* Sort Bar */}
              {features.length > 1 && (
                <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-zinc-950 border border-zinc-800/80 flex-wrap">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <ArrowUpDown className="w-3.5 h-3.5 text-[#c5a059]" />
                    <span className="text-[11px] font-medium">Sort trackers:</span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => handleApplySort('short-first')}
                      className={`text-[11px] px-2 py-0.5 rounded-lg border transition-all ${
                        currentSort === 'short-first'
                          ? 'bg-amber-950/60 border-amber-500/60 text-amber-300 font-semibold'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      Short Rest First
                    </button>
                    <button
                      onClick={() => handleApplySort('long-first')}
                      className={`text-[11px] px-2 py-0.5 rounded-lg border transition-all ${
                        currentSort === 'long-first'
                          ? 'bg-amber-950/60 border-amber-500/60 text-amber-300 font-semibold'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      Long Rest First
                    </button>
                    <button
                      onClick={() => handleApplySort('name-asc')}
                      className={`text-[11px] px-2 py-0.5 rounded-lg border transition-all ${
                        currentSort === 'name-asc'
                          ? 'bg-amber-950/60 border-amber-500/60 text-amber-300 font-semibold'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      A &rarr; Z
                    </button>
                    <button
                      onClick={() => handleApplySort('depleted-first')}
                      className={`text-[11px] px-2 py-0.5 rounded-lg border transition-all ${
                        currentSort === 'depleted-first'
                          ? 'bg-amber-950/60 border-amber-500/60 text-amber-300 font-semibold'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      Low Charges
                    </button>
                    <button
                      onClick={() => handleApplySort('category')}
                      className={`text-[11px] px-2 py-0.5 rounded-lg border transition-all ${
                        currentSort === 'category'
                          ? 'bg-amber-950/60 border-amber-500/60 text-amber-300 font-semibold'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      Category
                    </button>
                  </div>
                </div>
              )}

              {features.length === 0 ? (
                <div className="text-center py-10 px-4 border border-dashed border-zinc-800 rounded-xl space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-zinc-900 flex items-center justify-center text-zinc-600">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-zinc-300">No feature trackers configured yet</h3>
                    <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                      Add trackers for your limited-use abilities like Flash of Genius, Metamagic Adept, or Lay on Hands.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      onClick={() => setActiveTab('presets')}
                      className="px-3 py-1.5 rounded-lg bg-[#c5a059] text-black text-xs font-bold hover:bg-[#d4af37] transition-all flex items-center gap-1.5 shadow-md"
                    >
                      <Sparkles className="w-3.5 h-3.5 fill-black" />
                      <span>Browse 5e Presets</span>
                    </button>
                    <button
                      onClick={() => {
                        resetForm();
                        setActiveTab('new');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold hover:bg-zinc-800 transition-all"
                    >
                      Create Custom
                    </button>
                  </div>
                </div>
              ) : (
                features.map((f, index) => (
                  <div
                    key={f.id}
                    className="p-3.5 rounded-xl bg-[#161616] border border-zinc-800 hover:border-zinc-700/80 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    {/* Reorder up/down buttons */}
                    <div className="hidden sm:flex flex-col items-center gap-0.5 pr-1 flex-shrink-0">
                      <button
                        onClick={() => handleMove(index, -1)}
                        disabled={index === 0}
                        className={`p-1 rounded transition-colors ${
                          index === 0
                            ? 'text-zinc-700 cursor-not-allowed'
                            : 'text-zinc-400 hover:text-[#c5a059] hover:bg-zinc-800'
                        }`}
                        title="Move up in order"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <span className="text-[9px] font-mono text-zinc-600">#{index + 1}</span>
                      <button
                        onClick={() => handleMove(index, 1)}
                        disabled={index === features.length - 1}
                        className={`p-1 rounded transition-colors ${
                          index === features.length - 1
                            ? 'text-zinc-700 cursor-not-allowed'
                            : 'text-zinc-400 hover:text-[#c5a059] hover:bg-zinc-800'
                        }`}
                        title="Move down in order"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Mobile sequence badge */}
                        <span className="sm:hidden text-[9px] font-mono text-zinc-500 bg-zinc-900 px-1 rounded border border-zinc-800">
                          #{index + 1}
                        </span>
                        <h4 className="text-sm font-serif font-bold text-[#c5a059] tracking-wide">
                          {f.name}
                        </h4>
                        {f.source && (
                          <span className="text-[10px] text-zinc-400 font-mono bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                            {f.source}
                          </span>
                        )}
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-800/40 flex items-center gap-1">
                          {f.resetType === 'long' ? (
                            <>
                              <Moon className="w-2.5 h-2.5" /> Long Rest
                            </>
                          ) : f.resetType === 'short' ? (
                            <>
                              <RotateCcw className="w-2.5 h-2.5" /> Short Rest
                            </>
                          ) : (
                            <span>{f.resetType}</span>
                          )}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500 uppercase px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                          {f.displayType === 'pips' ? 'Pips' : 'Counter'}
                        </span>
                      </div>

                      {f.description && (
                        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                          {f.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2 text-xs text-zinc-400 pt-0.5">
                        <span className="font-mono">
                          Current: <strong className="text-zinc-100">{f.current}</strong> / {f.max} {f.unitLabel || 'uses'}
                        </span>
                      </div>
                    </div>

                    {/* Quick controls on the card */}
                    <div className="flex items-center gap-1.5 flex-shrink-0 self-end sm:self-center">
                      {/* Mobile up/down arrows */}
                      <div className="flex sm:hidden items-center mr-1">
                        <button
                          onClick={() => handleMove(index, -1)}
                          disabled={index === 0}
                          className="p-1 rounded text-zinc-400 hover:text-zinc-100 disabled:opacity-30"
                          title="Move Up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMove(index, 1)}
                          disabled={index === features.length - 1}
                          className="p-1 rounded text-zinc-400 hover:text-zinc-100 disabled:opacity-30"
                          title="Move Down"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => onResetFeature(f.id)}
                        className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-amber-300 text-xs transition-colors"
                        title="Refill to maximum"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => startEditing(f)}
                        className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-[#c5a059] text-xs font-semibold transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDeleteFeature(f.id)}
                        className="p-1.5 rounded-lg bg-zinc-900 hover:bg-rose-950/60 border border-zinc-800 hover:border-rose-900 text-zinc-500 hover:text-rose-400 text-xs transition-colors"
                        title="Delete feature tracker"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: PRESET TEMPLATES */}
          {activeTab === 'presets' && (
            <div className="space-y-3">
              <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl flex items-start gap-2.5">
                <Info className="w-4 h-4 text-[#c5a059] flex-shrink-0 mt-0.5" />
                <p className="text-xs text-zinc-400">
                  Select a common D&D 5e feature, feat, or racial ability below. The maximum uses will automatically calculate based on your character's level and ability scores ({profile.characterClass} Lv{profile.level}).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {FEATURE_PRESETS.map((preset) => {
                  const calculated = preset.calculateMax
                    ? preset.calculateMax(profile)
                    : preset.defaultMax;

                  const isAlreadyAdded = features.some(
                    (f) => f.name.toLowerCase() === preset.name.toLowerCase()
                  );

                  return (
                    <div
                      key={preset.name}
                      className="p-3.5 rounded-xl bg-[#161616] border border-zinc-800 hover:border-[#c5a059]/40 flex flex-col justify-between gap-2.5 transition-all group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-xs sm:text-sm font-serif font-bold text-zinc-200 group-hover:text-[#c5a059] transition-colors">
                            {preset.name}
                          </h4>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-zinc-900 border border-zinc-800 text-amber-300/90 flex-shrink-0">
                            {preset.resetType === 'long' ? 'Long Rest' : 'Short Rest'}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#c5a059] font-mono block">
                          {preset.source}
                        </span>
                        <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-3">
                          {preset.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
                        <div className="text-[11px] font-mono text-zinc-400">
                          <span>Max: </span>
                          <strong className="text-[#c5a059] font-bold text-xs">{calculated}</strong>{' '}
                          <span>{preset.unitLabel}</span>
                        </div>

                        <button
                          onClick={() => handleApplyPreset(preset)}
                          disabled={isAlreadyAdded}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                            isAlreadyAdded
                              ? 'bg-zinc-900 text-zinc-500 border border-zinc-800 cursor-not-allowed'
                              : 'bg-[#c5a059] hover:bg-[#d4af37] text-black shadow-sm active:scale-95'
                          }`}
                        >
                          {isAlreadyAdded ? (
                            <>
                              <Check className="w-3 h-3 text-zinc-500" />
                              <span>Added</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3 h-3 text-black fill-black" />
                              <span>Add Tracker</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: CREATE / EDIT CUSTOM FEATURE */}
          {activeTab === 'new' && (
            <form onSubmit={handleSaveFeature} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300 font-mono uppercase tracking-wider">
                    Feature Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Flash of Genius, Sorcery Points, Lay on Hands"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-[#c5a059] text-zinc-100 text-sm focus:outline-none"
                  />
                </div>

                {/* Source */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300 font-mono uppercase tracking-wider">
                    Source / Class / Feat
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Artificer 7, Metamagic Adept, Paladin 1"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-[#c5a059] text-zinc-100 text-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300 font-mono uppercase tracking-wider">
                  Description / Rules
                </label>
                <textarea
                  rows={2}
                  placeholder="Rules, trigger conditions, action type (Action, Bonus Action, Reaction)..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-[#c5a059] text-zinc-100 text-xs focus:outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Max Uses */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300 font-mono uppercase tracking-wider">
                    Max Capacity / Uses *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={999}
                    required
                    value={max}
                    onChange={(e) => setMax(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-[#c5a059] text-zinc-100 text-sm font-mono font-bold focus:outline-none"
                  />
                </div>

                {/* Reset Cycle */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300 font-mono uppercase tracking-wider">
                    Recharge On
                  </label>
                  <select
                    value={resetType}
                    onChange={(e) => setResetType(e.target.value as ResetType)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-[#c5a059] text-zinc-100 text-sm focus:outline-none"
                  >
                    <option value="long">Long Rest (8 hours)</option>
                    <option value="short">Short Rest (1 hour)</option>
                    <option value="special">Special / Dawn</option>
                    <option value="none">Manual / Non-recharging</option>
                  </select>
                </div>

                {/* Unit Label */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300 font-mono uppercase tracking-wider">
                    Unit Label
                  </label>
                  <input
                    type="text"
                    placeholder="Uses, Points, HP, Dice"
                    value={unitLabel}
                    onChange={(e) => setUnitLabel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-[#c5a059] text-zinc-100 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Display Type */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300 font-mono uppercase tracking-wider">
                    Display Style
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDisplayType('pips')}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        displayType === 'pips'
                          ? 'bg-[#c5a059]/20 border-[#c5a059] text-[#dfc384]'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <div className="flex gap-0.5">
                        <span className="w-2 h-2 rounded-full bg-[#c5a059]" />
                        <span className="w-2 h-2 rounded-full bg-[#c5a059]" />
                        <span className="w-2 h-2 rounded-full bg-zinc-700" />
                      </div>
                      <span>Interactive Pips</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDisplayType('counter')}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        displayType === 'counter'
                          ? 'bg-[#c5a059]/20 border-[#c5a059] text-[#dfc384]'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <span className="font-mono font-bold text-[#c5a059]">25/25</span>
                      <span>Numeric Pool</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-zinc-500">
                    Use Pips for 1–6 discrete uses (e.g. Flash of Genius). Use Numeric Pool for larger sums (e.g. Lay on Hands 25 HP).
                  </p>
                </div>

                {/* Color Theme */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300 font-mono uppercase tracking-wider">
                    Badge Color Accent
                  </label>
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    {[
                      { id: 'gold', name: 'Gold', bg: 'bg-amber-400' },
                      { id: 'violet', name: 'Violet', bg: 'bg-purple-400' },
                      { id: 'emerald', name: 'Emerald', bg: 'bg-emerald-400' },
                      { id: 'crimson', name: 'Crimson', bg: 'bg-rose-500' },
                      { id: 'amber', name: 'Amber', bg: 'bg-orange-400' },
                      { id: 'blue', name: 'Blue', bg: 'bg-sky-400' },
                    ].map((theme) => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => setColorTheme(theme.id as any)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                          colorTheme === theme.id
                            ? 'ring-2 ring-white scale-110'
                            : 'opacity-70 hover:opacity-100'
                        }`}
                        title={theme.name}
                      >
                        <span className={`w-5 h-5 rounded-full ${theme.bg}`} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setActiveTab('current');
                  }}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#c5a059] hover:bg-[#d4af37] text-black text-xs font-bold shadow-lg flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <Check className="w-3.5 h-3.5 fill-black text-black" />
                  <span>{editingId ? 'Update Feature' : 'Save Feature Tracker'}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500 flex-shrink-0">
          <span>Active features automatically restore during Rest commands</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
