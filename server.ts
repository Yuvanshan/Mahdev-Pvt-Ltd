/**
 * Mahdev Enterprise Vercel-Compatible Express Server Engine
 * Supported on both Vercel Serverless Functions and Local Development
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import fs from "fs";
import multer from "multer";
import { getCloudDb, saveCloudKey } from "./server-db";
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

// Optional: Import sharp for image optimization
let sharp: any = null;
try {
  sharp = require("sharp");
  console.log("[Server] Sharp library loaded for image optimization");
} catch (e) {
  console.warn("[Server] Sharp not available - images will be uploaded without compression");
}

dotenv.config();

// Configure multer storage with /tmp fallback for serverless
const uploadDir = fs.existsSync(path.join(process.cwd(), "uploads"))
  ? path.join(process.cwd(), "uploads")
  : "/tmp";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    } catch {
      cb(null, "/tmp");
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "image-" + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 12 * 1024 * 1024, // 12MB limit
  },
});

/**
 * Compress image using Sharp if available
 */
async function compressImageForUpload(
  buffer: Buffer,
  mimeType: string,
  originalSize: number
): Promise<{ buffer: Buffer; metrics: any }> {
  if (!sharp) {
    const safeBuffer = Buffer.from(buffer as unknown as Uint8Array);
    return { buffer: safeBuffer, metrics: { originalSize, skipped: true } };
  }

  try {
    const originalSizeKB = (originalSize / 1024).toFixed(2);
    let pipeline = sharp(buffer);

    const isWebP = mimeType.includes("webp");
    const isPNG = mimeType.includes("png");

    const metadata = await pipeline.metadata();
    const { width = 1200, height = 800 } = metadata;

    if (width > 2400 || height > 2400) {
      pipeline = pipeline.resize(2400, 2400, { fit: "inside", withoutEnlargement: true });
    }

    if (isWebP) {
      pipeline = pipeline.webp({ quality: 80, alphaQuality: 100 });
    } else if (isPNG) {
      pipeline = pipeline.png({ compressionLevel: 9 });
    } else {
      pipeline = pipeline.jpeg({ quality: 85, progressive: true });
    }

    const compressedBuffer = Buffer.from(await pipeline.toBuffer());
    const compressedSizeKB = (compressedBuffer.byteLength / 1024).toFixed(2);
    const savingsPercent = (
      ((originalSize - compressedBuffer.byteLength) / originalSize) * 100
    ).toFixed(1);

    console.log(
      `[Image Compression] ${originalSizeKB}KB → ${compressedSizeKB}KB (${savingsPercent}% reduction)`
    );

    return {
      buffer: compressedBuffer,
      metrics: {
        originalSize: originalSize,
        compressedSize: compressedBuffer.byteLength,
        savingsPercent: parseFloat(savingsPercent),
        format: isWebP ? "webp" : isPNG ? "png" : "jpeg",
        dimensions: { width, height }
      }
    };
  } catch (error) {
    console.warn("[Image Compression] Error during compression, uploading original:", error);
    return { buffer, metrics: { error: String(error), originalSize } };
  }
}

const app = express();

// Enable JSON body parsing
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

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

// API to handle file and image uploads
app.post("/api/upload", upload.single("image"), async (req, res) => {
  const requestId = `up_${Date.now()}_${Math.round(Math.random() * 1e6)}`;
  const cleanupTemp = () => {
    try {
      if (req.file?.path) fs.unlinkSync(req.file.path);
    } catch (e) {
      console.warn(`[Upload API ${requestId}] Temp file cleanup skipped:`, e);
    }
  };

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { code: "NO_FILE", message: "No file was uploaded." }
      });
    }

    const allowed = [
      "image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "image/svg+xml", "image/bmp", "image/x-icon", "image/vnd.microsoft.icon", "image/tiff",
      "application/pdf",
      "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "text/plain", "text/csv",
      "application/zip", "application/x-zip-compressed", "application/x-tar", "application/gzip"
    ]; 
    if (req.file.mimetype && !allowed.includes(req.file.mimetype)) {
      cleanupTemp();
      return res.status(415).json({
        success: false,
        error: { code: "INVALID_MIME", message: "Unsupported file type.", details: { mimetype: req.file.mimetype } }
      });
    }

    const MAX_BYTES = 10 * 1024 * 1024;
    if (req.file.size > MAX_BYTES) {
      cleanupTemp();
      return res.status(413).json({
        success: false,
        error: { code: "FILE_TOO_LARGE", message: "File is too large.", details: { maxBytes: MAX_BYTES } }
      });
    }

    console.log(`[Upload API ${requestId}] Processing file: ${req.file.originalname} (${req.file.size} bytes)`);
    let fileBuffer = fs.readFileSync(req.file.path);
    let compressionMetrics: any = { skipped: true };

    if (sharp && req.file.mimetype && req.file.mimetype.startsWith("image/")) {
      const compressionResult = await compressImageForUpload(
        fileBuffer,
        req.file.mimetype,
        req.file.size
      );
      fileBuffer = Buffer.from(compressionResult.buffer);
      compressionMetrics = compressionResult.metrics;
    }

    const folder = req.body.folder || "general";

    const uploadResult = await uploadFile(
      fileBuffer,
      req.file.originalname,
      req.file.mimetype,
      folder
    );

    cleanupTemp();

    const mediaList = await getMediaLibrary();
    const mediaId = `m-${Date.now()}`;

    const newMediaItem: MediaItem = {
      id: mediaId,
      name: req.file.originalname,
      url: uploadResult.url,
      type: req.file.mimetype,
      size: fileBuffer.byteLength,
      folder,
      uploadedAt: new Date().toISOString(),
      version: 1
    };

    mediaList.unshift(newMediaItem);
    await saveMediaLibrary(mediaList);

    console.log(`[Upload API ${requestId}] Success: ${uploadResult.url}`);
    return res.json({
      success: true,
      url: uploadResult.url,
      id: mediaId,
      name: req.file.originalname,
      key: uploadResult.key,
      compression: compressionMetrics
    });
  } catch (error: any) {
    console.error(`[Upload API ERROR] ${requestId}`, error);
    return res.status(500).json({
      success: false,
      error: {
        code: "UPLOAD_FAILED",
        message: "Failed to process image upload on the server.",
        details: error?.message || String(error)
      }
    });
  } finally {
    cleanupTemp();
  }
});

