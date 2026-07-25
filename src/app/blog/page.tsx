'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { Calendar, User, ArrowRight, FileText } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function BlogList() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [activeCat, setActiveCat] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'blogs'), (snap) => {
      const list = snap.docs.map(docDoc => ({ id: docDoc.id, ...docDoc.data() }));
      setBlogs(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const categories = ['All', 'Events', 'Photography', 'Technology', 'Travel'];
  
  const filteredBlogs = activeCat === 'All' 
    ? blogs 
    : blogs.filter(b => b.category === activeCat);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-navy-dark pt-32 pb-24 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 flex flex-col gap-3">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-accent">MAHDEV CONGLOMERATE PRESS</span>
            <h1 className="font-display font-black text-4xl sm:text-5xl text-white tracking-tight">Insights, News & Technical Audits</h1>
            <p className="font-sans text-gray-400 max-w-lg mx-auto text-xs sm:text-sm leading-relaxed">Read about specialized logistics coordinates, luxury stages planning tips, and corporate inventory ledger migrations.</p>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={`px-5 py-2.5 rounded-xl font-sans text-xs font-bold tracking-wider transition-all ${
                  activeCat === cat 
                    ? 'bg-gradient-to-r from-gold-accent to-gold-soft text-navy-dark border-none' 
                    : 'glass text-gray-400 hover:text-white'
                }`}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-2 border-gold-accent border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-gray-500 font-semibold tracking-wider font-sans">SYNCHRONIZING FEED...</span>
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-sm font-sans">
              No press releases found. Seed the database to load sample blogs.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBlogs.map((b) => (
                <div 
                  key={b.id} 
                  className="glass rounded-3xl overflow-hidden border border-white/5 group hover:border-gold-accent/25 hover:translate-y-[-4px] transition-all flex flex-col h-full text-left"
                >
                  <div className="relative h-56 w-full overflow-hidden">
                    <Image 
                      src={b.image || '/images/sws_robot_decor_1783346269673.jpg'} 
                      alt={b.title} 
                      fill 
                      className="object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/95 to-transparent" />
                    <div className="absolute top-4 left-4 px-2.5 py-0.5 rounded bg-black/60 border border-white/10 text-[9px] font-bold text-gold-soft uppercase tracking-wider">
                      {b.category}
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1 gap-4">
                    <div>
                      <div className="flex items-center gap-4 text-[10px] text-gray-500 font-sans">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-gold-accent" /> {b.date}</span>
                        <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-gold-accent" /> {b.author}</span>
                      </div>
                      <h3 className="font-display font-bold text-base sm:text-lg text-white mt-3 group-hover:text-gold-soft transition-colors leading-snug">{b.title}</h3>
                      <p className="font-sans text-xs text-gray-400 mt-2 leading-relaxed line-clamp-3">{b.content}</p>
                    </div>
                    <Link
                      href={`/blog/${b.id}`}
                      className="w-full py-3 rounded-xl border border-white/10 text-center text-white hover:bg-gold-accent hover:text-navy-dark hover:border-gold-accent transition-all font-sans text-xs font-semibold tracking-wider flex items-center justify-center gap-2 mt-auto"
                    >
                      READ FULL ARTICLE
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
