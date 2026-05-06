"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// ✅ Define an interface matching the API structure
interface AdvertiserItem {
  title?: string;
  description?: string;
  main_image?: string;
}

interface ApiResponse {
  status: boolean;
  message?: string;
  data?: AdvertiserItem;
}

export function Foradvertiser() {
  // ✅ Type the state properly
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("https://adsaro.net/api/advertising");
        if (!res.ok) throw new Error("Failed to fetch data");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Error fetching advertising data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center py-20">Loading...</div>;
  }

  if (!data?.data) {
    return <div className="text-center py-20">No data available</div>;
  }

  // ✅ Now TypeScript knows `data.data` exists and what it contains
  const { title, description, main_image } = data.data;

  return (
    <section className="px-4 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Text Content */}
        <div className="order-2 lg:order-1">
          <h2 className="mb-6 text-3xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
            <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#020107] to-[#24238d]">
              {title}
            </span>
          </h2>

          <div
            className="text-lg text-gray-600 mb-8 leading-relaxed max-sm:px-4"
            dangerouslySetInnerHTML={{ __html: description || "" }}
          />

          {/* CTA Button */}
          {pathname !== "/advertising" && (
            <Link
              href="/advertising"
              className="inline-block px-8 py-3 bg-[#6a6bcf] border-2 border-[#6a6bcf] text-white 
                     hover:bg-white hover:text-[#6a6bcf] font-bold rounded-lg 
                     transition-colors duration-300 hover:shadow-md"
            >
              Learn More →
            </Link>
          )}
        </div>

        {/* Image Section */}
        <div className="order-1 lg:order-2 mt-12 max-sm:mt-0">
          {main_image && (
                <Link
              href="/advertising">
            <div className="relative max-[1026px]:hidden w-full h-full min-h-[500px] lg:min-h-[650px] md:pt-20">
              <img
                src={`https://adsaro.net/uploads/${main_image}`}
                alt={title || "Advertiser Image"}
                className="object-contain lg:object-cover rounded-lg"
              />
            </div>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
