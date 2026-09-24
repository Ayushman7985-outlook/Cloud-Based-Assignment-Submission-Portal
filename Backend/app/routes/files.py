from uuid import UUID

from fastapi import APIRouter, HTTPException  # type: ignore
from supabase import create_client  # pyright: ignore[reportMissingImports]
from dotenv import load_dotenv  # type: ignore
import os


load_dotenv()

router = APIRouter(
    prefix="/api",
    tags=["Files"]
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


@router.get("/submissions/{submission_id}/download")
def download_submission(submission_id: UUID):

    response = supabase.table("submissions").select(
        "storage_path"
    ).eq(
        "submission_id",
        str(submission_id)
    ).execute()

    if not response.data:
        raise HTTPException(
            status_code=404,
            detail="Submission not found."
        )

    storage_path = response.data[0]["storage_path"]

    if not storage_path:
        raise HTTPException(
            status_code=404,
            detail="File not found."
        )

    signed_response = supabase.storage.from_(
        "assignments"
    ).create_signed_url(
        storage_path,
        300
    )

    if not signed_response:
        raise HTTPException(
            status_code=500,
            detail="Could not create download URL."
        )

    if isinstance(signed_response, dict):
        download_url = signed_response.get("signedURL")

        if not download_url:
            download_url = signed_response.get("signed_url")

        if not download_url:
            raise HTTPException(
                status_code=500,
                detail="Could not extract download URL."
            )

    else:
        download_url = signed_response

    return {
        "download_url": download_url
    }