'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Calendar, Check, X, MapPin, Navigation, Award, Users } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BookingSystem from '@/components/BookingSystem';

const destinations = [
  { id: 'colombo', name: 'Colombo Central Hub', desc: 'Starting base. VIP sedan airport transfers and business tours.', x: 100, y: 220 },
  { id: 'galle', name: 'Galle Fort Coastal Sanctuary', desc: 'Relaxing sandy shores, Portuguese fort walls, and coral diving.', x: 120, y: 310 },
  { id: 'ella', name: 'Ella Greenery Mountain Escape', desc: 'Nine Arch train bridge, tea plantations, and scenic Ella Rock hiking paths.', x: 180, y: 230 },
  { id: 'sigiriya', name: 'Sigiriya Ancient Fortress', desc: 'Eighth wonder of the world, historic lion rock frescoes, and cave temples.', x: 160, y: 110 }
];

const fleetList = [
  {
    name: 'Toyota KDH High-Roof Van',
    capacity: '9 - 14 Seats',
    badge: 'Popular',
    desc: 'Fully air-conditioned luxury high-roof passenger vans. Perfect for family tours and corporate team transfers.',
    price: 'Rs. 25,000 / Day',
    features: ['Dual A/C control', 'Reclining soft seats', 'Luggage space', 'Bluetooth sound system']
  },
  {
    name: 'Mercedes-Benz C-Class VIP',
    capacity: '4 Seats',
    badge: 'Luxury',
    desc: 'Elite white sedan luxury vehicles. Driven by suit-clad professional English-speaking chauffeurs.',
    price: 'Rs. 45,000 / Day',
    features: ['Leather interior', 'Panoramic glass roof', 'Decorations optional', 'Complimentary refreshments']
  }
];

