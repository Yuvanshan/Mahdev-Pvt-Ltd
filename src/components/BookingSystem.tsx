'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  User, 
  DollarSign, 
  CheckCircle, 
  ChevronRight, 
  ChevronLeft, 
  MessageSquare,
  Sparkles,
  Camera,
  Compass,
  Cpu,
  Bookmark
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface BookingSystemProps {
  initialDivision?: string;
  onSuccess?: () => void;
}

const bookingConfigs: Record<string, {
  name: string;
  icon: any;
  packages: Array<{ name: string; priceVal: number; priceStr: string; desc: string }>;
}> = {
  'sws-events': {
    name: 'SWS Event Management',
    icon: Sparkles,
    packages: [
      { name: 'Silver Blossom Decor Package', priceVal: 75000, priceStr: 'Rs. 75,000', desc: 'Main stage backdrop (24ft), pathways, uplighting, bride settee.' },
      { name: 'Royal Gold Imperial Decor Package', priceVal: 185000, priceStr: 'Rs. 185,000', desc: 'Glasshouse stage arches, fairylights (50ft), smoke effect, premium florals.' },
      { name: 'Custom Stage Decoration Arrangement', priceVal: 120000, priceStr: 'Rs. 120,000 (Avg)', desc: 'Tailored stage set designs matching specific themes & hotel sizes.' }
    ]
  },
  'u1-studio': {
    name: 'Studio U1 Photography',
    icon: Camera,
    packages: [
      { name: 'Essential Photo Shoot Session', priceVal: 24999, priceStr: 'Rs. 24,999', desc: '1 Photographer, 150+ digital copies, edited UHD colors, 1-day.' },
      { name: 'Imperial Cinematic Film & Album', priceVal: 59999, priceStr: 'Rs. 59,999', desc: '2 Photographers, 1 Videographer, Drone runs, 40-page hardcover photobook.' },
      { name: 'Grand Masterpiece Multi-Day Suite', priceVal: 119999, priceStr: 'Rs. 119,999', desc: '3 Photographers, 2 Videographers, full drone runs, live view cloud portal.' }
    ]
  },
  'travels': {
    name: 'Mahdev Travels',
    icon: Compass,
    packages: [
      { name: 'Airport Transfer (BIA Drop-off/Pick-up)', priceVal: 15000, priceStr: 'Rs. 15,000', desc: 'VIP sedan/van airport transfer with formal chauffeur.' },
      { name: 'Galle Coastal Sunset Tour (1 Day)', priceVal: 18000, priceStr: 'Rs. 18,000', desc: 'Coastal highways, Galle Fort walk, sea turtle hatchery, 1 day.' },
      { name: 'Sigiriya Cultural Trail (2 Days)', priceVal: 35000, priceStr: 'Rs. 35,000', desc: 'Lion rock climb, Dambulla cave temple, overnight stay, 2 days.' },
      { name: 'Ella Greenery Escape Tour (3 Days)', priceVal: 45000, priceStr: 'Rs. 45,000', desc: 'Nine Arch bridge, tea estates, Ella rock hiking, 3 days.' }
    ]
  },
  'it-solutions': {
    name: 'Mahdev IT Solutions',
    icon: Cpu,
    packages: [
      { name: '1-Hour Technical Consultation', priceVal: 5000, priceStr: 'Rs. 5,000', desc: 'System requirements audit, database design proposal.' },
      { name: 'Standard POS Cloud Installation', priceVal: 35000, priceStr: 'Rs. 35,000', desc: 'Inventory ledgers, offline terminal printing, cloud sync setup.' },
      { name: 'Enterprise ERP System Consultation', priceVal: 0, priceStr: 'Free Preliminary Review', desc: 'Double-entry ledger & multi-warehouse planning consultation.' }
    ]
  }
};

