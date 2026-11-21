import { Suspense } from "react";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis-store";
import { getSourceId } from "@/lib/source-id";
import { ClassifiedsList } from "@/components/inventory/classifieds-list";
import { Favourites } from "@/config/types";

const fetchInventoryData = async () => {
  await connection();
  return prisma.classified.findMany({
    include: {
      images: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

async function InventoryResults() {
  const [classifieds, sourceId] = await Promise.all([
    fetchInventoryData(),
    getSourceId(),
  ]);

  const favourites = sourceId ? await redis.get<Favourites>(sourceId) : null;

  if (classifieds.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-6 rounded-xl border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No vehicles found in inventory.
        </p>
      </div>
    );
  }

  return <ClassifiedsList classifieds={classifieds} favourites={favourites} />;
}

export default function InventoryPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Vehicle Inventory</h1>
        <p className="text-muted-foreground">
          Browse, filter, and manage vehicle listings in real-time.
        </p>
      </div>

      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading inventory...</p>}>
        <InventoryResults />
      </Suspense>
    </div>
  );
}
