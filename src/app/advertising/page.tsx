  "use client";

import React, { useEffect, useState } from "react";
import MainNavbar from "@/components/mainnavbar";
import Footer from "@/components/footer";
import CTASection from "../homepage/cta";
import Link from "next/link";
import Carousel from "@/components/carousel";

interface AdvertisingData {
  id: number;
  title: string;
  description: string;
  main_image: string;
  secondary_image: string | null;
  secondary_description: string | null;
  third_description: string | null;
  third_image: string | null;
  fourth_description: string | null;
}

interface FaqApiItem {
  id: number;
  question: string;
  answer: string;
  type: string | null;
  order: number | null;
  is_active: boolean;
}

export default function Advertising() {
  const [data, setData] = useState<AdvertisingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [faqs, setFaqs] = useState<Array<{ q: string; a: string }>>([]);

  useEffect(() => {
    fetch("https://adsaro.net/api/advertisingsingle")
      .then((res) => res.json())
      .then((res) => {
        if (res?.data?.length) setData(res.data[0]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("https://adsaro.net/api/faq")
      .then((res) => res.json())
      .then((res: { data?: FaqApiItem[] }) => {
        const rows = Array.isArray(res?.data) ? res.data : [];
        const advertisingFaqs = rows
          .filter((x) => x?.is_active === true && x?.type === "advertising")
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((x, idx) => ({
            q: `${idx + 1}. ${x.question}`,
            a: x.answer,
          }));

        setFaqs(advertisingFaqs);
      })
      .catch(() => {
        setFaqs([]);
      });
  }, []);

  const brand = { hex: "#6a6bcf" } as const;

  return (
    <>
      <MainNavbar />

      {loading ? (
        <div className="min-h-screen flex items-center justify-center mt-24">
          <div className="animate-spin h-10 w-10 border-4 border-gray-200 border-t-blue-600 rounded-full" />
        </div>
      ) : data ? (
        <>
          <div className="relative overflow-hidden">
            {/* Background */}
            <div
              className="absolute inset-0 -z-10"
              style={{
                backgroundImage: "url('/bg.webp')",
                backgroundAttachment: "fixed",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
                opacity: 0.03,
              }}
            />

            {/* HERO SECTION */}
            <section className="relative mt-16 md:mt-20 overflow-hidden">
              <img
                src={`https://adsaro.net/uploads/${data.main_image}`}
                className="absolute inset-0 w-full h-full object-cover scale-105"
                alt={data.title}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/80" />

              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 md:p-10 shadow-md">
                  <span
                    className="inline-flex items-center gap-2 mb-3 text-xs font-semibold tracking-wide uppercase"
                    style={{ color: brand.hex }}
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: brand.hex }}
                    />{" "}
                    Adsaro Advertising
                  </span>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-snug">
                    Built for Advertisers | Powered by Adsaro UK
                  </h2>
                 
                    <div
                        className="mt-4 text-white leading-relaxed max-w-2xl" style={{color:"#ffffff"}}
                        dangerouslySetInnerHTML={{ __html: data.secondary_description ?? "" }}
                      />

                  <div className="mt-6 flex flex-wrap gap-4">
                    <Link href="/advertiser/signup">
                      <button
                        className="text-white font-semibold px-8 py-3 rounded-2xl transition shadow"
                        style={{ backgroundColor: brand.hex }}
                      >
                        Start Advertising
                      </button>
                    </Link>
                    <Link href="/advertiser/signup">
                      <button className="bg-white/10 hover:bg-white/20 text-white font-semibold px-7 py-3 rounded-2xl border border-white/20 transition">
                        Explore Features
                      </button>
                    </Link>
                  </div>

                  <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center text-gray-200">
                    {[
                      { label: "100M+", desc: "Daily Impressions" },
                      { label: "190+", desc: "Geos" },
                      { label: "99.9%", desc: "Uptime" },
                      { label: "24/7", desc: "Support" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="bg-white/5 rounded-2xl p-4 border border-white/10 transition hover:bg-white/10"
                      >
                        <div className="text-xl font-bold">{item.label}</div>
                        <div className="text-[11px] uppercase tracking-wide opacity-80">
                          {item.desc}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* FEATURE SECTION */}
            {data.secondary_image && data.description && (
              <section id="features" className="pt-12 md:pt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                  <div className="grid md:grid-cols-5 gap-6 md:gap-10 items-center">
                    {/* Text */}
                    <div className="order-2 md:order-1 md:col-span-3">
                      <div
                        className="prose prose-lg text-gray-700 prose-ul:my-2 prose-li:marker:text-blue-600 prose-headings:mt-6 text-justify prose-headings:mb-2"
                        dangerouslySetInnerHTML={{ __html: data.description }}
                      />

                      <div className="">
                      <h4 className="text-base font-semibold text-gray-900 mb-3">Pricing Models Supported</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="rounded-lg border border-gray-100 p-3 bg-white/80 shadow-md">
                      <div className="font-semibold text-gray-900 text-sm">CPC (Cost Per Click)</div>
                      <p className="text-[13px] text-gray-700">Drive traffic and website visits</p>
                      </div>
                      <div className="rounded-lg border border-gray-100 p-3 bg-white/80 shadow-md">
                      <div className="font-semibold text-gray-900 text-sm">CPM (Cost Per Mille)</div>
                      <p className="text-[13px] text-gray-700">Build brand awareness</p>
                      </div>
                      <div className="rounded-lg border border-gray-100 p-3 bg-white/80 shadow-md">
                      <div className="font-semibold text-gray-900 text-sm">CPV (Cost Per View)</div>
                      <p className="text-[13px] text-gray-700">Boost video engagement</p>
                      </div>
                      <div className="rounded-lg border border-gray-100 p-3 bg-white/80 shadow-md">
                      <div className="font-semibold text-gray-900 text-sm">SMART Model</div>
                      <p className="text-[13px] text-gray-700">Intelligent targeting for maximum performance</p>
                      </div>
                      </div>
                      </div>
                    </div>
                    {/* Media */}
                    <div className="order-1 md:order-2 md:col-span-2">
                      <div className="relative group">
                        <div className="absolute -inset-3 rounded-3xl  to-transparent opacity-60 group-hover:opacity-80 transition" />
                        <div className="relative bg-white rounded-2xl md:rounded-3xl border p-3 md:p-4 shadow-lg ring-1 ring-black/5">
                          <img
                            src={`https://adsaro.net/uploads/${data.secondary_image}`}
                            className="w-full aspect-[4/4] object-cover md:object-contain rounded-xl"
                            alt="Adsaro Features"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}


     {/* AD FORMATS GRID */}
            {/* <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
              <div className="text-center mb-8 md:mb-12">
                <h2 className="text-3xl font-bold text-gray-900">
                  Ad Formats Built to Perform
                </h2>
                <p className="mt-2 text-gray-600">
                  Choose from multiple high-performing formats to match your
                  goals.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {[
                  { label: "Display Banners", img: "/bannerads.png" },
                  { label: "Native Ads", img: "/nativeads.png" },
                  { label: "Video", img: "/videoads.png" },
                  { label: "Push", img: "/pushads.png" },
                ].map((f) => (
                  <div
                    key={f.label}
                    className="group bg-white rounded-2xl border hover:border-blue-500 p-5 md:p-6 transition hover:shadow-lg"
                  >
                    <img
                      src={f.img}
                      alt={f.label}
                      className="h-24 w-full object-contain mb-4"
                    />
                    <div className="font-semibold text-gray-900">{f.label}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      High viewability and CTR across premium inventory.
                    </div>
                  </div>
                ))}
              </div>
            </section> */}

    <Carousel />



            {/* DESCRIPTION SECTION */}
            {/* <section className="mt-10">
              <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="rounded-3xl border bg-white shadow-sm p-6 md:p-10">
                  <div className="flex items-start justify-between mb-4 md:mb-6">
                    <span
                      className="hidden md:inline-flex text-xs font-semibold px-3 py-1 rounded-full border"
                      style={{
                        color: brand.hex,
                        backgroundColor: `${brand.hex}1a`,
                        borderColor: `${brand.hex}33`,
                      }}
                    >
                      Overview
                    </span>
                  </div>
                  <div
                    className="prose prose-lg max-w-none text-gray-700 prose-headings:scroll-mt-20 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline"
                    dangerouslySetInnerHTML={{
                      __html: data.secondary_description ?? "",
                    }}
                  />
                  
                </div>
              </div>
            </section> */}

         
       

       


            

            {/* PRICING MODELS + CTA (combined) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6">
             

                {/* Nested CTA within same section */}
                <div className="mt-20 rounded-3xl border bg-white p-6 md:p-10 shadow-sm">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    Ready to Become an Advertiser with Adsaro?
                  </h2>
                  <p className="text-gray-600 mb-6">
                 Getting started as an advertiser company in UK or a global advertiser is simple with Adsaro. Our platform supports brands of all sizes that are searching for a near advertising company and need scalable, cost-effective advertising solutions.
                  </p>
                  <div className="grid md:grid-cols-3 gap-4 md:gap-6">
                    <div className="rounded-2xl border p-5 bg-white/60">
                      <div className="text-sm font-semibold mb-1" style={{ color: brand.hex }}>
                        1. Upload Your Creatives
                      </div>
                      <p className="text-gray-700 text-sm text-justify">
                       Upload banner ads, videos, or use the Adsaro creative library to promote your brand as an advertiser in London and global markets.

                      </p>
                    </div>
                    <div className="rounded-2xl border p-5 bg-white/60">
                      <div className="text-sm font-semibold mb-1 " style={{ color: brand.hex }}>
                        2. Create Your Campaign
                      </div>
                      <p className="text-gray-700 text-sm text-justify">
                       Set campaign goals, audience targeting, devices, locations, and budgets. Launch smart, data-driven campaigns powered by programmatic ad buying with real-time.

                      </p>
                    </div>
                    <div className="rounded-2xl border p-5 bg-white/60">
                      <div className="text-sm font-semibold mb-1" style={{ color: brand.hex }}>
                        3. Select Targeting & Profit
                      </div>
                      <p className="text-gray-700 text-sm text-justify">
                      Choose premium websites, apps & outdoor placements to reach the right audience and maximize performance with best CPM advertising in UK along with CPC and CPA pricing models.
                      </p>
                    </div>
                  </div>
                </div>
           
            </section>


            {/* FAQ */}
            <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 md:py-16">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Frequently Asked Questions
                </h2>
             
              </div>
              <div className="space-y-2.5 md:space-y-3">
                {faqs.map((f, idx) => (
                  <details
                    key={idx}
                    className="group bg-white/90 backdrop-blur border rounded-2xl p-4 md:p-5 open:shadow-md transition"
                  >
                    <summary className="flex gap-3 cursor-pointer list-none items-center justify-between font-semibold text-gray-900">
                      <span>{f.q}</span>
                      <span
                        className="ml-4 h-6 w-6 rounded-full grid place-items-center"
                        style={{
                          backgroundColor: `${brand.hex}1a`,
                          color: brand.hex,
                        }}
                      >
                        +
                      </span>
                    </summary>
                    <p className="mt-2 text-gray-700 leading-relaxed">{f.a}</p>
                  </details>
                ))}
              </div>
            </section>
          </div>

               {/* Advertiser Account Login CTA */}
            <section className="py-12">
              <div
                className="relative overflow-hidden  border p-8 md:p-10 shadow-sm"
                style={{
                  background: `linear-gradient(135deg, ${brand.hex}1a, #ffffff)`,
                }}
              >
                <div className="relative z-10 max-w-7xl mx-auto">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    Advertiser Account Login
                  </h2>
                  <p className="text-gray-700 max-w-3xl">
                    Access your dashboard through a secure Advertiser Account
                    Login to manage campaigns, monitor performance, and analyze
                    results in real time. Adsaro supports every advertiser in
                    the UK and global markets with tools designed to scale
                    visibility, conversions, and long-term growth.
                  </p>
                  <div className="mt-6">
                    <Link href="/advertiser/login">
                      <button
                        className="px-6 py-3 rounded-xl text-white font-semibold shadow"
                        style={{ backgroundColor: brand.hex }}
                      >
                        Login as Advertiser
                      </button>
                    </Link>
                  </div>
                </div>
                <div
                  className="absolute -right-20 -bottom-20 w-64 h-64 rounded-full opacity-20"
                  style={{ backgroundColor: brand.hex }}
                />
              </div>
            </section>
          <Footer />
        </>
      ) : (
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-500">No data available</p>
        </div>
      )}
    </>
  );
}
