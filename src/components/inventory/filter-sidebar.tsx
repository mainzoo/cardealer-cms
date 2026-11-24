"use client";

import { Filter, Search } from "lucide-react";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BODY_TYPES,
  COLORS,
  DOORS,
  DRIVETRAINS,
  FUEL_TYPES,
  ODO_UNITS,
  TRANSMISSIONS,
} from "@/config/classified-enums";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface Taxonomies {
  makes: { id: number; name: string }[];
  models: { id: number; name: string; makeId: number }[];
  modelVariants: { id: number; name: string; modelId: number }[];
  ranges: {
    minYear: number;
    maxYear: number;
    minPrice: number;
    maxPrice: number;
    minReading: number;
    maxReading: number;
  };
}

const PRICE_STEPS = [
  5000, 10000, 15000, 20000, 25000, 30000, 40000, 50000, 75000, 100000, 150000,
];
const READING_STEPS = [
  5000, 10000, 25000, 50000, 75000, 100000, 150000, 200000,
];

const formatEnumLabel = (value: string) =>
  value
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");

const getRangeSteps = (steps: number[], min: number, max: number) =>
  Array.from(
    new Set([min, ...steps.filter((step) => step > min && step < max), max]),
  ).sort((a, b) => a - b);

export function FilterSidebar({ taxonomies }: { taxonomies: Taxonomies }) {
  const [filters, setFilters] = useQueryStates(
    {
      q: parseAsString,
      make: parseAsString,
      model: parseAsString,
      modelVariant: parseAsString,
      minYear: parseAsInteger,
      maxYear: parseAsInteger,
      minPrice: parseAsInteger,
      maxPrice: parseAsInteger,
      minReading: parseAsInteger,
      maxReading: parseAsInteger,
      odoUnit: parseAsString,
      transmission: parseAsString,
      fuelType: parseAsString,
      bodyType: parseAsString,
      color: parseAsString,
      drivetrain: parseAsString,
      doors: parseAsInteger,
      page: parseAsInteger,
    },
    { shallow: false },
  );

  const [debouncedQ, setDebouncedQ] = useState(filters.q || "");

  useEffect(() => {
    const handler = setTimeout(() => {
      if ((debouncedQ || null) !== (filters.q || null)) {
        setFilters({ q: debouncedQ || null, page: 1 });
      }
    }, 350);
    return () => clearTimeout(handler);
  }, [debouncedQ, filters.q, setFilters]);

  const handleFilterChange = (
    key: keyof typeof filters,
    value: string | number | null,
  ) => {
    const next: Partial<typeof filters> = {
      [key]: value === "" ? null : value,
      page: 1,
    };

    if (key === "make") {
      next.model = null;
      next.modelVariant = null;
    }
    if (key === "model") {
      next.modelVariant = null;
    }

    setFilters(next);
  };

  const clearFilters = () => {
    setDebouncedQ("");
    setFilters({
      q: null,
      make: null,
      model: null,
      modelVariant: null,
      minYear: null,
      maxYear: null,
      minPrice: null,
      maxPrice: null,
      minReading: null,
      maxReading: null,
      odoUnit: null,
      transmission: null,
      fuelType: null,
      bodyType: null,
      color: null,
      drivetrain: null,
      doors: null,
      page: 1,
    });
  };

  const selectedMake = taxonomies.makes.find((m) => m.name === filters.make);
  const availableModels = selectedMake
    ? taxonomies.models.filter((mod) => mod.makeId === selectedMake.id)
    : [];

  const selectedModel = availableModels.find((m) => m.name === filters.model);
  const availableVariants = selectedModel
    ? taxonomies.modelVariants.filter((v) => v.modelId === selectedModel.id)
    : [];

  const years = Array.from(
    {
      length:
        Math.max(taxonomies.ranges.maxYear - taxonomies.ranges.minYear, 0) + 1,
    },
    (_, i) => taxonomies.ranges.maxYear - i,
  );
  const prices = getRangeSteps(
    PRICE_STEPS,
    taxonomies.ranges.minPrice,
    taxonomies.ranges.maxPrice,
  );
  const readings = getRangeSteps(
    READING_STEPS,
    taxonomies.ranges.minReading,
    taxonomies.ranges.maxReading,
  );

  const content = (
    <div className="flex flex-col gap-5 rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between pr-8 lg:pr-0">
        <h2 className="text-lg font-semibold">Filters</h2>
        <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
          Clear all
        </Button>
      </div>

      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search classifieds..."
            value={debouncedQ}
            onChange={(e) => setDebouncedQ(e.target.value)}
          />
        </div>

        {/* Make */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">Make</label>
          <Select
            value={filters.make ?? ""}
            onValueChange={(v) => handleFilterChange("make", v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {taxonomies.makes.map((m) => (
                <SelectItem key={m.id} value={m.name}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Model */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">Model</label>
          <Select
            disabled={!selectedMake}
            value={filters.model ?? ""}
            onValueChange={(v) => handleFilterChange("model", v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {availableModels.map((m) => (
                <SelectItem key={m.id} value={m.name}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Model Variant */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Model Variant
          </label>
          <Select
            disabled={!selectedModel}
            value={filters.modelVariant ?? ""}
            onValueChange={(v) => handleFilterChange("modelVariant", v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {availableVariants.map((v) => (
                <SelectItem key={v.id} value={v.name}>
                  {v.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Year */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">Year</label>
          <div className="grid grid-cols-2 gap-2">
            <Select
              value={filters.minYear != null ? String(filters.minYear) : ""}
              onValueChange={(v) =>
                handleFilterChange("minYear", v ? Number(v) : null)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.maxYear != null ? String(filters.maxYear) : ""}
              onValueChange={(v) =>
                handleFilterChange("maxYear", v ? Number(v) : null)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Price */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">Price</label>
          <div className="grid grid-cols-2 gap-2">
            <Select
              value={filters.minPrice != null ? String(filters.minPrice) : ""}
              onValueChange={(v) =>
                handleFilterChange("minPrice", v ? Number(v) : null)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {prices.map((p) => (
                  <SelectItem key={p} value={String(p)}>
                    ${p.toLocaleString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.maxPrice != null ? String(filters.maxPrice) : ""}
              onValueChange={(v) =>
                handleFilterChange("maxPrice", v ? Number(v) : null)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {prices.map((p) => (
                  <SelectItem key={p} value={String(p)}>
                    ${p.toLocaleString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Odometer Reading */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Odometer Reading
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Select
              value={filters.minReading != null ? String(filters.minReading) : ""}
              onValueChange={(v) =>
                handleFilterChange("minReading", v ? Number(v) : null)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {readings.map((r) => (
                  <SelectItem key={r} value={String(r)}>
                    {r.toLocaleString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.maxReading != null ? String(filters.maxReading) : ""}
              onValueChange={(v) =>
                handleFilterChange("maxReading", v ? Number(v) : null)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {readings.map((r) => (
                  <SelectItem key={r} value={String(r)}>
                    {r.toLocaleString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Odometer Unit */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Odometer Unit
          </label>
          <Select
            value={filters.odoUnit ?? ""}
            onValueChange={(v) => handleFilterChange("odoUnit", v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {ODO_UNITS.map((u) => (
                <SelectItem key={u} value={u}>
                  {formatEnumLabel(u)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Transmission */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Transmission
          </label>
          <Select
            value={filters.transmission ?? ""}
            onValueChange={(v) => handleFilterChange("transmission", v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {TRANSMISSIONS.map((t) => (
                <SelectItem key={t} value={t}>
                  {formatEnumLabel(t)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Fuel Type */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">Fuel Type</label>
          <Select
            value={filters.fuelType ?? ""}
            onValueChange={(v) => handleFilterChange("fuelType", v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {FUEL_TYPES.map((f) => (
                <SelectItem key={f} value={f}>
                  {formatEnumLabel(f)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Drivetrain */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Drivetrain
          </label>
          <Select
            value={filters.drivetrain ?? ""}
            onValueChange={(v) => handleFilterChange("drivetrain", v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {DRIVETRAINS.map((drivetrain) => (
                <SelectItem key={drivetrain} value={drivetrain}>
                  {drivetrain === "FOUR_WD" ? "4WD" : drivetrain}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Body Type */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">Body Type</label>
          <Select
            value={filters.bodyType ?? ""}
            onValueChange={(v) => handleFilterChange("bodyType", v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {BODY_TYPES.map((b) => (
                <SelectItem key={b} value={b}>
                  {formatEnumLabel(b)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Color */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">Color</label>
          <Select
            value={filters.color ?? ""}
            onValueChange={(v) => handleFilterChange("color", v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {COLORS.map((c) => (
                <SelectItem key={c} value={c}>
                  {formatEnumLabel(c)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Doors */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">Doors</label>
          <Select
            value={filters.doors ? String(filters.doors) : ""}
            onValueChange={(v) =>
              handleFilterChange("doors", v ? Number(v) : null)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {DOORS.map((d) => (
                <SelectItem key={d} value={String(d)}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden w-[280px] shrink-0 lg:block">{content}</div>
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger
            render={
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            }
          />
          <SheetContent side="left" className="w-[300px] overflow-y-auto">
            {content}
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}