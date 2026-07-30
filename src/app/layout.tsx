import type { Metadata } from "next";
import "./globals.css";
import LenisProvider from "@/components/LenisProvider";

export const metadata: Metadata = {
  title: {
    default: "Mahdev Pvt Ltd | Premium Enterprise Solutions & Services",
    template: "%s | Mahdev Pvt Ltd"
  },
  description: "Mahdev Pvt Ltd is a premier international technology and service conglomerate. We offer enterprise ERP systems, custom IT solutions, Studio U1 cinematography, SWS event management, and luxury travels.",
  keywords: [
    "Mahdev", "Mahdev ERP", "SWS Event Management", "Studio U1", "Mahdev Travels", 
    "IT Solutions Colombo", "Software Development Sri Lanka", "Wedding Decoration Sri Lanka", 
    "Luxury Car Rental Colombo", "POS Systems Colombo"
  ],
  authors: [{ name: "Mahdev Pvt Ltd Team" }],
  openGraph: {
    title: "Mahdev Pvt Ltd | Enterprise Solutions & Luxury Services",
    description: "Discover Mahdev's elite services across Enterprise ERP development, custom software engineering, premium event management, cinematography, and travels.",
    url: "https://mahdev.lk",
    siteName: "Mahdev Pvt Ltd",
    images: [
      {
        url: "/images/wedding_decoration_1782729925686.jpg",
        width: 1200,
        height: 630,
        alt: "Mahdev Pvt Ltd Elite Suites"
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mahdev Pvt Ltd | Premium Enterprise & Luxury Suite",
    description: "Discover Mahdev's premium services: ERP systems, IT solutions, SWS events, Studio U1, and Travels.",
    images: ["/images/wedding_decoration_1782729925686.jpg"],
  },
  metadataBase: new URL("https://mahdev.lk"),
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-navy-dark text-gray-200">
        <LenisProvider>
          {children}
        </LenisProvider>
      </body>
    </html>
  );
}
