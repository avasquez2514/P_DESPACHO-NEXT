// app/layout.tsx
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
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
