/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, Camera, Cpu, Globe, ArrowRight, Shield, Award, Users, 
  Compass, Heart, Check, PartyPopper, Film, Sliders, Laptop, Smartphone, Car, Plane,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { ActivePage, ServiceCard, Leader, ThemeSettings } from '../types';
import { SERVICES_LIST } from '../data';

// Generated 3D Image References
const swsRobotImg = '/src/assets/images/sws_robot_decor_1783346269673.jpg';
const u1RobotImg = '/src/assets/images/u1_robot_camera_1783346286743.jpg';
const itRobotImg = '/src/assets/images/it_robot_developer_1783346302442.jpg';
const travelsRobotImg = '/src/assets/images/travels_robot_car_1783346316762.jpg';

interface HomeViewProps {
  setActivePage: (page: ActivePage) => void;
  isDarkMode: boolean;
  servicesList?: ServiceCard[];
  leadersList?: Leader[];
  themeSettings?: ThemeSettings;
}

export default function HomeView({ 
  setActivePage, 
  isDarkMode, 
  servicesList = SERVICES_LIST, 
  leadersList = [],
  themeSettings
}: HomeViewProps) {
  const brandName = themeSettings?.brandName || 'MAHDEV Elite Service Suite';
  const [hoveredPanel, setHoveredPanel] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 340;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleNavClick = (page: ActivePage) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const swsRobotImgDynamic = themeSettings?.decorationBanner || swsRobotImg;
  const u1RobotImgDynamic = themeSettings?.photographyBanner || u1RobotImg;
  const itRobotImgDynamic = themeSettings?.itBanner || itRobotImg;
  const travelsRobotImgDynamic = themeSettings?.travelsBanner || travelsRobotImg;

  const panels = [
    {
      id: 1,
      title: 'SWS EVENT MANAGEMENT',
      titlePart1: 'SWS',
      titlePart2: 'EVENT',
      titlePart3: 'MANAGEMENT',
      subtitle: 'Event Management',
      img: swsRobotImgDynamic,
      page: ActivePage.Decoration,
      sectionId: 'sws-section',
      glow: 'shadow-pink-500/40',
      color: 'from-pink-500/25 via-rose-500/5 to-transparent',
      borderColor: 'group-hover:border-pink-500/60',
      tagColor: 'text-pink-400 bg-pink-500/10',
      textColorPart1: 'text-pink-500 font-extrabold',
      dotBgColor: 'bg-pink-500',
      beamColor: 'from-pink-500/0 via-pink-500/20 to-pink-500/0'
    },
    {
      id: 2,
      title: 'U1 STUDIO',
      titlePart1: 'U1',
      titlePart2: 'STUDIO',
      titlePart3: '',
      subtitle: 'Photography & Cinema',
      img: u1RobotImgDynamic,
      page: ActivePage.Photography,
      sectionId: 'u1-section',
      glow: 'shadow-purple-500/40',
      color: 'from-purple-500/25 via-indigo-500/5 to-transparent',
      borderColor: 'group-hover:border-purple-500/60',
      tagColor: 'text-purple-400 bg-purple-500/10',
      textColorPart1: 'text-purple-400 font-extrabold',
      dotBgColor: 'bg-purple-500',
      beamColor: 'from-purple-500/0 via-purple-500/20 to-purple-500/0'
    },
    {
      id: 3,
      title: 'MAHDEV IT & SOLUTIONS',
      titlePart1: 'MAHDEV',
      titlePart2: 'IT & SOLUTIONS',
      titlePart3: '',
      subtitle: 'ERP & Software',
      img: itRobotImgDynamic,
      page: ActivePage.ItSolutions,
      sectionId: 'it-section',
      glow: 'shadow-cyan-500/40',
      color: 'from-cyan-500/25 via-blue-500/5 to-transparent',
      borderColor: 'group-hover:border-cyan-500/60',
      tagColor: 'text-cyan-400 bg-cyan-500/10',
      textColorPart1: 'text-cyan-400 font-extrabold',
      dotBgColor: 'bg-cyan-500',
      beamColor: 'from-cyan-500/0 via-cyan-500/20 to-cyan-500/0'
    },
    {
      id: 4,
      title: 'MAHDEV TRAVELS',
      titlePart1: 'MAHDEV',
      titlePart2: 'TRAVELS',
      titlePart3: '',
      subtitle: 'Luxury Tours & Fleet',
      img: travelsRobotImgDynamic,
      page: ActivePage.Travels,
      sectionId: 'travels-section',
      glow: 'shadow-amber-500/40',
      color: 'from-amber-500/25 via-orange-500/5 to-transparent',
      borderColor: 'group-hover:border-amber-500/60',
      tagColor: 'text-amber-400 bg-amber-500/10',
      textColorPart1: 'text-amber-500 font-extrabold',
      dotBgColor: 'bg-amber-500',
      beamColor: 'from-amber-500/0 via-amber-500/20 to-amber-500/0'
    }
  ];

  return (
    <div id="home-view-container" className="relative w-full overflow-hidden font-sans">
      {/* Keyframe Styling */}
      <style>{`
        @keyframes floating {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes float-balloon {
          0% { transform: translateY(110vh) translateX(0) scale(0.8); opacity: 0; }
          15% { opacity: 0.8; }
          85% { opacity: 0.8; }
          100% { transform: translateY(-100px) translateX(40px) scale(1.2); opacity: 0; }
        }
        @keyframes scanner-sweep {
          0%, 100% { top: 0%; opacity: 0.2; }
          50% { top: 100%; opacity: 0.9; }
        }
        .animate-floating {
          animation: floating 6s ease-in-out infinite;
        }
        .animate-float-balloon-1 {
          animation: float-balloon 12s linear infinite;
        }
        .animate-float-balloon-2 {
          animation: float-balloon 14s linear infinite 3s;
        }
        .animate-float-balloon-3 {
          animation: float-balloon 16s linear infinite 6s;
        }
        .animate-scanner {
          animation: scanner-sweep 3s ease-in-out infinite;
        }
      `}</style>

      {/* HERO SECTION - Matching Image 100% */}
      <section className={`relative min-h-[90vh] flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-16 overflow-hidden border-b transition-colors duration-500 ${
        isDarkMode 
          ? 'bg-black text-white border-neutral-900' 
          : 'bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-800 border-slate-200'
      }`}>
        {/* Background Gradients */}
        {isDarkMode ? (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-black pointer-events-none" />
            <div className="absolute top-0 right-0 w-[45%] h-[45%] bg-gradient-to-br from-amber-500/10 to-transparent blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[35%] h-[35%] bg-gradient-to-tr from-purple-500/10 to-transparent blur-3xl pointer-events-none" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-50/10 via-white to-indigo-50/10 pointer-events-none" />
            <div className="absolute top-0 right-0 w-[45%] h-[45%] bg-gradient-to-br from-amber-500/5 to-transparent blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[35%] h-[35%] bg-gradient-to-tr from-purple-500/5 to-transparent blur-3xl pointer-events-none" />
          </>
        )}

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border text-xs font-semibold tracking-widest uppercase transition-colors duration-500 ${
              isDarkMode 
                ? 'border-amber-500/30 bg-amber-500/5 text-amber-400' 
                : 'border-amber-500/20 bg-amber-500/5 text-amber-600'
            }`}>
              <Sparkles size={13} className="text-amber-500 animate-pulse" />
              <span>MAHDEV ELITE SERVICE SUITE</span>
            </div>
            
            <h1 className={`text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] transition-colors duration-500 ${
              isDarkMode ? 'text-white' : 'text-slate-950'
            }`}>
              MAHDEV<br />
              <span className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(245,158,11,0.2)]">
                ELITE SERVICE SUITE
              </span>
            </h1>

            <div className="w-16 h-1 bg-amber-500 rounded-full my-4" />
            
            <p className={`text-base sm:text-lg leading-relaxed max-w-lg transition-colors duration-500 ${
              isDarkMode ? 'text-neutral-300' : 'text-slate-700'
            }`}>
              One Vision, Four Powerful Solutions.<br />
              <span className="text-amber-500 font-bold">AI Driven • Expert Powered • Excellence Delivered.</span>
            </p>

            <div className="pt-4">
              <button
                onClick={() => scrollToSection('sws-section')}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-extrabold text-sm tracking-wider uppercase shadow-xl shadow-amber-500/20 hover:shadow-amber-500/40 hover:scale-[1.03] transition-all flex items-center gap-2 group/btn"
              >
                <span>Discover More</span>
                <ArrowRight size={16} className="transform group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Hero Right: Responsive Symmetrical 2x2 Service Suite Grid */}
          <div className="lg:col-span-7 w-full relative">
            {/* Stage Light effects around the grid */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-[85%] h-6 bg-gradient-to-r from-transparent via-amber-500/10 to-transparent blur-xl pointer-events-none" />
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-[85%] h-8 bg-gradient-to-r from-transparent via-amber-500/25 to-transparent blur-xl pointer-events-none animate-pulse" />
            
            {/* Main Grid Frame */}
            <div className={`p-4 sm:p-6 rounded-3xl border transition-all duration-500 shadow-2xl relative overflow-hidden ${
              isDarkMode 
                ? 'border-neutral-800 bg-neutral-950/85 shadow-black/80' 
                : 'border-slate-200 bg-white/95 shadow-slate-200/50'
            }`}>
              
              {/* Card top bar with navigation & sector counter */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-dashed border-neutral-800/40 dark:border-neutral-800/20">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                  <span className={`text-[11px] font-black tracking-widest font-mono uppercase ${
                    isDarkMode ? 'text-neutral-400' : 'text-slate-500'
                  }`}>
                    ACTIVE SECTOR PORTAL
                  </span>
                </div>
                
                <span className="text-[10px] text-amber-500/80 font-bold font-mono uppercase tracking-wider">
                  4 SECTORS READY
                </span>
              </div>

              {/* Symmetrical 2x2 Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {panels.map((panel, idx) => {
                  const isHovered = hoveredPanel === panel.id;
                  return (
                    <motion.div
                      key={panel.id}
                      onMouseEnter={() => {
                        setHoveredPanel(panel.id);
                        let mode = 'home';
                        if (panel.page === ActivePage.Decoration) mode = 'decoration';
                        else if (panel.page === ActivePage.Photography) mode = 'photography';
                        else if (panel.page === ActivePage.ItSolutions) mode = 'it';
                        else if (panel.page === ActivePage.Travels) mode = 'travels';
                        window.dispatchEvent(new CustomEvent('mahdev-3d-mode-change', { detail: { mode } }));
                      }}
                      onMouseLeave={() => {
                        setHoveredPanel(null);
                        window.dispatchEvent(new CustomEvent('mahdev-3d-mode-change', { detail: { mode: 'home' } }));
                      }}
                      onClick={() => handleNavClick(panel.page)}
                      className={`cursor-pointer rounded-2xl border overflow-hidden relative flex flex-col justify-between h-auto p-4 transition-all duration-500 hover:scale-[1.02] ${
                        isDarkMode 
                          ? `border-neutral-850 bg-neutral-900/50 ${panel.borderColor} ${isHovered ? panel.glow : 'shadow-black/40'}` 
                          : `border-slate-200 bg-slate-50/80 ${panel.borderColor} ${isHovered ? panel.glow : 'shadow-slate-100'}`
                      }`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.08, duration: 0.4 }}
                    >
                      {/* Laser stage light beam */}
                      <div className={`absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-12 sm:w-20 bg-gradient-to-r ${panel.beamColor} opacity-5 group-hover:opacity-35 blur-xl transition-all duration-500 pointer-events-none`} />
                      
                      {/* Glowing colored overlay inside panel */}
                      <div className={`absolute inset-0 bg-gradient-to-b ${panel.color} opacity-20 pointer-events-none transition-all duration-500 group-hover:opacity-50`} />
                      
                      {/* Top Content: Titles */}
                      <div className="relative z-10 flex flex-col items-start">
                        <span className={`text-[10px] font-black tracking-widest font-mono uppercase ${panel.textColorPart1}`}>
                          {panel.titlePart1}
                        </span>
                        <span className={`text-xs sm:text-sm font-extrabold tracking-tight uppercase leading-none mt-0.5 ${
                          isDarkMode ? 'text-white' : 'text-slate-800'
                        }`}>
                          {panel.titlePart2} {panel.titlePart3}
                        </span>
                        
                        {/* Subtitle tag */}
                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded mt-1.5 tracking-wider ${
                          isDarkMode ? 'bg-neutral-800/80 text-amber-400' : 'bg-slate-200/60 text-slate-700'
                        }`}>
                          {panel.subtitle}
                        </span>
                      </div>

                      {/* Image visual container */}
                      <div className={`relative w-full aspect-square overflow-hidden rounded-xl mt-3 flex items-center justify-center border transition-all duration-500 group-hover:border-white/10 ${
                        isDarkMode ? 'bg-neutral-950 border-neutral-800 shadow-inner' : 'bg-white border-slate-200 shadow-sm'
                      }`}>
                        <img 
                          src={panel.img} 
                          alt={panel.subtitle} 
                          className="w-full h-full object-cover rounded-xl transition-all duration-700 group-hover:scale-110"
                          referrerPolicy="no-referrer"
                          decoding="async"
                        />
                        <div className={`absolute inset-0 bg-gradient-to-t ${panel.color} opacity-0 group-hover:opacity-20 pointer-events-none transition-opacity duration-500`} />
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-black/20 pointer-events-none" />
                      </div>

                      {/* Bottom Action */}
                      <div className="relative z-10 pt-3 flex items-center justify-between text-[10px] border-t border-neutral-800/40 dark:border-neutral-800/20">
                        <span className={`font-black tracking-widest uppercase ${
                          isDarkMode ? 'text-neutral-400 group-hover:text-amber-400' : 'text-slate-500 group-hover:text-amber-600'
                        }`}>
                          EXPLORE
                        </span>
                        <div className={`p-1 rounded-md border transition-all duration-300 ${
                          isDarkMode ? 'border-neutral-850 bg-neutral-950 text-amber-500 group-hover:border-amber-500/30' : 'border-slate-200 bg-white text-amber-600'
                        }`}>
                          <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Help hint below */}
              <div className="flex items-center justify-between mt-3 text-[10px] text-neutral-500 font-mono">
                <span>Select a portal above to launch 3D environments</span>
                <span className="text-amber-500 font-bold">EXCELLENCE GUARANTEED</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 01: SWS EVENT MANAGEMENT - Pink Accented Theme */}
      <section id="sws-section" className={`relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden border-b transition-colors duration-500 ${
        isDarkMode 
          ? 'bg-neutral-950 text-white border-neutral-900' 
          : 'bg-gradient-to-b from-rose-50/50 via-white to-pink-50/40 border-pink-100 text-slate-800'
      }`}>
        
        {/* Real Rising Balloons for 100% matched aesthetic */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute bottom-[-100px] left-[10%] w-6 h-8 rounded-full bg-pink-400/20 blur-[0.5px] animate-float-balloon-1 flex flex-col items-center">
            <div className="w-[1px] h-10 bg-pink-400/10 mt-8" />
          </div>
          <div className="absolute bottom-[-100px] right-[15%] w-8 h-10 rounded-full bg-rose-400/30 blur-[0.5px] animate-float-balloon-2 flex flex-col items-center">
            <div className="w-[1px] h-12 bg-rose-400/15 mt-10" />
          </div>
          <div className="absolute bottom-[-100px] left-[50%] w-7 h-9 rounded-full bg-pink-300/20 blur-[0.5px] animate-float-balloon-3 flex flex-col items-center">
            <div className="w-[1px] h-11 bg-pink-300/10 mt-9" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Visual Left Frame */}
          <div className="lg:col-span-6 relative order-2 lg:order-1">
            <div className="absolute -inset-2 bg-gradient-to-tr from-pink-400/10 to-transparent rounded-3xl blur-2xl opacity-50" />
            
            {/* Elegant luxury stage photo container */}
            <div className={`relative rounded-3xl p-4 shadow-2xl overflow-hidden aspect-[4/3] group transition-colors duration-500 ${
              isDarkMode ? 'bg-neutral-900 border-pink-500/20' : 'bg-white border-pink-200/50'
            }`}>
              <img 
                src={swsRobotImgDynamic} 
                alt="SWS Event Robot Designer" 
                className="w-full h-full object-cover rounded-2xl transform group-hover:scale-[1.03] transition-transform duration-700"
                referrerPolicy="no-referrer"
                loading="lazy"
                decoding="async"
              />
              {/* Cute corner badge */}
              <div className="absolute top-8 left-8 px-3 py-1.5 rounded-lg bg-pink-600/90 backdrop-blur-md text-white font-mono text-[10px] tracking-widest uppercase">
                Live Setup Simulator
              </div>
            </div>
          </div>

          {/* Content Right */}
          <div className="lg:col-span-6 space-y-6 order-1 lg:order-2 text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-pink-500 font-mono flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-pink-500 animate-ping" />
              01 | WE CREATE MEMORIES
            </span>
            
            <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight transition-colors duration-500 ${
              isDarkMode ? 'text-white' : 'text-neutral-900'
            }`}>
              SWS Event Management
            </h2>
            
            <p className={`leading-relaxed text-base sm:text-lg transition-colors duration-500 ${
              isDarkMode ? 'text-slate-300' : 'text-neutral-600'
            }`}>
              From unforgettable celebrations to grand corporate events - We bring your dreams to life with creativity, elegance and perfection.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2 flex gap-3 items-start">
                <div className={`p-3 rounded-xl shrink-0 mt-1 transition-colors duration-500 ${
                  isDarkMode ? 'bg-pink-500/20 text-pink-400' : 'bg-pink-500/10 text-pink-600'
                }`}>
                  <PartyPopper size={18} />
                </div>
                <div>
                  <h4 className={`font-bold text-sm sm:text-base transition-colors duration-500 ${
                    isDarkMode ? 'text-slate-100' : 'text-neutral-800'
                  }`}>Party Decoration</h4>
                  <p className={`text-xs sm:text-sm mt-1 leading-relaxed transition-colors duration-500 ${
                    isDarkMode ? 'text-slate-400' : 'text-neutral-500'
                  }`}>Beautiful themes & creative setups</p>
                </div>
              </div>

              <div className="space-y-2 flex gap-3 items-start">
                <div className={`p-3 rounded-xl shrink-0 mt-1 transition-colors duration-500 ${
                  isDarkMode ? 'bg-pink-500/20 text-pink-400' : 'bg-pink-500/10 text-pink-600'
                }`}>
                  <Award size={18} />
                </div>
                <div>
                  <h4 className={`font-bold text-sm sm:text-base transition-colors duration-500 ${
                    isDarkMode ? 'text-slate-100' : 'text-neutral-800'
                  }`}>Event Rentals</h4>
                  <p className={`text-xs sm:text-sm mt-1 leading-relaxed transition-colors duration-500 ${
                    isDarkMode ? 'text-slate-400' : 'text-neutral-500'
                  }`}>Chairs, Tents, Lights, Sound & more</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => handleNavClick(ActivePage.Decoration)}
                className="px-6 py-3.5 rounded-xl bg-pink-600 text-white font-bold text-xs tracking-wider uppercase hover:bg-pink-500 shadow-lg shadow-pink-600/10 hover:shadow-pink-500/30 transition-all flex items-center gap-2"
              >
                <span>Explore Event Management</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 02: U1 STUDIO - Purple Cinematic Theme */}
      <section id="u1-section" className={`relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden border-b transition-colors duration-500 ${
        isDarkMode 
          ? 'bg-neutral-950 text-white border-neutral-900' 
          : 'bg-gradient-to-b from-purple-50/50 via-white to-indigo-50/40 border-purple-100 text-slate-800'
      }`}>
        
        {/* Ambient light purple glowing rings */}
        <div className={`absolute bottom-0 right-0 w-96 h-96 blur-3xl pointer-events-none transition-colors duration-500 ${
          isDarkMode ? 'bg-purple-500/5' : 'bg-purple-100/30'
        }`} />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Content Left */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <span className={`text-xs font-bold uppercase tracking-widest font-mono flex items-center gap-2 transition-colors duration-500 ${
              isDarkMode ? 'text-purple-400' : 'text-purple-600'
            }`}>
              <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-ping" />
              02 | CAPTURE YOUR STORY
            </span>
            
            <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight transition-colors duration-500 ${
              isDarkMode ? 'text-white' : 'text-neutral-900'
            }`}>
              U1 Studio
            </h2>
            
            <p className={`leading-relaxed text-base sm:text-lg transition-colors duration-500 ${
              isDarkMode ? 'text-slate-300' : 'text-neutral-600'
            }`}>
              Professional photography, cinematic videography and stunning edits that tell your story in the most powerful way.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
              <div className="space-y-2 flex sm:flex-col gap-3 sm:gap-1 items-start">
                <div className={`p-3 rounded-xl shrink-0 transition-colors duration-500 ${
                  isDarkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-500/10 text-purple-600'
                }`}>
                  <Camera size={18} />
                </div>
                <div>
                  <h4 className={`font-bold text-sm transition-colors duration-500 ${
                    isDarkMode ? 'text-slate-100' : 'text-neutral-800'
                  }`}>Photography</h4>
                  <p className={`text-xs mt-1 leading-relaxed transition-colors duration-500 ${
                    isDarkMode ? 'text-slate-400' : 'text-neutral-500'
                  }`}>Events, portraits, products & more</p>
                </div>
              </div>

              <div className="space-y-2 flex sm:flex-col gap-3 sm:gap-1 items-start">
                <div className={`p-3 rounded-xl shrink-0 transition-colors duration-500 ${
                  isDarkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-500/10 text-purple-600'
                }`}>
                  <Film size={18} />
                </div>
                <div>
                  <h4 className={`font-bold text-sm transition-colors duration-500 ${
                    isDarkMode ? 'text-slate-100' : 'text-neutral-800'
                  }`}>Videography</h4>
                  <p className={`text-xs mt-1 leading-relaxed transition-colors duration-500 ${
                    isDarkMode ? 'text-slate-400' : 'text-neutral-500'
                  }`}>Cinematic videos, drones & reels</p>
                </div>
              </div>

              <div className="space-y-2 flex sm:flex-col gap-3 sm:gap-1 items-start">
                <div className={`p-3 rounded-xl shrink-0 transition-colors duration-500 ${
                  isDarkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-500/10 text-purple-600'
                }`}>
                  <Sliders size={18} />
                </div>
                <div>
                  <h4 className={`font-bold text-sm transition-colors duration-500 ${
                    isDarkMode ? 'text-slate-100' : 'text-neutral-800'
                  }`}>Editing</h4>
                  <p className={`text-xs mt-1 leading-relaxed transition-colors duration-500 ${
                    isDarkMode ? 'text-slate-400' : 'text-neutral-500'
                  }`}>Professional editing, color grading</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => handleNavClick(ActivePage.Photography)}
                className="px-6 py-3.5 rounded-xl bg-purple-600 text-white font-bold text-xs tracking-wider uppercase hover:bg-purple-500 shadow-lg shadow-purple-600/10 hover:shadow-purple-500/30 transition-all flex items-center gap-2"
              >
                <span>Explore U1 Studio</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Visual Right Frame */}
          <div className="lg:col-span-6 relative">
            <div className="absolute -inset-2 bg-gradient-to-tr from-purple-400/10 to-transparent rounded-3xl blur-2xl opacity-50" />
            
            {/* Camera Viewport overlay */}
            <div className={`relative rounded-3xl p-4 shadow-2xl overflow-hidden aspect-[4/3] group transition-colors duration-500 ${
              isDarkMode ? 'bg-neutral-900 border-purple-500/20' : 'bg-white border-purple-200'
            }`}>
              <img 
                src={u1RobotImgDynamic} 
                alt="U1 Studio Robot Camera" 
                className="w-full h-full object-cover rounded-2xl transform group-hover:scale-[1.03] transition-transform duration-700"
                referrerPolicy="no-referrer"
                loading="lazy"
                decoding="async"
              />
              {/* Camera view overlays */}
              <div className="absolute top-8 right-8 px-2 py-1 rounded bg-red-600/90 text-white font-mono text-[9px] tracking-widest uppercase flex items-center gap-1.5 animate-pulse">
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
                REC 4K
              </div>
              <div className="absolute bottom-8 left-8 text-white font-mono text-[9px] tracking-wider bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-md">
                ISO 400 | F/2.8 | 30FPS
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 03: MAHDEV IT & SOLUTIONS - Light Blue Grid Mesh Theme */}
      <section id="it-section" className={`relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden border-b transition-colors duration-500 ${
        isDarkMode 
          ? 'bg-neutral-950 text-white border-neutral-900' 
          : 'bg-slate-50 border-slate-200 text-slate-800'
      }`}>
        
        {/* Grid Overlay background */}
        <div className={`absolute inset-0 [background-size:20px_20px] opacity-60 pointer-events-none transition-colors duration-500 ${
          isDarkMode 
            ? 'bg-[radial-gradient(#334155_1px,transparent_1px)]' 
            : 'bg-[radial-gradient(#cbd5e1_1px,transparent_1px)]'
        }`} />
        <div className={`absolute bottom-0 right-0 w-96 h-96 blur-3xl pointer-events-none transition-colors duration-500 ${
          isDarkMode ? 'bg-cyan-500/5' : 'bg-cyan-100/30'
        }`} />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Visual Left Frame */}
          <div className="lg:col-span-6 relative order-2 lg:order-1">
            <div className="absolute -inset-2 bg-gradient-to-tr from-cyan-400/10 to-transparent rounded-3xl blur-2xl opacity-50" />
            
            {/* IT dashboard mock window frame */}
            <div className={`relative rounded-3xl p-4 shadow-2xl overflow-hidden aspect-[4/3] group transition-colors duration-500 ${
              isDarkMode ? 'bg-neutral-900 border-cyan-500/20' : 'bg-white border-cyan-200'
            }`}>
              
              {/* Window controls bar */}
              <div className="absolute top-6 left-6 flex space-x-1.5 z-10">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
              </div>

              <img 
                src={itRobotImgDynamic} 
                alt="Mahdev IT Robot Programmer" 
                className="w-full h-full object-cover rounded-2xl transform group-hover:scale-[1.03] transition-transform duration-700"
                referrerPolicy="no-referrer"
                loading="lazy"
                decoding="async"
              />

              {/* Laser line effect */}
              <div className="absolute left-6 right-6 h-0.5 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-scanner" />
              
              {/* Micro metric pill */}
              <div className="absolute bottom-8 right-8 px-3 py-1.5 rounded-lg bg-neutral-900/90 text-cyan-400 font-mono text-[9px] tracking-wider uppercase border border-cyan-500/30">
                ERP_ENGINE_OK : 2ms
              </div>
            </div>
          </div>

          {/* Content Right */}
          <div className="lg:col-span-6 space-y-6 order-1 lg:order-2 text-left">
            <span className={`text-xs font-bold uppercase tracking-widest font-mono flex items-center gap-2 transition-colors duration-500 ${
              isDarkMode ? 'text-cyan-400' : 'text-cyan-600'
            }`}>
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-ping" />
              03 | TECHNOLOGY FOR GROWTH
            </span>
            
            <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight transition-colors duration-500 ${
              isDarkMode ? 'text-white' : 'text-neutral-900'
            }`}>
              Mahdev IT & Solutions
            </h2>
            
            <p className={`leading-relaxed text-base sm:text-lg transition-colors duration-500 ${
              isDarkMode ? 'text-slate-300' : 'text-neutral-600'
            }`}>
              Smart ERP systems, modern websites, mobile apps and powerful digital solutions to grow your business.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
              <div className="space-y-2 flex sm:flex-col gap-3 sm:gap-1 items-start">
                <div className={`p-3 rounded-xl shrink-0 transition-colors duration-500 ${
                  isDarkMode ? 'bg-cyan-500/20 text-cyan-400' : 'bg-cyan-500/10 text-cyan-600'
                }`}>
                  <Cpu size={18} />
                </div>
                <div>
                  <h4 className={`font-bold text-sm transition-colors duration-500 ${
                    isDarkMode ? 'text-slate-100' : 'text-neutral-800'
                  }`}>ERP Systems</h4>
                  <p className={`text-xs mt-1 leading-relaxed transition-colors duration-500 ${
                    isDarkMode ? 'text-slate-400' : 'text-neutral-500'
                  }`}>Business automation & management</p>
                </div>
              </div>

              <div className="space-y-2 flex sm:flex-col gap-3 sm:gap-1 items-start">
                <div className={`p-3 rounded-xl shrink-0 transition-colors duration-500 ${
                  isDarkMode ? 'bg-cyan-500/20 text-cyan-400' : 'bg-cyan-500/10 text-cyan-600'
                }`}>
                  <Laptop size={18} />
                </div>
                <div>
                  <h4 className={`font-bold text-sm transition-colors duration-500 ${
                    isDarkMode ? 'text-slate-100' : 'text-neutral-800'
                  }`}>Website Dev</h4>
                  <p className={`text-xs mt-1 leading-relaxed transition-colors duration-500 ${
                    isDarkMode ? 'text-slate-400' : 'text-neutral-500'
                  }`}>Modern, responsive & SEO friendly</p>
                </div>
              </div>

              <div className="space-y-2 flex sm:flex-col gap-3 sm:gap-1 items-start">
                <div className={`p-3 rounded-xl shrink-0 transition-colors duration-500 ${
                  isDarkMode ? 'bg-cyan-500/20 text-cyan-400' : 'bg-cyan-500/10 text-cyan-600'
                }`}>
                  <Smartphone size={18} />
                </div>
                <div>
                  <h4 className={`font-bold text-sm transition-colors duration-500 ${
                    isDarkMode ? 'text-slate-100' : 'text-neutral-800'
                  }`}>Mobile Apps</h4>
                  <p className={`text-xs mt-1 leading-relaxed transition-colors duration-500 ${
                    isDarkMode ? 'text-slate-400' : 'text-neutral-500'
                  }`}>Android, iOS & cross platform</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => handleNavClick(ActivePage.ItSolutions)}
                className="px-6 py-3.5 rounded-xl bg-cyan-600 text-white font-bold text-xs tracking-wider uppercase hover:bg-cyan-500 shadow-lg shadow-cyan-600/10 hover:shadow-cyan-500/30 transition-all flex items-center gap-2"
              >
                <span>Explore IT Solutions</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 04: MAHDEV TRAVELS - Sunset Golden Theme */}
      <section id="travels-section" className={`relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden border-b transition-colors duration-500 ${
        isDarkMode 
          ? 'bg-neutral-950 text-white border-neutral-900' 
          : 'bg-gradient-to-b from-amber-50/50 via-white to-orange-50/40 border-amber-100 text-slate-800'
      }`}>
        <div className={`absolute top-0 left-0 w-96 h-96 blur-3xl pointer-events-none transition-colors duration-500 ${
          isDarkMode ? 'bg-amber-500/5' : 'bg-amber-100/20'
        }`} />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Content Left */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <span className={`text-xs font-bold uppercase tracking-widest font-mono flex items-center gap-2 transition-colors duration-500 ${
              isDarkMode ? 'text-amber-400' : 'text-amber-600'
            }`}>
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
              04 | JOURNEY WITH COMFORT
            </span>
            
            <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight transition-colors duration-500 ${
              isDarkMode ? 'text-white' : 'text-neutral-900'
            }`}>
              Mahdev Travels
            </h2>
            
            <p className={`leading-relaxed text-base sm:text-lg transition-colors duration-500 ${
              isDarkMode ? 'text-slate-300' : 'text-neutral-600'
            }`}>
              Explore the world with comfort and peace of mind. Your journey, our responsibility.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
              <div className="space-y-2 flex sm:flex-col gap-3 sm:gap-1 items-start">
                <div className={`p-3 rounded-xl shrink-0 transition-colors duration-500 ${
                  isDarkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-500/10 text-amber-600'
                }`}>
                  <Compass size={18} />
                </div>
                <div>
                  <h4 className={`font-bold text-sm transition-colors duration-500 ${
                    isDarkMode ? 'text-slate-100' : 'text-neutral-800'
                  }`}>Tour Packages</h4>
                  <p className={`text-xs mt-1 leading-relaxed transition-colors duration-500 ${
                    isDarkMode ? 'text-slate-400' : 'text-neutral-500'
                  }`}>Local & international packages</p>
                </div>
              </div>

              <div className="space-y-2 flex sm:flex-col gap-3 sm:gap-1 items-start">
                <div className={`p-3 rounded-xl shrink-0 transition-colors duration-500 ${
                  isDarkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-500/10 text-amber-600'
                }`}>
                  <Car size={18} />
                </div>
                <div>
                  <h4 className={`font-bold text-sm transition-colors duration-500 ${
                    isDarkMode ? 'text-slate-100' : 'text-neutral-800'
                  }`}>Vehicle Rental</h4>
                  <p className={`text-xs mt-1 leading-relaxed transition-colors duration-500 ${
                    isDarkMode ? 'text-slate-400' : 'text-neutral-500'
                  }`}>Cars, vans & luxury vehicles</p>
                </div>
              </div>

              <div className="space-y-2 flex sm:flex-col gap-3 sm:gap-1 items-start">
                <div className={`p-3 rounded-xl shrink-0 transition-colors duration-500 ${
                  isDarkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-500/10 text-amber-600'
                }`}>
                  <Plane size={18} />
                </div>
                <div>
                  <h4 className={`font-bold text-sm transition-colors duration-500 ${
                    isDarkMode ? 'text-slate-100' : 'text-neutral-800'
                  }`}>Airport Transfer</h4>
                  <p className={`text-xs mt-1 leading-relaxed transition-colors duration-500 ${
                    isDarkMode ? 'text-slate-400' : 'text-neutral-500'
                  }`}>On-time pickup & drop services</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => handleNavClick(ActivePage.Travels)}
                className="px-6 py-3.5 rounded-xl bg-amber-600 text-white font-bold text-xs tracking-wider uppercase hover:bg-amber-500 shadow-lg shadow-amber-600/10 hover:shadow-amber-500/30 transition-all flex items-center gap-2"
              >
                <span>Explore Travels</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Visual Right Frame */}
          <div className="lg:col-span-6 relative">
            <div className="absolute -inset-2 bg-gradient-to-tr from-amber-400/10 to-transparent rounded-3xl blur-2xl opacity-50" />
            
            {/* Travel scenery container */}
            <div className={`relative rounded-3xl p-4 shadow-2xl overflow-hidden aspect-[4/3] group transition-colors duration-500 ${
              isDarkMode ? 'bg-neutral-900 border-amber-500/20' : 'bg-white border-amber-200'
            }`}>
              <img 
                src={travelsRobotImgDynamic} 
                alt="Mahdev Travels Robot" 
                className="w-full h-full object-cover rounded-2xl transform group-hover:scale-[1.03] transition-transform duration-700"
                referrerPolicy="no-referrer"
                loading="lazy"
                decoding="async"
              />
              {/* Colombo Lotus Tower background graphic */}
              <div className="absolute top-8 left-8 px-3 py-1.5 rounded-lg bg-neutral-900/90 text-amber-400 font-mono text-[10px] tracking-widest uppercase border border-amber-500/30 font-semibold shadow-md">
                Colombo Lotus Tower Hub
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SYNERGY HIGHLIGHT */}
      <section className={`relative py-24 px-4 sm:px-6 lg:px-8 border-b transition-colors duration-500 ${
        isDarkMode 
          ? 'bg-neutral-950 text-white border-neutral-900' 
          : 'bg-slate-100 text-slate-800 border-slate-200'
      }`}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-left">
            <span className={`text-xs font-bold uppercase tracking-widest font-mono ${
              isDarkMode ? 'text-amber-400' : 'text-amber-600'
            }`}>
              The MAHDEV Synergy Advantage
            </span>
            <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight transition-colors duration-500 ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}>
              Bridging Creative Artistry & Deep Enterprise Tech
            </h2>
            <p className={`leading-relaxed text-sm sm:text-base transition-colors duration-500 ${
              isDarkMode ? 'text-neutral-300' : 'text-slate-600'
            }`}>
              Unlike singular event agencies or standard software houses, MAHDEV operates with an interconnected,
              multidisciplinary workforce. We deliver exquisite decorations, handle camera equipment, code enterprise POS systems,
              and maintain custom travel operations with dedicated professional governance.
            </p>
            
            <div className="space-y-4 pt-2">
              {[
                { title: 'Rigorous Quality Standards', desc: 'From premium floral freshness audits to automated continuous integration testing.', icon: <Shield size={18} className="text-amber-500" /> },
                { title: 'Enterprise-Grade Security', desc: 'We leverage multi-tenant data structures, OAuth logins, and real-time database schemas.', icon: <Award size={18} className="text-amber-500" /> },
                { title: 'Multidisciplinary Experts', desc: 'SWS wedding stylists, certified camera operators, and elite React developers under one roof.', icon: <Users size={18} className="text-amber-500" /> },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start space-x-3 text-left">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 mt-1 shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className={`text-sm font-bold transition-colors duration-500 ${
                      isDarkMode ? 'text-white' : 'text-slate-800'
                    }`}>{item.title}</h4>
                    <p className={`text-xs mt-1 leading-relaxed transition-colors duration-500 ${
                      isDarkMode ? 'text-neutral-400' : 'text-slate-500'
                    }`}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/15 to-transparent rounded-3xl blur-3xl opacity-30" />
            <div className={`relative rounded-3xl p-3 border backdrop-blur-md overflow-hidden shadow-2xl transition-colors duration-500 ${
              isDarkMode ? 'border-neutral-800 bg-neutral-900/40' : 'border-slate-200 bg-white/40'
            }`}>
              <img 
                src="https://images.unsplash.com/photo-1531403009284-440f080d1e12?fm=webp&fit=crop&q=70&w=600" 
                alt="MAHDEV Workspace Collaboration" 
                className="rounded-2xl w-full object-cover shadow-2xl opacity-90"
                referrerPolicy="no-referrer"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </section>

      {/* LEADERSHIP SECTION */}
      {leadersList.length > 0 && (
        <section className={`relative py-24 px-4 sm:px-6 lg:px-8 transition-colors duration-500 ${
          isDarkMode ? 'bg-neutral-950 text-white' : 'bg-white text-slate-800'
        }`}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className={`text-xs font-bold uppercase tracking-widest font-mono ${
                isDarkMode ? 'text-amber-400' : 'text-amber-600'
              }`}>
                Corporate Governance
              </span>
              <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight mt-2 mb-4 transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                Board of Directors
              </h2>
              <div className="h-1 w-20 bg-amber-500 mx-auto rounded-full mb-4" />
              <p className={`text-sm transition-colors duration-500 ${
                isDarkMode ? 'text-neutral-400' : 'text-slate-600'
              }`}>
                Meet the visionary executive leaders directing MAHDEV’s continuous technological innovations and operations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {leadersList.map((l) => (
                <div 
                  key={l.id}
                  className={`p-8 rounded-3xl border backdrop-blur-md flex flex-col sm:flex-row gap-6 items-center sm:items-start transition-all hover:scale-[1.01] shadow-xl ${
                    isDarkMode 
                      ? 'border-neutral-800 bg-neutral-900/60' 
                      : 'border-slate-100 bg-slate-50/80 shadow-slate-200/50'
                  }`}
                >
                  <div className="w-24 h-24 rounded-full overflow-hidden shrink-0 border-2 border-amber-500 shadow-lg">
                    <img 
                      src={l.image} 
                      alt={l.name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className={`text-xl font-bold transition-colors duration-500 ${
                      isDarkMode ? 'text-white' : 'text-slate-800'
                    }`}>{l.name}</h3>
                    <span className="text-xs font-mono font-bold uppercase text-amber-500 tracking-wider">
                      {l.role}
                    </span>
                    <p className={`text-xs sm:text-sm mt-3 leading-relaxed transition-colors duration-500 ${
                      isDarkMode ? 'text-neutral-400' : 'text-slate-500'
                    }`}>
                      {l.bio}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
