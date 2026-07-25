'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { seedDatabase } from '@/lib/seeder';
import { Database, FolderPlus, Calendar, Users, Check, Trash2, ArrowUpRight, Cpu } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import confetti from 'canvas-confetti';

export default function AdminPortal() {
  const [activeTab, setActiveTab] = useState<'seeder' | 'bookings' | 'divisions' | 'leads'>('seeder');
  const [bookings, setBookings] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

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
      alert(result ? "Firebase seeding successfully finished!" : "Database already has records. Use force to reseed.");
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

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-navy-dark pt-32 pb-24 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-8 mb-12">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-accent">MAHDEV CONTROL CENTRE</span>
              <h1 className="font-display font-black text-4xl text-white mt-1">Management Portal</h1>
            </div>

            {/* Tabs selector */}
            <div className="flex flex-wrap gap-2.5">
              {[
                { id: 'seeder', label: 'Cloud Seeder', icon: Database },
                { id: 'bookings', label: 'Bookings List', icon: Calendar },
                { id: 'divisions', label: 'Create Division', icon: FolderPlus },
                { id: 'leads', label: 'AI Leads', icon: Users }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-5 py-2.5 rounded-xl font-sans text-xs font-bold tracking-wider flex items-center gap-2 transition-all ${
                      activeTab === tab.id 
                        ? 'bg-gradient-to-r from-gold-accent to-gold-soft text-navy-dark border-none' 
                        : 'glass text-gray-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label.toUpperCase()}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-12">
            {/* Tab: Seeder */}
            {activeTab === 'seeder' && (
              <div className="glass-premium rounded-3xl p-8 border border-white/5 flex flex-col gap-6 text-left max-w-2xl">
                <h3 className="font-display font-black text-2xl text-white">Firestore Database Initialization</h3>
                <p className="font-sans text-sm text-gray-400 leading-relaxed">
                  Seed initial datasets to populate all operational division services, mock reviews, fleet cars, blogs, and career listings directly in Cloud Firestore database.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                  <button
                    onClick={() => handleSeed(false)}
                    disabled={seeding}
                    className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-gold-accent to-gold-soft disabled:opacity-50 text-navy-dark font-sans text-xs font-bold tracking-wider hover:brightness-110 transition-all flex items-center justify-center gap-2"
                  >
                    {seeding ? 'SEEDING DATABASES...' : 'SEED DATA (SAFE)'}
                  </button>
                  <button
                    onClick={() => handleSeed(true)}
                    disabled={seeding}
                    className="px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-sans text-xs font-bold tracking-wider transition-all flex items-center justify-center gap-2"
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

            {/* Tab: Bookings */}
            {activeTab === 'bookings' && (
              <div className="glass rounded-3xl p-6 sm:p-8 border border-white/5 overflow-x-auto text-left">
                <h3 className="font-display font-black text-2xl text-white mb-6">Reservation Bookings Ledger</h3>

                {bookings.length === 0 ? (
                  <div className="py-12 text-center text-gray-500 text-sm font-sans">
                    No booking records found in Firestore. Try seeding the database first.
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse font-sans text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-white/5 text-gray-500 uppercase tracking-widest text-[9px]">
                        <th className="py-3 px-4">Client</th>
                        <th className="py-3 px-4">Date</th>
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
                          <td className="py-4 px-4 font-mono text-gray-300">{bk.date}</td>
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
                                  className="p-1.5 rounded bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 transition-all"
                                  title="Approve Booking"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteBooking(bk.id)}
                                className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all"
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

            {/* Tab: Divisions */}
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
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-gold-accent to-gold-soft text-navy-dark font-sans font-bold text-sm tracking-wider hover:brightness-110 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-gold-accent/15"
                  >
                    DEPLOY DYNAMIC DIVISION
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {/* Tab: Leads */}
            {activeTab === 'leads' && (
              <div className="glass rounded-3xl p-6 sm:p-8 border border-white/5 overflow-x-auto text-left">
                <h3 className="font-display font-black text-2xl text-white mb-6">Captured Concierge Leads</h3>

                {leads.length === 0 ? (
                  <div className="py-12 text-center text-gray-500 text-sm font-sans">
                    No lead records logged by the AI Assistant yet.
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse font-sans text-xs sm:text-sm">
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
                              className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all"
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
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
