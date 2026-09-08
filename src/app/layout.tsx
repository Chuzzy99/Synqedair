import type { Metadata } from "next";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/600.css";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-sans/600.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Synqed Air — fair fares, real corridors",
  description:
    "Synqed Air finds and books flights on the routes diaspora travelers actually fly, with every fee shown before you pay.",
};

import FloatingSupportChat from "@/components/FloatingSupportChat";

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
