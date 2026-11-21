import "server-only";
import { cookies } from "next/headers";
import { v4 as uuid } from "uuid";

const COOKIE_NAME = "sourceId";

export async function setSourceId(): Promise<string> {
  const cookieStore = await cookies();
  let sourceId = cookieStore.get(COOKIE_NAME)?.value;

  if (!sourceId) {
    sourceId = uuid();
    (await cookies()).set(COOKIE_NAME, sourceId, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  }

  return sourceId;
}

export async function getSourceId(): Promise<string | undefined> {
  return (await cookies()).get(COOKIE_NAME)?.value;
}
