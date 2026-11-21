import { routes } from "@/config/routes";
import { ClassifiedWithImages, Favourites } from "@/config/types";
import Image from "next/image";
import Link from "next/link";
import { HTMLParser } from "../shared/html-parser";
import { GaugeCircle, Cog, Fuel, Paintbrush } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FavouriteButton } from "./favourite-button";

interface ClassifiedCardProps {
    classified: ClassifiedWithImages;
    favourites: Favourites | null;
}

const getKeyClassifiedInfo = (classified: ClassifiedWithImages) => {
    return [
        {
            id: "odoReading",
            icon: <GaugeCircle className="w-4 h-4" />,
            value: `${classified.odoReading.toLocaleString()} ${classified.odoUnit}`,
        },
        {
            id: "transmission",
            icon: <Cog className="w-4 h-4" />,
            value: classified?.transmission?.toLowerCase(),
        },
        {
            id: "fuelType",
            icon: <Fuel className="w-4 h-4" />,
            value: classified?.fuelType?.toLowerCase(),
        },
        {
            id: "color",
            icon: <Paintbrush className="w-4 h-4" />,
            value: classified?.color?.toLowerCase(),
        },
    ];
};

export const ClassifiedCard = (props: ClassifiedCardProps) => {
    const { classified, favourites } = props;
    const isFavourite = favourites?.ids.includes(classified.id) ?? false;

    const mainImage = classified.images.find(img => img.isMain) || classified.images[0];

    return (
        <div className="group relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md flex flex-col justify-between">
            <div className="relative">
                <FavouriteButton classifiedId={classified.id} isFavourite={isFavourite} />
                <Link href={routes.singleClassified(classified.slug)} className="block">
                    <div className="aspect-[3/2] relative w-full overflow-hidden bg-muted">
                        <Image
                            placeholder="blur"
                            blurDataURL={mainImage?.thumbhash || "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="}
                            src={mainImage?.src || "/placeholder.svg"}
                            alt={mainImage?.alt || classified.title || "Vehicle"}
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            fill={true}
                            quality={80}
                        />
                    </div>
                </Link>
                <div className="p-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {classified.year}
                        </span>
                        <span className="text-lg font-bold text-primary">
                            ${classified.price.toLocaleString()}
                        </span>
                    </div>
                    <Link href={routes.singleClassified(classified.slug)}>
                        <h3 className="font-semibold tracking-tight line-clamp-1 hover:underline">
                            {classified.title || `${classified.year} Vehicle`}
                        </h3>
                    </Link>

                    {classified.description && (
                        <div className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            <HTMLParser html={classified.description} />
                        </div>
                    )}
                </div>
            </div>

            <div className="p-4 pt-0 border-t mt-2 flex flex-col gap-3">
                <ul className="grid grid-cols-2 gap-2 text-xs text-muted-foreground pt-3">
                    {getKeyClassifiedInfo(classified)
                        .filter((v) => Boolean(v.value))
                        .map(({ id, icon, value }) => (
                            <li key={id} className="flex items-center gap-1.5 capitalize">
                                {icon}
                                <span className="truncate">{value}</span>
                            </li>
                        ))}
                </ul>

                <div className="mt-2 flex flex-col lg:flex-row space-y-2 lg:space-y-0 lg:gap-x-2 w-full">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 transition-colors hover:border-white hover:bg-primary hover:text-white py-2 lg:py-2.5 h-full text-xs md:text-sm xl:text-base"
                        render={<Link href={routes.singleClassified(classified.slug)} />}
                    >
                        View details
                    </Button>
                </div>
            </div>
        </div>
    );
};
