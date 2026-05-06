"use client";

import { useAuth } from "@/context/context";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export type AddListProps = { loaddata?: () => void };

type FormValues = {
  name: string;
  ipaddresses: string;
};

export default function AddList({ loaddata }: AddListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>();

  const auth = useAuth();
  const mytoken = auth?.token;

  const [filePreview, setFilePreview] = useState<string>("");
  const [fileValidation, setFileValidation] = useState<{ valid: boolean; message: string }>({ valid: true, message: "" });

  const isValidIP = (ip: string): boolean => {
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    if (ipv4Regex.test(ip)) {
      const parts = ip.split('.');
      return parts.every(part => {
        const num = parseInt(part, 10);
        return num >= 0 && num <= 255;
      });
    }
    if (ipv6Regex.test(ip)) return true;
    return false;
  };

  const isValidIPRange = (range: string): boolean => {
    const cidrRegex = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/;
    if (cidrRegex.test(range)) {
      const [ip, prefix] = range.split('/');
      const prefixNum = parseInt(prefix, 10);
      return isValidIP(ip) && prefixNum >= 0 && prefixNum <= 32;
    }
    return false;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type !== "text/plain") {
      toast.error("Only .txt files are allowed!");
      return;
    }

    const textReader = new FileReader();
    textReader.onload = () => {
      const content = textReader.result as string;
      const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      let validLines = 0;
      const invalidLines: string[] = [];
      lines.forEach((line, index) => {
        if (isValidIP(line) || isValidIPRange(line)) validLines++;
        else invalidLines.push(`Line ${index + 1}: "${line}"`);
      });
      if (invalidLines.length > 0) {
        setFileValidation({
          valid: false,
          message: `Invalid IP addresses found:\n${invalidLines.slice(0, 5).join('\n')}${invalidLines.length > 5 ? '\n... and more' : ''}`,
        });
      } else {
        setFileValidation({ valid: true, message: `✅ All ${validLines} IP addresses are valid` });
      }
      const preview = lines.slice(0, 10).join('\n');
      setFilePreview(preview + (lines.length > 10 ? '\n...' : ''));
    };
    textReader.readAsText(file);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64String = result.split(",")[1];
      setValue("ipaddresses", base64String);
    };
  };

  const onSubmit = async (data: FormValues) => {
    if (!fileValidation.valid) {
      toast.error("Please fix the IP address validation errors before submitting.");
      return;
    }

    setIsModalOpen(false);
    const loadingToast = toast.loading("Creating IP List...");
    try {
      const response = await fetch("/api/iplist", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name: data.name, ipaddresses: data.ipaddresses, token: mytoken }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${errorData.message || `HTTP ${response.status}`}`);
      }
      await response.json();
      toast.dismiss(loadingToast);
      toast.success(`IP List "${data.name}" created successfully!`);
      loaddata?.();
    } catch (error: unknown) {
      console.error("Error sending iplist data:", error);
      toast.dismiss(loadingToast);
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to create IP List: ${message}`);
      setIsModalOpen(true);
      return;
    }
    reset();
    setFilePreview("");
    setFileValidation({ valid: true, message: "" });
  };

  return (
    <>
      <Button onClick={() => setIsModalOpen(true)} className="bg-blue-500 hover:bg-blue-600 text-white">
        New IP List
      </Button>
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Add New IP List</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                <input id="name" type="text" placeholder="Enter list name" className="mt-1 block w-full border border-gray-300 rounded p-2" {...register("name", { required: "Name is required" })} />
                {errors.name && <p className="text-red-500 text-sm mt-1">{String(errors.name.message)}</p>}
              </div>
              <div className="mb-4">
                <label htmlFor="ipaddresses" className="block text-sm font-medium text-gray-700">IP Addresses (.txt only)</label>
                <input id="ipaddresses" type="file" accept=".txt" className="mt-1 block w-full border border-gray-300 rounded p-2" onChange={handleFileChange} required />
                <input type="hidden" {...register("ipaddresses", { required: "File is required" })} />
                {errors.ipaddresses && <p className="text-red-500 text-sm mt-1">{String(errors.ipaddresses.message)}</p>}
                <p className="text-xs text-gray-500 mt-1">Upload a .txt file containing IP addresses (one per line)</p>
              </div>
              {filePreview && (
                <div className="mt-3 p-3 border rounded">
                  <div className="mb-2">
                    <span className={`text-sm font-medium ${fileValidation.valid ? 'text-green-600' : 'text-red-600'}`}>{fileValidation.message}</span>
                  </div>
                  {fileValidation.valid && (
                    <div>
                      <span className="text-xs font-medium text-gray-600">File Preview:</span>
                      <div className="mt-1 p-2 bg-gray-50 border rounded max-h-24 overflow-y-auto">
                        <code className="text-xs text-gray-700 whitespace-pre-wrap">{filePreview}</code>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="flex gap-x-2 justify-end">
                <Button type="button" variant="outline" onClick={() => { setIsModalOpen(false); setFilePreview(""); setFileValidation({ valid: true, message: "" }); }}>Cancel</Button>
                <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white">Add List</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
