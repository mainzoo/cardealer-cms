import { Suspense } from "react";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis-store";
import { getSourceId } from "@/lib/source-id";
import { ClassifiedsList } from "@/components/inventory/classifieds-list";
import { Favourites } from "@/config/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { routes } from "@/config/routes";

const fetchFavouritesData = async (ids: number[]) => {
  return prisma.classified.findMany({
    where: {
      id: { in: ids },
    },
    include: {
      images: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

async function FavouritesResults() {
  await connection();

  const sourceId = await getSourceId();
  const favourites = sourceId ? await redis.get<Favourites>(sourceId) : null;
  const ids = favourites?.ids ?? [];

  if (ids.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed p-12 text-center">
        <p className="text-muted-foreground">You haven&apos;t saved any vehicles yet.</p>
        <Button nativeButton={false} render={<Link href={routes.inventory} />}>
          Explore Inventory
        </Button>
      </div>
    );
  }

  const classifieds = await fetchFavouritesData(ids);

  return <ClassifiedsList classifieds={classifieds} favourites={favourites} />;
}

export default function FavouritesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Your Favourites</h1>
        <p className="text-muted-foreground">Manage your saved vehicles.</p>
      </div>

      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading favourites...</p>}>
        <FavouritesResults />
      </Suspense>
    </div>
  );
}
