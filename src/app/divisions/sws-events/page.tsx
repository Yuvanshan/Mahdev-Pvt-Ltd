'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, Gift, Church, Briefcase, Flower, Sun, X, Calendar, Check, MessageSquare } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BookingSystem from '@/components/BookingSystem';

const categories = [
  { id: 'wedding', title: 'Wedding Decorations', icon: Heart },
  { id: 'church', title: 'Church Decorations', icon: Church },
  { id: 'birthday', title: 'Birthday Decorations', icon: Gift },
  { id: 'corporate', title: 'Corporate Events', icon: Briefcase },
  { id: 'cultural', title: 'Cultural Events', icon: Sparkles },
  { id: 'school', title: 'School Events', icon: Flower }
];

const decorationsList = [
  {
    id: 'dec-1',
    title: 'The Imperial Marigold Stage Set',
    category: 'wedding',
    img: '/images/sws_robot_decor_1783346269673.jpg',
    price: 'Rs. 185,000',
    desc: 'A grand Mughal-inspired stage backdrop adorned with fresh marigolds, roses, ambient spot lighting, and premium couch settings.',
    services: ['Complete 24ft Backdrop Setup', 'Traditional Gold Couch settee', 'Pathway Walkway Pillars (8)', 'Dual Smoke Effects runs', 'Welcome Board with Easel'],
    availability: 'Available on request'
  },
  {
    id: 'dec-2',
    title: 'Glasshouse Canopy Altar',
    category: 'wedding',
    img: '/images/wedding_decoration_1782729925686.jpg',
    price: 'Rs. 240,000',
    desc: 'Sleek luxury transparent glass arches featuring custom wisteria floral overhangs, warm fairy lights, and gold candelabras.',
    services: ['Glass Canopy structure', 'Cascading Wisteria floristry', 'Up to 30 couple chairs decor', 'Warm Fairy Lights mesh', 'Intelligent spot light grids'],
    availability: 'Highly Booked (Lock date early)'
  },
  {
    id: 'dec-3',
    title: 'Holy Orchid Cathedral Sanctuary',
    category: 'church',
    img: '/images/church_decor.jpg',
    price: 'Rs. 95,000',
    desc: 'Pristine white altar runners using imported orchids, lilies, and green foliage matching the solemnity of holy unions.',
    services: ['Main Altar Long Runner', 'Pew flowers with satin ribbon', 'Entrance archway canopy', 'Kneeling stool upholstery floral decor'],
    availability: 'Available on weekends'
  },
  {
    id: 'dec-4',
    title: 'Vibrant Alice in Balloonland',
    category: 'birthday',
    img: '/images/birthday_decor.jpg',
    price: 'Rs. 65,000',
    desc: 'Fairytale balloon cascades in pastel shades featuring custom character cardboard overlays and personalized light-up naming boards.',
    services: ['Organic Balloon Arch (16ft)', 'Thematic 3D Character Backdrops', 'Personalized LED Neon light names', 'Cake table plinths set (3)'],
    availability: 'Available'
  },
  {
    id: 'dec-5',
    title: 'Executive Keynote Boardroom Gala',
    category: 'corporate',
    img: '/images/sws_robot_decor_1783346269673.jpg',
    price: 'Rs. 150,000',
    desc: 'Sleek minimalist panel setups with custom branded overlays, warm spot washes, and structured floral columns.',
    services: ['Sleek stage background wall', 'Custom vinyl corporate print', 'Warm wash uplighters (6)', 'VIP lounge couch sets', 'Media wall framing (10x8ft)'],
    availability: 'Available'
  },
  {
    id: 'dec-6',
    title: 'Royal Mandap Traditional Setup',
    category: 'cultural',
    img: '/images/sws_robot_decor_1783346269673.jpg',
    price: 'Rs. 135,000',
    desc: 'Intricately carved wood pillars, marigold curtains, brass oil lamps, and warm floor lighting arrangements.',
    services: ['Royal carved wood Mandap pillars (4)', 'Coconut leaf & mango leaf decor', 'Brass oil lamps (4)', 'Fresh flower hanging strings', 'Seated cushions floor setups'],
    availability: 'Available'
  }
];

