'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';

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
  const [phase, setPhase] = useState<number>(0); // 0: Starfield, 1: Trishul & Moon, 2: Silhouette & Waves, 3: Explode, 4: Logo, 5: Fadeout
  const [skipVisible, setSkipVisible] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const droneNodeRef = useRef<OscillatorNode | null>(null);

  // Show skip button after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => setSkipVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Ambient sound synthesizer using Web Audio API
  useEffect(() => {
    if (soundEnabled) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioContextRef.current = ctx;

        // Create a low ambient drone oscillator
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(65.41, ctx.currentTime); // C2 note - deep meditative drone
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(150, ctx.currentTime);
        filter.Q.setValueAtTime(5, ctx.currentTime);

        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 2.0); // Fade in drone

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        droneNodeRef.current = osc;

        // Add a secondary resonance peak for trishul creation
        setTimeout(() => {
          if (ctx.state === 'suspended') return;
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(196.00, ctx.currentTime); // G3 - cosmic harmony
          gain2.gain.setValueAtTime(0, ctx.currentTime);
          gain2.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 1.5);
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.start();
          setTimeout(() => {
            gain2.gain.linearRampToValueAtTime(0, ctx.currentTime + 2);
            setTimeout(() => osc2.stop(), 2000);
          }, 3000);
        }, 2000);

      } catch (err) {
        console.error("Web Audio API failed to initialize", err);
      }
    } else {
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close();
        } catch {}
        audioContextRef.current = null;
      }
    }

    return () => {
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close();
        } catch {}
      }
    };
  }, [soundEnabled]);

  // Main intro timing sequence
  useEffect(() => {
    // Phase transitions
    const timers = [
      setTimeout(() => setPhase(1), 2200), // Form Trishul & Moon
      setTimeout(() => setPhase(2), 5500), // Shiva Silhouette & energy waves
      setTimeout(() => setPhase(3), 8500), // Blow away into cosmic nebula
      setTimeout(() => setPhase(4), 10500), // Re-converge into Mahdev Logo
      setTimeout(() => setPhase(5), 14500), // Complete transition
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (phase === 5) {
      // Trigger homepage fade-in
      setTimeout(() => {
        onComplete();
      }, 800);
    }
  }, [phase, onComplete]);

  // Particle Engine Canvas logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Particle pool
    const particles: Particle[] = [];
    const maxParticles = 1600;

    // Helper functions to generate target coordinates
    const getTrishulPoints = (count: number) => {
      const points: { x: number; y: number; color: string }[] = [];
      const centerX = width / 2;
      const centerY = height / 2 - 20;
      const scale = Math.min(width, height) * 0.35;

      // Handle (vertical shaft)
      const handlePoints = Math.floor(count * 0.3);
      for (let i = 0; i < handlePoints; i++) {
        const py = centerY - scale * 0.5 + (scale * 1.2 * i) / handlePoints;
        points.push({ x: centerX, y: py, color: '#00e5ff' });
      }

      // Middle Prong
      const prongPoints = Math.floor(count * 0.15);
      for (let i = 0; i < prongPoints; i++) {
        const py = centerY - scale * 0.5 - (scale * 0.4 * i) / prongPoints;
        points.push({ x: centerX, y: py, color: '#a855f7' });
      }

      // Left Prong (curved outwards)
      const leftProngPoints = Math.floor(count * 0.2);
      for (let i = 0; i < leftProngPoints; i++) {
        const t = i / leftProngPoints;
        const px = centerX - Math.sin(t * Math.PI) * scale * 0.25 - (t * scale * 0.05);
        const py = centerY - scale * 0.4 - Math.cos(t * Math.PI * 0.4) * scale * 0.25;
        points.push({ x: px, y: py, color: '#00e5ff' });
      }

      // Right Prong (curved outwards)
      const rightProngPoints = Math.floor(count * 0.2);
      for (let i = 0; i < rightProngPoints; i++) {
        const t = i / rightProngPoints;
        const px = centerX + Math.sin(t * Math.PI) * scale * 0.25 + (t * scale * 0.05);
        const py = centerY - scale * 0.4 - Math.cos(t * Math.PI * 0.4) * scale * 0.25;
        points.push({ x: px, y: py, color: '#00e5ff' });
      }

      // Crossbars & details
      const crossbarPoints = Math.floor(count * 0.15);
      for (let i = 0; i < crossbarPoints; i++) {
        const offset = (i - crossbarPoints / 2) * (scale * 0.25 / crossbarPoints);
        points.push({ x: centerX + offset, y: centerY - scale * 0.4, color: '#dfba73' });
        points.push({ x: centerX + offset, y: centerY + scale * 0.1, color: '#dfba73' });
      }

      return points;
    };

    const getMoonPoints = (count: number) => {
      const points: { x: number; y: number; color: string }[] = [];
      const centerX = width / 2 + Math.min(width, height) * 0.18;
      const centerY = height / 2 - Math.min(width, height) * 0.28;
      const radius = Math.min(width, height) * 0.09;

      // Draw crescent moon arc
      for (let i = 0; i < count; i++) {
        const t = -Math.PI * 0.5 + (Math.PI * 1.1 * i) / count;
        // Outer arc
        const ox = centerX + Math.cos(t) * radius;
        const oy = centerY + Math.sin(t) * radius;
        // Inner offset creating crescent shape
        const ix = centerX + Math.cos(t) * radius * 0.65 + radius * 0.32;
        const iy = centerY + Math.sin(t) * radius * 0.7;

        if (i % 2 === 0) {
          points.push({ x: ox, y: oy, color: '#dfba73' });
        } else {
          points.push({ x: ix, y: iy, color: '#ffffff' });
        }
      }
      return points;
    };

    const getLogoPoints = (count: number) => {
      const points: { x: number; y: number; color: string }[] = [];
      const centerX = width / 2;
      const centerY = height / 2 - 30;
      const size = Math.min(width, height) * 0.2;

      // Form huge 'M' shape
      const letterPoints = Math.floor(count * 0.7);
      for (let i = 0; i < letterPoints; i++) {
        const segment = Math.floor((i / letterPoints) * 4);
        const t = (i % (letterPoints / 4)) / (letterPoints / 4);
        let px = centerX;
        let py = centerY;

        if (segment === 0) {
          // Left vertical bar
          px = centerX - size;
          py = centerY + size - t * 2 * size;
        } else if (segment === 1) {
          // Left diagonal going down
          px = centerX - size + t * size;
          py = centerY - size + t * size * 1.2;
        } else if (segment === 2) {
          // Right diagonal going up
          px = centerX + t * size;
          py = centerY + size * 0.2 - t * size * 1.2;
        } else {
          // Right vertical bar
          px = centerX + size;
          py = centerY - size + t * 2 * size;
        }
        points.push({ x: px, y: py, color: '#dfba73' });
      }

      // Add tag lines below
      const textPoints = Math.floor(count * 0.3);
      for (let i = 0; i < textPoints; i++) {
        const t = i / textPoints;
        const px = centerX - size * 1.2 + t * size * 2.4;
        const py = centerY + size * 1.4 + Math.sin(t * Math.PI * 4) * 3;
        points.push({ x: px, y: py, color: '#a855f7' });
      }

      return points;
    };

    // Initialize particles floating randomly in space
    for (let i = 0; i < maxParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        targetX: Math.random() * width,
        targetY: Math.random() * height,
        size: Math.random() * 2 + 1,
        color: `rgba(255, 255, 255, ${Math.random() * 0.6 + 0.2})`,
        alpha: Math.random() * 0.8 + 0.2,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        speed: Math.random() * 0.05 + 0.02,
        friction: 0.96
      });
    }

    // Handles window resizing
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    let frameCount = 0;
    let wavePulse = 0;

    // Primary Canvas Render Loop
    const draw = () => {
      frameCount++;
      ctx.fillStyle = 'rgba(5, 11, 22, 0.2)'; // trail effect for cosmic flow
      ctx.fillRect(0, 0, width, height);

      // Draw subtle nebula clouds in the background
      const nebulaGlow = ctx.createRadialGradient(
        width / 2 + Math.sin(frameCount * 0.005) * 100,
        height / 2 + Math.cos(frameCount * 0.007) * 100,
        10,
        width / 2,
        height / 2,
        Math.min(width, height) * 0.7
      );
      nebulaGlow.addColorStop(0, 'rgba(24, 12, 48, 0.12)');
      nebulaGlow.addColorStop(0.5, 'rgba(8, 28, 48, 0.06)');
      nebulaGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = nebulaGlow;
      ctx.fillRect(0, 0, width, height);

      // Generate points mapping based on current phase
      let targets: { x: number; y: number; color: string }[] = [];
      if (phase === 1 || phase === 2) {
        // Trishul & Moon form
        const trishulCount = Math.floor(maxParticles * 0.8);
        const moonCount = maxParticles - trishulCount;
        targets = [...getTrishulPoints(trishulCount), ...getMoonPoints(moonCount)];
      } else if (phase === 4) {
        // Logo and brand name form
        targets = getLogoPoints(maxParticles);
      }

      // Draw the silhouette of Lord Shiva in Phase 2
      if (phase === 2) {
        ctx.save();
        const shivaGrad = ctx.createRadialGradient(
          width / 2, height / 2 - 30, 20,
          width / 2, height / 2 - 30, Math.min(width, height) * 0.32
        );
        shivaGrad.addColorStop(0, 'rgba(0, 229, 255, 0.22)');
        shivaGrad.addColorStop(0.4, 'rgba(168, 85, 247, 0.07)');
        shivaGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = shivaGrad;
        ctx.beginPath();
        ctx.arc(width / 2, height / 2 - 30, Math.min(width, height) * 0.32, 0, Math.PI * 2);
        ctx.fill();

        // Draw soft silhouetted figure in center
        ctx.fillStyle = 'rgba(5, 11, 22, 0.85)';
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        // Simple mathematical seated posture coordinate outline
        const scX = width / 2;
        const scY = height / 2 + 10;
        const scale = Math.min(width, height) * 0.15;
        // Head
        ctx.arc(scX, scY - scale * 1.5, scale * 0.28, 0, Math.PI * 2);
        // Hair / Jata
        ctx.moveTo(scX - scale * 0.15, scY - scale * 1.78);
        ctx.lineTo(scX, scY - scale * 2.1);
        ctx.lineTo(scX + scale * 0.15, scY - scale * 1.78);
        // Meditative shoulders & torso
        ctx.moveTo(scX, scY - scale * 1.2);
        ctx.bezierCurveTo(scX - scale * 0.8, scY - scale * 1.1, scX - scale * 1.2, scY - scale * 0.3, scX - scale * 1.3, scY + scale * 0.4);
        ctx.lineTo(scX + scale * 1.3, scY + scale * 0.4);
        ctx.bezierCurveTo(scX + scale * 1.2, scY - scale * 0.3, scX + scale * 0.8, scY - scale * 1.1, scX, scY - scale * 1.2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Pulsing energy waves
        wavePulse += 0.015;
        ctx.strokeStyle = `rgba(0, 229, 255, ${Math.max(0, 1 - (wavePulse % 1) * 1.2) * 0.4})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(scX, scY, (wavePulse % 1) * scale * 2.2, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Render, update and morph particles
      for (let i = 0; i < maxParticles; i++) {
        const p = particles[i];

        if (phase === 0) {
          // Floating space stars
          p.x += p.vx;
          p.y += p.vy;
          // Wrap screen bounds
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;
        } else if ((phase === 1 || phase === 2) && targets[i]) {
          // Morph to Trishul and Moon shapes
          const target = targets[i];
          p.x += (target.x - p.x) * p.speed;
          p.y += (target.y - p.y) * p.speed;
          p.color = target.color;
        } else if (phase === 3) {
          // Explosion energy surge
          const dx = p.x - width / 2;
          const dy = p.y - height / 2;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const force = (Math.min(width, height) * 0.2) / (dist + 10);
          p.vx += (dx / (dist + 1)) * force * 1.2 + (Math.random() - 0.5) * 1.5;
          p.vy += (dy / (dist + 1)) * force * 1.2 + (Math.random() - 0.5) * 1.5;

          p.x += p.vx;
          p.y += p.vy;
          p.vx *= p.friction;
          p.vy *= p.friction;
          p.color = `rgba(0, 229, 255, ${p.alpha})`;
        } else if (phase === 4 && targets[i]) {
          // Converge to form Corporate Logo
          const target = targets[i];
          p.x += (target.x - p.x) * (p.speed * 1.4);
          p.y += (target.y - p.y) * (p.speed * 1.4);
          p.color = target.color;
        } else if (phase === 5) {
          // Dissolve away as logo fades
          p.x += p.vx * 2;
          p.y += p.vy * 2;
          p.alpha = Math.max(0, p.alpha - 0.02);
        }

        // Draw particle
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [phase]);

  // Handle immediate Skip Button
  const handleSkip = () => {
    setPhase(5);
    setTimeout(() => {
      onComplete();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-[#050b16] select-none flex flex-col justify-between items-center py-12 px-6">
      {/* Sound & Skip Options */}
      <div className="w-full max-w-7xl flex justify-between items-center relative z-20">
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:border-gold-accent/40 text-gray-400 hover:text-gold-soft transition-all duration-300 bg-navy-dark/40 backdrop-blur-md text-xs font-semibold uppercase tracking-wider"
        >
          {soundEnabled ? (
            <>
              <Volume2 className="w-4 h-4 text-gold-accent" /> Sound On
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4 text-gray-500" /> Ambient Sound
            </>
          )}
        </button>

        {skipVisible && (
          <button
            onClick={handleSkip}
            className="px-6 py-2 rounded-full border border-gold-accent/30 text-gold-soft hover:bg-gold-accent/15 hover:border-gold-accent font-sans text-xs font-bold tracking-widest transition-all duration-300 bg-navy-dark/40 backdrop-blur-md"
          >
            SKIP INTRODUCTION
          </button>
        )}
      </div>

      {/* Main Canvas Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-10 w-full h-full pointer-events-none" />

      {/* Synchronized Centered Title Reveals */}
      <div className="relative z-20 text-center w-full max-w-xl pointer-events-none mt-auto mb-auto">
        <AnimatePresence mode="wait">
          {phase === 0 && (
            <motion.h2
              key="intro-moments"
              initial={{ opacity: 0, y: 30, letterSpacing: '0.1em' }}
              animate={{ opacity: 1, y: 0, letterSpacing: '0.3em' }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 1.2 }}
              className="font-display font-black text-3xl sm:text-5xl text-white uppercase"
            >
              Creating Moments
            </motion.h2>
          )}

          {phase === 1 && (
            <motion.h2
              key="intro-memories"
              initial={{ opacity: 0, y: 30, letterSpacing: '0.1em' }}
              animate={{ opacity: 1, y: 0, letterSpacing: '0.3em' }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 1.2 }}
              className="font-display font-black text-3xl sm:text-5xl text-gradient-cyan uppercase"
            >
              Capturing Memories
            </motion.h2>
          )}

          {phase === 2 && (
            <motion.h2
              key="intro-innovate"
              initial={{ opacity: 0, y: 30, letterSpacing: '0.1em' }}
              animate={{ opacity: 1, y: 0, letterSpacing: '0.3em' }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 1.2 }}
              className="font-display font-black text-3xl sm:text-5xl text-gradient-purple-blue uppercase"
            >
              Delivering Innovation
            </motion.h2>
          )}

          {phase === 4 && (
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
              <p className="text-[10px] sm:text-xs font-sans font-bold tracking-[0.4em] text-white/50 uppercase">
                Welcome to Mahdev Pvt Ltd
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Branding Bar */}
      <div className="w-full text-center relative z-20 text-[9px] font-sans font-bold text-gray-600 tracking-[0.25em] uppercase mt-auto">
        Mahdev Conglomerate © {new Date().getFullYear()}
      </div>
    </div>
  );
}
