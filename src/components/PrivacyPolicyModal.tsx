import React, { useState } from 'react';
import { X, ShieldCheck, MapPin, Fingerprint, HardDrive, Check, Copy, ExternalLink } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const policyText = `PRIVACY POLICY & DATA SAFETY DECLARATION FOR SECRETLOGS
Last Updated: October 2026
Target Application: SecretLogs (Android / PWA)
Package ID: com.secretlogs.diary

1. OVERVIEW
SecretLogs is designed from the ground up as a private personal journal. We believe your thoughts, reflections, and personal memories belong solely to you. SecretLogs operates without user accounts or tracking servers.

2. LOCAL-FIRST DATA STORAGE
All journal logs, handwritten notes, photographs, audio voice memos, and tags are stored directly on your physical Android device. Your diary entries are encrypted using industry-standard AES-GCM encryption with keys derived on-device. Zero data is uploaded to remote servers or third-party cloud infrastructure.

3. LOCATION DATA DISCLOSURE
SecretLogs requests permission to access your device's approximate and precise location (GPS/Network) solely when you tap the location pin button while drafting a journal entry. 
- Purpose: To label your personal memories with your current city or location for your own reference.
- Transmission: Coordinates are only used for on-device reverse geocoding. We do not track background location, sell, or transmit location data to advertisers or third parties.

4. BIOMETRIC AUTHENTICATION
SecretLogs supports fingerprint and face recognition via Android's native hardware BiometricPrompt and WebAuthn APIs. 
- Your biometric data is processed entirely within your device's hardware Secure Enclave / Trusted Execution Environment (TEE).
- SecretLogs never accesses, reads, stores, or transmits your actual biometric samples.

5. CAMERA & MEDIA STORAGE
Permission to access the camera or photo library is requested exclusively when you voluntarily attach images to a diary log. Uploaded images are stored in your device's local database.

6. DATA DELETION & EXPORT RIGHTS
You maintain absolute ownership and control of your data. You may at any moment:
- Export your entire journal to a decrypted or password-encrypted JSON archive.
- Export selected entries to printable PDF documents or JPEG cards.
- Permanently purge and wipe all database contents in one tap under Settings.

7. DEVELOPER & CONTACT INFORMATION
For questions regarding this policy or technical support, please contact the developer at: fellydeez@gmail.com`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(policyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#151419] border border-[#2A2735] text-[#ECEBF0] rounded-2xl w-full max-w-xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#252230]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E83375]/15 border border-[#E83375]/30 flex items-center justify-center text-[#E83375]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-wide text-white">Privacy Policy & Data Safety</h2>
              <p className="text-[11px] text-[#8E8A9F] font-mono">Google Play Store Compliance</p>
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

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-[#B5B1C5] leading-relaxed">
          {/* Quick Summary Cards */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-[#1C1A24] border border-[#2A2735] p-3 rounded-xl">
              <HardDrive className="w-4 h-4 text-[#E83375] mb-1.5" />
              <div className="font-semibold text-white text-[11px]">Local Device Only</div>
              <div className="text-[10px] text-[#7E7A90] mt-0.5">Zero remote servers</div>
            </div>
            <div className="bg-[#1C1A24] border border-[#2A2735] p-3 rounded-xl">
              <MapPin className="w-4 h-4 text-amber-400 mb-1.5" />
              <div className="font-semibold text-white text-[11px]">On-Demand GPS</div>
              <div className="text-[10px] text-[#7E7A90] mt-0.5">Tagged on tap only</div>
            </div>
            <div className="bg-[#1C1A24] border border-[#2A2735] p-3 rounded-xl">
              <Fingerprint className="w-4 h-4 text-emerald-400 mb-1.5" />
              <div className="font-semibold text-white text-[11px]">Hardware Biometric</div>
              <div className="text-[10px] text-[#7E7A90] mt-0.5">Secured in enclave</div>
            </div>
          </div>

          <div className="bg-[#181621] p-3.5 rounded-xl border border-[#282535] space-y-3 font-mono text-[11px]">
            <div>
              <span className="text-white font-semibold">1. No User Accounts:</span> No email, phone number, or registration required.
            </div>
            <div>
              <span className="text-white font-semibold">2. Local Encryption:</span> AES-GCM cryptographic keys generated locally; notes never leave your phone.
            </div>
            <div>
              <span className="text-white font-semibold">3. Location Privacy:</span> Geolocation used purely to stamp city name when you tap the location button in the composer.
            </div>
            <div>
              <span className="text-white font-semibold">4. Data Ownership:</span> Export complete backups as JSON, PDF, or JPEG at any time.
            </div>
            <div>
              <span className="text-white font-semibold">5. Contact:</span> fellydeez@gmail.com
            </div>
          </div>

          <div className="pt-2 border-t border-[#252230] flex items-center justify-between text-[11px]">
            <span className="text-[#7E7A90]">Need this for Play Console submission?</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#252230] hover:bg-[#2F2B3E] text-white transition text-xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#E83375]" />
                  <span>Copy Full Policy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#252230] bg-[#100F14] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#E83375] hover:bg-[#D42B67] text-white font-medium text-xs transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
