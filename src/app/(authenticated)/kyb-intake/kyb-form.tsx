"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  formSchema,
  type FormData,
  type BusinessRepresentative,
} from "@/types/forms/kyb-intake";
import { AddRepresentativeModal } from "./add-representative-modal";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function KYBForm() {
  const router = useRouter();
  const [repModalOpen, setRepModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      acceptTermsOfService: false,
      representatives: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "representatives",
  });

  const saveKYB = api.business.saveKYB.useMutation({
    onSuccess: () => {
      toast.success("Business information saved successfully");
      router.push("/dashboard");
    },
    onError: (error) => {
      console.error("KYB submission error:", error);
      toast.error(`Error saving business information: ${error.message}`);
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!data.acceptTermsOfService) {
      toast.error("Please accept the Terms of Service");
      return;
    }

    console.log(data);

    saveKYB.mutate({
      business: data,
      representatives: data.representatives,
    });
  };

  const handleAddRepresentative = (rep: BusinessRepresentative) => {
    append(rep);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="container mx-auto py-10">
      <Card className="mx-auto max-w-4xl">
        <CardHeader>
          <CardTitle className="text-2xl">Business Information</CardTitle>
          <CardDescription>
            Provide your business details for KYB verification.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="legal-name">Legal Business Name</Label>
            <Input
              id="legal-name"
              placeholder="Enter your business's legal name"
              {...register("legalName")}
            />
            {errors.legalName && (
              <p className="text-sm text-red-500">{errors.legalName.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="legal-name">Website</Label>
            <Input
              id="website"
              placeholder="Enter your business's website"
              {...register("website")}
            />
            {errors.legalName && (
              <p className="text-sm text-red-500">{errors.website?.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter your business's description"
              {...register("description")}
            />
            {errors.legalName && (
              <p className="text-sm text-red-500">
                {errors.description?.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="business-type">Business Type</Label>
            <Select
              onValueChange={(value) =>
                setValue(
                  "businessType",
                  value as
                    | "SOLE_PROPRIETORSHIP"
                    | "PARTNERSHIP"
                    | "LLC"
                    | "CORPORATION"
                    | "S_CORPORATION"
                    | "NON_PROFIT"
                    | "OTHER",
                )
              }
            >
              <SelectTrigger id="business-type">
                <SelectValue placeholder="Select business type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SOLE_PROPRIETORSHIP">
                  Sole Proprietorship
                </SelectItem>
                <SelectItem value="PARTNERSHIP">Partnership</SelectItem>
                <SelectItem value="LLC">
                  Limited Liability Company (LLC)
                </SelectItem>
                <SelectItem value="CORPORATION">Corporation</SelectItem>
                <SelectItem value="S_CORPORATION">S Corporation</SelectItem>
                <SelectItem value="NON_PROFIT">
                  Non-Profit Organization
                </SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="ein">Employer Identification Number (EIN)</Label>
            <Input id="ein" placeholder="XX-XXXXXXX" {...register("ein")} />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Contact Information</h3>

            <div className="space-y-4">
              <Label htmlFor="address">Business Address</Label>
              <Textarea
                id="address"
                placeholder="Enter your complete business address"
                className="min-h-[80px]"
                {...register("address")}
              />
            </div>

            <div>
              <Label htmlFor="phone">Business Phone</Label>
              <Input
                id="phone"
                placeholder="(XXX) XXX-XXXX"
                type="tel"
                {...register("phone")}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Business Representatives</h3>

            {fields.length > 0 ? (
              fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div>
                    <p className="font-semibold">
                      {field.legalName || "Unnamed Representative"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {field.isOwner
                        ? `Owner (${field.ownershipPercentage ?? 0}%)`
                        : field.isController
                          ? `Controller (${field.jobTitle ?? "No Title"})`
                          : "Representative"}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => remove(index)}
                    size="sm"
                  >
                    Remove
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">
                No representatives added yet.
              </p>
            )}

            <Button variant="outline" onClick={() => setRepModalOpen(true)}>
              Add Representative
            </Button>
          </div>

          <div>
            <Label htmlFor="mcc">Industry MCC Code</Label>
            <Input
              id="mcc"
              placeholder="XXXX"
              type="string"
              minLength={4}
              maxLength={4}
              {...register("industryMccCode")}
            />
          </div>

          <div>
            <Label htmlFor="avg-transaction">
              Average Transaction Size ($)
            </Label>
            <Input
              id="avg-transaction"
              type="number"
              placeholder="0.00"
              min="0"
              step="0.01"
              {...register("averageTransactionSize")}
            />
          </div>

          <div>
            <Label htmlFor="monthly-volume">
              Average Monthly Transaction Volume ($)
            </Label>
            <Input
              id="monthly-volume"
              type="number"
              placeholder="0.00"
              min="0"
              step="0.01"
              {...register("averageMonthlyTransactionVolume")}
            />
          </div>

          <div>
            <Label htmlFor="max-transaction">
              Maximum Transaction Size ($)
            </Label>
            <Input
              id="max-transaction"
              type="number"
              placeholder="0.00"
              min="0"
              step="0.01"
              {...register("maximumTransactionSize")}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              onCheckedChange={(checked) =>
                setValue("acceptTermsOfService", checked as boolean)
              }
            />
            <Label htmlFor="terms" className="text-sm font-normal leading-snug">
              I accept the{" "}
              <Popover>
                <PopoverTrigger>
                  <span className="text-primary underline-offset-4 hover:underline">
                    Terms of Service
                  </span>
                </PopoverTrigger>
                <PopoverContent>nothing to see here</PopoverContent>
              </Popover>{" "}
              and confirm that the information provided is accurate.
            </Label>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={saveKYB.isPending}>
            {saveKYB.isPending ? "Submitting..." : "Submit Application"}
          </Button>
        </CardFooter>
      </Card>

      <AddRepresentativeModal
        open={repModalOpen}
        onClose={() => setRepModalOpen(false)}
        onAdd={handleAddRepresentative}
      />
    </form>
  );
}
