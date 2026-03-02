import express from 'express';
import { db } from '../db.js';

const router = express.Router();

router.post('/adduser', (req, res) => {
    const { UserName, UserType, PhoneNumber } = req.body;

    if (!UserName || !UserType || !PhoneNumber) {
        return res.status(400).send('Missing user details');
    }

    const query = `INSERT INTO Users (UserName, UserType, PhoneNumber) VALUES (?, ?, ?)`;

    db.run(query, [UserName, UserType, PhoneNumber], function (err) {
        if (err) {
            console.error('Error adding user', err);
            res.status(500).send('An error occurred while adding the user');
        } else {
            console.log(`A user has been added with UserID ${this.lastID}`);
            res.status(201).send({ UserID: this.lastID });
        }
    });
});

router.delete('/deleteuser/:UserID', (req, res) => {
    const { UserID } = req.params;

    const query = `DELETE FROM Users WHERE UserID = ?`;

    db.run(query, [UserID], function (err) {
        if (err) {
            console.error('Error deleting user', err);
            res.status(500).send('An error occurred while deleting the user');
        } else {
            console.log(`User with UserID ${UserID} has been deleted`);
            res.status(200).send({ deletedUserID: UserID });
        }
    });
});

router.get('/fetchstudents', (req, res) => {
    const query = `SELECT * FROM Users WHERE UserType = 'Student'`;

    db.all(query, [], (err, students) => {
        if (err) {
            console.error('Error fetching students', err);
            res.status(500).send('An error occurred while fetching students');
        } else {
            console.log(`Fetched ${students.length} students`);
            res.status(200).send(students);
        }
    });
});

router.get('/fetchprofessors', (req, res) => {
    const query = `SELECT * FROM Users WHERE UserType = 'Professor'`;

    db.all(query, [], (err, professors) => {
        if (err) {
            console.error('Error fetching professors', err);
            res.status(500).send('An error occurred while fetching professors');
        } else {
            console.log(`Fetched ${professors.length} professors`);
            res.status(200).send(professors);
        }
    });
});

router.get('/fetch_Students_not_enrolled/:courseId', (req, res) => {
    const courseId = req.params.courseId;

    try {
        const query = `
                SELECT Users.*
                FROM Users
                LEFT JOIN Enrollments ON Users.UserID = Enrollments.StudentID AND Enrollments.CourseID = ?
                WHERE Enrollments.CourseID IS NULL AND Users.UserType = 'Student'
            `;

        db.all(query, [courseId], (err, students) => {
            if (err) {
                console.error('Error fetching students not enrolled:', err);
                res.status(500).json({ error: 'Internal Server Error' });
            } else {
                res.json(students);
            }
        });
    } catch (error) {
        console.error('Error in fetch_Students_not_enrolled endpoint:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/student-profile/:studentId', (req, res) => {
    const studentId = req.params.studentId;

    const studentQuery = `SELECT * FROM Users WHERE UserID = ? AND UserType = 'Student'`;
    const coursesQuery = `
        SELECT c.CourseID, c.CourseName, 
               (SELECT COUNT(*) FROM Sessions s WHERE s.CourseID = c.CourseID) as TotalSessions,
               (SELECT COUNT(*) FROM Attendance a WHERE a.CourseID = c.CourseID AND a.StudentID = ? AND a.Status = 'Present') as PresentSessions,
               (SELECT SUM(Amount) FROM Payments p WHERE p.CourseID = c.CourseID AND p.StudentID = ?) as TotalPaid
        FROM Courses c
        JOIN Enrollments e ON c.CourseID = e.CourseID
        WHERE e.StudentID = ?
    `;

    db.get(studentQuery, [studentId], (err, student) => {
        if (err) {
            console.error('Error fetching student profile', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        db.all(coursesQuery, [studentId, studentId, studentId], (err, courses) => {
            if (err) {
                console.error('Error fetching student courses', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            const totalpaid = courses.reduce((sum, c) => sum + (c.TotalPaid || 0), 0);

            res.json({
                student,
                courses,
                stats: {
                    totalCourses: courses.length,
                    totalPaid: totalpaid
                }
            });
        });
    });
});

export default router;
