import { useState, useEffect, useCallback } from 'react';
import { getAnalyticsSummary, getSessions } from '../api';
import AnalyticsCards from '../components/AnalyticsCards';
import {
  Code2, Play, Copy, Check, RefreshCw, ArrowRight,
  Terminal, Globe, Zap, Shield, Clock, Activity, ExternalLink
} from 'lucide-react';

const SNIPPET = `<!-- CausalFunnel Aurora Tracker -->
<script
  src="http://localhost:5500/tracker.js"
  data-api-url="http://localhost:5500">
</script>`;

const FEATURES = [
  {
    icon: Globe,
    title: 'Auto Page Tracking',
    desc: 'Captures every page_view on load automatically.',
    color: '#a855f7',
    bg: 'rgba(168,85,247,0.08)',
    border: 'rgba(168,85,247,0.18)',
  },
  {
    icon: Zap,
    title: 'Click Coordinates',
    desc: 'Records precise X/Y positions for every click.',
    color: '#22d3ee',
    bg: 'rgba(34,211,238,0.08)',
    border: 'rgba(34,211,238,0.15)',
  },
  {
    icon: Shield,
    title: 'Fail-Safe Design',
    desc: 'Never crashes host pages — all errors caught silently.',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.08)',
    border: 'rgba(16,185,129,0.15)',
  },
];

