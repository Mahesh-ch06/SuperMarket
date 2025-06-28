// server.js
require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// Enable CORS for all routes
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Serve static files from the current directory
app.use(express.static(__dirname));

// Default route to serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- Gemini API Proxy Endpoint ---
app.post('/api/gemini-insight', async (req, res) => {
    console.log('Received request for AI insight:', req.body);
    
    // Use a fallback API key if environment variable is not set
    const geminiApiKey = process.env.GEMINI_API_KEY || 'AIzaSyD1iij4QWlxQJJPS-yJrhSiCS79kS4dqaM';

    if (!geminiApiKey) {
        console.error("GEMINI_API_KEY is not set in environment variables.");
        return res.status(500).json({ error: 'Server configuration error: API key missing.' });
    }

    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required.' });
    }

    try {
        console.log('Initializing Gemini AI...');
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        console.log('Generating content with prompt:', prompt);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log('AI response generated successfully');
        res.json({ insight: text });
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        
        // Provide a fallback response if API fails
        const fallbackInsight = generateFallbackInsight(prompt);
        res.json({ insight: fallbackInsight });
    }
});

// Fallback insight generator
function generateFallbackInsight(prompt) {
    const productName = prompt.split('about')[1]?.split('.')[0]?.trim() || 'this product';
    
    return `**${productName} - Product Information**

**Nutritional Benefits:**
• Rich in essential vitamins and minerals
• Provides natural energy and nutrients
• Supports overall health and wellness

**Storage Tips:**
• Store in a cool, dry place
• Keep away from direct sunlight
• Check expiration dates regularly

**Usage Suggestions:**
• Perfect for daily consumption
• Can be used in various recipes
• Great for meal preparation

**Quality Indicators:**
• Look for fresh appearance
• Check for proper packaging
• Ensure product is within expiry date

*Note: This is general product information. For specific nutritional details, please consult product packaging.*`;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// --- Firebase Config Endpoint (Optional but Recommended for Full Security) ---
app.get('/api/firebase-config', (req, res) => {
    const firebaseConfig = {
        apiKey: process.env.FIREBASE_API_KEY || "AIzaSyD1iij4QWlxQJJPS-yJrhSiCS79kS4dqaM",
        authDomain: process.env.FIREBASE_AUTH_DOMAIN || "portfolio-56be7.firebaseapp.com",
        projectId: process.env.FIREBASE_PROJECT_ID || "portfolio-56be7",
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "portfolio-56be7.firebasestorage.app",
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "888511551571",
        appId: process.env.FIREBASE_APP_ID || "1:888511551571:web:11e809e995377e9a4ccea6",
        measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-X3CYL9YZR1",
    };
    
    // Filter out undefined values in case some env vars are not set
    const cleanedConfig = Object.fromEntries(
        Object.entries(firebaseConfig).filter(([_, v]) => v !== undefined)
    );
    res.json(cleanedConfig);
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log('📁 Serving static files from:', __dirname);
    console.log('🤖 AI Insights endpoint: /api/gemini-insight');
    console.log('❤️  Health check: /api/health');
});