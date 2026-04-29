import { z } from "zod";

export const bookingFormSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^[\d\s\-()]+$/, "Please enter a valid phone number"),
  address: z.string().min(5, "Please enter your full address"),
  serviceType: z.enum([
    "driveway",
    "house_exterior",
    "deck",
    "patio",
    "fence",
    "sidewalk",
    "trashcan",
    "commercial",
  ]),
  squareFootage: z
    .number()
    .min(50, "Minimum square footage is 50")
    .max(50000, "Maximum square footage is 50,000"),
  preferredDate: z.date({
    required_error: "Please select a preferred date",
  }),
  preferredTime: z.string().min(1, "Please select a preferred time"),
  notes: z.string().optional(),
});

export const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export const loginFormSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const pricingSchema = z.object({
  basePrice: z.number().min(0, "Base price must be positive"),
  pricePerSqFt: z.number().min(0, "Price per sq ft must be positive"),
  minPrice: z.number().min(0, "Minimum price must be positive"),
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;
export type ContactFormValues = z.infer<typeof contactFormSchema>;
export type LoginFormValues = z.infer<typeof loginFormSchema>;
export type PricingFormValues = z.infer<typeof pricingSchema>;

// Validation function for booking form
export function validateBookingForm(data: {
  customerName: string;
  email: string;
  phone: string;
  address: string;
  serviceType: string;
  squareFootage: number;
  preferredDate?: Date;
  preferredTime: string;
  notes?: string;
}): { success: boolean; errors: Record<string, string> } {
  const result = bookingFormSchema.safeParse(data);
  
  if (result.success) {
    return { success: true, errors: {} };
  }
  
  const errors: Record<string, string> = {};
  result.error.issues.forEach((issue) => {
    const path = issue.path[0];
    if (path && typeof path === "string") {
      errors[path] = issue.message;
    }
  });
  
  return { success: false, errors };
}
