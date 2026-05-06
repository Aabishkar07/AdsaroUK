"use client";

import { useEffect, useState } from "react";
import MainNavbar from "@/components/mainnavbar";
import Footer from "@/components/footer";
import CTASection from "../homepage/cta";
import { ReactNode } from "react";
import { Services } from "@/components/Services";
import {
  CheckCircle2,
  Target,
  MousePointerClick,
  Eye,
  PlayCircle,
} from "lucide-react";
interface AboutData {
  id: number;
  title: string;
  description: string;
  main_image: string;
  secondary_image: string;
  secondary_description: string;
  third_description: string;
  fourth_description: string;
}

interface AboutPageSingleData {
  id: number;
  title: string;
  description: string;
  main_image: string;
  secondary_image: string;
  secondary_description: string;
  third_description: string;
  third_image: string | null;
  fourth_description: string | null;
}

interface AdvertisingSolution {
  title: string;
  description: string;
  image?: string;
  image_url?: string;
}
import {
  CheckCircle,
  BarChart3,
  ShieldCheck,
  Headphones,
  TrendingUp,
  Megaphone,
  Users,
} from "lucide-react";
export default function AboutPage() {
  const [data, setData] = useState<AboutData | null>(null);
  const [aboutPageSingle, setAboutPageSingle] = useState<AboutPageSingleData | null>(null);
  const [solutions, setSolutions] = useState<AdvertisingSolution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
interface ServiceCardProps {
  icon?: ReactNode;
  imageUrl?: string;
  title: string;
  desc: string;
}
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aboutRes, solutionsRes] = await Promise.all([
          fetch("https://adsaro.net/api/aboutsingle"),
          fetch("https://adsaro.net/api/our-advertising-solutions"),
        ]);

        if (!aboutRes.ok) throw new Error("Failed to fetch data");

        const aboutJson = await aboutRes.json();
        setData(aboutJson.data[0]);

        if (solutionsRes.ok) {
          const solutionsJson = await solutionsRes.json();
          setSolutions(Array.isArray(solutionsJson?.data) ? solutionsJson.data : []);
        } else {
          setSolutions([]);
        }

        const aboutPageSingleRes = await fetch(
          "https://adsaro.net/api/aboutpagesingle"
        );

        if (aboutPageSingleRes.ok) {
          const aboutPageSingleJson = await aboutPageSingleRes.json();
          setAboutPageSingle(aboutPageSingleJson?.data?.[0] ?? null);
        } else {
          setAboutPageSingle(null);
        }

        setLoading(false);
      } catch (err: any) {
        setError(err?.message || "Failed to fetch data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="h-5 w-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600">
        {error}
      </div>
    );
  }

  if (!data) return null;

  const ServiceCard = ({ icon, imageUrl, title, desc }: ServiceCardProps) => (
  <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-xl shadow-gray-100/40 hover:shadow-2xl transition-shadow flex flex-col gap-4">
    <div className="">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={title}
          className="w-10 h-10 object-contain"
        />
      ) : (
        icon
      )}
    </div>
    <h3
      className="text-lg font-bold text-gray-900 leading-tight"
      dangerouslySetInnerHTML={{ __html: title }}
    />
    <div
      className="text-gray-500 text-sm leading-relaxed"
      dangerouslySetInnerHTML={{ __html: desc }}
    />
  </div>
);

  return (
    <>
      <MainNavbar />
   <div className="relative overflow-hidden">

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

  <div className="relative z-10">

      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden  bg-gradient-to-b from-gray-400 to-[#6a6bcf]  text-white pt-36 pb-8">
        <div className="max-w-7xl  px-6 mx-auto">
          <span className="inline-flex items-center gap-2 bg-white/15 px-4 py-1 rounded-full text-sm mb-6">
            <span className="h-2 w-2 bg-emerald-400 rounded-full" />
            Smarter Advertising | Measurable Growth
          </span>

          <h1 className="text-3xl sm:text-3xl lg:text-4xl font-extrabold max-w-3xl mb-6">
            {data.title}
          </h1>

          <div
            className="max-w-3xl text-white/90 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: data.description }}
          />
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
          <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="w-full h-[70px] fill-white"
          >
            <path d="M321.39,56.44C168.16,71.42,0,30.91,0,30.91V120H1200V0s-133.91,63.32-287.39,79.3C755.25,96.28,574.62,41.47,321.39,56.44Z" />
          </svg>
        </div>
      </section>


  {/* ================= CONTENT SECTION ================= */}
      <section className="py-10 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-100 shadow-sm text-sm font-medium text-gray-700">
              <span className="w-2 h-2 rounded-full bg-[#6a6bcf]"></span>
              Your Advertising Partner
            </div>

            {/* Main Description from API */}
            <div
              className="prose prose-gray max-w-none text-gray-600 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: data.secondary_description,
              }}
            />

            <div className="flex gap-5">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-100 shadow-sm text-sm font-medium text-gray-700">
                <span className="w-2 h-2 rounded-full bg-[#6a6bcf] "></span>
                Creative & Performance Campaigns
              </div>
           
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-100 shadow-sm text-sm font-medium text-gray-700">
                <span className="w-2 h-2 rounded-full bg-[#6a6bcf]"></span>
                Transparent & Brand-Safe Media
              </div>
            </div>

         
        
          </div>

          {/* Right Content (Advertising Service Cards) */}
          <div className="">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {solutions.map((item, index) => (
                <ServiceCard
                  key={`${item.title}-${index}`}
                  imageUrl={item.image_url}
                  title={item.title}
                  desc={item.description}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
      <Services />

    

      <section className="bg-purple-50 py-8">
        <div className="max-w-7xl mx-auto px-6 pt-10 space-y-16">
          {/* =========================
            WHY CHOOSE ADSARO UK
        ========================== */}
          <div className="text-center max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900">
              Why Choose Adsaro UK?
            </h2>
            
         

                 <div
              className="mt-4 text-lg text-gray-600"
              dangerouslySetInnerHTML={{
                __html: aboutPageSingle?.description ?? "",
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <CheckCircle className="w-7 h-7 text-[#6a6bcf]" />,
                title: "Certified Advertising Experts",
                desc: "Skilled digital marketers and programmatic specialists focused on measurable growth.",
              },
              {
                icon: <BarChart3 className="w-7 h-7 text-[#6a6bcf]" />,
                title: "24/7 Campaign Monitoring",
                desc: "Continuous optimization across CPC, CPM, CPV, and SMART models to maximize ROI.",
              },
              {
                icon: <TrendingUp className="w-7 h-7 text-[#6a6bcf]" />,
                title: "Performance-Focused Results",
                desc: "Clear reports showing traffic, conversions, engagement, and revenue.",
              },
              {
                icon: <ShieldCheck className="w-7 h-7 text-[#6a6bcf]" />,
                title: "Trusted Advertising Partner",
                desc: "Businesses across the UK rely on Adsaro for transparency and long-term success.",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition"
              >
                <div className="mb-4">{item.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* =========================
            TRUSTED PARTNER SECTION
        ========================== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900">
                The UK’s Trusted Digital Advertising Partner
              </h2>
              {/* <p className="mt-6 text-lg text-gray-600 text-justify">
                Adsaro UK is a leading marketing agency in London, delivering
                measurable growth for clients in the UK and worldwide. From
                programmatic advertising to site monetization, our campaigns are
                transparent, efficient, and performance-driven.
              </p> */}

                 <div
              className="mt-6 text-lg text-gray-600 text-justify"
              dangerouslySetInnerHTML={{
                __html: data.third_description,
              }}
            />

              {/* <div className="mt-10 space-y-8">
              <div className="flex gap-4">
                <Megaphone className="w-7 h-7 text-green-600" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Driving Growth for UK Brands Online
                  </h3>
                  <p className="mt-2 text-gray-600">
                    We create targeted campaigns using CPC, CPM, and CPV models
                    with advanced analytics to increase traffic, generate leads,
                    and improve conversions — ensuring every pound delivers
                    measurable value.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Users className="w-7 h-7 text-green-600" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Innovative Marketing Agency in the UK
                  </h3>
                  <p className="mt-2 text-gray-600">
                    As one of the top advertising agencies in the UK, Adsaro
                    blends creativity with performance data to deliver
                    high-impact display, programmatic ads, and social media
                    promotion with transparency and ROI at the core.
                  </p>
                </div>
              </div>
            </div> */}
            </div>

            {/* Visual Card */}
            <div className="bg-white shadow-md rounded-3xl p-12 text-white shadow-xl">
              {/* <h3 className="text-3xl font-bold">
              Award-Winning Data-Driven Strategies
            </h3>
            <p className="mt-4 text-green-100">
              Trusted by businesses big and small, Adsaro is a leading digital
              marketing company in London helping brands grow with performance-focused campaigns.
            </p> */}

              <div className="mt-4 space-y-8">
                {/* <div className="flex gap-4">
                  <Megaphone className="w-20 h-10 text-green-600" />
                  <div>
                    <h3 className="text-xl font-semibold text-[#6a6bcf]">
                      Driving Growth for UK Brands Online
                    </h3>
                    <p className="mt-2 text-gray-600 text-justify">
                      We create targeted campaigns using CPC, CPM, and CPV
                      models with advanced analytics to increase traffic,
                      generate leads, and improve conversions — ensuring every
                      pound delivers measurable value.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Users className="w-20 h-10 text-green-600" />
                  <div>
                    <h3 className="text-xl font-semibold text-[#6a6bcf] ">
                      Innovative Marketing Agency in the UK
                    </h3>
                    <p className="mt-2 text-gray-600 text-justify">
                      As one of the top advertising agencies in the UK, Adsaro
                      blends creativity with performance data to deliver
                      high-impact display, programmatic ads, and social media
                      promotion with transparency and ROI at the core.
                    </p>
                  </div>
                </div> */}

                
                 <div
              className="text-lg text-gray-600 text-justify"
              dangerouslySetInnerHTML={{
                __html: data.fourth_description,
              }}
            />
              </div>
            </div>
          </div>

          {/* =========================
            READY TO GET STARTED
        ========================== */}
        </div>
      </section>

      <div className="  max-w-7xl mx-auto rounded-3xl p-16 shadow-sm text-center ">
        <h2 className="text-4xl font-bold text-gray-900">
          Ready to Get Started?
        </h2>
     
               <div
              className="mt-4 text-lg text-gray-600 max-w-7xl mx-auto"
              dangerouslySetInnerHTML={{
                __html: aboutPageSingle?.secondary_description ?? "",
              }}
            />

        

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="border rounded-2xl p-10 hover:shadow-lg transition">
            <h3 className="text-2xl font-semibold text-gray-900">
              For Publishers
            </h3>
            <p className="mt-3 text-gray-600">
              Monetize your website traffic and maximize revenue with Adsaro’s
              advanced ad solutions.
            </p>
            <a href="/publisher/signup">
              <button className="mt-6 px-8 py-3 rounded-full bg-[#6a6bcf] border border-[#6a6bcf] hover:text-[#6a6bcf] text-white font-semibold hover:bg-white transition">
                Sign Up as Publisher
              </button>
            </a>
          </div>

          <div className="border rounded-2xl p-10 hover:shadow-lg transition">
            <h3 className="text-2xl font-semibold text-gray-900">
              For Advertisers
            </h3>
            <p className="mt-3 text-gray-600">
              Reach the right audience and grow your business using Adsaro’s
              targeted advertising platform.
            </p>
            <a href="/advertiser/signup">
              <button className="mt-6 px-8 py-3 rounded-full bg-[#6a6bcf] border border-[#6a6bcf] text-white font-semibold hover:bg-white hover:text-[#6a6bcf] transition">
                Sign Up as Advertiser
              </button>
            </a>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-16 border-t pt-10">
          <h3 className="text-2xl font-semibold text-gray-900">
            Need Help or Have Questions?
          </h3>
       
   <div
              className="mt-3 text-gray-600 max-w-7xl mx-auto"
              dangerouslySetInnerHTML={{
                __html: aboutPageSingle?.third_description ?? "",
              }}
            />

          <button className="mt-6 px-10 py-3 rounded-full border border-[#6a6bcf] text-[#6a6bcf] font-semibold hover:bg-purple-50 transition">
            Contact Us
          </button>
        </div>
      </div>
      </div>
</div>
      <Footer />
    </>
  );
}



