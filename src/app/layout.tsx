import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/portfolio/theme-provider";
import { I18nProvider } from "@/components/portfolio/i18n-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://deividtech.cloud"),
  title: "Deivid Tech — Portfolio & Productos en producción",
  description:
    "Portfolio de David Garay. Sistemas en producción: DESPEGA! stickers, Redline gestión logística, FactuSheet facturas con IA.",
  keywords: [
    "Deivid Tech",
    "portfolio",
    "DESPEGA",
    "PeelMe",
    "Redline",
    "FactuSheet",
    "IA",
    "ciberseguridad",
    "Python",
  ],
  authors: [{ name: "David Garay" }],
  icons: {
    icon: "/favicon.png",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <I18nProvider>
            <div className="flex min-h-screen flex-col">
              {children}
            </div>
            <Toaster />
            <SonnerToaster position="bottom-right" richColors closeButton />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
