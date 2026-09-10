import type { Metadata } from "next";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/600.css";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-sans/600.css";
import "./globals.css";

import FloatingSupportChat from "@/components/FloatingSupportChat";

export const metadata: Metadata = {
  title: {
    default: "Synqed Air — Transparent Flight Booking for the Diaspora",
    template: "%s | Synqed Air",
  },
  description:
    "Synqed Air books flights on Africa's diaspora corridors — Lagos to London, Nairobi, New York and more — with every fee shown before you pay. No hidden charges. Real human support on WhatsApp.",
  keywords: [
    "diaspora flights",
    "Lagos London flights",
    "Lagos Nairobi flights",
    "Africa diaspora travel",
    "transparent flight booking",
    "no hidden fees flights",
    "Nigeria flights",
    "WhatsApp flight support",
    "Synqed Air",
  ],
  authors: [{ name: "Synqed Air" }],
  creator: "Synqed Air",
  publisher: "Synqed Air",
  metadataBase: new URL("https://synqedair.com"),
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://synqedair.com",
    siteName: "Synqed Air",
    title: "Synqed Air — Transparent Flight Booking for the Diaspora",
    description:
      "Book flights on Africa's diaspora corridors. Full price shown upfront — no checkout surprises. Real human support on WhatsApp in under 2 minutes.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Synqed Air — Built for the diaspora corridor",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Synqed Air — Transparent Flight Booking for the Diaspora",
    description:
      "Book flights on Africa's diaspora corridors. Full price, every fee shown, WhatsApp support in 2 minutes.",
    images: ["/og-image.png"],
    creator: "@synqedair",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <FloatingSupportChat />
      </body>
    </html>
  );
}
