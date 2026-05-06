"use client";
import { useAuth } from "@/context/context";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
// import { Button } from "@/components/ui/button";

export type ReferralData = {
  id: number;
  name: string;
  timestamp: string;
  ifas?: string;
};

export type EditListProps = {
  loaddata: () => void;
  selectedData?: ReferralData;
  setShowEditModal: (value: boolean) => void;
};

type FormValues = {
  name: string;
  ifas?: string;
};

export default function EditList({
  loaddata,
  selectedData,
  setShowEditModal,
}: EditListProps) {
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
  const [fileValidation, setFileValidation] = useState<{
    valid: boolean;
    message: string;
  }>({ valid: true, message: "" });

  const isValidIFA = (content: string): boolean => {
    const lines = content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    return lines.every((line) => {
      const urlRegex =
        /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      const domainRegex = /^([\da-z\.-]+)\.([a-z\.]{2,6})$/;
      return urlRegex.test(line) || domainRegex.test(line);
    });
  };

  // Pre-fill form when editing
  useEffect(() => {
    if (selectedData) {
      setValue("name", selectedData.name);
      setValue("ifas", selectedData.ifas || "");
    }
  }, [selectedData, setValue]);

  const onSubmit = async (data: FormValues) => {
    if (data.ifas && !fileValidation.valid) {
      toast.error(
        "Please fix the IFA content validation errors before submitting."
      );
      return;
    }
    console.log(filePreview);
    setShowEditModal(false);
    const loadingToast = toast.loading("Updating IFA List...");

    const requestData = JSON.stringify({
      token: mytoken,
      id: selectedData?.id,
      data: {
        name: data.name,
        ifas: data.ifas || selectedData?.ifas,
      },
    });

    try {
      const response = await fetch("/api/ifalist", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: requestData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `API Error: ${errorData.message || `HTTP ${response.status}`}`
        );
      }

      const responseData = await response.json();
      console.log("Response data:", responseData);

      toast.dismiss(loadingToast);
      toast.success(`IFA List "${data.name}" updated successfully!`);
      loaddata();
    } catch (error: unknown) {
      console.error("Error sending ifalist data:", error);
      toast.dismiss(loadingToast);
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to update IFA List: ${message}`);
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

      const textReader = new FileReader();
      textReader.onload = () => {
        const content = textReader.result as string;
        const lines = content
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line.length > 0);

        let validLines = 0;
        const invalidLines: string[] = [];
        lines.forEach((line, index) => {
          if (isValidIFA(line)) {
            validLines++;
          } else {
            invalidLines.push(`Line ${index + 1}: "${line}"`);
          }
        });

        if (invalidLines.length > 0) {
          setFileValidation({
            valid: false,
            message: `Invalid IFA content found:\n${invalidLines
              .slice(0, 5)
              .join("\n")}${invalidLines.length > 5 ? "\n... and more" : ""}`,
          });
        } else {
          setFileValidation({
            valid: true,
            message: `✅ All ${validLines} IFA entries are valid`,
          });
        }

        const preview = lines.slice(0, 10).join("\n");
        setFilePreview(preview + (lines.length > 10 ? "\n..." : ""));
      };
      textReader.readAsText(file);

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(",")[1];
        setValue("ifas", base64String);
      };
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">
          {selectedData ? "Edit List" : "Add New List"}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
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
              <p className="text-red-500 text-sm mt-1">
                {errors.name.message as string}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="ifas"
              className="block text-sm font-medium text-gray-700"
            >
              IFA Content (.txt only)
            </label>

            {selectedData?.ifas && (
              <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-blue-700">📁</span>
                  <span className="font-medium text-blue-700">
                    Current File Content:
                  </span>
                </div>
                <div className="mb-2">
                  <div className="mt-1 p-2 bg-white border rounded max-h-32 overflow-y-auto">
                    <code className="text-xs text-gray-700 whitespace-pre-wrap">
                      {(() => {
                        try {
                          const decoded = atob(selectedData.ifas);
                          const lines = decoded.split("\n");
                          const preview = lines.slice(0, 10).join("\n");
                          return (
                            preview +
                            (lines.length > 10
                              ? "\n... (showing first 10 lines)"
                              : "")
                          );
                        } catch (error) {
                          console.log("Error decoding file:", error);
                          return "Unable to decode file content";
                        }
                      })()}
                    </code>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs text-blue-600">
                  <span>
                    📊 Total Lines:{" "}
                    {(() => {
                      try {
                        const decoded = atob(selectedData.ifas);
                        return decoded.split("\n").length;
                      } catch (error) {
                        console.log("Error counting lines:", error);
                        return "Unknown";
                      }
                    })()}
                  </span>
                  <span>📄 Size: {selectedData.ifas.length} chars</span>
                </div>
              </div>
            )}

            <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-gray-600">📤</span>
                <span className="text-sm font-medium text-gray-700">
                  Upload New File (Optional)
                </span>
              </div>
              <input
                id="ifas"
                type="file"
                accept=".txt"
                className="block w-full border border-gray-300 rounded p-2 text-sm"
                onChange={handleFileChange}
              />
              <input type="hidden" {...register("ifas", { required: false })} />
              {errors.ifas && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.ifas.message as string}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to keep current file, or select new .txt file to
                replace
              </p>
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
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-400"
            >
              {selectedData ? "Update List" : "Add List"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
