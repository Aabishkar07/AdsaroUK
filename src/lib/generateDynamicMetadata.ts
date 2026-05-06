import axios from "axios";
import type { Metadata } from "next";

interface MetadataResponse {
  meta_title: string;
  meta_description: string;
  keywords: string;
  icon?: string;
}

async function fetchMetadata(route: string): Promise<MetadataResponse> {
  try {
    console.log(`Fetching metadata for ${route}`);
    const response = await axios.get(`https://adsaro.net/api/meta/${route}`);
    // console.log("uuu", response.data.data);
    return await response?.data?.data ;
  } catch (error) {
    console.error("Error fetching metadata:", error);
    return {
      meta_title: "Adsaro UK",
      meta_description: "Adsaro UK",
      keywords: "adsaro, UK, advertising",
      icon: "/newfavicon.png",
    };
  }
}

// Main function to generate metadata - import and use this everywhere
// export async function generateDynamicMetadata(
//   route: string,
//   googleVerification?: string
// ): Promise<Metadata> {
//   const metaData = await fetchMetadata(route);

//   const metadata: Metadata = {
//     title: metaData.meta_title,
//     description: metaData.meta_description,
//     keywords: metaData.keywords,
//     icons: {
//       icon: metaData.icon || "/newfavicon.png",
//     },
//   };

//   if (googleVerification) {
//     metadata.verification = {
//       google: googleVerification,
//     };
//   }

//   return metadata;
// }

export async function generateDynamicMetadata(
  route: string,
  googleVerification?: string
): Promise<Metadata> {
  const metaData = await fetchMetadata(route);

  return {
    title: metaData.meta_title,
    description: metaData.meta_description,
    keywords: metaData.keywords,
    icons: {
      icon: metaData.icon || "/newfavicon.png",
    },
    ...(googleVerification && {
      verification: {
        google: googleVerification,
      },
    }),
  };
}
