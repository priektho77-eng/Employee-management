import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Phone,
  MapPin,
  Building2,
  UserCheck,
  Download,
  Filter,
  Eye,
  X,
  UserPlus,
} from 'lucide-react';
import { Department, Employee } from '../types';
import { exportToCSV } from '../services/storage';

interface EmployeeTableProps {
  employees: Employee[];
  departments: Department[];
  onAddEmployee: () => void;
  onEditEmployee: (employee: Employee) => void;
  onDeleteEmployee: (employee: Employee) => void;
  selectedDepartmentFilter?: string;
  onSelectDepartmentFilter?: (depId: string) => void;
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  departments,
  onAddEmployee,
  onEditEmployee,
  onDeleteEmployee,
  selectedDepartmentFilter = 'ALL',
  onSelectDepartmentFilter,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState('ALL');
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);

  // Map DepartmentID -> Department object
  const departmentMap = useMemo(() => {
    const map = new Map<string, Department>();
    departments.forEach((d) => map.set(d.DepartmentID, d));
    return map;
  }, [departments]);

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      // Search text match
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        emp.Name.toLowerCase().includes(query) ||
        emp.EmployeeID.toLowerCase().includes(query) ||
        emp.Phone.toLowerCase().includes(query) ||
        emp.Address.toLowerCase().includes(query) ||
        (departmentMap.get(emp.DepartmentID)?.DepartmentName || '').toLowerCase().includes(query);

      // Department filter
      const matchesDept =
        selectedDepartmentFilter === 'ALL' || emp.DepartmentID === selectedDepartmentFilter;

      // Gender filter
      const matchesGender =
        genderFilter === 'ALL' || emp.Gender.toLowerCase() === genderFilter.toLowerCase();

      return matchesSearch && matchesDept && matchesGender;
    });
  }, [employees, searchQuery, selectedDepartmentFilter, genderFilter, departmentMap]);

  const handleExportCSV = () => {
    const headers = ['EmployeeID', 'Name', 'Gender', 'Phone', 'Address', 'DepartmentID', 'DepartmentName'];
    const rows = filteredEmployees.map((emp) => [
      emp.EmployeeID,
      emp.Name,
      emp.Gender,
      emp.Phone,
      emp.Address,
      emp.DepartmentID,
      departmentMap.get(emp.DepartmentID)?.DepartmentName || 'Unknown',
    ]);
    exportToCSV(`Employees_Export_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
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
            placeholder="ស្វែងរកតាមឈ្មោះ, ID, ទូរស័ព្ទ, អាសយដ្ឋាន... (Search employees)"
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

        {/* Filters and CTA Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Department Filter */}
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-600">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedDepartmentFilter}
              onChange={(e) => onSelectDepartmentFilter && onSelectDepartmentFilter(e.target.value)}
              className="bg-transparent font-medium focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Departments (គ្រប់ផ្នែក)</option>
              {departments.map((d) => (
                <option key={d.DepartmentID} value={d.DepartmentID}>
                  {d.DepartmentID} - {d.DepartmentName}
                </option>
              ))}
            </select>
          </div>

          {/* Gender Filter */}
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="bg-transparent font-medium focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Genders (ភេទទាំងអស់)</option>
              <option value="Male">Male (ប្រុស)</option>
              <option value="Female">Female (ស្រី)</option>
              <option value="Other">Other (ផ្សេងទៀត)</option>
            </select>
          </div>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition"
            title="Export filtered list to CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>CSV</span>
          </button>

          {/* Add Employee CTA */}
          <button
            onClick={onAddEmployee}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm shadow-emerald-700/20 transition transform active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ បន្ថែមបុគ្គលិកថ្មី (Add)</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-slate-200 text-xs uppercase tracking-wider font-semibold border-b border-slate-800">
                <th className="py-3.5 px-4">Employee ID</th>
                <th className="py-3.5 px-4">Name (ឈ្មោះ)</th>
                <th className="py-3.5 px-3">Gender</th>
                <th className="py-3.5 px-4">Phone (ទូរស័ព្ទ)</th>
                <th className="py-3.5 px-4">Address (អាសយដ្ឋាន)</th>
                <th className="py-3.5 px-4">Department (ផ្នែក)</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <UserCheck className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="text-base font-medium text-slate-600">រកមិនឃើញទិន្នន័យបុគ្គលិកទេ (No employees found)</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {searchQuery ? 'សូមសាកល្បងស្វែងរកពាក្យគន្លឹះផ្សេង' : 'ចុចប៊ូតុង "បន្ថែមបុគ្គលិកថ្មី" ដើម្បីបញ្ចូល'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => {
                  const dept = departmentMap.get(emp.DepartmentID);
                  const isMale = emp.Gender.toLowerCase() === 'male';
                  const isFemale = emp.Gender.toLowerCase() === 'female';

                  return (
                    <tr
                      key={emp.EmployeeID}
                      className="hover:bg-slate-50/80 transition duration-150 group"
                    >
                      {/* EmployeeID */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-800 text-xs">
                        <span className="px-2 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {emp.EmployeeID}
                        </span>
                      </td>

                      {/* Name with Avatar */}
                      <td className="py-3.5 px-4 font-medium text-slate-900">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-xs text-white ${
                              isMale
                                ? 'bg-gradient-to-tr from-blue-600 to-indigo-500'
                                : isFemale
                                ? 'bg-gradient-to-tr from-pink-600 to-rose-400'
                                : 'bg-gradient-to-tr from-teal-600 to-emerald-500'
                            }`}
                          >
                            {emp.Name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block">{emp.Name}</span>
                          </div>
                        </div>
                      </td>

                      {/* Gender */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            isMale
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : isFemale
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {emp.Gender}
                        </span>
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-4 text-slate-700 font-mono text-xs">
                        <a
                          href={`tel:${emp.Phone}`}
                          className="inline-flex items-center space-x-1.5 text-slate-700 hover:text-emerald-600 transition"
                        >
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{emp.Phone || '—'}</span>
                        </a>
                      </td>

                      {/* Address */}
                      <td className="py-3.5 px-4 text-slate-600 text-xs max-w-xs truncate" title={emp.Address}>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{emp.Address || '—'}</span>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                          <Building2 className="w-3 h-3 mr-1 text-emerald-600" />
                          {dept ? dept.DepartmentName : emp.DepartmentID || 'N/A'}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* View details */}
                          <button
                            onClick={() => setViewingEmployee(emp)}
                            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => onEditEmployee(emp)}
                            className="p-1.5 rounded-md hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition"
                            title="Edit employee"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => onDeleteEmployee(emp)}
                            className="p-1.5 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                            title="Delete employee"
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

        {/* Footer with count */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>
            បង្ហាញ <strong>{filteredEmployees.length}</strong> នៃចំនួនសរុប <strong>{employees.length}</strong> បុគ្គលិក
          </span>
          {selectedDepartmentFilter !== 'ALL' && (
            <button
              onClick={() => onSelectDepartmentFilter && onSelectDepartmentFilter('ALL')}
              className="text-emerald-600 hover:underline font-medium"
            >
              Clear Department Filter
            </button>
          )}
        </div>
      </div>

      {/* Employee Quick View Modal */}
      {viewingEmployee && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setViewingEmployee(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-emerald-600/30">
                {viewingEmployee.Name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{viewingEmployee.Name}</h3>
                <span className="font-mono text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                  {viewingEmployee.EmployeeID}
                </span>
              </div>
            </div>

            <div className="space-y-3 border-t border-slate-100 pt-3 text-sm">
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Gender (ភេទ)</span>
                <span className="font-medium text-slate-800">{viewingEmployee.Gender}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Phone (ទូរស័ព្ទ)</span>
                <span className="font-medium text-slate-800 font-mono">{viewingEmployee.Phone || '—'}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Department (ផ្នែក)</span>
                <span className="font-medium text-emerald-700">
                  {departmentMap.get(viewingEmployee.DepartmentID)?.DepartmentName || viewingEmployee.DepartmentID}
                </span>
              </div>

              <div className="py-1.5">
                <span className="text-slate-500 block mb-1">Address (អាសយដ្ឋាន)</span>
                <span className="text-slate-800 bg-slate-50 p-2.5 rounded-lg block text-xs">
                  {viewingEmployee.Address || 'No address provided'}
                </span>
              </div>
            </div>

            <div className="mt-5 flex justify-end space-x-2">
              <button
                onClick={() => {
                  const emp = viewingEmployee;
                  setViewingEmployee(null);
                  onEditEmployee(emp);
                }}
                className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition"
              >
                Edit Info
              </button>
              <button
                onClick={() => setViewingEmployee(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
