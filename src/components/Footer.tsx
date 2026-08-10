'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaFacebook, FaInstagram, FaLinkedin, FaWhatsapp } from 'react-icons/fa';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send,
  CheckCircle,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useLanguage } from '@/context/LanguageContext';

export default function Footer() {
  const { language, t } = useLanguage();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [logoUrl, setLogoUrl] = useState('/images/logo.png');
  const [footerData, setFooterData] = useState<any>({
    description: {
      en: 'An international elite corporate conglomerate providing enterprise-grade ERP architecture, Studio U1 cinematography, SWS event management, and premium travels.',
      si: 'ව්‍යවසාය මට්ටමේ ඊආර්පී (ERP) පද්ධති, චිත්‍රපටකරණය, ඉසව් කළමනාකරණය සහ සුඛෝපභෝගී සංචාරක සේවා සපයන ප්‍රමුඛ ජාත්‍යන්තර සමාගමකි.',
      ta: 'நிறுவன அளவிலான ஈஆர்பி (ERP) மென்பொருள், திரைப்படக் கலை, நிகழ்வு மேலாண்மை மற்றும் சொகுசு போக்குவரத்து வழங்கும் முன்னணி கூட்டு நிறுவனம்.'
    },
    businessHours: {
      en: 'Mon - Fri: 8:30AM - 5:30PM\nSat: 9:00AM - 1:00PM',
      si: 'සඳුදා - සිකුරාදා: පෙ.ව. 8:30 - ප.ව. 5:30\nසෙනසුරාදා: පෙ.ව. 9:00 - ප.ව. 1:00',
      ta: 'திங்கள் - வெள்ளி: மு.ப. 8:30 - பி.ப. 5:30\nசனி: மு.ப. 9:00 - பி.ப. 1:00'
    },
    phone: '076 898 8970',
    email: 'info.mahdev.lk@gmail.com'
  });

  useEffect(() => {
    const unsubBranding = onSnapshot(doc(db, 'settings', 'branding'), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        if (d.logoUrl) setLogoUrl(d.logoUrl);
      }
    });

    const unsubFooter = onSnapshot(doc(db, 'settings', 'footer'), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setFooterData((prev: any) => ({
          ...prev,
          ...d
        }));
      }
    });

    return () => {
      unsubBranding();
      unsubFooter();
    };
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#c5a880', '#dfba73', '#1e40af']
      });
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="relative bg-navy-dark pt-16 pb-28 md:pb-12 border-t border-white/5 overflow-hidden">
      
      {/* Premium Animated Wave Separator */}
      <div className="wave-container">
        <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="wave-animation">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="shape-fill"></path>
        </svg>
      </div>

      {/* Background glow ball */}
      <div className="glow-ball glow-ball-purple w-96 h-96 -bottom-20 -left-20 opacity-10" />
      <div className="glow-ball glow-ball-gold w-96 h-96 -bottom-20 -right-20 opacity-10" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          {/* Brand Info */}
          <div className="lg:col-span-3 flex flex-col gap-5">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-gold-accent/20">
                <Image 
                  src={logoUrl} 
                  alt="Mahdev Logo" 
                  fill 
                  className="object-cover"
                />
              </div>
              <div className="text-left">
                <span className="font-display font-bold text-lg tracking-wider text-white">MAHDEV</span>
                <span className="block text-[9px] tracking-[0.2em] text-gold-accent font-semibold uppercase -mt-1">PVT LTD</span>
              </div>
            </Link>

            <p className="text-gray-400 font-sans text-xs sm:text-sm leading-relaxed max-w-sm text-left">
              {t(footerData.description)}
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-2.5 mt-1">
              {[
                { icon: FaFacebook, href: 'https://facebook.com/mahdev' },
                { icon: FaInstagram, href: 'https://instagram.com/mahdev' },
                { icon: FaLinkedin, href: 'https://linkedin.com/company/mahdev' },
                { icon: FaWhatsapp, href: `https://wa.me/${footerData.phone?.replace(/[^0-9]/g, '')}` }
              ].map((social, idx) => {
                const Icon = social.icon;
                return (
                  <Link 
                    key={idx}
                    href={social.href}
                    target="_blank"
                    className="w-9 h-9 rounded-xl glass border border-white/5 hover:border-gold-accent/30 flex items-center justify-center text-gray-400 hover:text-gold-soft transition-all duration-300 hover:scale-105"
                  >
                    <Icon className="w-4 h-4" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 flex flex-col gap-4 text-left">
            <h4 className="font-display text-xs font-bold uppercase text-gold-accent tracking-wider">{t('navigation')}</h4>
            <div className="flex flex-col gap-2.5 font-sans text-xs sm:text-sm">
              <Link href="/" className="text-gray-400 hover:text-white transition-colors">{t('home')}</Link>
              <Link href="/portfolio" className="text-gray-400 hover:text-white transition-colors">{t('portfolio')}</Link>
              <Link href="/careers" className="text-gray-400 hover:text-white transition-colors">{t('careers')}</Link>
              <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">{t('contact')}</Link>
            </div>
          </div>

          {/* Services */}
          <div className="lg:col-span-2 flex flex-col gap-4 text-left">
            <h4 className="font-display text-xs font-bold uppercase text-gold-accent tracking-wider">{t('divisions')}</h4>
            <div className="flex flex-col gap-2.5 font-sans text-xs sm:text-sm">
              <Link href="/divisions/sws-events" className="text-gray-400 hover:text-white transition-colors">SWS Events</Link>
              <Link href="/divisions/u1-studio" className="text-gray-400 hover:text-white transition-colors">U1 Photography</Link>
              <Link href="/divisions/it-solutions" className="text-gray-400 hover:text-white transition-colors">IT Solutions</Link>
              <Link href="/divisions/erp" className="text-gray-400 hover:text-white transition-colors">ERP Software</Link>
              <Link href="/divisions/travels" className="text-gray-400 hover:text-white transition-colors">Travel Rentals</Link>
            </div>
          </div>

          {/* Contact Details & Hours */}
          <div className="lg:col-span-3 flex flex-col gap-4 text-left font-sans text-xs sm:text-sm">
            <h4 className="font-display text-xs font-bold uppercase text-gold-accent tracking-wider">{t('contact')}</h4>
            
            <div className="flex flex-col gap-3 text-gray-400">
              <div className="flex gap-2.5 items-start">
                <Clock className="w-4 h-4 text-gold-accent shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[10px] uppercase font-bold text-gray-500">{t('Working Hours')}</span>
                  <span className="text-xs text-white whitespace-pre-line">{t(footerData.businessHours)}</span>
                </div>
              </div>

              <div className="flex gap-2.5 items-center">
                <Phone className="w-4 h-4 text-gold-accent shrink-0" />
                <div>
                  <span className="block text-[10px] uppercase font-bold text-gray-500">{t('Call Us')}</span>
                  <span className="text-xs text-white">{footerData.phone}</span>
                </div>
              </div>

              <div className="flex gap-2.5 items-center">
                <Mail className="w-4 h-4 text-gold-accent shrink-0" />
                <div>
                  <span className="block text-[10px] uppercase font-bold text-gray-500">{t('Email')}</span>
                  <span className="text-xs text-white">{footerData.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Google Maps & Newsletter */}
          <div className="lg:col-span-2 flex flex-col gap-5 text-left">
            <div className="flex flex-col gap-3">
              <h4 className="font-display text-xs font-bold uppercase text-gold-accent tracking-wider">{t('Newsletter')}</h4>
              
              <form onSubmit={handleSubscribe} className="relative flex items-center">
                <input 
                  type="email" 
                  placeholder={t('Enter your email')} 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-gold-accent/50 text-white placeholder-gray-500 font-sans pr-10 transition-all"
                />
                <button 
                  type="submit"
                  className="absolute right-1 py-1.5 px-2 bg-gradient-to-r from-gold-accent to-gold-soft hover:brightness-110 rounded-lg text-navy-dark transition-all cursor-pointer"
                >
                  {subscribed ? <CheckCircle className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                </button>
              </form>
            </div>

            {/* Map Preview */}
            <div className="h-24 rounded-xl overflow-hidden border border-white/5 relative group">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.5905187788484!2d79.86047717498674!3d6.939466593060667!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae2593b4f62cae1%3A0xc0fb198eeaa07897!2sPickerings%20Rd%2C%20Colombo!5e0!3m2!1sen!2slk!4v1719650000000!5m2!1sen!2slk"
                width="100%" 
                height="100%" 
                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) grayscale(80%)' }} 
                loading="lazy"
                title="Mahdev Office Location"
              />
              <div className="absolute inset-0 bg-navy-dark/10 pointer-events-none group-hover:bg-transparent transition-all duration-300" />
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-6 font-sans text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Mahdev Pvt Ltd. {t('All rights reserved.')}</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-gray-300 transition-colors">{t('Privacy Policy')}</Link>
            <Link href="/terms" className="hover:text-gray-300 transition-colors">{t('Terms of Service')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
