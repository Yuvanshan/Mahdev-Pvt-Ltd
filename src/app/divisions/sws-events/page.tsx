'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/firebase';
import { onSnapshot, doc } from 'firebase/firestore';
import { 
  Sparkles, 
  Heart, 
  Gift, 
  Church, 
  Briefcase, 
  Flower, 
  Sun, 
  X, 
  Calendar, 
  Check, 
  MessageSquare,
  DollarSign,
  Star,
  Users,
  Compass,
  Eye
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const BookingSystem = dynamic(() => import('@/components/BookingSystem'), { ssr: false });

const swsCategories = [
  {
    id: 'wedding',
    title: 'Wedding Decoration',
    icon: Heart,
    coverImg: '/images/wedding_decoration_1782729925686.jpg',
    beforeImg: '/images/wedding_decoration_1782729925686.jpg', // grayscale/dimmed in UI
    afterImg: '/images/wedding_decoration_1782729925686.jpg',
    budget: 'Rs. 250,000 - Rs. 650,000',
    review: 'SWS built a dream castle stage for our wedding. The fresh lilies and custom rose runners were gorgeous!',
    reviewer: 'Rebecca & Tharindu, Colombo Wedding',
    services: ['24ft Grand Backdrop Set', 'Double Fog/Smoke Effects Runs', 'Path Walkway Pillars (8)', 'LED Warm Uplighters (12)', 'Traditional Gold Couch settee'],
    gallery: [
      '/images/wedding_decoration_1782729925686.jpg',
      '/images/sws_robot_decor_1783346269673.jpg',
      '/images/church_decor.jpg'
    ]
  },
  {
    id: 'birthday',
    title: 'Birthday Decoration',
    icon: Gift,
    coverImg: '/images/birthday_decor.jpg',
    beforeImg: '/images/birthday_decor.jpg',
    afterImg: '/images/birthday_decor.jpg',
    budget: 'Rs. 65,000 - Rs. 150,000',
    review: 'Our daughter loved the Alice setup! The neon signage and organic balloon arches looked amazing.',
    reviewer: 'Mrs. Fernando, Rajagiriya',
    services: ['16ft Organic Balloon Arch', 'Personalized LED Neon light names', 'Thematic 3D Character Backdrops', 'Cake table plinths set (3)', 'Custom candy bar backdrop'],
    gallery: [
      '/images/birthday_decor.jpg',
      '/images/sws_robot_decor_1783346269673.jpg',
      '/images/wedding_decoration_1782729925686.jpg'
    ]
  },
  {
    id: 'reception',
    title: 'Reception Decorations',
    icon: Sparkles,
    coverImg: '/images/wedding_decoration_1782729925686.jpg',
    beforeImg: '/images/wedding_decoration_1782729925686.jpg',
    afterImg: '/images/wedding_decoration_1782729925686.jpg',
    budget: 'Rs. 180,000 - Rs. 400,000',
    review: 'The walkway canopy and crystal fairy lights created a breathtaking first impression for our guests.',
    reviewer: 'Devinda & Hansini, Mount Lavinia',
    services: ['Tunnel of Fairy Lights (50ft)', 'Welcome Banner Board with Easel', 'Table centerpiece floral vases (15)', 'Starlight mesh ceiling drape'],
    gallery: [
      '/images/wedding_decoration_1782729925686.jpg',
      '/images/sws_robot_decor_1783346269673.jpg',
      '/images/birthday_decor.jpg'
    ]
  },
  {
    id: 'corporate',
    title: 'Corporate Events',
    icon: Briefcase,
    coverImg: '/images/sws_robot_decor_1783346269673.jpg',
    beforeImg: '/images/sws_robot_decor_1783346269673.jpg',
    afterImg: '/images/sws_robot_decor_1783346269673.jpg',
    budget: 'Rs. 150,000 - Rs. 350,000',
    review: 'Clean lines, excellent vinyl print execution, and high-fidelity wash lighting for our annual summit.',
    reviewer: 'Corporate Marketing Team, Dialog Axiata',
    services: ['Branded Stage background wall', 'Custom vinyl corporate banners', 'Warm wash uplighters (6)', 'VIP lounge couch sets', 'Media photo backdrop wall'],
    gallery: [
      '/images/sws_robot_decor_1783346269673.jpg',
      '/images/it_robot_developer_1783346302442.jpg',
      '/images/saas_dashboard.jpg'
    ]
  },
  {
    id: 'traditional',
    title: 'Traditional Events',
    icon: Flower,
    coverImg: '/images/sws_robot_decor_1783346269673.jpg',
    beforeImg: '/images/sws_robot_decor_1783346269673.jpg',
    afterImg: '/images/sws_robot_decor_1783346269673.jpg',
    budget: 'Rs. 120,000 - Rs. 280,000',
    review: 'Outstanding attention to cultural details. The hand-carved pillars and marigold string backdrops were flawless.',
    reviewer: 'Mr. Karthik, Wellawatte',
    services: ['Royal carved wood Mandap pillars (4)', 'Coconut leaf & mango leaf chains', 'Brass traditional oil lamps (4)', 'Fresh flower hanging strings'],
    gallery: [
      '/images/sws_robot_decor_1783346269673.jpg',
      '/images/wedding_decoration_1782729925686.jpg',
      '/images/church_decor.jpg'
    ]
  },
  {
    id: 'outdoor',
    title: 'Outdoor Events',
    icon: Sun,
    coverImg: '/images/drone_photography.jpg',
    beforeImg: '/images/drone_photography.jpg',
    afterImg: '/images/drone_photography.jpg',
    budget: 'Rs. 200,000 - Rs. 500,000',
    review: 'A picturesque beach canopy decor that stood stable against seaside winds. Fairylight trees were a dream.',
    reviewer: 'Liam & Shalini, Negombo Beach',
    services: ['Heavy-base seaside canopy frames', 'Windproof silk drapes runs', 'Warm fairylight branches wraps', 'Rustic table settings decor'],
    gallery: [
      '/images/drone_photography.jpg',
      '/images/wedding_decoration_1782729925686.jpg',
      '/images/van_tour.jpg'
    ]
  },
  {
    id: 'temple',
    title: 'Temple Events',
    icon: Church,
    coverImg: '/images/church_decor.jpg',
    beforeImg: '/images/church_decor.jpg',
    afterImg: '/images/church_decor.jpg',
    budget: 'Rs. 80,000 - Rs. 200,000',
    review: 'The flower garlands and altar arrangements fit the solemnity and grace of our religious festival perfectly.',
    reviewer: 'Temple Trustee Council, Kandy',
    services: ['Altar fresh flower strings', 'Lotus & jasmine garland runs', 'Temple entrance archway', 'Floral background columns'],
    gallery: [
      '/images/church_decor.jpg',
      '/images/sws_robot_decor_1783346269673.jpg',
      '/images/birthday_decor.jpg'
    ]
  },
  {
    id: 'luxury',
    title: 'Luxury Decoration',
    icon: Sparkles,
    coverImg: '/images/wedding_decoration_1782729925686.jpg',
    beforeImg: '/images/wedding_decoration_1782729925686.jpg',
    afterImg: '/images/wedding_decoration_1782729925686.jpg',
    budget: 'Rs. 500,000 - Rs. 1,200,000',
    review: 'World-class ballroom setup! The suspended crystal chandeliers and mirror catwalk floors blew our guests away.',
    reviewer: 'Dr. Wickremasinghe, Shangri-La Colombo',
    services: ['Suspended glass chandeliers (8)', 'Mirror catwalk floor sets', 'Complete hall drape covers', 'Cold pyro & automated fireworks'],
    gallery: [
      '/images/wedding_decoration_1782729925686.jpg',
      '/images/sws_robot_decor_1783346269673.jpg',
      '/images/drone_photography.jpg'
    ]
  }
];

export default function SwsEvents() {
  const [activeTab, setActiveTab] = useState('wedding');
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [sliderPos, setSliderPos] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [coverImg, setCoverImg] = useState('/images/wedding_decoration_1782729925686.jpg');
  const [tagline, setTagline] = useState('Designing Luxury Environments');
  const [description, setDescription] = useState('We design and construct breathtaking environments. From grand glasshouse wedding canopy constructs to themed birthdays, corporate stages, and traditional oil lamp mandaps.');

  const sliderRef = useRef<HTMLDivElement>(null);
  const activeCat = swsCategories.find(c => c.id === activeTab) || swsCategories[0];

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'division_posters'), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        if (d.sws) setCoverImg(d.sws);
      }
    });

    const unsubDiv = onSnapshot(doc(db, 'divisions', 'sws-events'), (snap) => {
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

  return (
    <div className="relative min-h-screen bg-navy-dark text-left">
      <Navbar />

      <main className="min-h-screen pt-20 relative z-10">
        
        {/* Immersive Header Banner */}
        <section className="relative h-[55vh] flex items-center justify-center overflow-hidden">
          <Image 
            src={activeTab === 'wedding' ? coverImg : activeCat.coverImg} 
            alt="SWS Events Banner" 
            fill
            priority
            className="object-cover brightness-[0.35] scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/40 to-transparent" />
          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center flex flex-col items-center gap-4">
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-4 py-1.5 rounded-full glass border border-purple-500/35 text-purple-300 text-[10px] font-bold uppercase tracking-[0.2em]"
            >
              SWS EVENT MANAGEMENT
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display font-black text-4xl sm:text-5xl lg:text-7xl text-white tracking-tight leading-tight"
            >
              {tagline}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-sans text-gray-300 text-sm sm:text-base max-w-xl leading-relaxed"
            >
              {description}
            </motion.p>
          </div>
        </section>

        {/* Main interactive section */}
        <section className="py-16 max-w-7xl mx-auto px-6">
          
          {/* Tab buttons */}
          <div className="flex flex-wrap justify-center items-center gap-3 mb-16 border-b border-white/5 pb-8">
            {swsCategories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeTab === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveTab(cat.id);
                    setSliderPos(50);
                  }}
                  className={`px-5 py-3.5 rounded-xl font-sans text-xs font-bold tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                    isActive 
                      ? 'bg-gradient-to-r from-gold-accent to-gold-soft text-navy-dark shadow-md shadow-gold-accent/15 border-none' 
                      : 'glass hover:bg-white/5 border border-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {cat.title.toUpperCase()}
                </button>
              );
            })}
          </div>

          {/* Active Category Showroom */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            
            {/* Left side: Information, Reviews, services */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-accent">PREMIUM EVENT SERVICES</span>
                <h2 className="font-display font-black text-3xl sm:text-4xl text-white mt-1">{activeCat.title}</h2>
              </div>

              {/* Budget Display */}
              <div className="p-5 rounded-2xl bg-gold-accent/10 border border-gold-accent/20 flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold block">Estimated Budget Range</span>
                  <span className="text-white font-black text-base sm:text-lg font-display mt-0.5 block">{activeCat.budget}</span>
                </div>
                <div className="px-3 py-1 rounded bg-white/5 text-[9px] text-gold-soft font-bold uppercase tracking-wider">
                  Bespoke Quote
                </div>
              </div>

              {/* Services Included */}
              <div className="flex flex-col gap-3">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-sans">Included in base layout:</h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm font-sans text-gray-300">
                  {activeCat.services.map((ser, sIdx) => (
                    <li key={sIdx} className="flex gap-2 items-center">
                      <Check className="w-4 h-4 text-green-400 shrink-0" />
                      <span>{ser}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Testimonial Quote */}
              <div className="glass p-6 rounded-3xl border border-white/5 text-left flex flex-col gap-3 relative overflow-hidden">
                <div className="flex text-gold-soft gap-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
                </div>
                <p className="font-sans text-xs sm:text-sm text-gray-300 italic leading-relaxed">
                  "{activeCat.review}"
                </p>
                <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mt-1">
                  - {activeCat.reviewer}
                </span>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setBookingOpen(true)}
                  className="flex-1 py-4 rounded-xl bg-gradient-to-r from-gold-accent to-gold-soft text-navy-dark font-sans text-xs font-bold tracking-widest hover:brightness-110 shadow-lg shadow-gold-accent/15 transition-all cursor-pointer text-center"
                >
                  BOOK DECORATION NOW
                </button>
                <a
                  href={`https://wa.me/94768988970?text=Hi%20SWS%20Events,%20I%20am%20interested%20in%20the%20${activeCat.title}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-4 rounded-xl border border-green-500/25 hover:bg-green-500/10 text-green-400 flex items-center justify-center transition-all"
                >
                  <MessageSquare className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Right side: Before/After Slider & Gallery Grid */}
            <div className="lg:col-span-7 flex flex-col gap-10">
              
              {/* Before/After Drag Slider */}
              <div className="flex flex-col gap-3">
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Before / After Setup transformation</span>
                <div 
                  ref={sliderRef}
                  className="relative w-full h-[320px] sm:h-[420px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl select-none cursor-ew-resize"
                  onMouseDown={() => setIsResizing(true)}
                  onTouchStart={() => setIsResizing(true)}
                >
                  {/* After Image */}
                  <div className="absolute inset-0 w-full h-full">
                    <Image
                      src={activeCat.afterImg}
                      alt="Completed Decor Setup"
                      fill
                      className="object-cover pointer-events-none"
                    />
                    <span className="absolute bottom-4 right-6 bg-black/60 px-3 py-1 rounded text-[10px] text-white font-bold uppercase tracking-wider">Completed Decor</span>
                  </div>

                  {/* Before Image (cropped via width) */}
                  <div 
                    className="absolute inset-0 h-full overflow-hidden" 
                    style={{ width: `${sliderPos}%` }}
                  >
                    <div className="absolute inset-0 w-[500px] h-full sm:w-[680px] lg:w-[680px]">
                      <Image
                        src={activeCat.beforeImg}
                        alt="Initial Venue Setup"
                        fill
                        className="object-cover grayscale brightness-50 contrast-75 blur-[1.5px] pointer-events-none"
                      />
                    </div>
                    <span className="absolute bottom-4 left-6 bg-black/60 px-3 py-1 rounded text-[10px] text-white font-bold uppercase tracking-wider">Empty Hall</span>
                  </div>

                  {/* Slider Line handler */}
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

              {/* Gallery Grid */}
              <div className="flex flex-col gap-3">
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Design Gallery grid</span>
                <div className="grid grid-cols-3 gap-4">
                  {activeCat.gallery.map((img, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setLightboxImg(img)}
                      className="relative h-28 sm:h-36 rounded-2xl overflow-hidden border border-white/10 group cursor-pointer shadow-md"
                    >
                      <Image 
                        src={img} 
                        alt="Gallery Image" 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-500 brightness-90 group-hover:brightness-100" 
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* Dynamic Lightbox Modal */}
        <AnimatePresence>
          {lightboxImg && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightboxImg(null)}
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
                  src={lightboxImg} 
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
          {bookingOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setBookingOpen(false)}
              className="fixed inset-0 bg-black/80 z-[99999] flex items-end md:items-center justify-center p-0 md:p-4 backdrop-blur-md overflow-y-auto"
            >
              <div 
                onClick={(e) => e.stopPropagation()} 
                className="w-full max-w-3xl relative mobile-bottom-sheet"
              >
                <button
                  onClick={() => setBookingOpen(false)}
                  className="absolute top-4 right-4 md:-top-12 md:right-0 p-2 text-gray-400 hover:text-white z-50"
                >
                  <X className="w-6 h-6" />
                </button>
                <BookingSystem initialDivision="sws-events" onSuccess={() => setTimeout(() => setBookingOpen(false), 2000)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      <Footer />
    </div>
  );
}
