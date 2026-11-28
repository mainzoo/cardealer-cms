import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";

export function WelcomeBannerSection() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-r from-card via-secondary to-primary/15 dark:from-card dark:via-secondary/90 dark:to-primary/20 p-8 md:p-12 shadow-sm">
      <div className="absolute right-0 top-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-start gap-6 max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Welcome to CarDealer CMS</span>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl">
          Find the Right Car for Your Everyday Drive
        </h1>

        <p className="text-muted-foreground text-base sm:text-lg">
          Browse reliable, inspected vehicles at transparent prices. Compare specs, save your favourites, and connect with our team in minutes.
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
    </section>
  );
}


