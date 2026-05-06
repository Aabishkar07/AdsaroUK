"use client";

import React, { useEffect, useState } from "react";

interface Feature {
  id: number;
  name: string;
  image: string;
  description: string;
}

interface AwesomeHeader {
  id: number;
  title: string;
  description: string;
  main_image: string | null;
}

export function AwesomeFeature() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [header, setHeader] = useState<AwesomeHeader | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featureRes, headerRes] = await Promise.all([
          fetch("https://adsaro.net/api/features"),
          fetch("https://adsaro.net/api/awesomefeature"),
        ]);

        const featureData = await featureRes.json();
        const headerData = await headerRes.json();

        setFeatures(featureData?.data ?? []);
        setHeader(headerData?.data?.[0] ?? null);
      } catch (error) {
        console.error("API Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 mb-16">
      {/* Header */}
      <div className="text-center pb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Our Awesome <span className="text-[#336da4] italic">Features</span>
        </h2>

        <div
          className="text-base  text-gray-600
                     [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2"
          dangerouslySetInnerHTML={{
            __html:
              header?.description ??
              "At Adsaro Nepal, we focus on providing solutions that help advertisers and publishers grow.",
          }}
        />
      </div>

      {loading && (
        <p className="text-center text-gray-500">Loading features...</p>
      )}

      {/* Features Grid */}
      {!loading && features.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {features.map((item, index) => {
            const rowIndex = Math.floor(index / 2);
            const isZigZagRow = rowIndex >= 1 && rowIndex % 2 === 1;

            return (
              <div
                key={item.id}
                className={`group flex gap-5 items-stretch 
                  transition-all duration-300 hover:scale-[1.02]
                  ${isZigZagRow ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Image */}
                <div className="w-1/3 bg-[#6a6bcf]  flex flex-col items-center justify-center text-center rounded-xl shadow-md p-4">
                  <img
                    src={`https://adsaro.net/uploads/${item.image}`}
                    alt={item.name}
                    width={60}
                    height={60}
                    className="mb-2 object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                  <h3 className="font-semibold text-sm text-white">
                    {item.name}
                  </h3>
                </div>

                {/* Content */}
                <div
                  className="w-2/3 text-sm text-gray-700 leading-relaxed rounded-xl shadow-md bg-white shadow-md p-4"
                  dangerouslySetInnerHTML={{ __html: item.description }}
                />
              </div>
            );
          })}
        </div>
      )}

      {!loading && features.length === 0 && (
        <p className="text-center text-gray-500">No features found.</p>
      )}
    </section>
  );
}
