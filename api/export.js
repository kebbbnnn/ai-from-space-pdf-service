const { mdToPdf } = require('md-to-pdf');
const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    try {
        const { markdown } = req.body;
        if (!markdown) {
            return res.status(400).send('Bad Request: Missing markdown content.');
        }

        const pdf = await mdToPdf(
            { content: markdown },
            {
                puppeteer: {
                    executablePath: await chromium.executablePath(),
                    args: chromium.args,
                },
            }
        );

        if (pdf && pdf.content) {
            // FIX: Use writeHead and end for explicit binary data transmission.
            // This prevents the Buffer from being converted to JSON.
            res.writeHead(200, {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename=output.pdf',
                'Content-Length': pdf.content.length
            });
            return res.end(pdf.content);
        } else {
            throw new Error('PDF generation resulted in empty content.');
        }

    } catch (error) {
        console.error('Error generating PDF:', error);
        // Ensure error responses are also clearly JSON
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
        });
    }
}
