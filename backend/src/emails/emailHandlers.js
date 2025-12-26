import { resendClient,  sender} from "../lib/resend.js"
import { createWelcomeEmailTemplate } from "./emailTemplate.js"

export const sendWelcomeEmail = async (email, name, clientURL) => {
    try {
        const { data, error } = await resendClient.emails.send({
            from: `${sender.name} <${sender.email}>`,
            to: email,
            subject: "Welcome to Chatify",
            html: createWelcomeEmailTemplate(name, clientURL)
        });

        if (error) {
            console.error("Resend API Error:", error);
            throw new Error(`Failed to send welcome email: ${error.message}`);
        }

        console.log("✅ Welcome email sent successfully to:", email);
        return data;
        
    } catch (error) {
        console.error("Error in sendWelcomeEmail:", error);
        throw error;
    }
}

   