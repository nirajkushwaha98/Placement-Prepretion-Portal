import React from 'react';

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'blue',
  onClick,
  className = '',
}) => {
  const colorMap = {
    blue: {
      bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      gradient: 'from-blue-500/10 via-transparent to-transparent',
    },
    indigo: {
      bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      gradient: 'from-indigo-500/10 via-transparent to-transparent',
    },
    emerald: {
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      gradient: 'from-emerald-500/10 via-transparent to-transparent',
    },
    purple: {
      bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      gradient: 'from-purple-500/10 via-transparent to-transparent',
    },
    amber: {
      bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      gradient: 'from-amber-500/10 via-transparent to-transparent',
    },
    rose: {
      bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      gradient: 'from-rose-500/10 via-transparent to-transparent',
    },
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg backdrop-blur-sm transition-all duration-200 hover:border-slate-700 hover:shadow-slate-900/50 ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      } ${className}`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${scheme.gradient} pointer-events-none`}
      />
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-2xl font-bold tracking-tight text-white">{value}</h3>
            {trend && (
              <span
                className={`text-xs font-medium ${
                  trend.isPositive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {trend.isPositive ? '↑' : '↓'} {trend.text}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
          )}
        </div>

        {Icon && (
          <div className={`rounded-lg border p-2.5 ${scheme.bg}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
