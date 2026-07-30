'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, Calendar, Mic, MicOff, Volume2, VolumeX, Database, HelpCircle } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  actions?: Array<{ label: string; action: string }>;
}

const KNOWLEDGE_FAQ: Record<string, string> = {
  price: "Mahdev offers competitive luxury services:\n\n✨ SWS Events Stage: Rs. 75,000 - Rs. 185,000\n📷 Studio U1 Shoots: Rs. 24,999 - Rs. 119,999\n💻 IT Cloud POS: Rs. 4,500/mo. ERP: Rs. 250,000\n🚗 Travels Tours: Rs. 18,000 - Rs. 45,000",
  contact: "📍 Office Address: 41/22, Pickerings Road, Kotahena, Colombo 13.\n📞 Hotline Lines: 076 898 8970 / 075 092 8078\n📧 Email: info.mahdev.lk@gmail.com",
  divisions: "We operate SWS Event Management, Studio U1 Photography, Mahdev IT solutions, and Mahdev Travels. Each division operates with dedicated specialists.",
  booking: "You can lock in booking slots using our online calendar. Would you like me to open the Booking Form now?",
  erp: "Mahdev ERP provides multi-warehouse stock management, double-entry bookkeeping sheets, thermal bill POS terminals, and student databases for schools.",
  travels: "Mahdev Travels runs chauffeured high-roof Toyota KDH vans (9-14 seats) and Mercedes C-Class cars for VIP tours across Sigiriya, Galle, and Ella."
};

const CONTEXT_RECOMS: Record<string, string> = {
  'sws-events': "You are currently viewing SWS Event Management. I recommend our Royal Gold Stage package (Rs. 185,000) featuring fresh orchid flower canopies and dry ice smoke runs.",
  'u1-studio': "You are on Studio U1 Photography. I recommend checking our Before-After color-graded gallery and booking our Imperial Cinematic photography package.",
  'it-solutions': "You are on Mahdev IT Solutions. Let's arrange a 1-hour Technical Consultation to outline POS setups or custom Next.js system architectures.",
  'travels': "You are browsing Mahdev Travels. Our KDH passenger vans are dual-A/C and fully chauffeured. Ideal for airport transfers or Ella greenery sunset packages."
};

