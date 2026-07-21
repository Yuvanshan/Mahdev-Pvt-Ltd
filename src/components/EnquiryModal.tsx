import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, CheckCircle, AlertCircle, Phone, Mail, MapPin, Calendar, Package, MessageSquare, User } from 'lucide-react';

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  brand?: 'SWS' | 'Photography' | 'IT' | 'Travels' | 'General';
  itemId?: string;
  itemTitle?: string;
  prefillEventType?: string;
  prefillPackage?: string;
  isDarkMode?: boolean;
}

const EVENT_TYPES = [
  'Wedding', 'Birthday', 'Corporate Event', 'Engagement', 'Home Decoration',
  'Baby Shower', 'Outdoor Event', 'Anniversary', 'Product Launch', 'Custom Event',
  'Airport Transfer', 'Wedding Transport', 'Tour Package', 'Photography Session',
  'Website Development', 'Mobile App', 'ERP System', 'Other'
];

export default function EnquiryModal({
  isOpen,
  onClose,
  brand = 'General',
  itemId,
  itemTitle,
  prefillEventType = '',
  prefillPackage = '',
  isDarkMode = true
}: EnquiryModalProps) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    eventType: prefillEventType,
    eventDate: '',
    location: '',
    packageRequired: prefillPackage,
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      setErrorMsg('Name and phone number are required.');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          brand,
          itemId: itemId || '',
          itemTitle: itemTitle || ''
        })
      });

      if (res.ok) {
        setSubmitStatus('success');
        setForm({ name: '', phone: '', email: '', eventType: prefillEventType, eventDate: '', location: '', packageRequired: prefillPackage, message: '' });
        setTimeout(() => {
          setSubmitStatus('idle');
          onClose();
        }, 3000);
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Failed to submit enquiry. Please try again.');
        setSubmitStatus('error');
      }
    } catch (err) {
      setErrorMsg('Network error. Please check your connection and try again.');
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const brandColor = {
    SWS: { ring: 'ring-pink-500/40', btn: 'from-pink-600 to-rose-600', badge: 'bg-pink-500/20 text-pink-300 border-pink-500/30', label: 'SWS Event Management' },
    Photography: { ring: 'ring-purple-500/40', btn: 'from-purple-600 to-indigo-600', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30', label: 'Photography Studio' },
    IT: { ring: 'ring-blue-500/40', btn: 'from-blue-600 to-cyan-600', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30', label: 'IT Solutions' },
    Travels: { ring: 'ring-amber-500/40', btn: 'from-amber-600 to-orange-600', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30', label: 'Mahdev Travels' },
    General: { ring: 'ring-purple-500/40', btn: 'from-purple-600 to-indigo-600', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30', label: 'Mahdev Pvt Ltd' }
  }[brand] || { ring: 'ring-purple-500/40', btn: 'from-purple-600 to-indigo-600', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30', label: 'Mahdev' };

  const inputClass = `w-full px-4 py-2.5 rounded-xl text-sm border bg-white/5 backdrop-blur-sm text-white placeholder-slate-500 border-white/10 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all`;
  const labelClass = `block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-slate-950/95 backdrop-blur-2xl shadow-2xl shadow-purple-900/20 ring-1 ${brandColor.ring}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-6 pb-4 bg-slate-950/95 backdrop-blur-xl border-b border-white/5">
              <div>
                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border mb-2 ${brandColor.badge}`}>
                  {brandColor.label}
                </span>
                <h2 className="text-xl font-extrabold text-white leading-tight">
                  {itemTitle ? `Enquire: ${itemTitle}` : 'Send an Enquiry'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">We'll get back to you within 24 hours</p>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Success State */}
            <AnimatePresence mode="wait">
              {submitStatus === 'success' ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center p-12 text-center gap-4"
                >
                  <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <CheckCircle size={40} className="text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Enquiry Sent!</h3>
                  <p className="text-sm text-slate-300 max-w-xs">
                    Thank you, <strong className="text-white">{form.name || 'valued customer'}</strong>! 
                    We've received your enquiry and will contact you shortly at <strong className="text-white">{form.phone}</strong>.
                  </p>
                  <p className="text-xs text-slate-500">This window will close automatically...</p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="p-6 space-y-4"
                >
                  {/* Row: Name + Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>
                        <User size={10} className="inline mr-1" />Customer Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Your full name"
                        required
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>
                        <Phone size={10} className="inline mr-1" />Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="+94 7X XXX XXXX"
                        required
                        className={inputClass}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className={labelClass}>
                      <Mail size={10} className="inline mr-1" />Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      className={inputClass}
                    />
                  </div>

                  {/* Row: Event Type + Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>
                        <Package size={10} className="inline mr-1" />Event Type
                      </label>
                      <select
                        name="eventType"
                        value={form.eventType}
                        onChange={handleChange}
                        className={inputClass + ' cursor-pointer'}
                      >
                        <option value="">Select event type...</option>
                        {EVENT_TYPES.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>
                        <Calendar size={10} className="inline mr-1" />Event Date
                      </label>
                      <input
                        type="date"
                        name="eventDate"
                        value={form.eventDate}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                        className={inputClass + ' cursor-pointer'}
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className={labelClass}>
                      <MapPin size={10} className="inline mr-1" />Location / Venue
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      placeholder="City, Venue, or Hotel name"
                      className={inputClass}
                    />
                  </div>

                  {/* Required Package */}
                  <div>
                    <label className={labelClass}>
                      <Package size={10} className="inline mr-1" />Required Package / Service
                    </label>
                    <input
                      type="text"
                      name="packageRequired"
                      value={form.packageRequired}
                      onChange={handleChange}
                      placeholder="e.g. Premium Wedding Package, Airport Transfer..."
                      className={inputClass}
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className={labelClass}>
                      <MessageSquare size={10} className="inline mr-1" />Additional Message
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Tell us more about your requirements, guest count, special requests..."
                      className={inputClass + ' resize-none'}
                    />
                  </div>

                  {/* Error */}
                  {errorMsg && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                      <AlertCircle size={14} />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3.5 rounded-2xl bg-gradient-to-r ${brandColor.btn} text-white font-bold text-sm uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Sending Enquiry...</span>
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>Send Enquiry</span>
                      </>
                    )}
                  </button>

                  <p className="text-center text-[10px] text-slate-600">
                    Your enquiry will be emailed to info.mahdev.lk@gmail.com and tracked in our Admin Portal.
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
