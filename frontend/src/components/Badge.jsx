import React from 'react';

const Badge = ({ children, variant = 'default', size = 'sm', className = '' }) => {
  const variantStyles = {
    default: 'bg-slate-800 text-slate-300 border-slate-700',
    primary: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    danger: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    purple: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    cyan: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    // Difficulty presets
    EASY: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-semibold',
    MEDIUM: 'bg-amber-500/15 text-amber-400 border-amber-500/30 font-semibold',
    HARD: 'bg-rose-500/15 text-rose-400 border-rose-500/30 font-semibold',
    MIXED: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30 font-semibold',
    // Status presets
    ACCEPTED: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-semibold',
    WRONG_ANSWER: 'bg-rose-500/15 text-rose-400 border-rose-500/30 font-semibold',
    TIME_LIMIT_EXCEEDED: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    COMPILATION_ERROR: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    RUNTIME_ERROR: 'bg-red-500/15 text-red-400 border-red-500/30',
  };

  const sizeStyles = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  };

  const style = variantStyles[variant] || variantStyles.default;
  const sizeStyle = sizeStyles[size] || sizeStyles.sm;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border font-medium transition-colors ${style} ${sizeStyle} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
