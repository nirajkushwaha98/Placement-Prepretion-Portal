import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Menu, Bell, Search, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ onMobileMenuClick }) => {
  const { user, isStudent, isAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-900/80 px-4 sm:px-6 backdrop-blur-md">
      {/* Left items: Mobile toggle + Breadcrumb / Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuClick}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden cursor-pointer"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
          <span className="font-semibold text-slate-200">
            {isAdmin ? 'Administration Portal' : 'Student Preparation Hub'}
          </span>
        </div>
      </div>

      {/* Right items: Quick actions & profile */}
      <div className="flex items-center gap-3">
        {isStudent && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-semibold">
            <Flame className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span>Daily Streak Active</span>
          </div>
        )}

        <button
          onClick={() => navigate(isAdmin ? '/admin/profile' : '/profile')}
          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer group"
        >
          <div className={`flex h-7 w-7 items-center justify-center rounded-full text-white font-bold text-xs group-hover:scale-105 transition-transform ${
            isAdmin ? 'bg-gradient-to-tr from-purple-600 to-indigo-600' : 'bg-gradient-to-tr from-blue-600 to-indigo-600'
          }`}>
            {(user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase()}
          </div>
          <span className="text-xs font-medium text-slate-200 hidden sm:inline group-hover:text-white transition-colors">
            {user?.first_name ? `${user.first_name}` : user?.name || user?.username || (isAdmin ? 'Admin' : 'Student')}
          </span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
