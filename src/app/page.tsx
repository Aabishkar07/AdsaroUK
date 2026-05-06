

import MainNavbar from "@/components/mainnavbar";
import Footer from "@/components/footer";

import type { Metadata } from "next";

import { AwesomeFeature } from "@/components/awesome";
import { Foradvertiser } from "@/components/Foradvertiser";
import { Forpublisher } from "@/components/Forpublisher";
import { Ourgoal } from "@/components/Ourgoal";
import { Services } from "@/components/Services";

import FrontBlog from "@/components/blog/FrontBlog";
import HeroSection from "./homepage/herosection";
import CTASection from "./homepage/cta";
import FAQSection from "./homepage/faq";
import Carousel from "@/components/carousel";
import { generateDynamicMetadata } from "@/lib/generateDynamicMetadata";
import HomepageAbout from "./homepage/about";
import AdsaroSection from "../components/ads";  
import HomepageLoader from "../components/HomepageLoader";
import ReviewSection from "./homepage/review";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.adsaro.com";

export async function generateMetadata(): Promise<Metadata> {
  const metadata = await generateDynamicMetadata("home");

  return {
    ...metadata,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: new URL("/", SITE_URL),
    },
  };
}

export default async function Home() {
  let descriptionHtml = "";
  try {
    const res = await fetch("https://adsaro.net/api/homemain", {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const json = await res.json();
      descriptionHtml = json?.data?.[0]?.description ?? "";
    }
  } catch {
    descriptionHtml = "";
  }

  return (
    <HomepageLoader>
      {/* Parallax background wrapper */}
   <div className="relative overflow-hidden">
  {/* Background image with low opacity */}
  <div
    className="absolute inset-0 -z-10"
    style={{
      backgroundImage: "url('/bg.webp')",
      backgroundAttachment: "fixed", // parallax effect
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      backgroundSize: "cover",
      opacity: 0.02, // <--- set image opacity here
    }}
  />

  {/* Page content */}
  <div className="relative z-10">
    <MainNavbar />
    <HeroSection descriptionHtml={descriptionHtml} />
    <Carousel />
    <Services />
    <HomepageAbout />
    <Foradvertiser />
    <Forpublisher />
    <AwesomeFeature />
    <AdsaroSection />
    <FrontBlog />
    <ReviewSection />
    <FAQSection />
    <CTASection />
    <Footer />
  </div>
</div>
    </HomepageLoader>
  );
}
