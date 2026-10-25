import React, { useState } from 'react';
import { DiaryEntry } from '../types/diary';
import { MOODS, formatJournalDate, formatOneYearStyleDate } from '../utils/diaryHelpers';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Sparkles } from 'lucide-react';
import { DoodleFlower, DoodleTree, DoodleSprout, DoodleMushroom, DoodleCherries, getRandomDoodle } from './BotanicalDoodles';

interface CalendarViewProps {
  entries: DiaryEntry[];
  onSelectEntry: (entry: DiaryEntry) => void;
  onNewEntryForDate: (dateStr: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  entries,
  onSelectEntry,
  onNewEntryForDate,
}) => {
  const [viewMode, setViewMode] = useState<'365grid' | 'month'>('365grid');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthName = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  // Map entries by date
  const entriesByDate: Record<string, DiaryEntry[]> = {};
  entries.forEach(entry => {
    if (!entriesByDate[entry.date]) {
      entriesByDate[entry.date] = [];
    }
    entriesByDate[entry.date].push(entry);
  });

  const dayEntries = entriesByDate[selectedDateStr] || [];
  const loggedDaysCount = Object.keys(entriesByDate).length;

  // Generate 365 days for the year grid
  const daysInYear: { dateStr: string; dayOfYear: number; hasEntry: boolean; firstEntry?: DiaryEntry }[] = [];
  const startOfYear = new Date(year, 0, 1);
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const totalDaysInYear = isLeap ? 366 : 365;

  for (let i = 0; i < totalDaysInYear; i++) {
    const d = new Date(year, 0, i + 1);
    const dateStr = d.toISOString().slice(0, 10);
    const hasEntry = !!entriesByDate[dateStr];
    daysInYear.push({
      dateStr,
      dayOfYear: i + 1,
      hasEntry,
      firstEntry: entriesByDate[dateStr]?.[0],
    });
  }

  // Monthly calendar calculation
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();

  return (
    <div className="flex flex-col flex-1 p-4 overflow-y-auto no-scrollbar pb-24">
      {/* 2026 Year Pill Badge inspired by One Year header */}
      <div className="flex flex-col items-center mb-4">
        <div className="px-4 py-1 rounded-xl bg-[#E83375] text-white font-mono text-xs font-bold tracking-wider shadow-sm shadow-[#E83375]/30">
          {year}
        </div>
        <span className="font-mono text-[11px] text-[#7A7485] mt-1.5 lowercase">
          {loggedDaysCount} days of growth · secret logs
        </span>
      </div>

      {/* View Switcher Segmented Control */}
      <div className="flex items-center justify-center mb-5">
        <div className="flex items-center p-1 bg-white border border-[#E2DCE8] rounded-2xl shadow-xs">
          <button
            type="button"
            onClick={() => setViewMode('365grid')}
            className={`px-3 py-1.5 rounded-xl font-mono text-xs transition-all flex items-center gap-1.5 ${
              viewMode === '365grid'
                ? 'bg-[#E83375] text-white shadow-xs font-semibold'
                : 'text-[#7A7485] hover:text-[#1E1926]'
            }`}
          >
            <DoodleSprout className={`w-3.5 h-3.5 ${viewMode === '365grid' ? 'text-white' : 'text-[#7A7485]'}`} />
            <span>365 garden</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('month')}
            className={`px-3 py-1.5 rounded-xl font-mono text-xs transition-all flex items-center gap-1.5 ${
              viewMode === 'month'
                ? 'bg-[#E83375] text-white shadow-xs font-semibold'
                : 'text-[#7A7485] hover:text-[#1E1926]'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>monthly</span>
          </button>
        </div>
      </div>

      {viewMode === '365grid' ? (
        /* ================= ONE YEAR 365-DAY BOTANICAL GARDEN ================= */
        <div className="bg-white border border-[#E3DEEA] rounded-[30px] p-5 shadow-xs mb-4">
          <div className="text-center mb-4">
            <h3 className="font-mono text-xs text-[#1E1926] font-semibold lowercase">
              your secret garden of days
            </h3>
            <p className="font-mono text-[10px] text-[#9790A2] mt-0.5 lowercase">
              each written day blossoms into a botanical memory
            </p>
          </div>

          {/* Botanical Sprouted Garden Row (for written days) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 px-1 mb-4 border-b border-[#F0ECF5]">
            {daysInYear
              .filter(d => d.hasEntry)
              .map((dayItem, idx) => {
                const BotanicalIcon = getRandomDoodle(dayItem.dateStr);
                const isSelected = selectedDateStr === dayItem.dateStr;
                return (
                  <button
                    key={dayItem.dateStr}
                    type="button"
                    onClick={() => setSelectedDateStr(dayItem.dateStr)}
                    className={`flex flex-col items-center p-2 rounded-2xl transition-all shrink-0 ${
                      isSelected
                        ? 'bg-[#FDEEF4] ring-1 ring-[#E83375] scale-105'
                        : 'hover:bg-[#F8F6FA]'
                    }`}
                  >
                    <BotanicalIcon className="w-6 h-6 text-[#E83375]" color="#E83375" />
                    <span className="font-mono text-[9px] text-[#7A7485] mt-1">
                      {dayItem.dateStr.slice(5)}
                    </span>
                  </button>
                );
              })}
            {loggedDaysCount === 0 && (
              <div className="text-center w-full py-2 font-mono text-xs text-[#9790A2] lowercase">
                no sprouts yet · tap below to plant your first memory
              </div>
            )}
          </div>

          {/* Dotted Matrix for all 365 days of the year */}
          <div className="grid grid-cols-12 gap-1.5 sm:gap-2 max-w-sm mx-auto p-2">
            {daysInYear.map(dayItem => {
              const isSelected = selectedDateStr === dayItem.dateStr;
              const isToday = new Date().toISOString().slice(0, 10) === dayItem.dateStr;
              return (
                <button
                  key={dayItem.dayOfYear}
                  type="button"
                  title={`${dayItem.dateStr} (Day ${dayItem.dayOfYear})`}
                  onClick={() => setSelectedDateStr(dayItem.dateStr)}
                  className={`aspect-square rounded-full flex items-center justify-center transition-all ${
                    dayItem.hasEntry
                      ? 'bg-[#E83375] text-white shadow-xs scale-110'
                      : isToday
                      ? 'border-2 border-[#E83375] bg-white scale-105'
                      : isSelected
                      ? 'bg-[#1E1926] text-white scale-110'
                      : 'bg-[#D2CCD9] hover:bg-[#B6ADC0]'
                  }`}
                >
                  <span className="sr-only">Day {dayItem.dayOfYear}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-[#9790A2] mt-4 pt-3 border-t border-[#F0ECF5]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E83375]" />
              <span className="lowercase">planted memory</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full border border-[#E83375] bg-white" />
              <span className="lowercase">today</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D2CCD9]" />
              <span className="lowercase">empty day</span>
            </div>
          </div>
        </div>
      ) : (
        /* ================= MONTHLY CALENDAR VIEW ================= */
        <div className="bg-white border border-[#E3DEEA] rounded-[30px] p-5 shadow-xs mb-4">
          {/* Month Navigator */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-mono text-xs font-bold text-[#1E1926] lowercase">
              {monthName.toLowerCase()}
            </h3>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prevMonth}
                aria-label="Previous month"
                className="p-1.5 text-[#7A7485] hover:text-[#1E1926] rounded-lg hover:bg-[#F8F6FA]"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                aria-label="Next month"
                className="p-1.5 text-[#7A7485] hover:text-[#1E1926] rounded-lg hover:bg-[#F8F6FA]"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px] font-semibold text-[#9790A2] mb-2 lowercase">
            {['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa'].map(day => (
              <div key={day} className="py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5 mb-2">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {Array.from({ length: daysInCurrentMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isSelected = selectedDateStr === dateStr;
              const dayHasEntries = !!entriesByDate[dateStr];
              const isToday = new Date().toISOString().slice(0, 10) === dateStr;

              return (
                <button
                  key={dayNum}
                  type="button"
                  onClick={() => setSelectedDateStr(dateStr)}
                  className={`aspect-square rounded-2xl p-1 flex flex-col items-center justify-between border transition-all text-xs ${
                    isSelected
                      ? 'border-[#E83375] bg-[#FDEEF4] text-[#E83375] font-bold'
                      : isToday
                      ? 'border-[#1E1926] bg-white text-[#1E1926] font-bold'
                      : 'border-transparent hover:bg-[#F8F6FA] text-[#463F52]'
                  }`}
                >
                  <span className="font-mono text-[11px]">{dayNum}</span>
                  {dayHasEntries && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E83375] mb-0.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Day Action Card */}
      <div className="bg-white rounded-[26px] p-4 border border-[#E3DEEA] shadow-xs">
        <div className="flex items-center justify-between mb-3 border-b border-[#F0ECF5] pb-2.5">
          <div>
            <h4 className="font-mono text-xs font-semibold text-[#1E1926] lowercase">
              {formatOneYearStyleDate(selectedDateStr)}
            </h4>
            <span className="font-mono text-[10px] text-[#9790A2]">
              {dayEntries.length === 0
                ? 'no logs written'
                : `${dayEntries.length} secret log${dayEntries.length > 1 ? 's' : ''}`}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onNewEntryForDate(selectedDateStr)}
            className="px-3.5 py-1.5 rounded-xl bg-[#E83375] hover:bg-[#D42364] text-white text-xs font-mono font-medium flex items-center gap-1 active:scale-95 shadow-xs transition-transform"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>write today</span>
          </button>
        </div>

        {/* Entries list for that day */}
        {dayEntries.length > 0 ? (
          <div className="space-y-2">
            {dayEntries.map(entry => {
              const mood = MOODS[entry.mood] || MOODS.thoughtful;
              return (
                <div
                  key={entry.id}
                  onClick={() => onSelectEntry(entry)}
                  className="p-3 rounded-2xl bg-[#F8F6FA] hover:bg-[#F3EFF8] border border-[#E9E4F0] cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between text-xs text-[#7A7485] mb-1">
                    <span className="font-mono text-[10px]">{entry.time || '12:00'}</span>
                    <span className="flex items-center gap-1">
                      <span>{mood.emoji}</span>
                      <span className="font-mono text-[10px] text-[#554E60] lowercase">{mood.label}</span>
                    </span>
                  </div>
                  <h5 className="text-xs font-semibold text-[#1E1926] line-clamp-1 mb-1">
                    {entry.title || 'Untitled Secret'}
                  </h5>
                  <p className="text-xs text-[#6B6476] line-clamp-2">
                    {entry.content}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="font-mono text-xs text-[#9790A2] py-2 text-center lowercase">
            empty day · tap write to plant a memory
          </p>
        )}
      </div>
    </div>
  );
};
