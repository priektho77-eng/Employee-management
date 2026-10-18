import React, { useState, useEffect } from 'react';
import { X, Building2, Save, AlertCircle, Hash, FileText } from 'lucide-react';
import { Department } from '../types';

interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (department: Department) => void;
  initialData?: Department | null;
  existingDepartments: Department[];
}

export const DepartmentModal: React.FC<DepartmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  existingDepartments,
}) => {
  const isEditing = Boolean(initialData);

  const [departmentId, setDepartmentId] = useState('');
  const [departmentName, setDepartmentName] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  // Helper to suggest next Department ID
  const generateNextId = () => {
    let maxNum = 0;
    existingDepartments.forEach((dept) => {
      const match = dept.DepartmentID.match(/\d+/);
      if (match) {
        const num = parseInt(match[0], 10);
        if (num > maxNum) maxNum = num;
      }
    });
    const nextNum = maxNum + 1;
    return `DEP-${nextNum.toString().padStart(3, '0')}`;
  };

  useEffect(() => {
    if (initialData) {
      setDepartmentId(initialData.DepartmentID);
      setDepartmentName(initialData.DepartmentName);
      setNote(initialData.Note || '');
    } else {
      setDepartmentId(generateNextId());
      setDepartmentName('');
      setNote('');
    }
    setError('');
  }, [initialData, isOpen, existingDepartments]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = departmentId.trim();
    const cleanName = departmentName.trim();

    if (!cleanId) {
      setError('DepartmentID is required (សូមបញ្ចូល DepartmentID)');
      return;
    }

    if (!cleanName) {
      setError('DepartmentName is required (សូមបញ្ចូលឈ្មោះផ្នែក)');
      return;
    }

    // Check duplicate ID when creating new
    if (!isEditing) {
      const exists = existingDepartments.some(
        (dept) => dept.DepartmentID.toLowerCase() === cleanId.toLowerCase()
      );
      if (exists) {
        setError(`DepartmentID "${cleanId}" already exists. Please choose another ID.`);
        return;
      }
    }

    onSave({
      DepartmentID: cleanId,
      DepartmentName: cleanName,
      Note: note.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {isEditing ? 'កែប្រែផ្នែក (Edit Department)' : 'បង្កើតផ្នែកថ្មី (New Department)'}
              </h3>
              <p className="text-xs text-slate-500">
                តារាង Google Sheets: <code>Department</code>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Department ID */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Hash className="w-3.5 h-3.5 text-slate-400" />
              <span>DepartmentID *</span>
            </label>
            <input
              type="text"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              disabled={isEditing}
              placeholder="e.g. DEP-001"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:opacity-60 disabled:bg-slate-100"
            />
          </div>

          {/* Department Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>DepartmentName (ឈ្មោះផ្នែក) *</span>
            </label>
            <input
              type="text"
              value={departmentName}
              onChange={(e) => setDepartmentName(e.target.value)}
              placeholder="e.g. Information Technology"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Note (ចំណាំ / ការពិពណ៌នា)</span>
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. ទទួលខុសត្រូវលើប្រព័ន្ធបច្ចេកវិទ្យា និង Network..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
            >
              Cancel (បោះបង់)
            </button>
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm shadow-emerald-700/20 transition transform active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'រក្សាទុក (Update)' : 'បង្កើតថ្មី (Save)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
