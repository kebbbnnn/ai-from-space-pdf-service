// api/export.js
const { mdToPdf } = require('md-to-pdf');

// This is a Vercel Serverless Function
export default async function handler(req, res) {
    // 1. Only allow POST requests
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }

    try {
        // 2. Get the Markdown content from the request body
        const { markdown } = req.body;
        if (!markdown) {
            res.status(400).send('Bad Request: Missing markdown content.');
            return;
        }

        // 3. Use md-to-pdf to generate the PDF buffer
        const pdf = await mdToPdf({ content: markdown });

        // 4. Set the correct headers to trigger a file download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=output.pdf');

        // 5. Send the PDF file back to the browser
        res.status(200).send(pdf.content);

    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Internal Server Error');
    }
}