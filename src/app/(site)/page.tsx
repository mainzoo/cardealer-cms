export const instant = false;
import React from "react";
import Link from "next/link";
import { connection } from "next/server";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { ArrowRight, ShieldCheck, Zap, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis-store";
import { getSourceId } from "@/lib/source-id";
import { aiSmartSearchAction } from "@/app/actions/smart-search.action";
import { SmartSearchSection } from "@/components/home/smart-search-section";
import { Favourites } from "@/config/types";

export default async function Home() {
  await connection();

  const [makes, models, ranges, sourceId] = await Promise.all([
    prisma.make.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.model.findMany({ select: { id: true, name: true, makeId: true }, orderBy: { name: "asc" } }),
    prisma.classified.aggregate({
      _min: { price: true },
      _max: { price: true },
    }),
    getSourceId(),
  ]);

  const members = sourceId ? await redis.smembers(sourceId) : [];
  const favourites: Favourites = { ids: members.map(Number) };

  const initialData = await aiSmartSearchAction("", {});

  const taxonomies = {
    makes,
    models,
    ranges: {
      minPrice: ranges._min.price ?? 0,
      maxPrice: ranges._max.price ?? 150000,
    },
  };

  return (
    <div className="flex flex-col gap-12 py-6 md:py-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-b from-primary/5 via-background to-background p-8 md:p-16 text-center">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Next-Gen Car Dealer CMS with AI</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Find Your Dream Car with{"   "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Total Confidence
            </span>
          </h1>

          <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
            Explore our curated inventory of premium vehicles. Verified quality, competitive pricing, and seamless digital experience.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Button size="lg" render={<Link href={routes.inventory} />}>
              Explore Inventory <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" render={<Link href={routes.favourites} />}>
              View Favourites
            </Button>
          </div>
        </div>
      </section>

      {/* Smart Search Section */}
      <SmartSearchSection taxonomies={taxonomies} initialData={initialData} favourites={favourites} />

      {/* Features Grid */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="flex flex-col gap-3 rounded-2xl border border-border/50 bg-card p-6 shadow-sm transition-all hover:border-primary/50">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Verified Quality</h3>
          <p className="text-sm text-muted-foreground">
            Every vehicle in our catalog undergoes rigorous multi-point inspection to ensure absolute peace of mind.
          </p>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-border/50 bg-card p-6 shadow-sm transition-all hover:border-primary/50">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Zap className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-foreground">AI-Powered Insights</h3>
          <p className="text-sm text-muted-foreground">
            Leverage advanced AI features to get smart recommendations, valuation summaries, and vehicle comparisons instantly.
          </p>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-border/50 bg-card p-6 shadow-sm transition-all hover:border-primary/50">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Seamless Process</h3>
          <p className="text-sm text-muted-foreground">
            Save your favourite cars, compare specs, and contact our team seamlessly with just a few clicks.
          </p>
        </div>
      </section>
    </div>
  );
}

