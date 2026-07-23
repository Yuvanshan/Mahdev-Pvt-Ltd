import React, { useRef } from 'react';
import { motion, useInView, useScroll, useTransform, useSpring } from 'motion/react';

interface RevealSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  yOffset?: number;
  parallaxSpeed?: number;
  scaleOffset?: number;
  rotateOffset?: number;
}

export default function RevealSection({
  children,
  className = '',
  delay = 0,
  yOffset = 40,
  parallaxSpeed = 25,
  scaleOffset = 1,
  rotateOffset = 0
}: RevealSectionProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  // Trigger once when 10% of the section is visible
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Calculate dynamic scroll-based vertical offset
  const yRange = useTransform(scrollYProgress, [0, 1], [parallaxSpeed, -parallaxSpeed]);
  const smoothParallaxY = useSpring(yRange, { stiffness: 80, damping: 22 });

  return (
    <motion.div
      ref={ref}
      initial={{ 
        opacity: 0, 
        y: yOffset,
        scale: scaleOffset,
        rotate: rotateOffset
      }}
      animate={isInView ? { 
        opacity: 1, 
        y: 0,
        scale: 1,
        rotate: 0
      } : { 
        opacity: 0, 
        y: yOffset,
        scale: scaleOffset,
        rotate: rotateOffset
      }}
      transition={{ 
        duration: 0.85, 
        delay, 
        ease: [0.16, 1, 0.3, 1] 
      }}
      className={className}
    >
      <motion.div style={{ y: smoothParallaxY }} className="w-full h-full">
        {children}
      </motion.div>
    </motion.div>
  );
}
