import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, Sparkles, X, CheckCircle } from 'lucide-react';
import { API_URL } from '../config';

export default function UploadZone({ onScanSuccess }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanError, setScanError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const fileInputRef = useRef(null);

  const triggerFileInput = () => {
    fileInputRef.current.click();
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
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = async (file) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setScanError('Unsupported file type. Please upload a JPG, PNG, or PDF file.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setScanError('File is too large. Maximum size allowed is 5MB.');
      return;
    }

    setScanError(null);
    setIsScanning(true);
    setScanProgress(15);

    // Simulate progressive scanning steps for UI premium feel
    const progressInterval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 85) {
          clearInterval(progressInterval);
          return 85;
        }
        return prev + 10;
      });
    }, 300);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_URL}/api/transactions/scan`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Server failed to process document.');
      }

      const newTransaction = await response.json();
      setScanProgress(100);
      
      setTimeout(() => {
        setIsScanning(false);
        setSuccessMsg(`Successfully scanned transaction of ₹${newTransaction.amount} from ${newTransaction.merchantName}!`);
        onScanSuccess(newTransaction);
        setTimeout(() => setSuccessMsg(null), 4000);
      }, 500);

    } catch (err) {
      clearInterval(progressInterval);
      console.error(err);
      setScanProgress(0);
      setIsScanning(false);
      setScanError(err.message || 'Scanning failed. Make sure server is running and Gemini API key is configured.');
    }
  };

  return (
    <div className="w-full">
      {/* Upload Zone Card */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        className={`border-2 border-dashed rounded-[12px] p-8 text-center cursor-pointer transition-all duration-300 relative group overflow-hidden ${
          isDragging
            ? 'border-accent bg-accent/5'
            : 'border-outline-variant hover:border-accent hover:bg-surface'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".jpg,.jpeg,.png,.pdf"
          className="hidden"
        />

        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl -mr-6 -mt-6 group-hover:bg-accent/10 transition-all pointer-events-none"></div>

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-surface group-hover:bg-white flex items-center justify-center text-primary border border-outline-variant transition-colors group-hover:shadow-sm">
            <Upload className="w-6 h-6 text-accent group-hover:scale-110 transition-transform duration-200" />
          </div>
          <div>
            <p className="font-title-lg text-primary text-[18px] font-semibold">
              Scan Payment Screenshot
            </p>
            <p className="font-body-md text-on-surface-variant text-[14px] mt-1">
              Drag & drop or click to upload UPI screenshot or PDF statement
            </p>
            <p className="font-label-md text-on-surface-variant text-[11px] text-gray-400 mt-2">
              Supports JPEG, PNG, PDF up to 5MB
            </p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {scanError && (
        <div className="mt-4 p-4 bg-error-container border border-red-200 rounded-[12px] flex items-start space-x-3 text-error">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-bold text-[14px]">Scan Error</p>
            <p className="text-[13px] mt-0.5">{scanError}</p>
          </div>
          <button onClick={() => setScanError(null)} className="text-error hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="mt-4 p-4 bg-[#D1FAE5] border border-green-200 rounded-[12px] flex items-start space-x-3 text-secondary">
          <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-[#10B981]" />
          <div className="flex-1">
            <p className="font-bold text-[14px] text-[#006c49]">Scan Success</p>
            <p className="text-[13px] mt-0.5 text-[#006c49] font-medium">{successMsg}</p>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-[#006c49] hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Fullscreen Laser Scanning Overlay */}
      {isScanning && (
        <div className="fixed inset-0 bg-primary/90 backdrop-blur-md z-50 flex flex-col items-center justify-center select-none animate-fadeIn">
          {/* Top Info */}
          <div className="absolute top-6 left-6 right-6 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent animate-pulse" />
              <span className="font-semibold text-lg">PayTracker AI Scanner</span>
            </div>
            <button
              onClick={() => {
                setIsScanning(false);
                setScanProgress(0);
              }}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Viewfinder Window */}
          <div className="relative w-[85%] max-w-[380px] aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            {/* Viewfinder Corners */}
            <div className="viewfinder-corner corner-tl"></div>
            <div className="viewfinder-corner corner-tr"></div>
            <div className="viewfinder-corner corner-bl"></div>
            <div className="viewfinder-corner corner-br"></div>

            {/* Glowing Laser line sliding down */}
            <div className="absolute left-0 right-0 h-[2px] bg-accent/80 shadow-[0_0_15px_#10B981] animate-scan z-20 flex justify-center">
              <div className="w-3/4 h-full bg-white shadow-[0_0_8px_#ffffff]"></div>
            </div>

            {/* Faux Document Preview representing scan activity */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex flex-col justify-between p-6 opacity-80">
              <div className="space-y-4 pt-12 opacity-60">
                <div className="h-4 bg-slate-700 rounded w-1/3"></div>
                <div className="h-6 bg-slate-700 rounded w-2/3"></div>
                <div className="h-4 bg-slate-700 rounded w-1/2"></div>
              </div>
              <div className="space-y-3 pb-12 opacity-60">
                <div className="h-8 bg-slate-700 rounded w-full"></div>
                <div className="h-4 bg-slate-700 rounded w-3/4"></div>
              </div>
            </div>
          </div>

          {/* Status Display Card */}
          <div className="mt-8 bg-white text-primary rounded-2xl p-5 w-[85%] max-w-[380px] shadow-2xl flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent animate-spin" />
                <span className="font-semibold text-[15px]">Extracting payment details...</span>
              </div>
              <span className="font-bold text-accent">{scanProgress}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-accent h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${scanProgress}%` }}
              ></div>
            </div>
            <p className="text-[12px] text-on-surface-variant text-center mt-1">
              Google Gemini is reading the receipt & parsing data.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
