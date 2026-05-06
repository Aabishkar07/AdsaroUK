"use client";
import React, { useEffect, useState } from "react";
import MainNavbar from "@/components/mainnavbar";
import Image from "next/image";
import Link from "next/link";
import CTASection from "@/app/homepage/cta";
import Footer from "@/components/footer";

interface Benefit {
  title: string;
  description: string;
  long_description?: string;
}

interface RelatedFormat {
  name?: string;
  icon?: string;
  slug?: string;
  title?: string;
  image?: string;
}

interface AdFormat {
  id: number;
  title: string;
  slug: string;
  description: string;
  image: string;
  icon: string;
  long_description: string;
  placement_info?: string;
  benefits?: Benefit[];
}

type Props = {
  slug: string;
};

export default function AdformatClientPage({ slug }: Props) {
  const [format, setFormat] = useState<AdFormat | null>(null);
  const [relatedFormats, setRelatedFormats] = useState<RelatedFormat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        const formatRes = await fetch(
          `https://adsaro.net/api/advertisingformats/${slug}`
        );
        if (!formatRes.ok) throw new Error("Failed to fetch ad format data");
        const formatData = await formatRes.json();

        const relatedRes = await fetch(
          `https://adsaro.net/api/related-formats/${slug}`
        );
        if (!relatedRes.ok) throw new Error("Failed to fetch related formats");
        const relatedData = await relatedRes.json();

        setFormat(formatData.data || formatData);
        setRelatedFormats(relatedData.data || relatedData);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(String(err));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-lg">Loading...</p>
      </div>
    );
  }

  if (error || !format) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-red-500 text-lg">
          {error || "No data found for this ad format."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavbar />
      <div className="max-w-screen-2xl mx-auto px-6 pt-36">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {format.benefits && format.benefits.length > 0 ? (
              <div className="bg-white rounded-lg p-8 shadow-sm">
                <h2 className="text-3xl font-bold text-[#2f6ba7] mb-8">
                  BENEFITS OF {format.title?.toUpperCase()}
                </h2>

                {format.benefits.map((benefit, index) => (
                  <div key={index} className="mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      {index + 1}. {benefit.title}
                    </h3>

                    <p className="text-gray-700 text-lg leading-relaxed mb-4">
                      {benefit.description}
                    </p>

                    {benefit.long_description && (
                      <div
                        className="text-gray-700 text-lg leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: benefit.long_description || "",
                        }}
                      ></div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              format.long_description && (
                <div className="bg-white rounded-lg p-8 shadow-sm">
                  <div
                    className="text-gray-800 text-lg leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: format.long_description || "",
                    }}
                  ></div>
                </div>
              )
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-8 mb-6 shadow-sm border-2 border-gray-200">
              <div className="flex gap-4 items-start justify-center mb-6">
                <div className="bg-gray-100 rounded-lg p-4 w-48">
                  <div className="bg-[#2f6ba7] h-16 rounded mb-3"></div>
                  <div className="flex gap-2">
                    <div className="bg-gray-300 w-12 h-12 rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="bg-gray-300 h-2 rounded"></div>
                      <div className="bg-gray-300 h-2 rounded"></div>
                      <div className="bg-gray-300 h-2 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-100 rounded-lg p-3 w-24">
                  <div className="bg-white rounded-t h-1 mb-2"></div>
                  <div className="space-y-2 mb-2">
                    <div className="bg-gray-300 h-1 rounded"></div>
                    <div className="bg-gray-300 h-1 rounded"></div>
                  </div>
                  <div className="bg-[#2f6ba7] h-12 rounded"></div>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <button className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100">
                  <span className="text-gray-600">←</span>
                </button>
                <button className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100">
                  <span className="text-gray-600">→</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Other Available Formats
              </h3>

              <div className="space-y-4">
                {relatedFormats.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/adformat/${item.slug}`}
                    className="group block"
                  >
                    <div className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-[#2f6ba7] transition-colors cursor-pointer">
                      <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden flex items-center justify-center bg-gray-100 shadow-md">
                        <Image
                          src={`https://adsaro.net/uploads/${item.image}`}
                          width={500}
                          height={300}
                          alt={item.title || item.name || "Related Ad Format"}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      </div>

                      <h4 className="text-lg font-semibold text-gray-900">
                        {item.name || item.title}
                      </h4>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <CTASection />
      <Footer />
    </div>
  );
}
