🎓 School Management System

A full-stack school management portal for managing students, student accounts, attendance, academic results, and administrative records.

The project has a separate student portal and administrator portal, with a backend API connected to MongoDB Atlas.

🌐 Live Project

Frontend: https://student-management-system-secure.netlify.app/

Backend API: https://student-management-api-3cwh.onrender.com/

✨ Features

Student Portal

Student account activation using Student ID, activation code, and date of birth

Student login with email and password

Student dashboard

Student profile information

Personal attendance history

Personal academic results

Logout

Administrator Portal

Secure admin login

Student registration/creation by an administrator

Automatic Student ID generation

Student account activation-code generation and regeneration

View student profiles

Edit student information

Reset student passwords

Deactivate and reactivate student accounts

Delete students and their linked attendance/results records

Record attendance

View attendance history

Record academic results

View result history

View complete student records, including profile, attendance summary, and results summary

🛠️ Technologies Used

Frontend

HTML5

CSS3

JavaScript

Netlify

Backend

Node.js

Express.js

Mongoose

MongoDB Atlas

JSON Web Tokens (JWT)

bcryptjs

CORS

dotenv

Render

🏗️ System Architecture

Student / Administrator
          │
          ▼
   Netlify Frontend
          │
          ▼
     Render API
          │
          ▼
    MongoDB Atlas

🔐 Authentication Flow

New students do not create unrestricted accounts themselves.

Admin creates student
        ↓
Student record + pending account
        ↓
Admin provides activation code
        ↓
Student activates account
        ↓
Student creates email + password
        ↓
Account becomes active
        ↓
Student logs in

Administrators can also reset a student's password or deactivate/reactivate a student's account.

📁 Project Structure

student-management-system-secure/
│
├── backend/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── index.html
│   ├── portal.html
│   ├── login.html
│   ├── activate-account.html
│   ├── student-dashboard.html
│   ├── student-attendance.html
│   ├── student-results.html
│   ├── admin-login.html
│   ├── admin-dashboard.html
│   ├── admin-students.html
│   ├── admin-student-profile.html
│   ├── admin-edit-student.html
│   ├── admin-attendance.html
│   ├── admin-attendance-history.html
│   ├── admin-results.html
│   ├── admin-result-history.html
│   ├── admin-student-records.html
│   ├── config.js
│   └── ...
│
└── .gitignore

⚙️ Local Setup

1. Clone the repository

git clone https://github.com/adebanjotoluwase26-ai/student-management-system-secure.git
cd student-management-system-secure

2. Install backend dependencies

cd backend
npm install

3. Configure environment variables

Create backend/.env:

PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5500

Do not commit .env to GitHub.

4. Start the backend

node server.js

The local API runs on:

http://localhost:5000

5. Start the frontend

Open the frontend folder with VS Code and run the site with a local static server such as Live Server.

frontend/config.js controls the API address:

window.API_BASE_URL = "http://localhost:5000";

For the deployed version, this points to the Render API.

🚀 Deployment

The project is deployed using:

GitHub for source-code hosting

Render for the Node/Express backend

Netlify for the static frontend

MongoDB Atlas for the database

Production frontend configuration:

window.API_BASE_URL =
    "https://student-management-api-3cwh.onrender.com";

The backend uses environment variables for deployment-specific values such as the MongoDB connection string, JWT secret, and allowed frontend origin.

🔒 Security Notes

Passwords are hashed with bcryptjs.

Authentication uses JWT.

Admin routes require authentication and admin authorization.

Student activation codes are stored as hashes rather than plain text.

Student passwords are never displayed to administrators.

Student deletion removes associated account, attendance, and result records.

Environment secrets are excluded from Git tracking through .gitignore.

🎯 Project Purpose

This project was built as a practical full-stack ICT/software-development project to demonstrate:

Frontend development

Backend API development

RESTful routes

Authentication and authorization

CRUD operations

Database integration

Role-based access control

Deployment and hosting

Connecting a live frontend to a live backend

Author

Adebanjo Toluwase Oluwanimilo

GitHub: https://github.com/adebanjotoluwase26-ai

📌 Project Status

The core student-management features are implemented and deployed, including student authentication, student management, attendance management, result management, and complete student records.