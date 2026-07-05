import { PDFDocument } from "pdf-lib";

export async function mergePDFs(files) {

    const mergedPdf = await PDFDocument.create();

    for (const file of files) {

        const arrayBuffer = await file.arrayBuffer();

        const pdf = await PDFDocument.load(arrayBuffer);

        const pages = await mergedPdf.copyPages(
            pdf,
            pdf.getPageIndices()
        );

        pages.forEach(page => mergedPdf.addPage(page));
    }

    const pdfBytes = await mergedPdf.save();

    const blob = new Blob([pdfBytes], {
        type: "application/pdf"
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;
    a.download = "merged.pdf";

    a.click();

    URL.revokeObjectURL(url);

}