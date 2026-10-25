import React, { useState } from 'react';
import { SecuritySettings } from '../types/diary';
import { hashPin } from '../services/crypto';
import { registerBiometricCredential } from '../services/biometrics';
import { exportBackupJSON, importBackupJSON, wipeAllLocalData } from '../services/storage';
import { 
  ShieldCheck, 
  Fingerprint, 
  KeyRound, 
  Clock, 
  EyeOff, 
  Download, 
  Upload, 
  Trash2, 
  Check, 
  AlertTriangle,
  Lock,
  Smartphone
} from 'lucide-react';

interface SecuritySettingsModalProps {
  settings: SecuritySettings;
  onUpdateSettings: (settings: SecuritySettings) => void;
  onRefreshEntries: () => void;
  onLockVaultNow: () => void;
  onOpenPrivacyPolicy: () => void;
  onOpenShippingKit: () => void;
}

export const SecuritySettingsModal: React.FC<SecuritySettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onRefreshEntries,
  onLockVaultNow,
  onOpenPrivacyPolicy,
  onOpenShippingKit,
}) => {
  const [isEnrollingBiometrics, setIsEnrollingBiometrics] = useState(false);
  const [bioStatusMsg, setBioStatusMsg] = useState('');

  const [isChangingPin, setIsChangingPin] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinSuccess, setPinSuccess] = useState(false);

  const [backupSuccess, setBackupSuccess] = useState(false);
  const [restoreMsg, setRestoreMsg] = useState('');
  const [confirmWipe, setConfirmWipe] = useState(false);

  const handleToggleBiometrics = async () => {
    if (settings.isBiometricsEnabled) {
      onUpdateSettings({
        ...settings,
        isBiometricsEnabled: false,
        biometricCredentialId: null,
      });
      setBioStatusMsg('biometric unlock turned off');
      return;
    }

    setIsEnrollingBiometrics(true);
    setBioStatusMsg('prompting android biometric enrollment...');

    try {
      const reg = await registerBiometricCredential('SecretLogs_Owner');
      if (reg.success && reg.credentialId) {
        onUpdateSettings({
          ...settings,
          isBiometricsEnabled: true,
          biometricCredentialId: reg.credentialId,
          isLockEnabled: true,
        });
        setBioStatusMsg('fingerprint & face unlock enabled!');
      } else {
        setBioStatusMsg(reg.error || 'biometric enrollment cancelled');
      }
    } catch (e: any) {
      setBioStatusMsg('enrollment error: ' + (e.message || 'unknown'));
    } finally {
      setIsEnrollingBiometrics(false);
    }
  };

  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');

    if (newPin.length < 4 || newPin.length > 6) {
      setPinError('pin must be 4 to 6 digits');
      return;
    }

    if (newPin !== confirmPin) {
      setPinError('pins do not match');
      return;
    }

    const hashed = await hashPin(newPin);
    onUpdateSettings({
      ...settings,
      pinHash: hashed,
      isPinEnabled: true,
      isLockEnabled: true,
    });

    setPinSuccess(true);
    setNewPin('');
    setConfirmPin('');
    setTimeout(() => {
      setPinSuccess(false);
      setIsChangingPin(false);
    }, 2000);
  };

  const handleAutoLockChange = (minutes: number) => {
    onUpdateSettings({
      ...settings,
      autoLockMinutes: minutes,
    });
  };

  const handleToggleStealth = () => {
    onUpdateSettings({
      ...settings,
      stealthMode: !settings.stealthMode,
    });
  };

  const handleExportBackup = () => {
    const jsonStr = exportBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `secretlogs_backup_${new Date().toISOString().slice(0, 10)}.secretlogs`;
    link.click();
    URL.revokeObjectURL(url);
    setBackupSuccess(true);
    setTimeout(() => setBackupSuccess(false), 3000);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const res = importBackupJSON(reader.result);
        if (res.success) {
          setRestoreMsg(`restored ${res.count || 0} secret logs!`);
          onRefreshEntries();
        } else {
          setRestoreMsg(res.error || 'failed to restore backup');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleWipeData = () => {
    if (!confirmWipe) {
      setConfirmWipe(true);
      return;
    }
    wipeAllLocalData();
    window.location.reload();
  };

  return (
    <div className="flex flex-col flex-1 p-4 overflow-y-auto no-scrollbar pb-24 space-y-4">
      {/* Top Banner with App Logo */}
      <div className="bg-white p-4 rounded-[28px] border border-[#E3DEEA] shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FDEEF4] border border-[#F8CBDC] p-1.5 flex items-center justify-center">
            <img
              src="/assets/aistudio/SECRET_LOGS_b4791025.png"
              alt="Secret Logs"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#1E1926] font-mono lowercase">
              security & vault
            </h2>
            <span className="text-[11px] font-mono text-[#7A7485] lowercase">
              biometric & pin controls
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onLockVaultNow}
          className="min-h-[44px] px-3.5 rounded-2xl bg-[#1E1926] hover:bg-black text-xs font-mono font-semibold text-white flex items-center gap-1.5 active:scale-95 transition-transform"
        >
          <Lock className="w-3.5 h-3.5 text-[#E83375]" />
          <span>lock now</span>
        </button>
      </div>

      {/* 1. Biometrics Section */}
      <div className="bg-white rounded-[26px] p-4 border border-[#E3DEEA] space-y-2 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FDEEF4] flex items-center justify-center text-[#E83375]">
              <Fingerprint className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#1E1926] font-mono lowercase">
                biometric unlock
              </h3>
              <p className="text-[11px] font-mono text-[#7A7485] lowercase">
                fingerprint & face unlock
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleBiometrics}
            disabled={isEnrollingBiometrics}
            className={`w-12 h-7 rounded-full p-1 transition-colors ${
              settings.isBiometricsEnabled ? 'bg-[#E83375]' : 'bg-[#D2CCD9]'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.isBiometricsEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {bioStatusMsg && (
          <p className="text-xs font-mono text-[#E83375] bg-[#FDEEF4] border border-[#F8CBDC] p-2.5 rounded-xl lowercase">
            {bioStatusMsg}
          </p>
        )}
      </div>

      {/* 2. Master PIN Section */}
      <div className="bg-white rounded-[26px] p-4 border border-[#E3DEEA] space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FDEEF4] flex items-center justify-center text-[#E83375]">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#1E1926] font-mono lowercase">
                master pin
              </h3>
              <p className="text-[11px] font-mono text-[#7A7485] lowercase">
                {settings.pinHash ? 'pin code is set' : 'no pin configured'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsChangingPin(!isChangingPin)}
            className="text-xs font-mono font-bold text-[#E83375] hover:underline lowercase"
          >
            {settings.pinHash ? 'change' : 'set pin'}
          </button>
        </div>

        {isChangingPin && (
          <form onSubmit={handleSavePin} className="space-y-3 pt-2 border-t border-[#F0ECF5]">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-mono text-[#7A7485] block mb-1 lowercase">new 4-6 digit pin</label>
                <input
                  type="password"
                  maxLength={6}
                  inputMode="numeric"
                  value={newPin}
                  onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-[#F8F7FA] border border-[#E3DEEA] rounded-2xl px-3 py-2 text-center text-lg font-mono tracking-widest text-[#1E1926] focus:outline-none focus:border-[#E83375]"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-[#7A7485] block mb-1 lowercase">confirm pin</label>
                <input
                  type="password"
                  maxLength={6}
                  inputMode="numeric"
                  value={confirmPin}
                  onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-[#F8F7FA] border border-[#E3DEEA] rounded-2xl px-3 py-2 text-center text-lg font-mono tracking-widest text-[#1E1926] focus:outline-none focus:border-[#E83375]"
                />
              </div>
            </div>

            {pinError && <p className="text-xs font-mono text-[#E83375] font-medium lowercase">{pinError}</p>}
            {pinSuccess && <p className="text-xs font-mono text-[#2D6A4F] font-medium lowercase">pin updated!</p>}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsChangingPin(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-mono text-[#7A7485] hover:text-[#1E1926] lowercase"
              >
                cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-2xl bg-[#E83375] text-white text-xs font-mono font-bold hover:bg-[#D42364] lowercase"
              >
                save pin
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 3. Auto-Lock Timer */}
      <div className="bg-white rounded-[26px] p-4 border border-[#E3DEEA] space-y-2 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FDEEF4] flex items-center justify-center text-[#E83375]">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#1E1926] font-mono lowercase">
              auto-lock timeout
            </h3>
            <p className="text-[11px] font-mono text-[#7A7485] lowercase">
              lock vault when phone goes idle
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1.5 pt-1">
          {[
            { value: 0, label: 'instant' },
            { value: 1, label: '1 min' },
            { value: 5, label: '5 min' },
            { value: 15, label: '15 min' },
          ].map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleAutoLockChange(opt.value)}
              className={`py-2 px-1 rounded-2xl text-xs font-mono border transition-all text-center lowercase ${
                settings.autoLockMinutes === opt.value
                  ? 'border-[#E83375] bg-[#E83375] text-white font-bold'
                  : 'border-[#E3DEEA] bg-[#F8F7FA] text-[#7A7485] hover:text-[#1E1926]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Stealth Disguise */}
      <div className="bg-white rounded-[26px] p-4 border border-[#E3DEEA] flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FDEEF4] flex items-center justify-center text-[#E83375]">
            <EyeOff className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#1E1926] font-mono lowercase">
              stealth disguise
            </h3>
            <p className="text-[11px] font-mono text-[#7A7485] lowercase">
              masks title as simple daily notes
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggleStealth}
          className={`w-12 h-7 rounded-full p-1 transition-colors ${
            settings.stealthMode ? 'bg-[#E83375]' : 'bg-[#D2CCD9]'
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full bg-white transition-transform ${
              settings.stealthMode ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* 5. Backup & Restore */}
      <div className="bg-white rounded-[26px] p-4 border border-[#E3DEEA] space-y-3 shadow-xs">
        <div>
          <h3 className="text-xs font-bold text-[#1E1926] font-mono lowercase">
            backup & restore
          </h3>
          <p className="text-[11px] font-mono text-[#7A7485] lowercase">
            save or restore your entries via file
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={handleExportBackup}
            className="min-h-[44px] py-2.5 px-3 rounded-2xl bg-[#F8F7FA] hover:bg-[#F2EEF7] text-[#1E1926] text-xs font-mono font-semibold flex items-center justify-center gap-1.5 active:scale-95 border border-[#E3DEEA] lowercase"
          >
            {backupSuccess ? (
              <Check className="w-4 h-4 text-[#E83375]" />
            ) : (
              <Download className="w-4 h-4 text-[#E83375]" />
            )}
            <span>export backup</span>
          </button>

          <label className="min-h-[44px] py-2.5 px-3 rounded-2xl bg-[#F8F7FA] hover:bg-[#F2EEF7] text-[#1E1926] text-xs font-mono font-semibold flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 border border-[#E3DEEA] lowercase">
            <Upload className="w-4 h-4 text-[#E83375]" />
            <span>restore file</span>
            <input
              type="file"
              accept=".secretlogs,.json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>
        </div>

        {restoreMsg && (
          <p className="text-xs font-mono text-[#2D6A4F] bg-[#EEF7F2] p-2 rounded-xl text-center lowercase">
            {restoreMsg}
          </p>
        )}
      </div>

      {/* 6. Google Play Store Readiness & Privacy */}
      <div className="bg-white rounded-[26px] p-4 border border-[#E3DEEA] space-y-3 shadow-xs">
        <div>
          <h3 className="text-xs font-bold text-[#1E1926] font-mono lowercase">
            google play & store readiness
          </h3>
          <p className="text-[11px] font-mono text-[#7A7485] lowercase">
            packaging manifest, assets & store compliance
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={onOpenShippingKit}
            className="min-h-[44px] py-2.5 px-3 rounded-2xl bg-[#F8F7FA] hover:bg-[#F2EEF7] text-[#1E1926] text-xs font-mono font-semibold flex items-center justify-center gap-1.5 active:scale-95 border border-[#E3DEEA] lowercase"
          >
            <Smartphone className="w-4 h-4 text-[#E83375]" />
            <span>shipping kit</span>
          </button>

          <button
            type="button"
            onClick={onOpenPrivacyPolicy}
            className="min-h-[44px] py-2.5 px-3 rounded-2xl bg-[#F8F7FA] hover:bg-[#F2EEF7] text-[#1E1926] text-xs font-mono font-semibold flex items-center justify-center gap-1.5 active:scale-95 border border-[#E3DEEA] lowercase"
          >
            <ShieldCheck className="w-4 h-4 text-[#E83375]" />
            <span>privacy policy</span>
          </button>
        </div>
      </div>

      {/* 7. Self Destruct */}
      <div className="bg-[#FFF5F8] rounded-[26px] p-4 border border-[#F8CBDC] space-y-2">
        <div className="flex items-center gap-2 text-[#E83375]">
          <AlertTriangle className="w-4 h-4" />
          <h3 className="text-xs font-mono font-bold lowercase">
            erase all logs
          </h3>
        </div>
        <p className="text-[11px] font-mono text-[#7A7485] lowercase">
          permanently deletes all entries and resets keys
        </p>

        <button
          type="button"
          onClick={handleWipeData}
          className={`w-full py-2.5 rounded-2xl text-xs font-mono font-bold transition-all lowercase ${
            confirmWipe
              ? 'bg-[#E83375] text-white animate-pulse'
              : 'bg-white hover:bg-[#FDF0F5] text-[#E83375] border border-[#F8CBDC]'
          }`}
        >
          {confirmWipe ? 'tap again to permanently wipe' : 'erase all data'}
        </button>
      </div>
    </div>
  );
};
