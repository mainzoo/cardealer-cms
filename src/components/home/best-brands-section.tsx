import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { routes } from "@/config/routes";

interface BestBrandsSectionProps {
  brands: {
    id: number;
    name: string;
    image: string;
    _count: {
      classifieds: number;
    };
  }[];
}

export function BestBrandsSection({ brands }: BestBrandsSectionProps) {
  if (!brands.length) return null;

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Best Brands
        </h2>
        <Link
          href={routes.inventory}
          className="group inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
        >
          <span>View All Brands</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {brands.map((brand) => {
          const count = brand._count.classifieds;
          const hasImage = Boolean(brand.image && brand.image.trim().startsWith("http"));

          return (
            <Link
              key={brand.id}
              href={`${routes.inventory}?make=${brand.id}`}
              className="group flex flex-col items-center justify-between gap-4 rounded-2xl border border-border/50 bg-card p-5 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md"
            >
              <div className="flex h-16 w-full items-center justify-center rounded-xl bg-white/95 dark:bg-white/90 p-3 shadow-inner transition-transform duration-300 group-hover:scale-105">
                {hasImage ? (
                  <div className="relative h-10 w-full">
                    <Image
                      src={brand.image}
                      alt={brand.name}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 50vw, 150px"
                    />
                  </div>
                ) : (
                  <span className="text-xl font-black tracking-wider text-slate-900">
                    {brand.name.slice(0, 3).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="flex flex-col items-center gap-1">
                <span className="font-bold text-foreground transition-colors group-hover:text-primary line-clamp-1">
                  {brand.name}
                </span>
                <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                  {count} {count === 1 ? "Vehicle" : "Vehicles"}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
