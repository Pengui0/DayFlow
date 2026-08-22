import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { cn } from '../../lib/utils';

export function DashboardLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-zinc-900 flex flex-col font-sans transition-colors relative overflow-x-hidden">
      {/* Subtle Apple-style Ambient Canvas Depth */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-zinc-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-zinc-200/20 rounded-full blur-3xl" />
      </div>

      {/* Sidebar */}
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative z-10 min-h-screen">
        <Topbar isCollapsed={isCollapsed} />

        <main
          className={cn(
            'flex-1 p-4 sm:p-6 lg:p-8 transition-all duration-300',
            isCollapsed ? 'md:ml-20' : 'md:ml-64'
          )}
        >
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
