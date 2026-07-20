import { useState, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue, useVelocity, useAnimationFrame } from 'motion/react';
import { ArrowRight, Play, Users, Layers, Headset, ShieldCheck, X, ChevronDown } from 'lucide-react';
import { ActivePage, ThemeSettings } from '../types';
import { COMPANY_CONTACT } from '../data';

import itRobotImgAsset from '../assets/images/it_robot_developer_1783346302442.jpg';

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
}

interface PremiumHeroProps {
  isDarkMode: boolean;
  onNavigate: (page: ActivePage) => void;
  cards: HeroCard[];
  themeSettings?: ThemeSettings;
}

// Infinite marquee ticker for the partner bar
function FloatingTicker({ items }: { items: string[] }) {
  const baseX = useMotionValue(0);
  const x = useSpring(baseX, { damping: 50, stiffness: 400 });

  useAnimationFrame((_t, delta) => {
    baseX.set(baseX.get() - (delta / 1000) * 35);
    if (baseX.get() < -600) baseX.set(0);
  });

  const doubled = [...items, ...items];

  return (
    <div className="overflow-hidden w-full">
      <motion.div style={{ x }} className="flex gap-10 whitespace-nowrap">
        {doubled.map((item, i) => (
          <span key={i} className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-slate-300 transition-colors shrink-0 font-mono">
            {item} <span className="text-purple-600 mx-2">◆</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export default function PremiumHero({ isDarkMode, onNavigate, cards: _cards, themeSettings }: PremiumHeroProps) {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start']
  });

  // Parallax transforms — different speeds for depth layers
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '35%']);
  const robotY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const leftColY = useTransform(scrollYProgress, [0, 1], ['0%', '12%']);
  const gridOpacity = useTransform(scrollYProgress, [0, 0.6], [0.07, 0]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  // Smooth spring physics
  const smoothRobotY = useSpring(robotY, { stiffness: 60, damping: 20 });
  const smoothLeftY = useSpring(leftColY, { stiffness: 80, damping: 25 });

  const handleConsultation = () => {
    window.open(COMPANY_CONTACT.whatsapp, '_blank', 'noopener,noreferrer');
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const orbitalBadges = [
    {
      id: 'erp',
      title: 'Mahdev ERP',
      subtitle: 'Smart ERP & Software',
      page: ActivePage.ItSolutions,
      position: { top: '4%', left: '-8%' },
      mobilePosition: { top: '2%', left: '-4%' },
      gradient: 'from-purple-900/90 to-indigo-950/90 border-purple-500/40',
      textColor: 'text-purple-300',
      iconBg: 'bg-purple-500/20 text-purple-400',
      icon: '⚡',
      delay: 0.5
    },
    {
      id: 'sws',
      title: 'SWS Events',
      subtitle: 'Luxury Styling & Decor',
      page: ActivePage.Decoration,
      position: { top: '4%', right: '-8%' },
      mobilePosition: { top: '2%', right: '-4%' },
      gradient: 'from-pink-900/90 to-rose-950/90 border-pink-500/40',
      textColor: 'text-pink-300',
      iconBg: 'bg-pink-500/20 text-pink-400',
      icon: '✨',
      delay: 0.65
    },
    {
      id: 'u1',
      title: 'Studio U1',
      subtitle: 'Cinema & Photography',
      page: ActivePage.Photography,
      position: { bottom: '18%', left: '-8%' },
      mobilePosition: { bottom: '14%', left: '-4%' },
      gradient: 'from-violet-900/90 to-purple-950/90 border-violet-500/40',
      textColor: 'text-violet-300',
      iconBg: 'bg-violet-500/20 text-violet-400',
      icon: '📸',
      delay: 0.8
    },
    {
      id: 'travels',
      title: 'Mahdev Travels',
      subtitle: 'Fleet & Luxury Tours',
      page: ActivePage.Travels,
      position: { bottom: '18%', right: '-8%' },
      mobilePosition: { bottom: '14%', right: '-4%' },
      gradient: 'from-cyan-900/90 to-blue-950/90 border-cyan-500/40',
      textColor: 'text-cyan-300',
      iconBg: 'bg-cyan-500/20 text-cyan-400',
      icon: '✈️',
      delay: 0.95
    }
  ];

  const stats = [
    { label: 'Happy Clients', value: '500+', icon: <Users size={16} className="text-purple-400" /> },
    { label: 'Solutions', value: '25+', icon: <Layers size={16} className="text-indigo-400" /> },
    { label: 'Support', value: '24/7', icon: <Headset size={16} className="text-cyan-400" /> },
    { label: 'Uptime', value: '99.9%', icon: <ShieldCheck size={16} className="text-emerald-400" /> },
  ];

  const partners = ['Abans', 'Softlogic', 'Daraz', 'Keells', 'Singer', 'Dialog', 'Coca-Cola', 'Nestle'];

  return (
    <>
      {/* ──── Styles injected once into <head> via a normal style tag ──── */}
      <style>{`
        @keyframes mahdev-float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33%       { transform: translateY(-12px) rotate(1deg); }
          66%       { transform: translateY(-6px) rotate(-0.5deg); }
        }
        @keyframes mahdev-ring {
          from { transform: rotateX(70deg) rotateZ(0deg); }
          to   { transform: rotateX(70deg) rotateZ(360deg); }
        }
        @keyframes mahdev-ring2 {
          from { transform: rotateX(60deg) rotateZ(0deg); }
          to   { transform: rotateX(60deg) rotateZ(-360deg); }
        }
        @keyframes mahdev-glow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%       { opacity: 0.8; transform: scale(1.07); }
        }
        @keyframes mahdev-scan {
          0%   { transform: translateY(-100%); opacity: 0; }
          10%  { opacity: 0.6; }
          90%  { opacity: 0.6; }
          100% { transform: translateY(400%); opacity: 0; }
        }
        .mhd-float  { animation: mahdev-float  6s ease-in-out infinite; will-change: transform; }
        .mhd-ring1  { animation: mahdev-ring  18s linear infinite; will-change: transform; }
        .mhd-ring2  { animation: mahdev-ring2 24s linear infinite; will-change: transform; }
        .mhd-glow   { animation: mahdev-glow   4s ease-in-out infinite; will-change: opacity, transform; }
        .mhd-scan   { animation: mahdev-scan   3s ease-in-out infinite; will-change: transform, opacity; }
        .mhd-ping   { animation: ping 1.8s cubic-bezier(0,0,0.2,1) infinite; will-change: transform, opacity; }
      `}</style>

      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity }}
        className={`relative w-full overflow-hidden pt-24 sm:pt-28 lg:pt-32 pb-16 lg:pb-20 min-h-[95vh] flex flex-col justify-between ${isDarkMode ? 'bg-[#06070a]' : 'bg-[#f4f3f8]'
          }`}
      >
        {/* ── PARALLAX CYBER GRID (fastest layer) ── */}
        <motion.div
          style={{ y: bgY, opacity: gridOpacity }}
          className="absolute inset-0 bg-[radial-gradient(#7c3aed_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none"
        />

        {/* ── PARALLAX AMBIENT ORB (mid layer) ── */}
        <motion.div
          style={{ y: bgY }}
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-purple-600/18 via-indigo-500/12 to-pink-500/8 blur-[150px] pointer-events-none mhd-glow"
        />
        <motion.div
          style={{ y: bgY }}
          className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-gradient-to-tl from-cyan-600/10 via-blue-500/8 to-transparent blur-[120px] pointer-events-none"
        />

        {/* ── MAIN HERO GRID ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 mt-auto mb-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-6 items-center">

            {/* ── LEFT CONTENT (parallax scroll slightly slower) ── */}
            <motion.div
              style={{ y: smoothLeftY }}
              className="lg:col-span-6 space-y-6 text-left"
            >
              {/* Welcome pill */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 backdrop-blur-md"
              >
                <span className="relative flex h-2 w-2">
                  <span className="mhd-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-widest text-purple-300 font-mono">
                  {(themeSettings as any)?.heroTagline || 'WELCOME TO MAHDEV PVT LTD'}
                </span>
              </motion.div>

              {/* Headline with staggered words */}
              <div className="space-y-1 overflow-hidden">
                <motion.h1
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                  className={`text-4xl sm:text-5xl lg:text-[3.8rem] font-black tracking-tight leading-[1.05] ${isDarkMode ? 'text-white' : 'text-slate-950'
                    }`}
                >
                  {themeSettings?.heroTitle1 || 'Building Experiences.'}
                </motion.h1>
                <motion.h1
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.32, duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                  className="text-4xl sm:text-5xl lg:text-[3.8rem] font-black tracking-tight leading-[1.05] bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent"
                >
                  {themeSettings?.heroTitle2 || 'Creating Impact.'}
                </motion.h1>
              </div>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className={`text-base sm:text-lg max-w-xl leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}
              >
                {themeSettings?.heroDescription ||
                  'We deliver next-generation solutions that empower businesses, elevate brands, and create unforgettable experiences.'}
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-wrap items-center gap-3 pt-1"
              >
                <motion.button
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => scrollToSection('solutions-section')}
                  className="px-7 py-3.5 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white font-bold text-xs tracking-wider uppercase shadow-lg shadow-purple-600/30 flex items-center gap-2.5 cursor-pointer border-none transition-shadow hover:shadow-purple-500/50"
                >
                  <span>Explore Our Services</span>
                  <ArrowRight size={15} />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setIsVideoModalOpen(true)}
                  className={`px-6 py-3.5 rounded-full border backdrop-blur-md text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 cursor-pointer ${isDarkMode
                      ? 'border-slate-700/80 bg-slate-900/60 text-slate-200 hover:bg-slate-800/80 hover:border-purple-500/40'
                      : 'border-slate-300 bg-white/80 text-slate-800 hover:bg-slate-100'
                    }`}
                >
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">
                    <Play size={11} className="fill-purple-400 ml-0.5" />
                  </div>
                  <span>Watch Video</span>
                </motion.button>
              </motion.div>

              {/* Scroll hint */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1, duration: 0.8 }}
                className="flex items-center gap-2 pt-2"
              >
                <div className="flex flex-col items-center gap-0.5 opacity-40">
                  <ChevronDown size={14} className="text-slate-400 animate-bounce" />
                </div>
                <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">Scroll to explore</span>
              </motion.div>
            </motion.div>

            {/* ── RIGHT: 3D MASCOT + ORBITAL CARDS (parallax slowest) ── */}
            <motion.div
              style={{ y: smoothRobotY }}
              className="lg:col-span-6 relative flex items-center justify-center min-h-[380px] sm:min-h-[460px]"
            >
              {/* Portal ring 1 */}
              <div className="absolute w-[320px] sm:w-[430px] h-[320px] sm:h-[430px] rounded-full border border-purple-500/20 mhd-ring1 pointer-events-none" />
              {/* Portal ring 2 */}
              <div className="absolute w-[240px] sm:w-[330px] h-[240px] sm:h-[330px] rounded-full border border-pink-500/20 mhd-ring2 pointer-events-none" />
              {/* Ground glow */}
              <div className="absolute bottom-6 w-[280px] sm:w-[370px] h-[70px] rounded-[100%] bg-gradient-to-t from-purple-600/35 via-indigo-500/15 to-transparent blur-xl pointer-events-none" />

              {/* 3D Mascot */}
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25, duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-20 mhd-float"
              >
                <div className="relative w-56 h-56 sm:w-72 sm:h-72 rounded-full overflow-hidden border-2 border-purple-500/30 shadow-[0_0_60px_rgba(124,58,237,0.35)] bg-gradient-to-b from-purple-500/20 via-indigo-500/10 to-transparent">
                  <img
                    src={itRobotImgAsset}
                    alt="Mahdev AI Mascot"
                    loading="eager"
                    decoding="async"
                    className="w-full h-full object-cover"
                    width="288"
                    height="288"
                  />
                  {/* Scan line effect */}
                  <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-purple-400/60 to-transparent mhd-scan" />
                </div>
              </motion.div>

              {/* Orbital Division Badges */}
              {orbitalBadges.map((badge) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: badge.delay, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => onNavigate(badge.page)}
                  style={badge.position}
                  className="absolute z-30 cursor-pointer"
                >
                  <motion.div
                    whileHover={{ scale: 1.08, y: -3 }}
                    whileTap={{ scale: 0.96 }}
                    className={`flex items-center gap-2.5 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-2xl border backdrop-blur-xl bg-gradient-to-r ${badge.gradient} shadow-xl transition-shadow duration-300 hover:shadow-[0_0_24px_rgba(168,85,247,0.45)]`}
                  >
                    <div className={`w-7 h-7 rounded-xl ${badge.iconBg} flex items-center justify-center font-bold text-sm shrink-0`}>
                      {badge.icon}
                    </div>
                    <div className="text-left">
                      <h4 className={`text-xs font-bold text-white leading-tight ${badge.textColor}`}>
                        {badge.title}
                      </h4>
                      <p className="text-[9px] sm:text-[10px] text-slate-300/80 font-mono font-medium leading-none mt-0.5">
                        {badge.subtitle}
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* ── STATS BAR ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 pt-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className={`grid grid-cols-2 md:grid-cols-4 gap-4 p-4 sm:p-5 rounded-2xl border backdrop-blur-xl shadow-2xl ${isDarkMode
                ? 'bg-slate-950/70 border-purple-500/20'
                : 'bg-white/80 border-slate-200 shadow-purple-500/5'
              }`}
          >
            {stats.map((st, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.08, duration: 0.5 }}
                className="flex items-center gap-3 px-3 py-1 text-left"
              >
                <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 shrink-0">
                  {st.icon}
                </div>
                <div>
                  <div className={`text-lg sm:text-xl font-black leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {st.value}
                  </div>
                  <div className="text-[11px] font-medium text-slate-400 tracking-wide mt-0.5">
                    {st.label}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Partners scrolling ticker */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.8 }}
            className="mt-5 py-3 border-t border-slate-800/40"
          >
            <FloatingTicker items={partners} />
          </motion.div>
        </div>

        {/* ── VIDEO MODAL ── */}
        {isVideoModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
            onClick={() => setIsVideoModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              className="relative w-full max-w-4xl bg-slate-900 border border-purple-500/30 rounded-3xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                  Mahdev Enterprise Showcase
                </h3>
                <button
                  onClick={() => setIsVideoModalOpen(false)}
                  className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="aspect-video w-full bg-black flex items-center justify-center relative">
                <img
                  src={itRobotImgAsset}
                  alt="Video Preview"
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-16 h-16 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-xl mb-4"
                  >
                    <Play size={24} className="ml-1" />
                  </motion.div>
                  <h2 className="text-xl font-bold text-white">Mahdev Next-Gen Platform Overview</h2>
                  <p className="text-xs text-slate-300 mt-2 max-w-md">
                    Experience seamless ERP integration, digital transformation, cinematic media production, and luxury event execution in one enterprise portal.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.section>
    </>
  );
}