const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema({
    educationType: { 
        type: String, 
        required: true,
        enum: ['School', 'Junior College', 'Diploma', 'Degree', 'Post Graduation']
    },
    institutionName: { 
        type: String, 
        required: true 
    },
    courseName: { 
        type: String, 
        required: true 
    },
    startYear: { 
        type: Number, 
        required: true, 
        min: 2000, 
        max: new Date().getFullYear() 
    },
    endYear: { 
        type: Number, 
        min: 2000 
    },
    isCurrentlyStudying: { 
        type: Boolean, 
        default: false 
    },
    currentYear: {
        type: Number,
        min: 1,
        description: 'Current year/semester if currently studying'
    },
    scoreType: {
        type: String,
        enum: ['Percentage', 'CGPA', 'Grade', null],
        default: null
    },
    scoreValue: {
        type: String,
        min: 0
    },
    boardOrUniversity: String,
    location: String,
    displayOrder: { 
        type: Number, 
        default: 0 
    }
}, {
    timestamps: true
});

const skillSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: String,
    proficiencyLevel: { 
        type: String, 
        enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
        default: 'Intermediate'
    }
});

const experienceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    companyName: String,
    description: String,
    startDate: { type: Date, required: true },
    endDate: Date,
    isCurrent: { type: Boolean, default: false }
});

const projectSchema = new mongoose.Schema({
    projectName: { type: String, required: true },
    description: String,
    startDate: Date,
    endDate: Date,
    projectUrl: String,
    technologies: [String]
});

const resumeSchema = new mongoose.Schema({
    resumeFile: { type: String, required: true },
    uploadDate: { type: Date, default: Date.now },
    isDefault: { type: Boolean, default: false }
});

const savedInternshipSchema = new mongoose.Schema({
    internship_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Internship',
        required: true
    },
    saved_date: {
        type: Date,
        default: Date.now
    }
});

const studentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    
    // Step 1: Basic Information
    sapId: { type: String, required: true, unique: true, uppercase: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    linkedin: { type: String, required: true, trim: true },
    github: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    phoneNumber: { type: String, required: true, match: /^[0-9]{10}$/ },
    alternateEmail: { type: String, lowercase: true },
    profilePicture: String,
    
    // Step 2: Education
    education: [educationSchema],
    
    // Step 3: Skills, Experience & Projects
    skills: [skillSchema],
    experiences: [experienceSchema],
    projects: [projectSchema],
    
    // Step 4: Resume
    resumes: [resumeSchema],
    
    // NEW: Saved Internships Array
    savedInternships: [savedInternshipSchema],
    
    // Registration Progress
    registrationStep: { 
        type: Number, 
        enum: [1, 2, 3, 4], 
        default: 1,
        required: true 
    },
    profileCompletion: { 
        type: Number, 
        min: 0, 
        max: 100, 
        default: 0 
    },
    isRegistrationComplete: { 
        type: Boolean, 
        default: false 
    }
}, { 
    timestamps: true 
});

// Calculate completion percentage
studentSchema.methods.calculateCompletion = function() {
    let completion = 0;
    
    // Step 1: Basic Info (25%)
    if (this.sapId && this.firstName && this.lastName && this.dateOfBirth && this.gender && this.phoneNumber) {
        completion += 25;
    }
    
    // Step 2: Education (25%)
    if (this.education && this.education.length > 0) {
        completion += 25;
    }
    
    // Step 3: Skills/Experience/Projects (25%)
    const hasStep3Data = (this.skills && this.skills.length > 0) || 
                         (this.experiences && this.experiences.length > 0) ||
                         (this.projects && this.projects.length > 0);
    if (hasStep3Data) {
        completion += 25;
    }
    
    // Step 4: Resume (25%)
    if (this.resumes && this.resumes.length > 0) {
        completion += 25;
    }
    
    return completion;
};

// Check if registration is complete
studentSchema.methods.checkRegistrationComplete = function() {
    return this.calculateCompletion() === 100;
};

// Check if internship is already saved
studentSchema.methods.isInternshipSaved = function(internshipId) {
    return this.savedInternships.some(saved => saved.internship_id.equals(internshipId));
};

// Add internship to saved list
studentSchema.methods.saveInternship = function(internshipId) {
    if (!this.isInternshipSaved(internshipId)) {
        this.savedInternships.push({
            internship_id: internshipId,
            saved_date: new Date()
        });
    }
};

// Remove internship from saved list
studentSchema.methods.unsaveInternship = function(internshipId) {
    this.savedInternships = this.savedInternships.filter(
        saved => !saved.internship_id.equals(internshipId)
    );
};

module.exports = mongoose.model('Student', studentSchema);