import uuid
from typing import Tuple, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.models import BiometricProfile
from app.services.face_engine import face_engine
from app.core.config import settings

async def verify_probe_face(
    db: AsyncSession,
    user_id: uuid.UUID,
    image_bytes: bytes
) -> Tuple[bool, float, float, str]:
    """
    Validates a live probe face image and matches against the stored pgvector embedding.
    Returns: (is_match, similarity_score, liveness_score, message)
    """
    # 1. Image Quality Validation
    is_valid, msg, pil_img = face_engine.validate_image_quality(image_bytes)
    if not is_valid or pil_img is None:
        return False, 0.0, 0.0, f"Image quality check failed: {msg}"

    # 2. Passive Anti-Spoofing & Liveness
    liveness_score = face_engine.evaluate_liveness(pil_img)
    if liveness_score < settings.LIVENESS_CONFIDENCE_THRESHOLD:
        return False, 0.0, liveness_score, f"Liveness check failed (Score: {liveness_score:.2f}). Live face required; screen/photo spoof detected."

    # 3. Extract 512D ArcFace Probe Vector
    probe_vector = face_engine.extract_face_embedding(pil_img)

    # 4. Query pgvector using SQLAlchemy cosine_distance
    # Cosine Similarity = 1 - cosine_distance
    stmt = select(
        (1.0 - BiometricProfile.embedding.cosine_distance(probe_vector)).label("similarity"),
        BiometricProfile.is_verified
    ).where(BiometricProfile.user_id == user_id)

    result = await db.execute(stmt)
    row = result.fetchone()

    if not row:
        return False, 0.0, liveness_score, "No registered biometric profile found for this employee. Please enroll face first."

    similarity = round(float(row[0]), 4)
    is_verified = bool(row[1])

    if not is_verified:
        return False, similarity, liveness_score, "Biometric profile is pending administrative approval."

    # Check similarity threshold
    is_match = similarity >= settings.FACE_SIMILARITY_THRESHOLD
    if not is_match:
        return False, similarity, liveness_score, f"Face mismatch: similarity score {similarity:.3f} is below required threshold ({settings.FACE_SIMILARITY_THRESHOLD})."

    return True, similarity, liveness_score, f"Face match verified successfully with similarity score {similarity:.3f}."
