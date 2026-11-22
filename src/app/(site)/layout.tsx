import React, { Suspense } from "react";
import Link from "next/link";
import { routes } from "@/config/routes";
import { FavouriteCounter } from "@/components/layout/favourite-counter";
import { getSourceId } from "@/lib/source-id";
import { redis } from "@/lib/redis-store";

async function FavouriteCounterContainer() {
  const sourceId = await getSourceId();
  const initialCount = sourceId ? await redis.scard(sourceId) : 0;

  return <FavouriteCounter initialCount={initialCount} />;
}

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b bg-card px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href={routes.home} className="text-xl font-bold tracking-tight">
            CarDealer CMS
          </Link>
          <Suspense fallback={
            <div className="h-10 w-10 rounded-full bg-slate-100 animate-pulse" />
          }>
            <FavouriteCounterContainer />
          </Suspense>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>

      <footer className="border-t bg-card py-6 text-center text-sm text-muted-foreground">
        <p>&copy; 2026 CarDealer CMS. All rights reserved.</p>
      </footer>
    </div>
  );
}
