import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { AppStateProvider } from "@/components/app-state";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Toaster } from "@/components/toaster";
import "leaflet/dist/leaflet.css";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["SOFT", "opsz"],
  display: "swap",
});
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
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
    { media: "(prefers-color-scheme: light)", color: "#fff8f3" },
    { media: "(prefers-color-scheme: dark)", color: "#170d14" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-SG" className={`${fraunces.variable} ${jakarta.variable}`}>
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
