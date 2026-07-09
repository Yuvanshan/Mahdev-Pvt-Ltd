/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mail, Copy, Check, ExternalLink, FileText } from 'lucide-react';
import { formatEmailBody, generateMailtoUri, sendEmailAutomatically } from '../utils/emailHelper';

interface EmailCopySectionProps {
  isDarkMode: boolean;
  name: string;
  email?: string;
  phone: string;
  brand?: string;
  serviceType: string;
  eventDate?: string;
  endDate?: string;
  location?: string;
  guests?: number | string;
  budget?: string;
  amount?: number;
  notes?: string;
  onDone?: () => void;
}

export default function EmailCopySection({
  isDarkMode,
  name,
  email,
  phone,
  brand,
  serviceType,
  eventDate,
  endDate,
  location,
  guests,
  budget,
  amount,
  notes,
  onDone
}: EmailCopySectionProps) {
  const [copied, setCopied] = useState(false);
  const [sendStatus, setSendStatus] = useState<'idle' | 'sending' | 'success' | 'failed'>('idle');
  const [sendError, setSendError] = useState<string | null>(null);

  const emailData = {
    name,
    email,
    phone,
    brand,
    serviceType,
    eventDate,
    endDate,
    location,
    guests,
    budget,
    amount,
    notes
  };

  const plainTextBody = formatEmailBody(emailData);
  const mailtoUri = generateMailtoUri(emailData);

  useEffect(() => {
    let active = true;
    const triggerAutoSend = async () => {
      setSendStatus('sending');
      const result = await sendEmailAutomatically(emailData);
      if (active) {
        if (result.success) {
          setSendStatus('success');
        } else {
          setSendStatus('failed');
          setSendError(result.message);
        }
      }
    };
    triggerAutoSend();
    return () => {
      active = false;
    };
  }, [name, email, phone, brand, serviceType, eventDate, endDate, location, guests, budget, amount, notes]);

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(plainTextBody);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  return (
    <div 
      className={`p-5 sm:p-6 rounded-2xl border text-left mt-6 max-w-xl mx-auto relative overflow-hidden transition-all duration-300 ${
        isDarkMode 
          ? 'bg-neutral-900/90 border-emerald-500/20 shadow-lg shadow-emerald-950/20' 
          : 'bg-slate-50 border-emerald-500/30 shadow-md shadow-slate-100'
      }`}
    >
      {/* Decorative absolute top gradient bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400" />

      {/* Title & Info */}
      <div className="flex items-start space-x-3 mb-4">
        <div className={`p-2 rounded-lg shrink-0 ${
          sendStatus === 'success' 
            ? 'bg-emerald-500/10 text-emerald-400' 
            : sendStatus === 'failed' 
              ? 'bg-rose-500/10 text-rose-400' 
              : 'bg-amber-500/10 text-amber-400'
        }`}>
          <Mail size={18} className={sendStatus === 'sending' ? 'animate-bounce' : 'animate-pulse'} />
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-850'}`}>
              Automated Portal Transmitter
            </h4>
            
            {/* Status Pill */}
            {sendStatus === 'sending' && (
              <span className="text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse font-mono uppercase tracking-wider">
                Sending...
              </span>
            )}
            {sendStatus === 'success' && (
              <span className="text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono uppercase tracking-wider">
                ✓ Sent Successfully
              </span>
            )}
            {sendStatus === 'failed' && (
              <span className="text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono uppercase tracking-wider">
                Deliver Manually
              </span>
            )}
          </div>
          
          <p className={`text-[11px] leading-relaxed mt-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            {sendStatus === 'success' ? (
              <span>Your request details were <strong className="text-emerald-400 font-bold">automatically sent successfully</strong> to <span className="underline font-mono">info.mahdev.lk@gmail.com</span>. Our system has logged the dispatch!</span>
            ) : sendStatus === 'sending' ? (
              <span>Connecting to Mahdev server and delivering order details automatically...</span>
            ) : (
              <span>Automatic dispatch failed: {sendError || 'Network offline'}. Please copy the receipt below or click "Launch Mail Client" to send manually to <strong className="text-emerald-400">info.mahdev.lk@gmail.com</strong>.</span>
            )}
          </p>
        </div>
      </div>

      {/* Raw Monospace Textbox */}
      <div className="relative mb-4">
        <div className="absolute top-2 right-2 flex space-x-1.5 z-10">
          <button
            onClick={handleCopyToClipboard}
            type="button"
            title="Copy copy to clipboard"
            className={`p-1.5 rounded-lg border text-xs font-bold transition-all flex items-center space-x-1 ${
              copied
                ? 'bg-emerald-600 border-emerald-500 text-white'
                : isDarkMode
                  ? 'bg-neutral-950 border-neutral-800 text-slate-400 hover:text-white hover:border-neutral-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            <span className="text-[10px] hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <pre 
          className={`w-full max-h-40 overflow-y-auto p-4 rounded-xl border text-[10px] sm:text-xs font-mono whitespace-pre-wrap scrollbar-thin ${
            isDarkMode 
              ? 'bg-black text-emerald-400/90 border-neutral-950 scrollbar-thumb-neutral-800' 
              : 'bg-white text-emerald-800 border-slate-200 scrollbar-thumb-slate-300'
          }`}
        >
          {plainTextBody}
        </pre>
      </div>

      {/* Actions row */}
      <div className="flex flex-col sm:flex-row gap-3 pt-1">
        <a
          href={mailtoUri}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider text-center transition-all shadow-md hover:scale-[1.01] active:scale-95 flex items-center justify-center space-x-2"
        >
          <ExternalLink size={13} />
          <span>Launch Mail Client</span>
        </a>
        
        {onDone && (
          <button
            onClick={onDone}
            type="button"
            className={`py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors ${
              isDarkMode 
                ? 'bg-neutral-850 hover:bg-neutral-800 text-slate-300' 
                : 'bg-slate-200 hover:bg-slate-250 text-slate-700'
            }`}
          >
            Continue
          </button>
        )}
      </div>

      {/* Help Tip */}
      <p className="text-[9px] text-center text-slate-500 font-mono mt-3">
        * Note: Automatic dispatches are monitored by our corporate portal. Launching mail client is optional.
      </p>
    </div>
  );
}