// Mini live-feed component
function LiveFeed({ sessions }) {
  if (!sessions || sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-3">
        <Activity style={{ width: 28, height: 28 }} className="text-slate-700" />
        <p className="text-xs text-slate-600">No recent activity</p>
      </div>
    );
  }

  const recent = [...sessions].slice(0, 5);

  return (
    <div className="space-y-2">
      {recent.map((s, i) => (
        <div
          key={s.sessionId}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl animate-fade-in"
          style={{
            background: 'rgba(168,85,247,0.04)',
            border: '1px solid rgba(168,85,247,0.08)',
            animationDelay: `${i * 0.05}s`,
          }}
        >
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: '#a855f7', boxShadow: '0 0 6px rgba(168,85,247,0.8)' }}
          />
          <code className="mono text-[11px] flex-1 truncate" style={{ color: '#a78bfa' }}>
            {s.sessionId.slice(0, 16)}…
          </code>
          <span
            className="mono text-[10px] font-bold"
            style={{ color: '#a855f7' }}
          >
            {s.totalEvents} ev
          </span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [summary,    setSummary]    = useState(null);
  const [sessions,   setSessions]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [copied,     setCopied]     = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const [sumRes, sessRes] = await Promise.all([
        getAnalyticsSummary(),
        getSessions(),
      ]);

      if (sumRes.success)  setSummary(sumRes.data);
      if (sessRes.success) setSessions(sessRes.data);
      setError(null);
    } catch {
      setError('Cannot connect to the analytics server.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const timer = setInterval(() => fetchData(true), 30000);
    return () => clearInterval(timer);
  }, [fetchData]);

  const handleCopy = () => {
    navigator.clipboard.writeText(SNIPPET).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="space-y-8 pb-12">

      {/* ── Page Header ── */}
      <div className="flex items-start justify-between gap-4 animate-fade-in-up">
        <div>
          <div className="chip-purple mb-3">Live Analytics</div>
          <h1
            className="text-4xl font-black tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #d8b4fe 50%, #22d3ee 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Overview Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Real-time analytics — sessions, events, clicks &amp; page views.
          </p>
        </div>

        <button
          onClick={() => fetchData(true)}
          disabled={loading || refreshing}
          className="btn-ghost flex items-center gap-2 px-4 py-2.5 text-sm font-semibold flex-shrink-0"
        >
          <RefreshCw style={{ width: 14, height: 14 }} className={refreshing ? 'animate-spin text-purple-400' : ''} />
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div
          className="flex items-start gap-3 p-4 rounded-2xl animate-fade-in"
          style={{ background: 'rgba(244,63,94,0.07)', border: '1px solid rgba(244,63,94,0.18)' }}
        >
          <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'rgba(244,63,94,0.2)' }}>
            <span className="text-rose-400 text-xs font-black">!</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-rose-400">{error}</p>
            <p className="text-xs text-rose-500/60 mt-0.5">Make sure Docker is running: <code className="mono">docker compose up</code></p>
          </div>
        </div>
      )}

      {/* ── Analytics Cards ── */}
      <div className="animate-fade-in-up delay-100">
        <AnalyticsCards summary={summary} loading={loading} />
      </div>

      {/* ── Bottom Bento Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up delay-200">

        {/* ── Integration Script (col-span-2) ── */}
        <div
          className="lg:col-span-2 bento-card p-7 space-y-5"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.2)' }}
            >
              <Code2 style={{ width: 18, height: 18 }} className="text-purple-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Integration Script</h2>
              <p className="text-[11px] text-slate-600 mt-0.5">Add this to your website's &lt;head&gt; or &lt;body&gt;</p>
            </div>
          </div>

          {/* Code block */}
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{ background: '#06080f', border: '1px solid rgba(168,85,247,0.15)' }}
          >
            {/* Titlebar */}
            <div
              className="flex items-center justify-between px-5 py-2.5"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
            >
              <div className="flex items-center gap-2">
                <Terminal style={{ width: 13, height: 13 }} className="text-purple-400" />
                <span className="mono text-[11px] text-slate-500">tracker-snippet.html</span>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-lg transition-all"
                style={{
                  background: copied ? 'rgba(16,185,129,0.15)' : 'rgba(168,85,247,0.12)',
                  border: `1px solid ${copied ? 'rgba(16,185,129,0.3)' : 'rgba(168,85,247,0.25)'}`,
                  color: copied ? '#6ee7b7' : '#d8b4fe',
                }}
              >
                {copied ? <Check style={{ width: 11, height: 11 }} /> : <Copy style={{ width: 11, height: 11 }} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="p-5 mono text-xs leading-relaxed overflow-x-auto" style={{ color: '#c4b5fd' }}>
              <code>{SNIPPET}</code>
            </pre>
          </div>

          {/* Feature chips */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {FEATURES.map(f => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="p-4 rounded-2xl"
                  style={{ background: f.bg, border: `1px solid ${f.border}` }}
                >
                  <div
                    className="w-7 h-7 rounded-xl flex items-center justify-center mb-2.5"
                    style={{ background: `${f.color}15`, border: `1px solid ${f.color}25` }}
                  >
                    <Icon style={{ width: 14, height: 14, color: f.color }} />
                  </div>
                  <p className="text-xs font-bold text-slate-300 mb-1">{f.title}</p>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Right Column ── */}
        <div className="flex flex-col gap-5">

          {/* Demo Card */}
          <div
            className="bento-card p-6 flex flex-col justify-between"
            style={{
              background: 'linear-gradient(135deg, rgba(168,85,247,0.08) 0%, rgba(34,211,238,0.04) 100%)',
              border: '1px solid rgba(168,85,247,0.15)',
            }}
          >
            <div>
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                style={{
                  background: 'linear-gradient(135deg, #a855f7 0%, #22d3ee 100%)',
                  boxShadow: '0 8px 24px rgba(168,85,247,0.4)',
                }}
              >
                <Play style={{ width: 22, height: 22 }} className="text-white" fill="white" />
              </div>
              <h2 className="text-sm font-bold text-white mb-1.5">Launch Demo Site</h2>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Open the pre-built demo with tracker embedded. Click around to see live events.
              </p>
            </div>
            <a
              href="http://localhost:5500/demo.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full mt-5 py-3 px-4 rounded-2xl text-sm font-bold text-white transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
                boxShadow: '0 4px 20px rgba(168,85,247,0.4)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(168,85,247,0.5)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(168,85,247,0.4)';
              }}
            >
              Open Demo
              <ExternalLink style={{ width: 14, height: 14 }} />
            </a>
          </div>

          {/* Live Sessions Feed */}
          <div
            className="bento-card p-5 flex-1"
            style={{ background: 'rgba(13,17,23,0.85)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.18)' }}
                >
                  <Activity style={{ width: 13, height: 13 }} className="text-purple-400" />
                </div>
                <p className="text-xs font-bold text-slate-300">Recent Sessions</p>
              </div>
              {!loading && !error && (
                <div
                  className="flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full"
                  style={{ background: 'rgba(16,185,129,0.1)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.2)' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 dot-live" />
                  Live
                </div>
              )}
            </div>
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="skeleton h-9 rounded-xl" />
                ))}
              </div>
            ) : (
              <LiveFeed sessions={sessions} />
            )}
          </div>
        </div>
      </div>

      {/* ── API Endpoints Strip ── */}
      <div
        className="bento-card px-6 py-4 animate-fade-in-up delay-300"
      >
        <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-600">
            API Endpoints
          </span>
          {[
            'POST /api/events',
            'GET /api/sessions',
            'GET /api/sessions/:id',
            'GET /api/heatmap?url=',
            'GET /api/analytics/summary',
            'GET /api/pages',
          ].map(ep => (
            <div key={ep} className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-purple-500/50" />
              <code className="mono text-[11px] text-slate-600">{ep}</code>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
