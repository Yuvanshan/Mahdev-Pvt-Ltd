import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock, Unlock, Settings, Mail, Phone, MapPin, Clock, Sparkles,
  Camera, Cpu, Globe, Plus, Trash2, Edit, Save, X, LogOut, Check,
  User, Image as ImageIcon, FileText, Layers, AlertTriangle, Upload, TrendingUp, TrendingDown, Calendar, Users, CheckCircle, ShieldCheck, Search,
  Car, Compass, Briefcase, DollarSign, Building, Activity, Landmark, FileSpreadsheet, UserCheck, Eye, EyeOff, Menu, ArrowRight, Download, Sliders, Terminal, RefreshCw, AlertCircle, ChevronDown, ChevronRight,
  History as HistoryIcon,
  Cloud, Database, HardDrive, Folder, FolderPlus, File
} from 'lucide-react';
import EnterpriseHub from './admin/EnterpriseHub';
import {
  getCompanyContact, saveCompanyContact,
  getServicesList, saveServicesList,
  getDecorationCategories, saveDecorationCategories,
  getPhotoPortfolio, savePhotoPortfolio,
  getPhotoPricing, savePhotoPricing,
  getItProjects, saveItProjects,
  getLeadershipTeam, saveLeadershipTeam,
  getTestimonials, saveTestimonials,
  getDecorationGallery, saveDecorationGallery,
  getRentalItems, saveRentalItems,
  getThemeSettings, saveThemeSettings,
  getBookings, saveBookings,
  getTravelsVehicles, saveTravelsVehicles,
  getTravelsTours, saveTravelsTours,
  getSeoSettings, saveSeoSettings,
  getSmtpSettings, saveSmtpSettings,
  getSmtpTemplates, saveSmtpTemplates,
  getCustomers, saveCustomers,
  getCompanies, saveCompanies,
  getErpProjects, saveErpProjects,
  getQuotations, saveQuotations,
  getInvoices, saveInvoices,
  getPayments, savePayments,
  getExpenses, saveExpenses,
  getIncomes, saveIncomes,
  getEmployees, saveEmployees
} from '../utils/storage';
import { optimizeImageBeforeUpload, formatBytes } from '../utils/mediaOptimizer';
import { getFirebaseStorage, getFirestoreClient, uploadFileToFirebase } from '../firebaseClient';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ServiceCard, PhotoPortfolioItem, ItProject, Leader, Testimonial, DecorationGalleryItem, RentalItem, ThemeSettings, Booking, TravelsVehicle, TravelsTour, SeoSettings, SmtpSettings, SmtpTemplate } from '../types';

function adjustHex(hex: string, percent: number): string {
  const cleanHex = (hex || "#a855f7").replace("#", "");
  const num = parseInt(cleanHex, 16);
  let r = (num >> 16) + Math.round(2.55 * percent);
  let g = ((num >> 8) & 0x00ff) + Math.round(2.55 * percent);
  let b = (num & 0x0000ff) + Math.round(2.55 * percent);

  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

const compressImageToWebP = (file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.8): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
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
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file); // fallback
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              resolve(file);
            }
          },
          "image/webp",
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

