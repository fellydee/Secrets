import React, { useState, useEffect, useCallback } from 'react';
import { DiaryEntry, SecuritySettings, MoodType } from './types/diary';
import { 
  getStoredEntries, 
  getStoredSecuritySettings, 
  createOrUpdateEntry, 
  deleteStoredEntry, 
  toggleStoredFavorite, 
  saveStoredSecuritySettings 
} from './services/storage';
import { AndroidStatusBar } from './components/AndroidStatusBar';
import { LockScreen } from './components/LockScreen';
import { BottomNav, TabType } from './components/BottomNav';
import { EntryCard } from './components/EntryCard';
import { EntryEditor } from './components/EntryEditor';
import { CalendarView } from './components/CalendarView';
import { PhotoGalleryView } from './components/PhotoGalleryView';
import { ExportModal } from './components/ExportModal';
import { SecuritySettingsModal } from './components/SecuritySettingsModal';
import { DecoyView } from './components/DecoyView';
import { AndroidFrameWrapper } from './components/AndroidFrameWrapper';
import { StartupScreen } from './components/StartupScreen';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { GooglePlayShippingModal } from './components/GooglePlayShippingModal';
import { MOODS } from './utils/diaryHelpers';
import { 
  Search, 
  Lock, 
  FileDown, 
  BookOpen, 
  Heart, 
  Plus
} from 'lucide-react';
import { DoodleFlower, DoodleSprout } from './components/BotanicalDoodles';

