import { useRef, useState, DragEvent } from 'react';
import { Camera, Upload, X } from 'lucide-react';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export function UploadZone({ onFileSelect, disabled }: UploadZoneProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setPreview(URL.createObjectURL(file));
    onFileSelect(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleClear = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  if (preview) {
    return (
      <div className="relative rounded-2xl overflow-hidden border-2 border-eco-green-300 dark:border-eco-green-700">
        <img src={preview} alt="Preview" className="w-full max-h-80 object-cover" />
        <button
          onClick={handleClear}
          disabled={disabled}
          className="absolute top-3 right-3 p-1.5 bg-white dark:bg-gray-800 rounded-full shadow text-gray-700 dark:text-gray-300 hover:bg-gray-100 disabled:opacity-50"
          aria-label="Remove image"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && fileInputRef.current?.click()}
      className={`relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-12 cursor-pointer transition-colors ${
        dragging
          ? 'border-eco-green-500 bg-eco-green-50 dark:bg-eco-green-900/20'
          : 'border-eco-green-300 dark:border-eco-green-700 hover:border-eco-green-400 hover:bg-eco-green-50/50 dark:hover:bg-eco-green-900/10'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div className="w-16 h-16 rounded-full bg-eco-green-50 dark:bg-eco-green-900/30 flex items-center justify-center">
        <Upload className="w-8 h-8 text-eco-green-500 dark:text-eco-green-400" />
      </div>
      <div className="text-center">
        <p className="font-semibold text-gray-700 dark:text-gray-200">Drop your waste photo here</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">or click to browse files</p>
      </div>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        disabled={disabled}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
      {/* Camera button */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}
        disabled={disabled}
        className="flex items-center gap-2 px-4 py-2 bg-eco-green-600 hover:bg-eco-green-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
      >
        <Camera className="w-4 h-4" /> Use Camera
      </button>
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        disabled={disabled}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
    </div>
  );
}
