import nodemailer from "nodemailer";
import { decrypt } from "./server-crypto";

export interface SmtpSettings {
  provider: "gmail" | "brevo" | "mailjet" | "zoho" | "custom";
  host: string;
  port: number;
  username: string;
  password?: string;
  encryption: "TLS" | "SSL" | "STARTTLS";
  fromEmail: string;
  fromName: string;
  replyToEmail: string;
  enabled: boolean;
}

export interface SmtpTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

export async function getSmtpTransporter(db: any) {
  const smtpSettings = db["mahdev_smtp_settings"] as SmtpSettings | undefined;

  if (smtpSettings && smtpSettings.enabled) {
    const host = smtpSettings.host;
    const port = Number(smtpSettings.port || 587);
    const username = smtpSettings.username;
    const encryptedPassword = smtpSettings.password || "";
    // Decrypt password
    const password = decrypt(encryptedPassword);
    const encryption = smtpSettings.encryption;

    const secure = port === 465 || encryption === "SSL";

    console.log(`[SMTP] Dynamic database mailer configured: ${host}:${port} with user ${username}`);

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user: username,
        pass: password,
      },
      // Ensure STARTTLS/TLS options are aligned
      requireTLS: encryption === "TLS" || encryption === "STARTTLS",
      tls: {
        rejectUnauthorized: false, // bypass SSL issues in development / testing environments
      },
    });

    return {
      transporter,
      fromEmail: smtpSettings.fromEmail || username,
      fromName: smtpSettings.fromName || "Mahdev Pvt Ltd",
      replyToEmail: smtpSettings.replyToEmail || username,
    };
  }

  // Fallback to system env
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = parseInt(process.env.SMTP_PORT || "587");

  if (smtpUser && smtpPass) {
    console.log(`[SMTP] System env fallback mailer configured: ${smtpHost}:${smtpPort}`);
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    return {
      transporter,
      fromEmail: smtpUser,
      fromName: "Mahdev Corporate Portal",
      replyToEmail: smtpUser,
    };
  }

  return null;
}

export function renderTemplate(
  text: string,
  data: {
    customerName?: string;
    invoiceNumber?: string;
    quotationNumber?: string;
    paymentAmount?: string | number;
    remainingBalance?: string | number;
    companyName?: string;
    projectName?: string;
    currentDate?: string;
  }
) {
  if (!text) return "";
  let result = text;
  
  const mapping = [
    { keys: ["Customer Name", "customer_name", "customerName", "CUSTOMER_NAME"], value: data.customerName || "Customer" },
    { keys: ["Invoice Number", "invoice_number", "invoiceNumber", "INVOICE_NUMBER"], value: data.invoiceNumber || "N/A" },
    { keys: ["Quotation Number", "quotation_number", "quotationNumber", "QUOTATION_NUMBER"], value: data.quotationNumber || "N/A" },
    { keys: ["Payment Amount", "payment_amount", "paymentAmount", "PAYMENT_AMOUNT"], value: data.paymentAmount !== undefined ? String(data.paymentAmount) : "0.00" },
    { keys: ["Remaining Balance", "remaining_balance", "remainingBalance", "REMAINING_BALANCE"], value: data.remainingBalance !== undefined ? String(data.remainingBalance) : "0.00" },
    { keys: ["Company Name", "company_name", "companyName", "COMPANY_NAME"], value: data.companyName || "Mahdev Pvt Ltd" },
    { keys: ["Project Name", "project_name", "projectName", "PROJECT_NAME"], value: data.projectName || "General Project" },
    { keys: ["Current Date", "current_date", "currentDate", "CURRENT_DATE"], value: data.currentDate || new Date().toLocaleDateString() },
  ];

  for (const item of mapping) {
    for (const key of item.keys) {
      const escapedKey = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
      const regex = new RegExp(`\\{\\{\\s*${escapedKey}\\s*\\}\\}`, "gi");
      result = result.replace(regex, item.value);
    }
  }
  return result;
}
