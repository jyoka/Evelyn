import type { Metadata, Viewport } from "next";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Evelyn — AI Intelligence Dashboard",
  description:
    "Your personal AI agent & trends newsletter. Stay on top of the AI landscape with AI-powered insights.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Evelyn",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#6366f1",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="flex min-h-screen">
          <div className="hidden md:block">
            <Sidebar />
          </div>
          <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
            {children}
          </main>
        </div>
        <MobileNav />
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
