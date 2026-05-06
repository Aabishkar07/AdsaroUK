// pages/terms-and-conditions.tsx
import Footer from "@/components/footer";
import MainNavbar from "@/components/mainnavbar";
import React from "react";

export default function TermsAndConditions() {
  return (
    <>
      <MainNavbar />

         <div className="relative overflow-hidden">

        <div
    className="absolute inset-0 -z-10"
    style={{
      backgroundImage: "url('/bg.webp')",
      backgroundAttachment: "fixed", // parallax effect
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      backgroundSize: "cover",
      opacity: 0.02, // <--- set image opacity here
    }}
  />
      <div className="min-h-screen mx-auto max-w-7xl bg-white my-20 shadow-xl rounded-2xl text-gray-800 px-6 py-10 md:px-10 lg:px-20">
        <h1 className="text-3xl font-bold mb-10 text-center text-black">
          Terms & Conditions
        </h1>

        <h2 className="text-3xl font-semibold mt-10 mb-4 border-l-4 border-blue-500 pl-4 bg-blue-50 py-2 rounded">
          Introduction
        </h2>
        <p className="mb-4">
          These are the terms and conditions you need to follow and agree if you
          press the submit button on our website and wish to participate in
          Adsaro eco-system which is available at adsaro.net and adsaro.com
          website. Adsaro is operated by Adsaro UK Limited, located in 128 City
          Road, London, United Kingdom, EC1V 2NX. We don’t want to impose heavy
          words on our terms and conditions and want to make it as simple as
          possible and we always look for feedback on how we can make it more
          understandable and transparent. If there is anything you want us to
          add or improve please email us at{" "}
          <a
            href="mailto:admin@adsaro.com"
            className="text-blue-600 underline"
          >
            admin@adsaro.com
          </a>
          .
        </p>

        <h2 className="text-3xl font-semibold mt-10 mb-4 border-l-4 border-blue-500 pl-4 bg-blue-50 py-2 rounded">
          Advertisers
        </h2>
        <ol className="list-decimal list-inside">
          <li className="mb-4">
            The minimum deposit an Advertiser has to pay for getting started is
            $100 or according to the wallet which has their own min deposit
            requirement. There is a limitation on how much you can fund in
            Adsaro. We might ask some information if we suspect your account for
            frauds or illegal money activity. We have the right to terminate any
            funds received by us and we might return the fund to you only after
            you verify your identity. Some funds might also be terminated from
            payment processors such as PayPal, Stripe, and other Payment
            gateways and Banks on our behalf to prevent illegal activities on
            our system.
          </li>
          <li className="mb-4">
            By submitting your Advertising Material, Creatives, and Landing Page
            URL, you grant Adsaro a non-exclusive, worldwide irrevocable,
            sublicensable license to adapt, publish your creatives through Ad
            Codes or Ad Tags present in Publisher’s Website in the form of Ads.
          </li>
          <li className="mb-4">
            Any Advertising Material, Creatives, and Landing Page URL that are
            illegal in any countries that have been reported to us will be
            banned from displaying ads in that country only.
          </li>
          <li className="mb-4">
            Advertising Material, Creatives, and Landing Page URL displaying
            pornography, adult content, child pornography, bestiality, or
            containing links to such content are banned and not allowed.
          </li>
          <li className="mb-4">
            Libelous or defamatory Advertising Material, Creatives, and Landing
            Page URL are banned and not allowed.
          </li>
          <li className="mb-4">
            Advertising Material, Creatives, and Landing Page URL containing
            software piracy are banned and not allowed.
          </li>
          <li className="mb-4">
            Advertising Material, Creatives, and Landing Page URL containing,
            instructing, or describing any form of illegal activity including
            but not limited to bomb building, hacking, or phreaking are banned
            and not allowed.
          </li>
          <li className="mb-4">
            Advertising Material, Creatives, and Landing Page URL with
            gratuitous displays of violence; obscene or vulgar language; abusive
            content and/or content which endorses or threatens physical harm is
            banned and not allowed.
          </li>
          <li className="mb-4">
            Advertising Material, Creatives, and Landing Page URL promoting any
            type of hate-mongering based on race, politics, ethnicity, religion,
            gender, or sexuality are banned and not allowed.
          </li>
          <li className="mb-4">
            Advertising Material, Creatives, and Landing Page URL that
            participate in or transmit inappropriate newsgroup postings or
            unsolicited email are banned and not allowed.
          </li>
          <li className="mb-4">
            Advertising Material, Creatives, and Landing Page URL promoting any
            type of illegal substance, paraphernalia, and/or activity is banned
            and not allowed.
          </li>
          <li className="mb-4">
            Advertising Material, Creatives, and Landing Page URL with illegal,
            false, or deceptive investment advice and/or money-making
            opportunities are banned and not allowed.
          </li>
          <li className="mb-4">
            Advertising Material, Creatives, and Landing Page URL with any type
            of content that the general public has deemed to be improper or
            inappropriate is banned and not allowed.
          </li>
          <li className="mb-4">
            Advertising Material, Creatives, and Landing Page URL spreading
            viruses or exploiting web browser vulnerabilities is banned and not
            allowed.
          </li>
          <li className="mb-4">
            Advertising Material, Creatives, and Landing Page URL using the name
            of other big brands without authorization is banned and not allowed.
          </li>
          <li className="mb-4">
            Refunds will be issued to Advertisers for all unused funds within 30
            business days. Please contact us directly instead of using your
            wallets for refunds, as the process may take longer than usual and
            the wallets might not provide you refunds without consulting with
            us.
          </li>
          <li className="mb-4">
            Adsaro Currency works on CPM (Cost Per Mile) and CPC (Cost Per
            Click) pricing models and the min and max CPM and CPC rates might
            change over time according to the needs of Adsaro.
          </li>
          <li className="mb-4">
            You will not receive a refund for the used funds because the funds
            have already been paid to publishers who sent us the traffic.
            Service charges will be applied for the refunded funds as well.
          </li>
          <li className="mb-4">
            We will not be liable for funds sent to the wrong wallet address.
            Please only send funds to wallets or payment methods that are
            generated by the invoice of our system.
          </li>
        </ol>

        <h2 className="text-3xl font-semibold mt-10 mb-4 border-l-4 border-blue-500 pl-4 bg-blue-50 py-2 rounded">
          Publishers
        </h2>
        <ol className="list-decimal list-inside">
          <li className="mb-4">
            By accepting these Terms, you grant Adsaro a non-exclusive,
            worldwide irrevocable, sublicensable license to adapt, publish ads
            through your Publisher Website.
          </li>
          <li className="mb-4">
            Payment will be sent within 24 hours or a maximum of 30 business
            days after the invoice has been generated. Publishers, when they
            have accumulated the minimum payment amount of $50 or the amount
            according to the payout wallet or bank, can withdraw funds from
            their account. All the fees charged by banks and other payment
            wallets will be under the publisher&#39;s revenue.
          </li>

          <li className="mb-4">
            Any Publisher Websites illegal in any countries that have been
            reported to us will be banned and not allowed.{" "}
          </li>
          <li className="mb-4">
            Publisher Websites displaying pornography, adult content, child
            pornography, bestiality, or containing links to such content are
            banned and not allowed.{" "}
          </li>
          <li className="mb-4">
            Libelous or defamatory Publisher Websites are banned and not
            allowed.{" "}
          </li>
          <li className="mb-4">
            Publisher Websites containing software piracy are banned and not
            allowed.{" "}
          </li>
          <li className="mb-4">
            Publisher Websites containing, instructing, or describing any form
            of illegal activity including but not limited to bomb building,
            hacking, or phreaking are banned and not allowed.{" "}
          </li>
          <li className="mb-4">
            Publisher Websites with gratuitous displays of violence; obscene or
            vulgar language; abusive content and/or content which endorses or
            threatens physical harm are banned and not allowed.
          </li>
          <li className="mb-4">
            Publisher Websites promoting any type of hate-mongering based on
            race, politics, ethnicity, religion, gender, or sexuality are banned
            and not allowed.
          </li>
          <li className="mb-4">
            Publisher Websites that participate in or transmit inappropriate
            newsgroup postings or unsolicited email are banned and not allowed.
          </li>
          <li className="mb-4">
            Publisher Websites promoting any type of illegal substance,
            paraphernalia, and/or activity are banned and not allowed.
          </li>
          <li className="mb-4">
            Publisher Websites with illegal, false, or deceptive investment
            advice and/or money-making opportunities are banned and not allowed.
          </li>
          <li className="mb-4">
            Publisher Websites with any type of content that the general public
            has deemed to be improper or inappropriate are banned and not
            allowed.
          </li>
          <li className="mb-4">
            Publisher Websites spreading viruses or exploiting web browser
            vulnerabilities are banned and not allowed.
          </li>
          <li className="mb-4">
            Publisher Websites using the name of other big brands without
            authorization are banned and not allowed.
          </li>
          <li className="mb-4">
            Publisher Websites using bot traffic and frames to send fraud
            traffic are banned and not allowed.
          </li>
          <li className="mb-4">
            Manipulation and editing of ad codes provided by Adsaro without
            authorization are banned and not allowed.
          </li>
          <li className="mb-4">
            We will not be liable for any funds sent to the wrong address you
            added for withdrawal. You have 24 hours to cancel the invoice
            request. After that, the payment will be made to the address you
            added while withdrawing funds.
          </li>
        </ol>

        <h2 className="text-3xl font-semibold mt-10 mb-4 border-l-4 border-blue-500 pl-4 bg-blue-50 py-2 rounded">
          No Warranties
        </h2>

        <p className="mb-4">
          This Website is provided “as is,” with all faults, and Adsaro express
          no representations or warranties, of any kind related to this Website
          or the materials contained on this Website. Also, nothing contained on
          this Website shall be interpreted as advising you.
        </p>

        <h2 className="text-3xl font-semibold mt-10 mb-4 border-l-4 border-blue-500 pl-4 bg-blue-50 py-2 rounded">
          Limitation of Liability
        </h2>
        <p className="mb-4">
          In no event shall Adsaro, nor any of its officers, directors, or
          employees, be held liable for anything arising out of or in any way
          connected with your use of this Website, whether such liability is
          under contract. Adsaro, including its officers, directors, and
          employees, shall not be held liable for any indirect, consequential,
          or special liability arising out of or in any way related to your use
          of this Website.
        </p>

        <h2 className="text-3xl font-semibold mt-10 mb-4 border-l-4 border-blue-500 pl-4 bg-blue-50 py-2 rounded">
          Severability
        </h2>
        <p className="mb-4">
          If any provision of these Terms is found to be invalid under any
          applicable law, such provisions shall be deleted without affecting the
          remaining provisions herein.
        </p>

        <h2 className="text-3xl font-semibold mt-10 mb-4 border-l-4 border-blue-500 pl-4 bg-blue-50 py-2 rounded">
          Variation of Terms
        </h2>
        <p className="mb-4">
          Adsaro is permitted to revise these Terms at any time as it sees fit,
          and by using this Website, you are expected to review these Terms on a
          regular basis.
        </p>

        <h2 className="text-3xl font-semibold mt-10 mb-4 border-l-4 border-blue-500 pl-4 bg-blue-50 py-2 rounded">
          Assignment
        </h2>
        <p className="mb-4">
          Adsaro is allowed to assign, transfer, and subcontract its rights
          and/or obligations under these Terms without any notification.
          However, you are not allowed to assign, transfer, or subcontract any
          of your rights and/or obligations under these Terms.
        </p>

        <h2 className="text-3xl font-semibold mt-10 mb-4 border-l-4 border-blue-500 pl-4 bg-blue-50 py-2 rounded">
          Government and Law
        </h2>
        <h3 className="text-xl font-semibold">Governing Law & Jurisdiction</h3>
        <p className="mb-4">
          These Terms will be governed by and interpreted in accordance with the
          laws of the United Kingdom, and you submit to the non-exclusive
          jurisdiction of the country, states, or district courts located in the
          United Kingdom for the resolution of any disputes.
        </p>
      </div>

      </div>
      <Footer/>
    </>
  );
}
