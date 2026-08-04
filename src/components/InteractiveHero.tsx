'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useAnimation, useInView } from 'framer-motion';
import { ArrowRight, Sparkles, Play, Calendar, MapPin, PlayCircle, Volume2, VolumeX } from 'lucide-react';
import * as THREE from 'three';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { getMediaType, getYouTubeId } from '@/lib/media';

const heroBulletTags = ['Events', 'Software', 'Media', 'Travels'];

const defaultHeroCards = [
  {
    id: 'sws-events',
    label: 'LIVE PREVIEW',
    title: 'Royal Canopy Build',
    subtitle: 'Visual decoration rendering',
    mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-decorations-at-a-wedding-reception-40002-large.mp4',
    location: 'Shangri-La Hall',
    resolution: '1080p Ultra HD',
    link: '/divisions/sws-events'
  },
  {
    id: 'u1-studio',
    label: 'PORTRAIT SHOOT',
    title: 'Golden Hour Union',
    subtitle: 'Cinematic film edit',
    mediaUrl: '/images/u1_robot_camera_1783346286743.jpg',
    location: 'Grand Palace Altar',
    resolution: '4K Cinematic',
    link: '/divisions/u1-studio'
  },
  {
    id: 'erp',
    label: 'SaaS PORTALS',
    title: 'Omnichannel POS',
    subtitle: 'Cloud ledger inventory',
    mediaUrl: '/images/saas_dashboard.jpg',
    location: 'Colombo Office',
    resolution: 'Active Sync',
    link: '/divisions/erp'
  },
  {
    id: 'travels',
    label: 'VIP TRANSIT',
    title: 'Mercedes Luxury Hire',
    subtitle: 'Airport transfers convoy',
    mediaUrl: '/images/travels_robot_car_1783346316762.jpg',
    location: 'BIA Airport Dispatch',
    resolution: '5-Star Service',
    link: '/divisions/travels'
  }
];

