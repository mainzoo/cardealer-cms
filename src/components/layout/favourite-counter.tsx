import Link from "next/link";
import { Heart } from "lucide-react";
import { redis } from "@/lib/redis-store";
import { getSourceId } from "@/lib/source-id";
import { routes } from "@/config/routes";
import { Favourites } from "@/config/types";

export async function FavouriteCounter() {
  const sourceId = await getSourceId();
  const favourites = sourceId ? await redis.get<Favourites>(sourceId) : null;
  const count = favourites?.ids.length ?? 0;

  return (
    <Link
      href={routes.favourites}
      className="relative flex items-center justify-center h-10 w-10 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
    >
      <Heart className="h-5 w-5 fill-rose-500 text-rose-500" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
          {count}
        </span>
      )}
    </Link>
  );
}
