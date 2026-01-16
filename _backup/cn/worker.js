// PDF Watermark Worker
importScripts('https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js');

self.onmessage = async (e) => {
    const { arrayBuffer, config } = e.data;
    const { text, size, opacity, rotation, color, mode, gap, xPercent, yPercent } = config;

    try {
        const { PDFDocument, rgb, degrees, StandardFonts } = PDFLib;
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pages = pdfDoc.getPages();
        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        // Convert hex color to RGB
        const hexToRgb = (hex) => {
            const r = parseInt(hex.slice(1, 3), 16) / 255;
            const g = parseInt(hex.slice(3, 5), 16) / 255;
            const b = parseInt(hex.slice(5, 7), 16) / 255;
            return rgb(r, g, b);
        };
        const textColor = hexToRgb(color);

        for (const page of pages) {
            const { width, height } = page.getSize();

            if (mode === 'single') {
                // Calculate position based on percentage
                const x = (width * xPercent) / 100;
                const y = (height * yPercent) / 100;

                page.drawText(text, {
                    x: x,
                    y: y,
                    size: size,
                    font: font,
                    color: textColor,
                    opacity: opacity,
                    rotate: degrees(rotation),
                });
            } else {
                // Grid mode
                // We use a larger area to cover rotation
                const diag = Math.sqrt(width * width + height * height);
                for (let x = -diag / 2; x < width + diag / 2; x += gap) {
                    for (let y = -diag / 2; y < height + diag / 2; y += gap) {
                        page.drawText(text, {
                            x: x,
                            y: y,
                            size: size,
                            font: font,
                            color: textColor,
                            opacity: opacity,
                            rotate: degrees(rotation),
                        });
                    }
                }
            }
        }

        const pdfBytes = await pdfDoc.save();
        self.postMessage(pdfBytes, [pdfBytes.buffer]);
    } catch (error) {
        console.error('Worker error:', error);
        self.postMessage(null);
    }
};
