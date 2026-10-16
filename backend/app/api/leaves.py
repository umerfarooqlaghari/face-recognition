import uuid
from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, or_
from sqlalchemy.orm import selectinload

from app.db.session import get_db
from app.models.models import Leave, User, get_utc_now
from app.api.deps import get_current_user
from app.schemas.leaves import LeaveApplyRequest, LeaveReviewRequest, LeaveResponse

router = APIRouter(prefix="/leaves", tags=["Leave Management"])

async def build_leave_response(db: AsyncSession, lv: Leave, emp: User) -> LeaveResponse:
    manager_name = None
    if emp.manager_id:
        m_res = await db.execute(select(User.full_name).where(User.id == emp.manager_id))
        manager_name = m_res.scalar_one_or_none()

    l1_name = None
    if lv.level1_approved_by:
        l1_res = await db.execute(select(User.full_name).where(User.id == lv.level1_approved_by))
        l1_name = l1_res.scalar_one_or_none()

    l2_name = None
    if lv.level2_approved_by:
        l2_res = await db.execute(select(User.full_name).where(User.id == lv.level2_approved_by))
        l2_name = l2_res.scalar_one_or_none()

    return LeaveResponse(
        id=lv.id,
        tenant_id=lv.tenant_id,
        user_id=lv.user_id,
        employee_name=emp.full_name,
        employee_code=emp.employee_code,
        manager_name=manager_name,
        start_date=lv.start_date,
        end_date=lv.end_date,
        reason=lv.reason,
        leave_type="Annual Leave",
        status=lv.status,
        approved_by=lv.approved_by,
        level1_approved_by=lv.level1_approved_by,
        level1_approver_name=l1_name,
        level1_approved_at=lv.level1_approved_at,
        level2_approved_by=lv.level2_approved_by,
        level2_approver_name=l2_name,
        level2_approved_at=lv.level2_approved_at,
        admin_bypassed=lv.admin_bypassed,
        rejection_reason=lv.rejection_reason,
        created_at=lv.created_at
    )

