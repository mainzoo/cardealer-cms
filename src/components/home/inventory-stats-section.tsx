import React from "react";
import Link from "next/link";
import { ArrowRight, CarFront } from "lucide-react";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";

interface InventoryStatsSectionProps {
  totalStockCount: number;
}

export function InventoryStatsSection({
  totalStockCount,
}: InventoryStatsSectionProps) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card p-6 md:p-8 shadow-sm">
      <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12 lg:gap-8">
        {/* Columna Izquierda: Título y Descripción */}
        <div className="flex flex-col gap-2.5 lg:col-span-7">
          <h3 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Quality Pre-Owned Vehicles Ready to Drive
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            Welcome to Car Dealer CMS of Miami, your trusted destination in
            Miami, FL for dependable pre-owned vehicles. From everyday sedans to
            rugged trucks and spacious SUVs, we combine quality selection with
            friendly, expert advice to guarantee a smooth buying experience.
          </p>
        </div>

        {/* Columna Derecha: Total en Stock + Botón de Inventario */}
        <div className="flex flex-col justify-between gap-4 rounded-xl border border-border/60 bg-background/60 p-5 sm:flex-row sm:items-center lg:col-span-5 lg:flex-col lg:items-stretch xl:flex-row xl:items-center">
          <div className="flex flex-col gap-1">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <CarFront className="h-4 w-4 text-primary" />
              Vehicles in Stock
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                {totalStockCount.toLocaleString()}
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                available now
              </span>
            </div>
          </div>

          <Button
            size="lg"
            className="shrink-0 gap-2 font-semibold shadow-sm"
            render={<Link href={routes.inventory} />}
          >
            View Full Inventory <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}