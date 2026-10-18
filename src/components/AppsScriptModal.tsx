import React, { useState } from 'react';
import {
  X,
  Code2,
  Copy,
  Check,
  Download,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  FileSpreadsheet,
  Layers,
  HelpCircle,
  Key,
  Globe,
  Database,
} from 'lucide-react';
import { ConnectionConfig } from '../types';

interface AppsScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  connection: ConnectionConfig;
  onSaveUrl: (url: string) => Promise<boolean>;
  onTestConnection: (url: string) => Promise<boolean>;
  onResetSampleData: () => void;
}

const APPS_SCRIPT_CODE = `/**
 * Google Apps Script Backend for Employee Management System
 * Database: Google Sheets (Tables: Department & Employee)
 */

const SHEET_DEPARTMENT = 'Department';
const SHEET_EMPLOYEE = 'Employee';

const DEPARTMENT_HEADERS = ['DepartmentID', 'DepartmentName', 'Note'];
const EMPLOYEE_HEADERS = ['EmployeeID', 'Name', 'Gender', 'Phone', 'Address', 'DepartmentID'];

function getOrCreateSheet(sheetName, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(headers);
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#1e293b');
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || 'getAll';
    const deptSheet = getOrCreateSheet(SHEET_DEPARTMENT, DEPARTMENT_HEADERS);
    const empSheet = getOrCreateSheet(SHEET_EMPLOYEE, EMPLOYEE_HEADERS);

    if (action === 'ping') {
      return jsonResponse({
        success: true,
        message: 'Google Apps Script API is active!',
        spreadsheetName: SpreadsheetApp.getActiveSpreadsheet().getName(),
        spreadsheetId: SpreadsheetApp.getActiveSpreadsheet().getId()
      });
    }

    if (action === 'getDepartments') {
      return jsonResponse({ success: true, data: readSheetData(deptSheet, DEPARTMENT_HEADERS) });
    }

    if (action === 'getEmployees') {
      return jsonResponse({ success: true, data: readSheetData(empSheet, EMPLOYEE_HEADERS) });
    }

    const departments = readSheetData(deptSheet, DEPARTMENT_HEADERS);
    const employees = readSheetData(empSheet, EMPLOYEE_HEADERS);

    return jsonResponse({
      success: true,
      departments: departments,
      employees: employees,
      spreadsheetName: SpreadsheetApp.getActiveSpreadsheet().getName()
    });
  } catch (error) {
    return jsonResponse({ success: false, error: error.toString() });
  }
}

function doPost(e) {
  try {
    let payload = {};
    if (e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      payload = e.parameter;
    }

    const action = payload.action;
    const deptSheet = getOrCreateSheet(SHEET_DEPARTMENT, DEPARTMENT_HEADERS);
    const empSheet = getOrCreateSheet(SHEET_EMPLOYEE, EMPLOYEE_HEADERS);

    // DEPARTMENT CRUD
    if (action === 'createDepartment') {
      const item = payload.data;
      const existing = findRowIndexById(deptSheet, 1, item.DepartmentID);
      if (existing > -1) return jsonResponse({ success: false, error: 'DepartmentID already exists' });
      deptSheet.appendRow([item.DepartmentID, item.DepartmentName, item.Note || '']);
      return jsonResponse({ success: true, data: item });
    }

    if (action === 'updateDepartment') {
      const item = payload.data;
      const rowIndex = findRowIndexById(deptSheet, 1, item.DepartmentID);
      if (rowIndex === -1) return jsonResponse({ success: false, error: 'Department not found' });
      deptSheet.getRange(rowIndex, 1, 1, 3).setValues([[item.DepartmentID, item.DepartmentName, item.Note || '']]);
      return jsonResponse({ success: true, data: item });
    }

    if (action === 'deleteDepartment') {
      const departmentId = payload.DepartmentID || (payload.data && payload.data.DepartmentID);
      const rowIndex = findRowIndexById(deptSheet, 1, departmentId);
      if (rowIndex === -1) return jsonResponse({ success: false, error: 'Department not found' });
      deptSheet.deleteRow(rowIndex);
      return jsonResponse({ success: true, DepartmentID: departmentId });
    }

    // EMPLOYEE CRUD
    if (action === 'createEmployee') {
      const item = payload.data;
      const existing = findRowIndexById(empSheet, 1, item.EmployeeID);
      if (existing > -1) return jsonResponse({ success: false, error: 'EmployeeID already exists' });
      empSheet.appendRow([item.EmployeeID, item.Name, item.Gender || '', item.Phone || '', item.Address || '', item.DepartmentID || '']);
      return jsonResponse({ success: true, data: item });
    }

    if (action === 'updateEmployee') {
      const item = payload.data;
      const rowIndex = findRowIndexById(empSheet, 1, item.EmployeeID);
      if (rowIndex === -1) return jsonResponse({ success: false, error: 'Employee not found' });
      empSheet.getRange(rowIndex, 1, 1, 6).setValues([[item.EmployeeID, item.Name, item.Gender || '', item.Phone || '', item.Address || '', item.DepartmentID || '']]);
      return jsonResponse({ success: true, data: item });
    }

    if (action === 'deleteEmployee') {
      const employeeId = payload.EmployeeID || (payload.data && payload.data.EmployeeID);
      const rowIndex = findRowIndexById(empSheet, 1, employeeId);
      if (rowIndex === -1) return jsonResponse({ success: false, error: 'Employee not found' });
      empSheet.deleteRow(rowIndex);
      return jsonResponse({ success: true, EmployeeID: employeeId });
    }

    return jsonResponse({ success: false, error: 'Unknown action: ' + action });
  } catch (error) {
    return jsonResponse({ success: false, error: error.toString() });
  }
}

function readSheetData(sheet, headers) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];
  const values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  return values.map(row => {
    const obj = {};
    headers.forEach((h, idx) => obj[h] = row[idx] !== undefined && row[idx] !== null ? String(row[idx]) : '');
    return obj;
  });
}

function findRowIndexById(sheet, idColIndex, idValue) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return -1;
  const ids = sheet.getRange(2, idColIndex, lastRow - 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (String(ids[i][0]).trim() === String(idValue).trim()) return i + 2;
  }
  return -1;
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}`;

