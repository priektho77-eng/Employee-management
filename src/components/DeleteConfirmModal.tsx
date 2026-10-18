import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Department, Employee } from '../types';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  targetType: 'employee' | 'department';
  targetEmployee?: Employee | null;
  targetDepartment?: Department | null;
  assignedEmployeesCount?: number;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  targetType,
  targetEmployee,
  targetDepartment,
  assignedEmployeesCount = 0,
}) => {
  if (!isOpen) return null;

  const isDepartment = targetType === 'department';
  const title = isDepartment
    ? `លុបផ្នែក "${targetDepartment?.DepartmentName}"?`
    : `លុបបុគ្គលិក "${targetEmployee?.Name}"?`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start space-x-3">
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            <p className="text-xs text-slate-500 mt-1">
              {isDepartment
                ? `DepartmentID: ${targetDepartment?.DepartmentID}`
                : `EmployeeID: ${targetEmployee?.EmployeeID}`}
            </p>
          </div>
        </div>

        {/* Warning if department has employees */}
        {isDepartment && assignedEmployeesCount > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
            <strong className="block font-semibold mb-1">⚠️ ការដាស់តឿន (Warning):</strong>
            មានបុគ្គលិកចំនួន <strong>{assignedEmployeesCount} នាក់</strong> កំពុងបម្រើការងារក្នុងផ្នែកនេះ។
            ការលុបនឹងធ្វើឱ្យបុគ្គលិកទាំងនោះបាត់បង់ផ្នែក ឬត្រូវកំណត់ផ្នែកថ្មីឡើងវិញ។
          </div>
        )}

        <p className="text-xs text-slate-600 mt-4">
          តើអ្នកប្រាកដថាចង់លុបទិន្នន័យនេះចេញពី Google Sheets មែនទេ?
          សកម្មភាពនេះមិនអាចត្រឡប់វិញបានឡើយ។
        </p>

        <div className="mt-6 flex items-center justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
          >
            បោះបង់ (Cancel)
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex items-center space-x-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-sm shadow-rose-700/20 transition transform active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
            <span>យល់ព្រមលុប (Confirm Delete)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
