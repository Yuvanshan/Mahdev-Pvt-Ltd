'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Calendar, Check, X, MapPin, Navigation, Award, Users, Info, MessageSquare } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BookingSystem from '@/components/BookingSystem';
import { db } from '@/lib/firebase';
import { onSnapshot, doc } from 'firebase/firestore';

const destinations = [
  { id: 'colombo', name: 'Colombo Central Hub', desc: 'Starting base. VIP sedan airport transfers and business tours.', x: 100, y: 220 },
  { id: 'galle', name: 'Galle Fort Coastal Sanctuary', desc: 'Relaxing sandy shores, Portuguese fort walls, and coral diving.', x: 120, y: 310 },
  { id: 'ella', name: 'Ella Greenery Mountain Escape', desc: 'Nine Arch train bridge, tea plantations, and scenic Ella Rock hiking paths.', x: 180, y: 230 },
  { id: 'sigiriya', name: 'Sigiriya Ancient Fortress', desc: 'Eighth wonder of the world, historic lion rock frescoes, and cave temples.', x: 160, y: 110 }
];

const expandedFleetList = [
  {
    name: 'Toyota KDH High-Roof (Mini Vans)',
    capacity: '14 Seats',
    type: 'Mini Van',
    driver: 'Samantha (Speaks English, Sinhala)',
    ac: 'Dual A/C control',
    price: 'Rs. 25,000 / Day',
    badge: 'Popular',
    desc: 'Perfect for family vacations & corporate dispatch. Spacious luggage deck with adjustable bucket seats.',
    availability: 'Available Today',
    img: '/images/van_tour.jpg'
  },
  {
    name: 'Mercedes-Benz C-Class (Luxury Cars)',
    capacity: '4 Seats',
    type: 'Luxury Sedan',
    driver: 'Rohan (Speaks English)',
    ac: 'Dual-zone Climate A/C',
    price: 'Rs. 45,000 / Day',
    badge: 'VIP Class',
    desc: 'Polished executive sedans driven by suit-clad professional chauffeurs. On-board refreshments included.',
    availability: 'Available Today',
    img: '/images/travels_robot_car_1783346316762.jpg'
  },
  {
    name: 'Toyota Prius Hybrid (Airport Transfers)',
    capacity: '4 Seats',
    type: 'Hybrid Sedan',
    driver: 'Nimal (Speaks English, Tamil, Sinhala)',
    ac: 'Climate Control A/C',
    price: 'Rs. 12,000 / Trip',
    badge: 'BIA Dispatch',
    desc: 'Dedicated airport pick-up and drop-off transfers with luggage space. Guaranteed on-time flight tracking.',
    availability: 'Available Today',
    img: '/images/travels_robot_car_1783346316762.jpg'
  },
  {
    name: 'Chrysler 300C Limousine (Wedding Transport)',
    capacity: '8 Seats',
    type: 'Stretch Limo',
    driver: 'Kingsley (Speaks English)',
    ac: 'Dual Cabin A/C',
    price: 'Rs. 95,000 / Day',
    badge: 'Wedding VIP',
    desc: 'Stretch white limo. Included floral stage decor ribbons, icebox champagne bucket, and uniformed chauffeur.',
    availability: 'Book Early (Highly Demanded)',
    img: '/images/wedding_decoration_1782729925686.jpg'
  },
  {
    name: 'Toyota Coaster Luxury (Buses)',
    capacity: '29 Seats',
    type: 'Luxury Coach',
    driver: 'Priyantha (Speaks English, Sinhala)',
    ac: 'Full Cabin A/C',
    price: 'Rs. 55,000 / Day',
    badge: 'Group Tours',
    desc: 'Perfect for large wedding groups, school excursions, and tourist teams. Television and microphone systems included.',
    availability: 'Available Today',
    img: '/images/van_tour.jpg'
  },
  {
    name: 'Ceylon Scenic Explorer (Tour Packages)',
    capacity: 'Fits Up to 14',
    type: 'Tour Package',
    driver: 'Asanka (French/English Chauffeur Guide)',
    ac: 'Dual A/C control',
    price: 'Rs. 150,000 / 5 Days',
    badge: 'Curated Tour',
    desc: '5-Day island tour package covering Sigiriya, Kandy, Ella, and Galle Fort beaches. Chauffeur guide logs included.',
    availability: 'Confirm Dates',
    img: '/images/drone_photography.jpg'
  }
];