export default function App() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [settings, setSettings] = useState<SecuritySettings>(getStoredSecuritySettings);
  const [isStartingUp, setIsStartingUp] = useState(true);
  
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    const s = getStoredSecuritySettings();
    return s.isLockEnabled;
  });
  const [isDecoyMode, setIsDecoyMode] = useState(false);

  const [currentTab, setCurrentTab] = useState<TabType>('timeline');
  const [isEditingEntry, setIsEditingEntry] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMoodFilter, setSelectedMoodFilter] = useState<MoodType | 'all'>('all');
  const [filterFavoritesOnly, setFilterFavoritesOnly] = useState(false);

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportTargetEntry, setExportTargetEntry] = useState<DiaryEntry | null>(null);
  const [isPrivacyPolicyOpen, setIsPrivacyPolicyOpen] = useState(false);
  const [isShippingKitOpen, setIsShippingKitOpen] = useState(false);

  useEffect(() => {
    const loadedEntries = getStoredEntries();
    setEntries(loadedEntries);
  }, []);

  // Auto-lock timer logic
  useEffect(() => {
    if (!settings.isLockEnabled || settings.autoLockMinutes <= 0) return;

    let timeoutId: any;
    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsLocked(true);
      }, settings.autoLockMinutes * 60 * 1000);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && settings.autoLockMinutes === 0) {
        setIsLocked(true);
      }
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('touchstart', resetTimer);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [settings.isLockEnabled, settings.autoLockMinutes]);

  const handleLockVault = useCallback(() => {
    if ('vibrate' in navigator) navigator.vibrate(20);
    setIsLocked(true);
  }, []);

  const handleUnlockVault = useCallback(() => {
    setIsLocked(false);
    setIsDecoyMode(false);
  }, []);

  const handleSaveEntry = (entry: DiaryEntry) => {
    const updated = createOrUpdateEntry(entry);
    setEntries(updated);
    setIsEditingEntry(false);
    setEditingEntry(null);
  };

  const handleDeleteEntry = (id: string) => {
    const updated = deleteStoredEntry(id);
    setEntries(updated);
  };

  const handleToggleFavorite = (id: string) => {
    const updated = toggleStoredFavorite(id);
    setEntries(updated);
  };

  const handleOpenNewEntry = (initialDate?: string) => {
    const newEntryTemplate: DiaryEntry | null = initialDate
      ? {
          id: 'entry_' + Date.now(),
          title: '',
          content: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          date: initialDate,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
          mood: 'peaceful',
          weather: 'sunny',
          tags: [],
          photos: [],
          isFavorite: false,
          wordCount: 0,
        }
      : null;

    setEditingEntry(newEntryTemplate);
    setIsEditingEntry(true);
  };

  const handleEditEntry = (entry: DiaryEntry) => {
    setEditingEntry(entry);
    setIsEditingEntry(true);
  };

  const handleOpenExportForEntry = (entry: DiaryEntry) => {
    setExportTargetEntry(entry);
    setIsExportModalOpen(true);
  };

  const handleOpenGeneralExport = () => {
    setExportTargetEntry(null);
    setIsExportModalOpen(true);
  };

  const handleUpdateSettings = (newSettings: SecuritySettings) => {
    setSettings(newSettings);
    saveStoredSecuritySettings(newSettings);
  };

  const handleRefreshEntries = () => {
    setEntries(getStoredEntries());
  };

  const filteredEntries = entries.filter(e => {
    if (filterFavoritesOnly && !e.isFavorite) return false;
    if (selectedMoodFilter !== 'all' && e.mood !== selectedMoodFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inTitle = (e.title || '').toLowerCase().includes(q);
      const inContent = (e.content || '').toLowerCase().includes(q);
      const inTags = e.tags.some(t => t.toLowerCase().includes(q));
      const inLocation = (e.location || '').toLowerCase().includes(q);
      return inTitle || inContent || inTags || inLocation;
    }
    return true;
  });

  return (
    <AndroidFrameWrapper>
      {/* 0. Startup Screen with Centered Logo & Fading Animation to Logs Tab */}
      {isStartingUp && (
        <StartupScreen
          onComplete={() => {
            setIsStartingUp(false);
            setCurrentTab('timeline');
          }}
        />
      )}

      {/* 1. Android Status Bar */}
      <AndroidStatusBar 
        isLocked={isLocked} 
        stealthMode={settings.stealthMode} 
      />

      {/* 2. Decoy Stealth Mode */}
      {isDecoyMode ? (
        <DecoyView onExitDecoy={() => setIsDecoyMode(false)} />
      ) : isLocked ? (
        /* 3. Lock Screen */
        <LockScreen
          settings={settings}
          onUnlock={handleUnlockVault}
          onDecoyUnlock={() => setIsDecoyMode(true)}
        />
      ) : isEditingEntry ? (
        /* 4. Fullscreen Entry Editor */
        <EntryEditor
          entry={editingEntry}
          onSave={handleSaveEntry}
          onClose={() => {
            setIsEditingEntry(false);
            setEditingEntry(null);
          }}
          onExportPdf={handleOpenExportForEntry}
          onExportJpeg={handleOpenExportForEntry}
        />
      ) : (
        /* 5. Main App Navigation & Views */
        <div className="flex flex-col flex-1 bg-[#F4F3F7] overflow-hidden relative">
          {/* Top Bar with Official SECRET LOGS Logo */}
          <header className="flex items-center justify-between gap-4 px-4 py-3 bg-[#F4F3F7]/95 backdrop-blur-md border-b border-[#E3DEEA] z-20 shrink-0">
            {/* Brand Zone */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white p-1 border border-[#F8CBDC] shadow-xs flex items-center justify-center shrink-0">
                <img
                  src="/assets/aistudio/SECRET_LOGS_b4791025.png"
                  alt="Secret Logs"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-mono text-xs font-bold tracking-wider text-[#E83375] uppercase whitespace-nowrap">
                {settings.stealthMode ? 'Daily Notes' : 'Secret Logs'}
              </span>
            </div>

            {/* Navigation / Counter */}
            <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] text-[#7A7485] lowercase">
              <span>{entries.length} memories planted</span>
            </div>

            {/* Primary Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              <PWAInstallButton />

              <button
                type="button"
                onClick={handleOpenGeneralExport}
                className="min-h-[38px] px-3 rounded-2xl bg-white border border-[#E3DEEA] hover:border-[#E83375] text-xs font-mono font-medium text-[#1E1926] flex items-center gap-1.5 active:scale-95 transition-all lowercase shadow-xs"
                title="Export PDF / JPEG"
              >
                <FileDown className="w-3.5 h-3.5 text-[#E83375]" />
                <span className="hidden xs:inline">export</span>
              </button>

              <button
                type="button"
                onClick={handleLockVault}
                className="min-h-[38px] p-2 rounded-2xl bg-white border border-[#E3DEEA] hover:border-[#E83375] text-[#7A7485] hover:text-[#E83375] active:scale-95 transition-all shadow-xs"
                title="Lock Vault Now"
                aria-label="Lock Vault"
              >
                <Lock className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Main Body */}
          <main className="flex-1 overflow-y-auto no-scrollbar flex flex-col">
            {currentTab === 'timeline' && (
              <div className="p-4 space-y-4 pb-24">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-[#A099AB] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="search memories, thoughts, tags..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-[#E3DEEA] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#1E1926] placeholder:text-[#A099AB] focus:outline-none focus:border-[#E83375] font-mono lowercase shadow-xs"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-[#A099AB] hover:text-[#E83375] lowercase"
                    >
                      clear
                    </button>
                  )}
                </div>

                {/* Mood Filter Carousel */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                  <button
                    type="button"
                    onClick={() => setSelectedMoodFilter('all')}
                    className={`min-h-[34px] px-3.5 rounded-2xl font-mono text-xs border shrink-0 transition-all lowercase ${
                      selectedMoodFilter === 'all' && !filterFavoritesOnly
                        ? 'border-[#E83375] bg-[#E83375] text-white font-bold shadow-xs'
                        : 'border-[#E3DEEA] bg-white text-[#7A7485] hover:text-[#1E1926]'
                    }`}
                  >
                    all logs
                  </button>

                  <button
                    type="button"
                    onClick={() => setFilterFavoritesOnly(!filterFavoritesOnly)}
                    className={`min-h-[34px] px-3.5 rounded-2xl font-mono text-xs border shrink-0 flex items-center gap-1.5 transition-all lowercase ${
                      filterFavoritesOnly
                        ? 'border-[#E83375] bg-[#FDEEF4] text-[#E83375] font-bold shadow-xs'
                        : 'border-[#E3DEEA] bg-white text-[#7A7485] hover:text-[#1E1926]'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${filterFavoritesOnly ? 'fill-[#E83375] text-[#E83375]' : ''}`} />
                    <span>favorites</span>
                  </button>

                  {Object.values(MOODS).map(m => {
                    const isSelected = selectedMoodFilter === m.type;
                    return (
                      <button
                        key={m.type}
                        type="button"
                        onClick={() => {
                          setFilterFavoritesOnly(false);
                          setSelectedMoodFilter(isSelected ? 'all' : m.type);
                        }}
                        className={`min-h-[34px] px-3.5 rounded-2xl font-mono text-xs border shrink-0 flex items-center gap-1.5 transition-all lowercase ${
                          isSelected
                            ? 'border-[#E83375] bg-[#FDEEF4] text-[#E83375] font-bold shadow-xs'
                            : 'border-[#E3DEEA] bg-white text-[#7A7485] hover:text-[#1E1926]'
                        }`}
                      >
                        <span>{m.emoji}</span>
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Entry Feed List */}
                {filteredEntries.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center text-[#7A7485]">
                    <div className="w-16 h-16 rounded-3xl bg-white border border-[#E3DEEA] flex items-center justify-center mb-3 shadow-xs">
                      <DoodleFlower className="w-8 h-8 text-[#E83375]" color="#E83375" />
                    </div>
                    <h3 className="font-mono text-xs font-semibold text-[#1E1926] mb-1 lowercase">
                      {searchQuery || selectedMoodFilter !== 'all'
                        ? 'no matching secret logs'
                        : 'your garden is waiting'}
                    </h3>
                    <p className="font-mono text-[11px] text-[#9790A2] max-w-xs mb-4 lowercase">
                      {searchQuery || selectedMoodFilter !== 'all'
                        ? 'try adjusting your filter or search query.'
                        : 'plant your first memory today.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleOpenNewEntry()}
                      className="px-4 py-2 rounded-2xl bg-[#E83375] hover:bg-[#D42364] text-white font-mono text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-[#E83375]/30 lowercase"
                    >
                      <Plus className="w-4 h-4" />
                      <span>plant first memory</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {filteredEntries.map(entry => (
                      <EntryCard
                        key={entry.id}
                        entry={entry}
                        onEdit={handleEditEntry}
                        onDelete={handleDeleteEntry}
                        onToggleFavorite={handleToggleFavorite}
                        onExportPdf={handleOpenExportForEntry}
                        onExportJpeg={handleOpenExportForEntry}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {currentTab === 'calendar' && (
              <CalendarView
                entries={entries}
                onSelectEntry={handleEditEntry}
                onNewEntryForDate={handleOpenNewEntry}
              />
            )}

            {currentTab === 'gallery' && (
              <PhotoGalleryView
                entries={entries}
                onSelectEntry={handleEditEntry}
                onOpenNewEntry={() => handleOpenNewEntry()}
              />
            )}

            {currentTab === 'settings' && (
              <SecuritySettingsModal
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
                onRefreshEntries={handleRefreshEntries}
                onLockVaultNow={handleLockVault}
                onOpenPrivacyPolicy={() => setIsPrivacyPolicyOpen(true)}
                onOpenShippingKit={() => setIsShippingKitOpen(true)}
              />
            )}
          </main>

          {/* Bottom Thumb-Zone Navigation Bar */}
          <BottomNav
            currentTab={currentTab}
            onChangeTab={setCurrentTab}
            onOpenNewEntry={() => handleOpenNewEntry()}
          />
        </div>
      )}

      {/* Offline Connectivity Toast Indicator */}
      <OfflineIndicator />

      {/* Export Modal */}
      {isExportModalOpen && (
        <ExportModal
          entries={entries}
          activeEntry={exportTargetEntry}
          onClose={() => {
            setIsExportModalOpen(false);
            setExportTargetEntry(null);
          }}
        />
      )}

      {/* Google Play Store Privacy Policy & Data Safety Modal */}
      <PrivacyPolicyModal
        isOpen={isPrivacyPolicyOpen}
        onClose={() => setIsPrivacyPolicyOpen(false)}
      />

      {/* Google Play Store Shipping Kit Modal */}
      <GooglePlayShippingModal
        isOpen={isShippingKitOpen}
        onClose={() => setIsShippingKitOpen(false)}
        onOpenPrivacyPolicy={() => {
          setIsShippingKitOpen(false);
          setIsPrivacyPolicyOpen(true);
        }}
      />
    </AndroidFrameWrapper>
  );
}
