import { Medications } from "@/components/healthcare/medications";

export default function MedicationPage() {
  return (
    <div className="container mx-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Medications</h1>
        <p className="text-muted-foreground">
          Manage and track your medications
        </p>
      </div>
      <Medications />
    </div>
  );
}
