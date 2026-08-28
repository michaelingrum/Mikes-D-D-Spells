import {
  AlertCircle,
  Check,
  Copy,
  Download,
  FileCode,
  FileUp,
  Sparkles,
  Upload,
  X
} from 'lucide-react';
import React, { useRef, useState } from 'react';
import { DEFAULT_SPELLS_DATA } from '../data/defaultSpells';
import { Spell } from '../types';

interface ImportModalProps {
  onClose: () => void;
  onImport: (jsonData: any, mode: 'merge' | 'replace') => { count: number; error?: string };
  currentSpells: Spell[];
}

export const ImportModal: React.FC<ImportModalProps> = ({
  onClose,
  onImport,
  currentSpells,
}) => {
  const [jsonText, setJsonText] = useState('');
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [importResult, setImportResult] = useState<{
    count?: number;
    error?: string;
    success?: boolean;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        setJsonText(text);
        const parsed = JSON.parse(text);
        const res = onImport(parsed, importMode);
        if (res.error) {
          setImportResult({ error: res.error, success: false });
        } else {
          setImportResult({ count: res.count, success: true });
        }
      } catch (err: any) {
        setImportResult({ error: 'Invalid JSON file: ' + err.message, success: false });
      }
    };
    reader.readAsText(file);
  };

  const handleTextImport = () => {
    if (!jsonText.trim()) {
      setImportResult({ error: 'Please paste JSON data or select a file.', success: false });
      return;
    }
    try {
      const parsed = JSON.parse(jsonText);
      const res = onImport(parsed, importMode);
      if (res.error) {
        setImportResult({ error: res.error, success: false });
      } else {
        setImportResult({ count: res.count, success: true });
      }
    } catch (err: any) {
      setImportResult({ error: 'Invalid JSON format: ' + err.message, success: false });
    }
  };

  const handleLoadSampleData = () => {
    const sample = DEFAULT_SPELLS_DATA;
    setJsonText(JSON.stringify(sample, null, 2));
    const res = onImport(sample, importMode);
    setImportResult({ count: res.count, success: true });
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentSpells, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `dnd-spellbook-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
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
              <Upload className="w-5 h-5 text-[#c5a059]" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-[#c5a059]">Import / Export Spells</h2>
              <p className="text-xs text-zinc-400">
                Import 5e / 5etools standard spell JSON files or export backups
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
        <div className="overflow-y-auto space-y-4 pr-1">
          {/* File Drag and Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileUpload(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-[#c5a059] bg-[#c5a059]/10 ring-2 ring-[#c5a059]/30'
                : 'border-zinc-700 hover:border-[#c5a059]/70 bg-[#161616]'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".json,application/json"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />
            <FileUp className="w-8 h-8 text-[#c5a059] mx-auto mb-2 opacity-90" />
            <p className="text-sm font-semibold text-zinc-200">
              Drag & Drop your spell JSON file here
            </p>
            <p className="text-xs text-zinc-400 mt-1">or click to browse from device</p>
          </div>

          {/* Quick Action Buttons: Sample Data & Export */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleLoadSampleData}
              className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-[#c5a059]/40 text-[#c5a059] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors text-left"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#c5a059] flex-shrink-0" />
              <span>Load Uploaded Sample JSON</span>
            </button>

            <button
              onClick={handleExportJSON}
              className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
              <span>Export Spellbook ({currentSpells.length})</span>
            </button>
          </div>

          {/* Raw JSON Paste Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1 font-mono">
                <FileCode className="w-3.5 h-3.5 text-zinc-400" />
                Or Paste JSON Text:
              </label>
              {jsonText && (
                <button
                  onClick={() => setJsonText('')}
                  className="text-[11px] text-zinc-500 hover:text-zinc-300"
                >
                  Clear
                </button>
              )}
            </div>
            <textarea
              rows={5}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder="Paste JSON array or 5e spell object here..."
              className="w-full p-3 bg-[#121212] border border-zinc-800 rounded-xl text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-[#c5a059]"
            />
          </div>

          {/* Import Mode: Merge vs Replace */}
          <div className="bg-[#161616] p-3 rounded-xl border border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-300">Import Mode:</span>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs text-zinc-300 cursor-pointer">
                <input
                  type="radio"
                  name="importMode"
                  checked={importMode === 'merge'}
                  onChange={() => setImportMode('merge')}
                  className="accent-[#c5a059]"
                />
                <span>Merge (Keep Existing)</span>
              </label>
              <label className="flex items-center gap-1.5 text-xs text-rose-300 cursor-pointer">
                <input
                  type="radio"
                  name="importMode"
                  checked={importMode === 'replace'}
                  onChange={() => setImportMode('replace')}
                  className="accent-rose-500"
                />
                <span>Replace All</span>
              </label>
            </div>
          </div>

          {/* Result / Error Banner */}
          {importResult && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                importResult.success
                  ? 'bg-zinc-900 border border-[#c5a059] text-[#c5a059]'
                  : 'bg-rose-950/80 border border-rose-700 text-rose-300'
              }`}
            >
              {importResult.success ? (
                <Check className="w-4 h-4 text-[#c5a059]" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400" />
              )}
              <span>
                {importResult.success
                  ? `Successfully imported ${importResult.count} spells!`
                  : importResult.error}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold transition-colors border border-zinc-800"
          >
            Done / Close
          </button>

          <button
            onClick={handleTextImport}
            className="px-5 py-2 rounded-lg bg-[#c5a059] hover:bg-[#d4af37] text-black text-xs font-bold shadow-lg flex items-center gap-1.5 active:scale-95 transition-all"
          >
            <Upload className="w-3.5 h-3.5 fill-black text-black" />
            <span>Process & Import</span>
          </button>
        </div>
      </div>
    </div>
  );
};
