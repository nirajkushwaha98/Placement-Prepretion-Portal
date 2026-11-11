import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandMark from './BrandMark';
import {
  LayoutDashboard, Calculator, Code2, FileText,
  MessageSquare, LineChart, User,
  Shield, Users, HelpCircle, Terminal,
  MessageCircle, FileSpreadsheet, LogOut
} from 'lucide-react';

const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const { user, logout, isAdmin } = useAuth();

  const studentLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Aptitude Tests', path: '/aptitude', icon: Calculator },
    { name: 'Coding Practice', path: '/coding', icon: Code2 },
    { name: 'Resume Analyzer', path: '/resume', icon: FileText },
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

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#16181D]/45 backdrop-blur-xs lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <aside
        aria-label="Workspace sidebar"
        className={`fixed top-0 bottom-0 left-0 z-40 flex w-64 flex-col border-r border-[#E2DDD3] bg-[#FCFBF8] transition-transform duration-300 lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand header (non-H1 so main content holds unique H1) */}
        <div className="flex min-h-16 items-center gap-3 px-5 py-3 border-b border-[#E2DDD3]">
          <BrandMark className="h-9 w-9 shrink-0 shadow-2xs" />
          <div className="min-w-0">
            <p className="text-base font-extrabold tracking-tight text-[#16181D] flex items-center gap-1.5 leading-tight">
              <span>PlacementPortal</span>
              <span className="inline-block h-2 w-2 rounded-full bg-[#15803D]" title="Live workspace" />
            </p>
            <p className="text-xs font-medium text-[#474D59] mt-0.5">
              {isAdmin ? 'Admin Console' : 'Preparation Suite'}
            </p>
          </div>
        </div>

        {/* Role badge / Profile link card */}
        <div className="px-4 py-3.5 border-b border-[#EFECE5]">
          <Link
            to={isAdmin ? '/admin/profile' : '/profile'}
            onClick={closeSidebar}
            className="w-full text-left flex items-center gap-2.5 rounded-xl border border-[#E2DDD3] bg-white p-2.5 shadow-[0_1px_2px_rgba(22,24,29,0.03)] hover:border-[#C9C1B2] hover:bg-[#FAF8F3] transition-all group"
          >
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-extrabold text-xs transition-transform group-hover:scale-105 ${
              isAdmin
                ? 'bg-[#F5F2FF] text-[#6D28D9] border border-[#DDD6FE]'
                : 'bg-[#16181D] text-white'
            }`}>
              {(user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#16181D] group-hover:text-[#1D4ED8] transition-colors truncate">
                {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.name || user?.username || 'Student'}
              </p>
              <p className="text-xs text-[#474D59] truncate">{user?.email}</p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-md font-bold shrink-0 border ${
              isAdmin
                ? 'bg-[#F5F2FF] text-[#6D28D9] border-[#DDD6FE]'
                : 'bg-[#EFECE5] text-[#474D59] border-[#D7D1C5]'
            }`}>
              {user?.role}
            </span>
          </Link>
        </div>

        {/* Navigation links */}
        <nav aria-label="Primary navigation" className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          <p className="px-3 pb-1.5 text-xs font-bold text-[#474D59]">
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
                  `relative flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-all duration-150 ${
                    isActive
                      ? 'bg-[#16181D] text-white font-bold shadow-[0_2px_6px_rgba(22,24,29,0.14)] before:absolute before:left-1 before:top-2 before:bottom-2 before:w-[3px] before:rounded-full before:bg-[#1D4ED8]'
                      : 'text-[#474D59] font-medium hover:bg-[#EFECE5]/80 hover:text-[#16181D]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3 pl-1">
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-[#474D59]'}`} />
                      <span>{link.name}</span>
                    </div>
                    {link.badge && (
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                          isActive
                            ? 'bg-[#2B303B] text-white border-[#3F4654]'
                            : 'bg-[#FEF6E6] text-[#92400E] border-[#F3D9A4]'
                        }`}
                      >
                        {link.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="p-3 border-t border-[#E2DDD3] bg-[#F9F7F2]">
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-[#BE123C] border border-transparent hover:bg-[#FFF1F2] hover:border-[#FECDD3] transition-colors cursor-pointer"
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
