import React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { TbCarSuv, TbTruck, TbCar4Wd, TbCar } from "react-icons/tb";
import { MdAirportShuttle, MdTimeToLeave } from "react-icons/md";
import { routes } from "@/config/routes";
import { BODY_TYPES } from "@/config/classified-enums";
import type { BodyType } from "@prisma/client";

interface BodyTypesSectionProps {
  bodyTypeCounts: { bodyType: BodyType; _count: { _all: number } }[];
}

const formatBodyTypeLabel = (type: string) =>
  type
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");

const getBodyTypeIcon = (type: BodyType) => {
  switch (type) {
    case "SUV":
      return <TbCarSuv className="h-7 w-7 text-primary" />;
    case "TRUCK":
      return <TbTruck className="h-7 w-7 text-primary" />;
    case "COUPE":
    case "CONVERTIBLE":
      return <MdTimeToLeave className="h-7 w-7 text-primary" />;
    case "HATCHBACK":
    case "WAGON":
      return <TbCar4Wd className="h-7 w-7 text-primary" />;
    case "VAN":
    case "MINIVAN":
      return <MdAirportShuttle className="h-7 w-7 text-primary" />;
    case "SEDAN":
    default:
      return <TbCar className="h-7 w-7 text-primary" />;
  }
};

export function BodyTypesSection({ bodyTypeCounts }: BodyTypesSectionProps) {
  const countMap = new Map(
    bodyTypeCounts.map((item) => [item.bodyType, item._count._all])
  );

  const availableBodyTypes = BODY_TYPES.map((type) => ({
    type: type as BodyType,
    count: countMap.get(type as BodyType) ?? 0,
  })).filter((item) => item.count > 0);

  if (availableBodyTypes.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Find Your Car By Type Available
        </h2>
        <Link
          href={routes.inventory}
          className="group inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
        >
          <span>Show All Cars</span>
          <Plus className="h-4 w-4 text-primary transition-transform group-hover:scale-110" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {availableBodyTypes.map(({ type, count }) => (
          <Link
            key={type}
            href={`${routes.inventory}?bodyType=${type}`}
            className="group flex flex-col items-center justify-center gap-3 rounded-2xl border border-border/50 bg-card p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 transition-colors group-hover:bg-primary/20">
              {getBodyTypeIcon(type)}
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-foreground transition-colors group-hover:text-primary">
                {formatBodyTypeLabel(type)}
              </span>
              <span className="text-xs text-muted-foreground">
                {count} {count === 1 ? "Listing" : "Listings"}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

