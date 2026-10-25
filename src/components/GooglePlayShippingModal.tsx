import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  CheckCircle2, 
  Copy, 
  Check, 
  Download, 
  FileText, 
  Layers, 
  ExternalLink,
  ShieldCheck,
  Terminal
} from 'lucide-react';

interface GooglePlayShippingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPrivacyPolicy: () => void;
}

export const GooglePlayShippingModal: React.FC<GooglePlayShippingModalProps> = ({
  isOpen,
  onClose,
  onOpenPrivacyPolicy,
}) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = async (text: string, sectionId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(sectionId);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch {
      // fallback
    }
  };

  const bubblewrapCommand = `# 1. Install Google's official Bubblewrap CLI
npm install -g @bubblewrap/cli

# 2. Initialize your Android App Bundle from your live URL
bubblewrap init --manifest="${window.location.origin}/manifest.json"

# 3. Build signed production .aab for Google Play Store
bubblewrap build`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#151419] border border-[#2A2735] text-[#ECEBF0] rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#252230]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E83375]/15 border border-[#E83375]/30 flex items-center justify-center text-[#E83375]">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-wide text-white">Google Play Store Shipping Kit</h2>
              <p className="text-[11px] text-[#8E8A9F] font-mono">Ready for Trusted Web Activity (TWA) & AAB</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8E8A9F] hover:text-white hover:bg-[#252230] transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs font-mono">
          {/* Readiness Checklist */}
          <div className="bg-[#1C1A24] border border-[#2A2735] rounded-xl p-4 space-y-2.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#8E8A9F] block">
              Play Store Readiness Status
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center gap-2 text-white">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Web App Manifest configured</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Service worker & offline cache</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>512x512 High-Res App Icon</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>512x512 Android Maskable Icon</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>1024x500 Feature Graphic</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Digital Asset Links configured</span>
              </div>
            </div>
          </div>

          {/* Package Configuration */}
          <div className="bg-[#181621] border border-[#262332] rounded-xl p-4 space-y-2 text-[11px]">
            <div className="flex justify-between items-center text-[#8E8A9F]">
              <span className="uppercase text-[10px] font-bold">Package Identifiers</span>
              <span className="text-emerald-400">Target SDK: 35 (Android 15)</span>
            </div>
            <div className="space-y-1 text-white">
              <div><span className="text-[#8E8A9F]">Package ID:</span> <span className="text-[#E83375] font-bold">com.secretlogs.diary</span></div>
              <div><span className="text-[#8E8A9F]">App Name:</span> SecretLogs</div>
              <div><span className="text-[#8E8A9F]">Version:</span> 1.0.0 (versionCode 1)</div>
              <div><span className="text-[#8E8A9F]">Display Mode:</span> Standalone / Fullscreen</div>
            </div>
          </div>

          {/* Two Fast Paths to Generate .AAB */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#8E8A9F] block">
              Generate Android App Bundle (.aab)
            </span>

            {/* Option A: PWABuilder (Fastest, zero install) */}
            <div className="bg-[#1C1A24] border border-[#2A2735] rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#E83375] text-white flex items-center justify-center text-[10px] font-bold">A</span>
                  <span className="font-bold text-white text-xs">PWABuilder (1-Click AAB)</span>
                </div>
                <a
                  href={`https://www.pwabuilder.com?site=${encodeURIComponent(window.location.origin)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[11px] text-[#E83375] hover:underline"
                >
                  <span>Open PWABuilder</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-[11px] text-[#A09CB3] leading-relaxed">
                Paste your app URL in PWABuilder, click <strong>Package for Google Play</strong>, and download your signed <code>.aab</code> package ready to drag into the Google Play Console!
              </p>
            </div>

            {/* Option B: Google Bubblewrap CLI */}
            <div className="bg-[#1C1A24] border border-[#2A2735] rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#2A2735] text-[#D0CDE0] flex items-center justify-center text-[10px] font-bold">B</span>
                  <span className="font-bold text-white text-xs">Google Bubblewrap CLI</span>
                </div>
                <button
                  onClick={() => copyToClipboard(bubblewrapCommand, 'bubblewrap')}
                  className="flex items-center gap-1 text-[11px] text-[#8E8A9F] hover:text-white"
                >
                  {copiedSection === 'bubblewrap' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Commands</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="bg-[#100F14] p-2.5 rounded-lg text-[10px] text-[#D0CDE0] overflow-x-auto leading-relaxed border border-[#23202E]">
                {bubblewrapCommand}
              </pre>
            </div>
          </div>

          {/* Asset Downloads & Files */}
          <div className="bg-[#1C1A24] border border-[#2A2735] rounded-xl p-3.5 space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#8E8A9F] block">
              Store Graphics & Assets
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <a
                href="/pwa-512x512.png"
                download="secretlogs_icon_512x512.png"
                className="flex items-center justify-between p-2 rounded-lg bg-[#252230] hover:bg-[#2C283A] text-white transition"
              >
                <span>512x512 App Icon</span>
                <Download className="w-3.5 h-3.5 text-[#E83375]" />
              </a>
              <a
                href="/play-feature-graphic.png"
                download="secretlogs_feature_1024x500.png"
                className="flex items-center justify-between p-2 rounded-lg bg-[#252230] hover:bg-[#2C283A] text-white transition"
              >
                <span>1024x500 Graphic</span>
                <Download className="w-3.5 h-3.5 text-[#E83375]" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#252230] bg-[#100F14] flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onOpenPrivacyPolicy();
            }}
            className="flex items-center gap-1.5 text-xs text-[#E83375] hover:underline font-mono"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Open Privacy Policy</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#E83375] hover:bg-[#D42B67] text-white font-medium text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
