import { Suspense } from "react";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis-store";
import { getSourceId } from "@/lib/source-id";
import { ClassifiedsList } from "@/components/inventory/classifieds-list";
import { Favourites } from "@/config/types";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const PAGE_SIZE = 12;

const fetchInventoryData = async (page: number) => {
  await connection();
  const [classifieds, total] = await Promise.all([
    prisma.classified.findMany({
      include: { images: true },
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    prisma.classified.count(),
  ]);
  return { classifieds, total };
};

async function InventoryResults({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page) || 1;

  const [data, sourceId] = await Promise.all([
    fetchInventoryData(page),
    getSourceId(),
  ]);

  const members = sourceId ? await redis.smembers(sourceId) : [];
  const favourites: Favourites = { ids: members.map(Number) };
  
  const { classifieds, total } = data;
  const totalPages = Math.ceil(total / PAGE_SIZE);

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
      
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href={`?page=${Math.max(1, page - 1)}`} />
            </PaginationItem>
            {Array.from({ length: totalPages }).map((_, i) => (
              <PaginationItem key={i + 1}>
                <PaginationLink href={`?page=${i + 1}`} isActive={page === i + 1}>
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext href={`?page=${Math.min(totalPages, page + 1)}`} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}

export default function InventoryPage({ 
    searchParams 
}: { 
    searchParams: Promise<{ page?: string }> 
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Vehicle Inventory</h1>
        <p className="text-muted-foreground">
          Browse, filter, and manage vehicle listings in real-time.
        </p>
      </div>

      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading inventory...</p>}>
        <InventoryResults searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
