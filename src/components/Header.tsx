import React from 'react';
import { User } from '../types/index.ts';

interface HeaderProps {
  currentUser: User;
  onRoleToggle: (newRole: 'faculty' | 'student') => void;
  onOpenNewRubric: () => void;
  onResetDemo: () => void;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onRoleToggle,
  onOpenNewRubric,
  onResetDemo,
  onToggleMobileMenu,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full h-16 shrink-0 bg-white border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-6 lg:px-8 gap-3 sm:gap-4">
      {/* Left: Mobile Toggle + University Selector + Role Switcher */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0 shrink-0">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            type="button"
            title="Toggle Menu"
          >
            <span className="material-symbols-outlined text-[22px]">menu</span>
          </button>
        )}

        {/* University Selector: properly contained inside top header, never floating */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200/80 whitespace-nowrap shrink-0">
          <span className="material-symbols-outlined text-[16px] text-blue-600 shrink-0">school</span>
          <span className="hidden 2xl:inline">Stanford University · Dept of Computer Science</span>
          <span className="2xl:hidden">Stanford University / CS</span>
        </div>

        {/* Role Switcher */}
        <div className="flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200/80 shrink-0">
          <button
            onClick={() => onRoleToggle('faculty')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              currentUser.role === 'faculty'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            type="button"
          >
            Faculty View
          </button>
          <button
            onClick={() => onRoleToggle('student')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              currentUser.role === 'student'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            type="button"
          >
            Student View
          </button>
        </div>
      </div>

      {/* Right: Actions, Course selector, Notification, Profile */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        {currentUser.role === 'faculty' && (
          <button
            onClick={onOpenNewRubric}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs whitespace-nowrap cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            <span>New Rubric</span>
          </button>
        )}

        <button
          onClick={onResetDemo}
          title="Reset database to initial verified state"
          className="hidden md:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/70 text-slate-700 text-xs font-medium border border-slate-200 transition-colors whitespace-nowrap cursor-pointer"
          type="button"
        >
          <span className="material-symbols-outlined text-[15px] text-slate-500">restart_alt</span>
          <span>Reset Demo</span>
        </button>

        {/* Course selector */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200/60 whitespace-nowrap shrink-0">
          <span className="material-symbols-outlined text-[15px] text-slate-500 shrink-0">calendar_today</span>
          <span className="whitespace-nowrap">Fall 2024 / CS231n</span>
        </div>

        {/* Notification */}
        <button
          type="button"
          className="relative w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          title="Notifications"
        >
          <span className="material-symbols-outlined text-[18px]">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>

        {/* Faculty profile */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 shrink-0">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-semibold text-slate-900 leading-none whitespace-nowrap">
              {currentUser.name}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 whitespace-nowrap">
              {currentUser.title || (currentUser.role === 'faculty' ? 'CS Chair & Evaluator' : 'Undergrad · AI Specialization')}
            </span>
          </div>
          <img
            alt={currentUser.name}
            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-300 shrink-0"
            src={
              currentUser.avatarUrl ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
            }
          />
        </div>
      </div>
    </header>
  );
};
