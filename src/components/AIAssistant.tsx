'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, Calendar, Phone, Briefcase } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  actions?: Array<{ label: string; action: string }>;
}

const FAQ_DATABASE = [
  {
    keywords: ['price', 'pricing', 'cost', 'how much', 'package', 'packages'],
    response: "Mahdev offers transparent, premium packages across our divisions:\n\n✨ **SWS Events:** Packages range from Silver Blossom (Rs. 75,000) to Royal Gold Imperial (Rs. 185,000+).\n📷 **Studio U1:** Shoots start at Rs. 24,999 (Essential) up to Rs. 119,999 (Grand Masterpiece).\n💻 **IT Solutions:** POS SaaS licenses start at Rs. 4,500/mo. Enterprise ERP setups start at Rs. 250,000.\n🚗 **Travels:** Curated day tours start from Rs. 18,000, and multi-day travels (like Ella escape) start from Rs. 45,000."
  },
  {
    keywords: ['book', 'booking', 'reserve', 'reservation', 'appointment'],
    response: "You can book any service online! Select from SWS Event Management, Studio U1 Photography, Mahdev IT Consultation, or Mahdev Travels. Would you like me to guide you to our Booking panel?",
    actions: [{ label: 'Open Booking Form', action: 'trigger_booking' }]
  },
  {
    keywords: ['contact', 'phone', 'whatsapp', 'email', 'number', 'address', 'office', 'where'],
    response: "Here are our corporate contact channels:\n\n📍 **Main Office:** 41/22, Pickerings Road, Kotahena, Colombo 13, Sri Lanka.\n📞 **Phone Lines:** 076 898 8970 / 075 092 8078\n📧 **Email:** info.mahdev.lk@gmail.com\n💬 **WhatsApp:** [Launch Direct WhatsApp Chat](https://wa.me/94768988970)"
  },
  {
    keywords: ['division', 'divisions', 'business', 'companies', 'what do you do'],
    response: "Mahdev Pvt Ltd operates five core premium divisions:\n\n1️⃣ **SWS Event Management:** Premium stage decorations and floral setups.\n2️⃣ **Studio U1 Photography:** Cinematic photography & drone videography.\n3️⃣ **Mahdev IT Solutions:** Enterprise ERP SaaS, POS, websites & custom code.\n4️⃣ **Mahdev Travels:** Luxury passenger vans (Toyota KDH) and VIP chauffeurs.\n5️⃣ **Future expansions:** Support for healthcare, education, real estate, and e-commerce."
  },
  {
    keywords: ['erp', 'pos', 'software', 'website', 'it', 'networking', 'cctv'],
    response: "Mahdev IT Solutions designs enterprise platforms. We build dual-entry ledger ERP tools, offline-first cloud synced POS terminals, custom mobile/web client systems, IP CCTV matrices, and high-performance server grids. Let us know if you want to book an IT consultation!"
  },
  {
    keywords: ['van', 'travel', 'car', 'driver', 'chauffeur', 'tour', 'packages', 'sri lanka', 'airport'],
    response: "Mahdev Travels provides premium transport suites across Sri Lanka. We operate dual-A/C Toyota KDH high-roof passenger vans (9-14 seats) and Mercedes C-Class wedding cars with professional chauffeurs. Airport pick-ups and custom tourist packages (Sigiriya, Ella, Galle Fort) are fully available."
  }
];

