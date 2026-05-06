"use client";
import React, { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import Link from "next/link";

interface FAQ {
  id: number; 
  question: string;
  answer: string;
}

interface FAQSectionProps {
  limit?: number;
  showViewMore?: boolean;
}

const FAQSection: React.FC<FAQSectionProps> = ({ limit = 10, showViewMore = true }) => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [openId, setOpenId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const res = await fetch("https://adsaro.net/api/faq");

        if (!res.ok) {
          throw new Error("Failed to fetch FAQs");
        }

        const json = await res.json();

        if (json.status && Array.isArray(json.data)) {
          setFaqs(json.data);
        } else {
          throw new Error("Invalid data format from API");
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Something went wrong");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFaqs();
  }, []);

  const toggleFAQ = (id: number) => {
    setOpenId(openId === id ? null : id); 
  };

  if (loading) return <p className="text-center py-10">Loading FAQs...</p>;
  if (error) return <p className="text-center py-10 text-red-500">{error}</p>;

  const displayedFaqs = typeof limit === "number" ? faqs.slice(0, limit) : faqs;
  const canViewMore = showViewMore && typeof limit === "number" && faqs.length > limit;

  return (
   <section className="py-5 relative">
  {/* Left-side background icon */}
 

 
  <div className="max-w-7xl mx-auto px-4 relative z-10">
    {/* Title aligned left */}
    <div className="mb-10 text-left">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
        Frequently Asked Questions
      </h2>
    </div>

    {/* 2-Column Grid */}
    <div className="grid md:grid-cols-2 gap-8">
      {displayedFaqs.map((faq) => {
        const isOpen = openId === faq.id;

        return (
          <div
            key={faq.id}
            className={`border rounded-xl shadow-sm overflow-hidden transition-all duration-300 ${
              isOpen
                ? "bg-[#6a6bcf] border-[#6a6bcf] text-white"
                : "bg-white border-[#c7c8f0] text-gray-800"
            }`}
          >
            <button
              onClick={() => toggleFAQ(faq.id)}
              className="w-full flex justify-between items-center text-left px-5 py-3"
            >
              <span className="font-medium text-base">{faq.question}</span>
              <span
                className={`ml-3 rounded-full p-2 flex items-center justify-center transition-all duration-300 ${
                  isOpen ? "bg-white text-[#6a6bcf]" : "bg-[#6a6bcf] text-white"
                }`}
              >
                {isOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </span>
            </button>

            <div
              className={`transition-all duration-300 px-5 overflow-hidden ${
                isOpen ? "max-h-96 pb-3" : "max-h-0"
              }`}
            >
              <p
                className={`text-sm transition-colors duration-300 ${
                  isOpen ? "text-white" : "text-gray-600"
                }`}
              >
                {faq.answer}
              </p>
            </div>
          </div>
        );
      })}
    </div>

    {canViewMore && (
      <div className="flex justify-start mt-8">
        <Link
          href="/faq"
          className="px-6 py-3 rounded-lg bg-[#6a6bcf] text-white font-medium hover:opacity-90 transition"
        >
          View more
        </Link>
      </div>
    )}
  </div>
</section>

  );
};

export default FAQSection;