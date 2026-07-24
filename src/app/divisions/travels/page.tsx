'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Car, Navigation, Shield, Heart, Users, CheckCircle, MessageSquare, Send } from 'lucide-react';
import confetti from 'canvas-confetti';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const fleet = [
  {
    name: 'Elite Passenger Van (Toyota KDH)',
    desc: 'Luxurious high-roof vans, fully dual-air-conditioned, adjustable bucket seats, onboard entertainment systems. Perfect for corporate travel or family tours.',
    capacity: '9 - 14 Seats',
    type: 'Luxury Van',
    features: ['Professional Chauffeur', 'Dual Air-Conditioning', 'Adjustable Seats', 'Luggage Space']
  },
  {
    name: 'VIP Wedding Car (Mercedes C-Class)',
    desc: 'Premium white sedan luxury cars. Clean, polished, decorated with flowers (optional), driven by professional chauffeurs in formals.',
    capacity: '4 Seats',
    type: 'VIP Car',
    features: ['Decorations optional', 'Chauffeur in formal uniform', 'Dual-zone climate control', 'Premium leather interior']
  }
];

const packages = [
  { title: 'Ella Greenery Escape', days: '3 Days / 2 Nights', price: 'Rs. 45,000+', desc: 'Sightseeing in scenic train bridges, tea plantations, waterfalls, and Ella Rock climbs.', img: '/images/van_tour.jpg' },
  { title: 'Sigiriya Cultural Trail', days: '2 Days / 1 Night', price: 'Rs. 35,000+', desc: 'Explore historical rock fortress, Dambulla cave temple, and heritage ruins.', img: '/images/travels_robot_car_1783346316762.jpg' },
  { title: 'Galle Coastal Sunset', days: '1 Day Tour', price: 'Rs. 18,000+', desc: 'Visit Portuguese Galle Fort, sea turtle conservation hubs, and relax on sandy beaches.', img: '/images/van_tour.jpg' }
];

