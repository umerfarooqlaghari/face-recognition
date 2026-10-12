# Project Sprints: Face-Recognition Attendance System

## System Architecture Summary
- **Backend**: Python (FastAPI, SQLAlchemy 2.0 async, asyncpg, pgvector-python, PyJWT, bcrypt)
- **Database**: Render PostgreSQL 18.6 with `pgvector` extension enabled (`vector(512)` embeddings)
- **Mobile Client**: React Native (Expo SDK 57, TypeScript) with Dual Portals (Employee & Management), `expo-local-authentication`, `expo-camera`, `expo-location`, `expo-device`
- **Web Admin**: Next.js (App Router, TypeScript) for HR/Management desktop operations
- **Configuration**: 100% environment-driven (`.env`), zero hardcoding

---

## Sprint Roadmap Overview

| Sprint | Focus Area | Status | Deliverables |
|---|---|---|---|
| **Sprint 1** | **Database Schema, Auth, Device Binding & Dual-Portal Foundation** | ✅ **Completed** | Render Postgres tables with pgvector, SQLAlchemy models, JWT auth + 7-day refresh tokens, device hardware binding, Mobile dual-portal navigation & auth UI. |
| **Sprint 2** | **Face Embedding Engine & Reference Enrollment** | ✅ **Completed** | 512D ArcFace vector feature extraction, HNSW cosine index, Manager Face-Scan Invite circulation token, guided mobile face enrollment camera. |
| **Sprint 3** | **Geofencing & Dynamic Work Modes** | ✅ **Completed** | 200m Haversine distance engine, default work mode + date-specific calendar overrides, high-accuracy GPS capture with mock location guard. |
| **Sprint 4** | **Real-Time Attendance Check-In & Liveness** | ✅ **Completed** | Live face scan capture, anti-spoofing liveness classifier, `pgvector` cosine similarity matching, attendance records persistence (`face_geo` vs `face_remote`), Mobile Camera HUD. |
| **Sprint 5** | **Management Portal & Leave Workflows** | Planned | Mobile Management Portal & Next.js Web Admin, live attendance logs, employee onboarding, date-specific remote overrides, leave requests & approvals. |
| **Sprint 6** | **Security Hardening, Biometric Benchmarking & QA** | Planned | FAR (<0.001%) / FRR (<1%) verification, GPS spoofing defense, session revocation on device switch, integration & E2E automated test suite. |

---

## Detailed Sprint Specifications

### Sprint 1: Database Schema, Auth, Device Binding & Dual-Portal Foundation
- **Goals**:
  - Connect backend to Render PostgreSQL.
  - Implement full schema using SQLAlchemy 2.0: `offices`, `users`, `biometric_profiles`, `user_devices`, `work_mode_overrides`, `face_scan_invites`, `attendance_records`, `leaves`.
  - Auth system: Password hashing (bcrypt), 15-minute Access JWT, 7-day Refresh Token rotation stored in database.
  - Device binding: Hardware ID (`device_id`), OS, model, and app version recorded on login.
  - Mobile Portal Shell: Role-based navigation routing between Employee Portal and Management Portal.
  - Mobile Local Authentication: Biometric login (Touch ID / Face ID / Fingerprint via `expo-local-authentication`).
- **Acceptance Criteria**:
  - Database connection to Render Postgres successfully executes migrations and queries.
  - `POST /api/auth/login` accepts email/password + device telemetry; returns access & 7-day refresh tokens.
  - `POST /api/auth/refresh` validates token and rotates refresh token securely.
  - Mobile app displays Biometric / Password login screen, saves refresh token to `SecureStore`, and routes user to appropriate portal based on role.

### Sprint 2: Face Embedding Engine & Reference Enrollment
- **Goals**:
  - Implement face detection & embedding extraction service in FastAPI using ArcFace (512-dimensional output).
  - Create `biometric_profiles` with `vector(512)` column and HNSW index (`embedding vector_cosine_ops`).
  - Management API: `POST /api/invites/face-scan` generates secure 48h invitation tokens.
  - Mobile Guided Enrollment: Camera screen capturing multi-angle face images, transmitting to backend for vectorization and storage.
- **Acceptance Criteria**:
  - High-quality reference images generate normalized 512D vectors stored in Render Postgres.
  - HNSW index accelerates vector cosine queries to under 50ms.
  - Invalid, blurred, or multi-face photos rejected with descriptive validation feedback.

