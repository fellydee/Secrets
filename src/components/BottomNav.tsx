import React from 'react';
import { BookOpen, Calendar, Plus, Image as ImageIcon, ShieldCheck, Sparkles } from 'lucide-react';
import { DoodleTree, DoodleSprout } from './BotanicalDoodles';

export type TabType = 'timeline' | 'calendar' | 'write' | 'gallery' | 'settings';

interface BottomNavProps {
  currentTab: TabType;
  onChangeTab: (tab: TabType) => void;
  onOpenNewEntry: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onChangeTab,
  onOpenNewEntry,
}) => {
  return (
    <div className="w-full bg-[#F4F3F7]/95 backdrop-blur-lg border-t border-[#E3DEEA] px-3 py-2 z-30 select-none">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Timeline / Logs Tab */}
        <button
          type="button"
          onClick={() => onChangeTab('timeline')}
          className={`min-h-[46px] min-w-[46px] flex-1 flex flex-col items-center justify-center transition-colors ${
            currentTab === 'timeline'
              ? 'text-[#E83375] font-semibold'
              : 'text-[#7B7586] hover:text-[#1E1926]'
          }`}
        >
          <BookOpen className="w-5 h-5 stroke-[1.8]" />
          <span className="font-mono text-[10px] tracking-tight mt-1 lowercase">logs</span>
        </button>

        {/* 365 Year Garden / Calendar Tab */}
        <button
          type="button"
          onClick={() => onChangeTab('calendar')}
          className={`min-h-[46px] min-w-[46px] flex-1 flex flex-col items-center justify-center transition-colors ${
            currentTab === 'calendar'
              ? 'text-[#E83375] font-semibold'
              : 'text-[#7B7586] hover:text-[#1E1926]'
          }`}
        >
          <div className="relative">
            <DoodleTree className={`w-5 h-5 ${currentTab === 'calendar' ? 'text-[#E83375]' : 'text-[#7B7586]'}`} />
          </div>
          <span className="font-mono text-[10px] tracking-tight mt-1 lowercase">year 365</span>
        </button>

        {/* Center Primary Action: Signature Rose Magenta FAB */}
        <div className="flex-1 flex items-center justify-center">
          <button
            type="button"
            onClick={onOpenNewEntry}
            aria-label="Write New Secret Log"
            className="w-12 h-12 -mt-5 rounded-full bg-[#E83375] hover:bg-[#D42364] text-white shadow-lg shadow-[#E83375]/35 flex items-center justify-center active:scale-95 transition-transform"
          >
            <Plus className="w-6 h-6 stroke-[2.4]" />
          </button>
        </div>

        {/* Memories Gallery Tab */}
        <button
          type="button"
          onClick={() => onChangeTab('gallery')}
          className={`min-h-[46px] min-w-[46px] flex-1 flex flex-col items-center justify-center transition-colors ${
            currentTab === 'gallery'
              ? 'text-[#E83375] font-semibold'
              : 'text-[#7B7586] hover:text-[#1E1926]'
          }`}
        >
          <ImageIcon className="w-5 h-5 stroke-[1.8]" />
          <span className="font-mono text-[10px] tracking-tight mt-1 lowercase">memories</span>
        </button>

        {/* Vault Settings Tab */}
        <button
          type="button"
          onClick={() => onChangeTab('settings')}
          className={`min-h-[46px] min-w-[46px] flex-1 flex flex-col items-center justify-center transition-colors ${
            currentTab === 'settings'
              ? 'text-[#E83375] font-semibold'
              : 'text-[#7B7586] hover:text-[#1E1926]'
          }`}
        >
          <ShieldCheck className="w-5 h-5 stroke-[1.8]" />
          <span className="font-mono text-[10px] tracking-tight mt-1 lowercase">vault</span>
        </button>
      </div>
    </div>
  );
};
