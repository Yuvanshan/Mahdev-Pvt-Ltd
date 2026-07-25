'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Sparkles, Calendar, CheckCircle, ArrowLeft, Heart, Church, Gift, Briefcase, Flower, Sun, Camera, Film, Compass, User, Palette, Cpu, Terminal, Globe, Shield, Layers, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BookingSystem from '@/components/BookingSystem';

const iconMap: Record<string, any> = {
  Heart, Church, Gift, Briefcase, Flower, Sun, Camera, Film, Compass, User, Palette, Cpu, Terminal, Globe, Shield, Layers, Sparkles
};

export default function DynamicDivision() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const [division, setDivision] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const fetchDivision = async () => {
      try {
        const q = query(collection(db, 'divisions'), where('slug', '==', slug));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setDivision(snap.docs[0].data());
        } else {
          // Fallback static check for testing / local development
          const fallbacks: Record<string, any> = {
            'erp': {
              name: 'Mahdev ERP Systems',
              tagline: 'Streamlining Omnichannel Enterprises',
              description: 'Double-entry bookkeeping, cloud-synchronized inventory ledgers, and specialized billing systems tailored for schools, hotels, and restaurants.',
              gradient: 'from-amber-500/20 to-orange-500/20',
              accentColor: '#f59e0b',
              bgImage: '/images/it_robot_developer_1783346302442.jpg',
              services: [
                { title: 'Ledger Bookkeeping', description: 'Real-time double-entry corporate accounting logs.', iconName: 'Layers' },
                { title: 'Multi-Warehouse Inventory', description: 'Synchronized stock counts across multiple physical outlets.', iconName: 'Cpu' },
                { title: 'POS Thermal Checkouts', description: 'Offline-first cash register checkpoints with printer sync.', iconName: 'Terminal' }
              ]
            }
          };
          if (fallbacks[slug]) {
            setDivision(fallbacks[slug]);
          }
        }
      } catch (err) {
        console.error("Failed to query dynamic division", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDivision();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-dark flex flex-col items-center justify-center gap-4 text-white">
        <div className="w-10 h-10 border-2 border-gold-accent border-t-transparent rounded-full animate-spin" />
        <span className="text-xs uppercase tracking-[0.2em] text-gray-500">Querying division architecture...</span>
      </div>
    );
  }

  if (!division) {
    return (
      <div className="min-h-screen bg-navy-dark flex flex-col items-center justify-center gap-6 text-white px-6">
        <h3 className="font-display font-black text-2xl text-red-500 uppercase tracking-wider">Division Not Found</h3>
        <p className="text-xs text-gray-400 font-sans max-w-sm text-center">The business division `{slug}` is not registered in our cloud registry or configuration files.</p>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-xs text-white font-sans font-bold flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> BACK TO HOMEPAGE
        </button>
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-navy-dark pt-20">
        {/* Banner with custom themed glows */}
        <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
          <Image 
            src={division.bgImage || '/images/sws_robot_decor_1783346269673.jpg'} 
            alt={division.name} 
            fill
            priority
            className="object-cover brightness-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/30 to-transparent" />
          
          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center flex flex-col items-center gap-4">
            <span className="px-3 py-1 rounded-full glass text-xs font-bold uppercase tracking-wider" style={{ color: division.accentColor, borderColor: `${division.accentColor}40` }}>
              {division.name.toUpperCase()}
            </span>
            <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-7xl text-white tracking-tight leading-tight">
              {division.tagline}
            </h1>
            <p className="font-sans text-gray-300 text-base sm:text-lg max-w-xl leading-relaxed">
              {division.description}
            </p>
            <button
              onClick={() => setShowBooking(true)}
              className="mt-2 px-8 py-4 rounded-full font-sans text-xs font-bold tracking-widest text-navy-dark shadow-lg"
              style={{ backgroundColor: division.accentColor }}
            >
              BOOK CONSULTATION
            </button>
          </div>
        </section>

        {/* Dynamic Services List */}
        <section className="py-24 max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 flex flex-col gap-3">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em]" style={{ color: division.accentColor }}>
              OPERATIONAL SUITE
            </span>
            <h2 className="font-display font-black text-3xl text-white">
              Dynamic Services & Capabilities
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm max-w-sm mx-auto font-sans">Learn about the capabilities configured for this division sector.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {division.services?.map((serv: any, idx: number) => {
              const Icon = iconMap[serv.iconName] || Sparkles;
              return (
                <div 
                  key={idx}
                  className="glass p-6 rounded-3xl border border-white/5 hover:border-gold-accent/20 transition-all duration-300 group flex flex-col gap-4 text-left"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5" style={{ color: division.accentColor }}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-white text-lg group-hover:text-gold-soft transition-colors">{serv.title}</h3>
                    <p className="font-sans text-sm text-gray-400 mt-2 leading-relaxed">{serv.description}</p>
                  </div>
                </div>
              );
            })}
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
                <BookingSystem initialDivision="it-solutions" onSuccess={() => setTimeout(() => setShowBooking(false), 2000)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </>
  );
}
