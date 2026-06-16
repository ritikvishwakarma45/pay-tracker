import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, Sparkles, X, CheckCircle, Loader2 } from 'lucide-react';
import { apiService } from '../services/apiService';

export default function UploadZone({ onScanSuccess }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [queue, setQueue] = useState([]);
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
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const clearQueueItem = (id) => {
    setQueue(prev => prev.filter(item => item.id !== id));
  };

  const processFiles = async (files) => {
    // Validate file types and sizes
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    const validFiles = [];
    const errors = [];

    files.forEach(file => {
      if (!validTypes.includes(file.type)) {
        errors.push(`${file.name}: Unsupported file type.`);
      } else if (file.size > 5 * 1024 * 1024) {
        errors.push(`${file.name}: Too large (max 5MB).`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      setScanError(errors.join(' '));
    } else {
      setScanError(null);
    }

    if (validFiles.length === 0) return;

    // Add to scanning queue
    const newItems = validFiles.map((file, idx) => ({
      id: `${Date.now()}-${idx}`,
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      status: 'scanning',
      progress: 15,
      error: null,
      amount: null,
      merchant: null
    }));

    setQueue(prev => [...newItems, ...prev]);
    setIsScanning(true);

    // Simulate progress increments for premium feel
    const progressInterval = setInterval(() => {
      setQueue(prev =>
        prev.map(item => {
          if (item.status === 'scanning' && item.progress < 85) {
            return { ...item, progress: item.progress + Math.floor(Math.random() * 10) + 5 };
          }
          return item;
        })
      );
    }, 300);

    try {
      const results = await apiService.scanReceiptBulk(validFiles);
      clearInterval(progressInterval);

      setQueue(prev =>
        prev.map(item => {
          const resObj = results.find(r => r.fileName === item.name);
          if (resObj) {
            if (resObj.success) {
              onScanSuccess(resObj.transaction);
              return {
                ...item,
                status: 'success',
                progress: 100,
                amount: resObj.transaction.amount,
                merchant: resObj.transaction.merchantName
              };
            } else {
              return {
                ...item,
                status: 'error',
                progress: 0,
                error: resObj.error || 'Parsing failed.'
              };
            }
          }
          return item;
        })
      );

      const successCount = results.filter(r => r.success).length;
      if (successCount > 0) {
        setSuccessMsg(`Successfully processed ${successCount} statement(s) / receipt(s)!`);
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (err) {
      clearInterval(progressInterval);
      console.error(err);
      setQueue(prev =>
        prev.map(item =>
          item.status === 'scanning'
            ? { ...item, status: 'error', progress: 0, error: err.message || 'Scanning failed.' }
            : item
        )
      );
      setScanError(err.message || 'Bulk scanning failed. Ensure backend and Groq configurations are active.');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Upload Zone Card */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        className={`border-2 border-dashed rounded-[12px] p-8 text-center cursor-pointer transition-all duration-300 relative group overflow-hidden ${
          isDragging
            ? 'border-accent bg-accent/5'
            : 'border-outline-variant hover:border-accent hover:bg-surface dark:hover:bg-slate-800/50'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".jpg,.jpeg,.png,.pdf"
          multiple
          className="hidden"
        />

        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl -mr-6 -mt-6 group-hover:bg-accent/10 transition-all pointer-events-none"></div>

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-surface dark:bg-slate-800 group-hover:bg-white dark:group-hover:bg-slate-700 flex items-center justify-center text-primary dark:text-white border border-outline-variant transition-colors group-hover:shadow-sm">
            {isScanning ? (
              <Loader2 className="w-6 h-6 text-accent animate-spin" />
            ) : (
              <Upload className="w-6 h-6 text-accent group-hover:scale-110 transition-transform duration-200" />
            )}
          </div>
          <div>
            <p className="font-title-lg text-primary dark:text-white text-[18px] font-semibold">
              Scan Receipts in Bulk
            </p>
            <p className="font-body-md text-on-surface-variant dark:text-slate-400 text-[14px] mt-1">
              Drag & drop or click to upload one or more UPI screenshots or PDF statements
            </p>
            <p className="font-label-md text-on-surface-variant dark:text-slate-500 text-[11px] mt-2">
              Supports JPG, PNG, PDF up to 5MB per file (max 10 files)
            </p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {scanError && (
        <div className="p-4 bg-error-container border border-red-200 dark:border-red-900 rounded-[12px] flex items-start space-x-3 text-error dark:text-red-400">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-bold text-[14px]">Scan Alert</p>
            <p className="text-[13px] mt-0.5">{scanError}</p>
          </div>
          <button onClick={() => setScanError(null)} className="text-error hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-[#D1FAE5] border border-green-200 dark:border-emerald-900 dark:bg-emerald-950/30 rounded-[12px] flex items-start space-x-3 text-secondary dark:text-emerald-400">
          <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-[#10B981]" />
          <div className="flex-1">
            <p className="font-bold text-[14px] text-[#006c49] dark:text-emerald-400">Scan Success</p>
            <p className="text-[13px] mt-0.5 text-[#006c49] dark:text-emerald-400 font-medium">{successMsg}</p>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-[#006c49] hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Modern Scan Queue Dashboard */}
      {queue.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-[12px] border border-outline-variant dark:border-slate-800 overflow-hidden transition-colors">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent animate-pulse" />
              <span className="font-bold text-[15px] text-primary dark:text-white">AI Scanner Queue ({queue.length})</span>
            </div>
            <button 
              onClick={() => setQueue([])} 
              className="text-[12px] font-bold text-slate-500 hover:text-red-500 transition-colors"
            >
              Clear All
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[360px] overflow-y-auto pr-1">
            {queue.map((item) => (
              <div key={item.id} className="p-4 flex items-center justify-between gap-4 relative group hover:bg-slate-50/20">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-500 flex-shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[13px] font-bold text-primary dark:text-white truncate block">{item.name}</span>
                      <span className="text-[11px] text-slate-400 font-medium ml-2">{item.size}</span>
                    </div>

                    {/* Progress slider bar */}
                    {item.status === 'scanning' && (
                      <div className="space-y-1">
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-accent h-full rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${item.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] text-accent font-semibold animate-pulse">Reading file & extracting data...</span>
                      </div>
                    )}

                    {item.status === 'success' && (
                      <span className="text-[12px] text-secondary dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Scanned ₹{item.amount} from {item.merchant}
                      </span>
                    )}

                    {item.status === 'error' && (
                      <span className="text-[11px] text-red-500 font-semibold flex items-center gap-1 leading-snug">
                        <AlertCircle className="w-3 h-3 flex-shrink-0" />
                        {item.error}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {item.status === 'success' && (
                    <span className="p-1 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-[#10B981]">
                      <CheckCircle className="w-4 h-4" />
                    </span>
                  )}
                  {item.status === 'error' && (
                    <span className="p-1 rounded-full bg-red-50 dark:bg-red-950/20 text-red-500">
                      <AlertCircle className="w-4 h-4" />
                    </span>
                  )}
                  {item.status === 'scanning' && (
                    <Loader2 className="w-4 h-4 text-accent animate-spin" />
                  )}
                  <button 
                    onClick={() => clearQueueItem(item.id)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
