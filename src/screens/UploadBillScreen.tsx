import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Plus,
  Camera,
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Image as ImageIcon,
  PenLine,
  Trash2,
} from 'lucide-react';
import { useBankers, TransactionItem } from '../context/BankersContext';
import { StatusBar } from '../components/MobileChrome';
import { runTesseractOnFiles } from '../lib/ocrEngine';

export const UploadBillScreen: React.FC = () => {
  const { setCurrentScreen, setPendingTransactions } = useBankers();

  const [viewMode, setViewMode] = useState<'gallery' | 'camera'>('gallery');
  const [isMultiSelect, setIsMultiSelect] = useState<boolean>(false);
  const [uploadedFiles, setUploadedFiles] = useState<
    { id: string; file: File; previewUrl: string }[]
  >([]);
  const [selectedUploadIds, setSelectedUploadIds] = useState<string[]>([]);

  const [isScanningOcr, setIsScanningOcr] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrStatus, setOcrStatus] = useState('Initializing OCR...');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Start/Stop live camera when switching to Camera mode
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (viewMode === 'camera') {
      setCameraError(null);
      navigator.mediaDevices
        ?.getUserMedia({ video: { facingMode: 'environment' } })
        .then((mediaStream) => {
          stream = mediaStream;
          setCameraActive(true);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        })
        .catch(() => {
          setCameraActive(false);
          setCameraError(
            'Camera cannot be accessed. Please enable camera permissions or upload a photo from the Gallery.'
          );
        });
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
      setCameraActive(false);
    };
  }, [viewMode]);

  const handleFileUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newUploads = files.map((file, idx) => ({
      id: `up_${Date.now()}_${idx}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setUploadedFiles((prev) => [...newUploads, ...prev]);
    const newIds = newUploads.map((u) => u.id);

    if (isMultiSelect || files.length > 1) {
      if (files.length > 1) setIsMultiSelect(true);
      setSelectedUploadIds((prev) => [...newIds, ...prev]);
    } else {
      setSelectedUploadIds([newIds[0]]);
    }

    // Reset input so selecting the same file again still triggers onChange
    e.target.value = '';
  };

  const toggleUploadSelection = (uploadId: string) => {
    if (isMultiSelect) {
      setSelectedUploadIds((prev) =>
        prev.includes(uploadId)
          ? prev.filter((id) => id !== uploadId)
          : [...prev, uploadId]
      );
    } else {
      setSelectedUploadIds((prev) =>
        prev.includes(uploadId) ? [] : [uploadId]
      );
    }
  };

  const removeUploadedFile = (uploadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadedFiles((prev) => prev.filter((u) => u.id !== uploadId));
    setSelectedUploadIds((prev) => prev.filter((id) => id !== uploadId));
  };

  const handleProcessSelected = async () => {
    const chosenUploads = uploadedFiles
      .filter((u) => selectedUploadIds.includes(u.id))
      .map((u) => u.file);

    if (chosenUploads.length === 0) return;

    setIsScanningOcr(true);
    setOcrProgress(10);
    setOcrStatus('Scanning image with OCR...');

    try {
      const ocrItems = await runTesseractOnFiles(
        chosenUploads,
        (prog, status) => {
          setOcrProgress(prog);
          setOcrStatus(status);
        }
      );
      setPendingTransactions(ocrItems);
      setCurrentScreen('edit-transactions');
    } finally {
      setIsScanningOcr(false);
    }
  };

  const handleManualInsert = () => {
    setPendingTransactions([]);
    setCurrentScreen('edit-transactions');
  };

  const handleCaptureCameraFrame = async () => {
    if (!videoRef.current || !cameraActive) {
      fileInputRef.current?.click();
      return;
    }

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const capturedFile = new File([blob], `camera_bill_${Date.now()}.png`, {
        type: 'image/png',
      });

      setIsScanningOcr(true);
      setOcrProgress(15);
      setOcrStatus('Scanning captured bill via OCR...');

      try {
        const ocrItems = await runTesseractOnFiles(
          [capturedFile],
          (prog, status) => {
            setOcrProgress(prog);
            setOcrStatus(status);
          }
        );
        setPendingTransactions(ocrItems);
        setCurrentScreen('edit-transactions');
      } finally {
        setIsScanningOcr(false);
      }
    }, 'image/png');
  };

  // CAMERA MODE ("Scan Your Bill.")
  if (viewMode === 'camera') {
    return (
      <div className="min-h-full bg-[#121815] text-white flex flex-col justify-between relative">
        <StatusBar darkText={false} />

        {/* Camera Top Header */}
        <div className="px-6 pt-2 pb-3 flex items-center justify-between z-20">
          <button
            type="button"
            onClick={() => setViewMode('gallery')}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            aria-label="Back to Gallery"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <h1 className="text-[13px] font-semibold text-white/90">
            Scan Your Bill.
          </h1>

          <div className="w-8" />
        </div>

        {/* Live Camera Viewfinder Area */}
        <div className="flex-1 px-6 py-4 flex flex-col items-center justify-center relative overflow-hidden">
          {cameraActive ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="text-center px-6 z-10">
              <Camera className="w-10 h-10 text-slate-500 mx-auto mb-2" />
              <p className="text-[12px] text-slate-300 leading-relaxed">
                {cameraError || 'Connecting to camera...'}
              </p>
            </div>
          )}

          {/* Clean Scan Frame Guide Corners */}
          <div className="relative z-10 w-full max-w-[270px] h-[360px] pointer-events-none">
            <div className="absolute top-0 left-0 w-7 h-7 border-t-2 border-l-2 border-[#4ADE80] rounded-tl-md" />
            <div className="absolute top-0 right-0 w-7 h-7 border-t-2 border-r-2 border-[#4ADE80] rounded-tr-md" />
            <div className="absolute bottom-0 left-0 w-7 h-7 border-b-2 border-l-2 border-[#4ADE80] rounded-bl-md" />
            <div className="absolute bottom-0 right-0 w-7 h-7 border-b-2 border-r-2 border-[#4ADE80] rounded-br-md" />
          </div>
        </div>

        {/* Bottom Shutter Button */}
        <div className="py-6 flex flex-col items-center justify-center gap-2 z-20 bg-gradient-to-t from-black/80 to-transparent">
          <button
            type="button"
            disabled={isScanningOcr}
            onClick={handleCaptureCameraFrame}
            className="w-14 h-14 rounded-full bg-[#689F77] hover:bg-[#5B8E69] active:scale-90 border-4 border-slate-300/70 shadow-xl transition-all flex items-center justify-center"
            aria-label="Capture Bill"
          >
            {isScanningOcr && (
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            )}
          </button>
          <span className="text-[10.5px] text-slate-300">
            {cameraActive
              ? 'Point the camera at your receipt and tap the green button'
              : 'Tap the button to choose a receipt photo'}
          </span>
        </div>
      </div>
    );
  }

  // GALLERY MODE ("Upload Single" & "Upload Multiple" - Starts Empty!)
  return (
    <div className="min-h-full bg-white flex flex-col justify-between text-slate-800 relative">
      <div>
        <StatusBar darkText={true} />

        {/* Hidden File Input for Real Image Uploads */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileUploadChange}
          className="hidden"
        />

        {/* Top Header */}
        <div className="px-6 pt-2 pb-2 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrentScreen('home')}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>

          <span className="text-[11px] font-medium text-slate-400">
            Upload Your Screenshots.
          </span>

          <button
            type="button"
            onClick={() => setViewMode('camera')}
            className="w-7 h-7 rounded-full bg-[#EBF1E8] hover:bg-[#DCE6D7] flex items-center justify-center text-[#5E7858] transition-colors"
            title="Open Camera Scanner"
            aria-label="Open Camera Scanner"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Gallery Title & Select / Cancel Multi-Select Button */}
        <div className="px-6 pt-2 pb-3 flex items-center justify-between">
          <h1 className="text-[15px] font-bold text-slate-800">Gallery</h1>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleManualInsert}
              className="px-2.5 py-1 rounded-full bg-[#EBF1E8] hover:bg-[#DCE6D7] text-[#4E6648] text-[10px] font-semibold flex items-center gap-1 transition-colors"
              title="Insert transaction manually without OCR"
            >
              <PenLine className="w-3 h-3" />
              <span>Manual Input</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('camera')}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-semibold flex items-center gap-1 transition-colors"
            >
              <Camera className="w-3 h-3" />
              <span>Camera</span>
            </button>

            {uploadedFiles.length > 0 && (
              <button
                type="button"
                onClick={() => setIsMultiSelect(!isMultiSelect)}
                className={`px-3 py-1 rounded-full text-[10px] font-semibold flex items-center gap-1 transition-colors ${
                  isMultiSelect
                    ? 'bg-[#689F77] text-white'
                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                }`}
              >
                <span>{isMultiSelect ? 'Cancel' : 'Select'}</span>
              </button>
            )}
          </div>
        </div>

        {/* 2-Column Gallery Grid (Starts with ONLY the + Upload tile!) */}
        <div className="px-6 pb-24 grid grid-cols-2 gap-3">
          {/* Tile 1: Add / Upload Real Image File from Device */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="h-[160px] rounded-2xl bg-[#EEF3EC] hover:bg-[#E3ECE0] border border-[#DCE6D8] flex flex-col items-center justify-center gap-2 transition-all group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-[#689F77] group-hover:scale-105 text-white flex items-center justify-center shadow-sm transition-transform">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[11px] font-semibold text-[#4D6647]">
              Upload File / Photo
            </span>
            <span className="text-[9.5px] text-slate-400 px-3 text-center">
              Choose a receipt photo or bank screenshot
            </span>
          </button>

          {/* User-Uploaded Image Files */}
          {uploadedFiles.map((up) => {
            const isSelected = selectedUploadIds.includes(up.id);
            return (
              <div
                key={up.id}
                onClick={() => toggleUploadSelection(up.id)}
                className={`relative h-[160px] rounded-2xl overflow-hidden border-2 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-[#5E7858] ring-2 ring-[#738F6D]/30'
                    : 'border-slate-200/80'
                }`}
              >
                <img
                  src={up.previewUrl}
                  alt={up.file.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2.5 text-white">
                  <div className="text-[10px] font-bold truncate flex items-center gap-1">
                    <ImageIcon className="w-3 h-3 text-[#4ADE80] shrink-0" />
                    <span className="truncate">{up.file.name}</span>
                  </div>
                </div>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={(e) => removeUploadedFile(up.id, e)}
                  className="absolute top-2.5 left-2.5 w-6 h-6 rounded-full bg-black/50 hover:bg-rose-600 text-white flex items-center justify-center transition-colors"
                  title="Remove photo"
                >
                  <Trash2 className="w-3 h-3" />
                </button>

                {/* Selection checkmark */}
                <div
                  className={`absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center border ${
                    isSelected
                      ? 'bg-[#5E7858] border-[#5E7858] text-white'
                      : 'bg-white/80 border-slate-300'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Floating Proceed Arrow Button (Appears once user uploads & selects an image) */}
      {selectedUploadIds.length > 0 && (
        <div className="sticky bottom-6 inset-x-0 flex justify-center z-30 pointer-events-none">
          <button
            type="button"
            disabled={isScanningOcr}
            onClick={handleProcessSelected}
            className="pointer-events-auto h-11 px-8 rounded-2xl bg-[#689F77] hover:bg-[#578965] active:scale-95 text-white font-semibold text-[12.5px] shadow-xl flex items-center gap-2 transition-all"
          >
            {isScanningOcr ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{ocrStatus}</span>
              </>
            ) : (
              <>
                <span>Process OCR ({selectedUploadIds.length})</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>
        </div>
      )}

      {/* Fullscreen OCR Loading Overlay */}
      {isScanningOcr && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-6">
          <div className="w-full max-w-[300px] bg-white rounded-3xl p-6 text-center shadow-2xl">
            <Loader2 className="w-9 h-9 text-[#5E7858] animate-spin mx-auto mb-3" />
            <h3 className="text-[14px] font-bold text-slate-800">
              Processing with OCR
            </h3>
            <p className="text-[11.5px] text-slate-500 mt-1">{ocrStatus}</p>
            <div className="mt-4 w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#689F77] transition-all duration-300"
                style={{ width: `${ocrProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
