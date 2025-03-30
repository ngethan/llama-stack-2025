import { z } from "zod";

export const businessRepresentativeSchema = z.object({
  legalName: z.string().min(1, "Legal name is required"),
  personalAddress: z.string().min(1, "Personal address is required"),
  email: z.string().min(1, "Email is required"),
  dateOfBirth: z.date(),
  fullSSN: z.string().min(1, "Full SSN is required"),
  isOwner: z.boolean().optional().default(false),
  ownershipPercentage: z
    .number()
    .min(0, "Ownership percentage cannot be negative")
    .max(100, "Ownership percentage cannot exceed 100")
    .optional(),
  isController: z.boolean().optional().default(false),
  jobTitle: z.string().optional(),
});

export const formSchema = z.object({
  legalName: z.string().min(1, { message: "Legal name is required" }),
  website: z.string().url().optional(),
  description: z.string().optional(),
  businessType: z
    .enum([
      "SOLE_PROPRIETORSHIP",
      "PARTNERSHIP",
      "LLC",
      "CORPORATION",
      "S_CORPORATION",
      "NON_PROFIT",
      "OTHER",
    ])
    .optional(),
  ein: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  industryMccCode: z.string().optional(),
  averageTransactionSize: z.string().optional(),
  averageMonthlyTransactionVolume: z.string().optional(),
  maximumTransactionSize: z.string().optional(),
  acceptTermsOfService: z.boolean(),
  representatives: z.array(businessRepresentativeSchema),
});

export type FormData = z.infer<typeof formSchema>;
export type BusinessRepresentative = z.infer<
  typeof businessRepresentativeSchema
>;
