"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";

interface CtaSecondItem {
  id: number;
  title: string;
  description: string;
}

const CTASection = () => {
  const [cta, setCta] = useState<CtaSecondItem | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCta() {
      try {
        const res = await fetch("https://adsaro.net/api/ctasecond", {
          cache: "no-store",
        });
        if (!res.ok) return;

        const data = await res.json();
        const first = Array.isArray(data?.data) ? data.data[0] : null;
        if (!cancelled) setCta(first ?? null);
      } catch {
        // ignore and fall back to hardcoded text
      }
    }

    loadCta();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="w-full pt-16">
      <div className="">
        <div className="relative bg-gradient-to-b from-[#6a6bcf] to-white rounded-tl-[80px] rounded-tr-[80px] px-8 py-16 md:px-16 md:py-20 shadow-xl overflow-hidden">
          {/* Decorative arrow doodle */}
          <div className="absolute top-8 right-12 md:right-20">
            <svg
              width="80"
              height="60"
              viewBox="0 0 80 60"
              fill="none"
              className="text-gray-800"
            >
              <path
                d="M5 25 Q 20 10, 35 20 T 65 15"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M60 10 L 70 15 L 65 22"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <path
                d="M45 35 Q 50 45, 60 40"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>

          {/* Content */}
          <div className="relative z-10 text-center max-w-4xl mx-auto">
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight"
              dangerouslySetInnerHTML={{
                __html:
                  cta?.title ??
                  "Lets Create the Perfect Advertising<br/>Strategy for Your Brand",
              }}
            />

            <p
              className="text-base md:text-lg text-gray-800 mb-8 max-w-7xl mx-auto"
              dangerouslySetInnerHTML={{
                __html:
                  cta?.description ??
                  "Connect with us to build a results-driven advertising plan made for your growth.",
              }}
            />

            <Link href="/contact">
              <button className="group inline-flex items-center gap-2 px-8 py-3.5 bg-[#6a68AF] hover:bg-white hover:text-[#6a68AF] border border-[#6a68AF] text-white rounded-xl font-semibold  duration-300">
                Contact us
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </button>
            </Link>
          </div>

          {/* Decorative gradient orbs */}
          {/* <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div> */}
          {/* <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div> */}
        </div>
      </div>
    </div>
  );
};

export default CTASection;
