import express from 'express';
import { db, dbQuery, dbRun } from '../db.js';

const router = express.Router();

router.get('/fetchSessions/:courseId', async (req, res) => {
    const { courseId } = req.params;

    try {
        const query = `SELECT * FROM Sessions WHERE CourseID = ?`;
        const sessions = await dbQuery(query, [courseId]);

        res.status(200).json(sessions);
    } catch (error) {
        console.error('Error fetching sessions', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/addSession', async (req, res) => {
    const { courseId, title, description } = req.body;

    try {
        const query = `INSERT INTO Sessions (CourseID, Title, Description) VALUES (?, ?, ?)`;
        const result = await dbRun(query, [courseId, title, description]);

        res.status(201).json({ sessionId: result.lastID });
    } catch (error) {
        console.error('Error adding session', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.delete('/deleteSession/:sessionTitle', async (req, res) => {
    const { sessionTitle } = req.params;

    try {
        const query = `DELETE FROM Sessions WHERE Title = ?`;
        await dbRun(query, [sessionTitle]);

        res.status(200).json({ message: 'Session deleted successfully' });
    } catch (error) {
        console.error('Error deleting session', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.put('/updateSessionTitle/:courseId', (req, res) => {
    const { courseId } = req.params;
    const { oldTitle, newTitle } = req.body;

    if (!oldTitle || !newTitle) {
        return res.status(400).send('Missing old or new title');
    }

    const query = `UPDATE Sessions SET Title = ? WHERE CourseID = ? AND Title = ?`;

    db.run(query, [newTitle, courseId, oldTitle], function (err) {
        if (err) {
            console.error('Error updating session title', err);
            res.status(500).send('An error occurred while updating the session title');
        } else if (this.changes === 0) {
            res.status(404).send('Session not found or old title does not match');
        } else {
            console.log(`Session with CourseID ${courseId} has been updated`);
            res.status(200).send({ updatedCourseId: courseId });
        }
    });
});

export default router;
