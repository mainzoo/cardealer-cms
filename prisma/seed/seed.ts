import { prisma } from "../../lib/prisma";
import { seedTaxonomy } from "./taxonomy.seed";
import { seedClassifieds } from "./classifieds.seed";
import { seedImages } from "./images.seed";

async function main() {
    console.log("Seeding database...");
    await seedTaxonomy(prisma);
    await seedClassifieds(prisma, 30);
    await seedImages(prisma);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });