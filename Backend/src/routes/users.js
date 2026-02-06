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

// Endpoint to fetch students not enrolled in a specific course
router.get('/fetch_Students_not_enrolled/:courseId', (req, res) => {
    const courseId = req.params.courseId;

    try {
        // Use SQL query to fetch students not enrolled in the specified course
        const query = `
                SELECT Users.*
                FROM Users
                LEFT JOIN Enrollments ON Users.UserID = Enrollments.StudentID AND Enrollments.CourseID = ?
                WHERE Enrollments.CourseID IS NULL AND Users.UserType = 'Student'
            `;

        // Execute the query
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

export default router;
