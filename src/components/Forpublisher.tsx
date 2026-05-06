"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface PublisherData {
  title?: string;
  description?: string;
  main_image?: string;
}

interface ApiResponse {
  status: boolean;
  message?: string;
  data?: PublisherData;
}

export function Forpublisher() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("https://adsaro.net/api/publisher");
        if (!res.ok) throw new Error("Failed to fetch publisher data");

        const json: ApiResponse = await res.json();
        setData(json);
      } catch (err) {
        console.error("Error fetching publisher data:", err);
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

  const { title, description, main_image } = data.data;

  return (
    <section className="pb-24 md:pb-32 px-4 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Image - Left Side */}
        <div className="flex justify-center lg:justify-start">
          {main_image && (
                   <Link
              href="/monetization">
            <div className="relative w-full max-[1026px]:hidden">
              <img
                src={`https://adsaro.net/uploads/${main_image}`}
                alt={title || "Publisher Image"}
                className="object-cover w-full h-auto rounded-lg"
              />
            </div>
            </Link>
          )}
        </div>

    
      <div className="relative">
  {/* Text Content */}
  <h2 className="mb-6 text-3xl sm:text-3xl md:text-4xl font-bold leading-tight inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#020107] to-[#24238d] min-w-[200px]">
    {title}
  </h2>

  <div
    className="text-lg text-gray-600 mb-8 leading-relaxed max-sm:px-4"
    dangerouslySetInnerHTML={{ __html: description || "" }}
  />

  {pathname !== "/monetization" && (
    <Link
      href="/monetization"
      className="inline-block px-8 py-3 bg-[#6a6bcf] border-2 border-[#6a6bcf] text-white 
                 hover:bg-white hover:text-[#6a6bcf] font-bold rounded-lg 
                 transition-colors duration-300 hover:shadow-md"
    >
      Learn More →
    </Link>
  )}


</div>

      </div>
    </section>
  );
}
