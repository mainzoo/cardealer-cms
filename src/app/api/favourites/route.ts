import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { redis } from "@/lib/redis-store";
import { setSourceId } from "@/lib/source-id";
import { routes } from "@/config/routes";
import type { Favourites } from "@/config/types";

export async function POST(req: Request) {
  const body = await req.json();
  const schema = z.object({ id: z.number().int() });
  const result = schema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { id } = result.data;
  const sourceId = await setSourceId();

  let favourites = await redis.get<Favourites>(sourceId);
  if (!favourites) {
    favourites = { ids: [] };
  }

  const index = favourites.ids.indexOf(id);
  if (index > -1) {
    favourites.ids.splice(index, 1);
  } else {
    favourites.ids.push(id);
  }

  await redis.set(sourceId, favourites);
  revalidatePath(routes.favourites);

  return NextResponse.json({ ids: favourites.ids }, { status: 200 });
}
