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
        
        // Provide more detailed error information
        let errorMessage = 'Failed to generate AI insight';
        if (error.message.includes('API_KEY_INVALID')) {
            errorMessage = 'Invalid API key provided';
        } else if (error.message.includes('QUOTA_EXCEEDED')) {
            errorMessage = 'API quota exceeded';
        } else if (error.message.includes('PERMISSION_DENIED')) {
            errorMessage = 'Permission denied - check API key permissions';
        }
        
        // Provide a fallback response if API fails
        const fallbackInsight = generateFallbackInsight(prompt);
        res.json({ 
            insight: fallbackInsight,
            error: errorMessage,
            fallback: true 
        });
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

// --- Firebase Config Endpoint (Secure) ---
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

// --- Contact Configuration Endpoint ---
app.get('/api/contact-config', (req, res) => {
    const contactConfig = {
        web3formsAccessKey: process.env.WEB3FORMS_ACCESS_KEY,
        contactEmail: process.env.CONTACT_EMAIL,
        businessPhone: process.env.BUSINESS_PHONE,
        businessName: process.env.BUSINESS_NAME,
        businessAddress: {
            street: process.env.BUSINESS_ADDRESS_STREET,
            city: process.env.BUSINESS_ADDRESS_CITY,
            state: process.env.BUSINESS_ADDRESS_STATE,
            pincode: process.env.BUSINESS_ADDRESS_PINCODE,
            country: process.env.BUSINESS_ADDRESS_COUNTRY
        },
        socialMedia: {
            twitter: process.env.SOCIAL_TWITTER,
            facebook: process.env.SOCIAL_FACEBOOK,
            instagram: process.env.SOCIAL_INSTAGRAM,
            linkedin: process.env.SOCIAL_LINKEDIN
        },
        googleMapsEmbedUrl: process.env.GOOGLE_MAPS_EMBED_URL
    };
    
    // Filter out undefined values
    const cleanedConfig = Object.fromEntries(
        Object.entries(contactConfig).filter(([_, v]) => v !== undefined)
    );
    res.json(cleanedConfig);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'Server is running', 
        timestamp: new Date().toISOString(),
        geminiApiConfigured: !!process.env.GEMINI_API_KEY,
        firebaseConfigured: !!process.env.FIREBASE_API_KEY,
        web3formsConfigured: !!process.env.WEB3FORMS_ACCESS_KEY
    });
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
    console.log('🔥 Firebase Config endpoint: /api/firebase-config');
    console.log('📞 Contact Config endpoint: /api/contact-config');
    console.log('🔑 Environment variables configured:');
    console.log('   - Gemini API:', !!process.env.GEMINI_API_KEY);
    console.log('   - Firebase:', !!process.env.FIREBASE_API_KEY);
    console.log('   - Web3Forms:', !!process.env.WEB3FORMS_ACCESS_KEY);
    console.log('❤️  Health check: /api/health');
});