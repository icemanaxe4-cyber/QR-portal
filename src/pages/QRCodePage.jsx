// src/pages/QRCodePage.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSeminar } from '../services/seminarService';
import { getRegistrationsBySeminar } from '../services/seminarService';
import { Download, ExternalLink, Copy, Users, ArrowLeft, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';
import QRCode from 'qrcode';

export default function QRCodePage() {
  const { id }              = useParams();
  const [seminar, setSeminar]         = useState(null);
  const [registrations, setRegs]      = useState([]);
  const [qrDataUrl, setQrDataUrl]     = useState('');
  const [loading, setLoading]         = useState(true);
  const canvasRef                     = useRef();

  const publicUrl = seminar ? `${window.location.origin}/seminar/${seminar.slug}` : '';

  useEffect(() => {
    async function load() {
      try {
        // Load seminar first — this must succeed
        const sem = await getSeminar(id);
        setSeminar(sem);

        if (sem) {
          // Generate QR code
          const url = `${window.location.origin}/seminar/${sem.slug}`;
          const dataUrl = await QRCode.toDataURL(url, {
            width:       400,
            margin:      2,
            color:       { dark: '#262dac', light: '#ffffff' },
            errorCorrectionLevel: 'H',
          });
          setQrDataUrl(dataUrl);

          // Load registrations separately — a missing Firestore index won't break the page
          try {
            const regs = await getRegistrationsBySeminar(id);
            setRegs(regs);
          } catch (regErr) {
            console.warn('Could not load registrations (index may be missing):', regErr?.message);
            // If Firestore logs a link to create the index, it appears in the console above
          }
        }
      } catch (e) {
        console.error('Failed to load seminar:', e);
        toast.error('Failed to load seminar');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  function downloadQR() {
    const a     = document.createElement('a');
    a.href      = qrDataUrl;
    a.download  = `qr-${seminar.slug}.png`;
    a.click();
    toast.success('QR code downloaded!');
  }

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(publicUrl);
      toast.success('URL copied to clipboard!');
    } catch {
      toast.error('Could not copy URL');
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="spinner !border-slate-300 !border-t-brand-500" style={{width:32,height:32,borderWidth:3}} />
    </div>
  );

  if (!seminar) return (
    <div className="text-center py-24 text-slate-500">Seminar not found.</div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 fade-in">
      {/* Back */}
      <Link to="/dashboard" className="btn-ghost text-sm mb-6 inline-flex">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* QR Card */}
        <div className="card p-8 flex flex-col items-center">
          <div className="flex items-center gap-2 text-brand-600 mb-6">
            <QrCode size={20} />
            <span className="font-heading font-bold text-lg">QR Code</span>
          </div>

          {qrDataUrl ? (
            <div className="bg-white p-4 rounded-2xl shadow-inner border-2 border-brand-100 mb-6">
              <img src={qrDataUrl} alt="QR Code" className="w-56 h-56" />
            </div>
          ) : (
            <div className="w-64 h-64 bg-slate-100 rounded-2xl flex items-center justify-center mb-6">
              <div className="spinner !border-slate-300 !border-t-brand-500" style={{width:32,height:32,borderWidth:3}} />
            </div>
          )}

          <h2 className="font-heading font-bold text-xl text-slate-900 text-center mb-1">{seminar.title}</h2>
          <p className="text-slate-500 text-sm text-center mb-6">{seminar.professorName} · {seminar.department}</p>

          <div className="flex gap-3 w-full">
            <button onClick={downloadQR} disabled={!qrDataUrl} className="btn-primary flex-1 justify-center">
              <Download size={16} /> Download QR
            </button>
            <Link to={`/seminar/${seminar.slug}`} target="_blank" className="btn-secondary flex-1 justify-center">
              <ExternalLink size={16} /> Preview
            </Link>
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-6">
          {/* URL card */}
          <div className="card p-6">
            <h3 className="font-semibold text-slate-700 mb-3">Public Seminar URL</h3>
            <div className="flex gap-2">
              <div className="flex-1 input text-sm text-slate-500 bg-slate-50 truncate py-2.5">{publicUrl}</div>
              <button onClick={copyUrl} className="btn-secondary px-4">
                <Copy size={15} />
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-2">Share this URL or use the QR code on posters and brochures.</p>
          </div>

          {/* Seminar info */}
          <div className="card p-6">
            <h3 className="font-semibold text-slate-700 mb-4">Seminar Details</h3>
            <dl className="space-y-3 text-sm">
              {[
                ['Date', seminar.date],
                ['Time', seminar.time],
                ['Venue', seminar.venue],
                ['Duration', seminar.duration],
                ['Max Seats', seminar.maxSeats || 'Unlimited'],
                ['Registration Deadline', seminar.registrationDeadline],
              ].filter(([, v]) => v).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt className="text-slate-500 shrink-0">{k}</dt>
                  <dd className="text-slate-800 font-medium text-right">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Registration stats */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-700">Registrations</h3>
              <span className="badge bg-brand-100 text-brand-700">
                <Users size={12} /> {registrations.length}
              </span>
            </div>
            {registrations.length === 0 ? (
              <p className="text-sm text-slate-400">No registrations yet. Share the QR to get started!</p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {registrations.map(r => (
                  <div key={r.id} className="flex items-center justify-between text-sm py-2 border-b border-slate-50 last:border-0">
                    <div>
                      <div className="font-medium text-slate-800">{r.name}</div>
                      <div className="text-slate-400 text-xs">{r.email}</div>
                    </div>
                    <div className="text-xs text-slate-400">{r.rollNo || ''}</div>
                  </div>
                ))}
              </div>
            )}
            {registrations.length > 0 && (
              <Link to={`/registrations/${id}`} className="btn-ghost text-sm text-brand-600 mt-3 w-full justify-center">
                View all registrations →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
