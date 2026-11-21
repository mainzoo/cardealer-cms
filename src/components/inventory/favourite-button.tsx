"use client";

import { useState } from "react";
import { HTTPError } from "ky";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { endpoints } from "@/config/endpoints";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";

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
	const router = useRouter();

	const handleClick = async () => {
		setIsLoading(true);
		const previousState = isFavourite;
		setIsFavourite(!previousState);

		try {
			const { ids } = await api.post<{ ids: number[] }>(endpoints.favourites, {
				json: { id: classifiedId },
				retry: 0,
			});

			setIsFavourite(ids.includes(classifiedId));
			router.refresh();
		} catch (error) {
			setIsFavourite(previousState);

			if (error instanceof HTTPError && error.response.status === 429) {
				toast.warning("Too many requests. Please wait a few seconds.");
			} else {
				toast.error("Failed to update favourites");
			}
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
				className,
			)}
		>
			<Heart
				className={cn(
					"w-4 h-4 lg:w-5 lg:h-5 transition-all duration-200",
					isFavourite
						? "fill-rose-500 text-rose-500 scale-110"
						: "text-white hover:text-rose-400",
				)}
			/>
		</Button>
	);
};
