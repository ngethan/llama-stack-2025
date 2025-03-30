"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { Card } from "@/components/ui/card";
import { api } from "@/trpc/react";
import { toast } from "sonner";

export function DocumentUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const uploadDocument = api.healthcare.uploadDocument.useMutation({
    onSuccess: () => {
      toast.success("Document uploaded successfully");
      setIsUploading(false);
    },
    onError: (error) => {
      toast.error(`Error uploading document: ${error.message}`);
      setIsUploading(false);
    },
  });

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setIsUploading(true);
      for (const file of acceptedFiles) {
        try {
          // TODO: Implement file upload to storage service
          // For now, we'll just simulate the upload
          await new Promise((resolve) => setTimeout(resolve, 1000));

          uploadDocument.mutate({
            title: file.name,
            type: "OTHER", // TODO: Implement document type detection
            fileUrl: "placeholder-url",
          });
        } catch (error) {
          console.error("Error uploading file:", error);
        }
      }
    },
    [uploadDocument],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg"],
    },
    maxSize: 10 * 1024 * 1024,
  });

  return (
    <Card
      {...getRootProps()}
      className={`border-2 border-dashed p-8 text-center transition-colors ${
        isDragActive
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25"
      }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-4">
        <Upload className="h-12 w-12 text-muted-foreground" />
        <div className="space-y-2">
          <p className="text-lg font-medium">
            {isDragActive
              ? "Drop your file here"
              : "Drag & drop your file here"}
          </p>
          <p className="text-sm text-muted-foreground">
            or click to select a file
          </p>
          <p className="text-xs text-muted-foreground">
            Supported formats: PDF, PNG, JPG (max 10MB)
          </p>
        </div>
      </div>
    </Card>
  );
}
