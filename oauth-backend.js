const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// Enable CORS for your app - allow all origins for testing
app.use(cors({
  origin: '*', // Allow all origins for now
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Google OAuth configuration
const GOOGLE_CLIENT_ID = '100864927549-rrm5blnhjntpg6soskjer76hgpkcsn6j.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'YOUR_GOOGLE_CLIENT_SECRET'; // Set this as environment variable
const REDIRECT_URI = 'https://boloapp.io/auth.html';

// Endpoint to exchange authorization code for access token
app.post('/api/auth/google/callback', async (req, res) => {
  try {
    console.log('Received request to /api/auth/google/callback');
    console.log('Request body:', req.body);
    
    const { code } = req.body;
    
    if (!code) {
      console.error('No code provided in request');
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    console.log('Exchanging code for token:', code);

    // Exchange authorization code for access token
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', null, {
      params: {
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code'
      }
    });

    const { access_token, id_token, expires_in } = tokenResponse.data;
    
    console.log('Token exchange successful');

    // Return the access token to the client
    res.json({
      access_token,
      id_token,
      expires_in
    });

  } catch (error) {
    console.error('Token exchange error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to exchange code for token',
      details: error.response?.data || error.message
    });
  }
});

// Test endpoint for mobile apps
app.get('/test', (req, res) => {
  console.log('Test endpoint called');
  res.json({ 
    status: 'OK', 
    message: 'Backend is accessible from mobile app',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'OAuth backend is running' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`OAuth backend server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
}); 