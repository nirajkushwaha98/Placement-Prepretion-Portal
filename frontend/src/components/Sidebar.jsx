import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Calculator, Code2, FileText,
  Briefcase, MessageSquare, LineChart, User,
  Shield, Users, HelpCircle, Terminal,
  MessageCircle, FileSpreadsheet, LogOut, Sparkles
} from 'lucide-react';

const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const { user, logout, isStudent, isAdmin } = useAuth();
  const navigate = useNavigate();

  const studentLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Aptitude Tests', path: '/aptitude', icon: Calculator },
    { name: 'Coding Practice', path: '/coding', icon: Code2 },
    { name: 'Resume Analyzer', path: '/resume', icon: FileText },
    { name: 'Job Matcher', path: '/job-match', icon: Briefcase },
    { name: 'Interview Prep', path: '/interview', icon: MessageSquare },
    { name: 'Progress & Analytics', path: '/progress', icon: LineChart },
    { name: 'My Profile', path: '/profile', icon: User },
  ];

  const adminLinks = [
    { name: 'Admin Dashboard', path: '/admin/dashboard', icon: Shield },
    { name: 'Student Roster', path: '/admin/students', icon: Users },
    { name: 'Aptitude Questions', path: '/admin/questions', icon: HelpCircle },
    { name: 'Coding Problems', path: '/admin/coding', icon: Terminal },
    { name: 'Interview Questions', path: '/admin/interview', icon: MessageCircle },
    { name: 'Performance Reports', path: '/admin/reports', icon: FileSpreadsheet },
    { name: 'Admin Profile', path: '/admin/profile', icon: User },
  ];

  const navLinks = isAdmin ? adminLinks : studentLinks;

  const closeSidebar = () => {
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  const handleProfileClick = () => {
    navigate(isAdmin ? '/admin/profile' : '/profile');
    closeSidebar();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex w-64 flex-col border-r border-slate-800 bg-slate-900/95 backdrop-blur-md transition-transform duration-300 lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="flex h-16 items-center gap-3 px-6 border-b border-slate-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-md shadow-blue-500/20 text-white font-black text-lg">
            P
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              PlacementPortal
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
            </h1>
            <p className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
              {isAdmin ? 'Admin Console' : 'Preparation Suite'}
            </p>
          </div>
        </div>

        {/* Role badge / Profile clickable card */}
        <div className="px-4 py-3">
          <div
            onClick={handleProfileClick}
            className="flex items-center gap-2.5 rounded-xl border border-slate-800/80 bg-slate-800/40 p-2.5 hover:bg-slate-800/80 hover:border-slate-700 transition-all cursor-pointer group"
          >
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg font-bold text-xs group-hover:scale-105 transition-transform ${
              isAdmin ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
            }`}>
              {(user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white group-hover:text-purple-300 transition-colors truncate">
                {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.name || user?.username || 'Student'}
              </p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
            </div>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
              isAdmin ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
            }`}>
              {user?.role}
            </span>
          </div>
        </div>

        {/* Navigation links */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Navigation
          </p>
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{link.name}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
