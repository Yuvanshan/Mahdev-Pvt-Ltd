/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, Gift, Briefcase, Sparkles, Home, Sun, Star, 
  Phone, MessageSquare, Calendar, Users, Mail, User, CheckCircle2,
  Search, Layers, Info, ShoppingBag, Plus, Minus, Trash2
} from 'lucide-react';
import { DECORATION_CATEGORIES, DECORATION_GALLERY, CLIENT_TESTIMONIALS, COMPANY_CONTACT } from '../data';
import { BookingDetails, DecorationGalleryItem, RentalItem, ThemeSettings } from '../types';
import { addBooking } from '../utils/storage';
import EmailCopySection from './EmailCopySection';
import weddingDecorationBannerAsset from '../assets/images/wedding_decoration_1782729925686.jpg';

interface DecorationViewProps {
  isDarkMode: boolean;
  testimonialsList?: any[];
  contactInfo?: any;
  galleryList?: DecorationGalleryItem[];
  rentalList?: RentalItem[];
  themeSettings?: ThemeSettings;
}

export default function DecorationView({ 
  isDarkMode, 
  testimonialsList = CLIENT_TESTIMONIALS, 
  contactInfo = COMPANY_CONTACT,
  galleryList = DECORATION_GALLERY,
  rentalList = [],
  themeSettings
}: DecorationViewProps) {
  const brandName = 'SWS Event Management';
  const brandShort = 'SWS';

  // Before / After slider state
  const [sliderPos, setSliderPos] = useState(50);
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  // Booking Form State
  const [booking, setBooking] = useState<BookingDetails>({
    name: '',
    phone: '',
    email: '',
    serviceType: 'Wedding Decoration',
    eventDate: '',
    guests: 150,
    notes: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Gallery category filter
  const [selectedFilter, setSelectedFilter] = useState('All');
  const filters = ['All', 'Wedding', 'Birthday', 'Church', 'Corporate', 'Stage', 'Outdoor'];

  // Rental Inventory States
  const [selectedRentalCategory, setSelectedRentalCategory] = useState('All');
  const [searchRentalQuery, setSearchRentalQuery] = useState('');
  const [rentalCart, setRentalCart] = useState<{[key: string]: number}>({});

  const handleSliderMove = (clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percentage);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleSliderMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (e.buttons === 1 || isDragging.current) {
      handleSliderMove(e.clientX);
    }
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking.name || !booking.phone || !booking.eventDate) return;
    
    // Save to central store
    addBooking({
      brand: 'SWS',
      name: booking.name,
      phone: booking.phone,
      email: booking.email,
      serviceType: booking.serviceType,
      eventDate: booking.eventDate,
      guests: booking.guests ? Number(booking.guests) : undefined,
      notes: booking.notes,
      amount: booking.serviceType.toLowerCase().includes('wedding') ? 150000 : 45000,
    });

    setIsSubmitted(true);
  };

  // Cart operations & Calculations
  const parsePrice = (priceStr: string): number => {
    const numbersOnly = priceStr.replace(/[^0-9]/g, '');
    return parseInt(numbersOnly) || 0;
  };

  const updateCartItemQty = (id: string, delta: number) => {
    setRentalCart(prev => {
      const currentQty = prev[id] || 0;
      const newQty = Math.max(0, currentQty + delta);
      return { ...prev, [id]: newQty };
    });
  };

  const clearCart = () => {
    setRentalCart({});
  };

  const getCartSubtotal = (): number => {
    return Object.entries(rentalCart).reduce((acc: number, [id, qty]) => {
      const q = qty as number;
      const item = rentalList.find(r => r.id === id);
      if (!item) return acc;
      return acc + (parsePrice(item.price) * q);
    }, 0);
  };

  const getCartTotalItemCount = (): number => {
    return (Object.values(rentalCart) as number[]).reduce((acc: number, qty: number) => acc + qty, 0);
  };

  const injectCartIntoBookingNotes = () => {
    const selectedItems = Object.entries(rentalCart).filter(([_, qty]) => (qty as number) > 0);
    if (selectedItems.length === 0) return;

    let itemsText = `SELECTED ${brandShort.toUpperCase()} RENTAL INVENTORY:\n`;
    let estTotal = 0;
    selectedItems.forEach(([id, qty]) => {
      const q = qty as number;
      const item = rentalList.find(r => r.id === id);
      if (item) {
        const itemPrice = parsePrice(item.price);
        const subtotal = itemPrice * q;
        estTotal += subtotal;
        itemsText += `- ${q}x ${item.name} (${item.price}) -> Subtotal: Rs. ${subtotal.toLocaleString()}\n`;
      }
    });
    itemsText += `ESTIMATED RENTALS TOTAL: Rs. ${estTotal.toLocaleString()} / day\n---------------------------------\n`;

    setBooking(prev => ({
      ...prev,
      notes: `${itemsText}${prev.notes || ''}`
    }));

    // Scroll to booking form
    const formEl = document.getElementById('booking-form-anchor');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const rentalCategories = ['All', ...Array.from(new Set(rentalList.map(item => item.category)))];

  const filteredRentals = rentalList.filter(item => {
    const matchesCategory = selectedRentalCategory === 'All' || item.category === selectedRentalCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchRentalQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchRentalQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchRentalQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Heart': return <Heart className="w-5 h-5 text-emerald-400" />;
      case 'Gift': return <Gift className="w-5 h-5 text-emerald-400" />;
      case 'Church': return <span className="text-emerald-400 font-bold">⛪</span>;
      case 'Briefcase': return <Briefcase className="w-5 h-5 text-emerald-400" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-emerald-400 font-bold" />;
      case 'Flower': return <span className="text-emerald-400 font-bold">✿</span>;
      case 'Home': return <Home className="w-5 h-5 text-emerald-400" />;
      case 'Sun': return <Sun className="w-5 h-5 text-emerald-400" />;
      default: return <Sparkles className="w-5 h-5 text-emerald-400" />;
    }
  };

  const filteredGallery = selectedFilter === 'All' 
    ? galleryList 
    : galleryList.filter(item => item.category.toLowerCase() === selectedFilter.toLowerCase());

  return (
    <div id="decoration-view-container" className="relative w-full z-10">
      
      {/* Page Hero Banner */}
      <section className="relative py-28 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-emerald-500/10 bg-black">
        {/* Blurred background photo */}
        <div className="absolute inset-0 z-0">
          <img 
            src={themeSettings?.weddingDecorationBanner || weddingDecorationBannerAsset} 
            alt="Flagship Decor Background" 
            className="w-full h-full object-cover opacity-25 filter blur-sm scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 font-mono">
            Flagship Corporate Services
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mt-3 mb-6">
            {brandName}
          </h1>
          <p className="text-slate-300 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            Turning ordinary halls, gardens, and banquet tables into highly curated masterpieces. We harmonize color theory, custom floral arrangements, and architectural lighting models.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href={`tel:${COMPANY_CONTACT.phone}`}
              className="flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition-all shadow-lg hover:scale-105"
            >
              <Phone size={16} />
              <span>Call Event Director</span>
            </a>
            <a
              href={COMPANY_CONTACT.whatsapp}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-slate-900 border border-emerald-500/20 text-emerald-400 font-bold hover:bg-slate-800 transition-all hover:scale-105"
            >
              <MessageSquare size={16} />
              <span>WhatsApp Inquiry</span>
            </a>
          </div>
        </div>
      </section>

      {/* Before / After Slider Showcase */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              The {brandShort} Transformation
            </h2>
            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Drag or swipe the center divider to witness how we transform empty halls into royal imperial event stages.
            </p>
          </div>

          {/* Interactive Slider */}
          <div 
            id="before-after-slider-container"
            ref={sliderRef}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            onMouseDown={() => { isDragging.current = true; }}
            onMouseUp={() => { isDragging.current = false; }}
            onMouseLeave={() => { isDragging.current = false; }}
            className="relative h-[250px] sm:h-[420px] rounded-2xl overflow-hidden shadow-2xl border border-emerald-500/10 cursor-ew-resize select-none"
          >
            {/* After Image (Full Background) */}
            <img 
              src={themeSettings?.weddingDecorationBanner || weddingDecorationBanner} 
              alt="After Transformation Decor" 
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-4 right-4 bg-emerald-600/90 backdrop-blur-md text-white text-xs font-bold uppercase px-3 py-1.5 rounded-md border border-white/20 z-10 pointer-events-none">
              After: Imperial Banquet Setup
            </div>

            {/* Before Image (Left Overlay, clipped based on slider pos) */}
            <div 
              className="absolute inset-y-0 left-0 overflow-hidden pointer-events-none"
              style={{ width: `${sliderPos}%` }}
            >
              <img 
                src="https://images.unsplash.com/photo-1541123437800-1bb1317badc2?auto=format&fit=crop&q=80&w=1200" 
                alt="Before Setup Plain Hall" 
                className="absolute inset-0 h-full object-cover pointer-events-none"
                style={{ width: '100%', maxWidth: 'none', height: '100%', minWidth: sliderRef.current?.clientWidth || 800 }}
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-4 left-4 bg-slate-800/90 backdrop-blur-md text-white text-xs font-bold uppercase px-3 py-1.5 rounded-md border border-white/10 pointer-events-none">
                Before: Plain empty banquet space
              </div>
            </div>

            {/* Divider Line */}
            <div 
              className="absolute inset-y-0 w-1 bg-emerald-400 z-20 pointer-events-none"
              style={{ left: `${sliderPos}%` }}
            >
              {/* Handle */}
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-lg text-white font-mono text-xs font-bold select-none">
                ↔
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Decorative Categories Grid */}
      <section className={`py-24 px-4 sm:px-6 lg:px-8 border-t border-b ${
        isDarkMode ? 'bg-neutral-950/35 border-emerald-500/10' : 'bg-slate-50/60 border-slate-200'
      }`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Bespoke Styling Portfolios
            </h2>
            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Carefully conceptualized themes tailored to host various high-profile milestones.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {DECORATION_CATEGORIES.map((category) => (
              <div
                key={category.id}
                className={`group rounded-2xl overflow-hidden border transition-all hover:scale-[1.02] duration-300 ${
                  isDarkMode 
                    ? 'bg-neutral-900/40 border-emerald-500/10 hover:border-emerald-500/30' 
                    : 'bg-white border-slate-100 hover:shadow-lg'
                }`}
              >
                <div className="h-44 relative overflow-hidden">
                  <img 
                    src={category.image} 
                    alt={category.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 flex items-center space-x-2">
                    <div className="p-1.5 rounded-lg bg-emerald-500/25 border border-emerald-400/30 backdrop-blur-md">
                      {getIcon(category.iconName)}
                    </div>
                    <span className="text-white text-sm font-bold tracking-wide">{category.title}</span>
                  </div>
                </div>
                <div className="p-5">
                  <p className={`text-xs sm:text-sm leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    {category.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Beautiful Filterable Gallery */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Explore Masterpieces Catalog
            </h2>
            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Browse physical event layouts engineered by our team across major luxury estates.
            </p>
          </div>

          {/* Filter pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-4.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all ${
                  selectedFilter === filter 
                    ? 'bg-emerald-600 text-white shadow-md' 
                    : isDarkMode 
                      ? 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Gallery Grid */}
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredGallery.map((item) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  key={item.id}
                  className={`group rounded-2xl overflow-hidden border ${
                    isDarkMode ? 'bg-neutral-900/30 border-emerald-500/10' : 'bg-white border-slate-100 shadow-md'
                  }`}
                >
                  <div className="relative h-64 overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
                      <div>
                        <span className="text-emerald-400 text-xs font-mono font-bold tracking-wider uppercase">{item.category}</span>
                        <h4 className="text-white text-base font-bold mt-0.5">{item.title}</h4>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* SWS Event Rentals & Props Section */}
      <section className={`py-24 px-4 sm:px-6 lg:px-8 border-t border-b ${
        isDarkMode ? 'bg-neutral-950/20 border-emerald-500/10' : 'bg-slate-50/40 border-slate-200'
      }`}>
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-emerald-500 font-mono text-xs font-bold uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/25 inline-block mb-3">
              Rentals & Inventory
            </span>
            <h2 className={`text-2xl sm:text-4xl font-extrabold tracking-tight mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Premium Event Rentals & Props
            </h2>
            <p className={`text-sm sm:text-base leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Rent high-quality luxury furniture, grand backdrop frames, ambient lighting grids, and technical AV gear with direct upfront pricing. Select items to construct your estimate.
            </p>
          </div>

          {/* Catalog Layout Grid (Responsive Bento layout) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Search, Filters & Item Cards (8 cols on lg) */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Search & Filter bar (Mobile responsive) */}
              <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-center gap-4 ${
                isDarkMode ? 'bg-neutral-900/60 border-emerald-500/10' : 'bg-white border-slate-100 shadow-md'
              }`}>
                {/* Search Input */}
                <div className="relative w-full md:w-80 shrink-0">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={searchRentalQuery}
                    onChange={(e) => setSearchRentalQuery(e.target.value)}
                    placeholder="Search props, chairs, lights..."
                    className={`w-full pl-10 pr-4 py-2 rounded-xl border text-xs transition-colors focus:outline-none focus:border-emerald-500 ${
                      isDarkMode 
                        ? 'bg-neutral-950 border-slate-800 text-white placeholder-slate-500' 
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>

                {/* Horizontal Category Pill Scrollbar (Touch responsive) */}
                <div className="w-full overflow-x-auto no-scrollbar flex items-center gap-2 pb-1 md:pb-0">
                  {rentalCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedRentalCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase whitespace-nowrap transition-all ${
                        selectedRentalCategory === cat
                          ? 'bg-emerald-600 text-white'
                          : isDarkMode
                            ? 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Items Card Grid (2-column responsive) */}
              {filteredRentals.length === 0 ? (
                <div className={`p-12 text-center rounded-2xl border ${
                  isDarkMode ? 'bg-neutral-900/20 border-emerald-500/5' : 'bg-slate-50 border-slate-100'
                }`}>
                  <Info className="mx-auto w-8 h-8 text-slate-500 mb-3" />
                  <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    No rental products found matching your active filter criteria.
                  </p>
                  <button 
                    onClick={() => { setSelectedRentalCategory('All'); setSearchRentalQuery(''); }}
                    className="text-emerald-500 text-xs font-bold underline mt-2 block mx-auto"
                  >
                    Reset all filter terms
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {filteredRentals.map((item) => {
                    const currentQty = rentalCart[item.id] || 0;
                    return (
                      <div
                        key={item.id}
                        className={`group rounded-2xl overflow-hidden border transition-all duration-300 ${
                          currentQty > 0 
                            ? 'border-emerald-500/50 ring-1 ring-emerald-500/20 bg-emerald-500/5' 
                            : isDarkMode 
                              ? 'bg-neutral-900/30 border-emerald-500/10 hover:border-emerald-500/30' 
                              : 'bg-white border-slate-100 hover:shadow-lg'
                        }`}
                      >
                        {/* Card Top Image & Label */}
                        <div className="h-44 relative overflow-hidden bg-neutral-900">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                            loading="lazy"
                          />
                          <span className="absolute top-3 left-3 bg-neutral-950/80 backdrop-blur-md text-[10px] font-bold text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md font-mono uppercase">
                            {item.category}
                          </span>
                        </div>

                        {/* Card Body */}
                        <div className="p-5 space-y-3">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className={`text-sm font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                              {item.name}
                            </h4>
                            <span className="text-emerald-500 text-xs font-mono font-extrabold whitespace-nowrap shrink-0">
                              {item.price}
                            </span>
                          </div>

                          <p className={`text-xs leading-relaxed line-clamp-2 h-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            {item.description}
                          </p>

                          <div className={`flex items-center justify-between pt-3 border-t ${
                            isDarkMode ? 'border-emerald-500/10' : 'border-slate-100'
                          }`}>
                            <span className="text-[10px] text-slate-500 font-mono">
                              Available: {item.availableQty} units
                            </span>

                            {/* Qty Selector */}
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => updateCartItemQty(item.id, -1)}
                                disabled={currentQty === 0}
                                className={`p-1 rounded-md transition-colors ${
                                  currentQty === 0
                                    ? 'text-slate-600 cursor-not-allowed'
                                    : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                                }`}
                              >
                                <Minus size={14} />
                              </button>
                              <span className={`w-8 text-center text-xs font-mono font-bold ${
                                currentQty > 0 ? 'text-emerald-400' : 'text-slate-500'
                              }`}>
                                {currentQty}
                              </span>
                              <button
                                onClick={() => updateCartItemQty(item.id, 1)}
                                disabled={currentQty >= item.availableQty}
                                className={`p-1 rounded-md transition-colors ${
                                  currentQty >= item.availableQty
                                    ? 'text-slate-600 cursor-not-allowed'
                                    : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                                }`}
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column: Dynamic Cart Summary Sidebar (4 cols on lg) */}
            <div className="lg:col-span-4 lg:sticky lg:top-24">
              <div className={`p-6 rounded-2xl border space-y-6 ${
                isDarkMode 
                  ? 'bg-gradient-to-b from-neutral-900 to-neutral-950 border-emerald-500/10 shadow-2xl' 
                  : 'bg-white border-slate-200 shadow-xl'
              }`}>
                <div className="flex items-center justify-between border-b border-emerald-500/10 pb-4">
                  <div className="flex items-center space-x-2">
                    <ShoppingBag className="text-emerald-400" size={18} />
                    <h3 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      Estimate Builder
                    </h3>
                  </div>
                  <span className="bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    {getCartTotalItemCount()} items
                  </span>
                </div>

                {/* Cart list */}
                {getCartTotalItemCount() === 0 ? (
                  <div className="text-center py-10 space-y-2">
                    <span className="text-3xl block">🛒</span>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Your rental cart is empty. Use the selectors to construct an instantaneous quotation!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="max-h-60 overflow-y-auto space-y-3 pr-1.5 scrollbar-thin">
                      {Object.entries(rentalCart).map(([id, qty]) => {
                        const q = qty as number;
                        if (q === 0) return null;
                        const item = rentalList.find(r => r.id === id);
                        if (!item) return null;
                        const itemPrice = parsePrice(item.price);
                        const subtotal = itemPrice * q;
                        return (
                          <div key={id} className="flex items-start justify-between text-xs gap-2">
                            <div className="space-y-0.5">
                              <h5 className={`font-semibold line-clamp-1 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                                {item.name}
                              </h5>
                              <p className="text-slate-500 text-[10px]">
                                {q} x {item.price}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className={`font-mono font-bold block ${isDarkMode ? 'text-slate-300' : 'text-slate-900'}`}>
                                Rs. {subtotal.toLocaleString()}
                              </span>
                              <button 
                                onClick={() => updateCartItemQty(id, -q)}
                                className="text-red-400 text-[9px] hover:underline"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Subtotal calculation */}
                    <div className={`pt-4 border-t space-y-2.5 ${
                      isDarkMode ? 'border-emerald-500/10' : 'border-slate-100'
                    }`}>
                      <div className="flex justify-between items-center text-sm">
                        <span className={`font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Subtotal / Day</span>
                        <span className="text-emerald-500 font-mono font-extrabold text-base">
                          Rs. {getCartSubtotal().toLocaleString()}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-normal italic">
                        * Final transport logistics, labor handling fees, and refundable security deposits will be calculated upon formal contract generation.
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="space-y-3 pt-2">
                      <button
                        onClick={injectCartIntoBookingNotes}
                        className="w-full py-3 rounded-xl bg-emerald-600 text-white text-xs font-bold tracking-wider hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-600/10 flex items-center justify-center space-x-2"
                      >
                        <Sparkles size={14} />
                        <span>Inject into Booking Form</span>
                      </button>

                      <a
                        href={`https://wa.me/94768988970?text=Hello%20${encodeURIComponent(brandName)},%20I%20would%20like%20to%20get%20a%20formal%20quote%20for%20the%20following%20rental%20items:%0A${Object.entries(rentalCart).map(([id, qty]) => {
                          if (qty === 0) return '';
                          const item = rentalList.find(r => r.id === id);
                          return item ? `%20-%20${qty}x%20${encodeURIComponent(item.name)}%20(${encodeURIComponent(item.price)})%0A` : '';
                        }).join('')}%0ATotal%20Est.%20Rentals:%20Rs.%20${getCartSubtotal().toLocaleString()}%20/%20day.`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-3 rounded-xl border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-wider hover:bg-emerald-500/5 transition-colors flex items-center justify-center space-x-2"
                      >
                        <MessageSquare size={14} />
                        <span>Inquire on WhatsApp</span>
                      </a>

                      <button
                        onClick={clearCart}
                        className="w-full text-center text-[10px] text-slate-500 hover:text-red-400 transition-colors py-1.5"
                      >
                        Reset / Clear Estimate
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className={`py-20 px-4 sm:px-6 lg:px-8 border-t border-b ${
        isDarkMode ? 'bg-neutral-950/30 border-emerald-500/10' : 'bg-slate-50/60 border-slate-200'
      }`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Loved By Families & Executives
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonialsList.map((test) => (
              <div 
                key={test.id}
                className={`p-6 rounded-2xl border flex flex-col justify-between ${
                  isDarkMode ? 'bg-neutral-900/50 border-emerald-500/10' : 'bg-white border-slate-100 shadow-md'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center space-x-1">
                    {[...Array(test.rating)].map((_, i) => (
                      <Star key={i} size={15} className="fill-emerald-400 text-emerald-400" />
                    ))}
                  </div>
                  <p className={`text-xs sm:text-sm leading-relaxed italic ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    "{test.comment}"
                  </p>
                </div>
                <div className="flex items-center space-x-3 pt-6 mt-6 border-t border-emerald-500/10">
                  <img 
                    src={test.avatar} 
                    alt={test.name} 
                    className="w-10 h-10 rounded-full object-cover border border-emerald-500/25"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  <div>
                    <h4 className={`text-sm font-bold leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {test.name}
                    </h4>
                    <span className="text-[10px] text-emerald-500 font-medium font-mono mt-1 block">
                      {test.role}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Form Section */}
      <section id="booking-form-anchor" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className={`p-8 rounded-3xl border ${
            isDarkMode 
              ? 'bg-gradient-to-br from-neutral-900 to-black border-emerald-500/10 shadow-2xl' 
              : 'bg-white border-slate-200 shadow-xl'
          }`}>
            <div className="text-center mb-8">
              <h2 className={`text-2xl font-extrabold tracking-tight mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Inquire & Book Event Setup
              </h2>
              <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Share details of your upcoming event and our master decor directors will reach out with a custom moodboard.
              </p>
            </div>

            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.form 
                  key="booking-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleBookingSubmit} 
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Name */}
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        Your Full Name *
                      </label>
                      <div className="relative">
                        <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="text"
                          required
                          value={booking.name}
                          onChange={(e) => setBooking({ ...booking, name: e.target.value })}
                          className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm transition-colors focus:outline-none focus:border-emerald-500 ${
                            isDarkMode 
                              ? 'bg-neutral-950 border-slate-800 text-white' 
                              : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                          placeholder="Rajesh Singhania"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        Contact Phone *
                      </label>
                      <div className="relative">
                        <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="tel"
                          required
                          value={booking.phone}
                          onChange={(e) => setBooking({ ...booking, phone: e.target.value })}
                          className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm transition-colors focus:outline-none focus:border-emerald-500 ${
                            isDarkMode 
                              ? 'bg-neutral-950 border-slate-800 text-white' 
                              : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Event Date */}
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        Event Date *
                      </label>
                      <div className="relative">
                        <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="date"
                          required
                          value={booking.eventDate}
                          onChange={(e) => setBooking({ ...booking, eventDate: e.target.value })}
                          className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm transition-colors focus:outline-none focus:border-emerald-500 ${
                            isDarkMode 
                              ? 'bg-neutral-950 border-slate-800 text-white' 
                              : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Guest Size */}
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        Estimated Guests
                      </label>
                      <div className="relative">
                        <Users size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="number"
                          value={booking.guests}
                          onChange={(e) => setBooking({ ...booking, guests: parseInt(e.target.value) || 0 })}
                          className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm transition-colors focus:outline-none focus:border-emerald-500 ${
                            isDarkMode 
                              ? 'bg-neutral-950 border-slate-800 text-white' 
                              : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                          placeholder="250"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Service Type */}
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Theme / Service Selection
                    </label>
                    <select
                      value={booking.serviceType}
                      onChange={(e) => setBooking({ ...booking, serviceType: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border text-sm transition-colors focus:outline-none focus:border-emerald-500 ${
                        isDarkMode 
                          ? 'bg-neutral-950 border-slate-800 text-white' 
                          : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    >
                      <option value="Wedding Decoration">Wedding Stage & Entrance Setup</option>
                      <option value="Birthday Decoration">Themed Birthday Arches</option>
                      <option value="Church Floral decoration">Church Floral Arrangements</option>
                      <option value="Corporate Event Keynote">Corporate VIP Lounge & Main Stage</option>
                      <option value="Flower Decoration Only">Bespoke Exotic Flower Designs</option>
                      <option value="Outdoor / Garden setup">Garden Bohemian Lounge Decor</option>
                    </select>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Special Requirements / Venue Details
                    </label>
                    <textarea
                      value={booking.notes}
                      onChange={(e) => setBooking({ ...booking, notes: e.target.value })}
                      rows={3}
                      className={`w-full px-4 py-3 rounded-xl border text-sm transition-colors focus:outline-none focus:border-emerald-500 ${
                        isDarkMode 
                          ? 'bg-neutral-950 border-slate-800 text-white' 
                          : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                      placeholder="Please elaborate on your preferred color scheme or specific flower guidelines..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl bg-emerald-600 text-white font-bold tracking-wider hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-600/10 hover:shadow-emerald-500/30"
                  >
                    Submit Booking Request
                  </button>
                </motion.form>
              ) : (
                <motion.div 
                  key="booking-success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8 space-y-5"
                >
                  <div className="inline-flex p-4 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
                    <CheckCircle2 size={44} />
                  </div>
                  <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Inquiry Received Successfully!
                  </h3>
                  <div className={`p-5 rounded-2xl text-left text-xs sm:text-sm space-y-2 border max-w-md mx-auto ${
                    isDarkMode ? 'bg-neutral-950 border-emerald-500/10' : 'bg-slate-50 border-slate-100 shadow-inner'
                  }`}>
                    <p className="font-bold border-b border-emerald-500/10 pb-2 mb-2 text-emerald-500 font-mono">
                      BOOKING INQUIRY DETAILS
                    </p>
                    <p><span className="opacity-50 font-bold uppercase text-[10px] tracking-wider block">Client:</span> {booking.name}</p>
                    <p><span className="opacity-50 font-bold uppercase text-[10px] tracking-wider block">Service Type:</span> {booking.serviceType}</p>
                    <p><span className="opacity-50 font-bold uppercase text-[10px] tracking-wider block">Target Event Date:</span> {booking.eventDate}</p>
                    <p><span className="opacity-50 font-bold uppercase text-[10px] tracking-wider block">Est. Attendance:</span> {booking.guests} Guests</p>
                  </div>

                  <EmailCopySection
                    isDarkMode={isDarkMode}
                    name={booking.name}
                    email={booking.email}
                    phone={booking.phone}
                    brand="SWS Events"
                    serviceType={booking.serviceType}
                    eventDate={booking.eventDate}
                    guests={booking.guests}
                    notes={booking.notes}
                    amount={booking.serviceType.toLowerCase().includes('wedding') ? 150000 : 45000}
                    onDone={() => {
                      setIsSubmitted(false);
                      setBooking({
                        name: '',
                        phone: '',
                        email: '',
                        serviceType: 'Wedding Decoration',
                        eventDate: '',
                        guests: 150,
                        notes: ''
                      });
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

    </div>
  );
}
