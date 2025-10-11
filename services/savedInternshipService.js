const Student = require('../models/Student');
const Internship = require('../models/Internship');

class SavedInternshipService {
    // Save internship for student
    static async saveInternship(studentId, internshipId) {
        const student = await Student.findById(studentId);
        if (!student) throw new Error('Student not found');

        // Check if internship exists
        const internship = await Internship.findById(internshipId);
        if (!internship) throw new Error('Internship not found');

        // Check if already saved
        if (student.isInternshipSaved(internshipId)) {
            throw new Error('Internship already saved');
        }

        student.saveInternship(internshipId);
        await student.save();

        return { message: 'Internship saved successfully' };
    }

    // Get student's saved internships
    static async getSavedInternships(studentId, page = 1, limit = 10) {
        const student = await Student.findById(studentId)
            .populate({
                path: 'savedInternships.internship_id',
                select: 'title company_id description location stipend application_deadline',
                populate: {
                    path: 'company_id',
                    select: 'companyName logoUrl'
                }
            });

        if (!student) throw new Error('Student not found');

        const savedInternships = student.savedInternships;
        const total = savedInternships.length;

        // Manual pagination
        const skip = (page - 1) * limit;
        const paginatedInternships = savedInternships
            .sort((a, b) => new Date(b.saved_date) - new Date(a.saved_date))
            .slice(skip, skip + limit);

        return {
            savedInternships: paginatedInternships,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }

    // Remove saved internship
    static async removeSavedInternship(studentId, internshipId) {
        const student = await Student.findById(studentId);
        if (!student) throw new Error('Student not found');

        if (!student.isInternshipSaved(internshipId)) {
            throw new Error('Internship not found in saved list');
        }

        student.unsaveInternship(internshipId);
        await student.save();

        return { message: 'Internship removed from saved list' };
    }

    // Check if internship is saved
    static async checkIfSaved(studentId, internshipId) {
        const student = await Student.findById(studentId);
        if (!student) throw new Error('Student not found');

        return {
            isSaved: student.isInternshipSaved(internshipId)
        };
    }
}

module.exports = SavedInternshipService;