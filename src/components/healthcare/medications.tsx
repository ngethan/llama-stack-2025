import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pill } from "lucide-react";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  active: boolean;
}

export function Medications() {
  const [medications, setMedications] = useState<Medication[]>([]);

  return (
    <div className="space-y-4">
      <Button className="flex items-center gap-2">
        <Plus className="h-4 w-4" />
        Add Medication
      </Button>

      <div className="grid gap-4">
        {medications.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            No medications added yet
          </Card>
        ) : (
          medications.map((med) => (
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
                    Started: {med.startDate}
                  </p>
                </div>
                <Button variant="ghost" size="sm">
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
