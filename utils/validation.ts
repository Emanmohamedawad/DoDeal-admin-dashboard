import { z } from "zod";

export const userSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .regex(/^[a-zA-Z\s]*$/, "Name can only contain letters and spaces"),

  email: z
    .string()
    .email("Invalid email address")
    .min(5, "Email must be at least 5 characters")
    .max(100, "Email must be less than 100 characters"),
});

export type UserFormData = z.infer<typeof userSchema> & {
  gender: "male" | "female";
  phone: string;
};

export function validateUserForm(data: UserFormData) {
  const errors: { field: keyof UserFormData; message: string }[] = [];

  // Name validation
  if (!data.name) {
    errors.push({ field: "name", message: "required" });
  } else if (data.name.length < 2) {
    errors.push({ field: "name", message: "min" });
  } else if (data.name.length > 50) {
    errors.push({ field: "name", message: "max" });
  } else if (!/^[a-zA-Z\s]*$/.test(data.name)) {
    errors.push({ field: "name", message: "format" });
  }

  // Email validation
  if (!data.email) {
    errors.push({ field: "email", message: "required" });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push({ field: "email", message: "format" });
  } else if (data.email.length < 5) {
    errors.push({ field: "email", message: "min" });
  } else if (data.email.length > 100) {
    errors.push({ field: "email", message: "max" });
  }

  // Gender validation
  if (!data.gender) {
    errors.push({ field: "gender", message: "required" });
  } else if (!["male", "female"].includes(data.gender.toLowerCase())) {
    errors.push({ field: "gender", message: "invalid" });
  }

  // Phone validation
  if (!data.phone) {
    errors.push({ field: "phone", message: "required" });
  } else if (!/^[0-9]+$/.test(data.phone)) {
    errors.push({ field: "phone", message: "format" });
  } else if (data.phone.length < 10) {
    errors.push({ field: "phone", message: "min" });
  } else if (data.phone.length > 15) {
    errors.push({ field: "phone", message: "max" });
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return { success: true, data };
}
