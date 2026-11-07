import {
  AlertCircle,
  AlertTriangle,
  BookOpen,
  Check,
  Copy,
  Database,
  Download,
  FileCode,
  FileUp,
  RotateCcw,
  Shield,
  Sparkles,
  Upload,
  Users,
  X,
} from 'lucide-react';
import React, { useRef, useState } from 'react';
import { DEFAULT_SPELLS_DATA } from '../data/defaultSpells';
import { CharacterRecord, DatabaseBackup, Spell } from '../types';

interface ImportModalProps {
  onClose: () => void;
  // Whole Database Props
  characters: CharacterRecord[];
  activeCharacterId: string;
  onExportDatabase: () => DatabaseBackup;
  onImportDatabase: (
    jsonData: any,
    mode: 'replace' | 'merge'
  ) => { success: boolean; message: string; count?: number };
  // Active Character Spells Props
  currentSpells: Spell[];
  activeCharacterName: string;
  onImportSpells: (
    jsonData: any,
    mode: 'merge' | 'replace'
  ) => { count: number; error?: string };
  initialTab?: 'database' | 'spells';
}

export const ImportModal: React.FC<ImportModalProps> = ({
  onClose,
  characters,
  activeCharacterId,
  onExportDatabase,
  onImportDatabase,
  currentSpells,
  activeCharacterName,
  onImportSpells,
  initialTab = 'database',
}) => {
  const [activeTab, setActiveTab] = useState<'database' | 'spells'>(initialTab);

  // Database Tab State
  const [dbJsonText, setDbJsonText] = useState('');
  const [dbRestoreMode, setDbRestoreMode] = useState<'replace' | 'merge'>('replace');
  const [dbParsedPreview, setDbParsedPreview] = useState<{
    valid: boolean;
    characterCount: number;
    characters: { name: string; class: string; level: number; spellCount: number }[];
    rawObj: any;
    error?: string;
  } | null>(null);
  const [dbResult, setDbResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [copiedDbJson, setCopiedDbJson] = useState(false);
  const [isDbDragging, setIsDbDragging] = useState(false);
  const dbFileInputRef = useRef<HTMLInputElement>(null);

  // Spells Only Tab State
  const [spellJsonText, setSpellJsonText] = useState('');
  const [spellImportMode, setSpellImportMode] = useState<'merge' | 'replace'>('merge');
  const [spellResult, setSpellResult] = useState<{
    count?: number;
    error?: string;
    success?: boolean;
  } | null>(null);
  const [isSpellDragging, setIsSpellDragging] = useState(false);
  const spellFileInputRef = useRef<HTMLInputElement>(null);

  // Total spells across all characters in database
  const totalDbSpells = characters.reduce((sum, c) => sum + (c.spells?.length || 0), 0);

  // -------------------------------------------------------------------
  // FULL DATABASE HANDLERS
  // -------------------------------------------------------------------

  const handleExportFullDatabase = () => {
    const backupData = onExportDatabase();
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    const dateStamp = new Date().toISOString().slice(0, 10);
    downloadAnchor.setAttribute(
      'download',
      `dnd-spellbook-full-backup-${dateStamp}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyDatabaseJSON = () => {
    const backupData = onExportDatabase();
    navigator.clipboard.writeText(JSON.stringify(backupData, null, 2));
    setCopiedDbJson(true);
    setTimeout(() => setCopiedDbJson(false), 2500);
  };

  const inspectDatabaseBackup = (text: string) => {
    setDbJsonText(text);
    setDbResult(null);
    try {
      const parsed = JSON.parse(text);
      let incomingList: any[] = [];

      if (Array.isArray(parsed)) {
        incomingList = parsed;
      } else if (Array.isArray(parsed.characters)) {
        incomingList = parsed.characters;
      } else if (parsed.profile && (parsed.spells || parsed.slots)) {
        incomingList = [parsed];
      } else {
        setDbParsedPreview({
          valid: false,
          characterCount: 0,
          characters: [],
          rawObj: null,
          error: 'Unrecognized backup structure. Expected characters array or backup object.',
        });
        return;
      }

      if (incomingList.length === 0) {
        setDbParsedPreview({
          valid: false,
          characterCount: 0,
          characters: [],
          rawObj: null,
          error: 'No character records detected in JSON.',
        });
        return;
      }

      const previewChars = incomingList.map((item, idx) => ({
        name: item.profile?.name || `Hero ${idx + 1}`,
        class: item.profile?.characterClass || 'Caster',
        level: item.profile?.level || 1,
        spellCount: Array.isArray(item.spells) ? item.spells.length : 0,
      }));

      setDbParsedPreview({
        valid: true,
        characterCount: previewChars.length,
        characters: previewChars,
        rawObj: parsed,
      });
    } catch (err: any) {
      setDbParsedPreview({
        valid: false,
        characterCount: 0,
        characters: [],
        rawObj: null,
        error: 'Invalid JSON format: ' + err.message,
      });
    }
  };

  const handleDbFileUpload = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = (e.target?.result as string) || '';
      inspectDatabaseBackup(text);
    };
    reader.readAsText(file);
  };

  const handleExecuteRestore = () => {
    if (!dbParsedPreview || !dbParsedPreview.valid || !dbParsedPreview.rawObj) {
      setDbResult({ success: false, message: 'Please select or paste a valid backup first.' });
      return;
    }
    const res = onImportDatabase(dbParsedPreview.rawObj, dbRestoreMode);
    setDbResult(res);
    if (res.success) {
      setDbParsedPreview(null);
      setDbJsonText('');
    }
  };

  // -------------------------------------------------------------------
  // SPELLS ONLY HANDLERS (Current Character)
  // -------------------------------------------------------------------

  const handleSpellFileUpload = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        setSpellJsonText(text);
        const parsed = JSON.parse(text);
        const res = onImportSpells(parsed, spellImportMode);
        if (res.error) {
          setSpellResult({ error: res.error, success: false });
        } else {
          setSpellResult({ count: res.count, success: true });
        }
      } catch (err: any) {
        setSpellResult({ error: 'Invalid JSON file: ' + err.message, success: false });
      }
    };
    reader.readAsText(file);
  };

  const handleSpellTextImport = () => {
    if (!spellJsonText.trim()) {
      setSpellResult({ error: 'Please paste JSON data or select a file.', success: false });
      return;
    }
    try {
      const parsed = JSON.parse(spellJsonText);
      const res = onImportSpells(parsed, spellImportMode);
      if (res.error) {
        setSpellResult({ error: res.error, success: false });
      } else {
        setSpellResult({ count: res.count, success: true });
      }
    } catch (err: any) {
      setSpellResult({ error: 'Invalid JSON format: ' + err.message, success: false });
    }
  };

  const handleLoadSampleSpells = () => {
    const sample = DEFAULT_SPELLS_DATA;
    setSpellJsonText(JSON.stringify(sample, null, 2));
    const res = onImportSpells(sample, spellImportMode);
    setSpellResult({ count: res.count, success: true });
  };

  const handleExportSpellsOnly = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(currentSpells, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `${activeCharacterName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-spells-${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[92vh] bg-[#121212] border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col overflow-hidden">
        {/* Top Gold Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#c5a059] via-[#dfc384] to-[#c5a059]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-[#c5a059]/40 flex items-center justify-center shadow-md shadow-black">
              <Database className="w-5 h-5 text-[#c5a059]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-[#c5a059]">
                Backup & Data Management
              </h2>
              <p className="text-xs text-zinc-400">
                Save an offline copy of your characters or import spell data
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

        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-800 mb-4 gap-2">
          <button
            onClick={() => setActiveTab('database')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 text-xs font-semibold transition-all ${
              activeTab === 'database'
                ? 'border-[#c5a059] text-[#dfc384] bg-zinc-900/60'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Database className="w-4 h-4 text-[#c5a059]" />
            <span>Whole Database Backup</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300">
              {characters.length} {characters.length === 1 ? 'Hero' : 'Heroes'}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('spells')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 text-xs font-semibold transition-all ${
              activeTab === 'spells'
                ? 'border-[#c5a059] text-[#dfc384] bg-zinc-900/60'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <BookOpen className="w-4 h-4 text-zinc-400" />
            <span>Spells Only ({activeCharacterName})</span>
          </button>
        </div>

        {/* Tab 1: FULL DATABASE BACKUP & RESTORE */}
        {activeTab === 'database' && (
          <div className="overflow-y-auto space-y-4 pr-1 flex-1">
            {/* Database Snapshot Stats Banner */}
            <div className="p-4 rounded-xl bg-zinc-900/90 border border-[#c5a059]/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#c5a059]" />
                  <h3 className="text-sm font-serif font-bold text-zinc-100">
                    Local Character Database Snapshot
                  </h3>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  Contains all profiles, spell lists, preparations, slot configurations, notes, and feature trackers.
                </p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-black/60 border border-zinc-800 text-[#dfc384]">
                    {characters.length} {characters.length === 1 ? 'Character' : 'Characters'}
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-black/60 border border-zinc-800 text-zinc-300">
                    {totalDbSpells} Spells Stored
                  </span>
                </div>
              </div>

              {/* Action Buttons: Download & Copy */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={handleExportFullDatabase}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#c5a059] hover:bg-[#d4af37] text-black text-xs font-bold transition-all shadow-md active:scale-95"
                  title="Download complete JSON database backup to your computer or phone"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Backup (.json)</span>
                </button>

                <button
                  onClick={handleCopyDatabaseJSON}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-semibold transition-all active:scale-95"
                  title="Copy full JSON backup string to clipboard"
                >
                  {copiedDbJson ? (
                    <>
                      <Check className="w-4 h-4 text-[#c5a059]" />
                      <span className="text-[#c5a059]">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-zinc-400" />
                      <span>Copy JSON</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Existing Characters in Database */}
            <div className="p-3 bg-[#161616] border border-zinc-800 rounded-xl">
              <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold block mb-2 font-mono">
                Included in Backup:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {characters.map((c) => (
                  <div
                    key={c.id}
                    className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs"
                  >
                    <div className="truncate">
                      <strong className="text-zinc-200">{c.profile.name || 'Unnamed'}</strong>
                      <span className="text-zinc-500 ml-1.5">
                        Lv {c.profile.level} {c.profile.characterClass}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400 bg-black/60 px-1.5 py-0.5 rounded border border-zinc-800 ml-2">
                      {c.spells.length} spells
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Restore Database Section */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4 text-[#c5a059]" />
                  <h4 className="text-sm font-serif font-bold text-zinc-200">
                    Restore Database from Backup
                  </h4>
                </div>

                {/* Restore Mode Selector */}
                <div className="flex items-center gap-3 text-xs bg-zinc-900 p-1 px-2.5 rounded-lg border border-zinc-800">
                  <label className="flex items-center gap-1.5 cursor-pointer text-zinc-300">
                    <input
                      type="radio"
                      name="dbRestoreMode"
                      checked={dbRestoreMode === 'replace'}
                      onChange={() => setDbRestoreMode('replace')}
                      className="accent-rose-500"
                    />
                    <span className="text-rose-300 font-medium">Replace All (Full Restore)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-zinc-300">
                    <input
                      type="radio"
                      name="dbRestoreMode"
                      checked={dbRestoreMode === 'merge'}
                      onChange={() => setDbRestoreMode('merge')}
                      className="accent-[#c5a059]"
                    />
                    <span>Merge into Roster</span>
                  </label>
                </div>
              </div>

              {/* Drag and Drop File Upload for Database */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDbDragging(true);
                }}
                onDragLeave={() => setIsDbDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDbDragging(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleDbFileUpload(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => dbFileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                  isDbDragging
                    ? 'border-[#c5a059] bg-[#c5a059]/10 ring-2 ring-[#c5a059]/30'
                    : 'border-zinc-700 hover:border-[#c5a059]/70 bg-[#161616]'
                }`}
              >
                <input
                  type="file"
                  ref={dbFileInputRef}
                  accept=".json,application/json"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleDbFileUpload(e.target.files[0]);
                    }
                  }}
                />
                <FileUp className="w-7 h-7 text-[#c5a059] mx-auto mb-1.5 opacity-90" />
                <p className="text-sm font-semibold text-zinc-200">
                  Drop backup .json file here to restore
                </p>
                <p className="text-xs text-zinc-400 mt-0.5">or click to browse from device</p>
              </div>

              {/* Paste JSON Raw Text */}
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1 font-mono">
                    <FileCode className="w-3.5 h-3.5 text-zinc-500" />
                    Or Paste Backup JSON Content:
                  </label>
                  {dbJsonText && (
                    <button
                      onClick={() => {
                        setDbJsonText('');
                        setDbParsedPreview(null);
                      }}
                      className="text-[11px] text-zinc-500 hover:text-zinc-300"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <textarea
                  rows={3}
                  value={dbJsonText}
                  onChange={(e) => inspectDatabaseBackup(e.target.value)}
                  placeholder="Paste database backup JSON string here..."
                  className="w-full p-2.5 bg-[#121212] border border-zinc-800 rounded-xl text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              {/* Pre-Restore Inspection Preview */}
              {dbParsedPreview && (
                <div
                  className={`mt-3 p-3.5 rounded-xl border animate-fadeIn ${
                    dbParsedPreview.valid
                      ? 'bg-zinc-900 border-[#c5a059]/60'
                      : 'bg-rose-950/70 border-rose-700 text-rose-300 text-xs'
                  }`}
                >
                  {dbParsedPreview.valid ? (
                    <div>
                      <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-2">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-[#c5a059]" />
                          <h5 className="text-xs font-serif font-bold text-[#dfc384]">
                            Verified Backup Ready to Restore: {dbParsedPreview.characterCount} {dbParsedPreview.characterCount === 1 ? 'Hero' : 'Heroes'}
                          </h5>
                        </div>
                        {dbRestoreMode === 'replace' && (
                          <span className="flex items-center gap-1 text-[11px] text-rose-300 font-semibold bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800">
                            <AlertTriangle className="w-3 h-3 text-rose-400" />
                            Will overwrite current database
                          </span>
                        )}
                      </div>

                      <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                        {dbParsedPreview.characters.map((ch, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-xs py-1 px-2 rounded bg-black/40 text-zinc-300"
                          >
                            <span>
                              <strong>{ch.name}</strong> — Lv {ch.level} {ch.class}
                            </span>
                            <span className="font-mono text-zinc-400">{ch.spellCount} spells</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={handleExecuteRestore}
                          className="px-4 py-2 rounded-lg bg-[#c5a059] hover:bg-[#d4af37] text-black font-bold text-xs shadow-lg transition-all flex items-center gap-1.5 active:scale-95"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>
                            {dbRestoreMode === 'replace'
                              ? `Confirm & Restore ${dbParsedPreview.characterCount} Characters`
                              : `Merge ${dbParsedPreview.characterCount} Characters into Roster`}
                          </span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                      <span>{dbParsedPreview.error}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Status Message */}
              {dbResult && (
                <div
                  className={`mt-3 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn ${
                    dbResult.success
                      ? 'bg-zinc-900 border border-[#c5a059] text-[#c5a059]'
                      : 'bg-rose-950/80 border border-rose-700 text-rose-300'
                  }`}
                >
                  {dbResult.success ? (
                    <Check className="w-4 h-4 text-[#c5a059]" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                  )}
                  <span>{dbResult.message}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: SPELLS ONLY (Current Active Character) */}
        {activeTab === 'spells' && (
          <div className="overflow-y-auto space-y-4 pr-1 flex-1">
            {/* Header / Description for Spells */}
            <div className="p-3 bg-[#161616] border border-zinc-800 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="text-zinc-300 font-semibold">Active Character: </span>
                <span className="text-[#dfc384] font-bold">{activeCharacterName}</span>
                <p className="text-zinc-500 text-[11px] mt-0.5">
                  Import standard 5etools / 5e JSON spells or export this hero's spellbook.
                </p>
              </div>
              <button
                onClick={handleExportSpellsOnly}
                className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors flex-shrink-0"
              >
                <Download className="w-3.5 h-3.5 text-[#c5a059]" />
                <span>Export Spells ({currentSpells.length})</span>
              </button>
            </div>

            {/* File Drag and Drop Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsSpellDragging(true);
              }}
              onDragLeave={() => setIsSpellDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsSpellDragging(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleSpellFileUpload(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => spellFileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                isSpellDragging
                  ? 'border-[#c5a059] bg-[#c5a059]/10 ring-2 ring-[#c5a059]/30'
                  : 'border-zinc-700 hover:border-[#c5a059]/70 bg-[#161616]'
              }`}
            >
              <input
                type="file"
                ref={spellFileInputRef}
                accept=".json,application/json"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleSpellFileUpload(e.target.files[0]);
                  }
                }}
              />
              <FileUp className="w-7 h-7 text-[#c5a059] mx-auto mb-1.5 opacity-90" />
              <p className="text-sm font-semibold text-zinc-200">
                Drag & Drop spell JSON file here
              </p>
              <p className="text-xs text-zinc-400 mt-0.5">or click to browse from device</p>
            </div>

            {/* Quick Action: Load Sample Spells */}
            <div className="flex justify-start">
              <button
                onClick={handleLoadSampleSpells}
                className="p-2 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-[#c5a059]/40 text-[#c5a059] text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#c5a059] flex-shrink-0" />
                <span>Load Starter 5e Spells Sample</span>
              </button>
            </div>

            {/* Raw JSON Paste Area */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1 font-mono">
                  <FileCode className="w-3.5 h-3.5 text-zinc-500" />
                  Or Paste Spell JSON Text:
                </label>
                {spellJsonText && (
                  <button
                    onClick={() => setSpellJsonText('')}
                    className="text-[11px] text-zinc-500 hover:text-zinc-300"
                  >
                    Clear
                  </button>
                )}
              </div>
              <textarea
                rows={4}
                value={spellJsonText}
                onChange={(e) => setSpellJsonText(e.target.value)}
                placeholder="Paste JSON array or 5e spell object here..."
                className="w-full p-2.5 bg-[#121212] border border-zinc-800 rounded-xl text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-[#c5a059]"
              />
            </div>

            {/* Spell Import Mode: Merge vs Replace */}
            <div className="bg-[#161616] p-3 rounded-xl border border-zinc-800 flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-300">Spell Import Mode:</span>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs text-zinc-300 cursor-pointer">
                  <input
                    type="radio"
                    name="spellImportMode"
                    checked={spellImportMode === 'merge'}
                    onChange={() => setSpellImportMode('merge')}
                    className="accent-[#c5a059]"
                  />
                  <span>Merge (Keep Existing)</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-rose-300 cursor-pointer">
                  <input
                    type="radio"
                    name="spellImportMode"
                    checked={spellImportMode === 'replace'}
                    onChange={() => setSpellImportMode('replace')}
                    className="accent-rose-500"
                  />
                  <span>Replace Spells</span>
                </label>
              </div>
            </div>

            {/* Spell Result Banner */}
            {spellResult && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  spellResult.success
                    ? 'bg-zinc-900 border border-[#c5a059] text-[#c5a059]'
                    : 'bg-rose-950/80 border border-rose-700 text-rose-300'
                }`}
              >
                {spellResult.success ? (
                  <Check className="w-4 h-4 text-[#c5a059]" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                )}
                <span>
                  {spellResult.success
                    ? `Successfully imported ${spellResult.count} spells for ${activeCharacterName}!`
                    : spellResult.error}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Modal Footer */}
        <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between">
          <span className="text-[11px] text-zinc-500">
            {activeTab === 'database'
              ? 'Backups are stored as plain readable JSON files on your device.'
              : 'Spells imported here are added directly to the active hero.'}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold transition-colors border border-zinc-800"
            >
              Close
            </button>

            {activeTab === 'spells' && (
              <button
                onClick={handleSpellTextImport}
                className="px-4 py-2 rounded-lg bg-[#c5a059] hover:bg-[#d4af37] text-black text-xs font-bold shadow-lg flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <Upload className="w-3.5 h-3.5 fill-black text-black" />
                <span>Import Spells</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
