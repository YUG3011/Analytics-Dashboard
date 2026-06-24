import { useEffect, useState, useRef } from 'react';
import { Users, BarChart3, MousePointerClick, Eye, TrendingUp } from 'lucide-react';

const CARDS = [
  {
    key: 'totalSessions',
    label: 'Total Sessions',
    sub: 'Unique visitor sessions',
    icon: Users,
    color: '#a855f7',
    glow: 'rgba(168,85,247,0.4)',
    gradFrom: '#a855f7',
    gradTo: '#7c3aed',
    bg: 'rgba(168,85,247,0.06)',
    border: 'rgba(168,85,247,0.15)',
    ringColor: '#a855f7',
  },
  {
    key: 'totalEvents',
    label: 'Total Events',
    sub: 'All captured interactions',
    icon: BarChart3,
    color: '#22d3ee',
    glow: 'rgba(34,211,238,0.4)',
    gradFrom: '#22d3ee',
    gradTo: '#0891b2',
    bg: 'rgba(34,211,238,0.05)',
    border: 'rgba(34,211,238,0.12)',
    ringColor: '#22d3ee',
  },
  {
    key: 'totalClicks',
    label: 'Total Clicks',
    sub: 'Click interactions recorded',
    icon: MousePointerClick,
    color: '#10b981',
    glow: 'rgba(16,185,129,0.4)',
    gradFrom: '#10b981',
    gradTo: '#059669',
    bg: 'rgba(16,185,129,0.05)',
    border: 'rgba(16,185,129,0.12)',
    ringColor: '#10b981',
  },
  {
    key: 'totalPageViews',
    label: 'Page Views',
    sub: 'Pages visited by users',
    icon: Eye,
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.4)',
    gradFrom: '#f59e0b',
    gradTo: '#d97706',
    bg: 'rgba(245,158,11,0.05)',
    border: 'rgba(245,158,11,0.12)',
    ringColor: '#f59e0b',
  },
];

// Animated counter
function useCounter(target, duration = 1400) {
  const [count, setCount] = useState(0);
  const prevTarget = useRef(0);

  useEffect(() => {
    if (target === prevTarget.current) return;
    prevTarget.current = target;

    const start = Date.now();
    const from = 0;

    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      setCount(Math.round(from + (target - from) * ease));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);

  return count;
}

// Circular progress ring
function Ring({ value, max = 100, color, size = 80, strokeWidth = 5 }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  const offset = circ * (1 - pct);

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={strokeWidth}
      />
      {/* Progress */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{
          transition: 'stroke-dashoffset 1.4s cubic-bezier(0.16,1,0.3,1)',
          filter: `drop-shadow(0 0 6px ${color})`,
        }}
      />
    </svg>
  );
}

function StatCard({ card, value, loading, index, maxValue }) {
  const Icon = card.icon;
  const animated = useCounter(loading ? 0 : value);

  if (loading) {
    return (
      <div
        className="bento-card p-6 relative overflow-hidden"
        style={{ animationDelay: `${index * 0.08}s` }}
      >
        <div className="flex items-start justify-between mb-5">
          <div className="skeleton h-3 w-28 rounded-full" />
          <div className="skeleton w-20 h-20 rounded-full" />
        </div>
        <div className="skeleton h-10 w-24 rounded-xl mb-2" />
        <div className="skeleton h-3 w-32 rounded-full" />
      </div>
    );
  }

  return (
    <div
      className="bento-card p-6 relative overflow-hidden animate-fade-in-up group cursor-default"
      style={{
        background: `linear-gradient(135deg, ${card.bg} 0%, rgba(13,17,23,0.95) 100%)`,
        border: `1px solid ${card.border}`,
        animationDelay: `${index * 0.08}s`,
      }}
    >
      {/* Background radial glow */}
      <div
        className="absolute -right-12 -top-12 w-48 h-48 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-500"
        style={{ background: `radial-gradient(circle, ${card.color} 0%, transparent 70%)` }}
      />

      {/* Top row: label + ring */}
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Icon style={{ width: 15, height: 15, color: card.color }} />
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: card.color }}>
              {card.label}
            </p>
          </div>
          <p className="text-[11px] text-slate-600">{card.sub}</p>
        </div>
        {/* Ring */}
        <div className="relative flex-shrink-0">
          <Ring
            value={value}
            max={maxValue || (value * 1.5) || 100}
            color={card.ringColor}
            size={72}
            strokeWidth={5}
          />
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ color: card.color }}
          >
            <Icon style={{ width: 20, height: 20 }} />
          </div>
        </div>
      </div>

      {/* Value */}
      <div className="relative z-10">
        <span
          className="text-5xl font-black tracking-tight leading-none"
          style={{
            background: `linear-gradient(135deg, #ffffff 0%, ${card.color} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {animated.toLocaleString()}
        </span>
      </div>

      {/* Bottom badge */}
      <div className="flex items-center gap-2 mt-4 relative z-10">
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
          style={{
            background: `${card.color}18`,
            border: `1px solid ${card.color}30`,
            color: card.color,
          }}
        >
          <TrendingUp style={{ width: 9, height: 9 }} />
          Live tracking
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsCards({ summary, loading }) {
  // Compute max for ring scaling
  const maxValue = summary
    ? Math.max(
        summary.totalSessions || 0,
        summary.totalEvents || 0,
        summary.totalClicks || 0,
        summary.totalPageViews || 0,
      )
    : 100;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      {CARDS.map((card, i) => (
        <StatCard
          key={card.key}
          card={card}
          value={summary?.[card.key] ?? 0}
          loading={loading}
          index={i}
          maxValue={maxValue}
        />
      ))}
    </div>
  );
}
