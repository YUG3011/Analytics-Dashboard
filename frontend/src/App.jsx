import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import SessionsPage from './pages/SessionsPage';
import SessionDetailsPage from './pages/SessionDetailsPage';
import HeatmapPage from './pages/HeatmapPage';

export default function App() {
  return (
    <Router>
      {/* Root container: full height, midnight navy bg */}
      <div className="min-h-screen bg-[#030712] text-slate-200 relative overflow-x-hidden">

        {/* ── Aurora Background Mesh Decorations ── */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden="true">
          {/* Top-left purple orb */}
          <div
            className="aurora-orb w-[700px] h-[700px] -top-48 -left-48"
            style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)' }}
          />
          {/* Top-right cyan orb */}
          <div
            className="aurora-orb w-[500px] h-[500px] -top-32 right-0"
            style={{
              background: 'radial-gradient(circle, rgba(34,211,238,0.06) 0%, transparent 70%)',
              animationDelay: '4s',
            }}
          />
          {/* Bottom-left emerald orb */}
          <div
            className="aurora-orb w-[400px] h-[400px] bottom-0 left-1/4"
            style={{
              background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)',
              animationDelay: '8s',
            }}
          />
          {/* Mesh grid overlay */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(168,85,247,0.025) 1px, transparent 1px),
                linear-gradient(90deg, rgba(168,85,247,0.025) 1px, transparent 1px)
              `,
              backgroundSize: '48px 48px',
            }}
          />
        </div>

        {/* ── Top Navigation ── */}
        <Navbar />

        {/* ── Main Content ── */}
        <main className="relative z-10">
          <div className="max-w-[1400px] mx-auto px-6 py-8">
            <Routes>
              <Route path="/"                        element={<Dashboard />}           />
              <Route path="/sessions"                element={<SessionsPage />}        />
              <Route path="/sessions/:sessionId"     element={<SessionDetailsPage />}  />
              <Route path="/heatmap"                 element={<HeatmapPage />}         />
              <Route path="*"                        element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}
