import React, { useState, useRef, useEffect } from 'react';
import { DiaryEntry, MoodType, WeatherType } from '../types/diary';
import { MOODS, WEATHERS, REFLECTION_PROMPTS, calculateWordCount, formatOneYearStyleDate, getDayOfYearProgress } from '../utils/diaryHelpers';
import { 
  ArrowLeft, 
  Save, 
  Camera, 
  Image as ImageIcon, 
  Mic, 
  Square, 
  Sparkles, 
  Trash2, 
  MapPin, 
  Heart, 
  Share2, 
  FileDown,
  Play,
  Pause,
  X,
  Navigation,
  Loader2
} from 'lucide-react';
import { DoodleFlower } from './BotanicalDoodles';
import { getCurrentUserLocation } from '../services/location';

interface EntryEditorProps {
  entry: DiaryEntry | null;
  onSave: (entry: DiaryEntry) => void;
  onClose: () => void;
  onExportPdf?: (entry: DiaryEntry) => void;
  onExportJpeg?: (entry: DiaryEntry) => void;
}

export const EntryEditor: React.FC<EntryEditorProps> = ({
  entry,
  onSave,
  onClose,
  onExportPdf,
  onExportJpeg,
}) => {
  const isNew = !entry;
  const [title, setTitle] = useState(entry?.title || '');
  const [content, setContent] = useState(entry?.content || '');
  const [date, setDate] = useState(entry?.date || new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState(entry?.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
  const [mood, setMood] = useState<MoodType>(entry?.mood || 'peaceful');
  const [weather, setWeather] = useState<WeatherType>(entry?.weather || 'sunny');
  const [tags, setTags] = useState<string[]>(entry?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [photos, setPhotos] = useState<string[]>(entry?.photos || []);
  const [audioMemo, setAudioMemo] = useState<string | null>(entry?.audioMemo || null);
  const [audioDuration, setAudioDuration] = useState<number>(entry?.audioDuration || 0);
  const [location, setLocation] = useState(entry?.location || '');
  const [isLocating, setIsLocating] = useState(false);
  const [isFavorite, setIsFavorite] = useState(entry?.isFavorite || false);
  const [isSavedToast, setIsSavedToast] = useState(false);

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);

  // Audio Playback
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const wordCount = calculateWordCount(content);
  const dayOfYear = getDayOfYearProgress(date);

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setPhotos(prev => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Microphone access is not supported in this browser.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            setAudioMemo(reader.result);
            setAudioDuration(recordingSeconds);
          }
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(sec => sec + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone error', err);
      alert('Could not start microphone recording.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
  };

  const handleTogglePlayAudio = () => {
    if (!audioMemo) return;
    if (isPlayingAudio && audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      const audio = new Audio(audioMemo);
      audioPlayerRef.current = audio;
      audio.onended = () => setIsPlayingAudio(false);
      audio.onerror = () => setIsPlayingAudio(false);
      audio.play();
      setIsPlayingAudio(true);
    }
  };

  const handleDetectLocation = async () => {
    setIsLocating(true);
    const result = await getCurrentUserLocation();
    setIsLocating(false);
    if (result.success && result.name) {
      setLocation(result.name);
    } else if (result.error) {
      alert(result.error);
    }
  };

  const handleApplyPrompt = () => {
    const randomPrompt = REFLECTION_PROMPTS[Math.floor(Math.random() * REFLECTION_PROMPTS.length)];
    setContent(prev => (prev ? `${prev}\n\n${randomPrompt}\n` : `${randomPrompt}\n`));
  };

  const handleSaveCurrent = () => {
    const updatedEntry: DiaryEntry = {
      id: entry?.id || 'entry_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      title: title.trim() || 'Untitled Secret',
      content,
      createdAt: entry?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      date,
      time,
      mood,
      weather,
      tags,
      photos,
      audioMemo,
      audioDuration: audioDuration || 0,
      isFavorite,
      location: location.trim() || undefined,
      wordCount,
    };

    onSave(updatedEntry);
    setIsSavedToast(true);
    setTimeout(() => {
      setIsSavedToast(false);
      onClose();
    }, 400);
  };

  const currentConstructedEntry: DiaryEntry = {
    id: entry?.id || 'temp',
    title: title || 'Untitled Secret',
    content,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    date,
    time,
    mood,
    weather,
    tags,
    photos,
    audioMemo,
    isFavorite,
    location,
    wordCount,
  };

  return (
    <div className="flex flex-col flex-1 bg-[#F4F3F7] text-[#1E1926] overflow-y-auto no-scrollbar pb-20">
      {/* Top App Bar */}
      <div className="sticky top-0 z-20 bg-[#F4F3F7]/90 backdrop-blur-md px-4 py-3 border-b border-[#E3DEEA] flex items-center justify-between">
        <button
          type="button"
          onClick={onClose}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#7A7485] hover:text-[#1E1926] active:scale-95 transition-transform"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="flex items-center gap-1.5 justify-center">
            <DoodleFlower className="w-3.5 h-3.5 text-[#E83375]" color="#E83375" />
            <span className="font-mono text-xs font-semibold text-[#1E1926] lowercase">
              {formatOneYearStyleDate(date)}
            </span>
          </div>
          <span className="font-mono text-[10px] text-[#9790A2]">
            {dayOfYear} · {wordCount} words
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsFavorite(!isFavorite)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#9790A2] hover:text-[#E83375]"
            aria-label="Toggle Favorite"
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-[#E83375] text-[#E83375]' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleSaveCurrent}
            className="min-h-[44px] px-4 rounded-2xl bg-[#E83375] hover:bg-[#D42364] text-white font-mono text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-transform shadow-sm shadow-[#E83375]/30"
          >
            <Save className="w-3.5 h-3.5" />
            <span>save</span>
          </button>
        </div>
      </div>

      {isSavedToast && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-[#E83375] text-white font-mono text-xs font-medium px-4 py-2 rounded-full shadow-lg">
          saved
        </div>
      )}

      {/* Editor Body */}
      <div className="p-4 space-y-4 max-w-xl mx-auto w-full">
        {/* Date, Time & Location Pill */}
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="bg-white border border-[#E3DEEA] rounded-xl px-3 py-1.5 text-xs text-[#1E1926] font-mono focus:outline-none focus:border-[#E83375]"
          />
          <input
            type="time"
            value={time}
            onChange={e => setTime(e.target.value)}
            className="bg-white border border-[#E3DEEA] rounded-xl px-3 py-1.5 text-xs text-[#1E1926] font-mono focus:outline-none focus:border-[#E83375]"
          />
          <div className="flex items-center gap-1.5 bg-white border border-[#E3DEEA] rounded-xl px-2.5 py-1.5 flex-1 min-w-[150px]">
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isLocating}
              title="Use current location"
              className="p-1 rounded-lg text-[#7A7485] hover:text-[#E83375] hover:bg-[#FDEEF4] transition-colors"
            >
              {isLocating ? (
                <Loader2 className="w-3.5 h-3.5 text-[#E83375] animate-spin" />
              ) : (
                <Navigation className="w-3.5 h-3.5 text-[#E83375]" />
              )}
            </button>
            <input
              type="text"
              placeholder={isLocating ? 'detecting location...' : 'add location or tap arrow...'}
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="bg-transparent text-xs text-[#1E1926] placeholder:text-[#A099AB] focus:outline-none w-full font-mono lowercase"
            />
          </div>
        </div>

        {/* Mood Selector Row */}
        <div>
          <label className="font-mono text-[11px] font-semibold text-[#7A7485] block mb-1.5 lowercase">
            mood
          </label>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {Object.values(MOODS).map(m => {
              const isSelected = mood === m.type;
              return (
                <button
                  key={m.type}
                  type="button"
                  onClick={() => setMood(m.type)}
                  className={`min-h-[38px] px-3 rounded-2xl text-xs flex items-center gap-1.5 shrink-0 border transition-all ${
                    isSelected
                      ? 'bg-[#E83375] border-[#E83375] text-white shadow-xs font-medium'
                      : 'bg-white border-[#E3DEEA] text-[#6B6476] hover:text-[#1E1926]'
                  }`}
                >
                  <span>{m.emoji}</span>
                  <span className="font-mono text-[11px] lowercase">{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Weather Selector Row */}
        <div>
          <label className="font-mono text-[11px] font-semibold text-[#7A7485] block mb-1.5 lowercase">
            sky & atmosphere
          </label>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {Object.values(WEATHERS).map(w => {
              const isSelected = weather === w.type;
              return (
                <button
                  key={w.type}
                  type="button"
                  onClick={() => setWeather(w.type)}
                  className={`min-h-[36px] px-3 rounded-2xl text-xs flex items-center gap-1.5 shrink-0 border transition-all ${
                    isSelected
                      ? 'bg-[#1E1926] border-[#1E1926] text-white shadow-xs'
                      : 'bg-white border-[#E3DEEA] text-[#6B6476] hover:text-[#1E1926]'
                  }`}
                >
                  <span>{w.emoji}</span>
                  <span className="font-mono text-[11px] lowercase">{w.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Title Input */}
        <div>
          <input
            type="text"
            placeholder="title your secret thought..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full text-xl font-bold bg-transparent border-b border-[#E3DEEA] pb-2 text-[#1E1926] placeholder:text-[#A099AB] focus:outline-none focus:border-[#E83375] transition-colors"
          />
        </div>

        {/* Reflection Prompt Helper */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleApplyPrompt}
            className="font-mono text-xs text-[#E83375] hover:text-[#D42364] flex items-center gap-1.5 active:scale-95 transition-transform lowercase"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>tap for reflection prompt</span>
          </button>
        </div>

        {/* Content Body Textarea styled like One Year prompt card */}
        <div className="bg-white rounded-[28px] border border-[#E3DEEA] p-4 shadow-xs">
          <textarea
            placeholder="write your thoughts here..."
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={11}
            className="w-full bg-transparent text-sm leading-relaxed text-[#1E1926] placeholder:text-[#A099AB] focus:outline-none resize-none font-sans"
          />
        </div>

        {/* Attached Photos Preview */}
        {photos.length > 0 && (
          <div>
            <label className="font-mono text-[11px] font-semibold text-[#7A7485] block mb-2 lowercase">
              memories ({photos.length})
            </label>
            <div className="grid grid-cols-3 gap-2">
              {photos.map((photo, idx) => (
                <div key={idx} className="relative rounded-2xl overflow-hidden aspect-square border border-[#E3DEEA] group bg-white">
                  <img 
                    src={photo} 
                    alt={`Attachment ${idx + 1}`} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(idx)}
                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-white hover:bg-black"
                    aria-label="Remove photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Voice Note Section */}
        <div className="bg-white border border-[#E3DEEA] rounded-[24px] p-3.5">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs font-semibold text-[#1E1926] flex items-center gap-1.5 lowercase">
              <Mic className="w-4 h-4 text-[#E83375]" />
              <span>whispered voice note</span>
            </span>
            {isRecording && (
              <span className="font-mono text-xs text-[#E83375] font-semibold animate-pulse lowercase">
                recording: {recordingSeconds}s
              </span>
            )}
          </div>

          {audioMemo ? (
            <div className="flex items-center justify-between bg-[#F8F6FA] p-3 rounded-2xl border border-[#E9E4F0]">
              <button
                type="button"
                onClick={handleTogglePlayAudio}
                className="flex items-center gap-2 font-mono text-xs font-medium text-[#E83375] hover:underline lowercase"
              >
                {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlayingAudio ? 'pause' : 'play audio'} ({audioDuration}s)</span>
              </button>

              <button
                type="button"
                onClick={() => setAudioMemo(null)}
                className="text-[#9790A2] hover:text-[#E83375] p-1"
                aria-label="Delete voice note"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {isRecording ? (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="min-h-[44px] flex-1 py-2 rounded-2xl bg-[#E83375] text-white font-mono text-xs font-semibold flex items-center justify-center gap-2 active:scale-95 shadow-sm"
                >
                  <Square className="w-4 h-4 fill-white" />
                  <span>stop & save audio</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startRecording}
                  className="min-h-[44px] flex-1 py-2 rounded-2xl bg-[#F8F6FA] hover:bg-[#F2EEF7] text-[#463F52] font-mono text-xs font-medium flex items-center justify-center gap-2 active:scale-95 border border-[#E9E4F0]"
                >
                  <Mic className="w-4 h-4 text-[#E83375]" />
                  <span>record voice thought</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Media Attachments */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="min-h-[44px] flex-1 py-2.5 rounded-2xl bg-white border border-[#E3DEEA] font-mono text-xs text-[#463F52] hover:text-[#1E1926] flex items-center justify-center gap-1.5 active:scale-95 lowercase"
          >
            <Camera className="w-4 h-4 text-[#E83375]" />
            <span>camera</span>
          </button>
          <input
            type="file"
            ref={cameraInputRef}
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handlePhotoUpload}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="min-h-[44px] flex-1 py-2.5 rounded-2xl bg-white border border-[#E3DEEA] font-mono text-xs text-[#463F52] hover:text-[#1E1926] flex items-center justify-center gap-1.5 active:scale-95 lowercase"
          >
            <ImageIcon className="w-4 h-4 text-[#E83375]" />
            <span>upload photo</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            multiple
            className="hidden"
            onChange={handlePhotoUpload}
          />
        </div>

        {/* Tags */}
        <div>
          <label className="font-mono text-[11px] font-semibold text-[#7A7485] block mb-1.5 lowercase">
            tags & labels
          </label>
          <div className="flex items-center gap-2 mb-2">
            <input
              type="text"
              placeholder="add tag and press enter"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              className="flex-1 bg-white border border-[#E3DEEA] rounded-2xl px-3.5 py-2 text-xs text-[#1E1926] placeholder:text-[#A099AB] focus:outline-none focus:border-[#E83375] font-mono lowercase"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2 rounded-2xl bg-[#1E1926] text-xs font-mono text-white hover:bg-black"
            >
              add
            </button>
          </div>

          {tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-white text-xs font-mono text-[#554E60] border border-[#E3DEEA]"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-[#9790A2] hover:text-[#E83375]"
                    aria-label={`Remove ${tag}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Quick Exports from Editor */}
        <div className="pt-2 border-t border-[#E3DEEA] flex items-center gap-2">
          {onExportPdf && (
            <button
              type="button"
              onClick={() => onExportPdf(currentConstructedEntry)}
              className="min-h-[44px] flex-1 py-2 px-3 rounded-2xl bg-white border border-[#E3DEEA] font-mono text-xs text-[#463F52] hover:text-[#1E1926] flex items-center justify-center gap-1.5 lowercase"
            >
              <FileDown className="w-3.5 h-3.5 text-[#E83375]" />
              <span>pdf export</span>
            </button>
          )}

          {onExportJpeg && (
            <button
              type="button"
              onClick={() => onExportJpeg(currentConstructedEntry)}
              className="min-h-[44px] flex-1 py-2 px-3 rounded-2xl bg-white border border-[#E3DEEA] font-mono text-xs text-[#463F52] hover:text-[#1E1926] flex items-center justify-center gap-1.5 lowercase"
            >
              <Share2 className="w-3.5 h-3.5 text-[#E83375]" />
              <span>jpeg card</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
