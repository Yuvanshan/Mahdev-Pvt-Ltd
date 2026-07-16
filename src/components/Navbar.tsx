/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import swsDecorBanner from '../assets/images/sws_robot_decor_1783346269673.jpg';
import u1PhotographyBanner from '../assets/images/u1_robot_camera_1783346286743.jpg';
import itBanner from '../assets/images/it_robot_developer_1783346302442.jpg';
import travelsBanner from '../assets/images/travels_robot_car_1783346316762.jpg';
import { Menu, X, Phone, Sun, Moon, Search, ChevronDown, ArrowRight, ChevronRight, Sparkles, Camera, Laptop, Car, MessageCircle } from 'lucide-react';
import { ActivePage, ThemeSettings, ServiceCard, ItProject } from '../types';
import { COMPANY_CONTACT } from '../data';

import mahadevLogo from '../assets/images/mahadev_logo_1782729909050.jpg';

const defaultLogo = mahadevLogo;

interface NavbarProps {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  logo?: string;
  themeSettings?: ThemeSettings;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  servicesList: ServiceCard[];
  itProjects: ItProject[];
}

export default function Navbar({ 
  activePage, 
  setActivePage, 
  isDarkMode, 
  setIsDarkMode, 
  logo = defaultLogo, 
  themeSettings,
  searchQuery,
  setSearchQuery,
  servicesList,
  itProjects
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isBlogOpen, setIsBlogOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const brandName = themeSettings?.brandName || 'MAHDEV ELITE SERVICE SUITE';
  const primaryPhone = COMPANY_CONTACT.phone.split('/')[0].replace(/\D/g, '');

  const searchRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchQuery('');
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsServicesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setSearchQuery]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (isOpen) {
      root.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    } else {
      root.style.overflow = '';
      document.body.style.overflow = '';
    }

    return () => {
      root.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const matchingServices = searchQuery.trim() === '' ? [] : servicesList.filter(srv => 
    srv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    srv.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const matchingProjects = searchQuery.trim() === '' ? [] : itProjects.filter(proj => 
    proj.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    proj.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    proj.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const hasMatches = matchingServices.length > 0 || matchingProjects.length > 0;

  const handleServiceClick = (page: ActivePage) => {
    setActivePage(page);
    setSearchQuery('');
    setIsOpen(false);
    setIsServicesOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavClick = (page: ActivePage) => {
    setActivePage(page);
    setIsOpen(false);
    setIsServicesOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAboutClick = () => {
    setIsOpen(false);
    setIsServicesOpen(false);
    setActivePage(ActivePage.Home);
    setTimeout(() => {
      const el = document.getElementById('sws-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handlePortfolioClick = () => {
    setIsOpen(false);
    setIsServicesOpen(false);
    setActivePage(ActivePage.Home);
    setTimeout(() => {
      const el = document.getElementById('synergy-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <>
      <header 
        id="app-header"
        className={`z-50 w-full transition-all duration-500 ${
          activePage === ActivePage.Home ? 'absolute top-0 left-0' : 'sticky top-0'
        } ${
          isDarkMode 
            ? (activePage === ActivePage.Home && !isScrolled ? 'text-white bg-transparent backdrop-blur-sm' : 'border-neutral-800/70 bg-black/80 backdrop-blur-xl shadow-lg shadow-black/60 text-white')
            : (activePage === ActivePage.Home && !isScrolled ? 'text-white bg-transparent backdrop-blur-sm' : 'border-slate-200/70 bg-white/80 backdrop-blur-xl shadow-md shadow-slate-100/40 text-slate-800')
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* Brand Logo & Name */}
            <div 
              id="brand-logo-container"
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={() => handleNavClick(ActivePage.Home)}
            >
              <div className="relative w-11 h-11 rounded-2xl overflow-hidden border border-amber-500/30 group-hover:border-amber-500/70 transition-all duration-300 shadow-lg shadow-amber-500/10 ring-1 ring-white/10">
                <img 
                  src={logo} 
                  alt={`${brandName} Logo`} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-amber-500/20 to-transparent pointer-events-none" />
              </div>
              <div className="flex flex-col">
                <span className={`text-base sm:text-lg font-black tracking-wider font-sans leading-none uppercase group-hover:text-amber-500 transition-colors duration-500 ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  MAHDEV
                </span>
                <span className="text-[8px] tracking-[0.18em] uppercase font-mono text-amber-500 font-bold mt-1 leading-none">
                  ELITE SERVICE SUITE
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav id="desktop-nav" className="hidden lg:flex items-center space-x-1">
              <button
                onClick={() => handleNavClick(ActivePage.Home)}
                className={`relative px-3 py-2 text-xs font-bold tracking-widest uppercase transition-all duration-200 ${
                  activePage === ActivePage.Home 
                    ? 'text-amber-500' 
                    : isDarkMode 
                      ? 'text-neutral-300 hover:text-white' 
                      : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>HOME</span>
                {activePage === ActivePage.Home && (
                  <motion.span 
                    layoutId="activeNavLine" 
                    className="absolute bottom-0 left-3 right-3 h-[2.5px] bg-amber-500 rounded-full" 
                  />
                )}
              </button>

              <button
                onClick={handleAboutClick}
                className={`px-3 py-2 text-xs font-bold tracking-widest uppercase transition-colors duration-200 ${
                  isDarkMode ? 'text-neutral-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ABOUT US
              </button>

              {/* Services Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onMouseEnter={() => setIsServicesOpen(true)}
                  onClick={() => setIsServicesOpen(!isServicesOpen)}
                  className={`px-3 py-2 text-xs font-bold tracking-widest uppercase transition-colors duration-200 flex items-center gap-1 focus:outline-none ${
                    isDarkMode ? 'text-neutral-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>SERVICES</span>
                  <ChevronDown size={14} className={`transform transition-transform ${isServicesOpen ? 'rotate-180' : ''}`} />
                </button>

                {isServicesOpen && (
                  <div 
                    className={`absolute left-0 mt-2 w-56 rounded-xl border p-2 shadow-2xl z-50 text-left transition-all duration-300 ${
                      isDarkMode ? 'border-neutral-800 bg-neutral-950 text-white' : 'border-slate-200 bg-white text-slate-800'
                    }`}
                    onMouseLeave={() => setIsServicesOpen(false)}
                  >
                    {[
                      { label: 'SWS Event Management', page: ActivePage.Decoration },
                      { label: 'U1 Studio', page: ActivePage.Photography },
                      { label: 'Mahdev IT Solutions', page: ActivePage.ItSolutions },
                      { label: 'Mahdev Travels', page: ActivePage.Travels }
                    ].map((item) => (
                      <button
                        key={item.page}
                        onClick={() => handleServiceClick(item.page)}
                        className={`w-full text-left px-4 py-2.5 text-xs font-semibold rounded-lg transition-colors ${
                          activePage === item.page 
                            ? 'text-amber-500 bg-amber-500/5' 
                            : isDarkMode 
                              ? 'text-neutral-300 hover:text-white hover:bg-neutral-900' 
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => handleNavClick(ActivePage.Contact)}
                className={`relative px-3 py-2 text-xs font-bold tracking-widest uppercase transition-colors duration-200 ${
                  activePage === ActivePage.Contact 
                    ? 'text-amber-500' 
                    : isDarkMode 
                      ? 'text-neutral-300 hover:text-white' 
                      : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>CONTACT US</span>
                {activePage === ActivePage.Contact && (
                  <motion.span 
                    layoutId="activeNavLine" 
                    className="absolute bottom-0 left-3 right-3 h-[2.5px] bg-amber-500 rounded-full" 
                  />
                )}
              </button>
            </nav>

            {/* Right Action Section */}
            <div className="hidden lg:flex items-center space-x-4">
              
              {/* Search Bar - Desktop */}
              <div ref={searchRef} className="relative z-50">
                <div className={`relative flex items-center border rounded-xl px-3 py-1.5 w-44 focus-within:w-56 transition-all duration-300 ${
                  isDarkMode ? 'border-neutral-800 bg-neutral-900/40 text-white' : 'border-slate-200 bg-slate-50 text-slate-800'
                }`}>
                  <Search size={14} className="text-neutral-400 mr-2 shrink-0" />
                  <input 
                    type="text" 
                    placeholder="Search services..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none text-xs w-full focus:ring-0 p-0 text-current"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="p-0.5 hover:text-red-400 transition-colors">
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Search Dropdown */}
                {searchQuery.trim() !== '' && (
                  <div className={`absolute top-full mt-2 right-0 w-80 rounded-2xl border p-4 shadow-2xl max-h-[300px] overflow-y-auto z-50 transition-colors duration-500 ${
                    isDarkMode ? 'border-neutral-800 bg-neutral-950 text-white' : 'border-slate-200 bg-white text-slate-800'
                  }`}>
                    {matchingServices.length > 0 && (
                      <div className="mb-4">
                        <div className="text-[10px] font-bold tracking-widest uppercase text-amber-500 mb-2 font-mono">
                          Services
                        </div>
                        <div className="space-y-1">
                          {matchingServices.map(srv => (
                            <button
                              key={srv.id}
                              onClick={() => handleNavClick(srv.page)}
                              className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors ${
                                isDarkMode ? 'hover:bg-neutral-900 text-neutral-300 hover:text-white' : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              <span className="font-semibold block">{srv.title}</span>
                              <span className={`text-[10px] line-clamp-1 mt-0.5 ${isDarkMode ? 'text-neutral-500' : 'text-slate-400'}`}>{srv.description}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {!hasMatches && (
                      <div className="text-center py-4 text-xs text-neutral-500 font-medium">
                        No results found
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Theme Toggle Button */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2.5 rounded-xl border transition-all ${
                  isDarkMode 
                    ? 'border-neutral-800 bg-neutral-900/60 text-amber-400 hover:bg-neutral-900' 
                    : 'border-slate-200 bg-slate-50 text-amber-600 hover:bg-slate-100'
                }`}
                title="Toggle Theme"
              >
                {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
              </button>

              <button
                onClick={() => handleNavClick(ActivePage.Contact)}
                className="flex items-center space-x-1.5 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 hover:scale-[1.02] shadow-md shadow-amber-500/10 hover:shadow-amber-500/25 transition-all duration-300 border-none cursor-pointer transform active:scale-95"
              >
                <span>Get In Touch</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {/* Mobile Hamburg Menu */}
            <div className="flex items-center space-x-3 lg:hidden">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-lg border transition-colors ${
                  isDarkMode ? 'border-neutral-800 bg-neutral-900 text-amber-400' : 'border-slate-200 bg-slate-50 text-amber-600'
                }`}
              >
                {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
              </button>

              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 rounded-lg border focus:outline-none transition-colors ${
                  isDarkMode ? 'border-neutral-800 bg-neutral-900 text-amber-400' : 'border-slate-200 bg-slate-50 text-amber-600'
                }`}
              >
                {isOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isOpen && (
            <div className="fixed inset-0 z-[220] lg:hidden">
              {/* Premium Backdrop with elegant blur and gradient */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 bg-gradient-to-br from-black/80 via-black/70 to-black/80 backdrop-blur-xl"
              />

              {/* Premium Slide-in Drawer Panel */}
              <motion.div
                id="mobile-nav-drawer"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 26, stiffness: 220 }}
                style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
                className={`fixed inset-y-0 right-0 z-[221] w-full sm:w-[92vw] max-w-[380px] h-screen shadow-2xl flex flex-col border-l overflow-hidden transition-colors duration-500 ${
                  isDarkMode 
                    ? 'bg-gradient-to-b from-neutral-900 via-neutral-950 to-black border-amber-500/20' 
                    : 'bg-gradient-to-b from-white via-slate-50 to-white border-slate-200'
                }`}
              >
                {/* Premium Top Accent Bar with Gradient */}
                <div className="h-1.5 bg-gradient-to-r from-amber-500 via-purple-500 to-pink-500 opacity-90"></div>

                {/* Premium Drawer Header */}
                <div className={`px-6 py-5 flex items-center justify-between border-b pt-7 ${
                  isDarkMode 
                    ? 'border-neutral-800/50 bg-gradient-to-r from-neutral-950/50 to-neutral-900/30 backdrop-blur-sm'
                    : 'border-slate-200/50 bg-gradient-to-r from-white/50 to-slate-50/50 backdrop-blur-sm'
                }`}>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                      <span className="text-[8px] font-mono tracking-[0.15em] text-amber-500 uppercase font-extrabold">Navigation</span>
                    </div>
                    <h3 className={`text-sm font-black tracking-tight uppercase ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      Menu
                    </h3>
                  </div>
                  <motion.button
                    onClick={() => setIsOpen(false)}
                    whileHover={{ rotate: 90, scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-2.5 rounded-xl border transition-all ${
                      isDarkMode 
                        ? 'border-neutral-700 hover:bg-neutral-800 text-slate-400 hover:text-amber-400' 
                        : 'border-slate-300 hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <X size={18} />
                  </motion.button>
                </div>

                {/* Premium Drawer Body - Navigation Links with Icons */}
                <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-5 space-y-1 scrollbar-thin scrollbar-thumb-amber-500/40 scrollbar-track-transparent">
                  {[
                    { label: 'HOME', page: ActivePage.Home, icon: ArrowRight },
                    { 
                      label: 'SWS EVENT MANAGEMENT', 
                      page: ActivePage.Decoration,
                      icon: Sparkles,
                      subItems: [
                        { label: 'Overview & Banners', action: () => handleNavClick(ActivePage.Decoration), icon: ChevronRight },
                        { label: 'Stage Decoration Gallery', action: () => { handleNavClick(ActivePage.Decoration); setTimeout(() => document.getElementById('decor-gallery-section')?.scrollIntoView({ behavior: 'smooth' }), 300); }, icon: ChevronRight },
                        { label: 'Rental Equipment Catalogue', action: () => { handleNavClick(ActivePage.Decoration); setTimeout(() => document.getElementById('rental-items-section')?.scrollIntoView({ behavior: 'smooth' }), 300); }, icon: ChevronRight }
                      ]
                    },
                    { 
                      label: 'U1 STUDIO', 
                      page: ActivePage.Photography,
                      icon: Camera,
                      subItems: [
                        { label: 'Photography Portal', action: () => handleNavClick(ActivePage.Photography), icon: ChevronRight },
                        { label: 'Creative Photo Portfolio', action: () => { handleNavClick(ActivePage.Photography); setTimeout(() => document.getElementById('u1-portfolio-section')?.scrollIntoView({ behavior: 'smooth' }), 300); }, icon: ChevronRight },
                        { label: 'Package Pricing Plans', action: () => { handleNavClick(ActivePage.Photography); setTimeout(() => document.getElementById('u1-pricing-section')?.scrollIntoView({ behavior: 'smooth' }), 300); }, icon: ChevronRight }
                      ]
                    },
                    { 
                      label: 'MAHDEV IT', 
                      page: ActivePage.ItSolutions,
                      icon: Laptop,
                      subItems: [
                        { label: 'Software & Cloud Solutions', action: () => handleNavClick(ActivePage.ItSolutions), icon: ChevronRight },
                        { label: 'ERP Corporate Management', action: () => handleNavClick(ActivePage.ErpSolutions), icon: ChevronRight }
                      ]
                    },
                    { 
                      label: 'MAHDEV TRAVELS', 
                      page: ActivePage.Travels,
                      icon: Car,
                      subItems: [
                        { label: 'Luxury Tours & Fleet Home', action: () => handleNavClick(ActivePage.Travels), icon: ChevronRight },
                        { label: 'Premium Vehicle Fleet', action: () => { handleNavClick(ActivePage.Travels); setTimeout(() => document.getElementById('travels-vehicles-section')?.scrollIntoView({ behavior: 'smooth' }), 300); }, icon: ChevronRight },
                        { label: 'Tour Packages & Itineraries', action: () => { handleNavClick(ActivePage.Travels); setTimeout(() => document.getElementById('travels-tours-section')?.scrollIntoView({ behavior: 'smooth' }), 300); }, icon: ChevronRight }
                      ]
                    },
                    { label: 'CONTACT US', page: ActivePage.Contact, icon: Phone }
                  ].map((item, idx) => {
                    const isSectionActive = (item: any) => {
                      if (activePage === item.page) return true;
                      if (item.subItems) {
                        if (item.label === 'SWS EVENT MANAGEMENT' && activePage === ActivePage.Decoration) return true;
                        if (item.label === 'U1 STUDIO' && activePage === ActivePage.Photography) return true;
                        if (item.label === 'MAHDEV IT' && (activePage === ActivePage.ItSolutions || activePage === ActivePage.ErpSolutions)) return true;
                        if (item.label === 'MAHDEV TRAVELS' && activePage === ActivePage.Travels) return true;
                      }
                      return false;
                    };
                    const isActive = isSectionActive(item);
                    const hasSubItems = !!item.subItems;
                    const isExpanded = expandedSection === item.label;
                    const IconComponent = item.icon;

                    return (
                      <motion.div key={idx} className="space-y-1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}>
                        <motion.button
                          onClick={() => {
                            if (hasSubItems) {
                              setExpandedSection(isExpanded ? null : item.label);
                            } else {
                              handleNavClick(item.page);
                            }
                          }}
                          whileHover={{ x: 6 }}
                          whileTap={{ scale: 0.98 }}
                          className={`w-full px-4 py-4 rounded-xl text-sm font-bold tracking-wider uppercase transition-all duration-300 relative overflow-hidden flex items-center justify-between group ${
                            isActive
                              ? isDarkMode 
                                ? 'bg-gradient-to-r from-amber-500/25 to-amber-500/10 text-amber-300 border-l-4 border-amber-500 pl-3 shadow-lg shadow-amber-500/15'
                                : 'bg-gradient-to-r from-amber-500/20 to-amber-500/8 text-amber-600 border-l-4 border-amber-500 pl-3 shadow-md shadow-amber-500/10'
                              : isDarkMode
                                ? 'text-neutral-300 hover:text-white hover:bg-neutral-800/50 border-l-4 border-transparent pl-4 hover:border-amber-500/40'
                                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/60 border-l-4 border-transparent pl-4 hover:border-amber-400/30'
                          }`}
                          style={{ minHeight: '52px' }}
                        >
                          <div className="flex items-center gap-3.5 flex-1 min-w-0">
                            <IconComponent size={20} className="shrink-0" />
                            <span className="text-left break-words whitespace-normal">{item.label}</span>
                          </div>
                          {hasSubItems && (
                            <span className={`p-2 rounded-lg transition-all duration-300 shrink-0 ml-2 ${isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-300'} ${isExpanded ? 'rotate-90 bg-neutral-800/50' : ''}`}>
                              <ChevronRight size={18} />
                            </span>
                          )}
                        </motion.button>

                        {/* Premium Nested Sub-items with smooth animations */}
                        <AnimatePresence initial={false}>
                          {hasSubItems && isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0, marginTop: 0 }}
                              animate={{ height: 'auto', opacity: 1, marginTop: 8 }}
                              exit={{ height: 0, opacity: 0, marginTop: 0 }}
                              transition={{ duration: 0.25, ease: 'easeInOut' }}
                              className={`pl-8 pr-3 py-2 space-y-2 border-l-3 ${
                                isDarkMode 
                                  ? 'border-amber-500/50 bg-neutral-900/40' 
                                  : 'border-amber-500/40 bg-amber-50/30'
                              } rounded-lg ml-3 overflow-hidden`}
                            >
                              {item.subItems.map((sub, subIdx) => (
                                <motion.button
                                  key={subIdx}
                                  onClick={() => {
                                    sub.action();
                                    setIsOpen(false);
                                  }}
                                  whileHover={{ x: 6 }}
                                  whileTap={{ scale: 0.97 }}
                                  className={`block w-full text-left px-4 py-3 rounded-lg text-xs font-semibold tracking-wide uppercase transition-all flex items-center gap-3 group ${
                                    isDarkMode
                                      ? 'text-neutral-400 hover:text-amber-300 hover:bg-neutral-800/70 active:bg-neutral-800'
                                      : 'text-slate-600 hover:text-amber-600 hover:bg-slate-100/70 active:bg-slate-100'
                                  }`}
                                  style={{ minHeight: '46px' }}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: subIdx * 0.06 }}
                                >
                                  <sub.icon size={16} className="shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
                                  <span className="text-left break-words whitespace-normal">{sub.label}</span>
                                </motion.button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}

                  {/* Admin access removed per request */}
                </div>

                {/* Premium Drawer Footer with Enhanced CTA */}
                <div className={`p-6 border-t space-y-4 ${
                  isDarkMode 
                    ? 'border-neutral-800/50 bg-gradient-to-t from-black/50 via-neutral-950/30 to-transparent' 
                    : 'border-slate-200/50 bg-gradient-to-t from-slate-50/50 via-white/30 to-transparent'
                }`}>
                  <motion.a
                    href={`tel:${COMPANY_CONTACT.phone}`}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center space-x-2.5 w-full py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest bg-gradient-to-r from-amber-500 via-amber-450 to-yellow-500 hover:from-amber-400 hover:via-amber-350 hover:to-yellow-400 text-black shadow-lg shadow-amber-500/20 transition-all hover:shadow-amber-500/40 active:scale-95"
                    style={{ minHeight: '48px' }}
                  >
                    <Phone size={16} />
                    <span>CALL US NOW</span>
                  </motion.a>
                  <p className="text-xs text-center text-slate-500 font-semibold tracking-wide">
                    Colombo, Sri Lanka
                  </p>
                  <div className="text-[11px] text-center leading-relaxed">
                    <p className={`font-mono tracking-[0.08em] ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                      Multi-Service Elite Enterprise
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </header>

      {/* High Fidelity Interactive Blog Dialog */}
      <AnimatePresence>
        {isBlogOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            {/* Backdrop with elegant blur */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBlogOpen(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />
            
            {/* Modal Body */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`relative w-full max-w-4xl h-[85vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden z-10 transition-colors duration-500 ${
                isDarkMode 
                  ? 'bg-gradient-to-b from-neutral-900 via-neutral-950 to-black border-purple-500/25 text-white' 
                  : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              {/* Top Accent Gradient Bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600"></div>

              {/* Header */}
              <div className={`px-6 py-5 border-b flex items-center justify-between pt-7 ${
                isDarkMode ? 'border-purple-500/10' : 'border-slate-100'
              }`}>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                    <span className="text-[10px] font-mono tracking-widest text-amber-500 uppercase font-bold">Mahdev Insights</span>
                  </div>
                  <h3 className="text-xl font-bold mt-1 tracking-tight">The Elite Blog</h3>
                </div>
                <button 
                  onClick={() => setIsBlogOpen(false)}
                  className={`p-2.5 rounded-xl border transition-all ${
                    isDarkMode 
                      ? 'border-neutral-800 hover:bg-neutral-900 text-neutral-400 hover:text-white' 
                      : 'border-slate-150 hover:bg-slate-50 text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Blog Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {[
                  {
                    title: "Automating Decoration: How SWS Event Management Integrates CAD Stage Planning",
                    date: "June 28, 2026",
                    author: "Yuvanshan • SWS Team",
                    image: themeSettings?.decorationBanner || swsDecorBanner,
                    color: "border-pink-500/25",
                    tag: "SWS EVENT MANAGEMENT",
                    tagStyle: "bg-pink-500/10 text-pink-400",
                    excerpt: "Discover how we fuse physical floral design with 3D workspace simulation technology to pre-visualize jaw-dropping wedding stages and luxury corporate settings before the first rose is placed."
                  },
                  {
                    title: "Behind the Lens: 5 Composition Techniques Used by U1 Studio for Cinematic Weddings",
                    date: "June 15, 2026",
                    author: "Cinematography Unit • U1 Studio",
                    image: themeSettings?.photographyBanner || u1PhotographyBanner,
                    color: "border-purple-500/25",
                    tag: "U1 STUDIO",
                    tagStyle: "bg-purple-500/10 text-purple-400",
                    excerpt: "Concentric aperture rings, ambient lighting focus, and customized camera lens configurations. Our certified directors explain the science behind capturing high-fidelity, high-contrast emotional memories."
                  },
                  {
                    title: "The Rise of Microservice ERPs: Boosting Enterprise Agility in Sri Lanka",
                    date: "May 30, 2026",
                    author: "Software Architects • Mahdev IT",
                    image: themeSettings?.itBanner || itBanner,
                    color: "border-cyan-500/25",
                    tag: "MAHDEV IT & SOLUTIONS",
                    tagStyle: "bg-cyan-500/10 text-cyan-400",
                    excerpt: "Building high-performance point of sale (POS) billing, secure database pipelines, and offline-first desktop synchronization systems that run with 2ms latency on the most rigorous retail floors."
                  },
                  {
                    title: "Exotic Travels: Custom Guided Luxury Tours to Nuwara Eliya and Ella",
                    date: "April 18, 2026",
                    author: "Travel Consultants • Mahdev Travels",
                    image: themeSettings?.travelsBanner || travelsBanner,
                    color: "border-amber-500/25",
                    tag: "MAHDEV TRAVELS",
                    tagStyle: "bg-amber-500/10 text-amber-400",
                    excerpt: "Explore the beautiful mist-laden highlands of Sri Lanka in absolute style. From high-end luxury van airport pickups to custom souvenir tea factory trails, discover how we handle every logistic detail."
                  }
                ].map((post, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-5 rounded-3xl border flex flex-col md:flex-row gap-6 items-center md:items-start hover:scale-[1.01] transition-all duration-300 ${
                      isDarkMode 
                        ? `bg-neutral-900/40 ${post.color}` 
                        : 'bg-slate-50/80 border-slate-150'
                    }`}
                  >
                    <div className="w-full md:w-44 h-32 rounded-2xl overflow-hidden shrink-0 border border-white/5 shadow-md">
                      <img 
                        src={post.image} 
                        alt={post.title} 
                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 text-left space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${post.tagStyle}`}>
                          {post.tag}
                        </span>
                        <span className="text-[10px] text-neutral-500 font-medium">{post.date}</span>
                      </div>
                      <h4 className={`text-base font-bold tracking-tight leading-snug ${
                        isDarkMode ? 'text-white' : 'text-slate-900'
                      }`}>
                        {post.title}
                      </h4>
                      <p className={`text-xs leading-relaxed line-clamp-2 ${
                        isDarkMode ? 'text-neutral-400' : 'text-slate-500'
                      }`}>
                        {post.excerpt}
                      </p>
                      <div className="pt-1 flex items-center justify-between">
                        <span className="text-[10px] font-mono font-medium text-neutral-500">By {post.author}</span>
                        <button 
                          onClick={() => {
                            alert(`"${post.title}" is currently saved for offline reading. Register on the contact page to receive our monthly print magazine!`);
                          }}
                          className="text-xs font-bold text-amber-500 hover:text-amber-400 flex items-center gap-1.5"
                        >
                          <span>Read Article</span>
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Footer */}
              <div className={`px-6 py-4 border-t text-center ${
                isDarkMode ? 'border-neutral-850' : 'border-slate-100'
              }`}>
                <p className="text-[10px] text-neutral-500 font-medium">
                  © 2026 Mahdev Elite Service Suite (Pvt) Ltd. High-fidelity publication series.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
