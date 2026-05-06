"use client";
import React, { useState , useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import AdsaroLogo from "../../public/newLogo.png"; // adjust path if needed
import { usePathname } from "next/navigation";

const ModernNavbar = () => {
  const [activeLink, setActiveLink] = useState("Home");
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileSolutionsOpen, setMobileSolutionsOpen] = useState(false);
  const [mobileCompanyOpen, setMobileCompanyOpen] = useState(false);
  const pathname = usePathname();

 useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      <div className="w-full px-4 py-3 fixed top-0 left-0 z-50 ">
<nav
          className={`max-w-7xl mx-auto px-8 py-1.5 rounded-xl transition-all duration-300 ${
            isScrolled ? "border border-gray-200" : "border border-transparent"
          }`}
          style={
            isScrolled
              ? {
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  backdropFilter: "blur(10px)",
                  boxShadow:
                    "0 4px 6px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
                }
              : {
                  backgroundColor: "transparent",
                  backdropFilter: "none",
                  boxShadow: "none",
                }
          }
        >
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/">
                <Image
                  src={AdsaroLogo}
                  alt="Adsaro Logo"
                  width={120} // adjust size as needed
                  height={50}
                  className="object-contain"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <Link href="/" className="relative text-gray-600 text-base font-medium transition-colors hover:text-gray-900">
                Home
                {pathname === "/" && (
                  <span className="absolute left-0 right-0 -bottom-1 h-[2px] bg-[#6a6bcf] rounded-full" />
                )}
              </Link>

                  <Link href="/about" className="relative text-gray-600 text-base font-medium transition-colors hover:text-gray-900">
                About Us
                {pathname === "/about" && (
                  <span className="absolute left-0 right-0 -bottom-1 h-[2px] bg-[#6a6bcf] rounded-full" />
                )}
              </Link>

              {/* Solutions Dropdown */}
              <div className="relative">
                <button
                  onMouseEnter={() => setSolutionsOpen(true)}
                  onMouseLeave={() => setSolutionsOpen(false)}
                  onClick={() => setActiveLink("Solutions")}
                  className={`flex items-center text-base font-medium transition-colors ${
                    activeLink === "Solutions"
                      ? "text-gray-900 border-b-2 border-purple-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Solutions
                    <svg
                    className="ml-1 w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {solutionsOpen && (
                  <div
                    onMouseEnter={() => setSolutionsOpen(true)}
                    onMouseLeave={() => setSolutionsOpen(false)}
                    className="absolute top-full left-0  w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50"
                  >
                    <a
                      href="/advertising"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 transition-colors"
                    >
                      Advertising
                    </a>
                    <a
                      href="/monetization"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 transition-colors"
                    >
                      Monetization
                    </a>
                  </div>
                )}
              </div>

             
                <Link href="/blog" className=" relative text-gray-600 text-base font-medium transition-colors hover:text-gray-900">
                Blogs
                {pathname === "/blog" && (
                  <span className="absolute left-0 right-0 -bottom-1 h-[2px] bg-[#6a6bcf] rounded-full" />
                )}
              </Link>

              {/* Company Dropdown */}
              <div className="relative">
                <button
                  onMouseEnter={() => setCompanyOpen(true)}
                  onMouseLeave={() => setCompanyOpen(false)}
                  onClick={() => setActiveLink("Company")}
                  className={`flex items-center text-base font-medium transition-colors ${
                    activeLink === "Company"
                      ? "text-gray-900 border-b-2 border-purple-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Company
                  <svg
                    className="ml-1 w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {companyOpen && (
                  <div
                    onMouseEnter={() => setCompanyOpen(true)}
                    onMouseLeave={() => setCompanyOpen(false)}
                    className="absolute top-full left-0  w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50"
                  >
                    <a
                      href="/contact"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 transition-colors"
                    >
                      Contact Us
                    </a>
                    <a
                      href="/terms"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 transition-colors"
                    >
                      Terms & Conditions
                    </a>
                    <a
                      href="/privacypolicy"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 transition-colors"
                    >
                      Privacy Policy
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Login Dropdown */}
              <div className="relative">
                <button
                  onMouseEnter={() => setLoginOpen(true)}
                  onMouseLeave={() => setLoginOpen(false)}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Login
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                {loginOpen && (
                  <div
                    onMouseEnter={() => setLoginOpen(true)}
                    onMouseLeave={() => setLoginOpen(false)}
                    className="absolute top-full right-0  w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50"
                  >
                    <a
                      href="/advertiser/login"
                      rel="noopener noreferrer"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 transition-colors"
                    >
                      Advertiser Login
                    </a>
                    <a
                      href="/publisher/login"
                      rel="noopener noreferrer"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 transition-colors"
                    >
                      Publisher Login
                    </a>
                  </div>
                )}
              </div>

              {/* Register Dropdown */}
              <div className="relative">
                <button
                  onMouseEnter={() => setRegisterOpen(true)}
                  onMouseLeave={() => setRegisterOpen(false)}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Register
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                {registerOpen && (
                  <div
                    onMouseEnter={() => setRegisterOpen(true)}
                    onMouseLeave={() => setRegisterOpen(false)}
                    className="absolute top-full right-0  w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50"
                  >
                    <a
                      href="/advertiser/signup"
                      rel="noopener noreferrer"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 transition-colors"
                    >
                      Advertiser Register
                    </a>
                    <a
                      href="/publisher/signup"
                      rel="noopener noreferrer"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 transition-colors"
                    >
                      Publisher Register
                    </a>
                  </div>
                )}
              </div>

              {/* Sign Up Button */}
              {/* <button className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full font-medium hover:shadow-lg hover:scale-105 transition-all duration-200">
              Sign up
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </button> */}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 space-y-3 border-t pt-4 bg-white rounded-lg shadow-lg border border-gray-200 p-3">
              <Link
                href="/"
                onClick={() => {
                  setActiveLink("Home");
                  setMobileMenuOpen(false);
                  setMobileSolutionsOpen(false);
                  setMobileCompanyOpen(false);
                }}
                className={`block w-full text-left px-4 py-2 rounded-lg ${
                  activeLink === "Home"
                    ? "bg-purple-100 text-purple-900"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Home
              </Link>

                 <Link
                href="/about"
                onClick={() => {
                  setActiveLink("About");
                  setMobileMenuOpen(false);
                  setMobileSolutionsOpen(false);
                  setMobileCompanyOpen(false);
                }}
                className={`block w-full text-left px-4 py-2 rounded-lg ${
                  activeLink === "About"
                    ? "bg-purple-100 text-purple-900"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                About Us
              </Link>

              <button
                onClick={() => {
                  setActiveLink("Solutions");
                  setMobileSolutionsOpen((v) => !v);
                  setMobileCompanyOpen(false);
                }}
                className={`flex w-full items-center justify-between text-left px-4 py-2 rounded-lg ${
                  activeLink === "Solutions"
                    ? "bg-purple-100 text-purple-900"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span>Solutions</span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    mobileSolutionsOpen ? "rotate-180" : "rotate-0"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {mobileSolutionsOpen && (
                <div className="px-2 pb-1">
                  <Link
                    href="/advertising"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setMobileSolutionsOpen(false);
                    }}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    Advertising
                  </Link>
                  <Link
                    href="/monetization"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setMobileSolutionsOpen(false);
                    }}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    Monetization
                  </Link>
                </div>
              )}

              <Link
                href="/blog"
                onClick={() => {
                  setActiveLink("Blogs");
                  setMobileMenuOpen(false);
                  setMobileSolutionsOpen(false);
                  setMobileCompanyOpen(false);
                }}
                className={`block w-full text-left px-4 py-2 rounded-lg ${
                  activeLink === "Blogs"
                    ? "bg-purple-100 text-purple-900"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Blogs
              </Link>

              <button
                onClick={() => {
                  setActiveLink("Company");
                  setMobileCompanyOpen((v) => !v);
                  setMobileSolutionsOpen(false);
                }}
                className={`flex w-full items-center justify-between text-left px-4 py-2 rounded-lg ${
                  activeLink === "Company"
                    ? "bg-purple-100 text-purple-900"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span>Company</span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    mobileCompanyOpen ? "rotate-180" : "rotate-0"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {mobileCompanyOpen && (
                <div className="px-2 pb-1">
                  <Link
                    href="/contact"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setMobileCompanyOpen(false);
                    }}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    Contact Us
                  </Link>
                  <Link
                    href="/terms"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setMobileCompanyOpen(false);
                    }}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    Terms & Conditions
                  </Link>
                  <Link
                    href="/privacypolicy"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setMobileCompanyOpen(false);
                    }}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    Privacy Policy
                  </Link>
                </div>
              )}

              <div className="border-t pt-3 mt-3 space-y-2">
                <p className="px-4 text-xs font-semibold text-gray-500 uppercase">
                  Account
                </p>
                <a
                  href="/advertiser/login"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Advertiser Login
                </a>
                <a
                  href="/publisher/login"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Publisher Login 
                </a>
                <a  
                  href="/advertiser/signup"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Advertiser Register
                </a>
                <a
                  href="/publisher/signup"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Publisher Register
                </a>
              </div>

              <button className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full font-medium">
                Sign up
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </button>
            </div>
          )}
        </nav>
      </div>
    </div>
  );
};

export default ModernNavbar;
