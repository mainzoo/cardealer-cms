import React from "react";
import { PublicHeader } from "@/components/layout/header";
import { ContactBanner } from "@/components/layout/contact-banner";
import { PublicFooter } from "@/components/layout/footer";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      <main className="flex-1 mx-auto w-full max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
      <ContactBanner />
      <PublicFooter />
    </div>
  );
}

