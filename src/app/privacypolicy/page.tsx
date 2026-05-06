// pages/privacy-policy.tsx
import Footer from '@/components/footer';
import MainNavbar from '@/components/mainnavbar';
import React from 'react';

export default function PrivacyPolicy() {
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
        <h1 className="text-3xl font-bold mb-10 text-center text-black">Privacy & Cookie Policy</h1>

        <p className="mb-4">
          These are the privacy and cookie policy you need to know about if you are participating in Adsaro eco-system which is available at adsaro.net and adsaro.com website for our Customers who use our platform and cdn.admedia.network for End Users who sees and clicks on our ads. Adsaro is operated by Adsaro UK Limited, located in 128 City Road, London, United Kingdom, EC1V 2NX. We don’t want to impose heavy words on our privacy policy and want to make it as simple as possible and we always look for feedback on how we can make it more understandable and transparent. If there is anything you want us to add or improve, please email us at <a href="mailto:adsaro.admin@adsaro.com" className="text-blue-600 underline">adsaro.admin@adsaro.com</a>.
        </p>

        <h2 className="text-3xl font-semibold mt-10 mb-4 border-l-4 border-blue-500 pl-4 bg-blue-50 py-2 rounded">Introduction: Why and What data we collect?</h2>

        <h3 className="text-xl font-medium mt-6 mb-2 text-blue-600">Our users:</h3>
        <p className="mb-4">
          If you are a user of this website we ask some information like name, email and address phone no after or before the registration on our website just to contact you from our company or use it for unique user verification and is limited to company use only.
        </p>
        <p className="mb-4">
          We also collect billing information like billing name and address and other information to generate invoice and is passed to payment gateways who helps to collect and send funds and is not sent anywhere other than invoice and billing use.
        </p>

        <h3 className="text-xl font-medium mt-6 mb-2 text-blue-600">End users:</h3>
        <p className="mb-4">
          The data we will process has been obtained through your browsing information archive files, as informed via the cookies policies of the websites of each of our Publishers (websites which show our advertising banners or other ad formats). The data obtained is: URL of the website displaying our ads, referral URL, IP, Country, Browser, Operating system, Device information. We don’t collect personal names and identity of end user and we cannot recognize an end user. We show ads based on the sent value that match our campaign requirement only.
        </p>

        <h2 className="text-3xl font-semibold mt-10 mb-4 border-l-4 border-blue-500 pl-4 bg-blue-50 py-2 rounded">When and why we may transfer your data to third parties?</h2>

        <h3 className="text-xl font-medium mt-6 mb-2 text-blue-600">Our users:</h3>
        <p className="mb-4">
          We may transfer your personal data for compliance with legal obligations to which ADSARO is subject based on its activity.
        </p>

        <h3 className="text-xl font-medium mt-6 mb-2 text-blue-600">End users:</h3>
        <p className="mb-4">
          We are advertisement network and hence we provide your data to our advertisers so that they can analysis your data to show relevant ads and offers. No one can exactly identify that the data belongs to you. All the data collected by us and passed to advertisers and ad agency are random.
        </p>

        <h2 className="text-3xl font-semibold mt-10 mb-4 border-l-4 border-blue-500 pl-4 bg-blue-50 py-2 rounded">International data transfers</h2>

        <h3 className="text-xl font-medium mt-6 mb-2 text-blue-600">Our users:</h3>
        <p className="mb-4">
          We don’t transfer your data personal data to any international organization. Your personal data is stored in safe servers in NYC, USA. If there is transfer of your data to another data center you will be notified.
        </p>

        <h3 className="text-xl font-medium mt-6 mb-2 text-blue-600">End users:</h3>
        <p className="mb-4">
          ADSARO has hired technology service providers located in countries that do not have a data protection regulation equivalent to the European (“Third Countries”). These service providers have signed the confidentiality and data processing agreements required by the regulation, which apply the warranties and safeguards needed to preserve your privacy.
        </p>

        <h2 className="text-3xl font-semibold mt-10 mb-4 border-l-4 border-blue-500 pl-4 bg-blue-50 py-2 rounded">How long will we store your data?</h2>

        <h3 className="text-xl font-medium mt-6 mb-2 text-blue-600">Our users:</h3>
        <p className="mb-4">We store your personal data until you are working with ADSARO. If you terminate or delete your account we will delete all the personal data we have unless there is a legal reasons to keep it.</p>

        <h3 className="text-xl font-medium mt-6 mb-2 text-blue-600">End users:</h3>
        <p className="mb-4">We will collect your data unless our ad codes present over the websites that you visit are not removed or the website owner terminates contract with us.</p>

        <h2 className="text-3xl font-semibold mt-10 mb-4 border-l-4 border-blue-500 pl-4 bg-blue-50 py-2 rounded">What are your rights?</h2>
        <p className="mb-4">
          We inform you that you have a right to access your personal data, rectify inaccurate data, request its erasure when it is no longer necessary, oppose or limit the processing or request the portability of the data, through the postal and electronic addresses indicated. Please note that any requests to exercise any of the previous rights must comply with all the requirements established by law, and in particular:
        </p>
        <ul className="list-decimal list-inside mb-4 ml-4">
          <li>The request should be in writing and contain an address for notifications, the date and your signature as the data subject. It also has to explain the purpose of the request and provide any evidencing documents, if applicable.</li>
          <li>A photocopy of your passport or another official identification document must be provided. Furthermore, if you consider the processing of your personal data violates the regulation or your rights to privacy, you may file a complaint: To ADSARO, through the electronic and postal addresses indicated.</li>
        </ul>

        <h2 className="text-3xl font-semibold mt-10 mb-4 border-l-4 border-blue-500 pl-4 bg-blue-50 py-2 rounded">Links to other websites</h2>
        <p className="mb-4">
          Our Website includes links to other websites whose privacy practices may differ from ours. If you submit personal information to any of those sites, your information is governed by their privacy statements. We encourage you to carefully read the privacy statement of any website you visit.
        </p>

        <h2 className="text-3xl font-semibold mt-10 mb-4 border-l-4 border-blue-500 pl-4 bg-blue-50 py-2 rounded">Security</h2>
        <p className="mb-4">
          When we collect personal information directly from you, we follow generally accepted industry standards such as SSL, to protect the personal information submitted to us, both during transmission and once we receive it. No method of transmission over the Internet, or method of electronic storage, is 100% secure, however. Therefore we cannot guarantee its absolute security. If you have any questions about security you can contact us at adsaro.admin@adsaro.com.
        </p>

        <h2 className="text-3xl font-semibold mt-10 mb-4 border-l-4 border-blue-500 pl-4 bg-blue-50 py-2 rounded">What are cookies and how we use them?</h2>
        <p className="mb-4">
          A cookie is a small text file that is stored on a user’s computer for record-keeping purposes. We do not link the information we store in cookies to any personally identifiable information you submit while on our Website. By accessing the Site, you expressly accept the use of these types of cookies on your devices. There are two types of cookies: session cookies and persistent cookies. We also allow third parties to use cookies on our Website.
        </p>

        <h3 className="text-xl font-medium mt-6 mb-2 text-blue-600">Session Cookies:</h3>
        <p className="mb-4">Session cookies exist only during one online session. They are deleted from your computer when the browser is closed or the computer is turned off. We use session cookies to allow our systems to uniquely identify you during a session.</p>

        <h3 className="text-xl font-medium mt-6 mb-2 text-blue-600">Persistent Cookies:</h3>
        <p className="mb-4">Persistent cookies are saved on your computer after you have closed the browser or shut down your computer. We use persistent cookies to track statistical and aggregate information about your activity, which can be combined with other information.</p>

        <h3 className="text-xl font-medium mt-6 mb-2 text-blue-600">Third Party Cookies:</h3>
        <p className="mb-4">We also hire third parties to track and analyze personal and non-personal information. To do so, we allow third parties to send cookies to users of our Website, as permitted by law and without prejudice to your right to disable such cookies. We use the data collected by said third parties to help us manage and improve the quality of the Website and to analyze the use of the Website. The use of these cookies is not covered by our Privacy & Cookies Policy, we do not have access or control over these cookies.</p>

        <h2 className="text-3xl font-semibold mt-10 mb-4 border-l-4 border-blue-500 pl-4 bg-blue-50 py-2 rounded">List of all the third party services we use on our website with their links to privacy and cookies policy.</h2>
        <ul className="list-disc list-inside mb-4">
          <li>DigitalOcean</li>
          <li>Google</li>
          <li>Sinch</li>
          <li>Tessera Digital</li>
        </ul>

        <h2 className="text-3xl font-semibold mt-10 mb-4 border-l-4 border-blue-500 pl-4 bg-blue-50 py-2 rounded">Can I refuse or opt out of cookies?</h2>
        <p className="mb-4">
          You can delete cookies at any time using the special settings of your web browser. Given the large number of browsers and versions available on the market, we cannot provide technical assistance on the process of blocking or removing cookies from each of them. For such purposes, you should consult the manuals and support services provided by the manufacturer of the browser.
        </p>
      </div>
      </div>
      <Footer/>
    </>
  );
}
