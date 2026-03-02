import express from 'express';
import { db } from '../db.js';

const router = express.Router();

router.post('/payments', (req, res) => {
    const { courseId, studentId, amount, date, notes, receiptPdf } = req.body;

    if (!courseId || !studentId || !amount) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = `INSERT INTO Payments (CourseID, StudentID, Amount, PaymentDate, Notes, ReceiptPDF) VALUES (?, ?, ?, ?, ?, ?)`;

    db.run(query, [courseId, studentId, amount, date || new Date().toISOString().split('T')[0], notes, receiptPdf], function (err) {
        if (err) {
            console.error('Error recording payment', err);
            res.status(500).json({ error: 'Failed to record payment' });
        } else {
            res.status(201).json({ message: 'Payment recorded successfully', paymentId: this.lastID });
        }
    });
});

router.get('/payments/:courseId', (req, res) => {
    const { courseId } = req.params;
    const { studentId } = req.query;

    let query = `
        SELECT p.*, u.UserName as StudentName
        FROM Payments p
        JOIN Users u ON p.StudentID = u.UserID
        WHERE p.CourseID = ?
    `;
    const params = [courseId];

    if (studentId) {
        query += ` AND p.StudentID = ?`;
        params.push(studentId);
    }

    query += ` ORDER BY p.PaymentDate DESC`;

    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('Error fetching payments', err);
            res.status(500).json({ error: 'Failed to fetch payments' });
        } else {
            res.status(200).json(rows);
        }
    });
});

router.get('/student-payments/:studentId', (req, res) => {
    const { studentId } = req.params;

    const query = `
        SELECT p.*, c.CourseName
        FROM Payments p
        JOIN Courses c ON p.CourseID = c.CourseID
        WHERE p.StudentID = ?
        ORDER BY p.PaymentDate DESC
    `;

    db.all(query, [studentId], (err, rows) => {
        if (err) {
            console.error('Error fetching student payments', err);
            res.status(500).json({ error: 'Failed to fetch student payments' });
        } else {
            res.status(200).json(rows);
        }
    });
});

export default router;
