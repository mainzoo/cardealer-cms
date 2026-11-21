import type { Metadata } from "next";
import "./globals.css";
import { Mulish, Roboto } from "next/font/google";
import { cn } from "@/lib/utils";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "sonner";
import { NuqsAdapter } from "nuqs/adapters/next/app";

export const metadata: Metadata = {
  title: "Car Dealer CMS",
  description: "Car dealer CMS Application with IA",
};

const mulish = Mulish({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  weight: "variable",
});

const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: "400",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-full flex flex-col antialiased overscroll-none bg-background",
          roboto.variable,
          mulish.variable
        )}
      >
        <NextTopLoader showSpinner={false} />
        <NuqsAdapter>{children}</NuqsAdapter>
        <Toaster />
      </body>
    </html>
  );
}