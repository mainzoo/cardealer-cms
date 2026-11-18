import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
import sharp from "sharp";
import { rgbaToThumbHash } from "thumbhash";
import { imageSources } from "../../config/constants";

const thumbhashCache = new Map<string, string>();

const fallbackThumbHash = Buffer.from(
    rgbaToThumbHash(1, 1, new Uint8Array([128, 128, 128, 255]))
).toString("base64");

async function createThumbHash(src: string): Promise<string> {
    const cached = thumbhashCache.get(src);
    if (cached) return cached;

    try {
        const response = await fetch(src, { signal: AbortSignal.timeout(10_000) });
        if (!response.ok) throw new Error(`Image request failed with status ${response.status}`);

        const image = await sharp(await response.arrayBuffer())
            .resize({ width: 64, height: 64, fit: "inside", withoutEnlargement: true })
            .ensureAlpha()
            .raw()
            .toBuffer({ resolveWithObject: true });

        const thumbhash = rgbaToThumbHash(image.info.width, image.info.height, image.data);
        const encoded = Buffer.from(thumbhash).toString("base64");
        thumbhashCache.set(src, encoded);
        return encoded;
    } catch (error) {
        thumbhashCache.set(src, fallbackThumbHash);
        console.warn(`Could not generate ThumbHash for ${src}:`, error instanceof Error ? error.message : error);
        return fallbackThumbHash;
    }
}

export async function seedImages(prisma: PrismaClient) {
    console.time("seedImages");
    console.log("Generating images for classifieds using Faker...");

    const classifieds = await prisma.classified.findMany();

    if (classifieds.length === 0) {
        console.warn("No classifieds found in database. Please seed classifieds first.");
        return;
    }

    let totalImages = 0;

    for (const classified of classifieds) {
        const imageCount = faker.number.int({ min: 3, max: 6 });

        for (let i = 0; i < imageCount; i++) {
            const isMain = i === 0;
            const carWidth = faker.helpers.arrayElement([800, 1024, 1280]);
            const photoId = faker.helpers.arrayElement(imageSources);
            const src = `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=${carWidth}&q=80`;

            const alt = `${classified.title} - Photo ${i + 1}`;
            const thumbhash = await createThumbHash(src);

            await prisma.image.create({
                data: {
                    src,
                    alt,
                    thumbhash,
                    isMain,
                    classifiedId: classified.id,
                },
            });

            totalImages++;
        }
    }

    console.log(`Successfully generated ${totalImages} images for ${classifieds.length} classifieds!`);
    console.timeEnd("seedImages");
}
