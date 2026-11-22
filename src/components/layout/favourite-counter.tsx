"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { routes } from "@/config/routes";
import { useEffect, useState } from "react";

interface FavouriteCounterProps {
  initialCount: number;
}

export function FavouriteCounter({ initialCount }: FavouriteCounterProps) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    const syncFromStorage = () => {
      const stored = sessionStorage.getItem("favourite-ids");
      if (stored) {
        const ids: number[] = JSON.parse(stored);
        setCount(ids.length);
      }
    };

    syncFromStorage();

    const handleUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{ ids: number[] }>;
      setCount(customEvent.detail.ids.length);
    };

    window.addEventListener("favourites-updated", handleUpdate);
    window.addEventListener("pageshow", syncFromStorage);
    window.addEventListener("focus", syncFromStorage);

    return () => {
      window.removeEventListener("favourites-updated", handleUpdate);
      window.removeEventListener("pageshow", syncFromStorage);
      window.removeEventListener("focus", syncFromStorage);
    };
  }, []);

  return (
    <Link
      href={routes.favourites}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-muted/70 text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      <Heart className="h-5 w-5 fill-rose-500 text-rose-500" />
      <span
        id="favourites-badge-count"
        className={`absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground ring-2 ring-background ${count > 0 ? "flex" : "hidden"}`}
      >
        {count}
      </span>
    </Link>
  );
}
