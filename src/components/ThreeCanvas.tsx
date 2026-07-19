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
  animationMode = 'multiverse',
}: ThreeCanvasProps) {
  // Return a beautiful, lightweight CSS glow sphere system that changes color based on primaryColor or activePage
  
  // Choose colors based on activePage
  let glowColor = primaryColor;
  if (activePage === ActivePage.Decoration) glowColor = '#ec4899'; // pink
  else if (activePage === ActivePage.Photography) glowColor = '#8b5cf6'; // violet
  else if (activePage === ActivePage.ItSolutions || activePage === ActivePage.ErpSolutions) glowColor = '#06b6d4'; // cyan
  else if (activePage === ActivePage.Travels) glowColor = '#f59e0b'; // amber

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float-slow-1 {
          0% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(60px, 80px) scale(1.1); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes float-slow-2 {
          0% { transform: translate(0px, 0px) scale(1.1); }
          50% { transform: translate(-80px, -60px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1.1); }
        }
        @keyframes float-slow-3 {
          0% { transform: translate(0px, 0px) scale(0.95); }
          50% { transform: translate(50px, -50px) scale(1.05); }
          100% { transform: translate(0px, 0px) scale(0.95); }
        }
        .glow-sphere {
          filter: blur(120px);
          opacity: 0.15;
          mix-blend-mode: screen;
          transition: background-color 1.2s cubic-bezier(0.16, 1, 0.3, 1),
                      opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
      ` }} />
      
      {/* Top Left Sphere */}
      <div 
        className="absolute glow-sphere rounded-full"
        style={{
          backgroundColor: glowColor,
          width: '55vw',
          height: '55vw',
          top: '-20vw',
          left: '-20vw',
          animation: 'float-slow-1 25s ease-in-out infinite',
          opacity: activePage === ActivePage.Home ? 0.18 : 0.08
        }}
      />

      {/* Bottom Right Sphere */}
      <div 
        className="absolute glow-sphere rounded-full"
        style={{
          backgroundColor: glowColor,
          width: '50vw',
          height: '50vw',
          bottom: '-15vw',
          right: '-15vw',
          animation: 'float-slow-2 30s ease-in-out infinite',
          opacity: activePage === ActivePage.Home ? 0.15 : 0.06
        }}
      />

      {/* Middle Floating Ambient Sphere */}
      <div 
        className="absolute glow-sphere rounded-full"
        style={{
          backgroundColor: '#4f46e5', // Indigo anchor color
          width: '35vw',
          height: '35vw',
          top: '30vh',
          left: '40vw',
          animation: 'float-slow-3 22s ease-in-out infinite',
          opacity: activePage === ActivePage.Home ? 0.07 : 0.03
        }}
      />
    </div>
  );
}
