import express from "express";
import cors from "cors";
import { db, dbReady } from './db.js';
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import userRoutes from './routes/users.js';
import courseRoutes from './routes/courses.js';
import enrollmentRoutes from './routes/enrollments.js';
import sessionRoutes from './routes/sessions.js';
import attendanceRoutes from './routes/attendance.js';
import paymentRoutes from './routes/payments.js';

const app = express();

const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: CORS_ORIGIN, credentials: true }))
app.use(express.json({ limit: '50mb' }));

app.use('/', authRoutes);
app.use('/', taskRoutes);
app.use('/', userRoutes);
app.use('/', courseRoutes);
app.use('/', enrollmentRoutes);
app.use('/', sessionRoutes);
app.use('/', attendanceRoutes);
app.use('/', paymentRoutes);

dbReady.then(() => {
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
}).catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
});
