"use client";

import { useParams } from "next/navigation";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Download, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ReactMarkdown from "react-markdown";

export default function DocumentPage() {
  const params = useParams();
  const documentId = params.documentId as string;
  const [activeTab, setActiveTab] = useState("preview");

  const { data: document, isLoading } = api.healthcare.getDocument.useQuery({
    id: documentId,
  });

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-muted-foreground">Document not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-4 max-w-5xl space-y-8 py-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/health">
            <Button variant="ghost" size="icon" className="hover:bg-muted">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight">
            {document.title}
          </h1>
        </div>
        <Button variant="outline" size="sm" className="hover:bg-muted">
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
      </div>

      <div className="rounded-xl border bg-card shadow-sm">
        <div className="border-b p-6">
          <div className="mb-4 flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              Type:{" "}
              <span className="font-medium text-foreground">
                {document.type}
              </span>
            </span>
            <span>•</span>
            <span>
              Added:{" "}
              <span className="font-medium text-foreground">
                {new Date(document.createdAt).toLocaleDateString()}
              </span>
            </span>
          </div>

          {document.description && (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {document.description}
            </p>
          )}
        </div>

        <div className="p-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="mb-4">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="raw">Raw Text</TabsTrigger>
            </TabsList>
            <TabsContent value="preview" className="mt-0">
              <div className="overflow-hidden rounded-lg border bg-muted">
                <iframe
                  src={document.fileUrl}
                  className="h-[600px] w-full rounded-lg"
                  title={document.title}
                />
              </div>
            </TabsContent>
            <TabsContent value="raw" className="mt-0">
              <div className="h-[600px] overflow-auto rounded-lg border bg-muted p-4">
                {document.ocrText ? (
                  <ReactMarkdown>{document.ocrText}</ReactMarkdown>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No OCR text available for this document.
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
