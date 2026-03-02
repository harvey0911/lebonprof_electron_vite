import express from 'express';
import { db, dbRun, dbQuery } from '../db.js';

const router = express.Router();

router.post('/saveAttendance', async (req, res) => {
    try {
        const attendanceData = req.body;

        const insertAttendanceQuery = `INSERT INTO Attendance (studentId, courseId, date, status) VALUES (?, ?, ?, ?)`;

        for (const record of attendanceData) {
            await dbRun(insertAttendanceQuery, [
                record.studentId,
                record.courseId,
                record.date,
                record.status
            ]);
        }

        res.status(200).json({ message: 'Attendance saved successfully' });
    } catch (error) {
        console.error('Error saving attendance:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/fetchAttendanceData/:courseId/:date', async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const date = req.params.date;

        const fetchAttendanceQuery = `
                SELECT 
                    s.UserID,
                    s.UserName,
                    a.status
                FROM 
                    Users s
                INNER JOIN 
                    Enrollments e ON s.UserID = e.studentId
                LEFT JOIN 
                    Attendance a ON s.UserID = a.studentId AND a.date = ?
                WHERE 
                    e.courseId = ?
            `;

        const attendanceData = await dbQuery(fetchAttendanceQuery, [date, courseId]);

        res.status(200).json(attendanceData);
    } catch (error) {
        console.error('Error fetching attendance data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/fetchStudentsStatus/:courseId', async (req, res) => {
    const { courseId } = req.params;
    const { date } = req.query;

    console.log('Received courseId:', courseId);
    console.log('Received date:', date);

    try {
        const attendanceQuery = `
                SELECT *
                FROM Attendance
                WHERE CourseID = ? AND Date = ?`;

        const attendanceRecords = await dbQuery(attendanceQuery, [courseId, date]);

        let studentsWithAttendanceStatus;

        if (attendanceRecords.length === 0) {
            const allStudentsQuery = `
                    SELECT Users.UserID, Users.UserName, 'Absent' as Status
                    FROM Users
                    JOIN Enrollments ON Users.UserID = Enrollments.StudentID
                    WHERE Enrollments.CourseID = ?`;

            studentsWithAttendanceStatus = await dbQuery(allStudentsQuery, [courseId]);
            console.log('Students with attendance status in case of empty attendance records:', studentsWithAttendanceStatus);
        } else {
            const studentsQuery = `
                    SELECT Users.UserID, Users.UserName, Attendance.Status
                    FROM Users
                    JOIN Attendance ON Users.UserID = Attendance.StudentID
                    WHERE Attendance.CourseID = ? AND Attendance.Date = ?`;

            studentsWithAttendanceStatus = await dbQuery(studentsQuery, [courseId, date]);
            console.log('Students with attendance status when attendance records are present:', studentsWithAttendanceStatus);
        }

        res.status(200).json(studentsWithAttendanceStatus);
    } catch (error) {
        console.error('Error fetching students with attendance status', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/student-attendance/:studentId', (req, res) => {
    const { studentId } = req.params;

    const query = `
        SELECT a.*, c.CourseName
        FROM Attendance a
        JOIN Courses c ON a.CourseID = c.CourseID
        WHERE a.StudentID = ? AND a.Status = 'Present'
        ORDER BY a.Date DESC
    `;

    db.all(query, [studentId], (err, rows) => {
        if (err) {
            console.error('Error fetching student attendance', err);
            res.status(500).json({ error: 'Failed to fetch student attendance' });
        } else {
            res.status(200).json(rows);
        }
    });
});

export default router;
