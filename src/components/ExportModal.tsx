import React, { useState, useRef } from 'react';
import { DiaryEntry, PdfExportOptions } from '../types/diary';
import { generateDiaryPdf } from '../services/pdfExport';
import { exportElementAsJpeg, copyElementAsImageToClipboard } from '../services/imageExport';
import { MOODS, WEATHERS, formatOneYearStyleDate, getDayOfYearProgress } from '../utils/diaryHelpers';
import { 
  X, 
  FileDown, 
  Image as ImageIcon, 
  Copy, 
  Download, 
  Check, 
  Lock, 
  Stamp, 
  MapPin
} from 'lucide-react';
import { DoodleFlower, getRandomDoodle } from './BotanicalDoodles';

interface ExportModalProps {
  entries: DiaryEntry[];
  activeEntry?: DiaryEntry | null;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  entries,
  activeEntry,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'pdf' | 'jpeg'>('jpeg');

  // PDF Configuration
  const [pdfScope, setPdfScope] = useState<'single' | 'all' | 'favorites'>('all');
  const [selectedEntryId, setSelectedEntryId] = useState<string>(activeEntry?.id || entries[0]?.id || '');
  const [includePhotos, setIncludePhotos] = useState(true);
  const [watermark, setWatermark] = useState(true);
  const [watermarkText, setWatermarkText] = useState('SECRET LOGS · PRIVATE');
  const [paperSize, setPaperSize] = useState<'a4' | 'letter'>('a4');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);

  // JPEG Card Configuration
  const [jpegTheme, setJpegTheme] = useState<'oneyear' | 'parchment' | 'dark' | 'grid'>('oneyear');
  const [fontFamily, setFontFamily] = useState<'mono' | 'sans' | 'serif' | 'handwriting'>('mono');
  const [hideLocation, setHideLocation] = useState(false);
  const [hideTags, setHideTags] = useState(false);
  const [showLogoSeal, setShowLogoSeal] = useState(true);
  const [isExportingJpeg, setIsExportingJpeg] = useState(false);
  const [jpegCopied, setJpegCopied] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  const targetJpegEntry = entries.find(e => e.id === selectedEntryId) || activeEntry || entries[0];

  const handleExportPdf = async () => {
    setIsGeneratingPdf(true);
    setPdfSuccess(false);

    try {
      const options: PdfExportOptions = {
        scope: pdfScope,
        singleEntryId: selectedEntryId,
        includePhotos,
        includeAudioNotes: false,
        watermark,
        watermarkText,
        paperSize,
      };

      await generateDiaryPdf(entries, options);
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Error generating PDF');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadJpeg = async () => {
    if (!cardRef.current || !targetJpegEntry) return;
    setIsExportingJpeg(true);
    try {
      const filename = `SecretLog_${targetJpegEntry.date}_card.jpg`;
      await exportElementAsJpeg(cardRef.current, filename, 2.5);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExportingJpeg(false);
    }
  };

  const handleCopyJpeg = async () => {
    if (!cardRef.current) return;
    const res = await copyElementAsImageToClipboard(cardRef.current);
    if (res.success) {
      setJpegCopied(true);
      setTimeout(() => setJpegCopied(false), 2500);
    } else {
      alert(res.error || 'Could not copy image to clipboard');
    }
  };

  const moodMeta = targetJpegEntry ? MOODS[targetJpegEntry.mood] : MOODS.thoughtful;
  const weatherMeta = targetJpegEntry ? WEATHERS[targetJpegEntry.weather] : WEATHERS.sunny;
  const dayOfYear = targetJpegEntry ? getDayOfYearProgress(targetJpegEntry.date) : '';
  const dateFormatted = targetJpegEntry ? formatOneYearStyleDate(targetJpegEntry.date) : '';
  const BotanicalIcon = targetJpegEntry ? getRandomDoodle(targetJpegEntry.id) : DoodleFlower;

  const getThemeClasses = () => {
    switch (jpegTheme) {
      case 'oneyear':
        return 'bg-[#F4F3F7] text-[#1E1926] border-[#E2DCE8]';
      case 'parchment':
        return 'journal-lined-paper text-stone-900 border-[#E83375]/30';
      case 'dark':
        return 'journal-dark-paper text-white border-[#E83375]/40';
      case 'grid':
      default:
        return 'journal-grid-paper text-[#1E1926] border-[#DDD7E6]';
    }
  };

  const getFontFamilyClass = () => {
    switch (fontFamily) {
      case 'mono':
        return 'font-mono';
      case 'serif':
        return 'font-serif';
      case 'handwriting':
        return 'font-[Caveat] text-lg';
      case 'sans':
      default:
        return 'font-sans';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[#F8F7FA] border border-[#E3DEEA] rounded-[32px] w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-[#E7E2EE] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FDEEF4] p-1 border border-[#F8CBDC] flex items-center justify-center">
              <img
                src="/assets/aistudio/SECRET_LOGS_b4791025.png"
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#1E1926] font-mono lowercase">
                export secret vault
              </h2>
              <span className="text-[11px] font-mono text-[#7A7485] lowercase">
                secure pdf document or aesthetic jpeg card
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-[#7A7485] hover:text-[#1E1926] hover:bg-[#F3EFF8]"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-2 bg-[#F0ECF5] border-b border-[#E3DEEA]">
          <button
            type="button"
            onClick={() => setActiveTab('jpeg')}
            className={`flex-1 min-h-[40px] py-1.5 rounded-2xl text-xs font-mono font-semibold flex items-center justify-center gap-2 transition-all lowercase ${
              activeTab === 'jpeg'
                ? 'bg-white text-[#E83375] shadow-xs'
                : 'text-[#7A7485] hover:text-[#1E1926]'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-[#E83375]" />
            <span>aesthetic jpeg snapshot</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pdf')}
            className={`flex-1 min-h-[40px] py-1.5 rounded-2xl text-xs font-mono font-semibold flex items-center justify-center gap-2 transition-all lowercase ${
              activeTab === 'pdf'
                ? 'bg-white text-[#E83375] shadow-xs'
                : 'text-[#7A7485] hover:text-[#1E1926]'
            }`}
          >
            <FileDown className="w-4 h-4 text-[#E83375]" />
            <span>secure pdf archive</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 overflow-y-auto no-scrollbar space-y-4 flex-1">
          {activeTab === 'jpeg' ? (
            /* ================= JPEG CARD TAB ================= */
            <div className="space-y-4">
              {/* Select target entry */}
              <div>
                <label className="font-mono text-[11px] font-semibold text-[#7A7485] block mb-1 lowercase">
                  select log to render
                </label>
                <select
                  value={selectedEntryId}
                  onChange={e => setSelectedEntryId(e.target.value)}
                  className="w-full bg-white border border-[#E3DEEA] rounded-2xl px-3 py-2 text-xs font-mono text-[#1E1926] focus:outline-none focus:border-[#E83375]"
                >
                  {entries.map(entry => (
                    <option key={entry.id} value={entry.id}>
                      {entry.date} - {entry.title || 'Untitled'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Theme & Style Controls */}
              <div className="space-y-1.5">
                <span className="font-mono text-[11px] font-semibold text-[#7A7485] block lowercase">
                  paper theme
                </span>
                <div className="grid grid-cols-4 gap-1.5 text-xs">
                  {[
                    { id: 'oneyear', label: 'one year' },
                    { id: 'parchment', label: 'rose lined' },
                    { id: 'grid', label: 'dotted grid' },
                    { id: 'dark', label: 'midnight' },
                  ].map(theme => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setJpegTheme(theme.id as any)}
                      className={`py-1.5 px-2 rounded-xl text-center border font-mono transition-all lowercase ${
                        jpegTheme === theme.id
                          ? 'border-[#E83375] bg-[#E83375] text-white font-bold'
                          : 'border-[#E3DEEA] bg-white text-[#7A7485] hover:text-[#1E1926]'
                      }`}
                    >
                      {theme.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Family & Options */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="font-mono text-[11px] font-semibold text-[#7A7485] block mb-1 lowercase">
                    typography
                  </span>
                  <div className="flex items-center gap-1">
                    {[
                      { id: 'mono', label: 'typewriter' },
                      { id: 'sans', label: 'sans' },
                      { id: 'serif', label: 'serif' },
                    ].map(f => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFontFamily(f.id as any)}
                        className={`px-2.5 py-1 rounded-xl border text-[11px] font-mono lowercase ${
                          fontFamily === f.id
                            ? 'bg-white border-[#E83375] text-[#E83375] font-bold'
                            : 'border-[#E3DEEA] bg-white text-[#7A7485]'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-mono text-[11px] font-semibold text-[#7A7485] block mb-1 lowercase">
                    privacy & marks
                  </span>
                  <div className="space-y-1">
                    <label className="flex items-center gap-1.5 font-mono text-[11px] text-[#7A7485] cursor-pointer lowercase">
                      <input
                        type="checkbox"
                        checked={hideLocation}
                        onChange={e => setHideLocation(e.target.checked)}
                        className="accent-[#E83375]"
                      />
                      <span>hide location</span>
                    </label>
                    <label className="flex items-center gap-1.5 font-mono text-[11px] text-[#7A7485] cursor-pointer lowercase">
                      <input
                        type="checkbox"
                        checked={showLogoSeal}
                        onChange={e => setShowLogoSeal(e.target.checked)}
                        className="accent-[#E83375]"
                      />
                      <span>include logo seal</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Live Preview Container (Rendered to JPEG) */}
              <div className="border border-[#E3DEEA] rounded-3xl p-3 bg-white">
                <span className="text-[10px] text-[#9790A2] font-mono block mb-2 text-center lowercase">
                  preview · ready for printing & sharing
                </span>

                <div
                  ref={cardRef}
                  className={`p-6 rounded-[28px] border shadow-md relative overflow-hidden transition-all ${getThemeClasses()} ${getFontFamilyClass()}`}
                  style={{ minHeight: '280px' }}
                >
                  {/* Card Header with Botanical Doodle & SECRET LOGS mark */}
                  <div className="flex items-center justify-between pb-3 border-b border-current/15 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-white/80 p-1 flex items-center justify-center border border-current/15 shadow-xs">
                        <BotanicalIcon className="w-5 h-5 text-[#E83375]" color="#E83375" />
                      </div>
                      <div>
                        <span className="text-[10px] tracking-widest uppercase font-mono opacity-60 block">
                          Secret Logs · Private Journal
                        </span>
                        <h4 className="text-sm font-bold opacity-90 lowercase font-mono">
                          {dateFormatted}
                        </h4>
                      </div>
                    </div>

                    {showLogoSeal && (
                      <div className="w-10 h-10 rounded-xl bg-white/90 p-1 border border-[#E83375]/30 flex items-center justify-center shadow-xs">
                        <img
                          src="/assets/aistudio/SECRET_LOGS_b4791025.png"
                          alt="Secret Logs Seal"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                  </div>

                  {/* Metadata Row */}
                  <div className="flex items-center gap-2 text-xs opacity-75 mb-3 font-mono">
                    <span>{targetJpegEntry?.time || '12:00'}</span>
                    <span>·</span>
                    <span>{dayOfYear}</span>
                    <span>·</span>
                    <span>{moodMeta?.emoji} {moodMeta?.label}</span>
                    <span>·</span>
                    <span>{weatherMeta?.emoji}</span>
                    {!hideLocation && targetJpegEntry?.location && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-0.5">
                          <MapPin className="w-3 h-3" />
                          <span>{targetJpegEntry.location}</span>
                        </span>
                      </>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold mb-3 tracking-tight">
                    {targetJpegEntry?.title || 'Untitled Secret'}
                  </h3>

                  {/* Content */}
                  <p className="whitespace-pre-line leading-relaxed opacity-90 mb-4 text-sm font-sans">
                    {targetJpegEntry?.content || ''}
                  </p>

                  {/* Photos in Card */}
                  {targetJpegEntry?.photos && targetJpegEntry.photos.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 my-3">
                      {targetJpegEntry.photos.slice(0, 2).map((p, i) => (
                        <div key={i} className="rounded-2xl overflow-hidden aspect-video border border-current/20">
                          <img 
                            src={p} 
                            alt="Visual memory" 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Footer Seal */}
                  <div className="pt-3 border-t border-current/15 flex items-center justify-between text-[10px] opacity-60 font-mono">
                    <span>Secret Logs</span>
                    <span>{targetJpegEntry?.wordCount || 0} words</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopyJpeg}
                  className="min-h-[46px] py-2.5 px-3 rounded-2xl bg-white hover:bg-[#F3EFF8] border border-[#E3DEEA] text-[#1E1926] text-xs font-mono font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all lowercase"
                >
                  {jpegCopied ? (
                    <>
                      <Check className="w-4 h-4 text-[#E83375]" />
                      <span>copied card!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-[#E83375]" />
                      <span>copy to clipboard</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDownloadJpeg}
                  disabled={isExportingJpeg}
                  className="min-h-[46px] py-2.5 px-3 rounded-2xl bg-[#E83375] hover:bg-[#D42364] text-white text-xs font-mono font-bold flex items-center justify-center gap-2 shadow-sm shadow-[#E83375]/30 active:scale-95 transition-all lowercase"
                >
                  <Download className="w-4 h-4" />
                  <span>download jpeg</span>
                </button>
              </div>
            </div>
          ) : (
            /* ================= PDF EXPORT TAB ================= */
            <div className="space-y-4">
              <div>
                <label className="font-mono text-[11px] font-semibold text-[#7A7485] block mb-2 lowercase">
                  export scope
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPdfScope('all')}
                    className={`py-2 px-3 rounded-2xl font-mono text-xs border text-center transition-all lowercase ${
                      pdfScope === 'all'
                        ? 'border-[#E83375] bg-[#FDEEF4] text-[#E83375] font-bold'
                        : 'border-[#E3DEEA] bg-white text-[#7A7485] hover:text-[#1E1926]'
                    }`}
                  >
                    all logs ({entries.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPdfScope('favorites')}
                    className={`py-2 px-3 rounded-2xl font-mono text-xs border text-center transition-all lowercase ${
                      pdfScope === 'favorites'
                        ? 'border-[#E83375] bg-[#FDEEF4] text-[#E83375] font-bold'
                        : 'border-[#E3DEEA] bg-white text-[#7A7485] hover:text-[#1E1926]'
                    }`}
                  >
                    favorites ({entries.filter(e => e.isFavorite).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPdfScope('single')}
                    className={`py-2 px-3 rounded-2xl font-mono text-xs border text-center transition-all lowercase ${
                      pdfScope === 'single'
                        ? 'border-[#E83375] bg-[#FDEEF4] text-[#E83375] font-bold'
                        : 'border-[#E3DEEA] bg-white text-[#7A7485] hover:text-[#1E1926]'
                    }`}
                  >
                    single log
                  </button>
                </div>
              </div>

              {pdfScope === 'single' && (
                <div>
                  <label className="font-mono text-[11px] font-semibold text-[#7A7485] block mb-1 lowercase">
                    choose journal entry
                  </label>
                  <select
                    value={selectedEntryId}
                    onChange={e => setSelectedEntryId(e.target.value)}
                    className="w-full bg-white border border-[#E3DEEA] rounded-2xl px-3 py-2 text-xs font-mono text-[#1E1926] focus:outline-none focus:border-[#E83375]"
                  >
                    {entries.map(entry => (
                      <option key={entry.id} value={entry.id}>
                        {entry.date} - {entry.title || 'Untitled'}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="bg-white rounded-3xl p-4 border border-[#E3DEEA] space-y-3">
                <span className="font-mono text-xs font-bold text-[#1E1926] block lowercase">
                  document options & watermark
                </span>

                <label className="flex items-center justify-between text-xs text-[#463F52] cursor-pointer font-mono lowercase">
                  <span>embed photos in pdf</span>
                  <input
                    type="checkbox"
                    checked={includePhotos}
                    onChange={e => setIncludePhotos(e.target.checked)}
                    className="w-4 h-4 accent-[#E83375] rounded"
                  />
                </label>

                <label className="flex items-center justify-between text-xs text-[#463F52] cursor-pointer font-mono lowercase">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#E83375]" />
                    <span>confidential watermark stamp</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={watermark}
                    onChange={e => setWatermark(e.target.checked)}
                    className="w-4 h-4 accent-[#E83375] rounded"
                  />
                </label>

                {watermark && (
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={e => setWatermarkText(e.target.value)}
                    placeholder="Watermark text"
                    className="w-full bg-[#F8F7FA] border border-[#E3DEEA] rounded-xl px-3 py-1.5 text-xs font-mono text-[#1E1926] focus:outline-none"
                  />
                )}

                <div className="flex items-center justify-between text-xs text-[#463F52] pt-1 border-t border-[#F0ECF5] font-mono lowercase">
                  <span>paper format</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPaperSize('a4')}
                      className={`px-3 py-1 rounded-xl text-xs font-mono ${
                        paperSize === 'a4' ? 'bg-[#E83375] text-white font-bold' : 'text-[#7A7485] bg-[#F4F3F7]'
                      }`}
                    >
                      iso a4
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaperSize('letter')}
                      className={`px-3 py-1 rounded-xl text-xs font-mono ${
                        paperSize === 'letter' ? 'bg-[#E83375] text-white font-bold' : 'text-[#7A7485] bg-[#F4F3F7]'
                      }`}
                    >
                      us letter
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleExportPdf}
                disabled={isGeneratingPdf}
                className="w-full min-h-[48px] py-3 rounded-2xl bg-[#E83375] hover:bg-[#D42364] text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-sm shadow-[#E83375]/30 active:scale-[0.98] transition-all disabled:opacity-50 lowercase"
              >
                {pdfSuccess ? (
                  <>
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>pdf downloaded successfully!</span>
                  </>
                ) : isGeneratingPdf ? (
                  <span>rendering pdf document...</span>
                ) : (
                  <>
                    <FileDown className="w-4 h-4" />
                    <span>download secure pdf</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
