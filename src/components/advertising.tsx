"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface AdFormat {
  id: number;
  title: string;
  slug: string;
  description: string;
  image: string;
  icon: string;
  long_description: string;
}

const Advertising = () => {
  const [formats, setFormats] = useState<AdFormat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFormats = async () => {
      try {
        const res = await fetch("https://adsaro.net/api/advertisingformats");
        const data = await res.json();

        if (data.status && Array.isArray(data.data)) {
          setFormats(data.data);
        }
      } catch (error) {
        console.error("Error fetching ad formats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFormats();
  }, []);

  return (
    <div className="pb-24 md:mt-8 px-4 max-w-screen-2xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
          Our <span className="text-primary">Advertising Formats</span>
        </h2>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Maximize your reach with our diverse range of high-performing ad
          formats
        </p>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading formats...</p>
      ) : formats.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {formats.map((format) => (
            <Link
              key={format.id}
              href={`/adformat/${format.slug}`}
              className="group block"
            >
              <div
                className="flex items-start border border-[#6a6bcf] bg-white shadow-sm rounded-xl  px-4 py-6 
                   hover:bg-[#6a6bcf] hover:shadow-md transition-all duration-300 relative"
           
              >
                <div className="w-360 h-36 flex-shrink-0 flex items-center justify-center p-1">
                  <Image
                    src={`https://adsaro.net/uploads/${format.image}`}
                    width={100}
                    height={100}
                    alt={format.title}
                    className="object-contain w-full h-full rounded-xl"
                    unoptimized
                  />
                </div>

                <div
                  className="ml-4 flex flex-col justify-between h-32 flex-grow"
                >
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-white">
                      {format.title}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1 group-hover:text-white">
                      {format.description}
                    </p>
                  </div>

                  <div className="inline-flex items-center text-sm font-semibold bg-[#6a6bcf] px-3 py-1.5 rounded-xl text-white self-end transition-colors group-hover:bg-white/20">
                    View more{" "}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="ml-1 w-4 h-4"
                    >
                      <path d="M9 6l6 6l-6 6" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-center text-red-500">No formats found.</p>
      )}
    </div>
  );
};

export default Advertising;
