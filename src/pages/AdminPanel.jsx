// src/pages/AdminPanel.jsx
import React, { useEffect, useState } from 'react';
import {
  getAllUsers, getAllSeminars, getAllRegistrations,
  updateUserProfile, deleteUserProfile, deleteSeminar,
} from '../services/seminarService';
import { Link } from 'react-router-dom';
import {
  Shield, Users, BookOpen, ClipboardList, CheckCircle,
  XCircle, Trash2, Edit, BarChart2, Search, RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';

const TABS = ['Overview', 'Coordinators', 'Programmes', 'Registrations'];

export default function AdminPanel() {
  const [tab, setTab]               = useState('Overview');
  const [users, setUsers]           = useState([]);
  const [seminars, setSeminars]     = useState([]);
  const [registrations, setRegs]    = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');

  async function load() {
    setLoading(true);
    try {
      const [u, s, r] = await Promise.all([getAllUsers(), getAllSeminars(), getAllRegistrations()]);
      setUsers(u);
      setSeminars(s);
      setRegs(r);
    } catch (err) {
      console.error('AdminPanel load error:', err);
      toast.error(`Failed to load admin data: ${err?.message || err}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function toggleApproval(uid, current) {
    try {
      await updateUserProfile(uid, { approved: !current });
      setUsers(u => u.map(x => x.uid === uid ? { ...x, approved: !current } : x));
      toast.success(!current ? 'User approved' : 'User approval revoked');
    } catch {
      toast.error('Failed to update user');
    }
  }

  async function handleDeleteUser(uid) {
    if (!window.confirm('Delete this user profile? (Firebase Auth account must be deleted separately)')) return;
    try {
      await deleteUserProfile(uid);
      setUsers(u => u.filter(x => x.uid !== uid));
      toast.success('User removed');
    } catch {
      toast.error('Failed to delete user');
    }
  }

  async function handleDeleteSeminar(id) {
    if (!window.confirm('Delete this seminar and all its registrations?')) return;
    try {
      await deleteSeminar(id);
      setSeminars(s => s.filter(x => x.id !== id));
      toast.success('Seminar deleted');
    } catch {
      toast.error('Failed to delete seminar');
    }
  }

  const professors       = users.filter(u => u.role === 'professor');
  const pendingProfessors = professors.filter(u => !u.approved);
  const q = search.toLowerCase();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-header flex items-center gap-2">
            <Shield size={24} className="text-brand-600" /> Admin Panel
          </h1>
          <p className="page-subheader">Manage coordinators, programmes, and registrations</p>
        </div>
        <button onClick={load} className="btn-secondary text-sm">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit mb-8">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${tab === t ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {t}
            {t === 'Professors' && pendingProfessors.length > 0 && (
              <span className="ml-1.5 badge bg-red-100 text-red-600 text-xs">{pendingProfessors.length}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="spinner !border-slate-300 !border-t-brand-500" style={{width:32,height:32,borderWidth:3}} />
        </div>
      ) : (
        <>
          {/* ── Overview ── */}
          {tab === 'Overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Total Coordinators', value: professors.length,    icon: Users,       color: 'text-brand-600 bg-brand-50' },
                  { label: 'Pending Approval', value: pendingProfessors.length, icon: Shield, color: 'text-amber-600 bg-amber-50' },
                  { label: 'Total Programmes',   value: seminars.length,      icon: BookOpen,    color: 'text-emerald-600 bg-emerald-50' },
                  { label: 'Registrations',    value: registrations.length, icon: ClipboardList, color: 'text-purple-600 bg-purple-50' },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="card p-5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                      <Icon size={20} />
                    </div>
                    <div className="text-3xl font-heading font-bold text-slate-900">{value}</div>
                    <div className="text-sm text-slate-500 mt-0.5">{label}</div>
                  </div>
                ))}
              </div>

              {/* Pending approvals */}
              {pendingProfessors.length > 0 && (
                <div className="card p-6">
                  <h3 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="badge bg-red-100 text-red-600">{pendingProfessors.length}</span>
                    Pending Approvals
                  </h3>
                  <div className="space-y-3">
                    {pendingProfessors.map(u => (
                      <div key={u.uid} className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-100">
                        <div>
                          <div className="font-semibold text-slate-800">{u.displayName}</div>
                          <div className="text-sm text-slate-500">{u.email}</div>
                        </div>
                        <button onClick={() => toggleApproval(u.uid, u.approved)} className="btn-primary text-sm py-1.5 px-4 bg-emerald-600 hover:bg-emerald-700">
                          <CheckCircle size={14} /> Approve
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent seminars */}
              <div className="card p-6">
                <h3 className="font-heading font-bold text-lg mb-4">Recent Programmes</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {['Title', 'Coordinator', 'Registrations'].map(h => (
                        <th key={h} className="text-left pb-3 text-slate-400 font-semibold text-xs uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {seminars.slice(0, 5).map(s => (
                      <tr key={s.id} className="border-b border-slate-50">
                        <td className="py-3 font-medium text-slate-800">{s.title}</td>
                        <td className="py-3 text-slate-500">{s.professorName}</td>
                        <td className="py-3">
                          <span className="badge bg-brand-100 text-brand-700">{s.registeredCount || 0}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Professors ── */}
          {tab === 'Coordinators' && (
            <div className="card overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex gap-3">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input className="input pl-9 text-sm" placeholder="Search professors…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      {['Name', 'Email', 'Role', 'Status', 'Programmes', 'Actions'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-slate-400 font-semibold text-xs uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.filter(u => !q || u.displayName?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)).map(u => (
                      <tr key={u.uid} className="border-b border-slate-50 hover:bg-slate-50 transition">
                        <td className="px-4 py-3 font-semibold text-slate-800">{u.displayName}</td>
                        <td className="px-4 py-3 text-slate-500">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className={`badge ${u.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-brand-100 text-brand-700'}`}>{u.role}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`badge ${u.approved ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                            {u.approved ? 'Approved' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {seminars.filter(s => s.professorUid === u.uid).length}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            {u.role !== 'admin' && (
                              <button onClick={() => toggleApproval(u.uid, u.approved)} className={`badge cursor-pointer py-1 px-2 ${u.approved ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'}`}>
                                {u.approved ? <><XCircle size={12} /> Revoke</> : <><CheckCircle size={12} /> Approve</>}
                              </button>
                            )}
                            <button onClick={() => handleDeleteUser(u.uid)} className="badge bg-slate-100 text-slate-500 hover:bg-red-100 hover:text-red-600 cursor-pointer py-1 px-2">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Seminars ── */}
          {tab === 'Programmes' && (
            <div className="card overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input className="input pl-9 text-sm" placeholder="Search programmes…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      {['Title', 'Coordinator', 'Department', 'Registrations', 'Actions'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-slate-400 font-semibold text-xs uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {seminars.filter(s => !q || s.title?.toLowerCase().includes(q) || s.professorName?.toLowerCase().includes(q)).map(s => (
                      <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                        <td className="px-4 py-3 font-medium text-slate-800 max-w-[200px]">
                          <Link to={`/seminar/${s.slug}`} target="_blank" className="hover:text-brand-600 hover:underline line-clamp-1">{s.title}</Link>
                        </td>
                        <td className="px-4 py-3 text-slate-500">{s.professorName}</td>
                        <td className="px-4 py-3 text-slate-400 text-xs max-w-[140px] truncate">{s.department}</td>
                        <td className="px-4 py-3">
                          <Link to={`/registrations/${s.id}`} className="badge bg-brand-100 text-brand-700 hover:bg-brand-200 cursor-pointer">
                            {s.registeredCount || 0}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Link to={`/qr/${s.id}`} className="badge bg-slate-100 text-slate-600 hover:bg-brand-100 hover:text-brand-700 cursor-pointer py-1 px-2">
                              <Edit size={12} /> QR/Edit
                            </Link>
                            <button onClick={() => handleDeleteSeminar(s.id)} className="badge bg-slate-100 text-slate-500 hover:bg-red-100 hover:text-red-600 cursor-pointer py-1 px-2">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Registrations ── */}
          {tab === 'Registrations' && (
            <div className="card overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input className="input pl-9 text-sm" placeholder="Search registrations…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      {['Name', 'Email', 'Phone', 'Roll No', 'Seminar', 'Registered At'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-slate-400 font-semibold text-xs uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.filter(r => !q || r.name?.toLowerCase().includes(q) || r.email?.toLowerCase().includes(q)).map(r => {
                      const sem = seminars.find(s => s.id === r.seminarId);
                      return (
                        <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                          <td className="px-4 py-3 font-medium text-slate-800">{r.name}</td>
                          <td className="px-4 py-3 text-slate-500">{r.email}</td>
                          <td className="px-4 py-3 text-slate-400">{r.phone || '—'}</td>
                          <td className="px-4 py-3 text-slate-400">{r.rollNo || '—'}</td>
                          <td className="px-4 py-3">
                            {sem ? (
                              <Link to={`/seminar/${sem.slug}`} target="_blank" className="badge bg-slate-100 text-slate-600 hover:bg-brand-100 hover:text-brand-700 max-w-[160px] truncate block">
                                {sem.title}
                              </Link>
                            ) : <span className="text-slate-300">—</span>}
                          </td>
                          <td className="px-4 py-3 text-slate-400 text-xs">
                            {r.registeredAt?.toDate ? r.registeredAt.toDate().toLocaleString() : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
