import React, { useState, useRef } from 'react';
import { Camera, Upload, Trash2, Image as ImageIcon, Check, RefreshCw } from 'lucide-react';

/**
 * Resizes and compresses an image file to a lightweight data URL
 * to avoid exceeding browser localStorage limits.
 */
export const compressImageFile = (file, maxWidth = 350, maxHeight = 350, quality = 0.85) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Invalid image file'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target.result);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

export function ProfilePhotoUploader({
  photo,
  name = '',
  onPhotoChange,
  t,
  lang = 'fr',
  variant = 'card', // 'card' | 'compact'
  className = ''
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const getInitials = (str) => {
    if (!str || typeof str !== 'string') return 'JD';
    return str.split(' ').map(n => n[0]).filter(Boolean).join('').substring(0, 2).toUpperCase() || 'JD';
  };

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError(t?.photoInvalidError || (lang === 'en' ? 'Please select an image file.' : 'Veuillez sélectionner un fichier image.'));
      setTimeout(() => setError(''), 4000);
      return;
    }

    try {
      setIsProcessing(true);
      setError('');
      const compressedDataUrl = await compressImageFile(file);
      onPhotoChange(compressedDataUrl);
    } catch (err) {
      console.error('Image compression error:', err);
      setError(t?.photoInvalidError || (lang === 'en' ? 'Failed to process image.' : 'Erreur lors du traitement de l\'image.'));
      setTimeout(() => setError(''), 4000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onPhotoChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-3.5 ${className}`}>
        {/* Hidden Input */}
        <input 
          ref={fileInputRef}
          type="file" 
          accept="image/png,image/jpeg,image/webp,image/gif" 
          className="hidden" 
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
              e.target.value = '';
            }
          }} 
        />

        {/* Drop zone / Avatar */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative group cursor-pointer w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 transition-all flex items-center justify-center shrink-0 shadow-xs ${
            isDragging 
              ? 'border-indigo-500 ring-4 ring-indigo-500/20 scale-105' 
              : photo 
              ? 'border-indigo-200 dark:border-indigo-800' 
              : 'border-dashed border-gray-300 dark:border-gray-600 bg-gray-100/80 dark:bg-gray-750 hover:border-indigo-400'
          }`}
          title={photo ? (t?.changePhotoBtn || 'Changer la photo') : (t?.importPhotoBtn || 'Importer une photo')}
        >
          {photo ? (
            <>
              <img src={photo} alt={name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Camera size={18} />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
              <Camera size={20} />
            </div>
          )}

          {isProcessing && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-2xs flex items-center justify-center text-white">
              <RefreshCw size={16} className="animate-spin" />
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1.5 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-lg text-xs font-semibold border border-indigo-200 dark:border-indigo-800/60 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Upload size={13} />
              <span>{photo ? (t?.changePhotoBtn || 'Changer') : (t?.importPhotoBtn || 'Photo')}</span>
            </button>

            {photo && (
              <button
                type="button"
                onClick={handleRemove}
                className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors cursor-pointer"
                title={t?.removePhotoBtn || 'Supprimer'}
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
          <span className="text-[10.5px] text-gray-400 dark:text-gray-500 truncate">
            {photo ? (lang === 'en' ? 'Picture linked' : 'Photo enregistrée') : (lang === 'en' ? 'PNG, JPG, WebP' : 'PNG, JPG, WebP')}
          </span>
        </div>
      </div>
    );
  }

  // Default 'card' variant: Prominent card uploader
  return (
    <div className={`p-4 sm:p-5 bg-slate-50/80 dark:bg-gray-750/70 border border-slate-200 dark:border-gray-700 rounded-2xl transition-all ${className}`}>
      {/* Hidden file input */}
      <input 
        ref={fileInputRef}
        type="file" 
        accept="image/png,image/jpeg,image/webp,image/gif" 
        className="hidden" 
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
            e.target.value = '';
          }
        }} 
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Avatar drop zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative group cursor-pointer w-20 h-20 sm:w-22 sm:h-22 rounded-2xl overflow-hidden border-2 transition-all flex items-center justify-center shrink-0 shadow-sm ${
              isDragging 
                ? 'border-indigo-500 ring-4 ring-indigo-500/20 scale-105 bg-indigo-50 dark:bg-indigo-950/40' 
                : photo 
                ? 'border-indigo-300 dark:border-indigo-700 ring-2 ring-indigo-100 dark:ring-indigo-900/30' 
                : 'border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500'
            }`}
            title={t?.photoDropTip || 'Glissez une photo ici ou cliquez pour choisir'}
          >
            {photo ? (
              <>
                <img src={photo} alt={name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-medium gap-1">
                  <Camera size={20} />
                  <span>{lang === 'en' ? 'Edit' : 'Modifier'}</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 gap-1 text-center px-1">
                <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold text-xs">
                  {getInitials(name)}
                </div>
                <Camera size={14} className="text-gray-400" />
              </div>
            )}

            {isProcessing && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-2xs flex flex-col items-center justify-center text-white text-xs gap-1">
                <RefreshCw size={20} className="animate-spin text-indigo-300" />
                <span>{lang === 'en' ? 'Optimizing...' : 'Optimisation...'}</span>
              </div>
            )}
          </div>

          {/* Description & Status */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                <ImageIcon size={16} className="text-indigo-600 dark:text-indigo-400" />
                {t?.photoLabel || 'Photo de profil'}
              </h4>
              {photo && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/50 flex items-center gap-1">
                  <Check size={11} /> {lang === 'en' ? 'Active' : 'Enregistrée'}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md">
              {t?.photoSubtitle || 'Formats acceptés : JPG, PNG, WebP (Optimisation et recadrage automatiques)'}
            </p>
            <p className="text-[11px] text-indigo-600/80 dark:text-indigo-400/80">
              {t?.photoDropTip || 'Glissez une photo ici ou cliquez pour choisir'}
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 sm:flex-none justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Upload size={14} />
            <span>{photo ? (t?.changePhotoBtn || 'Changer la photo') : (t?.importPhotoBtn || 'Importer une photo')}</span>
          </button>

          {photo && (
            <button
              type="button"
              onClick={handleRemove}
              className="px-3 py-2 bg-white dark:bg-gray-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-gray-200 dark:border-gray-600 hover:border-rose-200 dark:hover:border-rose-800 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
              title={t?.removePhotoBtn || 'Supprimer la photo'}
            >
              <Trash2 size={14} />
              <span>{t?.removePhotoBtn || 'Supprimer'}</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-3 p-2 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 rounded-lg text-xs font-medium">
          {error}
        </div>
      )}
    </div>
  );
}
