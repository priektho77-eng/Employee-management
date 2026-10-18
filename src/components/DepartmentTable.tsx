import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Building2,
  Users,
  Download,
  X,
  FileText,
  ArrowRight,
  FolderPlus,
} from 'lucide-react';
import { Department, Employee } from '../types';
import { exportToCSV } from '../services/storage';

interface DepartmentTableProps {
  departments: Department[];
  employees: Employee[];
  onAddDepartment: () => void;
  onEditDepartment: (department: Department) => void;
  onDeleteDepartment: (department: Department) => void;
  onViewEmployeesInDepartment: (departmentId: string) => void;
}

export const DepartmentTable: React.FC<DepartmentTableProps> = ({
  departments,
  employees,
  onAddDepartment,
  onEditDepartment,
  onDeleteDepartment,
  onViewEmployeesInDepartment,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Count employees per department
  const employeeCountByDept = useMemo(() => {
    const counts = new Map<string, number>();
    employees.forEach((emp) => {
      counts.set(emp.DepartmentID, (counts.get(emp.DepartmentID) || 0) + 1);
    });
    return counts;
  }, [employees]);

  // Filter departments by search
  const filteredDepartments = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return departments;

    return departments.filter(
      (dept) =>
        dept.DepartmentID.toLowerCase().includes(query) ||
        dept.DepartmentName.toLowerCase().includes(query) ||
        dept.Note.toLowerCase().includes(query)
    );
  }, [departments, searchQuery]);

  const handleExportCSV = () => {
    const headers = ['DepartmentID', 'DepartmentName', 'Note', 'TotalEmployees'];
    const rows = filteredDepartments.map((dept) => [
      dept.DepartmentID,
      dept.DepartmentName,
      dept.Note,
      employeeCountByDept.get(dept.DepartmentID) || 0,
    ]);
    exportToCSV(`Departments_Export_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  };

  return (
    <div className="space-y-4">
      {/* Search and Action Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ស្វែងរកតាម ID, ឈ្មោះដេប៉ាតឺម៉ង់, ចំណាំ... (Search departments)"
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition"
            title="Export filtered list to CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>CSV</span>
          </button>

          {/* Add Department CTA */}
          <button
            onClick={onAddDepartment}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm shadow-emerald-700/20 transition transform active:scale-95"
          >
            <FolderPlus className="w-4 h-4" />
            <span>+ បន្ថែមផ្នែកថ្មី (Add Department)</span>
          </button>
        </div>
      </div>

      {/* Grid and Table View */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-slate-200 text-xs uppercase tracking-wider font-semibold border-b border-slate-800">
                <th className="py-3.5 px-4">Department ID</th>
                <th className="py-3.5 px-4">Department Name (ឈ្មោះផ្នែក)</th>
                <th className="py-3.5 px-4">Note (ចំណាំ / ការពិពណ៌នា)</th>
                <th className="py-3.5 px-4 text-center">Staff Count</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredDepartments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Building2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="text-base font-medium text-slate-600">រកមិនឃើញផ្នែកទេ (No departments found)</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {searchQuery ? 'សូមសាកល្បងស្វែងរកពាក្យផ្សេង' : 'ចុចប៊ូតុង "បន្ថែមផ្នែកថ្មី" ដើម្បីបង្កើត'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredDepartments.map((dept) => {
                  const count = employeeCountByDept.get(dept.DepartmentID) || 0;

                  return (
                    <tr
                      key={dept.DepartmentID}
                      className="hover:bg-slate-50/80 transition duration-150 group"
                    >
                      {/* DepartmentID */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-800 text-xs">
                        <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                          {dept.DepartmentID}
                        </span>
                      </td>

                      {/* DepartmentName */}
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <div className="flex items-center space-x-2">
                          <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{dept.DepartmentName}</span>
                        </div>
                      </td>

                      {/* Note */}
                      <td className="py-3.5 px-4 text-slate-600 text-xs max-w-sm">
                        <div className="flex items-start space-x-1.5">
                          <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{dept.Note || '—'}</span>
                        </div>
                      </td>

                      {/* Staff Count & Quick view */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => onViewEmployeesInDepartment(dept.DepartmentID)}
                          className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 transition"
                          title="View all employees in this department"
                        >
                          <Users className="w-3 h-3 text-slate-500" />
                          <span>{count} នាក់</span>
                          <ArrowRight className="w-3 h-3 opacity-60" />
                        </button>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* Edit */}
                          <button
                            onClick={() => onEditDepartment(dept)}
                            className="p-1.5 rounded-md hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition"
                            title="Edit department"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => onDeleteDepartment(dept)}
                            className="p-1.5 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                            title="Delete department"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>
            សរុប <strong>{filteredDepartments.length}</strong> នៃ <strong>{departments.length}</strong> ដេប៉ាតឺម៉ង់
          </span>
          <span className="text-slate-400">
            Field: DepartmentID, DepartmentName, Note
          </span>
        </div>
      </div>
    </div>
  );
};
