// api/export.js
const { mdToPdf } = require('md-to-pdf');
// 1. Import the lightweight browser and puppeteer
const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer');

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

        // 2. Get the path to the browser executable provided by @sparticuz/chromium
        const executablePath = await chromium.executablePath();

        // 3. Use md-to-pdf, but tell it EXACTLY where to find the browser
        const pdf = await mdToPdf(
            { content: markdown },
            {
                launch_options: {
                    executablePath,
                    args: chromium.args, // Use recommended arguments
                },
            }
        );

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=output.pdf');
        res.status(200).send(pdf.content);

    } catch (error) {
        console.error('Error generating PDF:', error);
        // Add more detailed error logging for Vercel
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
            stack: error.stack,
        });
    }
}