/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface EmailData {
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
}

export function formatEmailBody(data: EmailData): string {
  const divider = "==================================================";
  const subDivider = "--------------------------------------------------";
  
  return `${divider}
         MAHDEV PVT LTD - DIGITAL ORDER COPY
${divider}

Hello Mahdev Team,

A new inquiry/booking has been generated on the Mahdev corporate portal. Please review the details below to initiate processing.

--- CLIENT & CONTACT SUMMARY ---
• Client Name  : ${data.name}
• Email Address: ${data.email || 'Not Provided'}
• Phone Number : ${data.phone}

--- INQUIRY/SERVICE DETAILS ---
• Sector/Brand : ${data.brand || 'General'}
• Requested    : ${data.serviceType}
• Target Date  : ${data.eventDate || 'Immediate'} ${data.endDate ? `to ${data.endDate}` : ''}
• Location     : ${data.location || 'Not Specified'}
• Guests/Size  : ${data.guests || 'N/A'}
• Est. Budget  : ${data.budget || (data.amount ? `Rs. ${data.amount.toLocaleString()}` : 'Custom Quote Required')}

--- ADDITIONAL CLIENT NOTES & SPECIFICATIONS ---
${data.notes ? data.notes.trim() : 'No additional requirements specified.'}

${subDivider}
Generated on: ${new Date().toLocaleString()}
Source: Mahdev Pvt Ltd Enterprise CMS Portal
${divider}`;
}

export function generateMailtoUri(data: EmailData): string {
  const recipient = "info.mahdev.lk@gmail.com";
  const subject = `[Mahdev Portal] - New ${data.brand || 'General'} Booking - ${data.name}`;
  const body = formatEmailBody(data);
  
  return `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export async function sendEmailAutomatically(data: EmailData): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error("sendEmailAutomatically failed:", error);
    return {
      success: false,
      message: error?.message || "Failed to deliver automated email copy."
    };
  }
}

