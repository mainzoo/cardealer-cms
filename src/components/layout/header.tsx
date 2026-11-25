import React, { Suspense } from "react";
import Link from "next/link";
import { routes } from "@/config/routes";
import { FavouriteCounter } from "@/components/layout/favourite-counter";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { redis } from "@/lib/redis-store";
import { getSourceId } from "@/lib/source-id";

async function CounterWrapper() {
  const sourceId = await getSourceId();
  const members = sourceId ? await redis.smembers(sourceId) : [];
  return <FavouriteCounter initialCount={members.length} />;
}

export function PublicHeader() {
  return (
    <header className="border-b border-border bg-card px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between">
        <Link href={routes.home} className="text-xl font-bold tracking-tight text-foreground">
          CarDealer CMS
        </Link>
        <div className="flex items-center gap-2">
          <Suspense fallback={
            <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
          }>
            <CounterWrapper />
          </Suspense>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
