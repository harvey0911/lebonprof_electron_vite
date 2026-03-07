import sqlite3 from "sqlite3";
import bcrypt from "bcryptjs";

import path from 'node:path';

const isProd = process.env.NODE_ENV === 'production';
const dbFolder = process.env.USER_DATA_PATH || '.';
const dbPath = process.env.DB_PATH || path.join(dbFolder, 'lebonprof.db');

console.log('Using database at:', dbPath);
const db = new sqlite3.Database(dbPath);

async function createTables() {
    const run = (sql, params = []) => new Promise((resolve, reject) => {
        db.run(sql, params, (err) => err ? reject(err) : resolve());
    });

    const get = (sql, params = []) => new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => err ? reject(err) : resolve(row));
    });

    try {
        await run(`CREATE TABLE IF NOT EXISTS Admins (
            AdminID INTEGER PRIMARY KEY AUTOINCREMENT,
            UserName TEXT NOT NULL,
            Password TEXT NOT NULL
        )`);
        console.log('Admins table checked');

        const row = await get("SELECT COUNT(*) as count FROM Admins");
        if (row.count === 0) {
            const hashedPassword = await bcrypt.hash('admin', 10);
            await run("INSERT INTO Admins (UserName, Password) VALUES (?, ?)", ['admin', hashedPassword]);
            console.log('Default admin created');
        }

        await run(`CREATE TABLE IF NOT EXISTS Users (
            UserID INTEGER PRIMARY KEY AUTOINCREMENT,
            UserName TEXT NOT NULL,
            UserType TEXT CHECK(UserType IN ('Student', 'Professor')) NOT NULL,
            PhoneNumber TEXT
        )`);

        await run(`CREATE TABLE IF NOT EXISTS Courses (
            CourseID INTEGER PRIMARY KEY AUTOINCREMENT,
            CourseName TEXT NOT NULL,
            ProfessorID INTEGER,
            FOREIGN KEY (ProfessorID) REFERENCES Users(UserID) ON DELETE SET NULL
        )`);

        await run(`CREATE TABLE IF NOT EXISTS Enrollments (
            EnrollmentID INTEGER PRIMARY KEY AUTOINCREMENT,
            StudentID INTEGER NOT NULL,
            CourseID INTEGER NOT NULL,
            FOREIGN KEY (StudentID) REFERENCES Users(UserID),
            FOREIGN KEY (CourseID) REFERENCES Courses(CourseID)
        )`);

        await run(`CREATE TABLE IF NOT EXISTS Tasks (
            TaskID INTEGER PRIMARY KEY AUTOINCREMENT,
            Description TEXT NOT NULL,
            Status INTEGER DEFAULT 0,
            CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        await run(`CREATE TABLE IF NOT EXISTS Sessions (
            SessionID INTEGER PRIMARY KEY AUTOINCREMENT,
            CourseID INTEGER,
            Title TEXT,
            Description TEXT,
            CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (CourseID) REFERENCES Courses(CourseID)
        )`);

        const columns = await new Promise((resolve) => db.all("PRAGMA table_info(Sessions)", (err, rows) => resolve(rows || [])));
        const hasWhiteboard = columns.some(row => row.name === 'WhiteboardContent');
        const hasDescription = columns.some(row => row.name === 'Description');
        if (hasWhiteboard && !hasDescription) {
            await run("ALTER TABLE Sessions RENAME COLUMN WhiteboardContent TO Description");
            console.log('Sessions table migrated');
        }

        await run(`CREATE TABLE IF NOT EXISTS Attendance (
            AttendanceID INTEGER PRIMARY KEY AUTOINCREMENT,
            CourseID INTEGER NOT NULL,
            StudentID INTEGER NOT NULL,
            Date DATE NOT NULL,
            Status TEXT DEFAULT 'Absent' CHECK(Status IN ('Present', 'Absent', 'Late')) NOT NULL,
            FOREIGN KEY (CourseID) REFERENCES Courses(CourseID),
            FOREIGN KEY (StudentID) REFERENCES Users(UserID)
        )`);

        await run(`CREATE TABLE IF NOT EXISTS Payments (
            PaymentID INTEGER PRIMARY KEY AUTOINCREMENT,
            CourseID INTEGER NOT NULL,
            StudentID INTEGER NOT NULL,
            Amount REAL NOT NULL,
            PaymentDate DATE DEFAULT CURRENT_DATE,
            Notes TEXT,
            ReceiptPDF TEXT,
            FOREIGN KEY (CourseID) REFERENCES Courses(CourseID),
            FOREIGN KEY (StudentID) REFERENCES Users(UserID)
        )`);

        try {
            await run(`ALTER TABLE Payments ADD COLUMN ReceiptPDF TEXT`);
        } catch (e) {
        }

        console.log('All tables verified/created');
    } catch (err) {
        console.error('Database initialization error:', err);
    }
}

const dbQuery = (query, params) => {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
};

const dbRun = (query, params) => {
    return new Promise((resolve, reject) => {
        db.run(query, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
};

const dbReady = createTables();

export { db, dbQuery, dbRun, dbReady };
