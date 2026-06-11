import React from 'react';
import { useOutletContext } from 'react-router-dom';
import UploadZone from '../components/UploadZone';

export default function Scan() {
  const { handleScanSuccess, setIsAddOpen } = useOutletContext();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[26px] md:text-[32px] font-bold text-primary dark:text-white">Receipt Scanner</h2>
        <p className="text-[14px] text-on-surface-variant dark:text-slate-400 mt-1">
          Upload files to extract transaction details automatically.
        </p>
      </div>
      <div className="max-w-2xl mx-auto py-8 space-y-6">
        <UploadZone onScanSuccess={handleScanSuccess} />
        <div className="text-center">
          <span className="text-[13px] text-on-surface-variant dark:text-slate-400 font-medium">Don't have a receipt? </span>
          <button
            onClick={() => setIsAddOpen(true)}
            className="text-[13px] font-bold text-[#006c49] dark:text-[#6ffbbe] hover:underline"
          >
            Enter details manually
          </button>
        </div>
      </div>
    </div>
  );
}
