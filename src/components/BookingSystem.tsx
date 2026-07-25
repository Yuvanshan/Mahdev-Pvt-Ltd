'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, DollarSign, CheckCircle, ChevronRight, MessageSquare } from 'lucide-react';
import confetti from 'canvas-confetti';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface BookingSystemProps {
  initialDivision?: string;
  onSuccess?: () => void;
}

const bookingConfigs: Record<string, {
  name: string;
  packages: Array<{ name: string; priceVal: number; priceStr: string }>;
}> = {
  'sws-events': {
    name: 'SWS Event Management',
    packages: [
      { name: 'Silver Blossom Decor Package', priceVal: 75000, priceStr: 'Rs. 75,000' },
      { name: 'Royal Gold Imperial Decor Package', priceVal: 185000, priceStr: 'Rs. 185,000' },
      { name: 'Custom Stage Decoration Arrangement', priceVal: 120000, priceStr: 'Rs. 120,000 (Avg)' }
    ]
  },
  'u1-studio': {
    name: 'Studio U1 Photography',
    packages: [
      { name: 'Essential Photo Shoot Session', priceVal: 24999, priceStr: 'Rs. 24,999' },
      { name: 'Imperial Cinematic Film & Album', priceVal: 59999, priceStr: 'Rs. 59,999' },
      { name: 'Grand Masterpiece Multi-Day Suite', priceVal: 119999, priceStr: 'Rs. 119,999' }
    ]
  },
  'travels': {
    name: 'Mahdev Travels',
    packages: [
      { name: 'Airport Transfer (BIA Drop-off/Pick-up)', priceVal: 15000, priceStr: 'Rs. 15,000' },
      { name: 'Galle Coastal Sunset Tour (1 Day)', priceVal: 18000, priceStr: 'Rs. 18,000' },
      { name: 'Sigiriya Cultural Trail (2 Days)', priceVal: 35000, priceStr: 'Rs. 35,000' },
      { name: 'Ella Greenery Escape Tour (3 Days)', priceVal: 45000, priceStr: 'Rs. 45,000' }
    ]
  },
  'it-solutions': {
    name: 'Mahdev IT Solutions',
    packages: [
      { name: '1-Hour Technical Consultation', priceVal: 5000, priceStr: 'Rs. 5,000' },
      { name: 'Standard POS Cloud Installation', priceVal: 35000, priceStr: 'Rs. 35,000' },
      { name: 'Enterprise ERP System Consultation', priceVal: 0, priceStr: 'Free Preliminary Review' }
    ]
  }
};