// Storage settings endpoints
app.get("/api/storage/settings", async (req, res) => {
  try {
    const settings = await getStorageSettings();
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

    let fileKey = itemToDelete.url;
    if (itemToDelete.url.startsWith("/uploads/")) {
      fileKey = "local:" + itemToDelete.url.replace("/uploads/", "");
    }

    await deleteFile(fileKey);

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
    let fileBuffer = fs.readFileSync(req.file.path);
    let compressionMetrics: any = { skipped: true };
    
    if (sharp) {
      const compressionResult = await compressImageForUpload(
        fileBuffer,
        req.file.mimetype,
        req.file.size
      );
      fileBuffer = Buffer.from(compressionResult.buffer);
      compressionMetrics = compressionResult.metrics;
    }
    
    const uploadResult = await uploadFile(fileBuffer, req.file.originalname, req.file.mimetype, originalItem.folder);
    
    try {
      fs.unlinkSync(req.file.path);
    } catch (e) {
      console.warn("[Upload API] Failed to clean up temp file:", e);
    }

    mediaList[index] = {
      ...originalItem,
      name: req.file.originalname,
      url: uploadResult.url,
      type: req.file.mimetype,
      size: fileBuffer.byteLength,
      uploadedAt: new Date().toISOString(),
      version: (originalItem.version || 1) + 1
    };

    await saveMediaLibrary(mediaList);
    return res.json({ 
      success: true, 
      url: uploadResult.url, 
      item: mediaList[index],
      compression: compressionMetrics
    });
  } catch (error) {
    console.error("[API Media Library] Failed to replace file:", error);
    return res.status(500).json({ error: "Failed to replace media item." });
  }
});

// Database Backup & Recovery endpoints
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

