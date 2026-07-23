'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Mail, Phone, Clock, MessageSquare, Send, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', division: 'General Inquiry', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'contact'), {
        ...formData,
        timestamp: serverTimestamp()
      });
      
      setSuccess(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.8 },
        colors: ['#c5a880', '#dfba73', '#1e40af']
      });
      setFormData({ name: '', email: '', phone: '', division: 'General Inquiry', message: '' });
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error(err);
      alert("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-navy-dark pt-32 pb-24">
        {/* Background glow balls */}
        <div className="glow-ball glow-ball-purple w-96 h-96 top-20 -left-10 opacity-10" />
        <div className="glow-ball glow-ball-gold w-96 h-96 bottom-20 -right-10 opacity-10" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Header */}
          <div className="text-center mb-16 flex flex-col gap-3">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-accent">
              CONNECT WITH US
            </span>
            <h1 className="font-display font-black text-4xl sm:text-5xl text-white tracking-tight">
              Get in Touch with Mahdev
            </h1>
            <p className="font-sans text-gray-400 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
              Have a question about our ERP systems, travel deals, or wedding stages? Send us a direct line and our directors will respond.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
            {/* Left Column: Direct Info & Map */}
            <div className="lg:col-span-5 flex flex-col gap-8">
              <div className="glass-premium rounded-3xl p-8 border border-white/5 flex flex-col gap-6">
                <h3 className="font-display font-bold text-xl text-white">Main Branch Office</h3>
                
                <div className="flex flex-col gap-5 font-sans text-sm">
                  <div className="flex items-start gap-4">
                    <MapPin className="w-5 h-5 text-gold-soft shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-white font-semibold">Address</h4>
                      <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                        41/22, Pickerings Road, Kotahena, Colombo 13, Sri Lanka.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Phone className="w-5 h-5 text-gold-soft shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-white font-semibold">Phone Lines</h4>
                      <p className="text-gray-400 text-xs mt-1">
                        076 898 8970 / 075 092 8078
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Mail className="w-5 h-5 text-gold-soft shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-white font-semibold">Email Inbox</h4>
                      <p className="text-gray-400 text-xs mt-1">
                        info.mahdev.lk@gmail.com
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Clock className="w-5 h-5 text-gold-soft shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-white font-semibold">Working Hours</h4>
                      <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                        Monday - Saturday: 9:00 AM - 8:00 PM <br />
                        (Sunday: Prior Booking Only)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 border-t border-white/5 pt-6 mt-2">
                  <a 
                    href="https://wa.me/94768988970?text=Hi%20Mahdev" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 py-3 text-center rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 transition-all font-sans text-xs font-bold tracking-wide flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    WHATSAPP DIRECT
                  </a>
                </div>
              </div>

              {/* Map container */}
              <div className="flex-1 min-h-[300px] rounded-3xl overflow-hidden border border-white/5 relative group shadow-2xl">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.5905187788484!2d79.86047717498674!3d6.939466593060667!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae2593b4f62cae1%3A0xc0fb198eeaa07897!2sPickerings%20Rd%2C%20Colombo!5e0!3m2!1sen!2slk!4v1719650000000!5m2!1sen!2slk"
                  width="100%" 
                  height="100%" 
                  style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) grayscale(80%)' }} 
                  loading="lazy"
                  title="Mahdev Office Location Map"
                />
                <div className="absolute inset-0 bg-navy-dark/10 pointer-events-none group-hover:bg-transparent transition-all duration-300" />
              </div>
            </div>

            {/* Right Column: Contact Form */}
            <div className="lg:col-span-7">
              <div className="glass-premium rounded-3xl p-8 sm:p-10 border border-gold-accent/15 shadow-2xl h-full flex flex-col justify-center">
                <h3 className="font-display font-bold text-xl text-white mb-6">Send an Executive Message</h3>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider font-sans">Full Name</label>
                      <input 
                        type="text" 
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-sm focus:outline-none text-white font-sans transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider font-sans">Email Address</label>
                      <input 
                        type="email" 
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-sm focus:outline-none text-white font-sans transition-all"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider font-sans">Phone Number</label>
                      <input 
                        type="tel" 
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-sm focus:outline-none text-white font-sans transition-all"
                        placeholder="+94 7X XXX XXXX"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider font-sans">Division Interested</label>
                      <select 
                        value={formData.division}
                        onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                        className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-sm focus:outline-none text-white font-sans transition-all [&>option]:bg-navy-dark"
                      >
                        <option>General Inquiry</option>
                        <option>SWS Event Management</option>
                        <option>Studio U1 Photography</option>
                        <option>Mahdev ERP Systems</option>
                        <option>IT & Cloud Solutions</option>
                        <option>Mahdev Travels</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider font-sans">Message Body</label>
                    <textarea 
                      rows={6}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-sm focus:outline-none text-white font-sans transition-all resize-none"
                      placeholder="Detail your operational or event decoration inquiries..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-gold-accent to-gold-soft disabled:opacity-50 text-navy-dark font-sans font-bold text-sm tracking-wider rounded-xl transition-all hover:brightness-110 flex items-center justify-center gap-2 mt-2 shadow-lg shadow-gold-accent/15"
                  >
                    {loading ? 'SENDING INQUIRY...' : 'SEND INQUIRY'}
                    <Send className="w-4 h-4" />
                  </button>

                  {success && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      className="flex items-center gap-3 p-4 bg-gold-accent/10 border border-gold-accent/30 rounded-2xl mt-4"
                    >
                      <CheckCircle className="w-5 h-5 text-gold-soft shrink-0 font-bold" />
                      <span className="text-sm text-gold-soft font-sans font-semibold">
                        Your message has been logged directly with our executive office. We will call/email you within 4 business hours.
                      </span>
                    </motion.div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