function AdminImageUploader({
  label,
  value,
  onChange,
  isDarkMode,
  required = false
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  isDarkMode: boolean;
  required?: boolean;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [lastFileAttempt, setLastFileAttempt] = useState<{
    file: File;
    optimizedFile: File;
    thumbnailFile: File | null;
  } | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const startUpload = (fileObj: File, optimizedFile: File, thumbnailFile: File | null) => {
    setIsUploading(true);
    setProgress(0);
    setError(null);
    setSuccessMsg(null);

    const formData = new FormData();
    formData.append("image", optimizedFile);
    if (thumbnailFile) formData.append("thumbnail", thumbnailFile);

    // Enforce folder context based on label
    let folder = "general";
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes("logo")) folder = "branding";
    else if (lowerLabel.includes("decor")) folder = "decorations";
    else if (lowerLabel.includes("photo") || lowerLabel.includes("camera")) folder = "photography";
    else if (lowerLabel.includes("it") || lowerLabel.includes("erp") || lowerLabel.includes("developer")) folder = "it_solutions";
    else if (lowerLabel.includes("travel") || lowerLabel.includes("vehicle") || lowerLabel.includes("car")) folder = "travels";

    formData.append("folder", folder);

    const xhr = new XMLHttpRequest();

    // Track upload progress
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const pct = Math.round((event.loaded / event.total) * 100);
        setProgress(pct);
      }
    });

    xhr.addEventListener("load", () => {
      setIsUploading(false);
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          if (data.success && data.url) {
            onChange(data.url);
            setSuccessMsg("Uploaded successfully!");
            setTimeout(() => setSuccessMsg(null), 3000);
            setLastFileAttempt(null); // Clear retry state on success
            setPreviewUrl(null); // Clear temporary preview URL
          } else {
            const serverError = data.error?.message || data.error || "Failed to upload image.";
            setError(serverError);
          }
        } catch (e) {
          setError("Failed to parse upload response.");
        }
      } else {
        try {
          const data = JSON.parse(xhr.responseText);
          const serverError = data.error?.message || `Upload failed (Status ${xhr.status})`;
          setError(serverError);
        } catch {
          setError(`Upload failed (HTTP ${xhr.status})`);
        }
      }
    });

    xhr.addEventListener("error", () => {
      setIsUploading(false);
      setError("Network error: Upload failed. Please try again.");
    });

    xhr.open("POST", "/api/upload");
    xhr.send(formData);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    try {
      setError(null);
      setSuccessMsg(null);

      const localUrl = URL.createObjectURL(file);
      setPreviewUrl(localUrl);

      const result = await optimizeImageBeforeUpload(file, {
        maxWidth: 1600,
        maxHeight: 1600,
        quality: 0.82,
        thumbnailSize: 300,
        thumbnailQuality: 0.75,
      });

      const attempt = {
        file,
        optimizedFile: result.optimizedFile,
        thumbnailFile: result.thumbnailFile || null
      };

      setLastFileAttempt(attempt);
      startUpload(attempt.file, attempt.optimizedFile, attempt.thumbnailFile);
    } catch (err: any) {
      console.error("[Uploader Error]", err);
      setError(err.message || "Failed to optimize image.");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const retryUpload = () => {
    if (lastFileAttempt) {
      startUpload(lastFileAttempt.file, lastFileAttempt.optimizedFile, lastFileAttempt.thumbnailFile);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const displayImage = previewUrl || value;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {successMsg && (
          <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-0.5 animate-pulse">
            <CheckCircle size={10} /> {successMsg}
          </span>
        )}
        {error && (
          <span className="text-[10px] text-red-400 font-mono flex items-center gap-0.5">
            <AlertCircle size={10} /> {error}
          </span>
        )}
      </div>

      <div className="flex gap-3 items-center">
        <div className={`h-11 w-11 rounded-xl shrink-0 border flex items-center justify-center overflow-hidden bg-neutral-950/40 relative group ${isDarkMode ? 'border-purple-500/10' : 'border-slate-200'
          }`}>
          {displayImage ? (
            <img
              src={displayImage}
              alt="Uploaded Preview"
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const sibling = e.currentTarget.nextElementSibling as HTMLElement;
                if (sibling) sibling.style.display = 'block';
              }}
            />
          ) : null}
          <div className="text-slate-500 text-center" style={{ display: displayImage ? 'none' : 'block' }}>
            <Camera size={14} className="mx-auto" />
          </div>
        </div>

        <div className="flex-grow min-w-0 space-y-1.5">
          <div className="flex gap-2">
            <input
              type="text"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://... or upload image"
              className={`flex-grow px-4 py-2 rounded-xl text-xs border focus:outline-none truncate ${isDarkMode ? 'bg-neutral-950 border-purple-500/10 text-white' : 'bg-slate-50 text-slate-900 border-slate-200'
                }`}
              required={required}
            />

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            <button
              type="button"
              onClick={triggerUpload}
              disabled={isUploading}
              className={`px-3 py-2 rounded-xl text-[10px] font-bold font-mono border transition-all flex items-center gap-1 shrink-0 uppercase tracking-wider ${isUploading
                  ? 'bg-purple-600/20 text-purple-400 border-purple-500/20 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700 text-white border-transparent shadow-md'
                }`}
            >
              <Upload size={11} className={isUploading ? "animate-bounce" : ""} />
              <span>{isUploading ? "..." : "Upload"}</span>
            </button>

            {error && lastFileAttempt && (
              <button
                type="button"
                onClick={retryUpload}
                disabled={isUploading}
                className="px-2.5 py-2 rounded-xl text-[10px] font-bold font-mono border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition-all uppercase tracking-wider"
                title="Retry upload"
              >
                <RefreshCw size={11} className={isUploading ? "animate-spin" : ""} />
              </button>
            )}
          </div>

          {/* Progress bar container */}
          {isUploading && (
            <div className="w-full bg-neutral-900/60 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-purple-500 h-1.5 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface AdminViewProps {
  isDarkMode: boolean;
  onDataChange: () => void;
  themeSettings?: ThemeSettings;
}

export default function AdminView({ isDarkMode, onDataChange, themeSettings }: AdminViewProps) {
  const adminUsername = (import.meta.env.VITE_ADMIN_USERNAME || 'Yuvanshan875@gmail.com').trim();
  const adminPassword = (import.meta.env.VITE_ADMIN_PASSWORD || 'Yuvan@1709').trim();

  // Login credentials state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('mahdev_admin_authenticated') === 'true';
  });
  const [errorMsg, setErrorMsg] = useState('');

  // Loaded data state for editing
  const [contact, setContact] = useState(() => getCompanyContact());
  const [services, setServices] = useState(() => getServicesList());
  const [photoPortfolio, setPhotoPortfolio] = useState(() => getPhotoPortfolio());
  const [photoPricing, setPhotoPricing] = useState(() => getPhotoPricing());
  const [itProjects, setItProjects] = useState(() => getItProjects());
  const [leaders, setLeaders] = useState(() => getLeadershipTeam());
  const [testimonials, setTestimonials] = useState(() => getTestimonials());
  const [decorGallery, setDecorGallery] = useState(() => getDecorationGallery());
  const [rentalItems, setRentalItems] = useState(() => getRentalItems());
  const [theme, setTheme] = useState(() => getThemeSettings());
  const [travelsVehicles, setTravelsVehicles] = useState(() => getTravelsVehicles());
  const [travelsTours, setTravelsTours] = useState(() => getTravelsTours());
  const [seo, setSeo] = useState(() => getSeoSettings());

  // SMTP and Email Settings States
  const [smtpSettings, setSmtpSettings] = useState<SmtpSettings>(() => getSmtpSettings());
  const [smtpTemplates, setSmtpTemplates] = useState<SmtpTemplate[]>(() => getSmtpTemplates());
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('welcome');
  const [testRecipient, setTestRecipient] = useState<string>('yuvanshan875@gmail.com');
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; details?: string } | null>(null);
  const [smtpLogs, setSmtpLogs] = useState<{ id: string; timestamp: string; action: string; details: string; user: string }[]>(() => {
    const stored = localStorage.getItem('mahdev_smtp_logs');
    return stored ? JSON.parse(stored) : [];
  });
  const [emailSubTab, setEmailSubTab] = useState<'config' | 'templates' | 'logs' | 'cloud_storage' | 'media_library' | 'backups'>('config');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Cloud Storage & Backup Management States
  const [storageSettings, setStorageSettingsState] = useState({
    provider: 'local',
    r2Endpoint: '',
    r2AccessKeyId: '',
    r2SecretAccessKey: '',
    r2BucketName: '',
    r2PublicCdnUrl: '',
    supabaseUrl: '',
    supabaseServiceKey: '',
    supabaseBucketName: '',
    supabasePublicUrl: ''
  });
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [backupsList, setBackupsList] = useState<any[]>([]);

  const [isStorageLoading, setIsStorageLoading] = useState(false);
  const [isMediaLoading, setIsMediaLoading] = useState(false);
  const [isBackupLoading, setIsBackupLoading] = useState(false);
  const [isSavingStorage, setIsSavingStorage] = useState(false);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRestoringBackup, setIsRestoringBackup] = useState(false);

  const [storageError, setStorageError] = useState<string | null>(null);
  const [storageSuccess, setStorageSuccess] = useState<string | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [backupError, setBackupError] = useState<string | null>(null);
  const [backupSuccess, setBackupSuccess] = useState<string | null>(null);

  // Filters and views for Media Library
  const [mediaSearchQuery, setMediaSearchQuery] = useState('');
  const [selectedMediaFolder, setSelectedMediaFolder] = useState('all');
  const [mediaFilterType, setMediaFilterType] = useState('all');
  const [uploadProgressList, setUploadProgressList] = useState<Array<{ name: string; status: 'compressing' | 'uploading' | 'completed' | 'error'; progress: number }>>([]);

  const fetchStorageSettings = async () => {
    setIsStorageLoading(true);
    setStorageError(null);
    try {
      const res = await fetch("/api/storage/settings");
      if (res.ok) {
        const data = await res.json();
        setStorageSettingsState(data);
      } else {
        setStorageError("Failed to fetch storage settings.");
      }
    } catch (err) {
      setStorageError("Network error loading storage settings.");
    } finally {
      setIsStorageLoading(false);
    }
  };

  const fetchMediaLibrary = async () => {
    setIsMediaLoading(true);
    setMediaError(null);
    try {
      const res = await fetch("/api/media-library");
      if (res.ok) {
        const data = await res.json();
        setMediaItems(data);
      } else {
        setMediaError("Failed to fetch media library.");
      }
    } catch (err) {
      setMediaError("Network error loading media library.");
    } finally {
      setIsMediaLoading(false);
    }
  };

  const fetchBackupsList = async () => {
    setIsBackupLoading(true);
    setBackupError(null);
    try {
      const res = await fetch("/api/backup/list");
      if (res.ok) {
        const data = await res.json();
        setBackupsList(data);
      } else {
        setBackupError("Failed to fetch database backups.");
      }
    } catch (err) {
      setBackupError("Network error loading backups.");
    } finally {
      setIsBackupLoading(false);
    }
  };

  const handleSaveStorageSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingStorage(true);
    setStorageSuccess(null);
    setStorageError(null);
    try {
      const res = await fetch("/api/storage/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(storageSettings)
      });
      if (res.ok) {
        setStorageSuccess("Storage configuration saved successfully! Active provider has been updated.");
        fetchStorageSettings();
      } else {
        const err = await res.json();
        setStorageError(err.error || "Failed to save storage settings.");
      }
    } catch (err) {
      setStorageError("Network error saving storage settings.");
    } finally {
      setIsSavingStorage(false);
    }
  };

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    setBackupSuccess(null);
    setBackupError(null);
    try {
      const res = await fetch("/api/backup/create", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setBackupSuccess(`Database snapshot created successfully: ${data.fileName}`);
        fetchBackupsList();
      } else {
        setBackupError("Failed to create backup on the server.");
      }
    } catch (err) {
      setBackupError("Network error creating backup.");
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleRestoreBackup = async (fileName: string) => {
    showConfirm(
      "Restore Database Backup",
      `Are you absolutely sure you want to restore the database to the snapshot "${fileName}"? This will overwrite all current system data!`,
      async () => {
        setIsRestoringBackup(true);
        setBackupSuccess(null);
        setBackupError(null);
        try {
          const res = await fetch("/api/backup/restore", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileName })
          });
          if (res.ok) {
            setBackupSuccess("Database restored successfully from backup! App state will reload.");
            setTimeout(() => {
              window.location.reload();
            }, 1500);
          } else {
            const err = await res.json();
            setBackupError(err.error || "Failed to restore database from backup.");
          }
        } catch (err) {
          setBackupError("Network error restoring database.");
        } finally {
          setIsRestoringBackup(false);
        }
      }
    );
  };

  const handleUploadRestoreBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    showConfirm(
      "Restore Uploaded Backup",
      `Are you absolutely sure you want to restore the database from "${file.name}"? This will completely overwrite all current system data!`,
      async () => {
        setIsRestoringBackup(true);
        setBackupSuccess(null);
        setBackupError(null);
        try {
          const reader = new FileReader();
          reader.onload = async (evt) => {
            try {
              const uploadData = JSON.parse(evt.target?.result as string);
              const res = await fetch("/api/backup/restore", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ uploadData })
              });
              if (res.ok) {
                setBackupSuccess("Database restored successfully from uploaded JSON! App state will reload.");
                setTimeout(() => {
                  window.location.reload();
                }, 1500);
              } else {
                const err = await res.json();
                setBackupError(err.error || "Failed to restore database from uploaded backup file.");
              }
            } catch (e) {
              setBackupError("Invalid backup file format. Must be a valid JSON backup file.");
              setIsRestoringBackup(false);
            }
          };
          reader.readAsText(file);
        } catch (err) {
          setBackupError("Failed to read backup file.");
          setIsRestoringBackup(false);
        }
      }
    );
  };

  // Enterprise Analytics Database states
  const [customers, setCustomers] = useState(() => getCustomers());
  const [erpProjects, setErpProjects] = useState(() => getErpProjects());
  const [quotations, setQuotations] = useState(() => getQuotations());
  const [invoices, setInvoices] = useState(() => getInvoices());
  const [payments, setPayments] = useState(() => getPayments());
  const [expenses, setExpenses] = useState(() => getExpenses());
  const [incomes, setIncomes] = useState(() => getIncomes());
  const [employees, setEmployees] = useState(() => getEmployees());

  // Logo uploading custom states and logic
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleLogoFile = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WebP, SVG).');
      return;
    }
    setUploadError('');

    try {
      let fileToUpload = file;
      try {
        const optimizedResult = await optimizeImageBeforeUpload(file, {
          maxWidth: 500,
          maxHeight: 500,
          quality: 0.85,
        });
        fileToUpload = optimizedResult.optimizedFile;
      } catch (err) {
        console.warn("Logo browser-side optimization failed, uploading raw:", err);
      }

      const formData = new FormData();
      formData.append("image", fileToUpload);
      formData.append("folder", "branding");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed (Status ${response.status})`);
      }

      const data = await response.json();
      if (data.success && data.url) {
        setContact((prev: typeof contact) => ({ ...prev, logo: data.url }));
      } else {
        throw new Error(data.error?.message || data.error || "Failed to upload logo.");
      }
    } catch (err: any) {
      console.error("[Logo Upload Error]", err);
      setUploadError(err.message || "Failed to upload logo.");
    }
  };

  // Active sub-panel tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'crm' | 'projects_erp' | 'finances' | 'employees' | 'systems' | 'contact' | 'services' | 'portfolio' | 'pricing' | 'projects' | 'leaders' | 'testimonials' | 'decor_posts' | 'rentals' | 'theme' | 'travels_fleet' | 'travels_tours' | 'seo' | 'ai_assistant' | 'email_settings'>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Collapsible sidebar groups state
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'Operations': true,
    'Design & Config': true,
    'General Content': false,
    'SWS Division': false,
    'Travels Division': false,
  });

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  // Custom confirmation dialog state
  const [confirmDialog, setConfirmDialog] = React.useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      onConfirm
    });
  };

  React.useEffect(() => {
    if (activeTab === 'email_settings') {
      fetchStorageSettings();
      fetchMediaLibrary();
      fetchBackupsList();
    }
  }, [activeTab]);

  // Bookings and CRM Dashboard States
  const [bookings, setBookingsState] = useState<Booking[]>(() => getBookings());
  const [adminRole, setAdminRole] = useState<'ceo' | 'md'>('ceo');
  const [selectedDay, setSelectedDay] = useState<number | null>(12);
  const [todoTasks, setTodoTasks] = useState([
    { id: 't1', text: 'SWS Stage flower procurement check', completed: false, tag: 'SWS Events' },
    { id: 't2', text: 'Validate U1 Studio cloud raw backup server', completed: true, tag: 'U1 Studio' },
    { id: 't3', text: 'IT division sprint meeting with developers', completed: false, tag: 'Mahdev IT' },
    { id: 't4', text: 'Review KDH luxury van airport transfer itinerary', completed: false, tag: 'Travels' },
    { id: 't5', text: 'Dispatch corporate receipt for NTB PLC payment', completed: true, tag: 'Finances' }
  ]);

  // Gemini AI Assistant States
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [copiedAiOutput, setCopiedAiOutput] = useState(false);
  const [bookingFilterBrand, setBookingFilterBrand] = useState<'All' | 'SWS' | 'IT' | 'Studio' | 'Travels'>('All');
  const [bookingFilterStatus, setBookingFilterStatus] = useState<'All' | 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled'>('All');
  const [bookingSearchQuery, setBookingSearchQuery] = useState('');

  // Modal / Editing state helpers
  const [editingItem, setEditingItem] = useState<{ type: string; id: string | null; data: any } | null>(null);

  // Synchronize analytics states when tab changes or update trigger fires
  React.useEffect(() => {
    if (activeTab === 'dashboard') {
      setBookingsState(getBookings());
      setCustomers(getCustomers());
      setErpProjects(getErpProjects());
      setQuotations(getQuotations());
      setInvoices(getInvoices());
      setPayments(getPayments());
      setExpenses(getExpenses());
      setIncomes(getIncomes());
      setEmployees(getEmployees());
    }
  }, [activeTab]);

  // Listen for global DB sync events triggered by the App after server hydration
  React.useEffect(() => {
    const handler = () => {
      setBookingsState(getBookings());
      setCustomers(getCustomers());
      setErpProjects(getErpProjects());
      setQuotations(getQuotations());
      setInvoices(getInvoices());
      setPayments(getPayments());
      setExpenses(getExpenses());
      setIncomes(getIncomes());
      setEmployees(getEmployees());
    };
    window.addEventListener('mahdev-db-synced', handler as EventListener);
    return () => window.removeEventListener('mahdev-db-synced', handler as EventListener);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedUsername = username.trim().toLowerCase();
    const normalizedExpectedUsername = adminUsername.trim().toLowerCase();

    if (normalizedUsername === normalizedExpectedUsername && password === adminPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem('mahdev_admin_authenticated', 'true');
      setErrorMsg('');
      setUsername('');
      setPassword('');
    } else {
      setErrorMsg('Invalid administrative credentials. Please verify your username and password.');
      setPassword('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('mahdev_admin_authenticated');
    window.location.hash = '';
    window.location.pathname = '/';
  };

  const handleSaveContact = () => {
    saveCompanyContact(contact);
    onDataChange();
    alert('Company contact info updated successfully!');
  };

  const handleSaveTheme = () => {
    saveThemeSettings(theme);
    saveCompanyContact(contact);
    onDataChange();
    alert('Branding and design settings synchronized successfully! The website theme, colors, and dynamic animations are updated.');
  };

  const handleSaveSeo = () => {
    saveSeoSettings(seo);
    onDataChange();
    alert('SEO and search metadata settings updated successfully! Dynamic title tags, description, keywords, and Open Graph tags have been updated in the document head.');
  };

  const addSmtpLog = (action: string, details: string) => {
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      action,
      details,
      user: 'Super Admin (yuvanshan875@gmail.com)'
    };
    const updatedLogs = [newLog, ...smtpLogs];
    setSmtpLogs(updatedLogs);
    localStorage.setItem('mahdev_smtp_logs', JSON.stringify(updatedLogs));
  };

  const handleProviderChange = (provider: 'gmail' | 'brevo' | 'mailjet' | 'zoho' | 'custom') => {
    let host = '';
    let port = 587;
    let encryption: 'TLS' | 'SSL' | 'STARTTLS' = 'TLS';

    switch (provider) {
      case 'gmail':
        host = 'smtp.gmail.com';
        port = 587;
        encryption = 'STARTTLS';
        break;
      case 'brevo':
        host = 'smtp-relay.brevo.com';
        port = 587;
        encryption = 'TLS';
        break;
      case 'mailjet':
        host = 'in-v3.mailjet.com';
        port = 587;
        encryption = 'TLS';
        break;
      case 'zoho':
        host = 'smtp.zoho.com';
        port = 465;
        encryption = 'SSL';
        break;
      case 'custom':
      default:
        host = '';
        port = 587;
        encryption = 'TLS';
        break;
    }

    setSmtpSettings({
      ...smtpSettings,
      provider,
      host,
      port,
      encryption
    });
  };

  const handleSaveSmtpSettings = () => {
    if (adminRole !== 'ceo') {
      alert('Security Restriction: Only the CEO (Super Admin) is authorized to modify outgoing SMTP configurations.');
      return;
    }
    saveSmtpSettings(smtpSettings);
    onDataChange();
    addSmtpLog('Update Configuration', `Changed SMTP Provider to ${smtpSettings.provider}, Enabled: ${smtpSettings.enabled ? 'Yes' : 'No'}`);
    alert('SMTP configuration saved successfully! Passwords have been encrypted and stored securely.');
  };

  const handleSaveSmtpTemplate = (template: SmtpTemplate) => {
    if (adminRole !== 'ceo') {
      alert('Security Restriction: Only the CEO (Super Admin) is authorized to modify responsive email templates.');
      return;
    }
    const updated = smtpTemplates.map(t => t.id === template.id ? template : t);
    setSmtpTemplates(updated);
    saveSmtpTemplates(updated);
    onDataChange();
    addSmtpLog('Update Template', `Modified '${template.name}' subject and message body.`);
    alert(`Email template '${template.name}' saved successfully!`);
  };

  const handleSendTestEmail = async () => {
    if (!testRecipient) {
      alert('Please enter a recipient email address.');
      return;
    }
    setIsSendingTest(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/send-test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientEmail: testRecipient })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({ success: true, message: data.message });
        addSmtpLog('Test Connection', `Successfully sent a test SMTP email to ${testRecipient}.`);
      } else {
        setTestResult({ success: false, message: data.error || 'Failed to send test email.', details: data.details });
        addSmtpLog('Test Connection Error', `Failed test email to ${testRecipient}. Error: ${data.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      setTestResult({ success: false, message: 'Failed to dispatch API request.', details: err.message || String(err) });
      addSmtpLog('Test Connection Error', `Failed to contact API. Connection failed.`);
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleAskGemini = async (customPrompt?: string) => {
    const promptText = customPrompt || aiPrompt;
    if (!promptText.trim()) return;

    setIsAiLoading(true);
    setAiResponse('');
    setCopiedAiOutput(false);

    try {
      const response = await fetch('/api/gemini-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: promptText }),
      });

      if (!response.ok) {
        throw new Error('Failed to reach AI Engine');
      }

      const data = await response.json();
      if (data.success) {
        setAiResponse(data.response);
      } else {
        throw new Error(data.error || 'Unknown AI dispatch error');
      }
    } catch (err: any) {
      console.error('[Gemini Portal Error]', err);
      setAiResponse(`⚠️ Error: ${err.message || 'The Gemini service is temporarily offline.'}\n\nPlease check your workspace credentials or network settings and try again!`);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleUpdateBookingStatus = (id: string, newStatus: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled') => {
    const updated = bookings.map(b => b.id === id ? { ...b, status: newStatus } : b);
    setBookingsState(updated);
    saveBookings(updated);
    onDataChange();
  };

  const handleDeleteBooking = (id: string) => {
    showConfirm(
      "Confirm Deletion",
      "Are you sure you want to permanently delete this lead/booking?",
      () => {
        const updated = bookings.filter(b => b.id !== id);
        setBookingsState(updated);
        saveBookings(updated);
        onDataChange();
      }
    );
  };

  // Generic helpers to delete items
  const handleDeleteService = (id: string) => {
    showConfirm(
      "Confirm Deletion",
      "Are you sure you want to delete this service?",
      () => {
        const updated = services.filter(s => s.id !== id);
        setServices(updated);
        saveServicesList(updated);
        onDataChange();
      }
    );
  };

  const handleDeletePortfolioItem = (id: string) => {
    showConfirm(
      "Confirm Deletion",
      "Are you sure you want to delete this portfolio item?",
      () => {
        const updated = photoPortfolio.filter(p => p.id !== id);
        setPhotoPortfolio(updated);
        savePhotoPortfolio(updated);
        onDataChange();
      }
    );
  };

  const handleDeletePricingItem = (idx: number) => {
    showConfirm(
      "Confirm Deletion",
      "Are you sure you want to delete this pricing plan?",
      () => {
        const updated = [...photoPricing];
        updated.splice(idx, 1);
        setPhotoPricing(updated);
        savePhotoPricing(updated);
        onDataChange();
      }
    );
  };

  const handleDeleteProject = (id: string) => {
    showConfirm(
      "Confirm Deletion",
      "Are you sure you want to delete this project?",
      () => {
        const updated = itProjects.filter(p => p.id !== id);
        setItProjects(updated);
        saveItProjects(updated);
        onDataChange();
      }
    );
  };

  const handleDeleteLeader = (id: string) => {
    showConfirm(
      "Confirm Deletion",
      "Are you sure you want to delete this leadership member?",
      () => {
        const updated = leaders.filter(l => l.id !== id);
        setLeaders(updated);
        saveLeadershipTeam(updated);
        onDataChange();
      }
    );
  };

  const handleDeleteTestimonial = (id: string) => {
    showConfirm(
      "Confirm Deletion",
      "Are you sure you want to delete this testimonial?",
      () => {
        const updated = testimonials.filter(t => t.id !== id);
        setTestimonials(updated);
        saveTestimonials(updated);
        onDataChange();
      }
    );
  };

  const handleDeleteDecorPost = (id: string) => {
    showConfirm(
      "Confirm Deletion",
      "Are you sure you want to delete this decoration post?",
      () => {
        const updated = decorGallery.filter(d => d.id !== id);
        setDecorGallery(updated);
        saveDecorationGallery(updated);
        onDataChange();
      }
    );
  };

  const handleDeleteRentalItem = (id: string) => {
    showConfirm(
      "Confirm Deletion",
      "Are you sure you want to delete this rental item?",
      () => {
        const updated = rentalItems.filter(r => r.id !== id);
        setRentalItems(updated);
        saveRentalItems(updated);
        onDataChange();
      }
    );
  };

  const handleDeleteTravelsVehicle = (id: string) => {
    showConfirm(
      "Confirm Deletion",
      "Are you sure you want to delete this vehicle from fleet?",
      () => {
        const updated = travelsVehicles.filter(v => v.id !== id);
        setTravelsVehicles(updated);
        saveTravelsVehicles(updated);
        onDataChange();
      }
    );
  };

  const handleDeleteTravelsTour = (id: string) => {
    showConfirm(
      "Confirm Deletion",
      "Are you sure you want to delete this tour package?",
      () => {
        const updated = travelsTours.filter(t => t.id !== id);
        setTravelsTours(updated);
        saveTravelsTours(updated);
        onDataChange();
      }
    );
  };

  // Open Edit / Create Modals
  const openEditModal = (type: string, id: string | null, defaultData: any) => {
    setEditingItem({
      type,
      id,
      data: { ...defaultData }
    });
  };

  const handleModalSave = () => {
    if (!editingItem) return;

    const { type, id, data } = editingItem;

    if (type === 'service') {
      let updatedList: ServiceCard[];
      if (id === null) {
        // Create new
        const newId = 'service-' + Date.now();
        const newService: ServiceCard = { ...data, id: newId };
        updatedList = [...services, newService];
      } else {
        // Update existing
        updatedList = services.map(s => s.id === id ? { ...s, ...data } : s);
      }
      setServices(updatedList);
      saveServicesList(updatedList);
    }
    else if (type === 'portfolio') {
      let updatedList: PhotoPortfolioItem[];
      if (id === null) {
        const newId = 'portfolio-' + Date.now();
        const newItem: PhotoPortfolioItem = { ...data, id: newId };
        updatedList = [...photoPortfolio, newItem];
      } else {
        updatedList = photoPortfolio.map(p => p.id === id ? { ...p, ...data } : p);
      }
      setPhotoPortfolio(updatedList);
      savePhotoPortfolio(updatedList);
    }
    else if (type === 'pricing') {
      let updatedList = [...photoPricing];
      if (id === null) {
        // parsing features if it is a string comma separated
        const featuresArr = typeof data.features === 'string'
          ? data.features.split(',').map((f: string) => f.trim()).filter(Boolean)
          : data.features;
        updatedList.push({ ...data, features: featuresArr });
      } else {
        const idx = parseInt(id);
        const featuresArr = typeof data.features === 'string'
          ? data.features.split(',').map((f: string) => f.trim()).filter(Boolean)
          : data.features;
        updatedList[idx] = { ...data, features: featuresArr };
      }
      setPhotoPricing(updatedList);
      savePhotoPricing(updatedList);
    }
    else if (type === 'project') {
      let updatedList: ItProject[];
      if (id === null) {
        const newId = 'project-' + Date.now();
        const newItem: ItProject = { ...data, id: newId };
        updatedList = [...itProjects, newItem];
      } else {
        updatedList = itProjects.map(p => p.id === id ? { ...p, ...data } : p);
      }
      setItProjects(updatedList);
      saveItProjects(updatedList);
    }
    else if (type === 'leader') {
      let updatedList: Leader[];
      if (id === null) {
        const newId = 'leader-' + Date.now();
        const newItem: Leader = { ...data, id: newId };
        updatedList = [...leaders, newItem];
      } else {
        updatedList = leaders.map(l => l.id === id ? { ...l, ...data } : l);
      }
      setLeaders(updatedList);
      saveLeadershipTeam(updatedList);
    }
    else if (type === 'testimonial') {
      let updatedList: Testimonial[];
      if (id === null) {
        const newId = 'testimonial-' + Date.now();
        const newItem: Testimonial = { ...data, id: newId };
        updatedList = [...testimonials, newItem];
      } else {
        updatedList = testimonials.map(t => t.id === id ? { ...t, ...data } : t);
      }
      setTestimonials(updatedList);
      saveTestimonials(updatedList);
    }
    else if (type === 'decor_post') {
      let updatedList: DecorationGalleryItem[];
      if (id === null) {
        const newId = 'decor-' + Date.now();
        const newItem: DecorationGalleryItem = { ...data, id: newId };
        updatedList = [...decorGallery, newItem];
      } else {
        updatedList = decorGallery.map(d => d.id === id ? { ...d, ...data } : d);
      }
      setDecorGallery(updatedList);
      saveDecorationGallery(updatedList);
    }
    else if (type === 'rental') {
      let updatedList: RentalItem[];
      if (id === null) {
        const newId = 'rental-' + Date.now();
        const newItem: RentalItem = {
          ...data,
          id: newId,
          availableQty: parseInt(data.availableQty) || 1
        };
        updatedList = [...rentalItems, newItem];
      } else {
        updatedList = rentalItems.map(r => r.id === id ? {
          ...r,
          ...data,
          availableQty: parseInt(data.availableQty) || 1
        } : r);
      }
      setRentalItems(updatedList);
      saveRentalItems(updatedList);
    }
    else if (type === 'travels_vehicle') {
      let updatedList: TravelsVehicle[];
      const featuresArr = typeof data.features === 'string'
        ? data.features.split(',').map((f: string) => f.trim()).filter(Boolean)
        : data.features || [];
      const updatedData = {
        ...data,
        features: featuresArr,
        passengers: parseInt(data.passengers) || 4,
        luggage: parseInt(data.luggage) || 2
      };

      if (id === null) {
        const newId = 'vehicle-' + Date.now();
        const newItem: TravelsVehicle = { ...updatedData, id: newId };
        updatedList = [...travelsVehicles, newItem];
      } else {
        updatedList = travelsVehicles.map(v => v.id === id ? { ...v, ...updatedData } : v);
      }
      setTravelsVehicles(updatedList);
      saveTravelsVehicles(updatedList);
    }
    else if (type === 'travels_tour') {
      let updatedList: TravelsTour[];
      const highlightsArr = typeof data.highlights === 'string'
        ? data.highlights.split(',').map((h: string) => h.trim()).filter(Boolean)
        : data.highlights || [];

      let itineraryArr = data.itinerary;
      if (typeof data.itinerary === 'string') {
        try {
          itineraryArr = JSON.parse(data.itinerary);
        } catch (e) {
          itineraryArr = [
            { day: 1, title: 'Island Journey', desc: data.itinerary }
          ];
        }
      }

      const updatedData = {
        ...data,
        highlights: highlightsArr,
        itinerary: itineraryArr
      };

      if (id === null) {
        const newId = 'tour-' + Date.now();
        const newItem: TravelsTour = { ...updatedData, id: newId };
        updatedList = [...travelsTours, newItem];
      } else {
        updatedList = travelsTours.map(t => t.id === id ? { ...t, ...updatedData } : t);
      }
      setTravelsTours(updatedList);
      saveTravelsTours(updatedList);
    }

    onDataChange();
    setEditingItem(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 relative z-10 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={`w-full max-w-md p-8 rounded-2xl border relative z-10 transition-colors duration-300 ${isDarkMode
              ? 'bg-slate-900/90 border-slate-800/80 shadow-2xl shadow-slate-950/50'
              : 'bg-white border-slate-200/80 shadow-xl'
            }`}
        >
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center mx-auto mb-4 text-indigo-400 shadow-inner">
              <Lock size={20} />
            </div>
            <h2 className={`text-xl font-bold tracking-tight ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
              Administrative Control Portal
            </h2>
            <p className={`text-xs mt-2 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Log in to configure core company packages, team dynamics, fleet rentals and cloud modules across Mahdev portals.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className={`block text-[11px] font-semibold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'
                }`}>
                Admin Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  required
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 text-sm rounded-xl border focus:outline-none transition-all ${isDarkMode
                      ? 'bg-slate-950 border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100'
                      : 'bg-slate-50 border-slate-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 text-slate-800'
                    }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-[11px] font-semibold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'
                }`}>
                Secret Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  required
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 text-sm rounded-xl border focus:outline-none transition-all ${isDarkMode
                      ? 'bg-slate-950 border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100'
                      : 'bg-slate-50 border-slate-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 text-slate-800'
                    }`}
                />
              </div>
            </div>

            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs"
              >
                <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-widest active:scale-[0.98] transition-all shadow-lg shadow-indigo-600/15 flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Unlock Console</span>
              <Unlock size={14} />
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  const adminTabs = [
    { id: 'dashboard' as const, label: 'Central CRM & Bookings', icon: TrendingUp, group: 'Operations' },
    { id: 'crm' as const, label: 'Enterprise CRM', icon: Users, group: 'Operations' },
    { id: 'projects_erp' as const, label: 'Projects ERP', icon: Briefcase, group: 'Operations' },
    { id: 'finances' as const, label: 'Financial Suite', icon: DollarSign, group: 'Operations' },
    { id: 'employees' as const, label: 'Staff & Payroll', icon: User, group: 'Operations' },
    { id: 'systems' as const, label: 'Systems & Audits', icon: Activity, group: 'Operations' },
    { id: 'ai_assistant' as const, label: 'Gemini AI Assistant', icon: Cpu, group: 'Operations', color: 'text-purple-400' },
    { id: 'theme' as const, label: 'Website Design & Theme', icon: Settings, group: 'Design & Config' },
    { id: 'seo' as const, label: 'SEO Settings', icon: Search, group: 'Design & Config', color: 'text-purple-400' },
    { id: 'email_settings' as const, label: 'Systems, Cloud & Email', icon: HardDrive, group: 'Design & Config', color: 'text-purple-400' },
    { id: 'contact' as const, label: 'Contact & Maps', icon: Mail, group: 'General Content' },
    { id: 'services' as const, label: 'Main Divisions', icon: Layers, group: 'General Content' },
    { id: 'portfolio' as const, label: 'Photo Gallery', icon: ImageIcon, group: 'General Content' },
    { id: 'pricing' as const, label: 'Pricing Packages', icon: FileText, group: 'General Content' },
    { id: 'projects' as const, label: 'IT Portals', icon: Globe, group: 'General Content' },
    { id: 'leaders' as const, label: 'Board Directors', icon: User, group: 'General Content' },
    { id: 'testimonials' as const, label: 'Testimonials', icon: Sparkles, group: 'General Content' },
    { id: 'decor_posts' as const, label: 'SWS Decor Posts', icon: ImageIcon, group: 'SWS Division', color: 'text-emerald-400' },
    { id: 'rentals' as const, label: 'SWS Rental Things', icon: Sparkles, group: 'SWS Division', color: 'text-emerald-400' },
    { id: 'travels_fleet' as const, label: 'Travels Fleet', icon: Car, group: 'Travels Division', color: 'text-emerald-400' },
    { id: 'travels_tours' as const, label: 'Travels Tours', icon: Compass, group: 'Travels Division', color: 'text-emerald-400' },
  ];

  const tabGroups = ['Operations', 'Design & Config', 'General Content', 'SWS Division', 'Travels Division'] as const;

  const handleTabSelect = (tabId: typeof activeTab) => {
    setActiveTab(tabId);
    if (tabId === 'dashboard') {
      setBookingsState(getBookings());
    }

    // Auto-expand the group of the selected tab
    const tabInfo = adminTabs.find(t => t.id === tabId);
    if (tabInfo && tabInfo.group) {
      setExpandedGroups(prev => ({
        ...prev,
        [tabInfo.group]: true
      }));
    }
  };

  const renderCategoryMenu = (isMobile: boolean = false) => {
    return (
      <div className="space-y-4">
        {tabGroups.map((group) => {
          const groupTabs = adminTabs.filter(t => t.group === group);
          const isExpanded = expandedGroups[group];
          return (
            <div key={group} className="space-y-1">
              <button
                type="button"
                onClick={() => toggleGroup(group)}
                className={`w-full flex items-center justify-between px-6 py-2 text-[9px] font-black uppercase tracking-widest ${
                  isMobile ? 'text-purple-400' : 'text-indigo-200/50'
                } hover:text-white transition-colors text-left`}
              >
                <span>{group}</span>
                <span>
                  {isExpanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                </span>
              </button>

              {isExpanded && (
                <div className="space-y-1.5 mt-1">
                  {groupTabs.map((tab) => {
                    const IconComponent = tab.icon as React.ElementType;
                    const isActive = activeTab === tab.id;

                    let btnClass = "";
                    if (isMobile) {
                      btnClass = isActive
                        ? "bg-purple-600/20 text-purple-400 border-l-4 border-purple-500 pl-6 pr-4"
                        : "text-neutral-400 hover:text-white pl-6 pr-4";
                    } else {
                      btnClass = isActive
                        ? "bg-[#f8f7fa] dark:bg-[#0f1129] text-[#3b118b] dark:text-purple-400 font-bold rounded-l-full ml-4 pl-6 relative"
                        : "text-indigo-200 hover:text-white hover:bg-white/5 ml-4 pl-6 rounded-l-full";
                    }

                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          handleTabSelect(tab.id);
                          if (isMobile) {
                            setIsMobileMenuOpen(false);
                          }
                        }}
                        className={`w-[calc(100%-16px)] flex items-center gap-3 py-3 text-xs font-semibold tracking-wide transition-all text-left ${btnClass}`}
                      >
                        {/* Cutout notch rounded corners for active tab on desktop */}
                        {isActive && !isMobile && (
                          <>
                            <div className="absolute right-0 -top-4 w-4 h-4 bg-[#f8f7fa] dark:bg-[#0f1129] rounded-br-2xl pointer-events-none" />
                            <div className="absolute right-0 -bottom-4 w-4 h-4 bg-[#f8f7fa] dark:bg-[#0f1129] rounded-tr-2xl pointer-events-none" />
                          </>
                        )}
                        <IconComponent
                          size={14}
                          className={
                            isActive
                              ? isDarkMode ? "text-purple-400" : "text-[#3b118b]"
                              : "text-indigo-300/70 group-hover:text-white"
                          }
                        />
                        <span className="truncate">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-20 relative z-10 admin-dashboard-container">
      {/* Injecting CSS rules for notches and table layouts */}
      <style dangerouslySetInnerHTML={{ __html: `
        .admin-dashboard-container table {
          width: 100%;
          border-collapse: collapse;
        }
        .admin-dashboard-container thead th {
          text-transform: uppercase;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: #94a3b8;
          padding: 16px 20px;
          border-bottom: 2px solid #f1f5f9;
          text-align: left;
        }
        .dark .admin-dashboard-container thead th {
          color: #64748b;
          border-bottom: 2px solid #1e293b;
        }
        .admin-dashboard-container tbody tr {
          transition: all 0.2s ease;
          border-bottom: 1px solid #f1f5f9;
        }
        .dark .admin-dashboard-container tbody tr {
          border-bottom: 1px solid #1e293b;
        }
        .admin-dashboard-container tbody tr:hover {
          background-color: rgba(59, 17, 139, 0.02);
        }
        .dark .admin-dashboard-container tbody tr:hover {
          background-color: rgba(168, 85, 247, 0.04);
        }
        .admin-dashboard-container tbody td {
          padding: 16px 20px;
          font-size: 13px;
          color: #334155;
          vertical-align: middle;
        }
        .dark .admin-dashboard-container tbody td {
          color: #cbd5e1;
        }
        
        /* Badges status matching mock */
        .badge-status {
          padding: 4px 12px;
          border-radius: 9999px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .badge-status-pending {
          background-color: #fef3c7;
          color: #d97706;
          border: 1px solid #fde68a;
        }
        .badge-status-onhold {
          background-color: #ffedd5;
          color: #ea580c;
          border: 1px solid #fed7aa;
        }
        .badge-status-candidate {
          background-color: #dcfce7;
          color: #15803d;
          border: 1px solid #bbf7d0;
        }
      ` }} />

      {/* Mobile Menu Drawer (Left slide-out) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
            />

            {/* Sliding Drawer Container */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-[#3b118b] p-6 shadow-2xl z-50 flex flex-col h-full lg:hidden overflow-y-auto scrollbar-thin scrollbar-thumb-white/20"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                    <span className="text-[#3b118b] font-bold text-sm">M</span>
                  </div>
                  <span className="text-sm font-extrabold tracking-wider text-white uppercase font-mono">
                    Editor Sections
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-white/70 hover:text-white bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Drawer Menu Body */}
              <div className="flex-1 pb-8">
                {renderCategoryMenu(true)}
              </div>

              {/* Drawer Footer */}
              <div className="pt-4 border-t border-white/10 mt-auto flex flex-col gap-2">
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-white/10 hover:bg-white/20 transition-all"
                >
                  <X size={14} />
                  <span>Close Menu</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main dashboard frame */}
      <div className={`w-full rounded-[32px] overflow-hidden border shadow-2xl flex flex-col lg:flex-row min-h-[85vh] ${
        isDarkMode ? 'border-slate-800 bg-[#0f1129]' : 'border-slate-200 bg-[#f8f7fa]'
      }`}>

        {/* Desktop Sidebar Panel */}
        <aside className="hidden lg:flex flex-col justify-between w-64 shrink-0 bg-[#3b118b] text-white p-0 relative">
          <div>
            {/* Sidebar Logo Box (Jobie style) */}
            <div className="p-6 border-b border-white/5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg shrink-0">
                <span className="text-[#3b118b] font-black text-xl font-display">M</span>
              </div>
              <div>
                <h2 className="text-base font-extrabold text-white tracking-tight leading-none uppercase">
                  Mahdev
                </h2>
                <p className="text-[9px] text-indigo-200 uppercase tracking-widest font-extrabold mt-1">Super Admin</p>
              </div>
            </div>

            {/* Render categories layout */}
            <div className="py-6">
              {renderCategoryMenu(false)}
            </div>
          </div>

          {/* Sidebar Footer Logout */}
          <div className="p-6 border-t border-white/5">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border border-white/10 hover:bg-white/5 text-slate-300 hover:text-white cursor-pointer"
            >
              <LogOut size={14} />
              <span>Exit Console</span>
            </button>
          </div>
        </aside>

        {/* Right workspace partition */}
        <div className="flex-grow flex flex-col min-w-0">
          
          {/* Top Header Panel (Jobie style search, bell and profile) */}
          <header className={`h-20 shrink-0 border-b flex items-center justify-between px-6 sm:px-8 ${
            isDarkMode ? 'border-slate-800 bg-slate-950/80' : 'border-slate-100 bg-white'
          }`}>
            
            {/* Left side: Hamburger menu / Search bar */}
            <div className="flex items-center gap-4 flex-1">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-900/40 transition-colors"
              >
                <Menu size={20} />
              </button>

              <div className="relative w-64 max-w-xs hidden sm:block">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  placeholder="Search something here..."
                  className={`w-full pl-9 pr-4 py-2 text-xs rounded-full border focus:outline-none transition-all ${
                    isDarkMode 
                      ? 'bg-slate-900/60 border-slate-800 focus:border-purple-500 text-white' 
                      : 'bg-slate-50 border-slate-200 focus:border-[#3b118b] text-slate-800'
                  }`}
                />
              </div>
            </div>

            {/* Right side: Messages, Notifications and Profile */}
            <div className="flex items-center gap-4">
              
              {/* Messages Badge indicator */}
              <div className="relative p-2.5 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 cursor-pointer hover:scale-105 transition-transform">
                <Mail size={16} />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#3b118b] text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                  18
                </span>
              </div>

              {/* Notification Badge indicator */}
              <div className="relative p-2.5 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 cursor-pointer hover:scale-105 transition-transform">
                <AlertCircle size={16} />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                  52
                </span>
              </div>

              {/* Vertical Divider */}
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

              {/* Super Admin Profile Section */}
              <div className="flex items-center gap-3">
                <div className="text-right hidden md:block">
                  <div className={`text-xs font-black leading-none ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                    {adminRole === 'ceo' ? 'Yuvan Prabakaran' : 'Divaincy Fernando'}
                  </div>
                  <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block mt-1">
                    {adminRole === 'ceo' ? 'Super Admin' : 'Managing Director'}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-full border border-purple-500/20 bg-purple-100 dark:bg-purple-950/60 overflow-hidden flex items-center justify-center font-bold text-sm text-purple-700 dark:text-purple-300">
                  {adminRole === 'ceo' ? 'YP' : 'DF'}
                </div>
              </div>

            </div>

          </header>

          {/* Main Content Workspace viewport */}
          <main className="flex-1 p-6 sm:p-8 overflow-y-auto max-h-[calc(100vh-200px)]">

            {/* Central CRM & Bookings Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="space-y-10">
                {/* Board Role Switcher & Header */}
                <div className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-6 ${isDarkMode ? 'bg-slate-950/80 border-slate-850' : 'bg-slate-50 border-slate-200'
                  }`}>
                  <div className="space-y-1">
                    <span className={`text-[10px] font-semibold uppercase tracking-wider block ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                      Interactive Board Role Simulator
                    </span>
                    <h4 className={`text-sm font-bold flex items-center gap-1.5 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                      <ShieldCheck size={16} className="text-indigo-500" />
                      Viewing Workspace as: <span className="text-purple-400">{adminRole === 'ceo' ? 'Yuvanshan Prabakaran (CEO)' : 'Divaincy Fernando (Managing Director)'}</span>
                    </h4>
                    <p className="text-xs text-slate-400">
                      {adminRole === 'ceo'
                        ? '⚡ CEO Mode: Authorized to view central financial charts, CRM balances, and database scale statuses.'
                        : '🌸 MD Mode: Authorized to view active rentals inventory limits, photography schedules, and wedding logistics.'}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setAdminRole('ceo')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${adminRole === 'ceo'
                          ? 'bg-purple-600 border-purple-500 text-white'
                          : 'bg-neutral-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                    >
                      Yuvanshan (CEO)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdminRole('md')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${adminRole === 'md'
                          ? 'bg-purple-600 border-purple-500 text-white'
                          : 'bg-neutral-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                    >
                      Divaincy (MD)
                    </button>
                  </div>
                </div>

                {/* Simulated Notification Feeds */}
                <div className={`p-4 rounded-xl border flex items-start gap-3 text-xs ${isDarkMode ? 'bg-purple-950/20 border-purple-500/10 text-purple-200' : 'bg-purple-50 border-purple-200 text-purple-800'
                  }`}>
                  <Sparkles size={16} className="shrink-0 text-purple-400 mt-0.5 animate-pulse" />
                  <div>
                    <p className="font-bold">Tailored Executive Notifications ({adminRole.toUpperCase()})</p>
                    <p className="mt-1 leading-relaxed text-[11px] text-slate-400">
                      {adminRole === 'ceo'
                        ? 'Server status: 100% database health. Active Kubernetes pods: 12. Estimated S-Class fleet GPS tracking: Online. Real-time API status: Synced.'
                        : 'Logistics alert: SWS Luxury Floral sets pre-booking required for upcoming wedding stage requests. KDH Van servicing scheduled for airport transfer runs.'}
                    </p>
                  </div>
                </div>

                {/* 24-Point Executive Dashboard KPIs & Visualizers */}
                {(() => {
                  // Compute real-time Financial KPIs from local database arrays
                  const totalInvoicedAmount = invoices.reduce((sum, inv) => sum + ((inv.paidAmount || 0) + (inv.remainingAmount || 0)), 0);
                  const totalPaymentsReceived = payments.reduce((sum, pay) => sum + (pay.amount || 0), 0);
                  const otherIncomeTotal = incomes.reduce((sum, inc) => sum + (inc.amount || 0), 0);
                  const totalRevenue = totalPaymentsReceived + otherIncomeTotal;
                  const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
                  const totalProfit = totalRevenue - totalExpenses;

                  const pendingPayments = invoices
                    .filter(inv => inv.status === 'Pending' || inv.status === 'Partially Paid' || inv.status === 'Overdue')
                    .reduce((sum, inv) => sum + (inv.remainingAmount || 0), 0);

                  const advancePaymentsReceived = payments
                    .filter(pay => pay.type === 'Advance')
                    .reduce((sum, pay) => sum + (pay.amount || 0), 0);

                  const outstandingBalance = totalInvoicedAmount - totalPaymentsReceived;

                  // Compute operational database statistics
                  const totalCustomers = customers.length;
                  const totalProjectsCount = erpProjects.length;
                  const activeProjectsCount = erpProjects.filter(p => p.status === 'In Progress').length;
                  const completedProjectsCount = erpProjects.filter(p => p.status === 'Completed').length;

                  const totalQuotationsCount = quotations.length;
                  const acceptedQuotationsCount = quotations.filter(q => q.status === 'Approved').length;
                  const rejectedQuotationsCount = quotations.filter(q => q.status === 'Rejected').length;

                  const totalInvoicesCount = invoices.length;
                  const paidInvoicesCount = invoices.filter(inv => inv.status === 'Paid').length;
                  const overdueInvoicesCount = invoices.filter(inv => inv.status === 'Overdue').length;

                  // Monthly Trend Lists incorporating actual values
                  const monthsList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
                  const monthlyIncomes = [1800000, 2200000, 2900000, 2700000, 3100000, 3800000, totalRevenue || 3450000];
                  const monthlyExpenses = [400000, 450000, 580000, 550000, 620000, 780000, totalExpenses || 620000];

                  // Scheduled operational events
                  const upcomingEventsList = bookings
                    .filter(b => b.status === 'Confirmed' || b.status === 'Pending')
                    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());

                  // Calendar custom data map for July 2026
                  const calendarEvents = [
                    { day: 5, label: '💻 Mahdev IT Solutions', desc: 'Deploy Nations Trust Bank Portal Phase 1 container stack', time: '09:00 AM' },
                    { day: 12, label: '🎉 SWS Luxury Event', desc: 'Pre-wedding flower canopy setup & stage install at Hilton', time: '06:00 AM' },
                    { day: 20, label: '🎬 U1 Studio Session', desc: 'Cinematic sunset pre-wedding drone shoot at Taj Samudra', time: '04:30 PM' },
                    { day: 26, label: '✈️ Mahdev Travels VIP', desc: 'UK Client luxury safari airport pick up & KDH elite tour transfer', time: '11:00 AM' }
                  ];

                  const selectedEvent = calendarEvents.find(ev => ev.day === selectedDay);

                  // Extract unique recent bookings and latest contact form submissions
                  const latestContactFormRequests = bookings.slice(0, 4);

                  return (
                    <div className="space-y-10">

                      {/* CATEGORY 1: FINANCIAL SUITE BOARD METRICS (6 WIDGETS) */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                            <DollarSign size={16} />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Executive Financial Suite (ERP)</h4>
                            <p className="text-[11px] text-slate-400">Active real-time financial summaries computed from invoices, incomes, and payroll records.</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                          {[
                            {
                              id: "widget-total-revenue",
                              title: 'Total Revenue',
                              val: `Rs. ${totalRevenue.toLocaleString()}`,
                              desc: 'Invoices paid + other incomes',
                              color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/10'
                            },
                            {
                              id: "widget-total-expenses",
                              title: 'Total Expenses',
                              val: `Rs. ${totalExpenses.toLocaleString()}`,
                              desc: 'Company bills & procurement',
                              color: 'text-red-400 bg-red-500/10 border-red-500/10'
                            },
                            {
                              id: "widget-total-profit",
                              title: 'Total Profit',
                              val: `Rs. ${totalProfit.toLocaleString()}`,
                              desc: 'Net margin after expenses',
                              color: totalProfit >= 0 ? 'text-purple-400 bg-purple-500/10 border-purple-500/10' : 'text-rose-400 bg-rose-500/10 border-rose-500/10'
                            },
                            {
                              id: "widget-pending-payments",
                              title: 'Pending Payments',
                              val: `Rs. ${pendingPayments.toLocaleString()}`,
                              desc: 'Unpaid invoice amounts',
                              color: 'text-amber-400 bg-amber-500/10 border-amber-500/10'
                            },
                            {
                              id: "widget-advance-payments",
                              title: 'Advance Received',
                              val: `Rs. ${advancePaymentsReceived.toLocaleString()}`,
                              desc: 'Customer upfront retainers',
                              color: 'text-blue-400 bg-blue-500/10 border-blue-500/10'
                            },
                            {
                              id: "widget-outstanding-balance",
                              title: 'Outstanding Balance',
                              val: `Rs. ${outstandingBalance.toLocaleString()}`,
                              desc: 'Total unpaid client book debt',
                              color: 'text-pink-400 bg-pink-500/10 border-pink-500/10'
                            },
                          ].map((m) => (
                            <div key={m.id} className={`p-4 rounded-xl border ${isDarkMode ? 'bg-neutral-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'} flex flex-col justify-between`}>
                              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono font-bold truncate">{m.title}</p>
                              <div className="my-2">
                                <p className={`text-sm sm:text-base font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'} truncate`}>{m.val}</p>
                              </div>
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono inline-block font-semibold ${m.color} truncate`}>
                                {m.desc}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* CATEGORY 2: ENTERPRISE OPERATIONS & PIPELINE (10 WIDGETS) */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                            <Briefcase size={16} />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Operations & CRM Pipeline Registry</h4>
                            <p className="text-[11px] text-slate-400">Operational milestones, customer registries, quotations progress, and invoice status registers.</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-3">
                          {[
                            { id: "widget-tot-cust", title: 'Total Customers', val: totalCustomers, desc: 'Active records', icon: Users, color: 'text-purple-400' },
                            { id: "widget-tot-proj", title: 'Total Projects', val: totalProjectsCount, desc: 'Software & Events', icon: Briefcase, color: 'text-blue-400' },
                            { id: "widget-act-proj", title: 'Active Projects', val: activeProjectsCount, desc: 'In progress', icon: Clock, color: 'text-amber-400' },
                            { id: "widget-comp-proj", title: 'Completed Proj', val: completedProjectsCount, desc: 'Fully delivered', icon: CheckCircle, color: 'text-emerald-400' },
                            { id: "widget-tot-quot", title: 'Total Quotes', val: totalQuotationsCount, desc: 'Client tenders', icon: FileText, color: 'text-pink-400' },
                            { id: "widget-acc-quot", title: 'Accepted Quotes', val: acceptedQuotationsCount, desc: 'Sales signed', icon: UserCheck, color: 'text-indigo-400' },
                            { id: "widget-rej-quot", title: 'Rejected Quotes', val: rejectedQuotationsCount, desc: 'Lost/Expired', icon: X, color: 'text-rose-400' },
                            { id: "widget-tot-inv", title: 'Total Invoices', val: totalInvoicesCount, desc: 'Ledger records', icon: FileSpreadsheet, color: 'text-slate-300' },
                            { id: "widget-paid-inv", title: 'Paid Invoices', val: paidInvoicesCount, desc: 'Funds cleared', icon: Check, color: 'text-teal-400' },
                            { id: "widget-over-inv", title: 'Overdue Inv', val: overdueInvoicesCount, desc: 'Awaiting collect', icon: AlertTriangle, color: 'text-red-400' },
                          ].map((w) => (
                            <div key={w.id} className={`p-3 rounded-xl border ${isDarkMode ? 'bg-neutral-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'} flex flex-col justify-between items-center text-center`}>
                              <div className={`p-1 rounded bg-neutral-900 ${w.color} mb-1.5`}>
                                <w.icon size={13} />
                              </div>
                              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block leading-tight truncate w-full">{w.title}</p>
                              <p className="text-base font-black text-white my-1">{w.val}</p>
                              <span className="text-[8px] text-slate-500 font-mono leading-none truncate w-full">{w.desc}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* CATEGORY 3: VISUAL FINANCIAL TRENDS CHARTS (2 CHARTS) */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* Monthly Income Chart Widget */}
                        <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-neutral-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                          <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-2">
                              <TrendingUp size={16} className="text-emerald-400" />
                              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Monthly Income Analytics (LKR)</h4>
                            </div>
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-bold">Incomes Trend</span>
                          </div>

                          <div className="w-full flex items-end justify-between h-40 pt-4 px-2">
                            {monthlyIncomes.map((inc, i) => {
                              const maxVal = Math.max(...monthlyIncomes) || 1;
                              const heightPct = Math.max(8, Math.round((inc / maxVal) * 100));
                              return (
                                <div key={i} className="flex flex-col items-center flex-grow group relative px-1">
                                  {/* Hover Tooltip */}
                                  <div className="absolute bottom-full mb-1 bg-slate-900 border border-slate-800 text-[10px] text-white px-2 py-1 rounded font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-35 shadow-lg">
                                    Rs. {inc.toLocaleString()}
                                  </div>
                                  <div className="w-full bg-neutral-900 rounded-md h-32 flex items-end overflow-hidden border border-slate-800/20">
                                    <div
                                      className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 rounded-md transition-all duration-1000 group-hover:brightness-125 cursor-pointer"
                                      style={{ height: `${heightPct}%` }}
                                    />
                                  </div>
                                  <span className="text-[10px] text-slate-500 font-mono mt-2 font-bold">{monthsList[i]}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Monthly Expense Chart Widget */}
                        <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-neutral-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                          <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-2">
                              <TrendingDown size={16} className="text-rose-400" />
                              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Monthly Expense Analytics (LKR)</h4>
                            </div>
                            <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded font-bold">Expenses Trend</span>
                          </div>

                          <div className="w-full flex items-end justify-between h-40 pt-4 px-2">
                            {monthlyExpenses.map((exp, i) => {
                              const maxVal = Math.max(...monthlyExpenses) || 1;
                              const heightPct = Math.max(8, Math.round((exp / maxVal) * 100));
                              return (
                                <div key={i} className="flex flex-col items-center flex-grow group relative px-1">
                                  {/* Hover Tooltip */}
                                  <div className="absolute bottom-full mb-1 bg-slate-900 border border-slate-800 text-[10px] text-white px-2 py-1 rounded font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-35 shadow-lg">
                                    Rs. {exp.toLocaleString()}
                                  </div>
                                  <div className="w-full bg-neutral-900 rounded-md h-32 flex items-end overflow-hidden border border-slate-800/20">
                                    <div
                                      className="w-full bg-gradient-to-t from-red-600 to-rose-400 rounded-md transition-all duration-1000 group-hover:brightness-125 cursor-pointer"
                                      style={{ height: `${heightPct}%` }}
                                    />
                                  </div>
                                  <span className="text-[10px] text-slate-500 font-mono mt-2 font-bold">{monthsList[i]}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                      </div>

                      {/* CATEGORY 4: EXECUTIVE STATUS, TASKS & SCHEDULING (6 MODULES) */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* WIDGET 19 & 24: ENTERPRISE INTERACTIVE CALENDAR & EVENTS */}
                        <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-neutral-950 border-slate-800' : 'bg-slate-50 border-slate-200'} flex flex-col justify-between`}>
                          <div>
                            <div className="flex justify-between items-center mb-4">
                              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                <Calendar size={13} className="text-purple-400" />
                                July 2026 Board Calendar
                              </h4>
                              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-bold">Interactive</span>
                            </div>

                            {/* Mini Calendar Grid (31 Days of July 2026 - Starts on Wednesday) */}
                            <div className="grid grid-cols-7 gap-1.5 text-center text-xs mb-4">
                              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                                <span key={d} className="text-[9px] font-mono text-slate-600 font-black">{d}</span>
                              ))}

                              {/* Empty padding days for Wednesday start */}
                              <span /> <span />

                              {Array.from({ length: 31 }, (_, dayIdx) => {
                                const day = dayIdx + 1;
                                const hasEvent = calendarEvents.some(ev => ev.day === day);
                                const isSelected = selectedDay === day;

                                return (
                                  <button
                                    key={day}
                                    type="button"
                                    onClick={() => setSelectedDay(day)}
                                    className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold transition-all relative ${isSelected
                                        ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20 scale-110'
                                        : hasEvent
                                          ? 'bg-purple-500/15 text-purple-300 hover:bg-purple-500/25 ring-1 ring-purple-500/25'
                                          : 'text-slate-400 hover:text-white hover:bg-neutral-900'
                                      }`}
                                  >
                                    {day}
                                    {hasEvent && !isSelected && (
                                      <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-purple-400 animate-ping" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Event Details Viewer */}
                          <div className="p-3 rounded-xl bg-neutral-900 border border-slate-800/40 text-xs mt-2 min-h-[70px] flex flex-col justify-center">
                            {selectedEvent ? (
                              <div className="space-y-1">
                                <div className="flex justify-between font-mono text-[9px] uppercase font-bold">
                                  <span className="text-purple-400">{selectedEvent.label}</span>
                                  <span className="text-slate-500">Day {selectedDay} @ {selectedEvent.time}</span>
                                </div>
                                <p className="text-white font-bold leading-tight">{selectedEvent.desc}</p>
                              </div>
                            ) : (
                              <p className="text-slate-500 text-center text-[11px] italic">Select highlighted dates (5th, 12th, 20th, 26th) to inspect scheduled operational tasks.</p>
                            )}
                          </div>
                        </div>

                        {/* WIDGET 23: TODAY'S INTERACTIVE EXECUTIVE TASKS */}
                        <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-neutral-950 border-slate-800' : 'bg-slate-50 border-slate-200'} flex flex-col justify-between`}>
                          <div>
                            <div className="flex justify-between items-center mb-4">
                              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                <CheckCircle size={13} className="text-emerald-400" />
                                Today's Tasks Checklist
                              </h4>
                              <span className="text-[9px] font-mono text-slate-500 font-bold">
                                {todoTasks.filter(t => t.completed).length}/{todoTasks.length} Done
                              </span>
                            </div>

                            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                              {todoTasks.map((t) => (
                                <div
                                  key={t.id}
                                  onClick={() => setTodoTasks(prev => prev.map(task => task.id === t.id ? { ...task, completed: !task.completed } : task))}
                                  className="flex items-start gap-2.5 p-2 rounded-xl bg-neutral-900/60 border border-slate-800/30 hover:border-slate-700/50 cursor-pointer transition-all select-none"
                                >
                                  <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 mt-0.5 ${t.completed ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-800 bg-neutral-950'
                                    }`}>
                                    {t.completed && <Check size={10} strokeWidth={3} />}
                                  </div>
                                  <div className="min-w-0">
                                    <p className={`text-[11px] font-bold leading-tight ${t.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{t.text}</p>
                                    <span className={`text-[8px] font-mono font-bold uppercase tracking-widest block mt-0.5 ${t.tag === 'SWS Events' ? 'text-amber-400' :
                                        t.tag === 'U1 Studio' ? 'text-pink-400' :
                                          t.tag === 'Mahdev IT' ? 'text-blue-400' :
                                            t.tag === 'Travels' ? 'text-emerald-400' : 'text-slate-500'
                                      }`}>{t.tag}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Progression bar */}
                          <div className="mt-3 pt-3 border-t border-slate-800/20">
                            <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-emerald-500 h-full transition-all duration-500"
                                style={{ width: `${Math.round((todoTasks.filter(t => t.completed).length / todoTasks.length) * 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* WIDGET 22: LIVE WEBSITE VISITORS TRAFFIC COUNTER */}
                        <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-neutral-950 border-slate-800' : 'bg-slate-50 border-slate-200'} flex flex-col justify-between`}>
                          <div>
                            <div className="flex justify-between items-center mb-4">
                              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                <Activity size={13} className="text-pink-400 animate-pulse" />
                                Live Traffic Simulator
                              </h4>
                              <span className="flex items-center gap-1 text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                                Live Pulse
                              </span>
                            </div>

                            <div className="space-y-1">
                              <p className="text-3xl font-black text-white">2,845</p>
                              <p className="text-[10px] text-slate-400 font-mono">Unique Page Views Today</p>
                            </div>

                            {/* Traffic mini-sparkline SVG */}
                            <div className="mt-4 pt-2">
                              <svg className="w-full h-12 stroke-pink-500 fill-none" viewBox="0 0 100 30">
                                <path
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  d="M0,25 Q15,5 30,22 T60,10 T80,26 T100,2"
                                />
                                {/* Gradient Area under curve */}
                                <path
                                  fill="url(#traffic-gradient)"
                                  opacity="0.1"
                                  stroke="none"
                                  d="M0,25 Q15,5 30,22 T60,10 T80,26 T100,2 L100,30 L0,30 Z"
                                />
                                <defs>
                                  <linearGradient id="traffic-gradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#f43f5e" />
                                    <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
                                  </linearGradient>
                                </defs>
                              </svg>
                            </div>
                          </div>

                          <div className="text-[9px] font-mono text-slate-500 flex justify-between items-center mt-3 pt-3 border-t border-slate-800/20">
                            <span>Session avg: 4m 32s</span>
                            <span>Bounce rate: 22.4%</span>
                          </div>
                        </div>

                      </div>

                      {/* WIDGET 19: DETAILED UPCOMING OPERATIONS AGENDA */}
                      <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-neutral-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
                          <Calendar size={14} className="text-purple-400" />
                          Detailed Upcoming Operational Scheduled Events (Next 30 Days)
                        </h4>
                        <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                          {upcomingEventsList.length > 0 ? (
                            upcomingEventsList.map((b) => (
                              <div key={b.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-3.5 rounded-xl bg-neutral-900/60 border border-slate-800/40">
                                <div className="flex items-center gap-3">
                                  <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 text-center shrink-0 min-w-[50px]">
                                    <span className="block text-[8px] font-mono uppercase font-bold tracking-widest">Date</span>
                                    <span className="block text-xs font-mono font-bold">{b.eventDate.split('-')[2] || b.eventDate}</span>
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-white">{b.name} ({b.brand})</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">{b.serviceType}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-[10px] font-mono text-slate-400">Est. Rs. {b.amount ? b.amount.toLocaleString() : '0'}</span>
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${b.status === 'Confirmed'
                                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                      : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                    }`}>
                                    {b.status}
                                  </span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-slate-500 text-xs italic text-center py-4">No confirmed events found in database. Head to active divisions to log event bookings.</p>
                          )}
                        </div>
                      </div>

                      {/* WIDGET 20 & 21: CENTRALIZED INTERACTIVE CRM LEAD REGISTRY & CONTACT INQUIRIES */}
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div>
                            <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                              <Users size={16} className="text-purple-400" />
                              Centralized CRM Lead & Contact Inquiries Registry
                            </h3>
                            <p className="text-xs text-slate-400">Review lead bookings, manage operational stages, and coordinate team task alignments.</p>
                          </div>

                          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                            <select
                              value={bookingFilterBrand}
                              onChange={(e) => setBookingFilterBrand(e.target.value as any)}
                              className="px-3 py-1.5 rounded-xl bg-neutral-950 border border-slate-850 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
                            >
                              <option value="All">All Brands</option>
                              <option value="SWS">SWS Event Management</option>
                              <option value="IT">Mahdev IT</option>
                              <option value="Studio">U1 Studio</option>
                              <option value="Travels">Mahdev Travels</option>
                            </select>

                            <select
                              value={bookingFilterStatus}
                              onChange={(e) => setBookingFilterStatus(e.target.value as any)}
                              className="px-3 py-1.5 rounded-xl bg-neutral-950 border border-slate-850 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
                            >
                              <option value="All">All Statuses</option>
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Completed">Completed</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>

                            <div className="relative w-full sm:w-48">
                              <Search size={12} className="absolute left-3 top-2.5 text-slate-500" />
                              <input
                                type="text"
                                placeholder="Search Client..."
                                value={bookingSearchQuery}
                                onChange={(e) => setBookingSearchQuery(e.target.value)}
                                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-neutral-950 border border-slate-850 text-slate-200 focus:outline-none focus:border-purple-500"
                              />
                            </div>
                          </div>
                        </div>

                        {/* CRM Table */}
                        <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-neutral-950">
                          <table className="w-full text-left border-collapse text-xs sm:text-sm">
                            <thead>
                              <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono text-[9px] bg-neutral-900/60">
                                <th className="py-3 px-4">Client</th>
                                <th className="py-3 px-4">Division</th>
                                <th className="py-3 px-4">Service Required</th>
                                <th className="py-3 px-4">Budget / Est</th>
                                <th className="py-3 px-4">Date</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4 text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {bookings
                                .filter(b => {
                                  const matchesBrand = bookingFilterBrand === 'All' || b.brand === bookingFilterBrand;
                                  const matchesStatus = bookingFilterStatus === 'All' || b.status === bookingFilterStatus;
                                  const matchesSearch = b.name.toLowerCase().includes(bookingSearchQuery.toLowerCase()) ||
                                    b.email.toLowerCase().includes(bookingSearchQuery.toLowerCase()) ||
                                    b.phone.includes(bookingSearchQuery);
                                  return matchesBrand && matchesStatus && matchesSearch;
                                })
                                .map((b) => (
                                  <tr key={b.id} className="border-b border-slate-800/50 hover:bg-neutral-900/40">
                                    <td className="py-4 px-4">
                                      <p className="font-bold text-white">{b.name}</p>
                                      <p className="text-[10px] text-slate-500">{b.phone} {b.email && `| ${b.email}`}</p>
                                    </td>
                                    <td className="py-4 px-4">
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${b.brand === 'SWS' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25' :
                                          b.brand === 'IT' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/25' :
                                            b.brand === 'Studio' ? 'bg-pink-500/10 text-pink-400 border border-pink-500/25' :
                                              'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                                        }`}>
                                        {b.brand === 'SWS' ? '🎉 SWS Event Management' :
                                          b.brand === 'IT' ? '💻 Mahdev IT' :
                                            b.brand === 'Studio' ? '🎬 U1 Studio' :
                                              '✈️ Travels'}
                                      </span>
                                    </td>
                                    <td className="py-4 px-4 text-slate-300 font-medium">
                                      <span className="truncate max-w-xs block" title={b.notes}>{b.serviceType}</span>
                                    </td>
                                    <td className="py-4 px-4 font-mono font-bold text-white">
                                      Rs. {b.amount ? b.amount.toLocaleString() : 'N/A'}
                                    </td>
                                    <td className="py-4 px-4 font-mono text-slate-400">{b.eventDate}</td>
                                    <td className="py-4 px-4">
                                      <select
                                        value={b.status}
                                        onChange={(e) => handleUpdateBookingStatus(b.id, e.target.value as any)}
                                        className={`px-2 py-1 rounded text-[11px] font-bold focus:outline-none cursor-pointer ${b.status === 'Completed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                            b.status === 'Confirmed' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                              b.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                                                'bg-red-500/10 text-red-400 border border-red-500/20'
                                          }`}
                                      >
                                        <option value="Pending">Pending</option>
                                        <option value="Confirmed">Confirmed</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Cancelled">Cancelled</option>
                                      </select>
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                      <button
                                        onClick={() => handleDeleteBooking(b.id)}
                                        className="p-1 rounded hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                                        title="Delete Lead"
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                    </div>
                  );
                })()}

              </div>
            )}

            {/* Enterprise CMS Hub sections */}
            {(activeTab === 'crm' || activeTab === 'projects_erp' || activeTab === 'finances' || activeTab === 'employees' || activeTab === 'systems') && (
              <EnterpriseHub
                isDarkMode={isDarkMode}
                onDataChange={onDataChange}
                activeTab={activeTab}
              />
            )}

            {/* Theme Settings Tab */}
            {activeTab === 'theme' && (
              <div className="space-y-8">
                <div>
                  <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Website Brand, Colors & 3D Animations
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Customize your website's active visual mood, brand name, primary colors, Google typography, home page hero text and interactive 3D WebGL animations.
                  </p>
                </div>

                {/* Section 1: Color Themes & Presets */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-purple-500/10 pb-8">
                  <div className="space-y-4">
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-purple-400">
                      Select Theme Color Palette
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'purple', label: 'Royal Purple', hex: '#a855f7' },
                        { id: 'emerald', label: 'Emerald Forest', hex: '#10b981' },
                        { id: 'blue', label: 'Electric Blue', hex: '#3b82f6' },
                        { id: 'rose', label: 'Sunset Rose', hex: '#f43f5e' },
                        { id: 'amber', label: 'Amber Gold', hex: '#f59e0b' },
                        { id: 'custom', label: 'Custom Palette', hex: theme.primaryColor },
                      ].map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setTheme({
                            ...theme,
                            themePreset: preset.id as any,
                            primaryColor: preset.id === 'custom' ? theme.primaryColor : preset.hex
                          })}
                          className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${theme.themePreset === preset.id
                              ? 'border-purple-500 bg-purple-500/10 shadow-md ring-1 ring-purple-500/30'
                              : 'border-purple-500/10 bg-neutral-950/40 hover:border-purple-500/30'
                            }`}
                        >
                          <div
                            className="w-4 h-4 rounded-full shrink-0 border border-white/20"
                            style={{ backgroundColor: preset.hex }}
                          />
                          <span className="text-xs font-semibold text-white">{preset.label}</span>
                        </button>
                      ))}
                    </div>

                    {theme.themePreset === 'custom' && (
                      <div className="pt-2">
                        <label className="block text-[11px] font-mono uppercase text-slate-400 mb-2">
                          Input Custom Theme Hex Color
                        </label>
                        <div className="flex gap-3">
                          <input
                            type="color"
                            value={theme.primaryColor}
                            onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                            className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-purple-500/20"
                          />
                          <input
                            type="text"
                            value={theme.primaryColor}
                            onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                            placeholder="#a855f7"
                            className="w-full px-4 py-2 text-sm rounded-xl border border-purple-500/20 bg-neutral-950/60 text-white focus:outline-none focus:border-purple-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Theme Preview Sandbox */}
                  <div className="p-6 rounded-2xl border border-purple-500/10 bg-neutral-950/40 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Live Palette Preview
                      </h4>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {/* Render shades dynamically so user can visualize */}
                        {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((shade) => (
                          <div
                            key={shade}
                            className="h-10 flex-grow rounded border border-white/5"
                            style={{ backgroundColor: shade === 500 ? theme.primaryColor : adjustHex(theme.primaryColor, shade > 500 ? -(shade - 500) * 0.12 : (500 - shade) * 0.18) }}
                            title={`${shade} shade`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        This primary palette is automatically converted into full responsive tailwind design shades (from ultra-light <span className="text-white">50</span> up to cinematic dark <span className="text-white">950</span>), modifying every hover effect, border, background glow, and loader stream across the site!
                      </p>
                    </div>
                    <div className="pt-4 border-t border-purple-500/5 flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[11px] font-mono uppercase text-slate-500">Live Engine Ready</span>
                    </div>
                  </div>
                </div>

                {/* Section 2: Fonts & Typography pairing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-purple-500/10 pb-8">
                  <div className="space-y-4">
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-purple-400">
                      Google Fonts Typography Pairing
                    </label>
                    <div className="grid grid-cols-1 gap-2.5">
                      {[
                        { id: 'Poppins', label: 'Poppins (Geometric Modern)', desc: 'Clean geometric layouts. Ideal for modern corporations.' },
                        { id: 'Inter', label: 'Inter (Professional/Swiss)', desc: 'Elegant high-density readability. The designer standard.' },
                        { id: 'Playfair Display', label: 'Playfair Display (Luxury Serif)', desc: 'Classic editorial romance. Breathtaking for decorations.' },
                        { id: 'Space Grotesk', label: 'Space Grotesk (Tech Monospace)', desc: 'Futuristic grid design. Ideal for IT and software divisions.' },
                        { id: 'Montserrat', label: 'Montserrat (Vibrant Sans-Serif)', desc: 'Bold, striking active presence. Great for photography studios.' },
                      ].map((font) => (
                        <button
                          key={font.id}
                          type="button"
                          onClick={() => setTheme({ ...theme, fontFamily: font.id })}
                          className={`flex flex-col p-3.5 rounded-xl border text-left transition-all ${theme.fontFamily === font.id
                              ? 'border-purple-500 bg-purple-500/10'
                              : 'border-purple-500/10 bg-neutral-950/40 hover:border-purple-500/30'
                            }`}
                        >
                          <span className="text-sm font-semibold text-white" style={{ fontFamily: font.id }}>{font.label}</span>
                          <span className="text-xs text-slate-400 mt-1">{font.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Section 3: 3D Animation Background Customizer */}
                  <div className="space-y-4">
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-purple-400">
                      Interactive 3D WebGL Background Mode
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        { id: 'multiverse', label: '🚀 Responsive Multiverse Mode (Recommended)', desc: '3D scene morphs automatically based on active page: Event Management/Decoration (floating blossoms & gold knot), Studio Photography (viewfinder reticles & shutter circles), ERP Systems (relational database cubes & rising green packet streams), or Website & App Development (responsive wireframe screen viewport & drifting binary digital streams).' },
                        { id: 'decoration', label: '✨ Exclusive SWS Event Management & Decoration Theme', desc: 'Lock background to gold-plated floral torus knot, romantic champagne light-beams, and floating rose-gold blossoms.' },
                        { id: 'photography', label: '📸 Exclusive U1 Studio Photography Theme', desc: 'Lock background to concentric glass aperture camera rings, flash light-pulses, and drifting camera lens bokeh disks.' },
                        { id: 'erp', label: '📊 Exclusive Corporate ERP Database Theme', desc: 'Lock background to glowing interconnected relational database cubes, emerald point-lights, and rapid vertical green data packet streams.' },
                        { id: 'it', label: '💻 Exclusive Web & App Development Theme', desc: 'Lock background to a floating 3D responsive device viewport, digital global network orbits, and custom horizontal binary 1 & 0 digital code streams.' },
                      ].map((ani) => (
                        <button
                          key={ani.id}
                          type="button"
                          onClick={() => setTheme({ ...theme, animationMode: ani.id as any })}
                          className={`flex flex-col p-4 rounded-xl border text-left transition-all ${theme.animationMode === ani.id
                              ? 'border-purple-500 bg-purple-500/10 shadow-md ring-1 ring-purple-500/30'
                              : 'border-purple-500/10 bg-neutral-950/40 hover:border-purple-500/30'
                            }`}
                        >
                          <span className="text-xs font-bold text-white uppercase tracking-wider">{ani.label}</span>
                          <span className="text-xs text-slate-400 mt-1.5 leading-relaxed">{ani.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Section 4: Brand Texts & Hero Settings */}
                <div className="space-y-6">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-purple-400">
                    Custom Website Texts & Hero Branding
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Website Title (Browser Tab)</label>
                      <input
                        type="text"
                        value={theme.websiteTitle}
                        onChange={(e) => setTheme({ ...theme, websiteTitle: e.target.value })}
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-purple-500/20 bg-neutral-950/60 text-white focus:outline-none focus:border-purple-500"
                        placeholder="e.g., Mahdev Pvt Ltd - Elite Service Suite"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">Appears in browser tab and for SEO</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Favicon URL or Upload</label>
                      <div className="flex gap-3 mb-2">
                        <input
                          type="text"
                          value={theme.faviconUrl}
                          onChange={(e) => setTheme({ ...theme, faviconUrl: e.target.value })}
                          className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-purple-500/20 bg-neutral-950/60 text-white focus:outline-none focus:border-purple-500"
                          placeholder="e.g., /favicon.ico or /favicon-32x32.png"
                        />
                        <button
                          type="button"
                          onClick={() => document.getElementById('favicon-file-input')?.click()}
                          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider transition-all"
                        >
                          Upload Favicon
                        </button>
                        <input
                          id="favicon-file-input"
                          type="file"
                          accept="image/*,.ico"
                          onChange={async (e) => {
                            if (e.target.files?.[0]) {
                              const file = e.target.files[0];
                              try {
                                const formData = new FormData();
                                formData.append("image", file);
                                formData.append("folder", "branding");
                                const res = await fetch("/api/upload", {
                                  method: "POST",
                                  body: formData
                                });
                                if (res.ok) {
                                  const data = await res.json();
                                  if (data.success && data.url) {
                                    setTheme({ ...theme, faviconUrl: data.url });
                                  }
                                }
                              } catch (err) {
                                console.error("Favicon upload failed:", err);
                              }
                            }
                          }}
                          className="hidden"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400">Icon in browser tab (32x32 recommended)</p>
                      {theme.faviconUrl && (
                        <div className="mt-2 flex items-center gap-2">
                          <img src={theme.faviconUrl} alt="Favicon preview" className="w-6 h-6 border border-purple-500/30 rounded" />
                          <span className="text-[10px] text-slate-400">Preview</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Brand Name</label>
                      <input
                        type="text"
                        value={theme.brandName}
                        onChange={(e) => setTheme({ ...theme, brandName: e.target.value })}
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-purple-500/20 bg-neutral-950/60 text-white focus:outline-none focus:border-purple-500"
                        placeholder="Mahdev Pvt Ltd"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Home Hero Title Line 1</label>
                      <input
                        type="text"
                        value={theme.heroTitle1}
                        onChange={(e) => setTheme({ ...theme, heroTitle1: e.target.value })}
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-purple-500/20 bg-neutral-950/60 text-white focus:outline-none focus:border-purple-500"
                        placeholder="Building Experiences."
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Home Hero Title Line 2 (Vibrant Gradient Accent)</label>
                      <input
                        type="text"
                        value={theme.heroTitle2}
                        onChange={(e) => setTheme({ ...theme, heroTitle2: e.target.value })}
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-purple-500/20 bg-neutral-950/60 text-white focus:outline-none focus:border-purple-500"
                        placeholder="Creating Technology."
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Home Hero Description Paragraph</label>
                      <textarea
                        rows={3}
                        value={theme.heroDescription}
                        onChange={(e) => setTheme({ ...theme, heroDescription: e.target.value })}
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-purple-500/20 bg-neutral-950/60 text-white focus:outline-none focus:border-purple-500"
                        placeholder="Company overview description..."
                      />
                    </div>

                    <div className="md:col-span-2 border-t border-purple-500/10 pt-6 mt-4">
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-purple-400 mb-3">
                        Corporate Brand Logo (Upload Image File or Paste URL)
                      </label>
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* File Upload Zone */}
                        <div className="lg:col-span-7">
                          <div
                            onDragOver={(e) => {
                              e.preventDefault();
                              setIsDraggingLogo(true);
                            }}
                            onDragLeave={() => setIsDraggingLogo(false)}
                            onDrop={(e) => {
                              e.preventDefault();
                              setIsDraggingLogo(false);
                              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                handleLogoFile(e.dataTransfer.files[0]);
                              }
                            }}
                            onClick={() => document.getElementById('logo-file-input-theme')?.click()}
                            className={`group relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer ${isDraggingLogo
                                ? 'border-purple-500 bg-purple-500/10 scale-[1.01]'
                                : 'border-purple-500/20 bg-neutral-950/40 hover:border-purple-500/50 hover:bg-purple-500/5'
                              }`}
                          >
                            <input
                              id="logo-file-input-theme"
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleLogoFile(e.target.files[0]);
                                }
                              }}
                              className="hidden"
                            />
                            <Upload
                              className={`w-8 h-8 mb-3 transition-transform group-hover:-translate-y-1 ${isDraggingLogo ? 'text-purple-400 animate-pulse' : 'text-slate-400 group-hover:text-purple-400'
                                }`}
                            />
                            <p className="text-xs font-semibold mb-1 text-center text-slate-200">
                              Drag & Drop your logo here, or <span className="text-purple-500 underline">browse</span>
                            </p>
                            <p className="text-[10px] text-slate-400 text-center">
                              Supports transparent PNG, SVG, JPG, WebP. Recommended size &lt; 500KB.
                            </p>
                            {uploadError && (
                              <p className="text-[11px] font-mono text-rose-500 mt-2 font-semibold">
                                ⚠ {uploadError}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Logo Preview & URL Fallback */}
                        <div className="lg:col-span-5 flex flex-col gap-4">
                          <div className="p-4 rounded-2xl border border-purple-500/10 bg-neutral-950/40 flex items-center gap-4">
                            <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-purple-500/30 bg-neutral-950 flex-shrink-0 flex items-center justify-center">
                              {contact.logo ? (
                                <img
                                  src={contact.logo}
                                  alt="Logo Preview"
                                  className="w-full h-full object-contain p-1"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <span className="text-xs text-slate-500 uppercase font-mono">No Logo</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold uppercase tracking-wider text-slate-300">
                                Logo Display Preview
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                                {contact.logo ? (contact.logo.startsWith('data:') ? 'Custom local upload image' : contact.logo) : 'Using default company placeholder'}
                              </p>
                              {contact.logo && (
                                <button
                                  type="button"
                                  onClick={() => setContact({ ...contact, logo: '' })}
                                  className="text-[10px] text-rose-500 font-mono underline hover:text-rose-400 font-semibold mt-1 block"
                                >
                                  Reset to Default Placeholder
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">
                              Or paste direct Image URL
                            </label>
                            <input
                              type="text"
                              value={contact.logo || ''}
                              onChange={(e) => setContact({ ...contact, logo: e.target.value })}
                              placeholder="https://example.com/logo.png"
                              className="w-full px-4 py-2 text-xs rounded-xl border border-purple-500/20 bg-neutral-950/60 text-white focus:outline-none focus:border-purple-500 font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Division and System Image Customizers */}
                    <div className="md:col-span-2 border-t border-purple-500/10 pt-6 mt-6">
                      <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400 mb-3">
                        Corporate Division Banners & Background Images (Dynamic Cloud Assets)
                      </h4>
                      <p className="text-xs text-slate-400 mb-4">
                        Upload custom banner/cover images or paste external image URLs to personalize each of the business division landing blocks and page templates.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Brand Logo Customizer */}
                        <div className="p-4 rounded-2xl border border-purple-500/10 bg-neutral-950/40 space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold text-slate-300 uppercase font-mono">Brand Logo</label>
                            <span className="text-[10px] text-purple-400 font-mono">Header & Footer</span>
                          </div>
                          <AdminImageUploader
                            label="Brand Logo"
                            value={theme.brandLogo || ''}
                            onChange={(url) => setTheme({ ...theme, brandLogo: url })}
                            isDarkMode={true}
                          />
                        </div>

                        {/* SWS Event Management Banner */}
                        <div className="p-4 rounded-2xl border border-purple-500/10 bg-neutral-950/40 space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold text-slate-300 uppercase font-mono">SWS Event Management Banner</label>
                            <span className="text-[10px] text-pink-400 font-mono">Event & Decor Card</span>
                          </div>
                          <AdminImageUploader
                            label="SWS Event Banner"
                            value={theme.decorationBanner || ''}
                            onChange={(url) => setTheme({ ...theme, decorationBanner: url })}
                            isDarkMode={true}
                          />
                        </div>

                        {/* U1 Studio Photography Banner */}
                        <div className="p-4 rounded-2xl border border-purple-500/10 bg-neutral-950/40 space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold text-slate-300 uppercase font-mono">U1 Studio Photography Banner</label>
                            <span className="text-[10px] text-purple-400 font-mono">Studio Photography Card</span>
                          </div>
                          <AdminImageUploader
                            label="U1 Studio Banner"
                            value={theme.photographyBanner || ''}
                            onChange={(url) => setTheme({ ...theme, photographyBanner: url })}
                            isDarkMode={true}
                          />
                        </div>

                        {/* Mahdev IT Solutions Banner */}
                        <div className="p-4 rounded-2xl border border-purple-500/10 bg-neutral-950/40 space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold text-slate-300 uppercase font-mono">Mahdev IT Solutions Banner</label>
                            <span className="text-[10px] text-cyan-400 font-mono">IT & Software Card</span>
                          </div>
                          <AdminImageUploader
                            label="Mahdev IT Banner"
                            value={theme.itBanner || ''}
                            onChange={(url) => setTheme({ ...theme, itBanner: url })}
                            isDarkMode={true}
                          />
                        </div>

                        {/* Mahdev Travels Banner */}
                        <div className="p-4 rounded-2xl border border-purple-500/10 bg-neutral-950/40 space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold text-slate-300 uppercase font-mono">Mahdev Travels Banner</label>
                            <span className="text-[10px] text-amber-400 font-mono">Travels & Fleet Card</span>
                          </div>
                          <AdminImageUploader
                            label="Mahdev Travels Banner"
                            value={theme.travelsBanner || ''}
                            onChange={(url) => setTheme({ ...theme, travelsBanner: url })}
                            isDarkMode={true}
                          />
                        </div>

                        {/* Wedding Decoration Background */}
                        <div className="p-4 rounded-2xl border border-purple-500/10 bg-neutral-950/40 space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold text-slate-300 uppercase font-mono">Wedding Decoration Hero Banner</label>
                            <span className="text-[10px] text-emerald-400 font-mono">SWS Hero & Slider</span>
                          </div>
                          <AdminImageUploader
                            label="Wedding Decoration Banner"
                            value={theme.weddingDecorationBanner || ''}
                            onChange={(url) => setTheme({ ...theme, weddingDecorationBanner: url })}
                            isDarkMode={true}
                          />
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Save Button for Theme */}
                <div className="pt-6 border-t border-purple-500/10 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveTheme}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-all shadow-lg shadow-purple-600/30 hover:shadow-purple-500/50 hover:scale-105"
                  >
                    <Save size={16} />
                    <span>Save Design & Theme Settings</span>
                  </button>
                </div>
              </div>
            )}

            {/* Contact Tab */}
            {activeTab === 'contact' && (
              <div className="space-y-6">
                <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Corporate Contact Details
                </h3>
                <p className="text-xs text-slate-400">
                  Customize the phone numbers, operational hours, email addresses, physical office address, and embeddable Google map coordinates shown across all components.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-purple-400 mb-2">
                      Corporate Phone Numbers
                    </label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={contact.phone}
                        onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                        className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:border-purple-500 ${isDarkMode ? 'bg-neutral-950 border-purple-500/10 text-white' : 'bg-slate-50 border-slate-200'
                          }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-purple-400 mb-2">
                      Operational Email
                    </label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="email"
                        value={contact.email}
                        onChange={(e) => setContact({ ...contact, email: e.target.value })}
                        className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:border-purple-500 ${isDarkMode ? 'bg-neutral-950 border-purple-500/10 text-white' : 'bg-slate-50 border-slate-200'
                          }`}
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-purple-400 mb-2">
                      Headquarters Address
                    </label>
                    <div className="relative">
                      <MapPin size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={contact.address}
                        onChange={(e) => setContact({ ...contact, address: e.target.value })}
                        className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:border-purple-500 ${isDarkMode ? 'bg-neutral-950 border-purple-500/10 text-white' : 'bg-slate-50 border-slate-200'
                          }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-purple-400 mb-2">
                      Office Working Hours
                    </label>
                    <div className="relative">
                      <Clock size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={contact.hours}
                        onChange={(e) => setContact({ ...contact, hours: e.target.value })}
                        className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:border-purple-500 ${isDarkMode ? 'bg-neutral-950 border-purple-500/10 text-white' : 'bg-slate-50 border-slate-200'
                          }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-purple-400 mb-2">
                      WhatsApp Contact link API
                    </label>
                    <input
                      type="text"
                      value={contact.whatsapp}
                      onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })}
                      className={`w-full px-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:border-purple-500 ${isDarkMode ? 'bg-neutral-950 border-purple-500/10 text-white' : 'bg-slate-50 border-slate-200'
                        }`}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-purple-400 mb-2">
                      Google Map Embed URL (Iframe Src)
                    </label>
                    <textarea
                      rows={3}
                      value={contact.mapsIframe}
                      onChange={(e) => setContact({ ...contact, mapsIframe: e.target.value })}
                      className={`w-full px-4 py-2.5 text-xs font-mono rounded-xl border focus:outline-none focus:border-purple-500 ${isDarkMode ? 'bg-neutral-950 border-purple-500/10 text-white' : 'bg-slate-50 border-slate-200'
                        }`}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-purple-400 mb-2">
                      Company Logo (Drag & Drop, Upload File, or Use URL)
                    </label>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      {/* File Upload Zone */}
                      <div className="lg:col-span-7">
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsDraggingLogo(true);
                          }}
                          onDragLeave={() => setIsDraggingLogo(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsDraggingLogo(false);
                            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                              handleLogoFile(e.dataTransfer.files[0]);
                            }
                          }}
                          onClick={() => document.getElementById('logo-file-input')?.click()}
                          className={`group relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer ${isDraggingLogo
                              ? 'border-purple-500 bg-purple-500/10 scale-[1.01]'
                              : isDarkMode
                                ? 'border-purple-500/20 bg-neutral-950/40 hover:border-purple-500/50 hover:bg-purple-500/5'
                                : 'border-slate-300 bg-slate-50 hover:border-purple-500 hover:bg-purple-50/30'
                            }`}
                        >
                          <input
                            id="logo-file-input"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleLogoFile(e.target.files[0]);
                              }
                            }}
                            className="hidden"
                          />
                          <Upload
                            className={`w-8 h-8 mb-3 transition-transform group-hover:-translate-y-1 ${isDraggingLogo ? 'text-purple-400 animate-pulse' : 'text-slate-400 group-hover:text-purple-400'
                              }`}
                          />
                          <p className={`text-xs font-semibold mb-1 text-center ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                            Drag & Drop your logo here, or <span className="text-purple-500 underline">browse</span>
                          </p>
                          <p className="text-[10px] text-slate-400 text-center">
                            Supports transparent PNG, SVG, JPG, WebP. Recommended size &lt; 500KB.
                          </p>
                          {uploadError && (
                            <p className="text-[11px] font-mono text-rose-500 mt-2 font-semibold">
                              ⚠ {uploadError}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Logo Preview & URL Fallback */}
                      <div className="lg:col-span-5 flex flex-col gap-4">
                        <div className={`p-4 rounded-2xl border flex items-center gap-4 ${isDarkMode ? 'bg-neutral-950 border-purple-500/10' : 'bg-slate-50 border-slate-200'
                          }`}>
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-purple-500/30 bg-neutral-950 flex-shrink-0 flex items-center justify-center">
                            {contact.logo ? (
                              <img
                                src={contact.logo}
                                alt="Logo Preview"
                                className="w-full h-full object-contain p-1"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <span className="text-xs text-slate-500 uppercase font-mono">No Logo</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                              Logo Display Preview
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                              {contact.logo ? (contact.logo.startsWith('data:') ? 'Custom local upload image' : contact.logo) : 'Using default company placeholder'}
                            </p>
                            {contact.logo && (
                              <button
                                type="button"
                                onClick={() => setContact({ ...contact, logo: '' })}
                                className="text-[10px] text-rose-500 font-mono underline hover:text-rose-400 font-semibold mt-1 block"
                              >
                                Reset to Default Placeholder
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">
                            Or paste direct Image URL
                          </label>
                          <input
                            type="text"
                            value={contact.logo || ''}
                            onChange={(e) => setContact({ ...contact, logo: e.target.value })}
                            placeholder="https://example.com/logo.png"
                            className={`w-full px-4 py-2 text-xs rounded-xl border focus:outline-none focus:border-purple-500 font-mono ${isDarkMode ? 'bg-neutral-950 border-purple-500/10 text-white' : 'bg-slate-50 border-slate-200'
                              }`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleSaveContact}
                    className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-lg flex items-center gap-2"
                  >
                    <Save size={14} />
                    <span>Save Contact Settings</span>
                  </button>
                </div>
              </div>
            )}

            {/* Services Tab */}
            {activeTab === 'services' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      Main Corporate Divisions
                    </h3>
                    <p className="text-xs text-slate-400">
                      Manage the major services/divisions showcased on the main page.
                    </p>
                  </div>
                  <button
                    onClick={() => openEditModal('service', null, { title: '', description: '', icon: 'Sparkles', page: 'decoration', image: '' })}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                  >
                    <Plus size={14} />
                    <span>Add Division</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {services.map((s) => (
                    <div
                      key={s.id}
                      className={`p-5 rounded-2xl border flex flex-col justify-between ${isDarkMode ? 'bg-neutral-950/40 border-purple-500/10' : 'bg-slate-50 border-slate-200'
                        }`}
                    >
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                            <Sparkles size={16} />
                          </div>
                          <h4 className="font-bold text-sm text-purple-300">{s.title}</h4>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed mb-4">{s.description}</p>
                        <span className="text-[10px] font-mono uppercase bg-neutral-900/60 px-2 py-1 rounded text-slate-400 border border-purple-500/10">
                          Destination Page: {s.page}
                        </span>
                      </div>

                      <div className="flex items-center justify-end gap-2 mt-4 border-t border-purple-500/5 pt-3">
                        <button
                          onClick={() => openEditModal('service', s.id, s)}
                          className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-500/10 transition-colors"
                          title="Edit Division"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteService(s.id)}
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Delete Division"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Portfolio Gallery Tab */}
            {activeTab === 'portfolio' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      U1 Studio Photo Gallery
                    </h3>
                    <p className="text-xs text-slate-400">
                      Add and modify high-resolution images in the photography portfolio carousel and grids.
                    </p>
                  </div>
                  <button
                    onClick={() => openEditModal('portfolio', null, { title: '', category: 'Wedding', image: '' })}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                  >
                    <Plus size={14} />
                    <span>Add Photo</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
                  {photoPortfolio.map((item) => (
                    <div
                      key={item.id}
                      className={`rounded-2xl border overflow-hidden group flex flex-col justify-between ${isDarkMode ? 'bg-neutral-950/40 border-purple-500/10' : 'bg-slate-50 border-slate-200'
                        }`}
                    >
                      <div className="aspect-square relative overflow-hidden bg-black/40">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-md text-[9px] text-purple-300 font-mono">
                          {item.category}
                        </div>
                      </div>

                      <div className="p-3 flex items-center justify-between">
                        <div className="truncate pr-2">
                          <p className="font-bold text-xs truncate">{item.title}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => openEditModal('portfolio', item.id, item)}
                            className="p-1 rounded text-blue-400 hover:bg-blue-500/10"
                          >
                            <Edit size={12} />
                          </button>
                          <button
                            onClick={() => handleDeletePortfolioItem(item.id)}
                            className="p-1 rounded text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pricing Packages Tab */}
            {activeTab === 'pricing' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      Photography Rates & Packages
                    </h3>
                    <p className="text-xs text-slate-400">
                      Configure photo pricing models, packages, durations, and inclusive features.
                    </p>
                  </div>
                  <button
                    onClick={() => openEditModal('pricing', null, { title: '', price: 'Rs. ', duration: '1 Day', features: '' })}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                  >
                    <Plus size={14} />
                    <span>Add Package</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  {photoPricing.map((pkg: { title: string; price: string; duration: string; features: string[]; badge?: string }, idx: number) => (
                    <div
                      key={idx}
                      className={`p-6 rounded-2xl border flex flex-col justify-between relative ${isDarkMode ? 'bg-neutral-950/40 border-purple-500/10' : 'bg-slate-50 border-slate-200'
                        }`}
                    >
                      {pkg.badge && (
                        <span className="absolute top-3 right-3 bg-purple-600 text-[10px] text-white font-bold font-mono uppercase px-2 py-0.5 rounded-full">
                          {pkg.badge}
                        </span>
                      )}
                      <div>
                        <h4 className="font-extrabold text-sm text-purple-300 mb-2">{pkg.title}</h4>
                        <p className="text-2xl font-black mb-1 text-white">{pkg.price}</p>
                        <p className="text-xs text-slate-400 mb-4 font-mono">Duration: {pkg.duration}</p>

                        <ul className="space-y-2 mb-6">
                          {pkg.features.map((feat: string, fidx: number) => (
                            <li key={fidx} className="text-xs text-slate-300 flex items-center gap-1.5">
                              <Check size={12} className="text-purple-400" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex items-center justify-end gap-2 border-t border-purple-500/5 pt-3">
                        <button
                          onClick={() => openEditModal('pricing', idx.toString(), { ...pkg, features: pkg.features.join(', ') })}
                          className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-500/10 transition-colors"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeletePricingItem(idx)}
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* IT Portals Tab */}
            {activeTab === 'projects' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      Mahdev IT Solutions Portfolio
                    </h3>
                    <p className="text-xs text-slate-400">
                      Update customer success showcase applications and target portal links.
                    </p>
                  </div>
                  <button
                    onClick={() => openEditModal('project', null, { title: '', category: 'Enterprise Web', description: '', image: '', url: 'https://' })}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                  >
                    <Plus size={14} />
                    <span>Add IT Project</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {itProjects.map((p) => (
                    <div
                      key={p.id}
                      className={`p-5 rounded-2xl border flex gap-4 ${isDarkMode ? 'bg-neutral-950/40 border-purple-500/10' : 'bg-slate-50 border-slate-200'
                        }`}
                    >
                      <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-black/20">
                        <img
                          src={p.image}
                          alt={p.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-grow flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-sm text-purple-300">{p.title}</h4>
                            <span className="text-[10px] font-mono text-slate-400">{p.category}</span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">{p.description}</p>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <span className="text-[9px] font-mono text-purple-400 truncate max-w-[150px]">{p.url}</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => openEditModal('project', p.id, p)}
                              className="p-1 rounded text-blue-400 hover:bg-blue-500/10"
                            >
                              <Edit size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteProject(p.id)}
                              className="p-1 rounded text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Board Directors Tab */}
            {activeTab === 'leaders' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      Corporate Governance Board (CEO / Directors)
                    </h3>
                    <p className="text-xs text-slate-400">
                      Add, update, or reorganize members of the company's executive team.
                    </p>
                  </div>
                  <button
                    onClick={() => openEditModal('leader', null, { name: '', role: '', bio: '', image: '' })}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                  >
                    <Plus size={14} />
                    <span>Add Leader</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {leaders.map((l) => (
                    <div
                      key={l.id}
                      className={`p-5 rounded-2xl border flex gap-5 items-start ${isDarkMode ? 'bg-neutral-950/40 border-purple-500/10' : 'bg-slate-50 border-slate-200'
                        }`}
                    >
                      <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 border border-purple-500/25">
                        <img
                          src={l.image}
                          alt={l.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm text-white">{l.name}</h4>
                          <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">{l.role}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-2 leading-relaxed">{l.bio}</p>

                        <div className="flex items-center justify-end gap-2 mt-4 border-t border-purple-500/5 pt-2">
                          <button
                            onClick={() => openEditModal('leader', l.id, l)}
                            className="p-1 rounded text-blue-400 hover:bg-blue-500/10"
                          >
                            <Edit size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteLeader(l.id)}
                            className="p-1 rounded text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Testimonials Tab */}
            {activeTab === 'testimonials' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      Client Testimonials
                    </h3>
                    <p className="text-xs text-slate-400">
                      Manage the public feedbacks and star ratings shown on the homepage.
                    </p>
                  </div>
                  <button
                    onClick={() => openEditModal('testimonial', null, { name: '', role: '', rating: 5, comment: '', avatar: '' })}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                  >
                    <Plus size={14} />
                    <span>Add Testimonial</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {testimonials.map((t) => (
                    <div
                      key={t.id}
                      className={`p-5 rounded-2xl border flex flex-col justify-between ${isDarkMode ? 'bg-neutral-950/40 border-purple-500/10' : 'bg-slate-50 border-slate-200'
                        }`}
                    >
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <img
                            src={t.avatar}
                            alt={t.name}
                            className="w-10 h-10 rounded-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <h4 className="font-bold text-sm text-white leading-tight">{t.name}</h4>
                            <span className="text-[10px] text-slate-400 leading-none block">{t.role}</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-300 italic">"{t.comment}"</p>
                      </div>

                      <div className="flex items-center justify-between border-t border-purple-500/5 pt-3 mt-4">
                        <span className="text-xs font-mono text-purple-400">Rating: {t.rating}/5 ⭐</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditModal('testimonial', t.id, t)}
                            className="p-1 rounded text-blue-400 hover:bg-blue-500/10"
                          >
                            <Edit size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteTestimonial(t.id)}
                            className="p-1 rounded text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SWS Decor Posts Tab */}
            {activeTab === 'decor_posts' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      SWS Event Management - Decoration Posts
                    </h3>
                    <p className="text-xs text-slate-400">
                      Add and modify high-resolution decor photo posts and tag them under specific event categories.
                    </p>
                  </div>
                  <button
                    onClick={() => openEditModal('decor_post', null, { title: '', category: 'Wedding', image: '' })}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                  >
                    <Plus size={14} />
                    <span>Add Decor Post</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
                  {decorGallery.map((post) => (
                    <div
                      key={post.id}
                      className={`rounded-2xl overflow-hidden border transition-all duration-300 ${isDarkMode ? 'bg-neutral-950/40 border-emerald-500/10 hover:border-emerald-500/30' : 'bg-slate-50 border-slate-200 hover:shadow-lg'
                        }`}
                    >
                      <div className="h-40 relative bg-neutral-900">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute top-3 left-3 bg-neutral-950/80 backdrop-blur-md text-[10px] font-mono font-bold text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md uppercase">
                          {post.category}
                        </span>
                      </div>
                      <div className="p-4 flex items-center justify-between gap-2">
                        <h4 className={`text-sm font-bold truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{post.title}</h4>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => openEditModal('decor_post', post.id, post)}
                            className="p-1.5 rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                          >
                            <Edit size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteDecorPost(post.id)}
                            className="p-1.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SWS Rental Things Tab */}
            {activeTab === 'rentals' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      SWS Event Management - Rental Inventory
                    </h3>
                    <p className="text-xs text-slate-400">
                      Manage the hireable inventory of furniture, backdrops, lighting grids, props, and specify unit prices.
                    </p>
                  </div>
                  <button
                    onClick={() => openEditModal('rental', null, { name: '', category: 'Furniture', price: 'Rs. ', availableQty: 10, description: '', image: '' })}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                  >
                    <Plus size={14} />
                    <span>Add Rental Item</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
                  {rentalItems.map((item) => (
                    <div
                      key={item.id}
                      className={`rounded-2xl overflow-hidden border flex flex-col justify-between ${isDarkMode ? 'bg-neutral-950/40 border-emerald-500/10 hover:border-emerald-500/30' : 'bg-slate-50 border-slate-200'
                        }`}
                    >
                      <div>
                        <div className="h-40 relative bg-neutral-900">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <span className="absolute top-3 left-3 bg-neutral-950/80 backdrop-blur-md text-[10px] font-mono font-bold text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md uppercase">
                            {item.category}
                          </span>
                        </div>
                        <div className="p-4 space-y-2">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className={`text-sm font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.name}</h4>
                            <span className="text-emerald-500 text-xs font-mono font-bold">{item.price}</span>
                          </div>
                          <p className={`text-xs leading-relaxed line-clamp-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            {item.description}
                          </p>
                        </div>
                      </div>

                      <div className={`p-4 border-t flex items-center justify-between ${isDarkMode ? 'border-emerald-500/5' : 'border-slate-100'}`}>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Available: {item.availableQty} units
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditModal('rental', item.id, item)}
                            className="p-1.5 rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                          >
                            <Edit size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteRentalItem(item.id)}
                            className="p-1.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Travels Fleet Tab */}
            {activeTab === 'travels_fleet' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      Mahdev Travels - Vehicle Fleet
                    </h3>
                    <p className="text-xs text-slate-400">
                      Manage vehicles featured in the luxury transportation fleet.
                    </p>
                  </div>
                  <button
                    onClick={() => openEditModal('travels_vehicle', null, { name: '', category: 'wedding', image: '', price: 'Rs. ', passengers: 4, luggage: 2, engine: '', features: '' })}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                  >
                    <Plus size={14} />
                    <span>Add Vehicle</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
                  {travelsVehicles.map((v) => (
                    <div
                      key={v.id}
                      className={`rounded-2xl overflow-hidden border flex flex-col justify-between ${isDarkMode ? 'bg-neutral-950/40 border-purple-500/10 hover:border-purple-500/30' : 'bg-slate-50 border-slate-200'
                        }`}
                    >
                      <div>
                        <div className="h-40 relative bg-neutral-900">
                          <img
                            src={v.image}
                            alt={v.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <span className="absolute top-3 left-3 bg-neutral-950/80 backdrop-blur-md text-[10px] font-mono font-bold text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-md uppercase">
                            {v.category}
                          </span>
                        </div>
                        <div className="p-4 space-y-2">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className={`text-sm font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{v.name}</h4>
                            <span className="text-purple-400 text-xs font-mono font-bold shrink-0">{v.price}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 font-mono">Engine: {v.engine}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {v.features.slice(0, 3).map((feat, idx) => (
                              <span key={idx} className="text-[10px] bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded">
                                {feat}
                              </span>
                            ))}
                            {v.features.length > 3 && (
                              <span className="text-[10px] text-slate-500">+{v.features.length - 3} more</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className={`p-4 border-t flex items-center justify-between ${isDarkMode ? 'border-purple-500/5' : 'border-slate-100'}`}>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Pax: {v.passengers} | Luggage: {v.luggage}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditModal('travels_vehicle', v.id, {
                              ...v,
                              features: v.features.join(', ')
                            })}
                            className="p-1.5 rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                          >
                            <Edit size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteTravelsVehicle(v.id)}
                            className="p-1.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Travels Tours Tab */}
            {activeTab === 'travels_tours' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      Mahdev Travels - Custom Tour Packages
                    </h3>
                    <p className="text-xs text-slate-400">
                      Configure tour itineraries, pricing, durations, highlights, and daily schedules.
                    </p>
                  </div>
                  <button
                    onClick={() => openEditModal('travels_tour', null, { title: '', duration: '', image: '', price: 'Rs. ', highlights: '', itinerary: '[]' })}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                  >
                    <Plus size={14} />
                    <span>Add Tour Package</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {travelsTours.map((tour) => (
                    <div
                      key={tour.id}
                      className={`p-5 rounded-2xl border flex flex-col justify-between ${isDarkMode ? 'bg-neutral-950/40 border-purple-500/10 hover:border-purple-500/30' : 'bg-slate-50 border-slate-200'
                        }`}
                    >
                      <div className="flex gap-4 items-start">
                        <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-neutral-900">
                          <img
                            src={tour.image}
                            alt={tour.title}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex-grow space-y-1">
                          <h4 className="font-bold text-sm text-white leading-tight">{tour.title}</h4>
                          <p className="text-xs text-purple-400 font-mono">{tour.duration} | {tour.price}</p>

                          <div className="pt-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Highlights:</span>
                            <div className="flex flex-wrap gap-1">
                              {tour.highlights.map((h, i) => (
                                <span key={i} className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                                  {h}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-purple-500/5 pt-3 mt-4">
                        <span className="text-[10px] text-slate-500 font-mono">
                          Itinerary Days: {tour.itinerary.length}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditModal('travels_tour', tour.id, {
                              ...tour,
                              highlights: tour.highlights.join(', '),
                              itinerary: JSON.stringify(tour.itinerary, null, 2)
                            })}
                            className="p-1.5 rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                          >
                            <Edit size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteTravelsTour(tour.id)}
                            className="p-1.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SEO Settings Tab */}
            {activeTab === 'seo' && (
              <div className="space-y-8">
                <div>
                  <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Global Search Engine Optimization (SEO) & Social Graph
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Fine-tune search indexing, document meta headers, global keywords, and social Open Graph embeds. Updates take effect immediately site-wide without requiring a redeployment.
                  </p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                  {/* Form Controls */}
                  <div className="xl:col-span-7 space-y-6">
                    <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-neutral-950 border-purple-500/10' : 'bg-slate-50 border-slate-200'} space-y-4`}>
                      <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400">
                        Standard Document Metadata
                      </h4>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-300">Global Site Title / Brand Suffix</label>
                        <input
                          type="text"
                          value={seo.siteTitle}
                          onChange={(e) => setSeo({ ...seo, siteTitle: e.target.value })}
                          className="w-full px-4 py-2.5 text-xs rounded-xl border border-purple-500/20 bg-neutral-900/60 text-white focus:outline-none focus:border-purple-500"
                          placeholder="e.g. Mahdev Pvt Ltd | Multi-Service Elite Conglomerate"
                        />
                        <span className="text-[10px] text-slate-500 leading-normal block">
                          Recommended: under 60 characters. Appended to inner pages (e.g. "SWS Wedding Decoration | Mahdev Pvt Ltd")
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-300">Meta Keywords (Comma-Separated)</label>
                        <textarea
                          rows={2}
                          value={seo.metaKeywords}
                          onChange={(e) => setSeo({ ...seo, metaKeywords: e.target.value })}
                          className="w-full px-4 py-2.5 text-xs rounded-xl border border-purple-500/20 bg-neutral-900/60 text-white focus:outline-none focus:border-purple-500"
                          placeholder="e.g. Mahdev, SWS Events, U1 Studio, IT Solutions, Travels"
                        />
                        <span className="text-[10px] text-slate-500 leading-normal block">
                          Search terms separated by commas. Boosts internal directory crawler categorizations.
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-300">Meta Description</label>
                        <textarea
                          rows={3}
                          value={seo.metaDescription}
                          onChange={(e) => setSeo({ ...seo, metaDescription: e.target.value })}
                          className="w-full px-4 py-2.5 text-xs rounded-xl border border-purple-500/20 bg-neutral-900/60 text-white focus:outline-none focus:border-purple-500"
                          placeholder="Enter site-wide search snippet description..."
                        />
                        <span className="text-[10px] text-slate-500 leading-normal block">
                          Recommended: 150-160 characters. Succinct corporate overview displayed in search results.
                        </span>
                      </div>
                    </div>

                    <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-neutral-950 border-purple-500/10' : 'bg-slate-50 border-slate-200'} space-y-4`}>
                      <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400">
                        Open Graph Social Embed Settings (Slack, WhatsApp, iMessage, Facebook)
                      </h4>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-300">OG Share Title</label>
                        <input
                          type="text"
                          value={seo.ogTitle}
                          onChange={(e) => setSeo({ ...seo, ogTitle: e.target.value })}
                          className="w-full px-4 py-2.5 text-xs rounded-xl border border-purple-500/20 bg-neutral-900/60 text-white focus:outline-none focus:border-purple-500"
                          placeholder="Social card title..."
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-300">OG Share Description</label>
                        <textarea
                          rows={2}
                          value={seo.ogDescription}
                          onChange={(e) => setSeo({ ...seo, ogDescription: e.target.value })}
                          className="w-full px-4 py-2.5 text-xs rounded-xl border border-purple-500/20 bg-neutral-900/60 text-white focus:outline-none focus:border-purple-500"
                          placeholder="Social card description snippet..."
                        />
                      </div>

                      <div className="space-y-1.5">
                        <AdminImageUploader
                          label="OG Share Image / Banner"
                          value={seo.ogImage}
                          onChange={(url) => setSeo({ ...seo, ogImage: url })}
                          isDarkMode={isDarkMode}
                        />
                        <span className="text-[10px] text-slate-500 leading-normal block">
                          High-resolution landscape banner shown when sharing your link. Recommended ratio 1.91:1 (e.g. 1200x630px).
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Real-time Preview Engine */}
                  <div className="xl:col-span-5 space-y-6">
                    {/* Google Search Result Preview Card */}
                    <div className="p-6 rounded-2xl border border-purple-500/10 bg-neutral-950/40 space-y-4">
                      <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                        🔍 Live Google Search Results Snippet
                      </h4>
                      <div className="p-4 rounded-xl border border-slate-800 bg-neutral-950 font-sans space-y-1.5">
                        <div className="flex items-center gap-2 text-slate-400 text-xs">
                          <span className="bg-neutral-800 text-white px-1.5 py-0.5 rounded text-[9px] font-mono font-bold">Ad</span>
                          <span>https://www.mahdev.lk</span>
                        </div>
                        <h5 className="text-blue-500 hover:underline text-base font-medium leading-tight cursor-pointer">
                          {seo.siteTitle || "Mahdev Pvt Ltd"}
                        </h5>
                        <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">
                          {seo.metaDescription || "Provide site-wide search snippet description in the form..."}
                        </p>
                        <div className="flex gap-4 text-[10px] text-slate-500 font-mono pt-1">
                          <span>Keywords: {seo.metaKeywords ? seo.metaKeywords.split(',').slice(0, 3).join(', ') : 'None'}</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        This is how your application appears on desktop and mobile web searches. High CTR optimization begins with clean, direct descriptions.
                      </p>
                    </div>

                    {/* Social Share Preview Card */}
                    <div className="p-6 rounded-2xl border border-purple-500/10 bg-neutral-950/40 space-y-4">
                      <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                        💬 Live Social Share Preview (Slack / iMessage Card)
                      </h4>
                      <div className="rounded-xl border border-slate-800 bg-neutral-950 overflow-hidden font-sans">
                        <div className="h-36 relative bg-neutral-900 border-b border-slate-850">
                          {seo.ogImage ? (
                            <img
                              src={seo.ogImage}
                              alt="Social share preview"
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs font-mono font-bold">
                              OG Share Image Preview
                            </div>
                          )}
                        </div>
                        <div className="p-4 space-y-1">
                          <p className="text-[10px] text-purple-400 font-mono uppercase font-bold tracking-wider">MAHDEV.LK</p>
                          <h5 className="text-white text-xs font-bold leading-snug">
                            {seo.ogTitle || seo.siteTitle || "Mahdev Pvt Ltd"}
                          </h5>
                          <p className="text-slate-400 text-[10.5px] leading-relaxed line-clamp-2">
                            {seo.ogDescription || seo.metaDescription || "No description provided."}
                          </p>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        When you paste your website's URL into messaging apps or social forums, crawlers index these exact Open Graph tags to display this rich visual layout.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Save Button for SEO */}
                <div className="pt-6 border-t border-purple-500/10 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveSeo}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-all shadow-lg shadow-purple-600/30 hover:shadow-purple-500/50 hover:scale-105"
                  >
                    <Save size={16} />
                    <span>Save SEO & Metadata Configuration</span>
                  </button>
                </div>
              </div>
            )}

            {/* SMTP Email Configuration Tab */}
            {activeTab === 'email_settings' && (
              <div className="space-y-8 text-left animate-fadeIn">
                <div>
                  <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Enterprise SMTP Email Integrations & Templates
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Configure automated transaction dispatchers, secure outgoing credentials, and customize responsive notification templates for bookings, invoices, and CRM interactions.
                  </p>
                </div>

                {adminRole !== 'ceo' && (
                  <div className="p-4 rounded-xl border border-rose-500/15 bg-rose-500/5 text-rose-400 text-xs flex items-start gap-2.5">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold uppercase tracking-wider block">Security Restriction (Super Admin Mode Locked)</span>
                      You are logged in as Managing Director. SMTP connection setups and notification templates are locked as read-only. Contact CEO Yuvanshan Prabakaran for administrative modification credentials.
                    </div>
                  </div>
                )}

                {/* Sub Tabs Selection */}
                <div className="flex border-b border-purple-500/10 gap-2 pb-px overflow-x-auto scrollbar-none">
                  <button
                    onClick={() => setEmailSubTab('config')}
                    className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${emailSubTab === 'config'
                        ? 'border-purple-500 text-purple-400 bg-purple-500/5'
                        : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    <Sliders size={14} />
                    <span>SMTP Configuration & Testing</span>
                  </button>
                  <button
                    onClick={() => setEmailSubTab('templates')}
                    className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${emailSubTab === 'templates'
                        ? 'border-purple-500 text-purple-400 bg-purple-500/5'
                        : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    <Mail size={14} />
                    <span>Responsive Email Templates</span>
                  </button>
                  <button
                    onClick={() => setEmailSubTab('logs')}
                    className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${emailSubTab === 'logs'
                        ? 'border-purple-500 text-purple-400 bg-purple-500/5'
                        : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    <HistoryIcon size={14} />
                    <span>Security & Audit Trail</span>
                  </button>
                  <button
                    onClick={() => setEmailSubTab('cloud_storage')}
                    className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${emailSubTab === 'cloud_storage'
                        ? 'border-purple-500 text-purple-400 bg-purple-500/5'
                        : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    <Cloud size={14} />
                    <span>Cloud Storage Settings</span>
                  </button>
                  <button
                    onClick={() => setEmailSubTab('media_library')}
                    className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${emailSubTab === 'media_library'
                        ? 'border-purple-500 text-purple-400 bg-purple-500/5'
                        : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    <ImageIcon size={14} />
                    <span>Centralized Media Library</span>
                  </button>
                  <button
                    onClick={() => setEmailSubTab('backups')}
                    className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${emailSubTab === 'backups'
                        ? 'border-purple-500 text-purple-400 bg-purple-500/5'
                        : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    <Database size={14} />
                    <span>Database Backups & Recovery</span>
                  </button>
                </div>

                {/* SUB-TAB 1: CONFIGURATION & DIAGNOSTICS */}
                {emailSubTab === 'config' && (
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    {/* Configuration Panel */}
                    <div className="xl:col-span-7 space-y-6">
                      <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-neutral-950 border-purple-500/10' : 'bg-slate-50 border-slate-200'} space-y-6`}>
                        <div className="flex justify-between items-center pb-4 border-b border-purple-500/10">
                          <div>
                            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                              <Lock size={12} className="text-purple-400" />
                              SMTP Credentials & Outgoing Mailserver
                            </h4>
                            <p className="text-[10px] text-slate-500 mt-0.5">Define your secure transaction mail servers below.</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">SMTP Active</span>
                            <input
                              type="checkbox"
                              checked={smtpSettings.enabled}
                              onChange={(e) => setSmtpSettings({ ...smtpSettings, enabled: e.target.checked })}
                              className="w-4 h-4 accent-purple-500 rounded border-slate-700 bg-neutral-900 cursor-pointer"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Provider */}
                          <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-slate-300">SMTP Provider Service</label>
                            <select
                              value={smtpSettings.provider}
                              onChange={(e) => handleProviderChange(e.target.value as any)}
                              className="w-full px-4 py-2.5 text-xs rounded-xl border border-purple-500/20 bg-neutral-900 text-white focus:outline-none focus:border-purple-500"
                            >
                              <option value="custom">Any Custom SMTP Server</option>
                              <option value="gmail">Gmail SMTP (Dev/Testing)</option>
                              <option value="brevo">Brevo SMTP (Recommended Free Tier)</option>
                              <option value="mailjet">Mailjet SMTP (Free Tier)</option>
                              <option value="zoho">Zoho Mail SMTP (Free Tier)</option>
                            </select>
                          </div>

                          {/* Encryption */}
                          <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-slate-300">Encryption Layer</label>
                            <select
                              value={smtpSettings.encryption}
                              onChange={(e) => setSmtpSettings({ ...smtpSettings, encryption: e.target.value as any })}
                              className="w-full px-4 py-2.5 text-xs rounded-xl border border-purple-500/20 bg-neutral-900 text-white focus:outline-none focus:border-purple-500"
                            >
                              <option value="TLS">TLS (Default)</option>
                              <option value="SSL">SSL (Implicit Secure Port 465)</option>
                              <option value="STARTTLS">STARTTLS (Opportunistic Port 587)</option>
                            </select>
                          </div>

                          {/* Host */}
                          <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-slate-300">SMTP Server Host</label>
                            <input
                              type="text"
                              value={smtpSettings.host || ''}
                              onChange={(e) => setSmtpSettings({ ...smtpSettings, host: e.target.value })}
                              className="w-full px-4 py-2.5 text-xs rounded-xl border border-purple-500/20 bg-neutral-900 text-white focus:outline-none focus:border-purple-500"
                              placeholder="e.g. smtp.gmail.com"
                            />
                          </div>

                          {/* Port */}
                          <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-slate-300">SMTP Server Port</label>
                            <input
                              type="number"
                              value={smtpSettings.port || 587}
                              onChange={(e) => setSmtpSettings({ ...smtpSettings, port: parseInt(e.target.value) || 587 })}
                              className="w-full px-4 py-2.5 text-xs rounded-xl border border-purple-500/20 bg-neutral-900 text-white focus:outline-none focus:border-purple-500"
                              placeholder="587"
                            />
                          </div>

                          {/* Username */}
                          <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-slate-300">SMTP Username / Login Account</label>
                            <input
                              type="text"
                              value={smtpSettings.username || ''}
                              onChange={(e) => setSmtpSettings({ ...smtpSettings, username: e.target.value })}
                              className="w-full px-4 py-2.5 text-xs rounded-xl border border-purple-500/20 bg-neutral-900 text-white focus:outline-none focus:border-purple-500"
                              placeholder="your-email@example.com"
                            />
                          </div>

                          {/* Password */}
                          <div className="space-y-1.5 relative">
                            <label className="block text-xs font-semibold text-slate-300">SMTP Authentication Password</label>
                            <div className="relative">
                              <input
                                type={showPassword ? "text" : "password"}
                                value={smtpSettings.password || ''}
                                onChange={(e) => setSmtpSettings({ ...smtpSettings, password: e.target.value })}
                                className="w-full pl-4 pr-10 py-2.5 text-xs rounded-xl border border-purple-500/20 bg-neutral-900 text-white focus:outline-none focus:border-purple-500"
                                placeholder="Password"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                              >
                                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                              </button>
                            </div>
                            <span className="text-[9px] text-slate-500 block leading-tight">
                              Stored securely using dynamic symmetric AES-256 encryption. Displays as masked after saving.
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                          {/* From Email */}
                          <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-slate-300">From Email Address</label>
                            <input
                              type="email"
                              value={smtpSettings.fromEmail || ''}
                              onChange={(e) => setSmtpSettings({ ...smtpSettings, fromEmail: e.target.value })}
                              className="w-full px-4 py-2.5 text-xs rounded-xl border border-purple-500/20 bg-neutral-900 text-white focus:outline-none focus:border-purple-500"
                              placeholder="info@mahdev.lk"
                            />
                          </div>

                          {/* From Name */}
                          <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-slate-300">From Sender Name</label>
                            <input
                              type="text"
                              value={smtpSettings.fromName || ''}
                              onChange={(e) => setSmtpSettings({ ...smtpSettings, fromName: e.target.value })}
                              className="w-full px-4 py-2.5 text-xs rounded-xl border border-purple-500/20 bg-neutral-900 text-white focus:outline-none focus:border-purple-500"
                              placeholder="Mahdev Corporate"
                            />
                          </div>

                          {/* Reply To */}
                          <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-slate-300">Reply-To Email</label>
                            <input
                              type="email"
                              value={smtpSettings.replyToEmail || ''}
                              onChange={(e) => setSmtpSettings({ ...smtpSettings, replyToEmail: e.target.value })}
                              className="w-full px-4 py-2.5 text-xs rounded-xl border border-purple-500/20 bg-neutral-900 text-white focus:outline-none focus:border-purple-500"
                              placeholder="support@mahdev.lk"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-purple-500/10">
                          <button
                            type="button"
                            onClick={handleSaveSmtpSettings}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all shadow-lg hover:scale-105 cursor-pointer animate-pulse-slow"
                          >
                            <Save size={14} />
                            <span>Save Outgoing SMTP Credentials</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Diagnostics Panel */}
                    <div className="xl:col-span-5 space-y-6 text-left">
                      <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-neutral-950 border-purple-500/10' : 'bg-slate-50 border-slate-200'} space-y-4`}>
                        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                          <Terminal size={12} />
                          SMTP Diagnostics & Validation
                        </h4>
                        <p className="text-[10px] text-slate-400 leading-relaxed">
                          Verify that your saved SMTP server can successfully establish handshake connections, handle authentications, and dispatch test transactions.
                        </p>

                        <div className="p-4 rounded-xl border border-purple-500/10 bg-neutral-900/40 space-y-3">
                          <div className="space-y-1.5">
                            <label className="block text-[11px] font-semibold text-slate-300">Recipient Test Mailbox</label>
                            <div className="flex gap-2">
                              <input
                                type="email"
                                value={testRecipient}
                                onChange={(e) => setTestRecipient(e.target.value)}
                                className="flex-1 px-3 py-2 text-xs rounded-xl border border-purple-500/20 bg-neutral-900 text-white focus:outline-none focus:border-purple-500"
                                placeholder="recipient@example.com"
                              />
                              <button
                                type="button"
                                onClick={handleSendTestEmail}
                                disabled={isSendingTest}
                                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-neutral-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                              >
                                {isSendingTest ? (
                                  <RefreshCw size={12} className="animate-spin" />
                                ) : (
                                  <Mail size={12} />
                                )}
                                <span>{isSendingTest ? "Testing..." : "Send Test"}</span>
                              </button>
                            </div>
                          </div>

                          {/* Display test result */}
                          {testResult && (
                            <div className={`p-3.5 rounded-xl border text-xs leading-relaxed space-y-1.5 ${testResult.success
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                              }`}>
                              <div className="flex items-center gap-1.5 font-semibold">
                                {testResult.success ? (
                                  <span className="text-emerald-500 font-bold font-mono">✓ CONNECTION SUCCESSFUL</span>
                                ) : (
                                  <span className="text-rose-500 font-bold font-mono">✗ HANDSHAKE FAILED</span>
                                )}
                              </div>
                              <p>{testResult.message}</p>
                              {testResult.details && (
                                <div className="mt-2 p-2 rounded bg-black/40 text-[10px] font-mono text-slate-400 whitespace-pre-wrap max-h-40 overflow-y-auto">
                                  {testResult.details}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUB-TAB 2: RESPONSIVE EMAIL TEMPLATES */}
                {emailSubTab === 'templates' && (
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 text-left">
                    {/* Templates list & editor */}
                    <div className="xl:col-span-7 space-y-6">
                      <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-neutral-950 border-purple-500/10' : 'bg-slate-50 border-slate-200'} space-y-4`}>
                        <div className="flex justify-between items-center pb-2 border-b border-purple-500/10">
                          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400">
                            Interactive Template Studio
                          </h4>
                          <select
                            value={selectedTemplateId}
                            onChange={(e) => setSelectedTemplateId(e.target.value)}
                            className="px-3 py-1.5 text-xs rounded-xl border border-purple-500/20 bg-neutral-900 text-white focus:outline-none"
                          >
                            {smtpTemplates.map((tpl) => (
                              <option key={tpl.id} value={tpl.id}>{tpl.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* Editor Fields */}
                        {(() => {
                          const selectedTemplate = smtpTemplates.find(t => t.id === selectedTemplateId) || smtpTemplates[0];
                          if (!selectedTemplate) return null;
                          return (
                            <div className="space-y-4">
                              <div className="space-y-1.5">
                                <label className="block text-xs font-semibold text-slate-300">Template Subject Header</label>
                                <input
                                  type="text"
                                  value={selectedTemplate.subject}
                                  onChange={(e) => {
                                    const updated = smtpTemplates.map(t => t.id === selectedTemplateId ? { ...t, subject: e.target.value } : t);
                                    setSmtpTemplates(updated);
                                  }}
                                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-purple-500/20 bg-neutral-900 text-white focus:outline-none"
                                  placeholder="Email subject..."
                                />
                              </div>

                              <div className="space-y-1.5">
                                <label className="block text-xs font-semibold text-slate-300">Email Message Body (Plaintext or HTML supported)</label>
                                <textarea
                                  rows={12}
                                  value={selectedTemplate.body}
                                  onChange={(e) => {
                                    const updated = smtpTemplates.map(t => t.id === selectedTemplateId ? { ...t, body: e.target.value } : t);
                                    setSmtpTemplates(updated);
                                  }}
                                  className="w-full px-4 py-3 text-xs font-mono rounded-xl border border-purple-500/20 bg-neutral-900 text-white focus:outline-none focus:border-purple-500"
                                  placeholder="Write your email body copy..."
                                />
                              </div>

                              {/* Placeholder helpers */}
                              <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/10 space-y-2">
                                <p className="text-[10px] text-purple-400 font-semibold font-mono uppercase tracking-wider">
                                  ⚡ Active Dynamic Placeholders
                                </p>
                                <p className="text-[9.5px] text-slate-400 leading-relaxed">
                                  Copy and paste any placeholder to bind real invoice details, names, dates, or balances in your template.
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {[
                                    '{{Customer Name}}', '{{customer_name}}',
                                    '{{Invoice Number}}', '{{invoice_number}}',
                                    '{{Quotation Number}}', '{{quotation_number}}',
                                    '{{Payment Amount}}', '{{payment_amount}}',
                                    '{{Remaining Balance}}', '{{remaining_balance}}',
                                    '{{Company Name}}', '{{company_name}}',
                                    '{{Project Name}}', '{{project_name}}',
                                    '{{Current Date}}', '{{current_date}}'
                                  ].map((ph) => (
                                    <button
                                      key={ph}
                                      type="button"
                                      onClick={() => {
                                        navigator.clipboard.writeText(ph);
                                        alert(`Copied placeholder: ${ph}`);
                                      }}
                                      className="px-2 py-1 text-[9px] font-mono rounded bg-neutral-800 text-slate-300 border border-slate-700 hover:text-white hover:border-purple-500 transition-all cursor-pointer"
                                    >
                                      {ph}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className="flex justify-end pt-2">
                                <button
                                  type="button"
                                  onClick={() => handleSaveSmtpTemplate(selectedTemplate)}
                                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold cursor-pointer"
                                >
                                  <Save size={14} />
                                  <span>Save Template Changes</span>
                                </button>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Right Side live HTML preview mockup */}
                    <div className="xl:col-span-5 space-y-6">
                      <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-neutral-950 border-purple-500/10' : 'bg-slate-50 border-slate-200'} space-y-4`}>
                        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400">
                          👀 Real-time Client View Sandbox
                        </h4>
                        <p className="text-[10px] text-slate-400">
                          See exactly how this notification is rendered in the client's inbox.
                        </p>

                        {(() => {
                          const selectedTemplate = smtpTemplates.find(t => t.id === selectedTemplateId) || smtpTemplates[0];
                          if (!selectedTemplate) return null;

                          const sampleData = {
                            customerName: 'Saman Gunasinghe',
                            invoiceNumber: 'INV-2026-0042',
                            quotationNumber: 'QTN-2026-0189',
                            paymentAmount: '150,000.00',
                            remainingBalance: '45,000.00',
                            companyName: 'Mahdev Pvt Ltd',
                            projectName: 'Grand Ballroom Wedding Canopies',
                            currentDate: new Date().toLocaleDateString()
                          };

                          const replacePlaceholders = (text: string) => {
                            let res = text || "";
                            const mapping = [
                              { keys: ["Customer Name", "customer_name", "customerName", "CUSTOMER_NAME"], value: sampleData.customerName },
                              { keys: ["Invoice Number", "invoice_number", "invoiceNumber", "INVOICE_NUMBER"], value: sampleData.invoiceNumber },
                              { keys: ["Quotation Number", "quotation_number", "quotationNumber", "QUOTATION_NUMBER"], value: sampleData.quotationNumber },
                              { keys: ["Payment Amount", "payment_amount", "paymentAmount", "PAYMENT_AMOUNT"], value: sampleData.paymentAmount },
                              { keys: ["Remaining Balance", "remaining_balance", "remainingBalance", "REMAINING_BALANCE"], value: sampleData.remainingBalance },
                              { keys: ["Company Name", "company_name", "companyName", "COMPANY_NAME"], value: sampleData.companyName },
                              { keys: ["Project Name", "project_name", "projectName", "PROJECT_NAME"], value: sampleData.projectName },
                              { keys: ["Current Date", "current_date", "currentDate", "CURRENT_DATE"], value: sampleData.currentDate },
                            ];

                            for (const item of mapping) {
                              for (const key of item.keys) {
                                const escapedKey = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
                                const regex = new RegExp(`\\{\\{\\s*${escapedKey}\\s*\\}\\}`, "gi");
                                res = res.replace(regex, item.value);
                              }
                            }
                            return res;
                          };

                          return (
                            <div className="rounded-xl border border-slate-850 bg-neutral-950 overflow-hidden text-xs">
                              {/* Top header mockup */}
                              <div className="bg-neutral-900 px-4 py-3 border-b border-slate-850 text-[10px] space-y-1">
                                <div className="flex gap-2">
                                  <span className="text-slate-500 font-medium">To:</span>
                                  <span className="text-slate-300 font-mono">saman.gunasinghe@outlook.com</span>
                                </div>
                                <div className="flex gap-2">
                                  <span className="text-slate-500 font-medium">From:</span>
                                  <span className="text-slate-300 font-mono">{smtpSettings.fromName} &lt;{smtpSettings.fromEmail || "office@mahdev.lk"}&gt;</span>
                                </div>
                                <div className="flex gap-2 pt-1 border-t border-slate-850/50">
                                  <span className="text-slate-500 font-medium">Subject:</span>
                                  <span className="text-slate-200 font-medium">{replacePlaceholders(selectedTemplate.subject)}</span>
                                </div>
                              </div>

                              {/* Email Body Preview */}
                              <div className="p-5 bg-white text-slate-850 space-y-4 min-h-64 whitespace-pre-wrap font-sans select-none leading-relaxed">
                                {replacePlaceholders(selectedTemplate.body)}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}

                {/* SUB-TAB 3: AUDIT TRAIL LOGS */}
                {emailSubTab === 'logs' && (
                  <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-neutral-950 border-purple-500/10' : 'bg-slate-50 border-slate-200'} space-y-4`}>
                    <div className="flex justify-between items-center pb-2 border-b border-purple-500/10">
                      <div>
                        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400">
                          System SMTP Security Audit Trails
                        </h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">Chronological ledger of credentials access and template alterations.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSmtpLogs([]);
                          localStorage.removeItem('mahdev_smtp_logs');
                          alert('Audit history cleared successfully!');
                        }}
                        className="px-3 py-1.5 rounded bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/10 text-[10px] font-semibold transition-all cursor-pointer"
                      >
                        Clear History
                      </button>
                    </div>

                    {smtpLogs.length === 0 ? (
                      <div className="py-12 text-center text-slate-500 text-xs">
                        No SMTP settings alterations recorded. Changes will log here automatically.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left text-slate-300 text-left">
                          <thead>
                            <tr className="border-b border-slate-800 text-slate-400 font-mono text-[10px] uppercase">
                              <th className="py-2.5 px-3">Timestamp</th>
                              <th className="py-2.5 px-3">Executor Identity</th>
                              <th className="py-2.5 px-3">Action Class</th>
                              <th className="py-2.5 px-3">Log Specification</th>
                            </tr>
                          </thead>
                          <tbody>
                            {smtpLogs.map((log) => (
                              <tr key={log.id} className="border-b border-slate-850 hover:bg-white/2 transition-colors">
                                <td className="py-3 px-3 font-mono text-[11px] text-slate-400">{log.timestamp}</td>
                                <td className="py-3 px-3 text-slate-200 font-medium">{log.user}</td>
                                <td className="py-3 px-3 text-left">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${log.action.includes('Error')
                                      ? 'bg-rose-500/15 text-rose-400'
                                      : log.action.includes('Test')
                                        ? 'bg-emerald-500/15 text-emerald-400'
                                        : 'bg-purple-500/15 text-purple-400'
                                    }`}>
                                    {log.action}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-slate-300">{log.details}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* SUB-TAB 4: CLOUD STORAGE SETTINGS */}
                {emailSubTab === 'cloud_storage' && (
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-fadeIn">
                    <div className="xl:col-span-7 space-y-6">
                      <form onSubmit={handleSaveStorageSettings} className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-neutral-950 border-purple-500/10' : 'bg-slate-50 border-slate-200'} space-y-6`}>
                        <div className="flex justify-between items-center pb-4 border-b border-purple-500/10">
                          <div>
                            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                              <Cloud size={14} />
                              Cloud Object Storage Providers
                            </h4>
                            <p className="text-[10px] text-slate-500 mt-0.5">Configure and synchronize assets globally with enterprise cloud storage buckets.</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase ${storageSettings.provider !== 'local' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                            }`}>
                            {storageSettings.provider === 'local' ? 'Local Drive Fallback' : `${storageSettings.provider} Active`}
                          </span>
                        </div>

                        {storageSuccess && (
                          <div className="p-3.5 rounded-lg border border-emerald-500/15 bg-emerald-500/5 text-emerald-400 text-xs flex items-center gap-2">
                            <CheckCircle size={14} className="shrink-0" />
                            <span>{storageSuccess}</span>
                          </div>
                        )}

                        {storageError && (
                          <div className="p-3.5 rounded-lg border border-rose-500/15 bg-rose-500/5 text-rose-400 text-xs flex items-center gap-2">
                            <AlertCircle size={14} className="shrink-0" />
                            <span>{storageError}</span>
                          </div>
                        )}

                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Active Storage Architecture</label>
                            <div className="grid grid-cols-3 gap-3">
                              {[
                                { id: 'local', name: 'Local File System', desc: 'Saves directly on Server disk' },
                                { id: 'r2', name: 'Cloudflare R2', desc: 'Highly scalable S3 API compatible' },
                                { id: 'supabase', name: 'Supabase Storage', desc: 'PostgreSQL-backed asset engine' }
                              ].map((prov) => (
                                <button
                                  key={prov.id}
                                  type="button"
                                  onClick={() => setStorageSettingsState(prev => ({ ...prev, provider: prov.id }))}
                                  disabled={adminRole !== 'ceo'}
                                  className={`p-3 rounded-xl border text-left transition-all ${storageSettings.provider === prov.id
                                      ? 'border-purple-500 bg-purple-500/5 text-purple-400'
                                      : 'border-slate-800 bg-white/2 text-slate-300 hover:bg-white/5'
                                    }`}
                                >
                                  <span className="block text-xs font-bold">{prov.name}</span>
                                  <span className="block text-[9px] text-slate-500 mt-0.5 leading-tight">{prov.desc}</span>
                                </button>
                              ))}
                            </div>
                          </div>

                          {storageSettings.provider === 'r2' && (
                            <div className="space-y-4 pt-2 animate-fadeIn">
                              <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/10 text-[10px] text-purple-300 leading-relaxed">
                                💡 **Cloudflare R2 Setup:** Set your R2 API keys and S3 API Custom Endpoint (found in Cloudflare dashboard, formatted as `https://[account-id].r2.cloudflarestorage.com`).
                              </div>

                              <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1">R2 Custom S3 Endpoint</label>
                                <input
                                  type="text"
                                  value={storageSettings.r2Endpoint}
                                  onChange={(e) => setStorageSettingsState(prev => ({ ...prev, r2Endpoint: e.target.value }))}
                                  placeholder="https://abc123xyz.r2.cloudflarestorage.com"
                                  disabled={adminRole !== 'ceo'}
                                  className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-800 bg-neutral-950 text-slate-200 focus:border-purple-500 focus:outline-none"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-semibold text-slate-400 mb-1">R2 Access Key ID</label>
                                  <input
                                    type="text"
                                    value={storageSettings.r2AccessKeyId}
                                    onChange={(e) => setStorageSettingsState(prev => ({ ...prev, r2AccessKeyId: e.target.value }))}
                                    placeholder="Enter Access Key"
                                    disabled={adminRole !== 'ceo'}
                                    className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-800 bg-neutral-950 text-slate-200 focus:border-purple-500 focus:outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-slate-400 mb-1 font-mono">R2 Secret Access Key</label>
                                  <input
                                    type="password"
                                    value={storageSettings.r2SecretAccessKey}
                                    onChange={(e) => setStorageSettingsState(prev => ({ ...prev, r2SecretAccessKey: e.target.value }))}
                                    placeholder="••••••••••••"
                                    disabled={adminRole !== 'ceo'}
                                    className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-800 bg-neutral-950 text-slate-200 focus:border-purple-500 focus:outline-none font-mono"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-semibold text-slate-400 mb-1">Bucket Name</label>
                                  <input
                                    type="text"
                                    value={storageSettings.r2BucketName}
                                    onChange={(e) => setStorageSettingsState(prev => ({ ...prev, r2BucketName: e.target.value }))}
                                    placeholder="mahdev-assets"
                                    disabled={adminRole !== 'ceo'}
                                    className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-800 bg-neutral-950 text-slate-200 focus:border-purple-500 focus:outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-slate-400 mb-1">Public CDN / Custom Domain</label>
                                  <input
                                    type="text"
                                    value={storageSettings.r2PublicCdnUrl}
                                    onChange={(e) => setStorageSettingsState(prev => ({ ...prev, r2PublicCdnUrl: e.target.value }))}
                                    placeholder="https://cdn.mahdev.com"
                                    disabled={adminRole !== 'ceo'}
                                    className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-800 bg-neutral-950 text-slate-200 focus:border-purple-500 focus:outline-none"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {storageSettings.provider === 'supabase' && (
                            <div className="space-y-4 pt-2 animate-fadeIn">
                              <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-[10px] text-emerald-300 leading-relaxed">
                                💡 **Supabase Storage Setup:** Ensure you use the **Service Role API Key** (service_role) to bypass bucket RLS restrictions during uploads from the server.
                              </div>

                              <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1">Supabase Project URL</label>
                                <input
                                  type="text"
                                  value={storageSettings.supabaseUrl}
                                  onChange={(e) => setStorageSettingsState(prev => ({ ...prev, supabaseUrl: e.target.value }))}
                                  placeholder="https://abc123xyz.supabase.co"
                                  disabled={adminRole !== 'ceo'}
                                  className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-800 bg-neutral-950 text-slate-200 focus:border-purple-500 focus:outline-none"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1 font-mono">Supabase Service Role Secret Key</label>
                                <input
                                  type="password"
                                  value={storageSettings.supabaseServiceKey}
                                  onChange={(e) => setStorageSettingsState(prev => ({ ...prev, supabaseServiceKey: e.target.value }))}
                                  placeholder="••••••••••••"
                                  disabled={adminRole !== 'ceo'}
                                  className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-800 bg-neutral-950 text-slate-200 focus:border-purple-500 focus:outline-none font-mono"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-semibold text-slate-400 mb-1">Bucket Name</label>
                                  <input
                                    type="text"
                                    value={storageSettings.supabaseBucketName}
                                    onChange={(e) => setStorageSettingsState(prev => ({ ...prev, supabaseBucketName: e.target.value }))}
                                    placeholder="assets"
                                    disabled={adminRole !== 'ceo'}
                                    className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-800 bg-neutral-950 text-slate-200 focus:border-purple-500 focus:outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-slate-400 mb-1">Public CDN URL</label>
                                  <input
                                    type="text"
                                    value={storageSettings.supabasePublicUrl}
                                    onChange={(e) => setStorageSettingsState(prev => ({ ...prev, supabasePublicUrl: e.target.value }))}
                                    placeholder="Auto-constructed if empty"
                                    disabled={adminRole !== 'ceo'}
                                    className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-800 bg-neutral-950 text-slate-200 focus:border-purple-500 focus:outline-none"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {adminRole === 'ceo' && (
                          <div className="pt-2 flex justify-end">
                            <button
                              type="submit"
                              disabled={isSavingStorage}
                              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-purple-600/10 cursor-pointer"
                            >
                              {isSavingStorage ? (
                                <>
                                  <RefreshCw size={14} className="animate-spin" />
                                  <span>Testing S3 Bucket Connection...</span>
                                </>
                              ) : (
                                <>
                                  <Save size={14} />
                                  <span>Test S3 Connection & Save settings</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </form>
                    </div>

                    <div className="xl:col-span-5 space-y-6">
                      <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-neutral-950 border-purple-500/10' : 'bg-slate-50 border-slate-200'} space-y-4 text-xs leading-relaxed`}>
                        <h4 className="font-bold text-slate-300 flex items-center gap-1.5 border-b border-purple-500/10 pb-3 uppercase font-mono tracking-wider">
                          <ShieldCheck size={14} className="text-emerald-400" />
                          Infrastructure Architecture Status
                        </h4>
                        <div className="space-y-3.5">
                          <div className="flex justify-between items-center bg-white/2 p-2.5 rounded-lg border border-slate-800">
                            <span className="text-slate-400 font-semibold">Active State Store</span>
                            <span className="font-mono text-purple-400 font-bold uppercase">Firestore Active</span>
                          </div>
                          <div className="flex justify-between items-center bg-white/2 p-2.5 rounded-lg border border-slate-800">
                            <span className="text-slate-400 font-semibold">Encryption Shield</span>
                            <span className="font-mono text-emerald-400 font-bold uppercase">AES-256 Enabled</span>
                          </div>
                          <div className="flex justify-between items-center bg-white/2 p-2.5 rounded-lg border border-slate-800">
                            <span className="text-slate-400 font-semibold">Automatic Optimization</span>
                            <span className="font-mono text-emerald-400 font-bold">Resizing, EXIF Strip, WebP</span>
                          </div>
                        </div>
                        <div className="pt-2 text-slate-500 text-[11px]">
                          **How synchronization is enforced:** When a file upload occurs, the file is run through local canvas pre-processing in the browser, optimized into WebP format, stripped of metadata, and pushed to S3. All client browsers retrieve this from a globally decentralized CDN cache with active invalidation keys!
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUB-TAB 5: CENTRALIZED MEDIA LIBRARY */}
                {emailSubTab === 'media_library' && (
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-fadeIn text-left">
                    {/* Left virtual folders panel */}
                    <div className="xl:col-span-3 space-y-6">
                      <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-neutral-950 border-purple-500/10' : 'bg-slate-50 border-slate-200'} space-y-4`}>
                        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400 pb-2 border-b border-purple-500/10">
                          Virtual S3 Folders
                        </h4>
                        <div className="space-y-1">
                          {[
                            { id: 'all', name: 'All Files', count: mediaItems.length },
                            { id: 'logos', name: 'Brand Logos', count: mediaItems.filter(m => m.folder === 'logos').length },
                            { id: 'banners', name: 'Hero Banners', count: mediaItems.filter(m => m.folder === 'banners').length },
                            { id: 'portfolio', name: 'Portfolio Items', count: mediaItems.filter(m => m.folder === 'portfolio').length },
                            { id: 'documents', name: 'Documents & PDFs', count: mediaItems.filter(m => m.folder === 'documents').length },
                            { id: 'general', name: 'General Assets', count: mediaItems.filter(m => m.folder === 'general').length }
                          ].map((folder) => (
                            <button
                              key={folder.id}
                              onClick={() => setSelectedMediaFolder(folder.id)}
                              className={`w-full px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-all ${selectedMediaFolder === folder.id
                                  ? 'bg-purple-600 text-white'
                                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                              <span className="flex items-center gap-2">
                                <Folder size={14} />
                                <span>{folder.name}</span>
                              </span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${selectedMediaFolder === folder.id ? 'bg-purple-800 text-purple-100' : 'bg-slate-800 text-slate-400'
                                }`}>
                                {folder.count}
                              </span>
                            </button>
                          ))}
                        </div>

                        <div className="border-t border-slate-800/60 pt-3">
                          <div className="bg-white/2 rounded-xl p-3 border border-slate-800 text-[10px] text-slate-400 space-y-2">
                            <span className="block font-mono text-[9px] uppercase tracking-wider text-slate-500 font-bold">S3 Bucket Allocation</span>
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-slate-300">Total Media Files</span>
                              <span className="font-mono text-purple-400">{mediaItems.length} items</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-slate-300">Space Occupied</span>
                              <span className="font-mono text-emerald-400">
                                {formatBytes(mediaItems.reduce((acc, m) => acc + (m.size || 0), 0))}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Main Media Grid */}
                    <div className="xl:col-span-9 space-y-6">
                      {/* Filter and upload bar */}
                      <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-neutral-950 border-purple-500/10' : 'bg-slate-50 border-slate-200'} flex flex-wrap gap-4 justify-between items-center`}>
                        <div className="flex flex-1 min-w-[200px] relative">
                          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input
                            type="text"
                            value={mediaSearchQuery}
                            onChange={(e) => setMediaSearchQuery(e.target.value)}
                            placeholder="Search media files by name..."
                            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-800 bg-neutral-950 text-slate-200 focus:border-purple-500 focus:outline-none"
                          />
                        </div>

                        <div className="flex gap-2">
                          <select
                            value={mediaFilterType}
                            onChange={(e) => setMediaFilterType(e.target.value)}
                            className="px-3 py-2 text-xs rounded-lg border border-slate-800 bg-neutral-950 text-slate-300 focus:outline-none focus:border-purple-500 cursor-pointer"
                          >
                            <option value="all">All File Types</option>
                            <option value="images">Images (.png, .webp, .jpg)</option>
                            <option value="documents">PDFs & Documents</option>
                          </select>

                          {adminRole === 'ceo' && (
                            <div className="relative">
                              <input
                                type="file"
                                id="media-uploader-input"
                                multiple
                                accept="image/*,application/pdf"
                                onChange={async (e) => {
                                  const files = Array.from(e.target.files || []) as File[];
                                  if (files.length === 0) return;

                                  // Process files
                                  setUploadProgressList(files.map(f => ({ name: f.name, status: 'compressing', progress: 0 })));

                                  for (let i = 0; i < files.length; i++) {
                                    const file = files[i];
                                    try {
                                      let fileToUpload = file;

                                      // Update status
                                      setUploadProgressList(prev => prev.map((item, idx) => idx === i ? { ...item, status: 'compressing' } : item));

                                      // If image, automatically compress and convert to WebP
                                      if (file.type.startsWith("image/")) {
                                        try {
                                          const optimizedResult = await optimizeImageBeforeUpload(file);
                                          fileToUpload = optimizedResult.optimizedFile;
                                        } catch (err) {
                                          console.warn("Compression failed, uploading original image:", err);
                                        }
                                      }

                                      setUploadProgressList(prev => prev.map((item, idx) => idx === i ? { ...item, status: 'uploading', progress: 30 } : item));

                                      const formData = new FormData();
                                      formData.append("image", fileToUpload);
                                      formData.append("folder", selectedMediaFolder === 'all' ? 'general' : selectedMediaFolder);

                                      const uploadRes = await fetch("/api/upload", {
                                        method: "POST",
                                        body: formData
                                      });

                                      if (uploadRes.ok) {
                                        setUploadProgressList(prev => prev.map((item, idx) => idx === i ? { ...item, status: 'completed', progress: 100 } : item));
                                      } else {
                                        setUploadProgressList(prev => prev.map((item, idx) => idx === i ? { ...item, status: 'error', progress: 100 } : item));
                                      }
                                    } catch (err) {
                                      setUploadProgressList(prev => prev.map((item, idx) => idx === i ? { ...item, status: 'error', progress: 100 } : item));
                                    }
                                  }

                                  // Refresh Media Library
                                  fetchMediaLibrary();
                                  // Clear upload bar list after 4 seconds
                                  setTimeout(() => setUploadProgressList([]), 4000);
                                }}
                                className="hidden"
                              />
                              <label
                                htmlFor="media-uploader-input"
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-purple-600/10 transition-all whitespace-nowrap"
                              >
                                <Upload size={14} />
                                <span>Upload to Bucket</span>
                              </label>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Uploading progress alerts */}
                      {uploadProgressList.length > 0 && (
                        <div className="p-4 rounded-2xl border border-purple-500/20 bg-purple-500/5 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-purple-300">Uploading Assets Progress Panel</span>
                            <span className="text-[10px] text-slate-400">Processing queued assets...</span>
                          </div>
                          <div className="space-y-1.5">
                            {uploadProgressList.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between text-xs bg-black/20 p-2 rounded-lg border border-slate-800">
                                <span className="font-mono text-[11px] text-slate-300 max-w-[200px] truncate">{item.name}</span>
                                <div className="flex items-center gap-3">
                                  <span className={`text-[10px] font-mono uppercase font-bold ${item.status === 'completed' ? 'text-emerald-400' :
                                      item.status === 'compressing' ? 'text-amber-400 animate-pulse' :
                                        item.status === 'error' ? 'text-rose-400' : 'text-purple-400 animate-pulse'
                                    }`}>
                                    {item.status === 'compressing' ? '🔄 WebP Resizing...' :
                                      item.status === 'uploading' ? '🚀 Pushing to S3...' :
                                        item.status === 'completed' ? '✅ S3 Synchronized' : '❌ Failed'}
                                  </span>
                                  <div className="w-16 bg-slate-850 h-1.5 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full transition-all duration-300 ${item.status === 'completed' ? 'bg-emerald-500' : 'bg-purple-500'}`}
                                      style={{ width: `${item.progress || (item.status === 'completed' ? 100 : 50)}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Grid layout */}
                      {isMediaLoading ? (
                        <div className="py-24 text-center">
                          <RefreshCw size={24} className="animate-spin text-purple-400 mx-auto mb-2" />
                          <p className="text-xs text-slate-500">Querying S3 Bucket and Media Catalog...</p>
                        </div>
                      ) : (() => {
                        // Filter files
                        const filtered = mediaItems.filter(item => {
                          const matchesSearch = item.name.toLowerCase().includes(mediaSearchQuery.toLowerCase());
                          const matchesFolder = selectedMediaFolder === 'all' || item.folder === selectedMediaFolder;
                          const matchesType = mediaFilterType === 'all' ||
                            (mediaFilterType === 'images' && item.type.startsWith('image/')) ||
                            (mediaFilterType === 'documents' && !item.type.startsWith('image/'));
                          return matchesSearch && matchesFolder && matchesType;
                        });

                        if (filtered.length === 0) {
                          return (
                            <div className="py-24 text-center border border-dashed border-slate-850 rounded-2xl">
                              <p className="text-xs text-slate-500">No synchronized files found matching search filters.</p>
                            </div>
                          );
                        }

                        return (
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {filtered.map((item) => {
                              const isImage = item.type.startsWith('image/');
                              const isUsedAsLogo = theme.brandLogo === item.url;
                              const isUsedAsBanner = theme.decorationBanner === item.url || theme.photographyBanner === item.url;

                              return (
                                <div
                                  key={item.id}
                                  className={`group relative rounded-xl border ${isDarkMode ? 'bg-neutral-950 border-slate-800' : 'bg-slate-50 border-slate-200'} overflow-hidden transition-all hover:scale-[1.01] hover:border-purple-500/40`}
                                >
                                  {/* Asset preview */}
                                  <div className="aspect-square bg-black/40 relative flex items-center justify-center overflow-hidden border-b border-slate-800/60">
                                    {isImage ? (
                                      <img
                                        src={`${item.url}${item.version ? `?v=${item.version}` : ''}`}
                                        alt={item.name}
                                        referrerPolicy="no-referrer"
                                        className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                                      />
                                    ) : (
                                      <div className="p-6 text-center space-y-1.5">
                                        <FileText size={40} className="text-purple-400 mx-auto" />
                                        <span className="block text-[9px] font-mono text-slate-500 font-bold tracking-widest uppercase">
                                          {item.type.includes('pdf') ? 'PDF Document' : 'Document'}
                                        </span>
                                      </div>
                                    )}

                                    {/* Hover Overlay Actions */}
                                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button
                                        onClick={() => {
                                          navigator.clipboard.writeText(item.url);
                                          alert("Copied asset public URL directly to clipboard!");
                                        }}
                                        className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] flex items-center gap-1 transition-all"
                                      >
                                        <span>Copy URL</span>
                                      </button>

                                      {adminRole === 'ceo' && (
                                        <>
                                          <div className="relative">
                                            <input
                                              type="file"
                                              id={`replacer-${item.id}`}
                                              accept="image/*,application/pdf"
                                              onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;

                                                setIsMediaLoading(true);
                                                try {
                                                  let fileToUpload = file;
                                                  if (file.type.startsWith("image/")) {
                                                    const optimizedResult = await optimizeImageBeforeUpload(file);
                                                    fileToUpload = optimizedResult.optimizedFile;
                                                  }

                                                  const formData = new FormData();
                                                  formData.append("image", fileToUpload);
                                                  formData.append("id", item.id);

                                                  const replRes = await fetch("/api/media-library/replace", {
                                                    method: "POST",
                                                    body: formData
                                                  });

                                                  if (replRes.ok) {
                                                    alert("Asset replaced and version catalog bumped successfully!");
                                                    fetchMediaLibrary();
                                                  } else {
                                                    alert("Failed to replace asset.");
                                                  }
                                                } catch (err) {
                                                  alert("Failed to process replacement.");
                                                } finally {
                                                  setIsMediaLoading(false);
                                                }
                                              }}
                                              className="hidden"
                                            />
                                            <label
                                              htmlFor={`replacer-${item.id}`}
                                              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-[10px] flex items-center gap-1 transition-all cursor-pointer block text-center"
                                            >
                                              <span>Replace File</span>
                                            </label>
                                          </div>

                                          <button
                                            onClick={() => {
                                              showConfirm(
                                                "Delete Asset",
                                                `Are you sure you want to delete the asset "${item.name}"? This action cannot be undone.`,
                                                async () => {
                                                  try {
                                                    const res = await fetch("/api/media-library/delete", {
                                                      method: "POST",
                                                      headers: { "Content-Type": "application/json" },
                                                      body: JSON.stringify({ id: item.id })
                                                    });
                                                    if (res.ok) {
                                                      fetchMediaLibrary();
                                                    } else {
                                                      alert("Failed to delete file.");
                                                    }
                                                  } catch (err) {
                                                    alert("Failed to delete file.");
                                                  }
                                                }
                                              );
                                            }}
                                            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] flex items-center gap-1 transition-all"
                                          >
                                            <span>Delete file</span>
                                          </button>
                                        </>
                                      )}
                                    </div>

                                    {/* Active labels */}
                                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                                      {isUsedAsLogo && (
                                        <span className="px-1.5 py-0.5 rounded bg-purple-600 text-white text-[8px] font-mono uppercase font-extrabold tracking-wider">
                                          Brand Logo
                                        </span>
                                      )}
                                      {isUsedAsBanner && (
                                        <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[8px] font-mono uppercase font-extrabold tracking-wider">
                                          Active Banner
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Asset details card footer */}
                                  <div className="p-3 space-y-1">
                                    <p className="text-[11px] font-bold text-slate-300 truncate" title={item.name}>{item.name}</p>
                                    <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono">
                                      <span>{formatBytes(item.size || 0)}</span>
                                      <span className="uppercase">{item.folder || 'general'}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* SUB-TAB 6: DATABASE BACKUPS & RECOVERY */}
                {emailSubTab === 'backups' && (
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-fadeIn text-left">
                    <div className="xl:col-span-7 space-y-6">
                      <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-neutral-950 border-purple-500/10' : 'bg-slate-50 border-slate-200'} space-y-6`}>
                        <div className="flex justify-between items-center pb-4 border-b border-purple-500/10">
                          <div>
                            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                              <Database size={14} />
                              Database Recovery Snapshot Vault
                            </h4>
                            <p className="text-[10px] text-slate-500 mt-0.5">Generate manual backups, download system states, or restore historical timelines instantly.</p>
                          </div>

                          {adminRole === 'ceo' && (
                            <button
                              onClick={handleCreateBackup}
                              disabled={isCreatingBackup}
                              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                            >
                              {isCreatingBackup ? (
                                <>
                                  <RefreshCw size={12} className="animate-spin" />
                                  <span>Creating snapshot...</span>
                                </>
                              ) : (
                                <>
                                  <Plus size={12} />
                                  <span>Create Manual snapshot</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>

                        {backupSuccess && (
                          <div className="p-3.5 rounded-lg border border-emerald-500/15 bg-emerald-500/5 text-emerald-400 text-xs flex items-center gap-2">
                            <CheckCircle size={14} className="shrink-0" />
                            <span>{backupSuccess}</span>
                          </div>
                        )}

                        {backupError && (
                          <div className="p-3.5 rounded-lg border border-rose-500/15 bg-rose-500/5 text-rose-400 text-xs flex items-center gap-2">
                            <AlertCircle size={14} className="shrink-0" />
                            <span>{backupError}</span>
                          </div>
                        )}

                        {/* Backups List */}
                        {isBackupLoading ? (
                          <div className="py-12 text-center text-slate-500 text-xs">
                            <RefreshCw size={18} className="animate-spin text-purple-400 mx-auto mb-2" />
                            <span>Scanning snapshot backups vault...</span>
                          </div>
                        ) : backupsList.length === 0 ? (
                          <div className="py-12 text-center text-slate-500 text-xs">
                            No database snapshots found in server storage directory. Create one now!
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            {backupsList.map((backup, idx) => (
                              <div key={idx} className="p-3.5 rounded-xl border border-slate-850 bg-black/20 flex flex-wrap gap-4 items-center justify-between hover:border-purple-500/15 transition-all">
                                <div className="space-y-1 min-w-[200px]">
                                  <span className="block font-mono text-xs font-bold text-slate-300 truncate max-w-[280px]" title={backup.name}>{backup.name}</span>
                                  <div className="flex gap-4 text-[10px] text-slate-500 font-mono">
                                    <span>Size: {formatBytes(backup.size || 0)}</span>
                                    <span>Created: {new Date(backup.createdAt).toLocaleString()}</span>
                                  </div>
                                </div>

                                <div className="flex gap-2">
                                  {/* Safe link download inside Iframe compatibility */}
                                  <button
                                    onClick={async () => {
                                      try {
                                        const res = await fetch(`/api/backup/download?fileName=${backup.name}`);
                                        if (res.ok) {
                                          const blob = await res.blob();
                                          const downloadUrl = window.URL.createObjectURL(blob);
                                          const link = document.createElement("a");
                                          link.href = downloadUrl;
                                          link.setAttribute("download", backup.name);
                                          document.body.appendChild(link);
                                          link.click();
                                          link.parentNode?.removeChild(link);
                                        } else {
                                          alert("Failed to download backup snapshot.");
                                        }
                                      } catch (err) {
                                        alert("Network error downloading snapshot.");
                                      }
                                    }}
                                    className="px-3 py-1.5 rounded-lg border border-slate-800 bg-white/2 hover:bg-white/5 text-slate-300 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                                  >
                                    <Download size={12} />
                                    <span>Download</span>
                                  </button>

                                  {adminRole === 'ceo' && (
                                    <button
                                      onClick={() => handleRestoreBackup(backup.name)}
                                      disabled={isRestoringBackup}
                                      className="px-3 py-1.5 rounded-lg bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                                    >
                                      <RefreshCw size={12} />
                                      <span>Restore snapshot</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="xl:col-span-5 space-y-6">
                      {/* Upload snapshot recovery */}
                      <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-neutral-950 border-purple-500/10' : 'bg-slate-50 border-slate-200'} space-y-4`}>
                        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400 border-b border-purple-500/10 pb-3">
                          Restore from Local File (.json)
                        </h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Restore any previously exported database backup JSON snapshot directly from your device storage to restore all invoices, quotations, contacts, division pages and state settings instantly.
                        </p>

                        {adminRole === 'ceo' ? (
                          <div className="pt-2">
                            <input
                              type="file"
                              id="restore-direct-input"
                              accept=".json"
                              onChange={handleUploadRestoreBackup}
                              className="hidden"
                            />
                            <label
                              htmlFor="restore-direct-input"
                              className="w-full py-3.5 border border-dashed border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 text-purple-300 hover:text-purple-200 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-2 cursor-pointer transition-all"
                            >
                              <Upload size={18} className="text-purple-400" />
                              <span>Select and Restore Backup File</span>
                              <span className="text-[10px] text-slate-500 font-normal">Must be a valid backup JSON format</span>
                            </label>
                          </div>
                        ) : (
                          <div className="p-3 bg-slate-800/20 border border-slate-800 text-[10px] text-slate-400 rounded-lg">
                            ⚠️ **Access Restriction:** Restoring system data requires super administrator (CEO) role access. Contact Yuvanshan Prabakaran to restore points.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Gemini AI Assistant Tab */}
            {activeTab === 'ai_assistant' && (
              <div className="space-y-8 animate-fadeIn text-left">
                <div>
                  <h3 className={`text-xl font-extrabold tracking-tight flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    <Cpu className="text-purple-400 animate-pulse" size={24} />
                    <span>Enterprise Gemini AI Intelligence Suite</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Supercharge Mahdev's administrative division. Ask Gemini to write customer contract drafts, create tour itineraries, generate SEO keywords, or compile marketing copies.
                  </p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                  {/* Left Side: Interactive Prompt Console */}
                  <div className="xl:col-span-5 space-y-6">
                    <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-neutral-950 border-purple-500/10' : 'bg-slate-50 border-slate-200'} space-y-4`}>
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400">
                          Prompt Console
                        </h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 font-bold">
                          Model: gemini-3.5-flash
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-300">What would you like Gemini to assist you with?</label>
                        <textarea
                          rows={5}
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          className="w-full px-4 py-3 text-xs rounded-xl border border-purple-500/20 bg-neutral-900/60 text-white focus:outline-none focus:border-purple-500 leading-relaxed font-sans placeholder-slate-600 resize-none"
                          placeholder="e.g. Write a professional email to an SWS Wedding stage decoration client reminding them of their final payment of Rs. 150,000 due next Friday..."
                        />
                      </div>

                      <div className="flex justify-end gap-3 pt-2">
                        {aiPrompt && (
                          <button
                            type="button"
                            onClick={() => setAiPrompt('')}
                            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-all"
                          >
                            Reset Prompt
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleAskGemini()}
                          disabled={isAiLoading || !aiPrompt.trim()}
                          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider transition-all uppercase ${isAiLoading || !aiPrompt.trim()
                              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                              : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30 hover:shadow-purple-500/50'
                            }`}
                        >
                          {isAiLoading ? (
                            <>
                              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                              <span>Consulting AI...</span>
                            </>
                          ) : (
                            <>
                              <Cpu size={14} />
                              <span>Ask Gemini</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Instant Administrative Shortcuts */}
                    <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-neutral-950 border-purple-500/10' : 'bg-slate-50 border-slate-200'} space-y-4`}>
                      <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                        ⚡ Instant Admin Presets / Shortcuts
                      </h4>
                      <p className="text-[10px] text-slate-500 leading-normal">
                        Click any shortcut to instantly load its prompt and trigger Gemini's executive reasoning.
                      </p>

                      <div className="space-y-2.5">
                        {[
                          {
                            title: '✉️ Draft SWS Wedding Follow-Up',
                            prompt: 'Draft an elegant, warm, and professional follow-up email to a couple confirming their SWS luxury wedding stage and floral design decoration booking. Politely specify that their stage finalization meeting is scheduled next week.'
                          },
                          {
                            title: '🗺️ Create Travels Luxury Tour Itinerary',
                            prompt: 'Create a premium, luxury 4-day tour itinerary across Sri Lanka tailored for Travels division wedding guests. Include luxury van pick-up, visits to Ella and Galle, and upscale wedding transport details.'
                          },
                          {
                            title: '🚀 Write IT Solutions ERP Proposal Blog',
                            prompt: 'Write a highly compelling, professional LinkedIn article showcasing how Mahdev IT Solutions successfully built and deployed an enterprise-grade ERP system for a logistics company, highlighting data security, high-performance web architecture, and cloud scaling.'
                          },
                          {
                            title: '🧾 Draft U1 Studio Payment Confirmation',
                            prompt: 'Draft an elegant payment confirmation receipt email on behalf of U1 Studio Photography. Thank the corporate client for their full settlement of photography and wedding cinema packages.'
                          }
                        ].map((shortcut, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setAiPrompt(shortcut.prompt);
                              handleAskGemini(shortcut.prompt);
                            }}
                            className={`w-full text-left p-3 rounded-xl border text-[11px] font-medium leading-relaxed transition-all flex items-center justify-between group ${isDarkMode
                                ? 'border-neutral-800 bg-neutral-900/40 hover:bg-neutral-900 text-slate-300 hover:text-white hover:border-purple-500/30'
                                : 'border-slate-100 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 hover:border-purple-500/30'
                              }`}
                          >
                            <span className="truncate pr-3">{shortcut.title}</span>
                            <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-purple-400 shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Side: High-Performance AI Output */}
                  <div className="xl:col-span-7 space-y-6">
                    <div className={`p-6 rounded-2xl border min-h-[480px] flex flex-col ${isDarkMode ? 'bg-neutral-950 border-purple-500/10' : 'bg-slate-50 border-slate-200'
                      }`}>
                      <div className="flex justify-between items-center pb-4 border-b border-purple-500/10 shrink-0">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse"></div>
                          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400">
                            Executive AI Deliverable Output
                          </h4>
                        </div>
                        {aiResponse && (
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(aiResponse);
                              setCopiedAiOutput(true);
                              setTimeout(() => setCopiedAiOutput(false), 2000);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 border ${copiedAiOutput
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                : 'bg-purple-500/15 border-purple-500/30 text-purple-400 hover:bg-purple-500/35'
                              }`}
                          >
                            {copiedAiOutput ? (
                              <>
                                <Check size={10} />
                                <span>Copied to Clipboard</span>
                              </>
                            ) : (
                              <>
                                <Download size={10} />
                                <span>Copy Deliverable</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      {/* AI Response Display Area */}
                      <div className="flex-1 pt-6 overflow-y-auto max-h-[500px]">
                        {isAiLoading ? (
                          <div className="h-full flex flex-col items-center justify-center space-y-4">
                            <div className="relative">
                              <div className="w-12 h-12 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin"></div>
                              <Cpu className="absolute inset-0 m-auto text-purple-400 animate-pulse" size={16} />
                            </div>
                            <div className="text-center space-y-1">
                              <p className="text-xs font-bold uppercase tracking-widest text-purple-400 animate-pulse">Gemini Is Synthesizing</p>
                              <p className="text-[10px] text-slate-500">Drafting professional multi-sector administrative collateral...</p>
                            </div>
                          </div>
                        ) : aiResponse ? (
                          <div className="whitespace-pre-wrap text-xs text-slate-200 font-sans leading-relaxed tracking-wide select-text">
                            {aiResponse}
                          </div>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                            <div className="p-4 rounded-2xl bg-purple-500/5 text-purple-400 border border-purple-500/10">
                              <Cpu size={32} className="animate-pulse" />
                            </div>
                            <div className="max-w-sm space-y-1.5">
                              <p className="text-xs font-bold text-slate-300">AI Assistant Idle</p>
                              <p className="text-[10px] text-slate-500 leading-relaxed">
                                Formulate a custom request in the console or select one of the multi-division presets on the left.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t border-purple-500/10 mt-6 shrink-0 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                        <span>Mahdev Pvt Ltd • Operations Control</span>
                        <span>v1.0 (Enterprise Server API)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Dynamic Editing Modal Popup */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className={`w-full max-w-lg p-6 rounded-3xl border shadow-2xl relative overflow-hidden bg-gradient-to-b ${isDarkMode
                  ? 'from-neutral-900 via-neutral-950 to-black border-purple-500/25 text-white shadow-purple-950/20'
                  : 'from-white to-slate-50 border-slate-200 text-slate-800 shadow-slate-200'
                }`}
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600"></div>

              <div className="flex items-center justify-between border-b border-purple-500/10 pb-4 mb-5 pt-1">
                <div>
                  <h4 className="font-extrabold text-sm uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300 font-mono flex items-center gap-2">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse"></span>
                    <span>{editingItem.id === null ? 'Add New' : 'Edit'} {editingItem.type.replace('_', ' ')}</span>
                  </h4>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">Mahdev Elite Administration Console</p>
                </div>
                <button
                  onClick={() => setEditingItem(null)}
                  className={`p-2 rounded-xl transition-all border ${isDarkMode
                      ? 'border-neutral-800 hover:bg-neutral-800 text-slate-400 hover:text-white'
                      : 'border-slate-100 hover:bg-slate-100 text-slate-500 hover:text-slate-900'
                    }`}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                {editingItem.type === 'service' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Division Title</label>
                      <input
                        type="text"
                        value={editingItem.data.title}
                        onChange={(e) => setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, title: e.target.value }
                        })}
                        className={`w-full px-4 py-2 rounded-xl text-xs border focus:outline-none ${isDarkMode ? 'bg-neutral-950 border-purple-500/10 text-white' : 'bg-slate-50'
                          }`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Division Description</label>
                      <textarea
                        rows={3}
                        value={editingItem.data.description}
                        onChange={(e) => setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, description: e.target.value }
                        })}
                        className={`w-full px-4 py-2 rounded-xl text-xs border focus:outline-none ${isDarkMode ? 'bg-neutral-950 border-purple-500/10 text-white' : 'bg-slate-50'
                          }`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Page Redirection Path</label>
                      <input
                        type="text"
                        value={editingItem.data.page}
                        onChange={(e) => setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, page: e.target.value }
                        })}
                        placeholder="e.g. decoration, photography, erp-solutions"
                        className={`w-full px-4 py-2 rounded-xl text-xs border focus:outline-none ${isDarkMode ? 'bg-neutral-950 border-purple-500/10 text-white' : 'bg-slate-50'
                          }`}
                      />
                    </div>
                    <AdminImageUploader
                      label="Service Division Banner Image"
                      value={editingItem.data.image || ''}
                      onChange={(url) => setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, image: url }
                      })}
                      isDarkMode={isDarkMode}
                      required={true}
                    />
                  </>
                )}

                {editingItem.type === 'portfolio' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Photo Title</label>
                      <input
                        type="text"
                        value={editingItem.data.title}
                        onChange={(e) => setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, title: e.target.value }
                        })}
                        className={`w-full px-4 py-2 rounded-xl text-xs border focus:outline-none ${isDarkMode ? 'bg-neutral-950 border-purple-500/10 text-white' : 'bg-slate-50'
                          }`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Category</label>
                      <select
                        value={editingItem.data.category}
                        onChange={(e) => setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, category: e.target.value }
                        })}
                        className={`w-full px-4 py-2 rounded-xl text-xs border focus:outline-none ${isDarkMode ? 'bg-neutral-950 border-purple-500/10 text-white' : 'bg-slate-50'
                          }`}
                      >
                        <option value="Wedding">Wedding</option>
                        <option value="Stage">Stage</option>
                        <option value="Church Setup">Church Setup</option>
                        <option value="Birthday">Birthday</option>
                        <option value="Corporate">Corporate</option>
                        <option value="Studio Portrait">Studio Portrait</option>
                      </select>
                    </div>
                    <AdminImageUploader
                      label="Image"
                      value={editingItem.data.image}
                      onChange={(url) => setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, image: url }
                      })}
                      isDarkMode={isDarkMode}
                      required={true}
                    />
                  </>
                )}

                {editingItem.type === 'pricing' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Package Title</label>
                      <input
                        type="text"
                        value={editingItem.data.title}
                        onChange={(e) => setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, title: e.target.value }
                        })}
                        className={`w-full px-4 py-2 rounded-xl text-xs border focus:outline-none ${isDarkMode ? 'bg-neutral-950 border-purple-500/10 text-white' : 'bg-slate-50'
                          }`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Package Price</label>
                      <input
                        type="text"
                        value={editingItem.data.price}
                        onChange={(e) => setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, price: e.target.value }
                        })}
                        className={`w-full px-4 py-2 rounded-xl text-xs border focus:outline-none ${isDarkMode ? 'bg-neutral-950 border-purple-500/10 text-white' : 'bg-slate-50'
                          }`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Duration</label>
                      <input
                        type="text"
                        value={editingItem.data.duration}
                        onChange={(e) => setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, duration: e.target.value }
                        })}
                        className={`w-full px-4 py-2 rounded-xl text-xs border focus:outline-none ${isDarkMode ? 'bg-neutral-950 border-purple-500/10 text-white' : 'bg-slate-50'
                          }`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Features (comma-separated)</label>
                      <textarea
                        rows={3}
                        value={editingItem.data.features}
                        onChange={(e) => setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, features: e.target.value }
                        })}
                        className={`w-full px-4 py-2 rounded-xl text-xs border focus:outline-none ${isDarkMode ? 'bg-neutral-950 border-purple-500/10 text-white' : 'bg-slate-50'
                          }`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Badge (e.g. Popular, Premium, Empty)</label>
                      <input
                        type="text"
                        value={editingItem.data.badge || ''}
                        onChange={(e) => setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, badge: e.target.value }
                        })}
                        className={`w-full px-4 py-2 rounded-xl text-xs border focus:outline-none ${isDarkMode ? 'bg-neutral-950 border-purple-500/10 text-white' : 'bg-slate-50'
                          }`}
                      />
                    </div>
                  </>
                )}

                {editingItem.type === 'project' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Project Title</label>
                      <input
                        type="text"
                        value={editingItem.data.title}
                        onChange={(e) => setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, title: e.target.value }
                        })}
                        className={`w-full px-4 py-2 rounded-xl text-xs border focus:outline-none ${isDarkMode ? 'bg-neutral-950 border-purple-500/10 text-white' : 'bg-slate-50'
                          }`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Category</label>
                      <input
                        type="text"
                        value={editingItem.data.category}
                        onChange={(e) => setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, category: e.target.value }
                        })}
                        className={`w-full px-4 py-2 rounded-xl text-xs border focus:outline-none ${isDarkMode ? 'bg-neutral-950 border-purple-500/10 text-white' : 'bg-slate-50'
                          }`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Description</label>
                      <textarea
                        rows={3}
                        value={editingItem.data.description}
                        onChange={(e) => setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, description: e.target.value }
                        })}
                        className={`w-full px-4 py-2 rounded-xl text-xs border focus:outline-none ${isDarkMode ? 'bg-neutral-950 border-purple-500/10 text-white' : 'bg-slate-50'
                          }`}
                      />
                    </div>
                    <AdminImageUploader
                      label="Image"
                      value={editingItem.data.image}
                      onChange={(url) => setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, image: url }
                      })}
                      isDarkMode={isDarkMode}
                      required={true}
                    />
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Portal URL</label>
                      <input
                        type="text"
                        value={editingItem.data.url}
                        onChange={(e) => setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, url: e.target.value }
                        })}
                        className={`w-full px-4 py-2 rounded-xl text-xs border focus:outline-none ${isDarkMode ? 'bg-neutral-950 border-purple-500/10 text-white' : 'bg-slate-50'
                          }`}
                      />
                    </div>
                  </>
                )}

                {editingItem.type === 'leader' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Leader Name</label>
                      <input
                        type="text"
                        value={editingItem.data.name}
                        onChange={(e) => setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, name: e.target.value }
                        })}
                        className={`w-full px-4 py-2 rounded-xl text-xs border focus:outline-none ${isDarkMode ? 'bg-neutral-950 border-purple-500/10 text-white' : 'bg-slate-50'
                          }`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Corporate Role</label>
                      <input
                        type="text"
                        value={editingItem.data.role}
                        onChange={(e) => setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, role: e.target.value }
                        })}
                        className={`w-full px-4 py-2 rounded-xl text-xs border focus:outline-none ${isDarkMode ? 'bg-neutral-950 border-purple-500/10 text-white' : 'bg-slate-50'
                          }`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Professional Bio</label>
                      <textarea
                        rows={3}
                        value={editingItem.data.bio}
                        onChange={(e) => setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, bio: e.target.value }
                        })}
                        className={`w-full px-4 py-2 rounded-xl text-xs border focus:outline-none ${isDarkMode ? 'bg-neutral-950 border-purple-500/10 text-white' : 'bg-slate-50'
                          }`}
                      />
                    </div>
                    <AdminImageUploader
                      label="Profile Photo"
                      value={editingItem.data.image}
                      onChange={(url) => setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, image: url }
                      })}
                      isDarkMode={isDarkMode}
                      required={true}
                    />
                  </>
                )}

                {editingItem.type === 'testimonial' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Client Name</label>
                      <input
                        type="text"
                        value={editingItem.data.name}
                        onChange={(e) => setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, name: e.target.value }
                        })}
                        className={`w-full px-4 py-2 rounded-xl text-xs border focus:outline-none ${isDarkMode ? 'bg-neutral-950 border-purple-500/10 text-white' : 'bg-slate-50'
                          }`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Client Role / Designation</label>
                      <input
                        type="text"
                        value={editingItem.data.role}
                        onChange={(e) => setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, role: e.target.value }
                        })}
                        className={`w-full px-4 py-2 rounded-xl text-xs border focus:outline-none ${isDarkMode ? 'bg-neutral-950 border-purple-500/10 text-white' : 'bg-slate-50'
                          }`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Comment</label>
                      <textarea
                        rows={3}
                        value={editingItem.data.comment}
                        onChange={(e) => setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, comment: e.target.value }
                        })}
                        className={`w-full px-4 py-2 rounded-xl text-xs border focus:outline-none ${isDarkMode ? 'bg-neutral-950 border-purple-500/10 text-white' : 'bg-slate-50'
                          }`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Star Rating (1-5)</label>
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={editingItem.data.rating}
                        onChange={(e) => setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, rating: parseInt(e.target.value) || 5 }
                        })}
                        className={`w-full px-4 py-2 rounded-xl text-xs border focus:outline-none ${isDarkMode ? 'bg-neutral-950 border-purple-500/10 text-white' : 'bg-slate-50'
                          }`}
                      />
                    </div>
                    <AdminImageUploader
                      label="Avatar Image"
                      value={editingItem.data.avatar}
                      onChange={(url) => setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, avatar: url }
                      })}
                      isDarkMode={isDarkMode}
                      required={true}
                    />
                  </>
                )}

                {editingItem.type === 'decor_post' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Decor Post Title</label>
                      <input
                        type="text"
                        value={editingItem.data.title}
                        onChange={(e) => setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, title: e.target.value }
                        })}
                        placeholder="e.g. Grand Backdrop with Floral Rings"
                        className={`w-full px-4 py-2 rounded-xl text-xs border focus:outline-none ${isDarkMode ? 'bg-neutral-950 border-emerald-500/10 text-white' : 'bg-slate-50'
                          }`}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Event Category</label>
                      <select
                        value={editingItem.data.category}
                        onChange={(e) => setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, category: e.target.value }
                        })}
                        className={`w-full px-4 py-2 rounded-xl text-xs border focus:outline-none ${isDarkMode ? 'bg-neutral-950 border-emerald-500/10 text-white' : 'bg-slate-50 text-slate-900'
                          }`}
                      >
                        <option value="Wedding">Wedding</option>
                        <option value="Birthday">Birthday</option>
                        <option value="Church">Church</option>
                        <option value="Corporate">Corporate</option>
                        <option value="Stage">Stage</option>
                        <option value="Outdoor">Outdoor</option>
                      </select>
                    </div>
                    <AdminImageUploader
                      label="High-Res Image"
                      value={editingItem.data.image}
                      onChange={(url) => setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, image: url }
                      })}
                      isDarkMode={isDarkMode}
                      required={true}
                    />
                  </>
                )}

                {editingItem.type === 'rental' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Rental Product Name</label>
                      <input
                        type="text"
                        value={editingItem.data.name}
                        onChange={(e) => setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, name: e.target.value }
                        })}
                        placeholder="e.g. Luxury Velvet Sofa Chair"
                        className={`w-full px-4 py-2 rounded-xl text-xs border focus:outline-none ${isDarkMode ? 'bg-neutral-950 border-emerald-500/10 text-white' : 'bg-slate-50'
                          }`}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Prop Category</label>
                      <select
                        value={editingItem.data.category}
                        onChange={(e) => setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, category: e.target.value }
                        })}
                        className={`w-full px-4 py-2 rounded-xl text-xs border focus:outline-none ${isDarkMode ? 'bg-neutral-950 border-emerald-500/10 text-white' : 'bg-slate-50 text-slate-900'
                          }`}
                      >
                        <option value="Furniture">Furniture</option>
                        <option value="Backdrops">Backdrops</option>
                        <option value="Lighting">Lighting</option>
                        <option value="Props">Props</option>
                        <option value="Tableware">Tableware</option>
                        <option value="AV Equipment">AV Equipment</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Price (with prefix)</label>
                        <input
                          type="text"
                          value={editingItem.data.price}
                          onChange={(e) => setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, price: e.target.value }
                          })}
                          placeholder="e.g. Rs. 2,500 / day"
                          className={`w-full px-4 py-2 rounded-xl text-xs border focus:outline-none ${isDarkMode ? 'bg-neutral-950 border-emerald-500/10 text-white' : 'bg-slate-50'
                            }`}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Available Quantity</label>
                        <input
                          type="number"
                          min={1}
                          value={editingItem.data.availableQty}
                          onChange={(e) => setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, availableQty: parseInt(e.target.value) || 1 }
                          })}
                          className={`w-full px-4 py-2 rounded-xl text-xs border focus:outline-none ${isDarkMode ? 'bg-neutral-950 border-emerald-500/10 text-white' : 'bg-slate-50'
                            }`}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Short Description</label>
                      <textarea
                        rows={2}
                        value={editingItem.data.description}
                        onChange={(e) => setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, description: e.target.value }
                        })}
                        placeholder="Sleek white leather with gold trim accents."
                        className={`w-full px-4 py-2 rounded-xl text-xs border focus:outline-none ${isDarkMode ? 'bg-neutral-950 border-emerald-500/10 text-white' : 'bg-slate-50'
                          }`}
                      />
                    </div>
                    <AdminImageUploader
                      label="Product Image"
                      value={editingItem.data.image}
                      onChange={(url) => setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, image: url }
                      })}
                      isDarkMode={isDarkMode}
                      required={true}
                    />
                  </>
                )}

                {editingItem.type === 'travels_vehicle' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Vehicle Name</label>
                      <input
                        type="text"
                        value={editingItem.data.name}
                        onChange={(e) => setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, name: e.target.value }
                        })}
                        placeholder="e.g. Mercedes-Benz S-Class"
                        className={`w-full px-4 py-2 rounded-xl text-xs border focus:outline-none ${isDarkMode ? 'bg-neutral-950 border-purple-500/10 text-white' : 'bg-slate-50'
                          }`}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Category</label>
                      <select
                        value={editingItem.data.category}
                        onChange={(e) => setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, category: e.target.value }
                        })}
                        className={`w-full px-4 py-2 rounded-xl text-xs border focus:outline-none ${isDarkMode ? 'bg-neutral-950 border-purple-500/10 text-white' : 'bg-slate-50 text-slate-900'
                          }`}
                      >
                        <option value="wedding">Wedding Luxury</option>
                        <option value="premium">Premium Sedans & SUVs</option>
                        <option value="vans">Vans & Coasters</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Price (with prefix)</label>
                        <input
                          type="text"
                          value={editingItem.data.price}
                          onChange={(e) => setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, price: e.target.value }
                          })}
                          placeholder="e.g. Rs. 45,000 / day"
                          className={`w-full px-4 py-2 rounded-xl text-xs border focus:outline-none ${isDarkMode ? 'bg-neutral-950 border-purple-500/10 text-white' : 'bg-slate-50'
                            }`}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Engine Details</label>
                        <input
                          type="text"
                          value={editingItem.data.engine}
                          onChange={(e) => setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, engine: e.target.value }
                          })}
                          placeholder="e.g. 2.0L Turbo Hybrid"
                          className={`w-full px-4 py-2 rounded-xl text-xs border focus:outline-none ${isDarkMode ? 'bg-neutral-950 border-purple-500/10 text-white' : 'bg-slate-50'
                            }`}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Passenger Count</label>
                        <input
                          type="number"
                          value={editingItem.data.passengers}
                          onChange={(e) => setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, passengers: parseInt(e.target.value) || 4 }
                          })}
                          className={`w-full px-4 py-2 rounded-xl text-xs border focus:outline-none ${isDarkMode ? 'bg-neutral-950 border-purple-500/10 text-white' : 'bg-slate-50'
                            }`}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Luggage Capacity</label>
                        <input
                          type="number"
                          value={editingItem.data.luggage}
                          onChange={(e) => setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, luggage: parseInt(e.target.value) || 2 }
                          })}
                          className={`w-full px-4 py-2 rounded-xl text-xs border focus:outline-none ${isDarkMode ? 'bg-neutral-950 border-purple-500/10 text-white' : 'bg-slate-50'
                            }`}
                          required
                        />
                      </div>
                    </div>
                    <AdminImageUploader
                      label="Vehicle Image"
                      value={editingItem.data.image}
                      onChange={(url) => setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, image: url }
                      })}
                      isDarkMode={isDarkMode}
                      required={true}
                    />
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Features (comma-separated)</label>
                      <textarea
                        rows={3}
                        value={editingItem.data.features}
                        onChange={(e) => setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, features: e.target.value }
                        })}
                        placeholder="Silk White Interior, Chauffeur Driven, Ambient Dual Lighting"
                        className={`w-full px-4 py-2 rounded-xl text-xs border focus:outline-none ${isDarkMode ? 'bg-neutral-950 border-purple-500/10 text-white' : 'bg-slate-50'
                          }`}
                        required
                      />
                    </div>
                  </>
                )}

                {editingItem.type === 'travels_tour' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Tour Title</label>
                      <input
                        type="text"
                        value={editingItem.data.title}
                        onChange={(e) => setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, title: e.target.value }
                        })}
                        placeholder="e.g. Cultural Triangle & Temple Wonders"
                        className={`w-full px-4 py-2 rounded-xl text-xs border focus:outline-none ${isDarkMode ? 'bg-neutral-950 border-purple-500/10 text-white' : 'bg-slate-50'
                          }`}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Duration</label>
                        <input
                          type="text"
                          value={editingItem.data.duration}
                          onChange={(e) => setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, duration: e.target.value }
                          })}
                          placeholder="e.g. 5 Days / 4 Nights"
                          className={`w-full px-4 py-2 rounded-xl text-xs border focus:outline-none ${isDarkMode ? 'bg-neutral-950 border-purple-500/10 text-white' : 'bg-slate-50'
                            }`}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Price per person</label>
                        <input
                          type="text"
                          value={editingItem.data.price}
                          onChange={(e) => setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, price: e.target.value }
                          })}
                          placeholder="e.g. Rs. 145,000 / person"
                          className={`w-full px-4 py-2 rounded-xl text-xs border focus:outline-none ${isDarkMode ? 'bg-neutral-950 border-purple-500/10 text-white' : 'bg-slate-50'
                            }`}
                          required
                        />
                      </div>
                    </div>
                    <AdminImageUploader
                      label="Tour Cover Image"
                      value={editingItem.data.image}
                      onChange={(url) => setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, image: url }
                      })}
                      isDarkMode={isDarkMode}
                      required={true}
                    />
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Highlights (comma-separated)</label>
                      <textarea
                        rows={2}
                        value={editingItem.data.highlights}
                        onChange={(e) => setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, highlights: e.target.value }
                        })}
                        placeholder="Sigiriya Fortress Hike, Dambulla Cave Temple, Kandy Sacred Temple"
                        className={`w-full px-4 py-2 rounded-xl text-xs border focus:outline-none ${isDarkMode ? 'bg-neutral-950 border-purple-500/10 text-white' : 'bg-slate-50'
                          }`}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Daily Itinerary Days (Structured JSON Array)
                      </label>
                      <textarea
                        rows={6}
                        value={editingItem.data.itinerary}
                        onChange={(e) => setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, itinerary: e.target.value }
                        })}
                        placeholder={`[\n  {\n    "day": 1,\n    "title": "Day 1 Title",\n    "desc": "Detailed description of Day 1 actions"\n  }\n]`}
                        className="w-full px-4 py-2 rounded-xl font-mono text-[11px] border focus:outline-none bg-neutral-950 border-purple-500/20 text-emerald-400"
                        required
                      />
                      <span className="text-[10px] text-slate-500 block mt-1">
                        Must be a valid JSON array of day objects: {"[ { \"day\": 1, \"title\": \"...\", \"desc\": \"...\" } ]"}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 mt-6 border-t border-purple-500/10 pt-4">
                <button
                  onClick={() => setEditingItem(null)}
                  className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors ${isDarkMode
                      ? 'bg-neutral-800 hover:bg-neutral-700 text-slate-300'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleModalSave}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-purple-600/20 hover:shadow-purple-500/40 hover:scale-[1.02]"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
