// src/pages/SeminarLanding.jsx
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getSeminarBySlug } from '../services/seminarService';
import {
  Share2, BookOpen, ExternalLink, Video,
  Users, Clock, Star, CalendarDays, Building2,
  PlayCircle, Layers, Link2,
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ─── helper ─────────────────────────────────────────────────────────────── */
function getYouTubeId(url) {
  if (!url) return null;
  const pats = [
    /youtube\.com\/watch\?v=([\w-]{11})/,
    /youtu\.be\/([\w-]{11})/,
    /youtube\.com\/embed\/([\w-]{11})/,
    /youtube\.com\/shorts\/([\w-]{11})/,
  ];
  for (const p of pats) { const m = url.match(p); if (m) return m[1]; }
  return null;
}

/* Count total topics across all pillars (modules) */
function countTopics(pillars = []) {
  return pillars.reduce((acc, p) => acc + (p.modules?.filter(m => m.name).length || 0), 0);
}

/* ─── page ───────────────────────────────────────────────────────────────── */
export default function SeminarLanding() {
  const { slug } = useParams();
  const [seminar, setSeminar] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    getSeminarBySlug(slug)
      .then(setSeminar)
      .catch(() => toast.error('Failed to load programme'))
      .finally(() => setLoading(false));
  }, [slug]);

  function handleShare() {
    if (navigator.share) navigator.share({ title: seminar?.title, url: window.location.href });
    else { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }
  }

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0a1628' }}>
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#1e40af,#1d4ed8)', boxShadow: '0 0 40px rgba(29,78,216,0.5)' }}>
            <BookOpen size={24} className="text-white" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 flex items-center justify-center"
            style={{ background: '#1e40af', borderColor: '#0a1628' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          </div>
        </div>
        <p className="text-blue-300 text-xs sm:text-sm tracking-[0.2em] uppercase font-medium text-center">Loading Programme</p>
      </div>
    </div>
  );

  /* ── Not found ── */
  if (!seminar) return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0a1628' }}>
      <div className="text-center max-w-xs">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
          style={{ background: '#0f2044', border: '1px solid rgba(59,130,246,0.2)' }}>
          <BookOpen size={28} className="text-blue-600" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Programme Not Found</h2>
        <p className="text-blue-300/60 text-sm leading-relaxed">This page may have been removed or the link is invalid.</p>
      </div>
    </div>
  );

  const { title, professorName, department, duration,
    shortDescription, fullDescription,
    pillars = [], coordinatorBio, speakerBio,
    videoLinks = [], tools = [] } = seminar;

  const bioText = coordinatorBio || speakerBio;
  const validPillars = pillars.filter(p => p.name);
  const totalTopics = countTopics(validPillars);

  /* First YouTube video for hero embed */
  const heroYtId = videoLinks.map(getYouTubeId).find(Boolean);

  /* Parse duration to hours (fallback to counting modules × 1h) */
  const hoursLabel = duration || `${totalTopics} hrs`;

  return (
    <div className="min-h-screen font-sans" style={{ background: '#0a1628' }}>

      {/* ══════════════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ minHeight: 'clamp(420px, 70vw, 600px)' }}>

        <img src="/xlri-campus.png" alt="XLRI Campus"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center 38%', zIndex: 0 }} />

        {/* Overlays */}
        <div className="absolute inset-0" style={{
          zIndex: 1,
          background: 'linear-gradient(180deg,rgba(0,10,40,0.40) 0%,rgba(0,10,40,0.75) 50%,rgba(5,15,50,0.97) 100%)'
        }} />
        <div className="absolute inset-0" style={{
          zIndex: 2,
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,5,30,0.5) 100%)'
        }} />

        {/* Content */}
        <div className="relative w-full flex flex-col justify-end"
          style={{ zIndex: 10, minHeight: 'clamp(420px, 70vw, 600px)', padding: 'clamp(1rem,4vw,4rem) clamp(1rem,5vw,2.5rem) clamp(4rem,8vw,5rem)' }}>

          <div className="max-w-6xl mx-auto w-full">
            {/* Two-column layout: left info + right video embed */}
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-end lg:items-center">

              {/* ── Left: text content ── */}
              <div className="flex-1 min-w-0">
                {/* Badge */}
                <div className="mb-5 sm:mb-7 fade-in-up">
                  <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-[0.12em] sm:tracking-[0.15em] text-white/75"
                    style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', backdropFilter: 'blur(16px)' }}>
                    <Star size={10} fill="currentColor" className="text-amber-300 flex-shrink-0" />
                    <span>XLRI – Xavier School of Management</span>
                    {department && <><span className="opacity-30">·</span><span className="text-white/50 hidden xs:inline">{department}</span></>}
                  </span>
                </div>

                {/* Title */}
                <h1 className="font-black text-white leading-[1.06] mb-4 sm:mb-5 fade-in-up max-w-2xl"
                  style={{
                    fontSize: 'clamp(1.65rem, 4.5vw, 3.25rem)', letterSpacing: '-0.02em',
                    animationDelay: '0.07s', textShadow: '0 4px 32px rgba(0,0,0,0.5)'
                  }}>
                  {title}
                </h1>

                {/* Short description */}
                {shortDescription && (
                  <p className="text-white/55 leading-relaxed mb-7 sm:mb-9 fade-in-up max-w-xl"
                    style={{ fontSize: 'clamp(0.85rem, 1.8vw, 1.05rem)', animationDelay: '0.13s' }}>
                    {shortDescription}
                  </p>
                )}

                {/* CTA row — Share + Registration link (no duration) */}
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 fade-in-up" style={{ animationDelay: '0.18s' }}>
                  <button onClick={handleShare}
                    className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold text-white transition-all duration-200 hover:scale-105 hover:brightness-110 active:scale-100"
                    style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.22)', backdropFilter: 'blur(8px)' }}>
                    <Share2 size={13} /> Share
                  </button>

                  <a href="https://www.xlri.ac.in" target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold text-white transition-all duration-200 hover:scale-105 hover:brightness-110 active:scale-100"
                    style={{ background: 'linear-gradient(135deg,#1e40af,#2563eb)', boxShadow: '0 8px 28px rgba(37,99,235,0.5)' }}>
                    <Link2 size={13} /> Register Now
                  </a>
                </div>

                {/* Coordinator */}
                {professorName && (
                  <div className="flex items-center gap-3 mt-7 sm:mt-10 pt-5 sm:pt-7 fade-in-up"
                    style={{ animationDelay: '0.22s', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-white text-sm sm:text-base font-black flex-shrink-0"
                      style={{ background: 'rgba(37,99,235,0.3)', border: '1px solid rgba(59,130,246,0.3)', backdropFilter: 'blur(8px)' }}>
                      {professorName[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-bold text-xs sm:text-sm leading-none">{professorName}</p>
                      <p className="text-blue-300/50 text-[10px] sm:text-xs mt-1">Programme Coordinator</p>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Right: embedded YouTube video ── */}
              {heroYtId && (
                <div className="w-full lg:w-[44%] xl:w-[42%] flex-shrink-0 fade-in-up" style={{ animationDelay: '0.25s' }}>
                  <div className="rounded-2xl overflow-hidden shadow-2xl"
                    style={{ aspectRatio: '16/9', border: '2px solid rgba(59,130,246,0.35)', boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(59,130,246,0.15)' }}>
                    <iframe
                      src={`https://www.youtube.com/embed/${heroYtId}?rel=0&modestbranding=1`}
                      title="Programme Video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          STATS RIBBON — Topics covered & Hours
      ══════════════════════════════════════════════════════════════════ */}
      <div style={{ background: '#0a1628', borderBottom: '1px solid rgba(59,130,246,0.12)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-10">
          <div className="grid grid-cols-4">
            {[
              { value: validPillars.length, label: 'Pillars', color: '#818cf8' },
              { value: totalTopics, label: 'Topics Covered', color: '#34d399' },
              { value: hoursLabel, label: 'Hours', color: '#60a5fa' },
              { value: videoLinks.length, label: 'Videos', color: '#f87171' },
            ].map(({ value, label, color }, i) => (
              <div key={i} className="flex flex-col items-center justify-center py-4 sm:py-5"
                style={{ borderRight: i < 3 ? '1px solid rgba(59,130,246,0.1)' : 'none' }}>
                <span className="text-xl sm:text-2xl lg:text-3xl font-black tabular-nums" style={{ color }}>
                  {value || '0'}
                </span>
                <span className="text-[9px] sm:text-xs font-bold uppercase tracking-widest mt-1 text-center"
                  style={{ color: 'rgba(148,163,184,0.5)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          WAVE TRANSITION — dark navy stats → light body
      ══════════════════════════════════════════════════════════════════ */}
      <div style={{ background: '#0a1628', marginBottom: '-2px' }}>
        <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg"
          style={{ display: 'block', width: '100%', height: 'clamp(40px, 6vw, 80px)' }}
          preserveAspectRatio="none">
          <path
            d="M0,0 C360,80 1080,0 1440,60 L1440,80 L0,80 Z"
            fill="#f0f5fb"
          />
        </svg>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          BODY — light content area
      ══════════════════════════════════════════════════════════════════ */}
      <div style={{ background: '#f0f5fb' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-10 py-4 sm:py-8 lg:py-12">
          <div className="space-y-5 sm:space-y-6">

            {/* About */}
            {fullDescription && (
              <ElegantSection label="About" title="About This Programme">
                <AboutContent text={fullDescription} />
              </ElegantSection>
            )}

            {/* Programme Hub */}
            {validPillars.length > 0 && (
              <ElegantSection label="Curriculum" title="Programme Hub">
                <CurriculumTable pillars={validPillars} />
              </ElegantSection>
            )}

            {/* Tools Used */}
            {tools.length > 0 && (
              <ElegantSection label="Resources" title="Tools Used">
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {tools.map((tool, i) => (
                    <span key={i}
                      className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 hover:-translate-y-0.5"
                      style={{
                        background: 'linear-gradient(135deg,#eff6ff,#dbeafe)',
                        color: '#1e40af',
                        border: '1px solid #bfdbfe',
                        boxShadow: '0 2px 8px rgba(30,64,175,0.08)',
                      }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                      {tool}
                    </span>
                  ))}
                </div>
              </ElegantSection>
            )}

            {/* Videos — embedded iframes */}
            {videoLinks.length > 0 && (
              <ElegantSection label="Media" title="Watch Videos">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {videoLinks.map((url, i) => {
                    const ytId = getYouTubeId(url);
                    return ytId ? (
                      <div key={i} className="rounded-xl sm:rounded-2xl overflow-hidden shadow-lg"
                        style={{ border: '1px solid rgba(0,0,0,0.08)', aspectRatio: '16/9' }}>
                        <iframe
                          src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`}
                          title={`Video ${i + 1}`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full"
                        />
                      </div>
                    ) : (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-blue-100 hover:border-blue-200 hover:bg-blue-50 transition-all group">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                          <Video size={15} className="text-blue-400" />
                        </div>
                        <span className="text-xs sm:text-sm text-slate-500 font-medium truncate flex-1 min-w-0">{url}</span>
                        <ExternalLink size={12} className="text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0" />
                      </a>
                    );
                  })}
                </div>
              </ElegantSection>
            )}

            {/* Coordinator */}
            {bioText && (
              <ElegantSection label="Coordinator" title="About the Coordinator">
                <div className="flex flex-col xs:flex-row gap-4 sm:gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-white text-xl sm:text-2xl font-black shadow-lg"
                      style={{ background: 'linear-gradient(135deg,#1e3a6e,#1e40af)' }}>
                      {professorName?.[0]?.toUpperCase()}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-slate-900 text-lg sm:text-xl leading-tight">{professorName}</h3>
                    <p className="text-blue-500 text-[10px] sm:text-xs font-bold uppercase tracking-widest mt-1 mb-3 sm:mb-4">{department}</p>
                    <p className="text-slate-600 text-sm leading-relaxed">{bioText}</p>
                  </div>
                </div>
              </ElegantSection>
            )}
          </div>
        </div>
      </div>{/* end light body bg */}

      {/* ══════════════════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════════════════ */}
      <footer style={{ background: '#0a1628', borderTop: '1px solid rgba(59,130,246,0.1)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-10 py-7 sm:py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-white font-black text-xs sm:text-sm"
                style={{ background: 'linear-gradient(135deg,#1e40af,#2563eb)' }}>P</div>
              <span className="font-black text-white text-xs sm:text-sm tracking-tight">
                Programme<span style={{ color: '#60a5fa' }}>Hub</span>
              </span>
            </div>
            <p className="text-slate-600 text-[10px] sm:text-xs text-center order-last sm:order-none">
              XLRI – Xavier School of Management{department ? ` · ${department}` : ''}
            </p>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.2)' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-blue-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest">Live</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── About content with proper formatting ────────────────────────────────── */
function AboutContent({ text }) {
  if (!text) return null;

  // Split by double newlines to get paragraphs, then handle bullet-like lines
  const paragraphs = text.split(/\n\n+/);

  return (
    <div className="space-y-4">
      {paragraphs.map((para, pi) => {
        const lines = para.split('\n').filter(l => l.trim());
        const isBulletBlock = lines.every(l => /^[-•*]\s/.test(l.trim()));

        if (isBulletBlock) {
          return (
            <ul key={pi} className="space-y-2">
              {lines.map((line, li) => (
                <li key={li} className="flex items-start gap-2.5">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#2563eb' }} />
                  <span className="text-slate-600 leading-[1.85] text-sm sm:text-[15px]">
                    {line.replace(/^[-•*]\s+/, '')}
                  </span>
                </li>
              ))}
            </ul>
          );
        }

        // Mixed lines — render each line, detect bullets inline
        return (
          <div key={pi} className="space-y-1">
            {lines.map((line, li) => {
              const isBullet = /^[-•*]\s/.test(line.trim());
              if (isBullet) {
                return (
                  <div key={li} className="flex items-start gap-2.5">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#2563eb' }} />
                    <span className="text-slate-600 leading-[1.85] text-sm sm:text-[15px]">
                      {line.replace(/^[-•*]\s+/, '')}
                    </span>
                  </div>
                );
              }
              const isHeading = /^#{1,3}\s/.test(line.trim()) || (line.trim().endsWith(':') && line.length < 80);
              if (isHeading) {
                return (
                  <p key={li} className="font-bold text-slate-800 text-sm sm:text-base mt-3">
                    {line.replace(/^#+\s*/, '')}
                  </p>
                );
              }
              return (
                <p key={li} className="text-slate-600 leading-[1.85] text-sm sm:text-[15px]">
                  {line}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

/* ─── ElegantSection card ─────────────────────────────────────────────────── */
function ElegantSection({ label, title, children }) {
  return (
    <div className="rounded-xl sm:rounded-2xl overflow-hidden bg-white transition-shadow duration-200 hover:shadow-lg"
      style={{ border: '1px solid #e2e8f0', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
      <div className="px-5 sm:px-7 pt-5 sm:pt-6 pb-4 sm:pb-5" style={{ borderBottom: '1px solid #f1f5f9' }}>
        <span className="inline-block text-[9px] sm:text-[10px] font-black uppercase tracking-[0.22em] px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border mb-2 sm:mb-3"
          style={{ color: '#1e40af', background: '#eff6ff', borderColor: '#bfdbfe' }}>
          {label}
        </span>
        <h2 className="font-black text-lg sm:text-xl text-slate-900" style={{ letterSpacing: '-0.02em' }}>{title}</h2>
      </div>
      <div className="px-5 sm:px-7 py-5 sm:py-6">{children}</div>
    </div>
  );
}

/* ─── CurriculumTable — single table: Pillar | Module | Topic | Subtopic ──── */
function CurriculumTable({ pillars }) {
  /*
   * Data shape (from SeminarForm):
   *   pillar.name
   *     pillar.modules[].name           ← Module column
   *       module.subtopics[].name       ← Topic column   (form calls them "subtopics")
   *         subtopic.topics[].name      ← Subtopic column (form calls them "topics")
   *
   * We pre-compute every leaf row with its rowSpan values so React never
   * conditionally renders cells — instead we render them or skip them based
   * on span > 0.
   */

  // ── Step 1: build flat row list ──────────────────────────────────────────
  const rows = [];

  pillars.forEach(pillar => {
    const modules = (pillar.modules || []).filter(m => m.name);

    if (modules.length === 0) {
      rows.push({
        pillar: pillar.name, module: null, topic: null, subtopic: null,
        pillarSpan: 1, moduleSpan: 0, topicSpan: 0
      });
      return;
    }

    // Count total rows for this pillar first
    let pillarTotal = 0;
    const moduleBlocks = modules.map(mod => {
      const topics = (mod.subtopics || []).filter(s => s.name);
      if (topics.length === 0) {
        pillarTotal += 1;
        return [{ module: mod.name, topic: null, subtopic: null, moduleSpan: 1, topicSpan: 0 }];
      }
      const topicRows = [];
      topics.forEach(topic => {
        const subs = (topic.topics || []).filter(t => t.name);
        if (subs.length === 0) {
          topicRows.push({ module: mod.name, topic: topic.name, subtopic: null, moduleSpan: 0, topicSpan: 1 });
          pillarTotal += 1;
        } else {
          subs.forEach((sub, si) => {
            topicRows.push({
              module: mod.name, topic: topic.name, subtopic: sub.name,
              moduleSpan: 0, topicSpan: si === 0 ? subs.length : 0
            });
          });
          pillarTotal += subs.length;
        }
      });
      // Set moduleSpan on the first row of this module
      topicRows[0].moduleSpan = topicRows.length;
      return topicRows;
    });

    // Flatten moduleBlocks and set pillarSpan on first row only
    moduleBlocks.forEach((block, bi) => {
      block.forEach((r, ri) => {
        rows.push({
          ...r,
          pillar: pillar.name,
          pillarSpan: bi === 0 && ri === 0 ? pillarTotal : 0,
        });
      });
    });
  });

  // ── Step 2: render ───────────────────────────────────────────────────────
  const COLS = [
    { label: 'Pillar', color: '#1e40af', bg: '#eff6ff', border: '#bfdbfe', w: '22%' },
    { label: 'Module', color: '#0369a1', bg: '#f0f9ff', border: '#bae6fd', w: '24%' },
    { label: 'Topic', color: '#0f766e', bg: '#f0fdfa', border: '#99f6e4', w: '27%' },
    { label: 'Subtopic', color: '#475569', bg: 'transparent', border: 'transparent', w: '27%' },
  ];

  return (
    <div className="rounded-xl overflow-hidden"
      style={{ border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse" style={{ minWidth: '480px' }}>

          {/* Header */}
          <thead>
            <tr style={{ background: '#f0f5ff', borderBottom: '2px solid #bfdbfe' }}>
              {COLS.map(c => (
                <th key={c.label}
                  className="text-left px-4 py-3 text-[10px] sm:text-[11px] font-black uppercase tracking-widest"
                  style={{ color: c.color, width: c.w, borderRight: '1px solid #e2e8f0' }}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}
                className="hover:bg-blue-50/30 transition-colors"
                style={{ borderBottom: '1px solid #f1f5f9' }}>

                {/* Pillar — only on first row of each pillar (pillarSpan > 0) */}
                {row.pillarSpan > 0 && (
                  <td rowSpan={row.pillarSpan}
                    className="px-4 py-3"
                    style={{ borderRight: '1px solid #e2e8f0', background: '#fafcff', verticalAlign: 'middle' }}>
                    <span className="inline-block px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-black leading-snug"
                      style={{ background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe' }}>
                      {row.pillar}
                    </span>
                  </td>
                )}

                {/* Module — only on first row of each module (moduleSpan > 0) */}
                {row.moduleSpan > 0 && (
                  <td rowSpan={row.moduleSpan}
                    className="px-4 py-3"
                    style={{ borderRight: '1px solid #e2e8f0', background: '#f8fbff', verticalAlign: 'middle' }}>
                    {row.module
                      ? <span className="inline-block px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-bold"
                        style={{ background: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd' }}>
                        {row.module}
                      </span>
                      : <span className="text-slate-300 italic text-[11px]">—</span>
                    }
                  </td>
                )}

                {/* Topic — only on first row of each topic (topicSpan > 0) */}
                {row.topicSpan > 0 && (
                  <td rowSpan={row.topicSpan}
                    className="px-4 py-3"
                    style={{ borderRight: '1px solid #e2e8f0', verticalAlign: 'middle' }}>
                    {row.topic
                      ? <span className="inline-block px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-semibold"
                        style={{ background: '#f0fdfa', color: '#0f766e', border: '1px solid #99f6e4' }}>
                        {row.topic}
                      </span>
                      : <span className="text-slate-300 italic text-[11px]">—</span>
                    }
                  </td>
                )}

                {/* Subtopic — always one cell per row */}
                <td className="px-4 py-3 text-slate-600 text-[11px] sm:text-xs">
                  {row.subtopic || <span className="text-slate-300 italic">—</span>}
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
}
