import { useRef, useState, useEffect, DragEvent } from 'react';
import { Camera, Upload, X, Video, VideoOff, Sparkles } from 'lucide-react';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

// Demo quick-test items with sample images
const QUICK_SAMPLES = [
  { label: 'Plastic Bottle', emoji: '🧴', color: 'rgb(59, 130, 246)', category: 'Plastic', sub: 'pet_bottle' },
  { label: 'Cardboard Box', emoji: '📦', color: 'rgb(217, 119, 6)', category: 'Paper', sub: 'cardboard' },
  { label: 'Soda Can', emoji: '🥫', color: 'rgb(107, 114, 128)', category: 'Metal', sub: 'aluminum_can' },
  { label: 'Apple Core', emoji: '🍎', color: 'rgb(16, 185, 129)', category: 'Food/Organic', sub: 'fruit_peel' },
  { label: 'Smartphone', emoji: '📱', color: 'rgb(147, 51, 234)', category: 'E-Waste', sub: 'phone' },
];

export function UploadZone({ onFileSelect, disabled }: UploadZoneProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop camera on unmount or when camera turns off
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('[Camera] Could not access live camera:', err);
      setCameraError('Unable to access webcam. Use device camera or file upload.');
      // Fallback to native device file camera input
      cameraInputRef.current?.click();
    }
  };

  const captureCameraFrame = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `camera-scan-${Date.now()}.jpg`, { type: 'image/jpeg' });
        stopCamera();
        handleFile(file);
      }
    }, 'image/jpeg', 0.9);
  };

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
    stopCamera();
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  // Generate synthetic sample photo on canvas
  const handleSelectSample = (sample: typeof QUICK_SAMPLES[0]) => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 400, 400);
    grad.addColorStop(0, '#f8fafc');
    grad.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 400, 400);

    // Decorative circle
    ctx.beginPath();
    ctx.arc(200, 180, 100, 0, Math.PI * 2);
    ctx.fillStyle = sample.color + '22';
    ctx.fill();

    // Draw Emoji icon
    ctx.font = '96px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(sample.emoji, 200, 180);

    // Label text
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#1e293b';
    ctx.fillText(sample.label, 200, 310);

    ctx.font = '14px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('EcoSort AI Demo Sample', 200, 340);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `${sample.label.toLowerCase().replace(/\s+/g, '-')}.jpg`, {
          type: 'image/jpeg',
        });
        handleFile(file);
      }
    }, 'image/jpeg', 0.95);
  };

  if (preview) {
    return (
      <div className="relative rounded-3xl overflow-hidden border-2 border-eco-green-300 dark:border-eco-green-700 shadow-lg bg-black/5 dark:bg-black/20">
        <img src={preview} alt="Waste item to classify" className="w-full max-h-96 object-contain mx-auto" />
        <button
          onClick={handleClear}
          disabled={disabled}
          className="absolute top-4 right-4 p-2 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 backdrop-blur-md rounded-full shadow-md text-gray-700 dark:text-gray-300 hover:text-red-600 disabled:opacity-50 transition-colors"
          aria-label="Remove image"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Live camera stream view */}
      {isCameraActive ? (
        <div className="relative rounded-3xl overflow-hidden bg-gray-900 border-2 border-eco-green-500 shadow-xl">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-80 object-cover"
          />

          {/* Scanner viewfinder overlay */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-56 h-56 border-2 border-eco-green-400/80 rounded-2xl relative animate-pulse">
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-eco-green-400" />
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-eco-green-400" />
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-eco-green-400" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-eco-green-400" />
              <span className="absolute bottom-2 inset-x-0 text-center text-xs text-eco-green-300 font-medium">
                Aim at waste item
              </span>
            </div>
          </div>

          {/* Live camera controls */}
          <div className="absolute bottom-4 inset-x-0 flex justify-center items-center gap-4 px-4">
            <button
              type="button"
              onClick={stopCamera}
              className="p-3 bg-gray-800/80 hover:bg-gray-800 text-white rounded-full backdrop-blur-md transition-colors"
              title="Close camera"
            >
              <VideoOff className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={captureCameraFrame}
              className="px-6 py-3 bg-eco-green-600 hover:bg-eco-green-500 active:scale-95 text-white font-bold rounded-full shadow-lg flex items-center gap-2 transition-transform"
            >
              <Camera className="w-5 h-5" /> Snap &amp; Classify
            </button>
          </div>
        </div>
      ) : (
        /* Drag & Drop Upload Container */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed p-10 sm:p-12 cursor-pointer transition-all ${
            dragging
              ? 'border-eco-green-500 bg-eco-green-50 dark:bg-eco-green-950/20 scale-[0.99]'
              : 'border-eco-green-300 dark:border-eco-green-700/80 hover:border-eco-green-400 hover:bg-eco-green-50/40 dark:hover:bg-eco-green-950/10'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="w-16 h-16 rounded-2xl bg-eco-green-100 dark:bg-eco-green-900/40 flex items-center justify-center text-eco-green-600 dark:text-eco-green-400 shadow-inner">
            <Upload className="w-8 h-8" />
          </div>

          <div className="text-center space-y-1">
            <p className="font-bold text-gray-800 dark:text-gray-100 text-base sm:text-lg">
              Drop waste photo here or browse
            </p>
            <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500">
              Supports JPEG, PNG, WEBP up to 10 MB
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={startCamera}
              disabled={disabled}
              className="flex items-center gap-2 px-5 py-2.5 bg-eco-green-600 hover:bg-eco-green-700 active:scale-95 text-white text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow"
            >
              <Video className="w-4 h-4" /> Live Webcam
            </button>
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              disabled={disabled}
              className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Camera className="w-4 h-4" /> Device Camera
            </button>
          </div>

          {cameraError && (
            <p className="text-xs text-red-500 dark:text-red-400 text-center">{cameraError}</p>
          )}

          {/* Hidden inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            disabled={disabled}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            disabled={disabled}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
        </div>
      )}

      {/* Quick Test Samples */}
      <div className="p-4 rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/80 shadow-sm space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-eco-green-600 dark:text-eco-green-400" />
          <span>Quick 1-Click Test Samples</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {QUICK_SAMPLES.map((sample) => (
            <button
              key={sample.label}
              type="button"
              onClick={() => handleSelectSample(sample)}
              disabled={disabled}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-eco-green-50 dark:hover:bg-eco-green-950/40 border border-gray-200/60 dark:border-gray-600/60 text-xs font-medium text-gray-700 dark:text-gray-200 transition-all hover:border-eco-green-300 active:scale-95"
            >
              <span className="text-base">{sample.emoji}</span>
              <span className="truncate">{sample.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
