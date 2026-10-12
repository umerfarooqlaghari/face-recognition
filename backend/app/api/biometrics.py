import uuid
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.models import User, BiometricProfile, FaceScanInvite
from app.api.deps import get_current_user
from app.services.face_engine import face_engine
from app.schemas.biometrics import (
    CreateInviteRequest,
    InviteResponse,
    VerifyInviteResponse,
    EnrollmentResponse,
    BiometricProfileResponse
)

router = APIRouter(prefix="/biometrics", tags=["Biometrics & Invites"])

@router.post("/invites/generate", response_model=InviteResponse)
async def generate_face_scan_invite(
    req: CreateInviteRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Only managers or super admins can circulate enrollment invites
    if current_user.role not in ["manager", "super_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only managers and administrators can circulate face enrollment invites"
        )

    # Check target employee exists
    emp_res = await db.execute(select(User).where(User.id == req.user_id))
    emp = emp_res.scalar_one_or_none()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    invite_token = f"inv_{secrets.token_urlsafe(32)}"
    expires_at = datetime.now(timezone.utc) + timedelta(hours=req.expires_hours or 48)

    invite = FaceScanInvite(
        user_id=emp.id,
        invite_token=invite_token,
        expires_at=expires_at
    )
    db.add(invite)
    await db.commit()

    return InviteResponse(
        invite_token=invite_token,
        user_id=emp.id,
        employee_name=emp.full_name,
        employee_code=emp.employee_code,
        expires_at=expires_at,
        invite_url=f"attendapp://enroll?token={invite_token}"
    )

@router.get("/invites/verify/{token}", response_model=VerifyInviteResponse)
async def verify_invite_token(token: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(FaceScanInvite).where(FaceScanInvite.invite_token == token))
    invite = res.scalar_one_or_none()

    if not invite:
        raise HTTPException(status_code=404, detail="Invalid invitation token")

    now = datetime.now(timezone.utc)
    if invite.expires_at < now:
        raise HTTPException(status_code=400, detail="Invitation token has expired")

    if invite.used_at is not None:
        raise HTTPException(status_code=400, detail="Invitation token has already been used")

    emp_res = await db.execute(select(User).where(User.id == invite.user_id))
    emp = emp_res.scalar_one_or_none()
    if not emp:
        raise HTTPException(status_code=404, detail="Associated employee not found")

    return VerifyInviteResponse(
        valid=True,
        user_id=emp.id,
        full_name=emp.full_name,
        employee_code=emp.employee_code,
        expires_at=invite.expires_at
    )

@router.post("/enroll", response_model=EnrollmentResponse)
async def enroll_face_reference(
    file: UploadFile = File(...),
    invite_token: Optional[str] = Form(None),
    user_id: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Enrolls a reference face photograph:
    - Validates image dimensions, quality, and sharpness.
    - Generates 512D ArcFace vector embedding.
    - Stores into Render PostgreSQL biometric_profiles with pgvector.
    - Marks invite token as used (if provided).
    """
    target_user_id = None
    invite_obj = None

    if invite_token:
        # Validate invite token
        inv_res = await db.execute(select(FaceScanInvite).where(FaceScanInvite.invite_token == invite_token))
        invite_obj = inv_res.scalar_one_or_none()
        if not invite_obj:
            raise HTTPException(status_code=400, detail="Invalid face enrollment token")
        if invite_obj.expires_at < datetime.now(timezone.utc):
            raise HTTPException(status_code=400, detail="Face enrollment token has expired")
        if invite_obj.used_at is not None:
            raise HTTPException(status_code=400, detail="Face enrollment token has already been used")
        target_user_id = invite_obj.user_id
    elif user_id:
        try:
            target_user_id = uuid.UUID(user_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid user_id format")
    else:
        raise HTTPException(status_code=400, detail="Either invite_token or user_id must be provided")

    # Verify user exists
    user_res = await db.execute(select(User).where(User.id == target_user_id))
    user = user_res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Read image contents
    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="No image file data received")

    # Validate image quality
    is_valid, msg, pil_img = face_engine.validate_image_quality(image_bytes)
    if not is_valid or pil_img is None:
        raise HTTPException(status_code=422, detail=f"Image validation failed: {msg}")

    # Extract normalized 512D ArcFace embedding
    embedding_512d = face_engine.extract_face_embedding(pil_img)
    if len(embedding_512d) != 512:
        raise HTTPException(status_code=500, detail="Failed to extract 512-dimensional vector")

    now_utc = datetime.now(timezone.utc)

    # Upsert into biometric_profiles
    bio_res = await db.execute(select(BiometricProfile).where(BiometricProfile.user_id == target_user_id))
    bio_profile = bio_res.scalar_one_or_none()

    if bio_profile:
        bio_profile.embedding = embedding_512d
        bio_profile.enrolled_at = now_utc
        bio_profile.is_verified = True
    else:
        bio_profile = BiometricProfile(
            user_id=target_user_id,
            embedding=embedding_512d,
            enrolled_at=now_utc,
            is_verified=True
        )
        db.add(bio_profile)

    # Mark invite used if applicable
    if invite_obj:
        invite_obj.used_at = now_utc

    await db.commit()

    return EnrollmentResponse(
        success=True,
        message="Face reference profile enrolled successfully with 512D vector embedding",
        user_id=target_user_id,
        enrolled_at=now_utc,
        is_verified=True
    )

@router.get("/profile/{user_id}", response_model=BiometricProfileResponse)
async def get_biometric_profile(user_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(BiometricProfile).where(BiometricProfile.user_id == user_id))
    profile = res.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="No biometric profile found for this employee")
    return profile
