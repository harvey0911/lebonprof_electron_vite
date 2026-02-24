import express from 'express';
import { db, dbRun } from '../db.js';

const router = express.Router();

// Endpoint to add a task
router.post('/addtask', (req, res) => {
    const { Description } = req.body;

    if (!Description) {
        return res.status(400).send('Missing description');
    }

    // Status defaults to 0 and CreatedAt defaults to CURRENT_TIMESTAMP in DB schema
    const query = `INSERT INTO Tasks (Description) VALUES (?)`;

    db.run(query, [Description], function (err) {
        if (err) {
            console.error('Error inserting task', err);
            res.status(500).send('An error occurred while adding the task');
        } else {
            res.status(201).send({ TaskID: this.lastID });
        }
    });
});

router.get('/fetchtask', (req, res) => {
    const query = `SELECT * FROM Tasks ORDER BY CreatedAt DESC`;

    db.all(query, [], (err, tasks) => {
        if (err) {
            console.error('Error fetching tasks', err);
            res.status(500).send('An error occurred');
        } else {
            res.status(200).send(tasks);
        }
    });
});

router.put('/updatetask/:taskId', (req, res) => {
    const { taskId } = req.params;
    const { Description, Status } = req.body;

    const query = `UPDATE Tasks SET Description = ?, Status = ? WHERE TaskID = ?`;

    db.run(query, [Description, Status, taskId], function (err) {
        if (err) {
            console.error('Error updating task', err);
            res.status(500).send('Error updating task');
        } else {
            res.status(200).send({ message: 'Task updated successfully' });
        }
    });
});

// Endpoint to delete a task
router.delete('/deletetask/:taskId', (req, res) => {
    const { taskId } = req.params;
    console.log("Delete request received for ID:", taskId);

    const query = `DELETE FROM Tasks WHERE TaskID = ?`;

    db.run(query, [taskId], function (err) {
        if (err) {
            console.error('Database Error:', err);
            res.status(500).send('Error');
        } else {
            console.log(`Rows affected: ${this.changes}`);
            res.status(200).send({ deletedTaskId: taskId });
        }
    });
});

export default router;
