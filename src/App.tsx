/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useMemo, useState, lazy, Suspense } from 'react';
import { AnimatePresence, motion, useScroll, useSpring } from 'motion/react';
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
import ItSolutionsView from './components/ItSolutionsView';
import ContactView from './components/ContactView';
const AdminView = lazy(() => import('./components/AdminView'));

// Storage Utility Loaders
import {
  getCompanyContact,
  getDecorationGallery,
  getItProjects,
  getLeadershipTeam,
  getPhotoPortfolio,
  getPhotoPricing,
  getRentalItems,
  getServicesList,
  getSeoSettings,
  getThemeSettings,
  getTestimonials,
  hydrateDatabaseFromServer
} from './utils/storage';

// Branding Updater
import { updateBranding } from './utils/brandingUpdater';
import { useRealtimeImageState } from './architecture/presentation/hooks/useRealtimeImageState';
import { listenToAllCloudDbUpdates } from './firebaseClient';

// Logo
import mahadevLogo from './assets/images/mahadev_logo_1782729909050.jpg';

const logoImage = mahadevLogo;

function normalizeRouteToPage(value?: string | null): ActivePage | null {
  const route = value?.toLowerCase().trim() || '';
  if (!route || route === 'home' || route === '/') return ActivePage.Home;
  if (route === 'admin') return ActivePage.Admin;
  if (route === 'contact') return ActivePage.Contact;
  if (route === 'decoration' || route === 'sws' || route === 'event' || route === 'events') return ActivePage.Decoration;
  if (route === 'photography' || route === 'studio' || route === 'u1' || route === 'u1-studio') return ActivePage.Photography;
  if (route === 'erp' || route === 'erp-solutions' || route === 'solutions') return ActivePage.ErpSolutions;
  if (route === 'it' || route === 'it-solutions' || route === 'software' || route === 'development') return ActivePage.ItSolutions;
  if (route === 'travels' || route === 'travel' || route === 'tour' || route === 'tours') return ActivePage.Travels;
  return null;
}

function syncPageToUrl(page: ActivePage) {
  if (typeof window === 'undefined') return;
  const nextHash = page === ActivePage.Home ? '' : `#${page}`;
  const target = `${window.location.pathname}${nextHash}`;
  if (window.location.pathname + window.location.hash !== target) {
    window.history.pushState({}, '', target);
  }
}

