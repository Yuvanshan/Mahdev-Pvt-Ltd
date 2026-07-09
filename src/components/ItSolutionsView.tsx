/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, Smartphone, Code, Palette, Cloud, Server, 
  ShieldAlert, Wrench, ExternalLink, ArrowRight, X, Laptop, Eye,
  Receipt, Box, TrendingUp, Users, Terminal, Plus, Trash2, Search, Check, 
  Send, Sparkles, Building2, Layers, Activity, Calendar, HelpCircle
} from 'lucide-react';
import { IT_PROJECTS } from '../data';
import { ItProject, ThemeSettings } from '../types';
import { addBooking } from '../utils/storage';
import EmailCopySection from './EmailCopySection';

interface ItSolutionsViewProps {
  isDarkMode: boolean;
  projectsList?: ItProject[];
  themeSettings?: ThemeSettings;
  initialTab?: 'erp' | 'custom';
}

interface PosItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

export default function ItSolutionsView({ 
  isDarkMode, 
  projectsList = IT_PROJECTS, 
  themeSettings,
  initialTab = 'custom'
}: ItSolutionsViewProps) {
  
  const brandShort = themeSettings?.brandName ? themeSettings.brandName.split(' ')[0] : 'Mahdev';

  // State to handle ERP vs Custom Development tabs
  const [activeBrandTab, setActiveBrandTab] = useState<'erp' | 'custom'>(initialTab);

  // Keep in sync with initialTab prop updates
  useEffect(() => {
    setActiveBrandTab(initialTab);
  }, [initialTab]);

  // Active Project Mock Browser Modal state
  const [activeMockProject, setActiveMockProject] = useState<ItProject | null>(null);

  // Current Active Preview Module Tab inside ERP
  const [activeErpTab, setActiveErpTab] = useState<'pos' | 'inventory' | 'school' | 'hospital'>('pos');

  // Interactive POS State
  const [posCart, setPosCart] = useState<PosItem[]>([
    { id: '1', name: 'Millet Grain Loaf', price: 95, qty: 2 },
    { id: '2', name: 'Cold-Pressed Olive Oil', price: 650, qty: 1 },
    { id: '3', name: 'Organic Honey (500g)', price: 320, qty: 1 }
  ]);
  const [posCatalog] = useState([
    { id: '1', name: 'Millet Grain Loaf', price: 95 },
    { id: '2', name: 'Cold-Pressed Olive Oil', price: 650 },
    { id: '3', name: 'Organic Honey (500g)', price: 320 },
    { id: '4', name: 'Exotic Marigold Soap', price: 120 },
    { id: '5', name: 'Basmati Rice (5kg)', price: 499 }
  ]);

  const handleAddPosItem = (catalogItem: typeof posCatalog[0]) => {
    const existing = posCart.find(item => item.id === catalogItem.id);
    if (existing) {
      setPosCart(posCart.map(item => item.id === catalogItem.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setPosCart([...posCart, { ...catalogItem, qty: 1 }]);
    }
  };

  const handleRemovePosItem = (id: string) => {
    setPosCart(posCart.filter(item => item.id !== id));
  };

  const posSubtotal = posCart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const posGst = Math.round(posSubtotal * 0.18);
  const posTotal = posSubtotal + posGst;

  // Interactive Inventory State
  const [inventoryList, setInventoryList] = useState([
    { name: 'Red Rose Batches (Fresh)', stock: 85, reorder: 40, status: 'Healthy' },
    { name: 'Golden Marigold Floral Crates', stock: 120, reorder: 30, status: 'Healthy' },
    { name: 'POS Thermal Roll Packs', stock: 12, reorder: 20, status: 'Restock Urgently' },
    { name: 'ERP Touch Terminals (Ver 3)', stock: 5, reorder: 8, status: 'Low Stock' },
    { name: 'Exotic Orchids (Imported)', stock: 48, reorder: 15, status: 'Healthy' }
  ]);

  const handleRestock = (idx: number) => {
    const list = [...inventoryList];
    list[idx].stock += 50;
    list[idx].status = 'Healthy';
    setInventoryList(list);
  };

  // Interactive School Registrar search
  const [studentSearch, setStudentSearch] = useState('');
  const [students] = useState([
    { roll: '101', name: 'Aarav Sharma', grade: 'XII-A', average: '92%', fees: 'Cleared' },
    { roll: '102', name: 'Ishita Patel', grade: 'XII-B', average: '88%', fees: 'Pending: Rs.12,500' },
    { roll: '103', name: 'Kabir Malhotra', grade: 'XI-A', average: '74%', fees: 'Cleared' },
    { roll: '104', name: 'Pooja Reddy', grade: 'X-C', average: '95%', fees: 'Cleared' },
    { roll: '105', name: 'Rohan Sen', grade: 'XII-A', average: '67%', fees: 'Pending: Rs.4,200' }
  ]);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) || 
    s.grade.toLowerCase().includes(studentSearch.toLowerCase())
  );

  // Interactive Hospital Bed grid state
  const [beds, setBeds] = useState([
    { id: 'Ward 101', occupied: true, patient: 'Amit Gupta', doc: 'Dr. Mehta' },
    { id: 'Ward 102', occupied: false, patient: '', doc: '' },
    { id: 'Ward 103', occupied: true, patient: 'Sanjana Roy', doc: 'Dr. Kumar' },
    { id: 'Ward 104', occupied: false, patient: '', doc: '' },
    { id: 'Ward 105', occupied: true, patient: 'Ramesh Sen', doc: 'Dr. Chawla' },
    { id: 'Ward 106', occupied: false, patient: '', doc: '' }
  ]);

  const toggleBedStatus = (idx: number) => {
    const updated = [...beds];
    if (updated[idx].occupied) {
      updated[idx].occupied = false;
      updated[idx].patient = '';
      updated[idx].doc = '';
    } else {
      updated[idx].occupied = true;
      updated[idx].patient = 'Simulated Admission';
      updated[idx].doc = 'Dr. AI Sandbox';
    }
    setBeds(updated);
  };

  // Inquiry / Consultation CRM Booking Form state
  const [crmForm, setCrmForm] = useState({
    name: '',
    email: '',
    phone: '',
    systemType: 'Custom ERP Suite',
    budget: 'Rs. 500,000 - 800,000',
    notes: '',
    preferredDate: ''
  });
  const [crmSubmitted, setCrmSubmitted] = useState(false);

  const handleCrmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!crmForm.name || !crmForm.phone) return;

    let budgetEst = 500000;
    if (crmForm.budget.includes('100,000')) budgetEst = 120000;
    else if (crmForm.budget.includes('250,000')) budgetEst = 300000;
    else if (crmForm.budget.includes('800,000')) budgetEst = 650000;
    else if (crmForm.budget.includes('1,000,000')) budgetEst = 1200000;

    // Save CRM lead to global central bookings list
    addBooking({
      brand: 'IT',
      name: crmForm.name,
      phone: crmForm.phone,
      email: crmForm.email,
      serviceType: crmForm.systemType,
      eventDate: crmForm.preferredDate || new Date().toISOString().split('T')[0],
      budget: crmForm.budget,
      notes: crmForm.notes,
      amount: budgetEst,
    });

    setCrmSubmitted(true);
    setTimeout(() => {
      setCrmSubmitted(false);
      setCrmForm({
        name: '',
        email: '',
        phone: '',
        systemType: 'Custom ERP Suite',
        budget: 'Rs. 500,000 - 800,000',
        notes: '',
        preferredDate: ''
      });
    }, 4000);
  };

  const techServices = [
    { title: 'Fullstack Web Systems', desc: 'Custom tailored enterprise portals, high-speed corporate hubs, and responsive landing setups.', icon: <Globe className="text-blue-400 w-6 h-6 shrink-0" /> },
    { title: 'iOS & Android Native Apps', desc: 'Sleek mobile architectures compiling native languages, optimized for memory and fluid touch layouts.', icon: <Smartphone className="text-cyan-400 w-6 h-6 shrink-0" /> },
    { title: 'Custom Software Pipelines', desc: 'Tailor-made backend databases, API hubs, and middleware connectors linking legacy software to cloud tools.', icon: <Code className="text-purple-400 w-6 h-6 shrink-0" /> },
    { title: 'Premium UI/UX Prototypes', desc: 'Sophisticated wireframes, interactive user testing runs, custom font pairings, and Figma-to-code translations.', icon: <Palette className="text-pink-400 w-6 h-6 shrink-0" /> },
    { title: 'AWS & GCP Cloud Migration', desc: 'Highly scalable Docker containers, Kubernetes pools, secure databases, and zero-downtime deploy models.', icon: <Cloud className="text-indigo-400 w-6 h-6 shrink-0" /> },
    { title: 'Optimized Private Hosting', desc: 'Fully managed SSD cloud servers hosting applications with automated SSL encryption and daily offsite back-ups.', icon: <Server className="text-emerald-400 w-6 h-6 shrink-0" /> },
    { title: 'Proactive System Auditing', desc: 'Continuous server load logs, legacy software updates, and immediate hotfixes guaranteeing 99.9% uptime.', icon: <Wrench className="text-amber-400 w-6 h-6 shrink-0" /> },
    { title: 'Cybersecurity & Firewalls', desc: 'Penetration testing audits, advanced multi-tenant threat detection, and SQL injection security safeguards.', icon: <ShieldAlert className="text-red-400 w-6 h-6 shrink-0" /> },
  ];

  return (
    <div id="it-solutions-view-container" className="relative w-full text-slate-100 bg-neutral-950 min-h-screen">
      
      {/* Glow Effects */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Hero Header */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 border-b border-blue-500/10 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 font-mono flex items-center justify-center gap-1.5 mb-3">
            <Sparkles size={14} className="animate-pulse" />
            MAHDEV IT & SOLUTIONS CO.
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6">
            Intelligent Software, <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">SaaS & ERP Engines</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            Deploying high-performance cloud architectures, custom software portals, and native mobile hubs. We blend human-centered design with robust, lightning-fast codebases.
          </p>

          {/* BRAND NAV TABS */}
          <div className="flex justify-center mt-10">
            <div className="bg-neutral-900 border border-slate-800 p-1.5 rounded-2xl flex gap-2">
              <button
                onClick={() => setActiveBrandTab('custom')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                  activeBrandTab === 'custom' 
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20' 
                    : 'text-slate-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <Layers size={16} />
                <span>Custom Web & Apps</span>
              </button>
              <button
                onClick={() => setActiveBrandTab('erp')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                  activeBrandTab === 'erp' 
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-500 text-white shadow-lg shadow-purple-500/20' 
                    : 'text-slate-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <Building2 size={16} />
                <span>Enterprise ERP Systems</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* BRAND TABS RENDERING */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <AnimatePresence mode="wait">
          {activeBrandTab === 'custom' ? (
            <motion.div
              key="custom-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-24"
            >
              {/* Technology Capabilities Grid */}
              <div>
                <div className="text-center max-w-2xl mx-auto mb-16">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-4">
                    Fullstack Technical Solutions Suite
                  </h2>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Providing complete technical execution, from conceptual database design to active containerized cloud hosting.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {techServices.map((srv, idx) => (
                    <div
                      key={idx}
                      className="p-6 rounded-2xl border bg-neutral-900/60 border-slate-800 hover:border-blue-500/30 transition-all duration-300 hover:scale-[1.02] hover:bg-neutral-900/90"
                    >
                      <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 inline-block mb-4">
                        {srv.icon}
                      </div>
                      <h3 className="text-base font-bold text-white mb-2">
                        {srv.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                        {srv.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Client Showcase Portfolio (with web simulator) */}
              <div id="projects-showcase">
                <div className="text-center max-w-2xl mx-auto mb-16">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider font-mono px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-md">
                    Click "Visit Live Website" to Launch Browser Sandbox
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-3 mb-4">
                    Web & App Portfolios
                  </h2>
                  <p className="text-sm text-slate-400">
                    Take an interactive look inside active live web portals created and maintained by {brandShort}’s cloud engineering team.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {projectsList.map((proj) => (
                    <div
                      id={`it-project-card-${proj.id}`}
                      key={proj.id}
                      className="rounded-2xl overflow-hidden border p-5 bg-neutral-900/50 border-slate-800 hover:border-cyan-500/25 transition-all flex flex-col sm:flex-row gap-6 shadow-xl"
                    >
                      {/* Image panel */}
                      <div className="w-full sm:w-44 h-44 rounded-xl overflow-hidden shrink-0 relative group/img">
                        <img 
                          src={proj.image} 
                          alt={proj.title} 
                          className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <Eye size={20} />
                        </div>
                      </div>

                      {/* Content Panel */}
                      <div className="flex flex-col justify-between py-1 flex-grow">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 font-mono">
                            {proj.category}
                          </span>
                          <h3 className="text-lg font-bold mt-1 mb-2 text-white">
                            {proj.title}
                          </h3>
                          <p className="text-xs sm:text-sm leading-relaxed mb-4 text-slate-400">
                            {proj.description}
                          </p>
                        </div>

                        <button
                          onClick={() => setActiveMockProject(proj)}
                          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs uppercase tracking-wider self-start transition-all duration-300"
                        >
                          <span>Visit Live Website</span>
                          <ExternalLink size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="erp-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-12"
            >
              {/* Introduction */}
              <div className="text-center max-w-2xl mx-auto mb-12">
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider font-mono px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 rounded-md">
                  Interactive Live ERP Modules Sandbox
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-3 mb-4">
                  Multi-Industry ERP Infrastructure
                </h2>
                <p className="text-sm text-slate-400">
                  Select an enterprise module below to test its live visual logic terminal. Our ERP systems provide multi-branch, high-security, ultra-fast inventory solutions.
                </p>
              </div>

              {/* ERP Module Selectors */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
                {[
                  { id: 'pos', label: 'Retail & POS', icon: <Receipt size={16} /> },
                  { id: 'inventory', label: 'Inventory & Warehousing', icon: <Box size={16} /> },
                  { id: 'school', label: 'School Registrar & Fees', icon: <Users size={16} /> },
                  { id: 'hospital', label: 'Hospital Patient Beds', icon: <Activity size={16} /> },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setActiveErpTab(m.id as any)}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border font-semibold text-xs sm:text-sm transition-all duration-300 ${
                      activeErpTab === m.id
                        ? 'bg-purple-600/20 border-purple-500 text-purple-300 shadow-lg'
                        : 'bg-neutral-900 border-slate-800 text-slate-400 hover:text-white hover:bg-neutral-800'
                    }`}
                  >
                    {m.icon}
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>

              {/* ERP Active Sandbox Panel */}
              <div className="border border-slate-800 rounded-2xl overflow-hidden bg-neutral-900 shadow-2xl">
                <div className="bg-neutral-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-purple-500 animate-ping" />
                    <span className="text-xs uppercase font-mono tracking-widest text-slate-400 font-bold">
                      Live ERP Sandbox Sandbox Terminal - Active
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-purple-400 px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 rounded">
                    SYS_ONLINE_V2
                  </span>
                </div>

                <div className="p-6 min-h-[350px]">
                  {activeErpTab === 'pos' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Catalog */}
                      <div>
                        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 font-mono mb-4">
                          Available Store Catalog Items
                        </h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                          {posCatalog.map((item) => (
                            <div key={item.id} className="flex justify-between items-center p-3 rounded-xl bg-neutral-950 border border-slate-800 hover:border-purple-500/20 transition-all">
                              <div>
                                <p className="text-xs font-bold text-white">{item.name}</p>
                                <p className="text-[11px] text-purple-400 font-mono">Rs. {item.price.toFixed(2)}</p>
                              </div>
                              <button
                                onClick={() => handleAddPosItem(item)}
                                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1 transition-all"
                              >
                                <Plus size={12} />
                                <span>Add to Cart</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Receipt */}
                      <div className="bg-neutral-950 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-1 text-slate-400 mb-4 font-mono text-xs">
                            <Terminal size={14} />
                            <span>DIGITAL CUSTOMER INVOICE</span>
                          </div>
                          
                          {posCart.length === 0 ? (
                            <p className="text-xs text-slate-500 text-center py-10 font-mono">Cart is empty. Add items from catalog to calculate invoice.</p>
                          ) : (
                            <div className="space-y-2 max-h-40 overflow-y-auto mb-4">
                              {posCart.map((item) => (
                                <div key={item.id} className="flex justify-between text-xs text-slate-300 font-mono">
                                  <span>{item.qty}x {item.name}</span>
                                  <div className="flex items-center gap-3">
                                    <span>Rs. {(item.price * item.qty).toLocaleString()}</span>
                                    <button onClick={() => handleRemovePosItem(item.id)} className="text-red-400 hover:text-red-300">
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="border-t border-slate-800 pt-4 space-y-1.5 font-mono text-xs">
                          <div className="flex justify-between text-slate-400">
                            <span>Subtotal</span>
                            <span>Rs. {posSubtotal.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>VAT/GST (18%)</span>
                            <span>Rs. {posGst.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-white font-bold text-sm pt-2 border-t border-slate-800">
                            <span>Grand Total</span>
                            <span className="text-purple-400">Rs. {posTotal.toLocaleString()}</span>
                          </div>
                          <button
                            disabled={posCart.length === 0}
                            onClick={() => {
                              alert('POS Sandbox Checkout Complete! Invoice generated and saved in POS logs.');
                              setPosCart([]);
                            }}
                            className="w-full mt-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase tracking-wider text-xs transition-all disabled:opacity-50 disabled:pointer-events-none"
                          >
                            Execute Terminal Checkout
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeErpTab === 'inventory' && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 font-mono mb-2">
                        Real-time Warehouse Inventory & Stock Level Tracker
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs sm:text-sm">
                          <thead>
                            <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                              <th className="py-3">Item Name</th>
                              <th className="py-3">Stock Count</th>
                              <th className="py-3">Reorder Alert Level</th>
                              <th className="py-3">Status</th>
                              <th className="py-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {inventoryList.map((item, idx) => (
                              <tr key={idx} className="border-b border-slate-800/50 hover:bg-neutral-950/40">
                                <td className="py-3.5 font-medium text-white">{item.name}</td>
                                <td className="py-3.5 font-mono font-bold text-slate-300">{item.stock} Units</td>
                                <td className="py-3.5 font-mono text-slate-500">{item.reorder} Units</td>
                                <td className="py-3.5">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                    item.stock <= item.reorder 
                                      ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                                      : 'bg-green-500/10 text-green-400 border border-green-500/20'
                                  }`}>
                                    {item.stock <= item.reorder ? 'RESTOCK CRITICAL' : 'STABLE'}
                                  </span>
                                </td>
                                <td className="py-3.5 text-right">
                                  <button
                                    onClick={() => handleRestock(idx)}
                                    className="px-2.5 py-1 rounded bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white text-[11px] font-mono border border-purple-500/30 transition-all"
                                  >
                                    Restock +50 Units
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {activeErpTab === 'school' && (
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 font-mono">
                          School Registrar & Student Admission Ledger
                        </h4>
                        <div className="relative w-full sm:w-64">
                          <Search size={14} className="absolute left-3 top-3 text-slate-500" />
                          <input
                            type="text"
                            placeholder="Filter by name or grade..."
                            value={studentSearch}
                            onChange={(e) => setStudentSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-neutral-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-purple-500"
                          />
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs sm:text-sm">
                          <thead>
                            <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                              <th className="py-3">Roll ID</th>
                              <th className="py-3">Student Name</th>
                              <th className="py-3">Grade Class</th>
                              <th className="py-3">Academic Average</th>
                              <th className="py-3">Fees Ledger</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredStudents.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="py-8 text-center font-mono text-slate-500 text-xs">
                                  No registered student record matches query.
                                </td>
                              </tr>
                            ) : (
                              filteredStudents.map((s, idx) => (
                                <tr key={idx} className="border-b border-slate-800/50 hover:bg-neutral-950/40">
                                  <td className="py-3.5 font-mono text-purple-400">{s.roll}</td>
                                  <td className="py-3.5 text-white font-bold">{s.name}</td>
                                  <td className="py-3.5 text-slate-300 font-mono">{s.grade}</td>
                                  <td className="py-3.5 text-slate-300 font-mono">{s.average}</td>
                                  <td className="py-3.5">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                      s.fees === 'Cleared' 
                                        ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                                        : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                    }`}>
                                      {s.fees}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {activeErpTab === 'hospital' && (
                    <div className="space-y-4">
                      <div className="mb-2">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 font-mono">
                          Hospital Admissions & Emergency Bed Grid
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          Click any bed block to simulate patient admission/discharge. Green blocks represent vacant beds.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                        {beds.map((bed, idx) => (
                          <button
                            key={idx}
                            onClick={() => toggleBedStatus(idx)}
                            className={`p-4 rounded-xl border text-center transition-all duration-300 flex flex-col justify-between h-28 ${
                              bed.occupied
                                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                                : 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20'
                            }`}
                          >
                            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block font-bold">
                              {bed.id}
                            </span>
                            <div className="my-1">
                              <p className="text-xs font-bold leading-tight truncate">
                                {bed.occupied ? bed.patient : 'Vacant Bed'}
                              </p>
                              {bed.occupied && (
                                <p className="text-[9px] text-slate-500 font-mono truncate">{bed.doc}</p>
                              )}
                            </div>
                            <span className={`text-[9px] font-bold font-mono uppercase tracking-widest ${
                              bed.occupied ? 'text-red-400' : 'text-green-400'
                            }`}>
                              {bed.occupied ? 'OCCUPIED' : 'OPEN'}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CRM Consultation Lead Form */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-900 bg-neutral-950">
        <div className="max-w-3xl mx-auto rounded-3xl border border-slate-800 bg-neutral-900/60 p-8 shadow-2xl relative overflow-hidden">
          
          {/* Subtle Form Accent Background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest font-mono">
              Inquiry Pipeline Integration
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-2 mb-3">
              Request Demo & Free Consultation
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Submit your technology roadmap requirements. Our cloud engineering and ERP architects will analyze your specs and coordinate a sandbox demonstration.
            </p>
          </div>

          <form onSubmit={handleCrmSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">
                  Full Name / Contact Person *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Yuvanshan Prabakaran"
                  value={crmForm.name}
                  onChange={(e) => setCrmForm({...crmForm, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+94 77 123 4567"
                  value={crmForm.phone}
                  onChange={(e) => setCrmForm({...crmForm, phone: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">
                  Business Email Address
                </label>
                <input
                  type="email"
                  placeholder="ceo@mahdev.com"
                  value={crmForm.email}
                  onChange={(e) => setCrmForm({...crmForm, email: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">
                  Preferred Demo / Call Date
                </label>
                <input
                  type="date"
                  value={crmForm.preferredDate}
                  onChange={(e) => setCrmForm({...crmForm, preferredDate: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-500 text-sm font-mono text-slate-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">
                  Software System Type
                </label>
                <select
                  value={crmForm.systemType}
                  onChange={(e) => setCrmForm({...crmForm, systemType: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-500 text-sm text-slate-300"
                >
                  <option value="Custom ERP Suite">Custom ERP System (Integrated modules)</option>
                  <option value="Point of Sale (POS) Terminals">Point of Sale (POS) Terminals</option>
                  <option value="Warehouse & Stock Software">Warehouse & Inventory Management</option>
                  <option value="E-Commerce System & API">SaaS E-Commerce Web & APIs</option>
                  <option value="Custom Flutter/iOS/Android Apps">Custom Mobile Apps (Flutter/React Native)</option>
                  <option value="AWS/GCP Cloud Migration">AWS / GCP Cloud Architecture Setup</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">
                  Estimated System Budget Range
                </label>
                <select
                  value={crmForm.budget}
                  onChange={(e) => setCrmForm({...crmForm, budget: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-500 text-sm text-slate-300"
                >
                  <option value="Rs. 100,000 - 250,000">Rs. 100,000 - Rs. 250,000 (Small/Landing)</option>
                  <option value="Rs. 250,000 - 500,000">Rs. 250,000 - Rs. 500,000 (Custom E-Com/Web App)</option>
                  <option value="Rs. 500,000 - 800,000">Rs. 500,000 - Rs. 800,000 (Standard ERP)</option>
                  <option value="Rs. 1,000,000+">Rs. 1,000,000+ (Enterprise Scaled Multi-Branch)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">
                System Requirements & Feature Request Notes
              </label>
              <textarea
                rows={4}
                placeholder="Briefly explain your multi-branch or design requirements, required integrations, legacy data migrations..."
                value={crmForm.notes}
                onChange={(e) => setCrmForm({...crmForm, notes: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-sm"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-extrabold uppercase tracking-widest text-xs sm:text-sm transition-all duration-300 shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2"
              >
                <Send size={14} />
                <span>Submit Lead & Request Architecture Proposal</span>
              </button>
            </div>
          </form>

          {/* CRM Submission Confirmation Modal/Notification */}
          <AnimatePresence>
            {crmSubmitted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0 bg-neutral-950 flex flex-col items-center justify-center p-8 text-center overflow-y-auto z-20"
              >
                <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-400 mb-2 border border-emerald-500/20">
                  <Check size={32} className="animate-bounce" />
                </div>
                <h4 className="text-lg font-bold text-white mb-1">Proposal Request Saved!</h4>
                <p className="text-xs text-slate-400 max-w-md leading-relaxed mb-2">
                  Thank you, <strong className="text-cyan-400">{crmForm.name}</strong>. Please dispatch a copy of your technical specifications to secure a priority ticketing spot:
                </p>

                <EmailCopySection
                  isDarkMode={true}
                  name={crmForm.name}
                  email={crmForm.email}
                  phone={crmForm.phone}
                  brand="Mahdev IT Solutions"
                  serviceType={crmForm.systemType}
                  budget={crmForm.budget}
                  notes={crmForm.notes}
                  onDone={() => {
                    setCrmSubmitted(false);
                    setCrmForm({
                      name: '',
                      email: '',
                      phone: '',
                      systemType: 'Custom ERP Suite',
                      budget: 'Rs. 500,000 - 800,000',
                      notes: '',
                      preferredDate: ''
                    });
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </section>

      {/* Mock Client Browser Window Modal */}
      <AnimatePresence>
        {activeMockProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-4xl rounded-3xl overflow-hidden border border-purple-500/25 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-2xl shadow-purple-950/20"
            >
              {/* Top Accent Gradient Bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600"></div>

              {/* Browser bar */}
              <div className="px-5 py-4 flex items-center justify-between border-b border-purple-500/10 bg-neutral-950 pt-6">
                {/* Dots */}
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/90 shadow-lg shadow-rose-500/35" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/90 shadow-lg shadow-amber-500/35" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/90 shadow-lg shadow-emerald-500/35" />
                </div>
                {/* Mock address */}
                <div className="px-4 py-1.5 rounded-xl text-[11px] font-mono text-center truncate max-w-sm flex-grow mx-4 select-all bg-neutral-900 text-purple-300 border border-purple-500/10 shadow-inner">
                  {activeMockProject.url}
                </div>
                {/* Close */}
                <button 
                  onClick={() => setActiveMockProject(null)}
                  className="p-1.5 rounded-lg border border-neutral-850 hover:bg-neutral-800 text-slate-400 hover:text-white transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Simulated Client Homepage content */}
              <div className="p-8 h-[380px] overflow-y-auto space-y-6">
                <div className="flex items-center space-x-2">
                  <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
                    <Laptop size={20} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white font-sans tracking-tight">
                      {activeMockProject.title}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-mono">Simulated Core Client Viewport</p>
                  </div>
                </div>

                <div className="h-48 rounded-2xl overflow-hidden border border-purple-500/15 relative shadow-lg">
                  <img 
                    src={activeMockProject.image} 
                    alt="Mock site visual" 
                    className="w-full h-full object-cover filter brightness-[0.85] contrast-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent flex items-end p-5">
                    <span className="text-white text-[11px] font-bold font-mono tracking-wider uppercase px-3 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-lg border border-purple-400/20">
                      Interactive Client Live Portal
                    </span>
                  </div>
                </div>

                <div className="space-y-3 bg-neutral-950/40 p-5 rounded-2xl border border-purple-500/5">
                  <h5 className="text-xs font-bold font-mono uppercase tracking-wider text-purple-400">
                    Project Architecture Specifications
                  </h5>
                  <p className="text-xs sm:text-sm leading-relaxed text-slate-400 font-sans">
                    This portal operates on fully auto-scaled virtual containers connected to resilient multi-tenant databases. The UI utilizes custom state engines achieving a sub-100ms PageSpeed index. Configured with secure payment gateways and geo-fenced delivery trackers.
                  </p>
                </div>
              </div>

              {/* Footer CTA */}
              <div className="p-5 flex justify-end border-t border-purple-500/10 bg-neutral-950">
                <button
                  onClick={() => {
                    alert(`Opening direct external sandbox path: ${activeMockProject.url}`);
                    setActiveMockProject(null);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-purple-600/20 hover:shadow-purple-500/40 hover:scale-[1.02]"
                >
                  Open in New Tab
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
