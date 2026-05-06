"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function HomepageAbout() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("https://adsaro.net/api/homeaboutus")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch data");
        return res.json();
      })
      .then((result) => {
        setData(result.data[0]);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="h-5 w-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  /* ---------- Error ---------- */
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-red-600">
        {error}
      </div>
    );
  }

  if (!data) return null;

  return (
    <section className="relative py-12 max-sm:py-0 overflow-hidden">
      

      {/* 🔹 Centered Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* Left Content */}
          <div>
            <div className="mb-4">
              <span className="inline-block h-1 w-12 bg-[#6a6bcf] rounded-full" />
            </div>

            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-6">
              EXPERTS <span className="text-[#6a6bcf] italic">ABOUT US</span>
            </h2>

            <div
              className="prose prose-gray max-w-none text-gray-600 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: data.description }}
            />

            <Link
              href="/about"
              className="inline-block px-8 mt-6 py-3 bg-[#6a6bcf] border-2 border-[#6a6bcf] 
                         text-white font-bold rounded-lg transition-all duration-300
                         hover:bg-white hover:text-[#6a6bcf] hover:shadow-md"
            >
              Learn More →
            </Link>
          </div>

          {/* Right Content */}
          <div className="bg-white shadow-md border border-gray-100 rounded-xl p-8">
            <div
              className="prose prose-gray max-w-none text-gray-600 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: data.secondary_description,
              }}
            />
          </div>

        </div>
      </div>
    </section>
  );
}
