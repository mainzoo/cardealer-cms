"use server";

import { z } from "zod";
import { Prisma } from "@prisma/client";
import type { ClassifiedWithImages } from "@/config/types";
import {
  BODY_TYPES,
  FUEL_TYPES,
  TRANSMISSIONS,
} from "@/config/classified-enums";
import {
  smartSearchManualFiltersSchema,
  smartSearchFiltersSchema,
} from "@/app/schemas/smart-search.schema";
import { prisma } from "@/lib/prisma";

const promptSchema = z.string().trim().max(500);
type ParsedFilters = {
  q?: string;
  make?: string;
  model?: string;
  minYear?: number;
  maxYear?: number;
  minPrice?: number;
  maxPrice?: number;
  bodyType?: (typeof BODY_TYPES)[number];
  transmission?: (typeof TRANSMISSIONS)[number];
  fuelType?: (typeof FUEL_TYPES)[number];
};

type SearchFilters = {
  q: string | null;
  make: string | null;
  model: string | null;
  minYear: number | null;
  maxYear: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  bodyType: (typeof BODY_TYPES)[number] | null;
  transmission: (typeof TRANSMISSIONS)[number] | null;
  fuelType: (typeof FUEL_TYPES)[number] | null;
};

export interface SmartSearchState {
  reasoning: string;
  filters: SearchFilters;
  classifieds: ClassifiedWithImages[];
  total: number;
}

const normalizePhrase = (value: string) =>
  value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const containsPhrase = (normalizedPrompt: string, candidate: string) => {
  const normalizedCandidate = normalizePhrase(candidate);
  return normalizedCandidate.length > 0 &&
    ` ${normalizedPrompt} `.includes(` ${normalizedCandidate} `);
};

const parsePrice = (value: string) => {
  const compact = value.replace(/[,$\s]/g, "").toLowerCase();
  const multiplier = compact.endsWith("k") ? 1000 : 1;
  const amount = Number(compact.replace(/k$/, ""));
  return Number.isFinite(amount) ? Math.round(amount * multiplier) : undefined;
};

function extractHeuristicFilters(
  prompt: string,
  makes: { id: number; name: string }[],
  models: { name: string; makeId: number }[],
) {
  const normalizedPrompt = normalizePhrase(prompt);
  const parsed: ParsedFilters = {};
  const reasons: string[] = [];

  const matchedMake = [...makes]
    .sort((a, b) => normalizePhrase(b.name).length - normalizePhrase(a.name).length)
    .find((make) => containsPhrase(normalizedPrompt, make.name));

  if (matchedMake) {
    parsed.make = matchedMake.name;
    reasons.push(`make ${matchedMake.name}`);
  }

  const modelCandidates = models
    .filter((model) => !matchedMake || model.makeId === matchedMake.id)
    .sort((a, b) => normalizePhrase(b.name).length - normalizePhrase(a.name).length);
  const matchedModel = modelCandidates.find((model) =>
    containsPhrase(normalizedPrompt, model.name),
  );

  if (matchedModel) {
    parsed.model = matchedModel.name;
    if (!parsed.make) {
      const modelMake = makes.find((make) => make.id === matchedModel.makeId);
      if (modelMake) parsed.make = modelMake.name;
    }
    reasons.push(`model ${matchedModel.name}`);
  }

  const bodyTypes: {
    value: (typeof BODY_TYPES)[number];
    terms: string[];
  }[] = [
    { value: "SUV", terms: ["suv", "crossover"] },
    { value: "TRUCK", terms: ["truck", "pickup", "pick up"] },
    { value: "SEDAN", terms: ["sedan"] },
    { value: "COUPE", terms: ["coupe"] },
    { value: "CONVERTIBLE", terms: ["convertible", "cabriolet"] },
    { value: "HATCHBACK", terms: ["hatchback"] },
    { value: "WAGON", terms: ["wagon"] },
    { value: "MINIVAN", terms: ["minivan"] },
    { value: "VAN", terms: ["van"] },
  ];
  const matchedBodyType = bodyTypes.find(({ terms }) =>
    terms.some((term) => containsPhrase(normalizedPrompt, term)),
  );
  if (matchedBodyType) {
    parsed.bodyType = matchedBodyType.value;
    reasons.push(`body type ${matchedBodyType.value.toLowerCase()}`);
  }

  if (
    containsPhrase(normalizedPrompt, "automatic") ||
    containsPhrase(normalizedPrompt, "auto transmission")
  ) {
    parsed.transmission = "AUTOMATIC";
    reasons.push("automatic transmission");
  } else if (
    containsPhrase(normalizedPrompt, "manual") ||
    containsPhrase(normalizedPrompt, "stick shift")
  ) {
    parsed.transmission = "MANUAL";
    reasons.push("manual transmission");
  }

  const maxPriceMatch = prompt.match(
    /(?:under|below|less than|up to|upto|maximum|max(?:imum)?|budget(?: of)?|<=|<)\s*\$?\s*(\d[\d,]*(?:\.\d+)?\s*k?)/i,
  );
  const maxPrice = maxPriceMatch ? parsePrice(maxPriceMatch[1]) : undefined;
  if (maxPrice !== undefined && maxPrice >= 0) {
    parsed.maxPrice = maxPrice;
    reasons.push(`maximum price $${maxPrice.toLocaleString()}`);
  }

  const minPriceMatch = prompt.match(
    /(?:over|above|more than|at least|from|>=|>)\s*\$?\s*(\d[\d,]*(?:\.\d+)?\s*k?)/i,
  );
  const minPrice = minPriceMatch ? parsePrice(minPriceMatch[1]) : undefined;
  if (minPrice !== undefined && minPrice >= 0) {
    parsed.minPrice = minPrice;
    reasons.push(`minimum price $${minPrice.toLocaleString()}`);
  }

  const yearMatch = normalizedPrompt.match(/\b(19\d{2}|20\d{2})\b/);
  if (yearMatch) {
    const year = Number(yearMatch[1]);
    parsed.minYear = year;
    parsed.maxYear = year;
    reasons.push(`model year ${year}`);
  }

  const fuelTypes: {
    value: (typeof FUEL_TYPES)[number];
    terms: string[];
  }[] = [
    { value: "PLUG_IN_HYBRID", terms: ["plug in hybrid", "phev"] },
    { value: "GASOLINE", terms: ["gasoline", "gas", "petrol"] },
    { value: "DIESEL", terms: ["diesel"] },
    { value: "ELECTRIC", terms: ["electric", "ev"] },
    { value: "HYBRID", terms: ["hybrid"] },
  ];
  const matchedFuel = fuelTypes.find(({ terms }) =>
    terms.some((term) => containsPhrase(normalizedPrompt, term)),
  );
  if (matchedFuel) {
    parsed.fuelType = matchedFuel.value;
    reasons.push(`${matchedFuel.value.toLowerCase()} fuel`);
  }

  const recognizedFilterCount = Object.keys(parsed).length;
  if (recognizedFilterCount === 0 && prompt.trim()) {
    parsed.q = prompt.trim();
  }

  const reasoning = parsed.q
    ? `Searching inventory for "${parsed.q}".`
    : reasons.length > 0
      ? `Applied filters for ${reasons.join(", ")}.`
      : "Showing vehicles based on your selected search criteria.";

  return { parsed, reasoning };
}

