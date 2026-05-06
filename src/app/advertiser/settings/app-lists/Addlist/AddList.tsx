"use client";
import { useAuth } from "@/context/context";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export type AddListProps = {
  loaddata?: () => void;
};

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

  const onSubmit = async (data: FormValues) => {
    console.log("New Feed Data:", data);
    setIsModalOpen(false);

    const loadingToast = toast.loading("Creating App List...");

    try {
      const response = await fetch("/api/applist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          ipaddresses: data.ipaddresses,
          token: mytoken,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${errorData.message || `HTTP ${response.status}`}`);
      }

      const responseData = await response.json();
      console.log("Response data:", responseData);

      toast.dismiss(loadingToast);
      toast.success(`App List "${data.name}" created successfully!`);

      loaddata?.();
    } catch (error: unknown) {
      console.error("Error sending applist data:", error);

      toast.dismiss(loadingToast);
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to create App List: ${message}`);

      setIsModalOpen(true);
      return;
    }

    reset();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      if (file.type !== "text/plain") {
        toast.error("Only .txt files are allowed!");
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === "string") {
          const base64String = result.split(",")[1] ?? "";
          setValue("ipaddresses", base64String);
        }
      };
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-4">
        <button
          className="bg-blue-500 border border-blue-500 text-white px-4 py-2 rounded transition duration-500 ease-in-out hover:text-blue-500 flex items-center gap-2 hover:bg-transparent"
          onClick={() => setIsModalOpen(true)}
        >
          Add New List
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Add New List</h2>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Enter list name"
                  className="mt-1 block w-full border border-gray-300 rounded p-2"
                  {...register("name", { required: "Name is required" })}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{String(errors.name.message)}</p>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="ipaddresses" className="block text-sm font-medium text-gray-700">
                  App Bundle (.txt only)
                </label>
                <input
                  id="ipaddresses"
                  type="file"
                  accept=".txt"
                  className="mt-1 block w-full border border-gray-300 rounded p-2"
                  onChange={handleFileChange}
                />
                <input
                  type="hidden"
                  {...register("ipaddresses", {
                    required: "App Bundles is required",
                  })}
                />
                {errors.ipaddresses && (
                  <p className="text-red-500 text-sm mt-1">{String(errors.ipaddresses.message)}</p>
                )}
              </div>

              <div className="flex gap-x-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-400"
                >
                  Close
                </button>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-400">
                  Add Feed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
