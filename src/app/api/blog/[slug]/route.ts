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

type RouteParams = {
  params: Promise<{ slug: string }>;
}

export async function GET(
  request: Request,
  context: RouteParams
) {
  const { slug } = await context.params;

  try {
    // Fetch all blogs from remote API
    const response = await fetch("https://adsaro.net/api/blogs", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data: RemoteBlogsResponse = await response.json();

    if (!data.status || !data.data) throw new Error("Invalid response format");

    // Find the blog by slug
    const blog = data.data.find((b: RemoteBlog) => b.slug === slug);

    if (!blog) {
      return NextResponse.json(
        { status: "Error", message: "Blog not found", data: null },
        { status: 404 }
      );
    }

    // Transform blog to frontend format
    const transformedBlog = {
      id: blog.id.toString(),
      title: blog.post_title,
      slug: blog.slug,
      excerpt:
        blog.meta_description ||
        (blog.post_content.replace(/<[^>]*>/g, "").substring(0, 150) + "..."),
      content: blog.post_content,
      author: "Admin",
      publishedAt: blog.post_modified,
      featuredImage: blog.image ? `https://adsaro.net/uploads/${blog.image}` : null,
      tags: blog.keywords ? blog.keywords.split(",").map((t) => t.trim()) : [],
    };

    return NextResponse.json({
      status: "OK",
      data: transformedBlog,
      message: "Blog fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching blog:", error);
    return NextResponse.json(
      { status: "Error", message: "Failed to fetch blog post", data: null },
      { status: 500 }
    );
  }
}