'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send,
  CheckCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

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
    <footer className="relative bg-navy-dark border-t border-white/5 pt-20 pb-28 md:pb-12 overflow-hidden">
      {/* Background glow ball */}
      <div className="glow-ball glow-ball-purple w-96 h-96 -bottom-20 -left-20 opacity-10" />
      <div className="glow-ball glow-ball-gold w-96 h-96 -bottom-20 -right-20 opacity-10" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          {/* Brand Info */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-gold-accent/20">
                <Image 
                  src="/images/logo.png" 
                  alt="Mahdev Logo" 
                  fill 
                  className="object-cover"
                />
              </div>
              <div>
                <span className="font-display font-bold text-xl tracking-wider text-white">MAHDEV</span>
                <span className="block text-[10px] tracking-[0.2em] text-gold-accent font-semibold uppercase -mt-0.5">PVT LTD</span>
              </div>
            </Link>

            <p className="text-gray-400 font-sans text-sm leading-relaxed max-w-sm">
              An international elite corporate conglomerate providing enterprise-grade ERP architecture, custom web & mobile apps, cinematic storytelling, wedding decorations, and premium tours.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {[
                { icon: FaFacebook, href: 'https://facebook.com/mahdev' },
                { icon: FaInstagram, href: 'https://instagram.com/mahdev' },
                { icon: FaLinkedin, href: 'https://linkedin.com/company/mahdev' }
              ].map((social, idx) => {
                const Icon = social.icon;
                return (
                  <Link 
                    key={idx}
                    href={social.href}
                    target="_blank"
                    className="w-10 h-10 rounded-xl glass border border-white/5 hover:border-gold-accent/30 flex items-center justify-center text-gray-400 hover:text-gold-soft transition-all duration-300 hover:scale-105"
                  >
                    <Icon className="w-5 h-5" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <h4 className="font-display text-sm font-semibold uppercase text-gold-accent tracking-wider">Company</h4>
            <div className="flex flex-col gap-2.5 font-sans text-sm">
              <Link href="/" className="text-gray-400 hover:text-white transition-colors">Home</Link>
              <Link href="/portfolio" className="text-gray-400 hover:text-white transition-colors">Case Studies</Link>
              <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Branch Locations</Link>
              <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Careers</Link>
            </div>
          </div>

          {/* Divisions */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <h4 className="font-display text-sm font-semibold uppercase text-gold-accent tracking-wider">Divisions</h4>
            <div className="flex flex-col gap-2.5 font-sans text-sm">
              <Link href="/divisions/erp" className="text-gray-400 hover:text-white transition-colors">Mahdev ERP</Link>
              <Link href="/divisions/sws-events" className="text-gray-400 hover:text-white transition-colors">SWS Events</Link>
              <Link href="/divisions/u1-studio" className="text-gray-400 hover:text-white transition-colors">U1 Studio</Link>
              <Link href="/divisions/it-solutions" className="text-gray-400 hover:text-white transition-colors">IT Solutions</Link>
              <Link href="/divisions/travels" className="text-gray-400 hover:text-white transition-colors">Mahdev Travels</Link>
            </div>
          </div>

          {/* Contact Details & Newsletter */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <h4 className="font-display text-sm font-semibold uppercase text-gold-accent tracking-wider">Newsletter</h4>
              <p className="text-xs text-gray-400 leading-relaxed font-sans">
                Subscribe to receive seasonal deals, technology audits, and luxury design insights.
              </p>
              
              <form onSubmit={handleSubscribe} className="relative flex items-center">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold-accent/50 text-white placeholder-gray-500 font-sans pr-12 transition-all"
                />
                <button 
                  type="submit"
                  className="absolute right-1.5 p-2 bg-gradient-to-r from-gold-accent to-gold-soft hover:brightness-110 rounded-lg text-navy-dark transition-all"
                >
                  {subscribed ? <CheckCircle className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                </button>
              </form>
              {subscribed && (
                <motion.p 
                  initial={{ opacity: 0, y: 5 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="text-xs text-gold-soft font-semibold font-sans mt-1"
                >
                  Thank you! You have successfully subscribed.
                </motion.p>
              )}
            </div>

            {/* Map Preview */}
            <div className="h-28 rounded-xl overflow-hidden border border-white/5 relative group">
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
          <p>© {new Date().getFullYear()} Mahdev Pvt Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gray-300 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
