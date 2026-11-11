"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { StoreFooter } from "@/components/StoreFooter";
import { StoreHeader } from "@/components/StoreHeader";
import { WishListProvider } from "@/components/WishListProvider";

export function SiteFrame({ children }: { children: ReactNode }) {
  const isMeganPage = usePathname() === "/";

  if (isMeganPage) return children;

  return (
    <WishListProvider>
      <StoreHeader />
      <main className="page-content">{children}</main>
      <StoreFooter />
    </WishListProvider>
  );
}
