import { jsPDF } from 'jspdf';
import { DiaryEntry, PdfExportOptions } from '../types/diary';

export async function generateDiaryPdf(
  entries: DiaryEntry[],
  options: PdfExportOptions
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: options.paperSize === 'letter' ? 'letter' : 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = margin;

  // Filter entries based on scope
  let targetEntries = [...entries];
  if (options.scope === 'single' && options.singleEntryId) {
    targetEntries = targetEntries.filter(e => e.id === options.singleEntryId);
  } else if (options.scope === 'favorites') {
    targetEntries = targetEntries.filter(e => e.isFavorite);
  } else if (options.scope === 'date-range') {
    if (options.startDate) {
      targetEntries = targetEntries.filter(e => e.date >= options.startDate!);
    }
    if (options.endDate) {
      targetEntries = targetEntries.filter(e => e.date <= options.endDate!);
    }
  }

  // Sort chronological
  targetEntries.sort((a, b) => new Date(a.date + ' ' + (a.time || '00:00')).getTime() - new Date(b.date + ' ' + (b.time || '00:00')).getTime());

  if (targetEntries.length === 0) {
    throw new Error('No entries match the selected export criteria.');
  }

  // Cover / Header Banner
  const addHeader = (isCover: boolean = false) => {
    // Top border rule
    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(0.5);
    doc.line(margin, margin - 6, pageWidth - margin, margin - 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('SECRET LOGS · PERSONAL JOURNAL', margin, margin - 8);

    const todayStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    doc.text(`ARCHIVE DATE: ${todayStr.toUpperCase()}`, pageWidth - margin, margin - 8, { align: 'right' });
  };

  const addFooter = (pageNum: number, totalPages: number) => {
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('Secret Logs · Personal Journal Archive', margin, pageHeight - 8);
    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
  };

  const addWatermark = () => {
    if (!options.watermark) return;
    doc.saveGraphicsState();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(44);
    doc.setTextColor(230, 230, 230);
    
    // Watermark in center of page tilted
    const text = options.watermarkText || 'CONFIDENTIAL';
    doc.text(text, pageWidth / 2, pageHeight / 2, {
      align: 'center',
      angle: 45,
    });
    doc.restoreGraphicsState();
  };

  // Build Pages
  let pageCount = 1;
  addHeader();
  addWatermark();

  // If multiple entries, add a brief title block
  if (targetEntries.length > 1) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(15, 23, 42);
    doc.text('Personal Journal Archive', margin, cursorY + 4);
    cursorY += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Exported ${targetEntries.length} entries · Private Record`, margin, cursorY + 2);
    cursorY += 10;

    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.4);
    doc.line(margin, cursorY, pageWidth - margin, cursorY);
    cursorY += 8;
  }

  for (let i = 0; i < targetEntries.length; i++) {
    const entry = targetEntries[i];

    // Check if we need a new page for entry start
    if (cursorY > pageHeight - 50) {
      doc.addPage();
      pageCount++;
      addHeader();
      addWatermark();
      cursorY = margin;
    }

    // Entry Container Background card
    const entryStartY = cursorY;

    // Date & Time Line
    const dateFormatted = new Date(entry.date + 'T12:00:00').toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(232, 51, 117); // Secret Logs rose magenta
    doc.text(`${dateFormatted.toUpperCase()}  ·  ${entry.time || '12:00'}`, margin, cursorY);
    cursorY += 6;

    // Entry Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    const titleLines = doc.splitTextToSize(entry.title || 'Untitled Entry', contentWidth);
    doc.text(titleLines, margin, cursorY);
    cursorY += titleLines.length * 5.5 + 2;

    // Metadata line (Mood, Weather, Location, Tags)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    const metaParts = [
      `Mood: ${entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}`,
      `Weather: ${entry.weather.charAt(0).toUpperCase() + entry.weather.slice(1)}`,
      entry.location ? `Location: ${entry.location}` : '',
      entry.tags.length > 0 ? `Tags: ${entry.tags.join(', ')}` : '',
    ].filter(Boolean);

    doc.text(metaParts.join('  |  '), margin, cursorY);
    cursorY += 6;

    // Body text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);

    const bodyParagraphs = entry.content.split('\n');
    for (const para of bodyParagraphs) {
      if (!para.trim()) {
        cursorY += 3;
        continue;
      }

      const lines = doc.splitTextToSize(para, contentWidth);
      for (const line of lines) {
        if (cursorY > pageHeight - 25) {
          doc.addPage();
          pageCount++;
          addHeader();
          addWatermark();
          cursorY = margin;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          doc.setTextColor(51, 65, 85);
        }
        doc.text(line, margin, cursorY);
        cursorY += 5;
      }
      cursorY += 2;
    }

    // Include Photos if present and requested
    if (options.includePhotos && entry.photos && entry.photos.length > 0) {
      cursorY += 4;
      for (let pIdx = 0; pIdx < entry.photos.length; pIdx++) {
        const photoData = entry.photos[pIdx];
        if (photoData.startsWith('data:image')) {
          const imgWidth = 75; // mm
          const imgHeight = 55; // mm
          
          if (cursorY + imgHeight > pageHeight - 20) {
            doc.addPage();
            pageCount++;
            addHeader();
            addWatermark();
            cursorY = margin;
          }

          try {
            doc.addImage(photoData, 'JPEG', margin, cursorY, imgWidth, imgHeight);
            cursorY += imgHeight + 6;
          } catch (e) {
            console.warn('Could not embed photo into PDF', e);
          }
        }
      }
    }

    // Divider after entry
    cursorY += 6;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(margin, cursorY, pageWidth - margin, cursorY);
    cursorY += 10;
  }

  // Add footers with accurate total page count
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    addFooter(p, totalPages);
  }

  // Save the PDF
  const filename = targetEntries.length === 1 
    ? `SecretLogs_${targetEntries[0].date}_${targetEntries[0].title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`
    : `SecretLogs_Archive_${new Date().toISOString().slice(0, 10)}.pdf`;

  doc.save(filename);
}