export default function AIAssistant({ onOpenBooking }: { onOpenBooking: () => void }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState<'en' | 'si' | 'ta'>('en');
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'ai', text: "Greetings! Welcome to the Mahdev Corporate Concierge. How may I customize your experience today?", timestamp: new Date() }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [voiceInputActive, setVoiceInputActive] = useState(false);
  const [voiceSynthesisActive, setVoiceSynthesisActive] = useState(true);

  // Lead collection flow state
  const [collectingLead, setCollectingLead] = useState(false);
  const [leadStep, setLeadStep] = useState(0); // 0: Name, 1: Contact (Phone/Email)
  const [leadData, setLeadData] = useState({ name: '', contact: '', topic: '' });

  const feedEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll chat feed
  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Initializing Web Speech Recognition API
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechClass) {
        const rec = new SpeechClass();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = lang === 'si' ? 'si-LK' : lang === 'ta' ? 'ta-LK' : 'en-US';

        rec.onresult = (e: any) => {
          const text = e.results[0][0].transcript;
          setInputText(text);
          setVoiceInputActive(false);
          handleSend(text);
        };

        rec.onerror = () => setVoiceInputActive(false);
        rec.onend = () => setVoiceInputActive(false);
        recognitionRef.current = rec;
      }
    }
  }, [lang]);

  // Text to Speech voice synthesizer
  const speakText = (text: string) => {
    if (!voiceSynthesisActive || typeof window === 'undefined') return;
    try {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*#✨📷💻🚗📍📞📧💬]/g, ''); // strip markdown formatting & emojis
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = lang === 'si' ? 'si-LK' : lang === 'ta' ? 'ta-LK' : 'en-US';
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("Speech synthesis failed", err);
    }
  };

  const handleMicToggle = () => {
    if (!recognitionRef.current) {
      alert("Voice speech recognition is not supported on this browser.");
      return;
    }
    if (voiceInputActive) {
      recognitionRef.current.stop();
      setVoiceInputActive(false);
    } else {
      setVoiceInputActive(true);
      recognitionRef.current.start();
    }
  };

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = { sender: 'user', text: textToSend, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // 1. Lead capturing questionnaire step routing
    if (collectingLead) {
      setTimeout(() => {
        if (leadStep === 0) {
          setLeadData(prev => ({ ...prev, name: textToSend }));
          setMessages(prev => [...prev, {
            sender: 'ai',
            text: "Thank you. Kindly specify your phone number or email address, and our executive office will connect with you.",
            timestamp: new Date()
          }]);
          setLeadStep(1);
        } else {
          // Save lead to Firestore leads collection
          const finalLead = {
            name: leadData.name,
            contactDetail: textToSend,
            topic: leadData.topic,
            pageContext: pathname || 'Homepage',
            timestamp: serverTimestamp()
          };
          addDoc(collection(db, 'leads'), finalLead);

          setMessages(prev => [...prev, {
            sender: 'ai',
            text: `✓ Lead captured successfully. Thank you ${leadData.name}, our directors will message you shortly!`,
            timestamp: new Date()
          }]);
          speakText("Lead captured successfully. Our directors will message you shortly!");
          setCollectingLead(false);
        }
        setIsTyping(false);
      }, 1000);
      return;
    }

    // 2. Process query response matching
    setTimeout(async () => {
      const lower = textToSend.toLowerCase();
      let response = "";
      let actions: Message['actions'] = undefined;

      // Check current page context for recommendations
      if (lower.includes('page') || lower.includes('where am i') || lower.includes('recommend')) {
        const slug = pathname?.split('/').pop() || '';
        response = CONTEXT_RECOMS[slug] || "You are currently exploring Mahdev main hub. Try browsing SWS Event Management or IT Solutions pages.";
      } else {
        // Keyword checking
        let matched = false;
        for (const key of Object.keys(KNOWLEDGE_FAQ)) {
          if (lower.includes(key)) {
            response = KNOWLEDGE_FAQ[key];
            if (key === 'booking') actions = [{ label: 'Open Booking Calendar', action: 'trigger_booking' }];
            matched = true;
            break;
          }
        }

        // If no matches, fallback to lead capture trigger
        if (!matched) {
          response = "I couldn't locate specific details on that topic in our FAQs. Would you like me to collect your details so a director can call you directly?";
          actions = [
            { label: 'Connect Me With Sales', action: 'start_lead' },
            { label: 'View Booking System', action: 'trigger_booking' }
          ];
        }
      }

      setMessages(prev => [...prev, { sender: 'ai', text: response, timestamp: new Date(), actions }]);
      setIsTyping(false);
      speakText(response);
    }, 1200);
  };

  const handleAction = (action: string) => {
    if (action === 'trigger_booking') {
      setIsOpen(false);
      onOpenBooking();
    } else if (action === 'start_lead') {
      setCollectingLead(true);
      setLeadStep(0);
      setLeadData(prev => ({ ...prev, topic: messages[messages.length - 2]?.text || 'General enquiry' }));
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: "Sure. Let's record a contact request. First, what is your full name?",
        timestamp: new Date()
      }]);
      speakText("What is your name?");
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.98 }}
            className="w-[340px] sm:w-[380px] h-[500px] rounded-xl bg-navy-dark border border-card-border shadow-lg flex flex-col overflow-hidden mb-4 pointer-events-auto"
          >
            {/* Header with language selectors */}
            <div className="p-4 bg-navy-medium border-b border-card-border flex justify-between items-center text-left">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-navy-medium border border-card-border flex items-center justify-center text-gold-soft">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm text-text-heading">Mahdev Concierge</h4>
                  <div className="flex gap-1.5 mt-0.5">
                    {['en', 'si', 'ta'].map((l) => (
                      <button
                        key={l}
                        onClick={() => setLang(l as any)}
                        className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded cursor-pointer ${
                          lang === l ? 'bg-gold-accent text-white' : 'bg-navy-medium border border-card-border text-text-body'
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Speaker sound toggle */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setVoiceSynthesisActive(!voiceSynthesisActive)}
                  className="p-1.5 rounded-md hover:bg-navy-medium text-text-body cursor-pointer"
                  title={voiceSynthesisActive ? 'Mute Speech' : 'Enable Speech'}
                >
                  {voiceSynthesisActive ? <Volume2 className="w-4 h-4 text-gold-soft" /> : <VolumeX className="w-4 h-4 text-text-body/60" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-md hover:bg-navy-medium text-text-body cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Message list */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col max-w-[85%] ${
                    msg.sender === 'user' ? 'ml-auto items-end text-right' : 'mr-auto items-start text-left'
                  }`}
                >
                  <div
                    className={`p-3 rounded-lg text-xs leading-relaxed font-sans ${
                      msg.sender === 'user'
                        ? 'bg-gold-accent text-white font-medium rounded-tr-none'
                        : 'bg-navy-medium border border-card-border text-text-heading rounded-tl-none'
                    } whitespace-pre-line`}
                  >
                    {msg.text}
                  </div>
                  {msg.actions && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {msg.actions.map((act, aIdx) => (
                        <button
                          key={aIdx}
                          onClick={() => handleAction(act.action)}
                          className="px-2.5 py-1 rounded bg-navy-medium border border-card-border text-gold-soft text-[9px] font-semibold uppercase hover:bg-gold-accent hover:text-white transition-all cursor-pointer"
                        >
                          {act.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="mr-auto flex items-center gap-1.5 p-3 rounded-lg bg-navy-medium border border-card-border text-text-body text-xs">
                  <span className="w-1.5 h-1.5 bg-text-body rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-text-body rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-text-body rounded-full animate-bounce" />
                </div>
              )}
              <div ref={feedEndRef} />
            </div>

            {/* Form inputs */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(inputText);
              }}
              className="p-3 border-t border-card-border bg-navy-dark flex gap-2 items-center"
            >
              <button
                type="button"
                onClick={handleMicToggle}
                className={`p-2 rounded-lg border transition-all flex items-center justify-center cursor-pointer ${
                  voiceInputActive 
                    ? 'bg-red-500/20 border-red-500 text-red-500 animate-pulse' 
                    : 'bg-navy-medium border-card-border text-text-body hover:text-gold-soft'
                }`}
                title="Dictate message"
              >
                {voiceInputActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <input
                type="text"
                placeholder={voiceInputActive ? "Listening..." : "Ask prices, consults..."}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={voiceInputActive}
                className="flex-1 bg-navy-medium border border-card-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-gold-soft/50 text-text-heading placeholder-gray-500 font-sans"
              />
              <button
                type="submit"
                className="p-2 rounded-lg bg-gold-accent text-white hover:bg-gold-accent/90 transition-all flex items-center justify-center cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating assistant trigger */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-12 h-12 rounded-full bg-gold-accent text-white flex items-center justify-center shadow-md cursor-pointer pointer-events-auto border border-card-border relative"
      >
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold-soft rounded-full border border-card-border text-[8px] font-bold text-white flex items-center justify-center">
          AI
        </span>
        <MessageSquare className="w-5 h-5" />
      </motion.button>
    </div>
  );
}
