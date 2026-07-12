export function parsePages(input) {

    const pages = [];

    const parts = input.split(",");

    for (const part of parts) {

        const value = part.trim();

        if (value.includes("-")) {

            let [start, end] = value.split("-").map(Number);

            if (start > end) {
                [start, end] = [end, start];
            }

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

        } else {

            const page = Number(value);

            if (!isNaN(page)) {
                pages.push(page);
            }

        }

    }

    return [...new Set(pages)];

}