export async function aiSmartSearchAction(
  prompt: string,
  manualFilters?: Partial<SearchFilters>,
): Promise<SmartSearchState> {
  const validPrompt = promptSchema.parse(prompt);
  const validManualFilters = smartSearchManualFiltersSchema.parse(manualFilters ?? {});

  const [makes, models] = validPrompt
    ? await Promise.all([
        prisma.make.findMany({
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        }),
        prisma.model.findMany({
          select: { name: true, makeId: true },
        }),
      ])
    : [[], []];

  const { parsed, reasoning } = extractHeuristicFilters(
    validPrompt,
    makes,
    models,
  );

  const parsedFinalFilters = smartSearchFiltersSchema.parse({
    q: validManualFilters.q ?? parsed.q ?? null,
    make: validManualFilters.make ?? parsed.make ?? null,
    model: validManualFilters.model ?? parsed.model ?? null,
    minYear: validManualFilters.minYear ?? parsed.minYear ?? null,
    maxYear: validManualFilters.maxYear ?? parsed.maxYear ?? null,
    minPrice: validManualFilters.minPrice ?? parsed.minPrice ?? null,
    maxPrice: validManualFilters.maxPrice ?? parsed.maxPrice ?? null,
    bodyType: validManualFilters.bodyType ?? parsed.bodyType ?? null,
    transmission:
      validManualFilters.transmission ?? parsed.transmission ?? null,
    fuelType: validManualFilters.fuelType ?? parsed.fuelType ?? null,
  });
  const finalFilters: SearchFilters = {
    q: parsedFinalFilters.q ?? null,
    make: parsedFinalFilters.make ?? null,
    model: parsedFinalFilters.model ?? null,
    minYear: parsedFinalFilters.minYear ?? null,
    maxYear: parsedFinalFilters.maxYear ?? null,
    minPrice: parsedFinalFilters.minPrice ?? null,
    maxPrice: parsedFinalFilters.maxPrice ?? null,
    bodyType: parsedFinalFilters.bodyType ?? null,
    transmission: parsedFinalFilters.transmission ?? null,
    fuelType: parsedFinalFilters.fuelType ?? null,
  };

  const where: Prisma.ClassifiedWhereInput = {
    status: "LIVE",
    ...(finalFilters.q
      ? {
          OR: [
            { title: { contains: finalFilters.q, mode: "insensitive" } },
            { description: { contains: finalFilters.q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(finalFilters.make
      ? { make: { is: { name: finalFilters.make } } }
      : {}),
    ...(finalFilters.model
      ? {
          model: {
            is: {
              name: finalFilters.model,
              ...(finalFilters.make
                ? { make: { is: { name: finalFilters.make } } }
                : {}),
            },
          },
        }
      : {}),
    ...(finalFilters.minPrice !== null || finalFilters.maxPrice !== null
      ? {
          price: {
            ...(finalFilters.minPrice !== null
              ? { gte: finalFilters.minPrice }
              : {}),
            ...(finalFilters.maxPrice !== null
              ? { lte: finalFilters.maxPrice }
              : {}),
          },
        }
      : {}),
    ...(finalFilters.minYear !== null || finalFilters.maxYear !== null
      ? {
          year: {
            ...(finalFilters.minYear !== null
              ? { gte: finalFilters.minYear }
              : {}),
            ...(finalFilters.maxYear !== null
              ? { lte: finalFilters.maxYear }
              : {}),
          },
        }
      : {}),
    ...(finalFilters.bodyType ? { bodyType: finalFilters.bodyType } : {}),
    ...(finalFilters.transmission
      ? { transmission: finalFilters.transmission }
      : {}),
    ...(finalFilters.fuelType ? { fuelType: finalFilters.fuelType } : {}),
  };

  const [classifieds, total] = await Promise.all([
    prisma.classified.findMany({
      where,
      include: {
        images: {
          take: 1,
          orderBy: { isMain: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.classified.count({ where }),
  ]);

  return {
    reasoning,
    filters: finalFilters,
    classifieds,
    total,
  };
}
