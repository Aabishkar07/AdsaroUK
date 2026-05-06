"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card,  CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, UserIcon } from "lucide-react";
import MainNavbar from "../mainnavbar";
import Footer from "../footer";
import { usePathname } from "next/navigation";
import axios from "axios";

interface Blog {
  id: string;
  post_title: string;
  slug: string;
  post_name: string;
  post_content: string;
  author: string;
  post_modified: string;
  image?: string;
  tags?: string[];
}

interface BlogListProps {
  className?: string;
}

interface BrowseBlogHeader {
  id: number;
  title: string;
  description: string;
  main_image: string | null;
  secondary_image: string | null;
  secondary_description: string | null;
  third_description: string | null;
  third_image: string | null;
  fourth_description: string | null;
  created_at: string;
  updated_at: string;
}

export default function FrontBlog({ className }: BlogListProps) {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [browseHeader, setBrowseHeader] = useState<BrowseBlogHeader | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const [blogsRes, browseBlogRes] = await Promise.all([
          axios.get("https://adsaro.net/api/limitblogs"),
          axios.get("https://adsaro.net/api/browseblog"),
        ]);

        const blogsResult = blogsRes.data?.data;
        const browseBlogResult = browseBlogRes.data?.data;

        if (blogsResult) setBlogs(blogsResult);
        else setError("Failed to fetch blogs");

        const firstHeader = Array.isArray(browseBlogResult)
          ? browseBlogResult[0]
          : null;
        setBrowseHeader(firstHeader ?? null);
      } catch (err) {
        console.error("Error fetching blogs:", err);
        setError("Failed to load blogs. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchBlogs();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "numeric", 
      day: "numeric",
      year: "numeric",
    });
  };



  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
    <div className="">
      {pathname !== "/" && <MainNavbar />}

      <div className={`container mx-auto  px-4 py-16 ${className || ""}`}>
      <div className="text-center">
  <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
    {browseHeader?.title ?? (
      <>
        Browse Our <span className="italic">Blogs</span>
      </>
    )}
  </div>
  
  <div
    className="  mb-8 max-w-7xl mx-auto "
    dangerouslySetInnerHTML={{
      __html:
        browseHeader?.description ??
        "Stay updated with the latest insights, tips, and news .",
    }}
  />
</div>

        {blogs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No blog posts available yet.</p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 mt-12 max-w-7xl mx-auto">
            {blogs.slice(0, 8).map((blog, index) => (
              <Link href={`/blog/${blog.slug}`} key={blog.id} className="block">
           
                <Card
                    className="group overflow-hidden border-none rounded-xl shadow-md transition-all duration-500 bg-[#f7f7f7] hover:bg-[#6a6bcf] hover:shadow-xl hover:-translate-y-1"

                >
                  {blog.image && (
                    <div className="aspect-video overflow-hidden relative rounded-t-xl">
                    
                      {index === 0 && (
                        <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-md">
                          New
                        </div>
                      )}
                      <img
                        src={`https://adsaro.net/uploads/${blog.image}`}
                        alt={blog.post_title}
                        className="w-full h-full object-cover px-2 pt-2 rounded-2xl transition-transform duration-500"
                      />
                    </div>
                  )}

           
                  <CardHeader className="p-4">
                
                    <CardTitle className="line-clamp-2 text-xl font-bold text-gray-800 transition-colors group-hover:text-white">
                      {blog.post_title}
                    </CardTitle>

                    <div className="pt-2">
                 
                      <p className="text-sm line-clamp-3 mb-4 text-gray-600 transition-colors group-hover:text-white/90">
                        {blog.post_content.replace(/<[^>]*>/g, "").substring(0, 100)}...
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
                  
                      <div className="flex items-center gap-1">
                        <UserIcon className="w-4 h-4 text-gray-500 transition-colors group-hover:text-white/90" />
                        <span className="text-xs transition-colors group-hover:text-white/90">{blog.author || "Admin"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4 text-gray-500 transition-colors group-hover:text-white/90" />
                        <span className="text-xs transition-colors group-hover:text-white/90">{formatDate(blog.post_modified)}</span>
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
            ))}
          </div>
        )}
      </div>

      {pathname !== "/" && <Footer />}
    </div>
  );
}
