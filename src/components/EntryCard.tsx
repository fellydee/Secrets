import React, { useState } from 'react';
import { DiaryEntry } from '../types/diary';
import { MOODS, WEATHERS, formatOneYearStyleDate, getDayOfYearProgress } from '../utils/diaryHelpers';
import { 
  Heart, 
  FileDown, 
  Share2, 
  Edit3, 
  Trash2, 
  MapPin, 
  Mic, 
  MoreVertical,
  Volume2
} from 'lucide-react';
import { getRandomDoodle } from './BotanicalDoodles';

interface EntryCardProps {
  entry: DiaryEntry;
  onEdit: (entry: DiaryEntry) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onExportPdf: (entry: DiaryEntry) => void;
  onExportJpeg: (entry: DiaryEntry) => void;
}

export const EntryCard: React.FC<EntryCardProps> = ({
  entry,
  onEdit,
  onDelete,
  onToggleFavorite,
  onExportPdf,
  onExportJpeg,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const mood = MOODS[entry.mood] || MOODS.thoughtful;
  const weather = WEATHERS[entry.weather] || WEATHERS.sunny;
  const BotanicalIcon = getRandomDoodle(entry.id);

  const handlePlayAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!entry.audioMemo) return;
    try {
      const audio = new Audio(entry.audioMemo);
      setIsPlayingAudio(true);
      audio.onended = () => setIsPlayingAudio(false);
      audio.onerror = () => setIsPlayingAudio(false);
      audio.play();
    } catch (err) {
      console.warn('Audio play error', err);
      setIsPlayingAudio(false);
    }
  };

  const dayOfYear = getDayOfYearProgress(entry.date);
  const dateFormatted = formatOneYearStyleDate(entry.date);

  return (
    <div 
      onClick={() => onEdit(entry)}
      className="group relative bg-white hover:bg-[#FAFAFC] border border-[#E3DEEA] rounded-[26px] p-5 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md"
    >
      {/* Top Header matching One Year prompt card */}
      <div className="flex items-center justify-between text-xs text-[#7A7485] mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#FDEEF4] flex items-center justify-center text-[#E83375]">
            <BotanicalIcon className="w-3.5 h-3.5" color="#E83375" />
          </div>
          <span className="font-mono text-xs text-[#1E1926] font-medium lowercase">
            {dateFormatted}
          </span>
          <span aria-hidden="true" className="text-[#C8C2D4]">·</span>
          <span className="font-mono text-[11px] text-[#7A7485]">{entry.time || '12:00'}</span>
        </div>

        {/* Day progress (e.g. 18/365) & Favorite */}
        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          {dayOfYear && (
            <span className="font-mono text-[11px] text-[#9790A2]">
              {dayOfYear}
            </span>
          )}

          <button
            type="button"
            onClick={() => onToggleFavorite(entry.id)}
            aria-label={entry.isFavorite ? 'Remove favorite' : 'Add favorite'}
            className="p-1 text-[#9790A2] hover:text-[#E83375] active:scale-90 transition-transform"
          >
            <Heart 
              className={`w-4 h-4 ${entry.isFavorite ? 'fill-[#E83375] text-[#E83375]' : ''}`} 
            />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-[#9790A2] hover:text-[#1E1926] active:scale-90 transition-transform"
              aria-label="Options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div 
                className="absolute right-0 top-8 w-44 bg-white border border-[#E2DCE8] rounded-2xl shadow-xl py-1 z-20"
                onClick={() => setShowMenu(false)}
              >
                <button
                  type="button"
                  onClick={() => onExportPdf(entry)}
                  className="w-full px-3 py-2 text-left text-xs text-[#1E1926] hover:bg-[#F8F6FA] flex items-center gap-2 font-mono"
                >
                  <FileDown className="w-3.5 h-3.5 text-[#E83375]" />
                  <span>export secure pdf</span>
                </button>
                <button
                  type="button"
                  onClick={() => onExportJpeg(entry)}
                  className="w-full px-3 py-2 text-left text-xs text-[#1E1926] hover:bg-[#F8F6FA] flex items-center gap-2 font-mono"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#E83375]" />
                  <span>export jpeg card</span>
                </button>
                <button
                  type="button"
                  onClick={() => onEdit(entry)}
                  className="w-full px-3 py-2 text-left text-xs text-[#1E1926] hover:bg-[#F8F6FA] flex items-center gap-2 font-mono"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#7A7485]" />
                  <span>edit log</span>
                </button>
                <div className="my-1 border-t border-[#EAE6F0]" />
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Delete this private entry forever?')) {
                      onDelete(entry.id);
                    }
                  }}
                  className="w-full px-3 py-2 text-left text-xs text-[#E83375] hover:bg-[#FDF0F5] flex items-center gap-2 font-mono"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>delete log</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Entry Title */}
      <h3 className="text-base font-semibold text-[#1E1926] mb-1.5 group-hover:text-[#E83375] transition-colors leading-snug">
        {entry.title || 'Untitled Secret Log'}
      </h3>

      {/* Excerpt Body */}
      <p className="text-sm text-[#463F52] leading-relaxed line-clamp-3 mb-3">
        {entry.content}
      </p>

      {/* Attached Photos Preview */}
      {entry.photos && entry.photos.length > 0 && (
        <div className="flex items-center gap-2 mb-3 overflow-x-auto no-scrollbar py-0.5">
          {entry.photos.slice(0, 3).map((photo, i) => (
            <div 
              key={i} 
              className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-[#E3DEEA] bg-[#F4F3F7]"
            >
              <img 
                src={photo} 
                alt="Journal memory" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {i === 2 && entry.photos.length > 3 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-[10px] font-mono font-semibold text-white">
                  +{entry.photos.length - 2}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Footer Info Row: Clean unboxed metadata with separators */}
      <div className="flex items-center justify-between text-xs text-[#7A7485] pt-2 border-t border-[#EAE6F0]">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1">
            <span>{mood.emoji}</span>
            <span className="font-mono text-[11px] text-[#554E60] lowercase">{mood.label}</span>
          </span>
          <span aria-hidden="true" className="text-[#C8C2D4]">·</span>
          <span>{weather.emoji}</span>

          {entry.audioMemo && (
            <>
              <span aria-hidden="true" className="text-[#C8C2D4]">·</span>
              <button
                type="button"
                onClick={handlePlayAudio}
                className={`flex items-center gap-1 font-mono text-[11px] ${
                  isPlayingAudio ? 'text-[#E83375] font-semibold animate-pulse' : 'text-[#7A7485] hover:text-[#E83375]'
                }`}
              >
                {isPlayingAudio ? <Volume2 className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                <span>{isPlayingAudio ? 'playing' : `${entry.audioDuration || 0}s voice`}</span>
              </button>
            </>
          )}

          {entry.location && (
            <>
              <span aria-hidden="true" className="text-[#C8C2D4]">·</span>
              <span className="flex items-center gap-1 font-mono text-[11px] text-[#7A7485]">
                <MapPin className="w-3 h-3 text-[#A099AB]" />
                <span>{entry.location}</span>
              </span>
            </>
          )}
        </div>

        <span className="font-mono text-[10px] text-[#A099AB]">
          {entry.wordCount || 0} words
        </span>
      </div>
    </div>
  );
};
