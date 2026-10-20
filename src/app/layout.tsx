import type { Metadata } from "next";
import { StoreFooter } from "@/components/StoreFooter";
import { StoreHeader } from "@/components/StoreHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sauce Demo",
  description: "Just a demo site showing off what Sauce can do.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <StoreHeader />
        <main className="page-content">{children}</main>
        <StoreFooter />
      </body>
    </html>
  );
}
