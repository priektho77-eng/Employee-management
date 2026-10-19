import React, { useState } from 'react';
import {
  Users,
  Building2,
  FileSpreadsheet,
  Share2,
  Code2,
  Database,
  BarChart3,
  RefreshCw,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { ActiveTab, ConnectionConfig } from '../types';

interface SidebarProps {
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

export const Sidebar: React.FC<SidebarProps> = ({
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      id: 'employees' as ActiveTab,
      labelKh: 'បុគ្គលិក',
      labelEn: 'Employees',
      icon: Users,
      count: totalEmployees,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      id: 'departments' as ActiveTab,
      labelKh: 'ផ្នែក / ដេប៉ាតឺម៉ង់',
      labelEn: 'Departments',
      icon: Building2,
      count: totalDepartments,
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    },
    {
      id: 'analytics' as ActiveTab,
      labelKh: 'ទិដ្ឋភាពទូទៅ & ស្ថិតិ',
      labelEn: 'Overview & Analytics',
      icon: BarChart3,
    },
    {
      id: 'script-setup' as ActiveTab,
      labelKh: 'Google Sheets & Code.gs',
      labelEn: 'Backend Setup',
      icon: Code2,
    },
  ];

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* =========================================================================
          MOBILE TOP BAR (Visible only on screens smaller than md)
          ========================================================================= */}
      <div className="md:hidden sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 -ml-1 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold leading-tight">Employee MS</h1>
              <p className="text-[10px] text-emerald-400 font-medium">Google Sheets DB</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Refresh button */}
          <button
            onClick={onRefreshData}
            disabled={isSyncing}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition"
            title="Sync Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
          {/* Share button */}
          <button
            onClick={onOpenShareModal}
            className="p-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm transition"
            title="Share Project"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          MOBILE OVERLAY BACKDROP
          ========================================================================= */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* =========================================================================
          LEFT SIDEBAR NAVBAR (Persistent on desktop md+, Slide-over on mobile)
          ========================================================================= */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 md:z-30 h-screen w-72 bg-slate-900 border-r border-slate-800 text-white flex flex-col justify-between shadow-2xl transition-transform duration-200 ease-in-out shrink-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top: Branding & Close button for mobile */}
        <div>
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-400/30">
                <FileSpreadsheet className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                  <span>Employee MS</span>
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                </h1>
                <p className="text-[11px] text-slate-400 font-medium">
                  Google Sheets &amp; Apps Script
                </p>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Connection status card */}
          <div className="p-4">
            <div
              onClick={onOpenAppsScriptModal}
              className={`p-3 rounded-xl border cursor-pointer transition group ${
                connection.isConnected
                  ? 'bg-emerald-950/40 border-emerald-500/30 hover:border-emerald-500/50'
                  : 'bg-amber-950/30 border-amber-500/30 hover:border-amber-500/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      connection.isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                    }`}
                  />
                  <span className="text-xs font-semibold text-slate-200">
                    {connection.isConnected ? 'Google Sheets Live' : 'Local / Demo DB'}
                  </span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1 truncate">
                {connection.isConnected ? 'Apps Script Connected' : 'Click to configure Sheets API'}
              </p>
            </div>
          </div>

          {/* Main Navigation Items (Vertical on Left) */}
          <div className="px-3 py-2 space-y-1">
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              ម៉ឺនុយចម្បង (Navigation)
            </p>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600/30 to-emerald-500/10 text-emerald-300 border border-emerald-500/30 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon
                      className={`w-4 h-4 transition ${
                        isActive
                          ? 'text-emerald-400'
                          : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    />
                    <div className="text-left">
                      <span className="block font-semibold text-xs">{item.labelKh}</span>
                      <span className="text-[10px] opacity-70 block">{item.labelEn}</span>
                    </div>
                  </div>

                  {item.count !== undefined && (
                    <span
                      className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${
                        item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Actions Section */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          {/* Sync Button */}
          <button
            onClick={onRefreshData}
            disabled={isSyncing}
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-400' : ''}`} />
            <span>{isSyncing ? 'កំពុង Sync ទិន្នន័យ...' : 'Sync / Refresh Sheets'}</span>
          </button>

          {/* Share Project Link Button */}
          <button
            onClick={onOpenShareModal}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-700/30 transition transform active:scale-95"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>ចែករំលែក Link គម្រោង</span>
          </button>

          {/* Quick Script Code Modal trigger */}
          <button
            onClick={onOpenAppsScriptModal}
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium transition"
          >
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>ទាញយក Code.gs</span>
          </button>

          {/* Footer note */}
          <div className="pt-2 text-center text-[10px] text-slate-500">
            Google Sheets DB &bull; Apps Script API
          </div>
        </div>
      </aside>
    </>
  );
};
