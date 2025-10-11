const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const dbURI = process.env.MONGODB_URI;

        if (!dbURI) {
            throw new Error('MONGODB_ATLAS_URI is not defined in environment variables');
        }

        const conn = await mongoose.connect(dbURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        });

        console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);
        
    } catch (error) {
        console.error('❌ MongoDB Atlas connection error:', error.message);
        
        // Provide helpful error messages
        if (error.name === 'MongoNetworkError') {
            console.error('💡 Check your internet connection and MongoDB Atlas IP whitelist');
        } else if (error.name === 'MongooseServerSelectionError') {
            console.error('💡 Check your MongoDB Atlas connection string and cluster status');
        }
        
        process.exit(1);
    }
};

// MongoDB connection events
mongoose.connection.on('connected', () => {
    console.log('🔗 Mongoose connected to MongoDB Atlas');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('🔌 Mongoose disconnected from MongoDB Atlas');
});

// Graceful shutdown
process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        console.log('👋 Mongoose connection closed through app termination');
        process.exit(0);
    } catch (error) {
        console.error('Error closing MongoDB connection:', error);
        process.exit(1);
    }
});

module.exports = connectDB;