export default function AIAssistant({ onOpenBooking }: { onOpenBooking: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: "Greetings! Welcome to the Mahdev Corporate Suite. I am your AI Assistant. How can I help you customize your luxury experience today?",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const feedEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Add user message
    const userMsg: Message = { sender: 'user', text: textToSend, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Write conversation query to Firestore analytics for lead capturing
    try {
      await addDoc(collection(db, 'assistant_queries'), {
        query: textToSend,
        timestamp: serverTimestamp()
      });
    } catch (err) {
      console.warn("Analytics error", err);
    }

    // Process reply matching keywords
    setTimeout(() => {
      const lower = textToSend.toLowerCase();
      let matchedResponse = "I'm sorry, I couldn't fully find details on that specific topic. Feel free to contact our Colombo head office directly at 076 898 8970 or tap below to chat on WhatsApp.";
      let matchedActions: Message['actions'] = undefined;

      for (const faq of FAQ_DATABASE) {
        if (faq.keywords.some(k => lower.includes(k))) {
          matchedResponse = faq.response;
          if (faq.actions) matchedActions = faq.actions;
          break;
        }
      }

      setMessages(prev => [...prev, {
        sender: 'ai',
        text: matchedResponse,
        timestamp: new Date(),
        actions: matchedActions
      }]);
      setIsTyping(false);
    }, 1000); // realistic typing delay
  };

  const handleAction = (action: string) => {
    if (action === 'trigger_booking') {
      setIsOpen(false);
      onOpenBooking();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[999]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="w-[340px] sm:w-[380px] h-[520px] rounded-3xl glass-premium border border-gold-accent/25 shadow-2xl flex flex-col overflow-hidden mb-4"
          >
            {/* Header */}
            <div className="p-4 bg-navy-medium/80 border-b border-white/5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold-accent/15 border border-gold-accent/30 flex items-center justify-center text-gold-soft">
                  <Bot className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm text-white">Mahdev AI</h4>
                  <span className="text-[10px] text-green-400 font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" />
                    Online Support
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Message Feed */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col max-w-[80%] ${
                    msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                  }`}
                >
                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed font-sans ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-gold-accent to-gold-soft text-navy-dark font-semibold rounded-br-none'
                        : 'bg-white/5 border border-white/5 text-gray-200 rounded-bl-none'
                    } whitespace-pre-line`}
                  >
                    {msg.text}
                  </div>
                  {msg.actions && (
                    <div className="mt-2 flex gap-2">
                      {msg.actions.map((act, aIdx) => (
                        <button
                          key={aIdx}
                          onClick={() => handleAction(act.action)}
                          className="px-3 py-1.5 rounded-lg bg-gold-accent/10 border border-gold-accent/30 text-gold-soft text-[10px] font-bold uppercase hover:bg-gold-accent hover:text-navy-dark transition-all flex items-center gap-1"
                        >
                          <Calendar className="w-3 h-3" />
                          {act.label}
                        </button>
                      ))}
                    </div>
                  )}
                  <span className="text-[8px] text-gray-500 mt-1">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}

              {isTyping && (
                <div className="mr-auto flex items-center gap-1.5 p-3 rounded-2xl bg-white/5 text-gray-400 text-xs">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                </div>
              )}
              <div ref={feedEndRef} />
            </div>

            {/* Quick Suggestions */}
            <div className="px-4 py-2 border-t border-white/5 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none select-none">
              {[
                { text: 'Check Pricing', query: 'Show me package prices' },
                { text: 'How to Book', query: 'I want to book an event' },
                { text: 'IT Consultation', query: 'Tell me about IT Systems' },
                { text: 'Travel Fleet', query: 'What vehicles do you have?' }
              ].map((sug, sIdx) => (
                <button
                  key={sIdx}
                  onClick={() => handleSend(sug.query)}
                  className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] text-gray-400 hover:text-gold-soft hover:border-gold-accent/20 transition-all font-semibold"
                >
                  {sug.text}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(inputText);
              }}
              className="p-3 border-t border-white/5 bg-navy-dark/90 flex gap-2 items-center"
            >
              <input
                type="text"
                placeholder="Ask about prices, bookings, tours..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-gold-accent/50 text-white placeholder-gray-500 font-sans"
              />
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-gradient-to-r from-gold-accent to-gold-soft text-navy-dark hover:brightness-110 transition-all flex items-center justify-center"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 rounded-full bg-gradient-to-r from-gold-accent to-gold-soft text-navy-dark flex items-center justify-center shadow-xl shadow-gold-accent/20 cursor-pointer pointer-events-auto border border-gold-soft/20 relative"
      >
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full border border-navy-dark text-[8px] font-bold text-white flex items-center justify-center">
          AI
        </span>
        <MessageSquare className="w-6 h-6" />
      </motion.button>
    </div>
  );
}
