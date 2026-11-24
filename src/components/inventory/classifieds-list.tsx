import { ClassifiedWithImages, Favourites } from "@/config/types";
import { ClassifiedCard } from "./classified-card";

interface ClassifiedsListProps {
    classifieds: ClassifiedWithImages[];
    favourites: Favourites | null;
}

export const ClassifiedsList = (props: ClassifiedsListProps) => {
    const { classifieds, favourites } = props;

    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {classifieds.map((classified) => (
                <ClassifiedCard 
                    key={classified.id} 
                    classified={classified} 
                    favourites={favourites} 
                />
            ))}
        </div>
    );
};
