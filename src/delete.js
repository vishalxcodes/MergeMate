import { PDFDocument } from "pdf-lib";
import { parsePages } from "./utils/pageParser";


export async function deletePage(file, pageNumber) {

    const pagesToDelete = parsePages(pageNumber);

console.log(pagesToDelete);  

    const arrayBuffer = await file.arrayBuffer();

    const pdf = await PDFDocument.load(arrayBuffer);

    const totalPages = pdf.getPageCount();

    for (const page of pagesToDelete) {

    if (page < 1 || page > totalPages) {
        alert(`Page ${page} doesn't exist.`);
        return;
    }

}

    // pageNumber is 1-based, pdf-lib uses 0-based index
   pagesToDelete
    .sort((a, b) => b - a)   // Reverse order
    .forEach((page) => {
        pdf.removePage(page - 1);
    });

    const pdfBytes = await pdf.save();

    const blob = new Blob([pdfBytes], {
        type: "application/pdf"
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;
    a.download = "MergeMate-Edited.pdf";

    a.click();

    URL.revokeObjectURL(url);
}