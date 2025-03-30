"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Pill, MessageSquare } from "lucide-react";
import { DocumentList } from "@/components/healthcare/document-list";
import { Medications } from "@/components/healthcare/medications";
import { ChatInterface } from "@/components/healthcare/chat-interface";

export default function HealthDashboard() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") ?? "documents",
  );

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  return (
    <div className="container mx-4 py-6">
      <h1 className="mb-8 text-3xl font-bold">Healthcare Dashboard</h1>
      <Card>
        <CardHeader>
          <CardTitle>Healthcare Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentList />
        </CardContent>
      </Card>
    </div>
  );
}
