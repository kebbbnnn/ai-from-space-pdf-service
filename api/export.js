// api/export.js
const { mdToPdf } = require('md-to-pdf');
const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core'); // Use puppeteer-core for serverless

// This is a Vercel Serverless Function
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }

    try {
        const { markdown } = req.body;
        if (!markdown) {
            res.status(400).send('Bad Request: Missing markdown content.');
            return;
        }

        const executablePath = await chromium.executablePath();

        // Use md-to-pdf with explicit PDF and launch options
        const pdf = await mdToPdf(
            { content: markdown },
            {
                // Instruct Puppeteer to render for print media
                css: `@media print { body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 12px; } }`,
                // Explicitly define PDF generation options for high quality
                pdf_options: {
                    format: 'A4',
                    printBackground: true,
                    margin: {
                        top: '20mm',
                        right: '20mm',
                        bottom: '20mm',
                        left: '20mm',
                    },
                },
                launch_options: {
                    executablePath,
                    args: chromium.args,
                    headless: chromium.headless, // Ensure headless mode is correctly set
                },
            }
        );

        if (!pdf || !pdf.content) {
            throw new Error('PDF generation failed, content is empty.');
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=output.pdf');
        res.status(200).send(pdf.content);

    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
            stack: error.stack,
        });
    }
}