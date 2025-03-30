"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentList } from "@/components/healthcare/document-list";

export default function DocumentsPage() {
  return (
    <div className="container mx-4 py-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Documents</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentList />
        </CardContent>
      </Card>
    </div>
  );
}
