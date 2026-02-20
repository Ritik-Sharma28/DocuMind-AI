import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import path from "path";

export class DocumentProcessor {
    static async extractText(buffer, fileName) {
        const ext = path.extname(fileName).toLowerCase();

        switch (ext) {
            case ".pdf": {
               try {
                    const pdf = await pdfParse(buffer, { version: 'default' });
                    return {
                        text: pdf.text,
                        metadata: {
                            pageCount: pdf.numpages,
                            wordCount: pdf.text.split(/\s+/).length,
                            charCount: pdf.text.length,
                        },
                    };
                } catch (error) {
                    throw new Error(`Failed to parse PDF (${fileName}). The file may be corrupted: ${error.message}`);
                }
            }
            case ".docx": {
                const { value } = await mammoth.extractRawText({ buffer });
                return {
                    text: value,
                    metadata: {
                        wordCount: value.split(/\s+/).length,
                        charCount: value.length,
                    },
                };
            }
            case ".txt":
            case ".md": {
                const text = buffer.toString("utf-8");
                return {
                    text,
                    metadata: {
                        wordCount: text.split(/\s+/).length,
                        charCount: text.length,
                    },
                };
            }
            default:
                throw new Error(`Unsupported file type: ${ext}`);
        }
    }
}
