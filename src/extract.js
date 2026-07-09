import { PDFDocument } from "pdf-lib";

function parsePages(input) {

    const pages = [];

    const parts = input.split(",");

    for (const part of parts) {

        if (part.includes("-")) {

            const [start, end] = part.split("-").map(Number);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

        } else {

            pages.push(Number(part));

        }

    }

    return [...new Set(pages)];

}

export async function extractPages(file, pageInput) {

    const arrayBuffer = await file.arrayBuffer();

    const pdf = await PDFDocument.load(arrayBuffer);

    const totalPages = pdf.getPageCount();

    const pagesToExtract = parsePages(pageInput);

    for (const page of pagesToExtract) {

        if (page < 1 || page > totalPages) {
            alert(`Page ${page} doesn't exist.`);
            return;
        }

    }

    const newPdf = await PDFDocument.create();

    const copiedPages = await newPdf.copyPages(
        pdf,
        pagesToExtract.map(page => page - 1)
    );

    copiedPages.forEach(page => newPdf.addPage(page));

    const pdfBytes = await newPdf.save();

    const blob = new Blob([pdfBytes], {
        type: "application/pdf"
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;
    a.download = "MergeMate-Extracted.pdf";

    a.click();

    URL.revokeObjectURL(url);

}