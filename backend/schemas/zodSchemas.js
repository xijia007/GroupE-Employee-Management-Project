import { z } from 'zod';

// ============================================
// Auth Schemas
// ============================================

export const loginSchema = z.object({
  body: z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
  })
});

export const registerSchema = z.object({
  body: z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    token: z.string().min(1, "Registration token is required"),
  })
});

// ============================================
// HR Schemas
// ============================================

export const generateTokenSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    name: z.string().min(1, "Name is required"),
  })
});

export const reviewApplicationSchema = z.object({
  body: z.object({
    status: z.enum(["Approved", "Rejected"], {
      errorMap: () => ({ message: "Status must be 'Approved' or 'Rejected'" })
    }),
    feedback: z.string().optional(),
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Application ID"),
  })
});

// ============================================
// Onboarding Schemas
// ============================================

// Address Sub-Schema
const addressSchema = z.object({
  building: z.string().min(1, "Building/Apt # is required"),
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(1, "Zip code is required"),
});

// Emergency Contact Sub-Schema
const emergencyContactSchema = z.object({
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
  middleName: z.string().optional(),
  phone: z.string().min(1, "Phone checks required"),
  email: z.string().email("Invalid email").optional().or(z.literal('')),
  relationship: z.string().min(1, "Relationship is required"),
});

// Helper for parsing JSON strings from FormData
const jsonString = (schema) => 
  z.string().transform((str, ctx) => {
    try {
      return JSON.parse(str);
    } catch (e) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid JSON string" });
      return z.NEVER;
    }
  }).pipe(schema);

export const onboardingSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, "First Name is required"),
    lastName: z.string().min(1, "Last Name is required"),
    middleName: z.string().optional(),
    preferredName: z.string().optional(),
    
    email: z.string().email("Invalid email"),
    ssn: z.string().min(9, "SSN must be at least 9 digits"), 
    dateOfBirth: z.string().datetime({ offset: true }).or(z.string()), // Accept ISO string
    gender: z.enum(["Male", "Female", "I do not wish to answer"]),
    
    cellPhone: z.string().min(10, "Invalid phone number"),
    workPhone: z.string().optional(),

    // Nested objects come as JSON strings in FormData
    currentAddress: jsonString(addressSchema),
    emergencyContacts: jsonString(z.array(emergencyContactSchema)),

    // Visa/Residency
    usResident: z.enum(["usCitizen", "greenCard", "workAuth"]),
    
    // Conditional validation logic is harder in Zod schemas for separate fields without refinement,
    // but we can validate the fields if they are present.
    visaTitle: z.string().optional(),
    visaStartDate: z.string().optional(),
    visaEndDate: z.string().optional(),
    
    reference: z.string().optional().transform(str => {
        try { return JSON.parse(str) } catch { return {} }
    }).optional(),
  })
});
