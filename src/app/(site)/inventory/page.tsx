import { Prisma } from "@prisma/client"
import { Suspense } from "react";
import { connection } from "next/server";
import { z } from "zod";
import { ClassifiedsList } from "@/components/inventory/classifieds-list";
import { CustomPagination } from "@/components/shared/custom-pagination";
import { CLASSIFIEDS_PER_PAGE } from "@/config/constants";
import {
  BODY_TYPES,
  COLORS,
  DOORS,
  DRIVETRAINS,
  FUEL_TYPES,
  ODO_UNITS,
  TRANSMISSIONS,
} from "@/config/classified-enums";
import type { CustomPageProps, Favourites } from "@/config/types";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis-store";
import { getSourceId } from "@/lib/source-id";
import { FilterSidebar } from "@/components/inventory/filter-sidebar";

const pageSchema = z
  .string()
  .regex(/^\d+$/)
  .transform(Number)
  .pipe(z.number().positive());

const optionalTextFilter = z
  .string()
  .trim()
  .min(1)
  .max(200)
  .optional()
  .catch(undefined);
const optionalIntegerFilter = z
  .string()
  .regex(/^\d+$/)
  .transform(Number)
  .pipe(z.number().int().nonnegative().max(2147483647))
  .optional()
  .catch(undefined);
const optionalDoorsFilter = z
  .string()
  .regex(/^\d+$/)
  .transform(Number)
  .pipe(z.number().int().refine((value) => DOORS.some((door) => door === value)))
  .optional()
  .catch(undefined);
const optionalEnumFilter = <T extends readonly [string, ...string[]]>(
  values: T,
) => z.enum(values).optional().catch(undefined);

const inventoryFiltersSchema = z.object({
  q: optionalTextFilter,
  make: optionalTextFilter,
  model: optionalTextFilter,
  modelVariant: optionalTextFilter,
  minYear: optionalIntegerFilter,
  maxYear: optionalIntegerFilter,
  minPrice: optionalIntegerFilter,
  maxPrice: optionalIntegerFilter,
  minReading: optionalIntegerFilter,
  maxReading: optionalIntegerFilter,
  odoUnit: optionalEnumFilter(ODO_UNITS),
  transmission: optionalEnumFilter(TRANSMISSIONS),
  fuelType: optionalEnumFilter(FUEL_TYPES),
  bodyType: optionalEnumFilter(BODY_TYPES),
  color: optionalEnumFilter(COLORS),
  drivetrain: optionalEnumFilter(DRIVETRAINS),
  doors: optionalDoorsFilter,
});

type InventoryFilters = z.infer<typeof inventoryFiltersSchema>;

type InventorySearchParams = Record<string, string | string[] | undefined>;

const getQueryValue = (value: string | string[] | undefined) => {
  const firstValue = Array.isArray(value) ? value[0] : value;
  return firstValue?.trim() || undefined;
};

