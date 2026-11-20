import { ClassifiedWithImages } from "@/config/types";
import { ClassifiedCard } from "./classified-card";

interface ClassifiedsListProps {
    classifieds: ClassifiedWithImages[];
}

export const ClassifiedsList = (props: ClassifiedsListProps) => {
    const { classifieds } = props;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {classifieds.map((classified) => (
                <ClassifiedCard key={classified.id} classified={classified} />
            ))}
        </div>
    );
};
