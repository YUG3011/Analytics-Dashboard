import { useState, useEffect, useCallback } from 'react';
import { getTrackedPages, getHeatmapData } from '../api';
import HeatmapCanvas from '../components/HeatmapCanvas';
import { Flame, RefreshCw, Globe, ChevronDown, ExternalLink } from 'lucide-react';

export default function HeatmapPage() {
  const [pages,         setPages]         = useState([]);
  const [selectedUrl,   setSelectedUrl]   = useState('');
  const [clicks,        setClicks]        = useState([]);
  const [loadingPages,  setLoadingPages]  = useState(true);
  const [loadingClicks, setLoadingClicks] = useState(false);
  const [error,         setError]         = useState(null);
  const [refreshing,    setRefreshing]    = useState(false);
  const [dropOpen,      setDropOpen]      = useState(false);

  const fetchPages = useCallback(async () => {
    try {
      setLoadingPages(true);
      const res = await getTrackedPages();
      if (res.success) {
        setPages(res.data);
        if (res.data.length > 0 && !selectedUrl) {
          setSelectedUrl(res.data[0]);
        }
        setError(null);
      } else {
        setError('Failed to load tracked pages.');
      }
    } catch {
      setError('Cannot connect to the analytics backend.');
    } finally {
      setLoadingPages(false);
    }
  }, [selectedUrl]);

  const fetchClicks = useCallback(async (url, isRefresh = false) => {
    if (!url) return;
    try {
      if (isRefresh) setRefreshing(true);
      else setLoadingClicks(true);

      const res = await getHeatmapData(url);
      if (res.success) {
        setClicks(res.data);
      }
    } catch (err) {
      console.error('Heatmap fetch error:', err);
    } finally {
      setLoadingClicks(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchPages(); }, []);
  useEffect(() => { if (selectedUrl) fetchClicks(selectedUrl); }, [selectedUrl, fetchClicks]);

  const handleUrlSelect = (url) => {
    setSelectedUrl(url);
    setDropOpen(false);
  };

  // ── Loading skeleton
  if (loadingPages) {
    return (
      <div className="space-y-8 pb-12">
        <div className="animate-fade-in-up">
          <div className="skeleton h-5 w-28 rounded-full mb-3" />
          <div className="skeleton h-10 w-64 rounded-xl mb-2" />
          <div className="skeleton h-4 w-80 rounded" />
        </div>
        <div className="skeleton h-[560px] rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 animate-fade-in-up">
        <div>
          <div className="chip-rose mb-3">Click Density Maps</div>
          <h1
            className="text-4xl font-black tracking-tight flex items-center gap-3"
            style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #fda4af 50%, #f43f5e 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            <Flame
              style={{ width: 36, height: 36 }}
              className="text-rose-400 animate-float flex-shrink-0"
            />
            Heatmap Viewer
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Visualize where users click most on each tracked page.
          </p>
        </div>

        {selectedUrl && (
          <button
            onClick={() => fetchClicks(selectedUrl, true)}
            disabled={loadingClicks || refreshing}
            className="btn-ghost flex items-center gap-2 px-4 py-2.5 text-sm font-semibold flex-shrink-0"
          >
            <RefreshCw
              style={{ width: 14, height: 14 }}
              className={refreshing ? 'animate-spin text-purple-400' : ''}
            />
            Reload
          </button>
        )}
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

      {/* ── Empty state ── */}
      {pages.length === 0 && !error && (
        <div
          className="flex flex-col items-center justify-center py-24 gap-7 rounded-2xl animate-fade-in"
          style={{ background: 'rgba(13,17,23,0.8)', border: '1px solid rgba(244,63,94,0.1)' }}
        >
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(244,63,94,0.1) 0%, rgba(168,85,247,0.05) 100%)',
              border: '1px solid rgba(244,63,94,0.2)',
            }}
          >
            <Flame style={{ width: 40, height: 40 }} className="text-rose-400 animate-float" />
          </div>
          <div className="text-center max-w-sm">
            <h3 className="text-lg font-bold text-slate-300 mb-2">No Pages Tracked Yet</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Visit the demo website, click around on different pages, then return here to see the heatmap.
            </p>
          </div>
          <a
            href="http://localhost:5500/demo.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-bold text-white transition-all"
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
            <ExternalLink style={{ width: 16, height: 16 }} />
            Open Demo Website
          </a>
        </div>
      )}

      {/* ── URL Selector + Canvas ── */}
      {pages.length > 0 && (
        <div className="space-y-6 animate-fade-in delay-100">

          {/* URL selector bar */}
          <div
            className="bento-card flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5"
          >
            <div className="flex items-center gap-2 flex-shrink-0">
              <Globe style={{ width: 15, height: 15 }} className="text-purple-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Target Page</span>
            </div>

            {/* Custom dropdown */}
            <div className="relative flex-1 min-w-0 w-full sm:w-auto">
              <button
                onClick={() => setDropOpen(!dropOpen)}
                className="w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: 'rgba(168,85,247,0.08)',
                  border: '1px solid rgba(168,85,247,0.2)',
                  color: '#d8b4fe',
                }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Globe style={{ width: 14, height: 14 }} className="text-purple-400 flex-shrink-0" />
                  <span className="mono truncate">{selectedUrl}</span>
                </div>
                <ChevronDown
                  style={{ width: 16, height: 16 }}
                  className={`flex-shrink-0 transition-transform duration-200 ${dropOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {dropOpen && (
                <div
                  className="absolute top-full mt-1.5 left-0 right-0 z-50 rounded-2xl overflow-hidden shadow-2xl animate-slide-down"
                  style={{
                    background: '#0a0f1e',
                    border: '1px solid rgba(168,85,247,0.25)',
                    boxShadow: '0 24px 48px rgba(0,0,0,0.8)',
                  }}
                >
                  {pages.map(url => (
                    <button
                      key={url}
                      onClick={() => handleUrlSelect(url)}
                      className="w-full flex items-center gap-2 px-4 py-2.5 mono text-sm text-left transition-all"
                      style={{
                        color: url === selectedUrl ? '#d8b4fe' : '#64748b',
                        background: url === selectedUrl ? 'rgba(168,85,247,0.1)' : 'transparent',
                      }}
                      onMouseEnter={e => {
                        if (url !== selectedUrl)
                          e.currentTarget.style.background = 'rgba(168,85,247,0.06)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = url === selectedUrl
                          ? 'rgba(168,85,247,0.1)' : 'transparent';
                      }}
                    >
                      <Globe
                        style={{ width: 13, height: 13, color: url === selectedUrl ? '#a855f7' : '#475569' }}
                        className="flex-shrink-0"
                      />
                      {url}
                      {url === selectedUrl && (
                        <span className="ml-auto chip-purple">Selected</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Page count badge */}
            <div
              className="flex-shrink-0 px-3 py-1.5 rounded-xl mono text-[11px] font-semibold"
              style={{
                background: 'rgba(16,185,129,0.08)',
                border: '1px solid rgba(16,185,129,0.15)',
                color: '#6ee7b7',
              }}
            >
              {pages.length} page{pages.length !== 1 ? 's' : ''} tracked
            </div>
          </div>

          {/* Heatmap canvas */}
          {loadingClicks ? (
            <div
              className="h-[560px] rounded-2xl flex items-center justify-center animate-fade-in"
              style={{ background: 'rgba(13,17,23,0.7)', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <div className="flex flex-col items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full border-2 animate-spin"
                  style={{ borderColor: 'rgba(168,85,247,0.2)', borderTopColor: '#a855f7' }}
                />
                <p className="text-sm text-slate-600">Loading click data…</p>
              </div>
            </div>
          ) : (
            <div className="animate-fade-in">
              <HeatmapCanvas clicks={clicks} url={selectedUrl} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
