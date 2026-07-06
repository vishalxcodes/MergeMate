import { PDFDocument } from "pdf-lib";

export async function splitPDF(file, splitPage) {

    const arrayBuffer = await file.arrayBuffer();

    const pdf = await PDFDocument.load(arrayBuffer);

    const totalPages = pdf.getPageCount();

    if (splitPage < 1 || splitPage >= totalPages) {
        alert(`Enter a page number between 1 and ${totalPages - 1}`);
        return;
    }

    const part1 = await PDFDocument.create();
    const part2 = await PDFDocument.create();

    // First Part
    const pages1 = await part1.copyPages(
        pdf,
        Array.from({ length: splitPage }, (_, i) => i)
    );

    pages1.forEach(page => part1.addPage(page));

    // Second Part
    const pages2 = await part2.copyPages(
        pdf,
        Array.from(
            { length: totalPages - splitPage },
            (_, i) => i + splitPage
        )
    );

    pages2.forEach(page => part2.addPage(page));

    downloadPDF(await part1.save(), "Part-1.pdf");
    downloadPDF(await part2.save(), "Part-2.pdf");
}

function downloadPDF(bytes, filename) {

    const blob = new Blob([bytes], {
        type: "application/pdf"
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;
    a.download = filename;

    a.click();

    URL.revokeObjectURL(url);

}