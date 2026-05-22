// src/components/SeminarCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, QrCode, Edit, Trash2, ExternalLink } from 'lucide-react';

export default function SeminarCard({ seminar, onDelete, showActions = true }) {
  const {
    id, slug, title, professorName, department, date, time, venue,
    maxSeats, registeredCount = 0, topics = [],
  } = seminar;

  const seatsLeft    = maxSeats ? parseInt(maxSeats) - registeredCount : null;
  const isFull       = seatsLeft !== null && seatsLeft <= 0;
  const isAlmostFull = seatsLeft !== null && seatsLeft > 0 && seatsLeft <= 5;
  const isUpcoming   = date && new Date(date) >= new Date();

  // Generate a consistent gradient from the title
  const gradients = [
    'from-blue-600 to-blue-800',
    'from-blue-500 to-indigo-700',
    'from-slate-600 to-blue-800',
    'from-amber-500 to-orange-600',
    'from-teal-500 to-blue-700',
    'from-cyan-500 to-blue-700',
  ];
  const gradientIndex = title ? title.charCodeAt(0) % gradients.length : 0;
  const gradient = gradients[gradientIndex];

  return (
    <div className="card-hover flex flex-col group overflow-hidden">

      {/* ── Coloured banner ── */}
      <div className={`relative h-36 bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}>
        {/* Large initial watermark */}
        <span className="font-heading text-white/20 text-8xl font-bold select-none leading-none">
          {title?.[0]?.toUpperCase()}
        </span>

        {/* Top badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
          {isUpcoming && (
            <span className="badge bg-white/20 text-white text-[10px] backdrop-blur-sm border border-white/20">
              Upcoming
            </span>
          )}
          {seatsLeft !== null && (
            <span className={`badge text-[10px] ml-auto ${
              isFull       ? 'bg-red-100 text-red-700' :
              isAlmostFull ? 'bg-amber-100 text-amber-700' :
                             'bg-emerald-100 text-emerald-700'
            }`}>
              {isFull ? 'Fully Booked' : `${seatsLeft} seats left`}
            </span>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex-1 space-y-3">

          {/* Title & professor */}
          <div>
            <h3 className="font-heading font-bold text-base text-slate-900 leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors duration-200">
              {title}
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {professorName}
              {department && <span className="text-slate-400"> · {department}</span>}
            </p>
          </div>

          {/* Meta info */}
          <div className="space-y-1.5">
            {venue && (
              <MetaRow icon={<MapPin size={13} />}>
                <span className="line-clamp-1">{venue}</span>
              </MetaRow>
            )}
            <MetaRow icon={<Users size={13} />}>
              <span className={isFull ? 'text-red-600 font-semibold' : ''}>
                {registeredCount} registered
                {maxSeats ? ` / ${maxSeats}` : ''}
              </span>
            </MetaRow>
          </div>

          {/* Topics */}
          {topics.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {topics.slice(0, 3).map(t => (
                <span key={t} className="badge-brand text-[10px]">{t}</span>
              ))}
              {topics.length > 3 && (
                <span className="badge bg-slate-100 text-slate-500 text-[10px]">+{topics.length - 3} more</span>
              )}
            </div>
          )}
        </div>

        {/* ── Action bar ── */}
        {showActions && (
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-4 gap-1">
            <ActionBtn href={`/seminar/${slug}`} external className="text-blue-600 hover:bg-blue-50">
              <ExternalLink size={13} />
              <span className="hidden sm:inline">View</span>
            </ActionBtn>
            <ActionBtn href={`/qr/${id}`}>
              <QrCode size={13} />
              <span className="hidden sm:inline">QR</span>
            </ActionBtn>
            <ActionBtn href={`/edit/${id}`}>
              <Edit size={13} />
              <span className="hidden sm:inline">Edit</span>
            </ActionBtn>
            {onDelete && (
              <button
                onClick={() => onDelete(id)}
                className="flex items-center justify-center gap-1 text-xs font-semibold text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg py-1.5 transition-all duration-150"
              >
                <Trash2 size={13} />
                <span className="hidden sm:inline">Del</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MetaRow({ icon, children }) {
  return (
    <div className="flex items-center gap-2 text-xs text-slate-600">
      <span className="text-brand-400 shrink-0">{icon}</span>
      {children}
    </div>
  );
}

function ActionBtn({ href, children, external = false, className = '' }) {
  const cls = `flex items-center justify-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg py-1.5 transition-all duration-150 ${className}`;
  return external
    ? <Link to={href} target="_blank" className={cls}>{children}</Link>
    : <Link to={href} className={cls}>{children}</Link>;
}
