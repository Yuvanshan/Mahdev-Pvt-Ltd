'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db, storage } from '@/lib/firebase';
import { 
  collection, getDocs, doc, setDoc, deleteDoc, updateDoc, 
  onSnapshot, serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { seedDatabase } from '@/lib/seeder';
import { 
  Database, FolderPlus, Calendar, Users, Check, Trash2, ArrowUpRight, 
  Cpu, Settings, Sliders, Shield, Tag, Globe, Sparkles, Image as ImageIcon, 
  Car, Info, PlusCircle, HelpCircle, User, Star
} from 'lucide-react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import confetti from 'canvas-confetti';

export default function AdminPortal() {
  const [activeTab, setActiveTab] = useState<'seeder' | 'bookings' | 'divisions' | 'leads' | 'cms'>('bookings');
  const [cmsSubTab, setCmsSubTab] = useState<'homepage' | 'stats' | 'seo' | 'announcements' | 'faqs' | 'testimonials' | 'gallery' | 'posters'>('homepage');
  
  // Authentication states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Image Upload States
  const [imageUploading, setImageUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');

  // Helper to handle dynamic image upload (Firebase Storage with Base64 fallback)
  const handleImageUpload = async (file: File, folderPath: string): Promise<string> => {
    setImageUploading(true);
    setUploadProgress('Uploading image...');
    try {
      // 1. Try to upload to Firebase Storage
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const storageRef = ref(storage, `${folderPath}/${Date.now()}_${cleanFileName}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      setUploadProgress('');
      setImageUploading(false);
      return downloadUrl;
    } catch (err) {
      console.warn("Firebase Storage upload failed. Falling back to local Base64 URL...", err);
      setUploadProgress('Processing image file...');
      // 2. Fallback to converting image to Base64 data URL
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setUploadProgress('');
          setImageUploading(false);
          resolve(reader.result as string);
        };
        reader.onerror = (error) => {
          setUploadProgress('');
          setImageUploading(false);
          reject(new Error("Failed to convert image: " + error));
        };
        reader.readAsDataURL(file);
      });
    }
  };

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

  // Homepage CMS state
  const [homepageData, setHomepageData] = useState({
    heroTitleLine1: 'Crafting Luxury Events',
    heroTitleLine2: 'That People Remember Forever.',
    heroDescription: 'We deploy logical, enterprise-grade cloud software while choreographing breath-taking wedding, corporate, and travel events that live in memory.',
    heroVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-decorations-at-a-wedding-reception-40002-large.mp4'
  });

  // FAQs CMS state
  const [faqList, setFaqList] = useState<Array<{q: string; a: string}>>([]);
  const [newFaq, setNewFaq] = useState({ q: '', a: '' });

  // Testimonials CMS state
  const [testimonialList, setTestimonialList] = useState<any[]>([]);
  const [newTestimonial, setNewTestimonial] = useState({ name: '', role: '', comment: '', avatar: '', rating: 5 });

  // Gallery CMS state
  const [galleryList, setGalleryList] = useState<any[]>([]);
  const [newGalleryItem, setNewGalleryItem] = useState({ title: '', category: 'Wedding', img: '' });

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

  // Check login state on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const logged = sessionStorage.getItem('mahdev_admin_logged');
      if (logged === 'true') {
        setIsLoggedIn(true);
      }
    }
  }, []);

  // Listen to dynamic configs in Firestore (homepage settings)
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'homepage'), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setHomepageData({
          heroTitleLine1: d.heroTitleLine1 || 'Crafting Luxury Events',
          heroTitleLine2: d.heroTitleLine2 || 'That People Remember Forever.',
          heroDescription: d.heroDescription || '',
          heroVideoUrl: d.heroVideoUrl || ''
        });
      }
    });
    return () => unsub();
  }, []);

  // Listen to FAQs in Firestore
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'faqs'), (snap) => {
      if (snap.exists()) {
        setFaqList(snap.data().items || []);
      }
    });
    return () => unsub();
  }, []);

  // Listen to Testimonials collection
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'testimonials'), (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setTestimonialList(list);
    });
    return () => unsub();
  }, []);

  // Listen to Gallery collection
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'gallery'), (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setGalleryList(list);
    });
    return () => unsub();
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
        colors: ['#D4AF37', '#FFD978']
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

  const handleSaveHomepage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'settings', 'homepage'), {
        ...homepageData,
        updatedAt: serverTimestamp()
      });
      confetti({ particleCount: 50 });
      alert("Homepage Hero settings successfully updated on Firestore!");
    } catch (err) {
      alert("Error saving homepage: " + (err as Error).message);
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

  const handleSeed = async (force = false) => {
    setSeeding(true);
    setSeedSuccess(false);
    try {
      const result = await seedDatabase(force);
      setSeedSuccess(true);
      confetti({
        particleCount: 120,
        spread: 60,
        colors: ['#D4AF37', '#FFD978', '#10b981']
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

  // Add Dynamic Custom FAQ
  const handleAddFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaq.q || !newFaq.a) return;
    try {
      const updatedList = [...faqList, newFaq];
      await setDoc(doc(db, 'settings', 'faqs'), {
        items: updatedList,
        updatedAt: serverTimestamp()
      });
      setNewFaq({ q: '', a: '' });
      confetti({ particleCount: 30 });
      alert("FAQ item added successfully!");
    } catch (err) {
      alert("Error saving FAQ: " + (err as Error).message);
    }
  };

  // Delete Dynamic FAQ
  const handleDeleteFaq = async (idx: number) => {
    try {
      const updatedList = faqList.filter((_, i) => i !== idx);
      await setDoc(doc(db, 'settings', 'faqs'), {
        items: updatedList,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      alert("Error deleting FAQ: " + (err as Error).message);
    }
  };

  // Add Dynamic Testimonial Review
  const handleAddTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestimonial.name || !newTestimonial.comment) return;
    try {
      const testId = `test-${Date.now()}`;
      await setDoc(doc(db, 'testimonials', testId), {
        name: newTestimonial.name,
        role: newTestimonial.role || 'Client Partner',
        comment: newTestimonial.comment,
        avatar: newTestimonial.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=120',
        rating: Number(newTestimonial.rating),
        updatedAt: serverTimestamp()
      });
      setNewTestimonial({ name: '', role: '', comment: '', avatar: '', rating: 5 });
      confetti({ particleCount: 30 });
      alert("Testimonial review successfully added to Firestore!");
    } catch (err) {
      alert("Error saving testimonial: " + (err as Error).message);
    }
  };

  // Delete Testimonial
  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial review?")) return;
    try {
      await deleteDoc(doc(db, 'testimonials', id));
      confetti({ particleCount: 15 });
    } catch (err) {
      alert("Delete failed");
    }
  };

  // Add Dynamic Gallery item
  const handleAddGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGalleryItem.title || !newGalleryItem.img) return;
    try {
      const galId = `gal-${Date.now()}`;
      await setDoc(doc(db, 'gallery', galId), {
        title: newGalleryItem.title,
        category: newGalleryItem.category,
        img: newGalleryItem.img,
        updatedAt: serverTimestamp()
      });
      setNewGalleryItem({ title: '', category: 'Wedding', img: '' });
      confetti({ particleCount: 30 });
      alert("Gallery image successfully added to Firestore!");
    } catch (err) {
      alert("Error saving gallery item: " + (err as Error).message);
    }
  };

  // Delete Gallery Item
  const handleDeleteGalleryItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this gallery item?")) return;
    try {
      await deleteDoc(doc(db, 'gallery', id));
      confetti({ particleCount: 15 });
    } catch (err) {
      alert("Delete failed");
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
      <div className="min-h-screen bg-[#050816] flex items-center justify-center p-4 text-white text-left relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full filter blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold-accent/5 rounded-full filter blur-[120px] pointer-events-none" />

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
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Username</label>
              <input 
                type="text" required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin"
                className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-2xl px-4 py-3.5 text-sm focus:outline-none text-white transition-all placeholder:text-gray-600 font-sans"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Password</label>
              <input 
                type="password" required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-2xl px-4 py-3.5 text-sm focus:outline-none text-white transition-all placeholder:text-gray-600 font-sans"
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
            Mahdev Pvt Ltd &bull; Security Core
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#050816] pt-32 pb-24 text-white text-left">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Dashboard Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-white/5 pb-8 mb-12">
            <div className="flex justify-between items-center w-full lg:w-auto gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-accent flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5 text-gold-accent" /> MAHDEV CONTROL CENTRE
                </span>
                <h1 className="font-display font-black text-4xl text-white mt-1">Management Portal</h1>
              </div>

              <button 
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl border border-white/10 hover:border-red-500 hover:text-red-400 text-xs font-bold tracking-wider transition-all lg:hidden"
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
                className="px-5 py-2.5 rounded-xl border border-white/10 hover:border-red-500 hover:text-red-400 text-xs font-bold tracking-wider transition-all hidden lg:block"
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
                    { id: 'homepage', label: 'Homepage Header', icon: Sliders },
                    { id: 'stats', label: 'Achievements Counters', icon: Sliders },
                    { id: 'seo', label: 'SEO Metadata Manager', icon: Globe },
                    { id: 'announcements', label: 'Promotions & Themes', icon: Tag },
                    { id: 'posters', label: 'Division Posters', icon: ImageIcon },
                    { id: 'faqs', label: 'Homepage FAQs', icon: HelpCircle },
                    { id: 'testimonials', label: 'Client Reviews', icon: User },
                    { id: 'gallery', label: 'Event Portfolio', icon: ImageIcon }
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
                    
                    {/* Homepage Header editor */}
                    {cmsSubTab === 'homepage' && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-premium rounded-3xl p-6 sm:p-8 border border-white/5"
                      >
                        <div className="border-b border-white/5 pb-4 mb-6">
                          <h3 className="font-display font-black text-xl text-white">Homepage Hero Configuration</h3>
                          <p className="text-gray-400 text-xs mt-1">Configure layout text lines and auto-playing video previews.</p>
                        </div>

                        <form onSubmit={handleSaveHomepage} className="flex flex-col gap-5">
                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Hero Title Line 1 (White)</label>
                            <input 
                              type="text" required
                              value={homepageData.heroTitleLine1}
                              onChange={(e) => setHomepageData({ ...homepageData, heroTitleLine1: e.target.value })}
                              className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs focus:outline-none text-white font-sans"
                            />
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Hero Title Line 2 (Gold Gradient)</label>
                            <input 
                              type="text" required
                              value={homepageData.heroTitleLine2}
                              onChange={(e) => setHomepageData({ ...homepageData, heroTitleLine2: e.target.value })}
                              className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs focus:outline-none text-white font-sans"
                            />
                          </div>

                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Hero Subtitle / Description Paragraph</label>
                            <textarea 
                              rows={3} required
                              value={homepageData.heroDescription}
                              onChange={(e) => setHomepageData({ ...homepageData, heroDescription: e.target.value })}
                              className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs focus:outline-none text-white resize-none font-sans"
                            />
                          </div>

                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Auto-Playing Card Video URL (mp4)</label>
                            <input 
                              type="text" required
                              value={homepageData.heroVideoUrl}
                              onChange={(e) => setHomepageData({ ...homepageData, heroVideoUrl: e.target.value })}
                              className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs focus:outline-none text-white font-mono"
                            />
                          </div>

                          <button 
                            type="submit"
                            className="py-3 px-6 rounded-xl bg-gradient-to-r from-gold-accent to-gold-soft text-navy-dark font-sans text-xs font-bold tracking-widest hover:brightness-110 self-start mt-2 transition-all cursor-pointer"
                          >
                            SAVE HOMEPAGE DATA
                          </button>
                        </form>
                      </motion.div>
                    )}

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
                              className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs focus:outline-none text-white font-sans"
                            />
                          </div>

                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Meta Description</label>
                            <textarea 
                              rows={3} required
                              value={seoData.description}
                              onChange={(e) => setSeoData({ ...seoData, description: e.target.value })}
                              className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs focus:outline-none text-white resize-none font-sans"
                            />
                          </div>

                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Search Keywords (Comma Separated)</label>
                            <input 
                              type="text" required
                              value={seoData.keywords}
                              onChange={(e) => setSeoData({ ...seoData, keywords: e.target.value })}
                              className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs focus:outline-none text-white font-sans"
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
                              className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs focus:outline-none text-white font-sans"
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

                    {/* Posters CMS editor */}
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
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">SWS Events Poster Cover</label>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                              <div className="flex-1">
                                <input 
                                  type="text" required
                                  value={posters.sws}
                                  onChange={(e) => setPosters({ ...posters, sws: e.target.value })}
                                  className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs focus:outline-none text-white font-mono w-full"
                                />
                              </div>
                              <div className="flex items-center gap-3">
                                <input 
                                  type="file" accept="image/*"
                                  disabled={imageUploading}
                                  onChange={async (e) => {
                                    if (e.target.files?.[0]) {
                                      const url = await handleImageUpload(e.target.files[0], 'posters');
                                      setPosters(prev => ({ ...prev, sws: url }));
                                    }
                                  }}
                                  className="hidden" id="upload-poster-sws"
                                />
                                <label 
                                  htmlFor="upload-poster-sws"
                                  className="px-4 py-2.5 rounded-xl border border-white/10 hover:border-gold-accent/30 hover:text-gold-soft text-[10px] font-bold tracking-wider transition-all cursor-pointer flex items-center gap-2"
                                >
                                  <ImageIcon className="w-3.5 h-3.5" /> CHOOSE FILE
                                </label>
                                {posters.sws && (
                                  <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-white/10 shrink-0">
                                    <img src={posters.sws} alt="SWS Preview" className="w-full h-full object-cover" />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Studio U1 Photography Cover</label>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                              <div className="flex-1">
                                <input 
                                  type="text" required
                                  value={posters.u1}
                                  onChange={(e) => setPosters({ ...posters, u1: e.target.value })}
                                  className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs focus:outline-none text-white font-mono w-full"
                                />
                              </div>
                              <div className="flex items-center gap-3">
                                <input 
                                  type="file" accept="image/*"
                                  disabled={imageUploading}
                                  onChange={async (e) => {
                                    if (e.target.files?.[0]) {
                                      const url = await handleImageUpload(e.target.files[0], 'posters');
                                      setPosters(prev => ({ ...prev, u1: url }));
                                    }
                                  }}
                                  className="hidden" id="upload-poster-u1"
                                />
                                <label 
                                  htmlFor="upload-poster-u1"
                                  className="px-4 py-2.5 rounded-xl border border-white/10 hover:border-gold-accent/30 hover:text-gold-soft text-[10px] font-bold tracking-wider transition-all cursor-pointer flex items-center gap-2"
                                >
                                  <ImageIcon className="w-3.5 h-3.5" /> CHOOSE FILE
                                </label>
                                {posters.u1 && (
                                  <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-white/10 shrink-0">
                                    <img src={posters.u1} alt="U1 Preview" className="w-full h-full object-cover" />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Mahdev Travels Cover</label>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                              <div className="flex-1">
                                <input 
                                  type="text" required
                                  value={posters.travels}
                                  onChange={(e) => setPosters({ ...posters, travels: e.target.value })}
                                  className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs focus:outline-none text-white font-mono w-full"
                                />
                              </div>
                              <div className="flex items-center gap-3">
                                <input 
                                  type="file" accept="image/*"
                                  disabled={imageUploading}
                                  onChange={async (e) => {
                                    if (e.target.files?.[0]) {
                                      const url = await handleImageUpload(e.target.files[0], 'posters');
                                      setPosters(prev => ({ ...prev, travels: url }));
                                    }
                                  }}
                                  className="hidden" id="upload-poster-travels"
                                />
                                <label 
                                  htmlFor="upload-poster-travels"
                                  className="px-4 py-2.5 rounded-xl border border-white/10 hover:border-gold-accent/30 hover:text-gold-soft text-[10px] font-bold tracking-wider transition-all cursor-pointer flex items-center gap-2"
                                >
                                  <ImageIcon className="w-3.5 h-3.5" /> CHOOSE FILE
                                </label>
                                {posters.travels && (
                                  <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-white/10 shrink-0">
                                    <img src={posters.travels} alt="Travels Preview" className="w-full h-full object-cover" />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">IT Solutions Cover</label>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                              <div className="flex-1">
                                <input 
                                  type="text" required
                                  value={posters.it}
                                  onChange={(e) => setPosters({ ...posters, it: e.target.value })}
                                  className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs focus:outline-none text-white font-mono w-full"
                                />
                              </div>
                              <div className="flex items-center gap-3">
                                <input 
                                  type="file" accept="image/*"
                                  disabled={imageUploading}
                                  onChange={async (e) => {
                                    if (e.target.files?.[0]) {
                                      const url = await handleImageUpload(e.target.files[0], 'posters');
                                      setPosters(prev => ({ ...prev, it: url }));
                                    }
                                  }}
                                  className="hidden" id="upload-poster-it"
                                />
                                <label 
                                  htmlFor="upload-poster-it"
                                  className="px-4 py-2.5 rounded-xl border border-white/10 hover:border-gold-accent/30 hover:text-gold-soft text-[10px] font-bold tracking-wider transition-all cursor-pointer flex items-center gap-2"
                                >
                                  <ImageIcon className="w-3.5 h-3.5" /> CHOOSE FILE
                                </label>
                                {posters.it && (
                                  <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-white/10 shrink-0">
                                    <img src={posters.it} alt="IT Preview" className="w-full h-full object-cover" />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {imageUploading && (
                            <div className="text-[11px] text-gold-accent animate-pulse font-sans">
                              {uploadProgress}
                            </div>
                          )}

                          <button 
                            type="submit"
                            className="py-3 px-6 rounded-xl bg-gradient-to-r from-gold-accent to-gold-soft text-navy-dark font-sans text-xs font-bold tracking-widest hover:brightness-110 self-start mt-2 transition-all cursor-pointer"
                          >
                            SAVE POSTERS
                          </button>
                        </form>
                      </motion.div>
                    )}

                    {/* Dynamic FAQs tab */}
                    {cmsSubTab === 'faqs' && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-premium rounded-3xl p-6 sm:p-8 border border-white/5 flex flex-col gap-6"
                      >
                        <div className="border-b border-white/5 pb-4">
                          <h3 className="font-display font-black text-xl text-white">Homepage FAQ Accordions</h3>
                          <p className="text-gray-400 text-xs mt-1">Add or remove frequently asked questions shown on the homepage.</p>
                        </div>

                        {/* Add new FAQ */}
                        <form onSubmit={handleAddFaq} className="flex flex-col gap-4 bg-white/2 p-5 rounded-2xl border border-white/5 text-left">
                          <span className="text-[10px] font-bold text-gold-accent uppercase tracking-wider">Add New FAQ</span>
                          <div className="flex flex-col gap-2">
                            <input 
                              type="text" placeholder="Question Title (e.g. What packages are offered?)" required
                              value={newFaq.q} onChange={(e) => setNewFaq({ ...newFaq, q: e.target.value })}
                              className="bg-[#050816] border border-white/8 rounded-xl px-4 py-3 text-xs focus:outline-none text-white font-sans"
                            />
                            <textarea 
                              rows={3} placeholder="Answer Content details..." required
                              value={newFaq.a} onChange={(e) => setNewFaq({ ...newFaq, a: e.target.value })}
                              className="bg-[#050816] border border-white/8 rounded-xl px-4 py-3 text-xs focus:outline-none text-white resize-none font-sans"
                            />
                          </div>
                          <button 
                            type="submit" 
                            className="py-2.5 px-5 bg-gold-accent hover:bg-gold-soft text-navy-dark text-xs font-bold rounded-xl self-start transition-all cursor-pointer"
                          >
                            ADD FAQ ITEM
                          </button>
                        </form>

                        {/* List of active FAQs */}
                        <div className="flex flex-col gap-3 text-left">
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider pl-1">Active FAQs ({faqList.length})</span>
                          {faqList.map((faq, idx) => (
                            <div key={idx} className="p-4.5 rounded-2xl glass border border-white/5 flex items-center justify-between gap-4 font-sans">
                              <div>
                                <span className="block font-bold text-white text-sm">{faq.q}</span>
                                <span className="block text-xs text-gray-400 mt-1 leading-relaxed">{faq.a}</span>
                              </div>
                              <button 
                                onClick={() => handleDeleteFaq(idx)}
                                className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 transition-colors shrink-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Testimonials tab */}
                    {cmsSubTab === 'testimonials' && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-premium rounded-3xl p-6 sm:p-8 border border-white/5 flex flex-col gap-6"
                      >
                        <div className="border-b border-white/5 pb-4">
                          <h3 className="font-display font-black text-xl text-white">Client Testimonials Reviews</h3>
                          <p className="text-gray-400 text-xs mt-1">Manage dynamic feedback logs that feed into the infinite carousel.</p>
                        </div>

                        {/* Add new Testimonial */}
                        <form onSubmit={handleAddTestimonial} className="flex flex-col gap-4 bg-white/2 p-5 rounded-2xl border border-white/5 text-left font-sans">
                          <span className="text-[10px] font-bold text-gold-accent uppercase tracking-wider">Add Client Feedback</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <input 
                              type="text" placeholder="Client Name" required
                              value={newTestimonial.name} onChange={(e) => setNewTestimonial({ ...newTestimonial, name: e.target.value })}
                              className="bg-[#050816] border border-white/8 rounded-xl px-4 py-3 text-xs focus:outline-none text-white font-sans"
                            />
                            <input 
                              type="text" placeholder="Client Company / Location" required
                              value={newTestimonial.role} onChange={(e) => setNewTestimonial({ ...newTestimonial, role: e.target.value })}
                              className="bg-[#050816] border border-white/8 rounded-xl px-4 py-3 text-xs focus:outline-none text-white font-sans"
                            />
                            <div className="flex flex-col gap-2">
                              <input 
                                type="text" placeholder="Avatar Photo URL (Optional)"
                                value={newTestimonial.avatar} onChange={(e) => setNewTestimonial({ ...newTestimonial, avatar: e.target.value })}
                                className="bg-[#050816] border border-white/8 rounded-xl px-4 py-3 text-xs focus:outline-none text-white font-sans w-full"
                              />
                              <div className="flex items-center gap-3">
                                <input 
                                  type="file" accept="image/*"
                                  disabled={imageUploading}
                                  onChange={async (e) => {
                                    if (e.target.files?.[0]) {
                                      const url = await handleImageUpload(e.target.files[0], 'testimonials');
                                      setNewTestimonial(prev => ({ ...prev, avatar: url }));
                                    }
                                  }}
                                  className="hidden" id="upload-avatar"
                                />
                                <label 
                                  htmlFor="upload-avatar"
                                  className="px-4 py-2.5 rounded-xl border border-white/10 hover:border-gold-accent/30 hover:text-gold-soft text-[10px] font-bold tracking-wider transition-all cursor-pointer flex items-center gap-2"
                                >
                                  <ImageIcon className="w-3.5 h-3.5" /> UPLOAD IMAGE
                                </label>
                                {newTestimonial.avatar && (
                                  <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/10 shrink-0">
                                    <img src={newTestimonial.avatar} alt="Avatar Preview" className="w-full h-full object-cover" />
                                  </div>
                                )}
                              </div>
                            </div>
                            <select 
                              value={newTestimonial.rating} onChange={(e) => setNewTestimonial({ ...newTestimonial, rating: Number(e.target.value) })}
                              className="bg-[#050816] border border-white/8 rounded-xl px-4 py-3 text-xs focus:outline-none text-white font-sans [&>option]:bg-navy-dark"
                            >
                              <option value="5">5 Stars Rating</option>
                              <option value="4">4 Stars Rating</option>
                              <option value="3">3 Stars Rating</option>
                            </select>
                          </div>
                          <textarea 
                            rows={3} placeholder="Client comment review details..." required
                            value={newTestimonial.comment} onChange={(e) => setNewTestimonial({ ...newTestimonial, comment: e.target.value })}
                            className="bg-[#050816] border border-white/8 rounded-xl px-4 py-3 text-xs focus:outline-none text-white resize-none font-sans"
                          />
                          <button 
                            type="submit" 
                            className="py-2.5 px-5 bg-gold-accent hover:bg-gold-soft text-navy-dark text-xs font-bold rounded-xl self-start transition-all cursor-pointer"
                          >
                            ADD TESTIMONIAL
                          </button>
                        </form>

                        {/* List of active Testimonials */}
                        <div className="flex flex-col gap-3 text-left">
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider pl-1">Active Testimonials ({testimonialList.length})</span>
                          {testimonialList.map((test) => (
                            <div key={test.id} className="p-4.5 rounded-2xl glass border border-white/5 flex items-center justify-between gap-4 font-sans">
                              <div className="flex items-center gap-3">
                                <img src={test.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=120'} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-white/10 shrink-0" />
                                <div>
                                  <span className="block font-bold text-white text-sm">{test.name}</span>
                                  <span className="block text-[10px] text-gray-400 mt-0.5">{test.role} &bull; {test.rating} Stars</span>
                                  <p className="text-xs text-gray-300 italic mt-1.5 leading-relaxed">"{test.comment}"</p>
                                </div>
                              </div>
                              <button 
                                onClick={() => handleDeleteTestimonial(test.id)}
                                className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 transition-colors shrink-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Gallery photos editor */}
                    {cmsSubTab === 'gallery' && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-premium rounded-3xl p-6 sm:p-8 border border-white/5 flex flex-col gap-6"
                      >
                        <div className="border-b border-white/5 pb-4">
                          <h3 className="font-display font-black text-xl text-white">Event Portfolio Gallery</h3>
                          <p className="text-gray-400 text-xs mt-1">Manage categories and image paths representing SWS wedding decors, Travels fleet convoys, and Cinema shoots.</p>
                        </div>

                        {/* Add Gallery Item */}
                        <form onSubmit={handleAddGalleryItem} className="flex flex-col gap-4 bg-white/2 p-5 rounded-2xl border border-white/5 text-left font-sans">
                          <span className="text-[10px] font-bold text-gold-accent uppercase tracking-wider">Add Image to Portfolio</span>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <input 
                              type="text" placeholder="Project Title (e.g. Mughal Gold Canopy)" required
                              value={newGalleryItem.title} onChange={(e) => setNewGalleryItem({ ...newGalleryItem, title: e.target.value })}
                              className="bg-[#050816] border border-white/8 rounded-xl px-4 py-3 text-xs focus:outline-none text-white font-sans sm:col-span-2"
                            />
                            <select 
                              value={newGalleryItem.category} onChange={(e) => setNewGalleryItem({ ...newGalleryItem, category: e.target.value })}
                              className="bg-[#050816] border border-white/8 rounded-xl px-4 py-3 text-xs focus:outline-none text-white font-sans [&>option]:bg-navy-dark"
                            >
                              <option value="Wedding">Wedding Category</option>
                              <option value="Corporate">Corporate Category</option>
                              <option value="Cinema">Cinema Category</option>
                              <option value="Travel">Travel Category</option>
                              <option value="Lighting">Lighting Category</option>
                            </select>
                            <div className="sm:col-span-3 flex flex-col sm:flex-row sm:items-center gap-4">
                              <div className="flex-1">
                                <input 
                                  type="text" placeholder="Image URL (e.g. /images/wedding_decoration_1782729925686.jpg)" required
                                  value={newGalleryItem.img} onChange={(e) => setNewGalleryItem({ ...newGalleryItem, img: e.target.value })}
                                  className="bg-[#050816] border border-white/8 rounded-xl px-4 py-3 text-xs focus:outline-none text-white font-mono w-full"
                                />
                              </div>
                              <div className="flex items-center gap-3">
                                <input 
                                  type="file" accept="image/*"
                                  disabled={imageUploading}
                                  onChange={async (e) => {
                                    if (e.target.files?.[0]) {
                                      const url = await handleImageUpload(e.target.files[0], 'gallery');
                                      setNewGalleryItem(prev => ({ ...prev, img: url }));
                                    }
                                  }}
                                  className="hidden" id="upload-gallery-image"
                                />
                                <label 
                                  htmlFor="upload-gallery-image"
                                  className="px-4 py-2.5 rounded-xl border border-white/10 hover:border-gold-accent/30 hover:text-gold-soft text-[10px] font-bold tracking-wider transition-all cursor-pointer flex items-center gap-2"
                                >
                                  <ImageIcon className="w-3.5 h-3.5" /> UPLOAD IMAGE
                                </label>
                                {newGalleryItem.img && (
                                  <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-white/10 shrink-0">
                                    <img src={newGalleryItem.img} alt="Gallery Preview" className="w-full h-full object-cover" />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <button 
                            type="submit" 
                            className="py-2.5 px-5 bg-gold-accent hover:bg-gold-soft text-navy-dark text-xs font-bold rounded-xl self-start transition-all cursor-pointer"
                          >
                            ADD GALLERY ITEM
                          </button>
                        </form>

                        {/* List of active items */}
                        <div className="flex flex-col gap-3 text-left">
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider pl-1">Active Portfolio Items ({galleryList.length})</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {galleryList.map((item) => (
                              <div key={item.id} className="p-3 rounded-2xl glass border border-white/5 flex items-center justify-between gap-3 font-sans">
                                <div className="flex items-center gap-3">
                                  <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-white/10 shrink-0">
                                    <img src={item.img} alt={item.title} className="w-full h-full object-cover" />
                                  </div>
                                  <div className="text-left">
                                    <span className="block font-bold text-white text-xs leading-normal">{item.title}</span>
                                    <span className="block text-[8px] uppercase tracking-wider text-gold-accent font-semibold mt-0.5">{item.category}</span>
                                  </div>
                                </div>
                                <button 
                                  onClick={() => handleDeleteGalleryItem(item.id)}
                                  className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 transition-colors shrink-0"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
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
                    <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Background Cover Image</label>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1">
                        <input 
                          type="text" required
                          value={divForm.bgImage} onChange={(e) => setDivForm({ ...divForm, bgImage: e.target.value })}
                          className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs focus:outline-none text-white w-full"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <input 
                          type="file" accept="image/*"
                          disabled={imageUploading}
                          onChange={async (e) => {
                            if (e.target.files?.[0]) {
                              const url = await handleImageUpload(e.target.files[0], 'divisions');
                              setDivForm(prev => ({ ...prev, bgImage: url }));
                            }
                          }}
                          className="hidden" id="upload-div-bg"
                        />
                        <label 
                          htmlFor="upload-div-bg"
                          className="px-4 py-2.5 rounded-xl border border-white/10 hover:border-gold-accent/30 hover:text-gold-soft text-[10px] font-bold tracking-wider transition-all cursor-pointer flex items-center gap-2"
                        >
                          <ImageIcon className="w-3.5 h-3.5" /> UPLOAD IMAGE
                        </label>
                        {divForm.bgImage && (
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-white/10 shrink-0">
                            <img src={divForm.bgImage} alt="Cover Preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Description</label>
                    <textarea 
                      rows={3} required placeholder="Detailed corporate definition of operations..."
                      value={divForm.description} onChange={(e) => setDivForm({ ...divForm, description: e.target.value })}
                      className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs focus:outline-none text-white resize-none font-sans"
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
              <div className="glass-premium rounded-3xl p-8 border border-white/5 flex flex-col gap-6 max-w-2xl text-left">
                <h3 className="font-display font-black text-2xl text-white">Firestore Database Initialization</h3>
                <p className="font-sans text-sm text-gray-400 leading-relaxed">
                  Seed initial datasets to populate homepage Hero details, FAQ questions, testimonials, division services, and career listings directly in Cloud Firestore.
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
                    ✓ Firestore seed successful! Homepage details, FAQs, testimonials, and divisions are active.
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
