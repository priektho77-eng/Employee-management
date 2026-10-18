import React, { useState, useEffect } from 'react';
import { X, UserPlus, Save, AlertCircle, Building2, Phone, MapPin, User, Hash } from 'lucide-react';
import { Department, Employee } from '../types';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employee: Employee) => void;
  initialData?: Employee | null;
  departments: Department[];
  existingEmployees: Employee[];
}

export const EmployeeModal: React.FC<EmployeeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  departments,
  existingEmployees,
}) => {
  const isEditing = Boolean(initialData);

  const [employeeId, setEmployeeId] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState('Male');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [error, setError] = useState('');

  // Helper to suggest next Employee ID
  const generateNextId = () => {
    let maxNum = 1000;
    existingEmployees.forEach((emp) => {
      const match = emp.EmployeeID.match(/\d+/);
      if (match) {
        const num = parseInt(match[0], 10);
        if (num > maxNum) maxNum = num;
      }
    });
    return `EMP-${maxNum + 1}`;
  };

  useEffect(() => {
    if (initialData) {
      setEmployeeId(initialData.EmployeeID);
      setName(initialData.Name);
      setGender(initialData.Gender || 'Male');
      setPhone(initialData.Phone || '');
      setAddress(initialData.Address || '');
      setDepartmentId(initialData.DepartmentID || (departments[0]?.DepartmentID || ''));
    } else {
      setEmployeeId(generateNextId());
      setName('');
      setGender('Male');
      setPhone('');
      setAddress('');
      setDepartmentId(departments[0]?.DepartmentID || '');
    }
    setError('');
  }, [initialData, isOpen, departments]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = employeeId.trim();
    const cleanName = name.trim();

    if (!cleanId) {
      setError('EmployeeID is required (សូមបញ្ចូល EmployeeID)');
      return;
    }

    if (!cleanName) {
      setError('Name is required (សូមបញ្ចូលឈ្មោះបុគ្គលិក)');
      return;
    }

    if (!departmentId) {
      setError('Department is required (សូមជ្រើសរើសផ្នែក)');
      return;
    }

    // Check duplicate ID when creating new
    if (!isEditing) {
      const exists = existingEmployees.some(
        (emp) => emp.EmployeeID.toLowerCase() === cleanId.toLowerCase()
      );
      if (exists) {
        setError(`EmployeeID "${cleanId}" already exists. Please choose another ID.`);
        return;
      }
    }

    onSave({
      EmployeeID: cleanId,
      Name: cleanName,
      Gender: gender,
      Phone: phone.trim(),
      Address: address.trim(),
      DepartmentID: departmentId,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {isEditing ? 'កែប្រែព័ត៌មានបុគ្គលិក (Edit Employee)' : 'បន្ថែមបុគ្គលិកថ្មី (New Employee)'}
              </h3>
              <p className="text-xs text-slate-500">
                តារាង Google Sheets: <code>Employee</code>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Employee ID */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                <span>EmployeeID *</span>
              </label>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                disabled={isEditing}
                placeholder="e.g. EMP-1001"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:opacity-60 disabled:bg-slate-100"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Gender (ភេទ) *</span>
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
              >
                <option value="Male">Male (ប្រុស)</option>
                <option value="Female">Female (ស្រី)</option>
                <option value="Other">Other (ផ្សេងទៀត)</option>
              </select>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Full Name (ឈ្មោះបុគ្គលិក) *</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sokha Chen ឬ សុខា ចិន"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Phone & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Phone (លេខទូរស័ព្ទ)</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 012 345 678"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {/* Department ID */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Department (ផ្នែក) *</span>
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
              >
                {departments.length === 0 ? (
                  <option value="">No departments available</option>
                ) : (
                  departments.map((d) => (
                    <option key={d.DepartmentID} value={d.DepartmentID}>
                      {d.DepartmentID} - {d.DepartmentName}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Address (អាសយដ្ឋាន)</span>
            </label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. រាជធានីភ្នំពេញ, ខណ្ឌទួលគោក..."
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
