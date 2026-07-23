'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Film, Compass, User, Palette, Sparkles, X, ChevronRight, CheckCircle, MessageSquare } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const pricingList = [
  {
    title: 'Essential Shoot',
    price: 'Rs. 24,999',
    duration: '1 Day Session',
    color: 'border-white/5',
    features: [
      '1 Lead Photographer',
      'High-Resolution Edited Digital Copies (150+)',
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
      'High-Altitude Drone Shoots (Weather permitting)',
      'Full Cinematic Movie (15-20 mins)',
      'Premium Leatherette Physical Photobook (40 Pages)',
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
      'Unlimited Drone Arial Footage & Steadicam Runs',
      'Full length movie & Instagram Reels package',
      '2 Copy Luxury Hardcover Photobooks',
      'Live photo viewing stream on custom cloud portal',
      'Premium Baby/Family portraits included'
    ]
  }
];

const categories = [
  { title: 'Eternal Golden Hour Union', category: 'Wedding Photography', img: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?fm=webp&fit=crop&q=65&w=600' },
  { title: 'Cinematic Movie Teaser Reel', category: 'Cinematography', img: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?fm=webp&fit=crop&q=65&w=600' },
  { title: 'Grand Palace Aerial Horizon', category: 'Drone Photography', img: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?fm=webp&fit=crop&q=65&w=600' },
  { title: 'Enchanted Forest Session', category: 'Outdoor Shoots', img: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?fm=webp&fit=crop&q=65&w=600' },
  { title: 'Prism Light Studio Portrait', category: 'Studio Photography', img: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?fm=webp&fit=crop&q=65&w=600' },
  { title: 'Sleeping Cherub newborn Session', category: 'Baby Shoots', img: 'https://images.unsplash.com/photo-1519689680058-324335c77ebf?fm=webp&fit=crop&q=65&w=600' }
];

export default function U1Studio() {
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-navy-dark pt-20">
        {/* Banner Section */}
        <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
          <Image 
            src="/images/u1_robot_camera_1783346286743.jpg" 
            alt="U1 Studio Banner" 
            fill
            priority
            className="object-cover brightness-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/30 to-transparent" />
          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center flex flex-col items-center gap-4">
            <span className="px-3 py-1 rounded-full glass border border-cyan-500/35 text-cyan-300 text-xs font-bold uppercase tracking-wider">
              STUDIO U1
            </span>
            <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-tight">
              Capturing Fleeting <span className="text-gradient-cyan">Raw Emotions</span>
            </h1>
            <p className="font-sans text-gray-300 text-base sm:text-lg max-w-xl leading-relaxed">
              Award-winning cinematography and portraiture. We freeze raw human bonds and grand architectures with cinematic lens systems.
            </p>
          </div>
        </section>

        {/* Division Services Grid */}
        <section className="py-24 max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 flex flex-col gap-3">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-accent">
              OUR CAPABILITIES
            </span>
            <h2 className="font-display font-bold text-3xl text-white">
              Professional Production Services
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Camera, title: 'Wedding & Candid', desc: 'Capturing split-second laughs and tearful glances with prime portrait lenses and natural lighting.' },
              { icon: Film, title: 'Cinematography', desc: '10-bit log files, advanced gimbal stabilization runs, and custom lut color-grading pipelines.' },
              { icon: Compass, title: 'Aerial Drone Runs', desc: 'Capturing sweeping lawn layouts, ocean backdrops, and birds-eye landscape videos.' },
              { icon: User, title: 'Newborn & Family', desc: 'Comfortable temperature-controlled studio spaces to capture secure initial milestones.' },
              { icon: Palette, title: 'Outdoor Shoots', desc: 'Curating natural forest coordinates and coastal paths for pre-wedding portfolio shoots.' },
              { icon: Sparkles, title: 'Studio Portfolios', desc: 'Bespoke corporate headshots, glamour photography, and commercial product catalogs.' }
            ].map((serv, idx) => {
              const Icon = serv.icon;
              return (
                <div 
                  key={idx}
                  className="glass p-6 rounded-3xl border border-white/5 hover:border-gold-accent/20 transition-all duration-300 group flex flex-col gap-4"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 text-cyan-400">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-white text-lg group-hover:text-gold-soft transition-colors">{serv.title}</h3>
                    <p className="font-sans text-sm text-gray-400 mt-2 leading-relaxed">{serv.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Pricing Tables */}
        <section className="py-24 bg-navy-medium/30 relative overflow-hidden">
          <div className="glow-ball glow-ball-blue w-96 h-96 top-20 -left-10 opacity-10" />

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16 flex flex-col gap-3">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-accent">
                TRANSPARENT VALUE
              </span>
              <h2 className="font-display font-bold text-3xl text-white">
                Cinematic Production Packages
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {pricingList.map((tier, idx) => (
                <div 
                  key={idx}
                  className={`glass p-8 rounded-3xl border ${tier.color} flex flex-col relative hover:translate-y-[-4px] transition-transform duration-300`}
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

                  <Link 
                    href="/contact"
                    className="w-full py-3 rounded-xl bg-white/5 border border-white/10 hover:border-gold-accent/50 text-center text-white font-sans text-xs font-semibold hover:bg-gold-accent hover:text-navy-dark transition-all tracking-wider"
                  >
                    BOOK SESSION
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Studio Masonry Showcase */}
        <section className="py-24 max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 flex flex-col gap-3">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-accent">
              PORTFOLIO MATRIX
            </span>
            <h2 className="font-display font-bold text-3xl text-white">
              Studio & On-Location Highlights
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((item, idx) => (
              <div 
                key={idx}
                onClick={() => setSelectedImg(item.img)}
                className="relative h-72 rounded-3xl overflow-hidden border border-white/5 group cursor-pointer shadow-xl"
              >
                <Image 
                  src={item.img} 
                  alt={item.title} 
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700 brightness-95 group-hover:brightness-75"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6" />
                <div className="absolute inset-x-6 bottom-6 flex flex-col gap-1 transition-transform duration-300 transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100">
                  <span className="text-[9px] uppercase tracking-wider text-cyan-400 font-bold">{item.category}</span>
                  <h4 className="font-display font-bold text-lg text-white">{item.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 max-w-5xl mx-auto px-6 relative z-10 text-center">
          <div className="glass-premium rounded-3xl p-10 sm:p-12 border border-gold-accent/20 flex flex-col items-center gap-6 shadow-2xl">
            <h3 className="font-display font-black text-2xl sm:text-3xl text-white">
              Have an Upcoming Commercial project or Wedding Shoot?
            </h3>
            <p className="font-sans text-gray-400 max-w-xl text-sm sm:text-base leading-relaxed">
              Contact our team of photographers. We can review date availability and structure a customized itinerary.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-2 w-full sm:w-auto">
              <Link 
                href="/contact"
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-gold-accent to-gold-soft text-navy-dark font-sans font-bold text-sm tracking-wider rounded-full hover:brightness-110 shadow-lg shadow-gold-accent/15 transition-all"
              >
                REQUEST PRODUCTION INQUIRY
              </Link>
              <a 
                href="https://wa.me/94768988970?text=Hi%20Studio%20U1,%20I%20would%20like%20to%20book%20a%20shoot" 
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
