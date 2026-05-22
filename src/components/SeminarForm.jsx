// src/components/SeminarForm.jsx
import React, { useState } from 'react';
import { Plus, X, Link as LinkIcon, Info, ChevronRight, ChevronDown } from 'lucide-react';

// ── Hierarchy structure: Pillar → Module → Subtopic → Topic ──────────────────
const EMPTY_TOPIC    = { name: '' };
const EMPTY_SUBTOPIC = { name: '', topics: [{ ...EMPTY_TOPIC }] };
const EMPTY_MODULE   = { name: '', subtopics: [{ ...EMPTY_SUBTOPIC }] };
const EMPTY_PILLAR   = { name: '', modules: [{ ...EMPTY_MODULE }] };

function deepClone(obj) { return JSON.parse(JSON.stringify(obj)); }

export default function SeminarForm({ initialData, onSubmit, submitting }) {
  const [form, setForm] = useState({
    professorName:    initialData?.professorName    || '',
    department:       initialData?.department       || '',
    title:            initialData?.title            || '',
    shortDescription: initialData?.shortDescription || '',
    fullDescription:  initialData?.fullDescription  || '',
    duration:         initialData?.duration         || '',
    coordinatorBio:   initialData?.coordinatorBio   || initialData?.speakerBio || '',
    pillars:          initialData?.pillars          || [deepClone(EMPTY_PILLAR)],
    videoLinks:       initialData?.videoLinks       || [],
    tools:            initialData?.tools            || [],
  });

  // Tools
  const [expandedPillars, setExpandedPillars] = useState(() => {
    const init = {};
    (initialData?.pillars || [{}]).forEach((_, i) => { init[i] = true; });
    return init;
  });

  function set(key, val) { setForm(f => ({ ...f, [key]: val })); }

  const [videoInput, setVideoInput]   = useState('');
  const [toolInput,  setToolInput]    = useState('');

  // Tools
  function addTool() {
    const t = toolInput.trim();
    if (t && !form.tools.includes(t)) set('tools', [...form.tools, t]);
    setToolInput('');
  }
  function removeTool(t) { set('tools', form.tools.filter(x => x !== t)); }

  // Video links
  function addVideoLink() {
    const v = videoInput.trim();
    if (v && !form.videoLinks.includes(v)) set('videoLinks', [...form.videoLinks, v]);
    setVideoInput('');
  }
  function removeVideoLink(v) { set('videoLinks', form.videoLinks.filter(x => x !== v)); }

  // ── Pillar helpers ──
  function updatePillar(pi, key, val) {
    const p = deepClone(form.pillars);
    p[pi][key] = val;
    set('pillars', p);
  }
  function addPillar() {
    const p = deepClone(form.pillars);
    p.push(deepClone(EMPTY_PILLAR));
    set('pillars', p);
    setExpandedPillars(e => ({ ...e, [p.length - 1]: true }));
  }
  function removePillar(pi) {
    const p = deepClone(form.pillars).filter((_, i) => i !== pi);
    set('pillars', p);
  }
  function togglePillar(pi) {
    setExpandedPillars(e => ({ ...e, [pi]: !e[pi] }));
  }

  // ── Module helpers ──
  function updateModule(pi, mi, key, val) {
    const p = deepClone(form.pillars);
    p[pi].modules[mi][key] = val;
    set('pillars', p);
  }
  function addModule(pi) {
    const p = deepClone(form.pillars);
    p[pi].modules.push(deepClone(EMPTY_MODULE));
    set('pillars', p);
  }
  function removeModule(pi, mi) {
    const p = deepClone(form.pillars);
    p[pi].modules = p[pi].modules.filter((_, i) => i !== mi);
    set('pillars', p);
  }

  // ── Subtopic helpers ──
  function updateSubtopic(pi, mi, si, key, val) {
    const p = deepClone(form.pillars);
    p[pi].modules[mi].subtopics[si][key] = val;
    set('pillars', p);
  }
  function addSubtopic(pi, mi) {
    const p = deepClone(form.pillars);
    p[pi].modules[mi].subtopics.push(deepClone(EMPTY_SUBTOPIC));
    set('pillars', p);
  }
  function removeSubtopic(pi, mi, si) {
    const p = deepClone(form.pillars);
    p[pi].modules[mi].subtopics = p[pi].modules[mi].subtopics.filter((_, i) => i !== si);
    set('pillars', p);
  }

  // ── Topic (leaf) helpers ──
  function updateLeafTopic(pi, mi, si, ti, val) {
    const p = deepClone(form.pillars);
    p[pi].modules[mi].subtopics[si].topics[ti].name = val;
    set('pillars', p);
  }
  function addLeafTopic(pi, mi, si) {
    const p = deepClone(form.pillars);
    p[pi].modules[mi].subtopics[si].topics.push(deepClone(EMPTY_TOPIC));
    set('pillars', p);
  }
  function removeLeafTopic(pi, mi, si, ti) {
    const p = deepClone(form.pillars);
    p[pi].modules[mi].subtopics[si].topics = p[pi].modules[mi].subtopics[si].topics.filter((_, i) => i !== ti);
    set('pillars', p);
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* ── Coordinator Information ── */}
      <FormSection title="Coordinator Information" subtitle="Details about the programme coordinator">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Coordinator Name *">
            <input
              className="input" required
              value={form.professorName}
              onChange={e => set('professorName', e.target.value)}
              placeholder="Dr. Priya Sharma"
            />
          </Field>
          <Field label="Department / College *" className="sm:col-span-1">
            <input
              className="input" required
              value={form.department}
              onChange={e => set('department', e.target.value)}
              placeholder="Department of Computer Science"
            />
          </Field>
        </div>
      </FormSection>

      {/* ── Programme Details ── */}
      <FormSection title="Programme Details" subtitle="Core information about the programme">
        <div className="space-y-4">
          <Field label="Programme Title *">
            <input
              className="input" required
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="Introduction to Machine Learning"
            />
          </Field>
          <Field label="Short Description *">
            <textarea
              className="input resize-none" rows={2} required
              value={form.shortDescription}
              onChange={e => set('shortDescription', e.target.value)}
              placeholder="A concise one-liner for cards and previews…"
            />
          </Field>
          <Field label="Full Description">
            <textarea
              className="input resize-none" rows={5}
              value={form.fullDescription}
              onChange={e => set('fullDescription', e.target.value)}
              placeholder="Detailed overview, objectives, and key takeaways…"
            />
          </Field>
          <Field label="Coordinator Bio">
            <textarea
              className="input resize-none" rows={3}
              value={form.coordinatorBio}
              onChange={e => set('coordinatorBio', e.target.value)}
              placeholder="Brief background of the coordinator / professor…"
            />
          </Field>
          <Field label="Duration">
            <input className="input"
              value={form.duration} onChange={e => set('duration', e.target.value)}
              placeholder="e.g. 2 hours" />
          </Field>
        </div>
      </FormSection>

      {/* ── Tools Used ── */}
      <FormSection title="Tools Used" subtitle="Software, platforms, or tools used in this programme">
        <div className="flex gap-2">
          <input
            className="input flex-1"
            value={toolInput}
            onChange={e => setToolInput(e.target.value)}
            placeholder="e.g. Python, TensorFlow, Jupyter Notebook…"
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTool(); }}}
          />
          <button type="button" onClick={addTool} className="btn-secondary px-4 shrink-0">
            <Plus size={16} />
          </button>
        </div>
        {form.tools.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {form.tools.map(t => (
              <span key={t} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-violet-100 text-violet-700 border border-violet-200">
                {t}
                <button type="button" onClick={() => removeTool(t)} className="hover:text-red-500 ml-0.5 transition-colors">
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}
      </FormSection>

      {/* ── Programme Hierarchy ── */}
      <FormSection
        title="Programme Structure"
        subtitle="Pillars → Modules → Subtopics → Topics (hierarchical breakdown)"
      >
        <div className="space-y-4">
          {form.pillars.map((pillar, pi) => (
            <div key={pi} className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              {/* Pillar header */}
              <div className="flex items-center gap-3 px-4 py-3 bg-brand-600 text-white">
                <button
                  type="button"
                  onClick={() => togglePillar(pi)}
                  className="shrink-0 w-6 h-6 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                >
                  {expandedPillars[pi] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-200 w-16 shrink-0">Pillar {pi + 1}</span>
                <input
                  className="flex-1 bg-transparent text-white placeholder-white/50 font-semibold text-sm outline-none border-b border-white/30 pb-0.5 focus:border-white transition-colors"
                  placeholder="Pillar name (e.g. Foundations)"
                  value={pillar.name}
                  onChange={e => updatePillar(pi, 'name', e.target.value)}
                />
                {form.pillars.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePillar(pi)}
                    className="shrink-0 w-6 h-6 flex items-center justify-center rounded-lg bg-white/20 hover:bg-red-400 transition-colors"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {expandedPillars[pi] && (
                <div className="p-4 bg-slate-50 space-y-3">
                  {pillar.modules.map((mod, mi) => (
                    <div key={mi} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                      {/* Module header */}
                      <div className="flex items-center gap-3 px-4 py-2.5 bg-violet-50 border-b border-violet-100">
                        <span className="text-xs font-bold uppercase tracking-wider text-violet-400 w-20 shrink-0">Module {mi + 1}</span>
                        <input
                          className="flex-1 bg-transparent text-violet-900 placeholder-violet-300 font-semibold text-sm outline-none"
                          placeholder="Module name (e.g. Core Concepts)"
                          value={mod.name}
                          onChange={e => updateModule(pi, mi, 'name', e.target.value)}
                        />
                        {pillar.modules.length > 1 && (
                          <button type="button" onClick={() => removeModule(pi, mi)}
                            className="shrink-0 text-violet-300 hover:text-red-500 transition-colors">
                            <X size={13} />
                          </button>
                        )}
                      </div>

                      {/* Subtopics */}
                      <div className="p-3 space-y-2">
                        {mod.subtopics.map((sub, si) => (
                          <div key={si} className="border border-slate-100 rounded-xl overflow-hidden">
                            {/* Subtopic row */}
                            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border-b border-emerald-100">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 w-20 shrink-0">Subtopic {si + 1}</span>
                              <input
                                className="flex-1 bg-transparent text-emerald-900 placeholder-emerald-300 text-sm outline-none font-medium"
                                placeholder="Subtopic name"
                                value={sub.name}
                                onChange={e => updateSubtopic(pi, mi, si, 'name', e.target.value)}
                              />
                              {mod.subtopics.length > 1 && (
                                <button type="button" onClick={() => removeSubtopic(pi, mi, si)}
                                  className="text-emerald-300 hover:text-red-500 transition-colors shrink-0">
                                  <X size={12} />
                                </button>
                              )}
                            </div>

                            {/* Topics (leaves) */}
                            <div className="px-3 py-2 space-y-1.5">
                              {sub.topics.map((topic, ti) => (
                                <div key={ti} className="flex items-center gap-2 pl-6">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                                  <input
                                    className="flex-1 text-sm text-slate-700 bg-transparent outline-none border-b border-dashed border-slate-200 pb-0.5 focus:border-amber-400 transition-colors placeholder-slate-300"
                                    placeholder="Topic name"
                                    value={topic.name}
                                    onChange={e => updateLeafTopic(pi, mi, si, ti, e.target.value)}
                                  />
                                  {sub.topics.length > 1 && (
                                    <button type="button" onClick={() => removeLeafTopic(pi, mi, si, ti)}
                                      className="text-slate-300 hover:text-red-500 transition-colors shrink-0">
                                      <X size={11} />
                                    </button>
                                  )}
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => addLeafTopic(pi, mi, si)}
                                className="flex items-center gap-1 ml-6 text-xs text-amber-600 hover:text-amber-700 font-semibold mt-1 transition-colors"
                              >
                                <Plus size={11} /> Add Topic
                              </button>
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addSubtopic(pi, mi)}
                          className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
                        >
                          <Plus size={12} /> Add Subtopic
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addModule(pi)}
                    className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 font-semibold transition-colors"
                  >
                    <Plus size={12} /> Add Module
                  </button>
                </div>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addPillar}
            className="btn-secondary text-sm w-full justify-center"
          >
            <Plus size={14} /> Add Pillar
          </button>
        </div>
      </FormSection>

      {/* ── Video Links ── */}
      <FormSection title="Video Links" subtitle="YouTube or other video URLs for attendees to watch">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <LinkIcon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-10"
              value={videoInput}
              onChange={e => setVideoInput(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addVideoLink(); }}}
            />
          </div>
          <button type="button" onClick={addVideoLink} className="btn-secondary px-4 shrink-0">
            <Plus size={16} />
          </button>
        </div>

        {form.videoLinks.length > 0 && (
          <div className="space-y-2 mt-3">
            {form.videoLinks.map((v, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 group">
                <LinkIcon size={13} className="text-brand-500 shrink-0" />
                <span className="text-sm text-slate-600 flex-1 truncate">{v}</span>
                <button type="button" onClick={() => removeVideoLink(v)}
                  className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all duration-150 shrink-0">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </FormSection>

      {/* ── Submit ── */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <p className="text-xs text-slate-400 flex items-center gap-1.5">
          <Info size={12} /> Fields marked * are required
        </p>
        <button type="submit" disabled={submitting} className="btn-primary px-8">
          {submitting
            ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Saving…</>
            : 'Save Programme'}
        </button>
      </div>
    </form>
  );
}

function FormSection({ title, subtitle, children }) {
  return (
    <div className="card p-6 sm:p-7">
      <div className="mb-5 pb-4 border-b border-slate-100">
        <h3 className="font-heading font-semibold text-base text-slate-900 leading-snug">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function Field({ label, children, className = '' }) {
  return (
    <div className={className}>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}
