'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Rajesh Singhania',
    role: 'Managing Director, Singhania Jewellers',
    rating: 5,
    comment: 'Mahdev Pvt Ltd decorated our daughter’s wedding in Colombo and it looked like a literal palace! The marigold arches and fairy lighting was absolutely breathtaking. Simultaneously, we automated our retail store billing with their POS ERP system. Outstanding multi-skilled team!',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fm=webp&fit=crop&q=60&w=120'
  },
  {
    id: 2,
    name: 'Dr. Anjali Mehta',
    role: 'Founder, Mehta Eye & Dental Clinics',
    rating: 5,
    comment: 'We hired them for website development and UI/UX design. They built an exceptionally responsive client portal. We were so impressed that we integrated their clinic attendance module. Truly professional and reliable.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?fm=webp&fit=crop&q=60&w=120'
  },
  {
    id: 3,
    name: 'Karan Malhotra',
    role: 'Executive Chef, Spice Kraft Restaurants',
    rating: 5,
    comment: 'Their Restaurant POS and payroll system saved us over 40 hours of manual bookkeeping each month. We also contracted their photography wing for our culinary shoot. The cinematic lighting is award-winning!',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?fm=webp&fit=crop&q=60&w=120'
  }
];

export default function Testimonials() {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % testimonials.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const next = () => {
    setActiveIdx((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setActiveIdx((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="w-full py-20 relative bg-navy-medium/30 overflow-hidden">
      <div className="glow-ball glow-ball-purple w-80 h-80 top-1/2 left-0 opacity-10" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="text-center mb-12 flex flex-col gap-3">
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-accent">
            CLIENT TESTIMONIALS
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white">
            Trusted by Leaders Across Industries
          </h2>
        </div>

        <div className="relative min-h-[320px] sm:min-h-[260px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIdx}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -50, scale: 0.95 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="w-full glass-premium rounded-3xl p-8 sm:p-10 border border-gold-accent/15 flex flex-col gap-6 relative"
            >
              <Quote className="absolute top-6 right-8 w-12 h-12 text-gold-accent/10 pointer-events-none" />

              <div className="flex items-center gap-1">
                {Array.from({ length: testimonials[activeIdx].rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-gold-soft text-gold-soft" />
                ))}
              </div>

              <p className="font-sans text-gray-300 text-base sm:text-lg leading-relaxed italic">
                "{testimonials[activeIdx].comment}"
              </p>

              <div className="flex items-center gap-4 mt-2 border-t border-white/5 pt-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border border-gold-accent/20">
                  <Image 
                    src={testimonials[activeIdx].avatar} 
                    alt={testimonials[activeIdx].name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-display font-bold text-white text-sm sm:text-base">
                    {testimonials[activeIdx].name}
                  </h4>
                  <p className="font-sans text-xs text-gray-400">
                    {testimonials[activeIdx].role}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-center items-center gap-4 mt-8">
          <button 
            onClick={prev}
            className="w-10 h-10 rounded-full glass border border-white/10 hover:border-gold-accent/30 flex items-center justify-center text-gray-400 hover:text-white transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-1.5">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIdx(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeIdx === idx ? 'w-6 bg-gold-soft' : 'w-1.5 bg-white/20'
                }`}
              />
            ))}
          </div>

          <button 
            onClick={next}
            className="w-10 h-10 rounded-full glass border border-white/10 hover:border-gold-accent/30 flex items-center justify-center text-gray-400 hover:text-white transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
