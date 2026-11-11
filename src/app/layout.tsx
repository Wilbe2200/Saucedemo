import type { Metadata } from "next";
import { SiteFrame } from "@/components/SiteFrame";
import "./globals.css";

export const metadata: Metadata = {
  title: "Para Megan, con todo mi amor",
  description: "Un rinconcito romántico lleno de cartas, flores y capibaras para Megan.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <SiteFrame>{children}</SiteFrame>
      </body>
    </html>
  );
}
