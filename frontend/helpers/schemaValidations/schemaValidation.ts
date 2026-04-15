import { string, z } from "zod";

export const fullNameValidation = z
    .string({ message: "Full name must be a string" })
    .min(3, "Full name should be at least 3 characters long")
    .max(20, "Full name must not exceed 20 characters");

export const emailValidation = z
    .email("Invalid email address")
    .transform((val) => val.trim().toLowerCase());

export const passwordValidation = z
    .string({ message: "Please enter a valid password" })
    .min(8, "Password should be at least 8 characters long")
    .max(30, "Password must not exceed 30 characters");

    

export const codeValidation = z.object({
    code: z
        .string({ message: "Code must be a string" })
        .trim()
        .length(6, "Code must be exactly 6 characters long"),
    justSendEmail: z.string({ message: 'justSendEmail field is required' })
});

export const sendName = z.object({
    name: fullNameValidation
});

export const sendEmail = z.object({
    email: emailValidation
});

export const sendPassword = z.object({
    password: passwordValidation,
    confirmPassword: passwordValidation,
    userId: string({ message: 'User id is required' })
});

export const signupSchema = z.object({
    fullName: fullNameValidation,
    email: emailValidation,
    password: passwordValidation,
});

export const signinSchema = z.object({
    email: emailValidation,
    password: passwordValidation,
});