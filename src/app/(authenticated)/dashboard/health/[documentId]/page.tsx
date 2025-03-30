"use client";

import { useParams } from "next/navigation";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { FileText, Download, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function DocumentPage() {
  const params = useParams();
  const documentId = params.documentId as string;

  const { data: document, isLoading } = api.healthcare.getDocument.useQuery({
    id: documentId,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!document) {
    return <div>Document not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/health">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{document.title}</h1>
        </div>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <span>Type: {document.type}</span>
          <span>•</span>
          <span>
            Added: {new Date(document.createdAt).toLocaleDateString()}
          </span>
        </div>

        {document.description && (
          <p className="mb-4 text-sm text-muted-foreground">
            {document.description}
          </p>
        )}

        <div className="aspect-[16/9] rounded-lg border bg-muted">
          {/* Render document preview here based on type */}
          <iframe
            src={document.fileUrl}
            className="h-full w-full rounded-lg"
            title={document.title}
          />
        </div>
      </div>
    </div>
  );
}
