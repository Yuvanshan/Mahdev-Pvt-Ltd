'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  ArrowUpRight, 
  Eye, 
  Target, 
  Calendar, 
  Compass, 
  Cpu, 
  Camera, 
  Globe, 
  ChevronRight,
  MessageSquare,
  Mail,
  Phone,
  Send,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Core Components
import Navbar from '@/components/Navbar';
import InteractiveHero from '@/components/InteractiveHero';
import TechCloud from '@/components/TechCloud';
import WhyChooseUs from '@/components/WhyChooseUs';
import Testimonials from '@/components/Testimonials';
import Footer from '@/components/Footer';

const divisionsList = [
  {
    title: 'SWS Event Management',
    desc: 'Bespoke luxury wedding planning, stage set designs, church floral setups, and corporate galas with premium decoration schemes.',
    image: '/images/wedding_decoration_1782729925686.jpg',
    href: '/divisions/sws-events',
    icon: Sparkles,
    tag: 'Luxury Decor',
    color: 'from-purple-500/20 to-pink-500/20'
  },
  {
    title: 'Studio U1',
    desc: 'Cinematic visual storytelling. Capturing raw emotional energy using high-altitude drone cameras, luxury studio setups, and newborn/outdoor shoots.',
    image: '/images/u1_robot_camera_1783346286743.jpg',
    href: '/divisions/u1-studio',
    icon: Camera,
    tag: 'Cinematography',
    color: 'from-cyan-500/20 to-blue-500/20'
  },
  {
    title: 'Mahdev ERP Systems',
    desc: 'Double-entry bookkeeping, smart multi-warehouse inventory tracking, thermal printer POS checkouts, and specialized modules for schools, hotels & restaurants.',
    image: '/images/it_robot_developer_1783346302442.jpg',
    href: '/divisions/erp',
    icon: Cpu,
    tag: 'Enterprise SaaS',
    color: 'from-amber-500/20 to-orange-500/20'
  },
  {
    title: 'IT & Cloud Solutions',
    desc: 'Custom enterprise software engineering, high-fidelity UI/UX design, AWS/Azure server orchestration, and result-oriented digital marketing strategies.',
    image: '/images/it_robot_developer_1783346302442.jpg',
    href: '/divisions/it-solutions',
    icon: Globe,
    tag: 'Software Engine',
    color: 'from-blue-500/20 to-indigo-500/20'
  },
  {
    title: 'Mahdev Travels',
    desc: 'Premier passenger vans, luxury VIP wedding cars, and curated vacation tour packages across Sri Lanka with professional English chauffeurs.',
    image: '/images/travels_robot_car_1783346316762.jpg',
    href: '/divisions/travels',
    icon: Compass,
    tag: 'Luxury Tourism',
    color: 'from-green-500/20 to-emerald-500/20'
  }
];

