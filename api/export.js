const { mdToPdf } = require('md-to-pdf');
const chromium = require('@sparticuz/chromium');

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    try {
        const { markdown } = req.body;
        if (!markdown) {
            return res.status(400).send('Bad Request: Missing markdown content.');
        }

        // THE DEFINITIVE FIX: Use the 'launch_options' key as required by the md-to-pdf library.
        const pdf = await mdToPdf(
            { content: markdown },
            {
                launch_options: {
                    executablePath: await chromium.executablePath(),
                    args: chromium.args,
                    headless: chromium.headless,
                },
            }
        );

        if (pdf && pdf.content) {
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
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
        });
    }
}
