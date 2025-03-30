"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

export function MedicalConditions() {
  const [isAdding, setIsAdding] = useState(false);
  const [newCondition, setNewCondition] = useState({
    name: "",
    description: "",
    severity: "",
    status: "",
  });

  const { data: conditions, refetch } = api.healthcare.getConditions.useQuery();
  const addCondition = api.healthcare.addCondition.useMutation({
    onSuccess: () => {
      toast.success("Condition added successfully");
      setIsAdding(false);
      setNewCondition({ name: "", description: "", severity: "", status: "" });
      void refetch();
    },
    onError: (error) => {
      toast.error(`Error adding condition: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCondition.mutate(newCondition);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-xl font-semibold">Medical Conditions</h2>
        <Button onClick={() => setIsAdding(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Condition
        </Button>
      </div>

      {isAdding && (
        <Card className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Condition Name</Label>
              <Input
                id="name"
                value={newCondition.name}
                onChange={(e) =>
                  setNewCondition({ ...newCondition, name: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newCondition.description}
                onChange={(e) =>
                  setNewCondition({
                    ...newCondition,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="severity">Severity</Label>
              <Input
                id="severity"
                value={newCondition.severity}
                onChange={(e) =>
                  setNewCondition({ ...newCondition, severity: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Input
                id="status"
                value={newCondition.status}
                onChange={(e) =>
                  setNewCondition({ ...newCondition, status: e.target.value })
                }
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAdding(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={addCondition.isPending}>
                {addCondition.isPending ? "Adding..." : "Add Condition"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {conditions?.map((condition) => (
          <Card key={condition.id} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{condition.name}</h3>
                {condition.description && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {condition.description}
                  </p>
                )}
                {condition.severity && (
                  <p className="mt-1 text-sm">Severity: {condition.severity}</p>
                )}
                {condition.status && (
                  <p className="mt-1 text-sm">Status: {condition.status}</p>
                )}
              </div>
              <Button variant="ghost" size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
