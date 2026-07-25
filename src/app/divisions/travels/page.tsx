'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Car, Navigation, Shield, Users, CheckCircle, MessageSquare, MapPin, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BookingSystem from '@/components/BookingSystem';

const fleet = [
  {
    name: 'Elite Passenger Van (Toyota KDH)',
    desc: 'Luxurious high-roof vans, fully dual-air-conditioned, adjustable bucket seats, onboard entertainment systems. Perfect for corporate travel or family tours.',
    capacity: '9 - 14 Seats',
    type: 'Luxury Van',
    features: ['Professional Chauffeur', 'Dual Air-Conditioning', 'Adjustable Seats', 'Luggage Space']
  },
  {
    name: 'VIP Wedding Car (Mercedes C-Class)',
    desc: 'Premium white sedan luxury cars. Clean, polished, decorated with flowers (optional), driven by professional chauffeurs in formals.',
    capacity: '4 Seats',
    type: 'VIP Car',
    features: ['Decorations optional', 'Chauffeur in formal uniform', 'Dual-zone climate control', 'Premium leather interior']
  }
];

const packages = [
  { 
    id: 'ella',
    title: 'Ella Greenery Escape', 
    days: '3 Days / 2 Nights', 
    price: 'Rs. 45,000+', 
    desc: 'Sightseeing in scenic train bridges, tea plantations, waterfalls, and Ella Rock climbs.', 
    img: '/images/van_tour.jpg',
    points: [{ x: 120, y: 110, label: 'Colombo' }, { x: 210, y: 190, label: 'Ella' }]
  },
  { 
    id: 'sigiriya',
    title: 'Sigiriya Cultural Trail', 
    days: '2 Days / 1 Night', 
    price: 'Rs. 35,000+', 
    desc: 'Explore historical rock fortress, Dambulla cave temple, and heritage ruins.', 
    img: '/images/travels_robot_car_1783346316762.jpg',
    points: [{ x: 120, y: 110, label: 'Colombo' }, { x: 160, y: 80, label: 'Sigiriya' }]
  },
  { 
    id: 'galle',
    title: 'Galle Coastal Sunset', 
    days: '1 Day Tour', 
    price: 'Rs. 18,000+', 
    desc: 'Visit Portuguese Galle Fort, sea turtle conservation hubs, and relax on sandy beaches.', 
    img: '/images/van_tour.jpg',
    points: [{ x: 120, y: 110, label: 'Colombo' }, { x: 135, y: 230, label: 'Galle' }]
  }
];

