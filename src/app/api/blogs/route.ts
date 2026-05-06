import { NextResponse } from "next/server";

interface RemoteBlog {
  id: number;
  post_title: string;
  slug: string;
  post_content: string;
  post_modified: string;
  image?: string | null;
  meta_description?: string | null;
  keywords?: string | null;
}

interface RemoteBlogsResponse {
  status: boolean;
  data?: RemoteBlog[];
}

export async function GET() {
  try {
    const response = await fetch("https://adsaro.net/api/blogs", {
      method: "GET",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      cache: "no-store"
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data: RemoteBlogsResponse = await response.json();

    if (data.status === true && data.data) {
      const transformedBlogs = data.data.map((blog: RemoteBlog) => ({
        id: blog.id.toString(),
        title: blog.post_title,
        slug: blog.slug,
        excerpt: blog.meta_description || blog.post_content.replace(/<[^>]*>/g, '').substring(0, 150) + '...',
        content: blog.post_content,
        author: "Admin",
        publishedAt: blog.post_modified,
        featuredImage: blog.image ? `https://adsaro.net/uploads/${blog.image}` : null,
        tags: blog.keywords ? blog.keywords.split(',').map((tag: string) => tag.trim()) : []
      }));

      return NextResponse.json({
        status: "OK",
        data: transformedBlogs,
        message: "Blogs fetched successfully"
      });
    } else {
      throw new Error("Invalid response format from blog API");
    }
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json({ status: "Error", message: "Failed to fetch blogs", data: null }, { status: 500 });
  }
}