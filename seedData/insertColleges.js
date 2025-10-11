// insertColleges.js
const mongoose = require('mongoose');
const College = require('../models/College');

const colleges = [
    { college_name: "Indian Institute of Technology, Bombay", college_code: "IITB", city: "Mumbai", state: "Maharashtra" },
    { college_name: "Institute of Chemical Technology", college_code: "ICT", city: "Mumbai", state: "Maharashtra" },
    { college_name: "Veermata Jijabai Technological Institute", college_code: "VJTI", city: "Mumbai", state: "Maharashtra" },
    { college_name: "Sardar Patel College of Engineering", college_code: "SPCE", city: "Mumbai", state: "Maharashtra" },
    { college_name: "Dwarkadas J. Sanghvi College of Engineering", college_code: "DJSCE", city: "Mumbai", state: "Maharashtra" },
    { college_name: "K.J. Somaiya College of Engineering", college_code: "KJSCE", city: "Mumbai", state: "Maharashtra" },
    { college_name: "Thadomal Shahani Engineering College", college_code: "TSEC", city: "Mumbai", state: "Maharashtra" },
    { college_name: "Fr. Conceicao Rodrigues College of Engineering", college_code: "CRCE", city: "Mumbai", state: "Maharashtra" },
    { college_name: "M.H. Saboo Siddik College of Engineering", college_code: "MHSSCE", city: "Mumbai", state: "Maharashtra" },
    { college_name: "Shah and Anchor Kutchhi Engineering College", college_code: "SAKEC", city: "Mumbai", state: "Maharashtra" },
    { college_name: "Datta Meghe College of Engineering", college_code: "DMCE", city: "Mumbai", state: "Maharashtra" },
    { college_name: "St. Francis Institute of Technology", college_code: "SFIT", city: "Mumbai", state: "Maharashtra" },
    { college_name: "Don Bosco Institute of Technology", college_code: "DBIT", city: "Mumbai", state: "Maharashtra" },
    { college_name: "Pillai College of Engineering", college_code: "PCE", city: "Mumbai", state: "Maharashtra" },
    { college_name: "Vidyalankar Institute of Technology", college_code: "VIT", city: "Mumbai", state: "Maharashtra" },
    { college_name: "Lokmanya Tilak College of Engineering", college_code: "LTCE", city: "Mumbai", state: "Maharashtra" },
    { college_name: "SIES Graduate School of Technology", college_code: "SIES", city: "Mumbai", state: "Maharashtra" },
    { college_name: "Terna Engineering College", college_code: "TEC", city: "Mumbai", state: "Maharashtra" },
    { college_name: "Padmashree Dr. D.Y. Patil Institute of Engineering and Technology", college_code: "DYPIET", city: "Mumbai", state: "Maharashtra" },
    { college_name: "Universal College of Engineering", college_code: "UCE", city: "Mumbai", state: "Maharashtra" },
    { college_name: "Mahatma Gandhi Mission's College of Engineering and Technology", college_code: "MGMCET", city: "Mumbai", state: "Maharashtra" },
    { college_name: "Shree L.R. Tiwari College of Engineering", college_code: "SLRTCE", city: "Mumbai", state: "Maharashtra" },
    { college_name: "Atharva College of Engineering", college_code: "ACE", city: "Mumbai", state: "Maharashtra" },
    { college_name: "A. C. Patil College of Engineering", college_code: "ACPCE", city: "Mumbai", state: "Maharashtra" },
    { college_name: "Ramrao Adik Institute of Technology", college_code: "RAIT", city: "Mumbai", state: "Maharashtra" },
    { college_name: "Rizvi College of Engineering", college_code: "RCOE", city: "Mumbai", state: "Maharashtra" },
    { college_name: "Viva Institute of Technology", college_code: "VIVA", city: "Mumbai", state: "Maharashtra" },
    { college_name: "Anjuman-I-Islam's M.H. Saboo Siddik College of Engineering", college_code: "AIMHSSCE", city: "Mumbai", state: "Maharashtra" },
    { college_name: "Vartak College of Engineering", college_code: "VARTAK", city: "Mumbai", state: "Maharashtra" },
    { college_name: "Agnel Polytechnic", college_code: "AGNEL", city: "Mumbai", state: "Maharashtra" },
    { college_name: "Mahavir Education Trust's Shah and Anchor Kutchhi Engineering College", college_code: "METS", city: "Mumbai", state: "Maharashtra" },
    { college_name: "Shri Bhagubhai Mafatlal Polytechnic", college_code: "SBMP", city: "Mumbai", state: "Maharashtra" },
    { college_name: "S.S.P.M.'s College of Engineering", college_code: "SSPM", city: "Mumbai", state: "Maharashtra" },
    { college_name: "Shri L.R. Tiwari College of Engineering", college_code: "SLRTCE", city: "Mumbai", state: "Maharashtra" },
    { college_name: "Vishwaniketan's Institute of Management Entrepreneurship and Engineering Technology", college_code: "VIMET", city: "Mumbai", state: "Maharashtra" },
    { college_name: "Mahatma Education Society's Pillai College of Engineering", college_code: "MESPCE", city: "Mumbai", state: "Maharashtra" },
    { college_name: "Vidyavardhini's College of Engineering and Technology", college_code: "VCET", city: "Mumbai", state: "Maharashtra" },
    { college_name: "B. V. College of Engineering", college_code: "BVCOE", city: "Mumbai", state: "Maharashtra" },
    { college_name: "Sanjivani College of Engineering", college_code: "SCOE", city: "Mumbai", state: "Maharashtra" },
    { college_name: "Rajendra Mane College of Engineering and Technology", college_code: "RMCET", city: "Mumbai", state: "Maharashtra" },
    { college_name: "Pashabhai Patel College of Engineering", college_code: "PPCE", city: "Mumbai", state: "Maharashtra" },
    { college_name: "Mahatma Gandhi Mission's College of Engineering and Technology, Kamothe", college_code: "MGMCETK", city: "Mumbai", state: "Maharashtra" },
    { college_name: "Vidyalankar School of Information Technology", college_code: "VSIT", city: "Mumbai", state: "Maharashtra" },
    { college_name: "Anjuman-I-Islam's Institute of Technology", college_code: "AIIT", city: "Mumbai", state: "Maharashtra" },
    { college_name: "St. John College of Engineering and Technology", college_code: "SJCET", city: "Mumbai", state: "Maharashtra" },
    { college_name: "M.G.M.'s College of Engineering & Technology", college_code: "MGMCET", city: "Mumbai", state: "Maharashtra" },
    { college_name: "Lokmanya Tilak College of Engineering, Koparkhairane", college_code: "LTCEK", city: "Mumbai", state: "Maharashtra" },
    { college_name: "Universal College of Engineering and Research", college_code: "UCER", city: "Mumbai", state: "Maharashtra" },
    { college_name: "Mahatma Gandhi Mission's College of Engineering and Technology, New Panvel", college_code: "MGMCETNP", city: "Mumbai", state: "Maharashtra" },
    { college_name: "Thakur College of Engineering and Technology", college_code: "TCET", city: "Mumbai", state: "Maharashtra" }
];

async function insertColleges() {
    try {
        await College.insertMany(colleges);
        console.log('✅ 50 colleges inserted successfully');
    } catch (error) {
        console.error('Error inserting colleges:', error);
    }
}

module.exports = insertColleges;