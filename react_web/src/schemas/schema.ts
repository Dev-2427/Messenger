import { z } from 'zod';

export const signinSchema = z.object({
    email: z.email({ error: "Invalid email address" }),
    password: z.string().min(8, { error: "Password must be at least 8 characters" }),
});

export const signUpSchema = signinSchema.extend({
    fullName: z.string().min(3, { error: "Username must be at least 3 characters" }),
    password: z.string().min(8, { error: "Password must be at least 8 characters" })
})

export const verifyCodeSchema = z.object({
    code: z.string().length(6, { error: 'Code must be exactly 6 digits' })
        .regex(/^\d+$/, "OTP must only contain numbers"),
    justSendEmail: z.string({ message: 'justSendEmail field is required' })
})

export const sendEmail = z.object({
    email: z.email({ error: 'Invalid email address' })
})

export const sendName = z.object({
    name: z.string({ message: "Full name must be a string" })
        .min(3, "Full name should be at least 3 characters long")
        .max(20, "Full name must not exceed 20 characters")
})

export const sendPassword = z.object({
    password: z.string().min(8, { error: "Password must be at least 8 characters" }),
    confirmPassword: z.string().min(8, { error: "Password must be at least 8 characters" }),
    userId: z.string({ message: 'User id is required' })
});