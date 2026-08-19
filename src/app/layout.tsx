import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Manrope, Fraunces } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import SideCart from "@/components/SideCart";

// Aplica la clase `dark` en <html> ANTES de que React pinte la página,
// leyendo la preferencia guardada por ThemeToggle.tsx (o, si el usuario
// nunca la cambió, el modo oscuro/claro del sistema operativo). Sin esto
// habría un parpadeo de claro a oscuro apenas carga la página.
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("panama-luxestone-theme");
    var isDark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", isDark);
  } catch (e) {}
})();
`;

// Tipografía: Manrope (sans, texto general/UI) + Fraunces (serif
// editorial, solo para titulares) — pareja pensada para transmitir el
// mismo tipo de minimalismo elegante que guía el look de italgres.net,
// adaptado a la identidad de piedra natural de Panamá LuxeStone.
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Panamá LuxeStone — Piedra Sinterizada, Mármol y Granito en Panamá",
  description:
    "Distribuidor de piedra sinterizada, mármol y granito en Panamá. Cotiza tu proyecto en minutos, elige tu modelo y paga en línea.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={`${manrope.variable} ${fraunces.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppButton />
        <SideCart />
      </body>
    </html>
  );
}
