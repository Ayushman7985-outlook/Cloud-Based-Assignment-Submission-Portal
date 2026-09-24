from uuid import UUID

from fastapi import APIRouter, HTTPException # type: ignore
from pydantic import BaseModel # type: ignore
from supabase import create_client # type: ignore
from dotenv import load_dotenv # type: ignore
import os

load_dotenv()

router = APIRouter(
    prefix="/api/courses",
    tags=["Courses"]
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


class CourseCreate(BaseModel):
    course_name: str
    teacher_id: UUID


@router.post("")
def create_course(request: CourseCreate):
    course_data = {
        "course_name": request.course_name,
        "teacher_id": str(request.teacher_id)
    }

    response = supabase.table("courses").insert(
        course_data
    ).execute()

    if not response.data:
        raise HTTPException(
            status_code=400,
            detail="Course could not be created."
        )

    return {
        "message": "Course created successfully.",
        "course": response.data[0]
    }


@router.get("")
def get_courses():
    response = supabase.table("courses").select(
        "*"
    ).order(
        "created_at",
        desc=True
    ).execute()

    return {
        "courses": response.data
    }