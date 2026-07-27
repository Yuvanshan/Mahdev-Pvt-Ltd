'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { seedDatabase } from '@/lib/seeder';
import { Database, FolderPlus, Calendar, Users, Check, Trash2, ArrowUpRight, Cpu, Settings, Sliders, Shield, Tag, Globe, Sparkles, Image as ImageIcon, Car, Info } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import confetti from 'canvas-confetti';

export default function AdminPortal() {
  const [activeTab, setActiveTab] = useState<'seeder' | 'bookings' | 'divisions' | 'leads' | 'cms'>('bookings');
  const [cmsSubTab, setCmsSubTab] = useState<'stats' | 'seo' | 'announcements' | 'fleet' | 'it' | 'posters'>('stats');
  
  // Authentication states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Division posters state
  const [posters, setPosters] = useState({
    sws: '/images/wedding_decoration_1782729925686.jpg',
    u1: '/images/u1_robot_camera_1783346286743.jpg',
    travels: '/images/travels_robot_car_1783346316762.jpg',
    it: '/images/saas_dashboard.jpg'
  });

  const [bookings, setBookings] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  // Stats CMS state
  const [statsData, setStatsData] = useState({
    happyClients: 1500,
    eventsCompleted: 1200,
    softwareProjects: 120,
    vehiclesInFleet: 18,
    yearsExperience: 10
  });

  // SEO CMS state
  const [seoData, setSeoData] = useState({
    pageKey: 'home',
    title: 'Mahdev Pvt Ltd | Premium Enterprise & Luxury Suite',
    description: 'Mahdev Pvt Ltd is a premier international technology and service conglomerate.',
    keywords: 'Mahdev, SWS Event Management, Studio U1, Travels, IT Solutions'
  });

  // Announcements & Theme Colors CMS State
  const [promoData, setPromoData] = useState({
    announcement: 'Mahdev V3.5 Live: Premium SWS Event Decorations open for booking across Sri Lanka!',
    accentColor: '#c5a880',
    primaryColor: '#050b16',
    secondaryColor: '#0c152b'
  });

  // Check login state on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const logged = sessionStorage.getItem('mahdev_admin_logged');
      if (logged === 'true') {
        setIsLoggedIn(true);
      }
    }
  }, []);

  // Listen to division posters settings in Firestore
  useEffect(() => {
    const unsubPosters = onSnapshot(doc(db, 'settings', 'division_posters'), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setPosters({
          sws: d.sws || '/images/wedding_decoration_1782729925686.jpg',
          u1: d.u1 || '/images/u1_robot_camera_1783346286743.jpg',
          travels: d.travels || '/images/travels_robot_car_1783346316762.jpg',
          it: d.it || '/images/saas_dashboard.jpg'
        });
      }
    });
    return () => unsubPosters();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin') {
      setIsLoggedIn(true);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('mahdev_admin_logged', 'true');
      }
      confetti({
        particleCount: 100,
        spread: 60,
        colors: ['#c5a880', '#dfba73']
      });
      setLoginError('');
    } else {
      setLoginError('Invalid administrator credentials.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('mahdev_admin_logged');
    }
  };

  const handleSavePosters = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'settings', 'division_posters'), {
        ...posters,
        updatedAt: serverTimestamp()
      });
      confetti({ particleCount: 50 });
      alert("Division Cover Posters successfully updated on Firestore!");
    } catch (err) {
      alert("Error saving posters settings: " + (err as Error).message);
    }
  };

  // New division configuration form state
  const [divForm, setDivForm] = useState({
    id: '',
    name: '',
    slug: '',
    tagline: '',
    description: '',
    accentColor: '#10b981',
    bgImage: '/images/sws_robot_decor_1783346269673.jpg',
    serviceTitle1: '', serviceDesc1: '',
    serviceTitle2: '', serviceDesc2: '',
    serviceTitle3: '', serviceDesc3: ''
  });

  // Listen to bookings in real-time
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'bookings'), (snap) => {
      const list = snap.docs.map(docDoc => ({ id: docDoc.id, ...docDoc.data() }));
      list.sort((a: any, b: any) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
      setBookings(list);
    });
    return () => unsub();
  }, []);

  // Listen to AI Concierge Leads in real-time
  useEffect(() => {
    const unsubLeads = onSnapshot(collection(db, 'leads'), (snap) => {
      const list = snap.docs.map(docDoc => ({ id: docDoc.id, ...docDoc.data() }));
      list.sort((a: any, b: any) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
      setLeads(list);
    });
    return () => unsubLeads();
  }, []);

  // Fetch current stats from Firestore for the editor
  useEffect(() => {
    const unsubStats = onSnapshot(doc(db, 'stats', 'mahdev_stats'), (docSnap) => {
      if (docSnap.exists()) {
        const d = docSnap.data();
        setStatsData({
          happyClients: d.happyClients || 1500,
          eventsCompleted: d.eventsCompleted || 1200,
          softwareProjects: d.softwareProjects || 120,
          vehiclesInFleet: d.vehiclesInFleet || 18,
          yearsExperience: d.yearsExperience || 10
        });
      }
    });
    return () => unsubStats();
  }, []);

  // Fetch current SEO meta for selected page
  useEffect(() => {
    const unsubSeo = onSnapshot(doc(db, 'seo', seoData.pageKey), (docSnap) => {
      if (docSnap.exists()) {
        const d = docSnap.data();
        setSeoData(prev => ({
          ...prev,
          title: d.title || '',
          description: d.description || '',
          keywords: d.keywords || ''
        }));
      }
    });
    return () => unsubSeo();
  }, [seoData.pageKey]);

  const handleSeed = async (force = false) => {
    setSeeding(true);
    setSeedSuccess(false);
    try {
      const result = await seedDatabase(force);
      setSeedSuccess(true);
      confetti({
        particleCount: 120,
        spread: 60,
        colors: ['#c5a880', '#dfba73', '#10b981']
      });
      alert(result ? "Firebase database successfully seeded!" : "Database already has records.");
    } catch (err) {
      console.error(err);
      alert("Error seeding data: " + (err as Error).message);
    } finally {
      setSeeding(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'bookings', id), { status });
      confetti({ particleCount: 30, spread: 30 });
    } catch (err) {
      alert("Update failed");
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;
    try {
      await deleteDoc(doc(db, 'bookings', id));
    } catch (err) {
      alert("Delete failed");
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;
    try {
      await deleteDoc(doc(db, 'leads', id));
    } catch (err) {
      alert("Delete failed");
    }
  };

  // Submit Stats Updates
  const handleSaveStats = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'stats', 'mahdev_stats'), {
        ...statsData,
        updatedAt: serverTimestamp()
      });
      confetti({ particleCount: 50 });
      alert("Achievements & Statistics saved back to Firestore! Homepage counters will update in real-time.");
    } catch (err) {
      alert("Error saving stats: " + (err as Error).message);
    }
  };

  // Submit SEO Meta Updates
  const handleSaveSeo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'seo', seoData.pageKey), {
        title: seoData.title,
        description: seoData.description,
        keywords: seoData.keywords,
        updatedAt: serverTimestamp()
      });
      confetti({ particleCount: 50 });
      alert(`SEO Meta config for page "${seoData.pageKey.toUpperCase()}" saved successfully.`);
    } catch (err) {
      alert("Error saving SEO: " + (err as Error).message);
    }
  };

  // Submit Color/Announcements Updates
  const handleSavePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'settings', 'promotions'), {
        announcement: promoData.announcement,
        accentColor: promoData.accentColor,
        primaryColor: promoData.primaryColor,
        secondaryColor: promoData.secondaryColor,
        updatedAt: serverTimestamp()
      });
      confetti({ particleCount: 50 });
      alert("Announcements & Theme Color Settings saved successfully.");
    } catch (err) {
      alert("Error saving promotions: " + (err as Error).message);
    }
  };

  // Add dynamic custom division
  const handleAddDivision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!divForm.id || !divForm.name || !divForm.slug) {
      alert("Please fill out Division ID, Name, and URL Slug.");
      return;
    }

    try {
      const services = [];
      if (divForm.serviceTitle1) services.push({ title: divForm.serviceTitle1, description: divForm.serviceDesc1, iconName: 'Sparkles' });
      if (divForm.serviceTitle2) services.push({ title: divForm.serviceTitle2, description: divForm.serviceDesc2, iconName: 'Sparkles' });
      if (divForm.serviceTitle3) services.push({ title: divForm.serviceTitle3, description: divForm.serviceDesc3, iconName: 'Sparkles' });

      const payload = {
        id: divForm.id,
        name: divForm.name,
        slug: divForm.slug,
        tagline: divForm.tagline,
        description: divForm.description,
        type: 'generic',
        accentColor: divForm.accentColor,
        gradient: 'from-green-500/20 to-blue-500/20',
        bgImage: divForm.bgImage,
        services,
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, 'divisions', divForm.id), payload);
      
      confetti({ particleCount: 100, spread: 70 });
      alert(`Success! Division "${divForm.name}" has been dynamic created. Visit /divisions/${divForm.slug} to view it instantly!`);
      
      setDivForm({
        id: '', name: '', slug: '', tagline: '', description: '',
        accentColor: '#10b981', bgImage: '/images/sws_robot_decor_1783346269673.jpg',
        serviceTitle1: '', serviceDesc1: '', serviceTitle2: '', serviceDesc2: '', serviceTitle3: '', serviceDesc3: ''
      });
    } catch (err) {
      alert("Error adding division: " + (err as Error).message);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#050b16] flex items-center justify-center p-4 text-white text-left relative overflow-hidden">
        {/* Abstract glowing backgrounds */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full filter blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold-accent/10 rounded-full filter blur-[120px] pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md glass-premium rounded-[32px] border border-white/10 p-8 sm:p-10 shadow-2xl relative z-10"
        >
          <div className="flex flex-col items-center text-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gold-accent/10 border border-gold-accent/30 flex items-center justify-center text-gold-accent shadow-lg shadow-gold-accent/5">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <h1 className="font-display font-black text-2xl tracking-tight text-white">Administrator Access</h1>
              <p className="text-gray-400 text-xs mt-1">Please enter credentials to manage the Mahdev Pvt Ltd system registries.</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Administrator Username</label>
              <input 
                type="text" required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin"
                className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-2xl px-4 py-3.5 text-sm focus:outline-none text-white transition-all placeholder:text-gray-600"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Access Password</label>
              <input 
                type="password" required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-2xl px-4 py-3.5 text-sm focus:outline-none text-white transition-all placeholder:text-gray-600"
              />
            </div>

            {loginError && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="text-red-400 text-xs font-sans pl-1 font-semibold"
              >
                {loginError}
              </motion.div>
            )}

            <button 
              type="submit"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-gold-accent to-gold-soft text-navy-dark font-sans text-xs font-bold tracking-widest hover:brightness-110 transition-all shadow-lg shadow-gold-accent/15 cursor-pointer mt-2"
            >
              AUTHENTICATE SESSION
            </button>
          </form>

          <p className="text-[10px] text-gray-600 text-center font-sans mt-8 uppercase tracking-widest">
            Mahdev Pvt Ltd • Security Core
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-navy-dark pt-32 pb-24 text-white text-left">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-8 mb-12">
            <div className="flex justify-between items-center w-full md:w-auto gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-accent flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5 text-gold-accent" /> MAHDEV CONTROL CENTRE
                </span>
                <h1 className="font-display font-black text-4xl text-white mt-1">Management Portal</h1>
              </div>

              <button 
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl border border-white/10 hover:border-red-500 hover:text-red-400 text-xs font-bold tracking-wider transition-all md:hidden"
              >
                SIGN OUT
              </button>
            </div>

            {/* Main Tabs selector */}
            <div className="flex flex-wrap gap-2 items-center">
              {[
                { id: 'bookings', label: 'Bookings List', icon: Calendar },
                { id: 'cms', label: 'CMS Settings', icon: Settings },
                { id: 'divisions', label: 'Create Division', icon: FolderPlus },
                { id: 'leads', label: 'AI Leads', icon: Users },
                { id: 'seeder', label: 'Cloud Seeder', icon: Database }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-5 py-2.5 rounded-xl font-sans text-xs font-bold tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                      activeTab === tab.id 
                        ? 'bg-gradient-to-r from-gold-accent to-gold-soft text-navy-dark border-none' 
                        : 'glass text-gray-400 hover:text-white border border-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label.toUpperCase()}
                  </button>
                );
              })}

              <button 
                onClick={handleLogout}
                className="px-5 py-2.5 rounded-xl border border-white/10 hover:border-red-500 hover:text-red-400 text-xs font-bold tracking-wider transition-all hidden md:block"
              >
                SIGN OUT
              </button>
            </div>
          </div>

          {/* MAIN TABS LAYOUTS */}
          <div className="grid grid-cols-1 gap-12">
            
            {/* Tab: Bookings */}
            {activeTab === 'bookings' && (
              <div className="glass rounded-3xl p-6 sm:p-8 border border-white/5 overflow-x-auto">
                <h3 className="font-display font-black text-2xl text-white mb-6">Reservation Bookings Ledger</h3>

                {bookings.length === 0 ? (
                  <div className="py-12 text-center text-gray-500 text-sm font-sans">
                    No booking records found in Firestore. Try seeding the database first.
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse font-sans text-xs sm:text-sm min-w-[700px]">
                    <thead>
                      <tr className="border-b border-white/5 text-gray-500 uppercase tracking-widest text-[9px]">
                        <th className="py-3 px-4">Client</th>
                        <th className="py-3 px-4">Date & Location</th>
                        <th className="py-3 px-4">Service Package</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((bk) => (
                        <tr key={bk.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-4 px-4">
                            <span className="font-semibold text-white block">{bk.name}</span>
                            <span className="text-[10px] text-gray-500 block mt-0.5">{bk.phone} | {bk.email}</span>
                          </td>
                          <td className="py-4 px-4 font-mono text-gray-300">
                            <span>{bk.date}</span>
                            <span className="block text-[10px] text-gray-500 font-sans mt-0.5">{bk.location || 'Not Specified'}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-semibold text-gray-300 block">{bk.packageName}</span>
                            <span className="text-[9px] text-gold-soft uppercase tracking-wider block font-bold mt-0.5">{bk.divisionName}</span>
                          </td>
                          <td className="py-4 px-4 font-bold text-white">Rs. {bk.calculatedPrice?.toLocaleString() || '0'}</td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                bk.status === 'Approved' ? 'bg-green-500/20 text-green-400' :
                                bk.status === 'Cancelled' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                            }`}>
                              {bk.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex justify-end gap-1.5">
                              {bk.status === 'Pending Review' && (
                                <button
                                  onClick={() => handleUpdateStatus(bk.id, 'Approved')}
                                  className="p-1.5 rounded bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 transition-all cursor-pointer"
                                  title="Approve Booking"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteBooking(bk.id)}
                                className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all cursor-pointer"
                                title="Delete Record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Tab: CMS Settings */}
            {activeTab === 'cms' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* CMS Sub-navigation */}
                <div className="lg:col-span-3 flex flex-col gap-2.5">
                  <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold block pl-3 mb-1">CMS MODULES</span>
                  {[
                    { id: 'stats', label: 'Achievements Counters', icon: Sliders },
                    { id: 'seo', label: 'SEO Metadata Manager', icon: Globe },
                    { id: 'announcements', label: 'Promotions & Themes', icon: Tag },
                    { id: 'fleet', label: 'Travel Fleet Speeds', icon: Car },
                    { id: 'it', label: 'IT Case Studies', icon: Cpu },
                    { id: 'posters', label: 'Division Posters', icon: ImageIcon }
                  ].map((sub) => {
                    const SubIcon = sub.icon;
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => setCmsSubTab(sub.id as any)}
                        className={`w-full p-4.5 rounded-2xl border text-left flex gap-3.5 items-center transition-all cursor-pointer ${
                          cmsSubTab === sub.id
                            ? 'bg-gold-accent/10 border-gold-accent/40 text-gold-soft'
                            : 'glass border-white/5 hover:bg-white/5 text-gray-400 hover:text-white'
                        }`}
                      >
                        <SubIcon className="w-4 h-4" />
                        <span className="font-sans text-xs font-semibold tracking-wide">{sub.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* CMS Sub-tab form */}
                <div className="lg:col-span-9">
                  <AnimatePresence mode="wait">
                    
                    {/* Stat editor */}
                    {cmsSubTab === 'stats' && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-premium rounded-3xl p-6 sm:p-8 border border-white/5"
                      >
                        <div className="border-b border-white/5 pb-4 mb-6">
                          <h3 className="font-display font-black text-xl text-white">Live Achievements Counters</h3>
                          <p className="text-gray-400 text-xs mt-1">Directly update statistics shown on the homepage and divisions counters.</p>
                        </div>

                        <form onSubmit={handleSaveStats} className="flex flex-col gap-5">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Happy Clients Counter</label>
                              <input 
                                type="number" required
                                value={statsData.happyClients}
                                onChange={(e) => setStatsData({ ...statsData, happyClients: Number(e.target.value) })}
                                className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs focus:outline-none text-white font-mono"
                              />
                            </div>
                            <div className="flex flex-col gap-2">
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Events Completed (SWS)</label>
                              <input 
                                type="number" required
                                value={statsData.eventsCompleted}
                                onChange={(e) => setStatsData({ ...statsData, eventsCompleted: Number(e.target.value) })}
                                className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs focus:outline-none text-white font-mono"
                              />
                            </div>
                            <div className="flex flex-col gap-2">
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">IT Software Bundles Active</label>
                              <input 
                                type="number" required
                                value={statsData.softwareProjects}
                                onChange={(e) => setStatsData({ ...statsData, softwareProjects: Number(e.target.value) })}
                                className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs focus:outline-none text-white font-mono"
                              />
                            </div>
                            <div className="flex flex-col gap-2">
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Travel Vehicles in Fleet</label>
                              <input 
                                type="number" required
                                value={statsData.vehiclesInFleet}
                                onChange={(e) => setStatsData({ ...statsData, vehiclesInFleet: Number(e.target.value) })}
                                className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs focus:outline-none text-white font-mono"
                              />
                            </div>
                            <div className="flex flex-col gap-2 sm:col-span-2">
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Conglomerate Years Active</label>
                              <input 
                                type="number" required
                                value={statsData.yearsExperience}
                                onChange={(e) => setStatsData({ ...statsData, yearsExperience: Number(e.target.value) })}
                                className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs focus:outline-none text-white font-mono"
                              />
                            </div>
                          </div>

                          <button 
                            type="submit"
                            className="py-3 px-6 rounded-xl bg-gradient-to-r from-gold-accent to-gold-soft text-navy-dark font-sans text-xs font-bold tracking-widest hover:brightness-110 self-start mt-2 transition-all cursor-pointer"
                          >
                            SAVE STATS TO CLOUD
                          </button>
                        </form>
                      </motion.div>
                    )}

                    {/* SEO manager */}
                    {cmsSubTab === 'seo' && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-premium rounded-3xl p-6 sm:p-8 border border-white/5"
                      >
                        <div className="border-b border-white/5 pb-4 mb-6">
                          <h3 className="font-display font-black text-xl text-white">Dynamic SEO Metadata Manager</h3>
                          <p className="text-gray-400 text-xs mt-1">Edit title, meta description, and keywords indexing tags for each sub-page.</p>
                        </div>

                        <form onSubmit={handleSaveSeo} className="flex flex-col gap-5">
                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Select Page Context</label>
                            <select
                              value={seoData.pageKey}
                              onChange={(e) => setSeoData({ ...seoData, pageKey: e.target.value })}
                              className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs focus:outline-none text-white [&>option]:bg-navy-dark"
                            >
                              <option value="home">Homepage (Index)</option>
                              <option value="events">SWS Events (Landing)</option>
                              <option value="studio">Studio U1 Photography</option>
                              <option value="travels">Mahdev Travels</option>
                              <option value="it">IT Solutions</option>
                            </select>
                          </div>

                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Meta Page Title</label>
                            <input 
                              type="text" required
                              value={seoData.title}
                              onChange={(e) => setSeoData({ ...seoData, title: e.target.value })}
                              className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs focus:outline-none text-white"
                            />
                          </div>

                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Meta Description</label>
                            <textarea 
                              rows={3} required
                              value={seoData.description}
                              onChange={(e) => setSeoData({ ...seoData, description: e.target.value })}
                              className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs focus:outline-none text-white resize-none"
                            />
                          </div>

                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Search Keywords (Comma Separated)</label>
                            <input 
                              type="text" required
                              value={seoData.keywords}
                              onChange={(e) => setSeoData({ ...seoData, keywords: e.target.value })}
                              className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs focus:outline-none text-white"
                            />
                          </div>

                          <button 
                            type="submit"
                            className="py-3 px-6 rounded-xl bg-gradient-to-r from-gold-accent to-gold-soft text-navy-dark font-sans text-xs font-bold tracking-widest hover:brightness-110 self-start mt-2 transition-all cursor-pointer"
                          >
                            SAVE SEO TAGS
                          </button>
                        </form>
                      </motion.div>
                    )}

                    {/* Announcements / promotions */}
                    {cmsSubTab === 'announcements' && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-premium rounded-3xl p-6 sm:p-8 border border-white/5"
                      >
                        <div className="border-b border-white/5 pb-4 mb-6">
                          <h3 className="font-display font-black text-xl text-white">Promotions & Theme Colors</h3>
                          <p className="text-gray-400 text-xs mt-1">Configure scrolling promotional banners and global color configurations.</p>
                        </div>

                        <form onSubmit={handleSavePromo} className="flex flex-col gap-5">
                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Promotional Announcement Text</label>
                            <input 
                              type="text" required
                              value={promoData.announcement}
                              onChange={(e) => setPromoData({ ...promoData, announcement: e.target.value })}
                              className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs focus:outline-none text-white"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="flex flex-col gap-2">
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Accent Gold (Hex)</label>
                              <input 
                                type="text" required
                                value={promoData.accentColor}
                                onChange={(e) => setPromoData({ ...promoData, accentColor: e.target.value })}
                                className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs focus:outline-none text-white font-mono"
                              />
                            </div>
                            <div className="flex flex-col gap-2">
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Primary Dark (Hex)</label>
                              <input 
                                type="text" required
                                value={promoData.primaryColor}
                                onChange={(e) => setPromoData({ ...promoData, primaryColor: e.target.value })}
                                className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs focus:outline-none text-white font-mono"
                              />
                            </div>
                            <div className="flex flex-col gap-2">
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Secondary Navy (Hex)</label>
                              <input 
                                type="text" required
                                value={promoData.secondaryColor}
                                onChange={(e) => setPromoData({ ...promoData, secondaryColor: e.target.value })}
                                className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs focus:outline-none text-white font-mono"
                              />
                            </div>
                          </div>

                          <button 
                            type="submit"
                            className="py-3 px-6 rounded-xl bg-gradient-to-r from-gold-accent to-gold-soft text-navy-dark font-sans text-xs font-bold tracking-widest hover:brightness-110 self-start mt-2 transition-all cursor-pointer"
                          >
                            SAVE GLOBAL THEMES
                          </button>
                        </form>
                      </motion.div>
                    )}

                    {/* Fleet Mock Management Info */}
                    {cmsSubTab === 'fleet' && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-premium rounded-3xl p-6 sm:p-8 border border-white/5 flex flex-col gap-4"
                      >
                        <div className="border-b border-white/5 pb-4 mb-2">
                          <h3 className="font-display font-black text-xl text-white">Travel Vehicle Fleet Registry</h3>
                          <p className="text-gray-400 text-xs mt-1">Manage active rental cars, AC specifications, seating counts, and chauffeurs.</p>
                        </div>

                        <div className="p-4 rounded-xl bg-gold-accent/5 border border-gold-accent/20 text-xs text-gold-soft leading-relaxed flex gap-3">
                          <Info className="w-5 h-5 shrink-0" />
                          <span>
                            <strong>Real-Time CMS Sync Active:</strong> Current fleet cars are driven dynamically from the travels database collections. Add new vehicle profiles below or request a database seeder refresh.
                          </span>
                        </div>

                        <div className="grid gap-3 font-sans text-xs">
                          {['Toyota KDH High-Roof Van (14 Seats)', 'Mercedes-Benz C-Class VIP (4 Seats)', 'Chrysler 300C Limo (8 Seats)'].map((car, idx) => (
                            <div key={idx} className="p-4 rounded-xl bg-white/5 flex items-center justify-between border border-white/5">
                              <span className="font-semibold text-white">{car}</span>
                              <span className="text-[10px] text-green-400 font-bold uppercase tracking-wider">Active in CMS</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* IT Mock Management Info */}
                    {cmsSubTab === 'it' && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-premium rounded-3xl p-6 sm:p-8 border border-white/5 flex flex-col gap-4"
                      >
                        <div className="border-b border-white/5 pb-4 mb-2">
                          <h3 className="font-display font-black text-xl text-white">IT Project case studies</h3>
                          <p className="text-gray-400 text-xs mt-1">Edit screenshot preview URLs, features, technology stack frameworks, and Live demo URLs.</p>
                        </div>

                        <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 text-xs text-blue-300 leading-relaxed flex gap-3">
                          <Info className="w-5 h-5 shrink-0" />
                          <span>
                            <strong>IT Portfolio CMS Core:</strong> Case studies representing ERP SaaS, POS registers, and Cloud Kubernetes clusters are loaded from the cloud collections registry.
                          </span>
                        </div>

                        <div className="grid gap-3 font-sans text-xs">
                          {['Mahdev Enterprise ERP Suite', 'Cloud POS Cash Registers', 'AWS Kubernetes clusters deployment'].map((item, idx) => (
                            <div key={idx} className="p-4 rounded-xl bg-white/5 flex items-center justify-between border border-white/5">
                              <span className="font-semibold text-white">{item}</span>
                              <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Sync Active</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Division Posters CMS Tab */}
                    {cmsSubTab === 'posters' && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-premium rounded-3xl p-6 sm:p-8 border border-white/5"
                      >
                        <div className="border-b border-white/5 pb-4 mb-6">
                          <h3 className="font-display font-black text-xl text-white">Division Posters & Covers</h3>
                          <p className="text-gray-400 text-xs mt-1">Configure cover and background image paths for each corporate division sector.</p>
                        </div>

                        <form onSubmit={handleSavePosters} className="flex flex-col gap-5">
                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">SWS Events Poster Cover URL</label>
                            <input 
                              type="text" required
                              value={posters.sws}
                              onChange={(e) => setPosters({ ...posters, sws: e.target.value })}
                              className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs focus:outline-none text-white"
                            />
                          </div>

                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Studio U1 Photography Cover URL</label>
                            <input 
                              type="text" required
                              value={posters.u1}
                              onChange={(e) => setPosters({ ...posters, u1: e.target.value })}
                              className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs focus:outline-none text-white"
                            />
                          </div>

                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Mahdev Travels Cover URL</label>
                            <input 
                              type="text" required
                              value={posters.travels}
                              onChange={(e) => setPosters({ ...posters, travels: e.target.value })}
                              className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs focus:outline-none text-white"
                            />
                          </div>

                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">IT Solutions Cover URL</label>
                            <input 
                              type="text" required
                              value={posters.it}
                              onChange={(e) => setPosters({ ...posters, it: e.target.value })}
                              className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs focus:outline-none text-white"
                            />
                          </div>

                          <button 
                            type="submit"
                            className="py-3 px-6 rounded-xl bg-gradient-to-r from-gold-accent to-gold-soft text-navy-dark font-sans text-xs font-bold tracking-widest hover:brightness-110 self-start mt-2 transition-all cursor-pointer"
                          >
                            SAVE POSTERS
                          </button>
                        </form>
                      </motion.div>
                    )}

                  </AnimatePresence>
                </div>

              </div>
            )}

            {/* Tab: Create Division */}
            {activeTab === 'divisions' && (
              <div className="glass-premium rounded-3xl p-8 border border-white/5 text-left max-w-3xl">
                <h3 className="font-display font-black text-2xl text-white mb-2">Create Business Division</h3>
                <p className="text-gray-400 text-xs font-sans mb-8">Enter configuration variables to instantly deploy a new premium business division landing subpage.</p>

                <form onSubmit={handleAddDivision} className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Division ID (Unique Key)</label>
                      <input 
                        type="text" required placeholder="e.g. healthcare"
                        value={divForm.id} onChange={(e) => setDivForm({ ...divForm, id: e.target.value })}
                        className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs focus:outline-none text-white"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Display Name</label>
                      <input 
                        type="text" required placeholder="e.g. Mahdev Healthcare"
                        value={divForm.name} onChange={(e) => setDivForm({ ...divForm, name: e.target.value })}
                        className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs focus:outline-none text-white"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">URL Route Slug</label>
                      <input 
                        type="text" required placeholder="e.g. healthcare"
                        value={divForm.slug} onChange={(e) => setDivForm({ ...divForm, slug: e.target.value })}
                        className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs focus:outline-none text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Tagline</label>
                      <input 
                        type="text" required placeholder="e.g. Providing Superior Clinical Care"
                        value={divForm.tagline} onChange={(e) => setDivForm({ ...divForm, tagline: e.target.value })}
                        className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs focus:outline-none text-white"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Accent Theme Color (Hex)</label>
                      <input 
                        type="text" required placeholder="#10b981"
                        value={divForm.accentColor} onChange={(e) => setDivForm({ ...divForm, accentColor: e.target.value })}
                        className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs focus:outline-none text-white"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Description</label>
                    <textarea 
                      rows={3} required placeholder="Detailed corporate definition of operations..."
                      value={divForm.description} onChange={(e) => setDivForm({ ...divForm, description: e.target.value })}
                      className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs focus:outline-none text-white resize-none"
                    />
                  </div>

                  <div className="border-t border-white/5 pt-6 flex flex-col gap-4">
                    <span className="text-[10px] font-bold text-gold-accent tracking-wider uppercase">Configure Services Level 1:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <input 
                        type="text" placeholder="Service Title (e.g. Cardiological Screening)"
                        value={divForm.serviceTitle1} onChange={(e) => setDivForm({ ...divForm, serviceTitle1: e.target.value })}
                        className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs focus:outline-none text-white"
                      />
                      <input 
                        type="text" placeholder="Service Description"
                        value={divForm.serviceDesc1} onChange={(e) => setDivForm({ ...divForm, serviceDesc1: e.target.value })}
                        className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs focus:outline-none text-white"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <span className="text-[10px] font-bold text-gold-accent tracking-wider uppercase">Configure Services Level 2:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <input 
                        type="text" placeholder="Service Title (e.g. Neural Diagnostics)"
                        value={divForm.serviceTitle2} onChange={(e) => setDivForm({ ...divForm, serviceTitle2: e.target.value })}
                        className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs focus:outline-none text-white"
                      />
                      <input 
                        type="text" placeholder="Service Description"
                        value={divForm.serviceDesc2} onChange={(e) => setDivForm({ ...divForm, serviceDesc2: e.target.value })}
                        className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs focus:outline-none text-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-gold-accent to-gold-soft text-navy-dark font-sans font-bold text-sm tracking-wider hover:brightness-110 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-gold-accent/15 cursor-pointer"
                  >
                    DEPLOY DYNAMIC DIVISION
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {/* Tab: Leads */}
            {activeTab === 'leads' && (
              <div className="glass rounded-3xl p-6 sm:p-8 border border-white/5 overflow-x-auto">
                <h3 className="font-display font-black text-2xl text-white mb-6">Captured Concierge Leads</h3>

                {leads.length === 0 ? (
                  <div className="py-12 text-center text-gray-500 text-sm font-sans">
                    No lead records logged by the AI Assistant yet.
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse font-sans text-xs sm:text-sm min-w-[600px]">
                    <thead>
                      <tr className="border-b border-white/5 text-gray-500 uppercase tracking-widest text-[9px]">
                        <th className="py-3 px-4">Client Name</th>
                        <th className="py-3 px-4">Contact Details</th>
                        <th className="py-3 px-4">Query Topic</th>
                        <th className="py-3 px-4">Page Context</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads.map((ld) => (
                        <tr key={ld.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-4 px-4 font-semibold text-white">{ld.name}</td>
                          <td className="py-4 px-4 text-gray-300 font-mono">{ld.contactDetail}</td>
                          <td className="py-4 px-4 text-gray-400">{ld.topic}</td>
                          <td className="py-4 px-4 text-gold-soft font-semibold">{ld.pageContext}</td>
                          <td className="py-4 px-4 text-right">
                            <button
                              onClick={() => handleDeleteLead(ld.id)}
                              className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Tab: Seeder */}
            {activeTab === 'seeder' && (
              <div className="glass-premium rounded-3xl p-8 border border-white/5 flex flex-col gap-6 max-w-2xl">
                <h3 className="font-display font-black text-2xl text-white">Firestore Database Initialization</h3>
                <p className="font-sans text-sm text-gray-400 leading-relaxed">
                  Seed initial datasets to populate all operational division services, mock reviews, fleet cars, blogs, and career listings directly in Cloud Firestore database.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                  <button
                    onClick={() => handleSeed(false)}
                    disabled={seeding}
                    className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-gold-accent to-gold-soft disabled:opacity-50 text-navy-dark font-sans text-xs font-bold tracking-wider hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {seeding ? 'SEEDING DATABASES...' : 'SEED DATA (SAFE)'}
                  </button>
                  <button
                    onClick={() => handleSeed(true)}
                    disabled={seeding}
                    className="px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-sans text-xs font-bold tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    OVERWRITE & RESEED (FORCE)
                  </button>
                </div>

                {seedSuccess && (
                  <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-sans mt-2">
                    ✓ Firestore seed successful! Divisions, reviews, and blogs are active.
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
