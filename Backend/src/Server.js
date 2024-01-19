import express from "express";
import sqlite3 from "sqlite3";
import cors from "cors";

const app = express();
const dbconnection = new sqlite3.Database('./lebonprof.db');

// Middleware to parse JSON
app.use(cors({origin:'http://localhost:5173',credentials: true}))
app.use(express.json());


// Function to create tables
function createTables() {
    // Create the Users table
    dbconnection.run(
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

dbconnection.run(
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
    dbconnection.run(
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
    dbconnection.run(
        `CREATE TABLE IF NOT EXISTS Tasks (
            TaskID INTEGER PRIMARY KEY AUTOINCREMENT,
            TaskName TEXT NOT NULL,
            Description TEXT NOT NULL,
            TaskDate DATE
        )`,
        (err) => {
            if (err) {
                console.error('Error creating Tasks table', err);
            } else {
                console.log('Tasks table created or already exists');
            }
        }
    );
}

// Endpoint to add a task
app.post('/addtask', (req, res) => {
    const { TaskName, Description } = req.body;  // Removed taskDate from the destructuring

    // Ensure all required fields are provided
    if (!TaskName || !Description) {
        return res.status(400).send('Missing task name or description');
    }

    // Prepare the SQL query to insert the task without a date
    const query = `INSERT INTO Tasks (TaskName, Description, TaskDate) VALUES (?, ?, NULL)`;

    try {
        dbconnection.run(query, [TaskName, Description], function (err) {
            if (err) {
                // Log the error and send a server error response
                console.error('Error inserting task', err);
                res.status(500).send('An error occurred while adding the task');
            } else {
                // If successful, send back the ID of the newly created task
                console.log(`A task has been inserted with TaskID ${this.lastID}`);
                res.status(201).send({ taskId: this.lastID });
            }
        });
    } catch (error) {
        // Catch any unexpected errors and send a server error response
        console.error('Unexpected error', error);
        res.status(500).send('An unexpected error occurred');
    }
});



app.get('/fetchtask', (req, res) => {
    // Prepare the SQL query to fetch all tasks
    const query = `SELECT * FROM Tasks`;

    // Execute the query to get all tasks
    dbconnection.all(query, [], (err, tasks) => {
        if (err) {
            // Log the error and send a server error response
            console.error('Error fetching tasks', err);
            res.status(500).send('An error occurred while fetching tasks');
        } else {
            // If successful, send back all the tasks
            console.log(`Fetched ${tasks.length} tasks`);
            res.status(200).send(tasks);
        }
    });
});



// Endpoint to delete a task
app.delete('/deletetask/:taskId', (req, res) =>{ // Include :taskId in the route
    const { taskId } = req.params; // This should match the parameter in the route

    const query = `DELETE FROM Tasks WHERE TaskID = ?`;

    dbconnection.run(query, [taskId], function(err) {
        if (err) {
            console.error('Error deleting task', err);
            res.status(500).send('An error occurred while deleting the task');
        } else {
            console.log(`Task with TaskID ${taskId} has been deleted`);
            res.status(200).send({ deletedTaskId: taskId });
        }
    });
});




app.get('/fetchstudents', (req, res) => {
    const query = `SELECT * FROM Users WHERE UserType = 'Student'`;

    dbconnection.all(query, [], (err, students) => {
        if (err) {
            console.error('Error fetching students', err);
            res.status(500).send('An error occurred while fetching students');
        } else {
            console.log(`Fetched ${students.length} students`);
            res.status(200).send(students);
        }
    });
});

app.get('/fetchprofessors', (req, res) => {
    const query = `SELECT * FROM Users WHERE UserType = 'Professor'`;

    dbconnection.all(query, [], (err, professors) => {
        if (err) {
            console.error('Error fetching professors', err);
            res.status(500).send('An error occurred while fetching professors');
        } else {
            
            console.log(`Fetched ${professors.length} professors`);
            res.status(200).send(professors);
        }
    });
});


app.get('/fetchCourses', (req, res) => {
    const query = `SELECT * FROM Courses`;

    dbconnection.all(query, [], (err, courses) => {
        if (err) {
            console.error('Error fetching Courses', err);
            res.status(500).send('An error occurred while fetching Courses');
        } else {
            
            console.log(`Fetched ${courses.length} courses`);
            res.status(200).send(courses);
        }
    });
});







app.get('/fetchCourse/:CourseID', (req, res) => {
    const { CourseID } = req.params;

    const query = `SELECT CourseName FROM Courses WHERE CourseID = ?`;

    dbconnection.get(query, [CourseID], (err, course) => {
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


app.get('/fetchProfessorByCourse/:CourseID', (req, res) => {
    const { CourseID } = req.params;

    const query = `
        SELECT Users.UserID, Users.UserName 
        FROM Users 
        JOIN Courses ON Users.UserID = Courses.ProfessorID 
        WHERE Courses.CourseID = ? AND Users.UserType = 'Professor'`;

    dbconnection.get(query, [CourseID], (err, professor) => {
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



app.get('/fetchStudentsByCourse/:CourseID', (req, res) => {
    const { CourseID } = req.params;

    const query = `
        SELECT Users.UserID, Users.UserName 
        FROM Users 
        JOIN Enrollments ON Users.UserID = Enrollments.StudentID 
        WHERE Enrollments.CourseID = ?`;

    dbconnection.all(query, [CourseID], (err, students) => {
        if (err) {
            console.error('Error fetching students', err);
            res.status(500).send('An error occurred while fetching students');
        } else {
            res.status(200).send(students);
        }
    });
});



app.post('/addcourse', (req, res) => {
    // Extracting CourseName and ProfessorID from the request body
    const { CourseName, ProfessorID } = req.body;

    // Validate the input
    if (!CourseName || !ProfessorID) {
        return res.status(400).send('Missing course details');
    }

    // Prepare your SQL query to insert a new course
    const courseQuery = `INSERT INTO Courses (CourseName, ProfessorID) VALUES (?, ?)`;

    // Execute the query against your database
    dbconnection.run(courseQuery, [CourseName, ProfessorID], function(err) {
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



app.post('/adduser', (req, res) => {
    const { UserName, UserType, PhoneNumber } = req.body;

    if (!UserName || !UserType || !PhoneNumber) {
        return res.status(400).send('Missing user details');
    }

    const query = `INSERT INTO Users (UserName, UserType, PhoneNumber) VALUES (?, ?, ?)`;

    dbconnection.run(query, [UserName, UserType, PhoneNumber], function(err) {
        if (err) {
            console.error('Error adding user', err);
            res.status(500).send('An error occurred while adding the user');
        } else {
            console.log(`A user has been added with UserID ${this.lastID}`);
            res.status(201).send({ UserID: this.lastID });
        }
    });
});

app.delete('/deleteuser/:UserID', (req, res) => {
    const { UserID } = req.params;

    const query = `DELETE FROM Users WHERE UserID = ?`;

    dbconnection.run(query, [UserID], function(err) {
        if (err) {
            console.error('Error deleting user', err);
            res.status(500).send('An error occurred while deleting the user');
        } else {
            console.log(`User with UserID ${UserID} has been deleted`);
            res.status(200).send({ deletedUserID: UserID });
        }
    });
});
app.post('/enrollstudent', async (req, res) => {
    const { courseId, selectedStudents } = req.body;

    if (!courseId || !selectedStudents || !Array.isArray(selectedStudents)) {
        return res.status(400).send('Missing or invalid enrollment details');
    }

    const enrollmentQuery = `INSERT INTO Enrollments (StudentID, CourseID) VALUES (?, ?)`;

    // Using a transaction to ensure all students are enrolled
    dbconnection.serialize(() => {
        dbconnection.run("BEGIN TRANSACTION");

        selectedStudents.forEach(studentId => {
            dbconnection.run(enrollmentQuery, [studentId, courseId], function(err) {
                if (err) {
                    console.error('Error enrolling student', err);
                    // If there's an error, respond and rollback the transaction
                    dbconnection.run("ROLLBACK");
                    return res.status(500).send('An error occurred while enrolling the students');
                }
            });
        });

        dbconnection.run("COMMIT", function(err) {
            if (err) {
                console.error('Error committing transaction', err);
                return res.status(500).send('An error occurred during enrollment');
            }

            console.log(`Students have been enrolled in Course ${courseId}`);
            res.status(201).send({ message: `Students have been enrolled in Course ${courseId}` });
        });
    });
});





// Call the function to create tables
createTables();

// Start the server
app.listen(5000, () => console.log("Server is running on port 5000"));
