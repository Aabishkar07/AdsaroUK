import BlogPost from "@/components/blog/BlogPost";

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Narrow interface for the fields used to build metadata
interface BlogMeta {
  meta_title?: string;
  title?: string;
  post_title?: string;
  meta_description?: string;
  excerpt?: string;
  post_excerpt?: string;
  keywords?: string[] | string;
  meta_keywords?: string[] | string;
  post_keywords?: string[] | string;
  blogimage?: string;
  featuredImage?: string;
  image?: string;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  // Ensure we align with Next.js 15 where params is a Promise
  await params;
  return <BlogPost />;
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  try {
    // Fetch blog data for metadata
    const { slug } = await params;
    const baseRaw = process.env.NEXT_PUBLIC_BASE_URL || "https://www.adsaro.com";
    const base = baseRaw.replace(/\/+$/, "");
    const canonical = `${base}/blog/${slug}`;

    const response = await fetch(`https://www.adsaro.net/api/blog/${slug}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    // const response = await fetch(`/api/blog/${slug}`, {
    //   cache: "no-store",
    // });

    if (response.ok) {
      const result = await response.json();
      const blog = (result?.data ?? null) as BlogMeta | null;

      if (blog) {
        const title =
          blog.meta_title || blog.post_title || blog.title || "Blog Post - Adsaro";
        const description =
          blog.meta_description ||
          blog.post_excerpt ||
          blog.excerpt ||
          blog.post_title ||
          blog.title ||
          "";

        const keywordsRaw =
          blog.keywords || blog.meta_keywords || blog.post_keywords || "";
        const keywords = Array.isArray(keywordsRaw)
          ? keywordsRaw
          : String(keywordsRaw)
              .split(",")
              .map((k) => k.trim())
              .filter(Boolean);

        let ogImage = blog.blogimage || blog.featuredImage || blog.image || "";
        if (
          ogImage &&
          typeof ogImage === "string" &&
          !/^https?:\/\//i.test(ogImage)
        ) {
          ogImage = `${base}${ogImage.startsWith("/") ? "" : "/"}${ogImage}`;
        }

        return {
          title,
          description,
          keywords,
          alternates: {
            canonical,
          },
          openGraph: {
            title,
            description,
            images: ogImage ? [ogImage] : [],
          },
        };
      }
    }
  } catch (error) {
    console.error("Error generating metadata:", error);
  }

  // Fallback metadata
  return {
    title: "Blog Post - Adsaro",
    description: "Read our latest blog post on Adsaro.",
    alternates: {
      canonical: `${(process.env.NEXT_PUBLIC_BASE_URL || "https://www.adsaro.com").replace(/\/+$/, "")}/blog`,
    },
  };
}
