import React from "react";

export function Services() {
  return (
    <div className="bg-[#6a6bcf] py-16 px-4 md:px-8 lg:px-16">
  <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between">
    
    {/* Left Section: Value Proposition & Description */}
    <div className="lg:w-10/12 mb-10 lg:mb-0 text-center lg:text-left">
      <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight italic">
        Your Trusted Advertising Partner for Profitable Growth
      </h2>
      {/* <p className="mt-6 text-lg text-gray-700 max-w-md lg:max-w-none mx-auto lg:mx-0">
        With over a decade of expertise, we craft impactful advertising strategies that elevate brands, drive engagement, and inspire growth.
      </p> */}
    </div>
    
    {/* Right Section: Statistics */}
    <div className="lg:w-6/12 flex justify-center lg:justify-end space-x-8 md:space-x-16">
      
      {/* Stat 1: 35K Advertiser */}
      <div className="text-center">
        <div className="text-4xl md:text-6xl font-bold text-white">
          35K
        </div>
        <div className="mt-1 text-base md:text-lg font-medium text-white">
          Advertiser
        </div>
      </div>
      
      {/* Stat 2: 25K Publisher */}
      <div className="text-center">
        <div className="text-4xl md:text-6xl font-bold text-white">
          25K
        </div>
        <div className="mt-1 text-base md:text-lg font-medium text-white">
          Publisher
        </div>
      </div>
      
      {/* Stat 3: 20+ Ad Format */}
      <div className="text-center">
        <div className="text-4xl md:text-6xl font-bold text-white">
          20+
        </div>
        <div className="mt-1 text-base md:text-lg font-medium text-white">
          Ad Format
        </div>
      </div>
      
    </div>
    
  </div>
</div>
  );
}
