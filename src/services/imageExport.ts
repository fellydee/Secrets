import { toJpeg, toBlob } from 'html-to-image';

export interface ImageExportResult {
  success: boolean;
  dataUrl?: string;
  error?: string;
}

export async function exportElementAsJpeg(
  element: HTMLElement,
  filename: string = 'secretlog_entry.jpg',
  pixelRatio: number = 2.5
): Promise<ImageExportResult> {
  try {
    const dataUrl = await toJpeg(element, {
      quality: 0.95,
      pixelRatio: pixelRatio,
      cacheBust: true,
      backgroundColor: '#ffffff',
    });

    // Create download link
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();

    return { success: true, dataUrl };
  } catch (err: any) {
    console.error('Failed to export element to JPEG', err);
    return { success: false, error: err.message || 'Image generation failed' };
  }
}

export async function copyElementAsImageToClipboard(
  element: HTMLElement
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!navigator.clipboard || !window.ClipboardItem) {
      return { success: false, error: 'Clipboard copy not supported in this browser' };
    }

    const blob = await toBlob(element, {
      quality: 0.95,
      pixelRatio: 2.0,
      cacheBust: true,
    });

    if (!blob) {
      return { success: false, error: 'Could not create image blob' };
    }

    const item = new ClipboardItem({ 'image/png': blob });
    await navigator.clipboard.write([item]);
    return { success: true };
  } catch (err: any) {
    console.error('Clipboard copy error', err);
    return { success: false, error: err.message || 'Failed to copy to clipboard' };
  }
}
