/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'motion/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { ActivePage } from './types';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ThreeCanvas from './components/ThreeCanvas';
import FloatingActions from './components/FloatingActions';

// Views
import HomeView from './components/HomeView';
import DecorationView from './components/DecorationView';
import PhotographyView from './components/PhotographyView';
import TravelsView from './components/TravelsView';
import ErpView from './components/ErpView';
import ItSolutionsView from './components/ItSolutionsView';
import ContactView from './components/ContactView';
import AdminView from './components/AdminView';

// Storage Utility Loaders
import { 
  getCompanyContact, 
  getServicesList, 
  getPhotoPortfolio, 
  getPhotoPricing, 
  getItProjects, 
  getLeadershipTeam, 
  getTestimonials,
  getDecorationGallery,
  getRentalItems,
  getThemeSettings,
  getSeoSettings,
  hydrateDatabaseFromServer
} from './utils/storage';

// Branding Updater
import { updateBranding } from './utils/brandingUpdater';

// Logo
const logoImage = '/src/assets/images/mahadev_logo_1782729909050.jpg';

function adjustHex(hex: string, percent: number): string {
  const cleanHex = hex.replace("#", "");
  const num = parseInt(cleanHex, 16);
  let r = (num >> 16) + Math.round(2.55 * percent);
  let g = ((num >> 8) & 0x00ff) + Math.round(2.55 * percent);
  let b = (num & 0x0000ff) + Math.round(2.55 * percent);
  
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export default function App() {
  const [activePage, setActivePage] = useState<ActivePage>(ActivePage.Home);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true); // Luxurious Dark default
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Dynamic States for Admin customization
  const [dataRefreshTrigger, setDataRefreshTrigger] = useState(0);
  const [companyContact, setCompanyContact] = useState(() => getCompanyContact());
  const [servicesList, setServicesList] = useState(() => getServicesList());
  const [photoPortfolio, setPhotoPortfolio] = useState(() => getPhotoPortfolio());
  const [photoPricing, setPhotoPricing] = useState(() => getPhotoPricing());
  const [itProjects, setItProjects] = useState(() => getItProjects());
  const [leaders, setLeaders] = useState(() => getLeadershipTeam());
  const [testimonials, setTestimonials] = useState(() => getTestimonials());
  const [decorationGallery, setDecorationGallery] = useState(() => getDecorationGallery());
  const [rentalItems, setRentalItems] = useState(() => getRentalItems());
  const [themeSettings, setThemeSettings] = useState(() => getThemeSettings());
  const [seoSettings, setSeoSettings] = useState(() => getSeoSettings());

  const filteredServices = servicesList.filter(service => 
    service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProjects = itProjects.filter(project => 
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Update states whenever trigger increments
  useEffect(() => {
    setCompanyContact(getCompanyContact());
    setServicesList(getServicesList());
    setPhotoPortfolio(getPhotoPortfolio());
    setPhotoPricing(getPhotoPricing());
    setItProjects(getItProjects());
    setLeaders(getLeadershipTeam());
    setTestimonials(getTestimonials());
    setDecorationGallery(getDecorationGallery());
    setRentalItems(getRentalItems());
    setThemeSettings(getThemeSettings());
    setSeoSettings(getSeoSettings());
  }, [dataRefreshTrigger]);

  const handleDataChange = () => {
    setDataRefreshTrigger(prev => prev + 1);
  };

  // Update page title and favicon whenever theme settings change
  useEffect(() => {
    updateBranding(themeSettings);
  }, [themeSettings]);

  // Scroll Progress indicator setup
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Server-backed dynamic database hydration on app mount
  useEffect(() => {
    async function syncAndLoad() {
      try {
        const success = await hydrateDatabaseFromServer();
        if (success) {
          handleDataChange();
            // Notify any admin UI listeners that the server DB has been synchronized
            window.dispatchEvent(new Event('mahdev-db-synced'));
        }
      } catch (err) {
        console.error("Failed to hydrate database on mount:", err);
      } finally {
        setLoading(false);
      }
    }
    syncAndLoad();
  }, []);

  // Dynamic URL hash and path routing listener
  useEffect(() => {
    const handleRouteChange = () => {
      if (window.location.hash === '#admin' || window.location.pathname === '/admin') {
        setActivePage(ActivePage.Admin);
      } else if (window.location.hash === '#home' || window.location.hash === '') {
        setActivePage(ActivePage.Home);
      } else {
        const hash = window.location.hash.replace('#', '');
        const matchingPage = Object.values(ActivePage).find(p => p === hash);
        if (matchingPage) {
          setActivePage(matchingPage as ActivePage);
        }
      }
    };

    window.addEventListener('hashchange', handleRouteChange);
    window.addEventListener('popstate', handleRouteChange);
    
    // Initial check on mount
    handleRouteChange();

    return () => {
      window.removeEventListener('hashchange', handleRouteChange);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  // Update Three.js 3D background mode, page title, and meta description when active page changes
  useEffect(() => {
    let mode = 'home';
    let pageTitle = seoSettings.siteTitle;
    let metaDesc = seoSettings.metaDescription;

    switch (activePage) {
      case ActivePage.Home:
        mode = 'home';
        pageTitle = seoSettings.siteTitle;
        metaDesc = seoSettings.metaDescription;
        break;
      case ActivePage.Decoration:
        mode = 'decoration';
        pageTitle = `SWS Wedding & Event Decoration | ${seoSettings.siteTitle}`;
        metaDesc = `SWS Events specializes in exquisite wedding decorations, custom event stages, luxury receptions, corporate banquets, and premium stage lighting solutions. Managed by ${seoSettings.siteTitle}.`;
        break;
      case ActivePage.Photography:
        mode = 'photography';
        pageTitle = `U1 Studio Photography & Videography | ${seoSettings.siteTitle}`;
        metaDesc = `U1 Studio is a premium photography team delivering stunning pre-wedding shoots, luxury wedding videography, corporate portraiture, and cinematic drone support. Partnered with ${seoSettings.siteTitle}.`;
        break;
      case ActivePage.ErpSolutions:
        mode = 'erp';
        pageTitle = `Enterprise ERP & Automation Systems | ${seoSettings.siteTitle}`;
        metaDesc = `Optimize your enterprise operations with custom CRM, HRIS, supply chain tracking, live accounting analytics, and bespoke SaaS systems built by ${seoSettings.siteTitle}.`;
        break;
      case ActivePage.ItSolutions:
        mode = 'it';
        pageTitle = `Bespoke IT Solutions, Web & App Development | ${seoSettings.siteTitle}`;
        metaDesc = `High-performance custom e-commerce systems, secure REST APIs, cloud infrastructure, and enterprise mobile applications built for scale by ${seoSettings.siteTitle}.`;
        break;
      case ActivePage.Travels:
        mode = 'travels';
        pageTitle = `Mahdev Travels | Premium Tours & Rent-A-Car | ${seoSettings.siteTitle}`;
        metaDesc = `Discover Sri Lanka with bespoke tour packages, luxury wedding rent-a-cars, corporate airport transfers, and elite private excursions. Provided by ${seoSettings.siteTitle}.`;
        break;
      case ActivePage.Admin:
        mode = 'home';
        pageTitle = `Corporate Command CMS | ${seoSettings.siteTitle} Control Center`;
        metaDesc = `Secure administration and enterprise CMS operations control center for ${seoSettings.siteTitle} management.`;
        break;
      case ActivePage.Contact:
        mode = 'home';
        pageTitle = `Get in Touch | Contact ${seoSettings.siteTitle}`;
        metaDesc = `Contact ${seoSettings.siteTitle} headquarters today for inquiries regarding SWS Events, U1 Studio, custom IT, enterprise ERP setups, or Travels.`;
        break;
    }

    // 1. Dispatch event to update background mode
    window.dispatchEvent(new CustomEvent('mahdev-3d-mode-change', { detail: { mode } }));

    // 2. Dynamically update HTML Document Title
    document.title = pageTitle;

    // 3. Dynamically update or create HTML Meta Description
    let descriptionMeta = document.querySelector('meta[name="description"]');
    if (!descriptionMeta) {
      descriptionMeta = document.createElement('meta');
      descriptionMeta.setAttribute('name', 'description');
      document.head.appendChild(descriptionMeta);
    }
    descriptionMeta.setAttribute('content', metaDesc);

    // 4. Dynamically update or create HTML Meta Keywords
    let keywordsMeta = document.querySelector('meta[name="keywords"]');
    if (!keywordsMeta) {
      keywordsMeta = document.createElement('meta');
      keywordsMeta.setAttribute('name', 'keywords');
      document.head.appendChild(keywordsMeta);
    }
    keywordsMeta.setAttribute('content', seoSettings.metaKeywords);

    // 5. Dynamically update or create Open Graph Tags
    let ogTitleMeta = document.querySelector('meta[property="og:title"]');
    if (!ogTitleMeta) {
      ogTitleMeta = document.createElement('meta');
      ogTitleMeta.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitleMeta);
    }
    ogTitleMeta.setAttribute('content', activePage === ActivePage.Home ? seoSettings.ogTitle : pageTitle);

    let ogDescMeta = document.querySelector('meta[property="og:description"]');
    if (!ogDescMeta) {
      ogDescMeta = document.createElement('meta');
      ogDescMeta.setAttribute('property', 'og:description');
      document.head.appendChild(ogDescMeta);
    }
    ogDescMeta.setAttribute('content', activePage === ActivePage.Home ? seoSettings.ogDescription : metaDesc);

    let ogImageMeta = document.querySelector('meta[property="og:image"]');
    if (!ogImageMeta) {
      ogImageMeta = document.createElement('meta');
      ogImageMeta.setAttribute('property', 'og:image');
      document.head.appendChild(ogImageMeta);
    }
    ogImageMeta.setAttribute('content', seoSettings.ogImage);
  }, [activePage, seoSettings]);

  const renderView = () => {
    switch (activePage) {
      case ActivePage.Home:
        return (
          <HomeView 
            setActivePage={setActivePage} 
            isDarkMode={isDarkMode} 
            servicesList={filteredServices}
            leadersList={leaders}
            themeSettings={themeSettings}
          />
        );
      case ActivePage.Decoration:
        return (
          <DecorationView 
            isDarkMode={isDarkMode} 
            testimonialsList={testimonials}
            contactInfo={companyContact}
            galleryList={decorationGallery}
            rentalList={rentalItems}
            themeSettings={themeSettings}
          />
        );
      case ActivePage.Photography:
        return (
          <PhotographyView 
            isDarkMode={isDarkMode} 
            portfolioList={photoPortfolio}
            pricingList={photoPricing}
            themeSettings={themeSettings}
          />
        );
      case ActivePage.Travels:
        return (
          <TravelsView 
            isDarkMode={isDarkMode} 
            themeSettings={themeSettings}
          />
        );
      case ActivePage.ErpSolutions:
        return (
          <ItSolutionsView 
            isDarkMode={isDarkMode} 
            projectsList={filteredProjects}
            themeSettings={themeSettings}
            initialTab="erp"
          />
        );
      case ActivePage.ItSolutions:
        return (
          <ItSolutionsView 
            isDarkMode={isDarkMode} 
            projectsList={filteredProjects}
            themeSettings={themeSettings}
            initialTab="custom"
          />
        );
      case ActivePage.Contact:
        return (
          <ContactView 
            isDarkMode={isDarkMode} 
            contactInfo={companyContact}
            themeSettings={themeSettings}
          />
        );
      case ActivePage.Admin:
        return (
          <AdminView 
            isDarkMode={isDarkMode} 
            onDataChange={handleDataChange}
            themeSettings={themeSettings}
          />
        );
      default:
        return (
          <HomeView 
            setActivePage={setActivePage} 
            isDarkMode={isDarkMode} 
            servicesList={servicesList}
            leadersList={leaders}
            themeSettings={themeSettings}
          />
        );
    }
  };

  const primary = themeSettings.primaryColor;
  const fontName = themeSettings.fontFamily || 'Poppins';

  const shades = {
    50: adjustHex(primary, 90),
    100: adjustHex(primary, 75),
    200: adjustHex(primary, 50),
    300: adjustHex(primary, 25),
    400: adjustHex(primary, 10),
    500: primary,
    600: adjustHex(primary, -12),
    700: adjustHex(primary, -25),
    800: adjustHex(primary, -40),
    900: adjustHex(primary, -60),
    950: adjustHex(primary, -80),
  };

  const styleContent = `
    :root {
      --custom-font-sans: "${fontName}";
      --custom-font-display: "${fontName}";
      --custom-emerald-50: ${shades[50]} !important;
      --custom-emerald-100: ${shades[100]} !important;
      --custom-emerald-200: ${shades[200]} !important;
      --custom-emerald-300: ${shades[300]} !important;
      --custom-emerald-400: ${shades[400]} !important;
      --custom-emerald-500: ${shades[500]} !important;
      --custom-emerald-600: ${shades[600]} !important;
      --custom-emerald-700: ${shades[700]} !important;
      --custom-emerald-800: ${shades[800]} !important;
      --custom-emerald-900: ${shades[900]} !important;
      --custom-emerald-950: ${shades[950]} !important;
    }
  `;

  if (activePage === ActivePage.Admin) {
    return (
      <>
        <style>{styleContent}</style>
        <div className="min-h-screen bg-neutral-950 text-slate-100 font-sans">
          <AdminView 
            isDarkMode={isDarkMode} 
            onDataChange={handleDataChange}
            themeSettings={themeSettings}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styleContent}</style>
      <SpeedInsights />
      <AnimatePresence mode="wait">
        {loading ? (
          /* Premium Monogram Intro Preloader */
          <motion.div
            key="preloader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center text-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="space-y-6"
            >
              <div className="relative w-24 h-24 rounded-2xl mx-auto overflow-hidden border border-emerald-500/30 shadow-2xl shadow-emerald-500/10">
                <img 
                  src={companyContact?.logo || logoImage} 
                  alt="Brand Logo" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/25 to-transparent animate-pulse" />
              </div>

              <div className="space-y-1">
                <h2 className="text-white text-2xl font-bold tracking-widest font-sans leading-none">
                  {themeSettings.brandName.split(' ')[0] || 'MAHDEV'}
                </h2>
                <p className="text-emerald-500 font-mono text-[10px] tracking-[0.3em] uppercase font-semibold">
                  {themeSettings.brandName.split(' ').slice(1).join(' ') || 'Pvt Ltd'}
                </p>
              </div>

              {/* Loader line */}
              <div className="w-32 h-0.5 bg-neutral-900 rounded-full mx-auto overflow-hidden">
                <motion.div 
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                  className="w-1/2 h-full bg-emerald-500"
                />
              </div>
            </motion.div>
          </motion.div>
        ) : (
          /* Master Website Frame */
          <motion.div
            key="main-app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className={`min-h-screen relative flex flex-col justify-between transition-colors duration-500 ${
              isDarkMode 
                ? 'bg-neutral-950 text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-300' 
                : 'bg-white text-slate-800 selection:bg-emerald-600/20 selection:text-emerald-800'
            }`}
          >
            {/* Scroll Progress Bar */}
            <motion.div 
              className="fixed top-0 left-0 right-0 h-1 bg-emerald-500 origin-left z-[60]"
              style={{ scaleX }}
            />

            {/* Interactive WebGL Scene */}
            <ThreeCanvas 
              intensity={activePage === ActivePage.Home ? 1.2 : 0.45} 
              activePage={activePage}
              primaryColor={themeSettings.primaryColor}
              animationMode={themeSettings.animationMode}
            />

            {/* Header / Sticky Navigation */}
            <Navbar 
              activePage={activePage} 
              setActivePage={setActivePage} 
              isDarkMode={isDarkMode} 
              setIsDarkMode={setIsDarkMode} 
              logo={companyContact?.logo || themeSettings?.brandLogo}
              themeSettings={themeSettings}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              servicesList={servicesList}
              itProjects={itProjects}
            />

            {/* Main Section with smooth page slide and blur transitions */}
            <main id="main-content-flow" className="flex-grow w-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePage}
                  initial={{ opacity: 0, filter: 'blur(12px)', y: 15 }}
                  animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                  exit={{ opacity: 0, filter: 'blur(12px)', y: -15 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  {renderView()}
                </motion.div>
              </AnimatePresence>
            </main>

            {/* Footer */}
            <Footer setActivePage={setActivePage} isDarkMode={isDarkMode} contactInfo={companyContact} themeSettings={themeSettings} />

            {/* Floating Actions (WhatsApp Chat & Back to Top) */}
            <FloatingActions />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
