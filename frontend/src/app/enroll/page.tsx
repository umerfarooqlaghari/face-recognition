"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface VerifyData {
  invite_token: string;
  user_id: string;
  employee_name: string;
  employee_code: string;
  expires_at: string;
  tenant_name?: string;
}

function EnrollContent() {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") || "";

  const [tokenInput, setTokenInput] = useState(tokenFromUrl);
  const [activeToken, setActiveToken] = useState(tokenFromUrl);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [employeeData, setEmployeeData] = useState<VerifyData | null>(null);

  // Camera & Capture states
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [enrollSuccess, setEnrollSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Verify invite token
  useEffect(() => {
    if (tokenFromUrl) {
      setTokenInput(tokenFromUrl);
      setActiveToken(tokenFromUrl);
      verifyToken(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  const verifyToken = async (tok: string) => {
    if (!tok.trim()) return;
    setLoadingVerify(true);
    setVerifyError(null);
    setEmployeeData(null);
    try {
      const res = await fetch(`${apiBaseUrl}/api/biometrics/invites/verify/${encodeURIComponent(tok.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Invalid or expired invitation token.");
      }
      setEmployeeData(data);
    } catch (err: any) {
      setVerifyError(err.message || "Failed to verify invitation token.");
    } finally {
      setLoadingVerify(false);
    }
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 720 }, height: { ideal: 720 } }
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      setCameraError(
        err.name === "NotAllowedError"
          ? "Camera permission denied. Please allow camera access in browser settings or upload a photo."
          : "Unable to start front camera. You can upload a photo below."
      );
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const takeSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        setCapturedBlob(blob);
        setCapturedPreview(URL.createObjectURL(blob));
        stopCamera();
      }
    }, "image/jpeg", 0.95);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCapturedBlob(file);
      setCapturedPreview(URL.createObjectURL(file));
      stopCamera();
    }
  };

  const handleRetake = () => {
    setCapturedBlob(null);
    setCapturedPreview(null);
    setSubmitError(null);
    startCamera();
  };

  const handleEnrollSubmit = async () => {
    if (!capturedBlob || !activeToken) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const formData = new FormData();
      formData.append("file", capturedBlob, "face_enroll.jpg");
      formData.append("invite_token", activeToken);

      const res = await fetch(`${apiBaseUrl}/api/biometrics/enroll`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Facial enrollment failed. Please ensure your face is well-lit and centered.");
      }

      setEnrollSuccess(true);
    } catch (err: any) {
      setSubmitError(err.message || "Failed to enroll biometric face profile.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ background: "#0b132b", minHeight: "100vh", color: "#f8fafc", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Header */}
      <header style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "16px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 1100, margin: "0 auto" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "#ffffff" }}>
          <Image src="/image.png" alt="AttendFace Logo" width={32} height={32} style={{ borderRadius: 8 }} />
          <div>
            <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: -0.3 }}>AttendFace</span>
            <span style={{ display: "block", fontSize: 10, color: "#38bdf8", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>Biometric Enrollment</span>
          </div>
        </Link>
        <Link href="/" style={{ fontSize: 13, color: "#94a3b8", textDecoration: "none" }}>
          Portal Sign In &rarr;
        </Link>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: 680, margin: "36px auto", padding: "0 20px 80px" }}>
        <div style={{ background: "rgba(30, 41, 59, 0.7)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: 16, padding: "32px 28px", boxShadow: "0 20px 40px -15px rgba(0,0,0,0.5)", backdropFilter: "blur(12px)" }}>
          
          {/* Headline */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, color: "#38bdf8" }}>
              Secure 3D ArcFace Registration
            </span>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#ffffff", margin: "8px 0 8px 0" }}>
              Employee Face Scan Enrollment
            </h1>
            <p style={{ fontSize: 14, color: "#94a3b8", margin: 0, lineHeight: 1.5 }}>
              Register your high-precision biometric reference for instant contactless attendance and office access.
            </p>
          </div>

          {/* Token verification input if no valid token in URL */}
          {!employeeData && !enrollSuccess && (
            <div style={{ marginBottom: 24, background: "rgba(15, 23, 42, 0.6)", padding: 20, borderRadius: 12, border: "1px solid rgba(255, 255, 255, 0.08)" }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#cbd5e1", marginBottom: 8 }}>
                Invitation Token / Security Key
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  placeholder="Paste your inv_... enrollment token here"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  style={{
                    flex: 1,
                    background: "rgba(0, 0, 0, 0.3)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: 8,
                    padding: "10px 14px",
                    color: "#ffffff",
                    fontSize: 13,
                    fontFamily: "monospace",
                    outline: "none",
                  }}
                />
                <button
                  onClick={() => {
                    setActiveToken(tokenInput);
                    verifyToken(tokenInput);
                  }}
                  disabled={loadingVerify || !tokenInput.trim()}
                  style={{
                    background: "#0284c7",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: 8,
                    padding: "10px 18px",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: loadingVerify ? "not-allowed" : "pointer",
                    opacity: loadingVerify ? 0.7 : 1,
                  }}
                >
                  {loadingVerify ? "Verifying..." : "Verify Token"}
                </button>
              </div>

              {verifyError && (
                <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 8, background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#fca5a5", fontSize: 13 }}>
                  &times; {verifyError}
                </div>
              )}
            </div>
          )}

          {/* Verified Employee Identity Card */}
          {employeeData && !enrollSuccess && (
            <div style={{ background: "rgba(2, 132, 199, 0.1)", border: "1px solid rgba(56, 189, 248, 0.25)", borderRadius: 12, padding: 18, marginBottom: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 11, color: "#38bdf8", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Identity Verified
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#ffffff", marginTop: 2 }}>
                    {employeeData.employee_name}
                  </div>
                  <div style={{ fontSize: 13, color: "#cbd5e1" }}>
                    Employee Code: <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#facc15" }}>{employeeData.employee_code}</span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>Invitation Valid Until</div>
                  <div style={{ fontSize: 12, color: "#34d399", fontWeight: 600 }}>
                    {new Date(employeeData.expires_at).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enrollment Steps & Capture */}
          {employeeData && !enrollSuccess && (
            <div>
              {/* Step indicator */}
              <div style={{ marginBottom: 20 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#ffffff" }}>
                  Step: Capture Facial Reference
                </span>
                <p style={{ fontSize: 13, color: "#94a3b8", margin: "4px 0 0 0" }}>
                  Ensure your face is well lit, looking directly ahead, without dark sunglasses or masks.
                </p>
              </div>

              {/* Camera Preview Area */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  maxWidth: 420,
                  height: 380,
                  margin: "0 auto 24px",
                  borderRadius: 16,
                  overflow: "hidden",
                  background: "#000000",
                  border: "2px solid rgba(56, 189, 248, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* Active Video */}
                {cameraActive && !capturedPreview && (
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transform: "scaleX(-1)",
                    }}
                  />
                )}

                {/* Oval Guide Overlay */}
                {cameraActive && !capturedPreview && (
                  <div
                    style={{
                      position: "absolute",
                      width: 220,
                      height: 290,
                      borderRadius: "50%",
                      border: "2px dashed rgba(56, 189, 248, 0.8)",
                      pointerEvents: "none",
                      boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.45)",
                    }}
                  />
                )}

                {/* Captured Image Preview */}
                {capturedPreview && (
                  <img
                    src={capturedPreview}
                    alt="Captured Face"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                )}

                {/* Camera Inactive placeholder */}
                {!cameraActive && !capturedPreview && (
                  <div style={{ textAlign: "center", padding: 24 }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>📷</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#f8fafc" }}>
                      Camera Currently Inactive
                    </div>
                    <p style={{ fontSize: 13, color: "#94a3b8", margin: "6px 0 16px" }}>
                      Start your camera to frame your face, or select a photo from your gallery.
                    </p>
                    <button
                      onClick={startCamera}
                      style={{
                        background: "#0284c7",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: 8,
                        padding: "10px 20px",
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: "pointer",
                      }}
                    >
                      Start Camera
                    </button>
                  </div>
                )}
              </div>

              {cameraError && (
                <div style={{ padding: 12, borderRadius: 8, background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#fca5a5", fontSize: 13, marginBottom: 16 }}>
                  {cameraError}
                </div>
              )}

              {/* Controls */}
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 20 }}>
                {cameraActive && !capturedPreview && (
                  <button
                    onClick={takeSnapshot}
                    style={{
                      background: "#38bdf8",
                      color: "#0f172a",
                      border: "none",
                      borderRadius: 10,
                      padding: "12px 28px",
                      fontWeight: 800,
                      fontSize: 14,
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(56, 189, 248, 0.4)",
                    }}
                  >
                    Capture Reference Photo
                  </button>
                )}

                {capturedPreview && (
                  <>
                    <button
                      onClick={handleRetake}
                      style={{
                        background: "rgba(255, 255, 255, 0.1)",
                        color: "#ffffff",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        borderRadius: 8,
                        padding: "10px 20px",
                        fontWeight: 600,
                        fontSize: 13,
                        cursor: "pointer",
                      }}
                    >
                      Retake
                    </button>
                    <button
                      onClick={handleEnrollSubmit}
                      disabled={submitting}
                      style={{
                        background: "#10b981",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: 8,
                        padding: "10px 26px",
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: submitting ? "not-allowed" : "pointer",
                        opacity: submitting ? 0.7 : 1,
                      }}
                    >
                      {submitting ? "Extracting 512D Vector..." : "Confirm & Enroll Face"}
                    </button>
                  </>
                )}

                {/* Upload from file button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    background: "transparent",
                    color: "#94a3b8",
                    border: "1px dashed rgba(255, 255, 255, 0.3)",
                    borderRadius: 8,
                    padding: "10px 18px",
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  Upload Photo File
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                />
              </div>

              {submitError && (
                <div style={{ padding: 12, borderRadius: 8, background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#fca5a5", fontSize: 13, textAlign: "center" }}>
                  &times; {submitError}
                </div>
              )}
            </div>
          )}

          {/* Success Screen */}
          {enrollSuccess && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(16, 185, 129, 0.2)", border: "2px solid #10b981", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 32, color: "#10b981" }}>
                ✓
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: "#ffffff", marginBottom: 8 }}>
                Biometric Enrollment Complete!
              </h2>
              <p style={{ fontSize: 14, color: "#94a3b8", maxWidth: 480, margin: "0 auto 24px", lineHeight: 1.6 }}>
                Your facial biometric vector (512D ArcFace representation) has been securely registered in your organization profile. You are all set to check in using face verification.
              </p>

              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <a
                  href={`attendapp://enroll?token=${encodeURIComponent(activeToken)}`}
                  style={{
                    background: "#0284c7",
                    color: "#ffffff",
                    textDecoration: "none",
                    borderRadius: 8,
                    padding: "12px 24px",
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  Open Attendance Mobile App
                </a>
                <Link
                  href="/"
                  style={{
                    background: "rgba(255, 255, 255, 0.1)",
                    color: "#ffffff",
                    textDecoration: "none",
                    borderRadius: 8,
                    padding: "12px 24px",
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  Web Portal Sign In
                </Link>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default function EnrollPage() {
  return (
    <Suspense fallback={<div style={{ color: "#fff", padding: 40, textAlign: "center" }}>Loading enrollment portal...</div>}>
      <EnrollContent />
    </Suspense>
  );
}
