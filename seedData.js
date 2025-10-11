// seedData.js
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/database');

const insertColleges = require('./seedData/insertColleges');
const insertSkills = require('./seedData/insertSkills');
const insertCategories = require('./seedData/insertCategories');
const insertBranches = require('./seedData/insertBranches');

async function seedDatabase() {
    try {
        // Connect to MongoDB
        await connectDB();
        
        console.log('🚀 Starting database seeding...\n');
        
        // Insert data in sequence
        await insertColleges();
        await insertSkills();
        await insertCategories();
        await insertBranches();
        
        console.log('\n✅ All data seeded successfully!');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

// Run the seeding script
seedDatabase();