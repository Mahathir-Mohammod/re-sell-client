import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/providers/AuthProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { CartProvider } from "@/providers/CartProvider";
import { RecentlyViewedProvider } from "@/providers/RecentlyViewedProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/Toaster";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "ReSell Hub — buy and sell second-hand",
    template: "%s · ReSell Hub",
  },
  description:
    "Buy and sell second-hand electronics, furniture, vehicles and more. Better prices, less waste.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <CartProvider>
                <RecentlyViewedProvider>
                  <Navbar />
                  <main className="flex-1">{children}</main>
                  <Toaster />
                </RecentlyViewedProvider>
              </CartProvider>
              <Footer />
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}