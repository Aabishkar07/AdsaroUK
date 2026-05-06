"use client";

import React from "react";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Target,
  Eye,
  Zap,
} from "lucide-react";

export default function UserAcquisitionUI({
  descriptionHtml,
}: {
  descriptionHtml?: string;
}) {
  return (
    <div className="max-sm:pb-0 pb-5 bg-gradient-to-b from-white to-[#6a6bcf] overflow-hidden ">
      <div className="relative max-w-screen-2xl mx-auto px-6 py-32">

        {/* ================= HERO ================= */}
        <div className="py-16 max-sm:py-0 flex items-center justify-center px-6">
          <div className="text-center max-w-5xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-[1.1] tracking-tight">
              Stop Running Ad.
              <br />
              <span className="text-[#393a85] italic">
                 Start Growing
              </span>
            </h1>

            <div
              className="text-black mt-8 leading-relaxed max-w-3xl mx-auto"
              dangerouslySetInnerHTML={{ __html: descriptionHtml ?? "" }}
            />


            <a href="/advertiser/signup">
              <button className="mt-14 bg-[#6a6bcf] hover:bg-white mx-5 hover:text-[#6a6bcf]
                border border-[#6a6bcf] text-white px-4 py-1 rounded-md
                text-lg font-semibold shadow-lg hover:shadow-2xl
                transition-all duration-300 hover:-translate-y-1">
                Get Started
              </button>
            </a>
            <a href="/publisher/signup">
              <button className="mt-14 bg-[#ffffff] hover:bg-white hover:text-[#6a6bcf]
                border border-[#ffffff] text-[#6a6bcf] px-4 py-1 rounded-md
                text-lg font-semibold shadow-lg hover:shadow-md
                transition-all duration-300 hover:-translate-y-1">
                Partner With Us
              </button>
            </a>

          </div>
        </div>

        {/* ================= LEFT: BIDDING ================= */}
        <FloatingCard className="left-0 top-32 w-60">
          <h3 className="font-semibold text-gray-900 mb-4 text-sm">
            Bidding
          </h3>

          <div className="grid grid-cols-3 gap-3">
            <Bid icon={<Target size={16} />} label="CPC" color="blue" />
            <Bid icon={<Eye size={16} />} label="CPM" color="yellow" />
            <Bid icon={<Zap size={16} />} label="Smart" color="indigo" />
          </div>
        </FloatingCard>


   
        <div className="hidden lg:grid absolute lg:left-48  top-[328px] w-64 grid-cols-3 gap-3">

           <Metric
            icon={<BarChart3 className="text-blue-600" size={16} />}
            label="Conversions"
            value="15 425"
          />
          </div>
  
        

        {/* ================= RIGHT: CHART ================= */}
        <FloatingCard className="right-0 top-32 w-64">
          <p className="text-xs text-gray-500 mb-1">
            Billion impressions per month
          </p>

          <div className="text-2xl font-bold text-blue-600 mb-3">
            20.5 bln
          </div>

          <svg viewBox="0 0 300 120" className="w-full">
            <path
              d="M10 90 C 80 30, 160 70, 290 20"
              fill="none"
              stroke="#3B82F6"
              strokeWidth="3"
            />
            <circle cx="160" cy="70" r="5" fill="#FACC15" />
          </svg>

          <div className="flex justify-between text-[11px] text-gray-400 mt-3">
            <span>May</span>
            <span>June</span>
            <span>July</span>
            <span>Aug</span>
          </div>
        </FloatingCard>

        {/* ================= METRICS ================= */}
        <div className="hidden lg:grid absolute right-24 top-[420px] w-64 grid-cols-3 gap-3">
         
          <Metric
            icon={<TrendingUp className="text-emerald-600" size={16} />}
            label="ROI"
            value="146%"
          />
          <Metric
            icon={<DollarSign className="text-yellow-500" size={16} />}
            label="Profit"
            value="$35 913"
          />
        </div>

        {/* ================= MANAGER CARD ================= */}
        <FloatingCard className="left-16 top-[480px] w-64">
          <div className="flex items-center gap-3 mb-4">
            <img
              src="https://i.pravatar.cc/80"
              alt="manager"
              className="w-12 h-12 rounded-full border-2 border-blue-500"
            />
            <div>
              <div className="text-xl font-bold text-blue-600">
                $7,572
              </div>
              <div className="flex gap-1 mt-1">
                {[1, 2, 3].map((i) => (
                  <span key={i} className="w-2 h-4 bg-emerald-400 rounded" />
                ))}
                <span className="w-2 h-4 bg-gray-200 rounded" />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-[11px] text-gray-500 mb-1">
              Your personal manager
            </p>
            <p className="text-sm font-semibold text-gray-900">
              Konstantinos Kafkalias
            </p>

            <div className="text-xs text-gray-600 mt-3 space-y-1">
              <p>💬 konsta.skype</p>
              <p>✉️ konstantinos@adsaro.com</p>
            </div>
          </div>
        </FloatingCard>

        {/* ================= BADGES ================= */}
        <div className="hidden lg:flex absolute right-0 top-[620px] gap-3">
          <Badge title="Top User Acquisition" subtitle="Companies 2023" />
          <Badge title="Leader" subtitle="Winter 2024" highlight />
          <Badge title="Top Mobile Ad Networks" subtitle="2023" />
        </div>
      </div>
    </div>
  );
}

/* ================= REUSABLE CARD ================= */
function FloatingCard({ children, className }: any) {
  return (
    <div
      className={`hidden lg:block absolute bg-white rounded-xl p-4
      shadow-sm hover:shadow-md transition-all duration-300
      hover:-translate-y-1 scale-90 ${className}`}
    >
      {children}
    </div>
  );
}

/* ================= SUB COMPONENTS ================= */

function Bid({ icon, label, color }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600",
    yellow: "bg-yellow-50 text-yellow-600",
    indigo: "bg-indigo-50 text-indigo-600",
  };

  return (
    <div
      className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs font-medium
      transition-all duration-300 hover:-translate-y-1 hover:shadow-sm ${colors[color]}`}
    >
      <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center shadow-sm">
        {icon}
      </div>
      {label}
    </div>
  );
}

function Metric({ icon, label, value }: any) {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md
      transition-all duration-300 hover:-translate-y-1
      p-3 text-center scale-95">
      <div className="w-8 h-8 mx-auto mb-2 bg-gray-100 rounded-lg flex items-center justify-center">
        {icon}
      </div>
      <p className="text-[11px] text-gray-500">{label}</p>
      <p className="text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function Badge({ title, subtitle, highlight }: any) {
  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md
      transition-all duration-300 hover:-translate-y-1 px-4 py-3 text-center">
      <p
        className={`text-xs font-semibold ${
          highlight ? "text-red-600" : "text-gray-900"
        }`}
      >
        {title}
      </p>
      <p className="text-[11px] text-gray-500">{subtitle}</p>
    </div>
  );
}
