// insertSkills.js
const mongoose = require('mongoose');
const Skill = require('../models/Skill');

const skills = [
    { skill_name: "JavaScript", category: "Programming" },
    { skill_name: "Python", category: "Programming" },
    { skill_name: "Java", category: "Programming" },
    { skill_name: "C++", category: "Programming" },
    { skill_name: "React", category: "Frontend" },
    { skill_name: "Node.js", category: "Backend" },
    { skill_name: "Angular", category: "Frontend" },
    { skill_name: "Vue.js", category: "Frontend" },
    { skill_name: "Express.js", category: "Backend" },
    { skill_name: "Django", category: "Backend" },
    { skill_name: "Flask", category: "Backend" },
    { skill_name: "Spring Boot", category: "Backend" },
    { skill_name: "MySQL", category: "Database" },
    { skill_name: "MongoDB", category: "Database" },
    { skill_name: "PostgreSQL", category: "Database" },
    { skill_name: "SQL", category: "Database" },
    { skill_name: "AWS", category: "Cloud" },
    { skill_name: "Azure", category: "Cloud" },
    { skill_name: "Google Cloud", category: "Cloud" },
    { skill_name: "Docker", category: "DevOps" },
    { skill_name: "Kubernetes", category: "DevOps" },
    { skill_name: "Jenkins", category: "DevOps" },
    { skill_name: "Git", category: "Version Control" },
    { skill_name: "GitHub", category: "Version Control" },
    { skill_name: "GitLab", category: "Version Control" },
    { skill_name: "REST API", category: "Web Development" },
    { skill_name: "GraphQL", category: "Web Development" },
    { skill_name: "HTML5", category: "Frontend" },
    { skill_name: "CSS3", category: "Frontend" },
    { skill_name: "SASS", category: "Frontend" },
    { skill_name: "Bootstrap", category: "Frontend" },
    { skill_name: "Tailwind CSS", category: "Frontend" },
    { skill_name: "TypeScript", category: "Programming" },
    { skill_name: "PHP", category: "Programming" },
    { skill_name: "Ruby", category: "Programming" },
    { skill_name: "Swift", category: "Mobile Development" },
    { skill_name: "Kotlin", category: "Mobile Development" },
    { skill_name: "Flutter", category: "Mobile Development" },
    { skill_name: "React Native", category: "Mobile Development" },
    { skill_name: "Machine Learning", category: "AI/ML" },
    { skill_name: "Deep Learning", category: "AI/ML" },
    { skill_name: "TensorFlow", category: "AI/ML" },
    { skill_name: "PyTorch", category: "AI/ML" },
    { skill_name: "Data Analysis", category: "Data Science" },
    { skill_name: "Data Visualization", category: "Data Science" },
    { skill_name: "Tableau", category: "Data Science" },
    { skill_name: "Power BI", category: "Data Science" },
    { skill_name: "Cybersecurity", category: "Security" },
    { skill_name: "Network Security", category: "Security" },
    { skill_name: "Ethical Hacking", category: "Security" }
];

async function insertSkills() {
    try {
        await Skill.insertMany(skills);
        console.log('✅ 50 skills inserted successfully');
    } catch (error) {
        console.error('Error inserting skills:', error);
    }
}

module.exports = insertSkills;