export default function BookingSystem({ initialDivision = 'sws-events', onSuccess }: BookingSystemProps) {
  const [step, setStep] = useState(1);
  const [division, setDivision] = useState(initialDivision);
  
  const [formData, setFormData] = useState({
    packageName: '',
    date: '',
    location: '',
    name: '',
    email: '',
    phone: '',
    specialRequests: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [bookedDetails, setBookedDetails] = useState<any>(null);

  // Auto-fill initial package when division changes
  useEffect(() => {
    const config = bookingConfigs[division];
    if (config && config.packages.length > 0) {
      setFormData(prev => ({ ...prev, packageName: config.packages[0].name }));
    }
  }, [division]);

  const currentConfig = bookingConfigs[division];
  const selectedPkg = currentConfig?.packages.find(p => p.name === formData.packageName);
  const priceDisplay = selectedPkg ? selectedPkg.priceStr : 'Rs. 0';

  const nextStep = () => {
    if (step === 1 && !division) return;
    if (step === 2 && !formData.packageName) return;
    if (step === 3 && (!formData.date || !formData.location)) {
      alert('Please fill in both Date and Event Location.');
      return;
    }
    if (step === 4 && (!formData.name || !formData.email || !formData.phone)) {
      alert('Please fill in Name, Email, and Phone number.');
      return;
    }
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const bookingRecord = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        date: formData.date,
        location: formData.location,
        packageName: formData.packageName,
        specialRequests: formData.specialRequests,
        divisionId: division,
        divisionName: currentConfig.name,
        calculatedPrice: selectedPkg ? selectedPkg.priceVal : 0,
        status: 'Pending Review',
        timestamp: serverTimestamp()
      };

      // Write to Firestore
      const docRef = await addDoc(collection(db, 'bookings'), bookingRecord);

      // Dispatch automatic reservation email alert to admin and user
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            date: formData.date,
            location: formData.location,
            packageName: formData.packageName,
            specialRequests: formData.specialRequests,
            divisionName: currentConfig.name,
            calculatedPrice: selectedPkg ? selectedPkg.priceVal : 0,
            type: 'booking'
          })
        });
      } catch (mailErr) {
        console.warn("Mail dispatch failed, record saved to Firestore successfully:", mailErr);
      }

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

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      alert('Error occurred during booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const stepsList = ['Service', 'Package', 'Schedule', 'Contact', 'Review'];

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {!bookedDetails ? (
          <motion.div
            key="booking-flow-card"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-navy-dark rounded-xl p-6 sm:p-10 border border-card-border shadow-lg relative"
          >
            {/* Step Progress Header */}
            <div className="mb-8 text-left">
              <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-[0.2em] text-gold-soft mb-3">
                <span>PREMIUM RESERVATIONS</span>
                <span>STEP {step} OF 5</span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full h-1 bg-navy-medium rounded-lg overflow-hidden flex gap-0.5">
                {stepsList.map((_, idx) => (
                  <div 
                    key={idx}
                    className={`h-full flex-1 transition-all duration-500 ${
                      idx + 1 <= step ? 'bg-gold-soft' : 'bg-navy-medium'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* WIZARD STEPS */}
            <div className="min-h-[240px]">
              
              {/* Step 1: Select Service */}
              {step === 1 && (
                <motion.div 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-col gap-5 text-left"
                >
                  <h3 className="font-display font-bold text-xl sm:text-2xl text-text-heading">Select Service Division</h3>
                  <p className="text-text-body text-xs sm:text-sm">Choose the operational branch under which you would like to book your premium service.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                    {Object.entries(bookingConfigs).map(([key, config]) => {
                      const Icon = config.icon;
                      const isSelected = division === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setDivision(key)}
                          className={`p-5 rounded-lg border text-left flex gap-4 items-start transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-navy-medium border-gold-soft text-text-heading shadow-md' 
                              : 'bg-navy-medium border-card-border hover:border-gold-soft/30 text-text-body'
                          }`}
                        >
                          <div className={`p-2 rounded-md shrink-0 ${isSelected ? 'bg-gold-soft/10 text-gold-soft' : 'bg-navy-medium border border-card-border text-text-body/60'}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-display font-bold text-sm">{config.name}</h4>
                            <p className="text-[10px] text-text-body/80 mt-1 leading-relaxed">Book elite event designs, photography, travels, or software packages.</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Choose Package */}
              {step === 2 && (
                <motion.div 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-col gap-5 text-left"
                >
                  <h3 className="font-display font-bold text-xl sm:text-2xl text-text-heading">Choose Your Package</h3>
                  <p className="text-text-body text-xs sm:text-sm">Select the service tier level. Pricing will adjust dynamically in the review stage.</p>
                  
                  <div className="flex flex-col gap-4 mt-2">
                    {currentConfig?.packages.map((pkg, idx) => {
                      const isSelected = formData.packageName === pkg.name;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setFormData({ ...formData, packageName: pkg.name })}
                          className={`p-5 rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-navy-medium border-gold-soft text-text-heading' 
                              : 'bg-navy-medium border-card-border hover:border-gold-soft/30 text-text-body'
                          }`}
                        >
                          <div className="flex flex-col gap-1 max-w-[70%]">
                            <h4 className="font-display font-bold text-sm sm:text-base">{pkg.name}</h4>
                            <p className="text-[10px] text-text-body/80 leading-relaxed">{pkg.desc}</p>
                          </div>
                          <span className="font-display font-bold text-xs sm:text-sm text-gold-soft text-right shrink-0">{pkg.priceStr}</span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Step 3: Pick Date & Location */}
              {step === 3 && (
                <motion.div 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-col gap-5 text-left"
                >
                  <h3 className="font-display font-bold text-xl sm:text-2xl text-text-heading">Schedule details</h3>
                  <p className="text-text-body text-xs sm:text-sm">Specify the date and location where the setup or service is required.</p>
                  
                  <div className="grid grid-cols-1 gap-5 mt-2">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-text-body/60 uppercase tracking-widest font-sans">Required Date</label>
                      <div className="relative">
                        <CalendarIcon className="absolute left-4 top-3.5 w-4 h-4 text-text-body/60" />
                        <input
                          type="date"
                          required
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          className="w-full bg-navy-medium border border-card-border focus:border-gold-soft/50 rounded-lg pl-11 pr-4 py-3 text-xs sm:text-sm focus:outline-none text-text-heading font-sans transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-text-body/60 uppercase tracking-widest font-sans">Event Location / Venue</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-3.5 w-4 h-4 text-text-body/60" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. Cinnamon Grand Colombo, Galle, BIA Airport"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          className="w-full bg-navy-medium border border-card-border focus:border-gold-soft/50 rounded-lg pl-11 pr-4 py-3 text-xs sm:text-sm focus:outline-none text-text-heading font-sans transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Contact & Requests */}
              {step === 4 && (
                <motion.div 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-col gap-5 text-left"
                >
                  <h3 className="font-display font-bold text-xl sm:text-2xl text-text-heading">Client details</h3>
                  <p className="text-text-body text-xs sm:text-sm">Provide your communication details. Confirmation alerts will be sent here.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                    <div className="flex flex-col gap-2 sm:col-span-3">
                      <label className="text-[10px] font-bold text-text-body/60 uppercase tracking-widest font-sans">Your Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="bg-navy-medium border border-card-border focus:border-gold-soft/50 rounded-lg px-4 py-3 text-xs sm:text-sm focus:outline-none text-text-heading font-sans transition-all"
                      />
                    </div>

                    <div className="flex flex-col gap-2 sm:col-span-2">
                      <label className="text-[10px] font-bold text-text-body/60 uppercase tracking-widest font-sans">Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="bg-navy-medium border border-card-border focus:border-gold-soft/50 rounded-lg px-4 py-3 text-xs sm:text-sm focus:outline-none text-text-heading font-sans transition-all"
                      />
                    </div>

                    <div className="flex flex-col gap-2 sm:col-span-1">
                      <label className="text-[10px] font-bold text-text-body/60 uppercase tracking-widest font-sans">Phone Number</label>
                      <input
                        type="tel"
                        required
                        placeholder="+94 7XXXXXXXX"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="bg-navy-medium border border-card-border focus:border-gold-soft/50 rounded-lg px-4 py-3 text-xs sm:text-sm focus:outline-none text-text-heading font-sans transition-all"
                      />
                    </div>

                    <div className="flex flex-col gap-2 sm:col-span-3">
                      <label className="text-[10px] font-bold text-text-body/60 uppercase tracking-widest font-sans">Special Requests / Themes</label>
                      <textarea
                        rows={2}
                        placeholder="E.g., Pastel pink rose themes, drone requirements, AC sedan details..."
                        value={formData.specialRequests}
                        onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                        className="bg-navy-medium border border-card-border focus:border-gold-soft/50 rounded-lg px-4 py-3 text-xs sm:text-sm focus:outline-none text-text-heading font-sans transition-all resize-none"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 5: Review & Price Calculation */}
              {step === 5 && (
                <motion.div 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-col gap-5 text-left"
                >
                  <h3 className="font-display font-bold text-xl sm:text-2xl text-text-heading">Review Reservation</h3>
                  <p className="text-text-body text-xs sm:text-sm">Verify chosen values. Our executives will approve booking details on confirmation.</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 font-sans text-xs">
                    
                    {/* Selected Summary */}
                    <div className="p-4 rounded-lg bg-navy-medium border border-card-border flex flex-col gap-2.5">
                      <div className="flex justify-between border-b border-card-border pb-2">
                        <span className="text-text-body/60 uppercase tracking-wider font-bold">Division</span>
                        <span className="text-text-heading font-semibold">{currentConfig.name}</span>
                      </div>
                      <div className="flex justify-between border-b border-card-border pb-2">
                        <span className="text-text-body/60 uppercase tracking-wider font-bold">Package</span>
                        <span className="text-text-heading font-semibold truncate max-w-[140px]" title={formData.packageName}>{formData.packageName}</span>
                      </div>
                      <div className="flex justify-between border-b border-card-border pb-2">
                        <span className="text-text-body/60 uppercase tracking-wider font-bold">Date</span>
                        <span className="text-text-heading font-semibold">{formData.date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-body/60 uppercase tracking-wider font-bold">Location</span>
                        <span className="text-text-heading font-semibold truncate max-w-[140px]">{formData.location}</span>
                      </div>
                    </div>

                    {/* Contact Summary */}
                    <div className="p-4 rounded-lg bg-navy-medium border border-card-border flex flex-col gap-2.5">
                      <div className="flex justify-between border-b border-card-border pb-2">
                        <span className="text-text-body/60 uppercase tracking-wider font-bold">Client</span>
                        <span className="text-text-heading font-semibold">{formData.name}</span>
                      </div>
                      <div className="flex justify-between border-b border-card-border pb-2">
                        <span className="text-text-body/60 uppercase tracking-wider font-bold">Phone</span>
                        <span className="text-text-heading font-semibold">{formData.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-body/60 uppercase tracking-wider font-bold">Email</span>
                        <span className="text-text-heading font-semibold truncate max-w-[140px]">{formData.email}</span>
                      </div>
                    </div>

                  </div>

                  {/* Calculated Price Alert */}
                  <div className="p-4 rounded-lg bg-navy-medium border border-card-border flex items-center justify-between mt-1">
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-gold-soft shrink-0" />
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-text-body/60 block font-bold">Estimated Cost</span>
                        <span className="text-text-heading font-bold text-sm sm:text-base font-display">{priceDisplay}</span>
                      </div>
                    </div>
                    <div className="px-3 py-1 rounded bg-navy-dark text-[9px] text-gold-soft uppercase tracking-wider font-bold border border-card-border">
                      Dynamic Quote
                    </div>
                  </div>
                </motion.div>
              )}

            </div>

            {/* NAVIGATION BUTTONS */}
            <div className="flex justify-between items-center gap-4 mt-8 pt-6 border-t border-card-border">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-5 py-2.5 rounded-lg border border-card-border hover:bg-navy-medium text-text-heading font-sans text-xs font-semibold tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" /> BACK
                </button>
              ) : (
                <div />
              )}

              {step < 5 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-2.5 rounded-lg bg-gold-accent text-white font-sans text-xs font-bold tracking-wider flex items-center gap-1 transition-all cursor-pointer hover:bg-gold-accent/90"
                >
                  CONTINUE <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-8 py-3 rounded-lg bg-gold-accent text-white font-sans text-xs font-bold tracking-wider disabled:opacity-50 flex items-center gap-1.5 transition-all cursor-pointer hover:bg-gold-accent/90"
                >
                  {loading ? 'LOGGING RESERVATION...' : 'CONFIRM BOOKING'} <CheckCircle className="w-4 h-4" />
                </button>
              )}
            </div>

          </motion.div>
        ) : (
          <motion.div
            key="booking-success-wizard"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-navy-dark rounded-xl p-8 sm:p-12 border border-green-500/25 shadow-lg text-center flex flex-col items-center gap-6 relative"
          >
            <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400">
              <CheckCircle className="w-7 h-7" />
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="font-display font-bold text-2xl text-text-heading">Booking Scheduled</h3>
              <p className="text-sm text-text-body font-sans max-w-md">Your reservation has been logged under reference: <code className="text-gold-soft font-bold">{bookedDetails.id}</code>.</p>
            </div>

            {/* Summary Details */}
            <div className="w-full max-w-md p-5 rounded-lg bg-navy-medium border border-card-border text-left font-sans text-xs flex flex-col gap-3">
              <div className="flex justify-between border-b border-card-border pb-2">
                <span className="text-text-body/60 uppercase tracking-wider font-bold">Division</span>
                <span className="text-text-heading font-semibold">{bookedDetails.divisionName}</span>
              </div>
              <div className="flex justify-between border-b border-card-border pb-2">
                <span className="text-text-body/60 uppercase tracking-wider font-bold">Package Chosen</span>
                <span className="text-text-heading font-semibold">{bookedDetails.packageName}</span>
              </div>
              <div className="flex justify-between border-b border-card-border pb-2">
                <span className="text-text-body/60 uppercase tracking-wider font-bold">Date & Location</span>
                <span className="text-text-heading font-semibold">{bookedDetails.date} @ {bookedDetails.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-body/60 uppercase tracking-wider font-bold">Amount Estimated</span>
                <span className="text-gold-soft font-bold">{bookedDetails.priceStr}</span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-xs text-green-400 font-sans max-w-md leading-relaxed">
              An email has been dispatched to `{bookedDetails.email}` and the reservation is logged in the CRM database.
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4">
              <button
                onClick={() => {
                  setBookedDetails(null);
                  setStep(1);
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg border border-card-border hover:bg-navy-medium text-text-heading font-sans text-xs font-bold tracking-wider transition-all cursor-pointer"
              >
                BOOK ANOTHER SERVICE
              </button>
              <a
                href={`https://wa.me/94768988970?text=Hi%20Mahdev%20Conglomerate,%20I%2527ve%20submitted%20booking%20reference%20${bookedDetails.id}%20for%20${bookedDetails.packageName}%20on%20${bookedDetails.date}%20at%20${bookedDetails.location}.%20Please%20confirm%20availability.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-sans text-xs font-bold tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                CONFIRM VIA WHATSAPP
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
