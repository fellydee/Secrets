import React from 'react';
import { DiaryEntry } from '../types/diary';
import { formatOneYearStyleDate, MOODS } from '../utils/diaryHelpers';
import { Image as ImageIcon, Camera } from 'lucide-react';
import { DoodleCherries, DoodleFlower } from './BotanicalDoodles';

interface PhotoGalleryViewProps {
  entries: DiaryEntry[];
  onSelectEntry: (entry: DiaryEntry) => void;
  onOpenNewEntry: () => void;
}

export const PhotoGalleryView: React.FC<PhotoGalleryViewProps> = ({
  entries,
  onSelectEntry,
  onOpenNewEntry,
}) => {
  const photoItems: { photoUrl: string; entry: DiaryEntry; photoIndex: number }[] = [];

  entries.forEach(entry => {
    if (entry.photos && entry.photos.length > 0) {
      entry.photos.forEach((photoUrl, index) => {
        photoItems.push({ photoUrl, entry, photoIndex: index });
      });
    }
  });

  return (
    <div className="flex flex-col flex-1 p-4 overflow-y-auto no-scrollbar pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-mono text-sm font-bold text-[#1E1926] flex items-center gap-2 lowercase">
            <DoodleCherries className="w-4 h-4 text-[#E83375]" color="#E83375" />
            <span>memories & photos</span>
          </h2>
          <span className="font-mono text-[11px] text-[#7A7485] lowercase">
            {photoItems.length} photos
          </span>
        </div>

        <button
          type="button"
          onClick={onOpenNewEntry}
          className="font-mono text-xs text-[#E83375] font-semibold flex items-center gap-1 hover:underline lowercase"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>capture</span>
        </button>
      </div>

      {photoItems.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-16 text-center text-[#7A7485]">
          <div className="w-16 h-16 rounded-3xl bg-white border border-[#E3DEEA] flex items-center justify-center mb-3 shadow-xs">
            <DoodleFlower className="w-8 h-8 text-[#E83375]" color="#E83375" />
          </div>
          <h3 className="font-mono text-xs font-semibold text-[#1E1926] mb-1 lowercase">no photos yet</h3>
          <p className="font-mono text-[11px] text-[#9790A2] max-w-xs mb-4 lowercase">
            capture moments to attach to your daily logs.
          </p>
          <button
            type="button"
            onClick={onOpenNewEntry}
            className="px-4 py-2 rounded-2xl bg-[#E83375] hover:bg-[#D42364] text-xs font-mono font-bold text-white shadow-xs lowercase"
          >
            plant first photo memory
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photoItems.map((item, idx) => {
            const mood = MOODS[item.entry.mood] || MOODS.thoughtful;
            return (
              <div
                key={idx}
                onClick={() => onSelectEntry(item.entry)}
                className="group relative rounded-[24px] overflow-hidden aspect-square border border-[#E3DEEA] bg-white cursor-pointer shadow-xs hover:shadow-md transition-transform active:scale-95"
              >
                <img
                  src={item.photoUrl}
                  alt={`Memory from ${item.entry.date}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20 opacity-80 group-hover:opacity-100 transition-opacity" />

                <div className="absolute top-2.5 right-2.5 text-xs bg-white/80 backdrop-blur-sm rounded-full p-1 shadow-xs">
                  {mood.emoji}
                </div>

                <div className="absolute bottom-2.5 left-2.5 right-2.5 text-left text-white">
                  <span className="font-mono text-[9px] opacity-80 block lowercase">
                    {formatOneYearStyleDate(item.entry.date)}
                  </span>
                  <span className="text-xs font-semibold truncate block">
                    {item.entry.title || 'Untitled'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
