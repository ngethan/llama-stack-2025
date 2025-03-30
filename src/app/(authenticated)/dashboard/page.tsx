"use client";

import { useState } from "react";
import { CheckCircle, FileText, Pill, Calendar, Activity } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";

export default function Dashboard() {
  const [timePeriod, setTimePeriod] = useState("7days");
  const { data: documents, isLoading: docsLoading } =
    api.healthcare.getDocuments.useQuery();
  const { data: medications, isLoading: medsLoading } =
    api.healthcare.getMedications.useQuery();
  const router = useRouter();

  const recentDocuments = documents?.slice(0, 3) ?? [];
  const activeMedications = medications?.filter((med) => med.active) ?? [];

  return (
    <main className="flex-1 overflow-auto p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Health Dashboard</h1>
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3days">Last 3 Days</SelectItem>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Active Medications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {activeMedications.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Current medications
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{documents?.length ?? 0}</div>
              <p className="text-xs text-muted-foreground">
                Total health records
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Upcoming Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Next 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Health Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">85%</div>
              <p className="text-xs text-muted-foreground">
                Based on your records
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-md font-medium">
                Recent Documents
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard/health")}
              >
                View all
              </Button>
            </CardHeader>
            <CardContent>
              {docsLoading ? (
                <div className="flex h-[200px] items-center justify-center">
                  <p className="text-sm text-muted-foreground">
                    Loading documents...
                  </p>
                </div>
              ) : recentDocuments.length === 0 ? (
                <div className="flex h-[200px] flex-col items-center justify-center gap-2">
                  <FileText className="h-10 w-10 text-muted-foreground opacity-40" />
                  <p className="text-sm text-muted-foreground">
                    No documents found
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push("/dashboard/health/documents")}
                  >
                    Upload Document
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 hover:bg-muted/50"
                      onClick={() => router.push(`/dashboard/health/${doc.id}`)}
                    >
                      <FileText className="mt-0.5 h-5 w-5 text-blue-500" />
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium leading-none">
                          {doc.title}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </p>
                        {doc.description && (
                          <p className="line-clamp-1 text-xs text-muted-foreground">
                            {doc.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-md font-medium">
                Current Medications
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard/medication")}
              >
                View all
              </Button>
            </CardHeader>
            <CardContent>
              {medsLoading ? (
                <div className="flex h-[200px] items-center justify-center">
                  <p className="text-sm text-muted-foreground">
                    Loading medications...
                  </p>
                </div>
              ) : activeMedications.length === 0 ? (
                <div className="flex h-[200px] flex-col items-center justify-center gap-2">
                  <Pill className="h-10 w-10 text-muted-foreground opacity-40" />
                  <p className="text-sm text-muted-foreground">
                    No active medications
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push("/dashboard/health/medications")}
                  >
                    Add Medication
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeMedications.slice(0, 5).map((med) => (
                    <div
                      key={med.id}
                      className="flex items-start gap-3 rounded-lg border p-3 hover:bg-muted/50"
                    >
                      <Pill className="mt-0.5 h-5 w-5 text-indigo-500" />
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium leading-none">
                          {med.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {med.dosage} • {med.frequency}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="mb-4 text-xl font-semibold">Health Analytics</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="h-5 w-5" />
                  Health Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Track your health metrics over time to identify patterns and
                  trends.
                </p>
                <Button className="mt-4" variant="outline" size="sm">
                  View Reports
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-5 w-5" />
                  Upcoming Appointments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  You have no upcoming appointments scheduled.
                </p>
                <Button className="mt-4" variant="outline" size="sm">
                  Schedule Appointment
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CheckCircle className="h-5 w-5" />
                  Health Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Set and track your health goals to improve your overall
                  wellbeing.
                </p>
                <Button className="mt-4" variant="outline" size="sm">
                  Set Goals
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
