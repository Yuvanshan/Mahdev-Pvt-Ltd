'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Calendar, Compass, Cpu, Camera, FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

interface SearchItem {
  id: string;
  title: string;
  desc: string;
  category: string;
  division: string;
  href: string;
  icon: any;
}

export default function GlobalSearch({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Perform search locally & via Firestore records
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      try {
        const queryLower = query.toLowerCase();

        // 1. Static items mapping for instant feedback
        const staticItems: SearchItem[] = [
          { id: 'sws-1', title: 'Royal Stage Decor', desc: 'Glasshouse structures, marigold linings, and couple table settings.', category: 'Decorations', division: 'SWS Events', href: '/divisions/sws-events', icon: Camera },
          { id: 'sws-2', title: 'Church Floral Arrangements', desc: 'Elegant orchid backdrops, pew lines, and candle alignments.', category: 'Decorations', division: 'SWS Events', href: '/divisions/sws-events', icon: Camera },
          { id: 'u1-1', title: 'Before and After Image Comparison', desc: 'Drag-to-compare portrait filters and raw-to-edit photo results.', category: 'Portfolio', division: 'Studio U1', href: '/divisions/u1-studio', icon: Compass },
          { id: 'u1-2', title: 'Drone Cinematic Showcase', desc: 'Birds-eye videos of beach weddings, forest trails, and cityscapes.', category: 'Portfolio', division: 'Studio U1', href: '/divisions/u1-studio', icon: Compass },
          { id: 'it-1', title: 'Cloud POS SaaS License', desc: 'Omnichannel billing terminal, inventory registry, and thermal slip printouts.', category: 'Products', division: 'IT Solutions', href: '/divisions/it-solutions', icon: Cpu },
          { id: 'it-2', title: 'Double-Entry ERP System', desc: 'Corporate books ledgers, warehouse tracking, and audit modules.', category: 'Products', division: 'IT Solutions', href: '/divisions/it-solutions', icon: Cpu },
          { id: 'tr-1', title: 'Toyota KDH Passenger Van', desc: 'High-roof dual-A/C luxury vans (9-14 seats) with English chauffeurs.', category: 'Fleet', division: 'Mahdev Travels', href: '/divisions/travels', icon: Calendar },
          { id: 'tr-2', title: 'Ella Greenery Escape Tour', desc: '3 Days travel covering Nine Arch bridge, tea estates, and waterfall coordinates.', category: 'Tours', division: 'Mahdev Travels', href: '/divisions/travels', icon: Calendar },
        ];

        // 2. Query Firestore collections for dynamic content
        const blogsSnap = await getDocs(collection(db, 'blogs'));
        const blogs = blogsSnap.docs.map(docDoc => {
          const data = docDoc.data();
          return {
            id: docDoc.id,
            title: data.title || '',
            desc: data.content ? data.content.substring(0, 100) + '...' : '',
            category: 'Blogs',
            division: data.category || 'News',
            href: `/blog/${docDoc.id}`,
            icon: FileText
          };
        });

        const careersSnap = await getDocs(collection(db, 'careers'));
        const careers = careersSnap.docs.map(docDoc => {
          const data = docDoc.data();
          return {
            id: docDoc.id,
            title: data.title || '',
            desc: data.description ? data.description.substring(0, 100) + '...' : '',
            category: 'Careers',
            division: data.department || 'HR',
            href: '/careers',
            icon: FileText
          };
        });

        const allItems = [...staticItems, ...blogs, ...careers];

        // Filter based on query
        const filtered = allItems.filter(item => 
          item.title.toLowerCase().includes(queryLower) ||
          item.desc.toLowerCase().includes(queryLower) ||
          item.category.toLowerCase().includes(queryLower) ||
          item.division.toLowerCase().includes(queryLower)
        );

        setResults(filtered);
      } catch (err) {
        console.error("Search query failed", err);
      } finally {
        setLoading(false);
      }
    }, 200); // debounce

    return () => clearTimeout(delayDebounce);
  }, [query]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[10vh] px-4 pointer-events-auto">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Search Card Container */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-2xl rounded-xl bg-navy-dark border border-card-border overflow-hidden shadow-lg relative z-10 flex flex-col max-h-[75vh]"
          >
            {/* Input Header */}
            <div className="p-5 border-b border-card-border bg-navy-medium flex items-center gap-4">
              <Search className="w-5 h-5 text-gold-soft shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search decorations, POS systems, tours, blogs, careers..."
                className="flex-1 bg-transparent border-none text-text-heading text-base focus:outline-none placeholder-gray-500 font-sans"
              />
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-navy-medium text-text-body hover:text-text-heading transition-all shrink-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results Stream */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar min-h-[150px]">
              {loading && (
                <div className="py-12 flex flex-col items-center gap-3">
                  <div className="w-8 h-8 rounded-full border-2 border-gold-soft border-t-transparent animate-spin" />
                  <span className="text-xs text-gold-soft font-semibold tracking-wider font-sans">SCANNING DATABASE...</span>
                </div>
              )}

              {!loading && results.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-bold text-gold-soft tracking-widest uppercase px-3 mb-2">Search Results ({results.length})</span>
                  {results.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={onClose}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-navy-medium border border-transparent hover:border-card-border transition-all group"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-9 h-9 rounded-md bg-navy-medium border border-card-border flex items-center justify-center text-gold-soft shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-text-heading text-sm font-semibold tracking-wide truncate">{item.title}</h4>
                              <span className="px-2 py-0.5 rounded bg-navy-medium border border-card-border text-[9px] text-text-body font-bold uppercase shrink-0">
                                {item.category}
                              </span>
                            </div>
                            <p className="text-xs text-text-body mt-1 truncate max-w-md font-sans">{item.desc}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 text-[10px] font-bold text-text-body/60 group-hover:text-gold-soft transition-colors pl-4">
                          <span className="hidden sm:inline uppercase tracking-wider">{item.division}</span>
                          <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}

              {!loading && !query.trim() && (
                <div className="py-12 text-center flex flex-col items-center gap-2">
                  <Search className="w-8 h-8 text-text-body/40 mb-2" />
                  <h4 className="text-text-heading font-bold text-sm tracking-wide">Instant Global Directory</h4>
                  <p className="text-xs text-text-body max-w-sm font-sans">Type any keyword to inspect packages, wedding cars, active job application listings, or enterprise bookkeeping templates.</p>
                </div>
              )}

              {!loading && query.trim() && results.length === 0 && (
                <div className="py-12 text-center flex flex-col items-center gap-2">
                  <X className="w-8 h-8 text-red-500/50 mb-2" />
                  <h4 className="text-text-heading font-bold text-sm tracking-wide">No Entries Match Your Search</h4>
                  <p className="text-xs text-text-body max-w-sm font-sans">Try searching for keywords like "stage", "POS", "van", "wedding", or "careers".</p>
                </div>
              )}
            </div>

            {/* Quick Action Shortcuts Footer */}
            <div className="p-4 border-t border-card-border bg-navy-dark flex justify-between items-center text-[10px] text-text-body/60 font-sans">
              <span>Press <kbd className="px-1.5 py-0.5 rounded bg-navy-medium border border-card-border text-text-heading">ESC</kbd> to close</span>
              <span>Search shortcut: <kbd className="px-1.5 py-0.5 rounded bg-navy-medium border border-card-border text-text-heading">/</kbd> key</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
