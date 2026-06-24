import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { MapPin, Crosshair, Download, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

// Gaussian blur heatmap rendering using Canvas 2D
function renderHeatmap(canvas, clicks, zoom = 1) {
  if (!canvas || !clicks) return;

  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  ctx.clearRect(0, 0, W, H);

  if (clicks.length === 0) return;

  // Draw radial gradient blobs for each click
  const radius = Math.max(40, 80 / zoom);

  clicks.forEach(({ x, y }) => {
    const px = x * zoom;
    const py = y * zoom;
    const grad = ctx.createRadialGradient(px, py, 0, px, py, radius);
    grad.addColorStop(0,   'rgba(255, 64, 64, 0.35)');
    grad.addColorStop(0.3, 'rgba(255, 165, 0, 0.18)');
    grad.addColorStop(0.6, 'rgba(64, 200, 255, 0.08)');
    grad.addColorStop(1,   'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(px, py, radius, 0, Math.PI * 2);
    ctx.fill();
  });

  // Overlay density-based color correction
  const imageData = ctx.getImageData(0, 0, W, H);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3] / 255;
    if (alpha < 0.01) continue;

    // Map alpha → heatmap color (cold to hot)
    let r, g, b;
    if (alpha < 0.15) {
      // cold: dark blue
      const t = alpha / 0.15;
      r = Math.round(0   + t * 0);
      g = Math.round(0   + t * 80);
      b = Math.round(200 + t * 55);
    } else if (alpha < 0.35) {
      // cyan
      const t = (alpha - 0.15) / 0.2;
      r = Math.round(0   + t * 0);
      g = Math.round(80  + t * 170);
      b = Math.round(255 + t * 0);
    } else if (alpha < 0.55) {
      // green → yellow
      const t = (alpha - 0.35) / 0.2;
      r = Math.round(0   + t * 255);
      g = Math.round(250 + t * 0);
      b = Math.round(0);
    } else if (alpha < 0.75) {
      // yellow → orange
      const t = (alpha - 0.55) / 0.2;
      r = 255;
      g = Math.round(250 - t * 130);
      b = 0;
    } else {
      // red hotspot
      const t = (alpha - 0.75) / 0.25;
      r = 255;
      g = Math.round(120 - t * 120);
      b = 0;
    }

    data[i]     = r;
    data[i + 1] = g;
    data[i + 2] = b;
    data[i + 3] = Math.round(alpha * 220);
  }

  ctx.putImageData(imageData, 0, 0);

  // Draw crisp dots on top of blobs
  clicks.forEach(({ x, y }) => {
    const px = x * zoom;
    const py = y * zoom;
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });
}

// Compute density for stats
function getDensityStats(clicks, radius = 40) {
  if (!clicks || clicks.length === 0) return { hotspots: 0, warm: 0, cool: 0, maxDensity: 1 };

  const densities = clicks.map(pt =>
    clicks.filter(other => Math.hypot(other.x - pt.x, other.y - pt.y) <= radius).length
  );
  const maxDensity = Math.max(...densities);

  return {
    hotspots: densities.filter(d => d >= maxDensity * 0.75).length,
    warm:     densities.filter(d => d >= maxDensity * 0.5 && d < maxDensity * 0.75).length,
    cool:     densities.filter(d => d < maxDensity * 0.5).length,
    maxDensity,
  };
}

