  "use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import AdsaroLogo from "../../public/NewLogoWhite.png";

// ✅ Define TypeScript interface for settings
interface Settings {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  address?: string;
  email?: string;
  contact_number?: string;
  description?: string;
}

const Footer = () => {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("https://adsaro.net/api/setting");
        const data = await res.json();
        if (data.status && data.data) {
          setSettings(data.data);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };

    fetchSettings();
  }, []);

  if (!settings) return null;

  return (
    <footer className="tracking-wide bg-black pt-12 pb-4 px-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-screen-xl mx-auto">
        {/* Logo + About */}
        <div className="flex flex-col h-full">
          <Image
            src={AdsaroLogo}
            alt="Adsaro Logo"
            width={130}
            height={50}
            className="object-contain pb-4"
          />
          <p className="text-white text-sm font-normal leading-relaxed"
             dangerouslySetInnerHTML={{
                __html:
                  settings?.description ??
                  "Connect with us to build a results-driven advertising plan made for your growth.",
              }} />

          {/* Social Icons */}
          <div className="flex space-x-4 mt-6">
            {settings.facebook && (
              <a
                href={settings.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6a6bcf] hover:scale-110 transition-transform duration-200"
              >
                <div className="bg-white rounded-full p-2 w-10 h-10 flex items-center justify-center shadow-md">
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 5.012 3.676 9.166 8.438 9.876v-6.987h-2.54v-2.889h2.54V9.797c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.875h2.773l-.443 2.889h-2.33v6.987C18.324 21.166 22 17.012 22 12z" />
                  </svg>
                </div>
              </a>
            )}

            {settings.instagram && (
              <a
                href={settings.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6a6bcf] hover:scale-110 transition-transform duration-200"
              >
                <div className="bg-white rounded-full p-2 w-10 h-10 flex items-center justify-center shadow-md">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <circle cx="12" cy="12" r="5" />
                    <circle cx="17.5" cy="6.5" r="1.5" />
                  </svg>
                </div>
              </a>
            )}

            {settings.twitter && (
              <a
                href={settings.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6a6bcf] hover:scale-110 transition-transform duration-200"
              >
                <div className="bg-white rounded-full p-2 w-10 h-10 flex items-center justify-center shadow-md">
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23 3a10.9 10.9 0 01-3.14.86 4.48 4.48 0 001.95-2.48 10.92 10.92 0 01-3.48 1.33 4.52 4.52 0 00-7.72 4.13A12.84 12.84 0 013 4.15a4.52 4.52 0 001.4 6.03 4.48 4.48 0 01-2.05-.57v.06a4.52 4.52 0 003.62 4.43 4.52 4.52 0 01-2.04.08 4.53 4.53 0 004.22 3.14 9.07 9.07 0 01-5.6 1.93c-.36 0-.72-.02-1.08-.06A12.8 12.8 0 007 21c8.68 0 13.43-7.19 13.43-13.43 0-.21 0-.42-.01-.63A9.58 9.58 0 0023 3z" />
                  </svg>
                </div>
              </a>
            )}

            {settings.linkedin && (
              <a
                href={settings.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6a6bcf] hover:scale-110 transition-transform duration-200"
              >
                <div className="bg-white rounded-full p-2 w-10 h-10 flex items-center justify-center shadow-md">
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 0h-14a5 5 0 00-5 5v14a5 5 0 005 5h14a5 5 0 005-5V5a5 5 0 00-5-5zm-11 19H5v-9h3v9zM6.5 8.5A1.75 1.75 0 118.25 6.75 1.75 1.75 0 016.5 8.5zm12.5 10.5h-3v-4.5c0-1.07-.43-1.5-1.25-1.5S13 13.43 13 14.5V19h-3v-9h3v1.29A3.35 3.35 0 0116.5 10a3.5 3.5 0 013.5 3.5V19z" />
                  </svg>
                </div>
              </a>
            )}
          </div>
        </div>

        {/* Services */}
        <div>
          <h4 className="text-white font-medium text-2xl mb-6">Services</h4>
          <ul className="space-y-4">
            <li>
              <Link
                href="/advertising"
                className="hover:text-[#FFA726] text-white text-sm font-normal transition-all"
              >
                Advertising
              </Link>
            </li>
            <li>
              <Link
                href="/monetization"
                className="hover:text-[#FFA726] text-white text-sm font-normal transition-all"
              >
                Monetization
              </Link>
            </li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="text-white font-medium text-2xl mb-6">Company</h4>
          <ul className="space-y-4">

               <li>
              <Link
                href="/about"
                className="hover:text-[#FFA726] text-white text-sm font-normal transition-all"
              >
               About Us
              </Link>
            </li>
            <li>
              <Link
                href="/privacypolicy"
                className="hover:text-[#FFA726] text-white text-sm font-normal transition-all"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                className="hover:text-[#FFA726] text-white text-sm font-normal transition-all"
              >
                Terms and Conditions
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="hover:text-[#FFA726] text-white text-sm font-normal transition-all"
              >
                Contact Us
              </Link>
            </li>
              <li>
              <Link
                href="/faq"
                className="hover:text-[#FFA726] text-white text-sm font-normal transition-all"
              >
               FAQs
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-white font-medium text-2xl mb-6">Contact Us</h4>
          <ul className="space-y-4">
            <li className="text-white text-sm font-normal hover:text-[#FFA726] transition-all">
              {settings.address}
            </li>

            {/* Keep this line EXACTLY as it is */}
            <li>
              <a
                href="javascript:void(0)"
                className="hover:text-[#FFA726] text-white text-sm font-normal transition-all"
              >
                Monday – Friday8:00 a.m. – 5:00 p.m.
              </a>
            </li>

            <li className="text-white text-sm font-normal hover:text-[#FFA726] transition-all">
              {settings.email}
            </li>
            <li className="text-white text-sm font-normal hover:text-[#FFA726] transition-all">
              +{settings.contact_number}
            </li>
          </ul>
        </div>
      </div>

      <div className="text-center pt-4 mt-8">
        <p className="text-white text-sm">
          © {new Date().getFullYear()} Adsaro. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