export default function Home() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', division: 'General Inquiry', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Write form to Firestore contact collection
      await addDoc(collection(db, 'contact'), {
        ...formData,
        timestamp: serverTimestamp()
      });
      
      // Success celebration
      setSuccess(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.8 },
        colors: ['#c5a880', '#dfba73', '#1e40af']
      });
      
      setFormData({ name: '', email: '', phone: '', division: 'General Inquiry', message: '' });
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      console.error("Error submitting message: ", error);
      alert("Failed to submit message. Please try again or WhatsApp us.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      
      <main className="flex-1 w-full">
        {/* Cinematic Hero */}
        <InteractiveHero />

        {/* About Mahdev */}
        <section id="about" className="py-24 bg-navy-dark relative overflow-hidden">
          <div className="glow-ball glow-ball-purple w-96 h-96 top-20 -left-10 opacity-15" />
          
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              
              {/* Left Column: Visual timeline/story */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-accent">
                  OUR ESSENCE & STORY
                </span>
                <h2 className="font-display font-black text-3xl sm:text-4xl text-white leading-tight">
                  Crafting Infrastructure of Excellence
                </h2>
                <p className="font-sans text-gray-400 text-sm sm:text-base leading-relaxed">
                  Founded in Sri Lanka, Mahdev Pvt Ltd has grown from a specialized technology company to a diversified corporate syndicate. We operate at the intersection of logical software architectures and creative luxury design.
                </p>

                {/* Timeline highlights */}
                <div className="flex flex-col gap-6 mt-4">
                  {[
                    { year: '2016', title: 'Inception', desc: 'Began as a small bespoke web and custom IT solutions team.' },
                    { year: '2019', title: 'Launch of SWS Events & Studio U1', desc: 'Expanded into premium photography & high-end wedding planning.' },
                    { year: '2022', title: 'Mahdev ERP Rollout', desc: 'Released POS terminals, cloud inventory, and omnichannel software suites.' },
                    { year: '2025', title: 'Global Integrations', desc: 'Partnering internationally with cloud-native frameworks and Firebase architectures.' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-4 group">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-lg bg-gold-accent/10 border border-gold-accent/30 text-gold-soft text-xs font-bold font-display flex items-center justify-center group-hover:bg-gold-accent group-hover:text-navy-dark transition-all">
                          {item.year}
                        </div>
                        {idx !== 3 && <div className="w-px h-full bg-white/10 mt-2" />}
                      </div>
                      <div className="flex flex-col gap-1">
                        <h4 className="font-display font-bold text-white text-sm group-hover:text-gold-soft transition-colors">{item.title}</h4>
                        <p className="font-sans text-xs text-gray-400 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Mission, Vision, and Premium Image Card */}
              <div className="lg:col-span-7 flex flex-col gap-8">
                {/* Vision/Mission Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="glass-premium rounded-3xl p-6 border border-gold-accent/15 flex flex-col gap-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                      <Eye className="w-5 h-5" />
                    </div>
                    <h3 className="font-display font-bold text-lg text-white">Our Vision</h3>
                    <p className="font-sans text-xs text-gray-400 leading-relaxed">
                      To be the world’s most versatile conglomerate, setting premium benchmarks in digital system integrations and luxury experience creation.
                    </p>
                  </div>

                  <div className="glass-premium rounded-3xl p-6 border border-gold-accent/15 flex flex-col gap-4">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                      <Target className="w-5 h-5" />
                    </div>
                    <h3 className="font-display font-bold text-lg text-white">Our Mission</h3>
                    <p className="font-sans text-xs text-gray-400 leading-relaxed">
                      To engineer robust backend architectures for businesses while translating client wedding and travel narratives into lifetime memories.
                    </p>
                  </div>
                </div>

                {/* Main banner block */}
                <div className="relative h-[250px] sm:h-[320px] rounded-3xl overflow-hidden border border-white/5 group shadow-2xl">
                  <Image 
                    src="/images/wedding_decoration_1782729925686.jpg" 
                    alt="Corporate Meeting" 
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 brightness-75"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/40 to-transparent flex items-end p-8">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[9px] uppercase tracking-widest text-gold-accent font-bold">Featured Project</span>
                      <h4 className="font-display font-bold text-xl text-white">SWS Weddings Gala, Colombo</h4>
                      <p className="text-xs text-gray-300 font-sans max-w-sm">
                        Curating royal church decorations, fairy light lanes, and floral canopies for premium venues.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Business Divisions Section */}
        <section id="divisions" className="py-24 bg-navy-medium/30 relative overflow-hidden">
          <div className="glow-ball glow-ball-gold w-96 h-96 bottom-20 -right-20 opacity-10" />

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16 flex flex-col gap-3">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-accent">
                ELITE BUSINESS SUITES
              </span>
              <h2 className="font-display font-black text-3xl sm:text-4xl text-white">
                Operate at the Highest Level
              </h2>
              <p className="font-sans text-gray-400 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
                Explore our distinct operational divisions. Each engineered by subject-matter experts to deliver top-tier market standards.
              </p>
            </div>

            {/* Grid of Divisions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {divisionsList.map((div, idx) => {
                const Icon = div.icon;
                const displayImage = div.image;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                    className="glass rounded-3xl overflow-hidden border border-white/5 flex flex-col h-full hover:border-gold-accent/30 transition-all duration-300 group hover:translate-y-[-4px] shadow-xl"
                  >
                    <div className="relative h-56 w-full overflow-hidden">
                      <Image 
                        src={displayImage} 
                        alt={div.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/90 via-navy-dark/20 to-transparent" />
                      <div className="absolute top-4 left-4 px-3 py-1 rounded-full glass border border-white/10 text-[9px] font-bold uppercase tracking-wider text-gold-soft">
                        {div.tag}
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-1 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 text-gold-accent">
                          <Icon className="w-5 h-5" />
                        </div>
                        <h3 className="font-display font-bold text-lg text-white group-hover:text-gold-soft transition-colors">
                          {div.title}
                        </h3>
                      </div>
                      
                      <p className="font-sans text-xs sm:text-sm text-gray-400 leading-relaxed flex-1">
                        {div.desc}
                      </p>

                      <Link
                        href={div.href}
                        className="w-full py-3 rounded-xl border border-white/10 text-center font-sans text-xs font-semibold text-white tracking-wider hover:bg-gold-accent hover:text-navy-dark hover:border-gold-accent transition-all flex items-center justify-center gap-2 mt-2"
                      >
                        EXPLORE DIVISION
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Tech Cloud Slider */}
        <TechCloud />

        {/* Why Choose Us */}
        <WhyChooseUs />

        {/* Testimonials */}
        <Testimonials />

        {/* Global CTA and Direct Contact Section */}
        <section id="contact" className="py-24 bg-gradient-to-b from-navy-dark to-navy-medium relative overflow-hidden">
          <div className="glow-ball glow-ball-purple w-96 h-96 -top-20 right-0 opacity-15" />

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
              
              {/* Left Column - Contact Details */}
              <div className="lg:col-span-5 flex flex-col gap-8 justify-center">
                <div className="flex flex-col gap-3">
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-accent">
                    PARTNER WITH US
                  </span>
                  <h2 className="font-display font-black text-3xl sm:text-4xl text-white">
                    Let's Build Something Exceptional
                  </h2>
                  <p className="font-sans text-gray-400 text-sm leading-relaxed max-w-sm">
                    Connect with our directors and engineering heads. Set up a consultation to design your bespoke solution.
                  </p>
                </div>

                <div className="flex flex-col gap-6 font-sans text-sm mt-4">
                  <div className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-2xl glass border border-white/5 text-gold-soft flex items-center justify-center group-hover:border-gold-accent/40 transition-colors">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-gray-500 font-bold">Call Office</span>
                      <span className="text-white font-medium hover:text-gold-soft transition-colors">076 898 8970 / 075 092 8078</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-2xl glass border border-white/5 text-gold-soft flex items-center justify-center group-hover:border-gold-accent/40 transition-colors">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-gray-500 font-bold">Email Inbox</span>
                      <span className="text-white font-medium hover:text-gold-soft transition-colors">info.mahdev.lk@gmail.com</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-2xl glass border border-white/5 text-gold-soft flex items-center justify-center group-hover:border-gold-accent/40 transition-colors">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-gray-500 font-bold">Direct WhatsApp</span>
                      <a 
                        href="https://wa.me/94768988970?text=Hi%20Mahdev" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-400 font-semibold hover:underline"
                      >
                        Launch chat stream
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Contact Form */}
              <div className="lg:col-span-7">
                <div className="glass-premium rounded-3xl p-8 sm:p-10 border border-gold-accent/15 shadow-2xl relative">
                  <h3 className="font-display font-bold text-xl text-white mb-6">Send a Message</h3>
                  
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
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider font-sans">Your Message</label>
                      <textarea 
                        rows={4}
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-sm focus:outline-none text-white font-sans transition-all resize-none"
                        placeholder="Detail your requirements..."
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
                        <CheckCircle className="w-5 h-5 text-gold-soft shrink-0" />
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
        </section>
      </main>

      <Footer />
    </>
  );
}
