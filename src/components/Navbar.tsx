'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Briefcase, 
  Image as ImageIcon, 
  Mail, 
  MessageSquare, 
  X, 
  ChevronDown,
  Sparkles,
  Camera,
  Cpu,
  Globe,
  Compass,
  Search,
  BookOpen,
  Languages,
  Menu,
  Sun,
  Moon
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc } from 'firebase/firestore';
import GlobalSearch from './GlobalSearch';
import { useLanguage } from '@/context/LanguageContext';

const defaultDivisions = [
  { name: 'SWS Events', href: '/divisions/sws-events', icon: Sparkles, color: 'text-purple-400' },
  { name: 'Studio U1', href: '/divisions/u1-studio', icon: Camera, color: 'text-cyan-400' },
  { name: 'Mahdev ERP', href: '/divisions/erp', icon: Cpu, color: 'text-yellow-400' },
  { name: 'IT Solutions', href: '/divisions/it-solutions', icon: Globe, color: 'text-blue-400' },
  { name: 'Mahdev Travels', href: '/divisions/travels', icon: Compass, color: 'text-green-400' },
];

export default function Navbar() {
  const pathname = usePathname();
  
  const handleHomeClick = (e: React.MouseEvent) => {
    if (pathname === '/') {
      e.preventDefault();
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [divisions, setDivisions] = useState<any[]>(defaultDivisions);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [logoUrl, setLogoUrl] = useState('/images/logo.png');
  
  // Consume language & theme from global context
  const { language, setLanguage, theme, toggleTheme, t } = useLanguage();

  // Dynamic branding loader (logo and favicon updates)
  useEffect(() => {
    const unsubBranding = onSnapshot(doc(db, 'settings', 'branding'), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        if (d.logoUrl) setLogoUrl(d.logoUrl);
        if (d.faviconUrl) {
          let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
          }
          link.href = d.faviconUrl;
        }
      }
    });
    return () => unsubBranding();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      
      // Calculate scroll progress percentage
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress((window.scrollY / totalScroll) * 100);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Listen to dynamic divisions in Firestore
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'divisions'), (snap) => {
      if (!snap.empty) {
        const list = snap.docs.map(docDoc => {
          const d = docDoc.data();
          const href = d.slug === 'erp' ? '/divisions/erp' : `/divisions/${d.slug}`;
          return {
            name: d.name, // Keep the localized map or dynamic string
            href,
            icon: d.type === 'events' ? Sparkles : d.type === 'photography' ? Camera : d.type === 'it' ? Cpu : Compass,
            color: d.type === 'events' ? 'text-purple-400' : d.type === 'photography' ? 'text-cyan-400' : d.type === 'it' ? 'text-blue-400' : 'text-green-400'
          };
        });
        setDivisions(list);
      }
    });
    return () => unsub();
  }, []);

  // Keyboard shortcut listener for '/'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/') {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
          return;
        }
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close menus on page change
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  const isActive = (path: string) => pathname === path;
  const isDivisionActive = () => pathname.startsWith('/divisions');

  const languagesList = [
    { code: 'EN', name: 'English' },
    { code: 'SI', name: 'සිංහල' },
    { code: 'TA', name: 'தமிழ்' }
  ];

  return (
    <>
      {/* Scroll Progress Bar */}
      <div className="scroll-progress-container">
        <div 
          className="scroll-progress-bar" 
          style={{ width: `${scrollProgress}%` }} 
        />
      </div>

      {/* Top Header */}
      <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        scrolled 
          ? 'py-4 bg-[#050816]/75 backdrop-blur-[20px] border-b border-white/8 shadow-[0_20px_80px_rgba(0,0,0,0.4)]' 
          : 'py-6 bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" onClick={handleHomeClick} className="flex items-center gap-3.5 group select-none">
            <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-white/10 group-hover:border-gold-accent/50 group-hover:scale-105 transition-all duration-500 shadow-[0_0_15px_rgba(212,175,55,0.1)]">
              <Image 
                src={logoUrl} 
                alt="Mahdev Logo" 
                fill 
                className="object-cover group-hover:rotate-12 transition-transform duration-700"
              />
            </div>
            <div className="text-left">
              <span className="font-display font-black text-xl tracking-wider text-white group-hover:text-gold-soft transition-colors duration-300">MAHDEV</span>
              <span className="block text-[9px] tracking-[0.25em] text-gold-accent font-bold uppercase -mt-0.5">PVT LTD</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8 font-sans">
            {[
              { label: 'home', href: '/' },
            ].map((link) => (
              <Link 
                key={link.label}
                href={link.href} 
                onClick={link.href === '/' ? handleHomeClick : undefined}
                className={`relative group py-2 text-[13px] font-semibold tracking-wider uppercase transition-colors duration-300 ${
                  isActive(link.href) ? 'text-gold-soft' : 'text-white/70 hover:text-white'
                }`}
              >
                <span>{t(link.label)}</span>
                <span className={`absolute bottom-0 left-0 h-[2px] bg-gold-accent transition-all duration-300 flex items-center overflow-hidden ${
                  isActive(link.href) ? 'w-full' : 'w-0 group-hover:w-full'
                }`}>
                  <span className="ml-auto text-[5px] text-gold-accent translate-y-[-1px] font-display">►</span>
                </span>
              </Link>
            ))}

            {/* Divisions Dropdown */}
            <div 
              className="relative" 
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`flex items-center gap-1.5 py-2 text-[13px] font-semibold tracking-wider uppercase transition-colors duration-300 ${
                  isDivisionActive() ? 'text-gold-soft' : 'text-white/70 hover:text-white'
                }`}
              >
                {t('divisions')}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-72 rounded-3xl glass-premium p-3 border border-white/8 shadow-[0_30px_100px_rgba(0,0,0,0.5)] before:content-[''] before:absolute before:-top-4 before:left-0 before:right-0 before:h-4"
                  >
                    <div className="grid gap-1">
                      {divisions.map((div) => {
                        const Icon = div.icon;
                        return (
                          <Link
                            key={div.href}
                            href={div.href}
                            className={`flex items-center gap-3.5 px-4.5 py-3.5 rounded-2xl transition-all duration-300 border border-transparent ${
                              isActive(div.href) 
                                ? 'bg-gold-accent/10 border-gold-accent/25 text-gold-soft shadow-[0_0_20px_rgba(212,175,55,0.05)]' 
                                : 'hover:bg-white/5 text-white/80 hover:text-white'
                            }`}
                          >
                            <div className="p-2.5 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors">
                              <Icon className={`w-5 h-5 ${div.color}`} />
                            </div>
                            <span className="font-display text-[14px] font-bold tracking-wide">{t(div.name)}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {[
              { label: 'portfolio', href: '/portfolio' },
              { label: 'blog', href: '/blog' },
              { label: 'careers', href: '/careers' },
              { label: 'contact', href: '/contact' },
            ].map((link) => (
              <Link 
                key={link.label}
                href={link.href} 
                className={`relative group py-2 text-[13px] font-semibold tracking-wider uppercase transition-colors duration-300 ${
                  isActive(link.href) ? 'text-gold-soft' : 'text-white/70 hover:text-white'
                }`}
              >
                <span>{t(link.label)}</span>
                <span className={`absolute bottom-0 left-0 h-[2px] bg-gold-accent transition-all duration-300 flex items-center overflow-hidden ${
                  isActive(link.href) ? 'w-full' : 'w-0 group-hover:w-full'
                }`}>
                  <span className="ml-auto text-[5px] text-gold-accent translate-y-[-1px] font-display">►</span>
                </span>
              </Link>
            ))}
          </nav>

          {/* Right Side Options (Theme, Search, Language, Action Button) */}
          <div className="hidden lg:flex items-center gap-5">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-3.5 rounded-2xl bg-white/3 border border-white/8 hover:border-gold-accent/40 text-white/70 hover:text-gold-soft transition-all duration-300 shadow-sm cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Search Trigger */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-3.5 rounded-2xl bg-white/3 border border-white/8 hover:border-gold-accent/40 text-white/70 hover:text-gold-soft transition-all duration-300 shadow-sm cursor-pointer"
              title="Search Directory (Press '/')"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Language Switcher */}
            <div className="relative group/lang py-2">
              <button 
                className="flex items-center gap-1.5 p-3 rounded-2xl border border-white/8 hover:border-gold-accent/40 text-white/70 hover:text-gold-soft transition-all duration-300 text-xs font-bold"
              >
                <Languages className="w-4 h-4" />
                <span>{language}</span>
              </button>
              
              <div className="absolute top-full right-0 mt-3 w-32 rounded-2xl glass border border-white/8 shadow-xl opacity-0 translate-y-2 pointer-events-none group-hover/lang:opacity-100 group-hover/lang:translate-y-0 group-hover/lang:pointer-events-auto transition-all duration-300 p-1.5">
                {languagesList.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code as any)}
                    className={`w-full text-left px-3.5 py-2 text-xs rounded-xl transition-all duration-300 ${
                      language === lang.code 
                        ? 'bg-gold-accent/15 text-gold-soft font-bold' 
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Get a Quote Trigger Button */}
            <Link 
              href="/contact"
              className="px-6 py-3 text-[11px] tracking-widest font-black uppercase luxury-btn luxury-btn-gold"
            >
              {t('get_quote')}
            </Link>
          </div>

          {/* Mobile Actions Header */}
          <div className="lg:hidden flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl glass border border-white/8 text-white/85"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setSearchOpen(true)}
              className="p-2.5 rounded-xl glass border border-white/8 text-white/80"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2.5 rounded-xl glass border border-white/8 text-white/80"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-[#050816]/90 z-[999] backdrop-blur-md lg:hidden"
            />
            {/* Drawer Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 right-0 h-full w-80 max-w-full glass-premium border-l border-white/8 z-[1000] p-6 lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between mb-8 pb-3 border-b border-white/5 text-left">
                <div className="flex items-center gap-2.5">
                  <Image src={logoUrl} alt="Logo" width={32} height={32} className="rounded-lg" />
                  <span className="font-display font-black text-base text-white tracking-wider">MAHDEV</span>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-white/5 text-white/70 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="flex-1 flex flex-col gap-4 text-left font-sans">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">{t('navigation')}</span>
                
                {[
                  { label: 'home', href: '/' },
                  { label: 'portfolio', href: '/portfolio' },
                  { label: 'blog', href: '/blog' },
                  { label: 'careers', href: '/careers' },
                  { label: 'contact', href: '/contact' }
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={item.href === '/' ? handleHomeClick : undefined}
                    className={`py-3.5 px-4 rounded-2xl font-bold text-sm tracking-wide transition-all border border-transparent ${
                      isActive(item.href)
                        ? 'bg-gold-accent/10 border-gold-accent/25 text-gold-soft'
                        : 'bg-white/2 border border-white/3 text-white/80 hover:text-white'
                    }`}
                  >
                    {t(item.label)}
                  </Link>
                ))}

                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mt-4 mb-1">{t('conglomerate_divisions')}</span>
                <div className="grid gap-2">
                  {divisions.map((div) => {
                    const Icon = div.icon;
                    return (
                      <Link
                        key={div.href}
                        href={div.href}
                        className="flex items-center justify-between p-3.5 rounded-2xl bg-white/2 border border-white/3 hover:border-gold-accent/25 text-white/80 hover:text-white transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-5 h-5 ${div.color}`} />
                          <span className="font-display text-xs font-bold tracking-wide">{t(div.name)}</span>
                        </div>
                        <span className="text-[8px] uppercase font-bold text-gold-accent tracking-wider group-hover:translate-x-1 transition-transform">→</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Drawer Footer controls */}
              <div className="border-t border-white/5 pt-6 flex flex-col gap-4">
                {/* Language switcher inline */}
                <div className="flex gap-2 justify-center">
                  {languagesList.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code as any)}
                      className={`flex-1 py-2 text-[10px] font-bold rounded-xl border transition-all ${
                        language === lang.code
                          ? 'bg-gold-accent/15 border-gold-accent/40 text-gold-soft'
                          : 'border-white/5 bg-white/2 text-white/60'
                      }`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
                
                <Link
                  href="/contact"
                  className="py-4 text-center rounded-2xl bg-gradient-to-r from-gold-accent to-gold-soft text-navy-dark font-sans text-xs font-black tracking-widest uppercase hover:brightness-110 shadow-lg shadow-gold-accent/15 transition-all"
                >
                  {t('get_quote')}
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Global Interactive Search Modal overlay */}
      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