function adjustHex(hex: string, percent: number): string {
  const cleanHex = hex.replace('#', '');
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

  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
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

  const filteredServices = servicesList.filter(
    (service) =>
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProjects = itProjects.filter(
    (project) =>
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    setDataRefreshTrigger((prev) => prev + 1);
  };

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

  // Real-time website image state (Firestore listeners)
  const { imageState } = useRealtimeImageState();

  // Client-side cache-busting
  const cacheBustedWebsiteImages = useMemo(() => {
    const updatedAtEpoch = (() => {
      try {
        return new Date(imageState.updatedAt).getTime();
      } catch {
        return Date.now();
      }
    })();

    const bust = (url?: string) => {
      if (!url) return url;
      const sep = url.includes('?') ? '&' : '?';
      return `${url}${sep}v=${updatedAtEpoch}`;
    };

    return {
      brandLogo: bust(imageState.website.brandLogo),
      decorationBanner: bust(imageState.website.decorationBanner),
      photographyBanner: bust(imageState.website.photographyBanner),
      itBanner: bust(imageState.website.itBanner),
      travelsBanner: bust(imageState.website.travelsBanner),
      weddingDecorationBanner: bust(imageState.website.weddingDecorationBanner)
    };
  }, [imageState.updatedAt, imageState.website]);

  // Server-backed dynamic database hydration on app mount
  useEffect(() => {
    let cancelled = false;

    async function syncInBackground() {
      try {
        const success = await hydrateDatabaseFromServer();
        if (cancelled) return;

        if (success) {
          handleDataChange();
          window.dispatchEvent(new Event('mahdev-db-synced'));
        }
      } catch (err) {
        console.error('Failed to hydrate database in background:', err);
      }
    }

    syncInBackground();

    return () => {
      cancelled = true;
    };
  }, []);

  // Real-time synchronization listener
  useEffect(() => {
    let unsub: (() => void) | null = null;
    let cancelled = false;

    async function initRealtimeSync() {
      try {
        unsub = await listenToAllCloudDbUpdates((key, value) => {
          if (cancelled) return;
          console.log(`[Realtime Sync] Received cloud update for key: ${key}`);
          localStorage.setItem(key, JSON.stringify(value));
          handleDataChange();
        });
      } catch (err) {
        console.error('Failed to initialize real-time cloud sync listener:', err);
      }
    }

    initRealtimeSync();

    return () => {
      cancelled = true;
      if (unsub) unsub();
    };
  }, []);

  // Dynamic URL hash and path routing listener
  useEffect(() => {
    const handleRouteChange = () => {
      const matchedPage = normalizeRouteToPage(
        window.location.hash.replace('#', '') || window.location.pathname.replace(/^\/+|\/+$/g, '')
      );

      if (matchedPage) setActivePage(matchedPage);
      else setActivePage(ActivePage.Home);
    };

    window.addEventListener('hashchange', handleRouteChange);
    window.addEventListener('popstate', handleRouteChange);
    handleRouteChange();

    return () => {
      window.removeEventListener('hashchange', handleRouteChange);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  useEffect(() => {
    syncPageToUrl(activePage);
  }, [activePage]);

  // Update 3D mode + title/meta on active page changes
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

    window.dispatchEvent(new CustomEvent('mahdev-3d-mode-change', { detail: { mode } }));
    document.title = pageTitle;

    let descriptionMeta = document.querySelector('meta[name="description"]');
    if (!descriptionMeta) {
      descriptionMeta = document.createElement('meta');
      descriptionMeta.setAttribute('name', 'description');
      document.head.appendChild(descriptionMeta);
    }
    descriptionMeta.setAttribute('content', metaDesc);

    let keywordsMeta = document.querySelector('meta[name="keywords"]');
    if (!keywordsMeta) {
      keywordsMeta = document.createElement('meta');
      keywordsMeta.setAttribute('name', 'keywords');
      document.head.appendChild(keywordsMeta);
    }
    keywordsMeta.setAttribute('content', seoSettings.metaKeywords);

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
    const cacheBustedTheme = {
      ...themeSettings,
      brandLogo: cacheBustedWebsiteImages.brandLogo || themeSettings.brandLogo,
      decorationBanner: cacheBustedWebsiteImages.decorationBanner || themeSettings.decorationBanner,
      photographyBanner: cacheBustedWebsiteImages.photographyBanner || themeSettings.photographyBanner,
      itBanner: cacheBustedWebsiteImages.itBanner || themeSettings.itBanner,
      travelsBanner: cacheBustedWebsiteImages.travelsBanner || themeSettings.travelsBanner,
      weddingDecorationBanner: cacheBustedWebsiteImages.weddingDecorationBanner || themeSettings.weddingDecorationBanner
    };

    switch (activePage) {
      case ActivePage.Home:
        return (
          <HomeView
            setActivePage={setActivePage}
            isDarkMode={isDarkMode}
            servicesList={filteredServices}
            leadersList={leaders}
            themeSettings={cacheBustedTheme}
          />
        );

      case ActivePage.Decoration:
        return (
          <DecorationView
            isDarkMode={isDarkMode}
            testimonialsList={testimonials}
            contactInfo={{
              ...companyContact,
              logo: cacheBustedWebsiteImages.brandLogo || companyContact.logo
            }}
            galleryList={decorationGallery}
            rentalList={rentalItems}
            themeSettings={cacheBustedTheme}
          />
        );

      case ActivePage.Photography:
        return (
          <PhotographyView
            isDarkMode={isDarkMode}
            portfolioList={photoPortfolio}
            pricingList={photoPricing as any}
            themeSettings={cacheBustedTheme}
          />
        );

      case ActivePage.Travels:
        return (
          <TravelsView
            isDarkMode={isDarkMode}
            themeSettings={cacheBustedTheme}
          />
        );

      case ActivePage.ErpSolutions:
        return (
          <ItSolutionsView
            isDarkMode={isDarkMode}
            projectsList={filteredProjects}
            themeSettings={cacheBustedTheme}
            initialTab="erp"
          />
        );

      case ActivePage.ItSolutions:
        return (
          <ItSolutionsView
            isDarkMode={isDarkMode}
            projectsList={filteredProjects}
            themeSettings={cacheBustedTheme}
            initialTab="custom"
          />
        );

      case ActivePage.Contact:
        return (
          <ContactView 
            isDarkMode={isDarkMode} 
            contactInfo={{
              ...companyContact,
              logo: cacheBustedWebsiteImages.brandLogo || companyContact.logo
            }} 
            themeSettings={cacheBustedTheme} 
          />
        );

      case ActivePage.Admin:
        return (
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center gap-4 min-h-[50vh]">
              <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-bold uppercase tracking-wider text-purple-400 animate-pulse">Loading Panel...</p>
            </div>
          }>
            <AdminView isDarkMode={isDarkMode} onDataChange={handleDataChange} themeSettings={themeSettings} />
          </Suspense>
        );

      default:
        return (
          <HomeView
            setActivePage={setActivePage}
            isDarkMode={isDarkMode}
            servicesList={servicesList}
            leadersList={leaders}
            themeSettings={cacheBustedTheme}
          />
        );
    }
  };

  const primary = themeSettings.primaryColor;
  const fontName = themeSettings.fontFamily || 'Poppins';

  const shades: Record<number, string> = {
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
    950: adjustHex(primary, -80)
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
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center gap-4 min-h-screen">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-bold uppercase tracking-wider text-purple-400 animate-pulse">Loading Admin Control Panel...</p>
            </div>
          }>
            <AdminView isDarkMode={isDarkMode} onDataChange={handleDataChange} themeSettings={themeSettings} />
          </Suspense>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styleContent}</style>
      <SpeedInsights />

      <AnimatePresence mode="wait">
        <motion.div
          key="main-app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35 }}
          className={`min-h-screen relative flex flex-col justify-between transition-colors duration-500 ${
            isDarkMode
              ? 'bg-neutral-950 text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-300'
              : 'bg-white text-slate-800 selection:bg-emerald-600/20 selection:text-emerald-800'
          }`}
        >
          <motion.div
            className="fixed top-0 left-0 right-0 h-1 bg-emerald-500 origin-left z-[60]"
            style={{ scaleX }}
          />

          <ThreeCanvas
            intensity={activePage === ActivePage.Home ? 1.2 : 0.45}
            activePage={activePage}
            primaryColor={themeSettings.primaryColor}
            animationMode={themeSettings.animationMode}
          />

          <Navbar
            activePage={activePage}
            setActivePage={setActivePage}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            logo={companyContact?.logo || cacheBustedWebsiteImages.brandLogo || themeSettings?.brandLogo || logoImage}
            themeSettings={themeSettings}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            servicesList={servicesList}
            itProjects={itProjects}
          />

          <main id="main-content-flow" className="flex-grow w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePage}
                initial={{ opacity: 0, filter: 'blur(10px)', y: 10 }}
                animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                exit={{ opacity: 0, filter: 'blur(10px)', y: -10 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                {renderView()}
              </motion.div>
            </AnimatePresence>
          </main>

          <Footer
            setActivePage={setActivePage}
            isDarkMode={isDarkMode}
            contactInfo={{
              ...companyContact,
              logo: cacheBustedWebsiteImages.brandLogo || companyContact.logo
            }}
            themeSettings={{
              ...themeSettings,
              brandLogo: cacheBustedWebsiteImages.brandLogo || themeSettings.brandLogo
            }}
          />

          <FloatingActions />
        </motion.div>
      </AnimatePresence>
    </>
  );
}

