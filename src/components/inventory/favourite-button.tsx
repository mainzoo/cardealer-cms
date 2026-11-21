"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FavouriteButtonProps {
    classifiedId?: number;
    initialFavorited?: boolean;
    onToggle?: (id?: number, favorited?: boolean) => void;
    className?: string;
}

export const FavouriteButton = ({
    classifiedId,
    initialFavorited = false,
    onToggle,
    className,
}: FavouriteButtonProps) => {
    const [isFavorited, setIsFavorited] = useState(initialFavorited);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();

        const nextState = !isFavorited;
        setIsFavorited(nextState);
        if (onToggle) {
            onToggle(classifiedId, nextState);
        }
    };

    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClick}
            aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
            className={cn(
                "absolute top-3 right-3 z-10 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-xs transition-all duration-200 h-8 w-8 lg:h-9 lg:w-9 p-0",
                isFavorited && "bg-black/60 text-rose-500",
                className
            )}
        >
            <Heart
                className={cn(
                    "w-4 h-4 lg:w-5 lg:h-5 transition-all duration-200",
                    isFavorited ? "fill-rose-500 text-rose-500 scale-110" : "text-white hover:text-rose-400"
                )}
            />
        </Button>
    );
};
