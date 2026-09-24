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
    prefix="/api/assignments",
    tags=["Assignments"]
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


class AssignmentCreate(BaseModel):
    course_id: UUID
    title: str
    description: Optional[str] = None
    deadline: datetime
    max_marks: int = Field(gt=0)
    created_by: UUID


class AssignmentUpdate(BaseModel):
    course_id: Optional[UUID] = None
    title: Optional[str] = None
    description: Optional[str] = None
    deadline: Optional[datetime] = None
    max_marks: Optional[int] = Field(default=None, gt=0)


@router.post("")
def create_assignment(request: AssignmentCreate):
    assignment_data = {
        "course_id": str(request.course_id),
        "title": request.title,
        "description": request.description,
        "deadline": request.deadline.isoformat(),
        "max_marks": request.max_marks,
        "created_by": str(request.created_by)
    }

    response = supabase.table("assignments").insert(
        assignment_data
    ).execute()

    if not response.data:
        raise HTTPException(
            status_code=400,
            detail="Assignment could not be created."
        )

    return {
        "message": "Assignment created successfully.",
        "assignment": response.data[0]
    }


@router.get("")
def get_assignments():
    response = supabase.table("assignments").select(
        "*"
    ).order(
        "created_at",
        desc=True
    ).execute()

    return {
        "assignments": response.data
    }


@router.get("/{assignment_id}")
def get_assignment(assignment_id: UUID):
    response = supabase.table("assignments").select(
        "*"
    ).eq(
        "assignment_id",
        str(assignment_id)
    ).execute()

    if not response.data:
        raise HTTPException(
            status_code=404,
            detail="Assignment not found."
        )

    return {
        "assignment": response.data[0]
    }


@router.put("/{assignment_id}")
def update_assignment(
    assignment_id: UUID,
    request: AssignmentUpdate
):
    update_data = request.model_dump(
        exclude_unset=True
    )

    if "course_id" in update_data:
        update_data["course_id"] = str(
            update_data["course_id"]
        )

    if "deadline" in update_data:
        update_data["deadline"] = update_data[
            "deadline"
        ].isoformat()

    response = supabase.table("assignments").update(
        update_data
    ).eq(
        "assignment_id",
        str(assignment_id)
    ).execute()

    if not response.data:
        raise HTTPException(
            status_code=404,
            detail="Assignment not found."
        )

    return {
        "message": "Assignment updated successfully.",
        "assignment": response.data[0]
    }


@router.delete("/{assignment_id}")
def delete_assignment(assignment_id: UUID):
    response = supabase.table("assignments").delete().eq(
        "assignment_id",
        str(assignment_id)
    ).execute()

    if not response.data:
        raise HTTPException(
            status_code=404,
            detail="Assignment not found."
        )

    return {
        "message": "Assignment deleted successfully."
    }