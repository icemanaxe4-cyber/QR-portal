// src/pages/Registrations.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSeminar, getRegistrationsBySeminar } from '../services/seminarService';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Download, Users, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Registrations() {
  const { id }    = useParams();
  const { currentUser } = useAuth();

  const [seminar, setSeminar]         = useState(null);
  const [registrations, setRegs]      = useState([]);
  const [filtered, setFiltered]       = useState([]);
  const [search, setSearch]           = useState('');
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [sem, regs] = await Promise.all([getSeminar(id), getRegistrationsBySeminar(id)]);
        if (!sem) { toast.error('Seminar not found'); return; }
        if (sem.professorUid !== currentUser?.uid) {
          toast.error('Access denied'); return;
        }
        setSeminar(sem);
        setRegs(regs);
        setFiltered(regs);
      } catch {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(registrations.filter(r =>
      r.name?.toLowerCase().includes(q) ||
      r.email?.toLowerCase().includes(q) ||
      r.rollNo?.toLowerCase().includes(q)
    ));
  }, [search, registrations]);

  function downloadCSV() {
    const headers = ['Name', 'Email', 'Phone', 'Roll No', 'Registered At'];
    const rows    = registrations.map(r => [
      r.name, r.email, r.phone || '', r.rollNo || '',
      r.registeredAt?.toDate ? r.registeredAt.toDate().toLocaleString() : '',
    ]);
    const csv    = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob   = new Blob([csv], { type: 'text/csv' });
    const url    = URL.createObjectURL(blob);
    const a      = document.createElement('a');
    a.href       = url;
    a.download   = `registrations-${seminar?.slug || id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV downloaded!');
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="spinner !border-slate-300 !border-t-brand-500" style={{width:32,height:32,borderWidth:3}} />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 fade-in">
      <Link to="/dashboard" className="btn-ghost text-sm mb-6 inline-flex">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="page-header mb-0">Registrations</h1>
          <p className="text-slate-500 text-sm mt-1">{seminar?.title}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="badge bg-brand-100 text-brand-700 py-1.5 px-3">
            <Users size={13} /> {registrations.length} registered
          </span>
          <button onClick={downloadCSV} disabled={registrations.length === 0} className="btn-secondary text-sm">
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="input pl-10"
          placeholder="Search by name, email or roll number…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['#', 'Name', 'Email', 'Phone', 'Roll No', 'Registered At'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-slate-500 font-semibold text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    {registrations.length === 0 ? 'No registrations yet.' : 'No results match your search.'}
                  </td>
                </tr>
              ) : (
                filtered.map((r, i) => (
                  <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                    <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{r.name}</td>
                    <td className="px-4 py-3 text-slate-600">{r.email}</td>
                    <td className="px-4 py-3 text-slate-500">{r.phone || '—'}</td>
                    <td className="px-4 py-3 text-slate-500">{r.rollNo || '—'}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {r.registeredAt?.toDate ? r.registeredAt.toDate().toLocaleString() : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