export default function InteractiveHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glowPos, setGlowPos] = useState({ x: 0, y: 0 });
  
  // Parallax tracking
  const [parallaxY, setParallaxY] = useState(0);

  // Mute state for hero media preview
  const [isMuted, setIsMuted] = useState(true);

  // Firestore dynamic hero state
  const [heroData, setHeroData] = useState({
    title1: 'Crafting Luxury Events',
    title2: 'That People Remember Forever.',
    desc: 'We deploy logical, enterprise-grade cloud software while choreographing breath-taking wedding, corporate, and travel events that live in memory.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-decorations-at-a-wedding-reception-40002-large.mp4'
  });

  const [heroCards, setHeroCards] = useState<any[]>(defaultHeroCards);
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'homepage'), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setHeroData({
          title1: d.heroTitleLine1 || 'Crafting Luxury Events',
          title2: d.heroTitleLine2 || 'That People Remember Forever.',
          desc: d.heroDescription || 'We deploy logical, enterprise-grade cloud software while choreographing breath-taking wedding, corporate, and travel events that live in memory.',
          videoUrl: d.heroVideoUrl || 'https://assets.mixkit.co/videos/preview/mixkit-decorations-at-a-wedding-reception-40002-large.mp4'
        });
        if (d.heroCards && Array.isArray(d.heroCards) && d.heroCards.length === 4) {
          setHeroCards(d.heroCards);
        }
      }
    });
    return () => unsub();
  }, []);

  // 5-second automatic rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveCardIndex((prev) => (prev + 1) % 4);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setParallaxY(window.scrollY * 0.15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Card Mouse Tilt and Glow spotlight position
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Relative coordinates (-0.5 to 0.5)
    const x = (e.clientX - rect.left) / width - 0.5;
    const y = (e.clientY - rect.top) / height - 0.5;
    
    setTilt({ x: x * 25, y: -y * 25 }); // Rotations limits
    
    // Spotlight coordinates (relative in pixels)
    setGlowPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  // Three.js Particle Wave background
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.z = 25;
    camera.position.y = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Particle wave geometry
    const count = 1500;
    const positions = new Float32Array(count * 3);
    const cols = 50;
    const rows = 30;
    const spacing = 1.0;

    for (let i = 0; i < count; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      
      const x = (col - cols / 2) * spacing;
      const z = (row - rows / 2) * spacing;
      const y = Math.sin(col * 0.15) * 1.2;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Particle texture (circle glow)
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
      grad.addColorStop(0, 'rgba(255, 217, 120, 1)');
      grad.addColorStop(0.4, 'rgba(212, 175, 55, 0.35)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 16, 16);
    }
    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 0.8,
      map: texture,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      color: 0xD4AF37,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    let clock = new THREE.Clock();
    let reqId: number;

    const animate = () => {
      const time = clock.getElapsedTime();
      const posAttr = geometry.attributes.position.array as Float32Array;

      for (let i = 0; i < count; i++) {
        const x = posAttr[i * 3];
        const z = posAttr[i * 3 + 2];
        // Beautiful floating wave function
        posAttr[i * 3 + 1] = 
          Math.sin(x * 0.12 + time * 1.5) * 1.4 + 
          Math.cos(z * 0.12 + time * 1.2) * 1.4;
      }
      geometry.attributes.position.needsUpdate = true;
      points.rotation.y = time * 0.03;

      renderer.render(scene, camera);
      reqId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(reqId);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  // Split-text animation parameters
  const wordVariants = {
    hidden: { opacity: 0, y: 35, filter: 'blur(8px)' },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        delay: i * 0.12,
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] as any
      }
    })
  } as any;

  const textLines = [
    { text: heroData.title1, class: "text-white" },
    { text: heroData.title2, class: "text-gradient-gold" }
  ];

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center pt-32 pb-24 overflow-hidden premium-bg-gradient">
      
      {/* Background Animated Noise and Mesh Gradients */}
      <div className="noise-overlay" />
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 mesh-gradient-glow ambient-light-1" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 mesh-gradient-glow ambient-light-2" />

      {/* Dynamic Golden Particle Waves */}
      <div ref={containerRef} className="absolute inset-0 z-[2] opacity-45 pointer-events-none" />

      {/* Layout Content */}
      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 items-center mt-4">
        
        {/* Left Side Content Column */}
        <div className="lg:col-span-7 flex flex-col gap-8 text-left" style={{ transform: `translateY(${parallaxY * -0.2}px)` }}>
          
          {/* Floating Luxury Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2.5 px-4.5 py-2 rounded-full glass border border-gold-accent/25 max-w-fit shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:border-gold-accent/40 transition-colors"
          >
            <Sparkles className="w-4.5 h-4.5 text-gold-soft animate-pulse" />
            <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-gold-soft">
              ONE PREMIUM COMPANY
            </span>
          </motion.div>

          {/* Heading with sequential word fades */}
          <div className="flex flex-col gap-4">
            <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-[62px] leading-[1.08] tracking-tight text-white select-none">
              {textLines.map((line, lIdx) => (
                <span key={lIdx} className={`block ${line.class}`}>
                  {line.text.split(" ").map((word, wIdx) => (
                    <motion.span
                      key={wIdx}
                      custom={lIdx * 3 + wIdx}
                      initial="hidden"
                      animate="visible"
                      variants={wordVariants}
                      className="inline-block mr-3"
                    >
                      {word}
                    </motion.span>
                  ))}
                </span>
              ))}
            </h1>

            {/* Division Bullet Indicators */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="flex flex-wrap items-center gap-2.5 font-sans mt-2"
            >
              <span className="text-xs font-semibold text-white/50 mr-1.5">Focus Sectors:</span>
              {heroBulletTags.map((tag, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  {idx > 0 && <span className="w-1.5 h-1.5 rounded-full bg-white/20" />}
                  <span className="text-xs font-semibold text-gold-soft tracking-wider hover:text-white transition-colors duration-300">
                    {tag}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Luxury Description Paragraph */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="font-sans text-[#BFC8E6] text-base sm:text-[17px] leading-relaxed max-w-xl text-left font-light"
          >
            {heroData.desc}
          </motion.p>

          {/* Action Call to Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-5 mt-3 select-none"
          >
            <Link 
              href="#featured-projects"
              className="px-8 py-4.5 rounded-2xl flex items-center justify-center gap-2.5 luxury-btn luxury-btn-gold text-[12px] tracking-widest font-black uppercase text-center cursor-pointer shadow-lg"
            >
              Explore Our Work
              <ArrowRight className="w-4.5 h-4.5" />
            </Link>
            <Link 
              href="#contact"
              className="px-8 py-4.5 rounded-2xl flex items-center justify-center gap-2.5 luxury-btn text-[12px] tracking-widest font-bold uppercase text-center cursor-pointer"
            >
              Get a Quote
            </Link>
          </motion.div>
        </div>

        {/* Right Side Video Showcase (3D Glass Cards Stack) */}
        <div className="lg:col-span-5 relative w-full h-[450px] flex items-center justify-center select-none z-10" style={{ transform: `translateY(${parallaxY * 0.1}px)`, perspective: 1000 }}>
          <div className="relative w-full max-w-[290px] h-[390px]">
            {heroCards.map((card, idx) => {
              const diff = (idx - activeCardIndex + 4) % 4;
              
              // 3D positioning styles based on sequence offset
              const getCardStyles = () => {
                if (diff === 0) {
                  // Front / active
                  return {
                    x: 0,
                    y: 0,
                    scale: 1.0,
                    rotateY: tilt.x,
                    rotateX: tilt.y,
                    z: 20,
                    zIndex: 30,
                    opacity: 1.0,
                    filter: 'blur(0px)',
                    pointerEvents: 'auto' as const
                  };
                }
                if (diff === 1) {
                  // Back right
                  return {
                    x: 140,
                    y: -15,
                    scale: 0.75,
                    rotateY: -25,
                    rotateX: 0,
                    z: -140,
                    zIndex: 20,
                    opacity: 0.65,
                    filter: 'blur(1px)',
                    pointerEvents: 'none' as const
                  };
                }
                if (diff === 2) {
                  // Furthest back
                  return {
                    x: 0,
                    y: -40,
                    scale: 0.6,
                    rotateY: 0,
                    rotateX: 0,
                    z: -280,
                    zIndex: 10,
                    opacity: 0.35,
                    filter: 'blur(3px)',
                    pointerEvents: 'none' as const
                  };
                }
                // Back left (diff === 3)
                return {
                  x: -140,
                  y: -15,
                  scale: 0.75,
                  rotateY: 25,
                  rotateX: 0,
                  z: -140,
                  zIndex: 20,
                  opacity: 0.65,
                  filter: 'blur(1px)',
                  pointerEvents: 'none' as const
                };
              };

              const styles = getCardStyles();
              const isFront = diff === 0;

              // Helper to resolve card preview image if background card
              const getCardPreviewImage = (url: string) => {
                const type = getMediaType(url);
                if (type === 'youtube') {
                  const ytId = getYouTubeId(url);
                  return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
                }
                if (type === 'video') {
                  return '/images/wedding_decoration_1782729925686.jpg'; // Fallback backdrop
                }
                return url;
              };

              return (
                <motion.div
                  key={card.id}
                  ref={isFront ? cardRef : undefined}
                  animate={styles}
                  transition={{ type: 'spring', damping: 25, stiffness: 120 }}
                  onMouseMove={isFront ? handleMouseMove : undefined}
                  onMouseLeave={isFront ? handleMouseLeave : undefined}
                  drag={isFront ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.3}
                  onDragEnd={isFront ? (e, info) => {
                    const swipeThreshold = 70;
                    if (info.offset.x < -swipeThreshold) {
                      setActiveCardIndex((prev) => (prev + 1) % 4);
                    } else if (info.offset.x > swipeThreshold) {
                      setActiveCardIndex((prev) => (prev + 3) % 4);
                    }
                  } : undefined}
                  onClick={() => {
                    if (!isFront) {
                      setActiveCardIndex(idx);
                    }
                  }}
                  className={`absolute top-0 left-0 w-full h-full glass-premium rounded-[32px] p-4.5 border border-white/10 overflow-hidden flex flex-col justify-between shadow-[0_30px_100px_rgba(0,0,0,0.65)] ${
                    !isFront ? 'cursor-pointer hover:border-gold-accent/40' : ''
                  }`}
                  style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
                >
                  {/* Spotlight glow follows pointer on active card */}
                  {isFront && (
                    <div 
                      className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-30 group-hover:opacity-100"
                      style={{
                        background: `radial-gradient(350px circle at ${glowPos.x}px ${glowPos.y}px, rgba(212, 175, 55, 0.18), transparent 80%)`
                      }}
                    />
                  )}

                  {/* Card Header details */}
                  <div className="flex justify-between items-center z-10">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${isFront ? 'bg-emerald-500 animate-pulse' : 'bg-white/30'}`} />
                      <span className={`text-[10px] uppercase font-black tracking-wider font-sans ${isFront ? 'text-emerald-400' : 'text-white/40'}`}>
                        {card.label || 'DIVISION'}
                      </span>
                    </div>
                    {card.subtitle && (
                      <div className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] text-white/60 font-semibold font-sans">
                        {card.subtitle}
                      </div>
                    )}
                  </div>

                  {/* Media Content - Plays on Front Card, Static cover on Background Cards */}
                  <div className="relative flex-1 my-4.5 rounded-2xl overflow-hidden border border-white/8 group shadow-inner z-10 flex items-center justify-center bg-black">
                    {(() => {
                      if (!isFront) {
                        return (
                          <img 
                            src={getCardPreviewImage(card.mediaUrl)} 
                            alt={card.title} 
                            className="w-full h-full object-cover filter brightness-[0.7] contrast-[1.05]" 
                          />
                        );
                      }

                      // Active front card plays the video
                      const mediaType = getMediaType(card.mediaUrl);
                      if (mediaType === 'youtube') {
                        const ytId = getYouTubeId(card.mediaUrl);
                        return (
                          <iframe
                            src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&playlist=${ytId}&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
                            className="w-full h-full object-cover filter brightness-[0.8] contrast-[1.05] group-hover:scale-105 transition-transform duration-700 pointer-events-none"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            style={{ border: 'none' }}
                          />
                        );
                      } else if (mediaType === 'image') {
                        return (
                          <img
                            src={card.mediaUrl}
                            alt={card.title}
                            className="w-full h-full object-cover filter brightness-[0.8] contrast-[1.05]"
                          />
                        );
                      } else {
                        return (
                          <video 
                            key={card.mediaUrl}
                            src={card.mediaUrl}
                            autoPlay
                            loop
                            muted={isMuted}
                            playsInline
                            preload="auto"
                            className="w-full h-full object-cover filter brightness-[0.8] contrast-[1.05] group-hover:scale-105 transition-transform duration-700"
                          />
                        );
                      }
                    })()}

                    {/* Mute buttons for active card video */}
                    {isFront && (getMediaType(card.mediaUrl) === 'youtube' || getMediaType(card.mediaUrl) === 'video') && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setIsMuted(!isMuted);
                        }}
                        className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-[#050816]/75 hover:bg-[#050816]/95 border border-white/10 hover:border-gold-accent/40 text-white transition-all duration-300 hover:scale-105 cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.5)] flex items-center justify-center"
                        title={isMuted ? "Enable Sound" : "Mute Sound"}
                      >
                        {isMuted ? (
                          <VolumeX className="w-3.5 h-3.5 text-gray-400" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5 text-gold-accent animate-pulse" />
                        )}
                      </button>
                    )}

                    {/* Card play overlay decoration */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050816]/75 via-transparent to-transparent flex items-end p-4 pointer-events-none">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-full text-navy-dark shadow-md ${isFront ? 'bg-gold-accent animate-pulse' : 'bg-white/20'}`}>
                          <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
                        </div>
                        <div className="text-left">
                          <h4 className="text-white text-xs font-bold font-display">{card.title}</h4>
                          <p className="text-[9px] text-[#BFC8E6]/75 font-sans">Click to discover division</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer details */}
                  <div className="flex justify-between items-center text-[10px] font-sans text-[#BFC8E6]/60 border-t border-white/5 pt-3 z-10">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gold-accent" />
                      <span>{card.location || 'Colombo Venue'}</span>
                    </div>
                    {isFront ? (
                      <Link 
                        href={card.link || '#'} 
                        className="text-gold-soft font-bold tracking-wider hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        ENTER DIV →
                      </Link>
                    ) : (
                      <span className="text-white/40 font-semibold">{card.resolution || '1080p HD'}</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Scroll indicator mouse */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10 opacity-60 hover:opacity-90 transition-opacity">
        <div className="w-5.5 h-9.5 rounded-full border border-gold-accent/40 flex justify-center p-1.5 bg-navy-dark/40 backdrop-blur-sm">
          <motion.div 
            animate={{ 
              y: [0, 10, 0],
            }}
            transition={{ 
              duration: 1.6, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="w-1.5 h-1.5 rounded-full bg-gold-accent" 
          />
        </div>
        <span className="text-[8px] uppercase tracking-[0.25em] text-gray-500 font-bold">SCROLL</span>
      </div>

      {/* Golden Wave separator at the bottom of hero */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-10 select-none pointer-events-none">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[60px]">
          <path d="M0,0 C300,100 900,100 1200,0 L1200,120 L0,120 Z" className="fill-[#050816]" />
        </svg>
      </div>

    </section>
  );
}
