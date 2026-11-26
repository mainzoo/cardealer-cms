import React from "react";
import Link from "next/link";
import { routes } from "@/config/routes";
import { navLinks } from "@/config/constants";
import {
  SiFacebook,
  SiInstagram,
  SiX,
  SiYoutube,
} from "@icons-pack/react-simple-icons";

const socialLinks = [
  { name: "Facebook", href: "https://facebook.com", icon: SiFacebook },
  { name: "Instagram", href: "https://instagram.com", icon: SiInstagram },
  { name: "X", href: "https://x.com", icon: SiX },
  { name: "YouTube", href: "https://youtube.com", icon: SiYoutube },
] as const;

export function PublicFooter() {
  const currentYear = 2026;

  return (
    <footer className="border-t border-border bg-card text-foreground">
      <div className="mx-auto w-full max-w-screen-2xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Top 3-column grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Column 1: Brand & Socials */}
          <div className="flex flex-col gap-4">
            <Link
              href={routes.home}
              className="text-xl font-bold tracking-tight text-foreground"
            >
              CarDealer CMS
            </Link>
            <p className="text-sm text-muted-foreground">
              Your premier destination for finding, comparing, and managing
              exceptional vehicles with confidence and ease.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visit our ${social.name} page`}
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    <IconComponent className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Column 2: Quick Navigation */}
          <div className="flex flex-col gap-4">
            <h3 className="font-heading text-base font-semibold uppercase tracking-wider text-foreground">
              Quick Links
            </h3>
            <ul className="flex flex-col gap-2.5">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Newsletter (Prepared Space) */}
          <div className="flex flex-col gap-4">
            <h3 className="font-heading text-base font-semibold uppercase tracking-wider text-foreground">
              Stay Updated
            </h3>
            <p className="text-sm text-muted-foreground">
              Subscribe to receive updates on newly arrived inventory, special
              promotions, and exclusive automotive insights.
            </p>
            <div className="rounded-lg border border-border bg-background p-4 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
                Newsletter Form
              </span>
              <p className="mt-1">
                Coming soon! Integrated subscription management will be available
                here.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Legal & Corporate Info */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-center text-sm text-muted-foreground sm:flex-row">
          <p>&copy; {currentYear} CarDealer CMS. All rights reserved.</p>
          <p className="text-xs">
            Dealer License #123456789 &bull; EIN: 12-3456789
          </p>
        </div>
      </div>
    </footer>
  );
}