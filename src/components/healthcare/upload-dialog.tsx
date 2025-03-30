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

export function UploadDialog() {
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);
  const [category, setCategory] = useState("");

  const handleUpload = async () => {
    if (!files || !category) return;

    setIsUploading(true);
    try {
      // Here you would implement your file upload logic
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate upload
      // Reset form
      setFiles(null);
      setCategory("");
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
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
            Upload your medical documents here. Supported formats: PDF, JPG, PNG
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="files" className="text-sm font-medium">
              Files
            </label>
            <div
              className="flex min-h-[100px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-4 hover:bg-accent"
              onClick={() => document.getElementById("files")?.click()}
            >
              {files && files.length > 0 ? (
                <div className="flex flex-col items-center gap-2">
                  <File className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm">{files[0].name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(files[0].size / 1024 / 1024).toFixed(2)} MB
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
              onChange={(e) => setFiles(e.target.files)}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Category</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Lab Results">Lab Results</SelectItem>
                <SelectItem value="Prescriptions">Prescriptions</SelectItem>
                <SelectItem value="Medical Records">Medical Records</SelectItem>
                <SelectItem value="Insurance">Insurance</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            disabled={!files || !category || isUploading}
            onClick={handleUpload}
          >
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
