require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL });

exports.handler = async function (event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { text } = JSON.parse(event.body);
        if (!text) {
            return { statusCode: 400, body: 'Bad Request: text is required.' };
        }

        const prompt = `Provide a plain text response without any markdown formatting bold italics. Interpret the following text: ${text}`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const interpretation = await response.text();

        return {
            statusCode: 200,
            body: JSON.stringify({ interpretation }),
        };
    } catch (error) {
        console.error('Error with Gemini API:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to get interpretation from Gemini API.' }),
        };
    }
};
