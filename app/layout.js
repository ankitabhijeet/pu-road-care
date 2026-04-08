import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#08080f",
};

export const metadata = {
  title: "PU Road Care",
  description: "Offline pothole data collection tool for 3D reconstruction using MASt3R",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PU Road Care",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className="min-h-dvh flex flex-col bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
