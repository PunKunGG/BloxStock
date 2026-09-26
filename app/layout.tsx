import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { isDemoData } from "@/lib/providers/data-provider";
import "./globals.css";

const inter = localFont({
  src: [
    {
      path: "../public/fonts/inter-regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/inter-semibold.ttf",
      weight: "600",
      style: "normal",
    },
    { path: "../public/fonts/inter-bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "BloxStock — What's in stock right now?",
    template: "%s | BloxStock",
  },
  description:
    "Track Blox Fruits dealer stock, browse fruits, and check previous stock rotations. An independent Blox Fruits stock tracker.",
  applicationName: "BloxStock",
};
export const viewport: Viewport = {
  themeColor: "#0c1019",
  colorScheme: "dark",
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <SiteHeader isDemo={isDemoData()} />
        <main
          id="main-content"
          className="container-shell main-content"
          tabIndex={-1}
        >
          {children}
        </main>
        <SiteFooter isDemo={isDemoData()} />
      </body>
    </html>
  );
}