export default function HeatmapCanvas({ clicks, url }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [tooltip, setTooltip] = useState(null);

  const stats = useMemo(() => getDensityStats(clicks), [clicks]);

  // Canvas size based on click extents
  const canvasW = useMemo(() => {
    if (!clicks || clicks.length === 0) return 1200;
    return Math.max(Math.max(...clicks.map(c => c.x)) + 120, 1200);
  }, [clicks]);

  const canvasH = useMemo(() => {
    if (!clicks || clicks.length === 0) return 700;
    return Math.max(Math.max(...clicks.map(c => c.y)) + 120, 700);
  }, [clicks]);

  // Re-render canvas whenever clicks or zoom change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width  = Math.round(canvasW * zoom);
    canvas.height = Math.round(canvasH * zoom);
    renderHeatmap(canvas, clicks, zoom);
  }, [clicks, zoom, canvasW, canvasH]);

  const handleZoomIn  = () => setZoom(z => Math.min(2, parseFloat((z + 0.25).toFixed(2))));
  const handleZoomOut = () => setZoom(z => Math.max(0.5, parseFloat((z - 0.25).toFixed(2))));
  const handleReset   = () => setZoom(1);

  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `heatmap-${url.replace(/\//g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, [url]);

  // Tooltip on canvas click
  const handleCanvasClick = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = Math.round((e.clientX - rect.left) / zoom);
    const cy = Math.round((e.clientY - rect.top) / zoom);
    setTooltip({ x: cx, y: cy, px: e.clientX - rect.left, py: e.clientY - rect.top });
    setTimeout(() => setTooltip(null), 2500);
  }, [zoom]);

  return (
    <div className="space-y-4 animate-fade-in">

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Clicks', value: clicks?.length ?? 0, color: '#a855f7', chip: 'chip-purple' },
          { label: 'Hotspots',     value: stats.hotspots,      color: '#f43f5e', chip: 'chip-rose' },
          { label: 'Warm Zones',   value: stats.warm,          color: '#f59e0b', chip: 'chip-amber' },
          { label: 'Cool Zones',   value: stats.cool,          color: '#22d3ee', chip: 'chip-cyan' },
        ].map(stat => (
          <div
            key={stat.label}
            className="bento-card px-5 py-4 flex items-center gap-3"
          >
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ background: stat.color, boxShadow: `0 0 10px ${stat.color}` }}
            />
            <div>
              <p className="text-[11px] text-slate-600 font-semibold uppercase tracking-wider">{stat.label}</p>
              <p className="text-xl font-black" style={{ color: stat.color }}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Legend + Controls ── */}
      <div
        className="flex flex-wrap items-center justify-between gap-4 px-5 py-3 rounded-2xl"
        style={{ background: 'rgba(13,17,23,0.8)', border: '1px solid rgba(255,255,255,0.05)' }}
      >
        {/* Legend */}
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Density:</span>
          {[
            { label: 'Low',     color: 'rgba(34,211,238,0.9)' },
            { label: 'Medium',  color: 'rgba(16,185,129,0.9)' },
            { label: 'High',    color: 'rgba(245,158,11,0.9)' },
            { label: 'Hotspot', color: 'rgba(239,68,68,1)' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ background: item.color, boxShadow: `0 0 6px ${item.color}` }} />
              <span className="text-[11px] text-slate-500">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-2">
          <button onClick={handleZoomOut} className="btn-ghost w-8 h-8 rounded-lg flex items-center justify-center" title="Zoom out">
            <ZoomOut style={{ width: 14, height: 14 }} />
          </button>
          <span className="mono text-xs font-bold text-slate-400 w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={handleZoomIn} className="btn-ghost w-8 h-8 rounded-lg flex items-center justify-center" title="Zoom in">
            <ZoomIn style={{ width: 14, height: 14 }} />
          </button>
          <button onClick={handleReset} className="btn-ghost w-8 h-8 rounded-lg flex items-center justify-center" title="Reset zoom">
            <RotateCcw style={{ width: 14, height: 14 }} />
          </button>
          <div className="h-5 w-px bg-white/10 mx-1" />
          <button
            onClick={handleDownload}
            disabled={!clicks || clicks.length === 0}
            className="btn-ghost flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-30"
          >
            <Download style={{ width: 12, height: 12 }} />
            Export PNG
          </button>
        </div>
      </div>

      {/* ── Browser Chrome Frame ── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 32px 64px -16px rgba(0,0,0,0.9)',
        }}
      >
        {/* Titlebar */}
        <div
          className="flex items-center gap-4 px-5 py-3"
          style={{
            background: 'linear-gradient(135deg, #0a1020 0%, #0d1426 100%)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {/* Traffic lights */}
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: '#ef4444', boxShadow: '0 0 5px rgba(239,68,68,0.7)' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#f59e0b', boxShadow: '0 0 5px rgba(245,158,11,0.7)' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#22c55e', boxShadow: '0 0 5px rgba(34,197,94,0.7)' }} />
          </div>

          {/* Address bar */}
          <div
            className="flex-1 max-w-2xl mx-auto flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: '#22c55e', boxShadow: '0 0 5px rgba(34,197,94,0.8)' }} />
            <Crosshair style={{ width: 12, height: 12 }} className="text-purple-400 flex-shrink-0" />
            <span className="mono text-xs text-slate-500">https://</span>
            <span className="mono text-xs text-slate-400">causalfunnel-demo.app</span>
            <span className="mono text-xs font-bold text-purple-400">{url}</span>
          </div>

          {/* Click info */}
          <div className="chip-purple flex-shrink-0">
            {clicks?.length ?? 0} clicks
          </div>
        </div>

        {/* Canvas area */}
        <div
          ref={containerRef}
          className="overflow-auto relative"
          style={{
            maxHeight: '560px',
            background: 'linear-gradient(135deg, #070d1a 0%, #030712 100%)',
            backgroundImage: 'radial-gradient(rgba(168,85,247,0.04) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        >
          {/* Relative wrapper for tooltip */}
          <div
            className="relative select-none"
            style={{ width: `${canvasW * zoom}px`, height: `${canvasH * zoom}px` }}
            onClick={handleCanvasClick}
          >
            {/* Canvas */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0"
              style={{
                cursor: 'crosshair',
                imageRendering: 'pixelated',
              }}
            />

            {/* Canvas info label */}
            <div
              className="absolute top-3 left-3 mono text-[10px] px-2 py-1 rounded-md z-20 pointer-events-none"
              style={{
                background: 'rgba(10,16,32,0.9)',
                border: '1px solid rgba(255,255,255,0.07)',
                color: '#475569',
              }}
            >
              {Math.round(canvasW * zoom)}×{Math.round(canvasH * zoom)}px · {clicks?.length ?? 0} clicks · {Math.round(zoom * 100)}% zoom
            </div>

            {/* Click tooltip */}
            {tooltip && (
              <div
                className="absolute z-30 pointer-events-none animate-fade-in"
                style={{ left: tooltip.px + 12, top: tooltip.py - 48 }}
              >
                <div
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl whitespace-nowrap"
                  style={{
                    background: 'rgba(10,16,32,0.95)',
                    border: '1px solid rgba(168,85,247,0.35)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                  }}
                >
                  <MapPin style={{ width: 11, height: 11 }} className="text-purple-400" />
                  <span className="mono text-xs text-slate-200">
                    X: <strong className="text-cyan-400">{tooltip.x}</strong>
                    {' '}Y: <strong className="text-cyan-400">{tooltip.y}</strong>
                  </span>
                </div>
              </div>
            )}

            {/* Empty state overlay */}
            {(!clicks || clicks.length === 0) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 z-10">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.12)' }}
                >
                  <Crosshair style={{ width: 36, height: 36 }} className="text-purple-500/30" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-500 mb-1">No clicks recorded for this URL</p>
                  <p className="text-xs text-slate-700">
                    Open the demo site, navigate to this page, and click around
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
