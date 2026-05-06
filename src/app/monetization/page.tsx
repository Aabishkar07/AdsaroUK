"use client";

import React, { useEffect, useState } from "react";
import Head from "next/head";
import MainNavbar from "@/components/mainnavbar";
import Footer from "@/components/footer";
import CTASection from "../homepage/cta";
import Link from "next/link";
import Carousel from "@/components/carousel";

interface MonetizationData {
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

export default function Monetization() {
  const [data, setData] = useState<MonetizationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [faqs, setFaqs] = useState<Array<{ q: string; a: string }>>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://adsaro.net/api/monitizationsingle");
        const result = await response.json();
        if (result.data && result.data.length > 0) {
          setData(result.data[0]);
        }
      } catch (error) {
        console.error("Error fetching monetization data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    fetch("https://adsaro.net/api/faq")
      .then((res) => res.json())
      .then((res: { data?: FaqApiItem[] }) => {
        const rows = Array.isArray(res?.data) ? res.data : [];
        const monetizationFaqs = rows
          .filter((x) => x?.is_active === true && x?.type === "monitization")
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((x, idx) => ({
            q: `${idx + 1}. ${x.question}`,
            a: x.answer,
          }));

        setFaqs(monetizationFaqs);
      })
      .catch(() => {
        setFaqs([]);
      });
  }, []);

  const brand = { hex: "#6a6bcf" } as const;

  const steps = [
    { title: "Sign Up", description: "Create your publisher account and access the monetization dashboard." },
    { title: "Integrate Tags", description: "Add ad tags or scripts to your site with simple instructions." },
    { title: "Start Earning", description: "Go live and track revenue in real time from your dashboard." },
  ];

