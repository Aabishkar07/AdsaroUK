import React from "react";
import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.adsaro.com/";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const res = await fetch(
      `https://adsaro.net/api/advertisingformats/${slug}`,
      { cache: "no-store", next: { revalidate: 0 } }
    );

    if (!res.ok) {
      console.error("[adformat][slug] metadata fetch failed", slug, res.status);
      return {
        title: { absolute: "Ad Format | Adsaro" },
        description: "Advertising solutions by Adsaro",
        metadataBase: new URL(SITE_URL),
        alternates: {
          canonical: `/adformat/${slug}`,
        },
      };
    }

    const json = await res.json();
    const data = json.data || json;

  const title = data?.meta_title || "Ad Format | Adsaro";
  const description = data?.meta_description || "Advertising solutions by Adsaro";
  const keywordsRaw = data?.keywords || "";
  const keywords = Array.isArray(keywordsRaw)
    ? keywordsRaw
    : String(keywordsRaw)
        .split(",")
        .map((k: string) => k.trim())
        .filter(Boolean);
  const imageUrl = data.image ? `https://adsaro.net/uploads/${data.image}` : undefined;
  const imageAlt = data?.img_alt || data?.title || title;

    return {
      title: { absolute: title },
      description,
      keywords,
      metadataBase: new URL(SITE_URL),
      alternates: {
        canonical: `/adformat/${slug}`,
      },
      openGraph: {
        title,
        description,
        url: `${SITE_URL.replace(/\/$/, "")}/adformat/${slug}`,
        type: "website",
        images: imageUrl
          ? [
              {
                url: imageUrl,
                alt: imageAlt,
              },
            ]
          : [],
      },
      twitter: {
        card: imageUrl ? "summary_large_image" : "summary",
        title,
        description,
        images: imageUrl ? [{ url: imageUrl, alt: imageAlt }] : [],
      },
    };
  } catch (e) {
    console.error("[adformat][slug] metadata exception", slug, e);
    return {
      title: { absolute: "Ad Format | Adsaro" },
      description: "Advertising solutions by Adsaro",
      metadataBase: new URL(SITE_URL),
      alternates: {
        canonical: `/adformat/${slug}`,
      },
    };
  }
}

export default function Layout({ children }: LayoutProps) {
  return <div>{children}</div>;
}
