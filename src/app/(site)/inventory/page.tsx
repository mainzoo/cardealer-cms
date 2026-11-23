import { Prisma } from "@prisma/client"
import { Suspense } from "react";
import { connection } from "next/server";
import { z } from "zod";
import { ClassifiedsList } from "@/components/inventory/classifieds-list";
import { CustomPagination } from "@/components/shared/custom-pagination";
import { CLASSIFIEDS_PER_PAGE } from "@/config/constants";
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

const fetchInventoryData = async (
  requestedPage: number,
  filters: { q?: string },
) => {
  await connection();

  const where: Prisma.ClassifiedWhereInput = {
    ...(filters.q
      ? {
          title: {
            contains: filters.q,
            mode: "insensitive",
          },
        }
      : {}),
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

async function InventoryResults({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolved = await searchParams;
  const rawPage = Array.isArray(resolved.page) ? resolved.page[0] : resolved.page;
  const pageResult = pageSchema.safeParse(rawPage);
  const requestedPage = pageResult.success ? pageResult.data : 1;
  
  const rawQ = Array.isArray(resolved.q) ? resolved.q[0] : resolved.q;
  const filters = rawQ?.trim() ? { q: rawQ.trim() } : {};


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
          <FilterSidebar />
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

