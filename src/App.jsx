// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, ApprovedRoute } from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages
import Login        from './pages/Login';
import Signup       from './pages/Signup';
import Dashboard    from './pages/Dashboard';
import CreateSeminar from './pages/CreateSeminar';
import EditSeminar  from './pages/EditSeminar';
import QRCodePage   from './pages/QRCodePage';
import SeminarLanding from './pages/SeminarLanding';
import Registrations from './pages/Registrations';


// Layout wrapper (with navbar)
function WithNav({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}

// Public seminar pages do NOT show the app navbar — they're standalone landing pages
function PublicLayout({ children }) {
  return (
    <>
      <header className="sticky top-0 z-50" style={{
        background: 'rgba(10,22,40,0.94)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(59,130,246,0.12)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
      }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-10 h-12 sm:h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 sm:gap-2.5 group">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-white font-black text-xs sm:text-sm"
              style={{ background: 'linear-gradient(135deg,#1e40af,#2563eb)', boxShadow: '0 4px 12px rgba(37,99,235,0.45)' }}>
              P
            </div>
            <span className="font-heading font-bold text-sm sm:text-base tracking-tight text-white">
              Programme<span style={{ color: '#60a5fa' }}>Hub</span>
            </span>
          </a>
          <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full"
            style={{ background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(59,130,246,0.25)' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-blue-300 text-[9px] sm:text-xs font-bold uppercase tracking-widest">Live</span>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { borderRadius: '12px', fontSize: '14px', fontFamily: 'Plus Jakarta Sans, sans-serif' },
            success: { iconTheme: { primary: '#2563eb', secondary: '#fff' } },
          }}
        />

        <Routes>
          <Route path="/login"  element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Public seminar landing (minimal header) */}
          <Route path="/seminar/:slug" element={<PublicLayout><SeminarLanding /></PublicLayout>} />

          {/* Protected app routes */}
          <Route path="/" element={<WithNav><Navigate to="/dashboard" replace /></WithNav>} />

          <Route path="/dashboard" element={
            <WithNav>
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            </WithNav>
          } />

          <Route path="/create" element={
            <WithNav>
              <ApprovedRoute><CreateSeminar /></ApprovedRoute>
            </WithNav>
          } />

          <Route path="/edit/:id" element={
            <WithNav>
              <ApprovedRoute><EditSeminar /></ApprovedRoute>
            </WithNav>
          } />

          <Route path="/qr/:id" element={
            <WithNav>
              <ApprovedRoute><QRCodePage /></ApprovedRoute>
            </WithNav>
          } />

          <Route path="/registrations/:id" element={
            <WithNav>
              <ApprovedRoute><Registrations /></ApprovedRoute>
            </WithNav>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
