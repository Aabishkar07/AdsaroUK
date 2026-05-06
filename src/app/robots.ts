import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        disallow: [
          "/advertiser/",
          "/publisher/",
          "/landing-page/adult",
        ],
        allow: ["/"],
      },
    ],
  };
}
