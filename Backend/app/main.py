from fastapi import FastAPI # type: ignore
from fastapi.middleware.cors import CORSMiddleware # type: ignore

from app.routes.auth import router as auth_router
from app.routes.courses import router as courses_router
from app.routes.assignments import router as assignments_router
from app.routes.submissions import router as submissions_router
from app.routes.files import router as files_router


app = FastAPI(
    title="Cloud-Based Student Assignment Submission Portal",
    description="REST API for the student assignment submission portal",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(courses_router)
app.include_router(assignments_router)
app.include_router(submissions_router)
app.include_router(files_router)


@app.get("/")
def root():
    return {
        "message": "Cloud Assignment Portal API is running"
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy"
    }