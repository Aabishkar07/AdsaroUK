"use client";
import { useAuth } from "@/context/context";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// Define props type
export type EditListProps = {
  loaddata: () => void;
  selectedData?: { id: string; name: string; domains?: string };
  setShowEditModal: (value: boolean) => void;
};

type FormValues = {
  name: string;
  domains?: string;
};

export default function EditList({ 
  loaddata, 
  selectedData, 
  setShowEditModal 
}: EditListProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>();

  const [fileError, setFileError] = React.useState("");
  const [submitError, setSubmitError] = React.useState("");
  const [currentFile, setCurrentFile] = React.useState<File | null>(null);
  const [fileContent, setFileContent] = React.useState<string>("");

  const auth = useAuth();
  const mytoken = auth?.token;

  // Pre-fill form when editing
  useEffect(() => {
    if (selectedData) {
      setValue("name", selectedData.name);
      if (selectedData.domains) {
        setValue("domains", selectedData.domains);
        try {
          let decodedDomains = "";
          if (selectedData.domains.startsWith('data:')) {
            const base64Part = selectedData.domains.split(',')[1];
            decodedDomains = atob(base64Part);
          } else {
            decodedDomains = atob(selectedData.domains);
          }
          if (decodedDomains.length > 0) {
            setFileContent(decodedDomains);
          } else {
            throw new Error("Decoded content doesn't look like domain data");
          }
        } catch (base64Error) {
          console.error("Base64 decoding error:", base64Error);
          setFileContent(selectedData.domains);
        }
      }
    }
  }, [selectedData, setValue]);

  const onSubmit = async (data: FormValues) => {
    if (!mytoken || !selectedData?.id) {
      console.error("Missing token or ID");
      return;
    }

    const requestData = {
      token: mytoken,
      id: selectedData.id,
      data: {
        name: data.name,
        domains: data.domains,
      },
    };

    try {
      const response = await fetch("/api/domainlist", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      const isSuccess = responseData.success || 
                       responseData.data?.status === "Success" || 
                       responseData.data?.status === "success" ||
                       responseData.data?.status === "OK" ||
                       responseData.data?.status === "ok" ||
                       responseData.data?.success === true ||
                       (responseData.data && !responseData.data.status && !responseData.data.message) ||
                       response.status === 200;
      
      if (isSuccess) {
        toast.success("Domain list updated successfully!");
        setShowEditModal(false);
        loaddata();
        reset();
      } else {
        const errorMessage = responseData.data?.message || responseData.message || 'Update failed. Please try again.';
        toast.error(errorMessage);
        setSubmitError(errorMessage);
      }
    } catch (error) {
      console.error("Error updating domain list:", error);
      const errorMessage = "Failed to update domain list. Please try again.";
      toast.error(errorMessage);
      setSubmitError(errorMessage);
    }
  };

  const validateAndProcessDomains = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const content = reader.result as string;
          const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
          const validDomains: string[] = [];
          const invalidLines: string[] = [];
          for (const line of lines) {
            if (!line || line.startsWith('#') || line.startsWith('//')) continue;
            const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/;
            if (domainRegex.test(line)) validDomains.push(line.toLowerCase());
            else invalidLines.push(line);
          }
          if (invalidLines.length > 0) {
            const errorMessage = `Invalid domain names found: ${invalidLines.slice(0, 3).join(', ')}${invalidLines.length > 3 ? ` and ${invalidLines.length - 3} more` : ''}.`;
            reject(new Error(errorMessage));
            return;
          }
          if (validDomains.length === 0) {
            reject(new Error('No valid domains found in the file.'));
            return;
          }
          const domainsText = validDomains.join('\n');
          const base64 = btoa(domainsText);
          resolve(base64);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setFileError("");
    setSubmitError("");

    if (file) {
      if (file.type !== "text/plain") {
        setFileError("Only .txt files are allowed!");
        return;
      }
      setCurrentFile(file);
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setFileContent(content);
        };
        reader.readAsText(file);
        const base64String = await validateAndProcessDomains(file);
        setValue("domains", base64String);
      } catch (error) {
        console.error("File validation error:", error);
        if (error instanceof Error) setFileError(error.message);
        event.target.value = '';
        setCurrentFile(null);
        setFileContent("");
      }
    } else {
      setCurrentFile(null);
      setFileContent("");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
        <h2 className="text-xl font-bold mb-4">
          {selectedData ? "Edit Domain List" : "Add New Domain List"}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <Input
              id="name"
              type="text"
              placeholder="Enter list name"
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">
                {errors.name.message as string}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="domains" className="block text-sm font-medium text-gray-700 mb-1">
              Domain List (.txt only)
            </label>
            <Input id="domains" type="file" accept=".txt" onChange={handleFileChange} />
            <p className="text-xs text-gray-500 mt-1">
              Each line should contain one domain name (e.g., example.com)
            </p>
            {fileError && (
              <p className="text-red-500 text-sm mt-1">{fileError}</p>
            )}

            {fileContent && (
              <div className="mt-3 p-3 bg-gray-50 border rounded-md max-h-32 overflow-y-auto">
                <p className="text-xs text-gray-600 mb-2">
                  {currentFile ? `Selected file: ${currentFile.name}` : "Current domains:"}
                </p>
                <pre className="text-xs text-gray-800 whitespace-pre-wrap">{fileContent}</pre>
              </div>
            )}

            <input type="hidden" {...register("domains", { required: selectedData ? false : "Domain list file is required" })} />
            {errors.domains && (
              <p className="text-red-500 text-sm mt-1">{errors.domains.message as string}</p>
            )}
          </div>

          {submitError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{submitError}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowEditModal(false);
                setFileError("");
                setSubmitError("");
                setCurrentFile(null);
                setFileContent("");
              }}
            >
              Cancel
            </Button>
            <Button type="submit">{selectedData ? "Update List" : "Add List"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
