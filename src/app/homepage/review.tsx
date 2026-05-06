"use client";
import React, { useEffect, useState, useRef } from "react";

interface Review {
  id: number;
  name: string;
  designation: string | null;
  image: string;
  description: string;
}

export default function ReviewSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const isHovering = useRef(false);

  /* ================= FETCH REVIEWS ================= */
  useEffect(() => {
    fetch("https://adsaro.net/api/reviews")
      .then((res) => res.json())
      .then((data) => {
        if (data.status && data.data) {
          setReviews(data.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || reviews.length === 0) return;

    const speed = 0.5;

    const scroll = () => {
      if (!isHovering.current) {
        container.scrollLeft += speed;

        // seamless reset
        if (container.scrollLeft >= container.scrollWidth / 2) {
          container.scrollLeft = 0;
        }
      }
      animationRef.current = requestAnimationFrame(scroll);
    };

    animationRef.current = requestAnimationFrame(scroll);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [reviews]);

  /* ================= STATES ================= */
  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="animate-spin h-12 w-12 rounded-full border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!reviews.length) {
    return (
      <div className="py-20 text-center text-gray-500">
        No reviews found.
      </div>
    );
  }

  // Duplicate reviews for infinite scroll
  const duplicatedReviews = [...reviews, ...reviews];

  return (
    <div className="py-12 mb-8">
      <div className="max-w-7xl mx-auto px-4">

        {/* Heading */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
            TESTIMONIALS
          </span>
          <h2 className="text-4xl font-bold text-gray-900">
            What Our Clients Say
          </h2>
        </div>

        {/* Scroll Area */}
        <div className="relative">
          <div
            ref={scrollRef}
            onMouseEnter={() => (isHovering.current = true)}
            onMouseLeave={() => (isHovering.current = false)}
            className="flex gap-6 overflow-x-hidden pb-4"
          >
            {duplicatedReviews.map((review, index) => (
              <div
                key={`${review.id}-${index}`}
                className="flex-shrink-0 w-96 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-8 border border-gray-100"
              >
                {/* Profile */}
                <div className="flex items-center mb-6">
                  <img
                    src={`https://adsaro.net/uploads/${review.image}`}
                    alt={review.name}
                    className="w-16 h-16 rounded-full object-cover border-4 border-blue-100 mr-4"
                  />
                  <p className="font-bold text-gray-900 text-lg">
                    {review.name}
                  </p>
                </div>

                {/* Quote */}
                <svg
                  className="w-8 h-8 text-blue-500 opacity-40 mb-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>

                {/* Review Text */}
                <div
                  className="text-gray-700 leading-relaxed line-clamp-6"
                  dangerouslySetInnerHTML={{ __html: review.description }}
                />

                {/* Stars */}
                <div className="flex text-yellow-400 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Gradient fades */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-gray-50 to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none" />
        </div>
      </div>

      <style jsx>{`
        .line-clamp-6 {
          display: -webkit-box;
          -webkit-line-clamp: 6;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
