"use client";
import { useAuth } from "@/context/context";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

// Local type for selected row in this modal
export type SelectedData = {
  id: string;
  name: string;
  ipaddresses?: string;
};

export type EditListProps = {
  loaddata: () => void;
  selectedData?: SelectedData;
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

  // Pre-fill form when editing
  useEffect(() => {
    if (selectedData) {
      setValue("name", selectedData.name);
      setValue("ipaddresses", selectedData.ipaddresses || "");
    }
  }, [selectedData, setValue]);

  const onSubmit = async (data: FormValues) => {
    // Check if file validation passed (only if a new file is being uploaded)
    if (data.ipaddresses && !fileValidation.valid) {
      toast.error("Please fix the IP address validation errors before submitting.");
      return;
    }

    setShowEditModal(false);

    // Show loading toast
    const loadingToast = toast.loading("Updating IP List...");

    const requestData = JSON.stringify({
      token: mytoken,
      id: selectedData?.id,
      data: {
        name: data.name,
        ipaddresses: data.ipaddresses || selectedData?.ipaddresses,
      },
    });

    try {
      const response = await fetch("/api/iplist", {
        method: "PUT",
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

      await response.json();

      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success(`IP List "${data.name}" updated successfully!`);

      loaddata();
    } catch (error: unknown) {
      console.error("Error sending iplist data:", error);

      // Dismiss loading toast and show error
      toast.dismiss(loadingToast);
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to update IP List: ${message}`);

      setShowEditModal(true);
      return;
    }

    reset();
    setFilePreview("");
    setFileValidation({ valid: true, message: "" });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      if (file.type !== "text/plain") {
        toast.error("Only .txt files are allowed!");
        return;
      }

      // Read file content for preview and validation
      const textReader = new FileReader();
      textReader.onload = () => {
        const content = textReader.result as string;
        const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);

        // Validate each line
        let validLines = 0;
        const invalidLines: string[] = [];

        lines.forEach((line, index) => {
          if (isValidIP(line) || isValidIPRange(line)) {
            validLines++;
          } else {
            invalidLines.push(`Line ${index + 1}: "${line}"`);
          }
        });

        if (invalidLines.length > 0) {
          setFileValidation({
            valid: false,
            message: `Invalid IP addresses found:\n${invalidLines.slice(0, 5).join('\n')}${invalidLines.length > 5 ? '\n... and more' : ''}`
          });
        } else {
          setFileValidation({ valid: true, message: `✅ All ${validLines} IP addresses are valid` });
        }

        // Show preview (first 10 lines)
        const preview = lines.slice(0, 10).join('\n');
        setFilePreview(preview + (lines.length > 10 ? '\n...' : ''));
      };
      textReader.readAsText(file);

      // Also read as base64 for form submission
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
              IP Addresses (.txt only)
            </label>

            {selectedData?.ipaddresses && (
              <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-blue-700">📁</span>
                  <span className="font-medium text-blue-700">Current File Content:</span>
                </div>
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
              <input type="hidden" {...register("ipaddresses", { required: false })} />
              {errors.ipaddresses && <p className="text-red-500 text-sm mt-1">{String(errors.ipaddresses.message)}</p>}
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to keep current file, or select new .txt file to replace
              </p>

              {filePreview && (
                <div className="mt-3 p-3 border rounded">
                  <div className="mb-2">
                    <span className={`text-sm font-medium ${fileValidation.valid ? 'text-green-600' : 'text-red-600'}`}>
                      {fileValidation.message}
                    </span>
                  </div>

                  {fileValidation.valid && (
                    <div>
                      <span className="text-xs font-medium text-gray-600">File Preview:</span>
                      <div className="mt-1 p-2 bg-gray-50 border rounded max-h-24 overflow-y-auto">
                        <code className="text-xs text-gray-700 whitespace-pre-wrap">
                          {filePreview}
                        </code>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-x-2 justify-end">
            <button
              type="button"
              onClick={() => {
                setShowEditModal(false);
                setFilePreview("");
                setFileValidation({ valid: true, message: "" });
              }}
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
