import type { Metadata } from "next";
import "./globals.css";

import { siteConfig } from "@/config/site";

import { ConvexClientProvider } from "@/components/providers/convex-provider";

import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: [
      {
        media: "(prefers-color-scheme: light)",
        url: "logo.svg",
        href: "logo.svg",
      },
      {
        media: "(prefers-color-scheme: dark)",
        url: "logo.svg",
        href: "logo.svg",
      },
    ]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="dark w-full h-full">
        <Analytics/>
        <ConvexClientProvider>
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}
