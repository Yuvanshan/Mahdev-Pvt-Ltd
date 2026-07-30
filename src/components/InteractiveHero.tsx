'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Volume2, VolumeX } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { getMediaType, getYouTubeId } from '@/lib/media';

export default function InteractiveHero() {
  const [isMuted, setIsMuted] = useState(true);
  const [heroData, setHeroData] = useState({
    title1: 'Creating Moments.',
    title2: 'Capturing Memories.',
    title3: 'Delivering Innovation.',
    desc: 'One company. Multiple solutions.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-decorations-at-a-wedding-reception-40002-large.mp4'
  });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'homepage'), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setHeroData({
          title1: d.heroTitleLine1 || 'Creating Moments.',
          title2: d.heroTitleLine2 || 'Capturing Memories.',
          title3: d.heroTitleLine3 || 'Delivering Innovation.',
          desc: d.heroDescription || 'One company. Multiple solutions.',
          videoUrl: d.heroVideoUrl || 'https://assets.mixkit.co/videos/preview/mixkit-decorations-at-a-wedding-reception-40002-large.mp4'
        });
      }
    });
    return () => unsub();
  }, []);

  return (
    <section className="relative w-full min-h-[90vh] flex items-center justify-center pt-32 pb-20 overflow-hidden bg-gradient-to-br from-navy-dark to-navy-medium dark:from-[#12101A] dark:to-[#211C2E]">
      <div className="noise-overlay" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        
        {/* Left Side Content Column */}
        <div className="lg:col-span-7 flex flex-col gap-6 text-left">
          
          {/* Subtle Label */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-navy-medium border border-card-border max-w-fit shadow-sm">
            <span className="text-[10px] uppercase font-bold tracking-widest text-gold-soft">
              Mahdev Pvt Ltd
            </span>
          </div>

          {/* Heading */}
          <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-[56px] leading-[1.1] tracking-tight select-none flex flex-col gap-1">
            <span className="text-text-heading">{heroData.title1}</span>
            <span className="text-text-heading">{heroData.title2}</span>
            <span className="text-gold-soft">{heroData.title3}</span>
          </h1>

          {/* Description */}
          <p className="font-sans text-text-body text-base sm:text-lg leading-relaxed max-w-xl text-left">
            {heroData.desc}
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-2">
            <Link 
              href="#divisions"
              className="px-6 py-3 rounded-lg flex items-center justify-center gap-2 luxury-btn-gold text-[13px] font-semibold text-center cursor-pointer shadow"
            >
              Explore Services
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              href="/contact"
              className="px-6 py-3 rounded-lg flex items-center justify-center gap-2 luxury-btn text-[13px] font-semibold text-center cursor-pointer"
            >
              Contact Us
            </Link>
          </div>
        </div>

        {/* Right Side Video Showcase (Clean Frame with 16px rounding) */}
        <div className="lg:col-span-5 relative w-full h-[320px] sm:h-[400px] rounded-2xl overflow-hidden border border-card-border shadow-md bg-black">
          {(() => {
            const mediaType = getMediaType(heroData.videoUrl);
            if (mediaType === 'youtube') {
              const ytId = getYouTubeId(heroData.videoUrl);
              return (
                <iframe
                  src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&playlist=${ytId}&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
                  className="w-full h-full object-cover rounded-2xl pointer-events-none"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ border: 'none' }}
                />
              );
            } else if (mediaType === 'image') {
              return (
                <img
                  src={heroData.videoUrl}
                  alt="Mahdev Showcase"
                  className="w-full h-full object-cover rounded-2xl"
                />
              );
            } else {
              return (
                <video 
                  key={`${heroData.videoUrl}_${isMuted}`}
                  src={heroData.videoUrl}
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  className="w-full h-full object-cover rounded-2xl"
                />
              );
            }
          })()}
          
          {/* Mute button */}
          {(() => {
            const mediaType = getMediaType(heroData.videoUrl);
            if (mediaType === 'youtube' || mediaType === 'video') {
              return (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setIsMuted(!isMuted);
                  }}
                  className="absolute bottom-4 right-4 z-20 p-2 rounded-lg bg-navy-dark/80 hover:bg-navy-dark border border-card-border text-text-heading transition-all duration-200 cursor-pointer shadow"
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4 text-text-body" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-gold-soft animate-pulse" />
                  )}
                </button>
              );
            }
            return null;
          })()}
        </div>
      </div>
    </section>
  );
}
