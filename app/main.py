from fastapi import FastAPI
from app.core.config import settings
from app.routers import auth, applications

app = FastAPI(title=settings.PROJECT_NAME)

app.include_router(auth.router)
app.include_router(applications.router)

@app.get("/")
def root():
    return {"message": f"Welcome to {settings.PROJECT_NAME} API"}