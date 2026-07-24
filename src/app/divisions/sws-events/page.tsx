'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, Gift, Church, Briefcase, Flower, Home, Sun, X, ChevronRight, MessageSquare, Calendar } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const categories = [
  { id: 'wedding', title: 'Wedding Decorations', desc: 'Magical, royal, and luxury stages, entry walkways, and floral canopies tailored to your exact wedding theme.', icon: Heart, img: '/images/wedding_decoration_1782729925686.jpg' },
  { id: 'church', title: 'Church Decorations', desc: 'Solemn, elegant, and serene floral arrangements, pew linings, and altar backdrops for holy unions.', icon: Church, img: '/images/church_decor.jpg' },
  { id: 'birthday', title: 'Birthday Decorations', desc: 'Whimsical balloon arches, vibrant theme backdrops, and fairytale child settings.', icon: Gift, img: '/images/birthday_decor.jpg' },
  { id: 'corporate', title: 'Corporate Events', desc: 'Sleek branding boards, keynote stages, VIP lounges, and professional corporate styling.', icon: Briefcase, img: '/images/sws_robot_decor_1783346269673.jpg' },
  { id: 'flower', title: 'Flower Decoration', desc: 'Exotic traditional arrangements using marigolds, imported orchids, and premium roses.', icon: Flower, img: '/images/sws_robot_decor_1783346269673.jpg' },
  { id: 'outdoor', title: 'Outdoor Settings', desc: 'Bohemian lawn canopies, garden setups, and evening fairy-light lounge designs.', icon: Sun, img: '/images/wedding_decoration_1782729925686.jpg' }
];

const galleryItems = [
  { title: 'The Imperial Marigold Stage', category: 'Wedding', img: '/images/sws_robot_decor_1783346269673.jpg' },
  { title: 'Vibrant Alice Balloon Arch', category: 'Birthday', img: '/images/birthday_decor.jpg' },
  { title: 'Modern Tech Keynote Gala', category: 'Corporate', img: '/images/sws_robot_decor_1783346269673.jpg' },
  { title: 'Holy Orchid Sanctuary Setup', category: 'Church', img: '/images/church_decor.jpg' },
  { title: 'Whimsical Rustic Garden Gate', category: 'Outdoor', img: '/images/wedding_decoration_1782729925686.jpg' },
  { title: 'Royal Mughal Durbar Banquet', category: 'Stage', img: '/images/sws_robot_decor_1783346269673.jpg' }
];

export default function SwsEvents() {
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-navy-dark pt-20">
        {/* Banner Section */}
        <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
          <Image 
            src="/images/sws_robot_decor_1783346269673.jpg" 
            alt="SWS Events Banner" 
            fill
            priority
            className="object-cover brightness-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/30 to-transparent" />
          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center flex flex-col items-center gap-4">
            <span className="px-3 py-1 rounded-full glass border border-purple-500/35 text-purple-300 text-xs font-bold uppercase tracking-wider">
              SWS EVENT MANAGEMENT
            </span>
            <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-tight">
              Creating Spaces of <span className="text-gradient-purple-blue">Unrivaled Luxury</span>
            </h1>
            <p className="font-sans text-gray-300 text-base sm:text-lg max-w-xl leading-relaxed">
              We design and coordinate breathtaking visual environments for luxury weddings, solemn church functions, and elite corporate gala events.
            </p>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-24 max-w-7xl mx-auto px-6 relative">
          <div className="text-center mb-16 flex flex-col gap-3">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-accent">
              DESIGN PORTFOLIO
            </span>
            <h2 className="font-display font-bold text-3xl text-white">
              Bespoke Decoration Categories
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <div 
                  key={cat.id}
                  className="glass rounded-3xl overflow-hidden border border-white/5 group hover:border-gold-accent/30 transition-all duration-300 flex flex-col h-full hover:translate-y-[-4px]"
                >
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image 
                      src={cat.img} 
                      alt={cat.title} 
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/90 to-transparent" />
                  </div>
                  <div className="p-6 flex flex-col flex-1 gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-display font-bold text-lg text-white group-hover:text-gold-soft transition-colors">{cat.title}</h3>
                    </div>
                    <p className="font-sans text-xs sm:text-sm text-gray-400 leading-relaxed flex-1">{cat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Gallery Grid */}
        <section className="py-20 bg-navy-medium/30 relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12 flex flex-col gap-3">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-accent">
                EVENT LIGHTBOX
              </span>
              <h2 className="font-display font-bold text-3xl text-white">
                Featured Decorations Showcase
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryItems.map((item, idx) => (
                <div 
                  key={idx}
                  onClick={() => setSelectedImg(item.img)}
                  className="relative h-72 rounded-3xl overflow-hidden border border-white/5 group cursor-pointer shadow-xl"
                >
                  <Image 
                    src={item.img} 
                    alt={item.title} 
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700 brightness-90 group-hover:brightness-75"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6" />
                  <div className="absolute inset-x-6 bottom-6 flex flex-col gap-1 transition-transform duration-300 transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100">
                    <span className="text-[9px] uppercase tracking-wider text-gold-accent font-bold">{item.category}</span>
                    <h4 className="font-display font-bold text-lg text-white">{item.title}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Inquire CTA Banner */}
        <section className="py-24 max-w-5xl mx-auto px-6 relative z-10 text-center">
          <div className="glass-premium rounded-3xl p-10 sm:p-12 border border-gold-accent/20 flex flex-col items-center gap-6 shadow-2xl">
            <h3 className="font-display font-black text-2xl sm:text-3xl text-white">
              Planning a Luxury Wedding or Corporate Gala?
            </h3>
            <p className="font-sans text-gray-400 max-w-xl text-sm sm:text-base leading-relaxed">
              Contact our leading SWS decorators. We can set up a mood board session and custom budget breakdown for your event.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-2 w-full sm:w-auto">
              <Link 
                href="/contact"
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-gold-accent to-gold-soft text-navy-dark font-sans font-bold text-sm tracking-wider rounded-full hover:brightness-110 shadow-lg shadow-gold-accent/15 transition-all"
              >
                REQUEST EVENT QUOTE
              </Link>
              <a 
                href="https://wa.me/94768988970?text=Hi%20SWS%20Event%20Management,%20I%20would%20like%20to%20discuss%20decorations" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-3.5 glass hover:bg-white/5 border border-white/10 text-white font-sans font-semibold text-sm tracking-wider rounded-full flex items-center justify-center gap-2 transition-all"
              >
                <MessageSquare className="w-4 h-4 text-green-400" />
                CHAT ON WHATSAPP
              </a>
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
