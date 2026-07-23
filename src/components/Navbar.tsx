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
  Menu, 
  X, 
  ChevronDown,
  Sparkles,
  Camera,
  Cpu,
  Globe,
  Compass
} from 'lucide-react';

const divisions = [
  { name: 'SWS Events', href: '/divisions/sws-events', icon: Sparkles, color: 'text-purple-400' },
  { name: 'Studio U1', href: '/divisions/u1-studio', icon: Camera, color: 'text-cyan-400' },
  { name: 'Mahdev ERP', href: '/divisions/erp', icon: Cpu, color: 'text-yellow-400' },
  { name: 'IT Solutions', href: '/divisions/it-solutions', icon: Globe, color: 'text-blue-400' },
  { name: 'Mahdev Travels', href: '/divisions/travels', icon: Compass, color: 'text-green-400' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on page change
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  const isActive = (path: string) => pathname === path;
  const isDivisionActive = () => pathname.startsWith('/divisions');

  return (
    <>
      {/* Top Header - Desktop & Mobile Logo Bar */}
      <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'py-3 bg-navy-dark/80 backdrop-blur-md border-b border-white/5' : 'py-5 bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-gold-accent/20 group-hover:border-gold-accent/50 transition-all duration-300">
              <Image 
                src="/images/logo.png" 
                alt="Mahdev Logo" 
                fill 
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div>
              <span className="font-display font-bold text-lg tracking-wider text-white group-hover:text-gold-soft transition-colors">MAHDEV</span>
              <span className="block text-[9px] tracking-[0.2em] text-gold-accent font-semibold uppercase -mt-1">PVT LTD</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link 
              href="/" 
              className={`font-sans text-sm font-medium tracking-wide transition-colors ${
                isActive('/') ? 'text-gold-soft' : 'text-gray-300 hover:text-white'
              }`}
            >
              Home
            </Link>

            {/* Divisions Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                onMouseEnter={() => setDropdownOpen(true)}
                className={`flex items-center gap-1.5 font-sans text-sm font-medium tracking-wide transition-colors ${
                  isDivisionActive() ? 'text-gold-soft' : 'text-gray-300 hover:text-white'
                }`}
              >
                Divisions
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    onMouseLeave={() => setDropdownOpen(false)}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-64 rounded-2xl glass-premium p-2 border border-gold-accent/20 shadow-2xl"
                  >
                    <div className="grid gap-1">
                      {divisions.map((div) => {
                        const Icon = div.icon;
                        return (
                          <Link
                            key={div.name}
                            href={div.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                              isActive(div.href) 
                                ? 'bg-gold-accent/10 border border-gold-accent/20 text-gold-soft' 
                                : 'hover:bg-white/5 text-gray-300 hover:text-white'
                            }`}
                          >
                            <Icon className={`w-5 h-5 ${div.color}`} />
                            <span className="font-sans text-sm font-medium">{div.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link 
              href="/portfolio" 
              className={`font-sans text-sm font-medium tracking-wide transition-colors ${
                isActive('/portfolio') ? 'text-gold-soft' : 'text-gray-300 hover:text-white'
              }`}
            >
              Portfolio
            </Link>

            <Link 
              href="/contact" 
              className={`font-sans text-sm font-medium tracking-wide transition-colors ${
                isActive('/contact') ? 'text-gold-soft' : 'text-gray-300 hover:text-white'
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <Link 
              href="/contact" 
              className="px-6 py-2.5 rounded-full border border-gold-accent/30 text-gold-soft hover:bg-gold-accent/10 transition-all font-sans text-xs font-semibold tracking-wider hover:border-gold-accent/70"
            >
              INQUIRE NOW
            </Link>
          </div>

          {/* Mobile Menu Button - Just triggers bottom nav spotlight or full page contact */}
          <div className="md:hidden flex items-center gap-4">
            <Link
              href="https://wa.me/94768988970?text=Hi%20Mahdev%20Pvt%20Ltd"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full glass border border-green-500/20 text-green-400"
            >
              <MessageSquare className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Floating Bottom Menu for Mobile Version */}
      <div className="md:hidden fixed bottom-6 left-0 w-full z-50 px-4 pointer-events-none">
        <div className="max-w-md mx-auto rounded-full glass-premium p-2 border border-gold-accent/15 shadow-2xl flex items-center justify-around pointer-events-auto">
          <Link href="/" className="flex flex-col items-center justify-center py-2 px-3 rounded-full transition-all">
            <Home className={`w-5 h-5 ${isActive('/') ? 'text-gold-soft scale-110' : 'text-gray-400'}`} />
            <span className={`text-[9px] font-medium mt-1 tracking-wide ${isActive('/') ? 'text-gold-soft' : 'text-gray-400'}`}>Home</span>
          </Link>

          {/* Divisions trigger sheet */}
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center justify-center py-2 px-3 rounded-full transition-all"
          >
            <Briefcase className={`w-5 h-5 ${isDivisionActive() ? 'text-gold-soft scale-110' : 'text-gray-400'}`} />
            <span className={`text-[9px] font-medium mt-1 tracking-wide ${isDivisionActive() ? 'text-gold-soft' : 'text-gray-400'}`}>Divisions</span>
          </button>

          <Link href="/portfolio" className="flex flex-col items-center justify-center py-2 px-3 rounded-full transition-all">
            <ImageIcon className={`w-5 h-5 ${isActive('/portfolio') ? 'text-gold-soft scale-110' : 'text-gray-400'}`} />
            <span className={`text-[9px] font-medium mt-1 tracking-wide ${isActive('/portfolio') ? 'text-gold-soft' : 'text-gray-400'}`}>Gallery</span>
          </Link>

          <Link href="/contact" className="flex flex-col items-center justify-center py-2 px-3 rounded-full transition-all">
            <Mail className={`w-5 h-5 ${isActive('/contact') ? 'text-gold-soft scale-110' : 'text-gray-400'}`} />
            <span className={`text-[9px] font-medium mt-1 tracking-wide ${isActive('/contact') ? 'text-gold-soft' : 'text-gray-400'}`}>Contact</span>
          </Link>
        </div>
      </div>

      {/* Mobile Divisions Drawer / Bottom Sheet */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm md:hidden"
            />
            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 w-full rounded-t-3xl glass-premium border-t border-gold-accent/20 z-50 p-6 md:hidden max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-white/5">
                <div>
                  <h3 className="font-display font-bold text-lg text-white">Mahdev Divisions</h3>
                  <p className="text-xs text-gray-400">Select an elite business suite</p>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid gap-3 mb-8">
                {divisions.map((div) => {
                  const Icon = div.icon;
                  return (
                    <Link
                      key={div.name}
                      href={div.href}
                      className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-300 ${
                        isActive(div.href)
                          ? 'bg-gold-accent/10 border border-gold-accent/20 text-gold-soft'
                          : 'bg-white/5 border border-white/5 text-gray-300 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-xl bg-white/5">
                          <Icon className={`w-6 h-6 ${div.color}`} />
                        </div>
                        <span className="font-sans text-sm font-semibold tracking-wide">{div.name}</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-gold-accent tracking-wider">Explore</span>
                    </Link>
                  );
                })}
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/contact"
                  className="flex-1 py-3 text-center rounded-xl bg-gradient-to-r from-gold-accent to-gold-soft text-navy-dark font-sans text-sm font-bold tracking-wide"
                >
                  GET IN TOUCH
                </Link>
                <Link
                  href="https://wa.me/94768988970?text=Hi%20Mahdev"
                  target="_blank"
                  className="px-4 py-3 rounded-xl border border-green-500/20 text-green-400 flex items-center justify-center"
                >
                  <MessageSquare className="w-5 h-5" />
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
