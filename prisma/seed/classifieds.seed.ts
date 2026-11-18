import { PrismaClient, ClassifiedStatus, Transmission, FuelType, BodyType, Color, Drivetrain, CurrencyCode, OdoUnit } from "@prisma/client";
import { faker } from "@faker-js/faker";

export async function seedClassifieds(prisma: PrismaClient, count: number = 50) {
    console.time("seedClassifieds");
    console.log(`Generating ${count} classifieds using Faker...`);

    const makes = await prisma.make.findMany({
        include: {
            models: {
                include: {
                    modelVariants: true,
                },
            },
        },
    });

    if (makes.length === 0) {
        console.warn("No makes found in database. Please seed taxonomy first.");
        return;
    }

    const statuses = Object.values(ClassifiedStatus);
    const transmissions = Object.values(Transmission);
    const fuelTypes = Object.values(FuelType);
    const bodyTypes = Object.values(BodyType);
    const colors = Object.values(Color);
    const drivetrains = Object.values(Drivetrain);

    const possibleFeatures = [
        "Bluetooth", "Backup Camera", "Leather Seats", "Sunroof", "Navigation System",
        "Heated Seats", "Apple CarPlay", "Android Auto", "Keyless Entry", "Parking Sensors",
        "Blind Spot Monitor", "Adaptive Cruise Control", "LED Headlights", "Alloy Wheels"
    ];

    for (let i = 0; i < count; i++) {
        const make = faker.helpers.arrayElement(makes);
        if (!make.models || make.models.length === 0) continue;
        const model = faker.helpers.arrayElement(make.models);
        const variant = model.modelVariants && model.modelVariants.length > 0
            ? faker.helpers.arrayElement(model.modelVariants)
            : null;

        const year = faker.number.int({ min: 2012, max: 2026 });
        const title = `${year} ${make.name} ${model.name}${variant ? ` ${variant.name}` : ""}`;
        const slug = faker.helpers.slugify(`${title}-${faker.string.alphanumeric(6)}`).toLowerCase();
        const vin = faker.vehicle.vin();

        const price = faker.number.int({ min: 8000, max: 95000 });
        const odoReading = faker.number.int({ min: 1000, max: 150000 });
        const doors = faker.helpers.arrayElement([2, 4, 5]);
        const seats = faker.helpers.arrayElement([2, 4, 5, 7]);

        const featuresCount = faker.number.int({ min: 2, max: 6 });
        const features = faker.helpers.arrayElements(possibleFeatures, featuresCount);

        await prisma.classified.create({
            data: {
                title,
                slug,
                vin,
                year,
                price,
                odoReading,
                doors,
                seats,
                makeId: make.id,
                modelId: model.id,
                modelVariantId: variant ? variant.id : null,
                status: faker.helpers.arrayElement(statuses),
                transmission: faker.helpers.arrayElement(transmissions),
                fuelType: faker.helpers.arrayElement(fuelTypes),
                bodyType: faker.helpers.arrayElement(bodyTypes),
                color: faker.helpers.arrayElement(colors),
                drivetrain: faker.helpers.arrayElement(drivetrains),
                currency: CurrencyCode.USD,
                odoUnit: OdoUnit.MILES,
                features,
                views: faker.number.int({ min: 10, max: 2500 }),
                description: faker.lorem.paragraph(),
            },
        });
    }

    console.log("Classifieds seeding completed successfully!");
    console.timeEnd("seedClassifieds");
}