// API to save state collections/keys
app.post("/api/save-data-key", async (req, res) => {
  try {
    async function handleSaveKey(k: string, val: any) {
      if (k === "mahdev_smtp_settings") {
        const db = await getCloudDb();
        const existingSettings = db["mahdev_smtp_settings"] || {};
        const incomingSettings = val || {};
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
        await saveCloudKey(k, sanitizedSettings);
      } else {
        await saveCloudKey(k, val);
      }

      if (k === "mahdev_theme_settings" || k === "mahdev_company_contact") {
        try {
          const dbState = await getCloudDb();
          const theme = dbState["mahdev_theme_settings"] || {};
          const contact = dbState["mahdev_company_contact"] || {};
          
          const imageStateVal = {
            version: (dbState["mahdev_image_state_v1"]?.version || 0) + 1,
            updatedAt: new Date().toISOString(),
            website: {
              brandLogo: contact.logo || theme.brandLogo || "",
              decorationBanner: theme.decorationBanner || "",
              photographyBanner: theme.photographyBanner || "",
              itBanner: theme.itBanner || "",
              travelsBanner: theme.travelsBanner || "",
              weddingDecorationBanner: theme.weddingDecorationBanner || ""
            }
          };
          
          await saveCloudKey("mahdev_image_state_v1", imageStateVal);
        } catch (err) {
          console.error("[Image Sync ERROR] Failed to update mahdev_image_state_v1:", err);
        }
      }
    }

    if (req.body && req.body.key) {
      const { key, value } = req.body;
      await handleSaveKey(key, value);
      return res.json({ success: true, key });
    } else if (req.body && typeof req.body === "object") {
      const savedKeys: string[] = [];
      for (const [k, val] of Object.entries(req.body)) {
        await handleSaveKey(k, val);
        savedKeys.push(k);
      }
      return res.json({ success: true, keys: savedKeys });
    } else {
      return res.status(400).json({ error: "Missing required key field or invalid body." });
    }
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

      return res.json({ 
        success: true, 
        delivered: true,
        booking: newBooking,
        message: `Order copy sent automatically to info.mahdev.lk@gmail.com using configured SMTP server!` 
      });
    } else {
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

// API route to send test email
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
        error: "SMTP service is not configured or is disabled." 
      });
    }

    const { transporter, fromEmail, fromName, replyToEmail } = mailer;

    const testSubject = `[SMTP Test] Successful SMTP Configuration for Mahdev Portal`;
    const testHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #f8fafc;">
        <h2 style="color: #8b5cf6; margin-top: 0;">SMTP Connection Successful!</h2>
        <p>Hello Administrator,</p>
        <p>This is a test email confirming that your SMTP integration on the <strong>Mahdev Pvt Ltd Enterprise Admin Portal</strong> is fully validated and active.</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: recipientEmail,
      replyTo: replyToEmail,
      subject: testSubject,
      html: testHtml,
    });

    return res.json({ 
      success: true, 
      message: `Success! Test email sent to ${recipientEmail}!` 
    });
  } catch (error: any) {
    console.error("[SMTP Test ERROR]", error);
    return res.status(500).json({ 
      error: "Failed to send test email.",
      details: error?.message || String(error)
    });
  }
});

// API route to send templated email
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
        error: "SMTP service is disabled or unconfigured." 
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
    const isHtml = finalBody.trim().startsWith("<") || finalBody.includes("<div") || finalBody.includes("<p>");

    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: recipientEmail,
      replyTo: replyToEmail,
      subject: finalSubject,
      text: isHtml ? undefined : finalBody,
      html: isHtml ? finalBody : `<div style="font-family: sans-serif; white-space: pre-wrap; font-size: 14px; color: #1e293b; line-height: 1.6;">${finalBody}</div>`,
    });

    return res.json({ 
      success: true, 
      message: `Email [${template.name}] sent successfully to ${recipientEmail}!` 
    });
  } catch (error: any) {
    console.error("[SMTP Template ERROR]", error);
    return res.status(500).json({ 
      error: "Failed to send templated email.",
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
      return res.json({
        success: true,
        response: "Hi there! I am the Mahdev Corporate AI Assistant. (Note: Please configure your GEMINI_API_KEY environment variable to enable advanced AI generation)."
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

    const systemInstruction = `You are the Mahdev Pvt Ltd Enterprise AI Assistant.
Your purpose is to assist Mahdev's administration across SWS Event Management, U1 Studio, Mahdev IT Solutions, and Mahdev Travels.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    return res.json({
      success: true,
      response: response.text || "No output generated."
    });
  } catch (error: any) {
    console.error("[Gemini API ERROR]", error);
    return res.status(500).json({
      error: "Failed to communicate with Google Gemini AI engine.",
      details: error?.message || error
    });
  }
});

// Serve static assets when running locally or static paths
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/src/assets/images", express.static(path.join(process.cwd(), "src/assets/images")));

// Development listener helper function
export async function startDevServer() {
  if (process.env.NODE_ENV !== "production") {
    const [{ default: reactPlugin }, { default: tailwindcss }] = await Promise.all([
      import('@vitejs/plugin-react'),
      import('@tailwindcss/vite')
    ]);

    const vite = await createViteServer({
      root: process.cwd(),
      configFile: false,
      plugins: [
        reactPlugin(),
        tailwindcss()
      ],
      resolve: {
        alias: {
          '@': path.resolve(process.cwd(), '.'),
        },
      },
      server: { middlewareMode: true, hmr: { overlay: false } },
      appType: "spa",
    });

    app.get('/admin', async (req, res, next) => {
      try {
        const indexHtml = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        const transformed = await vite.transformIndexHtml(req.originalUrl, indexHtml);
        return res.status(200).set({ 'Content-Type': 'text/html' }).send(transformed);
      } catch (err) {
        next(err);
      }
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  const PORT = Number(process.env.PORT) || 3000;
  const HOST = process.env.HOST || "0.0.0.0";

  app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
  });
}

// Automatically start local server if file is executed directly with tsx/node
if (process.env.VERCEL !== "1" && !process.env.VERCEL_ENV) {
  // Only start listening if not running under Vercel serverless environment
  startDevServer().catch((err) => console.error("[Dev Server Error]", err));
}

export default app;
