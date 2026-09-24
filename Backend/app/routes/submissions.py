from datetime import datetime
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, HTTPException # pyright: ignore[reportMissingImports]
from pydantic import BaseModel, Field # type: ignore
from supabase import create_client # type: ignore
from dotenv import load_dotenv # type: ignore
import os


load_dotenv()


router = APIRouter(
    prefix="/api",
    tags=["Submissions"]
)


SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")


if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError(
        "Supabase environment variables are not configured."
    )


supabase = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
)


class SubmissionCreate(BaseModel):
    assignment_id: UUID
    student_id: UUID
    file_name: str
    file_url: Optional[str] = None
    storage_path: Optional[str] = None
    submission_status: str = Field(
        min_length=1
    )


class GradeRequest(BaseModel):
    marks: int = Field(ge=0)
    feedback: Optional[str] = None


@router.post("/assignments/{assignment_id}/submit")
def submit_assignment(
    assignment_id: UUID,
    request: SubmissionCreate
):
    if request.assignment_id != assignment_id:
        raise HTTPException(
            status_code=400,
            detail="Assignment ID does not match."
        )

    submission_data = {
        "assignment_id": str(request.assignment_id),
        "student_id": str(request.student_id),
        "file_name": request.file_name,
        "file_url": request.file_url,
        "storage_path": request.storage_path,
        "submission_status": request.submission_status
    }

    response = supabase.table("submissions").insert(
        submission_data
    ).execute()

    if not response.data:
        raise HTTPException(
            status_code=400,
            detail="Submission could not be created."
        )

    return {
        "message": "Assignment submitted successfully.",
        "submission": response.data[0]
    }


@router.get("/submissions/me")
def get_my_submissions(student_id: UUID):
    response = supabase.table("submissions").select(
        "*"
    ).eq(
        "student_id",
        str(student_id)
    ).order(
        "submitted_at",
        desc=True
    ).execute()

    return {
        "submissions": response.data
    }


@router.get("/assignments/{assignment_id}/submissions")
def get_assignment_submissions(
    assignment_id: UUID
):
    response = supabase.table("submissions").select(
        "*"
    ).eq(
        "assignment_id",
        str(assignment_id)
    ).order(
        "submitted_at",
        desc=True
    ).execute()

    return {
        "submissions": response.data
    }


@router.get("/submissions/{submission_id}")
def get_submission(submission_id: UUID):
    response = supabase.table("submissions").select(
        "*"
    ).eq(
        "submission_id",
        str(submission_id)
    ).execute()

    if not response.data:
        raise HTTPException(
            status_code=404,
            detail="Submission not found."
        )

    return {
        "submission": response.data[0]
    }


@router.post("/submissions/{submission_id}/grade")
def grade_submission(
    submission_id: UUID,
    request: GradeRequest
):
    submission_response = supabase.table(
        "submissions"
    ).select(
        "assignment_id"
    ).eq(
        "submission_id",
        str(submission_id)
    ).execute()

    if not submission_response.data:
        raise HTTPException(
            status_code=404,
            detail="Submission not found."
        )

    assignment_id = submission_response.data[0]["assignment_id"]

    assignment_response = supabase.table(
        "assignments"
    ).select(
        "max_marks"
    ).eq(
        "assignment_id",
        assignment_id
    ).execute()

    if not assignment_response.data:
        raise HTTPException(
            status_code=404,
            detail="Assignment not found."
        )

    max_marks = assignment_response.data[0]["max_marks"]

    if request.marks > max_marks:
        raise HTTPException(
            status_code=400,
            detail=f"Marks cannot exceed maximum marks ({max_marks})."
        )

    response = supabase.table("submissions").update({
        "marks": request.marks,
        "feedback": request.feedback,
        "graded_at": datetime.utcnow().isoformat(),
        "submission_status": "graded"
    }).eq(
        "submission_id",
        str(submission_id)
    ).execute()

    if not response.data:
        raise HTTPException(
            status_code=404,
            detail="Submission could not be graded."
        )

    return {
        "message": "Submission graded successfully.",
        "submission": response.data[0]
    }


@router.get("/submissions/{submission_id}/feedback")
def get_submission_feedback(
    submission_id: UUID
):
    response = supabase.table("submissions").select(
        "submission_id, marks, feedback, graded_at, submission_status"
    ).eq(
        "submission_id",
        str(submission_id)
    ).execute()

    if not response.data:
        raise HTTPException(
            status_code=404,
            detail="Submission not found."
        )

    return {
        "feedback": response.data[0]
    }