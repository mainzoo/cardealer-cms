export const instant = false;
import React from "react";
import { connection } from "next/server";
import { ShieldCheck, Zap, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis-store";
import { getSourceId } from "@/lib/source-id";
import { aiSmartSearchAction } from "@/app/actions/smart-search.action";
import { SmartSearchSection } from "@/components/home/smart-search-section";
import { WelcomeBannerSection } from "@/components/home/welcome-banner-section";
import { InventoryStatsSection } from "@/components/home/inventory-stats-section";
import { BodyTypesSection } from "@/components/home/body-types-section";
import { BestBrandsSection } from "@/components/home/best-brands-section";
import { Favourites } from "@/config/types";

export default async function Home() {
  await connection();

  const [makes, models, ranges, sourceId, bodyTypeCounts, topBrands, totalStockCount] = await Promise.all([
    prisma.make.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.model.findMany({ select: { id: true, name: true, makeId: true }, orderBy: { name: "asc" } }),
    prisma.classified.aggregate({
      where: { status: "LIVE" },
      _min: { price: true },
      _max: { price: true },
    }),
    getSourceId(),
    prisma.classified.groupBy({
      by: ["bodyType"],
      where: { status: "LIVE" },
      _count: { _all: true },
    }),
    prisma.make.findMany({
      where: {
        classifieds: {
          some: { status: "LIVE" },
        },
      },
      select: {
        id: true,
        name: true,
        image: true,
        _count: {
          select: {
            classifieds: {
              where: { status: "LIVE" },
            },
          },
        },
      },
      orderBy: {
        classifieds: {
          _count: "desc",
        },
      },
      take: 8,
    }),
    prisma.classified.count({
      where: { status: "LIVE" },
    }),
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
    <div className="flex flex-col gap-16 py-6 md:py-12">
      {/* 1. Welcome Banner Section */}
      <WelcomeBannerSection />

      {/* 2. Smart Search Section */}
      <SmartSearchSection taxonomies={taxonomies} initialData={initialData} favourites={favourites} />

      {/* 3. Inventory Stats Section */}
      <InventoryStatsSection totalStockCount={totalStockCount} />

      {/* 4. Body Types Section */}
      <BodyTypesSection bodyTypeCounts={bodyTypeCounts} />

      {/* 5. Best Brands Section */}
      <BestBrandsSection brands={topBrands} />

      {/* 6. Features Grid */}
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




