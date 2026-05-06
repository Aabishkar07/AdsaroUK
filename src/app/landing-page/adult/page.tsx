import Script from "next/script";

export default function AdultLandingPage() {
  return (
    <div>
      <Script id="popcash" type="text/javascript" strategy="afterInteractive">
        {`
          var uid = '192553';
          var wid = '438385';
          var pop_fback = 'up';
          var pop_tag = document.createElement('script');
          pop_tag.src='//cdn.popcash.net/show.js';
          document.body.appendChild(pop_tag);
          pop_tag.onerror = function() {
            pop_tag = document.createElement('script');
            pop_tag.src='//cdn2.popcash.net/show.js';
            document.body.appendChild(pop_tag)
          };
        `}
      </Script>
    </div>
  );
}
