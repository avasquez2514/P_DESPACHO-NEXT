import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../styles/tema.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Despacho B2B - Gestión Plantillas",
  description: "Sistema de notas y plantillas despacho B2B",
  themeColor: "#1e88e5", // Añadido para el soporte de PWA
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icon-192x192.png" />
        <meta name="theme-color" content="#1e88e5" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className={`
          ${geistSans.variable} ${geistMono.variable}
          antialiased
          bg-[#f3f4f6]
          min-h-screen
        `}
      >
        {children}
        <div id="modal-root" />
      </body>
    </html>
  );
}

