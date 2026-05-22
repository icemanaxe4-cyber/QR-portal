// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getSeminarsByProfessor, deleteSeminar } from '../services/seminarService';
import SeminarCard from '../components/SeminarCard';
import { Plus, BookOpen, TrendingUp, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { userProfile, currentUser } = useAuth();
  const [seminars, setSeminars] = useState([]);
  const [loading, setLoading]   = useState(true);

  async function load() {
    if (!currentUser) return;
    setLoading(true);
    try {
      const data = await getSeminarsByProfessor(currentUser.uid);
      setSeminars(data);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load seminars');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [currentUser]);

  async function handleDelete(id) {
    if (!window.confirm('Delete this seminar? This cannot be undone.')) return;
    try {
      await deleteSeminar(id);
      setSeminars(prev => prev.filter(s => s.id !== id));
      toast.success('Seminar deleted');
    } catch {
      toast.error('Failed to delete seminar');
    }
  }

  const thisMonth = seminars.filter(s => {
    if (!s.createdAt) return false;
    const d = s.createdAt.toDate ? s.createdAt.toDate() : new Date(s.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 fade-in">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-10">
        <div>
          <h1 className="page-header">
            Welcome back, {userProfile?.displayName?.split(' ')[0] || 'Professor'} 👋
          </h1>
          <p className="page-subheader">
            Manage your programmes and track registrations
          </p>
        </div>
        <Link to="/create" className="btn-primary self-start sm:self-auto shrink-0">
          <Plus size={17} /> New Programme
        </Link>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <StatCard
          label="Total Programmes"
          value={seminars.length}
          icon={<BookOpen size={20} />}
          color="bg-brand-50 text-brand-600"
        />
        <StatCard
          label="This Month"
          value={thisMonth}
          icon={<TrendingUp size={20} />}
          color="bg-violet-50 text-violet-600"
        />
      </div>

      {/* ── Seminars grid ── */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-heading font-bold text-xl text-slate-800">Your Programmes</h2>
        {seminars.length > 0 && (
          <span className="text-xs text-slate-400 font-semibold">{seminars.length} total</span>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4 text-slate-400">
          <div className="spinner spinner-dark" style={{ width: 36, height: 36, borderWidth: 3 }} />
          <span className="text-sm font-medium">Loading programmes…</span>
        </div>
      ) : seminars.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {seminars.map(s => (
            <SeminarCard key={s.id} seminar={s} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className="card p-5 hover:shadow-md transition-shadow duration-200">
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-4 ${color} shadow-sm`}>
        {icon}
      </div>
      <div className="text-3xl font-heading font-bold text-slate-900 leading-none">{value}</div>
      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-2">{label}</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <div className="w-20 h-20 bg-brand-50 border-2 border-brand-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
        <Sparkles size={32} className="text-brand-400" />
      </div>
      <h3 className="font-heading text-xl font-bold text-slate-800 mb-2">No programmes yet</h3>
      <p className="text-slate-400 text-sm mb-8 max-w-xs leading-relaxed">
        Create your first programme to generate a QR code and public landing page for attendees.
      </p>
      <Link to="/create" className="btn-primary">
        <Plus size={16} /> Create Your First Programme
      </Link>
    </div>
  );
}
