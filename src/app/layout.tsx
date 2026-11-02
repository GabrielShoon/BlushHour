import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Instrument_Serif } from "next/font/google";
import { AppStateProvider } from "@/components/app-state";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Toaster } from "@/components/toaster";
import "leaflet/dist/leaflet.css";
import "./globals.css";

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});
const sans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-sans-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "BlushHour: plan dates your way in Singapore",
    template: "%s · BlushHour",
  },
  description:
    "Discover Singapore date ideas, hidden gems and restaurants, then mix them into a date that's yours. Build, rearrange, map and cost your itinerary.",
  // Lives in /public: Next's app/icon loader breaks on paths containing an apostrophe.
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f0e8" },
    { media: "(prefers-color-scheme: dark)", color: "#14100f" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-SG" className={`${serif.variable} ${sans.variable}`}>
      <body className="min-h-dvh flex flex-col">
        <AppStateProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-surface focus:px-4 focus:py-2 focus:shadow-lift"
          >
            Skip to content
          </a>
          <SiteHeader />
          <main id="main" className="flex-1 pb-24 md:pb-0">
            {children}
          </main>
          <SiteFooter />
          <Toaster />
        </AppStateProvider>
      </body>
    </html>
  );
}
