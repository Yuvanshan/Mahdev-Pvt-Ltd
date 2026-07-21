/**
 * WebsiteContentModule.tsx
 * Admin sub-module for managing website content:
 * - Enquiries (status tracking)
 * - Company Statistics (counters)
 * - Countdown Settings
 * - Trustable Clients
 * - Completed Projects
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare, TrendingUp, Timer, Building2, FolderOpen,
  Plus, Trash2, Edit, Save, X, CheckCircle, Eye, Filter,
  Phone, Mail, MapPin, Calendar, Package, ChevronDown, Star,
  RefreshCw, AlertTriangle, Sparkles, Globe, Heart, Award, Zap
} from 'lucide-react';
import {
  saveEnquiries, saveCompanyStatistics, saveCountdownSettings,
  saveTrustableClients, saveCompletedProjects
} from '../../utils/storage';
import {
  EnquiryRecord, CompanyStatistic, CountdownSettings,
  TrustableClient, CompletedProject
} from '../../types';

// ─── Shared AdminImageUploader sub-component (lightweight) ───────────────────
function ImageUrlInput({
  label, value, onChange, placeholder = 'https://... or paste image URL'
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-xl text-xs bg-neutral-950 border border-purple-500/10 text-white focus:outline-none focus:border-purple-500/40"
      />
      {value && (
        <img src={value} alt="preview" className="mt-2 h-16 w-24 object-cover rounded-lg border border-white/10" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
      )}
    </div>
  );
}

// ─── Field Input Helper ───────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3 py-2 rounded-xl text-xs bg-neutral-950 border border-purple-500/10 text-white focus:outline-none focus:border-purple-500/40";
const btnPrimary = "px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white transition-all flex items-center gap-1.5";
const btnDanger = "p-1.5 rounded-lg text-xs bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-all";
const btnGhost = "p-1.5 rounded-lg text-xs bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-400 transition-all";

// ─── Status badge ─────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { color: string; dot: string }> = {
  New:       { color: 'bg-blue-500/15 text-blue-300 border-blue-500/30',   dot: 'bg-blue-400' },
  Contacted: { color: 'bg-amber-500/15 text-amber-300 border-amber-500/30', dot: 'bg-amber-400' },
  Confirmed: { color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', dot: 'bg-emerald-400' },
  Completed: { color: 'bg-slate-500/15 text-slate-400 border-slate-500/30', dot: 'bg-slate-500' },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.New;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
}

// ─── ICON NAMES for Statistics ────────────────────────────────────────────────
const STAT_ICONS = ['Sparkles', 'Globe', 'Heart', 'Award', 'Zap', 'Building2', 'Star', 'TrendingUp'];

function StatIcon({ name, size = 18 }: { name: string; size?: number }) {
  const props = { size, className: 'text-purple-400' };
  switch (name) {
    case 'Sparkles': return <Sparkles {...props} />;
    case 'Globe':    return <Globe {...props} />;
    case 'Heart':    return <Heart {...props} />;
    case 'Award':    return <Award {...props} />;
    case 'Zap':      return <Zap {...props} />;
    case 'Building2': return <Building2 {...props} />;
    case 'Star':     return <Star {...props} />;
    default:         return <TrendingUp {...props} />;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ENQUIRIES MODULE
// ─────────────────────────────────────────────────────────────────────────────
function EnquiriesTab({
  enquiries, onUpdate
}: { enquiries: EnquiryRecord[]; onUpdate: (list: EnquiryRecord[]) => void }) {
  const [filterBrand, setFilterBrand] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [selectedEnq, setSelectedEnq] = useState<EnquiryRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const brands = ['All', 'SWS', 'Photography', 'IT', 'Travels', 'General'];
  const statuses = ['All', 'New', 'Contacted', 'Confirmed', 'Completed'];

  const filtered = enquiries.filter(e => {
    const matchBrand = filterBrand === 'All' || e.brand === filterBrand;
    const matchStatus = filterStatus === 'All' || e.status === filterStatus;
    const matchSearch = !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.phone.includes(search);
    return matchBrand && matchStatus && matchSearch;
  });

  const handleStatusChange = async (id: string, status: EnquiryRecord['status']) => {
    const updated = enquiries.map(e => e.id === id ? { ...e, status } : e);
    onUpdate(updated);
    setIsSaving(true);
    await saveEnquiries(updated);
    setIsSaving(false);
    setSuccessMsg('Status updated!');
    setTimeout(() => setSuccessMsg(''), 2000);
    if (selectedEnq?.id === id) setSelectedEnq({ ...selectedEnq, status });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this enquiry? This cannot be undone.')) return;
    const updated = enquiries.filter(e => e.id !== id);
    onUpdate(updated);
    await saveEnquiries(updated);
    if (selectedEnq?.id === id) setSelectedEnq(null);
  };

  const newCount = enquiries.filter(e => e.status === 'New').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <MessageSquare size={16} className="text-purple-400" />
            Enquiries Management
            {newCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-bold">{newCount} New</span>
            )}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">{enquiries.length} total enquiries across all divisions</p>
        </div>
        {isSaving && <span className="text-xs text-purple-400 flex items-center gap-1"><RefreshCw size={12} className="animate-spin" /> Saving...</span>}
        {successMsg && <span className="text-xs text-emerald-400 flex items-center gap-1"><CheckCircle size={12} /> {successMsg}</span>}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Search name or phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-3 py-1.5 rounded-lg text-xs bg-neutral-950 border border-purple-500/10 text-white w-48 focus:outline-none focus:border-purple-500/30"
        />
        <div className="flex gap-1.5 flex-wrap">
          {brands.map(b => (
            <button key={b} onClick={() => setFilterBrand(b)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${filterBrand === b ? 'bg-purple-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}`}>
              {b}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {statuses.map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${filterStatus === s ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Enquiry List */}
        <div className={`${selectedEnq ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-2 max-h-[520px] overflow-y-auto pr-1`}>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <MessageSquare size={36} className="mb-3 opacity-30" />
              <p className="text-sm">No enquiries found</p>
              <p className="text-xs mt-1 text-slate-600">Submit a test enquiry from the public site to see it here.</p>
            </div>
          ) : filtered.map(enq => (
            <motion.div key={enq.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${selectedEnq?.id === enq.id ? 'border-purple-500/40 bg-purple-500/5' : 'border-white/5 bg-white/2 hover:border-white/10'}`}
              onClick={() => setSelectedEnq(enq)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-white truncate">{enq.name}</span>
                    <StatusBadge status={enq.status} />
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-slate-400 uppercase">{enq.brand}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400 flex-wrap">
                    <span className="flex items-center gap-1"><Phone size={10} />{enq.phone}</span>
                    {enq.eventType && <span className="flex items-center gap-1"><Calendar size={10} />{enq.eventType}</span>}
                    {enq.location && <span className="flex items-center gap-1"><MapPin size={10} />{enq.location}</span>}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">{new Date(enq.createdAt).toLocaleDateString('en-LK', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Quick status update */}
                  <select
                    value={enq.status}
                    onClick={e => e.stopPropagation()}
                    onChange={e => handleStatusChange(enq.id, e.target.value as EnquiryRecord['status'])}
                    className="text-[10px] py-1 px-2 rounded-lg bg-neutral-900 border border-white/10 text-slate-300 focus:outline-none cursor-pointer"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Completed">Completed</option>
                  </select>
                  <button onClick={e => { e.stopPropagation(); handleDelete(enq.id); }} className={btnDanger}>
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Detail Panel */}
        <AnimatePresence>
          {selectedEnq && (
            <motion.div
              key={selectedEnq.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-neutral-950 rounded-2xl border border-purple-500/15 p-5 space-y-4 max-h-[520px] overflow-y-auto"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">{selectedEnq.name}</h4>
                  <StatusBadge status={selectedEnq.status} />
                </div>
                <button onClick={() => setSelectedEnq(null)} className="p-1 rounded-lg bg-white/5 text-slate-400 hover:text-white">
                  <X size={14} />
                </button>
              </div>
              <div className="space-y-3 text-xs">
                {[
                  { icon: <Phone size={11} />, label: 'Phone', val: selectedEnq.phone },
                  { icon: <Mail size={11} />, label: 'Email', val: selectedEnq.email || '—' },
                  { icon: <Package size={11} />, label: 'Event Type', val: selectedEnq.eventType || '—' },
                  { icon: <Calendar size={11} />, label: 'Event Date', val: selectedEnq.eventDate || '—' },
                  { icon: <MapPin size={11} />, label: 'Location', val: selectedEnq.location || '—' },
                  { icon: <Package size={11} />, label: 'Package', val: selectedEnq.packageRequired || '—' },
                ].map(row => (
                  <div key={row.label} className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">{row.icon}</span>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider">{row.label}</div>
                      <div className="text-slate-200">{row.val}</div>
                    </div>
                  </div>
                ))}
                {selectedEnq.message && (
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Message</div>
                    <p className="text-slate-300 bg-white/3 p-3 rounded-lg leading-relaxed">{selectedEnq.message}</p>
                  </div>
                )}
                {selectedEnq.itemTitle && (
                  <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300">
                    <span className="text-[10px] uppercase font-bold">Item:</span> {selectedEnq.itemTitle}
                  </div>
                )}
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Update Status</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['New', 'Contacted', 'Confirmed', 'Completed'] as const).map(s => (
                    <button key={s} onClick={() => handleStatusChange(selectedEnq.id, s)}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${selectedEnq.status === s ? 'bg-purple-600 border-purple-500 text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STATISTICS MODULE
// ─────────────────────────────────────────────────────────────────────────────
function StatisticsTab({
  statistics, onUpdate
}: { statistics: CompanyStatistic[]; onUpdate: (list: CompanyStatistic[]) => void }) {
  const [items, setItems] = useState<CompanyStatistic[]>(statistics);
  const [editing, setEditing] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (id: string, field: keyof CompanyStatistic, val: string) => {
    setItems(prev => prev.map(s => s.id === id ? { ...s, [field]: val } : s));
  };

  const handleAdd = () => {
    const newItem: CompanyStatistic = {
      id: `stat-${Date.now()}`, label: 'New Counter', value: '0', suffix: '+', icon: 'Star', order: items.length + 1
    };
    const updated = [...items, newItem];
    setItems(updated);
    setEditing(newItem.id);
  };

  const handleDelete = async (id: string) => {
    const updated = items.filter(s => s.id !== id);
    setItems(updated);
    await saveCompanyStatistics(updated);
    onUpdate(updated);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await saveCompanyStatistics(items);
    onUpdate(items);
    setIsSaving(false);
    setEditing(null);
    setSuccessMsg('Statistics saved!');
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2"><TrendingUp size={16} className="text-purple-400" /> Company Statistics</h3>
          <p className="text-xs text-slate-400 mt-0.5">Edit the counter cards displayed on the homepage</p>
        </div>
        <div className="flex items-center gap-2">
          {successMsg && <span className="text-xs text-emerald-400 flex items-center gap-1"><CheckCircle size={12} />{successMsg}</span>}
          <button onClick={handleAdd} className={btnPrimary}><Plus size={13} />Add Counter</button>
          <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all flex items-center gap-1.5 disabled:opacity-60">
            {isSaving ? <RefreshCw size={12} className="animate-spin" /> : <Save size={13} />}Save All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map(stat => (
          <div key={stat.id} className="p-4 rounded-xl border border-white/5 bg-white/2 space-y-3">
            {editing === stat.id ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Label">
                    <input value={stat.label} onChange={e => handleChange(stat.id, 'label', e.target.value)} className={inputCls} />
                  </Field>
                  <Field label="Value">
                    <input value={stat.value} onChange={e => handleChange(stat.id, 'value', e.target.value)} className={inputCls} />
                  </Field>
                  <Field label="Suffix (e.g. +, %)">
                    <input value={stat.suffix} onChange={e => handleChange(stat.id, 'suffix', e.target.value)} className={inputCls} />
                  </Field>
                  <Field label="Icon">
                    <select value={stat.icon} onChange={e => handleChange(stat.id, 'icon', e.target.value)} className={inputCls}>
                      {STAT_ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                    </select>
                  </Field>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditing(null)} className={btnPrimary}><CheckCircle size={12} />Done</button>
                  <button onClick={() => handleDelete(stat.id)} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all flex items-center gap-1"><Trash2 size={11} />Remove</button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <StatIcon name={stat.icon} />
                  </div>
                  <div>
                    <div className="text-lg font-black text-white">{stat.value}<span className="text-purple-400">{stat.suffix}</span></div>
                    <div className="text-xs text-slate-400">{stat.label}</div>
                  </div>
                </div>
                <button onClick={() => setEditing(stat.id)} className={btnGhost}><Edit size={13} /></button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COUNTDOWN MODULE
// ─────────────────────────────────────────────────────────────────────────────
function CountdownTab({
  countdown, onUpdate
}: { countdown: CountdownSettings; onUpdate: (s: CountdownSettings) => void }) {
  const [settings, setSettings] = useState<CountdownSettings>(countdown);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const change = (field: keyof CountdownSettings, val: any) => setSettings(prev => ({ ...prev, [field]: val }));

  const handleSave = async () => {
    setIsSaving(true);
    await saveCountdownSettings(settings);
    onUpdate(settings);
    setIsSaving(false);
    setSuccessMsg('Countdown settings saved!');
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  // Live preview timer
  const now = Date.now();
  const diff = settings.enabled && settings.targetDate ? Math.max(0, new Date(settings.targetDate).getTime() - now) : 0;
  const previewDays = Math.floor(diff / (1000 * 60 * 60 * 24));
  const previewHours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const previewMins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const previewSecs = Math.floor((diff % (1000 * 60)) / 1000);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2"><Timer size={16} className="text-purple-400" /> Countdown Timer</h3>
          <p className="text-xs text-slate-400 mt-0.5">Control the countdown banner shown on the homepage</p>
        </div>
        <div className="flex items-center gap-2">
          {successMsg && <span className="text-xs text-emerald-400 flex items-center gap-1"><CheckCircle size={12} />{successMsg}</span>}
          <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all flex items-center gap-1.5 disabled:opacity-60">
            {isSaving ? <RefreshCw size={12} className="animate-spin" /> : <Save size={13} />}Save Settings
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings Form */}
        <div className="space-y-4">
          {/* Enable / Disable Toggle */}
          <div className={`p-4 rounded-xl border flex items-center justify-between ${settings.enabled ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/5 bg-white/2'}`}>
            <div>
              <div className="text-sm font-bold text-white">{settings.enabled ? '🟢 Countdown is LIVE' : '⚫ Countdown is HIDDEN'}</div>
              <p className="text-xs text-slate-400 mt-0.5">{settings.enabled ? 'Countdown banner is visible on the homepage' : 'Toggle on to show countdown on the homepage'}</p>
            </div>
            <button
              onClick={() => change('enabled', !settings.enabled)}
              className={`relative w-12 h-6 rounded-full transition-all duration-300 ${settings.enabled ? 'bg-emerald-500' : 'bg-slate-700'}`}
            >
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${settings.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          <Field label="Countdown Title">
            <input value={settings.title} onChange={e => change('title', e.target.value)} className={inputCls} placeholder="e.g. Special Offer Ends In" />
          </Field>
          <Field label="Description">
            <textarea value={settings.description} onChange={e => change('description', e.target.value)} rows={2} className={inputCls + ' resize-none'} placeholder="Brief description shown under the countdown" />
          </Field>
          <Field label="Target Date & Time">
            <input type="datetime-local" value={settings.targetDate ? settings.targetDate.slice(0, 16) : ''} onChange={e => change('targetDate', new Date(e.target.value).toISOString())} className={inputCls + ' cursor-pointer'} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Button Label">
              <input value={settings.buttonLabel} onChange={e => change('buttonLabel', e.target.value)} className={inputCls} placeholder="e.g. Claim Offer Now" />
            </Field>
            <Field label="Button Link">
              <input value={settings.buttonLink} onChange={e => change('buttonLink', e.target.value)} className={inputCls} placeholder="#contact or /decoration" />
            </Field>
          </div>
          <ImageUrlInput label="Background Image URL (optional)" value={settings.backgroundImage || ''} onChange={v => change('backgroundImage', v)} />
        </div>

        {/* Live Preview */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">Preview</div>
          {settings.enabled ? (
            <div
              className="rounded-2xl overflow-hidden p-6 text-center relative"
              style={{ background: settings.backgroundImage ? `linear-gradient(rgba(0,0,0,0.7),rgba(0,0,0,0.8)), url('${settings.backgroundImage}') center/cover` : 'linear-gradient(135deg,#1a0533,#0f0728)' }}
            >
              <div className="text-[10px] font-black uppercase tracking-widest text-purple-400 mb-2">Limited Time</div>
              <h3 className="text-lg font-extrabold text-white mb-4">{settings.title || 'Countdown Title'}</h3>
              <div className="flex items-center justify-center gap-3 mb-4">
                {[{ v: previewDays, l: 'Days' }, { v: previewHours, l: 'Hrs' }, { v: previewMins, l: 'Min' }, { v: previewSecs, l: 'Sec' }].map(unit => (
                  <div key={unit.l} className="text-center">
                    <div className="w-14 h-14 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-2xl font-black text-white">
                      {String(unit.v).padStart(2, '0')}
                    </div>
                    <div className="text-[9px] text-slate-400 mt-1 uppercase tracking-wider">{unit.l}</div>
                  </div>
                ))}
              </div>
              {settings.description && <p className="text-xs text-slate-300 mb-4">{settings.description}</p>}
              {settings.buttonLabel && (
                <button className="px-5 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold">{settings.buttonLabel}</button>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/5 bg-white/2 p-8 flex flex-col items-center justify-center text-slate-500">
              <Timer size={32} className="mb-3 opacity-30" />
              <p className="text-sm">Countdown is disabled</p>
              <p className="text-xs mt-1 text-slate-600">Toggle the switch to see a preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CLIENTS MODULE
// ─────────────────────────────────────────────────────────────────────────────
function ClientsTab({
  clients, onUpdate
}: { clients: TrustableClient[]; onUpdate: (list: TrustableClient[]) => void }) {
  const [items, setItems] = useState<TrustableClient[]>(clients);
  const [editing, setEditing] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const change = (id: string, field: keyof TrustableClient, val: string) =>
    setItems(prev => prev.map(c => c.id === id ? { ...c, [field]: val } : c));

  const handleAdd = () => {
    const item: TrustableClient = { id: `client-${Date.now()}`, logo: '', companyName: 'New Client', industry: '', projectsCompleted: '1', review: '' };
    setItems(prev => [...prev, item]);
    setEditing(item.id);
  };

  const handleDelete = async (id: string) => {
    const updated = items.filter(c => c.id !== id);
    setItems(updated);
    await saveTrustableClients(updated);
    onUpdate(updated);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await saveTrustableClients(items);
    onUpdate(items);
    setIsSaving(false);
    setEditing(null);
    setSuccessMsg('Clients saved!');
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2"><Building2 size={16} className="text-purple-400" /> Trustable Clients</h3>
          <p className="text-xs text-slate-400 mt-0.5">Manage client showcase logos on the IT Solutions page</p>
        </div>
        <div className="flex items-center gap-2">
          {successMsg && <span className="text-xs text-emerald-400 flex items-center gap-1"><CheckCircle size={12} />{successMsg}</span>}
          <button onClick={handleAdd} className={btnPrimary}><Plus size={13} />Add Client</button>
          <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all flex items-center gap-1.5 disabled:opacity-60">
            {isSaving ? <RefreshCw size={12} className="animate-spin" /> : <Save size={13} />}Save All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map(client => (
          <div key={client.id} className="p-4 rounded-xl border border-white/5 bg-white/2 space-y-3">
            {editing === client.id ? (
              <>
                <ImageUrlInput label="Company Logo URL" value={client.logo} onChange={v => change(client.id, 'logo', v)} />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Company Name">
                    <input value={client.companyName} onChange={e => change(client.id, 'companyName', e.target.value)} className={inputCls} />
                  </Field>
                  <Field label="Industry">
                    <input value={client.industry} onChange={e => change(client.id, 'industry', e.target.value)} className={inputCls} placeholder="e.g. Banking & Finance" />
                  </Field>
                  <Field label="Projects Completed">
                    <input value={client.projectsCompleted} onChange={e => change(client.id, 'projectsCompleted', e.target.value)} className={inputCls} placeholder="e.g. 3" />
                  </Field>
                </div>
                <Field label="Client Review">
                  <textarea value={client.review} onChange={e => change(client.id, 'review', e.target.value)} rows={2} className={inputCls + ' resize-none'} placeholder="What the client said..." />
                </Field>
                <div className="flex gap-2">
                  <button onClick={() => setEditing(null)} className={btnPrimary}><CheckCircle size={12} />Done</button>
                  <button onClick={() => handleDelete(client.id)} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all flex items-center gap-1"><Trash2 size={11} />Remove</button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {client.logo ? (
                    <img src={client.logo} alt={client.companyName} className="w-10 h-10 rounded-lg object-contain bg-white p-1" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm">{client.companyName.charAt(0)}</div>
                  )}
                  <div>
                    <div className="text-sm font-bold text-white">{client.companyName}</div>
                    <div className="text-xs text-slate-400">{client.industry} · {client.projectsCompleted} project{parseInt(client.projectsCompleted) !== 1 ? 's' : ''}</div>
                  </div>
                </div>
                <button onClick={() => setEditing(client.id)} className={btnGhost}><Edit size={13} /></button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPLETED PROJECTS MODULE
// ─────────────────────────────────────────────────────────────────────────────
const PROJECT_CATEGORIES = ['SWS Event Decoration', 'IT Solutions', 'Photography', 'Mahdev Travels', 'ERP System', 'Other'];

function CompletedProjectsTab({
  projects, onUpdate
}: { projects: CompletedProject[]; onUpdate: (list: CompletedProject[]) => void }) {
  const [items, setItems] = useState<CompletedProject[]>(projects);
  const [editing, setEditing] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const change = (id: string, field: keyof CompletedProject, val: string) =>
    setItems(prev => prev.map(p => p.id === id ? { ...p, [field]: val } : p));

  const handleAdd = () => {
    const item: CompletedProject = { id: `cp-${Date.now()}`, image: '', title: 'New Project', description: '', category: PROJECT_CATEGORIES[0], completionDate: new Date().toISOString().split('T')[0] };
    setItems(prev => [item, ...prev]);
    setEditing(item.id);
  };

  const handleDelete = async (id: string) => {
    const updated = items.filter(p => p.id !== id);
    setItems(updated);
    await saveCompletedProjects(updated);
    onUpdate(updated);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await saveCompletedProjects(items);
    onUpdate(items);
    setIsSaving(false);
    setEditing(null);
    setSuccessMsg('Projects saved!');
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2"><FolderOpen size={16} className="text-purple-400" /> Completed Projects</h3>
          <p className="text-xs text-slate-400 mt-0.5">Showcase projects on the homepage portfolio section</p>
        </div>
        <div className="flex items-center gap-2">
          {successMsg && <span className="text-xs text-emerald-400 flex items-center gap-1"><CheckCircle size={12} />{successMsg}</span>}
          <button onClick={handleAdd} className={btnPrimary}><Plus size={13} />Add Project</button>
          <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all flex items-center gap-1.5 disabled:opacity-60">
            {isSaving ? <RefreshCw size={12} className="animate-spin" /> : <Save size={13} />}Save All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map(proj => (
          <div key={proj.id} className="rounded-xl border border-white/5 bg-white/2 overflow-hidden">
            {editing === proj.id ? (
              <div className="p-4 space-y-3">
                <ImageUrlInput label="Project Image URL" value={proj.image} onChange={v => change(proj.id, 'image', v)} />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Project Title">
                    <input value={proj.title} onChange={e => change(proj.id, 'title', e.target.value)} className={inputCls} />
                  </Field>
                  <Field label="Category">
                    <select value={proj.category} onChange={e => change(proj.id, 'category', e.target.value)} className={inputCls}>
                      {PROJECT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </Field>
                  <Field label="Completion Date">
                    <input type="date" value={proj.completionDate} onChange={e => change(proj.id, 'completionDate', e.target.value)} className={inputCls + ' cursor-pointer'} />
                  </Field>
                </div>
                <Field label="Description">
                  <textarea value={proj.description} onChange={e => change(proj.id, 'description', e.target.value)} rows={2} className={inputCls + ' resize-none'} />
                </Field>
                <div className="flex gap-2">
                  <button onClick={() => setEditing(null)} className={btnPrimary}><CheckCircle size={12} />Done</button>
                  <button onClick={() => handleDelete(proj.id)} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all flex items-center gap-1"><Trash2 size={11} />Remove</button>
                </div>
              </div>
            ) : (
              <div>
                {proj.image && (
                  <div className="h-32 overflow-hidden">
                    <img src={proj.image} alt={proj.title} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </div>
                )}
                <div className="p-3 flex items-start justify-between">
                  <div>
                    <div className="text-sm font-bold text-white">{proj.title}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{proj.category} · {proj.completionDate}</div>
                    {proj.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{proj.description}</p>}
                  </div>
                  <button onClick={() => setEditing(proj.id)} className={btnGhost + ' shrink-0 ml-2'}><Edit size={13} /></button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT EXPORT
// ─────────────────────────────────────────────────────────────────────────────

export type WebsiteContentTab = 'enquiries' | 'statistics' | 'countdown' | 'clients' | 'completed_projects';

interface WebsiteContentModuleProps {
  activeTab: WebsiteContentTab;
  enquiries: EnquiryRecord[];
  statistics: CompanyStatistic[];
  countdownSettings: CountdownSettings;
  clients: TrustableClient[];
  completedProjects: CompletedProject[];
  onEnquiriesUpdate: (list: EnquiryRecord[]) => void;
  onStatisticsUpdate: (list: CompanyStatistic[]) => void;
  onCountdownUpdate: (s: CountdownSettings) => void;
  onClientsUpdate: (list: TrustableClient[]) => void;
  onProjectsUpdate: (list: CompletedProject[]) => void;
}

export default function WebsiteContentModule({
  activeTab,
  enquiries,
  statistics,
  countdownSettings,
  clients,
  completedProjects,
  onEnquiriesUpdate,
  onStatisticsUpdate,
  onCountdownUpdate,
  onClientsUpdate,
  onProjectsUpdate,
}: WebsiteContentModuleProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'enquiries' && (
          <EnquiriesTab enquiries={enquiries} onUpdate={onEnquiriesUpdate} />
        )}
        {activeTab === 'statistics' && (
          <StatisticsTab statistics={statistics} onUpdate={onStatisticsUpdate} />
        )}
        {activeTab === 'countdown' && (
          <CountdownTab countdown={countdownSettings} onUpdate={onCountdownUpdate} />
        )}
        {activeTab === 'clients' && (
          <ClientsTab clients={clients} onUpdate={onClientsUpdate} />
        )}
        {activeTab === 'completed_projects' && (
          <CompletedProjectsTab projects={completedProjects} onUpdate={onProjectsUpdate} />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
