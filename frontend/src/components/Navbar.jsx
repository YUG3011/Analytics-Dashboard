import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Flame, Activity, ExternalLink } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/',         label: 'Dashboard',  icon: LayoutDashboard, exact: true },
  { to: '/sessions', label: 'Sessions',   icon: Users },
  { to: '/heatmap',  label: 'Heatmaps',  icon: Flame },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{
        background: 'rgba(3, 7, 18, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex items-center justify-between h-16">

          {/* ── Brand Logo ── */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Logo mark */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #a855f7 0%, #22d3ee 100%)',
                boxShadow: '0 0 20px rgba(168,85,247,0.4), 0 0 40px rgba(34,211,238,0.15)',
              }}
            >
              <Activity className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
            </div>

            <div>
              <h1
                className="text-base font-black tracking-tight leading-none"
                style={{
                  background: 'linear-gradient(135deg, #f8fafc 0%, #d8b4fe 60%, #22d3ee 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                CausalFunnel
              </h1>
              <span className="text-[9px] font-bold tracking-[0.18em] uppercase text-purple-400/70 leading-none">
                Aurora Analytics
              </span>
            </div>
          </div>

          {/* ── Navigation Links ── */}
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to);

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold relative transition-all duration-200 ${
                    isActive ? 'nav-top-active' : 'nav-top-inactive'
                  }`}
                  style={isActive ? {
                    background: 'rgba(168,85,247,0.1)',
                    border: '1px solid rgba(168,85,247,0.2)',
                  } : {
                    background: 'transparent',
                    border: '1px solid transparent',
                  }}
                >
                  <Icon
                    style={{ width: 16, height: 16 }}
                    className={isActive ? 'text-purple-400' : ''}
                  />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          {/* ── Right Side: Status + Demo Link ── */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Live indicator */}
            <div
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl"
              style={{
                background: 'rgba(16,185,129,0.07)',
                border: '1px solid rgba(16,185,129,0.15)',
              }}
            >
              <span
                className="w-2 h-2 rounded-full bg-emerald-400 dot-live flex-shrink-0"
                style={{ boxShadow: '0 0 6px rgba(16,185,129,0.8)' }}
              />
              <span className="text-[11px] font-bold text-emerald-400 tracking-wide">Live</span>
            </div>

            {/* Demo link */}
            <a
              href="http://localhost:5500/demo.html"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, rgba(168,85,247,0.15) 0%, rgba(34,211,238,0.08) 100%)',
                border: '1px solid rgba(168,85,247,0.25)',
                color: '#d8b4fe',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = '0 0 20px rgba(168,85,247,0.3)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Demo Site
              <ExternalLink style={{ width: 12, height: 12 }} />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
