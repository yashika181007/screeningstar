// Import required packages
const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const config = require('./config');
const cors = require('cors');
require('dotenv').config();

// Create an Express application
const app = express();

// Enable CORS
app.use(cors());

// Middleware to parse incoming JSON requests
app.use(bodyParser.json());

// Define your API routes
app.use('/Screeningstar', authRoutes);

// Set the port from environment variables or default to 5000
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
