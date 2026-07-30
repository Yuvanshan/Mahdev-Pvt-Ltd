'use client';

import { useState, useEffect } from 'react';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Briefcase, Calendar, CheckCircle, Search, Mail, Send, ChevronRight, X, FileText, UploadCloud } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function CareersPortal() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Application form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    jobId: '',
    resumeName: '',
    resumeUrl: '',
    message: ''
  });
  const [uploadingResume, setUploadingResume] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  // Status lookup
  const [lookupEmail, setLookupEmail] = useState('');
  const [lookupResults, setLookupResults] = useState<any[]>([]);
  const [lookingUp, setLookingUp] = useState(false);
  const [searched, setSearched] = useState(false);

  // Client-side image compression helper using HTML5 Canvas
  const compressImage = (file: File, maxWidth = 1024, maxHeight = 1024, quality = 0.6): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          }, 'image/jpeg', quality);
        };
      };
    });
  };

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'careers'), (snap) => {
      const list = snap.docs.map(docDoc => ({ id: docDoc.id, ...docDoc.data() }));
      setJobs(list);
      setLoading(false);
      if (list.length > 0) {
        setFormData(prev => ({ ...prev, jobId: list[0].id }));
      }
    });
    return () => unsub();
  }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.jobId) {
      alert("Please fill out all mandatory fields.");
      return;
    }
    if (!formData.resumeUrl) {
      alert("Please upload your CV / Resume (PDF or Image) first.");
      return;
    }

    setSubmitting(true);
    try {
      const selectedJob = jobs.find(j => j.id === formData.jobId);
      const appPayload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        jobId: formData.jobId,
        resumeName: formData.resumeName,
        resumeUrl: formData.resumeUrl,
        message: formData.message,
        jobTitle: selectedJob ? selectedJob.title : 'General Internship',
        status: 'Pending Review',
        timestamp: serverTimestamp()
      };

      await addDoc(collection(db, 'applications'), appPayload);

      confetti({
        particleCount: 100,
        spread: 60,
        colors: ['#c5a880', '#dfba73']
      });

      setApplySuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        jobId: jobs[0]?.id || '',
        resumeName: '',
        resumeUrl: '',
        message: ''
      });
      setTimeout(() => setApplySuccess(false), 8000);
    } catch (err) {
      console.error(err);
      alert("Application failed to send. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupEmail.trim()) return;

    setLookingUp(true);
    setSearched(true);
    try {
      const q = query(collection(db, 'applications'), where('email', '==', lookupEmail.trim()));
      const snap = await getDocs(q);
      const list = snap.docs.map(docDoc => ({ id: docDoc.id, ...docDoc.data() }));
      setLookupResults(list);
    } catch (err) {
      console.error("Lookup error", err);
    } finally {
      setLookingUp(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-navy-dark pt-32 pb-24 text-text-heading text-left">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Header */}
          <div className="text-center mb-16 flex flex-col gap-3">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-soft">MAHDEV CAREERS</span>
            <h1 className="font-display font-bold text-4xl sm:text-5xl text-text-heading tracking-tight">Join Our Innovation Squad</h1>
            <p className="font-sans text-text-body max-w-lg mx-auto text-xs sm:text-sm leading-relaxed">Operate at the intersection of logical software architectures and creative luxury design templates. Explore open positions below.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Column: Job Openings & Application Status Check */}
            <div className="lg:col-span-6 flex flex-col gap-8">
              <div className="bg-navy-medium rounded-xl p-6 sm:p-8 border border-card-border shadow-sm">
                <h3 className="font-display font-bold text-xl text-text-heading mb-6">Open Job Openings</h3>

                {loading ? (
                  <div className="py-8 flex flex-col items-center gap-2">
                    <div className="w-5 h-5 border-2 border-gold-soft border-t-transparent rounded-full animate-spin" />
                    <span className="text-[10px] text-text-body font-sans uppercase font-bold">Loading listings...</span>
                  </div>
                ) : jobs.length === 0 ? (
                  <div className="py-8 text-center text-text-body text-xs font-sans">
                    No active job postings. Please try again later.
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {jobs.map((job) => (
                      <div key={job.id} className="p-5 rounded-lg bg-navy-dark border border-card-border flex flex-col gap-3 hover:border-gold-soft/30 transition-all duration-200">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className="text-[8px] bg-navy-medium text-gold-soft border border-card-border px-2 py-0.5 rounded font-bold uppercase tracking-wider">{job.type}</span>
                            <h4 className="font-display font-bold text-base text-text-heading mt-1.5">{job.title}</h4>
                          </div>
                          <span className="text-[10px] text-green-400 font-semibold uppercase">{job.status}</span>
                        </div>
                        <p className="font-sans text-xs text-text-body leading-relaxed">{job.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Lookup widget */}
              <div className="bg-navy-medium rounded-xl p-6 sm:p-8 border border-card-border shadow-sm">
                <h3 className="font-display font-bold text-lg text-text-heading mb-2">Track Application Status</h3>
                <p className="text-text-body text-xs font-sans mb-6">Check the progress of your submitted resume by entering your email address below.</p>

                <form onSubmit={handleLookup} className="flex gap-2 items-center mb-4">
                  <input
                    type="email"
                    required
                    placeholder="Enter application email"
                    value={lookupEmail}
                    onChange={(e) => setLookupEmail(e.target.value)}
                    className="flex-1 bg-navy-dark border border-card-border focus:border-gold-soft/55 rounded-lg px-4 py-2.5 text-xs focus:outline-none text-text-heading font-sans"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-lg bg-gold-accent text-white hover:bg-gold-accent/90 transition-all font-sans text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5" />
                    LOOKUP
                  </button>
                </form>

                {lookingUp && (
                  <div className="text-xs text-text-body font-sans">Connecting with recruiters...</div>
                )}

                {!lookingUp && searched && lookupResults.length === 0 && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-sans">
                    No submitted applications found for `{lookupEmail}`.
                  </div>
                )}

                {!lookingUp && lookupResults.length > 0 && (
                  <div className="flex flex-col gap-2.5 mt-4">
                    <span className="text-[9px] uppercase tracking-wider text-gold-soft font-bold">Applications Found:</span>
                    {lookupResults.map((res) => (
                      <div key={res.id} className="p-3 rounded-lg bg-navy-dark border border-card-border flex justify-between items-center text-xs">
                        <div>
                          <span className="text-text-heading font-bold block">{res.jobTitle}</span>
                          <span className="text-[10px] text-text-body block mt-0.5">
                            Submitted via:{' '}
                            {res.resumeUrl ? (
                              <a href={res.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-gold-soft hover:underline font-semibold font-mono">
                                {res.resumeName || 'CV File'}
                              </a>
                            ) : (
                              <span className="font-mono">{res.resumeName || 'mock_resume.pdf'}</span>
                            )}
                          </span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                          res.status === 'Shortlisted' || res.status === 'Approved' ? 'bg-green-500/20 text-green-400' :
                          res.status === 'Rejected' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {res.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Application Form */}
            <div className="lg:col-span-6">
              <div className="bg-navy-medium rounded-xl p-6 sm:p-10 border border-card-border shadow-sm h-full flex flex-col justify-center">
                <h3 className="font-display font-bold text-2xl text-text-heading mb-6">Submit Application</h3>

                <form onSubmit={handleApply} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-text-body/60 uppercase tracking-widest font-sans">Job Title</label>
                    <select
                      value={formData.jobId}
                      onChange={(e) => setFormData({ ...formData, jobId: e.target.value })}
                      className="bg-navy-dark border border-card-border focus:border-gold-soft/50 rounded-lg px-4 py-3 text-xs sm:text-sm focus:outline-none text-text-heading font-sans transition-all [&>option]:bg-navy-dark"
                    >
                      {jobs.map((job) => (
                        <option key={job.id} value={job.id}>{job.title} ({job.department})</option>
                      ))}
                      <option value="general">General Internship / CV Bank Submission</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-text-body/60 uppercase tracking-widest font-sans">Full Name</label>
                      <input 
                        type="text" required placeholder="John Doe"
                        value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="bg-navy-dark border border-card-border focus:border-gold-soft/50 rounded-lg px-4 py-3 text-xs sm:text-sm focus:outline-none text-text-heading font-sans"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-text-body/60 uppercase tracking-widest font-sans">Email Address</label>
                      <input 
                        type="email" required placeholder="john@example.com"
                        value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="bg-navy-dark border border-card-border focus:border-gold-soft/50 rounded-lg px-4 py-3 text-xs sm:text-sm focus:outline-none text-text-heading font-sans"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-text-body/60 uppercase tracking-widest font-sans">Phone Number</label>
                      <input 
                        type="tel" required placeholder="+94 7X XXX XXXX"
                        value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="bg-navy-dark border border-card-border focus:border-gold-soft/50 rounded-lg px-4 py-3 text-xs sm:text-sm focus:outline-none text-text-heading font-sans"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-text-body/60 uppercase tracking-widest font-sans">Upload Resume (PDF or Image)</label>
                      <input 
                        type="file" 
                        accept=".pdf, image/*"
                        id="resume-file-input"
                        disabled={uploadingResume}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          setUploadingResume(true);
                          try {
                            let fileToUpload = file;
                            
                            // Client-side image compression for CVs uploaded as images
                            if (file.type.startsWith('image/') && file.size > 1024 * 1024) {
                              fileToUpload = await compressImage(file);
                            }

                            const storageRef = ref(storage, `resumes/${Date.now()}_${fileToUpload.name.replace(/[^a-zA-Z0-9.]/g, '_')}`);
                            const snapshot = await uploadBytes(storageRef, fileToUpload);
                            const downloadUrl = await getDownloadURL(snapshot.ref);
                            setFormData(prev => ({ 
                              ...prev, 
                              resumeName: fileToUpload.name, 
                              resumeUrl: downloadUrl 
                            }));
                          } catch (err) {
                            console.error("Resume upload failed", err);
                            alert("Failed to upload CV file. Please try again.");
                          } finally {
                            setUploadingResume(false);
                          }
                        }}
                        className="hidden"
                      />
                      <label 
                        htmlFor="resume-file-input"
                        className={`bg-navy-dark border border-card-border border-dashed rounded-lg px-4 py-2.5 text-xs text-text-body font-sans flex items-center justify-between cursor-pointer hover:border-gold-soft/40 transition-all ${
                          uploadingResume ? 'opacity-50 pointer-events-none' : ''
                        }`}
                      >
                        <span className="truncate max-w-[70%]">
                          {uploadingResume ? 'Processing & uploading...' : formData.resumeName || 'Choose PDF / Image...'}
                        </span>
                        <span className="text-[8px] bg-navy-medium border border-card-border px-2 py-1 rounded text-text-heading font-bold uppercase tracking-wider flex items-center gap-1 shrink-0">
                          {uploadingResume ? (
                            <div className="w-2.5 h-2.5 border border-gold-soft border-t-transparent rounded-full animate-spin" />
                          ) : formData.resumeUrl ? (
                            <FileText className="w-3.5 h-3.5 text-gold-soft" />
                          ) : (
                            <UploadCloud className="w-3.5 h-3.5 text-text-body" />
                          )}
                          {uploadingResume ? 'PROCESSING' : formData.resumeUrl ? 'READY' : 'UPLOAD'}
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-text-body/60 uppercase tracking-widest font-sans">Covering Note / Message</label>
                    <textarea 
                      rows={3} required placeholder="Detail your previous coding or event planning achievements..."
                      value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="bg-navy-dark border border-card-border focus:border-gold-soft/50 rounded-lg px-4 py-3 text-xs sm:text-sm focus:outline-none text-text-heading font-sans resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 bg-gold-accent text-white hover:bg-gold-accent/90 disabled:opacity-50 font-sans font-bold text-xs tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 mt-2 shadow cursor-pointer"
                  >
                    {submitting ? 'DISPATCHING DOSSIER...' : 'DISPATCH APPLICATION'}
                    <Send className="w-4 h-4" />
                  </button>

                  {applySuccess && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.98 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      className="flex items-center gap-3 p-4 bg-navy-medium border border-card-border rounded-lg mt-4 text-left"
                    >
                      <CheckCircle className="w-5 h-5 text-gold-soft shrink-0" />
                      <span className="text-xs text-gold-soft font-sans font-semibold leading-relaxed">
                        Dossier received! We have stored your candidacy securely. Track updates by checking your email status via the lookup panel on the left.
                      </span>
                    </motion.div>
                  )}
                </form>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
