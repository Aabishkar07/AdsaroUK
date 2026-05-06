import React from "react";
import Image from "next/image";
import Analytics from "./../../public/icons/Analytics.png";
import Objective from "./../../public/icons/Objective.png";
import Strategy from "./../../public/icons/Strategy.png";
import Technology from "./../../public/icons/Technology.png";

export function Ourgoal() {
  return (
    <div className="goals  pt-16 px-4 max-w-screen-2xl mx-auto">
      <div className="text-center">
        <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Our <span className="italic">Goals</span>
        </div>

        <div className="text-base  mb-8 max-w-7xl mx-auto">
          We at Adsaro always focus on meeting the needs of our customers on the
          following ways.{" "}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-x-10 max-[1155px]:grid-cols-2 max-[600px]:grid-cols-1">
        {/* Objective */}
        <div
          className="content border rounded-xl border-slate-300 p-5 flex my-4 flex-col items-start
                transition-shadow duration-300 hover:shadow-[0_4px_15px_0_rgba(106,107,207,0.5)] cursor-pointer"
        >
          <div className="icon w-16 h-16 rounded-full bg-primary flex justify-center items-start overflow-hidden p-1 mb-4">
            <Image
              src={Objective}
              width={50}
              height={50}
              alt="Objective"
              className="object-contain w-full h-full"
            />
          </div>
          <div className="content_para flex flex-col items-start">
            <span className="text-2xl pb-3 uppercase text-primary font-semibold">
              Objective
            </span>
            <p>
              We help to fulfill the objective of our customers on what they
              want to accomplish and how we can serve them better
            </p>
          </div>
        </div>

        {/* Analytics */}
        <div
          className="content border rounded-xl  border-slate-300 p-5 flex my-4 flex-col items-start
                transition-shadow duration-300 hover:shadow-[0_4px_15px_0_rgba(106,107,207,0.5)] cursor-pointer"
        >
          <div className="icon w-16 h-16 rounded-full bg-primary flex justify-center items-start overflow-hidden  p-1 mb-4">
            <Image
              src={Analytics}
              width={50}
              height={50}
              alt="Analytics"
              className="object-contain w-full h-full"
            />
          </div>
          <div className="content_para flex flex-col items-start">
            <span className="text-2xl pb-3 uppercase text-primary font-semibold">
              Analytics
            </span>
            <p>
              Our reporting system will help you track every stuff from
              impressions to clicks to conversions so that we can plan to meet
              goals
            </p>
          </div>
        </div>

        {/* Technology */}
        <div
          className="content border rounded-xl  border-slate-300 p-5 flex my-4 flex-col items-start
                transition-shadow duration-300 hover:shadow-[0_4px_15px_0_rgba(106,107,207,0.5)] cursor-pointer"
        >
          <div className="icon w-16 h-16 rounded-full bg-primary flex justify-center items-start overflow-hidden p-1 mb-4">
            <Image
              src={Technology}
              width={50}
              height={50}
              alt="Technology"
              className="object-contain w-full h-full"
            />
          </div>
          <div className="content_para flex flex-col items-start">
            <span className="text-2xl pb-3 uppercase text-primary font-semibold">
              Technology
            </span>
            <p>
              We are always up-to-date with technology and bring more tools and
              products for our customers
            </p>
          </div>
        </div>

        {/* Strategy */}
        <div
          className="content border rounded-xl  border-slate-300 p-5 flex my-4 flex-col items-start
                transition-shadow duration-300 hover:shadow-[0_4px_15px_0_rgba(106,107,207,0.5)] cursor-pointer"
        >
          <div className="icon w-16 h-16 rounded-full bg-primary flex justify-center items-start overflow-hidden p-1 mb-4">
            <Image
              src={Strategy}
              width={50}
              height={50}
              alt="Strategy"
              className="object-contain w-full h-full"
            />
          </div>
          <div className="content_para flex flex-col items-start">
            <span className="text-2xl pb-3 uppercase text-primary font-semibold">
              Strategy
            </span>
            <p>
              We plan strategy along with our customers on how to increase more
              sales, get more traffic, earn more revenue and we implement it.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
