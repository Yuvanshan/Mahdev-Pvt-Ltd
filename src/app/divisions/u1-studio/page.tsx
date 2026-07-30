'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Film, Compass, User, Palette, Sparkles, X, CheckCircle, MessageSquare, Star, Eye } from 'lucide-react';
import { db } from '@/lib/firebase';
import { onSnapshot, doc } from 'firebase/firestore';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BookingSystem from '@/components/BookingSystem';

const u1PricingList = [
  {
    title: 'Essential Shoot',
    price: 'Rs. 24,999',
    duration: '1 Day Session',
    color: 'border-white/5',
    features: [
      '1 Lead Portrait Photographer',
      'High-Res Edited Digital Copies (150+)',
      '1 Cinematic Video Teaser (2 mins)',
      'Digital Album Access for 1 Year',
      'UHD Post-Processing Color Grading'
    ]
  },
  {
    title: 'Imperial Cinematic',
    price: 'Rs. 59,999',
    duration: '2 Days Session',
    badge: 'Best Value',
    color: 'border-gold-accent/30 bg-gold-accent/5',
    features: [
      '2 Candid Photographers & 1 Videographer',
      'High-Altitude Drone Shoots (BIA certified)',
      'Full Cinematic Movie (15-20 mins)',
      'Premium Leatherette physical album (40 Pages)',
      'Pre-Wedding Outdoor Shoot Session (Free)'
    ]
  },
  {
    title: 'Grand Masterpiece',
    price: 'Rs. 119,999',
    duration: 'Multi-Day Event',
    color: 'border-white/5',
    features: [
      '3 Photographers & 2 Videographers',
      'Unlimited Drone Aerial Footage & Steadicam',
      'Full length wedding movie & Instagram Reels',
      '2 Copy Luxury Hardcover Photobooks',
      'Live photo viewing stream on custom cloud portal'
    ]
  }
];

const u1Categories = [
  { id: 'all', title: 'All' },
  { id: 'wedding', title: 'Wedding Photography' },
  { id: 'cinematic', title: 'Cinematic Videos' },
  { id: 'preshoot', title: 'Pre Shoot' },
  { id: 'drone', title: 'Drone' },
  { id: 'baby', title: 'Baby Shoot' },
  { id: 'family', title: 'Family Shoot' },
  { id: 'corporate', title: 'Corporate Shoot' },
  { id: 'studio', title: 'Studio' }
];

const u1PortfolioItems = [
  { title: 'Eternal Golden Hour Union', category: 'wedding', img: '/images/wedding_decoration_1782729925686.jpg', h: 'h-64' },
  { title: 'Cinematic Movie Teaser Reel', category: 'cinematic', img: '/images/u1_robot_camera_1783346286743.jpg', h: 'h-96' },
  { title: 'Grand Palace Aerial Horizon', category: 'drone', img: '/images/drone_photography.jpg', h: 'h-80' },
  { title: 'Newborn Warm Cradle Milestone', category: 'baby', img: '/images/newborn_shoot.jpg', h: 'h-64' },
  { title: 'Enchanted Forest Couple Session', category: 'preshoot', img: '/images/portrait_shoot.jpg', h: 'h-96' },
  { title: 'Executive Headshots Portfolio', category: 'studio', img: '/images/it_robot_developer_1783346302442.jpg', h: 'h-64' },
  { title: 'Modern Office Corporate Panel', category: 'corporate', img: '/images/saas_dashboard.jpg', h: 'h-80' },
  { title: 'Vibrant Island Coastal Tour', category: 'family', img: '/images/van_tour.jpg', h: 'h-64' },
  { title: 'Mughal Theme Traditional Stage', category: 'wedding', img: '/images/sws_robot_decor_1783346269673.jpg', h: 'h-96' }
];