export const AppsScriptModal: React.FC<AppsScriptModalProps> = ({
  isOpen,
  onClose,
  connection,
  onSaveUrl,
  onTestConnection,
  onResetSampleData,
}) => {
  const [urlInput, setUrlInput] = useState(connection.webAppUrl || '');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'guide' | 'code' | 'sheets'>('guide');

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCodeText = () => {
    const blob = new Blob([APPS_SCRIPT_CODE], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'GoogleAppsScript_Code.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTesting(true);
    setTestResult(null);

    const cleanUrl = urlInput.trim();
    if (!cleanUrl) {
      await onSaveUrl('');
      setTestResult({
        success: true,
        message: 'Reverted to Local/Emulated Database Mode.',
      });
      setIsTesting(false);
      return;
    }

    const ok = await onTestConnection(cleanUrl);
    if (ok) {
      await onSaveUrl(cleanUrl);
      setTestResult({
        success: true,
        message: 'Connection successful! Google Apps Script Web App is connected.',
      });
    } else {
      setTestResult({
        success: false,
        message: 'Could not connect. Please ensure deployment is set to "Anyone" and check the URL.',
      });
    }
    setIsTesting(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl border border-slate-100 relative my-6 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Google Sheets & Apps Script Setup</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Backend API
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                ការកំណត់តភ្ជាប់ Google Sheets ជា Database និង Apps Script ជា Back-End
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

        {/* Sub Navigation */}
        <div className="flex border-b border-slate-200 mt-4 shrink-0 space-x-4 text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('guide')}
            className={`pb-2.5 border-b-2 transition ${
              activeSubTab === 'guide'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            1. ជំហានដំឡើង (Step-by-Step Guide)
          </button>
          <button
            onClick={() => setActiveSubTab('code')}
            className={`pb-2.5 border-b-2 transition flex items-center gap-1.5 ${
              activeSubTab === 'code'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>2. កូដ Code.gs (Apps Script Source)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('sheets')}
            className={`pb-2.5 border-b-2 transition flex items-center gap-1.5 ${
              activeSubTab === 'sheets'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>3. រចនាសម្ព័ន្ធតារាង (Sheets Schema)</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto py-4 flex-1 space-y-4 text-xs sm:text-sm text-slate-700">
          {activeSubTab === 'guide' && (
            <div className="space-y-4">
              {/* Web App URL input section */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <form onSubmit={handleTestAndSave} className="space-y-3">
                  <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-emerald-600" />
                      <span>Google Apps Script Web App URL</span>
                    </span>
                    <span className="font-normal text-slate-500">
                      {connection.isConnected ? '🟢 កំពុងភ្ជាប់ Live' : '⚪ កំពុងប្រើប្រាស់ Local/Demo'}
                    </span>
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                      className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                    <button
                      type="submit"
                      disabled={isTesting}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center justify-center space-x-1.5 shrink-0 transition"
                    >
                      {isTesting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Testing...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Test & Connect</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    ទុកប្រអប់នេះទំនេរ ប្រសិនបើអ្នកចង់ប្រើប្រាស់ទម្រង់សាកល្បង Local Emulation Database
                  </p>
                </form>

                {testResult && (
                  <div
                    className={`mt-3 p-3 rounded-lg border text-xs flex items-center space-x-2 ${
                      testResult.success
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-rose-50 border-rose-200 text-rose-800'
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    )}
                    <span>{testResult.message}</span>
                  </div>
                )}
              </div>

              {/* Step by step guide */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  របៀបបង្កើត Google Sheets & Apps Script ដោយងាយស្រួល ៥ ជំហាន៖
                </h4>

                <div className="flex items-start space-x-3 p-3 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs">បង្កើត Google Sheet ថ្មី</h5>
                    <p className="text-xs text-slate-600 mt-0.5">
                      ចូលទៅកាន់{' '}
                      <a
                        href="https://sheets.new"
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-600 font-semibold underline inline-flex items-center gap-0.5"
                      >
                        sheets.new <ExternalLink className="w-3 h-3" />
                      </a>{' '}
                      រួចដាក់ឈ្មោះ Sheet ឧ. "Employee Management DB"
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs">បើក Apps Script Editor</h5>
                    <p className="text-xs text-slate-600 mt-0.5">
                      នៅលើ Menu របស់ Google Sheet ចុចលើ <strong>Extensions (ផ្នែកបន្ថែម)</strong> &gt;{' '}
                      <strong>Apps Script</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                    3
                  </span>
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs">Paste កូដចូលក្នុង Code.gs</h5>
                    <p className="text-xs text-slate-600 mt-0.5">
                      ចុច Tab "2. កូដ Code.gs" ខាងលើ រួចចុច "Copy Code" យកទៅបិទភ្ជាប់ (Paste) ជំនួសកូដចាស់
                      រួចចុច <strong>Save (Ctrl+S)</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                    4
                  </span>
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs">
                      Deploy ជា Web App (សំខាន់: Who has access: Anyone)
                    </h5>
                    <p className="text-xs text-slate-600 mt-0.5">
                      ចុចប៊ូតុង <strong>Deploy</strong> (ខាងលើស្តាំ) &gt; <strong>New deployment</strong> &gt; ជ្រើសរើសប្រភេទ{' '}
                      <strong>Web app</strong>:<br />
                      • Execute as: <strong>Me</strong><br />
                      • Who has access: <strong className="text-emerald-700">Anyone (អ្នកណាក៏បាន)</strong><br />
                      ចុច Deploy &gt; Authorize access &gt; Allow
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                    5
                  </span>
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs">ចម្លង Web App URL មកបិទភ្ជាប់</h5>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Copy "Web app URL" (បញ្ចប់ដោយ <code>/exec</code>) យកមក Paste ក្នុងប្រអប់ខាងលើ រួចចុច "Test & Connect"!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'code' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-mono">File: Code.gs (Google Apps Script)</span>
                <div className="flex space-x-2">
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy Code.gs'}</span>
                  </button>
                  <button
                    onClick={handleDownloadCodeText}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .txt</span>
                  </button>
                </div>
              </div>

              <div className="relative">
                <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto max-h-96 leading-relaxed border border-slate-800">
                  <code>{APPS_SCRIPT_CODE}</code>
                </pre>
              </div>
            </div>
          )}

          {activeSubTab === 'sheets' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 mb-2">
                  <TableIcon className="w-4 h-4 text-emerald-600" />
                  <span>Table 1: Department (សន្លឹកកិច្ចការដេប៉ាតឺម៉ង់)</span>
                </h4>
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden text-xs">
                  <div className="grid grid-cols-3 bg-slate-900 text-white font-mono font-semibold py-2 px-3">
                    <div>A: DepartmentID</div>
                    <div>B: DepartmentName</div>
                    <div>C: Note</div>
                  </div>
                  <div className="grid grid-cols-3 py-2 px-3 border-t border-slate-100 font-mono text-slate-600">
                    <div>DEP-001</div>
                    <div>Information Technology</div>
                    <div>Software &amp; System Infrastructure</div>
                  </div>
                  <div className="grid grid-cols-3 py-2 px-3 border-t border-slate-100 font-mono text-slate-600">
                    <div>DEP-002</div>
                    <div>Human Resources</div>
                    <div>Recruitment &amp; Talent Management</div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 mb-2">
                  <TableIcon className="w-4 h-4 text-emerald-600" />
                  <span>Table 2: Employee (សន្លឹកកិច្ចការបុគ្គលិក)</span>
                </h4>
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden text-xs overflow-x-auto">
                  <div className="grid grid-cols-6 min-w-[550px] bg-slate-900 text-white font-mono font-semibold py-2 px-3">
                    <div>EmployeeID</div>
                    <div>Name</div>
                    <div>Gender</div>
                    <div>Phone</div>
                    <div>Address</div>
                    <div>DepartmentID</div>
                  </div>
                  <div className="grid grid-cols-6 min-w-[550px] py-2 px-3 border-t border-slate-100 font-mono text-slate-600">
                    <div>EMP-1001</div>
                    <div>Chen Sokha</div>
                    <div>Male</div>
                    <div>012 345 678</div>
                    <div>Phnom Penh</div>
                    <div>DEP-001</div>
                  </div>
                  <div className="grid grid-cols-6 min-w-[550px] py-2 px-3 border-t border-slate-100 font-mono text-slate-600">
                    <div>EMP-1002</div>
                    <div>Pich Bopha</div>
                    <div>Female</div>
                    <div>098 765 432</div>
                    <div>Siem Reap</div>
                    <div>DEP-002</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onResetSampleData}
            className="text-xs text-slate-500 hover:text-slate-800 underline"
          >
            Reset local sample data
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition"
          >
            រួចរាល់ (Done)
          </button>
        </div>
      </div>
    </div>
  );
};

function TableIcon(props: any) {
  return <Layers {...props} />;
}