export default function SwsEvents() {
  const [selectedCat, setSelectedCat] = useState('wedding');
  const [selectedItem, setSelectedItem] = useState<typeof decorationsList[0] | null>(null);
  const [showBooking, setShowBooking] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const filteredDecors = decorationsList.filter(item => item.category === selectedCat);

  // Floating gold petals and candle glow particles canvas background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const petals: Array<{ x: number; y: number; size: number; vy: number; vx: number; angle: number; rotSpeed: number }> = [];
    const maxPetals = 35;

    for (let i = 0; i < maxPetals; i++) {
      petals.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 6 + 3,
        vy: Math.random() * 0.8 + 0.4,
        vx: (Math.random() - 0.5) * 0.4,
        angle: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 0.02
      });
    }

    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw soft candlelight ambient glows
      ctx.fillStyle = 'rgba(223, 186, 115, 0.01)';
      ctx.beginPath();
      ctx.arc(width * 0.15, height * 0.25, 200, 0, Math.PI * 2);
      ctx.arc(width * 0.85, height * 0.75, 250, 0, Math.PI * 2);
      ctx.fill();

      // Render drifting gold petals
      for (let i = 0; i < maxPetals; i++) {
        const p = petals[i];
        p.y += p.vy;
        p.x += p.vx + Math.sin(p.y * 0.01) * 0.2;
        p.angle += p.rotSpeed;

        if (p.y > height) {
          p.y = -10;
          p.x = Math.random() * width;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        
        // Draw curved rose/wisteria petal shape
        ctx.fillStyle = 'rgba(197, 168, 128, 0.4)';
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Highlight gold edge
        ctx.strokeStyle = 'rgba(223, 186, 115, 0.25)';
        ctx.lineWidth = 0.5;
        ctx.stroke();

        ctx.restore();
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-navy-dark">
      {/* Background canvas backdrop */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 w-full h-full pointer-events-none opacity-40" />

      <Navbar />

      <main className="min-h-screen pt-20 relative z-10">
        {/* Immersive Header Banner */}
        <section className="relative h-[65vh] flex items-center justify-center overflow-hidden">
          <Image 
            src="/images/sws_robot_decor_1783346269673.jpg" 
            alt="SWS Events Banner" 
            fill
            priority
            className="object-cover brightness-[0.4] scale-105"
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
              Designing <span className="text-gradient-purple-blue">Luxury Environments</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-sans text-gray-300 text-sm sm:text-base max-w-xl leading-relaxed"
            >
              We bring royal aesthetics to life. From grand floral canopy weddings to professional corporate events, every detail is engineered to wow.
            </motion.p>
            <motion.button
              onClick={() => setShowBooking(true)}
              className="mt-4 px-8 py-4 rounded-full bg-gradient-to-r from-gold-accent to-gold-soft text-navy-dark font-sans text-xs font-bold tracking-widest shadow-lg shadow-gold-accent/15"
            >
              RESERVE EVENT DECOR
            </motion.button>
          </div>
        </section>

        {/* Decoration Categories Filters */}
        <section className="py-24 max-w-7xl mx-auto px-6 relative">
          <div className="text-center mb-16 flex flex-col gap-3">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-accent">
              DESIGN SUITE CATALOG
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-white">
              Bespoke Decoration Gallery
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm font-sans max-w-md mx-auto">Select a category below to explore pre-engineered stage architectures and booking availability.</p>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-3 mb-12">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCat === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCat(cat.id)}
                  className={`px-5 py-3 rounded-xl font-sans text-xs font-bold tracking-wider transition-all duration-300 flex items-center gap-2 ${
                    isActive 
                      ? 'bg-gradient-to-r from-gold-accent to-gold-soft text-navy-dark shadow-md shadow-gold-accent/10 border-none' 
                      : 'glass hover:bg-white/5 border border-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {cat.title.toUpperCase()}
                </button>
              );
            })}
          </div>

          {/* Catalog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDecors.map((item) => (
              <motion.div 
                layout
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="glass rounded-3xl overflow-hidden border border-white/5 group hover:border-gold-accent/30 transition-all duration-300 flex flex-col h-full hover:translate-y-[-4px] cursor-pointer shadow-xl"
              >
                <div className="relative h-60 w-full overflow-hidden">
                  <Image 
                    src={item.img} 
                    alt={item.title} 
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/95 to-transparent" />
                  <div className="absolute top-4 right-4 px-3 py-1 rounded bg-black/60 border border-white/10 text-xs font-bold text-gold-soft">
                    {item.price}
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1 gap-4 text-left">
                  <div>
                    <h3 className="font-display font-bold text-lg text-white group-hover:text-gold-soft transition-colors">{item.title}</h3>
                    <p className="font-sans text-xs text-gray-400 mt-2 leading-relaxed line-clamp-2">{item.desc}</p>
                  </div>
                  <div className="flex justify-between items-center mt-auto border-t border-white/5 pt-4">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Live Status:</span>
                    <span className="text-[10px] font-semibold text-green-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" />
                      {item.availability}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Detailed Item Modal */}
        <AnimatePresence>
          {selectedItem && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto"
            >
              <motion.div 
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()} 
                className="glass-premium rounded-3xl max-w-4xl w-full border border-gold-accent/25 overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] md:max-h-none"
              >
                <div className="relative w-full md:w-1/2 h-64 md:h-auto min-h-[300px]">
                  <Image 
                    src={selectedItem.img} 
                    alt={selectedItem.title} 
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-black/40 md:to-black/85" />
                  <button 
                    onClick={() => setSelectedItem(null)}
                    className="absolute top-6 left-6 p-2 rounded-full bg-black/60 text-white border border-white/10 md:hidden"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="w-full md:w-1/2 p-6 sm:p-10 flex flex-col gap-6 overflow-y-auto max-h-[60vh] md:max-h-none text-left">
                  <div className="flex justify-between items-start border-b border-white/5 pb-4">
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-gold-accent font-bold">DECORATION SUMMARY</span>
                      <h3 className="font-display font-black text-xl sm:text-2xl text-white mt-1">{selectedItem.title}</h3>
                    </div>
                    <button 
                      onClick={() => setSelectedItem(null)}
                      className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-all hidden md:block"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-xl bg-white/5">
                    <span className="text-xs text-gray-400 font-sans">Corporate Booking Rate</span>
                    <span className="font-display font-black text-base text-gold-soft">{selectedItem.price}</span>
                  </div>

                  <p className="font-sans text-xs sm:text-sm text-gray-300 leading-relaxed">{selectedItem.desc}</p>

                  <div className="flex flex-col gap-3">
                    <h4 className="text-[10px] uppercase font-bold text-gold-accent tracking-wider font-sans">Included Services:</h4>
                    <ul className="flex flex-col gap-2 font-sans text-xs text-gray-300">
                      {selectedItem.services.map((ser, sIdx) => (
                        <li key={sIdx} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-400 shrink-0" />
                          <span>{ser}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-white/5">
                    <button
                      onClick={() => {
                        setSelectedItem(null);
                        setShowBooking(true);
                      }}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-accent to-gold-soft text-navy-dark font-sans text-xs font-bold tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-1.5"
                    >
                      BOOK DECORATION NOW
                    </button>
                    <a
                      href={`https://wa.me/94768988970?text=Hi%20SWS%20Event%20Management,%20I%20am%20interested%20in%20${selectedItem.title}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 rounded-xl border border-green-500/20 hover:bg-green-500/10 text-green-400 font-sans text-xs font-bold tracking-wider flex items-center justify-center gap-2 transition-all"
                    >
                      <MessageSquare className="w-4 h-4" />
                      INQUIRE ON WHATSAPP
                    </a>
                  </div>
                </div>
              </motion.div>
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
                <BookingSystem initialDivision="sws-events" onSuccess={() => setTimeout(() => setShowBooking(false), 2000)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
