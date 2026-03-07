import express from 'express';
import bcrypt from 'bcryptjs';
import { db, dbQuery, dbRun } from '../db.js';

const router = express.Router();

router.post('/login', async (req, res) => {
    const { password } = req.body;

    if (!password) {
        return res.status(400).json({ error: 'Password is required' });
    }

    try {
        const admin = await new Promise((resolve, reject) => {
            db.get("SELECT * FROM Admins LIMIT 1", [], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (!admin) {
            return res.status(500).json({ error: 'No admin account found' });
        }

        const match = await bcrypt.compare(password, admin.Password);
        if (match) {
            res.json({ success: true, message: 'Logged in successfully' });
        } else {
            res.status(401).json({ error: 'Invalid password' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/change-password', async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        return res.status(400).json({ error: 'Missing password details' });
    }

    try {
        const admin = await new Promise((resolve, reject) => {
            db.get("SELECT * FROM Admins LIMIT 1", [], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        const match = await bcrypt.compare(oldPassword, admin.Password);
        if (!match) {
            return res.status(401).json({ error: 'Incorrect old password' });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await dbRun("UPDATE Admins SET Password = ? WHERE AdminID = ?", [hashedNewPassword, admin.AdminID]);

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/clear-data', async (req, res) => {
    const { password } = req.body;

    if (!password) {
        return res.status(400).json({ error: 'Password required' });
    }

    try {
        const admin = await new Promise((resolve, reject) => {
            db.get("SELECT * FROM Admins LIMIT 1", [], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        const match = await bcrypt.compare(password, admin.Password);
        if (!match) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        const tables = ['Attendance', 'Payments', 'Sessions', 'Enrollments', 'Courses', 'Users', 'Tasks'];

        for (const table of tables) {
            await dbRun(`DELETE FROM ${table}`);
            await dbRun(`DELETE FROM sqlite_sequence WHERE name = ?`, [table]);
        }

        res.json({ success: true, message: 'All data cleared successfully' });
    } catch (error) {
        console.error('Clear data error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
