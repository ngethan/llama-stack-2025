"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, File } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { api } from "@/trpc/react";
import { toast } from "sonner";

type DocumentType =
  | "PRESCRIPTION"
  | "LAB_REPORT"
  | "IMAGING_REPORT"
  | "VACCINATION_RECORD"
  | "INSURANCE_CARD"
  | "OTHER";

export function UploadDialog() {
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<DocumentType>("OTHER");
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const utils = api.useContext();

  const ocrMutation = api.llama.ocr.useMutation({
    onSuccess: async (result) => {
      if (result.success) {
        toast.success("Document Uploaded", {
          description:
            "Document has been uploaded and text extracted successfully",
        });
        await utils.healthcare.getDocuments.invalidate();
      } else {
        toast.error("OCR Failed", {
          description: result.error ?? "Failed to extract text from document",
        });
      }
    },
    onError: (error) => {
      toast.error("Error", {
        description: "Failed to process document: " + error.message,
      });
    },
  });

  const handleUpload = async () => {
    if (!file || !title || !type) return;

    setIsUploading(true);
    try {
      const fileUrl = URL.createObjectURL(file);

      await ocrMutation.mutateAsync({
        fileUrl,
        title,
        type,
        ...(description ? { description } : {}),
      });

      setFile(null);
      setTitle("");
      setType("OTHER");
      setDescription("");
      URL.revokeObjectURL(fileUrl);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const fileName = selectedFile.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[-_]/g, " ")
        .trim();

      setFile(selectedFile);
      setTitle(fileName);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Upload Document
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Upload a new document to your health records
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <div className="grid gap-2">
              <label htmlFor="files" className="text-sm font-medium">
                Files
              </label>
              <div
                className="flex min-h-[100px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-4 hover:bg-accent"
                onClick={() => document.getElementById("files")?.click()}
              >
                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <File className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground">
                      PDF, JPG or PNG (max. 10MB)
                    </p>
                  </div>
                )}
              </div>
              <Input
                id="files"
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Document title"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={type}
              onValueChange={(value: DocumentType) => setType(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PRESCRIPTION">Prescriptions</SelectItem>
                <SelectItem value="LAB_REPORT">Lab Results</SelectItem>
                <SelectItem value="IMAGING_REPORT">Imaging Reports</SelectItem>
                <SelectItem value="VACCINATION_RECORD">
                  Vaccination Records
                </SelectItem>
                <SelectItem value="INSURANCE_CARD">Insurance Cards</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Add any additional notes about this document..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            disabled={!file || !title || !type || isUploading}
            onClick={handleUpload}
          >
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
