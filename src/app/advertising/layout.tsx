// app/about/layout.tsx
import React from "react";
import { generateDynamicMetadata } from "@/lib/generateDynamicMetadata";
import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.adsaro.com/";

export async function generateMetadata(): Promise<Metadata> {
  // Sends 'about' to your dynamic metadata function
  const metadata = await generateDynamicMetadata("advertising");

  return {
    ...metadata,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: "/advertising",
    },
  };
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {/* Optional wrapper content like header or sidebar */}
      {children}
    </div>
  );
}
