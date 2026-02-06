import express from "express";
import cors from "cors";
import { db } from './db.js'; // Importing db triggers table creation
import taskRoutes from './routes/tasks.js';
import userRoutes from './routes/users.js';
import courseRoutes from './routes/courses.js';
import enrollmentRoutes from './routes/enrollments.js';
import sessionRoutes from './routes/sessions.js';
import attendanceRoutes from './routes/attendance.js';

const app = express();

// Middleware to parse JSON
app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.json());

// Routes
app.use('/', taskRoutes);
app.use('/', userRoutes);
app.use('/', courseRoutes);
app.use('/', enrollmentRoutes);
app.use('/', sessionRoutes);
app.use('/', attendanceRoutes);

// Start the server
app.listen(5000, () => console.log("Server is running on port 5000"));
