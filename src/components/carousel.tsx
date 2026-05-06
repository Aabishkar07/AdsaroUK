"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination, A11y, Autoplay } from "swiper/modules";
import { usePathname } from "next/navigation";

interface AdFormat {
  id: number;
  title: string;
  slug: string;
  description: string;
  image: string;
  icon: string;
  long_description: string;
}

interface FormatDesc {
  id: number;
  title: string;
  description: string;
}

const Carousel = () => {
  const [formats, setFormats] = useState<AdFormat[]>([]);
  const [formatDesc, setFormatDesc] = useState<FormatDesc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Promise-based API calls
    Promise.all([
      fetch("https://adsaro.net/api/advertisingformats").then(res => res.json()),
      fetch("https://adsaro.net/api/advertisingformatsdesc").then(res => res.json())
    ])
      .then(([formatsRes, descRes]) => {
        if (formatsRes.status && Array.isArray(formatsRes.data)) {
          setFormats(formatsRes.data);
        }

        if (descRes.status && Array.isArray(descRes.data)) {
          setFormatDesc(descRes.data[0]); // only one record
        }
      })
      .catch(error => {
        console.error("API Error:", error);
      })
      .finally(() => setLoading(false));
  }, []);

  const pathname = usePathname();
  const hideDesc = pathname === "/advertising" || pathname === "/monetization";

  return (
    <div className="md:my-20 px-4 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
          Our <span className="text-primary">Advertising Formats</span>
        </h2>

        {/* API Description */}
      {formatDesc && !hideDesc && (
  <div
    className="mt-4 text-gray-600 max-w-7xl mx-auto text-base leading-relaxed"
    dangerouslySetInnerHTML={{ __html: formatDesc.description }}
  />
)}
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading formats...</p>
      ) : formats.length > 0 ? (
        <div className="relative">
          <Swiper
            modules={[Navigation, Pagination, A11y, Autoplay]}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            navigation={{
              nextEl: ".swiper-button-next-custom",
              prevEl: ".swiper-button-prev-custom",
            }}
            pagination={{ clickable: true }}
            breakpoints={{
              640: { slidesPerView: 1, spaceBetween: 20 },
              768: { slidesPerView: 2, spaceBetween: 30 },
              1024: { slidesPerView: 3, spaceBetween: 40 },
            }}
            slidesPerView={1}
            spaceBetween={20}
          >
            {formats.map(format => (
              <SwiperSlide key={format.id}>
                <Link href={`/adformat/${format.slug}`} className="group block h-full">
                  <div className="flex items-start border border-[#6a6bcf] bg-gray-100 shadow-sm rounded-xl px-4 py-6 hover:bg-[#6a6bcf] transition-all duration-300">
                    <div className="w-36 h-36 flex-shrink-0 flex items-center justify-center">
                      <Image
                        src={`https://adsaro.net/uploads/${format.image}`}
                        width={100}
                        height={100}
                        alt={format.title}
                        className="object-cover w-full h-full rounded-2xl bg-purple-200"
                        unoptimized
                      />
                    </div>

                    <div className="ml-4 flex flex-col justify-between h-32 flex-grow">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 group-hover:text-white">
                          {format.title}
                        </h3>
                        <p className="text-gray-600 text-sm mt-1 group-hover:text-white">
                          {format.description}
                        </p>
                      </div>

                      <div className="inline-flex items-center text-sm font-semibold bg-[#6a6bcf] px-3 py-1.5 rounded-xl text-white self-end group-hover:bg-white/20">
                        View more →
                      </div>
                    </div>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Navigation */}
          <div className="swiper-button-prev-custom absolute top-1/2 -left-12 -translate-y-1/2 hidden lg:block cursor-pointer">
            ◀
          </div>
          <div className="swiper-button-next-custom absolute top-1/2 -right-12 -translate-y-1/2 hidden lg:block cursor-pointer">
            ▶
          </div>
        </div>
      ) : (
        <p className="text-center text-red-500">No formats found.</p>
      )}
    </div>
  );
};

export default Carousel;
