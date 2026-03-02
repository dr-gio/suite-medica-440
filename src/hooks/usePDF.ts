import { useState } from 'react';
import html2pdf from 'html2pdf.js';

interface UsePDFOptions {
    margin?: number | [number, number, number, number];
    filename?: string;
}

export const usePDF = () => {
    const [downloading, setDownloading] = useState(false);

    const downloadPDF = async (element: HTMLElement, filename: string = 'document.pdf', options: UsePDFOptions = {}) => {
        if (!element) return;

        setDownloading(true);
        try {
            // Add global class to show all .print-only elements for capture
            document.body.classList.add('is-capturing-pdf');

            // Force scroll to top to avoid capturing blank space
            const originalScrollPos = window.scrollY;
            window.scrollTo(0, 0);

            const opt = {
                margin: options.margin || [10, 10, 10, 10],
                filename: filename,
                image: { type: 'jpeg' as const, quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    logging: true, // Enable temporarily to see what html2canvas is doing
                    allowTaint: false, // Tainted canvas often causes failures, CORS is preferred
                    scrollY: 0,
                    scrollX: 0
                },
                jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
                pagebreak: { mode: ['avoid-all' as const, 'css' as const, 'legacy' as const] }
            };

            // Wait for styles and images to settle
            await new Promise(resolve => setTimeout(resolve, 300));

            // Wrap in a timeout so it doesn't hang infinitely if html2canvas gets stuck
            const pdfPromise = html2pdf().from(element).set(opt).save();
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Timeout generating PDF. It took too long.")), 20000)
            );

            await Promise.race([pdfPromise, timeoutPromise]);

            // Cleanup
            document.body.classList.remove('is-capturing-pdf');
            window.scrollTo(0, originalScrollPos);
        } catch (error) {
            console.error('Error generating PDF:', error);
            document.body.classList.remove('is-capturing-pdf');
            alert('Hubo un error al generar el PDF. Asegúrate de verificar tu conexión a internet y probar nuevamente. Mensaje: ' + (error instanceof Error ? error.message : 'Error desconocido'));
            window.print(); // Fallback to system print dialog
        } finally {
            setDownloading(false);
        }
    };

    return { downloadPDF, downloading };
};