  return (
    <>
      <MainNavbar />
    

      {loading ? (
        <div className="min-h-screen flex items-center justify-center mt-24 bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#6a6bcf]"></div>
            <p className="text-gray-600 text-sm md:text-base font-medium">Loading monetization options...</p>
          </div>
        </div>
      ) : data ? (
        <>

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
          {/* HERO */}
          <section className="relative mt-20 overflow-hidden">
            <img src={`https://adsaro.net/uploads/${data.main_image}`} className="absolute inset-0 w-full h-full object-cover scale-105" alt={data.title} />
            <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/90" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24">
              <div className="max-w-7xl backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-[0_10px_40px_rgba(0,0,0,0.3)]">
                <span className="inline-flex items-center gap-2 mb-3 text-xs md:text-sm font-semibold tracking-wide uppercase" style={{ color: brand.hex }}>
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: brand.hex }} />
                Adsaro Publisher Monetization
                </span>

                <h1 className="text-2xl md:text-4xl font-extrabold text-white leading-tight"> BUILT FOR PUBLISHERS | POWERED BY ADSARO UK</h1>
  

              <div className="mt-4 text-sm md:text-lg text-gray-200 leading-relaxed max-w-2xl" dangerouslySetInnerHTML={{ __html: data.description }} />


                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Link href="/publisher/signup">
                    <button className="text-white font-semibold px-7 py-3 rounded-2xl shadow-xl transition hover:brightness-95" style={{ backgroundColor: brand.hex, boxShadow: `0 10px 25px ${brand.hex}66` }}>Start Monetizing</button>
                  </Link>
                  <Link href="#formats">
                    <button className="bg-white/10 hover:bg-white/20 text-white font-semibold px-7 py-3 rounded-2xl border border-white/20 transition">Explore Formats</button>
                  </Link>
                </div>

                <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-gray-200">
                  <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                    <div className="text-xl font-bold">$50</div>
                    <div className="text-[11px] uppercase tracking-wide opacity-80">Min Payout</div>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                    <div className="text-xl font-bold">9+</div>
                    <div className="text-[11px] uppercase tracking-wide opacity-80">Payment Methods</div>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                    <div className="text-xl font-bold">190+</div>
                    <div className="text-[11px] uppercase tracking-wide opacity-80">Geos</div>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                    <div className="text-xl font-bold">24/7</div>
                    <div className="text-[11px] uppercase tracking-wide opacity-80">Support</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

  
          {/* SECONDARY IMAGE + DESCRIPTION */}
          {data.secondary_image && data.secondary_description && (
            <section className=" py-14">
              <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
                <div>
                  <div className="prose prose-lg text-gray-700" dangerouslySetInnerHTML={{ __html: data.secondary_description }} />
          <div className="">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="rounded-lg border border-gray-100 p-3 bg-white/80 shadow-md">
                   
                      <p className="text-[16px] text-gray-700 font-semibold">Smart Traffic Monetization</p>
                      </div>
                      <div className="rounded-lg border border-gray-100 p-3 bg-white/80 shadow-md">
                      <p className="text-[16px] text-gray-700 font-semibold">AdSense Alternative Solutions</p>
                      </div>
                      <div className="rounded-lg border border-gray-100 p-3 bg-white/80 shadow-md">
                      <p className="text-[16px] text-gray-700 font-semibold">Revenue Boosting Tools</p>
                      </div>
                      <div className="rounded-lg border border-gray-100 p-3 bg-white/80 shadow-md">
                      <p className="text-[16px] text-gray-700 font-semibold">Data Driven Performance</p>
                      </div>
                      </div>
                      </div>

                </div>
                <div className="bg-white rounded-3xl border p-6 md:p-8 shadow-lg">
                  <img src={`https://adsaro.net/uploads/${data.secondary_image}`} className="w-full h-[380px] object-contain" alt="Monetization Features" />
                </div>
              </div>
            </section>
          )}
      
          {/* TARGETING & MEASUREMENT */}
          {/* <section className="pt-16">
        
          <section className="max-w-7xl mx-auto px-6 pb-5">
            <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm">
              <div className="prose prose-lg max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: data.description }} />
            </div>
          </section>
        
          </section> */}

  {/* AD FORMATS GRID */}
            {/* <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 md:pb-16">
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
                    className="group bg-white rounded-2xl border hover:border-[#6a6bcf] p-5 md:p-6 transition hover:shadow-lg"
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

                  {/* PROCESS */}
     <section className="py-10 mt-10">
  {/* Heading */}
  <div className="max-w-7xl mx-auto px-6 text-center mb-6 md:mb-10">
    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
      Ready to Become a Publisher<span className="text-[#6a6bcf]"> with Adsaro?</span>
    </h2>
    <p className="mt-3 text-gray-600 max-w-7xl mx-auto">
Getting started as a publisher in UK or a global site owner is simple with Adsaro. Our platform supports all sizes of websites and apps, helping publishers in London to monetize website traffic efficiently and maximize revenue.
    </p>
  </div>

  {/* Steps (explicit content) */}
  <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-6 md:gap-8">
    {/* Step 1 */}
    <div className="group bg-white border border-gray-200 rounded-3xl p-8 md:p-10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-[#6a6bcf]/40">
      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#6a6bcf]/10 text-[#6a6bcf] font-bold mb-6">1</div>
      <h3 className="text-xl md:text-2xl font-bold text-gray-900 group-hover:text-[#6a6bcf] transition">Upload Your Site & Creatives</h3>
      <p className="mt-3 text-gray-600 leading-relaxed">Start monetizing traffic as a publisher in London and globally with Adsaro.</p>
    </div>
    {/* Step 2 */}
    <div className="group bg-white border border-gray-200 rounded-3xl p-8 md:p-10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-[#6a6bcf]/40">
      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#6a6bcf]/10 text-[#6a6bcf] font-bold mb-6">2</div>
      <h3 className="text-xl md:text-2xl font-bold text-gray-900 group-hover:text-[#6a6bcf] transition">Set Campaign Preferences</h3>
      <p className="mt-3 text-gray-600 leading-relaxed">Choose ad placements, formats, and devices to help publishers maximize revenue with Adsaro’s real time analytics.</p>
    </div>
    {/* Step 3 */}
    <div className="group bg-white border border-gray-200 rounded-3xl p-8 md:p-10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-[#6a6bcf]/40">
      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#6a6bcf]/10 text-[#6a6bcf] font-bold mb-6">3</div>
      <h3 className="text-xl md:text-2xl font-bold text-gray-900 group-hover:text-[#6a6bcf] transition">Maximize Revenue & Performance</h3>
      <p className="mt-3 text-gray-600 leading-relaxed">Leverage the best CPM advertising platform in London with Adsaro to boost revenue and engagement.</p>
    </div>
  </div>

  {/* CTA */}
  <div className="flex justify-center mt-12 md:mt-16">
    <Link href="/publisher/signup">
      <button className="relative bg-[#6a6bcf] hover:bg-[#5859c8] text-white font-semibold px-10 md:px-14 py-3.5 md:py-4 rounded-2xl shadow-xl shadow-[#6a6bcf]/30 transition-all hover:shadow-2xl hover:-translate-y-1">
        Create Publisher Account
      </button>
    </Link>
  </div>
</section>


          {/* FAQs */}
          <section className="max-w-5xl mx-auto px-6 py-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Frequently Asked Questions</h2>
            </div>
            <div className="space-y-3">
              {faqs.map((f, idx) => (
                <details key={idx} className="group bg-white border rounded-2xl p-5 open:shadow-lg open:border-[#6a6bcf]/50">
                  <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-gray-900">
                    <span>{f.q}</span>
                    <span className="ml-4 h-6 w-6 rounded-full grid place-items-center" style={{ backgroundColor: `${brand.hex}1a`, color: brand.hex }}>+</span>
                  </summary>
                  <p className="mt-2 text-gray-700 leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </section>

     

          </div>
       
  
<section className="py-12">
  <div
    className="relative overflow-hidden border p-8 md:p-10 shadow-sm"
    style={{
      background: `linear-gradient(135deg, ${brand.hex}1a, #ffffff)`,
    }}
  >
    <div className="relative z-10 max-w-7xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
        Publisher Account Monetization
      </h2>

      <p className="text-gray-700 max-w-3xl">
      The Publisher Account Login gives publisher in London and even globally to secure access to track earnings. Adsaro, the best publisher near me, helps optimize revenue with ease.

      </p>

      <div className="mt-6">
        <Link href="/publisher/login">
          <button
            className="px-6 py-3 rounded-xl text-white font-semibold shadow"
            style={{ backgroundColor: brand.hex }}
          >
            Login as Publisher
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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 mt-24">
          <div className="text-center">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-xl text-gray-600 font-medium">No data available</p>
            <p className="text-gray-500 mt-1">Please check back later</p>
          </div>
        </div>
      )}
    </>
  );
}