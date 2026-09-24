from fastapi import APIRouter, HTTPException # type: ignore
from uuid import UUID
from pydantic import BaseModel # pyright: ignore[reportMissingImports]
from supabase import create_client # type: ignore
from dotenv import load_dotenv # type: ignore
import os


load_dotenv()


router = APIRouter(
    prefix="/api",
    tags=["Authentication"]
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


class RegisterRequest(BaseModel):
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/register")
def register_user(request: RegisterRequest):
    response = supabase.auth.sign_up({
        "email": request.email,
        "password": request.password
    })

    if response.user is None:
        raise HTTPException(
            status_code=400,
            detail="Registration failed."
        )

    return {
        "message": "Registration successful.",
        "user_id": response.user.id,
        "email": response.user.email
    }


@router.post("/login")
def login_user(request: LoginRequest):
    try:
        response = supabase.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password
        })
    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    if response.user is None or response.session is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    return {
        "message": "Login successful.",
        "user_id": response.user.id,
        "email": response.user.email,
        "access_token": response.session.access_token
    }


@router.post("/logout")
def logout_user():
    return {
        "message": "Logout request received."
    }

@router.get("/profile/{user_id}")
def get_profile(user_id: UUID): # type: ignore
    response = supabase.table("users").select(
        "user_id, name, email, role"
    ).eq(
        "user_id",
        str(user_id)
    ).execute()

    if not response.data:
        raise HTTPException(
            status_code=404,
            detail="User profile not found."
        )

    return response.data[0]