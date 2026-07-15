/**
 * Premium Hero Section - Clean Professional Design
 * Features prominent 4-service card layout with enhanced visibility
 */

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, ChevronDown, Camera, Compass, Plane, Code, Lightbulb } from 'lucide-react';
import { ActivePage } from '../types';
import { COMPANY_CONTACT } from '../data';

interface HeroCard {
  id: number;
  title: string;
  subtitle: string;
  color: string;
  borderColor: string;
  bgGradient: string;
  textColor: string;
  accentColor: string;
  image: string;
  page: ActivePage;
  description?: string;
  icon?: React.ReactNode;
}

interface PremiumHeroProps {
  isDarkMode: boolean;
  onNavigate: (page: ActivePage) => void;
  cards: HeroCard[];
}

export default function PremiumHero({ isDarkMode, onNavigate, cards }: PremiumHeroProps) {
  const [selected, setSelected] = useState(0);
  // Optimized easing for smooth 60fps animations with GPU acceleration
  const smoothEase = { type: 'spring', stiffness: 120, damping: 24, mass: 1 } as any;

  // Service descriptions derived from card.page (prevents index mismatch)
  const serviceDescriptionsByPage: Partial<Record<ActivePage, { title: string; desc: string; icon: React.ReactNode }>> = {
    [ActivePage.Photography]: {
      title: 'Photography & Cinema',
      desc: 'Cinematic storytelling for weddings, corporate events, and brand narratives',
      icon: <Camera className="w-6 h-6" />
    },
    [ActivePage.Decoration]: {
      title: 'Event & Decoration',
      desc: 'Stunning event design with premium balloon installations and decor',
      icon: <Lightbulb className="w-6 h-6" />
    },
    [ActivePage.ItSolutions]: {
      title: 'IT Solutions',
      desc: 'Custom web apps, cloud infrastructure, and digital transformation',
      icon: <Code className="w-6 h-6" />
    },
    [ActivePage.Travels]: {
      title: 'Travel & Logistics',
      desc: 'Luxury vehicle fleet and curated tour packages worldwide',
      icon: <Plane className="w-6 h-6" />
    }
  };

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSelected((prev) => (prev + 1) % Math.min(cards.length, 4));
    }, 5500);
    return () => window.clearInterval(timer);
  }, [cards.length]);

  const stats = [
    { label: 'Projects', value: '120+', icon: '📊' },
    { label: 'Clients', value: '95%', icon: '⭐' },
    { label: 'Experience', value: '10+', icon: '🎯' },
    { label: 'Support', value: '24/7', icon: '🔧' }
  ];

  const handleConsultation = () => {
    window.open(COMPANY_CONTACT.whatsapp, '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="services-overview" className={`relative w-full overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-gradient-to-b from-black via-slate-950 to-black' : 'bg-gradient-to-b from-slate-50 via-white to-slate-100'}`}>
      {/* Animated background - optimized for 60fps GPU acceleration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-amber-500/20 blur-3xl will-change-opacity"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-blue-500/15 blur-3xl will-change-opacity"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 backdrop-blur-sm">
            <Sparkles size={16} className="text-amber-500" />
            <span className={`text-sm font-semibold ${isDarkMode ? 'text-amber-300' : 'text-amber-700'}`}>
              Four Elite Services
            </span>
          </div>
          
          <h1 className={`text-4xl md:text-5xl lg:text-6xl font-black mb-4 leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Mahdev's <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400 bg-clip-text text-transparent">Premium Services</span>
          </h1>
          
          <p className={`text-lg md:text-xl max-w-3xl mx-auto ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            Comprehensive solutions in photography, events, technology, and travel designed for excellence
          </p>
        </motion.div>

        {/* Four Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {cards.slice(0, 4).map((card, idx) => {
            const isActive = selected === idx;
            const desc = serviceDescriptionsByPage[card.page] ?? {
              title: card.title,
              desc: card.description ?? 'Explore this service',
              icon: card.icon
            };
            
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                onMouseEnter={() => setSelected(idx)}
                className="group h-full cursor-pointer"
              >
                <motion.div
                  animate={{
                    scale: isActive ? 1.05 : 1,
                    y: isActive ? -8 : 0,
                  }}
                  transition={{ duration: 0.28, ...smoothEase }}
                  className={`relative h-full rounded-2xl overflow-hidden border transition-all duration-300 shadow-lg will-change-transform ${
                    isActive
                      ? `${card.borderColor} shadow-2xl`
                      : `${isDarkMode ? 'border-slate-700' : 'border-slate-200'} shadow-lg`
                  }`}
                  style={{ transformOrigin: 'center' }}
                >
                  {/* Background Image with lazy loading */}
                  <img
                    src={card.image}
                    alt={card.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />

                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 ${card.bgGradient} mix-blend-multiply opacity-80`} />
                  <motion.div
                    animate={{ opacity: isActive ? 0.3 : 0.5 }}
                    transition={{ duration: 0.25 }}
                    className="absolute inset-0 bg-black will-change-opacity"
                  />

                  {/* Shine effect on hover */}
                  <motion.div
                    animate={{ opacity: isActive ? 0.15 : 0 }}
                    transition={{ duration: 0.25 }}
                    className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent will-change-opacity"
                  />

                  {/* Content */}
                  <div className="relative h-full flex flex-col justify-between p-6 md:p-8">
                    {/* Top: Icon & Number */}
                    <div>
                      <motion.div
                        animate={{ scale: isActive ? 1.12 : 1 }}
                        transition={{ duration: 0.25, ...smoothEase }}
                        className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${card.bgGradient} border border-white/20 mb-4 will-change-transform`}
                      >
                        {desc.icon && (
                          <div className="text-white">{desc.icon}</div>
                        )}
                      </motion.div>
                      
                      <motion.h3
                        animate={{ fontSize: isActive ? '1.75rem' : '1.5rem' }}
                        transition={{ duration: 0.25 }}
                        className="text-2xl md:text-xl font-black text-white mb-2 leading-tight"
                      >
                        {desc.title}
                      </motion.h3>
                    </div>

                    {/* Bottom: Description & CTA */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: isActive ? 1 : 0.8 }}
                      transition={{ duration: 0.25 }}
                      className="will-change-opacity"
                    >
                      <p className={`text-sm mb-4 leading-relaxed ${isActive ? 'text-white' : 'text-white/70'}`}>
                        {desc.desc}
                      </p>
                      
                        <motion.button
                          whileHover={{ x: 4 }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ duration: 0.18, ease: 'easeOut' }}
                          onClick={() => onNavigate(card.page)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/15 hover:bg-white/25 text-white font-semibold text-sm transition-all duration-300 border border-white/20 hover:border-white/40"
                        >
                          <span>Explore</span>
                          <ArrowRight size={16} />
                        </motion.button>
                    </motion.div>

                    {/* Active Indicator */}
                    <motion.div
                      animate={{ opacity: isActive ? 1 : 0, scale: isActive ? 1 : 0.8 }}
                      transition={{ duration: 0.25 }}
                      className="absolute top-4 right-4 w-3 h-3 rounded-full bg-amber-400 shadow-lg shadow-amber-400/50 will-change-transform"
                    />
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Stats Section - optimized for smooth interaction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              whileHover={{ scale: 1.04, y: -3 }}
              transition={{ duration: 0.2, ...smoothEase }}
              className={`rounded-xl p-6 border backdrop-blur-sm transition-all duration-300 will-change-transform ${isDarkMode ? 'bg-slate-900/60 border-slate-700/50 hover:border-amber-500/50' : 'bg-white/60 border-slate-200/50 hover:border-amber-400/50'}`}
            >
              <div className="text-2xl font-black text-amber-400 mb-2">{stat.icon} {stat.value}</div>
              <div className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Buttons - smoother interactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2, ...smoothEase }}
            onClick={handleConsultation}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-900 font-bold text-lg shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all duration-300 inline-flex items-center gap-3 will-change-transform"
          >
            <span>Get Free Consultation</span>
            <ArrowRight size={20} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2, ...smoothEase }}
            onClick={() => window.scrollBy({ top: 600, behavior: 'smooth' })}
            className={`px-8 py-4 rounded-xl font-bold text-lg border-2 transition-all duration-300 will-change-transform ${
              isDarkMode
                ? 'border-amber-500/50 text-amber-300 bg-amber-500/5 hover:bg-amber-500/10 hover:border-amber-400'
                : 'border-amber-400/50 text-amber-700 bg-amber-50 hover:bg-amber-100 hover:border-amber-500'
            }`}
          >
            Learn More
          </motion.button>
        </motion.div>

        {/* Scroll Indicator - smooth continuous animation */}
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="flex justify-center mt-12 will-change-transform"
        >
          <div className={`flex items-center gap-2 text-sm font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            <ChevronDown size={18} />
            <span>Scroll to explore more</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
