import { PDFDocument, degrees } from "pdf-lib";
import { parsePages } from "./utils/pageParser";

export async function rotatePages(file, pageInput, angle) {

    const arrayBuffer = await file.arrayBuffer();

    const pdf = await PDFDocument.load(arrayBuffer);

    const totalPages = pdf.getPageCount();

    const pages = parsePages(pageInput);

    for (const page of pages) {

        if (page < 1 || page > totalPages) {
            alert(`Page ${page} doesn't exist.`);
            return;
        }

    }

    pages.forEach((page) => {

        const pdfPage = pdf.getPage(page - 1);

        pdfPage.setRotation(degrees(angle));

    });

    const pdfBytes = await pdf.save();

    const blob = new Blob([pdfBytes], {
        type: "application/pdf"
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;
    a.download = "MergeMate-Rotated.pdf";

    a.click();

    URL.revokeObjectURL(url);

}