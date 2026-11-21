import { Prisma } from "@prisma/client";

export type SearchParams = Record<string, string | string[] | undefined>;

export type RouteParams = Record<string, string | string[]>;

export type CustomPageProps<
    TParams extends RouteParams = RouteParams,
    TSearchParams extends SearchParams = SearchParams,
> = {
    params: Promise<TParams>;
    searchParams: Promise<TSearchParams>;
};

export type AwaitedPageProps<
    TParams extends RouteParams = RouteParams,
    TSearchParams extends SearchParams = SearchParams,
> = {
    params: TParams;
    searchParams: TSearchParams;
};

export type ClassifiedWithImages = Prisma.ClassifiedGetPayload<{
    include: {
        images: true;
    }
}>;

export type Favourites = { ids: number[] };

