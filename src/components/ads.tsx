"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

import { BarChart3, Eye, Zap, Calendar, DollarSign, Heart } from "lucide-react";

const services = [
  {
    icon: BarChart3,
    title: "Audience Quality",
    description:
      "We deliver relevant users with advanced anti-fraud protection to protect your brand.",
  },
  {
    icon: Eye,
    title: "Traffic Volume",
    description:
      "14+ billion daily ad impressions across 195+ GEOs, reaching audiences worldwide.",
  },
  {
    icon: Zap,
    title: "Ad Performance",
    description:
      "Boost campaigns through our best ad network in UK with custom audiences with interest targeting.",
  },
  {
    icon: Calendar,
    title: "Analytics",
    description:
      "Gain data-driven insights to monitor and improve campaign performance.",
  },
  {
    icon: DollarSign,
    title: "Automation",
    description:
      "Flexible automation options make managing campaigns simple and efficient.",
  },
  {
    icon: Heart,
    title: "5-Star Customer Care",
    description:
      "Our team works 24/7, making Adsaro a trusted advertising company in London.",
  },
];

export default function AdsaroSection() {
  return (
    <section className="pt-16  overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl pb-2 font-extrabold text-slate-900 tracking-wide">
            Why Adsaro is the Leading{" "}
            <span className="text-[#336da4] italic">Ad Network Platform</span>
          </h2>
          <p className="mt-4  text-gray-900 max-w-7xl mx-auto text-base md:text-md leading-relaxed justify-center">
            Experienced in delivering high impact digital advertising, Adsaro is recognized as one of the most trusted ad network platform in UK. The company provides innovative, reliable, and measurable advertising solutions for businesses and publishers, offering global advertising in UK that help brands grow consistently in the digital landscape.
          </p>
        </div>

        {/* Swiper Slider */}
        <Swiper
          modules={[Autoplay]}
          spaceBetween={24}
          slidesPerView={1.2}
          breakpoints={{
            640: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
          }}
          loop={true}
          autoplay={{ delay: 0, disableOnInteraction: false, pauseOnMouseEnter: true }}
          speed={3000} // sliding speed
        >
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <SwiperSlide key={index}>
                <div className="bg-white border my-5 h-[250px] border-slate-200 rounded-3xl p-6 md:p-7 shadow-lg hover:shadow-2xl transition-transform duration-500 hover:-translate-y-2 hover:scale-105">
                  <div className="w-16 h-16 md:w-18 md:h-18 rounded-xl bg-[#336da4] bg-opacity-10 flex items-center justify-center mb-5">
                    <Icon className="w-8 h-8 md:w-9 md:h-9 text-[#336da4]" />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-slate-800 mb-2">
                    {service.title}
                  </h3>
                  <p className="text-slate-600 text-sm md:text-md leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </section>
  );
}
