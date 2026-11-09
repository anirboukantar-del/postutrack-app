import React, { useState, useRef } from 'react';
import { Camera, Upload, Trash2, Image as ImageIcon, Check, RefreshCw } from './icons';

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
          className={`relative group cursor-pointer w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden transition-colors duration-150 flex items-center justify-center shrink-0 ${
            isDragging 
              ? 'bg-blue-50 dark:bg-blue-950/50' 
              : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200/70 dark:hover:bg-zinc-700'
          }`}
          title={photo ? (t?.changePhotoBtn || 'Changer la photo') : (t?.importPhotoBtn || 'Importer une photo')}
        >
          {photo ? (
            <>
              <img src={photo} alt={name} className="w-full h-full object-cover object-top" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Camera size={18} />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-zinc-500 dark:text-zinc-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">
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
              className="px-2.5 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200/70 dark:hover:bg-zinc-700 rounded-md text-xs font-medium transition-colors duration-150 cursor-pointer flex items-center gap-1.5"
            >
              <Upload size={13} />
              <span>{photo ? (t?.changePhotoBtn || 'Changer') : (t?.importPhotoBtn || 'Photo')}</span>
            </button>

            {photo && (
              <button
                type="button"
                onClick={handleRemove}
                className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md transition-colors duration-150 cursor-pointer"
                title={t?.removePhotoBtn || 'Supprimer'}
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
          <span className="text-[10.5px] text-zinc-400 dark:text-zinc-500 truncate">
            {photo ? (lang === 'en' ? 'Picture linked' : 'Photo enregistrée') : 'PNG, JPG, WebP'}
          </span>
        </div>
      </div>
    );
  }

  // Default 'card' variant: Prominent uploader
  return (
    <div className={`p-4 sm:p-5 bg-zinc-100/70 dark:bg-zinc-950/60 rounded-lg transition-colors duration-150 ${className}`}>
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
            className={`relative group cursor-pointer w-20 h-20 rounded-lg overflow-hidden transition-colors duration-150 flex items-center justify-center shrink-0 ${
              isDragging 
                ? 'bg-blue-50 dark:bg-blue-950/40' 
                : 'bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800'
            }`}
            title={t?.photoDropTip || 'Glissez une photo ici ou cliquez pour choisir'}
          >
            {photo ? (
              <>
                <img src={photo} alt={name} className="w-full h-full object-cover object-top" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-medium gap-1">
                  <Camera size={20} />
                  <span>{lang === 'en' ? 'Edit' : 'Modifier'}</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 gap-1 text-center px-1">
                <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 font-semibold text-xs">
                  {getInitials(name)}
                </div>
                <Camera size={14} className="text-zinc-400" />
              </div>
            )}

            {isProcessing && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-2xs flex flex-col items-center justify-center text-white text-xs gap-1">
                <RefreshCw size={20} className="animate-spin text-blue-300" />
                <span>{lang === 'en' ? 'Optimizing...' : 'Optimisation...'}</span>
              </div>
            )}
          </div>

          {/* Description & Status */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <ImageIcon size={15} className="text-blue-600 dark:text-blue-400" />
                {t?.photoLabel || 'Photo de profil'}
              </h4>
              {photo && (
                <span className="px-2 py-0.5 rounded-sm text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                  <Check size={11} /> {lang === 'en' ? 'Active' : 'Enregistrée'}
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-md">
              {t?.photoSubtitle || 'Formats acceptés : JPG, PNG, WebP (Optimisation et recadrage automatiques)'}
            </p>
            <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
              {t?.photoDropTip || 'Glissez une photo ici ou cliquez pour choisir'}
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 sm:flex-none justify-center px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs sm:text-sm font-semibold transition-colors duration-150 cursor-pointer flex items-center gap-1.5"
          >
            <Upload size={14} />
            <span>{photo ? (t?.changePhotoBtn || 'Changer la photo') : (t?.importPhotoBtn || 'Importer une photo')}</span>
          </button>

          {photo && (
            <button
              type="button"
              onClick={handleRemove}
              className="px-3 py-2 bg-white dark:bg-zinc-900 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-md text-xs sm:text-sm font-medium transition-colors duration-150 cursor-pointer flex items-center gap-1.5"
              title={t?.removePhotoBtn || 'Supprimer la photo'}
            >
              <Trash2 size={14} />
              <span>{t?.removePhotoBtn || 'Supprimer'}</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-3 p-2 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded-md text-xs font-medium">
          {error}
        </div>
      )}
    </div>
  );
}
