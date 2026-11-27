"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowRight,
  LoaderCircle,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClassifiedCard } from "@/components/inventory/classified-card";
import type { Favourites } from "@/config/types";
import { routes } from "@/config/routes";
import { aiSmartSearchAction } from "@/app/actions/smart-search.action";
import type { SmartSearchState } from "@/app/actions/smart-search.action";
import { BODY_TYPES, TRANSMISSIONS } from "@/config/classified-enums";

interface Taxonomies {
  makes: { id: number; name: string }[];
  models: { id: number; name: string; makeId: number }[];
  ranges: { minPrice: number; maxPrice: number };
}

interface Props {
  taxonomies: Taxonomies;
  initialData: SmartSearchState;
  favourites: Favourites | null;
}

const formatEnumLabel = (v: string) => v.split("_").map((p) => p.charAt(0) + p.slice(1).toLowerCase()).join(" ");
const PRICE_STEPS = [10000, 15000, 20000, 25000, 30000, 40000, 50000, 75000, 100000, 150000];

export function SmartSearchSection({ taxonomies, initialData, favourites }: Props) {
  const [prompt, setPrompt] = useState("");
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState<SmartSearchState>(initialData);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [make, setMake] = useState<string>(data.filters.make || "");
  const [model, setModel] = useState<string>(data.filters.model || "");
  const [bodyType, setBodyType] = useState<
    NonNullable<SmartSearchState["filters"]["bodyType"]> | ""
  >(data.filters.bodyType || "");
  const [maxPrice, setMaxPrice] = useState<string>(data.filters.maxPrice ? String(data.filters.maxPrice) : "");
  const [transmission, setTransmission] = useState<
    NonNullable<SmartSearchState["filters"]["transmission"]> | ""
  >(data.filters.transmission || "");

  const updateFromResult = (result: SmartSearchState) => {
    setData(result);
    setMake(result.filters.make ?? "");
    setModel(result.filters.model ?? "");
    setBodyType(result.filters.bodyType ?? "");
    setMaxPrice(
      result.filters.maxPrice == null ? "" : String(result.filters.maxPrice),
    );
    setTransmission(result.filters.transmission ?? "");
  };

  const runSearch = (
    searchPrompt: string,
    manualFilters: Parameters<typeof aiSmartSearchAction>[1],
  ) => {
    startTransition(async () => {
      try {
        const result = await aiSmartSearchAction(searchPrompt, manualFilters);
        updateFromResult(result);
      } catch {
        toast.error("Search failed. Please try again.");
      }
    });
  };

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    runSearch(prompt, {
      make: make || null,
      model: model || null,
      bodyType: bodyType || null,
      maxPrice: maxPrice ? Number(maxPrice) : null,
      transmission: transmission || null,
    });
  };

  const handleReset = () => {
    setPrompt("");
    setMake("");
    setModel("");
    setBodyType("");
    setMaxPrice("");
    setTransmission("");
    runSearch("", {});
  };

  const selectedMakeObj = taxonomies.makes.find((m) => m.name === make);
  const availableModels = selectedMakeObj ? taxonomies.models.filter((m) => m.makeId === selectedMakeObj.id) : [];
  const priceSteps = Array.from(
    new Set([
      taxonomies.ranges.minPrice,
      ...PRICE_STEPS.filter(
        (price) =>
          price >= taxonomies.ranges.minPrice &&
          price <= taxonomies.ranges.maxPrice,
      ),
      taxonomies.ranges.maxPrice,
      ...(maxPrice ? [Number(maxPrice)] : []),
    ]),
  ).sort((a, b) => a - b);

  const inventoryParams = new URLSearchParams();
  if (data.filters.q) inventoryParams.set("q", data.filters.q);
  if (data.filters.make) inventoryParams.set("make", data.filters.make);
  if (data.filters.model) inventoryParams.set("model", data.filters.model);
  if (data.filters.bodyType) inventoryParams.set("bodyType", data.filters.bodyType);
  if (data.filters.transmission) inventoryParams.set("transmission", data.filters.transmission);
  if (data.filters.maxPrice) inventoryParams.set("maxPrice", String(data.filters.maxPrice));

  const inventoryHref = `${routes.inventory}${inventoryParams.toString() ? `?${inventoryParams.toString()}` : ""}`;

  return (
    <section className="flex flex-col gap-8 rounded-3xl border border-border/60 bg-card p-6 md:p-10 shadow-lg">
      <div className="flex flex-col items-center text-center gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/15 px-4 py-1.5 text-xs font-semibold text-primary">
          <Sparkles className="h-3.5 w-3.5 animate-pulse" />
          <span>AI Smart Search & Filters</span>
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Describe your ideal vehicle</h2>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Type your preferences in natural language or use the filters below to instantly find your next car.
        </p>
      </div>

      <form onSubmit={handleSearch} aria-busy={isPending} className="flex flex-col gap-4">
        <div className="relative flex items-center shadow-md rounded-2xl overflow-hidden border border-border/80 bg-background">
          <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
          <Input
            className="w-full pl-12 pr-32 py-6 text-base border-0 focus-visible:ring-0 bg-transparent"
            placeholder="Describe your ideal car, e.g., SUV under $35,000..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <div className="absolute right-2 flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowAdvanced(!showAdvanced)} className="hidden sm:inline-flex text-xs gap-1">
              <SlidersHorizontal className="h-3.5 w-3.5" /> {showAdvanced ? "Hide Filters" : "Filters"}
            </Button>
            <Button type="submit" disabled={isPending} className="gap-1.5">
              {isPending ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {isPending ? "Analyzing..." : "AI Search"}
            </Button>
          </div>
        </div>

        {showAdvanced && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Make</label>
            <Select value={make} onValueChange={(v) => { setMake(v === "all-makes" ? "" : v || ""); setModel(""); }}>
              <SelectTrigger className="w-full bg-background"><SelectValue placeholder="All Makes" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all-makes">All Makes</SelectItem>
                {taxonomies.makes.map((m) => (<SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Model</label>
            <Select disabled={!make} value={model} onValueChange={(v) => setModel(v === "all-models" ? "" : v || "")}>
              <SelectTrigger className="w-full bg-background"><SelectValue placeholder="All Models" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all-models">All Models</SelectItem>
                {availableModels.map((m) => (<SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Body Type</label>
            <Select
              value={bodyType}
              onValueChange={(value) =>
                setBodyType(BODY_TYPES.find((type) => type === value) ?? "")
              }
            >
              <SelectTrigger className="w-full bg-background"><SelectValue placeholder="All Body Types" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all-body-types">All Body Types</SelectItem>
                {BODY_TYPES.map((b) => (<SelectItem key={b} value={b}>{formatEnumLabel(b)}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Transmission</label>
            <Select
              value={transmission}
              onValueChange={(value) =>
                setTransmission(
                  TRANSMISSIONS.find((item) => item === value) ?? "",
                )
              }
            >
              <SelectTrigger className="w-full bg-background"><SelectValue placeholder="All Transmissions" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all-transmissions">All Transmissions</SelectItem>
                {TRANSMISSIONS.map((value) => (
                  <SelectItem key={value} value={value}>{formatEnumLabel(value)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Max Price</label>
            <Select value={maxPrice} onValueChange={(v) => setMaxPrice(v === "no-limit" ? "" : v || "")}>
              <SelectTrigger className="w-full bg-background"><SelectValue placeholder="No Limit" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="no-limit">No Limit</SelectItem>
                {priceSteps.map((p) => (<SelectItem key={p} value={String(p)}>${p.toLocaleString()}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => runSearch(prompt, {
              make: make || null,
              model: model || null,
              bodyType: bodyType || null,
              maxPrice: maxPrice ? Number(maxPrice) : null,
              transmission: transmission || null,
            })} disabled={isPending} className="text-xs">
              <RefreshCw className={`h-3 w-3 mr-1.5 ${isPending ? "animate-spin" : ""}`} /> Update Search
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={handleReset} disabled={isPending} className="text-xs text-muted-foreground">Clear All</Button>
          </div>
          <span aria-live="polite" className="text-xs font-medium text-muted-foreground">
            {isPending ? "Updating results..." : `${data.total} result${data.total === 1 ? "" : "s"} found`}
          </span>
        </div>
      </form>

      {data.reasoning && (
        <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm text-foreground">
          <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-primary">AI Insight:</span>
            <p className="text-muted-foreground text-xs leading-relaxed">{data.reasoning}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold tracking-tight">Recommended Vehicles</h3>
          <Link href={inventoryHref} className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1">
            View all ({data.total}) <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {data.classifieds.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 rounded-2xl border border-dashed text-center gap-3">
            <p className="text-sm font-medium text-muted-foreground">No vehicles found matching your criteria.</p>
            <Button variant="outline" size="sm" onClick={handleReset}>Reset Search</Button>
          </div>
        ) : (
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:pb-0 scrollbar-none">
            {data.classifieds.map((classified) => (
              <div key={classified.id} className="min-w-[280px] sm:min-w-[320px] md:min-w-0 snap-start shrink-0 flex">
                <div className="w-full"><ClassifiedCard classified={classified} favourites={favourites} /></div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-center pt-2 border-t border-border/40">
        <Button size="lg" className="w-full sm:w-auto font-semibold gap-2 shadow-md" render={<Link href={inventoryHref} />}>
          View all {data.total} vehicles in inventory <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </section>
  );
}
