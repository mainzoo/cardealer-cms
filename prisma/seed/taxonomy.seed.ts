import { PrismaClient } from "@prisma/client";
import { parse } from "csv";
import fs from "node:fs";

type Row = {
    make: string;
    model: string;
    variant?: string | undefined;
    yearStart: number;
    yearEnd: number;
}

export async function seedTaxonomy(prisma: PrismaClient) {
    console.time("seedTaxonomy");

    const seedLimit = process.env.SEED_LIMIT ? Number(process.env.SEED_LIMIT) : undefined;

    const rows = await new Promise<Row[]>((resolve, reject) => {
        const eachRow: Row[] = [];
        let count = 0;
        fs.createReadStream("prisma/seed/data/taxonomy.csv")
            .pipe(parse({ columns: true }))
            .on("data", (row: {[key: string]: string}) => {
                if (!row.Make || !row.Model) return;
                if (seedLimit && count >= seedLimit) return;
                eachRow.push({
                    make: row.Make.trim(),
                    model: row.Model.trim(),
                    variant: row.Model_Variant ? row.Model_Variant.trim() : undefined,
                    yearStart: Number(row.Year_Start) || 2000,
                    yearEnd: Number(row.Year_End) || new Date().getFullYear(),
                });
                count++;
            })
            .on("end", () => {
                resolve(eachRow);
            })
            .on("error", (error: Error) => {
                reject(error);
            });
    });

    console.log(`Parsed ${rows.length} rows from taxonomy.csv. Seeding database...`);

    const taxonomyMap = new Map<string, Map<string, Map<string, { yearStart: number; yearEnd: number }>>>();

    for (const row of rows) {
        if (!taxonomyMap.has(row.make)) {
            taxonomyMap.set(row.make, new Map());
        }
        const modelsMap = taxonomyMap.get(row.make)!;

        if (!modelsMap.has(row.model)) {
            modelsMap.set(row.model, new Map());
        }
        const variantsMap = modelsMap.get(row.model)!;

        if (row.variant) {
            variantsMap.set(row.variant, {
                yearStart: row.yearStart,
                yearEnd: row.yearEnd,
            });
        }
    }

    const makeEntries = Array.from(taxonomyMap.entries());
    const batchSize = 20; // Procesar 20 marcas en paralelo por lote

    for (let i = 0; i < makeEntries.length; i += batchSize) {
        const batch = makeEntries.slice(i, i + batchSize);
        await Promise.all(
            batch.map(async ([makeName, modelsMap]) => {
                const imageUrl = `https://vl.imgix.net/img/${makeName.replace(/\s+/g, '-').toLowerCase()}-logo.png?auto=format,compress`;

                const make = await prisma.make.upsert({
                    where: { name: makeName },
                    update: { image: imageUrl },
                    create: {
                        name: makeName,
                        image: imageUrl,
                    },
                });

                for (const [modelName, variantsMap] of modelsMap.entries()) {
                    const model = await prisma.model.upsert({
                        where: {
                            name_makeId: {
                                name: modelName,
                                makeId: make.id,
                            },
                        },
                        update: {},
                        create: {
                            name: modelName,
                            makeId: make.id,
                        },
                    });

                    for (const [variantName, years] of variantsMap.entries()) {
                        await prisma.modelVariant.upsert({
                            where: {
                                name_modelId: {
                                    name: variantName,
                                    modelId: model.id,
                                },
                            },
                            update: {
                                yearStart: years.yearStart,
                                yearEnd: years.yearEnd,
                            },
                            create: {
                                name: variantName,
                                modelId: model.id,
                                yearStart: years.yearStart,
                                yearEnd: years.yearEnd,
                            },
                        });
                    }
                }
            })
        );
    }

    console.log("Taxonomy seeding completed successfully!");
    console.timeEnd("seedTaxonomy");
}
