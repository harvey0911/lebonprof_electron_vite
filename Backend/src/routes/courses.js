import express from 'express';
import { db } from '../db.js';

const router = express.Router();

router.get('/fetchCourses', (req, res) => {
    const query = `SELECT * FROM Courses`;

    db.all(query, [], (err, courses) => {
        if (err) {
            console.error('Error fetching Courses', err);
            res.status(500).send('An error occurred while fetching Courses');
        } else {
            console.log(`Fetched ${courses.length} courses`);
            res.status(200).send(courses);
        }
    });
});

router.post('/addcourse', (req, res) => {
    // Extracting CourseName and ProfessorID from the request body
    const { CourseName, ProfessorID } = req.body;

    // Validate the input
    if (!CourseName || !ProfessorID) {
        return res.status(400).send('Missing course details');
    }

    // Prepare your SQL query to insert a new course
    const courseQuery = `INSERT INTO Courses (CourseName, ProfessorID) VALUES (?, ?)`;

    // Execute the query against your database
    db.run(courseQuery, [CourseName, ProfessorID], function (err) {
        if (err) {
            // If an error occurs, log it and return a 500 error to the client
            console.error('Error adding course', err);
            return res.status(500).send('An error occurred while adding the course');
        }

        // If the query was successful, use 'this.lastID' to get the ID of the newly inserted course
        console.log(`A course has been added with CourseID ${this.lastID}`);

        // Return the CourseID of the newly created course to the client
        res.status(201).send({ CourseID: this.lastID });
    });
});

router.delete('/deletecourse/:CourseID', (req, res) => {
    const { CourseID } = req.params;

    const query = `DELETE FROM Courses WHERE CourseID = ?`;

    db.run(query, [CourseID], function (err) {
        if (err) {
            console.error('Error deleting course', err);
            res.status(500).send('An error occurred while deleting the course');
        } else {
            console.log(`Course with CourseID ${CourseID} has been deleted`);
            res.status(200).send({ deletedCourseID: CourseID });
        }
    });
});

// Endpoint to update a course
router.put('/updatecourse/:CourseID', (req, res) => {
    const { CourseID } = req.params;
    const { CourseName } = req.body;

    if (!CourseName) {
        return res.status(400).send('Missing CourseName');
    }

    const query = `UPDATE Courses SET CourseName = ? WHERE CourseID = ?`;

    db.run(query, [CourseName, CourseID], function (err) {
        if (err) {
            console.error('Error updating course', err);
            res.status(500).send('An error occurred while updating the course');
        } else {
            console.log(`Course with CourseID ${CourseID} has been updated`);
            res.status(200).send({ message: 'Course updated successfully' });
        }
    });
});

router.get('/fetchCourse/:CourseID', (req, res) => {
    const { CourseID } = req.params;

    const query = `SELECT CourseName FROM Courses WHERE CourseID = ?`;

    db.get(query, [CourseID], (err, course) => {
        if (err) {
            console.error('Error fetching course', err);
            res.status(500).send('An error occurred while fetching the course');
        } else if (course) {
            res.status(200).send(course);
        } else {
            res.status(404).send('Course not found');
        }
    });
});

router.get('/fetchProfessorByCourse/:CourseID', (req, res) => {
    const { CourseID } = req.params;

    const query = `
            SELECT Users.UserID, Users.UserName 
            FROM Users 
            JOIN Courses ON Users.UserID = Courses.ProfessorID 
            WHERE Courses.CourseID = ? AND Users.UserType = 'Professor'`;

    db.get(query, [CourseID], (err, professor) => {
        if (err) {
            console.error('Error fetching professor', err);
            res.status(500).send('An error occurred while fetching the professor');
        } else if (professor) {
            res.status(200).send(professor);
        } else {
            res.status(404).send('Professor not found for the given course');
        }
    });
});

export default router;
