-- InternHub database schema (MySQL)
SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE TABLE IF NOT EXISTS Users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    user_type ENUM('superadmin', 'student', 'company') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    reset_token VARCHAR(255) NULL,
    reset_token_expiry TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS Superadmins (
    superadmin_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    contact_number VARCHAR(20),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS Students (
    student_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    sap_id VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    date_of_birth DATE,
    gender ENUM('Male', 'Female', 'Other'),
    profile_picture VARCHAR(255),
    phone_number VARCHAR(20),
    alternate_email VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS Colleges (
    college_id INT PRIMARY KEY AUTO_INCREMENT,
    college_name VARCHAR(100) NOT NULL,
    college_code VARCHAR(20) UNIQUE,
    address TEXT,
    city VARCHAR(50),
    state VARCHAR(50),
    country VARCHAR(50) DEFAULT 'India',
    pincode VARCHAR(10)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS Branches (
    branch_id INT PRIMARY KEY AUTO_INCREMENT,
    branch_name VARCHAR(100) NOT NULL,
    branch_code VARCHAR(20) UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS Student_Education (
    education_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    college_id INT NOT NULL,
    branch_id INT NOT NULL,
    enrollment_year INT NOT NULL,
    graduation_year INT NOT NULL,
    current_semester INT,
    cgpa DECIMAL(3,2),
    FOREIGN KEY (student_id) REFERENCES Students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (college_id) REFERENCES Colleges(college_id),
    FOREIGN KEY (branch_id) REFERENCES Branches(branch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS Skills (
    skill_id INT PRIMARY KEY AUTO_INCREMENT,
    skill_name VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS Student_Skills (
    student_skill_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    skill_id INT NOT NULL,
    proficiency_level ENUM('Beginner', 'Intermediate', 'Advanced', 'Expert'),
    FOREIGN KEY (student_id) REFERENCES Students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES Skills(skill_id),
    UNIQUE (student_id, skill_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS Student_Experience (
    experience_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    company_name VARCHAR(100),
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (student_id) REFERENCES Students(student_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS Student_Projects (
    project_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    project_name VARCHAR(100) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    project_url VARCHAR(255),
    FOREIGN KEY (student_id) REFERENCES Students(student_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS Student_Resumes (
    resume_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    resume_file VARCHAR(255) NOT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_default BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (student_id) REFERENCES Students(student_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS Companies (
    company_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    company_name VARCHAR(100) NOT NULL,
    description TEXT,
    industry VARCHAR(100),
    website_url VARCHAR(255),
    founded_year INT,
    company_size ENUM('1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5001-10000', '10000+'),
    logo_url VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by INT,
    verification_date TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES Superadmins(superadmin_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS Company_Addresses (
    address_id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,
    address_type ENUM('Headquarters', 'Office', 'Other') DEFAULT 'Headquarters',
    address_line1 VARCHAR(100) NOT NULL,
    address_line2 VARCHAR(100),
    city VARCHAR(50) NOT NULL,
    state VARCHAR(50) NOT NULL,
    country VARCHAR(50) DEFAULT 'India',
    pincode VARCHAR(10) NOT NULL,
    is_primary BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (company_id) REFERENCES Companies(company_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS Company_Contacts (
    contact_id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,
    contact_name VARCHAR(100) NOT NULL,
    designation VARCHAR(100),
    email VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    is_primary BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (company_id) REFERENCES Companies(company_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS Internship_Categories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS Internships (
    internship_id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    category_id INT,
    skills_required TEXT,
    responsibilities TEXT,
    perks TEXT,
    who_can_apply TEXT,
    number_of_openings INT,
    is_active BOOLEAN DEFAULT TRUE,
    posted_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    application_deadline DATE,
    created_by INT NOT NULL,
    approved_by INT,
    approval_status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    approval_date TIMESTAMP NULL,
    FOREIGN KEY (company_id) REFERENCES Companies(company_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES Internship_Categories(category_id),
    FOREIGN KEY (created_by) REFERENCES Users(user_id),
    FOREIGN KEY (approved_by) REFERENCES Superadmins(superadmin_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS Internship_Locations (
    location_id INT PRIMARY KEY AUTO_INCREMENT,
    internship_id INT NOT NULL,
    location_type ENUM('Remote', 'On-site', 'Hybrid') NOT NULL,
    address_id INT NULL,
    FOREIGN KEY (internship_id) REFERENCES Internships(internship_id) ON DELETE CASCADE,
    FOREIGN KEY (address_id) REFERENCES Company_Addresses(address_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS Internship_Stipend (
    stipend_id INT PRIMARY KEY AUTO_INCREMENT,
    internship_id INT NOT NULL,
    is_paid BOOLEAN NOT NULL,
    min_amount DECIMAL(10,2),
    max_amount DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'INR',
    stipend_period ENUM('Per Month', 'Per Week', 'One-time', 'Performance Based'),
    FOREIGN KEY (internship_id) REFERENCES Internships(internship_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS Internship_Duration (
    duration_id INT PRIMARY KEY AUTO_INCREMENT,
    internship_id INT NOT NULL,
    duration_value INT NOT NULL,
    duration_unit ENUM('Days', 'Weeks', 'Months') NOT NULL,
    start_date_type ENUM('Immediately', 'Fixed Date', 'Flexible'),
    fixed_start_date DATE NULL,
    FOREIGN KEY (internship_id) REFERENCES Internships(internship_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS Applications (
    application_id INT PRIMARY KEY AUTO_INCREMENT,
    internship_id INT NOT NULL,
    student_id INT NOT NULL,
    resume_id INT NOT NULL,
    cover_letter TEXT,
    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Rejected', 'Offer Extended', 'Accepted', 'Withdrawn') DEFAULT 'Applied',
    status_updated_on TIMESTAMP NULL,
    notes TEXT,
    FOREIGN KEY (internship_id) REFERENCES Internships(internship_id),
    FOREIGN KEY (student_id) REFERENCES Students(student_id),
    FOREIGN KEY (resume_id) REFERENCES Student_Resumes(resume_id),
    UNIQUE (internship_id, student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS Application_Status_History (
    history_id INT PRIMARY KEY AUTO_INCREMENT,
    application_id INT NOT NULL,
    status ENUM('Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Rejected', 'Offer Extended', 'Accepted', 'Withdrawn') NOT NULL,
    changed_by_type ENUM('System', 'Student', 'Company', 'Admin') NOT NULL,
    changed_by_id INT NOT NULL,
    change_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (application_id) REFERENCES Applications(application_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS Saved_Internships (
    saved_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    internship_id INT NOT NULL,
    saved_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES Students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (internship_id) REFERENCES Internships(internship_id) ON DELETE CASCADE,
    UNIQUE (student_id, internship_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS Notifications (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notification_type ENUM('Application', 'Interview', 'System', 'Promotional') NOT NULL,
    related_entity_type VARCHAR(50),
    related_entity_id INT,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS System_Logs (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    details TEXT,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_students_sap_id ON Students(sap_id);
CREATE INDEX idx_applications_student ON Applications(student_id);
CREATE INDEX idx_applications_internship ON Applications(internship_id);
CREATE INDEX idx_applications_status ON Applications(status);
CREATE INDEX idx_internships_company ON Internships(company_id);
CREATE INDEX idx_internships_status ON Internships(approval_status);
CREATE INDEX idx_notifications_user ON Notifications(user_id);
CREATE INDEX idx_notifications_read ON Notifications(is_read);
