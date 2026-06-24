import { useState, useEffect, useCallback } from 'react';
import { getSessions } from '../api';
import SessionTable from '../components/SessionTable';
import { RefreshCw, Users, TrendingUp, BarChart3 } from 'lucide-react';

export default function SessionsPage() {
  const [sessions,     setSessions]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [refreshing,   setRefreshing]   = useState(false);
  const [lastRefresh,  setLastRefresh]  = useState(null);

  const fetchSessions = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const res = await getSessions();
      if (res.success) {
        setSessions(res.data);
        setError(null);
        setLastRefresh(new Date());
      } else {
        setError('Failed to fetch sessions from the server.');
      }
    } catch {
      setError('Cannot connect to the analytics backend.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
    const timer = setInterval(() => fetchSessions(true), 15000);
    return () => clearInterval(timer);
  }, [fetchSessions]);

  const totalEvents = sessions.reduce((sum, s) => sum + (s.totalEvents || 0), 0);
  const avgEvents   = sessions.length > 0 ? (totalEvents / sessions.length).toFixed(1) : '0';

  const QUICK_STATS = [
    {
      label: 'Sessions',
      value: sessions.length,
      icon: Users,
      color: '#a855f7',
      bg: 'rgba(168,85,247,0.07)',
      border: 'rgba(168,85,247,0.14)',
    },
    {
      label: 'Total Events',
      value: totalEvents.toLocaleString(),
      icon: BarChart3,
      color: '#22d3ee',
      bg: 'rgba(34,211,238,0.07)',
      border: 'rgba(34,211,238,0.14)',
    },
    {
      label: 'Avg / Session',
      value: avgEvents,
      icon: TrendingUp,
      color: '#10b981',
      bg: 'rgba(16,185,129,0.07)',
      border: 'rgba(16,185,129,0.14)',
    },
  ];

  return (
    <div className="space-y-8 pb-12">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 animate-fade-in-up">
        <div>
          <div className="chip-purple mb-3">Session Explorer</div>
          <h1
            className="text-4xl font-black tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #d8b4fe 60%, #22d3ee 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            User Sessions
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            All visitor sessions tracked by CausalFunnel.
          </p>
        </div>

        <button
          onClick={() => fetchSessions(true)}
          disabled={loading || refreshing}
          className="btn-ghost flex items-center gap-2 px-4 py-2.5 text-sm font-semibold flex-shrink-0"
        >
          <RefreshCw
            style={{ width: 14, height: 14 }}
            className={refreshing ? 'animate-spin text-purple-400' : ''}
          />
          Refresh
        </button>
      </div>

      {/* ── Quick Stats ── */}
      {!loading && sessions.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in delay-100">
          {QUICK_STATS.map(stat => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bento-card px-5 py-4 flex items-center gap-4"
                style={{
                  background: stat.bg,
                  borderColor: stat.border,
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${stat.color}18`, border: `1px solid ${stat.color}28` }}
                >
                  <Icon style={{ width: 18, height: 18, color: stat.color }} />
                </div>
                <div>
                  <p
                    className="text-2xl font-black leading-none"
                    style={{ color: stat.color }}
                  >
                    {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                  </p>
                  <p className="text-[11px] text-slate-600 mt-0.5">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Error Banner ── */}
      {error && (
        <div
          className="flex items-center gap-3 p-4 rounded-2xl animate-fade-in"
          style={{ background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.15)' }}
        >
          <span className="text-rose-400 text-lg">⚠</span>
          <div>
            <p className="text-sm font-semibold text-rose-400">{error}</p>
            <p className="text-xs text-rose-500/60 mt-0.5">
              Ensure the backend server is running and MongoDB is connected.
            </p>
          </div>
        </div>
      )}

      {/* ── Last Refresh ── */}
      {lastRefresh && !loading && (
        <p className="text-[11px] text-slate-700 -mt-4 animate-fade-in">
          Updated {lastRefresh.toLocaleTimeString()} · Auto-refreshes every 15s
        </p>
      )}

      {/* ── Session Table ── */}
      <div className="animate-fade-in-up delay-200">
        <SessionTable sessions={sessions} loading={loading} />
      </div>
    </div>
  );
}
