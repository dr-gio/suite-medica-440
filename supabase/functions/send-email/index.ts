import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import nodemailer from "npm:nodemailer";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabase = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        const { to, cc, subject, body, pdfBase64, pdfFilename, documentId } = await req.json();

        if (!to) throw new Error("Recipient 'to' is required");

        console.log(`Sending email to: ${to}${cc ? ` with CC: ${cc}` : ""}`);

        // Configure SMTP transport
        // Using both SMTP and SMPT to handle potential typos in env vars (from screenshot)
        const smtpHost = Deno.env.get("SMTP_HOST") || Deno.env.get("SMPT_HOST");
        const smtpPort = Deno.env.get("SMTP_PORT") || Deno.env.get("SMPT_PORT");
        const smtpUser = Deno.env.get("SMTP_USER") || Deno.env.get("SMPT_USER") || Deno.env.get("SMPT_user");
        const smtpPass = Deno.env.get("SMTP_PASS") || Deno.env.get("SMPT_PASS");
        const smtpSecure = Deno.env.get("SMTP_SECURE") || Deno.env.get("SMPT_SECURE");
        const smtpFromName = Deno.env.get("SMTP_FROM_NAME") || Deno.env.get("SMPT_FROM_NAME") || "440 Clinic by Dr. Gio";
        const smtpFrom = Deno.env.get("SMTP_FROM") || Deno.env.get("SMPT_FROM");

        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: Number(smtpPort || 465),
            secure: smtpSecure === "true",
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
            connectionTimeout: 15000, // 15 seconds timeout
            greetingTimeout: 15000,
            socketTimeout: 30000,
        });

        const mailOptions = {
            from: `"${smtpFromName}" <${smtpFrom}>`,
            to,
            cc: cc || undefined,
            bcc: "drgio440@documentos.440clinic.online",
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
            const info = await transporter.sendMail(mailOptions);
            console.log("Email sent successfully:", info.messageId);
        } catch (err: any) {
            status = "error";
            errorMessage = err.message;
            console.error("SMTP Error Details:", err);
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
                from: mailOptions.from,
                cc: cc || null
            }
        });

        if (status === "error") {
            throw new Error(`SMTP Error: ${errorMessage}`);
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
