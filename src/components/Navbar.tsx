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
import { collection, onSnapshot } from 'firebase/firestore';
import GlobalSearch from './GlobalSearch';

const defaultDivisions = [
  { name: 'SWS Events', href: '/divisions/sws-events', icon: Sparkles, color: 'text-gold-soft' },
  { name: 'Studio U1', href: '/divisions/u1-studio', icon: Camera, color: 'text-gold-soft' },
  { name: 'Mahdev ERP', href: '/divisions/erp', icon: Cpu, color: 'text-gold-soft' },
  { name: 'IT Solutions', href: '/divisions/it-solutions', icon: Globe, color: 'text-gold-soft' },
  { name: 'Mahdev Travels', href: '/divisions/travels', icon: Compass, color: 'text-gold-soft' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [divisions, setDivisions] = useState<any[]>(defaultDivisions);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  
  // Real Light / Dark theme controls
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [language, setLanguage] = useState<'EN' | 'SI' | 'TA'>('EN');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    } else {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress((window.scrollY / totalScroll) * 100);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Listen to divisions
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'divisions'), (snap) => {
      if (!snap.empty) {
        const list = snap.docs.map(docDoc => {
          const d = docDoc.data();
          const href = d.slug === 'erp' ? '/divisions/erp' : `/divisions/${d.slug}`;
          return {
            name: d.name,
            href,
            icon: d.type === 'events' ? Sparkles : d.type === 'photography' ? Camera : d.type === 'it' ? Cpu : Compass,
            color: 'text-gold-soft'
          };
        });
        setDivisions(list);
      }
    });
    return () => unsub();
  }, []);

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
      <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'py-3.5 bg-white/80 dark:bg-[#12101A]/80 backdrop-blur-md border-b border-card-border shadow-sm' 
          : 'py-5 bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group select-none">
            <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-card-border shrink-0">
              <Image 
                src="/images/logo.png" 
                alt="Mahdev Logo" 
                fill 
                className="object-cover"
                sizes="40px"
              />
            </div>
            <div className="text-left">
              <span className="font-display font-bold text-lg tracking-wide text-text-heading group-hover:text-gold-soft transition-colors duration-200">MAHDEV</span>
              <span className="block text-[8px] tracking-[0.2em] text-gold-soft font-bold uppercase -mt-1">PVT LTD</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8 font-sans">
            {[
              { label: 'Home', href: '/' },
            ].map((link) => (
              <Link 
                key={link.label}
                href={link.href} 
                className={`relative group py-2 text-[12px] font-medium tracking-wider uppercase transition-colors duration-200 ${
                  isActive(link.href) ? 'text-gold-soft font-semibold' : 'text-text-body hover:text-gold-soft'
                }`}
              >
                <span>{link.label}</span>
                <span className={`absolute bottom-0 left-0 h-[1.5px] bg-gold-soft transition-all duration-200 ${
                  isActive(link.href) ? 'w-full' : 'w-0 group-hover:w-full'
                }`} />
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
                className={`flex items-center gap-1 py-2 text-[12px] font-medium tracking-wider uppercase transition-colors duration-200 cursor-pointer ${
                  isDivisionActive() ? 'text-gold-soft font-semibold' : 'text-text-body hover:text-gold-soft'
                }`}
              >
                Divisions
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 rounded-xl glass-premium p-2 border border-card-border shadow-lg before:content-[''] before:absolute before:-top-4 before:left-0 before:right-0 before:h-4"
                  >
                    <div className="grid gap-0.5">
                      {divisions.map((div) => {
                        const Icon = div.icon;
                        return (
                          <Link
                            key={div.name}
                            href={div.href}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 border border-transparent ${
                              isActive(div.href) 
                                ? 'bg-navy-medium border-card-border text-gold-soft' 
                                : 'hover:bg-navy-medium text-text-heading'
                            }`}
                          >
                            <div className="p-2 rounded-md bg-navy-medium border border-card-border shrink-0">
                              <Icon className="w-4 h-4 text-gold-soft" />
                            </div>
                            <span className="font-display text-[13px] font-semibold tracking-wide">{div.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {[
              { label: 'Portfolio', href: '/portfolio' },
              { label: 'Blog', href: '/blog' },
              { label: 'Careers', href: '/careers' },
              { label: 'Contact', href: '/contact' },
            ].map((link) => (
              <Link 
                key={link.label}
                href={link.href} 
                className={`relative group py-2 text-[12px] font-medium tracking-wider uppercase transition-colors duration-200 ${
                  isActive(link.href) ? 'text-gold-soft font-semibold' : 'text-text-body hover:text-gold-soft'
                }`}
              >
                <span>{link.label}</span>
                <span className={`absolute bottom-0 left-0 h-[1.5px] bg-gold-soft transition-all duration-200 ${
                  isActive(link.href) ? 'w-full' : 'w-0 group-hover:w-full'
                }`} />
              </Link>
            ))}
          </nav>

          {/* Right Side Options (Search, Language, Action Button) */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Search Trigger */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-lg bg-navy-medium border border-card-border hover:border-gold-soft/50 text-text-body hover:text-gold-soft transition-all duration-200 cursor-pointer shadow-sm"
              title="Search Directory (Press '/')"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-navy-medium border border-card-border hover:border-gold-soft/50 text-text-body hover:text-gold-soft transition-all duration-200 cursor-pointer shadow-sm"
              title={theme === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"}
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {/* Language Switcher */}
            <div className="relative group/lang py-2">
              <button 
                className="flex items-center gap-1.5 p-2 rounded-lg bg-navy-medium border border-card-border hover:border-gold-soft/50 text-text-body hover:text-gold-soft transition-all duration-200 text-xs font-semibold cursor-pointer"
              >
                <Languages className="w-4 h-4" />
                <span>{language}</span>
              </button>
              
              <div className="absolute top-full right-0 mt-2 w-32 rounded-xl glass border border-card-border shadow-md opacity-0 translate-y-1 pointer-events-none group-hover/lang:opacity-100 group-hover/lang:translate-y-0 group-hover/lang:pointer-events-auto transition-all duration-200 p-1">
                {languagesList.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code as any)}
                    className={`w-full text-left px-3 py-1.5 text-xs rounded-md transition-all duration-200 ${
                      language === lang.code 
                        ? 'bg-navy-medium text-gold-soft font-bold border border-card-border' 
                        : 'text-text-body hover:text-text-heading hover:bg-navy-medium/50'
                    }`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Action button */}
            <Link 
              href="/contact"
              className="px-4 py-2 text-[11px] tracking-wider font-semibold uppercase luxury-btn-gold"
            >
              Get started
            </Link>
          </div>

          {/* Mobile Actions Header */}
          <div className="lg:hidden flex items-center gap-3">
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2.5 rounded-xl glass border border-card-border text-text-heading cursor-pointer"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl glass border border-card-border text-text-heading cursor-pointer"
              title={theme === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"}
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2.5 rounded-xl glass border border-card-border text-text-heading cursor-pointer"
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
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-navy-dark/80 z-[999] backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 right-0 h-full w-80 max-w-full bg-navy-dark border-l border-card-border z-[1000] p-6 lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between mb-8 pb-3 border-b border-card-border text-left">
                <div className="flex items-center gap-2">
                  <Image src="/images/logo.png" alt="Logo" width={28} height={28} className="rounded-md" />
                  <span className="font-display font-bold text-base text-text-heading tracking-wide">MAHDEV</span>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-navy-medium text-text-body"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="flex-1 flex flex-col gap-3 text-left font-sans">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Navigation</span>
                
                {[
                  { label: 'Home', href: '/' },
                  { label: 'Portfolio', href: '/portfolio' },
                  { label: 'Blog', href: '/blog' },
                  { label: 'Careers', href: '/careers' },
                  { label: 'Contact', href: '/contact' }
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`py-2.5 px-4 rounded-lg font-medium text-sm transition-all border border-transparent ${
                      isActive(item.href)
                        ? 'bg-navy-medium border-card-border text-gold-soft'
                        : 'text-text-body hover:text-text-heading hover:bg-navy-medium/50'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}

                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mt-4 mb-1">Divisions</span>
                <div className="grid gap-1">
                  {divisions.map((div) => {
                    const Icon = div.icon;
                    return (
                      <Link
                        key={div.name}
                        href={div.href}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-navy-medium border border-card-border hover:border-gold-soft/30 text-text-body hover:text-text-heading transition-all group"
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4 text-gold-soft" />
                          <span className="font-display text-xs font-semibold">{div.name}</span>
                        </div>
                        <span className="text-[10px] font-bold text-gold-soft transition-transform group-hover:translate-x-1">→</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Drawer Footer controls */}
              <div className="border-t border-card-border pt-6 flex flex-col gap-4">
                {/* Language switcher inline */}
                <div className="flex gap-2 justify-center">
                  {languagesList.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code as any)}
                      className={`flex-1 py-1.5 text-[11px] font-semibold rounded-md border transition-all ${
                        language === lang.code
                          ? 'bg-navy-medium border-card-border text-gold-soft font-bold'
                          : 'border-card-border bg-transparent text-text-body hover:text-text-heading'
                      }`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
                
                <Link
                  href="/contact"
                  className="py-3 text-center rounded-lg bg-gold-accent text-white font-sans text-xs font-semibold tracking-wider uppercase hover:bg-gold-accent/90 transition-all shadow-sm"
                >
                  GET STARTED
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
