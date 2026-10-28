'use client';

import React, { useState } from 'react';
import { ImageItem, validateImageFiles } from '@/lib/validation/media';
import { UploadCloud, ChevronUp, ChevronDown, Trash2, Image as ImageIcon, Sparkles, CheckCircle2 } from 'lucide-react';

interface ImageUploaderProps {
  images: ImageItem[];
  onChange: (images: ImageItem[]) => void;
  onLoadSampleImages: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onChange,
  onLoadSampleImages,
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validation = validateImageFiles(images.length);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 8) {
      setError(`Cannot upload more than 8 photos total (currently ${images.length})`);
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const newImages: ImageItem[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/media/upload', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Upload failed');
        }

        const data = await res.json();
        newImages.push(data.image);
      }

      onChange([...images, ...newImages]);
    } catch (err: any) {
      setError(err.message || 'Error uploading files');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= images.length) return;

    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    onChange(updated);
  };

  const removeImage = (id: string) => {
    onChange(images.filter((img) => img.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-white">Property Visuals</h2>
          <p className="text-xs text-zinc-400">
            Upload 4 to 8 high-resolution property photographs. The order here determines the video scene timeline.
          </p>
        </div>
        <button
          type="button"
          onClick={onLoadSampleImages}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-400 bg-blue-950/40 hover:bg-blue-900/50 border border-blue-800/60 rounded-md transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Load 5 Sample Photos
        </button>
      </div>

      {/* Validation status pill */}
      <div className="flex items-center justify-between p-3 bg-zinc-900 border border-zinc-800 rounded-md">
        <div className="flex items-center gap-2">
          {validation.valid ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <div className="w-2 h-2 rounded-full bg-amber-400" />
          )}
          <span className="text-xs font-medium text-zinc-300">
            {images.length} of 4–8 required photos selected
          </span>
        </div>
        {!validation.valid && (
          <span className="text-xs text-amber-400 font-medium">
            {validation.message}
          </span>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-950/40 border border-red-900/60 rounded-md text-red-300 text-xs">
          {error}
        </div>
      )}

      {/* Upload Dropzone */}
      <div className="relative border-2 border-dashed border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 hover:bg-zinc-900/60 transition-colors rounded-lg p-6 text-center cursor-pointer">
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileUpload}
          disabled={uploading || images.length >= 8}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
          <UploadCloud className="w-8 h-8 text-blue-500" />
          <div className="text-xs text-zinc-300 font-medium">
            {uploading ? 'Processing photos...' : 'Click to select or drag and drop images'}
          </div>
          <div className="text-[11px] text-zinc-500">
            JPEG, PNG or WebP up to 10MB each (Vertical 9:16 or horizontal photos supported)
          </div>
        </div>
      </div>

      {/* Image list with ordering */}
      {images.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
            Scene Order (Top to Bottom)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {images.map((img, idx) => (
              <div
                key={img.id}
                className="group relative bg-zinc-900 border border-zinc-800 rounded-md overflow-hidden flex flex-col"
              >
                {/* Thumbnail */}
                <div className="relative aspect-[9/12] w-full bg-zinc-950 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={img.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/80 backdrop-blur-sm text-[10px] font-mono text-white rounded">
                    Scene {idx + 1}
                  </div>
                </div>

                {/* Details and controls */}
                <div className="p-2.5 flex items-center justify-between bg-zinc-900/90 text-xs">
                  <span className="truncate max-w-[120px] text-zinc-300 font-medium" title={img.name}>
                    {img.name}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveImage(idx, 'up')}
                      title="Move earlier"
                      className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === images.length - 1}
                      onClick={() => moveImage(idx, 'down')}
                      title="Move later"
                      className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImage(img.id)}
                      title="Delete photo"
                      className="p-1 hover:bg-red-950/60 text-zinc-400 hover:text-red-400 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
