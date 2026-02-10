import sqlite3 from "sqlite3";

const db = new sqlite3.Database('./lebonprof.db');

// Function to create tables
function createTables() {
    // Create the Admins table
    db.run(
        `CREATE TABLE IF NOT EXISTS Admins (
                AdminID INTEGER PRIMARY KEY AUTOINCREMENT,
                UserName TEXT NOT NULL,
                Password TEXT NOT NULL
            )`,
        (err) => {
            if (err) {
                console.error('Error creating Admins table', err);
            } else {
                console.log('Admins table created or already exists');
            }
        }
    );

    // Create the Users table
    db.run(
        `CREATE TABLE IF NOT EXISTS Users (
                UserID INTEGER PRIMARY KEY AUTOINCREMENT,
                UserName TEXT NOT NULL,
                UserType TEXT CHECK(UserType IN ('Student', 'Professor')) NOT NULL,
                PhoneNumber TEXT
            )`,
        (err) => {
            if (err) {
                console.error('Error creating Users table', err);
            } else {
                console.log('Users table created or already exists');
            }
        }
    );

    // Create the Courses table
    db.run(
        `CREATE TABLE IF NOT EXISTS Courses (
            CourseID INTEGER PRIMARY KEY AUTOINCREMENT,
            CourseName TEXT NOT NULL,
            ProfessorID INTEGER,
            FOREIGN KEY (ProfessorID) REFERENCES Users(UserID) ON DELETE SET NULL
        )`,
        (err) => {
            if (err) {
                console.error('Error creating Courses table', err);
            } else {
                console.log('Courses table created or already exists');
            }
        }
    );

    // Create the Enrollments table
    db.run(
        `CREATE TABLE IF NOT EXISTS Enrollments (
                EnrollmentID INTEGER PRIMARY KEY AUTOINCREMENT,
                StudentID INTEGER NOT NULL,
                CourseID INTEGER NOT NULL,
                FOREIGN KEY (StudentID) REFERENCES Users(UserID),
                FOREIGN KEY (CourseID) REFERENCES Courses(CourseID)
            )`,
        (err) => {
            if (err) {
                console.error('Error creating Enrollments table', err);
            } else {
                console.log('Enrollments table created or already exists');
            }
        }
    );

    // Create the Tasks table
    db.run(
        `CREATE TABLE IF NOT EXISTS Tasks (
        TaskID INTEGER PRIMARY KEY AUTOINCREMENT,
        Description TEXT NOT NULL,
        Status INTEGER DEFAULT 0,
        CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
        (err) => {
            if (err) console.error('Error creating Tasks table', err);
            else console.log('Tasks table updated successfully');
        }
    );

    // Create the Sessions table
    db.run(
        `CREATE TABLE IF NOT EXISTS Sessions (
                SessionID INTEGER PRIMARY KEY AUTOINCREMENT,
                CourseID INTEGER,
                Title TEXT,
                WhiteboardContent TEXT,
                CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (CourseID) REFERENCES Courses(CourseID)
            )`,
        (err) => {
            if (err) {
                console.error('Error creating Sessions table', err);
            } else {
                console.log('Sessions table created or already exists');
            }
        }
    );

    // Create the Attendance table
    db.run(
        `CREATE TABLE IF NOT EXISTS Attendance (
                AttendanceID INTEGER PRIMARY KEY AUTOINCREMENT,
                CourseID INTEGER NOT NULL,
                StudentID INTEGER NOT NULL,
                Date DATE NOT NULL,
                Status TEXT DEFAULT 'Absent' CHECK(Status IN ('Present', 'Absent', 'Late')) NOT NULL,
                FOREIGN KEY (CourseID) REFERENCES Courses(CourseID),
                FOREIGN KEY (StudentID) REFERENCES Users(UserID)
            )`,
        (err) => {
            if (err) {
                console.error('Error creating Attendance table', err);
            } else {
                console.log('Attendance table created or already exists');
            }
        }
    );

    // Create the Payments table
    db.run(
        `CREATE TABLE IF NOT EXISTS Payments (
            PaymentID INTEGER PRIMARY KEY AUTOINCREMENT,
            CourseID INTEGER NOT NULL,
            StudentID INTEGER NOT NULL,
            Amount REAL NOT NULL,
            PaymentDate DATE DEFAULT CURRENT_DATE,
            Notes TEXT,
            ReceiptPDF TEXT,
            FOREIGN KEY (CourseID) REFERENCES Courses(CourseID),
            FOREIGN KEY (StudentID) REFERENCES Users(UserID)
        )`,
        (err) => {
            if (err) {
                console.error('Error creating Payments table', err);
            } else {
                console.log('Payments table created or already exists');
            }
        }
    );

    // Migration to add ReceiptPDF column if it doesn't exist
    db.run(`ALTER TABLE Payments ADD COLUMN ReceiptPDF TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
            console.error('Error adding ReceiptPDF column', err);
        } else {
            console.log('ReceiptPDF column checked/added');
        }
    });

}

// Helper function for database query with promise (SELECT/all)
const dbQuery = (query, params) => {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

// Helper function for database run with promise (INSERT/UPDATE/DELETE)
const dbRun = (query, params) => {
    return new Promise((resolve, reject) => {
        db.run(query, params, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(this);
            }
        });
    });
};

createTables();

export { db, dbQuery, dbRun };