export default function U1Studio() {
  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const [sliderPos, setSliderPos] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [coverImg, setCoverImg] = useState('/images/u1_robot_camera_1783346286743.jpg');

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'division_posters'), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        if (d.u1) setCoverImg(d.u1);
      }
    });
    return () => unsub();
  }, []);
  
  // Camera shutter transition states
  const [shutterActive, setShutterActive] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Before / After Slider drag handlers
  const handleMove = (clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percentage);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length > 0) handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isResizing]);

  const triggerShutter = (tabId: string) => {
    setShutterActive(true);
    setTimeout(() => {
      setActiveTab(tabId);
    }, 350); // change tab midway during shutter close
    setTimeout(() => {
      setShutterActive(false);
    }, 700);
  };

  const filteredPortfolio = activeTab === 'all' 
    ? u1PortfolioItems 
    : u1PortfolioItems.filter(item => item.category === activeTab);

  return (
    <div className="relative min-h-screen bg-navy-dark text-left">
      <Navbar />

      <main className="min-h-screen pt-20 relative overflow-hidden">
        
        {/* Cinematic Camera Shutter Blades Overlay */}
        <AnimatePresence>
          {shutterActive && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[99999] pointer-events-none flex items-center justify-center"
            >
              {/* Shutter Blade Left */}
              <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="absolute top-0 bottom-0 left-0 w-1/2 bg-[#21103B] border-r border-gold-accent/20"
              />
              {/* Shutter Blade Right */}
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="absolute top-0 bottom-0 right-0 w-1/2 bg-[#21103B] border-l border-gold-accent/20"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Banner Section */}
        <section className="relative h-[55vh] flex items-center justify-center overflow-hidden">
          <Image 
            src={coverImg} 
            alt="U1 Studio Banner" 
            fill
            priority
            className="object-cover brightness-50 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/30 to-transparent" />
          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center flex flex-col items-center gap-4">
            <span className="px-3 py-1 rounded-full glass border border-cyan-500/35 text-cyan-300 text-xs font-bold uppercase tracking-wider">
              STUDIO U1
            </span>
            <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-7xl text-white tracking-tight leading-tight">
              Capturing Fleeting <span className="text-gradient-cyan">Raw Emotions</span>
            </h1>
            <p className="font-sans text-gray-300 text-sm sm:text-base max-w-xl leading-relaxed">
              Award-winning cinematography and portraiture. We freeze raw human bonds and grand architectures with cinematic lens systems.
            </p>
          </div>
        </section>

        {/* Categories Tab Filters */}
        <section className="py-16 max-w-7xl mx-auto px-6">
          <div className="text-center mb-12 flex flex-col gap-3">
            <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-gold-accent">IMAGERY CATALOG</span>
            <h2 className="font-display font-black text-3xl text-white">Creative Portfolios</h2>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-2.5 mb-12 border-b border-white/5 pb-6">
            {u1Categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => triggerShutter(cat.id)}
                className={`px-4.5 py-3 rounded-xl font-sans text-xs font-bold tracking-wider transition-all cursor-pointer ${
                  activeTab === cat.id 
                    ? 'bg-gradient-to-r from-gold-accent to-gold-soft text-navy-dark border-none' 
                    : 'glass text-gray-400 hover:text-white border border-white/5'
                }`}
              >
                {cat.title.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Staggered Masonry Gallery Grid */}
          <div className="columns-1 sm:columns-2 md:columns-3 gap-6 space-y-6">
            {filteredPortfolio.map((item, idx) => (
              <div 
                key={idx}
                onClick={() => setSelectedImg(item.img)}
                className={`relative ${item.h} rounded-3xl overflow-hidden border border-white/5 cursor-pointer group shadow-xl break-inside-avoid`}
              >
                <Image 
                  src={item.img} 
                  alt={item.title} 
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700 brightness-90 group-hover:brightness-75"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/90 via-transparent to-transparent opacity-60" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                    <Eye className="w-5 h-5" />
                  </div>
                </div>
                <div className="absolute bottom-6 left-6 text-left flex flex-col gap-1 z-10">
                  <span className="text-[9px] text-gold-accent font-bold uppercase tracking-wider">{item.category}</span>
                  <h4 className="font-display font-bold text-sm text-white">{item.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Before / After Grading Slider */}
        <section className="py-24 bg-navy-medium/30 relative">
          <div className="max-w-4xl mx-auto px-6 text-center flex flex-col gap-4">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-accent">POST-PROCESSING</span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-white">Before and After Color Grading</h2>
            <p className="text-gray-400 text-xs sm:text-sm font-sans mb-8">Drag the divider bar to witness our professional HDR color grading and portrait correction workflow.</p>

            <div 
              ref={sliderRef}
              className="relative w-full h-[300px] sm:h-[450px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl select-none cursor-ew-resize"
              onMouseDown={() => setIsResizing(true)}
              onTouchStart={() => setIsResizing(true)}
            >
              <div className="absolute inset-0 w-full h-full">
                <Image
                  src="/images/wedding_decoration_1782729925686.jpg"
                  alt="Post processing result"
                  fill
                  className="object-cover pointer-events-none"
                />
                <span className="absolute bottom-4 right-6 bg-black/60 px-3 py-1 rounded text-[10px] text-white font-bold uppercase tracking-wider">AFTER HDR PIPELINE</span>
              </div>

              <div 
                className="absolute inset-0 h-full overflow-hidden" 
                style={{ width: `${sliderPos}%` }}
              >
                <div className="absolute inset-0 w-[800px] h-full sm:w-[896px] md:w-[896px] lg:w-[896px]">
                  <Image
                    src="/images/wedding_decoration_1782729925686.jpg"
                    alt="Original shot"
                    fill
                    className="object-cover grayscale brightness-75 contrast-75 pointer-events-none"
                  />
                </div>
                <span className="absolute bottom-4 left-6 bg-black/60 px-3 py-1 rounded text-[10px] text-white font-bold uppercase tracking-wider">BEFORE HDR PIPELINE</span>
              </div>

              <div 
                className="absolute top-0 bottom-0 w-1 bg-gold-accent cursor-ew-resize flex items-center justify-center"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="w-8 h-8 rounded-full bg-gold-accent text-navy-dark shadow-lg flex items-center justify-center font-bold text-sm border-2 border-navy-dark">
                  ↔
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Packages */}
        <section className="py-24 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16 flex flex-col gap-3">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-accent">TRANSPARENT VALUE</span>
              <h2 className="font-display font-black text-3xl text-white">Cinematic Production Packages</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {u1PricingList.map((tier, idx) => (
                <div 
                  key={idx}
                  className={`glass p-8 rounded-3xl border ${tier.color} flex flex-col relative hover:translate-y-[-4px] transition-transform duration-300 text-left`}
                >
                  {tier.badge && (
                    <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-gold-accent/20 border border-gold-accent/30 text-gold-soft text-[9px] font-bold uppercase tracking-wider">
                      {tier.badge}
                    </span>
                  )}
                  <h3 className="font-display font-bold text-lg text-white">{tier.title}</h3>
                  <div className="my-4">
                    <span className="font-display text-3xl font-black text-white">{tier.price}</span>
                    <span className="text-xs text-gray-400 block mt-1">{tier.duration}</span>
                  </div>

                  <ul className="flex flex-col gap-3 my-6 flex-1 font-sans text-xs sm:text-sm text-gray-300">
                    {tier.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex gap-2">
                        <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <button 
                    onClick={() => setShowBooking(true)}
                    className="w-full py-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-gold-accent/50 text-center text-white font-sans text-xs font-semibold hover:bg-gold-accent hover:text-navy-dark transition-all tracking-wider cursor-pointer"
                  >
                    BOOK SESSION
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Lightbox Modal */}
        <AnimatePresence>
          {selectedImg && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImg(null)}
              className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-4 backdrop-blur-md"
            >
              <button className="absolute top-6 right-6 p-2 rounded-full bg-white/5 text-white">
                <X className="w-6 h-6" />
              </button>
              <div 
                onClick={(e) => e.stopPropagation()} 
                className="relative max-w-4xl max-h-[85vh] w-full h-[60vh] rounded-3xl overflow-hidden border border-white/10"
              >
                <Image 
                  src={selectedImg} 
                  alt="Gallery Lightbox" 
                  fill
                  className="object-contain"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
                <BookingSystem initialDivision="u1-studio" onSuccess={() => setTimeout(() => setShowBooking(false), 2000)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
