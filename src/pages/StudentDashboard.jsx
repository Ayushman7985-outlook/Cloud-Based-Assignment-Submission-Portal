import { useEffect, useState } from 'react';

import { supabase } from '../supabase';

function StudentDashboard({ userName, userId }) {
  const [assignments, setAssignments] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [uploadingId, setUploadingId] = useState(null);
  const [messages, setMessages] = useState({});
  const [submissions, setSubmissions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadAssignments = async () => {
    try {
      const response = await fetch(
        'https://cloud-based-assignment-submission-portal.onrender.com/api/assignments',
        {
          cache: 'no-store'
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessages({
          page:
            data.detail || 'Could not load assignments.'
        });
        return;
      }

      setAssignments(data.assignments || []);
    } catch (error) {
      setMessages({
        page: 'Could not connect to backend server.'
      });
    }
  };

  const loadSubmissions = async () => {
    try {
      const response = await fetch(
        `https://cloud-based-assignment-submission-portal.onrender.com/api/submissions/me?student_id=${userId}&_=${Date.now()}`,
        {
          cache: 'no-store'
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessages((previous) => ({
          ...previous,
          submission:
            data.detail || 'Could not load submissions.'
        }));
        return;
      }

      setSubmissions(data.submissions || []);
    } catch (error) {
      setMessages((previous) => ({
        ...previous,
        submission:
          'Could not connect to backend server.'
      }));
    }
  };

  useEffect(() => {
    loadAssignments();
    loadSubmissions();
  }, [userId]);

  const handleRefresh = async () => {
    setRefreshing(true);

    await loadSubmissions();

    setRefreshing(false);

    setMessages((previous) => ({
      ...previous,
      submission:
        'Latest marks and feedback loaded successfully.'
    }));
  };

  const handleFileChange = (assignmentId, event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    setSelectedFiles((previous) => ({
      ...previous,
      [assignmentId]: file
    }));

    setMessages((previous) => ({
      ...previous,
      [assignmentId]: ''
    }));
  };

  const handleSubmit = async (assignment) => {
    const file =
      selectedFiles[assignment.assignment_id];

    if (!file) {
      setMessages((previous) => ({
        ...previous,
        [assignment.assignment_id]:
          'Please select a file first.'
      }));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessages((previous) => ({
        ...previous,
        [assignment.assignment_id]:
          'File size must be 10 MB or less.'
      }));
      return;
    }

    setUploadingId(assignment.assignment_id);

    const filePath =
      `assignments/${assignment.assignment_id}/${userId}/` +
      `${Date.now()}-${file.name}`;

    const { error: uploadError } =
      await supabase.storage
        .from('assignments')
        .upload(filePath, file);

    if (uploadError) {
      setMessages((previous) => ({
        ...previous,
        [assignment.assignment_id]:
          uploadError.message
      }));

      setUploadingId(null);
      return;
    }

    const submissionStatus =
      new Date() <= new Date(assignment.deadline)
        ? 'on-time'
        : 'late';

    try {
      const submissionResponse = await fetch(
        `https://cloud-based-assignment-submission-portal.onrender.com/api/assignments/${assignment.assignment_id}/submit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            assignment_id:
              assignment.assignment_id,
            student_id: userId,
            file_name: file.name,
            file_url: null,
            storage_path: filePath,
            submission_status: submissionStatus
          })
        }
      );

      const submissionData =
        await submissionResponse.json();

      if (!submissionResponse.ok) {
        await supabase.storage
          .from('assignments')
          .remove([filePath]);

        setMessages((previous) => ({
          ...previous,
          [assignment.assignment_id]:
            submissionData.detail ||
            'Submission failed.'
        }));

        setUploadingId(null);
        return;
      }

      setMessages((previous) => ({
        ...previous,
        [assignment.assignment_id]:
          'Assignment submitted successfully!'
      }));

      setSelectedFiles((previous) => ({
        ...previous,
        [assignment.assignment_id]: null
      }));

      setUploadingId(null);

      await loadSubmissions();
    } catch (error) {
      await supabase.storage
        .from('assignments')
        .remove([filePath]);

      setMessages((previous) => ({
        ...previous,
        [assignment.assignment_id]:
          'Could not connect to backend server.'
      }));

      setUploadingId(null);
    }
  };

  const getSubmissionForAssignment = (
    assignmentId
  ) => {
    return submissions.find(
      (submission) =>
        submission.assignment_id === assignmentId
    );
  };

  return (
    <div>
      <h1>Student Dashboard</h1>

      <p>
        Welcome, {userName}
      </p>

      <button
        onClick={handleRefresh}
        disabled={refreshing}
      >
        {refreshing
          ? 'Refreshing...'
          : 'Refresh Marks & Feedback'}
      </button>

      <h2>Available Assignments</h2>

      {messages.page && (
        <p>{messages.page}</p>
      )}

      {messages.submission && (
        <p>{messages.submission}</p>
      )}

      {assignments.length === 0 && (
        <p>No assignments available.</p>
      )}

      {assignments.map((assignment) => {
        const submission =
          getSubmissionForAssignment(
            assignment.assignment_id
          );

        return (
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
              Course:{' '}
              {assignment.courses?.course_name}
            </p>

            <p>
              Description:{' '}
              {assignment.description}
            </p>

            <p>
              Deadline:{' '}
              {new Date(
                assignment.deadline
              ).toLocaleString()}
            </p>

            <p>
              Maximum Marks:{' '}
              {assignment.max_marks}
            </p>

            <input
              type="file"
              onChange={(event) =>
                handleFileChange(
                  assignment.assignment_id,
                  event
                )
              }
            />

            <br />
            <br />

            <button
              onClick={() =>
                handleSubmit(assignment)
              }
              disabled={
                uploadingId ===
                assignment.assignment_id
              }
            >
              {uploadingId ===
              assignment.assignment_id
                ? 'Uploading...'
                : 'Submit Assignment'}
            </button>

            {messages[assignment.assignment_id] && (
              <p>
                {messages[assignment.assignment_id]}
              </p>
            )}

            {submission && (
              <div>
                <h4>Your Submission</h4>

                <p>
                  File:{' '}
                  {submission.file_name}
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

                {submission.marks !== null &&
                  submission.marks !== undefined && (
                    <p>
                      Marks:{' '}
                      {submission.marks}
                    </p>
                  )}

                {submission.feedback &&
                  submission.feedback.trim() !== '' && (
                    <p>
                      Feedback:{' '}
                      {submission.feedback}
                    </p>
                  )}

                {submission.graded_at && (
                  <p>
                    Graded:{' '}
                    {new Date(
                      submission.graded_at
                    ).toLocaleString()}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default StudentDashboard;