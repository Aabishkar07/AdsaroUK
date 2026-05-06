"use client";
import { useAuth } from "@/context/context";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { ReferralData } from "../page";
import { toast } from "sonner";

// Define props type
export type EditListProps = {
  loaddata: () => void;
  selectedData?: ReferralData;
  setShowEditModal: (value: boolean) => void;
};

type FormValues = {
  name: string;
  ipaddresses?: string;
};

export default function EditList({ loaddata, selectedData, setShowEditModal }: EditListProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>();

  const auth = useAuth();
  const mytoken = auth?.token;

  // Pre-fill form when editing
  useEffect(() => {
    if (selectedData) {
      setValue("name", selectedData.name);
      setValue("ipaddresses", selectedData.ipaddresses || "");
    }
  }, [selectedData, setValue]);

  const onSubmit = async (data: FormValues) => {
    setShowEditModal(false);

    // Show loading toast
    const loadingToast = toast.loading("Updating App List...");

    const requestData = JSON.stringify({
      token: mytoken,
      id: selectedData?.id,
      data: {
        name: data.name,
        app_bundles: data.ipaddresses || selectedData?.ipaddresses, // Use new file or keep existing
      },
    });

    try {
      const response = await fetch("/api/applist", {
        method: "PUT", // Use PUT for updating
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: requestData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${errorData.message || `HTTP ${response.status}`}`);
      }

      const responseData = await response.json();
      console.log("Response data:", responseData);
      
      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success(`App List "${data.name}" updated successfully!`);
      
      loaddata(); // Refresh data
    } catch (error: unknown) {
      console.error("Error sending applist data:", error);
      
      // Dismiss loading toast and show error
      toast.dismiss(loadingToast);
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to update App List: ${message}`);
      
      setShowEditModal(true); // Reopen modal to show error
      return;
    }

    reset(); // Reset form after submission
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
    <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">{selectedData ? "Edit List" : "Add New List"}</h2>
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
            {errors.name && <p className="text-red-500 text-sm mt-1">{String(errors.name.message)}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="ipaddresses" className="block text-sm font-medium text-gray-700">
              App Bundle (.txt only)
            </label>
            
            {/* Show current uploaded file content */}
            {selectedData?.ipaddresses && (
              <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-blue-700">📁</span>
                  <span className="font-medium text-blue-700">Current File Content:</span>
                </div>
                
                {/* Show decoded file content */}
                <div className="mb-2">
                  <div className="mt-1 p-2 bg-white border rounded max-h-32 overflow-y-auto">
                    <code className="text-xs text-gray-700 whitespace-pre-wrap">
                      {(() => {
                        try {
                          const decoded = atob(selectedData.ipaddresses);
                          const lines = decoded.split('\n');
                          const preview = lines.slice(0, 10).join('\n');
                          return preview + (lines.length > 10 ? '\n... (showing first 10 lines)' : '');
                        } catch (error) {
                          console.log('Error decoding file:', error);
                          return 'Unable to decode file content';
                        }
                      })()}
                    </code>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-xs text-blue-600">
                  <span>📊 Total Lines: {(() => {
                    try {
                      const decoded = atob(selectedData.ipaddresses);
                      return decoded.split('\n').length;
                    } catch (error) {
                      console.log('Error counting lines:', error);
                      return 'Unknown';
                    }
                  })()}</span>
                  <span>📄 Size: {selectedData.ipaddresses.length} chars</span>
                </div>
              </div>
            )}
            
            <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-gray-600">📤</span>
                <span className="text-sm font-medium text-gray-700">Upload New File (Optional)</span>
              </div>
              <input
                id="ipaddresses"
                type="file"
                accept=".txt"
                className="block w-full border border-gray-300 rounded p-2 text-sm"
                onChange={handleFileChange}
              />
              <input type="hidden" {...register("ipaddresses", { 
                required: false // Make it optional when editing
              })} />
              {errors.ipaddresses && <p className="text-red-500 text-sm mt-1">{String(errors.ipaddresses.message)}</p>}
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to keep current file, or select new .txt file to replace
              </p>
              
            </div>
            

          </div>

          <div className="flex gap-x-2 justify-end">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-400"
            >
              Close
            </button>
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-400">
              {selectedData ? "Update List" : "Add List"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
