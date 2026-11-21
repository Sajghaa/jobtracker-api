from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta, datetime

import secrets
import resend

from app.db.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, ForgotPasswordRequest, ResetPasswordRequest
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.config import settings

resend.api_key = settings.RESEND_API_KEY

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pwd = get_password_hash(user.password)
    new_user = User(email=user.email, hashed_password=hashed_pwd)
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):

    user = db.query(User).filter(User.email == form_data.username).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    print(f"🔥 DEBUG TOKEN: {access_token}")
    return {"access_token": access_token, "token_type": "bearer"}


# ─── FORGOT PASSWORD ───
@router.post("/forgot-password")
def forgot_password(
    request: ForgotPasswordRequest, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    # 1. Find the user
    user = db.query(User).filter(User.email == request.email).first()
    
    # Security: Even if user doesn't exist, return 200 OK so hackers can't guess emails
    if not user:
        return {"message": "If that email is registered, a reset link has been sent."}

    # 2. Generate a secure random token (32 characters)
    token = secrets.token_urlsafe(32)
    
    # 3. Save token and expiration (15 minutes) to DB
    user.reset_token = token
    user.reset_token_expiry = datetime.utcnow() + timedelta(minutes=15)
    db.commit()

    # 4. Send the email via BackgroundTask
    reset_link = f"https://jobtracker-frontend-mzcx.onrender.com/reset-password?token={token}"
    
    def send_reset_email():
        try:
            params = {
                "from": "JobTracker <onboarding@resend.dev>",
                "to": [user.email],
                "subject": "Reset your JobTracker Password",
                "html": f"""
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                        <h2 style="color: #4f46e5;">Password Reset Request</h2>
                        <p>We received a request to reset your password.</p>
                        <p>Click the button below to create a new password. This link expires in 15 minutes.</p>
                        <a href="{reset_link}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 15px 0;">Reset Password</a>
                        <p>If you didn't request this, you can safely ignore this email.</p>
                    </div>
                """
            }
            resend.Emails.send(params)
            print(f"✅ Reset email sent to {user.email}")
        except Exception as e:
            print(f"❌ Failed to send reset email: {e}")

    background_tasks.add_task(send_reset_email)
    return {"message": "If that email is registered, a reset link has been sent."}

@router.post("/reset-password")
def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.reset_token == request.token).first()
    
    if not user or not user.reset_token_expiry:
        raise HTTPException(status_code=400, detail="Invalid or missing reset token")
        
    if user.reset_token_expiry < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Reset token has expired. Please request a new one.")

    from app.core.security import get_password_hash # import here to avoid circular imports if any
    user.hashed_password = get_password_hash(request.new_password)

    user.reset_token = None
    user.reset_token_expiry = None
    
    db.commit()
    return {"message": "Password successfully updated. You can now log in."}