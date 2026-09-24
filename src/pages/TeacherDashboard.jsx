import { useEffect, useState } from 'react';

function TeacherDashboard({ userName, userId }) {
  const [courseName, setCourseName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [maxMarks, setMaxMarks] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [message, setMessage] = useState('');
  const [grades, setGrades] = useState({});

  const loadAssignments = async () => {
    try {
      const response = await fetch(
        'https://cloud-based-assignment-submission-portal.onrender.com/api/assignments'
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.detail || 'Could not load assignments.'
        );
        return;
      }

      const teacherAssignments =
        (data.assignments || []).filter(
          (assignment) =>
            assignment.created_by === userId
        );

      setAssignments(teacherAssignments);
    } catch (error) {
      setMessage(
        'Could not connect to backend server.'
      );
    }
  };

  const loadSubmissions = async () => {
    try {
      const assignmentsResponse = await fetch(
        'https://cloud-based-assignment-submission-portal.onrender.com/api/assignments'
      );

      const assignmentsData =
        await assignmentsResponse.json();

      if (!assignmentsResponse.ok) {
        setMessage(
          assignmentsData.detail ||
            'Could not load assignments.'
        );
        return;
      }

      const teacherAssignments =
        (assignmentsData.assignments || []).filter(
          (assignment) =>
            assignment.created_by === userId
        );

      const allSubmissions = [];

      for (const assignment of teacherAssignments) {
        const response = await fetch(
          `https://cloud-based-assignment-submission-portal.onrender.com/api/assignments/${assignment.assignment_id}/submissions`
        );

        const data = await response.json();

        if (response.ok) {
          const assignmentSubmissions =
            (data.submissions || []).map(
              (submission) => ({
                ...submission,
                assignment_title:
                  assignment.title,
                max_marks:
                  assignment.max_marks
              })
            );

          allSubmissions.push(
            ...assignmentSubmissions
          );
        }
      }

      setSubmissions(allSubmissions);
    } catch (error) {
      setMessage(
        'Could not connect to backend server.'
      );
    }
  };

  useEffect(() => {
    loadAssignments();
    loadSubmissions();
  }, [userId]);

  const handleCreateAssignment = async (event) => {
    event.preventDefault();

    setMessage('Creating course...');

    try {
      const courseResponse = await fetch(
        'https://cloud-based-assignment-submission-portal.onrender.com/api/courses',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            course_name: courseName,
            teacher_id: userId
          })
        }
      );

      const courseData =
        await courseResponse.json();

      if (!courseResponse.ok) {
        setMessage(
          courseData.detail ||
            'Course could not be created.'
        );
        return;
      }

      const course = courseData.course;

      setMessage('Creating assignment...');

      const response = await fetch(
        'https://cloud-based-assignment-submission-portal.onrender.com/api/assignments',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            course_id: course.course_id,
            title,
            description,
            deadline,
            max_marks: Number(maxMarks),
            created_by: userId
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.detail ||
            'Assignment could not be created.'
        );
        return;
      }

      setMessage(
        'Assignment created successfully!'
      );

      setCourseName('');
      setTitle('');
      setDescription('');
      setDeadline('');
      setMaxMarks('');

      loadAssignments();
      loadSubmissions();
    } catch (error) {
      setMessage(
        'Could not connect to backend server.'
      );
    }
  };

  const handleGrade = async (submission) => {
    const grade =
      grades[submission.submission_id];

    if (!grade || grade.marks === '') {
      setMessage('Enter marks first.');
      return;
    }

    try {
      const response = await fetch(
        `https://cloud-based-assignment-submission-portal.onrender.com/api/submissions/${submission.submission_id}/grade`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            marks: Number(grade.marks),
            feedback: grade.feedback || ''
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.detail ||
            'Could not save marks and feedback.'
        );
        return;
      }

      setMessage(
        'Marks and feedback saved successfully.'
      );

      loadSubmissions();
    } catch (error) {
      setMessage(
        'Could not connect to backend server.'
      );
    }
  };

  const handleDownload = async (submission) => {
    setMessage('Preparing file...');

    try {
      const response = await fetch(
        `https://cloud-based-assignment-submission-portal.onrender.com/api/submissions/${submission.submission_id}/download`
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.detail || 'Download failed.'
        );
        return;
      }

      window.open(
        data.download_url,
        '_blank'
      );

      setMessage('Download link opened.');
    } catch (error) {
      setMessage(
        'Could not connect to backend server.'
      );
    }
  };

  const handleGradeChange = (
    submissionId,
    field,
    value
  ) => {
    setGrades((previous) => ({
      ...previous,
      [submissionId]: {
        ...previous[submissionId],
        [field]: value
      }
    }));
  };

  return (
    <div>
      <h1>Teacher Dashboard</h1>

      <p>
        Welcome, {userName}
      </p>

      <h2>Create Assignment</h2>

      <form onSubmit={handleCreateAssignment}>
        <div>
          <label>Course Name:</label>
          <br />
          <input
            value={courseName}
            onChange={(event) =>
              setCourseName(event.target.value)
            }
            required
          />
        </div>

        <br />

        <div>
          <label>Assignment Title:</label>
          <br />
          <input
            value={title}
            onChange={(event) =>
              setTitle(event.target.value)
            }
            required
          />
        </div>

        <br />

        <div>
          <label>Description:</label>
          <br />
          <textarea
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
          />
        </div>

        <br />

        <div>
          <label>Deadline:</label>
          <br />
          <input
            type="datetime-local"
            value={deadline}
            onChange={(event) =>
              setDeadline(event.target.value)
            }
            required
          />
        </div>

        <br />

        <div>
          <label>Maximum Marks:</label>
          <br />
          <input
            type="number"
            value={maxMarks}
            onChange={(event) =>
              setMaxMarks(event.target.value)
            }
            min="1"
            required
          />
        </div>

        <br />

        <button type="submit">
          Create Assignment
        </button>
      </form>

      {message && <p>{message}</p>}

      <hr />

      <h2>Your Assignments</h2>

      {assignments.length === 0 && (
        <p>No assignments created yet.</p>
      )}

      {assignments.map((assignment) => (
        <div
          key={assignment.assignment_id}
          style={{
            border: '1px solid #ccc',
            padding: '15px',
            marginBottom: '15px'
          }}
        >
          <h3>{assignment.title}</h3>

          <p>
            Maximum Marks:{' '}
            {assignment.max_marks}
          </p>

          <p>
            Deadline:{' '}
            {new Date(
              assignment.deadline
            ).toLocaleString()}
          </p>
        </div>
      ))}

      <hr />

      <h2>Student Submissions</h2>

      {submissions.length === 0 && (
        <p>No submissions yet.</p>
      )}

      {submissions.map((submission) => (
        <div
          key={submission.submission_id}
          style={{
            border: '1px solid #ccc',
            padding: '15px',
            marginBottom: '15px'
          }}
        >
          <h3>
            {submission.assignment_title}
          </h3>

          <p>
            File: {submission.file_name}
          </p>

          <p>
            Status:{' '}
            {submission.submission_status}
          </p>

          <p>
            Submitted:{' '}
            {new Date(
              submission.submitted_at
            ).toLocaleString()}
          </p>

          <button
            onClick={() =>
              handleDownload(submission)
            }
          >
            Download Submission
          </button>

          <br />
          <br />

          <input
            type="number"
            placeholder="Marks"
            min="0"
            max={submission.max_marks}
            value={
              grades[submission.submission_id]
                ?.marks || ''
            }
            onChange={(event) =>
              handleGradeChange(
                submission.submission_id,
                'marks',
                event.target.value
              )
            }
          />

          <br />
          <br />

          <textarea
            placeholder="Feedback"
            value={
              grades[submission.submission_id]
                ?.feedback || ''
            }
            onChange={(event) =>
              handleGradeChange(
                submission.submission_id,
                'feedback',
                event.target.value
              )
            }
          />

          <br />
          <br />

          <button
            onClick={() =>
              handleGrade(submission)
            }
          >
            Save Marks & Feedback
          </button>

          {submission.marks !== null && (
            <p>
              Current Marks:{' '}
              {submission.marks}
            </p>
          )}

          {submission.feedback && (
            <p>
              Current Feedback:{' '}
              {submission.feedback}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export default TeacherDashboard;