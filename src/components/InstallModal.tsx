import { Check, Download, Share, Smartphone, Sparkles, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: BeforeInstallPromptEvent | null;
  onInstalled: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onInstalled,
}) => {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    // Detect if running in standalone mode
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(ios);
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        onInstalled();
        onClose();
      }
    } catch (err) {
      console.error('Error prompting install:', err);
    } finally {
      setInstalling(false);
    }
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

        {/* App Icon Glow */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-zinc-900 border border-[#c5a059]/40 flex items-center justify-center shadow-lg shadow-black mb-3 mt-1">
          <Smartphone className="w-8 h-8 text-[#c5a059]" />
        </div>

        <h2 className="text-xl font-serif font-bold text-[#c5a059] tracking-tight mb-1">
          {isStandalone ? 'App Installed' : 'Install 5e Spellbook'}
        </h2>

        <p className="text-xs text-zinc-400 mb-5 max-w-xs mx-auto">
          {isStandalone
            ? 'You are running the installed offline Progressive Web App on your device.'
            : 'Install this app on your phone or desktop for full-screen offline access without an internet connection.'}
        </p>

        {isStandalone ? (
          <div className="bg-[#161616] border border-zinc-800 rounded-xl p-4 mb-4 text-left space-y-2">
            <div className="flex items-center gap-2 text-xs text-[#c5a059] font-semibold">
              <Check className="w-4 h-4" />
              <span>Full Offline Capability Enabled</span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Your spells, spell slots, and custom homebrew entries are stored locally on your device.
            </p>
          </div>
        ) : isIOS ? (
          /* iOS Safari Specific Instructions */
          <div className="bg-[#161616] border border-zinc-800 rounded-xl p-4 mb-4 text-left space-y-3">
            <div className="flex items-center gap-2 text-xs font-serif font-bold text-[#c5a059]">
              <Share className="w-4 h-4 text-[#c5a059]" />
              <span>How to install on iOS / Safari:</span>
            </div>
            <ol className="space-y-2.5 text-xs text-zinc-300">
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-[10px] font-mono text-[#c5a059]">
                  1
                </span>
                <span>
                  Tap the <strong className="text-white">Share</strong> button at the bottom of Safari (the box with an arrow <Share className="inline w-3.5 h-3.5 text-[#c5a059] mb-0.5" />).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-[10px] font-mono text-[#c5a059]">
                  2
                </span>
                <span>
                  Scroll down and select <strong className="text-white">"Add to Home Screen"</strong> (➕).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-[10px] font-mono text-[#c5a059]">
                  3
                </span>
                <span>
                  Tap <strong className="text-[#c5a059]">Add</strong> in the top right corner. The spellbook icon will appear on your phone home screen!
                </span>
              </li>
            </ol>
          </div>
        ) : deferredPrompt ? (
          /* Android / Chrome Native Prompt Available */
          <div className="bg-[#161616] border border-zinc-800 rounded-xl p-4 mb-5 text-left space-y-2">
            <div className="flex items-center gap-2 text-xs text-zinc-200">
              <Sparkles className="w-4 h-4 text-[#c5a059]" />
              <span>Tap below to install directly to your device apps.</span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Runs full-screen with native launch icon and zero browser address bar clutter.
            </p>
          </div>
        ) : (
          /* Fallback / Already promptable or generic browser */
          <div className="bg-[#161616] border border-zinc-800 rounded-xl p-4 mb-5 text-left space-y-2">
            <p className="text-xs text-zinc-300">
              To install on this browser, open your browser menu (<strong className="text-white">⋮</strong> or <strong className="text-white">⋯</strong>) and choose <strong className="text-[#c5a059]">"Install app"</strong> or <strong className="text-[#c5a059]">"Add to Home screen"</strong>.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold transition-colors border border-zinc-800"
          >
            {isStandalone ? 'Close' : 'Cancel'}
          </button>

          {!isStandalone && deferredPrompt && (
            <button
              onClick={handleInstallClick}
              disabled={installing}
              className="flex-1 py-2.5 rounded-lg bg-[#c5a059] hover:bg-[#d4af37] text-black text-xs font-bold shadow-lg flex items-center justify-center gap-1.5 active:scale-95 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-black" />
              <span>{installing ? 'Installing...' : 'Install Now'}</span>
            </button>
          )}

          {!isStandalone && isIOS && (
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg bg-[#c5a059] hover:bg-[#d4af37] text-black text-xs font-bold shadow-lg flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <Check className="w-4 h-4 text-black" />
              <span>Got It</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
