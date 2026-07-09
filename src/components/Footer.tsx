/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import { ActivePage, ThemeSettings } from '../types';
import { COMPANY_CONTACT } from '../data';
import { Phone, Mail, Clock, MapPin, ExternalLink, Globe, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';
import mahadevLogo from '../assets/images/mahadev_logo_1782729909050.jpg';

const defaultLogo = mahadevLogo;

interface FooterProps {
  setActivePage: (page: ActivePage) => void;
  isDarkMode: boolean;
  contactInfo?: any;
  themeSettings?: ThemeSettings;
}

function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.55, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Footer({ setActivePage, isDarkMode, contactInfo = COMPANY_CONTACT, themeSettings }: FooterProps) {
  const handleNavClick = (page: ActivePage) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();
  const logoImage = contactInfo?.logo || themeSettings?.brandLogo || defaultLogo;
  const brandName = themeSettings?.brandName || 'Mahdev Pvt Ltd';
  const brandWord1 = brandName.split(' ')[0] || 'MAHDEV';
  const brandWordRest = brandName.split(' ').slice(1).join(' ') || 'Pvt Ltd';

  return (
    <footer 
      id="app-footer"
      className={`border-t transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-neutral-950 border-emerald-500/10 text-slate-400' 
          : 'bg-slate-50 border-slate-200 text-slate-600'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12">
          
          {/* Column 1: Brand Info */}
          <Reveal className="flex flex-col space-y-4">
            <div 
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={() => handleNavClick(ActivePage.Home)}
            >
              <img 
                src={logoImage} 
                alt={`${brandName} Logo`} 
                className="w-10 h-10 rounded-lg object-cover border border-emerald-500/20"
                referrerPolicy="no-referrer"
              />
              <div className="flex flex-col">
                <span className={`text-base font-bold tracking-wider leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {brandWord1}
                </span>
                <span className="text-[9px] tracking-widest uppercase font-mono text-emerald-500 font-semibold mt-1">
                  {brandWordRest}
                </span>
              </div>
            </div>
            <p className="text-sm leading-relaxed">
              Crafting premium visual memories, event atmospheres, custom software solutions, and world-class web systems.
            </p>
            
            {/* Social Icons */}
            <div className="flex items-center space-x-3 pt-2">
              {[
                { icon: <Facebook size={16} />, url: 'https://facebook.com' },
                { icon: <Instagram size={16} />, url: 'https://instagram.com' },
                { icon: <Twitter size={16} />, url: 'https://twitter.com' },
                { icon: <Linkedin size={16} />, url: 'https://linkedin.com' },
              ].map((item, idx) => (
                <a
                  key={idx}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className={`p-2.5 rounded-xl border transition-all ${
                    isDarkMode 
                      ? 'border-emerald-500/10 bg-neutral-900/40 text-emerald-400 hover:bg-emerald-500 hover:text-white hover:border-emerald-500' 
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-emerald-600 hover:text-white hover:border-emerald-600'
                  }`}
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </Reveal>

          {/* Column 2: Quick Navigation */}
          <Reveal delay={0.08} className="flex flex-col space-y-4">
            <h4 className={`text-sm font-bold uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Corporate Pages
            </h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: 'Home Page', page: ActivePage.Home },
                { label: 'Event Decoration', page: ActivePage.Decoration },
                { label: 'Cinematic Photography', page: ActivePage.Photography },
                { label: 'Mahdev Travels & Tours', page: ActivePage.Travels },
                { label: 'Enterprise ERP Suite', page: ActivePage.ErpSolutions },
                { label: 'IT & Cloud Solutions', page: ActivePage.ItSolutions },
                { label: 'Connect With Us', page: ActivePage.Contact },
              ].map((item, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => handleNavClick(item.page)}
                    className="hover:text-emerald-500 transition-colors text-left flex items-center space-x-1.5 focus:outline-none"
                  >
                    <span className="text-emerald-500">›</span>
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Column 3: Contact details */}
          <Reveal delay={0.12} className="flex flex-col space-y-4">
            <h4 className={`text-sm font-bold uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Get In Touch
            </h4>
            <ul className="space-y-3.5 text-sm">
              <li className="flex items-start space-x-3">
                <MapPin size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                <span>{contactInfo.address}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={16} className="text-emerald-500 shrink-0" />
                <a href={`tel:${contactInfo.phone}`} className="hover:text-emerald-500 transition-colors">
                  {contactInfo.phone}
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={16} className="text-emerald-500 shrink-0" />
                <a href={`mailto:${contactInfo.email}`} className="hover:text-emerald-500 transition-colors">
                  {contactInfo.email}
                </a>
              </li>
              <li className="flex items-start space-x-3">
                <Clock size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                <span>{contactInfo.hours}</span>
              </li>
            </ul>
          </Reveal>

          {/* Column 4: Google Map Embed */}
          <Reveal delay={0.16} className="flex flex-col space-y-4">
            <h4 className={`text-sm font-bold uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Headquarters Location
            </h4>
            <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-emerald-500/20 group shadow-lg shadow-black/10">
              <iframe
                src={contactInfo.mapsIframe}
                className="absolute inset-0 w-full h-full border-0 filter grayscale invert contrast-125 opacity-70 group-hover:opacity-90 transition-opacity duration-300"
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`${brandName} Corporate Office Map Location`}
              />
              <div className="absolute inset-0 bg-emerald-950/10 pointer-events-none" />
              <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-md text-[10px] text-white px-2 py-1 rounded-md flex items-center space-x-1 border border-emerald-500/20">
                <span>View Google Map</span>
                <ExternalLink size={10} />
              </div>
            </div>
          </Reveal>

        </div>

        {/* Bottom Bar */}
        <div className={`mt-12 pt-8 border-t flex flex-col md:flex-row items-center justify-between text-xs space-y-4 md:space-y-0 ${
          isDarkMode ? 'border-emerald-500/10' : 'border-slate-200'
        }`}>
          <p>© {currentYear} {brandName}. All Rights Reserved. Private Registry Registered.</p>
          <div className="flex items-center space-x-6">
            <a href="#privacy" className="hover:text-emerald-500 transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-emerald-500 transition-colors">Terms of Service</a>
            <a href="#sitemap" className="hover:text-emerald-500 transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
