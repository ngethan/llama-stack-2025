"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pill, Loader2 } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

export function Medications() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const { data: medications, isLoading } =
    api.healthcare.getMedications.useQuery();

  type Medication = NonNullable<typeof medications>[number];
  const [editingMedication, setEditingMedication] = useState<Medication | null>(
    null,
  );

  const utils = api.useContext();

  const addMedication = api.healthcare.addMedication.useMutation({
    onSuccess: async () => {
      toast.success("Medication added successfully");
      await utils.healthcare.getMedications.invalidate();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to add medication", {
        description: error.message,
      });
    },
  });

  const updateMedication = api.healthcare.updateMedication.useMutation({
    onSuccess: async () => {
      toast.success("Medication updated successfully");
      await utils.healthcare.getMedications.invalidate();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to update medication", {
        description: error.message,
      });
    },
  });

  const resetForm = () => {
    setName("");
    setDosage("");
    setFrequency("");
    setStartDate(undefined);
    setEditingMedication(null);
  };

  const handleEdit = (med: Medication) => {
    setEditingMedication(med);
    setName(med.name);
    setDosage(med.dosage);
    setFrequency(med.frequency);
    setStartDate(new Date(med.startDate));
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const medicationData = {
      name,
      dosage,
      frequency,
      startDate: startDate?.toISOString() ?? "",
      active: true,
    };

    if (editingMedication) {
      await updateMedication.mutateAsync({
        id: editingMedication.id,
        ...medicationData,
      });
    } else {
      await addMedication.mutateAsync(medicationData);
    }
  };

  return (
    <div className="space-y-4">
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogTrigger asChild>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Medication
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingMedication ? "Edit Medication" : "Add New Medication"}
            </DialogTitle>
            <DialogDescription>
              {editingMedication
                ? "Update the details of your medication"
                : "Enter the details of your medication"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Medication Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dosage">Dosage</Label>
                <Input
                  id="dosage"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Input
                  id="frequency"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${!startDate && "text-muted-foreground"}`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={addMedication.isPending}>
                {addMedication.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingMedication ? "Updating..." : "Adding..."}
                  </>
                ) : editingMedication ? (
                  "Update Medication"
                ) : (
                  "Add Medication"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4">
        {isLoading ? (
          <Card className="p-8 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin" />
          </Card>
        ) : medications?.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            No medications added yet
          </Card>
        ) : (
          medications?.map((med) => (
            <Card key={med.id} className="p-4">
              <div className="flex items-center gap-4">
                <Pill className="h-8 w-8 text-muted-foreground" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{med.name}</h3>
                    <Badge variant={med.active ? "default" : "secondary"}>
                      {med.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {med.dosage} • {med.frequency}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Started: {new Date(med.startDate).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(med)}
                >
                  Edit
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
