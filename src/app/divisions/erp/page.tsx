'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Terminal, Layers, CheckCircle, X, ChevronRight, Play, Database, FileText, Settings, ShieldAlert } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const BookingSystem = dynamic(() => import('@/components/BookingSystem'), { ssr: false });

const erpModules = [
  { icon: Layers, title: 'Double-Entry Ledgers', desc: 'Standard auditing trails, balancing sheets, and asset flow reports synced in real-time.' },
  { icon: Database, title: 'Multi-Warehouse Inventory', desc: 'Auto-updated stock balances, catalog category allocations, and barcode scans.' },
  { icon: Terminal, title: 'POS Billing Integrations', desc: 'Offline-first terminal registry checkouts supporting receipt thermal printers.' },
  { icon: Settings, title: 'School Operations Core', desc: 'Specialized student admission registry, monthly tuition fee alerts, and class schedules.' },
  { icon: FileText, title: 'Hotel & Restaurant POS', desc: 'Table layout mappings, kitchen order tickets (KOT) dispatches, and split bill checkouts.' }
];

export default function ErpPage() {
  const [showBooking, setShowBooking] = useState(false);
  const [coverImg, setCoverImg] = useState('/images/it_robot_developer_1783346302442.jpg');
  const [tagline, setTagline] = useState('Enterprise Resource Planners');
  const [description, setDescription] = useState('We design specialized offline-first POS ledgers and inventory software modules optimized for schools, corporate syndicates, hotels, and retail.');

  useEffect(() => {
    // 1. Fetch posters settings
    const unsubPosters = onSnapshot(doc(db, 'settings', 'division_posters'), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        // Fallback or override
      }
    });

    // 2. Fetch specific division details
    const unsubDiv = onSnapshot(doc(db, 'divisions', 'erp'), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        if (d.tagline) setTagline(d.tagline);
        if (d.description) setDescription(d.description);
        if (d.bgImage) setCoverImg(d.bgImage);
      }
    });

    return () => {
      unsubPosters();
      unsubDiv();
    };
  }, []);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-navy-dark pt-20">
        {/* Banner Section */}
        <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
          <Image 
            src={coverImg} 
            alt="ERP Banner" 
            fill
            priority
            className="object-cover brightness-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/30 to-transparent" />
          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center flex flex-col items-center gap-4">
            <span className="px-3 py-1 rounded-full glass border border-amber-500/35 text-amber-300 text-xs font-bold uppercase tracking-wider">
              MAHDEV ERP SOLUTIONS
            </span>
            <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-7xl text-white tracking-tight leading-tight">
              {tagline}
            </h1>
            <p className="font-sans text-gray-300 text-base sm:text-lg max-w-xl leading-relaxed">
              {description}
            </p>
            <button
              onClick={() => setShowBooking(true)}
              className="mt-2 px-8 py-4 rounded-full bg-gradient-to-r from-gold-accent to-gold-soft text-navy-dark font-sans text-xs font-bold tracking-widest shadow-lg shadow-gold-accent/15"
            >
              BOOK SYSTEM DEMO
            </button>
          </div>
        </section>

        {/* Modules Capabilities Grid */}
        <section className="py-24 max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 flex flex-col gap-3">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-accent">
              INTEGRATED ARCHITECTURES
            </span>
            <h2 className="font-display font-bold text-3xl text-white">
              Enterprise Resource Modules
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {erpModules.map((mod, idx) => {
              const Icon = mod.icon;
              return (
                <div 
                  key={idx}
                  className="glass p-6 rounded-3xl border border-white/5 hover:border-gold-accent/20 transition-all duration-300 group flex flex-col gap-4 text-left"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 text-gold-soft">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-white text-lg group-hover:text-gold-soft transition-colors">{mod.title}</h3>
                    <p className="font-sans text-sm text-gray-400 mt-2 leading-relaxed">{mod.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Pricing/Licensing Suite */}
        <section className="py-24 bg-navy-medium/30 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <div className="mb-16 flex flex-col gap-3">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-accent">SYSTEM COST GUIDE</span>
              <h2 className="font-display font-black text-3xl text-white">Transparent Software Pricing</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Standard cloud POS */}
              <div className="glass p-8 rounded-3xl border border-white/5 flex flex-col justify-between text-left hover:border-gold-accent/30 transition-all">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-gold-accent font-bold">Standard Cloud POS</span>
                  <h3 className="font-display font-black text-2xl text-white mt-1">Rs. 4,500 <span className="text-xs font-normal text-gray-400">/ month</span></h3>
                  <p className="text-xs text-gray-400 font-sans mt-3 leading-relaxed">Perfect for single-store retail or restaurant checkouts looking for real-time inventory synchronization.</p>
                  <ul className="mt-6 flex flex-col gap-2.5 font-sans text-xs text-gray-300">
                    <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-gold-soft shrink-0" /> 1 Terminal License</li>
                    <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-gold-soft shrink-0" /> Cloud Inventory Sync</li>
                    <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-gold-soft shrink-0" /> Thermal Slip Printing Support</li>
                    <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-gold-soft shrink-0" /> Email & SMS Invoice Alerts</li>
                  </ul>
                </div>
                <button
                  onClick={() => setShowBooking(true)}
                  className="mt-8 w-full py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white uppercase tracking-wider hover:bg-gold-accent hover:text-navy-dark transition-all"
                >
                  START POS TRIAL
                </button>
              </div>

              {/* Custom ERP */}
              <div className="glass p-8 rounded-3xl border border-gold-accent/25 bg-gold-accent/5 flex flex-col justify-between text-left hover:border-gold-accent/50 transition-all">
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] uppercase tracking-wider text-gold-accent font-bold">Bespoke Suite</span>
                    <span className="px-2 py-0.5 rounded bg-gold-accent/20 text-[8px] text-gold-soft uppercase tracking-wider font-bold">Bespoke</span>
                  </div>
                  <h3 className="font-display font-black text-2xl text-white mt-1">Rs. 250,000+ <span className="text-xs font-normal text-gray-400">One-time</span></h3>
                  <p className="text-xs text-gray-400 font-sans mt-3 leading-relaxed">A custom engineered platform built specifically for large-scale logistics, schools, or multi-outlet corporations.</p>
                  <ul className="mt-6 flex flex-col gap-2.5 font-sans text-xs text-gray-300">
                    <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-gold-soft shrink-0" /> Unlimited Terminal nodes</li>
                    <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-gold-soft shrink-0" /> Double-Entry Ledger Bookkeeping</li>
                    <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-gold-soft shrink-0" /> Specialized Operations Modules</li>
                    <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-gold-soft shrink-0" /> Lifetime Code Maintenance Support</li>
                  </ul>
                </div>
                <button
                  onClick={() => setShowBooking(true)}
                  className="mt-8 w-full py-3 rounded-xl bg-gradient-to-r from-gold-accent to-gold-soft text-navy-dark font-sans text-xs font-bold uppercase tracking-wider hover:brightness-110 transition-all"
                >
                  REQUEST ERP PROPOSAL
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Global Booking System Modal Overlay */}
        <AnimatePresence>
          {showBooking && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBooking(false)}
              className="fixed inset-0 bg-black/80 z-[99999] flex items-end md:items-center justify-center p-0 md:p-4 backdrop-blur-md overflow-y-auto"
            >
              <div 
                onClick={(e) => e.stopPropagation()} 
                className="w-full max-w-3xl relative mobile-bottom-sheet"
              >
                <button
                  onClick={() => setShowBooking(false)}
                  className="absolute top-4 right-4 md:-top-12 md:right-0 p-2 text-gray-400 hover:text-white z-50"
                >
                  <X className="w-6 h-6" />
                </button>
                <BookingSystem initialDivision="it-solutions" onSuccess={() => setTimeout(() => setShowBooking(false), 2000)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </>
  );
}
