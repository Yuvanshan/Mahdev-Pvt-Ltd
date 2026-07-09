/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Receipt, Box, TrendingUp, Users, Layout, Terminal, 
  Plus, Trash2, Search, Check, Send, Sparkles, Building2, Layers
} from 'lucide-react';
import { ERP_MODULES } from '../data';
import { ThemeSettings } from '../types';
import { addBooking } from '../utils/storage';
import EmailCopySection from './EmailCopySection';

interface ErpViewProps {
  isDarkMode: boolean;
  themeSettings?: ThemeSettings;
}

// Simulated data for POS dashboard
interface PosItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

export default function ErpView({ isDarkMode, themeSettings }: ErpViewProps) {
  const brandName = themeSettings?.brandName || 'Mahdev Solutions';
  const brandShort = themeSettings?.brandName ? themeSettings.brandName.split(' ')[0] : 'Mahdev';

  // Current Active Preview Module Tab
  const [activePreviewTab, setActivePreviewTab] = useState<'pos' | 'inventory' | 'school' | 'hospital'>('pos');

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
    { roll: '102', name: 'Ishita Patel', grade: 'XII-B', average: '88%', fees: 'Pending: ₹12,500' },
    { roll: '103', name: 'Kabir Malhotra', grade: 'XI-A', average: '74%', fees: 'Cleared' },
    { roll: '104', name: 'Pooja Reddy', grade: 'X-C', average: '95%', fees: 'Cleared' },
    { roll: '105', name: 'Rohan Sen', grade: 'XII-A', average: '67%', fees: 'Pending: ₹4,200' }
  ]);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) || 
    s.grade.toLowerCase().includes(studentSearch.toLowerCase())
  );

  // Interactive Hospital Bed Bed grid state
  const [beds, setBeds] = useState([
    { id: 'Ward 101', occupied: true, patient: 'Amit Gupta', doc: 'Dr. Mehta' },
    { id: 'Ward 102', occupied: false, patient: '', doc: '' },
    { id: 'Ward 103', occupied: true, patient: 'Suhana Sen', doc: 'Dr. Shah' },
    { id: 'Ward 104', occupied: true, patient: 'Vijay Nair', doc: 'Dr. Mehta' },
    { id: 'ICU Bed A', occupied: true, patient: 'Karan Mehra', doc: 'Dr. Anjali' },
    { id: 'ICU Bed B', occupied: false, patient: '', doc: '' },
    { id: 'Special Room 1', occupied: true, patient: 'Prem Chopra', doc: 'Dr. Anjali' },
    { id: 'Special Room 2', occupied: false, patient: '', doc: '' },
  ]);

  const toggleBed = (idx: number) => {
    const list = [...beds];
    if (list[idx].occupied) {
      list[idx].occupied = false;
      list[idx].patient = '';
      list[idx].doc = '';
    } else {
      list[idx].occupied = true;
      list[idx].patient = 'Anonymous Guest';
      list[idx].doc = `Dr. ${brandShort}`;
    }
    setBeds(list);
  };

  // Demo scheduler Form State
  const [demoName, setDemoName] = useState('');
  const [demoEmail, setDemoEmail] = useState('');
  const [demoOrg, setDemoOrg] = useState('');
  const [demoSize, setDemoSize] = useState('10-50 employees');
  const [demoSubmitted, setDemoSubmitted] = useState(false);

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoName || !demoEmail || !demoOrg) return;
    
    addBooking({
      brand: 'IT',
      name: demoName,
      phone: 'Corporate Contact',
      email: demoEmail,
      serviceType: 'ERP Demo Scheduler',
      eventDate: new Date().toISOString().split('T')[0],
      notes: `Organization: ${demoOrg}. Size: ${demoSize}. Requesting ERP sandbox demo access.`,
      amount: 450000,
    });

    setDemoSubmitted(true);
  };

  const getModuleIcon = (iconName: string) => {
    switch (iconName) {
      case 'Receipt': return <Receipt className="text-emerald-500 shrink-0" />;
      case 'Box': return <Box className="text-emerald-500 shrink-0" />;
      case 'TrendingUp': return <TrendingUp className="text-emerald-500 shrink-0" />;
      case 'Users': return <Users className="text-emerald-500 shrink-0" />;
      case 'Layout': return <Layout className="text-emerald-500 shrink-0" />;
      default: return <Receipt className="text-emerald-500 shrink-0" />;
    }
  };

  return (
    <div id="erp-view-container" className="relative w-full z-10">
      
      {/* Hero Banner */}
      <section className="relative py-28 px-4 sm:px-6 lg:px-8 border-b border-emerald-500/10 bg-black">
        <div className="absolute inset-0 z-0">
          <img 
            src={itRobotImage} 
            alt="ERP System Background" 
            className="w-full h-full object-cover opacity-15 filter brightness-75 scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 font-mono">
            Enterprise Management Suites
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mt-3 mb-6">
            Modular Cloud ERP Software
          </h1>
          <p className="text-slate-300 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            Centralizing core workflows into a unified, high-speed dashboard. Engineered for multi-warehouse retail inventory, fast-dine point-of-sale systems, institutional schools, and hospital logistics.
          </p>
          <a
            href="#live-dashboard-preview"
            className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition-all hover:scale-105 shadow-lg shadow-emerald-600/10"
          >
            <Terminal size={16} />
            <span>Launch Live Preview Sandbox</span>
          </a>
        </div>
      </section>

      {/* Core ERP Modules Matrix */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Robust Integrated Workflows
            </h2>
            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              No silos, no redundant inputs. Data entered at POS updates inventory and files double-entry ledger sheets automatically.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ERP_MODULES.map((module) => (
              <div
                key={module.id}
                className={`p-6 rounded-2xl border flex flex-col justify-between transition-all hover:scale-[1.01] ${
                  isDarkMode 
                    ? 'bg-neutral-900/40 border-emerald-500/10 hover:border-emerald-500/30 shadow-lg' 
                    : 'bg-white border-slate-200 shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                      {getModuleIcon(module.iconName)}
                    </div>
                    <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {module.title}
                    </h3>
                  </div>
                  <p className={`text-xs sm:text-sm leading-relaxed mb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    {module.description}
                  </p>
                </div>

                <div className="border-t border-emerald-500/10 pt-4 mt-auto">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 font-mono block mb-2.5">
                    Platform Features:
                  </span>
                  <ul className="space-y-1.5">
                    {module.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center space-x-1.5 text-xs">
                        <Check size={12} className="text-emerald-500 shrink-0" />
                        <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Live Interactive Sandbox Preview */}
      <section 
        id="live-dashboard-preview"
        className={`py-24 px-4 sm:px-6 lg:px-8 border-t border-b ${
          isDarkMode ? 'bg-neutral-950/45 border-emerald-500/10' : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold tracking-wider uppercase mb-3">
              <Sparkles size={12} className="animate-pulse" />
              <span>Interactive Sandbox Simulation</span>
            </div>
            <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {brandShort} ERP Console Preview
            </h2>
            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Click between different specialized vertical modules to test the reactive UI state engines yourself!
            </p>
          </div>

          {/* Sandbox Frame */}
          <div className={`rounded-2xl border overflow-hidden shadow-2xl ${
            isDarkMode ? 'bg-[#0b0f19] border-emerald-500/15' : 'bg-white border-slate-300'
          }`}>
            {/* Tab selection menu */}
            <div className={`flex flex-wrap border-b ${isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
              {[
                { id: 'pos', label: 'Retail Point-of-Sale', icon: <Receipt size={14} /> },
                { id: 'inventory', label: 'Multi-Warehouse Inventory', icon: <Box size={14} /> },
                { id: 'school', label: 'School Grade Registrar', icon: <Building2 size={14} /> },
                { id: 'hospital', label: 'Hospital Bed Logistics', icon: <Layers size={14} /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActivePreviewTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-5 py-3.5 text-xs font-bold uppercase tracking-wider border-r transition-all ${
                    isDarkMode ? 'border-slate-800' : 'border-slate-200'
                  } ${
                    activePreviewTab === tab.id
                      ? isDarkMode
                        ? 'bg-[#0b0f19] text-emerald-400 border-b-2 border-b-emerald-500'
                        : 'bg-white text-emerald-600 border-b-2 border-b-emerald-600 font-extrabold'
                      : isDarkMode
                        ? 'text-slate-400 hover:bg-slate-900 hover:text-white'
                        : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Simulated Workspace */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                
                {/* 1. Retail POS */}
                {activePreviewTab === 'pos' && (
                  <motion.div
                    key="pos-workspace"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                  >
                    {/* Catalog side */}
                    <div className="lg:col-span-2 space-y-4">
                      <h4 className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        Quick Cashier Checkout Catalog
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {posCatalog.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => handleAddPosItem(p)}
                            className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all hover:scale-[1.03] ${
                              isDarkMode 
                                ? 'bg-slate-900/60 border-slate-800 hover:border-emerald-500/40 hover:bg-slate-900' 
                                : 'bg-slate-50 border-slate-200 hover:border-emerald-500 hover:bg-slate-100'
                            }`}
                          >
                            <span className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{p.name}</span>
                            <div className="flex items-center justify-between mt-3 w-full">
                              <span className="text-emerald-500 font-mono font-bold text-xs">₹{p.price}</span>
                              <Plus size={12} className="text-emerald-400" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Receipt side */}
                    <div className={`p-4.5 rounded-xl border ${
                      isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="flex items-center justify-between border-b border-emerald-500/10 pb-2 mb-3">
                        <span className={`text-[10px] font-bold uppercase tracking-widest font-mono text-emerald-500`}>Active Register Receipt</span>
                        <span className="text-[10px] opacity-50 font-mono">ID: MP-8273</span>
                      </div>

                      {posCart.length === 0 ? (
                        <p className="text-xs text-center py-12 text-slate-500">Receipt is empty. Tap items on the left to bill them!</p>
                      ) : (
                        <div className="space-y-3.5">
                          <div className="max-h-40 overflow-y-auto space-y-2.5 pr-1">
                            {posCart.map((item) => (
                              <div key={item.id} className="flex justify-between items-center text-xs">
                                <div>
                                  <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.name}</span>
                                  <span className="text-[10px] text-slate-500 block">₹{item.price} x {item.qty}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="font-mono font-bold">₹{item.price * item.qty}</span>
                                  <button onClick={() => handleRemovePosItem(item.id)} className="text-red-400 hover:text-red-500">
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="h-px bg-slate-800 my-2" />

                          <div className="space-y-1.5 text-xs">
                            <div className="flex justify-between">
                              <span className="opacity-60">Subtotal</span>
                              <span className="font-mono">₹{posSubtotal}</span>
                            </div>
                            <div className="flex justify-between text-emerald-500">
                              <span>SGST/CGST Tax (18%)</span>
                              <span className="font-mono">+₹{posGst}</span>
                            </div>
                            <div className="flex justify-between text-sm font-bold border-t border-slate-800 pt-2.5">
                              <span className={isDarkMode ? 'text-white' : 'text-slate-900'}>Grand Total</span>
                              <span className="text-emerald-500 font-mono">₹{posTotal}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* 2. Warehouse Inventory */}
                {activePreviewTab === 'inventory' && (
                  <motion.div
                    key="inventory-workspace"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <h4 className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Active Multi-Location Stock Audits
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className={`border-b ${isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                            <th className="py-2">Item Name</th>
                            <th className="py-2">Stock Level</th>
                            <th className="py-2">Threshold Limit</th>
                            <th className="py-2">Replenish Status</th>
                            <th className="py-2 text-right">Instant Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {inventoryList.map((item, idx) => (
                            <tr key={idx} className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>
                              <td className="py-3 font-medium">{item.name}</td>
                              <td className="py-3">
                                <div className="flex items-center space-x-2">
                                  <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full ${item.stock < item.reorder ? 'bg-red-500' : 'bg-emerald-500'}`}
                                      style={{ width: `${Math.min(100, (item.stock / 150) * 100)}%` }}
                                    />
                                  </div>
                                  <span className="font-mono">{item.stock}</span>
                                </div>
                              </td>
                              <td className="py-3 font-mono opacity-60">{item.reorder} units</td>
                              <td className="py-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  item.status === 'Healthy' 
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15' 
                                    : 'bg-red-500/10 text-red-400 border border-red-500/15'
                                }`}>
                                  {item.status}
                                </span>
                              </td>
                              <td className="py-3 text-right">
                                <button 
                                  onClick={() => handleRestock(idx)}
                                  className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] transition-colors"
                                >
                                  Restock +50
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}

                {/* 3. School Grade Registrar */}
                {activePreviewTab === 'school' && (
                  <motion.div
                    key="school-workspace"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <h4 className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        Search Student Ledger & Academic reports
                      </h4>
                      <div className="relative w-full sm:w-64">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="text"
                          value={studentSearch}
                          onChange={(e) => setStudentSearch(e.target.value)}
                          placeholder="Search name or grade..."
                          className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs border focus:outline-none focus:border-emerald-500 ${
                            isDarkMode ? 'bg-neutral-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className={`border-b ${isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                            <th className="py-2">Roll No.</th>
                            <th className="py-2">Student Name</th>
                            <th className="py-2">Class Section</th>
                            <th className="py-2 text-center">Term Average</th>
                            <th className="py-2 text-right">Fee Clearance Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {filteredStudents.map((s) => (
                            <tr key={s.roll} className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>
                              <td className="py-3 font-mono opacity-50">{s.roll}</td>
                              <td className="py-3 font-bold">{s.name}</td>
                              <td className="py-3">{s.grade}</td>
                              <td className="py-3 text-center text-emerald-400 font-mono font-bold">{s.average}</td>
                              <td className="py-3 text-right">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                  s.fees === 'Cleared'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15'
                                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/15'
                                }`}>
                                  {s.fees}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}

                {/* 4. Hospital Bed Logistics */}
                {activePreviewTab === 'hospital' && (
                  <motion.div
                    key="hospital-workspace"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <h4 className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Interactive Ward Occupancy Tracker (Click bed to toggle occupied state)
                    </h4>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {beds.map((bed, idx) => (
                        <button
                          key={bed.id}
                          onClick={() => toggleBed(idx)}
                          className={`p-4 rounded-xl border text-left transition-all hover:scale-[1.03] ${
                            bed.occupied
                              ? isDarkMode
                                ? 'bg-red-500/5 border-red-500/30'
                                : 'bg-red-50/70 border-red-200'
                              : isDarkMode
                                ? 'bg-emerald-500/5 border-emerald-500/30'
                                : 'bg-emerald-50/70 border-emerald-200'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full mb-2">
                            <span className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{bed.id}</span>
                            <span className={`w-2.5 h-2.5 rounded-full ${bed.occupied ? 'bg-red-500' : 'bg-emerald-500'}`} />
                          </div>
                          
                          {bed.occupied ? (
                            <div className="text-[10px] text-slate-500 space-y-0.5 leading-tight">
                              <p className="font-semibold text-red-400">Occupied</p>
                              <p className="truncate">Patient: {bed.patient}</p>
                              <p className="truncate">Attending: {bed.doc}</p>
                            </div>
                          ) : (
                            <div className="text-[10px] text-slate-500 space-y-0.5 leading-tight">
                              <p className="font-semibold text-emerald-400">Available</p>
                              <p>Bed clean & sanitized</p>
                              <p>Ready for intake</p>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </div>

        </div>
      </section>

      {/* Demo Booking Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className={`p-8 rounded-3xl border ${
            isDarkMode 
              ? 'bg-gradient-to-br from-neutral-900 to-black border-emerald-500/10 shadow-2xl' 
              : 'bg-white border-slate-200 shadow-xl'
          }`}>
            <div className="text-center mb-8">
              <h2 className={`text-2xl font-extrabold tracking-tight mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Request Enterprise ERP Demo
              </h2>
              <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Schedule a custom video tour with our lead software architect, customized to your business vertical.
              </p>
            </div>

            <AnimatePresence mode="wait">
              {!demoSubmitted ? (
                <motion.form 
                  key="demo-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleDemoSubmit} 
                  className="space-y-5"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className={`block text-[10px] font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={demoName}
                        onChange={(e) => setDemoName(e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-emerald-500 ${
                          isDarkMode ? 'bg-neutral-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                        }`}
                        placeholder="Rajesh Singhania"
                      />
                    </div>
                    <div>
                      <label className={`block text-[10px] font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        Corporate Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={demoEmail}
                        onChange={(e) => setDemoEmail(e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-emerald-500 ${
                          isDarkMode ? 'bg-neutral-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                        }`}
                        placeholder="rajesh@singhaniajewels.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className={`block text-[10px] font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        Organization Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={demoOrg}
                        onChange={(e) => setDemoOrg(e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-emerald-500 ${
                          isDarkMode ? 'bg-neutral-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                        }`}
                        placeholder="Singhania Jewellers Private Limited"
                      />
                    </div>
                    <div>
                      <label className={`block text-[10px] font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        Organization Size
                      </label>
                      <select
                        value={demoSize}
                        onChange={(e) => setDemoSize(e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-emerald-500 ${
                          isDarkMode ? 'bg-neutral-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <option>1-10 employees</option>
                        <option>10-50 employees</option>
                        <option>50-250 employees</option>
                        <option>250+ employees (Enterprise)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-lg"
                  >
                    Request Architect Sandbox Demo
                  </button>
                </motion.form>
              ) : (
                <motion.div 
                  key="demo-success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6 space-y-4"
                >
                  <div className="inline-flex p-3 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Send size={32} />
                  </div>
                  <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Demo Invitation Shipped!
                  </h3>
                  <p className={`text-xs max-w-md mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Thank you for contacting Mahdev Solutions, {demoName}. We have logged your request. Please dispatch a copy to our inbox to secure a sandbox provisioning ticket:
                  </p>

                  <EmailCopySection
                    isDarkMode={isDarkMode}
                    name={demoName}
                    email={demoEmail}
                    phone="Corporate Contact"
                    brand="Mahdev ERP Solutions"
                    serviceType="ERP Sandbox Demo Access"
                    notes={`Company: ${demoOrg} (${demoSize})`}
                    amount={450000}
                    onDone={() => {
                      setDemoSubmitted(false);
                      setDemoName('');
                      setDemoEmail('');
                      setDemoOrg('');
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

    </div>
  );
}
