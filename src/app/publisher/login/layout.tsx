import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.adsaro.com/";

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: "/publisher/login",
    },
  };
}

export default function PublisherLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
