import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ActivePage } from '../types';

interface ThreeCanvasProps {
  intensity?: number;
  activePage: ActivePage;
  primaryColor?: string;
  animationMode?: 'multiverse' | 'decoration' | 'photography' | 'it' | 'erp';
}

export default function ThreeCanvas({ 
  intensity = 1, 
  activePage, 
  primaryColor = '#a855f7',
  animationMode = 'multiverse' 
}: ThreeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Parse brand primary color
    const brandColorNum = parseInt(primaryColor.replace('#', '0x'), 16) || 0xa855f7;

    // 1. Create Scene
    const scene = new THREE.Scene();

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 8;

    // 3. Optimized Renderer Setup with Alpha (No antialias needed for particles, saves GPU memory)
    const pixelRatio = Math.min(window.devicePixelRatio, 1.5);
    const renderer = new THREE.WebGLRenderer({ 
      antialias: false, 
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(pixelRatio);
    container.appendChild(renderer.domElement);

    // 4. Shared Particle System (using single buffer geometry for optimal performance)
    const particleCount = Math.floor(120 * intensity);
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const randomSpeeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 16;
      positions[i + 1] = (Math.random() - 0.5) * 16;
      positions[i + 2] = (Math.random() - 0.5) * 12;
      randomSpeeds[i / 3] = 0.4 + Math.random() * 0.6;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Shared high-performance soft particle texture
    const createParticleTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 16;
      canvas.height = 16;
      const ctx = canvas.getContext('2d');
      if (!ctx) return new THREE.CanvasTexture(canvas);

      ctx.beginPath();
      ctx.arc(8, 8, 6, 0, Math.PI * 2);
      const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 6);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
      gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.2)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.fill();
      return new THREE.CanvasTexture(canvas);
    };

    const particleMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.2,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      map: createParticleTexture(),
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // 5. Resolve active animation style mode on mount
    let currentMode: 'home' | 'decoration' | 'photography' | 'erp' | 'it' | 'travels' = 'home';
    if (activePage === ActivePage.Decoration) {
      currentMode = 'decoration';
    } else if (activePage === ActivePage.Photography) {
      currentMode = 'photography';
    } else if (activePage === ActivePage.ErpSolutions) {
      currentMode = 'erp';
    } else if (activePage === ActivePage.ItSolutions) {
      currentMode = 'it';
    } else if (activePage === ActivePage.Travels) {
      currentMode = 'travels';
    }

    // Interactive custom events to switch modes on the fly
    const handleModeChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.mode) {
        currentMode = customEvent.detail.mode;
      }
    };
    window.addEventListener('mahdev-3d-mode-change', handleModeChange);

    // 6. Interactivity & Parallax setup
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const onMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth - 0.5) * 1.5;
      mouseY = (event.clientY / window.innerHeight - 0.5) * 1.5;
    };

    window.addEventListener('mousemove', onMouseMove);

    // 7. Responsive ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width || container.clientWidth;
        const h = entry.contentRect.height || container.clientHeight;
        
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    });
    resizeObserver.observe(container);

    // 8. Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();
    const targetParticleColor = new THREE.Color();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse inertia follow
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      // Subtle parallax camera rotation
      camera.position.x = targetX * 1.5;
      camera.position.y = -targetY * 1.5;
      camera.lookAt(0, 0, 0);

      // Define target particle colors based on active mode
      if (currentMode === 'home') {
        targetParticleColor.setHex(brandColorNum);
      } else if (currentMode === 'decoration') {
        targetParticleColor.setHex(0xd4af37);
      } else if (currentMode === 'photography') {
        targetParticleColor.setHex(0x06b6d4);
      } else if (currentMode === 'erp') {
        targetParticleColor.setHex(0x10b981);
      } else if (currentMode === 'it') {
        targetParticleColor.setHex(0x3b82f6);
      } else if (currentMode === 'travels') {
        targetParticleColor.setHex(0xf59e0b);
      }

      // Smooth color morphing for particles
      particleMaterial.color.lerp(targetParticleColor, 0.05);

      // Adjust particle size depending on the mode for variety
      let targetParticleSize = 0.22;
      if (currentMode === 'photography') {
        targetParticleSize = 0.45; // Cinema bokeh bubbles
      } else if (currentMode === 'it') {
        targetParticleSize = 0.28;
      } else if (currentMode === 'erp') {
        targetParticleSize = 0.18;
      } else if (currentMode === 'decoration') {
        targetParticleSize = 0.25;
      } else if (currentMode === 'travels') {
        targetParticleSize = 0.3;
      }
      particleMaterial.size += (targetParticleSize - particleMaterial.size) * 0.05;

      // Mode-specific particle physics behaviors
      const positionsArray = particleGeometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount * 3; i += 3) {
        const idx = i / 3;
        const speed = randomSpeeds[idx];

        if (currentMode === 'decoration') {
          // Warm glowing gold fireflies rising up
          positionsArray[i + 1] += 0.005 * speed;
          positionsArray[i] += Math.sin(elapsedTime * 0.8 + idx) * 0.003;
          if (positionsArray[i + 1] > 8.0) {
            positionsArray[i + 1] = -8.0;
            positionsArray[i] = (Math.random() - 0.5) * 16;
          }
        } else if (currentMode === 'photography') {
          // Cinematic camera bokeh floating downwards
          positionsArray[i + 1] -= 0.002 * speed;
          positionsArray[i] += Math.cos(elapsedTime * 0.5 + idx) * 0.002;
          if (positionsArray[i + 1] < -8.0) {
            positionsArray[i + 1] = 8.0;
            positionsArray[i] = (Math.random() - 0.5) * 16;
          }
        } else if (currentMode === 'erp') {
          // Fast-rising vertical database stream
          positionsArray[i + 1] += 0.012 * speed;
          positionsArray[i] += Math.sin(elapsedTime * 0.3 + idx) * 0.001;
          if (positionsArray[i + 1] > 8.0) {
            positionsArray[i + 1] = -8.0;
            positionsArray[i] = (Math.random() - 0.5) * 16;
          }
        } else if (currentMode === 'it') {
          // Cyber streams flying horizontally
          positionsArray[i] -= 0.014 * speed;
          positionsArray[i + 1] += Math.sin(elapsedTime * 1.2 + idx) * 0.003;
          if (positionsArray[i] < -8.0) {
            positionsArray[i] = 8.0;
            positionsArray[i + 1] = (Math.random() - 0.5) * 16;
          }
        } else if (currentMode === 'travels') {
          // Stardust revolving circularly around center
          const radius = Math.sqrt(positionsArray[i] * positionsArray[i] + positionsArray[i + 2] * positionsArray[i + 2]) || 3;
          const angle = Math.atan2(positionsArray[i + 2], positionsArray[i]) + 0.003 * speed;
          positionsArray[i] = Math.cos(angle) * radius;
          positionsArray[i + 2] = Math.sin(angle) * radius;
          positionsArray[i + 1] += Math.sin(elapsedTime * 0.5 + idx) * 0.002;
        } else {
          // Default magical celestial falling stardust
          positionsArray[i + 1] -= 0.006 * speed;
          positionsArray[i] += Math.sin(elapsedTime * 0.5 + idx) * 0.001;
          if (positionsArray[i + 1] < -8.0) {
            positionsArray[i + 1] = 8.0;
            positionsArray[i] = (Math.random() - 0.5) * 16;
          }
        }
      }
      particleGeometry.attributes.position.needsUpdate = true;

      // Overall dynamic rotators
      particles.rotation.y = elapsedTime * 0.012 + targetX * 0.05;
      particles.rotation.x = targetY * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    // 9. Cleanups and Disposals
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mahdev-3d-mode-change', handleModeChange);
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
      
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      particleGeometry.dispose();
      particleMaterial.dispose();
      renderer.dispose();
    };
  }, [intensity, primaryColor]);

  return (
    <div 
      id="three-canvas-root"
      ref={containerRef} 
      className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden z-0"
    />
  );
}