const drivers = [
  { name: 'Kanishka Silva', experience: '12 Years', language: 'English, Sinhala', rating: '5.0 (400+ reviews)', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop' },
  { name: 'Mohamed Fazil', experience: '8 Years', language: 'English, Tamil, Sinhala', rating: '4.9 (280+ reviews)', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop' }
];

export default function Travels() {
  const [selectedPkg, setSelectedPkg] = useState(packages[0]);
  const [showBooking, setShowBooking] = useState(false);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-navy-dark pt-20">
        {/* Banner Section */}
        <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
          <Image 
            src="/images/travels_robot_car_1783346316762.jpg" 
            alt="Travels Banner" 
            fill
            priority
            className="object-cover brightness-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/30 to-transparent" />
          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center flex flex-col items-center gap-4">
            <span className="px-3 py-1 rounded-full glass border border-green-500/35 text-green-300 text-xs font-bold uppercase tracking-wider">
              MAHDEV TRAVELS
            </span>
            <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-7xl text-white tracking-tight leading-tight">
              Elite Tourism & <span className="text-gradient-cyan">Wedding Transports</span>
            </h1>
            <p className="font-sans text-gray-300 text-base sm:text-lg max-w-xl leading-relaxed">
              Bespoke travel experiences across Sri Lanka. High-roof passenger vans and premium VIP cars with professional English-speaking chauffeurs.
            </p>
            <button
              onClick={() => setShowBooking(true)}
              className="mt-2 px-8 py-4 rounded-full bg-gradient-to-r from-gold-accent to-gold-soft text-navy-dark font-sans text-xs font-bold tracking-widest shadow-lg shadow-gold-accent/15"
            >
              BOOK YOUR VEHICLE NOW
            </button>
          </div>
        </section>

        {/* Fleet Section */}
        <section className="py-24 max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 flex flex-col gap-3">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-accent">
              OUR CHAUFFEURED FLEET
            </span>
            <h2 className="font-display font-bold text-3xl text-white">
              VIP Vehicles For Every Occasion
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {fleet.map((veh, idx) => (
              <div 
                key={idx}
                className="glass p-8 rounded-3xl border border-white/5 flex flex-col justify-between group hover:border-gold-accent/20 transition-all duration-300 text-left"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gold-accent tracking-wider">{veh.type}</span>
                      <h3 className="font-display font-bold text-xl text-white mt-1">{veh.name}</h3>
                    </div>
                    <div className="px-3 py-1 rounded-lg bg-white/5 text-xs text-gray-300 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-gold-soft" />
                      {veh.capacity}
                    </div>
                  </div>
                  <p className="font-sans text-sm text-gray-400 leading-relaxed">{veh.desc}</p>
                </div>

                <div className="mt-8">
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {veh.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2 text-xs text-gray-300 font-sans">
                        <CheckCircle className="w-3.5 h-3.5 text-gold-soft shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Interactive Sri Lankan Map and Packages */}
        <section className="py-24 bg-navy-medium/30 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Column: Interactive Map */}
              <div className="lg:col-span-5 flex flex-col gap-6 text-left items-center lg:items-start">
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-accent">ROUTE SIMULATION</span>
                <h2 className="font-display font-black text-2xl sm:text-3xl text-white">Visual Route Planner</h2>
                <p className="font-sans text-xs sm:text-sm text-gray-400 leading-relaxed max-w-sm mb-4">Select any package on the right to simulate the driving pathway and destination coordinates across our Sri Lankan grid.</p>

                {/* SVG Route map map */}
                <div className="w-[300px] h-[340px] rounded-3xl bg-navy-dark border border-white/10 shadow-2xl relative p-4 flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 300 300">
                    {/* Sri Lanka shape mockup silhouette */}
                    <path
                      d="M120 40 C140 30, 160 50, 170 80 C180 110, 190 140, 200 170 C210 200, 190 230, 160 250 C130 260, 110 240, 100 220 C90 190, 80 160, 90 120 C95 90, 105 60, 120 40 Z"
                      fill="rgba(255, 255, 255, 0.02)"
                      stroke="rgba(16, 185, 129, 0.12)"
                      strokeWidth="2"
                    />

                    {/* Animated path line */}
                    {selectedPkg.points.length > 1 && (
                      <>
                        <motion.line
                          x1={selectedPkg.points[0].x}
                          y1={selectedPkg.points[0].y}
                          x2={selectedPkg.points[1].x}
                          y2={selectedPkg.points[1].y}
                          stroke="#10b981"
                          strokeWidth="2"
                          strokeDasharray="4,4"
                          initial={{ strokeDashoffset: 0 }}
                          animate={{ strokeDashoffset: -20 }}
                          transition={{ repeat: Infinity, ease: "linear", duration: 2 }}
                        />
                      </>
                    )}

                    {/* Pulse nodes */}
                    {selectedPkg.points.map((pt, pIdx) => (
                      <g key={pIdx}>
                        <circle cx={pt.x} cy={pt.y} r="8" fill="rgba(16, 185, 129, 0.3)" className="animate-ping" />
                        <circle cx={pt.x} cy={pt.y} r="4" fill="#10b981" />
                        <text x={pt.x + 8} y={pt.y + 4} fill="#ffffff" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
                          {pt.label}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
              </div>

              {/* Right Column: Destination Cards */}
              <div className="lg:col-span-7 flex flex-col gap-6 text-left">
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-accent">SELECT TOUR PACKAGE</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {packages.map((pkg) => (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPkg(pkg)}
                      className={`glass p-6 rounded-3xl border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                        selectedPkg.id === pkg.id ? 'border-green-500/50 bg-green-500/5' : 'border-white/5'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-gray-300 font-bold uppercase">{pkg.days}</span>
                          <span className="text-xs text-green-400 font-bold">{pkg.price}</span>
                        </div>
                        <h3 className="font-display font-bold text-base text-white">{pkg.title}</h3>
                        <p className="text-xs text-gray-400 mt-2 font-sans leading-relaxed">{pkg.desc}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowBooking(true);
                        }}
                        className="mt-6 w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold text-white uppercase hover:bg-green-500 hover:text-white transition-all tracking-wider"
                      >
                        BOOK PACKAGE
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Chauffeur Profiles */}
        <section className="py-24 max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 flex flex-col gap-3">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-accent">PREMIUM CHAUFFEURS</span>
            <h2 className="font-display font-black text-3xl text-white">Elite English-Speaking Drivers</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {drivers.map((drv, idx) => (
              <div key={idx} className="glass p-6 rounded-3xl border border-white/5 flex gap-4 items-center text-left">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-white/10">
                  <Image src={drv.img} alt={drv.name} fill className="object-cover" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-white text-base">{drv.name}</h4>
                  <p className="text-[10px] text-gray-400 mt-1 font-sans">Experience: {drv.experience} | Rating: {drv.rating}</p>
                  <p className="text-[10px] text-green-400 mt-0.5 font-sans font-semibold">Languages: {drv.language}</p>
                </div>
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
