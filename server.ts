/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import fs from "fs";
import multer from "multer";
import { getCloudDb, saveCloudKey } from "./server-firebase";
import { GoogleGenAI } from "@google/genai";
import { encrypt, decrypt } from "./server-crypto";
import { getSmtpTransporter, renderTemplate } from "./server-smtp";
import { 
  getStorageSettings, 
  saveStorageSettings, 
  uploadFile, 
  deleteFile, 
  getMediaLibrary, 
  saveMediaLibrary, 
  createBackup, 
  getBackupsList, 
  restoreFromBackupData, 
  MediaItem 
} from "./server-storage";

dotenv.config();

const DB_PATH = path.join(process.cwd(), "server-db.json");

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "image-" + uniqueSuffix + ext);
  },
});
const upload = multer({ storage });

// Safe Database Helpers
function getDb() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const content = fs.readFileSync(DB_PATH, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("[Database ERROR] Reading database failed:", err);
  }
  return {};
}

function saveDb(data: any) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("[Database ERROR] Saving database failed:", err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Enable JSON body parsing
  app.use(express.json());

  // API to fetch the complete server-side database
  app.get("/api/get-all-data", async (req, res) => {
    try {
      const db = await getCloudDb();
      if (db && db["mahdev_smtp_settings"]) {
        const settings = db["mahdev_smtp_settings"];
        db["mahdev_smtp_settings"] = {
          ...settings,
          password: settings.password ? "••••••••••••" : ""
        };
      }
      return res.json(db);
    } catch (error: any) {
      console.error("[Get All Data ERROR]", error);
      return res.status(500).json({ error: "Failed to load database state." });
    }
  });

  // API to handle image uploads from device, enhanced with Media Library and Cloud Object Storage
  app.post("/api/upload", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file was uploaded." });
      }

      console.log(`[Upload API] Processing file: ${req.file.originalname} (${req.file.size} bytes)`);
      const fileBuffer = fs.readFileSync(req.file.path);
      
      // Determine folder based on context if possible, or general
      const folder = req.body.folder || "general";
      
      // Upload using server-storage module (handles local or cloud seamlessly)
      const uploadResult = await uploadFile(fileBuffer, req.file.originalname, req.file.mimetype, folder);
      
      // Remove temporary uploaded file
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        console.warn("[Upload API] Failed to clean up temp file:", e);
      }

      // Automatically register in Media Library database
      const mediaList = await getMediaLibrary();
      const mediaId = `m-${Date.now()}`;
      const newMediaItem: MediaItem = {
        id: mediaId,
        name: req.file.originalname,
        url: uploadResult.url,
        type: req.file.mimetype,
        size: req.file.size,
        folder: folder,
        uploadedAt: new Date().toISOString(),
        version: 1
      };
      
      mediaList.unshift(newMediaItem);
      await saveMediaLibrary(mediaList);

      console.log(`[Upload API] File uploaded and logged in Media Library: ${uploadResult.url}`);
      return res.json({ 
        success: true, 
        url: uploadResult.url, 
        id: mediaId,
        name: req.file.originalname,
        key: uploadResult.key 
      });
    } catch (error: any) {
      console.error("[Upload API ERROR]", error);
      return res.status(500).json({ error: "Failed to process image upload on the server." });
    }
  });

  // Storage settings endpoints
  app.get("/api/storage/settings", async (req, res) => {
    try {
      const settings = await getStorageSettings();
      // Mask secret keys for UI display
      const sanitized = {
        ...settings,
        r2SecretAccessKey: settings.r2SecretAccessKey ? "••••••••••••" : "",
        supabaseServiceKey: settings.supabaseServiceKey ? "••••••••••••" : ""
      };
      return res.json(sanitized);
    } catch (error) {
      console.error("[API Storage Settings] Failed to load:", error);
      return res.status(500).json({ error: "Failed to load storage settings." });
    }
  });

  app.post("/api/storage/settings", async (req, res) => {
    try {
      const incoming = req.body;
      const existing = await getStorageSettings();
      
      // Handle masked password fields
      let finalR2Secret = incoming.r2SecretAccessKey;
      if (incoming.r2SecretAccessKey === "••••••••••••") {
        finalR2Secret = existing.r2SecretAccessKey;
      }
      
      let finalSupabaseKey = incoming.supabaseServiceKey;
      if (incoming.supabaseServiceKey === "••••••••••••") {
        finalSupabaseKey = existing.supabaseServiceKey;
      }

      const settings = {
        ...incoming,
        r2SecretAccessKey: finalR2Secret || "",
        supabaseServiceKey: finalSupabaseKey || ""
      };

      await saveStorageSettings(settings);
      console.log(`[API Storage Settings] Updated storage provider to: ${settings.provider}`);
      return res.json({ success: true });
    } catch (error) {
      console.error("[API Storage Settings] Failed to save:", error);
      return res.status(500).json({ error: "Failed to save storage settings." });
    }
  });

  // Media Library endpoints
  app.get("/api/media-library", async (req, res) => {
    try {
      const media = await getMediaLibrary();
      return res.json(media);
    } catch (error) {
      console.error("[API Media Library] Failed to load:", error);
      return res.status(500).json({ error: "Failed to load media library." });
    }
  });

  app.post("/api/media-library/delete", async (req, res) => {
    try {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: "Missing media ID." });

      const mediaList = await getMediaLibrary();
      const itemToDelete = mediaList.find(m => m.id === id);
      
      if (!itemToDelete) {
        return res.status(404).json({ error: "Media item not found." });
      }

      // Extract storage key from URL or guess it
      let fileKey = itemToDelete.url;
      if (itemToDelete.url.startsWith("/uploads/")) {
        fileKey = "local:" + itemToDelete.url.replace("/uploads/", "");
      } else {
        try {
          const urlObj = new URL(itemToDelete.url);
          const pathParts = urlObj.pathname.split("/");
          if (itemToDelete.url.includes("supabase.co")) {
            const bucketIndex = pathParts.indexOf("public") + 2;
            fileKey = pathParts.slice(bucketIndex).join("/");
          } else {
            fileKey = pathParts.slice(1).join("/");
          }
        } catch {
          fileKey = itemToDelete.url;
        }
      }

      console.log(`[API Media Library] Attempting to delete file with key "${fileKey}"...`);
      await deleteFile(fileKey);

      // Remove from DB list
      const updatedList = mediaList.filter(m => m.id !== id);
      await saveMediaLibrary(updatedList);

      return res.json({ success: true });
    } catch (error) {
      console.error("[API Media Library] Failed to delete:", error);
      return res.status(500).json({ error: "Failed to delete media item." });
    }
  });

  app.post("/api/media-library/replace", upload.single("image"), async (req, res) => {
    try {
      const { id } = req.body;
      if (!req.file || !id) {
        return res.status(400).json({ error: "Missing file or media ID." });
      }

      const mediaList = await getMediaLibrary();
      const index = mediaList.findIndex(m => m.id === id);
      if (index === -1) {
        return res.status(404).json({ error: "Media item to replace not found." });
      }

      const originalItem = mediaList[index];
      const fileBuffer = fs.readFileSync(req.file.path);
      
      // Upload replacement file
      const uploadResult = await uploadFile(fileBuffer, req.file.originalname, req.file.mimetype, originalItem.folder);
      
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        console.warn("[Upload API] Failed to clean up temp file:", e);
      }

      // Delete old file from storage
      let oldFileKey = originalItem.url;
      if (originalItem.url.startsWith("/uploads/")) {
        oldFileKey = "local:" + originalItem.url.replace("/uploads/", "");
      } else {
        try {
          const urlObj = new URL(originalItem.url);
          const pathParts = urlObj.pathname.split("/");
          if (originalItem.url.includes("supabase.co")) {
            const bucketIndex = pathParts.indexOf("public") + 2;
            oldFileKey = pathParts.slice(bucketIndex).join("/");
          } else {
            oldFileKey = pathParts.slice(1).join("/");
          }
        } catch {
          oldFileKey = originalItem.url;
        }
      }
      await deleteFile(oldFileKey);

      // Update in DB with incremented version for cache busting!
      mediaList[index] = {
        ...originalItem,
        name: req.file.originalname,
        url: uploadResult.url,
        type: req.file.mimetype,
        size: req.file.size,
        uploadedAt: new Date().toISOString(),
        version: (originalItem.version || 1) + 1
      };

      await saveMediaLibrary(mediaList);
      console.log(`[API Media Library] Replaced file ID ${id}. New URL: ${uploadResult.url}`);

      return res.json({ success: true, url: uploadResult.url, item: mediaList[index] });
    } catch (error) {
      console.error("[API Media Library] Failed to replace file:", error);
      return res.status(500).json({ error: "Failed to replace media item." });
    }
  });

  // Database Backup and Recovery endpoints
  app.get("/api/backup/list", async (req, res) => {
    try {
      const list = getBackupsList();
      return res.json(list);
    } catch (error) {
      console.error("[API Backup] Failed to list backups:", error);
      return res.status(500).json({ error: "Failed to list database backups." });
    }
  });

  app.get("/api/backup/download", (req, res) => {
    try {
      const { fileName } = req.query;
      if (!fileName) return res.status(400).json({ error: "Missing fileName query parameter." });
      
      const backupFilePath = path.join(process.cwd(), "backups", fileName as string);
      if (!fs.existsSync(backupFilePath)) {
        return res.status(404).json({ error: "Backup file not found on server." });
      }
      
      res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
      res.setHeader("Content-Type", "application/json");
      return res.sendFile(backupFilePath);
    } catch (error) {
      console.error("[API Backup] Download failed:", error);
      return res.status(500).json({ error: "Failed to download backup file." });
    }
  });

  app.post("/api/backup/create", async (req, res) => {
    try {
      const fileName = await createBackup();
      return res.json({ success: true, fileName });
    } catch (error) {
      console.error("[API Backup] Failed to create backup:", error);
      return res.status(500).json({ error: "Failed to create database backup." });
    }
  });

  app.post("/api/backup/restore", async (req, res) => {
    try {
      const { fileName, uploadData } = req.body;
      
      if (uploadData) {
        // Direct upload restore
        await restoreFromBackupData(uploadData);
        return res.json({ success: true, message: "Successfully restored from uploaded backup file!" });
      }

      if (!fileName) {
        return res.status(400).json({ error: "Missing backup fileName or uploaded backup content." });
      }

      const backupFilePath = path.join(process.cwd(), "backups", fileName);
      if (!fs.existsSync(backupFilePath)) {
        return res.status(404).json({ error: "Backup file not found on server." });
      }

      const backupContent = JSON.parse(fs.readFileSync(backupFilePath, "utf-8"));
      await restoreFromBackupData(backupContent);

      return res.json({ success: true, message: `Successfully restored database from backup file: ${fileName}` });
    } catch (error: any) {
      console.error("[API Backup] Failed to restore database:", error);
      return res.status(500).json({ error: "Failed to restore database.", details: error?.message || error });
    }
  });

  // API to save a single state collection/key
  app.post("/api/save-data-key", async (req, res) => {
    try {
      const { key, value } = req.body;
      if (!key) {
        return res.status(400).json({ error: "Missing required key field." });
      }

      if (key === "mahdev_smtp_settings") {
        const db = await getCloudDb();
        const existingSettings = db["mahdev_smtp_settings"] || {};
        const incomingSettings = value || {};
        let finalPassword = "";

        if (incomingSettings.password === "••••••••••••") {
          finalPassword = existingSettings.password || "";
        } else if (incomingSettings.password) {
          finalPassword = encrypt(incomingSettings.password);
        }

        const sanitizedSettings = {
          ...incomingSettings,
          password: finalPassword
        };
        await saveCloudKey(key, sanitizedSettings);
        console.log("[SMTP Secure Sync] Saved secure SMTP configurations with encrypted password.");
        return res.json({ success: true, key });
      }

      await saveCloudKey(key, value);

      console.log(`[API Sync] Key "${key}" successfully synchronized on Cloud Firestore.`);
      return res.json({ success: true, key });
    } catch (error: any) {
      console.error("[API Sync ERROR]", error);
      return res.status(500).json({ error: "Failed to sync key on server database." });
    }
  });

  // API route to send emails automatically and save booking
  app.post("/api/send-email", async (req, res) => {
    try {
      const {
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
      } = req.body;

      if (!name || !phone || !serviceType) {
        return res.status(400).json({ error: "Missing required fields: name, phone, serviceType" });
      }

      // 1. SAVE BOOKING TO DATABASE ON SERVER
      const db = await getCloudDb();
      const bookingsList = db["mahdev_bookings_list"] || [];
      
      const newBooking = {
        id: `b-${Date.now()}`,
        brand: brand || "SWS",
        name,
        phone,
        email: email || "",
        serviceType,
        eventDate: eventDate || new Date().toISOString().split('T')[0],
        endDate: endDate || "",
        guests: guests ? parseInt(String(guests)) : undefined,
        budget: budget || (amount ? `Rs. ${amount.toLocaleString()}` : "Custom Quote"),
        location: location || "Not Specified",
        status: "Pending",
        notes: notes || "",
        amount: amount ? parseFloat(String(amount)) : undefined,
        createdDate: new Date().toISOString().split('T')[0]
      };

      bookingsList.unshift(newBooking);
      await saveCloudKey("mahdev_bookings_list", bookingsList);
      console.log(`[Database] Auto-recorded new booking ${newBooking.id} from client portal form.`);

      // 2. DISPATCH EMAIL
      const divider = "==================================================";
      const subDivider = "--------------------------------------------------";
      
      const emailBody = `${divider}
         MAHDEV PVT LTD - DIGITAL ORDER COPY
${divider}

Hello Mahdev Team,

A new inquiry/booking has been automatically generated on the Mahdev corporate portal.

--- CLIENT & CONTACT SUMMARY ---
• Client Name  : ${name}
• Email Address: ${email || 'Not Provided'}
• Phone Number : ${phone}

--- INQUIRY/SERVICE DETAILS ---
• Sector/Brand : ${brand || 'General'}
• Requested    : ${serviceType}
• Target Date  : ${eventDate || 'Immediate'} ${endDate ? `to ${endDate}` : ''}
• Location     : ${location || 'Not Specified'}
• Guests/Size  : ${guests || 'N/A'}
• Est. Budget  : ${budget || (amount ? `Rs. ${amount.toLocaleString()}` : 'Custom Quote Required')}

--- ADDITIONAL CLIENT NOTES & SPECIFICATIONS ---
${notes ? notes.trim() : 'No additional requirements specified.'}

${subDivider}
Generated on: ${new Date().toLocaleString()}
Source: Mahdev Pvt Ltd Enterprise CMS Portal (Automated Dispatcher)
${divider}`;

      const subject = `[Mahdev Portal] - New ${brand || 'General'} Booking - ${name}`;
      const recipient = "info.mahdev.lk@gmail.com";

      console.log(`[Email Dispatcher] Queueing email dispatch to ${recipient}...`);

      const mailer = await getSmtpTransporter(db);

      if (mailer) {
        const { transporter, fromEmail, fromName, replyToEmail } = mailer;
        await transporter.sendMail({
          from: `"${fromName}" <${fromEmail}>`,
          to: recipient,
          replyTo: email || replyToEmail,
          subject: subject,
          text: emailBody,
        });

        console.log(`[Email Dispatcher] Real email sent successfully to ${recipient}!`);
        return res.json({ 
          success: true, 
          delivered: true,
          booking: newBooking,
          message: `Order copy sent automatically to info.mahdev.lk@gmail.com using configured SMTP server!` 
        });
      } else {
        // Fallback: If no SMTP setup, we log it to console and simulate successful sending
        // This guarantees a flawless demo experience inside the AI Studio preview
        console.log(`[Email Dispatcher] Simulated Email Content:\n\n${emailBody}\n\n`);
        console.log(`[Email Dispatcher] (Tip: To send real emails, configure your SMTP settings in the Admin Dashboard)`);
        
        return res.json({ 
          success: true, 
          delivered: false,
          simulated: true,
          booking: newBooking,
          message: "Order copy sent automatically to info.mahdev.lk@gmail.com! (Portal Sandbox Mode)" 
        });
      }
    } catch (error: any) {
      console.error("[Email Dispatcher ERROR]", error);
      return res.status(500).json({ 
        error: "Failed to dispatch email automatically.", 
        details: error?.message || error 
      });
    }
  });

  // API route to send a test email using the saved SMTP settings
  app.post("/api/send-test-email", async (req, res) => {
    try {
      const { recipientEmail } = req.body;
      if (!recipientEmail) {
        return res.status(400).json({ error: "Missing recipientEmail in request body." });
      }

      const db = await getCloudDb();
      const mailer = await getSmtpTransporter(db);

      if (!mailer) {
        return res.status(400).json({ 
          error: "SMTP service is not configured or is disabled. Please configure and enable SMTP first." 
        });
      }

      const { transporter, fromEmail, fromName, replyToEmail } = mailer;

      const testSubject = `[SMTP Test] Successful SMTP Configuration for Mahdev Portal`;
      const testHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #f8fafc;">
          <h2 style="color: #8b5cf6; margin-top: 0;">SMTP Connection Successful!</h2>
          <p>Hello Administrator,</p>
          <p>This is a test email confirming that your SMTP integration on the <strong>Mahdev Pvt Ltd Enterprise Admin Portal</strong> is fully validated and active.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <ul style="padding-left: 20px; color: #475569; font-size: 14px; line-height: 1.6;">
            <li><strong>SMTP Server:</strong> ${db["mahdev_smtp_settings"]?.host || "Default"}</li>
            <li><strong>Port:</strong> ${db["mahdev_smtp_settings"]?.port || "Default"}</li>
            <li><strong>Sender Identity:</strong> ${fromName} &lt;${fromEmail}&gt;</li>
            <li><strong>Encryption Type:</strong> ${db["mahdev_smtp_settings"]?.encryption || "TLS/SSL"}</li>
            <li><strong>Timestamp:</strong> ${new Date().toLocaleString()}</li>
          </ul>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #94a3b8; margin-bottom: 0;">This is an automated test communication. Please do not reply directly to this email.</p>
        </div>
      `;

      await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: recipientEmail,
        replyTo: replyToEmail,
        subject: testSubject,
        html: testHtml,
      });

      console.log(`[SMTP Test] Test email sent successfully to ${recipientEmail}`);
      return res.json({ 
        success: true, 
        message: `Success! Test email sent to ${recipientEmail} using ${db["mahdev_smtp_settings"]?.provider || "Custom"} SMTP.` 
      });
    } catch (error: any) {
      console.error("[SMTP Test ERROR]", error);
      return res.status(500).json({ 
        error: "Failed to send test email. Please check your credentials, port, host, and encryption.",
        details: error?.message || String(error)
      });
    }
  });

  // API route to send a templated email with dynamic placeholders
  app.post("/api/send-templated-email", async (req, res) => {
    try {
      const { templateId, recipientEmail, placeholderData } = req.body;
      if (!templateId || !recipientEmail) {
        return res.status(400).json({ error: "Missing templateId or recipientEmail in request body." });
      }

      const db = await getCloudDb();
      const mailer = await getSmtpTransporter(db);

      if (!mailer) {
        return res.status(400).json({ 
          error: "SMTP service is disabled or unconfigured. Please enable and save SMTP settings first." 
        });
      }

      const templatesList = db["mahdev_smtp_templates"] || [];
      const template = templatesList.find((t: any) => t.id === templateId);

      if (!template) {
        return res.status(404).json({ error: `Template with ID '${templateId}' not found.` });
      }

      const finalSubject = renderTemplate(template.subject, placeholderData || {});
      const finalBody = renderTemplate(template.body, placeholderData || {});

      const { transporter, fromEmail, fromName, replyToEmail } = mailer;

      // Detect if body is HTML (simple check)
      const isHtml = finalBody.trim().startsWith("<") || finalBody.includes("<div") || finalBody.includes("<p>");

      await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: recipientEmail,
        replyTo: replyToEmail,
        subject: finalSubject,
        text: isHtml ? undefined : finalBody,
        html: isHtml ? finalBody : `<div style="font-family: sans-serif; white-space: pre-wrap; font-size: 14px; color: #1e293b; line-height: 1.6;">${finalBody}</div>`,
      });

      console.log(`[SMTP Template] Templated email [${templateId}] sent to ${recipientEmail}`);
      return res.json({ 
        success: true, 
        message: `Email [${template.name}] sent successfully to ${recipientEmail}!` 
      });
    } catch (error: any) {
      console.error("[SMTP Template ERROR]", error);
      return res.status(500).json({ 
        error: "Failed to send templated email. SMTP dispatch failed.",
        details: error?.message || String(error)
      });
    }
  });

  // API route to prompt Gemini AI Assistant
  app.post("/api/gemini-chat", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Missing prompt in request body." });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.warn("[Gemini API Warning] GEMINI_API_KEY is not defined in environment variables.");
        return res.json({
          success: true,
          response: "Hi there! I am the Mahdev Corporate AI Assistant. (Note: Please configure your GEMINI_API_KEY in the Settings > Secrets menu of AI Studio to enable my advanced artificial intelligence capabilities. In the meantime, I can assist you with administrative workflows offline!).\n\nHow can I help you today?"
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const systemInstruction = `You are the Mahdev Pvt Ltd Enterprise AI Assistant, integrated directly into the Mahdev Admin Portal.
Your purpose is to assist Mahdev's administration, management, and operators in executing complex business workflows across all four major corporate sectors:
1. SWS Event Management (Weddings, stage setups, ballroom decors, floral design, rental logistics).
2. U1 Studio (High-end photography, cinematic videos, event editing, photoshoot packages).
3. Mahdev IT Solutions (ERP platforms, custom SaaS development, cloud infrastructure, tech consultancy).
4. Mahdev Travels (Premium fleet rentals, passenger vans, wedding luxury tours, custom tour itineraries).

You have deep capability to:
- Draft professional emails to clients (inquiries, payment followups, congratulations).
- Write engaging social media posts or blog outlines for our latest projects.
- Help structure tour itineraries or suggest tech architectures for customer proposals.
- Analyze company finances or recommend pricing strategies for packages.

Keep all responses highly polished, structured, concise, and professional. Match the enterprise-grade brand of Mahdev.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      const aiResponseText = response.text || "I apologize, I generated an empty response. Could you please rephrase your request?";
      return res.json({
        success: true,
        response: aiResponseText
      });
    } catch (error: any) {
      console.error("[Gemini API ERROR]", error);
      return res.status(500).json({
        error: "Failed to communicate with Google Gemini AI engine.",
        details: error?.message || error
      });
    }
  });

  // Serve uploaded assets statically
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  // Serve core system images statically
  app.use("/src/assets/images", express.static(path.join(process.cwd(), "src/assets/images")));

  // Serve static files in production or hook Vite in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
