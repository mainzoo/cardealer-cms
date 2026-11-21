"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { endpoints } from "@/config/endpoints";

interface FavouriteButtonProps {
    classifiedId: number;
    isFavourite: boolean;
    className?: string;
}

export const FavouriteButton = ({
    classifiedId,
    isFavourite: initialIsFavourite,
    className,
}: FavouriteButtonProps) => {
    const [isFavourite, setIsFavourite] = useState(initialIsFavourite);
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = async () => {
        setIsLoading(true);
        const previousState = isFavourite;
        setIsFavourite(!previousState);

        try {
            const response = await fetch(endpoints.favourites, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: classifiedId }),
            });

            if (!response.ok) {
                throw new Error("Failed to update");
            }
        } catch (error) {
            setIsFavourite(previousState);
            console.error("Error updating favorite:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClick}
            disabled={isLoading}
            aria-label={isFavourite ? "Remove from favorites" : "Add to favorites"}
            className={cn(
                "absolute top-3 right-3 z-10 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-xs transition-all duration-200 h-8 w-8 lg:h-9 lg:w-9 p-0",
                isFavourite && "bg-black/60 text-rose-500",
                className
            )}
        >
            <Heart
                className={cn(
                    "w-4 h-4 lg:w-5 lg:h-5 transition-all duration-200",
                    isFavourite ? "fill-rose-500 text-rose-500 scale-110" : "text-white hover:text-rose-400"
                )}
            />
        </Button>
    );
};
