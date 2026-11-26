import React, { Suspense } from "react";
import Link from "next/link";
import { routes } from "@/config/routes";
import { DEALERSHIP_LOCATIONS } from "@/config/constants";
import { FavouriteCounter } from "@/components/layout/favourite-counter";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { DesktopNav, MobileNav } from "@/components/layout/nav-menu";
import { redis } from "@/lib/redis-store";
import { getSourceId } from "@/lib/source-id";
import { Phone } from "lucide-react";

async function CounterWrapper() {
  const sourceId = await getSourceId();
  const members = sourceId ? await redis.smembers(sourceId) : [];
  return <FavouriteCounter initialCount={members.length} />;
}

export function PublicHeader() {
  return (
    <header className="border-b border-border bg-card">
      {/* Top contact ticker (carbón elevado sutil, ~38px) */}
      <div className="border-b border-border bg-secondary text-secondary-foreground">
        <div className="mx-auto flex w-full max-w-screen-2xl flex-wrap items-center justify-center gap-x-8 gap-y-1.5 px-4 py-2.5 text-xs font-medium tracking-wide sm:justify-end sm:px-6 sm:text-sm lg:px-8">
          {DEALERSHIP_LOCATIONS.map((loc) => (
            <a
              key={loc.city}
              href={loc.phoneHref}
              className="inline-flex items-center gap-2 transition-opacity hover:opacity-80"
            >
              <Phone className="h-4 w-4 shrink-0 text-primary" />
              <span className="text-muted-foreground">{loc.city}:</span>
              <span className="font-semibold text-foreground">{loc.phone}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Main navigation row */}
      <div className="px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between">
          <Link
            href={routes.home}
            className="text-xl font-bold tracking-tight text-foreground"
          >
            CarDealer CMS
          </Link>
          <div className="flex items-center gap-2">
            <div className="mr-4">
              <DesktopNav />
            </div>
            <Suspense
              fallback={
                <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
              }
            >
              <CounterWrapper />
            </Suspense>
            <ThemeToggle />
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
}