export default function Travels() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', vehicle: 'Toyota KDH Van', date: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'travels'), {
        ...formData,
        timestamp: serverTimestamp()
      });
      
      setSuccess(true);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#c5a880', '#dfba73', '#1e40af']
      });
      setFormData({ name: '', email: '', phone: '', vehicle: 'Toyota KDH Van', date: '', message: '' });
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error(err);
      alert("Failed to submit inquiry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-navy-dark pt-20">
        {/* Banner Section */}
        <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
          <Image 
            src="/images/travels_robot_car_1783346316762.jpg" 
            alt="Travels Banner" 
            fill
            priority
            className="object-cover brightness-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/30 to-transparent" />
          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center flex flex-col items-center gap-4">
            <span className="px-3 py-1 rounded-full glass border border-green-500/35 text-green-300 text-xs font-bold uppercase tracking-wider">
              MAHDEV TRAVELS
            </span>
            <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-tight">
              Elite Tourism & <span className="text-gradient-cyan">Wedding Transports</span>
            </h1>
            <p className="font-sans text-gray-300 text-base sm:text-lg max-w-xl leading-relaxed">
              Bespoke travel experiences across Sri Lanka. High-roof passenger vans and premium VIP cars with professional English-speaking chauffeurs.
            </p>
          </div>
        </section>

        {/* Fleet Section */}
        <section className="py-24 max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 flex flex-col gap-3">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-accent">
              OUR CHAUFFEURED FLEET
            </span>
            <h2 className="font-display font-bold text-3xl text-white">
              VIP Vehicles For Every Occasion
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {fleet.map((veh, idx) => (
              <div 
                key={idx}
                className="glass p-8 rounded-3xl border border-white/5 flex flex-col justify-between group hover:border-gold-accent/20 transition-all duration-300"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gold-accent tracking-wider">{veh.type}</span>
                      <h3 className="font-display font-bold text-xl text-white mt-1">{veh.name}</h3>
                    </div>
                    <div className="px-3 py-1 rounded-lg bg-white/5 text-xs text-gray-300 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-gold-soft" />
                      {veh.capacity}
                    </div>
                  </div>
                  <p className="font-sans text-sm text-gray-400 leading-relaxed">{veh.desc}</p>
                </div>

                <div className="mt-8">
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {veh.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2 text-xs text-gray-300 font-sans">
                        <CheckCircle className="w-3.5 h-3.5 text-gold-soft shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tour Packages Section */}
        <section className="py-24 bg-navy-medium/30 relative overflow-hidden">
          <div className="glow-ball glow-ball-gold w-96 h-96 top-20 -right-20 opacity-10" />

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16 flex flex-col gap-3">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-accent">
                DISCOVER SRI LANKA
              </span>
              <h2 className="font-display font-bold text-3xl text-white">
                Curated Luxury Tour Packages
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {packages.map((pkg, idx) => (
                <div 
                  key={idx}
                  className="glass rounded-3xl overflow-hidden border border-white/5 group hover:border-gold-accent/25 transition-all duration-300 flex flex-col h-full hover:translate-y-[-4px]"
                >
                  <div className="relative h-52 w-full overflow-hidden">
                    <Image 
                      src={pkg.img} 
                      alt={pkg.title} 
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/95 to-transparent" />
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full glass border border-white/10 text-[10px] font-bold text-gold-soft uppercase tracking-wider">
                      {pkg.days}
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1 gap-4">
                    <div>
                      <h3 className="font-display font-bold text-lg text-white group-hover:text-gold-soft transition-colors">{pkg.title}</h3>
                      <p className="font-sans text-xs sm:text-sm text-gray-400 mt-2 leading-relaxed">{pkg.desc}</p>
                    </div>
                    <div className="flex justify-between items-center border-t border-white/5 pt-4 mt-auto">
                      <span className="text-xs text-gray-500 font-sans">Starting from</span>
                      <span className="font-display font-bold text-sm text-white">{pkg.price}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Booking Form and Direct Inquiry */}
        <section className="py-24 max-w-7xl mx-auto px-6 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            <div className="lg:col-span-5 flex flex-col gap-6 justify-center">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-accent">
                RESERVE COMFORT
              </span>
              <h2 className="font-display font-black text-3xl text-white">
                Book Your Chauffeur Ride Today
              </h2>
              <p className="font-sans text-gray-400 text-sm leading-relaxed max-w-sm">
                Reserve our Toyota KDH high-roof passenger vans or Mercedes VIP wedding cars. Let our dispatch team lock your dates.
              </p>

              <div className="flex items-center gap-4 mt-4 group">
                <div className="w-12 h-12 rounded-2xl glass border border-white/5 text-gold-soft flex items-center justify-center group-hover:border-gold-accent/40 transition-colors">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-gray-500 font-bold font-sans">Direct Dispatch WhatsApp</span>
                  <a 
                    href="https://wa.me/94768988970?text=Hi%20Mahdev%20Travels" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 font-semibold hover:underline font-sans text-sm"
                  >
                    Discuss dates in real-time
                  </a>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="glass-premium rounded-3xl p-8 sm:p-10 border border-gold-accent/15 shadow-2xl relative">
                <h3 className="font-display font-bold text-xl text-white mb-6">Reservation Inquiry</h3>

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
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider font-sans">Select Vehicle / Tour</label>
                      <select 
                        value={formData.vehicle}
                        onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                        className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-sm focus:outline-none text-white font-sans transition-all [&>option]:bg-navy-dark"
                      >
                        <option>Toyota KDH Van</option>
                        <option>Mercedes VIP Wedding Car</option>
                        <option>Ella Greenery Escape Tour</option>
                        <option>Sigiriya Cultural Trail Tour</option>
                        <option>Galle Coastal Sunset Tour</option>
                        <option>Custom Itinerary (Detail below)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider font-sans">Target Date</label>
                    <input 
                      type="date" 
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-sm focus:outline-none text-white font-sans transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider font-sans">Special Requirements</label>
                    <textarea 
                      rows={4}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-sm focus:outline-none text-white font-sans transition-all resize-none"
                      placeholder="Detail pickup location, timing, tour edits, or wedding schedule..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-gold-accent to-gold-soft disabled:opacity-50 text-navy-dark font-sans font-bold text-sm tracking-wider rounded-xl transition-all hover:brightness-110 flex items-center justify-center gap-2 mt-2 shadow-lg shadow-gold-accent/15"
                  >
                    {loading ? 'SENDING BOOKING...' : 'SEND BOOKING REQUEST'}
                    <Send className="w-4 h-4" />
                  </button>

                  {success && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      className="flex items-center gap-3 p-4 bg-gold-accent/10 border border-gold-accent/30 rounded-2xl mt-4"
                    >
                      <CheckCircle className="w-5 h-5 text-gold-soft shrink-0" />
                      <span className="text-sm text-gold-soft font-sans font-semibold">
                        Your booking query has been synced with our travels dispatch desk. We will call you back to confirm availability.
                      </span>
                    </motion.div>
                  )}
                </form>
              </div>
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