export default function Travels() {
  const [activeDest, setActiveDest] = useState(destinations[0]);
  const [showBooking, setShowBooking] = useState(false);
  const [coverImg, setCoverImg] = useState('/images/travels_robot_car_1783346316762.jpg');
  const [tagline, setTagline] = useState('Cinematic Sri Lankan Transit');
  const [description, setDescription] = useState('Explore ancient ruins, tea estates, and gold beaches. Driven by professional bilingual chauffeurs in VIP sedans and luxury passenger vans.');

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'division_posters'), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        if (d.travels) setCoverImg(d.travels);
      }
    });

    const unsubDiv = onSnapshot(doc(db, 'divisions', 'travels'), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        if (d.tagline) setTagline(d.tagline);
        if (d.description) setDescription(d.description);
        if (d.bgImage) setCoverImg(d.bgImage);
      }
    });

    return () => {
      unsub();
      unsubDiv();
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-navy-dark text-left">
      <Navbar />

      <main className="min-h-screen pt-20 relative overflow-hidden">
        
        {/* Parallax elements */}
        <div className="absolute top-1/4 left-0 right-0 h-48 bg-gradient-to-r from-transparent via-white/5 to-transparent blur-2xl animate-pulse pointer-events-none" />

        {/* Hero Section */}
        <section className="relative h-[55vh] flex items-center justify-center overflow-hidden">
          <Image 
            src={coverImg} 
            alt="Travels Banner" 
            fill
            priority
            className="object-cover brightness-[0.35] scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/30 to-transparent" />
          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center flex flex-col items-center gap-4">
            <span className="px-3 py-1 rounded-full glass border border-green-500/35 text-green-300 text-xs font-bold uppercase tracking-wider">
              MAHDEV TRAVELS & TOURS
            </span>
            <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-7xl text-white tracking-tight leading-tight">
              {tagline}
            </h1>
            <p className="font-sans text-gray-300 text-sm sm:text-base max-w-xl leading-relaxed">
              {description}
            </p>
          </div>
        </section>

        {/* Fleet Matrix Showcase */}
        <section className="py-24 max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 flex flex-col gap-3">
            <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-gold-accent">FLEET SHOWROOM</span>
            <h2 className="font-display font-black text-3xl text-white">Chauffeured Vehicle Class</h2>
            <p className="text-gray-400 text-xs sm:text-sm font-sans max-w-md mx-auto">Select a booking category below to lock availability and check driver profiles.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {expandedFleetList.map((vehicle, idx) => (
              <div 
                key={idx}
                className="glass rounded-3xl overflow-hidden border border-white/5 flex flex-col h-full hover:border-gold-accent/30 hover:translate-y-[-4px] transition-all duration-300 shadow-xl"
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <Image 
                    src={vehicle.img} 
                    alt={vehicle.name} 
                    fill 
                    className="object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/95 to-transparent" />
                  <span className="absolute top-4 left-4 px-2.5 py-1 rounded bg-black/60 border border-white/10 text-[9px] font-bold text-gold-soft uppercase tracking-wider">
                    {vehicle.badge}
                  </span>
                </div>

                <div className="p-6 flex flex-col flex-1 gap-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-display font-bold text-base text-white">{vehicle.name}</h3>
                    <span className="font-display font-black text-xs sm:text-sm text-gold-soft shrink-0">{vehicle.price}</span>
                  </div>

                  <p className="font-sans text-xs text-gray-400 leading-relaxed flex-1">{vehicle.desc}</p>

                  {/* Vehicle details */}
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-2 font-sans text-xs text-gray-300">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Seats Capacity:</span>
                      <span className="font-semibold text-white">{vehicle.capacity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Air-Conditioning:</span>
                      <span className="font-semibold text-white">{vehicle.ac}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Assigned Driver:</span>
                      <span className="font-semibold text-white truncate max-w-[140px]">{vehicle.driver.split('(')[0]}</span>
                    </div>
                    <div className="flex justify-between border-t border-white/5 pt-2 mt-1">
                      <span className="text-gray-500">Languages:</span>
                      <span className="text-gold-soft font-medium text-[10px]">{vehicle.driver.includes('(') ? vehicle.driver.split('(')[1].replace(')', '') : 'English'}</span>
                    </div>
                  </div>

                  {/* Booking actions */}
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setShowBooking(true)}
                      className="flex-1 py-3 bg-gradient-to-r from-gold-accent to-gold-soft text-navy-dark text-center font-sans text-xs font-bold tracking-widest rounded-xl transition-all hover:brightness-110 cursor-pointer"
                    >
                      BOOK NOW
                    </button>
                    <a
                      href={`https://wa.me/94768988970?text=Hi%2520Mahdev%2520Travels,%2520I%2520am%2520interested%2520in%2520reserving%2520the%2520${vehicle.name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-3 rounded-xl border border-green-500/20 hover:bg-green-500/10 text-green-400 flex items-center justify-center transition-all"
                      title="Live WhatsApp Enquiry"
                    >
                      <MessageSquare className="w-4.5 h-4.5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Interactive transit map */}
        <section className="py-24 max-w-7xl mx-auto px-6 border-t border-white/5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left side: Map explanation */}
            <div className="lg:col-span-5 text-left flex flex-col gap-4">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-accent">transit itineraries</span>
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
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 360">
                  <defs>
                    <linearGradient id="route-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#00e5ff" />
                      <stop offset="100%" stopColor="#dfba73" />
                    </linearGradient>
                  </defs>

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
                    className="absolute -translate-x-1/2 -translate-y-1/2 group z-20 flex flex-col items-center gap-1.5 cursor-pointer"
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
                <BookingSystem initialDivision="travels" onSuccess={() => setTimeout(() => setShowBooking(false), 2000)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
