require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const companyRoutes = require('./routes/companyRoutes');
const internshipRoutes = require('./routes/internshipRoutes');
const adminRoutes = require('./routes/adminRoutes');
const referenceRoutes = require('./routes/referenceRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const savedInternshipRoutes = require('./routes/savedInternshipRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

// Security Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
        },
    },
    crossOriginEmbedderPolicy: false
}));

// CORS Configuration
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        error: 'Too many requests from this IP, please try again later.'
    }
});
app.use('/api/', limiter);

// Body Parsing Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is healthy ✅',
        timestamp: new Date().toISOString(),
        database: mongoose.connection.readyState === 1 ? 'Connected 🟢' : 'Disconnected 🔴',
        environment: process.env.NODE_ENV
    });
});

// Connect to MongoDB Atlas
connectDB();

// API Routes (Will be added later)
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/internships', internshipRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reference', referenceRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/students/saved', savedInternshipRoutes);
app.use('/api/notifications', notificationRoutes);

// 404 Handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found 🚫'
    });
});

// Global Error Handler
app.use((error, req, res, next) => {
    console.error('🔥 Error:', error);

    res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log('\n🚀 Server Starting...');
    console.log(`📍 Environment: ${process.env.NODE_ENV}`);
    console.log(`🌐 Server URL: ${process.env.SERVER_URL || `http://localhost:${PORT}`}`);
    console.log(`🔗 Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
    console.log(`🔄 Health Check: ${process.env.SERVER_URL || `http://localhost:${PORT}`}/api/health`);
    console.log(`⏰ Started at: ${new Date().toLocaleString()}\n`);
});