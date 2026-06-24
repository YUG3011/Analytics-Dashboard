import { Eye, MousePointerClick, Calendar, MapPin, Globe, Zap } from 'lucide-react';

function formatTime(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function groupByDay(events) {
  return events.reduce((acc, event) => {
    const key = formatDate(event.timestamp);
    if (!acc[key]) acc[key] = [];
    acc[key].push(event);
    return acc;
  }, {});
}

function EventCard({ event, index }) {
  const isClick    = event.eventType === 'click';
  const isPageView = event.eventType === 'page_view';
  const isEven     = index % 2 === 0;

  const accentColor = isClick ? '#22d3ee' : '#a855f7';
  const glowColor   = isClick ? 'rgba(34,211,238,0.25)' : 'rgba(168,85,247,0.25)';
  const bgColor     = isClick ? 'rgba(34,211,238,0.04)' : 'rgba(168,85,247,0.04)';
  const borderColor = isClick ? 'rgba(34,211,238,0.12)' : 'rgba(168,85,247,0.12)';
  const hoverBorder = isClick ? 'rgba(34,211,238,0.3)' : 'rgba(168,85,247,0.3)';

  return (
    <div
      className="relative flex gap-5 animate-fade-in"
      style={{ animationDelay: `${index * 0.035}s` }}
    >
      {/* ── Timeline node ── */}
      <div className="flex flex-col items-center flex-shrink-0">
        {/* Icon circle */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center z-10 transition-transform duration-200 hover:scale-110 flex-shrink-0"
          style={{
            background: `radial-gradient(circle, ${bgColor.replace('0.04', '0.15')} 0%, ${bgColor} 100%)`,
            border: `2px solid ${accentColor}40`,
            boxShadow: `0 0 16px ${glowColor}`,
          }}
        >
          {isClick
            ? <MousePointerClick style={{ width: 16, height: 16 }} className="text-cyan-400" />
            : <Eye style={{ width: 16, height: 16 }} className="text-purple-400" />
          }
        </div>
        {/* Connector line */}
        <div
          className="w-px flex-1 mt-1 min-h-[20px]"
          style={{
            background: `linear-gradient(to bottom, ${accentColor}30 0%, transparent 100%)`,
          }}
        />
      </div>

      {/* ── Event card ── */}
      <div
        className="flex-1 mb-5 rounded-2xl p-4 transition-all duration-200"
        style={{
          background: bgColor,
          border: `1px solid ${borderColor}`,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = hoverBorder;
          e.currentTarget.style.boxShadow = `0 8px 24px -8px ${glowColor}`;
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = borderColor;
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        {/* Top: badge + time */}
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
              style={isClick
                ? { background: 'rgba(34,211,238,0.12)', color: '#67e8f9', border: '1px solid rgba(34,211,238,0.2)' }
                : { background: 'rgba(168,85,247,0.12)', color: '#d8b4fe', border: '1px solid rgba(168,85,247,0.2)' }
              }
            >
              {isClick ? '🖱 Click' : '👁 Page View'}
            </span>
            <span className="mono text-[10px] text-slate-600">#{index + 1}</span>
          </div>
          <span
            className="mono text-[11px] font-semibold px-2.5 py-1 rounded-lg"
            style={{
              background: 'rgba(255,255,255,0.04)',
              color: '#475569',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            {formatTime(event.timestamp)}
          </span>
        </div>

        {/* URL */}
        <div className="flex items-center gap-2 mb-2">
          <Globe style={{ width: 12, height: 12 }} className="text-slate-600 flex-shrink-0" />
          <code
            className="mono text-xs truncate max-w-xs"
            style={{ color: isClick ? '#67e8f9' : '#c4b5fd' }}
          >
            {event.pageUrl}
          </code>
        </div>

        {/* Click coordinates */}
        {isClick && event.x != null && event.y != null && (
          <div
            className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 rounded-xl"
            style={{
              background: 'rgba(34,211,238,0.07)',
              border: '1px solid rgba(34,211,238,0.15)',
            }}
          >
            <MapPin style={{ width: 12, height: 12 }} className="text-cyan-400" />
            <span className="mono text-xs text-cyan-300">
              X: <strong>{event.x}</strong>&nbsp;&nbsp;Y: <strong>{event.y}</strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function EventTimeline({ events }) {
  if (!events || events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-5">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.12)' }}
        >
          <Eye style={{ width: 28, height: 28 }} className="text-purple-500/40" />
        </div>
        <p className="text-sm text-slate-500 font-medium">No events in this session</p>
      </div>
    );
  }

  const grouped = groupByDay(events);
  let globalIndex = 0;

  return (
    <div className="space-y-10">
      {Object.entries(grouped).map(([dateLabel, dayEvents]) => (
        <div key={dateLabel} className="animate-fade-in">
          {/* Day separator */}
          <div className="flex items-center gap-3 mb-6">
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(34,211,238,0.06))',
                border: '1px solid rgba(168,85,247,0.2)',
              }}
            >
              <Calendar style={{ width: 13, height: 13 }} className="text-purple-400" />
              <span className="text-xs font-bold text-purple-300">{dateLabel}</span>
            </div>
            <div
              className="flex-1 h-px"
              style={{ background: 'linear-gradient(to right, rgba(168,85,247,0.25), transparent)' }}
            />
            <div className="chip-purple">{dayEvents.length} events</div>
          </div>

          {/* Events */}
          <div>
            {dayEvents.map((event) => {
              const idx = globalIndex++;
              return <EventCard key={event._id || idx} event={event} index={idx} />;
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
