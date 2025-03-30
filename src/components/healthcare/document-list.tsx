"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, FileText, FileImage, Search, FileScan } from "lucide-react";
import { UploadDialog } from "./upload-dialog";
import { useRouter } from "next/navigation";
import { api, type RouterOutputs } from "@/trpc/react";

type Document = RouterOutputs["healthcare"]["getDocuments"][number];

export function DocumentList() {
  const { data: documents, isLoading } = api.healthcare.getDocuments.useQuery();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "name" | "size">("date");
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="text-muted-foreground">Loading documents...</div>
      </div>
    );
  }

  const filteredDocuments = (documents ?? []).filter((doc) => {
    const matchesSearch = doc.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || doc.type === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const sortedAndFilteredDocuments = filteredDocuments.sort((a, b) => {
    switch (sortBy) {
      case "date":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "name":
        return a.title.localeCompare(b.title);
      case "size":
        // If you don't have size in your DB, you might want to remove this option
        return 0;
      default:
        return 0;
    }
  });

  // Update the SelectContent for categories to match your DB enum
  const categoryContent = (
    <SelectContent>
      <SelectItem value="all">All Categories</SelectItem>
      <SelectItem value="PRESCRIPTION">Prescriptions</SelectItem>
      <SelectItem value="LAB_REPORT">Lab Reports</SelectItem>
      <SelectItem value="IMAGING_REPORT">Imaging Reports</SelectItem>
      <SelectItem value="VACCINATION_RECORD">Vaccination Records</SelectItem>
      <SelectItem value="INSURANCE_CARD">Insurance Cards</SelectItem>
      <SelectItem value="OTHER">Other</SelectItem>
    </SelectContent>
  );

  // Update the document card rendering to match your DB schema
  const documentCard = (doc: Document) => (
    <div
      key={doc.id}
      className="group relative cursor-pointer overflow-hidden rounded-lg border bg-card p-4 transition-all hover:shadow-md"
      onClick={() => router.push(`/dashboard/health/${doc.id}`)}
    >
      <div className="flex items-start gap-4">
        {getDocumentIcon(doc.type)}
        <div className="flex-1 space-y-1">
          <h3 className="font-medium leading-none">{doc.title}</h3>
          <p className="text-sm text-muted-foreground">{doc.type}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
            {doc.description && (
              <>
                <span>•</span>
                <span className="truncate">{doc.description}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="absolute right-2 top-2 flex -translate-y-1 gap-1 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <FileText className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Upload className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  // Update the getDocumentIcon function to match your document types
  const getDocumentIcon = (type: Document["type"]) => {
    switch (type) {
      case "LAB_REPORT":
      case "IMAGING_REPORT":
        return <FileScan className="h-8 w-8 text-red-500" />;
      case "INSURANCE_CARD":
      case "VACCINATION_RECORD":
        return <FileImage className="h-8 w-8 text-blue-500" />;
      default:
        return <FileText className="h-8 w-8 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select
            value={categoryFilter}
            onValueChange={(value) => setCategoryFilter(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            {categoryContent}
          </Select>
          <Select
            value={sortBy}
            onValueChange={(value: "date" | "name" | "size") =>
              setSortBy(value)
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="size">Size</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <UploadDialog />
        </div>
      </div>

      {/* Documents Grid */}
      {sortedAndFilteredDocuments.length === 0 ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <FileText className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 font-medium">No documents found</h3>
          <p className="text-sm text-muted-foreground">
            {searchQuery || categoryFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Upload your first document to get started"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedAndFilteredDocuments.map(documentCard)}
        </div>
      )}
    </div>
  );
}
