import React from 'react';
import {
  Users,
  Building2,
  PieChart,
  TrendingUp,
  Download,
  Database,
  CheckCircle2,
  FileSpreadsheet,
  Layers,
} from 'lucide-react';
import { Department, Employee, ConnectionConfig } from '../types';

interface AnalyticsViewProps {
  departments: Department[];
  employees: Employee[];
  connection: ConnectionConfig;
  onOpenAppsScriptModal: () => void;
  onSelectDepartment: (deptId: string) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  departments,
  employees,
  connection,
  onOpenAppsScriptModal,
  onSelectDepartment,
}) => {
  const totalEmployees = employees.length;
  const totalDepartments = departments.length;

  const maleCount = employees.filter((e) => e.Gender.toLowerCase() === 'male').length;
  const femaleCount = employees.filter((e) => e.Gender.toLowerCase() === 'female').length;
  const otherCount = totalEmployees - maleCount - femaleCount;

  const malePct = totalEmployees ? Math.round((maleCount / totalEmployees) * 100) : 0;
  const femalePct = totalEmployees ? Math.round((femaleCount / totalEmployees) * 100) : 0;

  // Department counts
  const deptStats = departments.map((d) => {
    const count = employees.filter((e) => e.DepartmentID === d.DepartmentID).length;
    const pct = totalEmployees ? Math.round((count / totalEmployees) * 100) : 0;
    return {
      ...d,
      count,
      pct,
    };
  });

  return (
    <div className="space-y-6">
      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Employees */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              បុគ្គលិកសរុប (Total Staff)
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{totalEmployees} នាក់</h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">
              Active in Google Sheets
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Total Departments */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              ផ្នែកសរុប (Departments)
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{totalDepartments} ផ្នែក</h3>
            <p className="text-[11px] text-teal-600 font-medium mt-1">
              {departments[0]?.DepartmentName ? 'Structured Units' : 'No departments'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        {/* Gender Ratio */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              សមាមាត្រភេទ (Gender)
            </p>
            <h3 className="text-xl font-bold text-slate-900 mt-1">
              {maleCount} <span className="text-xs text-blue-600 font-semibold">ប្រុស</span> / {femaleCount}{' '}
              <span className="text-xs text-rose-500 font-semibold">ស្រី</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              {malePct}% Male / {femalePct}% Female
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <PieChart className="w-6 h-6" />
          </div>
        </div>

        {/* Database Status */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              ស្ថានភាព Database
            </p>
            <h3 className="text-sm font-bold text-slate-900 mt-1 truncate max-w-[140px]">
              {connection.isConnected ? 'Google Sheets' : 'Local Emulated'}
            </h3>
            <button
              onClick={onOpenAppsScriptModal}
              className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold underline mt-1 block"
            >
              {connection.isConnected ? 'Connected Live' : 'Configure Apps Script'}
            </button>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center border border-cyan-100">
            <Database className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Department Breakdown Bar Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                ការបែងចែកបុគ្គលិកតាមផ្នែក (Staff by Department)
              </h3>
              <p className="text-xs text-slate-500">
                ចំនួន និងភាគរយនៃបុគ្គលិកក្នុងផ្នែកនីមួយៗ
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full">
              {totalDepartments} ផ្នែក
            </span>
          </div>

          <div className="space-y-4 mt-6">
            {deptStats.map((d) => (
              <div key={d.DepartmentID} className="group cursor-pointer" onClick={() => onSelectDepartment(d.DepartmentID)}>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-emerald-700 font-semibold">{d.DepartmentID}</span>
                    <span className="font-semibold text-slate-900">{d.DepartmentName}</span>
                  </div>
                  <div className="text-slate-600">
                    <strong className="text-slate-900">{d.count}</strong> នាក់ ({d.pct}%)
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500 group-hover:bg-emerald-500"
                    style={{ width: `${Math.max(d.pct, 4)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Database Architecture Summary */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Layers className="w-4 h-4" />
              <span>Google Sheets Architecture</span>
            </div>
            <h4 className="text-lg font-bold text-white mb-2">
              Google Sheets + Apps Script
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              ប្រព័ន្ធនេះប្រើប្រាស់ Google Spreadsheet ផ្ទាល់ជា Relational Database ដោយមាន Sheets ចំនួន ២៖
            </p>

            <div className="mt-4 space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700">
                <span className="text-emerald-400 font-bold block">1. Sheet: Department</span>
                <span className="text-slate-400 font-mono text-[11px]">
                  DepartmentID, DepartmentName, Note
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700">
                <span className="text-emerald-400 font-bold block">2. Sheet: Employee</span>
                <span className="text-slate-400 font-mono text-[11px]">
                  EmployeeID, Name, Gender, Phone, Address, DepartmentID
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <button
              onClick={onOpenAppsScriptModal}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-md transition flex items-center justify-center space-x-2"
            >
              <span>ពិនិត្យ &amp; ទាញយក Code.gs</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
