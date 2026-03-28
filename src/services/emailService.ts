import { supabase } from '../lib/supabase';

interface SendEmailParams {
    to: string;
    cc?: string;
    bcc?: string;
    subject: string;
    body: string;
    pdfBase64?: string;
    pdfFilename?: string;
    documentId?: string;
}

export const emailService = {
    sendMedicalDocument: async ({
        to,
        cc = 'historias@440clinic.online',
        bcc = 'drgio440@documentos.440clinic.online',
        subject,
        body,
        pdfBase64,
        pdfFilename,
        documentId
    }: SendEmailParams) => {
        try {
            const { data, error } = await supabase.functions.invoke('send-email', {
                body: {
                    to,
                    cc,
                    bcc,
                    subject,
                    body,
                    pdfBase64,
                    pdfFilename,
                    documentId
                }
            });

            if (error) throw error;
            return { data, error: null };
        } catch (error: any) {
            console.error('Error sending email:', error);
            return { data: null, error: error.message || 'Error al enviar el correo' };
        }
    }
};