### Sprint 3: Geofencing & Dynamic Work Modes
- **Goals**:
  - Backend Geofencing Service calculating Haversine distance between employee coordinates and assigned office coordinates.
  - Work Mode Resolver: Checks `work_mode_overrides` for today's date first; falls back to `users.default_work_mode`.
  - Mobile GPS Service (`expo-location`): Fetches precise latitude, longitude, and accuracy with anti-mock validation.
- **Acceptance Criteria**:
  - On-site mode: Checks if distance $\le 200\text{m}$. Rejects if $> 200\text{m}$.
  - Remote mode: Allows bypass of 200m constraint while logging coordinates for audit.
  - Date overrides (e.g., employee marked remote for tomorrow only) take precedence automatically.

### Sprint 4: Real-Time Attendance Check-In & Liveness ✅ **(Completed)**
- **Goals & Delivered Components**:
  - **Backend Attendance Verification Service** ([attendance_service.py](file:///Users/macbookpro/Desktop/projects/face-recognition/backend/app/services/attendance_service.py)):
    - Integrated ONNX/ArcFace 512D probe feature extraction with face blur & liveness validation ($\ge 0.75$).
    - `pgvector` Cosine Similarity Matching: Native SQLAlchemy 2.0 `BiometricProfile.embedding.cosine_distance(probe_vector)` against reference vectors.
    - Geofence enforcement: If worker is On-Site (evaluated dynamically via `work_mode_service`), rejects punches $> 200\text{m}$ from office. If Remote, allows punch and records coordinates for audit.
    - Endpoints: `POST /api/attendance/check-in`, `POST /api/attendance/check-out`, `GET /api/attendance/today/{user_id}`, `GET /api/attendance/history/{user_id}`.
  - **Mobile Attendance HUD & Camera** ([AttendanceCameraScreen.tsx](file:///Users/macbookpro/Desktop/projects/face-recognition/mobile/src/screens/AttendanceCameraScreen.tsx)):
    - Front/back camera toggle, biometric oval alignment guides, real-time GPS telemetry pill.
    - Single-tap verification sending frame + GPS coordinates + hardware device telemetry to backend.
    - Live visual feedback: Instant verification ring, similarity match %, and status toast.
  - **Employee Portal Dashboard** ([EmployeePortal.tsx](file:///Users/macbookpro/Desktop/projects/face-recognition/mobile/src/screens/EmployeePortal.tsx)):
    - Displays today's status (Pending Check-In / Present / Checked Out).
    - Blocks check-in button dynamically with distance alert if on-site worker is outside the 200m geofence radius.
    - One-tap Check-Out functionality and recent punch history list.
- **Acceptance Criteria Achieved**:
  - Live face matching above threshold (0.68) verifies against database reference embeddings and saves to `attendance_records`.
  - Spoofed or low-liveness images are rejected with 422 HTTP error.
  - On-site employees outside 200m boundary are rejected with distance breakdown.
  - Remote workers successfully check in from anywhere with `verification_type = 'face_remote'`.
  - All test suites passing (`pytest backend/tests/`).

### Sprint 5: Management Portal & Leave Workflows
- **Goals**:
  - Mobile Management Portal screens: Real-time attendance log, employee list, work mode assigner, leave approvals.
  - Web Next.js Dashboard: Roster management, interactive geofence radius map, CSV report export.
  - Leave workflow: Employees submit dates/reasons; Managers approve/reject; Approved leaves automatically exempt employees from attendance check-in.
- **Acceptance Criteria**:
  - Managers can toggle any employee to Remote for specific dates in 2 taps.
  - Leaves update status and reflect immediately across mobile and web interfaces.

### Sprint 6: Security Hardening, Biometric Benchmarking & QA
- **Goals**:
  - Biometric benchmarks: Evaluate FAR (<0.001%) and FRR (<1.0%).
  - Device security: Alert and revoke session if account is accessed from an untrusted device.
  - End-to-end integration test suite covering auth, geofencing edge cases (199m vs 201m), and token rotation.
- **Acceptance Criteria**:
  - Automated tests pass with 100% success rate on test database.
  - Production Docker setup and deployment documentation ready.
