import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Play, Users, Layers, Headset, ShieldCheck, ChevronDown, X } from 'lucide-react';
import { ActivePage, ThemeSettings } from '../types';
import { COMPANY_CONTACT } from '../data';

// Import 3D Mascot Assets
import swsRobotImgAsset from '../assets/images/sws_robot_decor_1783346269673.jpg';
import u1RobotImgAsset from '../assets/images/u1_robot_camera_1783346286743.jpg';
import itRobotImgAsset from '../assets/images/it_robot_developer_1783346302442.jpg';
import travelsRobotImgAsset from '../assets/images/travels_robot_car_1783346316762.jpg';

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

export default function PremiumHero({ isDarkMode, onNavigate, cards, themeSettings }: PremiumHeroProps) {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const handleConsultation = () => {
    window.open(COMPANY_CONTACT.whatsapp, '_blank', 'noopener,noreferrer');
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Orbital badges around the 3D mascot
  const orbitalBadges = [
    {
      id: 'erp',
      title: 'Mahdev ERP',
      subtitle: 'Smart ERP & Software',
      page: ActivePage.ItSolutions,
      position: 'top-2 -left-4 md:top-4 md:-left-8',
      gradient: 'from-purple-900/90 to-indigo-950/90 border-purple-500/40 text-purple-300',
      iconBg: 'bg-purple-500/20 text-purple-400',
      icon: '⚡'
    },
    {
      id: 'sws',
      title: 'SWS Event Management',
      subtitle: 'Luxury Styling & Decor',
      page: ActivePage.Decoration,
      position: 'top-2 -right-4 md:top-4 md:-right-8',
      gradient: 'from-pink-900/90 to-rose-950/90 border-pink-500/40 text-pink-300',
      iconBg: 'bg-pink-500/20 text-pink-400',
      icon: '✨'
    },
    {
      id: 'u1',
      title: 'Studio U1',
      subtitle: 'Cinema & Photography',
      page: ActivePage.Photography,
      position: 'bottom-12 -left-4 md:bottom-16 md:-left-8',
      gradient: 'from-violet-900/90 to-purple-950/90 border-violet-500/40 text-violet-300',
      iconBg: 'bg-violet-500/20 text-violet-400',
      icon: '📸'
    },
    {
      id: 'travels',
      title: 'Mahdev Travels',
      subtitle: 'Fleet & Luxury Tours',
      page: ActivePage.Travels,
      position: 'bottom-12 -right-4 md:bottom-16 md:-right-8',
      gradient: 'from-cyan-900/90 to-blue-950/90 border-cyan-500/40 text-cyan-300',
      iconBg: 'bg-cyan-500/20 text-cyan-400',
      icon: '✈️'
    }
  ];

  const stats = [
    { label: 'Happy Clients', value: '500+', icon: <Users size={16} className="text-purple-400" /> },
    { label: 'Solutions', value: '25+', icon: <Layers size={16} className="text-indigo-400" /> },
    { label: 'Support', value: '24/7', icon: <Headset size={16} className="text-cyan-400" /> },
    { label: 'Uptime', value: '99.9%', icon: <ShieldCheck size={16} className="text-emerald-400" /> },
  ];

  return (
    <section className={`relative w-full overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 min-h-[92vh] flex flex-col justify-between transition-colors duration-500 ${
      isDarkMode ? 'bg-[#06070a]' : 'bg-[#f4f3f8]'
    }`}>
      {/* Keyframes for Portal Effects & Hovering */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes floatLevitate {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-14px) rotate(1.5deg); }
        }
        @keyframes ringSpin {
          0% { transform: rotateX(72deg) rotateZ(0deg); }
          100% { transform: rotateX(72deg) rotateZ(360deg); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.45; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(1.06); }
        }
        .animate-levitate {
          animation: floatLevitate 5s ease-in-out infinite;
        }
        .animate-ring-spin {
          animation: ringSpin 20s linear infinite;
        }
        .animate-pulse-glow {
          animation: pulseGlow 4s ease-in-out infinite;
        }
      ` }} />

      {/* Cyber Grid & Laser Ambient Backdrops */}
      <div className="absolute inset-0 bg-[radial-gradient(#7c3aed_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.07] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full bg-gradient-to-tr from-purple-600/20 via-indigo-500/15 to-pink-500/10 blur-[140px] pointer-events-none animate-pulse-glow" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* LEFT CONTENT COLUMN */}
          <motion.div 
            initial={{ opacity: 0, x: -35 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 space-y-6 text-left"
          >
            {/* WELCOME PILL BADGE */}
            <motion.div 
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 backdrop-blur-md"
            >
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-purple-300 font-mono">
                {(themeSettings as any)?.heroTagline || 'WELCOME TO MAHDEV PVT LTD'}
              </span>
            </motion.div>

            {/* MAIN HEADLINE */}
            <div className="space-y-1">
              <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight font-sans leading-[1.1] ${
                isDarkMode ? 'text-white' : 'text-slate-950'
              }`}>
                {themeSettings?.heroTitle1 || 'Building Experiences.'}
              </h1>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight font-sans leading-[1.1] bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
                {themeSettings?.heroTitle2 || 'Creating Impact.'}
              </h1>
            </div>

            {/* SUBTITLE */}
            <p className={`text-base sm:text-lg max-w-xl font-normal leading-relaxed ${
              isDarkMode ? 'text-slate-300' : 'text-slate-700'
            }`}>
              {themeSettings?.heroDescription || 'We deliver next-generation solutions that empower businesses, elevate brands and create unforgettable experiences.'}
            </p>

            {/* ACTION BUTTONS */}
            <div className="flex flex-wrap items-center gap-4 pt-3">
              <button
                onClick={() => scrollToSection('solutions-section')}
                className="px-7 py-3.5 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs tracking-wider uppercase shadow-lg shadow-purple-600/30 hover:shadow-purple-500/50 transition-all duration-300 flex items-center gap-2.5 cursor-pointer transform hover:-translate-y-0.5 border-none"
              >
                <span>Explore Our Services</span>
                <ArrowRight size={15} />
              </button>

              <button
                onClick={() => setIsVideoModalOpen(true)}
                className={`px-6 py-3.5 rounded-full border backdrop-blur-md text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2.5 cursor-pointer transform hover:-translate-y-0.5 ${
                  isDarkMode 
                    ? 'border-slate-700/80 bg-slate-900/60 text-slate-200 hover:bg-slate-800/80 hover:border-purple-500/40' 
                    : 'border-slate-300 bg-white/80 text-slate-800 hover:bg-slate-100'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Play size={12} className="fill-purple-400 ml-0.5" />
                </div>
                <span>Watch Video</span>
              </button>
            </div>
          </motion.div>

          {/* RIGHT COL: 3D ROBOT MASCOT & FLOATING ORBITAL CARDS */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 relative flex items-center justify-center min-h-[380px] sm:min-h-[440px]"
          >
            {/* GLOWING LASER PORTAL RINGS */}
            <div className="absolute w-[320px] sm:w-[420px] h-[320px] sm:h-[420px] rounded-full border border-purple-500/20 animate-ring-spin pointer-events-none" />
            <div className="absolute w-[240px] sm:w-[320px] h-[240px] sm:h-[320px] rounded-full border border-pink-500/25 pointer-events-none animate-pulse-glow" />
            <div className="absolute bottom-8 w-[280px] sm:w-[360px] h-[80px] rounded-[100%] bg-gradient-to-t from-purple-600/40 via-indigo-500/20 to-transparent blur-xl pointer-events-none" />

            {/* CENTER 3D ROBOT MASCOT */}
            <div className="relative z-20 animate-levitate">
              <div className="relative w-56 h-56 sm:w-72 sm:h-72 rounded-full p-2 bg-gradient-to-b from-purple-500/30 via-indigo-500/10 to-transparent backdrop-blur-xl border border-purple-500/30 shadow-[0_0_60px_rgba(124,58,237,0.3)]">
                <img
                  src={itRobotImgAsset}
                  alt="Mahdev Mascot"
                  className="w-full h-full object-cover rounded-full shadow-2xl"
                />
              </div>
            </div>

            {/* 4 ORBITAL DIVISION CARDS FLOATING AROUND ROBOT */}
            {orbitalBadges.map((badge, idx) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + idx * 0.15, duration: 0.6 }}
                onClick={() => onNavigate(badge.page)}
                className={`absolute z-30 ${badge.position} cursor-pointer group`}
              >
                <div className={`flex items-center gap-2.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl border backdrop-blur-xl bg-gradient-to-r ${badge.gradient} shadow-xl hover:scale-105 transition-all duration-300 hover:shadow-[0_0_25px_rgba(168,85,247,0.4)]`}>
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl ${badge.iconBg} flex items-center justify-center font-bold text-sm shrink-0`}>
                    {badge.icon}
                  </div>
                  <div className="text-left">
                    <h4 className="text-xs sm:text-sm font-bold text-white leading-tight group-hover:text-purple-200 transition-colors">
                      {badge.title}
                    </h4>
                    <p className="text-[9px] sm:text-[10px] text-slate-300/80 font-mono font-medium leading-none mt-0.5">
                      {badge.subtitle}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}

          </motion.div>

        </div>
      </div>

      {/* STATS BAR BELOW HERO */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 pt-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className={`grid grid-cols-2 md:grid-cols-4 gap-4 p-4 sm:p-5 rounded-2xl border backdrop-blur-xl shadow-2xl ${
            isDarkMode 
              ? 'bg-slate-950/70 border-purple-500/20' 
              : 'bg-white/80 border-slate-200 shadow-purple-500/5'
          }`}
        >
          {stats.map((st, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-1 text-left">
              <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 shrink-0">
                {st.icon}
              </div>
              <div>
                <div className={`text-lg sm:text-xl font-black font-sans leading-none ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  {st.value}
                </div>
                <div className="text-[11px] font-medium text-slate-400 tracking-wide mt-1">
                  {st.label}
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* VIDEO MODAL DEMO */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-4xl bg-slate-900 border border-purple-500/30 rounded-3xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Mahdev Enterprise Showcase Video
              </h3>
              <button 
                onClick={() => setIsVideoModalOpen(false)}
                className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
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
                <div className="w-16 h-16 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-xl mb-4 animate-pulse">
                  <Play size={24} className="ml-1" />
                </div>
                <h2 className="text-xl font-bold text-white">Mahdev Next-Gen Platform Overview</h2>
                <p className="text-xs text-slate-300 mt-2 max-w-md">
                  Experience seamless ERP integration, digital transformation, cinematic media production, and luxury event execution in one enterprise portal.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}