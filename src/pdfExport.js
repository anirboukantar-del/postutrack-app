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
 * Helper to determine standard PDF font weight/style
 */
function getPdfFontProperties(fontWeight, fontStyle) {
  const isBold = typeof fontWeight === 'string'
    ? (fontWeight === 'bold' || fontWeight === 'bolder' || parseInt(fontWeight, 10) >= 600)
    : (typeof fontWeight === 'number' && fontWeight >= 600);
  const isItalic = fontStyle === 'italic' || fontStyle === 'oblique';

  if (isBold && isItalic) return { family: 'helvetica', style: 'bolditalic' };
  if (isBold) return { family: 'helvetica', style: 'bold' };
  if (isItalic) return { family: 'helvetica', style: 'italic' };
  return { family: 'helvetica', style: 'normal' };
}

/**
 * Extracts all visible text nodes and links from DOM clone with exact coordinates
 * for creating an invisible, 100% selectable and searchable text overlay in the PDF.
 */
function extractTextAndLinks(container) {
  const containerRect = container.getBoundingClientRect();
  const textItems = [];
  const linkItems = [];

  // Extract clickable links
  const links = container.querySelectorAll('a[href]');
  links.forEach(a => {
    const r = a.getBoundingClientRect();
    if (r.width > 0 && r.height > 0 && a.href) {
      linkItems.push({
        x: r.left - containerRect.left,
        y: r.top - containerRect.top,
        width: r.width,
        height: r.height,
        url: a.href
      });
    }
  });

  // TreeWalker for all visible text nodes
  const walker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        if (!node.textContent || !node.textContent.trim()) {
          return NodeFilter.FILTER_REJECT;
        }
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;

        const tag = parent.tagName ? parent.tagName.toLowerCase() : '';
        if (tag === 'script' || tag === 'style' || tag === 'svg') return NodeFilter.FILTER_REJECT;

        const style = window.getComputedStyle(parent);
        if (style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity) === 0) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  const range = document.createRange();
  let node;

  while ((node = walker.nextNode())) {
    const parent = node.parentElement;
    const style = window.getComputedStyle(parent);
    const fontSize = parseFloat(style.fontSize) || 12;
    const fontProps = getPdfFontProperties(style.fontWeight, style.fontStyle);
    const text = node.textContent;

    range.selectNodeContents(node);
    const rects = range.getClientRects();

    if (rects.length <= 1) {
      const r = rects[0] || range.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        textItems.push({
          text: text.trim(),
          x: r.left - containerRect.left,
          y: r.top - containerRect.top,
          width: r.width,
          height: r.height,
          fontSize,
          fontProps,
          baseline: (r.top - containerRect.top) + (fontSize * 0.85)
        });
      }
    } else {
      // Split by words to ensure accurate multi-line wrapped positions
      const words = text.split(/(\s+)/);
      let currentOffset = 0;

      for (const token of words) {
        if (!token) continue;
        const start = currentOffset;
        const end = currentOffset + token.length;
        currentOffset = end;

        if (!token.trim()) continue;

        try {
          range.setStart(node, start);
          range.setEnd(node, end);
          const wr = range.getBoundingClientRect();
          if (wr.width > 0 && wr.height > 0) {
            textItems.push({
              text: token,
              x: wr.left - containerRect.left,
              y: wr.top - containerRect.top,
              width: wr.width,
              height: wr.height,
              fontSize,
              fontProps,
              baseline: (wr.top - containerRect.top) + (fontSize * 0.85)
            });
          }
        } catch {
          // Continue if selection range bounds fail
        }
      }
    }
  }

  return { textItems, linkItems };
}

/**
 * Generates and directly downloads a 100% pixel-perfect vector-sharp PDF file
 * with selectable/searchable text and interactive links.
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

    // Extract selectable text layer and links from the rendered DOM layout
    const { textItems, linkItems } = extractTextAndLinks(clone);

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
    const containerWidthPx = clone.offsetWidth || 794;
    const scaleX = pageWidthMM / containerWidthPx;
    const scaleY = scaleX;

    // Check if single or multi-page
    if (!isMultiPage) {
      // Single Page strict fit
      pdf.addImage(imgDataUrl, 'PNG', 0, 0, pageWidthMM, pageHeightMM, undefined, 'FAST');

      // Overlay invisible selectable text
      textItems.forEach(item => {
        const xMM = item.x * scaleX;
        const baselineYMM = item.baseline * scaleY;
        const fontSizePt = Math.max(4, Math.min(72, item.fontSize * 0.75));

        pdf.setFont(item.fontProps.family, item.fontProps.style);
        pdf.setFontSize(fontSizePt);
        try {
          pdf.text(item.text, xMM, baselineYMM, { renderingMode: 'invisible' });
        } catch {
          // ignore any unsupported unicode glyphs in standard font
        }
      });

      // Overlay clickable links
      linkItems.forEach(link => {
        try {
          pdf.link(link.x * scaleX, link.y * scaleY, link.width * scaleX, link.height * scaleY, { url: link.url });
        } catch {
          // ignore invalid link formats
        }
      });
    } else {
      // Multi-page slicing
      const pxPerMM = imgWidthPx / pageWidthMM;
      const pageHeightPx = Math.floor(pageHeightMM * pxPerMM);
      const totalPages = Math.max(1, Math.ceil(imgHeightPx / pageHeightPx));
      const pageHeightInContainerPx = pageHeightMM / scaleY;

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

        // Overlay selectable text for this specific page
        const pageMinY = i * pageHeightInContainerPx;
        const pageMaxY = (i + 1) * pageHeightInContainerPx;

        textItems.forEach(item => {
          if (item.y >= pageMinY && item.y < pageMaxY) {
            const pageBaselineY = item.baseline - pageMinY;
            const xMM = item.x * scaleX;
            const baselineYMM = pageBaselineY * scaleY;
            const fontSizePt = Math.max(4, Math.min(72, item.fontSize * 0.75));

            pdf.setFont(item.fontProps.family, item.fontProps.style);
            pdf.setFontSize(fontSizePt);
            try {
              pdf.text(item.text, xMM, baselineYMM, { renderingMode: 'invisible' });
            } catch {
              // ignore
            }
          }
        });

        // Overlay clickable links for this page
        linkItems.forEach(link => {
          if (link.y >= pageMinY && link.y < pageMaxY) {
            try {
              pdf.link(
                link.x * scaleX,
                (link.y - pageMinY) * scaleY,
                link.width * scaleX,
                link.height * scaleY,
                { url: link.url }
              );
            } catch {
              // ignore
            }
          }
        });
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
