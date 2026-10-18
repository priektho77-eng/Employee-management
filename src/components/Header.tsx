import React from 'react';
import {
  Users,
  Building2,
  FileSpreadsheet,
  Share2,
  Code2,
  CheckCircle2,
  AlertCircle,
  Database,
  BarChart3,
  RefreshCw,
} from 'lucide-react';
import { ActiveTab, ConnectionConfig } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  connection: ConnectionConfig;
  onOpenAppsScriptModal: () => void;
  onOpenShareModal: () => void;
  onRefreshData: () => void;
  isSyncing: boolean;
  totalEmployees: number;
  totalDepartments: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  connection,
  onOpenAppsScriptModal,
  onOpenShareModal,
  onRefreshData,
  isSyncing,
  totalEmployees,
  totalDepartments,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-400/30">
              <FileSpreadsheet className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  <span>Employee Management</span>
                  <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                    Google Sheets + Apps Script
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                ប្រព័ន្ធគ្រប់គ្រងបុគ្គលិក & ដេប៉ាតឺម៉ង់ (Database: Google Sheets)
              </p>
            </div>
          </div>

          {/* Action Buttons & Status */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Connection Status Pill */}
            <button
              onClick={onOpenAppsScriptModal}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                connection.isConnected
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/50'
                  : 'bg-amber-950/50 text-amber-300 border-amber-500/30 hover:bg-amber-900/40'
              }`}
              title="Click to configure Google Apps Script connection"
            >
              {connection.isConnected ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="font-semibold">Google Sheets Live</span>
                </>
              ) : (
                <>
                  <Database className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-medium">Local/Demo DB</span>
                </>
              )}
            </button>

            {/* Refresh / Sync Button */}
            <button
              onClick={onRefreshData}
              disabled={isSyncing}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
              title="Refresh / Sync Data"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-emerald-400' : ''}`} />
            </button>

            {/* Apps Script Code & Setup Button */}
            <button
              onClick={onOpenAppsScriptModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium border border-slate-700 transition shadow-sm"
            >
              <Code2 className="w-4 h-4 text-cyan-400" />
              <span className="hidden md:inline">Apps Script Code</span>
            </button>

            {/* Share Project Link Button */}
            <button
              onClick={onOpenShareModal}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-700/30 transition transform active:scale-95"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share Link</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 border-t border-slate-800/80 pt-2 pb-2">
          <button
            onClick={() => setActiveTab('employees')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'employees'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Employees (បុគ្គលិក)</span>
            <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-slate-800 text-slate-300 font-semibold">
              {totalEmployees}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('departments')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'departments'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Department (ផ្នែក / ដេប៉ាតឺម៉ង់)</span>
            <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-slate-800 text-slate-300 font-semibold">
              {totalDepartments}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'analytics'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Overview & Analytics</span>
            <span className="sm:hidden">Stats</span>
          </button>

          <button
            onClick={() => setActiveTab('script-setup')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'script-setup'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Google Sheets & Code.gs</span>
          </button>
        </div>
      </div>
    </header>
  );
};
