'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Info, MessageSquare } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export default function Portfolio() {
  const [filter, setFilter] = useState('All');
  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const [galleryList, setGalleryList] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'gallery'), (snap) => {
      const list = snap.docs.map(docDoc => ({ id: docDoc.id, ...docDoc.data() }));
      setGalleryList(list);
    });
    return () => unsub();
  }, []);

  const activeItems = galleryList;

  const categories = ['All', ...Array.from(new Set(activeItems.map(item => item.category)))];

  const filteredItems = filter === 'All' 
    ? activeItems 
    : activeItems.filter(item => item.category === filter);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-navy-dark pt-32 pb-24">
        {/* Glow ball background */}
        <div className="glow-ball glow-ball-purple w-96 h-96 top-20 -left-10 opacity-10" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          
          {/* Header */}
          <div className="text-center mb-16 flex flex-col gap-3">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-accent">
              CONGLOMERATE EXHIBIT
            </span>
            <h1 className="font-display font-black text-4xl sm:text-5xl text-white tracking-tight">
              Selected Work & Projects
            </h1>
            <p className="font-sans text-gray-400 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
              Browse our architectural builds across enterprise inventory SaaS portals, luxury floral stage setups, and cinematic film productions.
            </p>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap justify-center items-center gap-3 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-6 py-2.5 rounded-full font-sans text-xs font-semibold tracking-wider transition-all duration-300 ${
                  filter === cat 
                    ? 'bg-gradient-to-r from-gold-accent to-gold-soft text-navy-dark shadow-md shadow-gold-accent/15 border-none' 
                    : 'glass hover:bg-white/5 border border-white/10 text-gray-300 hover:text-white'
                }`}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Masonry-like Grid */}
          <motion.div 
            layout 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  key={item.id}
                  onClick={() => setSelectedImg(item.img)}
                  className="relative h-80 rounded-3xl overflow-hidden border border-white/5 group cursor-pointer shadow-xl"
                >
                  <Image 
                    src={item.img} 
                    alt={item.title} 
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500 brightness-95 group-hover:brightness-75"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6" />
                  <div className="absolute inset-x-6 bottom-6 flex flex-col gap-1 transition-transform duration-300 transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100">
                    <span className="text-[9px] uppercase tracking-wider text-gold-accent font-bold">{item.category}</span>
                    <h4 className="font-display font-bold text-lg text-white leading-tight">{item.title}</h4>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

        </div>

        {/* Lightbox Modal */}
        <AnimatePresence>
          {selectedImg && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImg(null)}
              className="fixed inset-0 bg-black/95 z-[999] flex items-center justify-center p-4 backdrop-blur-md"
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
      </main>

      <Footer />
    </>
  );
}
