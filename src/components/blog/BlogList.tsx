"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, UserIcon } from "lucide-react";
import MainNavbar from "../mainnavbar";
import Footer from "../footer";
import { usePathname } from "next/navigation";

interface APIBlog {
  id: number | string;
  title?: string;
  post_title?: string;
  slug?: string;
  image?: string | null;
  short_description?: string | null;
  description?: string | null;
  excerpt?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  post_content?: string;
}

interface Category {
  id: number;
  name: string;
  parent_id: number | null;
  blogs?: APIBlog[];
  children?: Category[];
}

interface BlogListProps {
  className?: string;
}

export default function BlogList({ className }: BlogListProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeMainId, setActiveMainId] = useState<number | null>(null);
  const [blogsByCategory, setBlogsByCategory] = useState<Record<number, APIBlog[]>>({});
  const [subLoading, setSubLoading] = useState<Record<number, boolean>>({});
  const [latestBlogs, setLatestBlogs] = useState<APIBlog[]>([]);
  const [generalBlogs, setGeneralBlogs] = useState<APIBlog[]>([]);
  const [generalPage, setGeneralPage] = useState<number>(1);
  const [generalLastPage, setGeneralLastPage] = useState<number | null>(null);
  const [categoryPages, setCategoryPages] = useState<Record<number, number>>({});
  const [categoryLastPages, setCategoryLastPages] = useState<Record<number, number | null>>({});
  const pathname = usePathname();

  useEffect(() => {
    async function fetchCategories() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("https://adsaro.net/api/categories", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const items: Category[] = Array.isArray(data) ? data : data?.data ?? [];
        setCategories(items);
      } catch {
        setError("Failed to load categories. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  const mainCategories = useMemo(() => categories.filter((c) => c.parent_id === null), [categories]);

  const activeMainCategory = useMemo(() => {
    if (activeMainId == null) return null;
    return mainCategories.find((c) => c.id === activeMainId) || null;
  }, [activeMainId, mainCategories]);

  const subcategories = useMemo(
    () => activeMainCategory?.children ?? [],
    [activeMainCategory]
  );

  useEffect(() => {
    async function fetchLatestBlogs() {
      try {
        const res = await fetch("https://adsaro.net/api/limitblogs", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const items: APIBlog[] = Array.isArray(data) ? data : data?.data ?? [];
        setLatestBlogs(items);
      } catch {
        setLatestBlogs([]);
      }
    }

    fetchLatestBlogs();
  }, []);

  useEffect(() => {
    async function fetchGeneralBlogs() {
      try {
        const res = await fetch(`https://adsaro.net/api/blogs?page=${generalPage}`, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const pagination = data?.data;
        const items: APIBlog[] = Array.isArray(pagination)
          ? pagination
          : Array.isArray(pagination?.data)
          ? pagination.data
          : [];

        setGeneralBlogs(items);
        if (pagination && typeof pagination.last_page === "number") {
          setGeneralLastPage(pagination.last_page);
        } else {
          setGeneralLastPage(null);
        }
      } catch {
        setGeneralBlogs([]);
        setGeneralLastPage(null);
      }
    }

    fetchGeneralBlogs();
  }, [generalPage]);

  useEffect(() => {
    if (!subcategories || subcategories.length === 0) return;

    subcategories.forEach((sub) => {
      if (!sub || subLoading[sub.id]) return;

      const page = categoryPages[sub.id] || 1;
      setSubLoading((prev) => ({ ...prev, [sub.id]: true }));

      fetch(`https://adsaro.net/api/blogs/category/${sub.id}?page=${page}`, {
        cache: "no-store",
      })
        .then(async (res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          const pagination = data?.data;
          const items: APIBlog[] = Array.isArray(pagination)
            ? pagination
            : Array.isArray(pagination?.data)
            ? pagination.data
            : [];

          setBlogsByCategory((prev) => ({ ...prev, [sub.id]: items }));

          if (pagination && typeof pagination.last_page === "number") {
            setCategoryLastPages((prev) => ({ ...prev, [sub.id]: pagination.last_page }));
          } else {
            setCategoryLastPages((prev) => ({ ...prev, [sub.id]: null }));
          }
        })
        .catch(() => {
          setBlogsByCategory((prev) => ({ ...prev, [sub.id]: [] }));
          setCategoryLastPages((prev) => ({ ...prev, [sub.id]: null }));
        })
        .finally(() => {
          setSubLoading((prev) => ({ ...prev, [sub.id]: false }));
        });
    });
  }, [subcategories, categoryPages, subLoading]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="relative flex items-center justify-center h-24 w-24">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-24 w-24 border-4 border-blue-600 border-t-transparent"></div>
          </div>
          <div className="flex items-center justify-center h-16 w-16 ">
            <img
              src="/newfavicon.png"
              alt="Loading"
              className="h-10 w-10 object-contain"
            />
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );

  return (


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
    <div className="">
      {pathname !== "/" && <MainNavbar />}

      <div className={`max-w-7xl mx-auto mt-20 px-4 py-10 ${className || ""}`}>
        <div className="text-center mb-14">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-2">
           Explore Our{" "}
            <span className=" bg-clip-text">
              Blogs
            </span>
          </h1>
     
        </div>

        {/* Tabs: Main Categories at top */}
        <div className="w-full overflow-x-auto mt-4">
          <div className="inline-flex gap-2 border-b border-gray-200 pb-2 min-w-full">
            <button
              type="button"
              onClick={() => setActiveMainId(null)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap ${
                activeMainId == null
                  ? "bg-[#6a6bcf] text-white shadow"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              }`}
            >
             Our Blogs
            </button>

            {mainCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveMainId(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  activeMainId === cat.id
                    ? "bg-[#6a6bcf] text-white shadow"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Latest blogs only when no category is selected */}
        {activeMainId == null && latestBlogs.length > 0 && (
          <section className="mt-8 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-800">Latest Blogs</h3>
              <span className="text-sm text-gray-500">{latestBlogs.length} posts</span>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
              {latestBlogs.map((blog, index) => {
                const title = blog.title || blog.post_title || "Untitled";
                const imagePath = (blog.image as string) || undefined;
                const img = imagePath ? `https://adsaro.net/uploads/${imagePath}` : undefined;
                const rawContent =
                  (blog.post_content as string) ||
                  blog.description ||
                  blog.excerpt ||
                  blog.short_description ||
                  "";
                const cleanText = rawContent ? rawContent.replace(/<[^>]*>/g, "") : "";
                const desc = cleanText
                  ? cleanText.substring(0, 100) + (cleanText.length > 100 ? "..." : "")
                  : "";

                const slug = blog.slug ?? blog.id;

                return (
                  <Link href={slug ? `/blog/${slug}` : "#"} key={`latest-${blog.id}`} className="block">
                    <Card className="group overflow-hidden border-none rounded-xl shadow-md transition-all duration-500 bg-[#f7f7f7] hover:bg-[#6a6bcf] hover:shadow-xl hover:-translate-y-1">
                      {img && (
                        <div className="aspect-video overflow-hidden relative rounded-t-xl">
                          {index === 0 && (
                            <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-md">
                              New
                            </div>
                          )}
                          <img
                            src={img}
                            alt={title}
                            className="w-full h-full object-cover px-2 pt-2 rounded-2xl transition-transform duration-500"
                          />
                        </div>
                      )}

                      <CardHeader className="p-4">
                        <CardTitle className="line-clamp-2 text-xl font-bold text-gray-800 transition-colors group-hover:text-white">
                          {title}
                        </CardTitle>

                        <div className="pt-2">
                          <p className="text-sm line-clamp-3 mb-4 text-gray-600 transition-colors group-hover:text-white/90">
                            {desc}
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
                          <div className="flex items-center gap-1">
                            <UserIcon className="w-4 h-4 text-gray-500 transition-colors group-hover:text-white/90" />
                            <span className="text-xs transition-colors group-hover:text-white/90">{"Admin"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="w-4 h-4 text-gray-500 transition-colors group-hover:text-white/90" />
                            <span className="text-xs transition-colors group-hover:text-white/90">
                              {blog.updated_at || blog.created_at
                                ? new Date((blog.updated_at || blog.created_at) as string).toLocaleDateString()
                                : ""}
                            </span>
                          </div>
                          <div className="text-sm font-semibold flex items-center gap-1 transition-colors group-hover:text-white">
                            <span>Read More</span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {activeMainId == null && generalBlogs.length > 0 && (
          <section className="mt-12 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-800">General Blogs</h3>
              <span className="text-sm text-gray-500">{generalBlogs.length} posts</span>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
              {generalBlogs.map((blog, index) => {
                const title = blog.post_title || blog.title || "Untitled";
                const imagePath = (blog.image as string) || undefined;
                const img = imagePath ? `https://adsaro.net/uploads/${imagePath}` : undefined;
                const rawContent =
                  (blog.post_content as string) ||
                  blog.description ||
                  blog.excerpt ||
                  blog.short_description ||
                  "";
                const cleanText = rawContent ? rawContent.replace(/<[^>]*>/g, "") : "";
                const desc = cleanText
                  ? cleanText.substring(0, 100) + (cleanText.length > 100 ? "..." : "")
                  : "";

                const slug = blog.slug ?? blog.id;

                return (
                  <Link href={slug ? `/blog/${slug}` : "#"} key={`general-${blog.id}`} className="block">
                    <Card className="group overflow-hidden border-none rounded-xl shadow-md transition-all duration-500 bg-[#f7f7f7] hover:bg-[#6a6bcf] hover:shadow-xl hover:-translate-y-1">
                      {img && (
                        <div className="aspect-video overflow-hidden relative rounded-t-xl">
                          {index === 0 && (
                            <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-md">
                              New
                            </div>
                          )}
                          <img
                            src={img}
                            alt={title}
                            className="w-full h-full object-cover px-2 pt-2 rounded-2xl transition-transform duration-500"
                          />
                        </div>
                      )}

                      <CardHeader className="p-4">
                        <CardTitle className="line-clamp-2 text-xl font-bold text-gray-800 transition-colors group-hover:text-white">
                          {title}
                        </CardTitle>

                        <div className="pt-2">
                          <p className="text-sm line-clamp-3 mb-4 text-gray-600 transition-colors group-hover:text-white/90">
                            {desc}
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
                          <div className="flex items-center gap-1">
                            <UserIcon className="w-4 h-4 text-gray-500 transition-colors group-hover:text-white/90" />
                            <span className="text-xs transition-colors group-hover:text-white/90">{"Admin"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="w-4 h-4 text-gray-500 transition-colors group-hover:text-white/90" />
                            <span className="text-xs transition-colors group-hover:text-white/90">
                              {blog.updated_at || blog.created_at
                                ? new Date((blog.updated_at || blog.created_at) as string).toLocaleDateString()
                                : ""}
                            </span>
                          </div>
                          <div className="text-sm font-semibold flex items-center gap-1 transition-colors group-hover:text-white">
                            <span>Read More</span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>
                );
              })}
            </div>

            {generalLastPage && generalLastPage > 1 && (
              <div className="flex items-center justify-center gap-4 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={generalPage <= 1}
                  onClick={() => setGeneralPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {generalPage} of {generalLastPage}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={generalLastPage !== null && generalPage >= generalLastPage}
                  onClick={() =>
                    setGeneralPage((p) =>
                      generalLastPage !== null ? Math.min(generalLastPage, p + 1) : p + 1
                    )
                  }
                >
                  Next
                </Button>
              </div>
            )}
          </section>
        )}
        {/* Subcategories and Blogs */}
        {activeMainCategory && (
          <div className="mt-10 space-y-12">
            {subcategories.length === 0 && (
              <div className="text-center py-8 text-gray-500">No subcategories found.</div>
            )}

            {subcategories.map((sub) => (
            <section key={sub.id}>
              {(() => {
                const blogs = blogsByCategory[sub.id] || [];
                // If there are no blogs yet for this subcategory, don't render it at all
                if (blogs.length === 0) {
                  return null;
                }

                return (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-bold text-gray-800">{sub.name}</h3>
                      <span className="text-sm text-gray-500">{blogs.length || 0} posts</span>
                    </div>

                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                        {blogs.map((blog, index) => {
                          const title = blog.title || blog.post_title || "Untitled";
                          const imagePath = (blog.image as string) || undefined;
                          const img = imagePath
                            ? `https://adsaro.net/uploads/${imagePath}`
                            : undefined;
                          const rawContent =
                            (blog.post_content as string) ||
                            blog.description ||
                            blog.excerpt ||
                            blog.short_description ||
                            "";
                          const cleanText = rawContent
                            ? rawContent.replace(/<[^>]*>/g, "")
                            : "";
                          const desc = cleanText
                            ? cleanText.substring(0, 100) + (cleanText.length > 100 ? "..." : "")
                            : "";

                          const slug = blog.slug ?? blog.id;

                          return (
                            <Link href={slug ? `/blog/${slug}` : "#"} key={`${sub.id}-${blog.id}`} className="block">
                              <Card
                                className="group overflow-hidden border-none rounded-xl shadow-md transition-all duration-500 bg-[#f7f7f7] hover:bg-[#6a6bcf] hover:shadow-xl hover:-translate-y-1"
                              >
                                {img && (
                                  <div className="aspect-video overflow-hidden relative rounded-t-xl">
                                    {index === 0 && (
                                      <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-md">
                                        New
                                      </div>
                                    )}
                                    <img
                                      src={img}
                                      alt={title}
                                      className="w-full h-full object-cover px-2 pt-2 rounded-2xl transition-transform duration-500"
                                    />
                                  </div>
                                )}

                                <CardHeader className="p-4">
                                  <CardTitle className="line-clamp-2 text-xl font-bold text-gray-800 transition-colors group-hover:text-white">
                                    {title}
                                  </CardTitle>

                                  <div className="pt-2">
                                    <p className="text-sm line-clamp-3 mb-4 text-gray-600 transition-colors group-hover:text-white/90">
                                      {desc}
                                    </p>
                                  </div>

                                  <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
                                    <div className="flex items-center gap-1">
                                      <UserIcon className="w-4 h-4 text-gray-500 transition-colors group-hover:text-white/90" />
                                      <span className="text-xs transition-colors group-hover:text-white/90">
                                        {"Admin"}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <CalendarIcon className="w-4 h-4 text-gray-500 transition-colors group-hover:text-white/90" />
                                      <span className="text-xs transition-colors group-hover:text-white/90">
                                        {blog.updated_at || blog.created_at
                                          ? new Date(
                                              (blog.updated_at || blog.created_at) as string
                                            ).toLocaleDateString()
                                          : ""}
                                      </span>
                                    </div>
                                    <div className="text-sm font-semibold flex items-center gap-1 transition-colors group-hover:text-white">
                                      <span>Read More</span>
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M9 5l7 7-7 7"
                                        />
                                      </svg>
                                    </div>
                                  </div>
                                </CardHeader>
                              </Card>
                            </Link>
                          );
                        })}
                      </div>

                      {categoryLastPages[sub.id] && categoryLastPages[sub.id]! > 1 && (
                        <div className="flex items-center justify-center gap-4 mt-6">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={(categoryPages[sub.id] || 1) <= 1}
                            onClick={() =>
                              setCategoryPages((prev) => ({
                                ...prev,
                                [sub.id]: Math.max(1, (prev[sub.id] || 1) - 1),
                              }))
                            }
                          >
                            Previous
                          </Button>
                          <span className="text-sm text-gray-600">
                            Page {categoryPages[sub.id] || 1} of {categoryLastPages[sub.id]}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={
                              categoryLastPages[sub.id] !== null &&
                              (categoryPages[sub.id] || 1) >= (categoryLastPages[sub.id] as number)
                            }
                            onClick={() =>
                              setCategoryPages((prev) => ({
                                ...prev,
                                [sub.id]: categoryLastPages[sub.id]
                                  ? Math.min(categoryLastPages[sub.id] as number, (prev[sub.id] || 1) + 1)
                                  : (prev[sub.id] || 1) + 1,
                              }))
                            }
                          >
                            Next
                          </Button>
                        </div>
                      )}
                  </>
                );
              })()}
            </section>
          ))}
          </div>
        )}
      </div>

      {pathname !== "/" && <Footer />}
    </div>
    </div>
  );
}