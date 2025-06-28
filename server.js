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

// --- Secure Firebase Config Endpoint ---
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
    
    console.log('🔐 Firebase config requested - serving secure configuration');
    res.json(cleanedConfig);
});

// --- Secure Contact Form Submission Endpoint ---
app.post('/api/contact-submit', async (req, res) => {
    console.log('📧 Contact form submission received:', req.body);
    
    const { name, email, phone, subject, message } = req.body;
    
    // Validate required fields
    if (!name || !email || !message) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields: name, email, and message are required' 
        });
    }
    
    try {
        // Submit to Web3Forms using server-side API key
        const web3FormData = new FormData();
        web3FormData.append('access_key', process.env.WEB3FORMS_ACCESS_KEY);
        web3FormData.append('name', name);
        web3FormData.append('email', email);
        web3FormData.append('phone', phone || '');
        web3FormData.append('subject', subject || 'Contact Form Submission from FreshMart');
        web3FormData.append('message', message);
        web3FormData.append('from_name', 'FreshMart Contact Form');
        
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: web3FormData
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Contact form submitted successfully via Web3Forms');
            res.json({ 
                success: true, 
                message: 'Contact form submitted successfully',
                provider: 'web3forms'
            });
        } else {
            throw new Error('Web3Forms submission failed: ' + result.message);
        }
        
    } catch (error) {
        console.error('❌ Contact form submission error:', error);
        
        // Return error but don't expose sensitive details
        res.status(500).json({ 
            success: false, 
            error: 'Failed to submit contact form. Please try again or contact us directly.',
            fallback: true
        });
    }
});

// --- Secure Configuration Endpoint ---
app.get('/api/config', (req, res) => {
    const config = {
        web3formsKey: process.env.WEB3FORMS_ACCESS_KEY ? 'configured' : 'missing',
        geminiKey: process.env.GEMINI_API_KEY ? 'configured' : 'missing',
        environment: process.env.NODE_ENV || 'development'
    };
    
    console.log('⚙️ Configuration status requested');
    res.json(config);
});

// --- Gemini AI Proxy Endpoint ---
app.post('/api/gemini-insight', async (req, res) => {
    console.log('🤖 Received request for AI insight:', req.body);
    
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!geminiApiKey) {
        console.error("❌ GEMINI_API_KEY is not set in environment variables.");
        return res.status(500).json({ error: 'Server configuration error: AI service unavailable.' });
    }

    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required.' });
    }

    try {
        console.log('🔄 Initializing Gemini AI...');
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        console.log('🔄 Generating content with prompt:', prompt);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log('✅ AI response generated successfully');
        res.json({ insight: text });
    } catch (error) {
        console.error('❌ Error calling Gemini API:', error);
        
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

// Health check endpoint
app.get('/api/health', (req, res) => {
    const healthStatus = {
        status: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        services: {
            geminiApi: !!process.env.GEMINI_API_KEY,
            firebaseConfig: !!process.env.FIREBASE_API_KEY,
            web3forms: !!process.env.WEB3FORMS_ACCESS_KEY
        }
    };
    
    console.log('🏥 Health check requested');
    res.json(healthStatus);
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('💥 Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log('📁 Serving static files from:', __dirname);
    console.log('🔐 Security Status:');
    console.log('  ✅ Firebase Config:', !!process.env.FIREBASE_API_KEY ? 'Secured' : '❌ Missing');
    console.log('  ✅ Gemini API:', !!process.env.GEMINI_API_KEY ? 'Secured' : '❌ Missing');
    console.log('  ✅ Web3Forms:', !!process.env.WEB3FORMS_ACCESS_KEY ? 'Secured' : '❌ Missing');
    console.log('🌐 API Endpoints:');
    console.log('  📧 Contact Form: /api/contact-submit');
    console.log('  🔐 Firebase Config: /api/firebase-config');
    console.log('  🤖 AI Insights: /api/gemini-insight');
    console.log('  ⚙️  Configuration: /api/config');
    console.log('  🏥 Health Check: /api/health');
});