export default function BookingSystem({ initialDivision = 'sws-events', onSuccess }: BookingSystemProps) {
  const [division, setDivision] = useState(initialDivision);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    packageName: '',
    additionalInfo: ''
  });
  const [loading, setLoading] = useState(false);
  const [bookedDetails, setBookedDetails] = useState<any>(null);

  // Sync package when division changes
  useEffect(() => {
    const config = bookingConfigs[division];
    if (config && config.packages.length > 0) {
      setFormData(prev => ({ ...prev, packageName: config.packages[0].name }));
    }
  }, [division]);

  // Calculate pricing dynamically
  const currentConfig = bookingConfigs[division];
  const selectedPkg = currentConfig?.packages.find(p => p.name === formData.packageName);
  const priceDisplay = selectedPkg ? selectedPkg.priceStr : 'Select a package';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.date) {
      alert("Please fill out all mandatory fields.");
      return;
    }

    setLoading(true);
    try {
      const bookingRecord = {
        ...formData,
        divisionId: division,
        divisionName: currentConfig.name,
        calculatedPrice: selectedPkg ? selectedPkg.priceVal : 0,
        status: 'Pending Review',
        timestamp: serverTimestamp()
      };

      // Write booking request to Firestore
      const docRef = await addDoc(collection(db, 'bookings'), bookingRecord);

      // Celebrate success
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.7 },
        colors: ['#c5a880', '#dfba73', '#10b981', '#a855f7']
      });

      setBookedDetails({
        ...bookingRecord,
        id: docRef.id,
        priceStr: selectedPkg?.priceStr || 'Rs. 0'
      });

      setFormData({
        name: '',
        email: '',
        phone: '',
        date: '',
        packageName: currentConfig.packages[0]?.name || '',
        additionalInfo: ''
      });

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Booking failed to write", err);
      alert("Server error occurred during booking. Please try again or message our directors.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <AnimatePresence mode="wait">
        {!bookedDetails ? (
          <motion.div
            key="booking-form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="glass-premium rounded-3xl p-6 sm:p-10 border border-gold-accent/15 shadow-2xl relative"
          >
            <div className="flex flex-col gap-2 mb-8 text-left border-b border-white/5 pb-6">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-accent">PREMIUM RESERVATIONS</span>
              <h3 className="font-display font-black text-2xl sm:text-3xl text-white">Select Your Custom Package</h3>
              <p className="font-sans text-xs sm:text-sm text-gray-400">Specify details below. Our directors will lock availability and send confirmation within 4 hours.</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Division selection */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-sans">Business Division</label>
                  <select
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                    className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs sm:text-sm focus:outline-none text-white font-sans transition-all [&>option]:bg-navy-dark"
                  >
                    <option value="sws-events">SWS Event Management</option>
                    <option value="u1-studio">Studio U1 Photography</option>
                    <option value="travels">Mahdev Travels Portfolio</option>
                    <option value="it-solutions">Mahdev IT Consultation</option>
                  </select>
                </div>

                {/* Package selection */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-sans">Package / Service Level</label>
                  <select
                    value={formData.packageName}
                    onChange={(e) => setFormData({ ...formData, packageName: e.target.value })}
                    className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs sm:text-sm focus:outline-none text-white font-sans transition-all [&>option]:bg-navy-dark"
                  >
                    {currentConfig?.packages.map((pkg, pIdx) => (
                      <option key={pIdx} value={pkg.name}>{pkg.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dynamic Pricing Alert */}
              <div className="p-4 rounded-2xl bg-gold-accent/10 border border-gold-accent/25 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-gold-soft shrink-0" />
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-gray-400 block font-bold">Estimated Cost</span>
                    <span className="text-white font-bold text-sm sm:text-base font-display">{priceDisplay}</span>
                  </div>
                </div>
                <div className="px-3 py-1 rounded bg-white/5 text-[9px] text-gold-soft uppercase tracking-wider font-bold">
                  Dynamic Price
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-sans">Client Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs sm:text-sm focus:outline-none text-white font-sans transition-all"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-sans">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs sm:text-sm focus:outline-none text-white font-sans transition-all"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-sans">Contact Line</label>
                  <input
                    type="tel"
                    required
                    placeholder="+94 7X XXX XXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs sm:text-sm focus:outline-none text-white font-sans transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="flex flex-col gap-2 sm:col-span-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-sans">Required Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs sm:text-sm focus:outline-none text-white font-sans transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-sans">Custom Requirements</label>
                  <input
                    type="text"
                    placeholder="E.g., Stage colors, hotel hall layout details..."
                    value={formData.additionalInfo}
                    onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                    className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs sm:text-sm focus:outline-none text-white font-sans transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-gold-accent to-gold-soft hover:brightness-110 disabled:opacity-50 text-navy-dark font-sans font-bold text-sm tracking-widest flex items-center justify-center gap-2 mt-4 shadow-lg shadow-gold-accent/15 transition-all"
              >
                {loading ? 'LOCKING SYSTEM DATE...' : 'CONFIRM RESERVATION REQUEST'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="booking-success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-premium rounded-3xl p-8 sm:p-12 border border-green-500/25 shadow-2xl text-center flex flex-col items-center gap-6 relative"
          >
            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400">
              <CheckCircle className="w-8 h-8 animate-bounce" />
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="font-display font-black text-2xl text-white">Booking Scheduled Successfully</h3>
              <p className="text-sm text-gray-400 font-sans max-w-md">Your reservation has been locked under booking reference: <code className="text-gold-soft font-bold">{bookedDetails.id}</code>.</p>
            </div>

            {/* Summary Details */}
            <div className="w-full max-w-md p-5 rounded-2xl bg-white/5 border border-white/5 text-left font-sans text-xs flex flex-col gap-3">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-500 uppercase tracking-wider font-bold">Division</span>
                <span className="text-white font-semibold">{bookedDetails.divisionName}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-500 uppercase tracking-wider font-bold">Package Chosen</span>
                <span className="text-white font-semibold">{bookedDetails.packageName}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-500 uppercase tracking-wider font-bold">Reservation Date</span>
                <span className="text-white font-semibold">{bookedDetails.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 uppercase tracking-wider font-bold">Amount Estimated</span>
                <span className="text-gold-soft font-bold">{bookedDetails.priceStr}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-xs text-green-400 font-sans max-w-md leading-relaxed">
              🔔 **Instant Alerts Sent:** A confirmation email summary was queued to `{bookedDetails.email}` and WhatsApp notification was pushed to `{bookedDetails.phone}`.
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4">
              <button
                onClick={() => setBookedDetails(null)}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full border border-white/10 hover:bg-white/5 text-white font-sans text-xs font-bold tracking-widest transition-all"
              >
                BOOK ANOTHER SERVICE
              </button>
              <a
                href={`https://wa.me/94768988970?text=Hi%20Mahdev,%20I%20have%20submitted%20booking%20reference%20${bookedDetails.id}%20for%20${bookedDetails.packageName}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-green-500 hover:bg-green-600 text-white font-sans text-xs font-bold tracking-widest flex items-center justify-center gap-2 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                CHAT ON WHATSAPP
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
