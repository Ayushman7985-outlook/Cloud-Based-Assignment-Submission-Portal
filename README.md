# Cloud-Based Student Assignment Submission & Feedback Portal

A cloud-based web application for managing student assignment submissions, teacher evaluation, marks, and feedback.

## Project Objective

The objective of this project is to provide a secure cloud-hosted portal where:

* Students can register and log in.
* Teachers can create courses and assignments.
* Students can view available assignments.
* Students can upload assignment files.
* Assignment submissions are stored using cloud storage.
* Teachers can view student submissions.
* Teachers can download submitted files.
* Teachers can provide marks and feedback.
* Students can view their submission status, marks, and feedback.

## Technology Stack

### Frontend

* React
* JavaScript
* HTML
* CSS

### Backend

* Python
* FastAPI
* REST APIs

### Cloud Services

* Supabase Authentication
* Supabase PostgreSQL Database
* Supabase Storage

### Development Tools

* Visual Studio Code
* Git
* GitHub

## System Architecture

```text
Student / Teacher
        |
        v
React Web Application
        |
        v
REST API
        |
        v
FastAPI Backend
        |
        +----------------------+
        |                      |
        v                      v
Supabase Database       Supabase Storage
        |
        v
Authentication
```

## Main Modules

### Authentication

* Student and teacher registration
* Login
* Role-based access
* Authentication through Supabase

### Course Management

* Teachers can create courses.
* Courses are associated with teachers.

### Assignment Management

* Teachers can create assignments.
* Assignments contain:

  * Title
  * Description
  * Deadline
  * Maximum marks
  * Course
  * Creator

### Submission Management

* Students can submit assignment files.
* Submission information is stored in the cloud database.
* Assignment files are stored in cloud object storage.
* Submission status is maintained.

### Feedback Management

* Teachers can review submissions.
* Teachers can provide marks and feedback.
* Students can view their marks and feedback.

## Database Structure

The project uses the following main database tables:

### USERS

* user_id
* name
* email
* role
* created_at

### COURSES

* course_id
* course_name
* teacher_id
* created_at

### ASSIGNMENTS

* assignment_id
* course_id
* title
* description
* deadline
* max_marks
* created_by
* created_at

### SUBMISSIONS

* submission_id
* assignment_id
* student_id
* file_name
* file_url
* storage_path
* submitted_at
* submission_status
* marks
* feedback
* graded_at

## REST API

The backend provides REST APIs for:

### Authentication

```text
POST /api/register
POST /api/login
POST /api/logout
```

### Courses

```text
POST /api/courses
GET /api/courses
```

### Assignments

```text
POST /api/assignments
GET /api/assignments
GET /api/assignments/{id}
PUT /api/assignments/{id}
DELETE /api/assignments/{id}
```

### Submissions

```text
POST /api/assignments/{id}/submit
GET /api/submissions/me
GET /api/assignments/{id}/submissions
GET /api/submissions/{id}
```

### Feedback

```text
POST /api/submissions/{id}/grade
GET /api/submissions/{id}/feedback
```

### Files

```text
GET /api/submissions/{id}/download
```

## Security

The project uses cloud authentication, role-based access, database access policies, cloud storage access policies, environment variables for sensitive configuration, and validation of submitted data.

Sensitive credentials and environment files are excluded from the GitHub repository.

## Project Structure

```text
Cloud-Based-Assignment-Submission-Portal/
│
├── Backend/
│   └── app/
│       ├── main.py
│       ├── routes/
│       │   ├── auth.py
│       │   ├── courses.py
│       │   ├── assignments.py
│       │   ├── submissions.py
│       │   └── files.py
│       ├── services/
│       └── utils/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── utils/
│   ├── App.jsx
│   ├── main.jsx
│   └── supabase.js
│
├── public/
├── tests/
├── sample_files/
├── screenshots/
├── docs/
├── reports/
│
├── .env.example
├── .gitignore
├── package.json
├── requirements.txt
└── README.md
```

## Local Setup

### Frontend

Install the frontend dependencies:

```bash
npm install
```

Start the React development server:

```bash
npm run dev
```

### Backend

Create and activate a Python virtual environment, install the required dependencies, and start the FastAPI server.

```bash
python -m uvicorn app.main:app --reload
```

The FastAPI API documentation is available at:

```text
https://cloud-based-assignment-submission-portal.onrender.com/docs/docs
```

## Cloud Services

The application uses Supabase for:

* Authentication
* PostgreSQL database
* Cloud object/file storage

Environment variables are used for cloud configuration and are not committed to GitHub.

## Project Workflow

```text
Teacher Login
     |
     v
Create Course
     |
     v
Create Assignment
     |
     v
Student Login
     |
     v
View Assignment
     |
     v
Upload Assignment
     |
     v
Cloud Storage + Database
     |
     v
Teacher Reviews Submission
     |
     v
Marks + Feedback
     |
     v
Student Views Feedback
```

## Testing

The project is tested for important application workflows including:

* User registration
* User login
* Invalid login
* Role-based access
* Course creation
* Assignment creation
* Assignment listing
* File upload
* Submission creation
* Submission retrieval
* Teacher submission review
* File download
* Marks and feedback
* Student feedback viewing

## GitHub

This project is maintained using Git and GitHub as part of the cloud-computing project workflow.

## Project Status

The core student assignment submission and teacher feedback workflow has been implemented using React, FastAPI, Supabase Authentication, Supabase PostgreSQL, and Supabase Storage.
