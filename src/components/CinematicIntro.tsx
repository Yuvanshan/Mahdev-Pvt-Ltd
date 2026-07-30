'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, SkipForward } from 'lucide-react';

interface Particle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  size: number;
  color: string;
  alpha: number;
  vx: number;
  vy: number;
  speed: number;
  friction: number;
}

export default function CinematicIntro({ onComplete }: { onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<number>(0); 
  // 0: Awakening, 1: Trishul Forge, 2: Flight Space, 3: Flight Mountain, 4: Flight Ocean, 5: Flight Fire, 6: Divine Aura & Shiva Silhouette, 7: Palm Landing & Shockwave, 8: Logo Morph, 9: Complete Fadeout
  
  const [skipVisible, setSkipVisible] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const windNodeRef = useRef<GainNode | null>(null);
  const droneNodeRef = useRef<OscillatorNode | null>(null);

  // Check if returning visitor to play shorter logo animation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isReturning = localStorage.getItem('mahdev_returning_user');
      if (isReturning === 'true') {
        // Trigger shorter logo morph phase directly
        setPhase(8);
      }
    }
    const timer = setTimeout(() => setSkipVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Web Audio Synthesizer
  const initAudio = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      // Deep meditative space drone oscillator chord
      const osc = ctx.createOscillator();
      const oscHarmonic = ctx.createOscillator();
      const droneGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(65.41, ctx.currentTime); // C2 drone
      oscHarmonic.type = 'sine';
      oscHarmonic.frequency.setValueAtTime(98.00, ctx.currentTime); // G2 fifth chord

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(100, ctx.currentTime);

      droneGain.gain.setValueAtTime(0.001, ctx.currentTime);
      droneGain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 3.0);

      osc.connect(filter);
      oscHarmonic.connect(filter);
      filter.connect(droneGain);
      droneGain.connect(ctx.destination);

      osc.start();
      oscHarmonic.start();
      droneNodeRef.current = osc;

      // Space wind noise synthesis
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Simple lowpass pinkish noise approximation
        data[i] = 0.95 * lastOut + white * 0.05;
        data[i] *= 0.15;
        lastOut = data[i];
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      const windFilter = ctx.createBiquadFilter();
      windFilter.type = 'bandpass';
      windFilter.frequency.setValueAtTime(300, ctx.currentTime);
      windFilter.Q.setValueAtTime(2.0, ctx.currentTime);

      const windGain = ctx.createGain();
      windGain.gain.setValueAtTime(0.001, ctx.currentTime);
      windGain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 2.0);

      noiseSource.connect(windFilter);
      windFilter.connect(windGain);
      windGain.connect(ctx.destination);
      noiseSource.start();
      windNodeRef.current = windGain;

    } catch (err) {
      console.warn("Audio Context blocked or unsupported", err);
    }
  };

  const triggerThunder = () => {
    const ctx = audioCtxRef.current;
    if (!ctx || ctx.state === 'suspended') return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(50, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(25, ctx.currentTime + 2.0);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(90, ctx.currentTime);

      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.0);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      setTimeout(() => osc.stop(), 2100);
    } catch {}
  };

  const triggerSparkSound = () => {
    const ctx = audioCtxRef.current;
    if (!ctx || ctx.state === 'suspended') return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2000, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      setTimeout(() => osc.stop(), 150);
    } catch {}
  };

  // Sound toggling control
  useEffect(() => {
    if (soundEnabled) {
      if (!audioCtxRef.current) {
        initAudio();
      } else if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
    } else {
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close();
        } catch {}
        audioCtxRef.current = null;
      }
    }
    return () => {
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close();
        } catch {}
      }
    };
  }, [soundEnabled]);

  // Hollywood timing sequence for 8 scenes (0s - 17s)
  useEffect(() => {
    // If returning user, skip long cinematic timeline
    if (typeof window !== 'undefined' && localStorage.getItem('mahdev_returning_user') === 'true') {
      const timer = setTimeout(() => setPhase(9), 3000);
      return () => clearTimeout(timer);
    }

    const timers = [
      setTimeout(() => { setPhase(1); triggerThunder(); }, 2200),  // Scene 2: Trishul Forge
      setTimeout(() => { setPhase(2); }, 4500),  // Scene 3A: Flight Space
      setTimeout(() => { setPhase(3); }, 5800),  // Scene 3B: Flight Mountain
      setTimeout(() => { setPhase(4); }, 7000),  // Scene 3C: Flight Ocean
      setTimeout(() => { setPhase(5); }, 8200),  // Scene 3D: Flight Fire
      setTimeout(() => { setPhase(6); }, 9500),  // Scene 4/5: Shiva Silhouette
      setTimeout(() => { setPhase(7); triggerThunder(); }, 12000), // Scene 6: Palm Landing & Shockwave
      setTimeout(() => { setPhase(8); }, 14500), // Scene 7: Logo Morph
      setTimeout(() => { setPhase(9); }, 17500), // Scene 8: Seamless Fadeout
    ];

    return () => timers.forEach(clearTimeout);
  }, [soundEnabled]);

  useEffect(() => {
    if (phase === 9) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('mahdev_returning_user', 'true');
      }
      onComplete();
    }
  }, [phase, onComplete]);

  // Canvas render engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Performance adaptation check (cap particles on mobile devices)
    const isMobile = width < 768;
    const maxParticles = isMobile ? 480 : 1600;

    const particles: Particle[] = [];

    const getTrishulPoints = (count: number) => {
      const points: { x: number; y: number; color: string }[] = [];
      const centerX = width / 2;
      const centerY = height / 2 - 20;
      const scale = Math.min(width, height) * (isMobile ? 0.28 : 0.35);

      // Shaft
      const shaft = Math.floor(count * 0.35);
      for (let i = 0; i < shaft; i++) {
        points.push({ x: centerX, y: centerY - scale * 0.4 + (scale * 1.1 * i) / shaft, color: '#00e5ff' });
      }
      // Middle prong
      const middle = Math.floor(count * 0.15);
      for (let i = 0; i < middle; i++) {
        points.push({ x: centerX, y: centerY - scale * 0.4 - (scale * 0.35 * i) / middle, color: '#dfba73' });
      }
      // Left curves
      const left = Math.floor(count * 0.2);
      for (let i = 0; i < left; i++) {
        const t = i / left;
        const px = centerX - Math.sin(t * Math.PI) * scale * 0.22 - t * scale * 0.04;
        const py = centerY - scale * 0.32 - Math.cos(t * Math.PI * 0.4) * scale * 0.22;
        points.push({ x: px, y: py, color: '#00e5ff' });
      }
      // Right curves
      const right = Math.floor(count * 0.2);
      for (let i = 0; i < right; i++) {
        const t = i / right;
        const px = centerX + Math.sin(t * Math.PI) * scale * 0.22 + t * scale * 0.04;
        const py = centerY - scale * 0.32 - Math.cos(t * Math.PI * 0.4) * scale * 0.22;
        points.push({ x: px, y: py, color: '#00e5ff' });
      }
      return points;
    };

    const getLogoPoints = (count: number) => {
      const points: { x: number; y: number; color: string }[] = [];
      const centerX = width / 2;
      const centerY = height / 2 - 20;
      const size = Math.min(width, height) * (isMobile ? 0.15 : 0.2);

      // Corporate 'M'
      const letter = Math.floor(count * 0.7);
      for (let i = 0; i < letter; i++) {
        const segment = Math.floor((i / letter) * 4);
        const t = (i % (letter / 4)) / (letter / 4);
        let px = centerX;
        let py = centerY;

        if (segment === 0) {
          px = centerX - size;
          py = centerY + size - t * 2 * size;
        } else if (segment === 1) {
          px = centerX - size + t * size;
          py = centerY - size + t * size * 1.2;
        } else if (segment === 2) {
          px = centerX + t * size;
          py = centerY - size * 0.2 - t * size * 1.2;
        } else {
          px = centerX + size;
          py = centerY - size + t * 2 * size;
        }
        points.push({ x: px, y: py, color: '#dfba73' });
      }

      // Tagline string arcs
      const tag = count - letter;
      for (let i = 0; i < tag; i++) {
        const t = i / tag;
        const px = centerX - size * 1.2 + t * size * 2.4;
        const py = centerY + size * 1.45;
        points.push({ x: px, y: py, color: '#a855f7' });
      }
      return points;
    };

    // Initialize particles floating in space
    for (let i = 0; i < maxParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        targetX: Math.random() * width,
        targetY: Math.random() * height,
        size: Math.random() * 2 + 0.8,
        color: `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.1})`,
        alpha: Math.random() * 0.7 + 0.3,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        speed: Math.random() * 0.05 + 0.02,
        friction: 0.96
      });
    }

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    let frame = 0;
    let wavePulse = 0;
    let animId: number;

    const render = () => {
      frame++;
      // Black fade-out trails
      ctx.fillStyle = 'rgba(5, 11, 22, 0.18)';
      ctx.fillRect(0, 0, width, height);

      // 1. Cosmic Awakening Fog overlays
      if (phase === 0 || phase === 1) {
        const fog = ctx.createRadialGradient(width/2, height/2, 10, width/2, height/2, Math.max(width, height)*0.5);
        fog.addColorStop(0, 'rgba(12, 28, 64, 0.15)');
        fog.addColorStop(0.6, 'rgba(88, 28, 135, 0.05)');
        fog.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = fog;
        ctx.fillRect(0, 0, width, height);
      }

      // 2. Flight Mountain environment contour lines in Phase 3
      if (phase === 3) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        // Left peak
        ctx.moveTo(0, height * 0.8);
        ctx.lineTo(width * 0.3, height * 0.45);
        ctx.lineTo(width * 0.6, height * 0.85);
        // Right peak
        ctx.moveTo(width * 0.4, height * 0.85);
        ctx.lineTo(width * 0.75, height * 0.5);
        ctx.lineTo(width, height * 0.8);
        ctx.stroke();
      }

      // 3. Flight Ocean waves curves in Phase 4
      if (phase === 4) {
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.12)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let x = 0; x < width; x += 15) {
          const y = height * 0.82 + Math.sin(x * 0.008 + frame * 0.08) * 18;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // 4. Flight Fire sparks overlays in Phase 5
      if (phase === 5 && Math.random() < 0.15) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.6)';
        ctx.beginPath();
        ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 3 + 1, 0, Math.PI * 2);
        ctx.fill();
      }

      // 5. Shiva silhouette, Ganga light rays, crescent moon in Phase 6/7
      if (phase === 6 || phase === 7) {
        const scX = width / 2;
        const scY = height / 2 + 15;
        const scale = Math.min(width, height) * (isMobile ? 0.13 : 0.16);

        // Meditative breathe rhythm
        const breathe = 1 + Math.sin(frame * 0.03) * 0.015;

        // Radial glowing aura
        const aura = ctx.createRadialGradient(scX, scY - scale * 1.4, 10, scX, scY - scale * 1.4, scale * 3.0 * breathe);
        aura.addColorStop(0, 'rgba(0, 229, 255, 0.22)');
        aura.addColorStop(0.6, 'rgba(168, 85, 247, 0.05)');
        aura.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(scX, scY - scale * 1.4, scale * 3.0 * breathe, 0, Math.PI * 2);
        ctx.fill();

        // Outline seated silhouette
        ctx.fillStyle = 'rgba(5, 11, 22, 0.88)';
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.25)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        
        // Seated triangle pose
        ctx.arc(scX, scY - scale * 1.5, scale * 0.26 * breathe, 0, Math.PI * 2); // head
        ctx.moveTo(scX - scale * 0.15, scY - scale * 1.76);
        ctx.lineTo(scX, scY - scale * 2.05 * breathe); // Jata top
        ctx.lineTo(scX + scale * 0.15, scY - scale * 1.76);

        // Flowing hair lines
        ctx.moveTo(scX - scale * 0.1, scY - scale * 1.55);
        ctx.bezierCurveTo(
          scX - scale * 0.75 + Math.sin(frame * 0.04) * 12, scY - scale * 1.35,
          scX - scale * 1.1 + Math.cos(frame * 0.03) * 15, scY - scale * 0.5,
          scX - scale * 1.4, scY + scale * 0.5
        );
        ctx.moveTo(scX + scale * 0.1, scY - scale * 1.55);
        ctx.bezierCurveTo(
          scX + scale * 0.8 - Math.sin(frame * 0.04) * 12, scY - scale * 1.35,
          scX + scale * 1.1 - Math.cos(frame * 0.03) * 15, scY - scale * 0.5,
          scX + scale * 1.4, scY + scale * 0.5
        );

        // Torso shoulders
        ctx.moveTo(scX, scY - scale * 1.1);
        ctx.bezierCurveTo(scX - scale * 0.75 * breathe, scY - scale * 1.0, scX - scale * 1.25, scY + scale * 0.3, scX - scale * 1.35, scY + scale * 0.5);
        ctx.lineTo(scX + scale * 1.35, scY + scale * 0.5);
        ctx.bezierCurveTo(scX + scale * 1.25, scY + scale * 0.3, scX + scale * 0.75 * breathe, scY - scale * 1.0, scX, scY - scale * 1.1);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Ganga light arc
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
        ctx.beginPath();
        ctx.moveTo(scX, scY - scale * 2.05);
        ctx.bezierCurveTo(scX + Math.sin(frame * 0.07) * 8, scY - scale * 2.2, scX + 20, scY - scale * 2.4, scX + 35, scY - scale * 2.6);
        ctx.stroke();
      }

      // Palm landing shockwave expanding circle in Phase 7
      if (phase === 7) {
        wavePulse += 0.018;
        ctx.strokeStyle = `rgba(0, 229, 255, ${Math.max(0, 1 - wavePulse) * 0.6})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, wavePulse * Math.max(width, height) * 0.8, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Retrieve targets mappings
      let targets: { x: number; y: number; color: string }[] = [];
      if (phase === 1 || phase === 6 || phase === 7) {
        // Trishul forms
        targets = getTrishulPoints(maxParticles);
      } else if (phase === 8) {
        // Logo forms
        targets = getLogoPoints(maxParticles);
      }

      // Render, update, and morph particles
      for (let i = 0; i < maxParticles; i++) {
        const p = particles[i];

        if (phase === 0 || phase === 2 || phase === 3 || phase === 4 || phase === 5) {
          // Floating stars/space flight motion
          const multiplier = phase >= 2 && phase <= 5 ? 4.5 : 1.0;
          p.x += p.vx * multiplier;
          p.y += p.vy * multiplier;
          
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;
        } else if ((phase === 1 || phase === 6 || phase === 7 || phase === 8) && targets[i]) {
          // Morph coordinates
          const target = targets[i];
          p.x += (target.x - p.x) * p.speed;
          p.y += (target.y - p.y) * p.speed;
          p.color = target.color;

          // Forge electric sparks
          if (phase === 1 && Math.random() < 0.0001) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + (Math.random() - 0.5) * 35, p.y + (Math.random() - 0.5) * 35);
            ctx.stroke();
            if (Math.random() < 0.15) triggerSparkSound();
          }
        } else if (phase === 9) {
          // Complete seamless fadeout
          p.x += p.vx * 3.5;
          p.y += p.vy * 3.5;
          p.alpha = Math.max(0, p.alpha - 0.03);
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [phase]);

  const handleSkip = () => {
    setPhase(9);
    setTimeout(() => {
      onComplete();
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-[#21103B] select-none flex flex-col justify-between items-center py-12 px-6">
      {/* sound controls */}
      <div className="w-full max-w-7xl flex justify-between items-center relative z-20">
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:border-gold-accent/40 text-gray-400 hover:text-gold-soft transition-all duration-300 bg-navy-dark/40 backdrop-blur-md text-xs font-semibold uppercase tracking-wider"
        >
          {soundEnabled ? (
            <>
              <Volume2 className="w-4 h-4 text-gold-accent" /> Synthesizer On
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4 text-gray-500" /> Cinematic Sound
            </>
          )}
        </button>

        {skipVisible && (
          <button
            onClick={handleSkip}
            className="px-6 py-2 rounded-full border border-gold-accent/30 text-gold-soft hover:bg-gold-accent/15 hover:border-gold-accent font-sans text-xs font-bold tracking-widest transition-all duration-300 bg-navy-dark/40 backdrop-blur-md flex items-center gap-2"
          >
            SKIP INTRO <SkipForward className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <canvas ref={canvasRef} className="absolute inset-0 z-10 w-full h-full pointer-events-none" />

      {/* Synchronized Centered Title Reveals */}
      <div className="relative z-20 text-center w-full max-w-xl pointer-events-none mt-auto mb-auto">
        <AnimatePresence mode="wait">
          {phase === 0 && (
            <motion.h2
              key="intro-awakening"
              initial={{ opacity: 0, y: 30, letterSpacing: '0.1em' }}
              animate={{ opacity: 1, y: 0, letterSpacing: '0.3em' }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 1.2 }}
              className="font-display font-black text-2xl sm:text-4xl text-white/40 uppercase"
            >
              Cosmic Awakening
            </motion.h2>
          )}

          {phase === 1 && (
            <motion.h2
              key="intro-forge"
              initial={{ opacity: 0, y: 30, letterSpacing: '0.1em' }}
              animate={{ opacity: 1, y: 0, letterSpacing: '0.3em' }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 1.2 }}
              className="font-display font-black text-2xl sm:text-4xl text-gradient-cyan uppercase"
            >
              Trishul Forging
            </motion.h2>
          )}

          {phase >= 2 && phase <= 5 && (
            <motion.h2
              key="intro-flight"
              initial={{ opacity: 0, y: 30, letterSpacing: '0.1em' }}
              animate={{ opacity: 1, y: 0, letterSpacing: '0.3em' }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 1.2 }}
              className="font-display font-black text-3xl sm:text-5xl text-white uppercase"
            >
              {phase === 2 ? 'GALAXY BOUNDS' : phase === 3 ? 'SNOWY MOUNTAINS' : phase === 4 ? 'BLUE WAVE OCEANS' : 'FIRE EXPLOSIONS'}
            </motion.h2>
          )}

          {phase === 6 && (
            <motion.h2
              key="intro-shiva"
              initial={{ opacity: 0, y: 30, letterSpacing: '0.1em' }}
              animate={{ opacity: 1, y: 0, letterSpacing: '0.3em' }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 1.2 }}
              className="font-display font-black text-2xl sm:text-4xl text-gradient-purple-blue uppercase"
            >
              Divine Meditative Presence
            </motion.h2>
          )}

          {phase === 8 && (
            <motion.div
              key="intro-logo"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 1.5 }}
              className="flex flex-col items-center gap-3"
            >
              <h1 className="font-display font-black text-5xl sm:text-7xl text-gradient-gold tracking-[0.25em] uppercase">
                MAHDEV
              </h1>
              <p className="text-[10px] sm:text-xs font-sans font-bold tracking-[0.4em] text-white/50 uppercase mt-2">
                Creating Moments • Capturing Memories • Delivering Innovation
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="w-full text-center relative z-20 text-[9px] font-sans font-bold text-gray-600 tracking-[0.25em] uppercase mt-auto">
        Mahdev Conglomerate © {new Date().getFullYear()}
      </div>
    </div>
  );
}
