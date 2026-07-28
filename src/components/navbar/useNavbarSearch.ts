'use client';

import { useEffect, useRef, useState } from "react";
import { useFocusTrap } from "@/hooks/useFocusTrap";

export function useNavbarSearch() {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isDesktopSearchActive, setIsDesktopSearchActive] = useState(false);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  useFocusTrap(mobileSearchRef, isMobileSearchOpen);

  useEffect(() => {
    if (!isMobileSearchOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileSearchOpen]);

  return {
    isMobileSearchOpen,
    setIsMobileSearchOpen,
    isDesktopSearchActive,
    setIsDesktopSearchActive,
    mobileSearchRef,
  };
}

export type NavbarSearchState = ReturnType<typeof useNavbarSearch>;
