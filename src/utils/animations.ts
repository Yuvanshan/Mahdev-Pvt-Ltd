/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Animation Utilities - Smooth, Modern Transitions
 * Provides reusable animation configurations for motion components
 */

export const animations = {
  // Page transitions
  pageEnter: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.4, ease: 'easeInOut' }
  },

  // Fade in/out
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 }
  },

  // Slide from right (mobile menu)
  slideInRight: {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '100%', opacity: 0 },
    transition: { type: 'spring', damping: 28, stiffness: 240 }
  },

  // Slide from left
  slideInLeft: {
    initial: { x: '-100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 0 },
    transition: { type: 'spring', damping: 28, stiffness: 240 }
  },

  // Scale up appearance
  scaleIn: {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.95, opacity: 0 },
    transition: { duration: 0.25, ease: 'easeOut' }
  },

  // Smooth accordion expand
  expandCollapse: {
    initial: { height: 0, opacity: 0 },
    animate: { height: 'auto', opacity: 1 },
    exit: { height: 0, opacity: 0 },
    transition: { duration: 0.25, ease: 'easeInOut' }
  },

  // Carousel item scroll
  carouselItem: {
    initial: { x: 50, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { duration: 0.3, staggerChildren: 0.05 }
  },

  // Stagger container
  staggerContainer: {
    animate: {
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  },

  // Stagger item
  staggerItem: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  },

  // Hover lift effect
  hoverLift: {
    whileHover: { y: -8, transition: { duration: 0.2 } },
    whileTap: { y: -4 }
  },

  // Pulse animation
  pulse: {
    animate: {
      scale: [1, 1.05, 1],
      transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
    }
  },

  // Smooth scroll to section
  scrollToTop: {
    behavior: 'smooth' as const,
    block: 'start' as const
  }
};

// CSS-in-JS animation keyframes for styled-components or direct CSS
export const keyframeAnimations = `
  @keyframes floating {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }

  @keyframes float-balloon {
    0% { transform: translateY(110vh) translateX(0) scale(0.8); opacity: 0; }
    15% { opacity: 0.8; }
    85% { opacity: 0.8; }
    100% { transform: translateY(-100px) translateX(40px) scale(1.2); opacity: 0; }
  }

  @keyframes scanner-sweep {
    0%, 100% { top: 0%; opacity: 0.2; }
    50% { top: 100%; opacity: 0.9; }
  }

  @keyframes shimmer {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
  }

  @keyframes glow-pulse {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
  }

  @keyframes slide-up {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes bounce-gentle {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
  }

  @keyframes rotate-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .animate-floating {
    animation: floating 6s ease-in-out infinite;
  }

  .animate-float-balloon-1 {
    animation: float-balloon 12s linear infinite;
  }

  .animate-float-balloon-2 {
    animation: float-balloon 14s linear infinite 3s;
  }

  .animate-float-balloon-3 {
    animation: float-balloon 16s linear infinite 6s;
  }

  .animate-scanner {
    animation: scanner-sweep 3s ease-in-out infinite;
  }

  .animate-shimmer {
    background: linear-gradient(90deg, #f0f0f0 0%, #f9f9f9 50%, #f0f0f0 100%);
    background-size: 1000px 100%;
    animation: shimmer 2s infinite;
  }

  .animate-glow-pulse {
    animation: glow-pulse 2s ease-in-out infinite;
  }

  .animate-slide-up {
    animation: slide-up 0.6s ease-out;
  }

  .animate-fade-in {
    animation: fade-in 0.5s ease-in-out;
  }

  .animate-bounce-gentle {
    animation: bounce-gentle 2s ease-in-out infinite;
  }

  .animate-rotate-slow {
    animation: rotate-slow 20s linear infinite;
  }
`;

// Responsive breakpoints for animations
export const breakpoints = {
  mobile: 640,
  tablet: 768,
  desktop: 1024
};

// Utility function for scroll animations
export const observerOptions = {
  threshold: 0.1,
  rootMargin: '50px 0px -50px 0px'
};

// Get animation based on device type
export const getResponsiveAnimation = (isMobile: boolean) => {
  return isMobile ? animations.slideInRight : animations.pageEnter;
};
