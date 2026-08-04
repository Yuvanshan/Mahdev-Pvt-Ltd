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
    if (!formData.name || !formData.email || !formData.phone) {
      alert("Please fill out all mandatory fields (Name, Email, and Phone number).");
      return;
    }
    if (!formData.resumeUrl) {
      alert("Please upload your CV / Resume (PDF) first.");
      return;
    }

    setSubmitting(true);
    try {
      const appId = formData.jobId || 'general';
      const selectedJob = jobs.find(j => j.id === appId);
      const appPayload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        jobId: appId,
        resumeName: formData.resumeName,
        resumeUrl: formData.resumeUrl,
        message: formData.message,
        jobTitle: selectedJob ? selectedJob.title : (appId === 'general' ? 'General Internship / CV Bank' : 'General Internship'),
        status: 'Pending Review',
        timestamp: serverTimestamp()
      };

      // Write to applications collection
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

      <main className="min-h-screen bg-navy-dark pt-32 pb-24 text-white text-left">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Header */}
          <div className="text-center mb-16 flex flex-col gap-3">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-accent">MAHDEV CAREERS</span>
            <h1 className="font-display font-black text-4xl sm:text-5xl text-white tracking-tight">Join Our Innovation Squad</h1>
            <p className="font-sans text-gray-400 max-w-lg mx-auto text-xs sm:text-sm leading-relaxed">Operate at the intersection of logical software architectures and creative luxury design templates. Explore open positions below.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Column: Job Openings & Application Status Check */}
            <div className="lg:col-span-6 flex flex-col gap-8">
              <div className="glass rounded-3xl p-6 sm:p-8 border border-white/5">
                <h3 className="font-display font-black text-xl text-white mb-6">Open Job Openings</h3>

                {loading ? (
                  <div className="py-8 flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-gold-accent border-t-transparent rounded-full animate-spin" />
                    <span className="text-[10px] text-gray-500 font-sans uppercase font-bold">Loading listings...</span>
                  </div>
                ) : jobs.length === 0 ? (
                  <div className="py-8 text-center text-gray-500 text-xs font-sans">
                    No active job postings. Seed the database to view default opportunities.
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {jobs.map((job) => (
                      <div key={job.id} className="p-5 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-3 hover:border-gold-accent/20 transition-all text-left">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className="text-[8px] bg-gold-accent/15 text-gold-soft border border-gold-accent/25 px-2 py-0.5 rounded font-bold uppercase tracking-wider">{job.type}</span>
                            <h4 className="font-display font-bold text-base text-white mt-1.5">{job.title}</h4>
                          </div>
                          <span className="text-[10px] text-green-400 font-semibold uppercase">{job.status}</span>
                        </div>
                        <p className="font-sans text-xs text-gray-400 leading-relaxed">{job.description}</p>
                        {job.salary && (
                          <div className="text-[11px] font-sans text-gold-soft flex gap-1 mt-1">
                            <span className="font-bold uppercase tracking-wider">Salary:</span>
                            <span>{job.salary}</span>
                          </div>
                        )}
                        {job.requirements && (
                          <div className="mt-2 text-left">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-sans">Requirements:</span>
                            <p className="font-sans text-[11px] text-gray-400/90 whitespace-pre-line mt-1 pl-2 border-l border-white/10">{job.requirements}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Lookup widget */}
              <div className="glass-premium rounded-3xl p-6 sm:p-8 border border-gold-accent/15">
                <h3 className="font-display font-bold text-lg text-white mb-2">Track Application Status</h3>
                <p className="text-gray-400 text-xs font-sans mb-6">Check the progress of your submitted resume by entering your email address below.</p>

                <form onSubmit={handleLookup} className="flex gap-2 items-center mb-4">
                  <input
                    type="email"
                    required
                    placeholder="Enter application email"
                    value={lookupEmail}
                    onChange={(e) => setLookupEmail(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-2.5 text-xs focus:outline-none text-white font-sans"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-gold-accent to-gold-soft text-navy-dark font-sans text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <Search className="w-3.5 h-3.5" />
                    LOOKUP
                  </button>
                </form>

                {lookingUp && (
                  <div className="text-xs text-gray-500 font-sans">Connecting with recruiters...</div>
                )}

                {!lookingUp && searched && lookupResults.length === 0 && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-sans">
                    No submitted applications found for `{lookupEmail}`.
                  </div>
                )}

                {!lookingUp && lookupResults.length > 0 && (
                  <div className="flex flex-col gap-2.5 mt-4">
                    <span className="text-[9px] uppercase tracking-wider text-gold-accent font-bold">Applications Found:</span>
                    {lookupResults.map((res) => (
                      <div key={res.id} className="p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center text-xs">
                        <div>
                          <span className="text-white font-bold block">{res.jobTitle}</span>
                          <span className="text-[10px] text-gray-500 block mt-0.5">
                            Submitted via:{' '}
                            {res.resumeUrl ? (
                              <a href={res.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-gold-soft hover:underline font-semibold font-mono">
                                {res.resumeName || 'CV PDF'}
                              </a>
                            ) : (
                              <span className="font-mono">{res.resumeName || 'mock_resume.pdf'}</span>
                            )}
                          </span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
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
              <div className="glass-premium rounded-3xl p-6 sm:p-10 border border-gold-accent/15 shadow-2xl h-full flex flex-col justify-center">
                <h3 className="font-display font-black text-2xl text-white mb-6">Submit Application</h3>

                <form onSubmit={handleApply} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-sans">Job Title</label>
                    <select
                      value={formData.jobId}
                      onChange={(e) => setFormData({ ...formData, jobId: e.target.value })}
                      className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs sm:text-sm focus:outline-none text-white font-sans transition-all [&>option]:bg-navy-dark"
                    >
                      {jobs.map((job) => (
                        <option key={job.id} value={job.id}>{job.title} ({job.department})</option>
                      ))}
                      <option value="general">General Internship / CV Bank Submission</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-sans">Full Name</label>
                      <input 
                        type="text" required placeholder="John Doe"
                        value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs sm:text-sm focus:outline-none text-white font-sans"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-sans">Email Address</label>
                      <input 
                        type="email" required placeholder="john@example.com"
                        value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs sm:text-sm focus:outline-none text-white font-sans"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-sans">Phone Number</label>
                      <input 
                        type="tel" required placeholder="+94 7X XXX XXXX"
                        value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs sm:text-sm focus:outline-none text-white font-sans"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-sans">Upload Resume (PDF)</label>
                      <input 
                        type="file" 
                        accept=".pdf"
                        id="resume-file-input"
                        disabled={uploadingResume}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          
                          if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
                            alert("Only PDF documents are allowed.");
                            return;
                          }

                          setUploadingResume(true);
                          try {
                            // Try 1: Local API Upload Route (Best for local dev and standard hosting)
                            try {
                              const uploadFormData = new FormData();
                              uploadFormData.append('file', file);
                              const uploadRes = await fetch('/api/upload', {
                                method: 'POST',
                                body: uploadFormData
                              });
                              if (uploadRes.ok) {
                                const uploadData = await uploadRes.json();
                                if (uploadData.url) {
                                  setFormData(prev => ({
                                    ...prev,
                                    resumeName: file.name,
                                    resumeUrl: uploadData.url
                                  }));
                                  setUploadingResume(false);
                                  return;
                                }
                              }
                            } catch (localErr) {
                              console.warn("Local API upload failed, falling back to Firebase Storage:", localErr);
                            }

                            // Try 2: Firebase Storage (Cloud fallback)
                            try {
                              const storageRef = ref(storage, `resumes/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`);
                              const snapshot = await uploadBytes(storageRef, file);
                              const downloadUrl = await getDownloadURL(snapshot.ref);
                              setFormData(prev => ({
                                ...prev,
                                resumeName: file.name,
                                resumeUrl: downloadUrl
                              }));
                              setUploadingResume(false);
                              return;
                            } catch (fbErr) {
                              console.warn("Firebase Storage upload failed, falling back to Base64 embedding:", fbErr);
                            }

                            // Try 3: Base64 data URL embedding (Fail-proof database-only fallback)
                            const reader = new FileReader();
                            reader.onload = () => {
                              const base64Url = reader.result as string;
                              setFormData(prev => ({
                                ...prev,
                                resumeName: file.name,
                                resumeUrl: base64Url
                              }));
                              setUploadingResume(false);
                            };
                            reader.onerror = () => {
                              throw new Error("FileReader failed to convert file to Base64.");
                            };
                            reader.readAsDataURL(file);

                          } catch (err) {
                            console.error("All resume upload methods failed:", err);
                            alert("Failed to upload CV file. Please try again.");
                            setUploadingResume(false);
                          }
                        }}
                        className="hidden"
                      />
                      <label 
                        htmlFor="resume-file-input"
                        className={`bg-white/5 border border-white/10 border-dashed rounded-xl px-4 py-2.5 text-xs text-gray-400 font-sans flex items-center justify-between cursor-pointer hover:border-gold-accent/40 transition-all ${
                          uploadingResume ? 'opacity-50 pointer-events-none' : ''
                        }`}
                      >
                        <span className="truncate max-w-[70%]">
                          {uploadingResume ? 'Uploading resume PDF...' : formData.resumeName || 'Choose PDF file...'}
                        </span>
                        <span className="text-[8px] bg-white/5 border border-white/10 px-2 py-1 rounded text-white font-bold uppercase tracking-wider flex items-center gap-1">
                          {uploadingResume ? (
                            <div className="w-2.5 h-2.5 border border-white border-t-transparent rounded-full animate-spin" />
                          ) : formData.resumeUrl ? (
                            <FileText className="w-3.5 h-3.5 text-gold-soft" />
                          ) : (
                            <UploadCloud className="w-3.5 h-3.5" />
                          )}
                          {uploadingResume ? 'UPLOADING' : formData.resumeUrl ? 'READY' : 'UPLOAD'}
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-sans">Covering Note / Message</label>
                    <textarea 
                      rows={3} required placeholder="Detail your previous coding or event planning achievements..."
                      value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="bg-white/5 border border-white/10 focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs sm:text-sm focus:outline-none text-white font-sans resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 bg-gradient-to-r from-gold-accent to-gold-soft disabled:opacity-50 text-navy-dark font-sans font-bold text-sm tracking-wider rounded-xl transition-all hover:brightness-110 flex items-center justify-center gap-2 mt-2 shadow-lg shadow-gold-accent/15"
                  >
                    {submitting ? 'DISPATCHING DOSSIER...' : 'DISPATCH APPLICATION'}
                    <Send className="w-4 h-4" />
                  </button>

                  {applySuccess && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      className="flex items-center gap-3 p-4 bg-gold-accent/10 border border-gold-accent/30 rounded-2xl mt-4 text-left"
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