const fetchInventoryData = async (
  requestedPage: number,
  filters: InventoryFilters,
) => {
  await connection();

  const where: Prisma.ClassifiedWhereInput = {
    ...(filters.q
      ? {
          OR: [
            { title: { contains: filters.q, mode: "insensitive" } },
            { description: { contains: filters.q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(filters.make
      ? {
          make: {
            is: { name: filters.make },
          },
        }
      : {}),
    ...(filters.model
      ? {
          model: {
            is: {
              name: filters.model,
              ...(filters.make
                ? { make: { is: { name: filters.make } } }
                : {}),
            },
          },
        }
      : {}),
    ...(filters.modelVariant
      ? {
          modelVariant: {
            is: {
              name: filters.modelVariant,
              ...(filters.model
                ? {
                    model: {
                      is: {
                        name: filters.model,
                        ...(filters.make
                          ? { make: { is: { name: filters.make } } }
                          : {}),
                      },
                    },
                  }
                : {}),
            },
          },
        }
      : {}),
    ...(filters.minYear !== undefined || filters.maxYear !== undefined
      ? {
          year: {
            ...(filters.minYear !== undefined ? { gte: filters.minYear } : {}),
            ...(filters.maxYear !== undefined ? { lte: filters.maxYear } : {}),
          },
        }
      : {}),
    ...(filters.minPrice !== undefined || filters.maxPrice !== undefined
      ? {
          price: {
            ...(filters.minPrice !== undefined
              ? { gte: filters.minPrice }
              : {}),
            ...(filters.maxPrice !== undefined
              ? { lte: filters.maxPrice }
              : {}),
          },
        }
      : {}),
    ...(filters.minReading !== undefined || filters.maxReading !== undefined
      ? {
          odoReading: {
            ...(filters.minReading !== undefined
              ? { gte: filters.minReading }
              : {}),
            ...(filters.maxReading !== undefined
              ? { lte: filters.maxReading }
              : {}),
          },
        }
      : {}),
    ...(filters.odoUnit ? { odoUnit: filters.odoUnit } : {}),
    ...(filters.transmission ? { transmission: filters.transmission } : {}),
    ...(filters.fuelType ? { fuelType: filters.fuelType } : {}),
    ...(filters.bodyType ? { bodyType: filters.bodyType } : {}),
    ...(filters.color ? { color: filters.color } : {}),
    ...(filters.drivetrain ? { drivetrain: filters.drivetrain } : {}),
    ...(filters.doors !== undefined ? { doors: filters.doors } : {}),
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
      take: CLASSIFIEDS_PER_PAGE,
      skip: (requestedPage - 1) * CLASSIFIEDS_PER_PAGE,
    }),
    prisma.classified.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / CLASSIFIEDS_PER_PAGE));
  return { classifieds, total, totalPages };
};

const fetchTaxonomies = async (makeName?: string, modelName?: string) => {
  await connection();

  const [makes, ranges] = await Promise.all([
    prisma.make.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.classified.aggregate({
      _min: { year: true, price: true, odoReading: true },
      _max: { year: true, price: true, odoReading: true },
    }),
  ]);

  const selectedMake = makes.find((make) => make.name === makeName);
  const models = selectedMake
    ? await prisma.model.findMany({
        where: { makeId: selectedMake.id },
        select: { id: true, name: true, makeId: true },
        orderBy: { name: "asc" },
      })
    : [];
  const selectedModel = models.find((model) => model.name === modelName);
  const modelVariants = selectedModel
    ? await prisma.modelVariant.findMany({
        where: { modelId: selectedModel.id },
        select: { id: true, name: true, modelId: true },
        orderBy: { name: "asc" },
      })
    : [];

  return {
    makes,
    models,
    modelVariants,
    ranges: {
      minYear: ranges._min.year ?? 2000,
      maxYear: ranges._max.year ?? new Date().getFullYear(),
      minPrice: ranges._min.price ?? 0,
      maxPrice: ranges._max.price ?? 150000,
      minReading: ranges._min.odoReading ?? 0,
      maxReading: ranges._max.odoReading ?? 200000,
    },
  };
};

async function InventoryFilterSidebar({
  searchParams,
}: {
  searchParams: Promise<InventorySearchParams>;
}) {
  const resolved = await searchParams;
  const taxonomies = await fetchTaxonomies(
    getQueryValue(resolved.make),
    getQueryValue(resolved.model),
  );

  return <FilterSidebar taxonomies={taxonomies} />;
}

async function InventoryResults({
  searchParams,
}: {
  searchParams: Promise<InventorySearchParams>;
}) {
  const resolved = await searchParams;
  const rawPage = getQueryValue(resolved.page);
  const pageResult = pageSchema.safeParse(rawPage);
  const requestedPage = pageResult.success ? pageResult.data : 1;
  const filters = inventoryFiltersSchema.parse({
    q: getQueryValue(resolved.q),
    make: getQueryValue(resolved.make),
    model: getQueryValue(resolved.model),
    modelVariant: getQueryValue(resolved.modelVariant),
    minYear: getQueryValue(resolved.minYear),
    maxYear: getQueryValue(resolved.maxYear),
    minPrice: getQueryValue(resolved.minPrice),
    maxPrice: getQueryValue(resolved.maxPrice),
    minReading: getQueryValue(resolved.minReading),
    maxReading: getQueryValue(resolved.maxReading),
    odoUnit: getQueryValue(resolved.odoUnit),
    transmission: getQueryValue(resolved.transmission),
    fuelType: getQueryValue(resolved.fuelType),
    bodyType: getQueryValue(resolved.bodyType),
    color: getQueryValue(resolved.color),
    drivetrain: getQueryValue(resolved.drivetrain),
    doors: getQueryValue(resolved.doors),
  });

  const [data, sourceId] = await Promise.all([
    fetchInventoryData(requestedPage, filters),
    getSourceId(),
  ]);

  const members = sourceId ? await redis.smembers(sourceId) : [];
  const favourites: Favourites = { ids: members.map(Number) };
  const { classifieds, total, totalPages } = data;

  if (total === 0) {
    return (
      <div className="grid grid-cols-1 gap-6 rounded-xl border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">No vehicles found matching your filters.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <p className="text-muted-foreground">We have found {total} classifieds</p>
      <ClassifiedsList classifieds={classifieds} favourites={favourites} />
      {totalPages > 1 && <CustomPagination totalPages={totalPages} />}
    </div>
  );
}

export default function InventoryPage({ searchParams }: CustomPageProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Vehicle Inventory
        </h1>
        <p className="text-muted-foreground">
          Browse, filter, and manage vehicle listings.
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <Suspense
          fallback={
            <div className="hidden h-[200px] w-[280px] animate-pulse rounded-xl border bg-card lg:block" />
          }
        >
          <InventoryFilterSidebar searchParams={searchParams} />
        </Suspense>

        <div className="flex-1">
          <Suspense
            fallback={
              <p className="text-sm text-muted-foreground">
                Loading inventory...
              </p>
            }
          >
            <InventoryResults searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

