/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import RevealSection from './RevealSection';
import { 
  Phone, Mail, MapPin, Clock, MessageSquare, Send, CheckCircle, 
  HelpCircle, ChevronDown, Sparkles, ShieldAlert 
} from 'lucide-react';
import { COMPANY_CONTACT } from '../data';
import { ThemeSettings } from '../types';
import EmailCopySection from './EmailCopySection';

interface ContactViewProps {
  isDarkMode: boolean;
  contactInfo?: typeof COMPANY_CONTACT;
  themeSettings?: ThemeSettings;
}

export default function ContactView({ isDarkMode, contactInfo = COMPANY_CONTACT, themeSettings }: ContactViewProps) {
  const brandName = themeSettings?.brandName || 'Mahdev Pvt Ltd';

  const heroRef = React.useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start']
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '35%']);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('Decoration Services Inquiry');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // FAQ Accordion State
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setSubmitted(true);
  };

  const faqs = [
    { q: 'How far in advance should we book Decoration services?', a: 'For flagship luxury wedding stages and grand banquet halls, we recommend booking 3 to 6 months in advance. However, smaller birthday layouts or stage setups can be booked within 2 to 4 weeks, depending on resource schedules.' },
    { q: 'Can we integrate the ERP POS offline if internet fails?', a: 'Yes! Our POS Point-of-Sale module utilizes offline-first database synchronization. Transactions compile securely inside local browser storage and seamlessly upload to central AWS/GCP servers the millisecond internet restores.' },
    { q: 'Do you provide raw cinematography reels and photos?', a: 'We provide fully color-graded, polished cinematic video packages and ultra-high-definition digital photo portfolios. Unedited RAW files can be requested in our Grand Masterpiece package.' },
    { q: 'Are your IT web portals compliant with GDPR/HIPAA standards?', a: 'Absolutely. Our healthcare clinic webs, student registrars, and retail e-commerce portals are pre-configured with secure SSL, multi-factor login checks, and database firewalls satisfying global standards.' }
  ];

  return (
    <div id="contact-view-container" className="relative w-full z-10">
      
      {/* Hero Banner */}
      <section ref={heroRef} className="relative py-20 px-4 sm:px-6 lg:px-8 border-b border-emerald-500/10 bg-black">
        <RevealSection className="max-w-7xl mx-auto relative z-10 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 font-mono">
            Connect with {brandName}
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mt-3 mb-6">
            Partner With Us Today
          </h1>
          <p className="text-slate-300 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Have an upcoming wedding, a photography shoot, or an enterprise software project? Reach out below and our specialised division directors will connect with you.
          </p>
        </RevealSection>
      </section>

      {/* Main Form & Info Grid */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <RevealSection className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Column 1: Info and Coordinates (5 Cols) */}
            <div className="lg:col-span-5 space-y-8">
              <div>
                <h2 className={`text-2xl font-extrabold tracking-tight mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Corporate Headquarters
                </h2>
                <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Our centralized office coordinates event logistics, software engineering sprints, and film post-production edits. Walk-ins are welcome by prior appointment.
                </p>
              </div>

              {/* Contacts cards */}
              <div className="space-y-4">
                {[
                  { icon: <MapPin size={18} className="text-emerald-400 shrink-0" />, title: 'Corporate Address', detail: contactInfo.address, url: null },
                  { icon: <Phone size={18} className="text-emerald-400 shrink-0" />, title: 'Direct Hotline', detail: contactInfo.phone, url: `tel:${contactInfo.phone}` },
                  { icon: <Mail size={18} className="text-emerald-400 shrink-0" />, title: 'Inquiry Inbox', detail: contactInfo.email, url: `mailto:${contactInfo.email}` },
                  { icon: <Clock size={18} className="text-emerald-400 shrink-0" />, title: 'Business Hours', detail: contactInfo.hours, url: null },
                ].map((item, idx) => (
                  <div 
                    key={idx}
                    className={`p-5 rounded-xl border flex items-start space-x-4 ${
                      isDarkMode ? 'bg-neutral-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        {item.title}
                      </h4>
                      {item.url ? (
                        <a href={item.url} className="text-sm font-semibold hover:text-emerald-500 transition-colors">
                          {item.detail}
                        </a>
                      ) : (
                        <p className={`text-sm font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-850'}`}>{item.detail}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: Message Form Terminal (7 Cols) */}
            <div className="lg:col-span-7">
              <div className={`p-8 rounded-3xl border ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-neutral-900 to-black border-emerald-500/10 shadow-2xl' 
                  : 'bg-white border-slate-200 shadow-xl'
              }`}>
                <h3 className={`text-lg font-extrabold tracking-tight mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Drop Us A Digital Message
                </h3>
                <p className={`text-xs sm:text-sm mb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Required fields are marked (*). General inquiries are answered within 24 hours.
                </p>

                <AnimatePresence mode="wait">
                  {!submitted ? (
                    <motion.form 
                      key="contact-form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleContactSubmit} 
                      className="space-y-5"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Name */}
                        <div>
                          <label className={`block text-[10px] font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                            Your Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={`w-full px-4 py-3.5 rounded-xl border text-sm focus:outline-none focus:border-emerald-500 ${
                              isDarkMode ? 'bg-neutral-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                            }`}
                            placeholder="Rajesh Singhania"
                          />
                        </div>

                        {/* Email */}
                        <div>
                          <label className={`block text-[10px] font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                            Email Address *
                          </label>
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`w-full px-4 py-3.5 rounded-xl border text-sm focus:outline-none focus:border-emerald-500 ${
                              isDarkMode ? 'bg-neutral-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                            }`}
                            placeholder="rajesh@singhania.com"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Phone */}
                        <div>
                          <label className={`block text-[10px] font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className={`w-full px-4 py-3.5 rounded-xl border text-sm focus:outline-none focus:border-emerald-500 ${
                              isDarkMode ? 'bg-neutral-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                            }`}
                            placeholder="+91 98765 43210"
                          />
                        </div>

                        {/* Topic */}
                        <div>
                          <label className={`block text-[10px] font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                            Sector Department *
                          </label>
                          <select
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className={`w-full px-4 py-3.5 rounded-xl border text-sm focus:outline-none focus:border-emerald-500 ${
                              isDarkMode ? 'bg-neutral-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                            }`}
                          >
                            <option value="Decoration Services Inquiry">Decoration Services</option>
                            <option value="Cinematic Photography Booking">Cinematic Photography</option>
                            <option value="Enterprise ERP software custom suite">Enterprise ERP suites</option>
                            <option value="Innovative IT Solutions & dev">Innovative IT solutions</option>
                            <option value="General Corporate inquiry">General business partners</option>
                          </select>
                        </div>
                      </div>

                      {/* Message */}
                      <div>
                        <label className={`block text-[10px] font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                          Message Details *
                        </label>
                        <textarea
                          required
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          rows={4}
                          className={`w-full px-4 py-3.5 rounded-xl border text-sm focus:outline-none focus:border-emerald-500 ${
                            isDarkMode ? 'bg-neutral-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                          placeholder="Please elaborate on your requirements, target dates, or locations..."
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-lg flex items-center justify-center space-x-2"
                      >
                        <Send size={14} />
                        <span>Send Transmission</span>
                      </button>
                    </motion.form>
                  ) : (
                    <motion.div 
                      key="contact-success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-8 space-y-4"
                    >
                      <div className="inline-flex p-3 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                        <CheckCircle size={36} />
                      </div>
                      <h4 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        Message Saved Successfully!
                      </h4>
                      <p className={`text-xs max-w-sm mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        Thank you, {name}. Your transmission has been securely filed. You can now send an instant copy to our support inbox using the portal below.
                      </p>

                      <EmailCopySection
                        isDarkMode={isDarkMode}
                        name={name}
                        email={email}
                        phone={phone}
                        brand="Corporate HQ"
                        serviceType={subject}
                        notes={message}
                        onDone={() => {
                          setSubmitted(false);
                          setName('');
                          setEmail('');
                          setPhone('');
                          setMessage('');
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

          </div>
        </RevealSection>
      </section>

      {/* Frequently Asked Questions */}
      <section className={`py-24 px-4 sm:px-6 lg:px-8 border-t border-b ${
        isDarkMode ? 'bg-neutral-950/40 border-emerald-500/10' : 'bg-slate-50 border-slate-200'
      }`}>
        <RevealSection className="max-w-4xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Help & FAQ Section
            </h2>
            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Find immediate answers regarding booking agreements, software deployment velocities, and camera assets.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div 
                  key={idx}
                  className={`rounded-2xl border overflow-hidden transition-all ${
                    isDarkMode 
                      ? 'bg-neutral-900/30 border-slate-800' 
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                  >
                    <div className="flex items-center space-x-3 pr-4">
                      <HelpCircle size={16} className="text-emerald-500 shrink-0" />
                      <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {faq.q}
                      </span>
                    </div>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-slate-400"
                    >
                      <ChevronDown size={16} />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                      >
                        <div className={`px-6 pb-6 pt-1 text-xs sm:text-sm leading-relaxed border-t ${
                          isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-600'
                        }`}>
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

        </RevealSection>
      </section>

    </div>
  );
}
