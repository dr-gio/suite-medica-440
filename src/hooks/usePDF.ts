import { useState } from 'react';
import html2pdf from 'html2pdf.js';

interface UsePDFOptions {
    margin?: number | [number, number, number, number];
    filename?: string;
}

export const usePDF = () => {
    const [downloading, setDownloading] = useState(false);

    const downloadPDF = async (element: HTMLElement, filename: string = 'document.pdf', options: UsePDFOptions = {}) => {
        if (!element) return null;

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
                    logging: false,
                    allowTaint: false,
                    scrollY: 0,
                    scrollX: 0
                },
                jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
                pagebreak: { mode: ['avoid-all' as const, 'css' as const, 'legacy' as const] }
            };

            // Wait for styles and images to settle
            await new Promise(resolve => setTimeout(resolve, 300));

            // Generate the PDF
            const worker = html2pdf().from(element).set(opt);
            
            // Save the file
            await worker.save();

            // Also get the blob for optional email processing
            const pdfBlob = await worker.outputPdf('blob');

            // Cleanup
            document.body.classList.remove('is-capturing-pdf');
            window.scrollTo(0, originalScrollPos);
            
            return pdfBlob;
        } catch (error) {
            console.error('Error generating PDF:', error);
            document.body.classList.remove('is-capturing-pdf');
            alert('Hubo un error al generar el PDF. Asegúrate de verificar tu conexión a internet y probar nuevamente.');
            window.print(); // Fallback to system print dialog
            return null;
        } finally {
            setDownloading(false);
        }
    };

    return { downloadPDF, downloading };
};
