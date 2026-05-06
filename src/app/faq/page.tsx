"use client";
import React, { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import MainNavbar from "@/components/mainnavbar";
import Footer from "@/components/footer";
import CTASection from "../homepage/cta";

interface FAQ {
  id: number;
  question: string;
  answer: string;
}

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [openId, setOpenId] = useState<number | null>(null);
  const [searchText, setSearchText] = useState<string>("");
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

  const normalizedSearch = searchText.trim().toLowerCase();
  const filteredFaqs = !normalizedSearch
    ? faqs
    : faqs.filter((faq) => {
        const q = faq.question?.toLowerCase() ?? "";
        const a = faq.answer?.toLowerCase() ?? "";
        return q.includes(normalizedSearch) || a.includes(normalizedSearch);
      });

  useEffect(() => {
    if (openId === null) return;
    const stillVisible = filteredFaqs.some((f) => f.id === openId);
    if (!stillVisible) setOpenId(null);
  }, [openId, filteredFaqs]);

  return (
    <div>
      <MainNavbar />
   <div className="relative overflow-hidden">

        <div
    className="absolute inset-0 -z-10"
    style={{
      backgroundImage: "url('/bg.webp')",
      backgroundAttachment: "fixed", // parallax effect
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      backgroundSize: "cover",
      opacity: 0.02, // <--- set image opacity here
    }}
  />
      <section className="py-10 mt-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">FAQs</h1>
          </div>

          <div className="max-w-2xl mx-auto mb-8">
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search FAQs..."
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#6a6bcf] focus:border-transparent"
            />
          </div>

          {loading ? <p className="text-center py-10">Loading FAQs...</p> : null}
          {error ? <p className="text-center py-10 text-red-500">{error}</p> : null}

          {!loading && !error ? (
            <div className="grid md:grid-cols-2 gap-8">
              {filteredFaqs.map((faq) => {
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
          ) : null}

          {!loading && !error && filteredFaqs.length === 0 ? (
            <p className="text-center py-10 text-gray-600">No FAQs match your search.</p>
          ) : null}
        </div>
      </section>
      </div>

      <CTASection />
      <Footer />
    </div>
  );
}
