import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSessionJourney } from '../api';
import EventTimeline from '../components/EventTimeline';
import {
  ArrowLeft, Activity, MousePointerClick, Eye,
  Clock, Copy, Check, Globe, Hash
} from 'lucide-react';

// Animated ring for stats
function StatRing({ value, max, color, size = 60, strokeWidth = 4 }) {
  const r    = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const pct  = max > 0 ? Math.min(value / max, 1) : 0;

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
      <circle
        cx={size/2} cy={size/2} r={r}
        fill="none" stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - pct)}
        style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)', filter: `drop-shadow(0 0 4px ${color})` }}
      />
    </svg>
  );
}

function StatCard({ icon: Icon, label, value, color, bg, border, max = 1 }) {
  return (
    <div
      className="bento-card p-5 flex items-center gap-4 animate-fade-in"
      style={{ background: bg, borderColor: border }}
    >
      {/* Ring */}
      <div className="relative flex-shrink-0">
        <StatRing value={value} max={max} color={color} />
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon style={{ width: 18, height: 18, color }} />
        </div>
      </div>
      <div>
        <p className="text-2xl font-black leading-none" style={{ color }}>{value}</p>
        <p className="text-[11px] text-slate-600 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function SkeletonStatCard() {
  return (
    <div className="bento-card p-5 flex items-center gap-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
      <div className="skeleton w-14 h-14 rounded-full flex-shrink-0" />
      <div className="space-y-1.5">
        <div className="skeleton h-7 w-10 rounded" />
        <div className="skeleton h-3 w-20 rounded" />
      </div>
    </div>
  );
}

export default function SessionDetailsPage() {
  const { sessionId } = useParams();
  const navigate      = useNavigate();

  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [copied,  setCopied]  = useState(false);

  useEffect(() => {
    if (!sessionId) return;

    const load = async () => {
      try {
        setLoading(true);
        const res = await getSessionJourney(sessionId);
        if (res.success) {
          setEvents(res.data);
          setError(null);
        } else {
          setError('Failed to load session journey.');
        }
      } catch {
        setError('Could not connect to the analytics server.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [sessionId]);

  // Derived stats
  const totalEvents    = events.length;
  const clickEvents    = events.filter(e => e.eventType === 'click').length;
  const pageViewEvents = events.filter(e => e.eventType === 'page_view').length;
  const uniquePages    = [...new Set(events.map(e => e.pageUrl))].length;

  const firstEvent  = events[0];
  const lastEvent   = events[events.length - 1];
  const durationMs  = firstEvent && lastEvent
    ? new Date(lastEvent.timestamp) - new Date(firstEvent.timestamp)
    : 0;
  const durationStr = durationMs > 0
    ? `${Math.floor(durationMs / 60000)}m ${Math.floor((durationMs % 60000) / 1000)}s`
    : '< 1s';

  const handleCopy = () => {
    navigator.clipboard.writeText(sessionId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-8 pb-12">

      {/* ── Header ── */}
      <div className="flex flex-col gap-5 animate-fade-in-up">
        {/* Breadcrumb row */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/sessions')}
            className="btn-ghost w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          >
            <ArrowLeft style={{ width: 16, height: 16 }} className="text-slate-400" />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span
              className="hover:text-purple-400 cursor-pointer transition-colors"
              onClick={() => navigate('/sessions')}
            >
              Sessions
            </span>
            <span>/</span>
            <span className="text-slate-400 font-medium">Journey</span>
          </div>
        </div>

        <div>
          <div className="chip-purple mb-3">Session Inspector</div>
          <h1
            className="text-4xl font-black tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #d8b4fe 60%, #22d3ee 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Journey Timeline
          </h1>
        </div>

        {/* Session ID badge */}
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-2xl"
          style={{ background: 'rgba(13,17,23,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <Hash style={{ width: 14, height: 14 }} className="text-purple-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mb-0.5">Session ID</p>
            <code className="mono text-xs text-purple-300 break-all">{sessionId}</code>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1.5 rounded-xl flex-shrink-0 transition-all"
            style={{
              background: copied ? 'rgba(16,185,129,0.12)' : 'rgba(168,85,247,0.1)',
              border: `1px solid ${copied ? 'rgba(16,185,129,0.25)' : 'rgba(168,85,247,0.2)'}`,
              color: copied ? '#6ee7b7' : '#d8b4fe',
            }}
          >
            {copied ? <Check style={{ width: 11, height: 11 }} /> : <Copy style={{ width: 11, height: 11 }} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div
          className="p-4 rounded-2xl animate-fade-in"
          style={{ background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.15)' }}
        >
          <p className="text-sm font-semibold text-rose-400">⚠ {error}</p>
        </div>
      )}

      {/* ── Stat Cards ── */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in delay-100">
          <StatCard
            icon={Activity} label="Total Events" value={totalEvents}
            color="#a855f7" bg="rgba(168,85,247,0.06)" border="rgba(168,85,247,0.14)"
            max={totalEvents}
          />
          <StatCard
            icon={MousePointerClick} label="Clicks" value={clickEvents}
            color="#22d3ee" bg="rgba(34,211,238,0.06)" border="rgba(34,211,238,0.14)"
            max={totalEvents}
          />
          <StatCard
            icon={Eye} label="Page Views" value={pageViewEvents}
            color="#10b981" bg="rgba(16,185,129,0.06)" border="rgba(16,185,129,0.14)"
            max={totalEvents}
          />
          <StatCard
            icon={Globe} label="Unique Pages" value={uniquePages}
            color="#f59e0b" bg="rgba(245,158,11,0.06)" border="rgba(245,158,11,0.14)"
            max={Math.max(uniquePages, 5)}
          />
        </div>
      )}

      {/* ── Duration bar ── */}
      {!loading && events.length > 0 && (
        <div
          className="flex flex-wrap items-center gap-x-8 gap-y-2 p-4 rounded-2xl animate-fade-in delay-200"
          style={{ background: 'rgba(13,17,23,0.8)', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          <Clock style={{ width: 14, height: 14 }} className="text-slate-600 flex-shrink-0" />
          <span className="text-xs text-slate-500">
            Duration: <strong className="text-slate-300">{durationStr}</strong>
          </span>
          <span className="text-xs text-slate-500">
            Started: <strong className="mono text-slate-300">{firstEvent ? new Date(firstEvent.timestamp).toLocaleString() : 'N/A'}</strong>
          </span>
          <span className="text-xs text-slate-500">
            Last active: <strong className="mono text-slate-300">{lastEvent ? new Date(lastEvent.timestamp).toLocaleString() : 'N/A'}</strong>
          </span>
        </div>
      )}

      {/* ── Timeline ── */}
      {loading ? (
        <div className="space-y-3 animate-fade-in">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex gap-4 p-4 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
            >
              <div className="skeleton w-10 h-10 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="skeleton h-4 w-24 rounded" />
                <div className="skeleton h-3 w-44 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="bento-card p-7 animate-fade-in-up delay-300"
        >
          <div className="flex items-center gap-3 mb-7">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.2)' }}
            >
              <Activity style={{ width: 16, height: 16 }} className="text-purple-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Event Timeline</h2>
              <p className="text-[11px] text-slate-600">
                Chronological sequence of {totalEvents} captured events
              </p>
            </div>
          </div>
          <EventTimeline events={events} />
        </div>
      )}
    </div>
  );
}
