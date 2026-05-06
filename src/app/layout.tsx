import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { AuthProvider } from "@/context/context";
import { generateDynamicMetadata } from "@/lib/generateDynamicMetadata";

export const dynamic = "force-dynamic";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// export const metadata: Metadata = {
//   title: "Adsaro",
//   description: " Adsaro AdNetwork",
//   icons: {
//     icon: "/newfavicon.png",
//   },
//   verification: {
//     google: "Eyz3hzGTVBa1Uz9xoiblb8TCigGCyHxo6lsknaxoleA",
//   },
// };
const GOOGLE_VERIFICATION = "Eyz3hzGTVBa1Uz9xoiblb8TCigGCyHxo6lsknaxoleA";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.adsaro.com/";
export async function generateMetadata(): Promise<Metadata> {
  const metadata = await generateDynamicMetadata('home', GOOGLE_VERIFICATION);

  return {
    ...metadata,
    metadataBase: new URL(SITE_URL),
  };
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script id="gtm" strategy="beforeInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-TZ849XQG');
          `}
        </Script>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-TZ849XQG"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* Google Analytics */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-5L672D32YG"
        />
        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-5L672D32YG');
          `}
        </Script>
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=AW-11257325666"
        ></script>
        <script>
          {`
   window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'AW-11257325666');

  `}
        </script>
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=AW-18126887845"
        />
        <Script id="google-ads-conversion">
          {`
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'AW-18126887845');
  `}
        </Script>

            <script type="text/javascript">
            {`
    aclib.runAutoTag({
        zoneId: 'ksyelqppqc',
    });
`}
</script>
        <Script id="tawk-to" strategy="afterInteractive">
          {`
            var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
            (function(){
            var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
            s1.async=true;
            s1.src='https://embed.tawk.to/6959f93756031d197dfe1ff7/1je3nb0v4';
            s1.charset='UTF-8';
            s1.setAttribute('crossorigin','*');
            s0.parentNode.insertBefore(s1,s0);
            })();
          `}
        </Script>

        
        <AuthProvider>{children}</AuthProvider>{" "}
      </body>
    </html>
  );
}
