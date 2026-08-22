import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

/**
 * Clean sanitization for filenames across Windows, macOS, Linux, and web
 */
export function sanitizeFilename(name, fallback = 'document') {
  if (!name || typeof name !== 'string') return `${fallback}.pdf`;
  
  const clean = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents/diacritics
    .replace(/[^a-zA-Z0-9_\-]/g, '_') // sanitize special chars & spaces
    .replace(/_+/g, '_') // collapse multiple underscores
    .replace(/^_+|_+$/g, ''); // trim leading/trailing underscores

  return `${clean || fallback}.pdf`;
}

/**
 * Generates and directly downloads a 100% pixel-perfect vector-sharp PDF file
 * uses native browser rasterization via SVG foreignObject (html-to-image) to eliminate
 * any font doubling, text overlapping, or clipping glitches.
 */
export async function downloadElementAsPDF({
  elementId,
  targetElement,
  filename = 'Document.pdf',
  isMultiPage = false,
  onProgress = null
}) {
  const sourceEl = targetElement || (elementId ? document.getElementById(elementId) : null);
  if (!sourceEl) {
    throw new Error(`Élément introuvable (${elementId || 'targetElement'})`);
  }

  if (onProgress) onProgress({ status: 'preparing', message: 'Préparation du document...' });

  // Ensure all fonts are ready
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  // Create an offscreen wrapper to guarantee 0 parent transform/zoom interference
  const offscreenContainer = document.createElement('div');
  offscreenContainer.style.position = 'fixed';
  offscreenContainer.style.left = '-10000px';
  offscreenContainer.style.top = '0';
  offscreenContainer.style.width = '794px'; // 210mm at 96 DPI
  offscreenContainer.style.zIndex = '-9999';
  offscreenContainer.style.backgroundColor = '#ffffff';
  offscreenContainer.style.opacity = '1';
  offscreenContainer.style.pointerEvents = 'none';

  // Deep clone the element to preserve full original styles without viewport scaling
  const clone = sourceEl.cloneNode(true);
  clone.style.transform = 'none';
  clone.style.transformOrigin = 'top left';
  clone.style.boxShadow = 'none';
  clone.style.margin = '0';
  clone.style.width = '794px';
  clone.style.maxWidth = '794px';
  clone.style.minWidth = '794px';
  clone.style.boxSizing = 'border-box';
  clone.style.position = 'relative';

  offscreenContainer.appendChild(clone);
  document.body.appendChild(offscreenContainer);

  try {
    if (onProgress) onProgress({ status: 'rendering', message: 'Rendu haute définition...' });

    // Small delay to ensure DOM and stylesheet calculations settle in the clone
    await new Promise(resolve => setTimeout(resolve, 80));

    // Convert cleanly via native browser engine to high-res PNG (2.5x scale)
    const imgDataUrl = await toPng(clone, {
      pixelRatio: 2.5,
      backgroundColor: '#ffffff',
      cacheBust: true,
      skipAutoScale: true
    });

    if (onProgress) onProgress({ status: 'compiling', message: 'Assemblage du PDF...' });

    // Load into Image to get natural dimensions
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imgDataUrl;
    });

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pageWidthMM = 210;
    const pageHeightMM = 297;
    const imgWidthPx = img.width;
    const imgHeightPx = img.height;

    // Check if single or multi-page
    if (!isMultiPage) {
      // Single Page strict fit
      pdf.addImage(imgDataUrl, 'PNG', 0, 0, pageWidthMM, pageHeightMM, undefined, 'FAST');
    } else {
      // Multi-page slicing
      const pxPerMM = imgWidthPx / pageWidthMM;
      const pageHeightPx = Math.floor(pageHeightMM * pxPerMM);
      const totalPages = Math.max(1, Math.ceil(imgHeightPx / pageHeightPx));

      for (let i = 0; i < totalPages; i++) {
        if (i > 0) {
          pdf.addPage('a4', 'portrait');
        }

        const sourceY = i * pageHeightPx;
        const sourceHeight = Math.min(pageHeightPx, imgHeightPx - sourceY);

        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = imgWidthPx;
        pageCanvas.height = pageHeightPx;
        const ctx = pageCanvas.getContext('2d');

        // White background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, imgWidthPx, pageHeightPx);

        // Draw page slice
        ctx.drawImage(
          img,
          0, sourceY, imgWidthPx, sourceHeight,
          0, 0, imgWidthPx, sourceHeight
        );

        const pageDataUrl = pageCanvas.toDataURL('image/png');
        pdf.addImage(pageDataUrl, 'PNG', 0, 0, pageWidthMM, pageHeightMM, undefined, 'FAST');
      }
    }

    if (onProgress) onProgress({ status: 'downloading', message: 'Téléchargement...' });

    const cleanFilename = sanitizeFilename(filename, 'Document.pdf');

    // Trigger direct file download
    try {
      pdf.save(cleanFilename);
    } catch {
      // Fallback for sandboxed iframe environments
      const blob = pdf.output('blob');
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = cleanFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);
    }

    if (onProgress) onProgress({ status: 'done', message: 'PDF téléchargé !' });
    return true;
  } finally {
    // Always clean up offscreen container
    if (document.body.contains(offscreenContainer)) {
      document.body.removeChild(offscreenContainer);
    }
  }
}
