export const imageSources = [
    "1503376780353-7e6692767b70",
    "1552519507-da3b142c6e3d",
    "1541348263662-e0626628d0cf",
    "1533473359331-0135ef1b58bf",
    "1583121274602-3e2820c69888",
    "1563720223185-11003d516935",
    "1555215695-3004980ad54e",
    "1617814076367-b759c7d7e738",
] as const;

export const CLASSIFIEDS_PER_PAGE = 9;

import { routes } from "@/config/routes";

export const navLinks = [
  { name: "Home", href: routes.home },
  { name: "Inventory", href: routes.inventory },
  { name: "Favourites", href: routes.favourites },
] as const;


