'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Receipt, Box, TrendingUp, Users, Layout, CheckCircle, ChevronDown, MessageSquare, Info } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const modules = [
  {
    icon: Receipt,
    title: 'Omnichannel POS Billing',
    desc: 'Blazing-fast billing terminal running offline-first, syncs in milliseconds once online. Support for thermal printers & barcode guns.',
    features: ['Thermal printer drivers integrated', 'Quick barcode scanning', 'Dynamic discount models', 'Multi-payment checkouts']
  },
  {
    icon: Box,
    title: 'Multi-Warehouse Inventory',
    desc: 'Real-time stock movement, safety threshold alerts, auto-reordering formulas, and batch expiry tracking.',
    features: ['Real-time stock ledger', 'Automated purchase orders', 'FIFO / LIFO valuations', 'Batch & Expiry tracking']
  },
  {
    icon: TrendingUp,
    title: 'Double-Entry Accounting',
    desc: 'Automated ledger postings from POS checkout terminals. Comprehensive balance sheets, profit & loss, and tax audits.',
    features: ['Direct bank reconciliation', 'Dynamic expense tracking', 'Automated tax returns', 'Multi-currency support']
  },
  {
    icon: Users,
    title: 'HR, Payroll & Biometrics',
    desc: 'Unified employee records, biometric clock-in API sync, cloud shift schedulers, and salary slip generators.',
    features: ['Biometric & GPS clock-ins', 'PF & ESI automated tax', 'Performance appraisals tracker', 'One-click salary bank transfers']
  },
  {
    icon: Layout,
    title: 'Vertical Specifics (POS/Hotel)',
    desc: 'Tailored workflow platforms for specialized domains: school fees, clinical health files, hotel occupancy, and dining tables.',
    features: ['School grades & fee tracking', 'Clinical OP/IP doctor portal', 'Restaurant table & KOT printing', 'Retail cross-store stock share']
  }
];

const faqs = [
  { q: 'Can the POS run offline if our store internet cuts out?', a: 'Yes! Our custom retail billing engine is designed offline-first. Transactions are stored in indexed database files client-side and automatically synchronize with Firebase Firestore when the connection recovers.' },
  { q: 'Does the system integrate with physical thermal printers and cash drawers?', a: 'Absolutely. We support direct hardware handshakes with standard EPSON, TSC, and Generic thermal printers via serial, USB, or local IP connections, including automatic kick-out commands for cash drawers.' },
  { q: 'How secure is our accounting and inventory ledger data?', a: 'We utilize Firestore security rules with strict user session verification. Your data is isolated in private collections, and all API connections run over secure HTTPS protocols. Daily encrypted backups are scheduled automatically.' },
  { q: 'Can we request custom modifications for our school or hotel operations?', a: 'Yes. While the core engine is standard SaaS, we specialize in building custom vertical extensions. Our engineers will audit your store layout, school system, or hotel desk to construct tailored dashboards.' }
];

