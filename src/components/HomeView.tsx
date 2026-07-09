/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, Camera, Cpu, Globe, ArrowRight, Shield, Award, Users, 
  Compass, Heart, Check, PartyPopper, Film, Sliders, Laptop, Smartphone, Car, Plane,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { ActivePage, ServiceCard, Leader, ThemeSettings } from '../types';
import { SERVICES_LIST } from '../data';
import PremiumHero from './PremiumHero';
import { preloadCriticalImages, enablePerformanceHints } from '../utils/performanceOptimization';

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

  // Performance optimizations
  useEffect(() => {
    // Preload critical hero images
    const heroImages = [
      themeSettings?.decorationBanner || swsRobotImg,
      themeSettings?.photographyBanner || u1RobotImg,
      themeSettings?.itBanner || itRobotImg,
      themeSettings?.travelsBanner || travelsRobotImg
    ];
    preloadCriticalImages(heroImages);

    // Enable performance hints for common CDNs
    enablePerformanceHints(['images.unsplash.com', 'cdn.jsdelivr.net']);
  }, [themeSettings]);

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

  // Premium Hero Cards
  const heroCards = [
    {
      id: 1,
      title: 'SWS Event Management',
      subtitle: 'Celebrations & Styling',
      color: 'from-pink-600 to-rose-600',
      borderColor: 'border-pink-500/60',
      bgGradient: 'bg-gradient-to-t from-black/70 via-black/20 to-transparent',
      textColor: '',
      accentColor: 'text-pink-400',
      image: swsRobotImgDynamic,
      page: ActivePage.Decoration
    },
    {
      id: 2,
      title: 'U1 Studio',
      subtitle: 'Photography & Cinematography',
      color: 'from-purple-600 to-indigo-600',
      borderColor: 'border-purple-500/60',
      bgGradient: 'bg-gradient-to-t from-black/70 via-black/20 to-transparent',
      textColor: '',
      accentColor: 'text-purple-400',
      image: u1RobotImgDynamic,
      page: ActivePage.Photography
    },
    {
      id: 3,
      title: 'Mahdev IT & Solutions',
      subtitle: 'ERP & Digital Transformation',
      color: 'from-blue-600 to-cyan-600',
      borderColor: 'border-blue-500/60',
      bgGradient: 'bg-gradient-to-t from-black/70 via-black/20 to-transparent',
      textColor: '',
      accentColor: 'text-blue-400',
      image: itRobotImgDynamic,
      page: ActivePage.ItSolutions
    },
    {
      id: 4,
      title: 'Mahdev Travels',
      subtitle: 'Luxury Tours & Fleet Services',
      color: 'from-amber-600 to-orange-600',
      borderColor: 'border-amber-500/60',
      bgGradient: 'bg-gradient-to-t from-black/70 via-black/20 to-transparent',
      textColor: '',
      accentColor: 'text-amber-400',
      image: travelsRobotImgDynamic,
      page: ActivePage.Travels
    }
  ];

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

  const trustPoints = [
    { label: 'Integrated Divisions', value: '4' },
    { label: 'Tailored Delivery', value: '100%' },
    { label: 'Support Response', value: '24/7' }
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

      {/* PREMIUM HERO SECTION */}
      <PremiumHero 
        isDarkMode={isDarkMode} 
        onNavigate={handleNavClick}
        cards={heroCards}
      />

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
          <div className={`space-y-6 text-left rounded-[2rem] border p-7 sm:p-8 shadow-2xl ${
            isDarkMode ? 'border-neutral-800 bg-neutral-900/70' : 'border-slate-200 bg-white/80'
          }`}>
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: 'Integrated Delivery', value: '4 Services' },
                { label: 'Project Focus', value: 'Premium Quality' },
                { label: 'Execution', value: 'End-to-End' }
              ].map((item) => (
                <div key={item.label} className={`rounded-2xl border px-3 py-3 ${
                  isDarkMode ? 'border-neutral-800 bg-black/20' : 'border-slate-200 bg-slate-50'
                }`}>
                  <div className="text-sm font-black text-amber-500">{item.value}</div>
                  <div className={`text-[10px] uppercase tracking-[0.2em] ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>{item.label}</div>
                </div>
              ))}
            </div>
            
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
