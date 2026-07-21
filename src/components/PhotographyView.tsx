/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Video, Compass, MapPin, Eye, CheckCircle, Calculator, ChevronRight, Check, MessageSquare } from 'lucide-react';
import { PHOTO_PORTFOLIO, PHOTO_PRICING } from '../data';
import { PhotoPortfolioItem, ThemeSettings } from '../types';
import { addBooking } from '../utils/storage';
import EmailCopySection from './EmailCopySection';
import EnquiryModal from './EnquiryModal';
import u1HeroImage from '../assets/images/u1_robot_camera_1783346286743.jpg';

interface PhotographyViewProps {
  isDarkMode: boolean;
  portfolioList?: PhotoPortfolioItem[];
  pricingList?: any[];
  themeSettings?: ThemeSettings;
}

export default function PhotographyView({ 
  isDarkMode, 
  portfolioList = PHOTO_PORTFOLIO, 
  pricingList = PHOTO_PRICING,
  themeSettings
}: PhotographyViewProps) {
  const brandName = 'U1 Studio';
  const brandShort = 'U1';
  const heroImage = themeSettings?.photographyBanner || u1HeroImage;

  // Filter Portfolio State
  const [activeFilter, setActiveFilter] = useState('All');
  const filters = ['All', 'Wedding Photography', 'Cinematography', 'Drone Photography', 'Outdoor Shoots', 'Studio Photography', 'Baby Shoots'];

  // Custom Pricing Estimator State
  const [selectedPackage, setSelectedPackage] = useState(0); // Safely start with first package
  const [addonDrone, setAddonDrone] = useState(false);
  const [addonAlbum, setAddonAlbum] = useState(false);
  const [addonPreWedding, setAddonPreWedding] = useState(false);
  const [bookingCompleted, setBookingCompleted] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');

  // Custom enquiry modal state
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [enquiryPackage, setEnquiryPackage] = useState('');

  const handleBookShoot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone) return;

    // Save to central store
    addBooking({
      brand: 'Studio',
      name: clientName,
      phone: clientPhone,
      email: '',
      serviceType: `${activePlan.title} (Shoot Package)`,
      eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default event date 7 days from now
      notes: `Addons: ${addonDrone ? 'Drone Support, ' : ''}${addonAlbum ? 'Signature Photo Album, ' : ''}${addonPreWedding ? 'Pre-wedding Shoot' : ''}. Total Price: Rs. ${totalPrice.toLocaleString()}`,
      amount: totalPrice,
    });

    setBookingCompleted(true);
  };

  const getBasePriceNum = (priceStr: string) => {
    if (!priceStr) return 0;
    return parseInt(priceStr.replace(/[^0-9]/g, '')) || 0;
  };

  const activePlan = pricingList[selectedPackage] || pricingList[0] || { price: 'Rs. 0', title: 'Plan', duration: 'N/A', features: [] };
  const basePrice = getBasePriceNum(activePlan.price);
  const addonCost = (addonDrone ? 9999 : 0) + (addonAlbum ? 4999 : 0) + (addonPreWedding ? 14999 : 0);
  const totalPrice = basePrice + addonCost;

  const filteredPortfolio = activeFilter === 'All'
    ? portfolioList
    : portfolioList.filter(p => p.category === activeFilter);

  return (
    <>
    <div id="photography-view-container" className="relative w-full z-10">

      
      {/* Hero Banner */}
      <section className="relative py-28 px-4 sm:px-6 lg:px-8 border-b border-emerald-500/10 bg-black">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Photography Hero Banner" 
            className="w-full h-full object-cover opacity-20 filter grayscale"
            referrerPolicy="no-referrer"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 font-mono">
            {brandShort} Cinematic Lens Division
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mt-3 mb-6">
            Cinematography & Portraits
          </h1>
          <p className="text-slate-300 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            Every smile, tear, and golden sunset curated with cinematic grade camera systems, steady tracking frames, and award-winning color palettes.
          </p>
            <button
              type="button"
              onClick={() => {
                // Prevent "feels like home" jumps by scrolling after layout settles.
                window.requestAnimationFrame(() => {
                  setTimeout(() => {
                    const el = document.getElementById('u1-pricing-section');
                    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    // Improve perceived navigation: focus heading shortly after scroll.
                    setTimeout(() => {
                      const focusEl = document.getElementById('u1-pricing-heading');
                      (focusEl as HTMLElement | null)?.focus?.();
                    }, 250);
                  }, 0);
                });
              }}
              className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition-all hover:scale-105 shadow-lg shadow-emerald-600/10"
            >
              <span>Configure Packages</span>
              <ChevronRight size={16} />
            </button>
        </div>
      </section>

      {/* Categories Row & Portfolio Grid */}
      <section id="u1-portfolio-section" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Cinematic Portfolio
            </h2>
            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Filter through our professional sessions representing different settings and production workflows.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                  activeFilter === filter 
                    ? 'bg-emerald-600 text-white shadow-md' 
                    : isDarkMode 
                      ? 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {filter === 'Wedding Photography' ? 'Weddings' : filter.replace(' Photography', '').replace(' Shoots', '')}
              </button>
            ))}
          </div>

          {/* Portfolio Grid */}
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredPortfolio.map((item) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  key={item.id}
                  className={`group relative rounded-2xl overflow-hidden border ${
                    isDarkMode ? 'bg-neutral-900/30 border-emerald-500/10' : 'bg-white border-slate-100 shadow-md'
                  }`}
                >
                  <div className="relative h-72 overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                    {/* Dark gradient slide overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                      <span className="text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
                        {item.category}
                      </span>
                      <h4 className="text-white text-base font-bold mt-1">
                        {item.title}
                      </h4>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

        </div>
      </section>

      {/* Pricing and Interactive Estimate Builder */}
      <section 
        id="u1-pricing-section"
        className={`py-24 px-4 sm:px-6 lg:px-8 border-t border-b ${
          isDarkMode ? 'bg-neutral-950/40 border-emerald-500/10' : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2
              id="u1-pricing-heading"
              tabIndex={-1}
              className={`text-2xl sm:text-3xl font-extrabold tracking-tight mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
            >
              Interactive Package Configurator
            </h2>
            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Select a core plan and add bespoke custom enhancements to generate an automated quote instantly.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            
            {/* Column 1: Packages List */}
            <div className="lg:col-span-2 space-y-6">
              <h3 className={`text-base font-bold uppercase tracking-wider mb-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                1. Select Base Plan
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {pricingList.map((plan, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedPackage(idx)}
                    className={`p-5 rounded-2xl border text-left transition-all relative ${
                      selectedPackage === idx
                        ? 'border-emerald-500 bg-emerald-500/5 ring-2 ring-emerald-500/30'
                        : isDarkMode
                          ? 'border-slate-800 bg-neutral-900/40 hover:bg-slate-900'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    {plan.badge && (
                      <span className="absolute -top-3 left-4 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-white/20">
                        {plan.badge}
                      </span>
                    )}
                    <h4 className={`text-sm font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {plan.title}
                    </h4>
                    <p className="text-emerald-500 text-lg font-black font-mono mt-1">
                      {plan.price}
                    </p>
                    <span className="text-[11px] text-slate-500 block mb-3 font-medium">
                      Duration: {plan.duration}
                    </span>
                    <ul className="space-y-1.5 text-[11px] opacity-75 border-t border-emerald-500/10 pt-2.5">
                      {plan.features.slice(0, 3).map((f: string, i: number) => (
                        <li key={i} className="flex items-center space-x-1">
                          <span className="text-emerald-500 shrink-0">✓</span>
                          <span className="truncate">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>

              {/* Addons Checklist */}
              <div className="pt-6">
                <h3 className={`text-base font-bold uppercase tracking-wider mb-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  2. Dynamic Add-ons
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { state: addonDrone, setter: setAddonDrone, label: 'Dual Drone Video', cost: '+₹9,999', desc: '4K Cinematic flight footage' },
                    { state: addonAlbum, setter: setAddonAlbum, label: 'Luxury Hardcover Photobook', cost: '+₹4,999', desc: '40 Premium lay-flat pages' },
                    { state: addonPreWedding, setter: setAddonPreWedding, label: 'Pre-Wedding Shoot Session', cost: '+₹14,999', desc: '1 Outdoor venue shoot' },
                  ].map((addon, i) => (
                    <button
                      key={i}
                      onClick={() => addon.setter(!addon.state)}
                      className={`p-4 rounded-xl border text-left flex items-start space-x-3 transition-all ${
                        addon.state
                          ? 'border-emerald-500 bg-emerald-500/5'
                          : isDarkMode
                            ? 'border-slate-800 bg-neutral-900/40 hover:bg-slate-900'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded border mt-0.5 shrink-0 flex items-center justify-center transition-colors ${
                        addon.state ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-600'
                      }`}>
                        {addon.state && <Check size={12} />}
                      </div>
                      <div className="flex flex-col text-xs">
                        <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          {addon.label}
                        </span>
                        <span className="text-[11px] text-emerald-500 font-mono mt-0.5">{addon.cost}</span>
                        <span className="text-[10px] text-slate-500 mt-0.5 leading-tight">{addon.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Column 2: Estimate Summary & Form */}
            <div id="booking-invoice-column">
              <div className={`p-6.5 rounded-2xl border ${
                isDarkMode ? 'bg-neutral-900/60 border-emerald-500/10' : 'bg-white border-slate-200 shadow-md'
              }`}>
                <div className="flex items-center space-x-2 text-emerald-500 mb-4 border-b border-emerald-500/10 pb-4">
                  <Calculator size={18} />
                  <span className="text-xs font-bold uppercase tracking-wider font-mono">Dynamic Production Estimate</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="opacity-70">Selected Plan: {PHOTO_PRICING[selectedPackage].title}</span>
                    <span className="font-mono font-bold">{PHOTO_PRICING[selectedPackage].price}</span>
                  </div>
                  {addonDrone && (
                    <div className="flex justify-between text-emerald-500">
                      <span>+ Drone Video</span>
                      <span className="font-mono">+₹9,999</span>
                    </div>
                  )}
                  {addonAlbum && (
                    <div className="flex justify-between text-emerald-500">
                      <span>+ Luxury Photobook</span>
                      <span className="font-mono">+₹4,999</span>
                    </div>
                  )}
                  {addonPreWedding && (
                    <div className="flex justify-between text-emerald-500">
                      <span>+ Pre-Wedding Shoot</span>
                      <span className="font-mono">+₹14,999</span>
                    </div>
                  )}
                  
                  <div className="h-px bg-emerald-500/10 my-2" />

                  <div className="flex justify-between text-sm font-bold">
                    <span className={isDarkMode ? 'text-white' : 'text-slate-900'}>Total production cost:</span>
                    <span className="text-emerald-500 font-mono font-extrabold text-base">
                      ₹{totalPrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Get Custom Quote button */}
                <div className="mt-4 pt-4 border-t border-emerald-500/10 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setEnquiryPackage(activePlan.title);
                      setEnquiryOpen(true);
                    }}
                    className="w-full py-2.5 rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                  >
                    <MessageSquare size={13} />
                    Get Custom Quote via Enquiry
                  </button>
                </div>
                {/* Direct Booking form */}
                <div className="mt-6 border-t border-emerald-500/10 pt-6">
                  <AnimatePresence mode="wait">
                    {!bookingCompleted ? (
                      <form onSubmit={handleBookShoot} className="space-y-3.5">
                        <input
                          type="text"
                          required
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-emerald-500 ${
                            isDarkMode ? 'bg-neutral-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                          }`}
                          placeholder="Your Name"
                        />
                        <input
                          type="tel"
                          required
                          value={clientPhone}
                          onChange={(e) => setClientPhone(e.target.value)}
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-emerald-500 ${
                            isDarkMode ? 'bg-neutral-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                          }`}
                          placeholder="Your Phone Number"
                        />
                        <button
                          type="submit"
                          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md shadow-emerald-600/15"
                        >
                          Book Production
                        </button>
                      </form>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-4 space-y-3"
                      >
                        <CheckCircle size={32} className="text-emerald-400 mx-auto" />
                        <h4 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          Shoot Session Saved!
                        </h4>
                        <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          Our team has saved this production package request. To guarantee your shoot slot, please send an order copy to our team:
                        </p>

                        <EmailCopySection
                          isDarkMode={isDarkMode}
                          name={clientName}
                          phone={clientPhone}
                          brand="U1 Studio Photography"
                          serviceType={`${activePlan.title} (Shoot Package)`}
                          notes={`Addons: ${addonDrone ? 'Drone Support, ' : ''}${addonAlbum ? 'Signature Photo Album, ' : ''}${addonPreWedding ? 'Pre-wedding Shoot' : ''}`}
                          amount={totalPrice}
                          onDone={() => {
                            setBookingCompleted(false);
                            setClientName('');
                            setClientPhone('');
                            setAddonDrone(false);
                            setAddonAlbum(false);
                            setAddonPreWedding(false);
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

    </div>

    {/* Custom Package Enquiry Modal */}
    <EnquiryModal
      isOpen={enquiryOpen}
      onClose={() => setEnquiryOpen(false)}
      brand="Photography"
      itemTitle={enquiryPackage || 'Custom Photography Package'}
      prefillEventType="Photography Session"
      prefillPackage={enquiryPackage}
      isDarkMode={isDarkMode}
    />
  </>
  );
}