@router.post("/apply", response_model=LeaveResponse, status_code=status.HTTP_201_CREATED)
async def apply_for_leave(
    req: LeaveApplyRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Employee applies for leave:
    - If employee has a manager assigned: sets status to 'pending_manager' (Level 1).
    - If employee has NO manager assigned: skips Level 1 and sets status to 'pending_admin' (Level 2).
    """
    target_user_id = current_user.id
    target_user = current_user
    if req.user_id and current_user.role in ["manager", "admin", "super_admin"]:
        u_res = await db.execute(
            select(User).where(User.id == req.user_id, User.tenant_id == current_user.tenant_id)
        )
        found_u = u_res.scalar_one_or_none()
        if found_u:
            target_user_id = found_u.id
            target_user = found_u

    initial_status = "pending_manager" if target_user.manager_id else "pending"

    new_leave = Leave(
        tenant_id=current_user.tenant_id,
        user_id=target_user_id,
        start_date=req.start_date,
        end_date=req.end_date,
        reason=req.reason.strip(),
        status=initial_status
    )
    db.add(new_leave)
    await db.commit()
    await db.refresh(new_leave)

    return await build_leave_response(db, new_leave, target_user)

@router.get("/my-leaves", response_model=List[LeaveResponse])
async def get_my_leaves(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve all leave requests submitted by the authenticated employee.
    """
    res = await db.execute(
        select(Leave)
        .where(Leave.user_id == current_user.id)
        .order_by(desc(Leave.created_at))
    )
    leaves = res.scalars().all()

    output = []
    for lv in leaves:
        output.append(await build_leave_response(db, lv, current_user))
    return output

@router.get("/tenant-leaves", response_model=List[LeaveResponse])
async def list_tenant_leaves(
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Management retrieves employee leave requests within their tenant.
    - Managers see their direct reports or pending Level 1 requests.
    - Admins see all tenant leave requests.
    """
    if current_user.role not in ["manager", "admin", "super_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only managers or administrators can review tenant leave requests"
        )

    stmt = (
        select(Leave, User)
        .join(User, Leave.user_id == User.id)
        .where(Leave.tenant_id == current_user.tenant_id)
        .order_by(desc(Leave.created_at))
    )

    if status_filter:
        flt = status_filter.lower()
        if flt == "pending":
            stmt = stmt.where(Leave.status.in_(["pending", "pending_manager", "pending_admin"]))
        else:
            stmt = stmt.where(Leave.status == flt)

    res = await db.execute(stmt)
    records = res.all()

    output = []
    for lv, emp in records:
        output.append(await build_leave_response(db, lv, emp))
    return output

@router.post("/{leave_id}/review", response_model=LeaveResponse)
async def review_leave_request(
    leave_id: uuid.UUID,
    req: LeaveReviewRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Review leave request with multi-level approval & Admin bypass:
    - If employee has a manager:
      * Level 1 (Manager): Manager approves -> advances to 'pending_admin'.
      * Level 2 (Admin/HR): Admin approves -> status becomes 'approved'.
      * Admin Bypass: Admin can bypass Manager at Level 1, directly setting status to 'approved' with admin_bypassed=True.
    - If employee has NO manager:
      * Reviewer directly approves -> status becomes 'approved'.
    - Rejection: Can be rejected at any level by manager or admin.
    """
    if current_user.role not in ["manager", "admin", "super_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only managers or administrators can review leave requests"
        )

    res = await db.execute(
        select(Leave, User)
        .join(User, Leave.user_id == User.id)
        .where(Leave.id == leave_id, Leave.tenant_id == current_user.tenant_id)
    )
    row = res.first()
    if not row:
        raise HTTPException(status_code=404, detail="Leave request not found in your organization")

    leave_obj, emp = row
    now_utc = get_utc_now()
    is_admin = current_user.role in ["admin", "super_admin"]
    is_direct_manager = (emp.manager_id == current_user.id)
    is_manager_role = (current_user.role == "manager")

    if req.status == "rejected":
        leave_obj.status = "rejected"
        leave_obj.rejection_reason = req.review_note
        leave_obj.approved_by = current_user.id

    elif req.status == "bypass" or (is_admin and req.bypass):
        # Admin / Super Admin bypasses Level 1 or 2 immediately
        if not is_admin:
            raise HTTPException(status_code=403, detail="Only administrators can bypass leave approvals")
        leave_obj.status = "approved"
        leave_obj.admin_bypassed = True
        leave_obj.level2_approved_by = current_user.id
        leave_obj.level2_approved_at = now_utc
        leave_obj.approved_by = current_user.id

    elif req.status == "approved":
        current_status = leave_obj.status

        if current_status == "pending_manager":
            # Has direct manager:
            if is_admin and req.bypass:
                # Admin bypasses manager
                leave_obj.status = "approved"
                leave_obj.admin_bypassed = True
                leave_obj.level2_approved_by = current_user.id
                leave_obj.level2_approved_at = now_utc
                leave_obj.approved_by = current_user.id
            elif is_direct_manager or is_manager_role or is_admin:
                # Manager approves Level 1 -> moves to Level 2
                leave_obj.level1_approved_by = current_user.id
                leave_obj.level1_approved_at = now_utc
                leave_obj.status = "pending_admin"
            else:
                raise HTTPException(status_code=403, detail="You are not authorized to approve Level 1 for this employee")

        elif current_status in ["pending_admin", "pending"]:
            # Final approval (Level 2 or unassigned direct approval)
            leave_obj.level2_approved_by = current_user.id
            leave_obj.level2_approved_at = now_utc
            leave_obj.approved_by = current_user.id
            leave_obj.status = "approved"

        elif current_status == "approved":
            pass # already approved

    await db.commit()
    await db.refresh(leave_obj)

    return await build_leave_response(db, leave_obj, emp)


