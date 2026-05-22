// src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, LayoutDashboard, LogOut, Menu, X, User, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
      toast.success('Signed out successfully');
    } catch {
      toast.error('Error signing out');
    }
  }

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 glass border-b border-slate-200/70 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md transition-shadow duration-200"
              style={{ background: 'linear-gradient(135deg,#1e40af,#2563eb)', boxShadow: '0 4px 14px rgba(37,99,235,0.35)' }}>
              <BookOpen size={17} className="text-white" />
            </div>
            <span className="font-heading font-bold text-lg tracking-tight" style={{ color: '#1e293b' }}>
              Programme<span style={{ color: '#2563eb' }}>Hub</span>
            </span>
          </Link>

          {/* ── Desktop nav ── */}
          <div className="hidden sm:flex items-center gap-1">
            {currentUser ? (
              <>
                <NavLink to="/dashboard" active={isActive('/dashboard')}>
                  <LayoutDashboard size={15} /> Dashboard
                </NavLink>
                {/* User pill */}
                <div className="relative ml-3 pl-3 border-l border-slate-200">
                  <button
                    onClick={() => setUserMenuOpen(v => !v)}
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors duration-150"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-sm">
                      <span className="text-white text-xs font-bold">
                        {(userProfile?.displayName || 'U')[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="text-left hidden md:block">
                      <div className="text-sm font-semibold text-slate-800 leading-none">{userProfile?.displayName?.split(' ')[0] || 'User'}</div>
                      <div className="text-xs text-slate-400 mt-0.5 capitalize">{userProfile?.role || 'professor'}</div>
                    </div>
                    <ChevronDown size={13} className={`text-slate-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 card shadow-xl py-1.5 fade-in-up" onMouseLeave={() => setUserMenuOpen(false)}>
                      <div className="px-4 py-2.5 border-b border-slate-100">
                        <div className="font-semibold text-slate-800 text-sm">{userProfile?.displayName}</div>
                        <div className="text-xs text-slate-400 truncate mt-0.5">{currentUser?.email}</div>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors duration-150 mt-0.5"
                      >
                        <LogOut size={14} /> Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-brand-600 transition-colors duration-150 px-3 py-2">
                  Sign In
                </Link>
                <Link to="/signup" className="btn-primary text-sm py-2 px-4">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* ── Mobile hamburger ── */}
          <button
            className="sm:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors duration-150"
            onClick={() => setMobileOpen(v => !v)}
          >
            {mobileOpen ? <X size={20} className="text-slate-600" /> : <Menu size={20} className="text-slate-600" />}
          </button>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-1 slide-down">
          {currentUser ? (
            <>
              <MobileNavLink to="/dashboard" onClick={() => setMobileOpen(false)}>
                <LayoutDashboard size={16} /> Dashboard
              </MobileNavLink>
              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-sm text-slate-600 font-medium">{userProfile?.displayName}</div>
                <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-red-500 font-semibold hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">
                  <LogOut size={14} /> Sign out
                </button>
              </div>
            </>
          ) : (
            <>
              <MobileNavLink to="/login" onClick={() => setMobileOpen(false)}>Sign In</MobileNavLink>
              <Link to="/signup" onClick={() => setMobileOpen(false)} className="btn-primary w-full justify-center mt-2">Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

function NavLink({ to, active, children }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
        active
          ? 'bg-blue-50 text-blue-700'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
      }`}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ to, onClick, children }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors duration-150"
    >
      {children}
    </Link>
  );
}
