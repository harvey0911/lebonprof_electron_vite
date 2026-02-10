import express from 'express';
import { db } from '../db.js';

const router = express.Router();

router.post('/enrollstudent', async (req, res) => {
    const { courseId, selectedStudents } = req.body;

    if (!courseId || !selectedStudents || !Array.isArray(selectedStudents)) {
        return res.status(400).send('Missing or invalid enrollment details');
    }

    const enrollmentQuery = `INSERT INTO Enrollments (StudentID, CourseID) VALUES (?, ?)`;

    // Using a transaction to ensure all students are enrolled
    db.serialize(() => {
        db.run("BEGIN TRANSACTION");

        selectedStudents.forEach(studentId => {
            db.run(enrollmentQuery, [studentId, courseId], function (err) {
                if (err) {
                    console.error('Error enrolling student', err);
                    // If there's an error, respond and rollback the transaction
                    db.run("ROLLBACK");
                    return res.status(500).send('An error occurred while enrolling the students');
                }
            });
        });

        db.run("COMMIT", function (err) {
            if (err) {
                console.error('Error committing transaction', err);
                return res.status(500).send('An error occurred during enrollment');
            }

            console.log(`Students have been enrolled in Course ${courseId}`);
            res.status(201).send({ message: `Students have been enrolled in Course ${courseId}` });
        });
    });
});

// Updated route to remove a student from a course
router.put('/remove_from_course', async (req, res) => {
    const { UserID, CourseID } = req.body;

    try {
        // Validate input
        if (!UserID || !CourseID) {
            return res.status(400).json({ error: 'Both UserID and CourseID are required in the request body' });
        }

        // Execute SQL query to remove the student from the course
        const query = `DELETE FROM Enrollments WHERE StudentID = ? AND CourseID = ?`;

        db.run(query, [UserID, CourseID], function (err) {
            if (err) {
                console.error('Error removing student from course', err);
                res.status(500).json({ error: 'Internal Server Error' });
            } else {
                console.log(`Student with UserID ${UserID} removed from the course with CourseID ${CourseID}`);
                res.status(200).json({ message: 'Student removed from the course' });
            }
        });
    } catch (error) {
        console.error('Error in remove_from_course endpoint:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/fetchStudentsByCourse/:CourseID', (req, res) => {
    const { CourseID } = req.params;

    const query = `
            SELECT Users.UserID, Users.UserName, Users.PhoneNumber
            FROM Users 
            JOIN Enrollments ON Users.UserID = Enrollments.StudentID 
            WHERE Enrollments.CourseID = ?`;

    db.all(query, [CourseID], (err, students) => {
        if (err) {
            console.error('Error fetching students', err);
            res.status(500).send('An error occurred while fetching students');
        } else {
            res.status(200).send(students);
        }
    });
});

export default router;
