import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, Download, FileText, FileSpreadsheet, FileCode, X } from 'lucide-react';

/**
 * Dispatches a global event that triggers the download notification toast.
 * Can be called from anywhere in the codebase.
 */
export function notifyDownloadSuccess({
  filename = 'document.pdf',
  fileType = '',
  title = '',
  message = '',
  duration = 4500
} = {}) {
  let inferredType = fileType;
  if (!inferredType && filename) {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') inferredType = 'pdf';
    else if (ext === 'csv') inferredType = 'csv';
    else if (ext === 'json') inferredType = 'json';
    else if (ext === 'yaml' || ext === 'yml') inferredType = 'yaml';
  }

  const event = new CustomEvent('postutrack:file-downloaded', {
    detail: {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      filename,
      fileType: inferredType || 'file',
      title,
      message,
      duration,
      timestamp: Date.now()
    }
  });

  window.dispatchEvent(event);
}

export function DownloadToastContainer({ lang = 'fr', t = {} }) {
  const [toasts, setToasts] = useState([]);

  const handleDismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  useEffect(() => {
    const handleDownloadEvent = (event) => {
      const newToast = event.detail;
      if (!newToast) return;

      setToasts((prev) => [newToast, ...prev].slice(0, 3));
    };

    window.addEventListener('postutrack:file-downloaded', handleDownloadEvent);
    return () => {
      window.removeEventListener('postutrack:file-downloaded', handleDownloadEvent);
    };
  }, []);

  const getBadgeStyle = (fileType) => {
    switch (fileType?.toLowerCase()) {
      case 'pdf':
        return {
          bg: 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 border-rose-200 dark:border-rose-800/40',
          icon: <FileText size={15} className="text-rose-500 shrink-0" />,
          label: 'PDF'
        };
      case 'csv':
        return {
          bg: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40',
          icon: <FileSpreadsheet size={15} className="text-emerald-500 shrink-0" />,
          label: 'CSV'
        };
      case 'json':
        return {
          bg: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-800/40',
          icon: <FileCode size={15} className="text-amber-500 shrink-0" />,
          label: 'JSON'
        };
      case 'yaml':
      case 'yml':
        return {
          bg: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-800/40',
          icon: <FileCode size={15} className="text-blue-500 shrink-0" />,
          label: 'YAML'
        };
      default:
        return {
          bg: 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/40',
          icon: <Download size={15} className="text-indigo-500 shrink-0" />,
          label: 'FICHIER'
        };
    }
  };

  return (
    <div
      id="download-toasts-container"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-[99999] flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full pointer-events-none px-3 sm:px-0"
    >
      {toasts.map((toast) => {
        const badge = getBadgeStyle(toast.fileType);
        const defaultTitle =
          toast.title ||
          (t.downloadSuccessTitle
            ? t.downloadSuccessTitle
            : lang === 'en'
            ? 'File downloaded successfully!'
            : 'Fichier téléchargé avec succès !');
        const defaultDesc =
          toast.message ||
          (t.downloadSuccessDesc
            ? t.downloadSuccessDesc
            : lang === 'en'
            ? 'The file has been saved to your device.'
            : 'Le fichier a été enregistré sur votre appareil.');

        return (
          <DownloadToastItem
            key={toast.id}
            toast={toast}
            badge={badge}
            title={defaultTitle}
            desc={defaultDesc}
            onDismiss={() => handleDismiss(toast.id)}
          />
        );
      })}
    </div>
  );
}

function DownloadToastItem({ toast, badge, title, desc, onDismiss }) {
  const [visible, setVisible] = useState(false);
  const [progressWidth, setProgressWidth] = useState(100);

  useEffect(() => {
    // Trigger smooth enter animation
    const enterTimer = requestAnimationFrame(() => {
      setVisible(true);
    });

    const duration = toast.duration || 4500;
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgressWidth(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 40);

    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 250);
    }, duration);

    return () => {
      cancelAnimationFrame(enterTimer);
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [toast.id, toast.duration, onDismiss]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onDismiss, 200);
  };

  return (
    <div
      className={`pointer-events-auto w-full relative overflow-hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-2xl border border-emerald-200/80 dark:border-emerald-800/60 shadow-xl shadow-emerald-500/10 p-4 transition-all duration-300 transform ${
        visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Success Checkmark & File Icon Badge */}
        <div className="relative shrink-0 mt-0.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs">
            <CheckCircle2 size={22} className="text-emerald-500 dark:text-emerald-400" />
          </div>
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 items-center justify-center text-[9px] text-white font-bold">
              ✓
            </span>
          </span>
        </div>

        {/* Content Details */}
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight leading-snug truncate">
              {title}
            </h4>
            <span
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase border shrink-0 ${badge.bg}`}
            >
              {badge.label}
            </span>
          </div>

          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-1 mb-1.5">
            {desc}
          </p>

          {/* Filename Pill */}
          {toast.filename && (
            <div className="inline-flex items-center gap-1.5 max-w-full px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700/60 text-[11px] font-mono text-gray-700 dark:text-gray-300 truncate">
              {badge.icon}
              <span className="truncate">{toast.filename}</span>
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="shrink-0 p-1.5 -mr-1 -mt-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
          title="Fermer"
        >
          <X size={15} />
        </button>
      </div>

      {/* Auto-dismissing bottom progress bar */}
      <div
        style={{ width: `${progressWidth}%` }}
        className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 transition-all duration-75 ease-linear"
      />
    </div>
  );
}
