import * as XLSX from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configure pdfjs worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface ExtractedData {
    title: string;
    content: string;
    category: string;
}

export const processFile = async (file: File): Promise<ExtractedData[]> => {
    const extension = file.name.split('.').pop()?.toLowerCase();

    try {
        if (extension === 'xlsx' || extension === 'xls' || extension === 'csv') {
            return await processExcel(file);
        } else if (extension === 'pdf') {
            return [await processPDF(file)];
        } else if (extension === 'docx') {
            return [await processDocx(file)];
        } else {
            // Fallback to text
            const text = await file.text();
            return [{
                title: file.name.replace(/\.[^/.]+$/, ""),
                content: text,
                category: 'general'
            }];
        }
    } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        throw new Error(`No se pudo procesar el archivo ${file.name}. Asegúrate de que el formato sea correcto.`);
    }
};

const processExcel = (file: File): Promise<ExtractedData[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

                const results: ExtractedData[] = jsonData.map((row, index) => ({
                    title: row.Título || row.Title || row.Nombre || `Fila ${index + 1} de ${file.name}`,
                    content: row.Contenido || row.Content || row.Descripción || JSON.stringify(row),
                    category: row.Categoría || row.Category || 'excel-import'
                }));
                resolve(results);
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = reject;
        reader.readAsBinaryString(file);
    });
};

const processPDF = async (file: File): Promise<ExtractedData> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n';
    }

    return {
        title: file.name.replace(/\.[^/.]+$/, ""),
        content: fullText.trim(),
        category: 'pdf-import'
    };
};

const processDocx = async (file: File): Promise<ExtractedData> => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return {
        title: file.name.replace(/\.[^/.]+$/, ""),
        content: result.value.trim(),
        category: 'word-import'
    };
};
