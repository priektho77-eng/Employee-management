import React, { useState, useEffect, useCallback } from 'react';
import {
  Department,
  Employee,
  ConnectionConfig,
  ActiveTab,
  ToastMessage,
} from './types';
import {
  getStoredDepartments,
  saveStoredDepartments,
  getStoredEmployees,
  saveStoredEmployees,
  getStoredWebAppUrl,
  saveStoredWebAppUrl,
  INITIAL_DEPARTMENTS,
  INITIAL_EMPLOYEES,
} from './services/storage';
import { pingGasApi, fetchAllFromGas, postToGas } from './services/gasApi';
import { Sidebar } from './components/Sidebar';
import { EmployeeTable } from './components/EmployeeTable';
import { DepartmentTable } from './components/DepartmentTable';
import { AnalyticsView } from './components/AnalyticsView';
import { EmployeeModal } from './components/EmployeeModal';
import { DepartmentModal } from './components/DepartmentModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { AppsScriptModal } from './components/AppsScriptModal';
import { ShareProjectModal } from './components/ShareProjectModal';
import { Toast } from './components/Toast';
import {
  Share2,
  FileSpreadsheet,
  Download,
  Code2,
  Database,
  ExternalLink,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

const SHARED_PROJECT_LINK =
  'https://ais-pre-kenaayh75l572edvoozd4p-202454413109.asia-southeast1.run.app';

export default function App() {
  // Data state
  const [departments, setDepartments] = useState<Department[]>(getStoredDepartments);
  const [employees, setEmployees] = useState<Employee[]>(getStoredEmployees);
  const [activeTab, setActiveTab] = useState<ActiveTab>('employees');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('ALL');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Connection state
  const [connection, setConnection] = useState<ConnectionConfig>(() => {
    const savedUrl = getStoredWebAppUrl();
    return {
      webAppUrl: savedUrl,
      isConnected: Boolean(savedUrl),
      mode: savedUrl ? 'connected' : 'emulated',
    };
  });

  // Modal states
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    type: 'employee' | 'department';
    targetEmployee?: Employee | null;
    targetDepartment?: Department | null;
  }>({
    isOpen: false,
    type: 'employee',
  });

  const [isAppsScriptModalOpen, setIsAppsScriptModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
      const id = Date.now().toString() + Math.random().toString();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync with Google Apps Script Web App if URL is present on initial load
  const syncWithGoogleSheets = useCallback(
    async (urlToUse?: string) => {
      const targetUrl = urlToUse !== undefined ? urlToUse : connection.webAppUrl;
      if (!targetUrl) return;

      setIsSyncing(true);
      try {
        const result = await fetchAllFromGas(targetUrl);
        if (result.departments && result.departments.length > 0) {
          setDepartments(result.departments);
          saveStoredDepartments(result.departments);
        }
        if (result.employees && result.employees.length > 0) {
          setEmployees(result.employees);
          saveStoredEmployees(result.employees);
        }
        setConnection((prev) => ({
          ...prev,
          isConnected: true,
          spreadsheetName: result.spreadsheetName,
          lastSyncedAt: new Date().toLocaleTimeString(),
        }));
        addToast('Synced live data from Google Sheets successfully!', 'success');
      } catch (err: any) {
        console.warn('Sync failed:', err);
        addToast(`Google Sheets Sync Notice: ${err.message || 'Offline or network error'}`, 'warning');
      } finally {
        setIsSyncing(false);
      }
    },
    [connection.webAppUrl, addToast]
  );

  useEffect(() => {
    if (connection.webAppUrl) {
      syncWithGoogleSheets(connection.webAppUrl);
    }
  }, []);

  // Save departments to localStorage
  useEffect(() => {
    saveStoredDepartments(departments);
  }, [departments]);

  // Save employees to localStorage
  useEffect(() => {
    saveStoredEmployees(employees);
  }, [employees]);

  // =========================================================================
  // CRUD FOR EMPLOYEE
  // =========================================================================
  const handleSaveEmployee = async (employeeData: Employee) => {
    const isEdit = Boolean(editingEmployee);

    // Optimistic UI update
    if (isEdit) {
      setEmployees((prev) =>
        prev.map((emp) => (emp.EmployeeID === employeeData.EmployeeID ? employeeData : emp))
      );
      addToast(`Updated employee "${employeeData.Name}" successfully!`, 'success');
    } else {
      setEmployees((prev) => [employeeData, ...prev]);
      addToast(`Added new employee "${employeeData.Name}" successfully!`, 'success');
    }

    setIsEmployeeModalOpen(false);
    setEditingEmployee(null);

    // Sync to Google Sheets if connected
    if (connection.isConnected && connection.webAppUrl) {
      try {
        const action = isEdit ? 'updateEmployee' : 'createEmployee';
        await postToGas(connection.webAppUrl, action, employeeData);
        addToast('Saved to Google Sheets', 'success');
      } catch (err: any) {
        console.error('GAS save employee error:', err);
        addToast(`Could not push to Google Sheets: ${err.message}`, 'error');
      }
    }
  };

  const handleTriggerEditEmployee = (emp: Employee) => {
    setEditingEmployee(emp);
    setIsEmployeeModalOpen(true);
  };

  const handleTriggerDeleteEmployee = (emp: Employee) => {
    setDeleteModalState({
      isOpen: true,
      type: 'employee',
      targetEmployee: emp,
    });
  };

  const handleConfirmDelete = async () => {
    if (deleteModalState.type === 'employee' && deleteModalState.targetEmployee) {
      const empToDelete = deleteModalState.targetEmployee;
      setEmployees((prev) => prev.filter((e) => e.EmployeeID !== empToDelete.EmployeeID));
      addToast(`Deleted employee "${empToDelete.Name}"`, 'info');

      if (connection.isConnected && connection.webAppUrl) {
        try {
          await postToGas(connection.webAppUrl, 'deleteEmployee', {
            EmployeeID: empToDelete.EmployeeID,
          });
        } catch (err: any) {
          console.error('GAS delete employee error:', err);
        }
      }
    } else if (deleteModalState.type === 'department' && deleteModalState.targetDepartment) {
      const deptToDelete = deleteModalState.targetDepartment;
      setDepartments((prev) => prev.filter((d) => d.DepartmentID !== deptToDelete.DepartmentID));
      addToast(`Deleted department "${deptToDelete.DepartmentName}"`, 'info');

      if (connection.isConnected && connection.webAppUrl) {
        try {
          await postToGas(connection.webAppUrl, 'deleteDepartment', {
            DepartmentID: deptToDelete.DepartmentID,
            force: true,
          });
        } catch (err: any) {
          console.error('GAS delete department error:', err);
        }
      }
    }

    setDeleteModalState({ isOpen: false, type: 'employee' });
  };

  // =========================================================================
  // CRUD FOR DEPARTMENT
  // =========================================================================
  const handleSaveDepartment = async (departmentData: Department) => {
    const isEdit = Boolean(editingDepartment);

    // Optimistic UI update
    if (isEdit) {
      setDepartments((prev) =>
        prev.map((d) => (d.DepartmentID === departmentData.DepartmentID ? departmentData : d))
      );
      addToast(`Updated department "${departmentData.DepartmentName}"`, 'success');
    } else {
      setDepartments((prev) => [...prev, departmentData]);
      addToast(`Added new department "${departmentData.DepartmentName}"`, 'success');
    }

    setIsDepartmentModalOpen(false);
    setEditingDepartment(null);

    // Sync to Google Sheets if connected
    if (connection.isConnected && connection.webAppUrl) {
      try {
        const action = isEdit ? 'updateDepartment' : 'createDepartment';
        await postToGas(connection.webAppUrl, action, departmentData);
        addToast('Saved to Google Sheets', 'success');
      } catch (err: any) {
        console.error('GAS save department error:', err);
        addToast(`Could not push to Google Sheets: ${err.message}`, 'error');
      }
    }
  };

  const handleTriggerEditDepartment = (dept: Department) => {
    setEditingDepartment(dept);
    setIsDepartmentModalOpen(true);
  };

  const handleTriggerDeleteDepartment = (dept: Department) => {
    setDeleteModalState({
      isOpen: true,
      type: 'department',
      targetDepartment: dept,
    });
  };

  const handleFilterByDepartment = (deptId: string) => {
    setSelectedDeptFilter(deptId);
    setActiveTab('employees');
  };

  // =========================================================================
  // CONNECTION MANAGEMENT
  // =========================================================================
  const handleTestConnection = async (url: string): Promise<boolean> => {
    try {
      const res = await pingGasApi(url);
      return res.success;
    } catch {
      return false;
    }
  };

  const handleSaveUrl = async (url: string): Promise<boolean> => {
    saveStoredWebAppUrl(url);
    if (!url) {
      setConnection({
        webAppUrl: '',
        isConnected: false,
        mode: 'emulated',
      });
      addToast('Reverted to Local/Emulated Database Mode', 'info');
      return true;
    }

    setConnection((prev) => ({
      ...prev,
      webAppUrl: url,
      isConnected: true,
      mode: 'connected',
    }));

    await syncWithGoogleSheets(url);
    return true;
  };

  const handleResetSampleData = () => {
    if (window.confirm('Reset all data to default Cambodian company samples?')) {
      setDepartments(INITIAL_DEPARTMENTS);
      setEmployees(INITIAL_EMPLOYEES);
      saveStoredDepartments(INITIAL_DEPARTMENTS);
      saveStoredEmployees(INITIAL_EMPLOYEES);
      addToast('Data reset to default sample data', 'info');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col md:flex-row font-['Kantumruy_Pro','Plus_Jakarta_Sans',sans-serif]">
      {/* Left Sidebar Navbar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        connection={connection}
        onOpenAppsScriptModal={() => setIsAppsScriptModalOpen(true)}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        onRefreshData={() => syncWithGoogleSheets()}
        isSyncing={isSyncing}
        totalEmployees={employees.length}
        totalDepartments={departments.length}
      />

      {/* Main Workspace on Right */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Workspace Top Header Bar on desktop */}
        <div className="hidden md:flex bg-white border-b border-slate-200/80 px-6 lg:px-8 py-3.5 items-center justify-between sticky top-0 z-20 shadow-2xs">
          <div className="flex items-center space-x-3">
            <div>
              <h2 className="text-base font-bold text-slate-800">
                {activeTab === 'employees' && 'គ្រប់គ្រងបុគ្គលិក (Employee Management)'}
                {activeTab === 'departments' && 'គ្រប់គ្រងផ្នែក (Department Management)'}
                {activeTab === 'analytics' && 'ទិដ្ឋភាពទូទៅ & ស្ថិតិ (Overview & Analytics)'}
                {activeTab === 'script-setup' && 'ការរៀបចំ Google Sheets & Code.gs (Database Setup)'}
              </h2>
              <p className="text-xs text-slate-500">
                Google Sheets Database &bull; Tables: Department &amp; Employee
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Quick status pill */}
            <div
              onClick={() => setIsAppsScriptModalOpen(true)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium border cursor-pointer transition hover:opacity-80 ${
                connection.isConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  connection.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span>{connection.isConnected ? 'Google Sheets Live' : 'Local Emulated Mode'}</span>
            </div>

            {/* Share project button */}
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm transition transform active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Link</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Banner with Quick Share Link */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white shadow-md border border-slate-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold flex items-center gap-2">
                <span>Google Sheets Employee Management System</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-300">
                  Ready &amp; Shared
                </span>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                មុខងារគ្រប់គ្រងបុគ្គលិក &amp; ដេប៉ាតឺម៉ង់ ជាមួយ Google Sheets (Create, Update, Delete, Search)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-md transition"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Project Link</span>
            </button>
            <a
              href="/GoogleAppsScript_Code.txt"
              download="GoogleAppsScript_Code.txt"
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-600 transition"
              title="Download Code.gs.txt"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Code.txt</span>
            </a>
          </div>
        </div>

        {/* Tab 1: Employees */}
        {activeTab === 'employees' && (
          <EmployeeTable
            employees={employees}
            departments={departments}
            onAddEmployee={() => {
              setEditingEmployee(null);
              setIsEmployeeModalOpen(true);
            }}
            onEditEmployee={handleTriggerEditEmployee}
            onDeleteEmployee={handleTriggerDeleteEmployee}
            selectedDepartmentFilter={selectedDeptFilter}
            onSelectDepartmentFilter={(depId) => setSelectedDeptFilter(depId)}
          />
        )}

        {/* Tab 2: Departments */}
        {activeTab === 'departments' && (
          <DepartmentTable
            departments={departments}
            employees={employees}
            onAddDepartment={() => {
              setEditingDepartment(null);
              setIsDepartmentModalOpen(true);
            }}
            onEditDepartment={handleTriggerEditDepartment}
            onDeleteDepartment={handleTriggerDeleteDepartment}
            onViewEmployeesInDepartment={handleFilterByDepartment}
          />
        )}

        {/* Tab 3: Analytics */}
        {activeTab === 'analytics' && (
          <AnalyticsView
            departments={departments}
            employees={employees}
            connection={connection}
            onOpenAppsScriptModal={() => setIsAppsScriptModalOpen(true)}
            onSelectDepartment={handleFilterByDepartment}
          />
        )}

        {/* Tab 4: Apps Script & Setup Hub */}
        {activeTab === 'script-setup' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-100 gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-emerald-600" />
                  <span>Google Apps Script Back-End &amp; Google Sheets Database</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  ឯកសារ និងកូដសម្រាប់ដំណើរការ Google Sheets ជា Database និង Apps Script ជា Web App API
                </p>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setIsAppsScriptModalOpen(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
                >
                  Configure Web App URL
                </button>
                <a
                  href="/SETUP_GUIDE_KH_EN.txt"
                  download="SETUP_GUIDE_KH_EN.txt"
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 flex items-center space-x-1.5 transition"
                >
                  <Download className="w-4 h-4 text-slate-600" />
                  <span>Download Guide .txt</span>
                </a>
              </div>
            </div>

            {/* Quick overview of requested tables */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center space-x-2 text-emerald-700 font-bold text-sm mb-2">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>➔ Table 1: Department</span>
                </div>
                <div className="text-xs text-slate-600 space-y-1.5 font-mono">
                  <div className="p-1.5 bg-white rounded border border-slate-200">
                    <strong>DepartmentID:</strong> លេខសម្គាល់ផ្នែក (ឧ. DEP-001)
                  </div>
                  <div className="p-1.5 bg-white rounded border border-slate-200">
                    <strong>DepartmentName:</strong> ឈ្មោះផ្នែក (ឧ. Information Technology)
                  </div>
                  <div className="p-1.5 bg-white rounded border border-slate-200">
                    <strong>Note:</strong> ចំណាំ / ការពិពណ៌នា
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center space-x-2 text-teal-700 font-bold text-sm mb-2">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>➔ Table 2: Employee</span>
                </div>
                <div className="text-xs text-slate-600 space-y-1.5 font-mono">
                  <div className="p-1.5 bg-white rounded border border-slate-200">
                    <strong>EmployeeID:</strong> លេខសម្គាល់បុគ្គលិក (ឧ. EMP-1001)
                  </div>
                  <div className="p-1.5 bg-white rounded border border-slate-200">
                    <strong>Name:</strong> ឈ្មោះបុគ្គលិក
                  </div>
                  <div className="p-1.5 bg-white rounded border border-slate-200">
                    <strong>Gender, Phone, Address:</strong> ព័ត៌មានលម្អិត
                  </div>
                  <div className="p-1.5 bg-white rounded border border-slate-200">
                    <strong>DepartmentID:</strong> Foreign Key ភ្ជាប់ទៅ Department
                  </div>
                </div>
              </div>
            </div>

            {/* Open instructions banner */}
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
              <div>
                <strong className="block font-semibold">តើអ្នកចង់ដំឡើងជាមួយ Google Sheet ផ្ទាល់ខ្លួនទេ?</strong>
                <span className="text-emerald-700">
                  អ្នកអាចអនុវត្តតាម ៥ ជំហានងាយៗដោយប្រើប្រាស់ផ្ទាំង Apps Script Setup
                </span>
              </div>
              <button
                onClick={() => setIsAppsScriptModalOpen(true)}
                className="px-3.5 py-1.5 bg-emerald-700 text-white font-semibold text-xs rounded-lg hover:bg-emerald-800 transition shrink-0"
              >
                បើកផ្ទាំងដំឡើង (Open Setup)
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 border-t border-slate-800 py-6 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-white">Employee Management System</span>
            <span>•</span>
            <span>Database: Google Sheets</span>
            <span>•</span>
            <span>Back-End: Google Apps Script</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="text-emerald-400 hover:text-emerald-300 font-semibold"
            >
              Share Project
            </button>
            <span>•</span>
            <button
              onClick={() => setIsAppsScriptModalOpen(true)}
              className="text-slate-300 hover:text-white"
            >
              Google Apps Script Code.gs
            </button>
          </div>
        </div>
      </footer>
    </div>

      {/* Modals */}
      <EmployeeModal
        isOpen={isEmployeeModalOpen}
        onClose={() => {
          setIsEmployeeModalOpen(false);
          setEditingEmployee(null);
        }}
        onSave={handleSaveEmployee}
        initialData={editingEmployee}
        departments={departments}
        existingEmployees={employees}
      />

      <DepartmentModal
        isOpen={isDepartmentModalOpen}
        onClose={() => {
          setIsDepartmentModalOpen(false);
          setEditingDepartment(null);
        }}
        onSave={handleSaveDepartment}
        initialData={editingDepartment}
        existingDepartments={departments}
      />

      <DeleteConfirmModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, type: 'employee' })}
        onConfirm={handleConfirmDelete}
        targetType={deleteModalState.type}
        targetEmployee={deleteModalState.targetEmployee}
        targetDepartment={deleteModalState.targetDepartment}
        assignedEmployeesCount={
          deleteModalState.targetDepartment
            ? employees.filter(
                (e) => e.DepartmentID === deleteModalState.targetDepartment?.DepartmentID
              ).length
            : 0
        }
      />

      <AppsScriptModal
        isOpen={isAppsScriptModalOpen}
        onClose={() => setIsAppsScriptModalOpen(false)}
        connection={connection}
        onSaveUrl={handleSaveUrl}
        onTestConnection={handleTestConnection}
        onResetSampleData={handleResetSampleData}
      />

      <ShareProjectModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        sharedUrl={SHARED_PROJECT_LINK}
      />

      {/* Real-time Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
