import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, ArrowRight, Users, ChevronUp, ChevronDown, Minus, Hash } from 'lucide-react';

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function relativeTime(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function shortId(id) {
  if (!id) return '';
  return id.slice(0, 8) + '…' + id.slice(-4);
}

const ROWS_PER_PAGE = 10;

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-5 py-4 rounded-xl mb-2" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
      <div className="skeleton w-2.5 h-2.5 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="skeleton h-3.5 w-44 rounded" />
        <div className="skeleton h-2.5 w-28 rounded" />
      </div>
      <div className="skeleton h-4 w-20 rounded" />
      <div className="skeleton h-4 w-28 rounded" />
      <div className="skeleton h-8 w-24 rounded-lg" />
    </div>
  );
}

export default function SessionTable({ sessions, loading }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('lastActivity');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
    setPage(1);
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <Minus style={{ width: 12, height: 12 }} className="opacity-25" />;
    return sortDir === 'asc'
      ? <ChevronUp style={{ width: 12, height: 12 }} className="text-purple-400" />
      : <ChevronDown style={{ width: 12, height: 12 }} className="text-purple-400" />;
  };

  const filtered = sessions
    .filter(s => s.sessionId.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      const av = sortField === 'totalEvents' ? a.totalEvents : new Date(a.lastActivity).getTime();
      const bv = sortField === 'totalEvents' ? b.totalEvents : new Date(b.lastActivity).getTime();
      return sortDir === 'asc' ? av - bv : bv - av;
    });

  const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);
  const maxEvents = sessions.length > 0 ? Math.max(...sessions.map(s => s.totalEvents)) : 1;

  return (
    <div className="space-y-4">
      {/* Controls row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
        {/* Title */}
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.2)' }}
          >
            <Users style={{ width: 15, height: 15 }} className="text-purple-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-200">
              All Sessions
              {!loading && (
                <span className="ml-2 chip-purple">{sessions.length}</span>
              )}
            </h2>
            <p className="text-[11px] text-slate-600 mt-0.5">Click any row to inspect journey</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search style={{ width: 13, height: 13 }} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
          <input
            type="text"
            placeholder="Search session ID…"
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
            className="aurora-input w-full pl-8 pr-4 py-2.5 text-sm"
          />
        </div>
      </div>

      {/* Sort bar */}
      <div
        className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
      >
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600 flex-1">Session</span>
        <button
          onClick={() => handleSort('totalEvents')}
          className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:text-purple-400 transition-colors w-36 justify-center"
        >
          Events <SortIcon field="totalEvents" />
        </button>
        <button
          onClick={() => handleSort('lastActivity')}
          className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:text-purple-400 transition-colors w-44"
        >
          Last Active <SortIcon field="lastActivity" />
        </button>
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600 w-24 text-right">Action</span>
      </div>

      {/* Row list */}
      <div className="space-y-2">
        {loading
          ? Array.from({ length: 7 }).map((_, i) => <SkeletonRow key={i} />)
          : paginated.length === 0
          ? (
            <div
              className="flex flex-col items-center justify-center py-24 gap-5 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)' }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(168,85,247,0.07)', border: '1px solid rgba(168,85,247,0.12)' }}
              >
                <Search style={{ width: 28, height: 28 }} className="text-purple-500/50" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-400">
                  {searchTerm ? 'No sessions match your search' : 'No sessions yet'}
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  {searchTerm
                    ? 'Try a different session ID'
                    : 'Open the demo site and click around to generate sessions'}
                </p>
              </div>
            </div>
          )
          : paginated.map((session, i) => {
            const eventPct = maxEvents > 0 ? (session.totalEvents / maxEvents) * 100 : 0;

            return (
              <div
                key={session.sessionId}
                onClick={() => navigate(`/sessions/${session.sessionId}`)}
                className="aurora-row group flex items-center gap-4 px-5 py-4 rounded-2xl animate-fade-in"
                style={{
                  background: 'rgba(13,17,23,0.8)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  animationDelay: `${i * 0.025}s`,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(168,85,247,0.2)';
                  e.currentTarget.style.boxShadow = '0 8px 32px -8px rgba(168,85,247,0.15)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Color dot */}
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #a855f7, #22d3ee)',
                    boxShadow: '0 0 8px rgba(168,85,247,0.6)',
                  }}
                />

                {/* Session ID */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Hash style={{ width: 11, height: 11 }} className="text-slate-600 flex-shrink-0" />
                    <code
                      className="mono text-xs font-semibold truncate group-hover:text-purple-300 transition-colors"
                      style={{ color: '#a78bfa' }}
                    >
                      {shortId(session.sessionId)}
                    </code>
                  </div>
                  <p className="mono text-[10px] text-slate-700 mt-0.5 truncate">
                    {session.sessionId}
                  </p>
                </div>

                {/* Event count + mini bar */}
                <div className="w-36 flex-shrink-0 hidden sm:block">
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className="mono text-xs font-bold"
                      style={{ color: '#a855f7' }}
                    >
                      {session.totalEvents}
                    </span>
                    <span className="text-[10px] text-slate-600">events</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${eventPct}%`,
                        background: 'linear-gradient(90deg, #a855f7, #22d3ee)',
                        boxShadow: '0 0 6px rgba(168,85,247,0.5)',
                      }}
                    />
                  </div>
                </div>

                {/* Last active */}
                <div className="w-44 flex-shrink-0 hidden sm:block">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Clock style={{ width: 11, height: 11 }} className="text-slate-700 flex-shrink-0" />
                    {formatDate(session.lastActivity)}
                  </div>
                  <span className="text-[10px] text-slate-700 mt-0.5 block">
                    {relativeTime(session.lastActivity)}
                  </span>
                </div>

                {/* Arrow */}
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.2)' }}
                >
                  <ArrowRight style={{ width: 14, height: 14 }} className="text-purple-400" />
                </div>
              </div>
            );
          })
        }
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-[11px] text-slate-600">
            Showing <span className="text-slate-400 font-semibold">{(page - 1) * ROWS_PER_PAGE + 1}–{Math.min(page * ROWS_PER_PAGE, filtered.length)}</span> of <span className="text-slate-400 font-semibold">{filtered.length}</span>
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold btn-ghost disabled:opacity-30"
            >
              Prev
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className="w-8 h-8 rounded-lg text-xs font-bold transition-all"
                  style={{
                    background: page === pageNum ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${page === pageNum ? 'rgba(168,85,247,0.4)' : 'rgba(255,255,255,0.06)'}`,
                    color: page === pageNum ? '#d8b4fe' : '#64748b',
                  }}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold btn-ghost disabled:opacity-30"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      {!loading && filtered.length > 0 && totalPages <= 1 && (
        <p className="text-[11px] text-slate-600 pt-1">
          {filtered.length} session{filtered.length !== 1 ? 's' : ''} total
          {searchTerm && ` · filtered from ${sessions.length}`}
        </p>
      )}
    </div>
  );
}