export default function Travels() {
  const [activeDest, setActiveDest] = useState(destinations[0]);
  const [showBooking, setShowBooking] = useState(false);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-navy-dark pt-20 relative overflow-hidden">
        
        {/* Animated clouds background parallax effect */}
        <div className="absolute top-1/4 left-0 right-0 h-48 bg-gradient-to-r from-transparent via-white/5 to-transparent blur-2xl animate-pulse pointer-events-none" />

        {/* Hero Section */}
        <section className="relative h-[65vh] flex items-center justify-center overflow-hidden">
          <Image 
            src="/images/travels_robot_car_1783346316762.jpg" 
            alt="Travels Banner" 
            fill
            priority
            className="object-cover brightness-[0.45] scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/30 to-transparent" />
          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center flex flex-col items-center gap-4">
            <span className="px-3 py-1 rounded-full glass border border-green-500/35 text-green-300 text-xs font-bold uppercase tracking-wider">
              MAHDEV TRAVELS & TOURS
            </span>
            <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-7xl text-white tracking-tight leading-tight">
              Cinematic <span className="text-gradient-gold">Sri Lankan Excursions</span>
            </h1>
            <p className="font-sans text-gray-300 text-sm sm:text-base max-w-xl leading-relaxed">
              Explore ancient ruins, tea plantations, and gold beaches. Driven by professional bilingual chauffeurs in VIP sedans and luxury passenger vans.
            </p>
            <button 
              onClick={() => setShowBooking(true)}
              className="mt-4 px-8 py-4 rounded-full bg-gradient-to-r from-gold-accent to-gold-soft text-navy-dark font-sans text-xs font-bold tracking-widest shadow-lg shadow-gold-accent/15"
            >
              BOOK CUSTOM TOUR
            </button>
          </div>
        </section>

        {/* Interactive SVG route map & flight loop */}
        <section className="py-24 max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left side: Map explanation */}
            <div className="lg:col-span-5 text-left flex flex-col gap-4">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-accent">interactive tour routes</span>
              <h2 className="font-display font-black text-2xl sm:text-3xl text-white">Sri Lankan Transit Flight Map</h2>
              <p className="text-gray-400 text-xs sm:text-sm font-sans leading-relaxed">
                Click on the coordinate pins on the interactive map vector to examine popular destination itineraries. An aircraft cruises along the connecting paths.
              </p>

              <AnimatePresence mode="wait">
                <motion.div 
                  key={activeDest.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="p-6 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-3 mt-4"
                >
                  <div className="flex items-center gap-2 text-gold-soft">
                    <MapPin className="w-5 h-5" />
                    <h4 className="font-display font-bold text-base text-white">{activeDest.name}</h4>
                  </div>
                  <p className="font-sans text-xs text-gray-300 leading-relaxed">{activeDest.desc}</p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right side: SVG Map */}
            <div className="lg:col-span-7 flex justify-center items-center">
              <div className="relative w-[300px] h-[360px] bg-navy-medium/30 rounded-3xl border border-white/10 p-4 shadow-2xl flex items-center justify-center">
                {/* SVG Route Paths */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 360">
                  <defs>
                    <linearGradient id="route-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#00e5ff" />
                      <stop offset="100%" stopColor="#dfba73" />
                    </linearGradient>
                  </defs>

                  {/* Route Paths */}
                  <motion.path 
                    d="M 100 220 L 120 310 L 180 230 L 160 110 Z"
                    fill="none"
                    stroke="url(#route-gradient)"
                    strokeWidth="1.5"
                    strokeDasharray="6,6"
                    initial={{ strokeDashoffset: 0 }}
                    animate={{ strokeDashoffset: -120 }}
                    transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
                  />

                  {/* Looping cruise plane icon following route */}
                  <motion.path
                    d="M 100 220 L 120 310 L 180 230 L 160 110 Z"
                    fill="none"
                    id="airplane-track"
                  />
                  <g>
                    <circle r="4" fill="#dfba73" />
                    <animateMotion dur="8s" repeatCount="indefinite" path="M 100 220 L 120 310 L 180 230 L 160 110 Z" />
                  </g>
                </svg>

                {/* Interactive Markers */}
                {destinations.map((dest) => (
                  <button
                    key={dest.id}
                    onClick={() => setActiveDest(dest)}
                    style={{ left: `${dest.x}px`, top: `${dest.y}px` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group z-20 flex flex-col items-center gap-1.5"
                  >
                    <span className="relative flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border border-white" />
                    </span>
                    <span className="hidden group-hover:block bg-black/80 px-2 py-1 rounded text-[8px] text-white font-bold whitespace-nowrap uppercase tracking-wider border border-white/10">
                      {dest.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* Chauffeur Fleet details */}
        <section className="py-24 max-w-7xl mx-auto px-6 border-t border-white/5 relative z-10">
          <div className="text-center mb-16 flex flex-col gap-3">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-accent">PREMIUM FLEET MATRIX</span>
            <h2 className="font-display font-black text-3xl text-white">Chauffeured Vehicle Class</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {fleetList.map((vehicle, idx) => (
              <div 
                key={idx}
                className="glass p-8 rounded-3xl border border-white/5 flex flex-col gap-6 text-left hover:border-gold-accent/20 transition-all shadow-xl"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] bg-gold-accent/15 border border-gold-accent/25 px-2 py-0.5 rounded text-gold-soft font-bold uppercase tracking-wider">{vehicle.badge}</span>
                    <h3 className="font-display font-bold text-xl text-white mt-2">{vehicle.name}</h3>
                  </div>
                  <span className="font-display font-black text-lg text-gold-soft">{vehicle.price}</span>
                </div>

                <p className="font-sans text-xs sm:text-sm text-gray-400 leading-relaxed">{vehicle.desc}</p>

                <div className="grid grid-cols-2 gap-3 my-2">
                  <div className="flex items-center gap-2 text-xs text-gray-300 font-sans">
                    <Users className="w-4 h-4 text-gold-accent" />
                    <span>Capacity: {vehicle.capacity}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-300 font-sans">
                    <Navigation className="w-4 h-4 text-gold-accent" />
                    <span>Fuel: Petrol / Diesel</span>
                  </div>
                </div>

                <ul className="flex flex-col gap-2 border-t border-white/5 pt-4">
                  {vehicle.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2 font-sans text-xs text-gray-300">
                      <Check className="w-4 h-4 text-green-400 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => setShowBooking(true)}
                  className="w-full py-3.5 bg-gradient-to-r from-gold-accent to-gold-soft text-navy-dark text-center font-sans text-xs font-bold tracking-widest rounded-xl transition-all"
                >
                  RESERVE CHAUFFEUR
                </button>
              </div>
            ))}
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
              className="fixed inset-0 bg-black/95 z-[99999] flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto"
            >
              <div 
                onClick={(e) => e.stopPropagation()} 
                className="w-full max-w-3xl relative"
              >
                <button
                  onClick={() => setShowBooking(false)}
                  className="absolute -top-12 right-0 p-2 text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
                <BookingSystem initialDivision="travels" onSuccess={() => setTimeout(() => setShowBooking(false), 2000)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </>
  );
}
