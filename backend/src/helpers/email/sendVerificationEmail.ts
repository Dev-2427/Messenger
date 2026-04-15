import { Resend } from "resend";
import getVerificationEmailHtml from "./verificationEmailTemplate.js";

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVerificationEmail(email: string, code: string, name: string) {
    try {
        const { data, error } = await resend.emails.send({
            from: "Messenger <onboarding@resend.dev>",
            to: email,
            subject: "Messenger | Verification Code:",
            html: getVerificationEmailHtml(name, code)
        })

        if (error) {
            return { success: false, message: error }
        }

        return { success: true, message: "Verification email sent successfully" }

    } catch (error) {
        console.error("Failed to send Verification email:", error)
        return { success: false, message: "Failed to send Verification email" }
    }
}