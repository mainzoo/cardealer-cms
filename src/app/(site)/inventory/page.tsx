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

const pageSchema = z
  .string()
  .regex(/^\d+$/)
  .transform(Number)
  .pipe(z.number().positive());

const fetchInventoryData = async (requestedPage: number) => {
  await connection();

  const total = await prisma.classified.count();
  const totalPages = Math.max(1, Math.ceil(total / CLASSIFIEDS_PER_PAGE));
  const safePage = Math.min(requestedPage, totalPages);

  const classifieds = await prisma.classified.findMany({
    include: {
      images: {
        take: 1,
        orderBy: { isMain: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
    take: CLASSIFIEDS_PER_PAGE,
    skip: (safePage - 1) * CLASSIFIEDS_PER_PAGE,
  });

  return { classifieds, total, totalPages };
};

async function InventoryResults({
  searchParams,
}: {
  searchParams: CustomPageProps["searchParams"];
}) {
  const resolvedSearchParams = await searchParams;
  const rawPage = Array.isArray(resolvedSearchParams.page)
    ? resolvedSearchParams.page[0]
    : resolvedSearchParams.page;

  const pageResult = pageSchema.safeParse(rawPage);
  const requestedPage = pageResult.success ? pageResult.data : 1;

  const [data, sourceId] = await Promise.all([
    fetchInventoryData(requestedPage),
    getSourceId(),
  ]);

  const members = sourceId ? await redis.smembers(sourceId) : [];
  const favourites: Favourites = { ids: members.map(Number) };
  const { classifieds, total, totalPages } = data;

  if (total === 0) {
    return (
      <div className="grid grid-cols-1 gap-6 rounded-xl border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No vehicles found in inventory.
        </p>
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
          Browse, filter, and manage vehicle listings in real-time.
        </p>
      </div>

      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">Loading inventory...</p>
        }
      >
        <InventoryResults searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
