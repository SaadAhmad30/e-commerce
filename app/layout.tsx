import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "LuxeStore — Premium E-Commerce",
    template: "%s | LuxeStore",
  },
  description:
    "Shop the finest collection of curated products. Premium quality, modern design.",
  keywords: ["e-commerce", "shopping", "luxury", "products"],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: "LuxeStore",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-white antialiased">
        <Providers>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3000,
              style: {
                borderRadius: "12px",
                background: "#111827",
                color: "#fff",
                fontSize: "14px",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
