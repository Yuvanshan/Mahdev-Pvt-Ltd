import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ActivePage } from '../types';

interface ThreeCanvasProps {
  intensity?: number;
  activePage: ActivePage;
  primaryColor?: string;
  animationMode?: 'multiverse' | 'decoration' | 'photography' | 'it' | 'erp';
}

class HeartCurve extends THREE.Curve<THREE.Vector3> {
  constructor() {
    super();
  }

  getPoint(t: number, optionalTarget?: THREE.Vector3): THREE.Vector3 {
    const point = optionalTarget || new THREE.Vector3();
    const angle = t * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(angle), 3);
    const y = 13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle);
    const z = Math.sin(angle * 4) * 0.7;
    return point.set(x * 0.08, y * 0.08, z * 0.08);
  }
}

export default function ThreeCanvas({
  intensity = 1,
  activePage,
  primaryColor = '#a855f7',
  animationMode = 'multiverse',
}: ThreeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // If reduced motion is enabled, render a static scene (no animation loop).
    const shouldAnimate = !prefersReducedMotion;

    const container = containerRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Parse brand primary color
    const brandColorNum = parseInt(primaryColor.replace('#', '0x'), 16) || 0xa855f7;

    // 1. Create Scene
    const scene = new THREE.Scene();

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = 7.5;

    // 3. Renderer Setup
    const pixelRatio = Math.min(window.devicePixelRatio, 1.5);
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(pixelRatio);
    container.appendChild(renderer.domElement);

    // 4. Lighting System
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.7);
    dirLight1.position.set(5, 8, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
    dirLight2.position.set(-5, -8, -2);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(brandColorNum, 2.5, 12);
    pointLight.position.set(0, 0, 3);
    scene.add(pointLight);

    // 5. Dynamic 3D Groups setup for Category Morphs
    const groupHome = new THREE.Group();
    const groupDecoration = new THREE.Group();
    const groupPhotography = new THREE.Group();
    const groupIt = new THREE.Group();
    const groupErp = new THREE.Group();
    const groupTravels = new THREE.Group();

    scene.add(groupHome);
    scene.add(groupDecoration);
    scene.add(groupPhotography);
    scene.add(groupIt);
    scene.add(groupErp);
    scene.add(groupTravels);

    // --- Geometries and Meshes Generation ---

    // A. HOME: Translucent floating TorusKnot with wireframe overlay
    const homeTorusKnotGeom = new THREE.TorusKnotGeometry(1.2, 0.35, 120, 16, 2, 3);
    const homeGlassMat = new THREE.MeshPhysicalMaterial({
      color: brandColorNum,
      transparent: true,
      opacity: 0.22,
      roughness: 0.15,
      metalness: 0.1,
      transmission: 0.85,
      ior: 1.45,
      thickness: 0.8,
    });
    const homeWireframeMat = new THREE.MeshStandardMaterial({
      color: brandColorNum,
      wireframe: true,
      transparent: true,
      opacity: 0.65,
      emissive: brandColorNum,
      emissiveIntensity: 0.45,
    });
    const homeMeshGlass = new THREE.Mesh(homeTorusKnotGeom, homeGlassMat);
    const homeMeshWire = new THREE.Mesh(homeTorusKnotGeom, homeWireframeMat);
    groupHome.add(homeMeshGlass);
    groupHome.add(homeMeshWire);

    // B. DECORATION: Parametric Golden Hearts/Wedding Rings
    const heartCurve = new HeartCurve();
    const heartGeom = new THREE.TubeGeometry(heartCurve, 80, 0.07, 8, true);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.95,
      roughness: 0.12,
      emissive: 0x3d2c00,
    });
    const heartMesh = new THREE.Mesh(heartGeom, goldMat);
    heartMesh.position.set(-0.2, 0.2, 0);
    groupDecoration.add(heartMesh);

    const ringGeom = new THREE.TorusGeometry(0.75, 0.06, 12, 48);
    const roseGoldMat = new THREE.MeshStandardMaterial({
      color: 0xb76e79, // Rose Gold
      metalness: 0.95,
      roughness: 0.08,
      emissive: 0x2b1014,
    });
    const decoRing1 = new THREE.Mesh(ringGeom, roseGoldMat);
    decoRing1.position.set(0.5, -0.4, 0.3);
    decoRing1.rotation.set(Math.PI / 4, Math.PI / 6, 0);
    groupDecoration.add(decoRing1);

    // C. PHOTOGRAPHY: Camera Aperture blades diaphragm with glass lens barrel
    const lensBarrelGeom = new THREE.TorusGeometry(1.2, 0.09, 16, 64);
    const lensBarrelMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.8, roughness: 0.3 });
    const lensBarrel = new THREE.Mesh(lensBarrelGeom, lensBarrelMat);
    groupPhotography.add(lensBarrel);

    const glassLensGeom = new THREE.CylinderGeometry(1.1, 1.1, 0.1, 32);
    const glassLensMat = new THREE.MeshPhysicalMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.65,
      roughness: 0.05,
      transmission: 0.95,
      ior: 1.6,
    });
    const glassLens = new THREE.Mesh(glassLensGeom, glassLensMat);
    glassLens.rotation.x = Math.PI / 2;
    groupPhotography.add(glassLens);

    const bladeGeom = new THREE.BoxGeometry(0.55, 0.13, 0.01);
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0x0891b2, metalness: 0.9, roughness: 0.15 });
    for (let i = 0; i < 6; i++) {
      const blade = new THREE.Mesh(bladeGeom, bladeMat);
      const angle = (i / 6) * Math.PI * 2;
      blade.position.x = Math.cos(angle) * 0.62;
      blade.position.y = Math.sin(angle) * 0.62;
      blade.rotation.z = angle + 0.45;
      groupPhotography.add(blade);
    }

    // D. IT SOLUTIONS: Neural connection network nodes and links
    const itNodeCount = 22;
    const itNodePositions: THREE.Vector3[] = [];
    const nodeGeom = new THREE.SphereGeometry(0.045, 8, 8);
    const nodeMat = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      emissive: 0x3b82f6,
      emissiveIntensity: 0.9,
    });

    for (let i = 0; i < itNodeCount; i++) {
      const pos = new THREE.Vector3(
        (Math.random() - 0.5) * 3.2,
        (Math.random() - 0.5) * 3.2,
        (Math.random() - 0.5) * 3.2
      );
      itNodePositions.push(pos);
      const nodeMesh = new THREE.Mesh(nodeGeom, nodeMat);
      nodeMesh.position.copy(pos);
      groupIt.add(nodeMesh);
    }

    const itLinePoints: THREE.Vector3[] = [];
    for (let i = 0; i < itNodeCount; i++) {
      for (let j = i + 1; j < itNodeCount; j++) {
        if (itNodePositions[i].distanceTo(itNodePositions[j]) < 1.35) {
          itLinePoints.push(itNodePositions[i], itNodePositions[j]);
        }
      }
    }
    const itLineGeom = new THREE.BufferGeometry().setFromPoints(itLinePoints);
    const itLineMat = new THREE.LineBasicMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.55,
    });
    const itConnections = new THREE.LineSegments(itLineGeom, itLineMat);
    groupIt.add(itConnections);

    // E. ERP SOLUTIONS: Dodecahedron wireframe with orbiting data nodes
    const erpCoreGeom = new THREE.IcosahedronGeometry(0.85, 1);
    const erpCoreMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      wireframe: true,
      emissive: 0x10b981,
      emissiveIntensity: 0.7,
    });
    const erpCore = new THREE.Mesh(erpCoreGeom, erpCoreMat);
    groupErp.add(erpCore);

    const erpRingGeom = new THREE.TorusGeometry(1.25, 0.015, 6, 64);
    const erpRingMat = new THREE.MeshStandardMaterial({ color: 0x059669, transparent: true, opacity: 0.5 });
    const erpRing1 = new THREE.Mesh(erpRingGeom, erpRingMat);
    erpRing1.rotation.x = Math.PI / 2;
    groupErp.add(erpRing1);

    const erpRing2 = new THREE.Mesh(erpRingGeom, erpRingMat);
    erpRing2.rotation.y = Math.PI / 2;
    groupErp.add(erpRing2);

    const cubeGeom = new THREE.BoxGeometry(0.12, 0.12, 0.12);
    const cubeMat = new THREE.MeshStandardMaterial({ color: 0x34d399, metalness: 0.9, roughness: 0.1 });
    const erpCubes: THREE.Mesh[] = [];
    for (let i = 0; i < 3; i++) {
      const cube = new THREE.Mesh(cubeGeom, cubeMat);
      groupErp.add(cube);
      erpCubes.push(cube);
    }

    // F. TRAVELS: Latitude/Longitude Globe with tilted orbit satellite
    const travelsGlobeGeom = new THREE.SphereGeometry(0.95, 16, 16);
    const travelsGlobeMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      wireframe: true,
      emissive: 0xd97706,
      emissiveIntensity: 0.55,
    });
    const travelsGlobe = new THREE.Mesh(travelsGlobeGeom, travelsGlobeMat);
    groupTravels.add(travelsGlobe);

    const travelOrbitGeom = new THREE.TorusGeometry(1.4, 0.015, 6, 64);
    const travelOrbitMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.45 });
    const travelOrbit = new THREE.Mesh(travelOrbitGeom, travelOrbitMat);
    travelOrbit.rotation.x = Math.PI / 3;
    travelOrbit.rotation.y = Math.PI / 6;
    groupTravels.add(travelOrbit);

    const satelliteGeom = new THREE.SphereGeometry(0.075, 8, 8);
    const satelliteMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.8, roughness: 0.15 });
    const travelsSatellite = new THREE.Mesh(satelliteGeom, satelliteMat);
    groupTravels.add(travelsSatellite);

    // Initial scale-down to perform entry morph transition
    groupHome.scale.setScalar(0.001);
    groupDecoration.scale.setScalar(0.001);
    groupPhotography.scale.setScalar(0.001);
    groupIt.scale.setScalar(0.001);
    groupErp.scale.setScalar(0.001);
    groupTravels.scale.setScalar(0.001);

    // 6. Ambient Particle System
    const particleCount = Math.floor(110 * intensity);
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const randomSpeeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 16;
      positions[i + 1] = (Math.random() - 0.5) * 16;
      positions[i + 2] = (Math.random() - 0.5) * 12;
      randomSpeeds[i / 3] = 0.45 + Math.random() * 0.55;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

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
      size: 0.16,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      map: createParticleTexture(),
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // 7. Interactivity & Parallax setup
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const onMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth - 0.5) * 1.5;
      mouseY = (event.clientY / window.innerHeight - 0.5) * 1.5;
    };

    window.addEventListener('mousemove', onMouseMove);

    // 8. Mode switching listener logic
    let currentMode: 'home' | 'decoration' | 'photography' | 'erp' | 'it' | 'travels' = 'home';
    const resolveMode = (page: ActivePage) => {
      if (page === ActivePage.Decoration) return 'decoration';
      if (page === ActivePage.Photography) return 'photography';
      if (page === ActivePage.ErpSolutions) return 'erp';
      if (page === ActivePage.ItSolutions) return 'it';
      if (page === ActivePage.Travels) return 'travels';
      return 'home'; // Fallback for Home, Contact, Admin
    };
    currentMode = resolveMode(activePage);

    const handleModeChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.mode) {
        currentMode = customEvent.detail.mode;
      }
    };
    window.addEventListener('mahdev-3d-mode-change', handleModeChange);

    // 9. Resize Handling
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

    // 10. Animation Loop
    let animationFrameId: number | null = null;
    const clock = new THREE.Clock();
    const targetParticleColor = new THREE.Color();
    const targetLightColor = new THREE.Color();

    let isPageHidden = false;
    const onVisibilityChange = () => {
      isPageHidden = document.visibilityState === 'hidden';
      if (isPageHidden && animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      } else if (!isPageHidden && shouldAnimate && !animationFrameId) {
        animate();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    const animate = () => {
      if (!shouldAnimate || isPageHidden) return;
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse follow and Camera movement
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      camera.position.x = targetX * 1.8;
      camera.position.y = -targetY * 1.8;
      camera.lookAt(0, 0, 0);

      // Spot light moves around cursor to cast interactive specular highlights
      pointLight.position.x = mouseX * 5.0;
      pointLight.position.y = -mouseY * 5.0;

      // Category specific lights and particle colors
      let activeColor = brandColorNum;
      let activeSize = 0.18;

      if (currentMode === 'decoration') {
        activeColor = 0xd4af37;
        activeSize = 0.22;
      } else if (currentMode === 'photography') {
        activeColor = 0x06b6d4;
        activeSize = 0.35;
      } else if (currentMode === 'erp') {
        activeColor = 0x10b981;
        activeSize = 0.14;
      } else if (currentMode === 'it') {
        activeColor = 0x3b82f6;
        activeSize = 0.2;
      } else if (currentMode === 'travels') {
        activeColor = 0xf59e0b;
        activeSize = 0.25;
      }

      targetParticleColor.setHex(activeColor);
      targetLightColor.setHex(activeColor);
      particleMaterial.color.lerp(targetParticleColor, 0.05);
      pointLight.color.lerp(targetLightColor, 0.05);
      particleMaterial.size += (activeSize - particleMaterial.size) * 0.05;

      // Group visibility checking to bypass draw calls on completely hidden meshes
      const checkVisibility = (grp: THREE.Group, isActive: boolean) => {
        if (isActive) {
          grp.visible = true;
        } else if (grp.scale.x < 0.015) {
          grp.visible = false;
        }
      };

      checkVisibility(groupHome, currentMode === 'home');
      checkVisibility(groupDecoration, currentMode === 'decoration');
      checkVisibility(groupPhotography, currentMode === 'photography');
      checkVisibility(groupIt, currentMode === 'it');
      checkVisibility(groupErp, currentMode === 'erp');
      checkVisibility(groupTravels, currentMode === 'travels');

      // Seamless category mesh transitions (scaling and flying/receding along Z-axis)
      const lerpSpeed = 0.07;
      const inactiveZ = -4.5;

      const scaleActive = new THREE.Vector3(1, 1, 1);
      const scaleInactive = new THREE.Vector3(0.001, 0.001, 0.001);

      // Home
      groupHome.scale.lerp(currentMode === 'home' ? scaleActive : scaleInactive, lerpSpeed);
      groupHome.position.z += ((currentMode === 'home' ? 0 : inactiveZ) - groupHome.position.z) * lerpSpeed;
      if (groupHome.visible) {
        groupHome.rotation.y = elapsedTime * 0.16 + targetX * 0.3;
        groupHome.rotation.x = elapsedTime * 0.08 - targetY * 0.3;
      }

      // Decoration
      groupDecoration.scale.lerp(currentMode === 'decoration' ? scaleActive : scaleInactive, lerpSpeed);
      groupDecoration.position.z += ((currentMode === 'decoration' ? 0 : inactiveZ) - groupDecoration.position.z) * lerpSpeed;
      if (groupDecoration.visible) {
        groupDecoration.rotation.y = elapsedTime * 0.12 + targetX * 0.4;
        groupDecoration.rotation.x = Math.sin(elapsedTime * 0.4) * 0.15 - targetY * 0.2;
      }

      // Photography
      groupPhotography.scale.lerp(currentMode === 'photography' ? scaleActive : scaleInactive, lerpSpeed);
      groupPhotography.position.z += ((currentMode === 'photography' ? 0 : inactiveZ) - groupPhotography.position.z) * lerpSpeed;
      if (groupPhotography.visible) {
        groupPhotography.rotation.z = elapsedTime * 0.2 + targetX * 0.5;
        groupPhotography.rotation.y = elapsedTime * 0.08 - targetY * 0.3;
      }

      // IT
      groupIt.scale.lerp(currentMode === 'it' ? scaleActive : scaleInactive, lerpSpeed);
      groupIt.position.z += ((currentMode === 'it' ? 0 : inactiveZ) - groupIt.position.z) * lerpSpeed;
      if (groupIt.visible) {
        groupIt.rotation.y = elapsedTime * 0.07 + targetX * 0.2;
        groupIt.rotation.x = elapsedTime * 0.04 - targetY * 0.2;
      }

      // ERP
      groupErp.scale.lerp(currentMode === 'erp' ? scaleActive : scaleInactive, lerpSpeed);
      groupErp.position.z += ((currentMode === 'erp' ? 0 : inactiveZ) - groupErp.position.z) * lerpSpeed;
      if (groupErp.visible) {
        erpCore.rotation.y = -elapsedTime * 0.18;
        erpRing1.rotation.y = elapsedTime * 0.12 + targetX * 0.3;
        erpRing2.rotation.x = elapsedTime * 0.08 - targetY * 0.3;
        erpCubes.forEach((cube, idx) => {
          const phi = (idx / 3) * Math.PI * 2 + elapsedTime * 0.45;
          cube.position.x = Math.cos(phi) * 1.25;
          cube.position.z = Math.sin(phi) * 1.25;
          cube.position.y = Math.sin(phi * 2) * 0.35;
          cube.rotation.x = elapsedTime * 0.8;
          cube.rotation.y = elapsedTime * 0.4;
        });
      }

      // Travels
      groupTravels.scale.lerp(currentMode === 'travels' ? scaleActive : scaleInactive, lerpSpeed);
      groupTravels.position.z += ((currentMode === 'travels' ? 0 : inactiveZ) - groupTravels.position.z) * lerpSpeed;
      if (groupTravels.visible) {
        travelsGlobe.rotation.y = elapsedTime * 0.08 + targetX * 0.35;
        travelOrbit.rotation.z = -elapsedTime * 0.04;
        const satAngle = elapsedTime * 0.55;
        travelsSatellite.position.x = Math.cos(satAngle) * 1.35;
        travelsSatellite.position.z = Math.sin(satAngle) * 1.35;
        travelsSatellite.position.y = Math.sin(satAngle) * 0.65;
        travelsSatellite.rotation.y = elapsedTime * 0.5;
      }

      // Particle Physics
      const positionsArray = particleGeometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount * 3; i += 3) {
        const idx = i / 3;
        const speed = randomSpeeds[idx];

        if (currentMode === 'decoration') {
          positionsArray[i + 1] += 0.004 * speed;
          positionsArray[i] += Math.sin(elapsedTime * 0.8 + idx) * 0.003;
          if (positionsArray[i + 1] > 8.0) {
            positionsArray[i + 1] = -8.0;
            positionsArray[i] = (Math.random() - 0.5) * 16;
          }
        } else if (currentMode === 'photography') {
          positionsArray[i + 1] -= 0.0025 * speed;
          positionsArray[i] += Math.cos(elapsedTime * 0.5 + idx) * 0.002;
          if (positionsArray[i + 1] < -8.0) {
            positionsArray[i + 1] = 8.0;
            positionsArray[i] = (Math.random() - 0.5) * 16;
          }
        } else if (currentMode === 'erp') {
          positionsArray[i + 1] += 0.009 * speed;
          positionsArray[i] += Math.sin(elapsedTime * 0.3 + idx) * 0.001;
          if (positionsArray[i + 1] > 8.0) {
            positionsArray[i + 1] = -8.0;
            positionsArray[i] = (Math.random() - 0.5) * 16;
          }
        } else if (currentMode === 'it') {
          positionsArray[i] -= 0.012 * speed;
          positionsArray[i + 1] += Math.sin(elapsedTime * 1.2 + idx) * 0.003;
          if (positionsArray[i] < -8.0) {
            positionsArray[i] = 8.0;
            positionsArray[i + 1] = (Math.random() - 0.5) * 16;
          }
        } else if (currentMode === 'travels') {
          const radius =
            Math.sqrt(
              positionsArray[i] * positionsArray[i] + positionsArray[i + 2] * positionsArray[i + 2]
            ) || 3;
          const angle =
            Math.atan2(positionsArray[i + 2], positionsArray[i]) + 0.0025 * speed;
          positionsArray[i] = Math.cos(angle) * radius;
          positionsArray[i + 2] = Math.sin(angle) * radius;
          positionsArray[i + 1] += Math.sin(elapsedTime * 0.5 + idx) * 0.002;
        } else {
          // Default Home: gentle floating downward drift
          positionsArray[i + 1] -= 0.0045 * speed;
          positionsArray[i] += Math.sin(elapsedTime * 0.4 + idx) * 0.001;
          if (positionsArray[i + 1] < -8.0) {
            positionsArray[i + 1] = 8.0;
            positionsArray[i] = (Math.random() - 0.5) * 16;
          }
        }
      }

      particleGeometry.attributes.position.needsUpdate = true;
      particles.rotation.y = elapsedTime * 0.008 + targetX * 0.05;
      particles.rotation.x = targetY * 0.05;

      renderer.render(scene, camera);
    };

    if (shouldAnimate) animate();
    else renderer.render(scene, camera);

    // 11. Cleanup and disposals on unmount
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mahdev-3d-mode-change', handleModeChange);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      resizeObserver.disconnect();
      if (animationFrameId) cancelAnimationFrame(animationFrameId);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      // Dispose geometries
      homeTorusKnotGeom.dispose();
      heartGeom.dispose();
      ringGeom.dispose();
      lensBarrelGeom.dispose();
      glassLensGeom.dispose();
      bladeGeom.dispose();
      nodeGeom.dispose();
      itLineGeom.dispose();
      erpCoreGeom.dispose();
      erpRingGeom.dispose();
      cubeGeom.dispose();
      travelsGlobeGeom.dispose();
      travelOrbitGeom.dispose();
      satelliteGeom.dispose();
      particleGeometry.dispose();

      // Dispose materials
      homeGlassMat.dispose();
      homeWireframeMat.dispose();
      goldMat.dispose();
      roseGoldMat.dispose();
      lensBarrelMat.dispose();
      glassLensMat.dispose();
      bladeMat.dispose();
      nodeMat.dispose();
      itLineMat.dispose();
      erpCoreMat.dispose();
      erpRingMat.dispose();
      cubeMat.dispose();
      travelsGlobeMat.dispose();
      travelOrbitMat.dispose();
      satelliteMat.dispose();
      particleMaterial.dispose();

      renderer.dispose();
    };
  }, [intensity, primaryColor, activePage, animationMode]);

  return (
    <div
      id="three-canvas-root"
      ref={containerRef}
      className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden z-0"
    />
  );
}
