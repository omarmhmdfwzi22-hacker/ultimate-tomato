import React, { useState, useRef } from 'react';
import { Upload, X, ArrowUp, ArrowDown, Image as ImageIcon, Link as LinkIcon, Loader2 } from 'lucide-react';
import { uploadService } from '../../services/cmsServices';

export interface UploadedImageItem {
  id?: string;
  url: string;
  alt?: string;
  sort_order?: number;
}

interface ImageUploaderProps {
  label: string;
  description?: string;
  multiple?: boolean;
  value: UploadedImageItem[];
  onChange: (images: UploadedImageItem[]) => void;
  maxFiles?: number;
}

export function ImageUploader({
  label,
  description,
  multiple = false,
  value = [],
  onChange,
  maxFiles = 10,
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | File[]) => {
    setError(null);
    const fileList = Array.from(files);
    if (fileList.length === 0) return;

    if (!multiple && fileList.length > 1) {
      setError('Single image upload mode only.');
      return;
    }

    if (multiple && value.length + fileList.length > maxFiles) {
      setError(`Maximum ${maxFiles} images permitted.`);
      return;
    }

    setIsUploading(true);
    try {
      const uploadPromises = fileList.map(async (file, index) => {
        const res = await uploadService.uploadImage(file);
        return {
          id: `img-${Date.now()}-${index}`,
          url: res.url,
          alt: file.name.replace(/\.[^/.]+$/, ''),
          sort_order: value.length + index + 1,
        };
      });

      const newImages = await Promise.all(uploadPromises);
      if (multiple) {
        onChange([...value, ...newImages]);
      } else {
        onChange([newImages[0]]);
      }
    } catch (err: any) {
      setError(err.message || 'Upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleAddManualUrl = () => {
    if (!manualUrl.trim()) return;
    const item: UploadedImageItem = {
      id: `img-url-${Date.now()}`,
      url: manualUrl.trim(),
      alt: 'Project image',
      sort_order: value.length + 1,
    };
    if (multiple) {
      onChange([...value, item]);
    } else {
      onChange([item]);
    }
    setManualUrl('');
    setShowUrlInput(false);
  };

  const handleDelete = (index: number) => {
    const next = value.filter((_, idx) => idx !== index);
    onChange(next);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const next = [...value];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= next.length) return;

    const temp = next[index];
    next[index] = next[targetIdx];
    next[targetIdx] = temp;

    // re-index sort_order
    next.forEach((item, idx) => {
      item.sort_order = idx + 1;
    });

    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 tracking-wide">
            {label}
          </label>
          {description && (
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">{description}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-xs text-[#F52F3A] hover:underline flex items-center gap-1 font-medium"
        >
          <LinkIcon className="w-3.5 h-3.5" />
          {showUrlInput ? 'Hide URL input' : 'Add by URL'}
        </button>
      </div>

      {showUrlInput && (
        <div className="flex items-center gap-2 p-3 bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl">
          <input
            type="url"
            placeholder="https://example.com/image.jpg"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            className="flex-1 bg-white dark:bg-[#111111] border border-zinc-200 dark:border-white/10 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#F52F3A]"
          />
          <button
            type="button"
            onClick={handleAddManualUrl}
            className="px-3 py-2 rounded-lg bg-[#F52F3A] text-white text-xs font-medium hover:bg-[#d9232d]"
          >
            Add
          </button>
        </div>
      )}

      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
          dragOver
            ? 'border-[#F52F3A] bg-[#F52F3A]/5'
            : 'border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 bg-zinc-50/50 dark:bg-white/[0.02]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
          multiple={multiple}
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />

        {isUploading ? (
          <div className="flex flex-col items-center justify-center py-3">
            <Loader2 className="w-8 h-8 text-[#F52F3A] animate-spin mb-2" />
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Validating & optimizing image upload...
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-2">
            <div className="w-12 h-12 rounded-xl bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 flex items-center justify-center mb-3 shadow-sm">
              <Upload className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
            </div>
            <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              Drag & drop image{multiple ? 's' : ''} here, or{' '}
              <span className="text-[#F52F3A]">browse files</span>
            </p>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">
              Supports JPEG, PNG, WebP, AVIF up to 8MB
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      {/* Image Preview & Reorder List */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
          {value.map((item, idx) => (
            <div
              key={item.id || idx}
              className="group relative aspect-video bg-zinc-100 dark:bg-white/5 rounded-xl overflow-hidden border border-zinc-200 dark:border-white/10 shadow-sm"
            >
              <img src={item.url} alt={item.alt || 'Preview'} className="w-full h-full object-cover" />

              {/* Order Badge */}
              {multiple && (
                <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-mono text-white">
                  #{idx + 1}
                </span>
              )}

              {/* Action Overlays */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2">
                {multiple && (
                  <>
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMove(idx, 'up')}
                      className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white disabled:opacity-30"
                      title="Move backward"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === value.length - 1}
                      onClick={() => handleMove(idx, 'down')}
                      className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white disabled:opacity-30"
                      title="Move forward"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(idx)}
                  className="p-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white"
                  title="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