export default function ErpSolutions() {
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenFaqIdx(openFaqIdx === idx ? null : idx);
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-navy-dark pt-20">
        {/* Banner Section */}
        <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
          <Image 
            src="/images/it_robot_developer_1783346302442.jpg" 
            alt="Mahdev ERP Banner" 
            fill
            priority
            className="object-cover brightness-[0.35] scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/30 to-transparent" />
          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center flex flex-col items-center gap-4">
            <span className="px-3 py-1 rounded-full glass border border-amber-500/35 text-amber-300 text-xs font-bold uppercase tracking-wider">
              MAHDEV ERP SYSTEM
            </span>
            <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-tight">
              Centralize Your <span className="text-gradient-gold">Business Ecosystem</span>
            </h1>
            <p className="font-sans text-gray-300 text-base sm:text-lg max-w-xl leading-relaxed">
              Robust custom-engineered ERP platforms designed to automate retail POS, warehouse inventory, financial bookkeeping, and employee HR.
            </p>
          </div>
        </section>

        {/* Modules Grid */}
        <section className="py-24 max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 flex flex-col gap-3">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-accent">
              INTEGRATED MODULES
            </span>
            <h2 className="font-display font-bold text-3xl text-white">
              End-to-End Enterprise Architecture
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {modules.map((mod, idx) => {
              const Icon = mod.icon;
              return (
                <div 
                  key={idx}
                  className="glass p-8 rounded-3xl border border-white/5 hover:border-gold-accent/20 transition-all duration-300 group flex flex-col sm:flex-row gap-6"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-gold-soft shrink-0">
                    <Icon className="w-7 h-7" />
                  </div>
                  <div className="flex flex-col gap-4">
                    <div>
                      <h3 className="font-display font-bold text-white text-lg group-hover:text-gold-soft transition-colors">{mod.title}</h3>
                      <p className="font-sans text-sm text-gray-400 mt-2 leading-relaxed">{mod.desc}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 border-t border-white/5 pt-4">
                      {mod.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-center gap-2 text-xs text-gray-300 font-sans">
                          <CheckCircle className="w-3.5 h-3.5 text-gold-soft shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Comparative Pricing */}
        <section className="py-24 bg-navy-medium/30 relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16 flex flex-col gap-3">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-accent">
                SCALABLE INVESTMENT
              </span>
              <h2 className="font-display font-bold text-3xl text-white">
                Select Your Operation Mode
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                { title: 'Standard POS', price: 'Rs. 4,999 / mo', desc: 'Optimized billing terminal for single-store retail or restaurant locations.', color: 'border-white/5', features: ['Omnichannel POS', 'Basic Inventory tracking', 'Email Invoice reports', '2 Terminal checkouts'] },
                { title: 'Cloud Enterprise', price: 'Rs. 12,999 / mo', desc: 'Unified cloud ERP for growing brands with multi-warehouse stocks.', badge: 'Popular', color: 'border-gold-accent/30 bg-gold-accent/5', features: ['Multi-Warehouse Inventory', 'Double-Entry Accounting', 'Automatic Daily Cloud Backups', 'HR, Payroll & Biometrics', '10 Terminal checkouts'] },
                { title: 'Custom Architecture', price: 'Custom Quote', desc: 'Bespoke integration for schools, hospital records, or luxury hotels.', color: 'border-white/5', features: ['Specialized Vertical Module', 'Biometric Scanner integrations', 'Dedicated Cloud VM Hosting', 'Lifetime License optional', 'Unlimited Terminals'] }
              ].map((tier, idx) => (
                <div key={idx} className={`glass p-8 rounded-3xl border ${tier.color} flex flex-col relative`}>
                  {tier.badge && (
                    <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-gold-accent/20 border border-gold-accent/30 text-gold-soft text-[9px] font-bold uppercase tracking-wider">
                      {tier.badge}
                    </span>
                  )}
                  <h3 className="font-display font-bold text-lg text-white">{tier.title}</h3>
                  <p className="font-sans text-xs text-gray-400 mt-1 leading-relaxed">{tier.desc}</p>
                  <div className="my-6">
                    <span className="font-display text-2xl font-black text-white">{tier.price}</span>
                  </div>

                  <ul className="flex flex-col gap-3 flex-1 font-sans text-xs sm:text-sm text-gray-300 mb-8 border-t border-white/5 pt-4">
                    {tier.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex gap-2">
                        <CheckCircle className="w-4 h-4 text-gold-soft shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <Link 
                    href="/contact"
                    className="w-full py-3 rounded-xl bg-white/5 border border-white/10 hover:border-gold-accent/50 text-center text-white font-sans text-xs font-semibold hover:bg-gold-accent hover:text-navy-dark transition-all tracking-wider"
                  >
                    REQUEST DEMO
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Collapsible FAQs Section */}
        <section className="py-24 max-w-4xl mx-auto px-6">
          <div className="text-center mb-16 flex flex-col gap-3">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-accent">
              COMMONLY ASKED
            </span>
            <h2 className="font-display font-bold text-3xl text-white">
              ERP Systems FAQ
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="glass rounded-2xl border border-white/5 overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left font-display font-bold text-white text-base hover:bg-white/5 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-gold-soft transition-transform duration-300 ${openFaqIdx === idx ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence initial={false}>
                  {openFaqIdx === idx && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-6 pb-6 pt-2 font-sans text-xs sm:text-sm text-gray-400 leading-relaxed border-t border-white/5">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 max-w-5xl mx-auto px-6 relative z-10 text-center">
          <div className="glass-premium rounded-3xl p-10 sm:p-12 border border-gold-accent/20 flex flex-col items-center gap-6 shadow-2xl">
            <h3 className="font-display font-black text-2xl sm:text-3xl text-white">
              Interested in a Custom Demo of Mahdev ERP?
            </h3>
            <p className="font-sans text-gray-400 max-w-xl text-sm sm:text-base leading-relaxed">
              We can present a screen-share demo showing inventory setup, biometric integrations, and cash terminal workflows.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-2 w-full sm:w-auto">
              <Link 
                href="/contact"
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-gold-accent to-gold-soft text-navy-dark font-sans font-bold text-sm tracking-wider rounded-full hover:brightness-110 shadow-lg shadow-gold-accent/15 transition-all"
              >
                REQUEST SALES CALL
              </Link>
              <a 
                href="https://wa.me/94768988970?text=Hi%20Mahdev%20ERP%20Systems,%20I%20would%20like%20to%20see%20a%20POS%20demo" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-3.5 glass hover:bg-white/5 border border-white/10 text-white font-sans font-semibold text-sm tracking-wider rounded-full flex items-center justify-center gap-2 transition-all"
              >
                <MessageSquare className="w-4 h-4 text-green-400" />
                CHAT ON WHATSAPP
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
