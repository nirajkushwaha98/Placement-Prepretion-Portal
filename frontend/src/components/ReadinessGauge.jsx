import React from 'react';
import Badge from './Badge';

const ReadinessGauge = ({ score = 0, tier = 'Beginner', moduleScores = {}, size = 'md' }) => {
  const clampedScore = Math.min(100, Math.max(0, Math.round(score)));

  // Color calculation based on tier / score
  const getTierColor = () => {
    if (clampedScore >= 91) return { stroke: '#10b981', text: 'text-emerald-400', badge: 'success' };
    if (clampedScore >= 76) return { stroke: '#3b82f6', text: 'text-blue-400', badge: 'primary' };
    if (clampedScore >= 61) return { stroke: '#8b5cf6', text: 'text-purple-400', badge: 'purple' };
    if (clampedScore >= 41) return { stroke: '#f59e0b', text: 'text-amber-400', badge: 'warning' };
    return { stroke: '#f43f5e', text: 'text-rose-400', badge: 'danger' };
  };

  const colors = getTierColor();

  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {/* Circular Progress Gauge */}
      <div className="relative flex items-center justify-center">
        <svg className="w-44 h-44 -rotate-90 transform" viewBox="0 0 160 160">
          {/* Background track */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="#1e293b"
            strokeWidth="12"
            fill="transparent"
          />
          {/* Animated active stroke */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke={colors.stroke}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center score readout */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className={`text-4xl font-extrabold tracking-tight ${colors.text}`}>
            {clampedScore}
          </span>
          <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold mt-0.5">
            / 100
          </span>
        </div>
      </div>

      {/* Tier Label */}
      <div className="mt-3 flex flex-col items-center gap-1">
        <Badge variant={colors.badge} size="md" className="font-bold tracking-wide">
          {tier}
        </Badge>
        <p className="text-xs text-slate-400 mt-1">Placement Readiness Index</p>
      </div>

      {/* Module Quick Pills */}
      {moduleScores && Object.keys(moduleScores).length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-2 w-full pt-3 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg bg-slate-800/50">
            <span className="text-slate-400">Aptitude</span>
            <span className="font-semibold text-slate-200">{moduleScores.aptitude ?? 0}%</span>
          </div>
          <div className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg bg-slate-800/50">
            <span className="text-slate-400">Coding</span>
            <span className="font-semibold text-slate-200">{moduleScores.coding ?? 0}%</span>
          </div>
          <div className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg bg-slate-800/50">
            <span className="text-slate-400">Resume</span>
            <span className="font-semibold text-slate-200">{moduleScores.resume ?? 0}/100</span>
          </div>
          <div className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg bg-slate-800/50">
            <span className="text-slate-400">Interview</span>
            <span className="font-semibold text-slate-200">{moduleScores.interview ?? 0}/100</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadinessGauge;
