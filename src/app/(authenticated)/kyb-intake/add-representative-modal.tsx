"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { format } from "date-fns";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import {
  businessRepresentativeSchema,
  type BusinessRepresentative,
} from "@/types/forms/kyb-intake";

type AddRepresentativeModalProps = {
  open: boolean;
  onClose: () => void;
  onAdd: (rep: BusinessRepresentative) => void;
};

export function AddRepresentativeModal({
  open,
  onClose,
  onAdd,
}: AddRepresentativeModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
    reset,
    watch,
  } = useForm<BusinessRepresentative>({
    resolver: zodResolver(businessRepresentativeSchema),
    defaultValues: {
      legalName: "",
      personalAddress: "",
      email: "",
      dateOfBirth: undefined,
      fullSSN: "",
      isOwner: true,
      isController: false,
      ownershipPercentage: undefined,
      jobTitle: "",
    },
  });

  const isOwner = watch("isOwner");
  const isController = watch("isController");

  React.useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const onSubmit = (data: BusinessRepresentative) => {
    onAdd(data);
    onClose();
  };

  const handleRoleChange = (role: "owner" | "controller") => {
    if (role === "owner") {
      setValue("isOwner", true);
      setValue("isController", false);
    } else {
      setValue("isOwner", false);
      setValue("isController", true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Business Representative</DialogTitle>
          <DialogDescription>
            Enter details for an Owner or Controller.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Legal Name</Label>
            <Input {...register("legalName")} />
            {errors.legalName && (
              <p className="text-sm text-red-500">{errors.legalName.message}</p>
            )}
          </div>
          <div>
            <Label>Personal Address</Label>
            <Textarea {...register("personalAddress")} />
            {errors.personalAddress && (
              <p className="text-sm text-red-500">
                {errors.personalAddress.message}
              </p>
            )}
          </div>
          <div>
            <Label>Email</Label>
            <Input {...register("email")} type="email" />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>
          <div>
            <Label>Date of Birth</Label>
            <Controller
              control={control}
              name="dateOfBirth"
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      {field.value ? format(field.value, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      captionLayout="dropdown"
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(selectedDate) =>
                        field.onChange(selectedDate ?? undefined)
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            {errors.dateOfBirth && (
              <p className="text-sm text-red-500">
                {errors.dateOfBirth.message}
              </p>
            )}
          </div>
          <div>
            <Label>Full SSN</Label>
            <Input placeholder="123-45-6789" {...register("fullSSN")} />
            {errors.fullSSN && (
              <p className="text-sm text-red-500">{errors.fullSSN.message}</p>
            )}
          </div>
          <div>
            <Label>Representative Role</Label>
            <Controller
              control={control}
              name="isOwner"
              render={() => (
                <Select
                  defaultValue="owner"
                  onValueChange={(value: "owner" | "controller") =>
                    handleRoleChange(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="controller">Controller</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          {isOwner && (
            <div>
              <Label>Ownership Percentage</Label>
              <Input
                type="number"
                step="1"
                placeholder="0 - 100"
                {...register("ownershipPercentage", { valueAsNumber: true })}
              />
              {errors.ownershipPercentage && (
                <p className="text-sm text-red-500">
                  {errors.ownershipPercentage.message}
                </p>
              )}
            </div>
          )}
          {isController && (
            <div>
              <Label>Job Title (for Controllers)</Label>
              <Input placeholder="CEO, CFO, etc." {...register("jobTitle")} />
              {errors.jobTitle && (
                <p className="text-sm text-red-500">
                  {errors.jobTitle.message}
                </p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add Representative</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
