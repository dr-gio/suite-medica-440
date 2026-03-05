import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import nodemailer from "npm:nodemailer";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabase = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        const { to, subject, body, pdfBase64, pdfFilename, documentId } = await req.json();

        if (!to) throw new Error("Recipient 'to' is required");

        // Configure SMTP transport
        const transporter = nodemailer.createTransport({
            host: Deno.env.get("SMTP_HOST"),
            port: Number(Deno.env.get("SMTP_PORT") || 465),
            secure: Deno.env.get("SMTP_SECURE") === "true",
            auth: {
                user: Deno.env.get("SMTP_USER"),
                pass: Deno.env.get("SMTP_PASS"),
            },
        });

        const mailOptions = {
            from: `"${Deno.env.get("SMTP_FROM_NAME") || "440 Clinic by Dr. Gio"}" <${Deno.env.get("SMTP_FROM")}>`,
            to,
            subject: subject || "Documento médico – 440 Clinic",
            html: body,
            attachments: pdfBase64 ? [
                {
                    filename: pdfFilename || "documento.pdf",
                    content: pdfBase64,
                    encoding: "base64",
                },
            ] : [],
        };

        // Send email
        let status = "success";
        let errorMessage = null;

        try {
            await transporter.sendMail(mailOptions);
        } catch (err) {
            status = "error";
            errorMessage = err.message;
            console.error("SMTP error:", err);
        }

        // Log the event
        await supabase.from("email_logs").insert({
            document_id: documentId,
            patient_email: to,
            status,
            error_message: errorMessage,
            subject: mailOptions.subject,
            metadata: {
                pdfFilename,
                from: mailOptions.from
            }
        });

        if (status === "error") {
            throw new Error(errorMessage);
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
