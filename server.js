// server.js
require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// Serve static files from the current directory
app.use(express.static(__dirname));

// Default route to serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- Gemini API Proxy Endpoint ---
app.post('/api/gemini-insight', async (req, res) => {
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!geminiApiKey) {
        console.error("GEMINI_API_KEY is not set in environment variables.");
        return res.status(500).json({ error: 'Server configuration error: API key missing.' });
    }

    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required.' });
    }

    try {
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ insight: text });
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        res.status(500).json({ error: 'Failed to generate insight from AI.', details: error.message });
    }
});

// --- Firebase Config Endpoint (Optional but Recommended for Full Security) ---
app.get('/api/firebase-config', (req, res) => {
    const firebaseConfig = {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID,
        measurementId: process.env.FIREBASE_MEASUREMENT_ID,
    };
    // Filter out undefined values in case some env vars are not set
    const cleanedConfig = Object.fromEntries(
        Object.entries(firebaseConfig).filter(([_, v]) => v !== undefined)
    );
    res.json(cleanedConfig);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Serving static files from:', __dirname);
});