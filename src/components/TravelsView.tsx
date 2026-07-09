/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Car, Compass, MapPin, Calendar, Users, Briefcase, 
  Clock, Sparkles, ArrowRight, CheckCircle2, ShieldCheck, 
  Map, Milestone, Phone, Heart, Info, Check, Send, X
} from 'lucide-react';
import { ThemeSettings } from '../types';
import { addBooking, getTravelsVehicles, getTravelsTours } from '../utils/storage';
import EmailCopySection from './EmailCopySection';

interface TravelsViewProps {
  isDarkMode: boolean;
  themeSettings?: ThemeSettings;
}

interface Vehicle {
  id: string;
  name: string;
  category: 'wedding' | 'premium' | 'vans';
  image: string;
  price: string;
  passengers: number;
  luggage: number;
  engine: string;
  features: string[];
}

interface TourPackage {
  id: string;
  title: string;
  duration: string;
  image: string;
  price: string;
  highlights: string[];
  itinerary: { day: number; title: string; desc: string }[];
}

export default function TravelsView({ isDarkMode, themeSettings }: TravelsViewProps) {
  const brandName = themeSettings?.brandName || 'Mahdev Pvt Ltd';
  const brandShort = themeSettings?.brandName ? themeSettings.brandName.split(' ')[0] : 'Mahdev';

  // Active Category Filter for Fleet
  const [activeFleetTab, setActiveFleetTab] = useState<'all' | 'wedding' | 'premium' | 'vans'>('all');
  
  // Selected Tour Package for detailed Modal
  const [selectedTour, setSelectedTour] = useState<TourPackage | null>(null);

  // Booking Form State
  const [bookingForm, setBookingForm] = useState({
    name: '',
    phone: '',
    email: '',
    type: 'vehicle_rental', // 'vehicle_rental' | 'tour_package'
    selectedItem: '', // vehicle name or tour title
    startDate: '',
    endDate: '',
    passengers: 1,
    pickupLocation: '',
    dropoffLocation: '',
    additionalNotes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBooked, setIsBooked] = useState(false);

  const fleetList: Vehicle[] = getTravelsVehicles() as any;

  const toursList: TourPackage[] = getTravelsTours() as any;

  const filteredFleet = activeFleetTab === 'all' 
    ? fleetList 
    : fleetList.filter(v => v.category === activeFleetTab);

  const handleBookClick = (name: string, isTour: boolean = false) => {
    setBookingForm(prev => ({
      ...prev,
      type: isTour ? 'tour_package' : 'vehicle_rental',
      selectedItem: name
    }));
    
    // Smooth scroll to booking section
    const element = document.getElementById('travel-booking-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingForm.name || !bookingForm.phone || !bookingForm.email || !bookingForm.selectedItem) {
      alert('Please fill out all required fields marked with *');
      return;
    }

    setIsSubmitting(true);
    
    // Calculate estimate amount for CRM revenue tracking
    let estAmount = 25000;
    if (bookingForm.type === 'tour_package') {
      const tour = toursList.find(t => t.title === bookingForm.selectedItem);
      if (tour) {
        const numPrice = parseInt(tour.price.replace(/[^0-9]/g, '')) || 145000;
        estAmount = numPrice * Number(bookingForm.passengers || 1);
      }
    } else {
      const vehicle = fleetList.find(v => v.name === bookingForm.selectedItem);
      if (vehicle) {
        const numPrice = parseInt(vehicle.price.replace(/[^0-9]/g, '')) || 25000;
        let days = 1;
        if (bookingForm.startDate && bookingForm.endDate) {
          const start = new Date(bookingForm.startDate);
          const end = new Date(bookingForm.endDate);
          const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
          if (diff > 0) days = diff;
        }
        estAmount = numPrice * days;
      }
    }

    // Save to centralized local storage booking list
    addBooking({
      brand: 'Travels',
      name: bookingForm.name,
      phone: bookingForm.phone,
      email: bookingForm.email,
      serviceType: `${bookingForm.type === 'tour_package' ? 'Tour' : 'Rental'}: ${bookingForm.selectedItem}`,
      eventDate: bookingForm.startDate || new Date().toISOString().split('T')[0],
      endDate: bookingForm.endDate || undefined,
      guests: Number(bookingForm.passengers) || 1,
      location: bookingForm.pickupLocation ? `${bookingForm.pickupLocation} to ${bookingForm.dropoffLocation || 'Dropoff'}` : undefined,
      notes: bookingForm.additionalNotes,
      amount: estAmount
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setIsBooked(true);
    }, 1500);
  };

  return (
    <div id="travels-view-container" className="relative w-full z-10">
      
      {/* Hero Banner */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8 border-b border-emerald-500/10 bg-black overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={travelsRobotImage} 
            alt="Travels Background" 
            className="w-full h-full object-cover opacity-20 filter brightness-90 saturate-75 scale-105"
            referrerPolicy="no-referrer"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold tracking-wider uppercase mb-6 animate-pulse">
            <Compass size={12} />
            <span>Mahdev Travels & Tour Operators</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mt-1 mb-6">
            Luxury Chauffeurs & <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Paradise Expeditions</span>
          </h1>
          
          <p className="text-slate-300 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            Experience the resplendent beauty of Sri Lanka in absolute style. We supply a premier fleet of luxury wedding sedans, corporate travel SUVs, executive vans, and highly personalized scenic tours guided by elite chauffeurs.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="#fleet-showcase"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition-all hover:scale-105 shadow-lg shadow-emerald-600/20"
            >
              <span>Explore Premium Fleet</span>
              <Car size={16} />
            </a>
            <a
              href="#tours-showcase"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 font-bold hover:bg-emerald-500/10 transition-all hover:scale-105"
            >
              <span>View Tour Packages</span>
              <Map size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className={`py-8 px-4 sm:px-6 lg:px-8 border-b ${isDarkMode ? 'bg-neutral-900/30 border-emerald-500/5' : 'bg-slate-50 border-slate-100'}`}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4 p-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className={`text-sm font-bold uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Licensed & Insured Fleet</h4>
              <p className="text-xs text-slate-400 mt-0.5">Comprehensive travel covers for high-end delegates & couples.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Users size={24} />
            </div>
            <div>
              <h4 className={`text-sm font-bold uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Elite English Chauffeurs</h4>
              <p className="text-xs text-slate-400 mt-0.5">Professional, trained drivers fluent in hospitality standards.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Clock size={24} />
            </div>
            <div>
              <h4 className={`text-sm font-bold uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>24/7 Roadside Assistance</h4>
              <p className="text-xs text-slate-400 mt-0.5">Continuous GPS tracking and replacement car guarantees.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Fleet Catalog Section */}
      <section id="fleet-showcase" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-500">
              Supreme Travel Fleet
            </span>
            <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight mt-1 mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Browse Luxury Automobiles
            </h2>
            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Immaculately detailed, air-conditioned, and customized vehicles perfect for dream weddings, corporate tours, and airport pick-ups.
            </p>

            {/* Tabs for Filtering Fleet */}
            <div className="flex flex-wrap justify-center gap-2 mt-8 p-1 rounded-2xl border border-emerald-500/10 bg-neutral-900/10 backdrop-blur-md max-w-lg mx-auto">
              {[
                { id: 'all', label: 'All Fleet' },
                { id: 'wedding', label: 'Wedding Luxury' },
                { id: 'premium', label: 'Premium Cabs & SUVs' },
                { id: 'vans', label: 'Vans & Tour Coaches' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFleetTab(tab.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wider transition-all duration-300 ${
                    activeFleetTab === tab.id
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/15'
                      : isDarkMode 
                        ? 'text-slate-400 hover:text-white hover:bg-neutral-900/60' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Fleet Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredFleet.map((vehicle, index) => (
                <motion.div
                  key={vehicle.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className={`rounded-2xl border overflow-hidden flex flex-col justify-between group transition-all duration-300 hover:shadow-xl hover:scale-[1.01] ${
                    isDarkMode 
                      ? 'bg-neutral-900/30 border-emerald-500/10 hover:border-emerald-500/30' 
                      : 'bg-white border-slate-200 shadow-md hover:shadow-lg'
                  }`}
                >
                  <div>
                    {/* Image Area */}
                    <div className="relative h-48 sm:h-52 overflow-hidden bg-neutral-950">
                      <img 
                        src={vehicle.image} 
                        alt={vehicle.name} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-emerald-400 text-[10px] font-mono uppercase font-bold tracking-widest">
                          {vehicle.category === 'wedding' ? '💍 Wedding Special' : vehicle.category === 'premium' ? '✨ Premium Comfort' : '🚌 Group Travel'}
                        </span>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                        <h3 className="text-white font-bold text-lg leading-tight truncate">
                          {vehicle.name}
                        </h3>
                      </div>
                    </div>

                    {/* Features Panel */}
                    <div className="p-6">
                      <div className="flex items-center gap-4 text-xs font-mono text-slate-400 border-b border-emerald-500/10 pb-4 mb-4">
                        <span className="flex items-center gap-1">
                          <Users size={13} className="text-emerald-500" />
                          <span>{vehicle.passengers} Seats</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase size={13} className="text-emerald-500" />
                          <span>{vehicle.luggage} Bags</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Compass size={13} className="text-emerald-500" />
                          <span>A/C Ready</span>
                        </span>
                      </div>

                      <ul className="space-y-2 mb-6">
                        {vehicle.features.map((feat, fIdx) => (
                          <li key={fIdx} className="flex items-start gap-2 text-xs text-slate-300">
                            <span className="p-0.5 rounded bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
                              <Check size={10} />
                            </span>
                            <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className={`p-6 border-t flex items-center justify-between gap-4 ${isDarkMode ? 'border-emerald-500/10 bg-black/20' : 'border-slate-100 bg-slate-50'}`}>
                    <div>
                      <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Starting from</p>
                      <p className="text-emerald-500 font-extrabold text-lg leading-tight font-sans">{vehicle.price}</p>
                    </div>
                    <button
                      onClick={() => handleBookClick(vehicle.name, false)}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all tracking-wider uppercase inline-flex items-center gap-1.5 shadow-md shadow-emerald-600/10"
                    >
                      <span>Book Rent</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Tour Packages Section */}
      <section id="tours-showcase" className={`py-24 px-4 sm:px-6 lg:px-8 border-t border-b ${isDarkMode ? 'bg-neutral-900/20 border-emerald-500/10' : 'bg-slate-50/50 border-slate-100'}`}>
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-500">
              Curated Island Expeditions
            </span>
            <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight mt-1 mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Sri Lanka Tour Masterpieces
            </h2>
            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Fully organized private packages including luxury transport, hand-picked authentic boutique lodging, guided treks, and entrance passes.
            </p>
          </div>

          {/* Tour Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {toursList.map((tour) => (
              <div
                key={tour.id}
                className={`rounded-3xl border overflow-hidden flex flex-col justify-between group transition-all duration-300 hover:scale-[1.01] hover:shadow-xl ${
                  isDarkMode 
                    ? 'bg-neutral-900/40 border-emerald-500/10' 
                    : 'bg-white border-slate-200 shadow-md'
                }`}
              >
                <div>
                  <div className="relative h-56 overflow-hidden bg-neutral-950">
                    <img 
                      src={tour.image} 
                      alt={tour.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-mono font-bold uppercase tracking-wider">
                        {tour.duration}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white font-extrabold text-xl leading-tight">
                        {tour.title}
                      </h3>
                    </div>
                  </div>

                  <div className="p-6">
                    <p className="text-[11px] font-mono text-emerald-400 uppercase tracking-widest mb-3 font-semibold">Tour Highlights</p>
                    <ul className="space-y-2.5 mb-6">
                      {tour.highlights.map((high, hIdx) => (
                        <li key={hIdx} className="flex items-start gap-2 text-xs">
                          <span className="p-0.5 rounded-full bg-emerald-500/15 text-emerald-400 shrink-0 mt-0.5">
                            <CheckCircle2 size={12} />
                          </span>
                          <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>{high}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className={`p-6 border-t flex flex-col gap-4 ${isDarkMode ? 'border-emerald-500/10 bg-black/10' : 'border-slate-100 bg-slate-50'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono uppercase">Full Private Tour</span>
                      <p className="text-emerald-500 font-extrabold text-lg leading-none">{tour.price}</p>
                    </div>
                    <button
                      onClick={() => setSelectedTour(tour)}
                      className="text-xs font-bold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 underline font-mono"
                    >
                      <Info size={13} />
                      <span>See Itinerary</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handleBookClick(tour.title, true)}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs tracking-wider uppercase transition-all duration-200 shadow-md shadow-emerald-600/10"
                  >
                    Select This Package
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Form Section */}
      <section id="travel-booking-section" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Initialize Tour Booking or Car Hire
            </h2>
            <p className="text-xs text-slate-400 mt-1.5">
              Submit details below and our travels manager will dispatch the custom confirmation quote within 1 hour.
            </p>
          </div>

          <div className={`p-8 rounded-3xl border relative overflow-hidden ${
            isDarkMode ? 'bg-neutral-900/40 border-emerald-500/10' : 'bg-white border-slate-200 shadow-xl'
          }`}>
            <div className="absolute -right-24 -top-24 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

            {isBooked ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 space-y-6"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/5">
                  <CheckCircle2 size={32} className="animate-bounce" />
                </div>
                <div className="space-y-2">
                  <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Booking Request Saved!</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    We have saved your details for <strong className="text-emerald-400">{bookingForm.selectedItem}</strong>. To complete the confirmation and finalize pricing, please send a copy of your request below:
                  </p>
                </div>

                <EmailCopySection
                  isDarkMode={isDarkMode}
                  name={bookingForm.name}
                  email={bookingForm.email}
                  phone={bookingForm.phone}
                  brand="Mahdev Travels"
                  serviceType={`${bookingForm.type === 'tour_package' ? 'Tour' : 'Rental'}: ${bookingForm.selectedItem}`}
                  eventDate={bookingForm.startDate}
                  endDate={bookingForm.endDate}
                  location={bookingForm.pickupLocation ? `${bookingForm.pickupLocation} to ${bookingForm.dropoffLocation}` : undefined}
                  guests={bookingForm.passengers}
                  notes={bookingForm.additionalNotes}
                  onDone={() => {
                    setIsBooked(false);
                    setBookingForm({
                      name: '',
                      phone: '',
                      email: '',
                      type: 'vehicle_rental',
                      selectedItem: '',
                      startDate: '',
                      endDate: '',
                      passengers: 1,
                      pickupLocation: '',
                      dropoffLocation: '',
                      additionalNotes: ''
                    });
                  }}
                />
              </motion.div>
            ) : (
              <form onSubmit={handleSubmitBooking} className="space-y-6">
                
                {/* Mode Selector */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setBookingForm(prev => ({ ...prev, type: 'vehicle_rental', selectedItem: '' }))}
                    className={`p-4 rounded-xl border text-center transition-all ${
                      bookingForm.type === 'vehicle_rental'
                        ? 'border-emerald-500 bg-emerald-500/10 text-white font-semibold'
                        : isDarkMode
                          ? 'border-emerald-500/5 bg-neutral-950/40 text-slate-400 hover:bg-emerald-500/5'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Car className="mx-auto mb-2 text-emerald-400" size={20} />
                    <span className="text-xs font-bold uppercase tracking-wider block">Luxury Car Hire</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookingForm(prev => ({ ...prev, type: 'tour_package', selectedItem: '' }))}
                    className={`p-4 rounded-xl border text-center transition-all ${
                      bookingForm.type === 'tour_package'
                        ? 'border-emerald-500 bg-emerald-500/10 text-white font-semibold'
                        : isDarkMode
                          ? 'border-emerald-500/5 bg-neutral-950/40 text-slate-400 hover:bg-emerald-500/5'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Compass className="mx-auto mb-2 text-emerald-400" size={20} />
                    <span className="text-xs font-bold uppercase tracking-wider block">Scenic Tour Package</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Select Vehicle / Tour */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-mono font-bold uppercase tracking-widest text-slate-400 mb-2">
                      Select Vehicle or Tour Package *
                    </label>
                    <select
                      required
                      value={bookingForm.selectedItem}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, selectedItem: e.target.value }))}
                      className={`w-full px-4 py-3 text-sm rounded-xl border focus:outline-none focus:border-emerald-500 ${
                        isDarkMode ? 'bg-neutral-950 border-emerald-500/10 text-white' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <option value="">-- Click to choose option --</option>
                      {bookingForm.type === 'vehicle_rental' ? (
                        fleetList.map(v => (
                          <option key={v.id} value={v.name}>{v.name} ({v.price})</option>
                        ))
                      ) : (
                        toursList.map(t => (
                          <option key={t.id} value={t.title}>{t.title} ({t.price})</option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* Personal details */}
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-widest text-slate-400 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={bookingForm.name}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, name: e.target.value }))}
                      className={`w-full px-4 py-3 text-sm rounded-xl border focus:outline-none focus:border-emerald-500 ${
                        isDarkMode ? 'bg-neutral-950 border-emerald-500/10 text-white' : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-widest text-slate-400 mb-2">
                      Phone Number (WhatsApp) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +94 76 898 8970"
                      value={bookingForm.phone}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, phone: e.target.value }))}
                      className={`w-full px-4 py-3 text-sm rounded-xl border focus:outline-none focus:border-emerald-500 ${
                        isDarkMode ? 'bg-neutral-950 border-emerald-500/10 text-white' : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-widest text-slate-400 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. customer@example.com"
                      value={bookingForm.email}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, email: e.target.value }))}
                      className={`w-full px-4 py-3 text-sm rounded-xl border focus:outline-none focus:border-emerald-500 ${
                        isDarkMode ? 'bg-neutral-950 border-emerald-500/10 text-white' : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-widest text-slate-400 mb-2">
                      Total Passengers *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={45}
                      value={bookingForm.passengers}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, passengers: parseInt(e.target.value) || 1 }))}
                      className={`w-full px-4 py-3 text-sm rounded-xl border focus:outline-none focus:border-emerald-500 ${
                        isDarkMode ? 'bg-neutral-950 border-emerald-500/10 text-white' : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                  </div>

                  {/* Dates */}
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-widest text-slate-400 mb-2">
                      Start Date *
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        required
                        value={bookingForm.startDate}
                        onChange={(e) => setBookingForm(prev => ({ ...prev, startDate: e.target.value }))}
                        className={`w-full px-4 py-3 text-sm rounded-xl border focus:outline-none focus:border-emerald-500 ${
                          isDarkMode ? 'bg-neutral-950 border-emerald-500/10 text-white' : 'bg-slate-50 border-slate-200'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-widest text-slate-400 mb-2">
                      End Date *
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        required
                        value={bookingForm.endDate}
                        onChange={(e) => setBookingForm(prev => ({ ...prev, endDate: e.target.value }))}
                        className={`w-full px-4 py-3 text-sm rounded-xl border focus:outline-none focus:border-emerald-500 ${
                          isDarkMode ? 'bg-neutral-950 border-emerald-500/10 text-white' : 'bg-slate-50 border-slate-200'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Locations */}
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-widest text-slate-400 mb-2">
                      Pickup Address / Airport Terminal
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bandaranaike Intl Airport or Hotel Colombo"
                      value={bookingForm.pickupLocation}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, pickupLocation: e.target.value }))}
                      className={`w-full px-4 py-3 text-sm rounded-xl border focus:outline-none focus:border-emerald-500 ${
                        isDarkMode ? 'bg-neutral-950 border-emerald-500/10 text-white' : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-widest text-slate-400 mb-2">
                      Dropoff Address / Hotel Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Galle Face Hotel or Kandy Residence"
                      value={bookingForm.dropoffLocation}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, dropoffLocation: e.target.value }))}
                      className={`w-full px-4 py-3 text-sm rounded-xl border focus:outline-none focus:border-emerald-500 ${
                        isDarkMode ? 'bg-neutral-950 border-emerald-500/10 text-white' : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                  </div>

                  {/* Additional notes */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-mono font-bold uppercase tracking-widest text-slate-400 mb-2">
                      Special Requests / Custom Route Directions / Flight Details
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Specify custom decor ribbon colors, extra stopovers, or special child booster seats requests..."
                      value={bookingForm.additionalNotes}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, additionalNotes: e.target.value }))}
                      className={`w-full px-4 py-3 text-sm rounded-xl border focus:outline-none focus:border-emerald-500 ${
                        isDarkMode ? 'bg-neutral-950 border-emerald-500/10 text-white' : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                  </div>
                </div>

                <div className="border-t border-emerald-500/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    <span>Secure booking transmission under GDPR.</span>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Reserving Slot...</span>
                      </>
                    ) : (
                      <>
                        <Send size={13} />
                        <span>Submit Booking Request</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Tour Itinerary Details Modal */}
      <AnimatePresence>
        {selectedTour && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className={`relative max-w-2xl w-full max-h-[85vh] overflow-y-auto rounded-3xl p-6 sm:p-8 border shadow-2xl overflow-hidden ${
                isDarkMode 
                  ? 'bg-gradient-to-b from-neutral-900 via-neutral-950 to-black border-emerald-500/25 text-white' 
                  : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              {/* Top Accent Gradient Bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"></div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedTour(null)}
                className={`absolute top-6 right-6 p-2 rounded-xl border transition-all ${
                  isDarkMode 
                    ? 'border-neutral-800 hover:bg-neutral-800 text-slate-400 hover:text-white' 
                    : 'border-slate-100 hover:bg-slate-100 text-slate-500 hover:text-slate-900'
                }`}
              >
                <X size={16} />
              </button>

              <div className="space-y-6 pt-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400">
                      Detailed Tour Itinerary
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-1.5">
                    {selectedTour.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono mt-1">Total Duration: {selectedTour.duration}</p>
                </div>

                <div className="space-y-4">
                  {selectedTour.itinerary.map((dayPlan) => (
                    <div key={dayPlan.day} className="flex gap-4 items-start bg-neutral-950/40 p-4 rounded-2xl border border-emerald-500/5">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-bold shrink-0 shadow-sm shadow-emerald-950/20">
                        Day {dayPlan.day}
                      </div>
                      <div className="space-y-1 mt-1">
                        <h4 className="text-sm font-bold tracking-tight text-white">
                          {dayPlan.title}
                        </h4>
                        <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} leading-relaxed`}>
                          {dayPlan.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-5 border-t border-emerald-500/15 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="text-left">
                    <span className="text-[10px] text-slate-500 font-mono block uppercase tracking-wider">Complete Package Value</span>
                    <strong className="text-emerald-400 text-xl font-mono">{selectedTour.price}</strong>
                  </div>
                  <button
                    onClick={() => {
                      const title = selectedTour.title;
                      setSelectedTour(null);
                      handleBookClick(title, true);
                    }}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-lg shadow-emerald-950/20 hover:shadow-emerald-500/40 hover:scale-[1.02]"
                  >
                    Select This Package
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
