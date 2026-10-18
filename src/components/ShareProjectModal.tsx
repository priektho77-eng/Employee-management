import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Download,
  FileSpreadsheet,
  Globe,
  Database,
  Code2,
  CheckCircle,
} from 'lucide-react';

interface ShareProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  sharedUrl: string;
}

export const ShareProjectModal: React.FC<ShareProjectModalProps> = ({
  isOpen,
  onClose,
  sharedUrl,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(sharedUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadFile = (fileName: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              ចែករំលែកគម្រោង (Share Project Link)
            </h3>
            <p className="text-xs text-slate-500">
              តំណភ្ជាប់សម្រាប់បើកប្រើប្រាស់កម្មវិធី និងឯកសារ Text Files
            </p>
          </div>
        </div>

        {/* Project Link Box */}
        <div className="mt-5 space-y-2">
          <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-emerald-600" />
            <span>Shared Web App Link:</span>
          </label>
          <div className="flex items-center space-x-2">
            <div className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 break-all select-all">
              {sharedUrl}
            </div>
            <button
              onClick={handleCopyLink}
              className="flex items-center space-x-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition shrink-0 transform active:scale-95"
            >
              {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? 'បានចម្លង!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>

        {/* Open in new tab */}
        <div className="mt-3 flex justify-end">
          <a
            href={sharedUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center space-x-1 text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
          >
            <span>បើកមើលក្នុងផ្ទាំងថ្មី (Open in New Tab)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Downloadable text files requested by the user */}
        <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            ឯកសារ Text Files សម្រាប់ទាញយក (Requested Text Files):
          </h4>

          <div className="grid grid-cols-1 gap-2">
            {/* File 1: GoogleAppsScript_Code.txt */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center space-x-2.5">
                <Code2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-900 font-mono">GoogleAppsScript_Code.txt</p>
                  <p className="text-[11px] text-slate-500">កូដ Apps Script API ទាំងមូលសម្រាប់ដាក់ក្នុង Google Sheet</p>
                </div>
              </div>
              <a
                href="/GoogleAppsScript_Code.txt"
                download="GoogleAppsScript_Code.txt"
                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 flex items-center space-x-1 transition shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </a>
            </div>

            {/* File 2: SETUP_GUIDE_KH_EN.txt */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center space-x-2.5">
                <FileSpreadsheet className="w-4 h-4 text-teal-600 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-900 font-mono">SETUP_GUIDE_KH_EN.txt</p>
                  <p className="text-[11px] text-slate-500">សៀវភៅណែនាំដំឡើងជាភាសាខ្មែរ និងអង់គ្លេសលម្អិត</p>
                </div>
              </div>
              <a
                href="/SETUP_GUIDE_KH_EN.txt"
                download="SETUP_GUIDE_KH_EN.txt"
                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 flex items-center space-x-1 transition shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </a>
            </div>
          </div>
        </div>

        {/* Modal footer */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
          >
            បិទ (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
