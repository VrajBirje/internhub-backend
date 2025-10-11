// insertCategories.js
const mongoose = require('mongoose');
const InternshipCategory = require('../models/InternshipCategory');

const categories = [
    { category_name: "Tech & Development", description: "Technology and software development internships" },
    { category_name: "Software Development", description: "Software engineering and development roles" },
    { category_name: "Web Development", description: "Web development and design internships" },
    { category_name: "Data Science/Analytics", description: "Data analysis and science internships" },
    { category_name: "Cloud Computing", description: "Cloud infrastructure and services internships" },
    { category_name: "Cybersecurity", description: "Information security and cybersecurity roles" },
    { category_name: "Artificial Intelligence (AI) / Machine Learning (ML)", description: "AI and ML development internships" },
    { category_name: "Mobile App Development", description: "Mobile application development roles" },
    { category_name: "DevOps Engineering", description: "DevOps and infrastructure roles" },
    { category_name: "Network Engineering", description: "Network infrastructure and engineering" },
    { category_name: "Database Administration", description: "Database management and administration" },
    { category_name: "User Experience (UX) / User Interface (UI) Design", description: "UX/UI design and research" },
    { category_name: "Quality Assurance (QA) / Software Testing", description: "Software testing and quality assurance" },
    { category_name: "Embedded Systems", description: "Embedded systems and hardware programming" },
    { category_name: "Robotics", description: "Robotics engineering and development" },
    { category_name: "Game Development", description: "Game design and development" },
    { category_name: "Internet of Things (IoT)", description: "IoT development and implementation" },
    { category_name: "Blockchain Development", description: "Blockchain technology and development" },
    { category_name: "IT Support", description: "IT support and helpdesk roles" },
    { category_name: "System Administration", description: "System administration and maintenance" },
    { category_name: "Technical Writing", description: "Technical documentation and writing" },
    { category_name: "Frontend Development", description: "Frontend web development" },
    { category_name: "Backend Development", description: "Backend server development" },
    { category_name: "Full-Stack Development", description: "Full-stack web development" },
    { category_name: "Bioinformatics", description: "Biological data analysis and computation" },
    { category_name: "Machine Learning Operations (MLOps)", description: "ML infrastructure and operations" },
    { category_name: "AR/VR Development", description: "Augmented and virtual reality development" },
    { category_name: "Cloud Security", description: "Cloud security and compliance" },
    { category_name: "Computer Vision", description: "Computer vision and image processing" },
    { category_name: "Quantum Computing", description: "Quantum computing research and development" },
    { category_name: "Site Reliability Engineering (SRE)", description: "SRE and infrastructure reliability" },
    { category_name: "Media", description: "Media and entertainment internships" },
    { category_name: "Journalism", description: "Journalism and reporting roles" },
    { category_name: "Public Relations (PR)", description: "Public relations and communications" },
    { category_name: "Social Media Management", description: "Social media marketing and management" },
    { category_name: "Content Creation", description: "Content creation and marketing" },
    { category_name: "Graphic Design", description: "Graphic design and visual arts" },
    { category_name: "Video Production", description: "Video production and editing" },
    { category_name: "Broadcasting", description: "Broadcasting and media production" },
    { category_name: "Digital Marketing", description: "Digital marketing and advertising" },
    { category_name: "Photography", description: "Photography and visual arts" },
    { category_name: "Advertising", description: "Advertising and marketing campaigns" },
    { category_name: "Business", description: "Business and management internships" },
    { category_name: "Accounting", description: "Accounting and finance roles" },
    { category_name: "Finance", description: "Financial analysis and banking" },
    { category_name: "Marketing", description: "Marketing and sales roles" },
    { category_name: "Human Resources (HR)", description: "Human resources and recruitment" },
    { category_name: "Sales", description: "Sales and business development" },
    { category_name: "Business Development", description: "Business growth and strategy" },
    { category_name: "Supply Chain Management", description: "Supply chain and logistics" },
    { category_name: "Project Management", description: "Project management and coordination" },
    { category_name: "Market Research", description: "Market analysis and research" },
    { category_name: "Operations Management", description: "Business operations management" },
    { category_name: "Healthcare", description: "Healthcare and medical internships" },
    { category_name: "Medical Assisting", description: "Medical assistance and support" },
    { category_name: "Pharmaceutical", description: "Pharmaceutical research and development" },
    { category_name: "Public Health", description: "Public health and community medicine" },
    { category_name: "Healthcare Administration", description: "Healthcare management and administration" },
    { category_name: "Physical Therapy Assisting", description: "Physical therapy support roles" },
    { category_name: "Dental Assisting", description: "Dental assistance and support" },
    { category_name: "Clinical Research", description: "Clinical trials and medical research" },
    { category_name: "Nutrition/Dietetics", description: "Nutrition and dietetics roles" },
    { category_name: "Biotechnology", description: "Biotechnology research and development" },
    { category_name: "Health Informatics", description: "Healthcare data and information systems" }
];

async function insertCategories() {
    try {
        await InternshipCategory.insertMany(categories);
        console.log('✅ 60 internship categories inserted successfully');
    } catch (error) {
        console.error('Error inserting categories:', error);
    }
}

module.exports = insertCategories;