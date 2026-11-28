import React from "react";
import Link from "next/link";
import { Car, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";

interface WelcomeBannerSectionProps {
  totalStockCount: number;
}

export function WelcomeBannerSection({ totalStockCount }: WelcomeBannerSectionProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-r from-card via-secondary to-primary/15 dark:from-card dark:via-secondary/90 dark:to-primary/20 p-8 md:p-12 shadow-sm">
      <div className="absolute right-0 top-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      
      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
        <div className="flex flex-col gap-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary w-fit">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Welcome to CarDealer CMS</span>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Your Trusted Destination for Premium Vehicles
          </h2>

          <p className="text-muted-foreground text-base sm:text-lg">
            Discover a seamless car buying experience with our state-of-the-art digital showroom. Browse verified inventory, compare specs, and connect with our expert team instantly.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Button size="lg" render={<Link href={routes.inventory} />}>
              Browse Inventory <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" render={<Link href={routes.favourites} />}>
              View Favourites
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card/80 backdrop-blur-md p-6 shadow-md w-full lg:w-auto min-w-[280px]">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Car className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Vehicles in Stock
              </span>
              <div className="text-3xl font-extrabold text-foreground">
                {totalStockCount.toLocaleString()}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border/40">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span>Fully inspected and verified ready for delivery</span>
          </div>
        </div>
      </div>
    </section>
  );
}
