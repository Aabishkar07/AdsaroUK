import React from "react";
import { useAuth } from "@/context/context";

type CardProps = {
  title: string;
  value: string;
  tooltip?: boolean;
  superscript?: string;
};

// type SummaryItem = { title: string; value: string };
// type MetricItem = {
//   label: string;
//   value: string;
//   tooltip?: boolean;
//   superscript?: string;
// };

// type SectionProps = {
//   title: string;

//   metrics: MetricItem[];
// };

function Card({ title, value, tooltip, superscript }: CardProps) {
  return (
    <div className="bg-white border rounded-xl shadow-sm p-4">
      <p className="text-sm text-gray-500">
        {title}
        {tooltip && <sup className="ml-1 text-xs text-gray-400">?</sup>}
        {superscript && (
          <sup className="ml-1 text-xs text-gray-400">{superscript}</sup>
        )}
      </p>
      <p className="text-xl font-semibold text-gray-800 mt-1">${value}</p>
    </div>
  );
}

// function Section({ title, metrics }: SectionProps) {
//   return (
//     <div className="border rounded-2xl shadow-sm  bg-white">
//       <div className="bg-blue-50 border-b px-4 py-3 rounded-t-2xl">
//         <h2 className="text-lg font-semibold text-blue-800">{title}</h2>
//       </div>

//       <div className="p-4 pt-2.5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
//         {metrics.map((item, idx) => (
//           <Card
//             key={idx}
//             title={item.label}
//             value={item.value}
//             tooltip={item.tooltip}
//             superscript={item.superscript}
//           />
//         ))}
//       </div>
//     </div>
//   );
// }

export function AdvertiserSectionCards() {
  const auth = useAuth();
  const [referid, setReferid] = React.useState<number | string | null>(null);

  const displaySummary = [
    { title: "Spent", value: auth?.advertiserData?.total_spend ?? "..." },
    { title: "Left", value: auth?.advertiserData?.remain_balance ?? "..." },
  ];

  // const xmlMetrics = [
  //   { label: "Ad Responses", value: "219" },
  //   { label: "Impressions", value: "182", tooltip: true },
  //   { label: "Win Rate", value: "83.11%", tooltip: true },
  //   { label: "eCPM", value: "0.0664", tooltip: true },
  //   { label: "CPC", value: "0.0009", superscript: "2" },
  //   { label: "Goals Conversions", value: "0" },
  //   { label: "Conversion Earnings", value: "0.00" },
  //   { label: "CR", value: "0.00%", tooltip: true },
  // ];
  
  // const displayMetrics = [
  //   { label: "Ad Responses", value: "102" },
  //   { label: "Impressions", value: "96", tooltip: true },
  //   { label: "Win Rate", value: "75.21%", tooltip: true },
  //   { label: "eCPM", value: "0.0563", tooltip: true },
  //   { label: "CPC", value: "0.0011", superscript: "2" },
  //   { label: "Goals Conversions", value: "3" },
  //   { label: "Conversion Earnings", value: "1.50" },
  //   { label: "CR", value: "2.50%", tooltip: true },
  // ];

  React.useEffect(() => {
    const publisher_balance = auth?.advertiserData?.balance ?? null;
    setReferid(publisher_balance);
  }, [auth]);

  const formattedReferid =
    typeof referid === "number" ? referid.toFixed(3) : "...";

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col items-center text-center space-y-4 mb-6">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500">
          Welcome to Adsaro Advertiser
        </h1>
        <p className="text-gray-600 max-w-lg text-sm">
          Your dashboard provides real-time insights into your performance
          metrics and guides you through the steps to maximize your earnings as
          a publisher.
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-blue-300 rounded-full mt-2"></div>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Step 1 */}
        <div className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition-all duration-300 border border-blue-100 group">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-blue-700 mb-2">
              1. Create an Ad Slot
            </h2>
            <p className="text-sm text-gray-600 text-center">
              Generate your custom ad code snippet directly from your dashboard
              in seconds.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition-all duration-300 border border-blue-100 group">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-blue-700 mb-2">
              2. Place the Code
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Copy and paste it into your website&apos;s HTML.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition-all duration-300 border border-blue-100 group">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-blue-700 mb-2">
              3. Start Earning
            </h2>
            <p className="text-sm text-gray-600 text-center">
              Watch your impressions and revenue grow in real-time on your
              analytics dashboard.
            </p>
          </div>
        </div>
      </div>

      {/* XML + Display Cards */}
      <div className="">
        <div className="my-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {displaySummary.map((item, idx) => (
            <Card key={idx} title={item.title} value={typeof item.value === 'number' ? item.value.toFixed(3) : String(item.value)} />
          ))}
        </div>

        {/* <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 ">
          <Section title="XML" metrics={xmlMetrics} />
          <Section title="Display" metrics={displayMetrics} />
        </div> */}
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition-all duration-300 border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50 rounded-full -mr-6 -mt-6 z-0"></div>
          <div className="relative z-10">
            <p className="text-sm font-medium text-gray-500 mb-1">
              Available Balance
            </p>
            <h3 className="text-3xl font-bold text-gray-800 flex items-baseline">
              ${formattedReferid}
            </h3>
          </div>
        </div>
      </div>

      {/* Tips and Tutorial */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl shadow-md p-5 border border-blue-100">
          <h3 className="text-blue-800 font-semibold mb-3 text-lg">Tips</h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2 text-sm">
            <li>Use creatives for better CTR</li>
            <li>Add compelling CTAs</li>
            <li>Use targeting filters</li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-5 border border-blue-100">
          <h3 className="text-blue-800 font-semibold mb-3 text-lg">
            Tutorial Guide
          </h3>
          <p className="text-sm text-gray-600">
            Learn how to optimize campaigns via this
            <a
              href="#"
              className="text-blue-600 underline ml-1 hover:text-blue-800"
              target="_blank"
              rel="noopener noreferrer"
            >
              YouTube video
            </a>
            .
          </p>
        </div>
      </div> */}

      {/* Campaigns + Zones */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl shadow-md p-5 border border-blue-100 h-64">
          <h3 className="text-blue-800 font-semibold mb-3 text-lg">
            Top 5 Campaigns
          </h3>
          <p className="text-gray-400 text-sm">Campaign data placeholder...</p>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-5 border border-blue-100 h-64">
          <h3 className="text-blue-800 font-semibold mb-3 text-lg">
            Top 5 Zones
          </h3>
          <p className="text-gray-400 text-sm">Zone data placeholder...</p>
        </div>
      </div> */}

      {/* Geo Map */}
      {/* <div className="bg-white rounded-2xl shadow-md p-5 border border-blue-100 h-80">
        <h3 className="text-blue-800 font-semibold mb-3 text-lg">
          Geo Map Overview
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Clicks / Impressions by country (colored heatmap)
        </p>
        <div className="h-48 bg-gradient-to-r from-blue-100 via-white to-blue-100 rounded-xl flex items-center justify-center text-blue-400">
          Map Placeholder
        </div>
      </div> */}
    </div>
  );
}
