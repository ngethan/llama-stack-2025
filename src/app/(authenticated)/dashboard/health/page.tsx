"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, MessageSquare, FileText, Activity } from "lucide-react";
import { DocumentUpload } from "@/components/healthcare/document-upload";
import { MedicalConditions } from "@/components/healthcare/medical-conditions";
import { ChatInterface } from "@/components/healthcare/chat-interface";

export default function HealthDashboard() {
  const [activeTab, setActiveTab] = useState("documents");

  return (
    <div className="container mx-auto py-6">
      <h1 className="mb-8 text-3xl font-bold">Healthcare Dashboard</h1>

      <Tabs defaultValue="documents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="conditions" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Conditions
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Chat
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Healthcare Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <DocumentUpload />
                {/* Document list will go here */}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conditions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Medical Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              <MedicalConditions />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Healthcare Assistant</CardTitle>
            </CardHeader>
            <CardContent>
              <ChatInterface />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
