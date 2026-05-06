"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import MainNavbar from "@/components/mainnavbar";
import Footer from "@/components/footer";
import CTASection from "../homepage/cta";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
interface Data {
  description: string | null;
}
  const [errors, setErrors] = useState<Record<string, string>>({});
const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+$/i.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }
    if (!formData.subject) newErrors.subject = "Subject is required";
    if (!formData.message) newErrors.message = "Message is required";
    return newErrors;
  };


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://adsaro.net/api/contactinfo");
        const result = await response.json();
        if (result.data && result.data.length > 0) {
          setData(result.data[0]);
        }
      } catch (error) {
        console.error("Error fetching monetization data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log(data , 'asdasd'); 

      if (!response.ok) {
        // Handle validation errors from Laravel
        if (data.errors) {
          setErrors(data.errors);
        } else {
          toast.error(data.message || "Something went wrong!");
        }
        return;
      }

      // Success
      toast.success(data.message || "Message sent successfully!");
      setFormData({ name: "", email: "", subject: "", message: "" });
      setErrors({});
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again later.");
    }
  };

  return (
    <div className="">
      <MainNavbar />
      <Toaster />


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
      <div className="py-12 px-4">
        <div className="max-w-6xl mx-auto mt-20">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">
              Get in <span className="italic font-serif">Touch</span>
            </h1>
        
<div
  className="prose prose-lg text-gray-700"
  dangerouslySetInnerHTML={{
    __html: data?.description ?? "",
  }}
/>

          </div>

          {/* Main Card */}
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
            <div className="grid md:grid-cols-[350px_1fr]">
              {/* Left Sidebar - Purple */}
              <div className="bg-[#6a6bcf] text-white p-8">
                <div className="space-y-8">
                  {/* Contact Information */}
                  <div>
                    <h3 className="text-2xl font-bold mb-6">
                      Contact Information
                    </h3>

                    {/* Advertiser Manager */}
                    <div className="mb-6">
                      <div className="flex items-start mb-3">
                        <svg
                          className="w-5 h-5 mr-2 mt-1 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                        </svg>
                        <div>
                          <p className="font-semibold mb-2">
                            For Advertiser Manager
                          </p>
                          <p className="text-sm opacity-90 mb-1">
                            <span className="font-medium">Telegram:</span>{" "}
                            @Naresh00159
                          </p>
                          <p className="text-sm opacity-90 mb-1">
                            <span className="font-medium">Email:</span>{" "}
                            naresh@adsaro.net
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Publisher Manager */}
                    <div className="mb-6">
                      <div className="flex items-start">
                        <svg
                          className="w-5 h-5 mr-2 mt-1 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                        </svg>
                        <div>
                          <p className="font-semibold mb-2">
                            For Publisher Manager
                          </p>
                          <p className="text-sm opacity-90 mb-1">
                            <span className="font-medium">Telegram:</span>{" "}
                            @ujjwal_adsaro
                          </p>
                          <p className="text-sm opacity-90">
                            <span className="font-medium">Email:</span>{" "}
                            ujjwal@adsaro.com
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-start mb-3">
                        <svg
                          className="w-5 h-5 mr-2 mt-1 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                        </svg>
                        <div>
                          <p className="font-semibold mb-2">
                            Publisher Manager
                          </p>
                          <p className="text-sm opacity-90 mb-1">
                            <span className="font-medium">Skype:</span>{" "}
                            live:santosh_929
                          </p>
                          <p className="text-sm opacity-90 mb-1">
                            <span className="font-medium">Email:</span>{" "}
                            santosh@adsaro.com
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hours of Operation */}
                  <div className="bg-white text-gray-800 rounded-xl p-5 mt-8">
                    <h3 className="text-xl font-bold mb-3">
                      Hours of Operation
                    </h3>
                    <p className="text-sm">
                      Monday – Friday : 10:00AM – 6:00PM (GMT+5:45)
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Form Section */}
              <div className="p-8 md:p-12">
                <div className="space-y-5">
                  {/* Name and Email Row */}
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <Label
                        htmlFor="name"
                        className="text-xs text-gray-600 mb-1 block"
                      >
                        Your Name
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Full Name"
                        className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      />
                      {errors.name && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label
                        htmlFor="email"
                        className="text-xs text-gray-600 mb-1 block"
                      >
                        Your Email
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="adsaro@example.com"
                        className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <Label
                      htmlFor="subject"
                      className="text-xs text-gray-600 mb-1 block"
                    >
                      Your Subject
                    </Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="I want to advertise my platform"
                      className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    />
                    {errors.subject && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.subject}
                      </p>
                    )}
                  </div>

                  {/* Message */}
                  <div>
                    <Label
                      htmlFor="message"
                      className="text-xs text-gray-600 mb-1 block"
                    >
                      Message
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Write your message here"
                      rows={6}
                      className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 resize-none"
                    />
                    {errors.message && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.message}
                      </p>
                    )}
                  </div>

                  <Button
                    onClick={handleSubmit}
                    className="bg-[#6a6bcf] text-white px-8 py-5 rounded-xl transition-colors"
                  >
                    Send Message
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
      <CTASection />
      <Footer />
    </div>
  );
}
