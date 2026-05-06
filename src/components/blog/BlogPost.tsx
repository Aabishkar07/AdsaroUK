"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft as ArrowLeftIcon,
  Calendar as CalendarIcon,
  User as UserIcon,
  Share2 as ShareIcon,
  Clock as ClockIcon,
  AlertCircle as AlertCircleIcon,
  Tag as TagIcon,
} from "lucide-react";
import Link from "next/link";
import MainNavbar from "../mainnavbar";
import Footer from "../footer";

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  featuredImage: string | null;
  tags: string[];
}



export default function BlogPost() {
  const params = useParams();
  const router = useRouter();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const slug = params?.slug as string;
  
  // --- Data Fetching & State Logic (Kept Unchanged) ---
  useEffect(() => {
    if (!slug) return;

    async function fetchBlog() {
      try {
        setLoading(true);
        const response = await fetch(
          `https://adsaro.net/api/blog/${slug}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            cache: "no-store",
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          
          if (response.status === 404) {
            setError("Blog post not found");
          } else {
            setError(
              `Error: ${
                errorData.message || `HTTP error! status: ${response.status}`
              }`
            );
          }
          return;
        }

        const result = await response.json();
        
        if (result?.data) {
          const post = result.data;
          const blogData = {
            id: post.id?.toString() || "",
            title: post.post_title || "No Title",
            slug: post.slug || slug,
            excerpt: post.post_excerpt || post.meta_description || "",
            content: post.post_content || "",
            author: post.author_name || "Admin",
            publishedAt:
              post.post_date || post.created_at || new Date().toISOString(),
            featuredImage: post.image
              ? `https://adsaro.net/uploads/${post.image}`
              : null,
            tags: post.keywords
              ? post.keywords.split(",").map((t: string) => t.trim()).filter((t: string) => t.length > 0)
              : [],
          };
          setBlog(blogData);
        } else {
          throw new Error("Invalid blog post data received");
        }
      } catch {
        setError("Failed to load blog post. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchBlog();
  }, [slug]);

  const readingTime = useMemo(() => {
    if (!blog?.content) return null;
    const text = blog.content
      .replace(/<[^>]*>/g, " ")
      .replace(/&[a-z]+;/gi, " ")
      .trim();
    const words = text ? text.split(/\s+/).length : 0;
    return Math.max(1, Math.ceil(words / 200));
  }, [blog?.content]);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: blog?.title || "Blog Post",
          text: blog?.excerpt || "Check out this blog post!",
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (e){
      // Handle error
      console.log(e);
    }
  };
  // --- End Data Fetching & State Logic ---

  // --- Loading, Error, and Not Found States (Kept Unchanged) ---
  if (loading) {
    // ... (Loading State UI as before)
    return (
        <div className="min-h-screen flex flex-col bg-white">
            <MainNavbar />
            <div className="relative w-full h-72 md:h-96 bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="container mx-auto px-4 max-w-7xl h-full flex flex-col justify-end pb-8">
                    <div className="w-2/3 max-w-2xl">
                        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-3" />
                        <div className="h-10 w-full bg-gray-200 rounded animate-pulse mb-3" />
                        <div className="h-10 w-2/3 bg-gray-200 rounded animate-pulse" />
                    </div>
                </div>
            </div>
            <div className="container mx-auto px-4 max-w-7xl -mt-12 md:-mt-16">
                <Card className="shadow-xl rounded-2xl overflow-hidden">
                    <CardContent className="p-6 md:p-10">
                        <div className="space-y-4">
                            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
                            <div className="h-5 w-full bg-gray-200 rounded animate-pulse" />
                            <div className="h-5 w-11/12 bg-gray-200 rounded animate-pulse" />
                            <div className="h-5 w-4/5 bg-gray-200 rounded animate-pulse" />
                            <div className="h-64 w-full bg-gray-200 rounded animate-pulse" />
                        </div>
                    </CardContent>
                </Card>
            </div>
            <Footer />
        </div>
    );
  }

  if (error) {
    // ... (Error State UI as before)
    return (
        <div className="min-h-screen flex flex-col bg-white">
            <MainNavbar />
            <div className="container mx-auto px-4 max-w-7xl py-16">
                <Card className="border-red-100 bg-red-50/40">
                    <CardContent className="py-10 text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                            <AlertCircleIcon className="h-6 w-6 text-red-500" />
                        </div>
                        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                            We hit a snag
                        </h1>
                        <p className="text-red-600 mb-6">{error}</p>
                        <div className="flex items-center justify-center gap-3">
                            <Button onClick={() => router.back()} className="gap-2">
                                <ArrowLeftIcon className="w-4 h-4" />
                                Go Back
                            </Button>
                            <Link href="/blog">
                                <Button variant="outline">View All Blogs</Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <Footer />
        </div>
    );
  }

  if (!blog) {
    // ... (Not Found UI as before)
    return (
        <div className="min-h-screen flex flex-col bg-white">
            <MainNavbar />
            <div className="container mx-auto px-4 max-w-7xl py-16">
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-gray-600 text-lg">Blog post not found.</p>
                        <Link href="/blog">
                            <Button className="mt-6">View All Blogs</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
            <Footer />
        </div>
    );
  }
  // --- End States ---

  // --- REVISED Main Blog Post Component ---
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <MainNavbar />

      {/* Breadcrumb / Back to Blog (Unchanged) */}
      <div className="container mx-auto px-4 pb-3 max-w-6xl w-full mt-6 md:mt-32">
        <Link
          href="/blog"
          className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-1" /> Back to Blogs
        </Link>
      </div>

      {/* Featured Image and Title Section (Title on Top, Image Full Width) */}
      <section className="container mx-auto px-4 max-w-6xl w-full">
        <Card className="rounded-2xl border-slate-200 overflow-hidden shadow-sm">
          
          {/* Title and Meta Information (Now at the very top of the card) */}
          <header className="p-6 md:p-8">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900">
              {blog.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-blue-500" />
                <span className="font-medium">{blog.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-blue-500" />
                <span>
                  {new Date(blog.publishedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              {readingTime && (
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-4 h-4 text-blue-500" />
                  <span>{readingTime} min read</span>
                </div>
              )}
                 <div className="">
              <Button
                onClick={handleShare}
                variant="outline"
                className="flex items-center gap-2"
                aria-label="Share this post"
                title={copied ? "Link copied!" : "Share or copy link"}
              >
                <ShareIcon className="w-4 h-4" />
                {copied ? "Link copied" : "Share"}
              </Button>
            </div>
            </div>

         
          </header>

          {/* Featured Image (Full width, placed below the header) */}
          {blog.featuredImage && (
            <div className="relative w-full h-80 md:h-[28rem] lg:h-[32rem] bg-slate-100">
              <img
                src={blog.featuredImage}
                alt={blog.title}
                // 'object-cover' ensures the image fills the container beautifully
                className="w-full h-full object-cover" 
              />
            </div>
          )}
        </Card>
      </section>

      {/* Article Content and Sticky Sidebar Section */}
      <main className="container mx-auto px-4 max-w-6xl w-full mt-10 mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-10">
          
          {/* Left Column: Article Content (2/3 width on large screens) */}
          <div className="lg:col-span-2">
            <Card className="rounded-2xl shadow-sm border-slate-200">
              <CardContent className="p-6 md:p-10">
                <div
                  className="prose prose-lg max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-a:text-blue-600 prose-strong:text-slate-900"
                  dangerouslySetInnerHTML={{ __html: blog.content }}
                />
              </CardContent>
            </Card>

            {/* Bottom Controls (Unchanged) */}
            <div className="mt-8 flex items-center justify-between">
              <Link href="/blog">
                <Button variant="outline" className="flex items-center gap-2">
                  <ArrowLeftIcon className="w-4 h-4" />
                  All Blog Posts
                </Button>
              </Link>
              <Button
                onClick={handleShare}
                variant="outline"
                className="flex items-center gap-2"
                aria-label="Share this post"
                title={copied ? "Link copied!" : "Share or copy link"}
              >
                <ShareIcon className="w-4 h-4" />
                {copied ? "Link copied" : "Share"}
              </Button>
            </div>
          </div>

          {/* Right Column: Sticky Sidebar (1/3 width on large screens) */}
          <div className="lg:col-span-1 mt-10 lg:mt-0">
            {/* The wrapper div below is made sticky, containing all sidebar cards. 
                This is the standard way to make multiple elements stick together. */}
            <aside className="space-y-8 sticky top-6"> 
              
              {/* Author Card (Now inside the sticky wrapper) */}
              <Card className="rounded-xl border-slate-200 ">
                <CardHeader className="p-4 border-b">
                  <CardTitle className="text-lg flex items-center gap-2 ">
                    <UserIcon className="w-5 h-5 text-blue-600" />
                    About the Author
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                  <p className="font-semibold text-slate-800">{blog.author}</p>
                  <p className="text-sm text-slate-600">
                    The author is responsible for curating content and maintaining
                    the technical accuracy of this post.
                  </p>
                  <Button variant="link" className="p-0 h-auto text-blue-600">
                      View Author Posts
                  </Button>
                </CardContent>
              </Card>
              
              {/* Tags Card (Now inside the sticky wrapper) */}
              {blog.tags.length > 0 && (
                  <Card className="rounded-xl border-slate-200">
                      <CardHeader className="p-4 border-b">
                          <CardTitle className="text-lg flex items-center gap-2">
                              <TagIcon className="w-5 h-5 text-blue-600" />
                              Topics & Tags
                          </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 flex flex-wrap gap-2">
                          {blog.tags.map((tag) => (
                              <Link href={`/blog/tag/${tag.toLowerCase().replace(/\s/g, '-')}`} key={tag} passHref>
                                  <Button variant="secondary" size="sm" className="h-7 text-xs font-normal">
                                      #{tag}
                                  </Button>
                              </Link>
                          ))}
                      </CardContent>
                  </Card>
              )}

              {/* Related Posts Card (Now sticky with the rest of the sidebar) */}
              <Card className="rounded-xl border-slate-200 bg-slate-50">
                  <CardHeader className="p-4 border-b">
                      <CardTitle className="text-lg text-slate-500">Related Posts</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 text-sm text-slate-500 italic">
                      More posts related to this topic would appear here.
                  </CardContent>
              </Card>

            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
