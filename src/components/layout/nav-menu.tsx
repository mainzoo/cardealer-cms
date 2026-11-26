"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks } from "@/config/constants";
import { cn } from "cn";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export { navLinks };

export function DesktopNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main navigation" className="hidden md:flex items-center gap-6">
      {navLinks.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "font-heading text-xs md:text-sm font-semibold uppercase tracking-wider transition-colors",
              isActive
                ? "text-primary"
                : "text-foreground/80 hover:text-primary"
            )}
          >
            {link.name}
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileNav() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open navigation menu"
              className="text-foreground"
            >
              <Menu className="h-5 w-5" />
            </Button>
          }
        />
        <SheetContent side="right" className="bg-background text-foreground">
          <SheetHeader>
            <SheetTitle className="text-left font-heading text-lg font-bold">
              CarDealer CMS
            </SheetTitle>
          </SheetHeader>
          <nav aria-label="Mobile navigation" className="flex flex-col gap-2 px-4 py-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center rounded-md px-3 py-2.5 font-heading text-base font-semibold uppercase tracking-wide transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/80 hover:bg-muted hover:text-foreground"
                  )}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}
