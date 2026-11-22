import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { redis, ratelimit } from "@/lib/redis-store";
import { setSourceId } from "@/lib/source-id";
import { routes } from "@/config/routes";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? "127.0.0.1";
  const { success } = await ratelimit.limit(ip);
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await req.json();
  const schema = z.object({ id: z.number().int() });
  const result = schema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { id } = result.data;
  const sourceId = await setSourceId();

  const isFavourite = await redis.sismember(sourceId, id.toString());
  
  if (isFavourite) {
    await redis.srem(sourceId, id.toString());
  } else {
    await redis.sadd(sourceId, id.toString());
  }

  const members = await redis.smembers(sourceId);
  revalidatePath(routes.favourites);
  revalidatePath(routes.inventory);

  return NextResponse.json({ ids: members.map(Number) }, { status: 200 });
}
