export const routes = {
  home: "/",
  inventory: "/inventory",
  singleClassified: (slug: string) => `/inventory/${slug}`,
  favourites: "/favourites",
} as const;
