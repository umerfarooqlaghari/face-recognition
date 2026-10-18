"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import styles from "./page.module.css";

// ==============================================================================
// Crisp Modern SVG Icon System (Zero Emojis)
// ==============================================================================

const ShieldIcon = ({ size = 20, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const UsersIcon = ({ size = 18, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const UserPlusIcon = ({ size = 18, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <line x1="20" y1="8" x2="20" y2="14" />
    <line x1="23" y1="11" x2="17" y2="11" />
  </svg>
);

const CalendarIcon = ({ size = 18, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ClockIcon = ({ size = 18, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const FileTextIcon = ({ size = 18, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const BuildingIcon = ({ size = 18, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
    <path d="M9 22v-4h6v4" />
    <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
  </svg>
);

const CheckCircleIcon = ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const XCircleIcon = ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

const AlertCircleIcon = ({ size = 18, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const LocationPinIcon = ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const DownloadIcon = ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const RefreshIcon = ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

const PlusIcon = ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const CloseIcon = ({ size = 18, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const LogOutIcon = ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const MailIcon = ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const CopyIcon = ({ size = 14, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const LockIcon = ({ size = 14, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const TrashIcon = ({ size = 14, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const PencilIcon = ({ size = 14, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

const ZapIcon = ({ size = 14, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const CreditCardIcon = ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

const UploadCloudIcon = ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16" />
    <line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    <polyline points="16 16 12 12 8 16" />
  </svg>
);

const AlertTriangleIcon = ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const ArrowLeftIcon = ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const ChevronLeftIcon = ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRightIcon = ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const OfficeMapPicker = dynamic(() => import("./components/OfficeMapPicker"), {
  ssr: false,
  loading: () => (
    <div style={{ height: 240, background: "rgba(15, 23, 42, 0.8)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", border: "1px solid rgba(255,255,255,0.08)" }}>
      Loading Interactive Geofence Map...
    </div>
  ),
});

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function Home() {
  // Authentication & Tenant State
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [tenantStats, setTenantStats] = useState<any | null>(null);

  // Auth Modes & Form Fields
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [officeName, setOfficeName] = useState("Headquarters");

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<
    "employees" | "leaves" | "attendance_requests" | "timesheets" | "offices" | "billing"
  >("employees");

  // Stripe Billing & Subscription State ($2/user/month, 14-day trial)
  const [billingInfo, setBillingInfo] = useState<any | null>(null);
  const [billingLoading, setBillingLoading] = useState(false);

  // Core Data Lists
  const [employees, setEmployees] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [regularizationRequests, setRegularizationRequests] = useState<any[]>([]);
  const [timesheets, setTimesheets] = useState<any[]>([]);
  const [offices, setOffices] = useState<any[]>([]);

  // Filtering & Query States
  const [searchQuery, setSearchQuery] = useState("");
  const [workModeFilter, setWorkModeFilter] = useState<string>("all");
  const [leaveStatusFilter, setLeaveStatusFilter] = useState<string>("all");
  const [regularizeStatusFilter, setRegularizeStatusFilter] = useState<string>("all");
  const [timesheetDateFilter, setTimesheetDateFilter] = useState<string>("all");

  // UI Modals
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showRegularizeModal, setShowRegularizeModal] = useState(false);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [showOfficeModal, setShowOfficeModal] = useState(false);

  // Add Employee Form State
  const [empFirstName, setEmpFirstName] = useState("");
  const [empLastName, setEmpLastName] = useState("");
  const [empDepartment, setEmpDepartment] = useState("Engineering");
  const [empDesignation, setEmpDesignation] = useState("Software Engineer");
  const [empPhoneNumber, setEmpPhoneNumber] = useState("");
  const [empFullName, setEmpFullName] = useState("");
  const [empEmail, setEmpEmail] = useState("");
  const [empCode, setEmpCode] = useState("");
  const [empWorkMode, setEmpWorkMode] = useState<"on_site" | "remote">("on_site");
  const [empOfficeId, setEmpOfficeId] = useState("");
  const [empRole, setEmpRole] = useState("employee");
  const [empManagerId, setEmpManagerId] = useState("");
  const [createdEmployeeResult, setCreatedEmployeeResult] = useState<any | null>(null);

  // CSV Import Wizard State
  const [showImportModal, setShowImportModal] = useState(false);
  const [importStep, setImportStep] = useState<1 | 2 | 3>(1);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importDragging, setImportDragging] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState("");
  const [importPreview, setImportPreview] = useState<{
    total_rows: number;
    valid_rows: number;
    invalid_rows: number;
    preview: Array<{
      row: number;
      first_name?: string | null;
      last_name?: string | null;
      email?: string | null;
      employee_code?: string | null;
      department?: string | null;
      designation?: string | null;
      phone_number?: string | null;
      work_mode?: string | null;
      valid: boolean;
      is_duplicate: boolean;
      errors: string[];
    }>;
  } | null>(null);
  const [importResult, setImportResult] = useState<{
    total_rows: number;
    created: number;
    skipped: number;
    created_records: Array<{
      row: number;
      employee_code: string;
      first_name: string;
      last_name: string;
      email: string;
    }>;
    skipped_records: Array<{
      row: number;
      first_name: string;
      last_name: string;
      email: string;
      reason: string;
    }>;
  } | null>(null);

  // Edit Employee Modal State
  const [showEditEmployeeModal, setShowEditEmployeeModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any | null>(null);
  const [editEmpFirstName, setEditEmpFirstName] = useState("");
  const [editEmpLastName, setEditEmpLastName] = useState("");
  const [editEmpDepartment, setEditEmpDepartment] = useState("");
  const [editEmpDesignation, setEditEmpDesignation] = useState("");
  const [editEmpPhoneNumber, setEditEmpPhoneNumber] = useState("");
  const [editEmpWorkMode, setEditEmpWorkMode] = useState<"on_site" | "remote">("on_site");
  const [editEmpRole, setEditEmpRole] = useState("employee");
  const [editEmpOfficeId, setEditEmpOfficeId] = useState("");
  const [editEmpManagerId, setEditEmpManagerId] = useState("");

  // Leave Form State
  const [leaveUserId, setLeaveUserId] = useState("");
  const [leaveType, setLeaveType] = useState("Annual Leave");
  const [leaveStartDate, setLeaveStartDate] = useState("");
  const [leaveEndDate, setLeaveEndDate] = useState("");
  const [leaveReason, setLeaveReason] = useState("");

  // Attendance Regularization Form State
  const [regUserId, setRegUserId] = useState("");
  const [regDate, setRegDate] = useState("");
  const [regCheckInTime, setRegCheckInTime] = useState("09:00");
  const [regCheckOutTime, setRegCheckOutTime] = useState("17:30");
  const [regReasonSelect, setRegReasonSelect] = useState("Battery Depleted");
  const [regReasonNotes, setRegReasonNotes] = useState("");

  // Work Mode Override Form State
  const [overrideEmployee, setOverrideEmployee] = useState<any | null>(null);
  const [overrideDate, setOverrideDate] = useState("");
  const [overrideMode, setOverrideMode] = useState<"remote" | "on_site">("remote");
  const [overrideReason, setOverrideReason] = useState("");

  // Add Office Form State
  const [newOfficeName, setNewOfficeName] = useState("");
  const [newOfficeLat, setNewOfficeLat] = useState("24.8607");
  const [newOfficeLng, setNewOfficeLng] = useState("67.0011");
  const [newOfficeRadius, setNewOfficeRadius] = useState("200");
  const [newOfficeAddress, setNewOfficeAddress] = useState("");

  // Attendance Calendar Modal State
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [calendarEmployee, setCalendarEmployee] = useState<any | null>(null);
  const [calendarYear, setCalendarYear] = useState<number>(2026);
  const [calendarMonth, setCalendarMonth] = useState<number>(10);
  const [calendarData, setCalendarData] = useState<any | null>(null);
  const [calendarLoading, setCalendarLoading] = useState(false);

  // Employee Shift Override Modal State
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [shiftEmployee, setShiftEmployee] = useState<any | null>(null);
  const [shiftName, setShiftName] = useState("");
  const [shiftStartTime, setShiftStartTime] = useState("09:00");
  const [shiftEndTime, setShiftEndTime] = useState("18:00");
  const [shiftGraceMinutes, setShiftGraceMinutes] = useState(15);
  const [shiftTimezone, setShiftTimezone] = useState("Asia/Karachi");
  const [shiftIsCustom, setShiftIsCustom] = useState(true);
  const [shiftSaving, setShiftSaving] = useState(false);

  // Tenant / Company Timings State
  const [defaultWorkStartTime, setDefaultWorkStartTime] = useState("09:00");
  const [defaultWorkEndTime, setDefaultWorkEndTime] = useState("18:00");
  const [defaultGracePeriodMinutes, setDefaultGracePeriodMinutes] = useState(15);
  const [defaultTimezone, setDefaultTimezone] = useState("Asia/Karachi");
  const [tenantTimingsSaving, setTenantTimingsSaving] = useState(false);

  // Office Timings Modal State
  const [showOfficeTimingsModal, setShowOfficeTimingsModal] = useState(false);
  const [selectedOfficeForTiming, setSelectedOfficeForTiming] = useState<any | null>(null);
  const [officeTimingStart, setOfficeTimingStart] = useState("09:00");
  const [officeTimingEnd, setOfficeTimingEnd] = useState("18:00");
  const [officeTimingGrace, setOfficeTimingGrace] = useState(15);
  const [officeTimingTimezone, setOfficeTimingTimezone] = useState("Asia/Karachi");
  const [officeTimingSaving, setOfficeTimingSaving] = useState(false);

  // Batch Late Digest State
  const [lateDigestSending, setLateDigestSending] = useState(false);

  // Self Attendance (Web Check-Out)
  const [myTodayAttendance, setMyTodayAttendance] = useState<any | null>(null);
  const [checkingOutSelf, setCheckingOutSelf] = useState(false);

  // Feedback Toasts & Loading States
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // 1. Initial Load: Retrieve stored session & dates
  useEffect(() => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    setRegDate(todayStr);
    setLeaveStartDate(todayStr);
    setCalendarYear(today.getFullYear());
    setCalendarMonth(today.getMonth() + 1);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setLeaveEndDate(tomorrow.toISOString().split("T")[0]);
    setOverrideDate(todayStr);

    const savedToken = localStorage.getItem("attend_token");
    const savedUser = localStorage.getItem("attend_user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        // ignore parse
      }
    }
  }, []);

  // 2. Fetch all organization data when token is available
  useEffect(() => {
    if (token) {
      fetchAllData();
    }
  }, [token]);

  const fetchAllData = async () => {
    fetchTenantStats();
    fetchEmployees();
    fetchLeaves();
    fetchRegularizationRequests();
    fetchTimesheets();
    fetchOffices();
    fetchBillingStatus();
    fetchTodayAttendance();
  };

  const fetchTenantStats = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/management/tenant`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTenantStats(data);
        if (data.default_work_start_time) setDefaultWorkStartTime(data.default_work_start_time);
        if (data.default_work_end_time) setDefaultWorkEndTime(data.default_work_end_time);
        if (data.default_grace_period_minutes != null) setDefaultGracePeriodMinutes(data.default_grace_period_minutes);
        if (data.default_timezone) setDefaultTimezone(data.default_timezone);
      }
    } catch {
      // ignore
    }
  };

  const fetchTodayAttendance = async () => {
    const rawUser = localStorage.getItem("attend_user");
    let uId = user?.id;
    if (!uId && rawUser) {
      try {
        uId = JSON.parse(rawUser)?.id;
      } catch {}
    }
    if (!uId) return;

    try {
      const res = await fetch(`${API_BASE_URL}/attendance/today/${uId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMyTodayAttendance(data);
      }
    } catch {
      // ignore
    }
  };

  const handleWebCheckOut = async () => {
    try {
      setCheckingOutSelf(true);
      const res = await fetch(`${API_BASE_URL}/attendance/check-out`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to check out");
      }
      showToast(
        data.hours_worked != null
          ? `Checked out successfully! Total worked: ${data.hours_worked} hrs.`
          : "Checked out successfully!"
      );
      fetchTodayAttendance();
      fetchTimesheets();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setCheckingOutSelf(false);
    }
  };

  const fetchCalendar = async (userId: string, year: number, month: number) => {
    try {
      setCalendarLoading(true);
      const res = await fetch(`${API_BASE_URL}/attendance/calendar/${userId}?year=${year}&month=${month}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to load employee attendance calendar");
      }
      setCalendarData(data);
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setCalendarLoading(false);
    }
  };

  const handleOpenCalendar = (emp: any) => {
    setCalendarEmployee(emp);
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth() + 1;
    setCalendarYear(curYear);
    setCalendarMonth(curMonth);
    setShowCalendarModal(true);
    fetchCalendar(emp.id, curYear, curMonth);
  };

  const handlePrevMonth = () => {
    if (!calendarEmployee) return;
    let nextMonth = calendarMonth - 1;
    let nextYear = calendarYear;
    if (nextMonth < 1) {
      nextMonth = 12;
      nextYear -= 1;
    }
    setCalendarYear(nextYear);
    setCalendarMonth(nextMonth);
    fetchCalendar(calendarEmployee.id, nextYear, nextMonth);
  };

  const handleNextMonth = () => {
    if (!calendarEmployee) return;
    let nextMonth = calendarMonth + 1;
    let nextYear = calendarYear;
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    }
    setCalendarYear(nextYear);
    setCalendarMonth(nextMonth);
    fetchCalendar(calendarEmployee.id, nextYear, nextMonth);
  };

  const handleOpenShiftModal = (emp: any) => {
    setShiftEmployee(emp);
    const shift = emp.shift_config || {};
    setShiftIsCustom(shift.is_custom ?? false);
    setShiftName(shift.shift_name || "");
    setShiftStartTime(shift.work_start_time || defaultWorkStartTime || "09:00");
    setShiftEndTime(shift.work_end_time || defaultWorkEndTime || "18:00");
    setShiftGraceMinutes(shift.grace_period_minutes ?? defaultGracePeriodMinutes ?? 15);
    setShiftTimezone(shift.timezone || defaultTimezone || "Asia/Karachi");
    setShowShiftModal(true);
  };

  const handleSaveShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftEmployee) return;
    try {
      setShiftSaving(true);
      const payload = shiftIsCustom
        ? {
            shift_name: shiftName.trim() || "Custom Shift",
            work_start_time: shiftStartTime,
            work_end_time: shiftEndTime,
            grace_period_minutes: Number(shiftGraceMinutes),
            timezone: shiftTimezone,
          }
        : {
            shift_name: null,
            work_start_time: null,
            work_end_time: null,
            grace_period_minutes: null,
            timezone: null,
          };
      const res = await fetch(`${API_BASE_URL}/management/employees/${shiftEmployee.id}/shift`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to update employee shift");
      }
      showToast(`Updated shift timing for ${shiftEmployee.full_name}.`);
      setShowShiftModal(false);
      fetchEmployees();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setShiftSaving(false);
    }
  };

  const handleSaveTenantTimings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setTenantTimingsSaving(true);
      const res = await fetch(`${API_BASE_URL}/management/tenant/timings`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          default_timezone: defaultTimezone,
          default_work_start_time: defaultWorkStartTime,
          default_work_end_time: defaultWorkEndTime,
          default_grace_period_minutes: Number(defaultGracePeriodMinutes),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to update company office timings");
      }
      showToast("Company default office timings & grace period saved.");
      fetchTenantStats();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setTenantTimingsSaving(false);
    }
  };

  const handleOpenOfficeTimingModal = (office: any) => {
    setSelectedOfficeForTiming(office);
    setOfficeTimingStart(office.work_start_time || defaultWorkStartTime || "09:00");
    setOfficeTimingEnd(office.work_end_time || defaultWorkEndTime || "18:00");
    setOfficeTimingGrace(office.grace_period_minutes ?? defaultGracePeriodMinutes ?? 15);
    setOfficeTimingTimezone(office.timezone || defaultTimezone || "Asia/Karachi");
    setShowOfficeTimingsModal(true);
  };

  const handleSaveOfficeTimings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOfficeForTiming) return;
    try {
      setOfficeTimingSaving(true);
      const res = await fetch(`${API_BASE_URL}/management/offices/${selectedOfficeForTiming.id}/timings`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          work_start_time: officeTimingStart,
          work_end_time: officeTimingEnd,
          grace_period_minutes: Number(officeTimingGrace),
          timezone: officeTimingTimezone,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to update office timing");
      }
      showToast(`Campus "${selectedOfficeForTiming.name}" timings updated.`);
      setShowOfficeTimingsModal(false);
      fetchOffices();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setOfficeTimingSaving(false);
    }
  };

  const handleSendLateDigest = async () => {
    try {
      setLateDigestSending(true);
      const res = await fetch(`${API_BASE_URL}/attendance/send-late-digest`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to dispatch late arrivals digest");
      }
      showToast(data.message || `Dispatched late arrivals digest (${data.late_employees_count} late employees).`);
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLateDigestSending(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/management/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setEmployees(data);
      }
    } catch {
      // ignore
    }
  };

  const fetchLeaves = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/leaves/tenant-leaves`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLeaves(data);
      }
    } catch {
      // ignore
    }
  };

  const fetchRegularizationRequests = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/attendance/tenant-regularization-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRegularizationRequests(data);
      }
    } catch {
      // ignore
    }
  };

  const fetchTimesheets = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/attendance/timesheets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTimesheets(data);
      }
    } catch {
      // ignore
    }
  };

  const fetchOffices = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/management/offices`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOffices(data);
        if (data.length > 0 && !empOfficeId) {
          setEmpOfficeId(data[0].id);
        }
      }
    } catch {
      // ignore
    }
  };

  const fetchBillingStatus = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/billing/subscription-status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBillingInfo(data);
      }
    } catch {
      // ignore
    }
  };

  const handleStartSubscription = async () => {
    try {
      setBillingLoading(true);
      const res = await fetch(`${API_BASE_URL}/billing/create-checkout-session`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to initiate Stripe Checkout session");
      }
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    } catch (err: any) {
      showToast(err.message || "Failed to connect to Stripe Checkout", "error");
    } finally {
      setBillingLoading(false);
    }
  };

  const handleOpenCustomerPortal = async () => {
    try {
      setBillingLoading(true);
      const res = await fetch(`${API_BASE_URL}/billing/create-portal-session`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to access Stripe Customer Portal");
      }
      if (data.portal_url) {
        window.location.href = data.portal_url;
      }
    } catch (err: any) {
      showToast(err.message || "Failed to open Stripe Customer Portal", "error");
    } finally {
      setBillingLoading(false);
    }
  };

  // ==============================================================================
  // Authentication Handlers
  // ==============================================================================

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail.trim(),
          password: loginPassword,
          device: {
            device_id: `web-${Date.now()}`,
            device_model: "Next.js Web Portal",
            os_name: "Web",
            os_version: "1.0",
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Authentication failed");

      setToken(data.access_token);
      setUser(data.user);
      localStorage.setItem("attend_token", data.access_token);
      localStorage.setItem("attend_user", JSON.stringify(data.user));
      showToast(`Welcome back, ${data.user.full_name}!`);
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSignupTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/tenant/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: companyName.trim(),
          admin_name: adminName.trim(),
          admin_email: adminEmail.trim(),
          admin_password: adminPassword,
          office_name: officeName.trim() || "Headquarters",
          office_latitude: 24.8607,
          office_longitude: 67.0011,
          office_radius_meters: 200,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Organization setup failed");

      setToken(data.access_token);
      setUser(data.user);
      localStorage.setItem("attend_token", data.access_token);
      localStorage.setItem("attend_user", JSON.stringify(data.user));
      showToast(`Organization "${companyName}" created successfully!`);
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setTenantStats(null);
    setEmployees([]);
    setLeaves([]);
    setRegularizationRequests([]);
    setTimesheets([]);
    localStorage.removeItem("attend_token");
    localStorage.removeItem("attend_user");
    showToast("Signed out successfully.");
  };

  // ==============================================================================
  // Action Handlers
  // ==============================================================================

  // 1. Add Employee via Form Modal
  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    const fName = empFirstName.trim();
    const lName = empLastName.trim();
    const resolvedFullName = (fName && lName ? `${fName} ${lName}` : empFullName.trim()) || fName;

    if (!resolvedFullName) {
      showToast("Please enter employee first and last name", "error");
      return;
    }
    if (!empEmail.trim() || !empEmail.includes("@")) {
      showToast("Please enter a valid work email address", "error");
      return;
    }
    if (empWorkMode === "on_site" && offices.length > 0 && !empOfficeId) {
      showToast("Please select an office campus for this on-site employee", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/management/employees`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: resolvedFullName,
          first_name: fName || undefined,
          last_name: lName || undefined,
          department: empDepartment.trim() || "General",
          designation: empDesignation.trim() || "Team Member",
          phone_number: empPhoneNumber.trim() || undefined,
          email: empEmail.trim().toLowerCase(),
          employee_code: empCode.trim() || undefined,
          default_work_mode: empWorkMode,
          office_id: empWorkMode === "on_site" ? (empOfficeId || offices[0]?.id) : null,
          manager_id: empManagerId || undefined,
          role: empRole,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to add employee");

      setCreatedEmployeeResult(data);
      fetchEmployees();
      fetchTenantStats();
      showToast(`Employee "${resolvedFullName}" successfully registered!`);
      // Reset input form
      setEmpFirstName("");
      setEmpLastName("");
      setEmpFullName("");
      setEmpEmail("");
      setEmpPhoneNumber("");
      setEmpCode("");
      setEmpManagerId("");
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // 1a-2. CSV Import Flow Handlers
  const handleDownloadImportTemplate = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/management/employees/import/template`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to download CSV template");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "employee_import_template.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      showToast(err.message || "Failed to download template", "error");
    }
  };

  const handleImportFileSelect = (f: File) => {
    if (!f.name.toLowerCase().endsWith(".csv")) {
      setImportError("Please select a valid CSV file (.csv).");
      return;
    }
    setImportFile(f);
    setImportError("");
  };

  const handleImportPreviewSubmit = async () => {
    if (!importFile) {
      setImportError("Please select a CSV file first.");
      return;
    }
    setImportLoading(true);
    setImportError("");
    try {
      const fd = new FormData();
      fd.append("csv", importFile);
      const res = await fetch(`${API_BASE_URL}/management/employees/import/preview`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to analyze CSV file.");
      }
      setImportPreview(data);
      setImportStep(2);
    } catch (err: any) {
      setImportError(err.message || "Preview failed. Please check your CSV.");
    } finally {
      setImportLoading(false);
    }
  };

  const handleImportCommitSubmit = async () => {
    if (!importFile) return;
    setImportLoading(true);
    setImportError("");
    try {
      const fd = new FormData();
      fd.append("csv", importFile);
      const res = await fetch(`${API_BASE_URL}/management/employees/import`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Import failed. Please try again.");
      }
      setImportResult(data);
      setImportStep(3);
      fetchEmployees();
      fetchTenantStats();
      showToast(`Import completed: ${data.created} created, ${data.skipped} skipped.`);
    } catch (err: any) {
      setImportError(err.message || "Import failed. Please try again.");
    } finally {
      setImportLoading(false);
    }
  };

  const handleImportReset = () => {
    setImportFile(null);
    setImportPreview(null);
    setImportResult(null);
    setImportError("");
    setImportStep(1);
  };

  const handleImportClose = () => {
    setShowImportModal(false);
    handleImportReset();
  };

  // 1b. Update Employee (Profile, Role, Office, Manager)
  const handleUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;

    const fName = editEmpFirstName.trim();
    const lName = editEmpLastName.trim();
    const resolvedFullName = fName && lName ? `${fName} ${lName}` : (fName || editingEmployee.full_name);

    if (editEmpWorkMode === "on_site" && offices.length > 0 && !editEmpOfficeId) {
      showToast("Please select an office campus for this on-site employee", "error");
      return;
    }

    // Protect super_admin self demotion
    const isSelf = editingEmployee.id === user?.id;
    const targetRole = isSelf && user?.role === "super_admin" ? "super_admin" : editEmpRole;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/management/employees/${editingEmployee.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: resolvedFullName,
          first_name: fName || undefined,
          last_name: lName || undefined,
          department: editEmpDepartment.trim() || undefined,
          designation: editEmpDesignation.trim() || undefined,
          phone_number: editEmpPhoneNumber.trim() || undefined,
          role: targetRole,
          default_work_mode: editEmpWorkMode,
          office_id: editEmpWorkMode === "remote" ? null : (editEmpOfficeId || null),
          manager_id: editEmpManagerId || null,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.detail || "Failed to update employee");
      }
      showToast(`Employee "${resolvedFullName}" profile updated.`);
      setShowEditEmployeeModal(false);
      setEditingEmployee(null);
      fetchEmployees();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // 2. Delete Employee
  const handleDeleteEmployee = async (employeeId: string, empName: string) => {
    if (!confirm(`Are you sure you want to remove ${empName} from the organization?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/management/employees/${employeeId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.detail || "Failed to delete employee");
      }
      showToast(`Removed ${empName}.`);
      fetchEmployees();
      fetchTenantStats();
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  // 3. Request Leave
  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/leaves/apply`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          start_date: leaveStartDate,
          end_date: leaveEndDate,
          leave_type: leaveType,
          reason: leaveReason.trim(),
          user_id: leaveUserId || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to submit leave");

      setShowLeaveModal(false);
      setLeaveReason("");
      fetchLeaves();
      showToast("Leave application submitted.");
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // 4. Review Leave (Approve / Reject / Admin Bypass)
  const handleReviewLeave = async (
    leaveId: string,
    statusVal: "approved" | "rejected" | "bypass",
    bypass: boolean = false,
    reviewNote?: string
  ) => {
    try {
      const res = await fetch(`${API_BASE_URL}/leaves/${leaveId}/review`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: statusVal,
          bypass: bypass,
          review_note: reviewNote,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.detail || "Failed to review leave");
      }
      showToast(
        statusVal === "bypass"
          ? "Leave approved directly via Admin Bypass (skipping Level 1)."
          : statusVal === "approved"
            ? "Leave approval updated."
            : `Leave application marked as ${statusVal}.`
      );
      fetchLeaves();
      fetchTimesheets();
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  // 5. Request Attendance Regularization (Missed Punch)
  const handleApplyRegularization = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fullReason = `${regReasonSelect}: ${regReasonNotes.trim()}`;
      const res = await fetch(`${API_BASE_URL}/attendance/regularize`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: regDate,
          check_in_time: regCheckInTime,
          check_out_time: regCheckOutTime,
          reason: fullReason,
          user_id: regUserId || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to submit attendance request");

      setShowRegularizeModal(false);
      setRegReasonNotes("");
      fetchRegularizationRequests();
      showToast("Missed attendance regularization request submitted.");
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // 6. Review Attendance Regularization (Approve / Reject)
  const handleReviewRegularization = async (
    requestId: string,
    statusVal: "approved" | "rejected"
  ) => {
    try {
      const res = await fetch(`${API_BASE_URL}/attendance/regularization-requests/${requestId}/review`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: statusVal,
          reviewer_note: `Reviewed on ${new Date().toLocaleDateString()}`,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.detail || "Failed to review request");
      }
      showToast(`Attendance regularization marked as ${statusVal}. Attendance record updated!`);
      fetchRegularizationRequests();
      fetchTimesheets();
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  // 7. Work Mode Override
  const handleSetOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideEmployee) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/work-modes/overrides`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: overrideEmployee.id,
          effective_date: overrideDate,
          assigned_mode: overrideMode,
          reason: overrideReason.trim() || "Administrative override",
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.detail || "Failed to set override");
      }
      showToast(`Override assigned: ${overrideEmployee.full_name} is ${overrideMode} on ${overrideDate}.`);
      setShowOverrideModal(false);
      setOverrideReason("");
      fetchEmployees();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // 8. Add Office Geofence
  const handleCreateOffice = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/management/offices`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newOfficeName.trim(),
          latitude: parseFloat(newOfficeLat),
          longitude: parseFloat(newOfficeLng),
          radius_meters: parseInt(newOfficeRadius, 10) || 200,
          address: newOfficeAddress.trim(),
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.detail || "Failed to create office location");
      }
      showToast(`Office campus "${newOfficeName}" registered.`);
      setShowOfficeModal(false);
      setNewOfficeName("");
      fetchOffices();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // 8b. Delete Office Geofence
  const handleDeleteOffice = async (officeId: string, officeName: string) => {
    if (!confirm(`Are you sure you want to remove office location "${officeName}"?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/work-modes/offices/${officeId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.detail || "Failed to delete office location");
      }
      showToast(`Office location "${officeName}" deleted.`);
      fetchOffices();
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  // 9. Resend Invite Token
  const handleResendInvite = async (empId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/management/employees/${empId}/resend-invite`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to resend credentials");
      showToast(`Sent AWS SES credentials to employee.`);
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  // 10. Timesheet CSV Export
  const handleExportCSV = () => {
    if (timesheets.length === 0) {
      showToast("No timesheet records to export.", "error");
      return;
    }
    const headers = [
      "Date",
      "Employee Name",
      "Employee Code",
      "Office",
      "Check-In Time",
      "Check-Out Time",
      "Duration (Hours)",
      "Method",
      "Similarity Match",
      "Status",
    ];

    const rows = filteredTimesheets.map((t) => [
      t.date,
      `"${t.employee_name}"`,
      t.employee_code,
      `"${t.office_name || "Headquarters"}"`,
      t.check_in_time ? new Date(t.check_in_time).toLocaleTimeString() : "N/A",
      t.check_out_time ? new Date(t.check_out_time).toLocaleTimeString() : "Pending",
      t.duration_hours !== null && t.duration_hours !== undefined ? `${t.duration_hours}h` : "N/A",
      t.verification_type,
      `${(t.similarity_score * 100).toFixed(1)}%`,
      t.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `timesheet_audit_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Downloaded timesheet CSV report.");
  };

  // ==============================================================================
  // Filtered Collections
  // ==============================================================================

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employee_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMode =
      workModeFilter === "all" || emp.default_work_mode === workModeFilter;
    return matchesSearch && matchesMode;
  });

  const filteredLeaves = leaves.filter((lv) => {
    if (leaveStatusFilter === "all") return true;
    return lv.status === leaveStatusFilter;
  });

  const filteredRegularization = regularizationRequests.filter((req) => {
    if (regularizeStatusFilter === "all") return true;
    return req.status === regularizeStatusFilter;
  });

  const filteredTimesheets = timesheets.filter((t) => {
    if (timesheetDateFilter === "all") return true;
    const todayStr = new Date().toISOString().split("T")[0];
    if (timesheetDateFilter === "today") return t.date === todayStr;
    return true;
  });

  // ==============================================================================
  // Unauthenticated View: Sign In / Organization Signup
  // ==============================================================================

  if (!token) {
    return (
      <div style={{ background: "#ffffff", minHeight: "100vh", color: "#0f172a", fontFamily: "system-ui, -apple-system, sans-serif" }}>
        {/* Modern Clean Header */}
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 50,
            background: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid #f1f5f9",
            padding: "16px 36px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            maxWidth: 1320,
            margin: "0 auto",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Image
              src="/image.png"
              alt="AttendFace AI Attendance System Logo"
              width={38}
              height={38}
              style={{ borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
              priority
            />
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", letterSpacing: -0.3 }}>
                AttendFace <span style={{ color: "#4f46e5" }}>AI</span>
              </div>
              <div style={{ fontSize: 11, color: "#64748b", fontWeight: 500 }}>
                Enterprise Face Recognition & Geofencing
              </div>
            </div>
          </div>

          <nav style={{ display: "flex", alignItems: "center", gap: 28 }}>
            <a href="#features" style={{ fontSize: 14, color: "#475569", textDecoration: "none", fontWeight: 500 }}>
              Features
            </a>
            <a href="#technology" style={{ fontSize: 14, color: "#475569", textDecoration: "none", fontWeight: 500 }}>
              AI Biometrics
            </a>
            <a href="#pricing" style={{ fontSize: 14, color: "#475569", textDecoration: "none", fontWeight: 500 }}>
              Pricing
            </a>
            <Link href="/support" style={{ fontSize: 14, color: "#475569", textDecoration: "none", fontWeight: 500 }}>
              Support
            </Link>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: 8 }}>
              <button
                onClick={() => {
                  setAuthMode("login");
                  const el = document.getElementById("auth-form-card");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#334155",
                  cursor: "pointer",
                  padding: "8px 14px",
                }}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setAuthMode("signup");
                  const el = document.getElementById("auth-form-card");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                style={{
                  background: "#0f172a",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 24,
                  padding: "10px 22px",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(15, 23, 42, 0.15)",
                }}
              >
                Get Started Free
              </button>
            </div>
          </nav>
        </header>

        {/* Hero Section Inspired by Reference Design */}
        <section
          style={{
            maxWidth: 1320,
            margin: "0 auto",
            padding: "48px 24px 60px 24px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
            gap: 48,
            alignItems: "center",
          }}
        >
          {/* Left Column: Heading, Proof, CTA */}
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "#fef3c7",
                border: "1px solid #fde68a",
                borderRadius: 20,
                padding: "4px 14px",
                marginBottom: 20,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#f59e0b",
                }}
              />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#b45309", textTransform: "uppercase", letterSpacing: 0.5 }}>
                AI-Powered Biometric Attendance
              </span>
            </div>

            <h1
              style={{
                fontSize: 48,
                fontWeight: 900,
                color: "#0f172a",
                lineHeight: 1.15,
                letterSpacing: -1,
                marginBottom: 20,
              }}
            >
              AI Biometric Face Recognition System for Modern Workforces
            </h1>

            <p style={{ fontSize: 17, color: "#475569", lineHeight: 1.6, marginBottom: 28, maxWidth: 540 }}>
              Eliminate buddy punching and time theft with real-time 512D deep facial landmark verification, anti-spoofing liveness checks, and OpenStreetMap campus geofencing. 14-day free trial, then only $2/employee/month.
            </p>

            {/* Quick Action CTAs */}
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center", marginBottom: 36 }}>
              <button
                onClick={() => {
                  setAuthMode("signup");
                  const el = document.getElementById("auth-form-card");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                style={{
                  background: "#0f172a",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 28,
                  padding: "14px 28px",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 4px 14px rgba(15, 23, 42, 0.2)",
                }}
              >
                <span>Start 14-Day Free Trial</span>
                <span style={{ fontSize: 18 }}>→</span>
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById("features");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                style={{
                  background: "#ffffff",
                  color: "#334155",
                  border: "1px solid #cbd5e1",
                  borderRadius: 28,
                  padding: "13px 24px",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Explore Architecture
              </button>
            </div>

            {/* Social Proof & Customer Satisfaction Badge */}
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ display: "flex", marginLeft: 4 }}>
                {["#4f46e5", "#06b6d4", "#10b981", "#f59e0b"].map((bg, idx) => (
                  <div
                    key={idx}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: bg,
                      border: "2px solid #ffffff",
                      marginLeft: idx === 0 ? 0 : -10,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#ffffff",
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {String.fromCharCode(65 + idx)}
                  </div>
                ))}
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ color: "#f59e0b", fontSize: 14 }}>★★★★★</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>4.9/5 Rating</span>
                </div>
                <div style={{ fontSize: 12, color: "#64748b" }}>
                  Trusted by 10,000+ employees and verified teams
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual with Holographic Biometrics & Live Stats */}
          <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
            <div
              style={{
                position: "relative",
                borderRadius: 28,
                overflow: "hidden",
                border: "1px solid #e2e8f0",
                boxShadow: "0 20px 50px -10px rgba(0, 0, 0, 0.08)",
                background: "#f8fafc",
                maxWidth: 480,
                width: "100%",
              }}
            >
              <Image
                src="/hero-face.jpg"
                alt="AI Facial Recognition Biometric Scanning Neural Net"
                width={480}
                height={480}
                style={{ width: "100%", height: "auto", display: "block" }}
                priority
              />

              {/* Floating Top Floating Card */}
              <div
                style={{
                  position: "absolute",
                  top: 20,
                  right: 20,
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(226, 232, 240, 0.8)",
                  borderRadius: 14,
                  padding: "12px 18px",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
                  maxWidth: 240,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 6,
                      background: "#0f172a",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ShieldIcon size={13} color="#ffffff" />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#0f172a" }}>AI Agent Active</div>
                    <div style={{ fontSize: 9, color: "#10b981", fontWeight: 600 }}>Biometrics Verified in Real-Time</div>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.4 }}>
                  • 512D Landmark Embedding<br />
                  • Anti-Spoofing Liveness Passed<br />
                  • 200m Campus Geofence Matched
                </div>
              </div>

              {/* Floating Bottom Metric Card */}
              <div
                style={{
                  position: "absolute",
                  bottom: 20,
                  left: 20,
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(226, 232, 240, 0.8)",
                  borderRadius: 14,
                  padding: "14px 20px",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b" }}>Verification Accuracy</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: "#0f172a" }}>99.8%</div>
                </div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#059669",
                    background: "#ecfdf5",
                    padding: "4px 8px",
                    borderRadius: 6,
                  }}
                >
                  ↑ 0.18s Match Speed
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Client Logos / Enterprise Integration Bar */}
        <section
          style={{
            borderTop: "1px solid #f1f5f9",
            borderBottom: "1px solid #f1f5f9",
            background: "#f8fafc",
            padding: "24px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, color: "#94a3b8", marginBottom: 14 }}>
            TRUSTED BY FORWARD-THINKING ORGANIZATIONS & HYBRID WORKFORCES
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 40,
              flexWrap: "wrap",
              opacity: 0.7,
              fontSize: 14,
              fontWeight: 700,
              color: "#475569",
            }}
          >
            <span>Microsoft Azure</span>
            <span>AWS Cloud</span>
            <span>Google Cloud Platform</span>
            <span>Stripe Billing</span>
            <span>OpenStreetMap</span>
            <span>Vercel Analytics</span>
          </div>
        </section>

        {/* Interactive Sign In / Organization Registration Card */}
        <section
          id="auth-form-card"
          style={{
            maxWidth: 1120,
            margin: "64px auto",
            padding: "0 24px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 20,
              boxShadow: "0 10px 40px -10px rgba(0, 0, 0, 0.06)",
              overflow: "hidden",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            }}
          >
            {/* Left Column: Form Container */}
            <div style={{ padding: "40px 36px" }}>
              <div style={{ marginBottom: 24 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    color: "#4f46e5",
                    background: "#eef2ff",
                    padding: "3px 10px",
                    borderRadius: 12,
                  }}
                >
                  Workspace Access
                </span>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", marginTop: 8 }}>
                  {authMode === "login" ? "Sign In to Your Workspace" : "Launch Organization Workspace"}
                </h2>
                <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
                  {authMode === "login"
                    ? "Enter your credentials to manage attendance, employees, and timesheets."
                    : "Instant setup with full 14-day free enterprise access. No credit card required to start."}
                </p>
              </div>

              {/* Mode Switcher */}
              <div
                style={{
                  display: "flex",
                  background: "#f1f5f9",
                  borderRadius: 10,
                  padding: 4,
                  marginBottom: 20,
                }}
              >
                <button
                  type="button"
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    border: "none",
                    borderRadius: 8,
                    background: authMode === "login" ? "#ffffff" : "transparent",
                    color: authMode === "login" ? "#0f172a" : "#64748b",
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer",
                    boxShadow: authMode === "login" ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                  }}
                  onClick={() => setAuthMode("login")}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    border: "none",
                    borderRadius: 8,
                    background: authMode === "signup" ? "#ffffff" : "transparent",
                    color: authMode === "signup" ? "#0f172a" : "#64748b",
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer",
                    boxShadow: authMode === "signup" ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                  }}
                  onClick={() => setAuthMode("signup")}
                >
                  New Organization (14-Day Free Trial)
                </button>
              </div>

              {authMode === "login" ? (
                <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#334155", display: "block", marginBottom: 6 }}>
                      Work Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="admin@company.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: 8,
                        border: "1px solid #cbd5e1",
                        fontSize: 14,
                        outline: "none",
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#334155", display: "block", marginBottom: 6 }}>
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: 8,
                        border: "1px solid #cbd5e1",
                        fontSize: 14,
                        outline: "none",
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      background: "#0f172a",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: 8,
                      padding: "12px",
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: "pointer",
                      marginTop: 6,
                    }}
                  >
                    {loading ? "Authenticating..." : "Sign In to Dashboard"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSignupTenant} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#334155", display: "block", marginBottom: 6 }}>
                      Organization / Company Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Acme Corporation"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: 8,
                        border: "1px solid #cbd5e1",
                        fontSize: 14,
                        outline: "none",
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#334155", display: "block", marginBottom: 6 }}>
                      Primary Campus / Office Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Headquarters (200m Geofence)"
                      value={officeName}
                      onChange={(e) => setOfficeName(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: 8,
                        border: "1px solid #cbd5e1",
                        fontSize: 14,
                        outline: "none",
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#334155", display: "block", marginBottom: 6 }}>
                      Administrator Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="John Doe"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: 8,
                        border: "1px solid #cbd5e1",
                        fontSize: 14,
                        outline: "none",
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#334155", display: "block", marginBottom: 6 }}>
                      Administrator Email
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="admin@acme.com"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: 8,
                        border: "1px solid #cbd5e1",
                        fontSize: 14,
                        outline: "none",
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#334155", display: "block", marginBottom: 6 }}>
                      Account Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Minimum 8 characters"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: 8,
                        border: "1px solid #cbd5e1",
                        fontSize: 14,
                        outline: "none",
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      background: "#0f172a",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: 8,
                      padding: "12px",
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: "pointer",
                      marginTop: 6,
                    }}
                  >
                    {loading ? "Initializing..." : "Create Organization"}
                  </button>
                </form>
              )}
            </div>

            {/* Right Column: Promotional Highlights */}
            <div
              style={{
                background: "#f8fafc",
                borderLeft: "1px solid #e2e8f0",
                padding: "40px 36px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 12 }}>
                  Why Global Teams Choose AttendFace
                </h3>
                <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6, marginBottom: 20 }}>
                  A turnkey biometric attendance solution that saves companies an average of 4.5% on payroll by preventing time theft.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <div style={{ color: "#10b981", marginTop: 2 }}>✓</div>
                    <div style={{ fontSize: 13, color: "#334155" }}>
                      <strong>Touchless Facial Scan:</strong> Verify punch clocks on web & mobile in under 0.2 seconds.
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <div style={{ color: "#10b981", marginTop: 2 }}>✓</div>
                    <div style={{ fontSize: 13, color: "#334155" }}>
                      <strong>Interactive OpenStreetMap Geofences:</strong> Pinpoint exact campus coordinates and customize radiuses.
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <div style={{ color: "#10b981", marginTop: 2 }}>✓</div>
                    <div style={{ fontSize: 13, color: "#334155" }}>
                      <strong>Predictable SaaS Pricing:</strong> 14-day free trial, then strictly $2.00/user/month with auto-proration.
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <div style={{ color: "#10b981", marginTop: 2 }}>✓</div>
                    <div style={{ fontSize: 13, color: "#334155" }}>
                      <strong>Multi-Level Leave Approvals:</strong> Manager review, HR verification, and executive Admin bypass.
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 12,
                  padding: 16,
                  marginTop: 24,
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>Need custom enterprise billing?</div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                  Contact our solutions team for on-premise deployments or custom API SLAs.
                </div>
                <Link href="/support" style={{ fontSize: 12, color: "#4f46e5", fontWeight: 600, textDecoration: "none", display: "inline-block", marginTop: 6 }}>
                  Contact Support →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid Section (SEO-rich keywords) */}
        <section id="features" style={{ maxWidth: 1200, margin: "60px auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 48px auto" }}>
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, color: "#4f46e5" }}>
              Workforce Intelligence
            </span>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: "#0f172a", marginTop: 8 }}>
              Engineered for Accuracy, Scalability, and Speed
            </h2>
            <p style={{ fontSize: 15, color: "#64748b", marginTop: 6 }}>
              Comprehensive biometric face recognition attendance management tailored for offices, factories, schools, and remote teams.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
            <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "28px" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <ShieldIcon size={20} color="#4f46e5" />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>
                512D Deep Biometric Embeddings
              </h3>
              <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>
                Our neural network extracts 512-dimensional vector representations of facial geometry, guaranteeing 99.8% match confidence even with glasses or lighting shifts.
              </p>
            </div>

            <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "28px" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <CheckCircleIcon size={20} color="#059669" />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>
                Anti-Spoofing Liveness Detection
              </h3>
              <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>
                Advanced micro-texture and depth analysis rejects photographs, printed headshots, and video screen replays to prevent attendance fraud.
              </p>
            </div>

            <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "28px" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <LocationPinIcon size={20} color="#0284c7" />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>
                OpenStreetMap Campus Geofencing
              </h3>
              <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>
                Interactive map pinpointing and custom-radius validation ensure on-site employees are physically present within authorized office perimeters.
              </p>
            </div>

            <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "28px" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <CalendarIcon size={20} color="#d97706" />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>
                Tiered Leave & Regularization
              </h3>
              <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>
                Hierarchical manager reviews, HR approvals, and executive Admin direct bypass ensure swift resolution for missed punches and time-off requests.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" style={{ background: "#f8fafc", borderTop: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0", padding: "64px 24px" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, color: "#4f46e5" }}>
              Transparent SaaS Pricing
            </span>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: "#0f172a", marginTop: 8 }}>
              Simple, Transparent, Seat-Based Pricing
            </h2>
            <p style={{ fontSize: 15, color: "#64748b", marginTop: 6, marginBottom: 36 }}>
              No upfront setup fees. No long-term lock-in contracts. Cancel anytime via the self-service Stripe Customer Portal.
            </p>

            <div
              style={{
                maxWidth: 480,
                margin: "0 auto",
                background: "#ffffff",
                border: "2px solid #4f46e5",
                borderRadius: 20,
                padding: "36px",
                boxShadow: "0 12px 30px rgba(79, 70, 229, 0.08)",
                textAlign: "left",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>Enterprise Plan</span>
                <span style={{ background: "#ecfdf5", color: "#059669", fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 12 }}>
                  14 Days Free Trial
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 16 }}>
                <span style={{ fontSize: 44, fontWeight: 900, color: "#0f172a" }}>$2.00</span>
                <span style={{ fontSize: 15, color: "#64748b", fontWeight: 500 }}>USD / employee / month</span>
              </div>
              <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5, marginBottom: 24 }}>
                Everything included with unlimited punch scans, multiple campus geofences, and automated SES dispatch.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28, fontSize: 13, color: "#334155" }}>
                <div>✓ 14 days complimentary trial ($0.00 today)</div>
                <div>✓ Automatic seat proration via Stripe</div>
                <div>✓ Unlimited biometric check-ins & check-outs</div>
                <div>✓ OpenStreetMap campus geofences</div>
                <div>✓ Instant CSV timesheet export</div>
                <div>✓ 24/7 dedicated customer support</div>
              </div>

              <button
                onClick={() => {
                  setAuthMode("signup");
                  const el = document.getElementById("auth-form-card");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                style={{
                  width: "100%",
                  background: "#4f46e5",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 10,
                  padding: "14px",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Start 14-Day Free Trial
              </button>
            </div>
          </div>
        </section>

        {/* SEO Information & Footer */}
        <footer style={{ background: "#ffffff", borderTop: "1px solid #f1f5f9", padding: "48px 36px 36px 36px", maxWidth: 1320, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 36, marginBottom: 36 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Image src="/image.png" alt="AttendFace Logo" width={28} height={28} style={{ borderRadius: 6 }} />
                <span style={{ fontWeight: 800, fontSize: 16, color: "#0f172a" }}>AttendFace AI</span>
              </div>
              <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>
                Next-generation biometric face recognition attendance platform for modern enterprises, campuses, and distributed teams.
              </p>
            </div>

            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 12, textTransform: "uppercase" }}>
                Product & Tech
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: "#64748b" }}>
                <a href="#features" style={{ color: "inherit", textDecoration: "none" }}>Biometric Scanner</a>
                <a href="#features" style={{ color: "inherit", textDecoration: "none" }}>Campus Geofencing</a>
                <a href="#pricing" style={{ color: "inherit", textDecoration: "none" }}>Workforce Pricing</a>
                <Link href="/support" style={{ color: "inherit", textDecoration: "none" }}>Support Portal</Link>
              </div>
            </div>

            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 12, textTransform: "uppercase" }}>
                Legal & Security
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: "#64748b" }}>
                <Link href="/privacy" style={{ color: "inherit", textDecoration: "none" }}>Privacy Policy</Link>
                <Link href="/terms" style={{ color: "inherit", textDecoration: "none" }}>Terms of Service</Link>
                <Link href="/privacy" style={{ color: "inherit", textDecoration: "none" }}>Biometric Data Retention</Link>
                <Link href="/support" style={{ color: "inherit", textDecoration: "none" }}>Data Protection Officer</Link>
              </div>
            </div>

            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 12, textTransform: "uppercase" }}>
                Developed By
              </div>
              <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>
                <strong>Alpha Software Development Limited</strong><br />
                Registered in England & Wales<br />
                Contact: <a href="mailto:info@alpha-devs.cloud" style={{ color: "#4f46e5" }}>info@alpha-devs.cloud</a>
              </div>
            </div>
          </div>

          <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, fontSize: 12, color: "#94a3b8" }}>
            <div>© 2026 AttendFace • Alpha Software Development Limited. All rights reserved.</div>
            <div style={{ display: "flex", gap: 18 }}>
              <Link href="/privacy" style={{ color: "inherit", textDecoration: "none" }}>Privacy</Link>
              <Link href="/terms" style={{ color: "inherit", textDecoration: "none" }}>Terms</Link>
              <Link href="/support" style={{ color: "inherit", textDecoration: "none" }}>Support</Link>
            </div>
          </div>
        </footer>

        {toastMessage && (
          <div
            className={`${styles.toast} ${toastMessage.type === "success" ? styles.toastSuccess : styles.toastError
              }`}
          >
            {toastMessage.type === "success" ? (
              <CheckCircleIcon size={18} color="#34d399" />
            ) : (
              <AlertCircleIcon size={18} color="#f87171" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        )}
      </div>
    );
  }

  // ==============================================================================
  // Authenticated Dashboard View
  // ==============================================================================

  const initials = user?.full_name
    ? user.full_name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
    : "AD";

  return (
    <div className={styles.container}>
      {/* Top Navbar */}
      <header className={styles.navbar}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}>
            <Image
              src="/image.png"
              alt="Face Attendance Logo"
              width={40}
              height={40}
              className={styles.brandLogoImg}
              priority
            />
          </div>
          <div>
            <div className={styles.brandTitle}>
              {tenantStats?.tenant?.name || "Face Attendance Platform"}
            </div>
            <div className={styles.brandSubtitle}>ArcFace 512D | 200m Geofencing</div>
          </div>
        </div>

        <div className={styles.navRight}>
          {myTodayAttendance?.has_checked_in && (
            myTodayAttendance?.has_checked_out ? (
              <span className={styles.badgeSuccess} style={{ fontSize: 11, padding: "5px 10px" }}>
                <CheckCircleIcon size={12} color="#34d399" />
                <span>Checked Out ({myTodayAttendance.record?.hours_worked ?? "—"}h)</span>
              </span>
            ) : (
              <button
                className={styles.btnWarning}
                onClick={handleWebCheckOut}
                disabled={checkingOutSelf}
                title="Record your daily checkout time"
                style={{ padding: "5px 12px" }}
              >
                <ClockIcon size={13} color="#d97706" />
                <span>{checkingOutSelf ? "Checking Out..." : "Check Out for the Day"}</span>
              </button>
            )
          )}

          <div className={styles.tenantBadge}>
            <BuildingIcon size={14} color="#818cf8" />
            <span>{tenantStats?.tenant?.slug || "Organization"}</span>
          </div>

          <div className={styles.userPill}>
            <div className={styles.userAvatar}>{initials}</div>
            <span className={styles.userName}>{user?.full_name}</span>
            <span className={styles.rolePill}>{user?.role}</span>
          </div>

          <button className={styles.logoutBtn} onClick={handleLogout} title="Sign Out">
            <LogOutIcon size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Dashboard Body */}
      <main className={styles.dashboard}>
        {/* Executive Overview Metric Cards */}
        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <div className={styles.metricInfo}>
              <span className={styles.metricLabel}>Total Workforce</span>
              <span className={styles.metricValue}>
                {tenantStats?.total_employees ?? employees.length}
              </span>
              <span className={styles.metricSubtext}>Registered Employees</span>
            </div>
            <div className={`${styles.metricIcon} ${styles.metricIconIndigo}`}>
              <UsersIcon size={20} color="#818cf8" />
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricInfo}>
              <span className={styles.metricLabel}>Attendance Rate</span>
              <span className={styles.metricValue}>
                {tenantStats?.attendance_rate ?? 0}%
              </span>
              <span className={styles.metricSubtext}>
                {tenantStats?.today_checkins ?? 0} Checked In Today
              </span>
            </div>
            <div className={`${styles.metricIcon} ${styles.metricIconEmerald}`}>
              <CheckCircleIcon size={20} color="#34d399" />
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricInfo}>
              <span className={styles.metricLabel}>On-Site vs Remote</span>
              <span className={styles.metricValue}>
                {tenantStats?.on_site_employees ?? 0} / {tenantStats?.remote_employees ?? 0}
              </span>
              <span className={styles.metricSubtext}>200m Geofence / Geo-Exempt</span>
            </div>
            <div className={`${styles.metricIcon} ${styles.metricIconCyan}`}>
              <LocationPinIcon size={20} color="#22d3ee" />
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricInfo}>
              <span className={styles.metricLabel}>Pending Action Items</span>
              <span className={styles.metricValue}>
                {leaves.filter((l) => l.status === "pending").length +
                  regularizationRequests.filter((r) => r.status === "pending").length}
              </span>
              <span className={styles.metricSubtext}>Leaves & Regularizations</span>
            </div>
            <div className={`${styles.metricIcon} ${styles.metricIconAmber}`}>
              <ClockIcon size={20} color="#fbbf24" />
            </div>
          </div>

          <div
            className={styles.metricCard}
            style={{ cursor: "pointer" }}
            onClick={() => setActiveTab("billing")}
            title="Click to view Stripe SaaS billing & 14-day free trial"
          >
            <div className={styles.metricInfo}>
              <span className={styles.metricLabel}>Plan & SaaS Billing</span>
              <span className={styles.metricValue} style={{ fontSize: 20 }}>
                {billingInfo?.subscription_status === "active" ? "$2 / User" : "14-Day Trial"}
              </span>
              <span className={styles.metricSubtext}>
                {billingInfo?.trial_days_remaining != null
                  ? `${billingInfo.trial_days_remaining}d trial left • $${((billingInfo?.seat_count || employees.length) * 2).toFixed(2)}/mo`
                  : `$${((billingInfo?.seat_count || employees.length) * 2).toFixed(2)}/mo (${billingInfo?.seat_count || employees.length} seats)`}
              </span>
            </div>
            <div className={`${styles.metricIcon} ${styles.metricIconIndigo}`}>
              <CreditCardIcon size={20} color="#0284c7" />
            </div>
          </div>
        </div>

        {/* Primary Tabs Navigation Bar */}
        <div className={styles.tabsContainer}>
          <div className={styles.tabsList}>
            <button
              className={`${styles.tabBtn} ${activeTab === "employees" ? styles.tabBtnActive : ""}`}
              onClick={() => setActiveTab("employees")}
            >
              <UsersIcon size={16} />
              <span>Employees</span>
              <span className={styles.tabBadge}>{employees.length}</span>
            </button>

            <button
              className={`${styles.tabBtn} ${activeTab === "leaves" ? styles.tabBtnActive : ""}`}
              onClick={() => setActiveTab("leaves")}
            >
              <CalendarIcon size={16} />
              <span>Leave Requests</span>
              {leaves.filter((l) => l.status === "pending").length > 0 && (
                <span className={styles.tabBadge} style={{ background: "#f59e0b" }}>
                  {leaves.filter((l) => l.status === "pending").length}
                </span>
              )}
            </button>

            <button
              className={`${styles.tabBtn} ${activeTab === "attendance_requests" ? styles.tabBtnActive : ""}`}
              onClick={() => setActiveTab("attendance_requests")}
            >
              <AlertCircleIcon size={16} />
              <span>Missed Attendance</span>
              {regularizationRequests.filter((r) => r.status === "pending").length > 0 && (
                <span className={styles.tabBadge} style={{ background: "#6366f1" }}>
                  {regularizationRequests.filter((r) => r.status === "pending").length}
                </span>
              )}
            </button>

            <button
              className={`${styles.tabBtn} ${activeTab === "timesheets" ? styles.tabBtnActive : ""}`}
              onClick={() => setActiveTab("timesheets")}
            >
              <FileTextIcon size={16} />
              <span>Timesheets</span>
              <span className={styles.tabBadge}>{timesheets.length}</span>
            </button>

            <button
              className={`${styles.tabBtn} ${activeTab === "offices" ? styles.tabBtnActive : ""}`}
              onClick={() => setActiveTab("offices")}
            >
              <BuildingIcon size={16} />
              <span>Office Geofences</span>
              <span className={styles.tabBadge}>{offices.length}</span>
            </button>

            <button
              className={`${styles.tabBtn} ${activeTab === "billing" ? styles.tabBtnActive : ""}`}
              onClick={() => setActiveTab("billing")}
            >
              <CreditCardIcon size={16} />
              <span>Billing & Plan</span>
              <span
                className={styles.tabBadge}
                style={{
                  background: billingInfo?.subscription_status === "active" ? "#059669" : "#0284c7",
                  color: "#ffffff",
                }}
              >
                {billingInfo?.subscription_status === "active" ? "Active" : "14d Trial"}
              </span>
            </button>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            {activeTab === "employees" && (
              <>
                <button
                  className={styles.btnSecondary}
                  onClick={handleSendLateDigest}
                  disabled={lateDigestSending}
                  title="Dispatch batch email notification to HR summarizing all employees who checked in late today"
                >
                  <MailIcon size={16} color="#d97706" />
                  <span>{lateDigestSending ? "Dispatching..." : "Send Late Digest Today"}</span>
                </button>
                <button
                  className={styles.btnSecondary}
                  onClick={() => {
                    handleImportReset();
                    setShowImportModal(true);
                  }}
                  title="Import workforce roster via CSV"
                >
                  <UploadCloudIcon size={16} />
                  <span>Import CSV</span>
                </button>
                <button
                  className={styles.btnPrimary}
                  onClick={() => {
                    setCreatedEmployeeResult(null);
                    setShowAddEmployeeModal(true);
                  }}
                >
                  <UserPlusIcon size={16} />
                  <span>Add Employee</span>
                </button>
              </>
            )}

            {activeTab === "leaves" && (
              <button className={styles.btnPrimary} onClick={() => setShowLeaveModal(true)}>
                <PlusIcon size={16} />
                <span>Apply for Leave</span>
              </button>
            )}

            {activeTab === "attendance_requests" && (
              <button className={styles.btnPrimary} onClick={() => setShowRegularizeModal(true)}>
                <ClockIcon size={16} />
                <span>Request Attendance</span>
              </button>
            )}

            {activeTab === "timesheets" && (
              <button className={styles.btnSecondary} onClick={handleExportCSV}>
                <DownloadIcon size={14} />
                <span>Export CSV Report</span>
              </button>
            )}

            {activeTab === "offices" && (
              <button className={styles.btnPrimary} onClick={() => setShowOfficeModal(true)}>
                <PlusIcon size={16} />
                <span>Add Campus Geofence</span>
              </button>
            )}

            {activeTab === "billing" && (
              <button
                className={styles.btnPrimary}
                onClick={handleStartSubscription}
                disabled={billingLoading}
              >
                <ZapIcon size={14} color="#ffffff" />
                <span>
                  {billingInfo?.subscription_status === "active" ? "Manage Subscription" : "Start 14-Day Free Trial"}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: EMPLOYEES ROSTER                                                   */}
        {/* ========================================================================= */}
        {activeTab === "employees" && (
          <div className={styles.tableCard}>
            <div className={styles.tableToolbar}>
              <div className={styles.tableTitle}>
                <UsersIcon size={18} color="#818cf8" />
                <span>Organization Workforce Roster</span>
              </div>

              <div className={styles.toolbarActions}>
                <input
                  type="text"
                  placeholder="Search by name, code, email..."
                  className={styles.searchInput}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />

                <select
                  className={styles.select}
                  style={{ width: 140 }}
                  value={workModeFilter}
                  onChange={(e) => setWorkModeFilter(e.target.value)}
                >
                  <option value="all">All Modes</option>
                  <option value="on_site">On-Site Only</option>
                  <option value="remote">Remote Only</option>
                </select>

                <button className={styles.btnSecondary} onClick={fetchEmployees} title="Refresh Roster">
                  <RefreshIcon size={14} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>Employee</th>
                    <th className={styles.th}>Code</th>
                    <th className={styles.th}>Role</th>
                    <th className={styles.th}>Reporting Manager</th>
                    <th className={styles.th}>Work Mode</th>
                    <th className={styles.th}>Assigned Campus</th>
                    <th className={styles.th}>Biometric Status</th>
                    <th className={styles.th} style={{ textAlign: "right" }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={8}>
                        <div className={styles.emptyState}>
                          <div className={styles.emptyIcon}>
                            <UsersIcon size={32} />
                          </div>
                          <div className={styles.emptyTitle}>No Employees Found</div>
                          <p className={styles.emptyDesc}>
                            There are currently no employees matching your search. Click "Add
                            Employee" above to onboard team members via form.
                          </p>
                          <button
                            className={styles.btnPrimary}
                            onClick={() => {
                              setCreatedEmployeeResult(null);
                              setShowAddEmployeeModal(true);
                            }}
                          >
                            <UserPlusIcon size={16} />
                            <span>Onboard New Employee</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((emp) => (
                      <tr key={emp.id} className={styles.tr}>
                        <td className={styles.td}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: "50%",
                                background: "#eff6ff",
                                border: "1px solid #bfdbfe",
                                color: "#0284c7",
                                fontSize: 12,
                                fontWeight: 700,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              {emp.full_name
                                ? emp.full_name
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")
                                  .slice(0, 2)
                                  .toUpperCase()
                                : "EM"}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: "#0f172a", fontSize: 13 }}>{emp.full_name}</div>
                              <div style={{ fontSize: 11, color: "#0284c7", fontWeight: 500, marginTop: 1 }}>
                                {emp.designation || "Staff"} • {emp.department || "General"}
                              </div>
                              <div style={{ fontSize: 11, color: "#64748b", marginTop: 1 }}>
                                {emp.email}{emp.phone_number ? ` • ${emp.phone_number}` : ""}
                              </div>
                              {emp.shift_config?.is_custom ? (
                                <div style={{ marginTop: 3 }}>
                                  <span className={styles.badgeCyan} style={{ fontSize: 10, padding: "1px 6px" }}>
                                    <ClockIcon size={10} />
                                    <span>
                                      {emp.shift_config.shift_name || "Custom Shift"} ({emp.shift_config.work_start_time} - {emp.shift_config.work_end_time})
                                    </span>
                                  </span>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </td>
                        <td className={styles.td}>
                          <span
                            style={{
                              fontFamily: "monospace",
                              color: "#4338ca",
                              fontWeight: 700,
                              background: "#eef2ff",
                              border: "1px solid #c7d2fe",
                              padding: "2px 7px",
                              borderRadius: 4,
                              fontSize: 11,
                            }}
                          >
                            {emp.employee_code}
                          </span>
                        </td>
                        <td className={styles.td}>
                          <span
                            className={styles.badgeCyan}
                            style={{ textTransform: "capitalize", fontSize: 11 }}
                          >
                            {emp.role}
                          </span>
                        </td>
                        <td className={styles.td}>
                          {emp.manager_name ? (
                            <span style={{ color: "#0284c7", fontWeight: 500, fontSize: 12 }}>
                              {emp.manager_name}
                            </span>
                          ) : (
                            <span style={{ color: "#94a3b8", fontSize: 12 }}>Direct to Admin</span>
                          )}
                        </td>
                        <td className={styles.td}>
                          {emp.default_work_mode === "remote" ? (
                            <span className={styles.badgeWarning}>
                              <LocationPinIcon size={12} />
                              <span>Remote</span>
                            </span>
                          ) : (
                            <span className={styles.badgeInfo}>
                              <BuildingIcon size={12} />
                              <span>On-Site (200m)</span>
                            </span>
                          )}
                          {emp.date_override && (
                            <div style={{ marginTop: 4 }}>
                              <span className={styles.badgeWarning} style={{ fontSize: 10 }}>
                                {emp.date_override}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className={styles.td}>
                          {emp.default_work_mode === "remote" ? (
                            <span style={{ color: "#94a3b8", fontStyle: "italic", fontSize: 12 }}>Remote (WFA)</span>
                          ) : (
                            emp.office_name || "Assigned Office"
                          )}
                        </td>
                        <td className={styles.td}>
                          {emp.face_enrolled ? (
                            <span className={styles.badgeSuccess}>
                              <CheckCircleIcon size={12} color="#34d399" />
                              <span>Enrolled (512D)</span>
                            </span>
                          ) : (
                            <span className={styles.badgeWarning}>
                              <ClockIcon size={12} color="#fbbf24" />
                              <span>Invite Sent</span>
                            </span>
                          )}
                        </td>
                        <td className={styles.td} style={{ textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                            <button
                              className={styles.btnSecondary}
                              onClick={() => handleOpenCalendar(emp)}
                              title="View Monthly Attendance Calendar & Hours"
                            >
                              <CalendarIcon size={13} color="#0284c7" />
                              <span>Calendar</span>
                            </button>

                            <button
                              className={styles.btnSecondary}
                              onClick={() => handleOpenShiftModal(emp)}
                              title="Configure Working Hours, Shift & Grace Period"
                            >
                              <ClockIcon size={13} color="#0284c7" />
                              <span>Shift</span>
                            </button>

                            <button
                              className={styles.btnSecondary}
                              onClick={() => {
                                setEditingEmployee(emp);
                                setEditEmpFirstName(emp.first_name || (emp.full_name ? emp.full_name.split(" ")[0] : ""));
                                setEditEmpLastName(emp.last_name || (emp.full_name ? emp.full_name.split(" ").slice(1).join(" ") : ""));
                                setEditEmpDepartment(emp.department || "");
                                setEditEmpDesignation(emp.designation || "");
                                setEditEmpPhoneNumber(emp.phone_number || "");
                                setEditEmpWorkMode(emp.default_work_mode || "on_site");
                                setEditEmpRole(emp.role);
                                setEditEmpOfficeId(emp.office_id || (offices[0]?.id || ""));
                                setEditEmpManagerId(emp.manager_id || "");
                                setShowEditEmployeeModal(true);
                              }}
                              title="Edit Employee Profile & Assignments"
                            >
                              <PencilIcon size={13} />
                              <span>Edit</span>
                            </button>

                            <button
                              className={styles.btnSecondary}
                              onClick={() => {
                                setOverrideEmployee(emp);
                                setShowOverrideModal(true);
                              }}
                              title="Set Date-Specific Work Mode Override"
                            >
                              <CalendarIcon size={13} />
                              <span>Override</span>
                            </button>

                            <button
                              className={styles.btnSecondary}
                              onClick={() => handleResendInvite(emp.id)}
                              title="Resend Credentials & 48h Invitation Token via AWS SES"
                            >
                              <MailIcon size={13} />
                              <span>SES Invite</span>
                            </button>

                            <button
                              className={styles.btnDanger}
                              onClick={() => handleDeleteEmployee(emp.id, emp.full_name)}
                              title="Remove Employee"
                            >
                              <TrashIcon size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: LEAVE REQUESTS & APPROVALS                                         */}
        {/* ========================================================================= */}
        {activeTab === "leaves" && (
          <div className={styles.tableCard}>
            <div className={styles.tableToolbar}>
              <div className={styles.tableTitle}>
                <CalendarIcon size={18} color="#818cf8" />
                <span>Time Off & Leave Management</span>
              </div>

              <div className={styles.toolbarActions}>
                <select
                  className={styles.select}
                  style={{ width: 150 }}
                  value={leaveStatusFilter}
                  onChange={(e) => setLeaveStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending Only</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>

                <button className={styles.btnSecondary} onClick={fetchLeaves} title="Refresh Leaves">
                  <RefreshIcon size={14} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>Employee</th>
                    <th className={styles.th}>Type</th>
                    <th className={styles.th}>Date Range</th>
                    <th className={styles.th}>Reason</th>
                    <th className={styles.th}>Status</th>
                    <th className={styles.th} style={{ textAlign: "right" }}>
                      Manager Review
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeaves.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <div className={styles.emptyState}>
                          <div className={styles.emptyIcon}>
                            <CalendarIcon size={32} />
                          </div>
                          <div className={styles.emptyTitle}>No Leave Applications Found</div>
                          <p className={styles.emptyDesc}>
                            No leave applications submitted yet. Employees can request time off, or
                            managers can submit manually.
                          </p>
                          <button className={styles.btnPrimary} onClick={() => setShowLeaveModal(true)}>
                            <PlusIcon size={16} />
                            <span>Submit Leave Request</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredLeaves.map((lv) => (
                      <tr key={lv.id} className={styles.tr}>
                        <td className={styles.td}>
                          <div style={{ fontWeight: 600, color: "#ffffff" }}>{lv.employee_name}</div>
                          <div style={{ fontSize: 12, color: "#94a3b8" }}>{lv.employee_code}</div>
                          <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                            Mgr: {lv.manager_name ? <span style={{ color: "#38bdf8" }}>{lv.manager_name}</span> : "Direct"}
                          </div>
                        </td>
                        <td className={styles.td}>
                          <span className={styles.badgeCyan}>{lv.leave_type || "Annual Leave"}</span>
                        </td>
                        <td className={styles.td}>
                          <div style={{ fontWeight: 600 }}>
                            {lv.start_date} <span style={{ color: "#64748b" }}>to</span> {lv.end_date}
                          </div>
                        </td>
                        <td className={styles.td} style={{ maxWidth: 280, color: "#cbd5e1" }}>
                          {lv.reason}
                        </td>
                        <td className={styles.td}>
                          {lv.status === "approved" ? (
                            <div>
                              <span className={styles.badgeSuccess}>
                                <CheckCircleIcon size={12} color="#34d399" />
                                <span>Approved (Exempt)</span>
                              </span>
                              {lv.admin_bypassed && (
                                <div style={{ marginTop: 4 }}>
                                  <span className={styles.badgeCyan} style={{ fontSize: 10 }}>
                                    <ZapIcon size={10} color="#22d3ee" />
                                    <span>Admin Bypassed L1</span>
                                  </span>
                                </div>
                              )}
                              {lv.level1_approver_name && !lv.admin_bypassed && (
                                <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 3 }}>
                                  L1: {lv.level1_approver_name}
                                </div>
                              )}
                              {lv.level2_approver_name && (
                                <div style={{ fontSize: 10, color: "#94a3b8" }}>
                                  L2: {lv.level2_approver_name}
                                </div>
                              )}
                            </div>
                          ) : lv.status === "rejected" ? (
                            <div>
                              <span className={styles.badgeDanger}>
                                <XCircleIcon size={12} color="#f87171" />
                                <span>Rejected</span>
                              </span>
                              {lv.rejection_reason && (
                                <div style={{ fontSize: 11, color: "#f87171", marginTop: 2 }}>
                                  {lv.rejection_reason}
                                </div>
                              )}
                            </div>
                          ) : lv.status === "pending_manager" ? (
                            <div>
                              <span className={styles.badgeWarning}>
                                <ClockIcon size={12} color="#fbbf24" />
                                <span>Level 1: Manager Review</span>
                              </span>
                              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>
                                Routing to: {lv.manager_name || "Assigned Manager"}
                              </div>
                            </div>
                          ) : lv.status === "pending_admin" ? (
                            <div>
                              <span className={styles.badgePurple}>
                                <ClockIcon size={12} color="#c084fc" />
                                <span>Level 2: Admin/HR Review</span>
                              </span>
                              <div style={{ fontSize: 11, color: "#34d399", marginTop: 3 }}>
                                L1 Approved by {lv.level1_approver_name || "Manager"}
                              </div>
                            </div>
                          ) : (
                            <span className={styles.badgeWarning}>
                              <ClockIcon size={12} color="#fbbf24" />
                              <span>Pending Review</span>
                            </span>
                          )}
                        </td>
                        <td className={styles.td} style={{ textAlign: "right" }}>
                          {lv.status === "pending_manager" ? (
                            <div style={{ display: "inline-flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                              <div style={{ display: "inline-flex", gap: 6 }}>
                                <button
                                  className={styles.btnSuccess}
                                  onClick={() => handleReviewLeave(lv.id, "approved")}
                                  title="Approve Level 1 (Forward to Level 2 Admin/HR)"
                                >
                                  <CheckCircleIcon size={12} />
                                  <span>L1 Approve</span>
                                </button>
                                <button
                                  className={styles.btnDanger}
                                  onClick={() => handleReviewLeave(lv.id, "rejected")}
                                  title="Reject Leave Application"
                                >
                                  <XCircleIcon size={12} />
                                  <span>Reject</span>
                                </button>
                              </div>
                              {/* Admin Bypass Option */}
                              {(user?.role === "admin" || user?.role === "super_admin") && (
                                <button
                                  className={styles.btnWarning}
                                  onClick={() => handleReviewLeave(lv.id, "bypass", true)}
                                  title="Directly Approve and Bypass Manager Review"
                                >
                                  <ZapIcon size={12} color="#fbbf24" />
                                  <span>⚡ Bypass & Approve</span>
                                </button>
                              )}
                            </div>
                          ) : lv.status === "pending_admin" ? (
                            <div style={{ display: "inline-flex", gap: 6 }}>
                              <button
                                className={styles.btnSuccess}
                                onClick={() => handleReviewLeave(lv.id, "approved")}
                                title="Final Level 2 Approval (HR/Admin)"
                              >
                                <CheckCircleIcon size={12} />
                                <span>Final Approve</span>
                              </button>
                              <button
                                className={styles.btnDanger}
                                onClick={() => handleReviewLeave(lv.id, "rejected")}
                                title="Reject Leave Application"
                              >
                                <XCircleIcon size={12} />
                                <span>Reject</span>
                              </button>
                            </div>
                          ) : lv.status === "pending" ? (
                            <div style={{ display: "inline-flex", gap: 6 }}>
                              <button
                                className={styles.btnSuccess}
                                onClick={() => handleReviewLeave(lv.id, "approved")}
                              >
                                <CheckCircleIcon size={13} />
                                <span>Approve</span>
                              </button>
                              <button
                                className={styles.btnDanger}
                                onClick={() => handleReviewLeave(lv.id, "rejected")}
                              >
                                <XCircleIcon size={13} />
                                <span>Reject</span>
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: 12, color: "#64748b" }}>
                              Processed
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: MISSED ATTENDANCE REGULARIZATION                                    */}
        {/* ========================================================================= */}
        {activeTab === "attendance_requests" && (
          <div className={styles.tableCard}>
            <div className={styles.tableToolbar}>
              <div className={styles.tableTitle}>
                <AlertCircleIcon size={18} color="#818cf8" />
                <span>Missed Punch & Attendance Regularization Requests</span>
              </div>

              <div className={styles.toolbarActions}>
                <select
                  className={styles.select}
                  style={{ width: 150 }}
                  value={regularizeStatusFilter}
                  onChange={(e) => setRegularizeStatusFilter(e.target.value)}
                >
                  <option value="all">All Requests</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>

                <button
                  className={styles.btnSecondary}
                  onClick={fetchRegularizationRequests}
                  title="Refresh Regularization Requests"
                >
                  <RefreshIcon size={14} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>Employee</th>
                    <th className={styles.th}>Missed Date</th>
                    <th className={styles.th}>Expected Time</th>
                    <th className={styles.th}>Justification / Reason</th>
                    <th className={styles.th}>Status</th>
                    <th className={styles.th} style={{ textAlign: "right" }}>
                      Management Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRegularization.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <div className={styles.emptyState}>
                          <div className={styles.emptyIcon}>
                            <ClockIcon size={32} />
                          </div>
                          <div className={styles.emptyTitle}>No Missed Attendance Requests</div>
                          <p className={styles.emptyDesc}>
                            When employees miss their face scan due to hardware or field travel,
                            they submit a regularization request for approval.
                          </p>
                          <button
                            className={styles.btnPrimary}
                            onClick={() => setShowRegularizeModal(true)}
                          >
                            <ClockIcon size={16} />
                            <span>Request Missed Punch Regularization</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRegularization.map((req) => (
                      <tr key={req.id} className={styles.tr}>
                        <td className={styles.td}>
                          <div style={{ fontWeight: 600, color: "#ffffff" }}>{req.employee_name}</div>
                          <div style={{ fontSize: 12, color: "#94a3b8" }}>{req.employee_code}</div>
                        </td>
                        <td className={styles.td} style={{ fontWeight: 600 }}>
                          {req.date}
                        </td>
                        <td className={styles.td}>
                          <div style={{ fontFamily: "monospace" }}>
                            {new Date(req.check_in_time).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            {req.check_out_time && (
                              <span>
                                {" - "}
                                {new Date(req.check_out_time).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className={styles.td} style={{ maxWidth: 260, color: "#cbd5e1" }}>
                          {req.reason}
                          {req.reviewer_note && (
                            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                              Note: {req.reviewer_note}
                            </div>
                          )}
                        </td>
                        <td className={styles.td}>
                          {req.status === "approved" ? (
                            <span className={styles.badgeSuccess}>
                              <CheckCircleIcon size={12} color="#34d399" />
                              <span>Approved (Regularized)</span>
                            </span>
                          ) : req.status === "rejected" ? (
                            <span className={styles.badgeDanger}>
                              <XCircleIcon size={12} color="#f87171" />
                              <span>Rejected</span>
                            </span>
                          ) : (
                            <span className={styles.badgeWarning}>
                              <ClockIcon size={12} color="#fbbf24" />
                              <span>Pending Review</span>
                            </span>
                          )}
                        </td>
                        <td className={styles.td} style={{ textAlign: "right" }}>
                          {req.status === "pending" ? (
                            <div style={{ display: "inline-flex", gap: 8 }}>
                              <button
                                className={styles.btnSuccess}
                                onClick={() => handleReviewRegularization(req.id, "approved")}
                              >
                                <CheckCircleIcon size={13} />
                                <span>Approve</span>
                              </button>
                              <button
                                className={styles.btnDanger}
                                onClick={() => handleReviewRegularization(req.id, "rejected")}
                              >
                                <XCircleIcon size={13} />
                                <span>Reject</span>
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: 12, color: "#64748b" }}>
                              Resolved
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: TIMESHEETS VIEW                                                    */}
        {/* ========================================================================= */}
        {activeTab === "timesheets" && (
          <div className={styles.tableCard}>
            <div className={styles.tableToolbar}>
              <div className={styles.tableTitle}>
                <FileTextIcon size={18} color="#818cf8" />
                <span>Audited Timesheet Logs & Attendance Hours</span>
              </div>

              <div className={styles.toolbarActions}>
                <select
                  className={styles.select}
                  style={{ width: 150 }}
                  value={timesheetDateFilter}
                  onChange={(e) => setTimesheetDateFilter(e.target.value)}
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today Only</option>
                </select>

                <button className={styles.btnSecondary} onClick={handleExportCSV}>
                  <DownloadIcon size={14} />
                  <span>Download CSV</span>
                </button>

                <button className={styles.btnSecondary} onClick={fetchTimesheets} title="Refresh Timesheets">
                  <RefreshIcon size={14} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>Date</th>
                    <th className={styles.th}>Employee</th>
                    <th className={styles.th}>Campus Office</th>
                    <th className={styles.th}>Check-In</th>
                    <th className={styles.th}>Check-Out</th>
                    <th className={styles.th}>Hours Worked</th>
                    <th className={styles.th}>Verification Method</th>
                    <th className={styles.th}>Confidence</th>
                    <th className={styles.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTimesheets.length === 0 ? (
                    <tr>
                      <td colSpan={9}>
                        <div className={styles.emptyState}>
                          <div className={styles.emptyIcon}>
                            <FileTextIcon size={32} />
                          </div>
                          <div className={styles.emptyTitle}>No Timesheet Records Found</div>
                          <p className={styles.emptyDesc}>
                            Attendance check-ins marked from mobile devices or approved regularizations
                            will populate this log automatically.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredTimesheets.map((t) => (
                      <tr key={t.id} className={styles.tr}>
                        <td className={styles.td} style={{ fontWeight: 600 }}>
                          {t.date}
                        </td>
                        <td className={styles.td}>
                          <div style={{ fontWeight: 600, color: "#ffffff" }}>{t.employee_name}</div>
                          <div style={{ fontSize: 12, color: "#94a3b8" }}>{t.employee_code}</div>
                        </td>
                        <td className={styles.td}>{t.office_name || "Headquarters"}</td>
                        <td className={styles.td}>
                          <span style={{ fontFamily: "monospace" }}>
                            {t.check_in_time
                              ? new Date(t.check_in_time).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                              : "N/A"}
                          </span>
                          {t.distance_from_office_meters !== null &&
                            t.distance_from_office_meters !== undefined && (
                              <div style={{ fontSize: 11, color: "#64748b" }}>
                                {t.distance_from_office_meters.toFixed(1)}m from center
                              </div>
                            )}
                        </td>
                        <td className={styles.td}>
                          <span style={{ fontFamily: "monospace" }}>
                            {t.check_out_time
                              ? new Date(t.check_out_time).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                              : "In Progress"}
                          </span>
                        </td>
                        <td className={styles.td}>
                          {t.duration_hours !== null && t.duration_hours !== undefined ? (
                            <div>
                              <div style={{ fontWeight: 700, color: "#38bdf8" }}>
                                {t.duration_hours} hrs
                              </div>
                              <div className={styles.durationBarContainer}>
                                <div
                                  className={styles.durationBarFill}
                                  style={{
                                    width: `${Math.min(100, (t.duration_hours / 8) * 100)}%`,
                                  }}
                                />
                              </div>
                            </div>
                          ) : (
                            <span style={{ color: "#64748b", fontSize: 12 }}>-</span>
                          )}
                        </td>
                        <td className={styles.td}>
                          {t.verification_type === "face_geo" ? (
                            <span className={styles.badgeInfo}>
                              <BuildingIcon size={12} />
                              <span>Face + 200m Geofence</span>
                            </span>
                          ) : t.verification_type === "face_remote" ? (
                            <span className={styles.badgeWarning}>
                              <LocationPinIcon size={12} />
                              <span>Remote Face Scan</span>
                            </span>
                          ) : (
                            <span className={styles.badgeCyan}>
                              <CheckCircleIcon size={12} />
                              <span>Regularized Punch</span>
                            </span>
                          )}
                        </td>
                        <td className={styles.td}>
                          <span style={{ fontFamily: "monospace", fontWeight: 700 }}>
                            {(t.similarity_score * 100).toFixed(1)}%
                          </span>
                        </td>
                        <td className={styles.td}>
                          <span className={styles.badgeSuccess}>
                            <CheckCircleIcon size={12} color="#34d399" />
                            <span style={{ textTransform: "capitalize" }}>{t.status}</span>
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: OFFICE GEOFENCES                                                   */}
        {/* ========================================================================= */}
        {activeTab === "offices" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Organization Default Timings & Grace Period Settings Card */}
            <div className={styles.timingCard}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, borderBottom: "1px solid #f1f5f9", paddingBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <ClockIcon size={18} color="#0284c7" />
                  <div>
                    <span style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>Company Default Working Hours & Grace Period</span>
                    <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0 0" }}>
                      Applies automatically across all employees as the organization baseline. Regional office campuses and individual night/custom shifts can override this.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveTenantTimings}>
                <div className={styles.timingGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Default Start Time</label>
                    <input
                      type="time"
                      required
                      className={styles.input}
                      value={defaultWorkStartTime}
                      onChange={(e) => setDefaultWorkStartTime(e.target.value)}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Default End Time</label>
                    <input
                      type="time"
                      required
                      className={styles.input}
                      value={defaultWorkEndTime}
                      onChange={(e) => setDefaultWorkEndTime(e.target.value)}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Grace Period (Minutes)</label>
                    <input
                      type="number"
                      min="0"
                      max="120"
                      required
                      className={styles.input}
                      value={defaultGracePeriodMinutes}
                      onChange={(e) => setDefaultGracePeriodMinutes(parseInt(e.target.value, 10) || 0)}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Company Regional Timezone</label>
                    <select
                      className={styles.select}
                      value={defaultTimezone}
                      onChange={(e) => setDefaultTimezone(e.target.value)}
                    >
                      <option value="Asia/Karachi">Asia/Karachi (PKT, UTC+5)</option>
                      <option value="America/New_York">America/New_York (EST/EDT)</option>
                      <option value="America/Chicago">America/Chicago (CST/CDT)</option>
                      <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</option>
                      <option value="Europe/London">Europe/London (GMT/BST)</option>
                      <option value="Europe/Berlin">Europe/Berlin (CET)</option>
                      <option value="Asia/Dubai">Asia/Dubai (GST, UTC+4)</option>
                      <option value="Asia/Kolkata">Asia/Kolkata (IST, UTC+5:30)</option>
                      <option value="Asia/Singapore">Asia/Singapore (SGT, UTC+8)</option>
                      <option value="Asia/Tokyo">Asia/Tokyo (JST, UTC+9)</option>
                      <option value="Australia/Sydney">Australia/Sydney (AEST)</option>
                      <option value="UTC">UTC (Universal)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
                  <button type="submit" disabled={tenantTimingsSaving} className={styles.btnPrimary}>
                    <CheckCircleIcon size={16} />
                    <span>{tenantTimingsSaving ? "Saving Timings..." : "Save Company Default Timings"}</span>
                  </button>
                </div>
              </form>
            </div>

            <div className={styles.tableCard}>
              <div className={styles.tableToolbar}>
                <div className={styles.tableTitle}>
                  <BuildingIcon size={18} color="#818cf8" />
                  <span>Configured Campus Office Geofences & Regional Hours</span>
                </div>

                <div className={styles.toolbarActions}>
                  <button className={styles.btnSecondary} onClick={fetchOffices} title="Refresh Offices">
                    <RefreshIcon size={14} />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.th}>Office Campus</th>
                      <th className={styles.th}>Latitude / Longitude</th>
                      <th className={styles.th}>Geofence Radius</th>
                      <th className={styles.th}>Campus Working Hours</th>
                      <th className={styles.th}>Address / Location</th>
                      <th className={styles.th}>Status</th>
                      <th className={styles.th} style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {offices.length === 0 ? (
                      <tr>
                        <td colSpan={7}>
                          <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>
                              <BuildingIcon size={32} />
                            </div>
                            <div className={styles.emptyTitle}>No Office Locations Configured</div>
                            <p className={styles.emptyDesc}>
                              Define your office locations with GPS coordinates and radius to gate on-site attendance.
                            </p>
                            <button className={styles.btnPrimary} onClick={() => setShowOfficeModal(true)}>
                              <PlusIcon size={16} />
                              <span>Add First Campus Geofence</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      offices.map((off) => (
                        <tr key={off.id} className={styles.tr}>
                          <td className={styles.td}>
                            <div style={{ fontWeight: 600, color: "#0f172a" }}>{off.name}</div>
                          </td>
                          <td className={styles.td} style={{ fontFamily: "monospace", fontSize: 12 }}>
                            {off.latitude.toFixed(5)}, {off.longitude.toFixed(5)}
                          </td>
                          <td className={styles.td}>
                            <span className={styles.badgeInfo}>
                              {off.radius_meters} Meters Circle
                            </span>
                          </td>
                          <td className={styles.td}>
                            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                              <span style={{ fontWeight: 600, color: "#0f172a", fontSize: 12 }}>
                                {off.work_start_time || defaultWorkStartTime || "09:00"} - {off.work_end_time || defaultWorkEndTime || "18:00"}
                              </span>
                              <span style={{ fontSize: 11, color: "#64748b" }}>
                                {off.grace_period_minutes ?? defaultGracePeriodMinutes ?? 15}m grace • {off.timezone || defaultTimezone || "Local"}
                              </span>
                            </div>
                          </td>
                          <td className={styles.td}>{off.address || "Main Site"}</td>
                          <td className={styles.td}>
                            <span className={styles.badgeSuccess}>
                              <CheckCircleIcon size={12} color="#34d399" />
                              <span>Active Geofence</span>
                            </span>
                          </td>
                          <td className={styles.td} style={{ textAlign: "right" }}>
                            <div style={{ display: "inline-flex", gap: 6 }}>
                              <button
                                className={styles.btnSecondary}
                                onClick={() => handleOpenOfficeTimingModal(off)}
                                title="Edit Office Campus Working Hours & Grace Period"
                              >
                                <ClockIcon size={12} color="#0284c7" />
                                <span>Timings</span>
                              </button>
                              <a
                                href={`https://www.openstreetmap.org/?mlat=${off.latitude}&mlon=${off.longitude}#map=16/${off.latitude}/${off.longitude}`}
                                target="_blank"
                                rel="noreferrer"
                                className={styles.btnSecondary}
                                title="Inspect Pin on Map"
                              >
                                <LocationPinIcon size={12} />
                                <span>Map</span>
                              </a>
                              <button
                                className={styles.btnDanger}
                                onClick={() => handleDeleteOffice(off.id, off.name)}
                                title="Remove Office Location"
                              >
                                <TrashIcon size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: BILLING & STRIPE SUBSCRIPTION                                      */}
        {/* ========================================================================= */}
        {activeTab === "billing" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Executive Plan Hero & Subscription Status Card */}
            <div
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                border: "1px solid #e2e8f0",
                borderRadius: 16,
                padding: "32px",
                boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.05)",
                display: "flex",
                flexDirection: "column",
                gap: 24,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: 20,
                  borderBottom: "1px solid #f1f5f9",
                  paddingBottom: 24,
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: 0.6,
                        padding: "4px 12px",
                        borderRadius: 20,
                        background: billingInfo?.subscription_status === "active" ? "#ecfdf5" : "#eff6ff",
                        color: billingInfo?.subscription_status === "active" ? "#059669" : "#0284c7",
                        border: `1px solid ${billingInfo?.subscription_status === "active" ? "#a7f3d0" : "#bfdbfe"}`,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: billingInfo?.subscription_status === "active" ? "#10b981" : "#0284c7",
                        }}
                      />
                      {billingInfo?.subscription_status === "active" ? "Active Subscription" : "14-Day Free Trial"}
                    </span>

                    <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>
                      {billingInfo?.trial_days_remaining != null
                        ? `${billingInfo.trial_days_remaining} days left in trial`
                        : "14 days free • No charge today"}
                    </span>
                  </div>

                  <h2 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", letterSpacing: -0.5 }}>
                    Enterprise Workforce Attendance Plan
                  </h2>
                  <p style={{ fontSize: 14, color: "#64748b", marginTop: 6, maxWidth: 650, lineHeight: 1.5 }}>
                    512D deep biometric face verification, campus-grade OpenStreetMap geofencing, multi-tier leave approval routing, and automatic AWS SES invite tokens.
                  </p>
                </div>

                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 12,
                    padding: "16px 24px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Billed Monthly
                  </span>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 4 }}>
                    <span style={{ fontSize: 32, fontWeight: 800, color: "#0f172a" }}>$2.00</span>
                    <span style={{ fontSize: 14, color: "#64748b", fontWeight: 500 }}>/ user / month</span>
                  </div>
                  <span style={{ fontSize: 12, color: "#10b981", fontWeight: 600, marginTop: 4 }}>
                    First 14 days free
                  </span>
                </div>
              </div>

              {/* Action Buttons & Portal Access */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 16,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: "#f0fdf4",
                      border: "1px solid #bbf7d0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CheckCircleIcon size={20} color="#16a34a" />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                      Automatic Seat Proration
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>
                      Adding or removing workforce members updates your Stripe billing automatically.
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {billingInfo?.has_stripe_customer && (
                    <button
                      className={styles.btnSecondary}
                      onClick={handleOpenCustomerPortal}
                      disabled={billingLoading}
                      style={{ padding: "12px 20px" }}
                    >
                      <CreditCardIcon size={16} />
                      <span>Manage Invoices & Payment Cards</span>
                    </button>
                  )}

                  <button
                    className={styles.btnPrimary}
                    onClick={handleStartSubscription}
                    disabled={billingLoading}
                    style={{
                      padding: "12px 26px",
                      fontSize: 14,
                      fontWeight: 600,
                      boxShadow: "0 4px 14px rgba(79, 70, 229, 0.3)",
                    }}
                  >
                    <ZapIcon size={16} color="#ffffff" />
                    <span>
                      {billingInfo?.subscription_status === "active"
                        ? "Update Subscription via Stripe"
                        : "Start 14-Day Free Trial Now"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Pricing Breakdown & Features Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 24 }}>
              {/* Interactive Cost & Seat Breakdown Card */}
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 16,
                  padding: "28px",
                  boxShadow: "0 1px 4px rgba(0, 0, 0, 0.04)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: "#eff6ff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <CreditCardIcon size={16} color="#0284c7" />
                    </div>
                    <span style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
                      Subscription Summary
                    </span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "12px 14px",
                        background: "#f8fafc",
                        borderRadius: 10,
                        border: "1px solid #f1f5f9",
                      }}
                    >
                      <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>Active Employees</span>
                      <strong style={{ fontSize: 15, color: "#0f172a" }}>
                        {billingInfo?.seat_count || employees.length} Members
                      </strong>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "12px 14px",
                        background: "#f8fafc",
                        borderRadius: 10,
                        border: "1px solid #f1f5f9",
                      }}
                    >
                      <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>Base Seat Price</span>
                      <strong style={{ fontSize: 15, color: "#0f172a" }}>$2.00 / member / mo</strong>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "12px 14px",
                        background: "#ecfdf5",
                        borderRadius: 10,
                        border: "1px solid #a7f3d0",
                      }}
                    >
                      <span style={{ fontSize: 13, color: "#065f46", fontWeight: 500 }}>Due Today (14-Day Trial)</span>
                      <strong style={{ fontSize: 15, color: "#047857" }}>$0.00 USD</strong>
                    </div>

                    <div
                      style={{
                        borderTop: "2px dashed #e2e8f0",
                        marginTop: 6,
                        paddingTop: 16,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>Total After 14 Days:</div>
                        <div style={{ fontSize: 12, color: "#94a3b8" }}>Billed monthly via Stripe</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: 28, fontWeight: 800, color: "#4f46e5", letterSpacing: -0.5 }}>
                          ${((billingInfo?.seat_count || employees.length) * 2).toFixed(2)}
                        </span>
                        <span style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}> /mo</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 24,
                    paddingTop: 16,
                    borderTop: "1px solid #f1f5f9",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 12,
                    color: "#64748b",
                  }}
                >
                  <LockIcon size={14} color="#10b981" />
                  <span>Secure 256-bit SSL encrypted checkout powered by Stripe.</span>
                </div>
              </div>

              {/* What's Included Feature List */}
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 16,
                  padding: "28px",
                  boxShadow: "0 1px 4px rgba(0, 0, 0, 0.04)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: "#f0fdf4",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CheckCircleIcon size={16} color="#16a34a" />
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
                    Included Features
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ marginTop: 2 }}>
                      <CheckCircleIcon size={16} color="#10b981" />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>
                        Deep Biometric Face Recognition
                      </div>
                      <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                        512D facial landmark verification with anti-spoofing and liveness checks.
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ marginTop: 2 }}>
                      <CheckCircleIcon size={16} color="#10b981" />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>
                        OpenStreetMap Campus Geofencing
                      </div>
                      <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                        Configurable radius validation per office with interactive map picker.
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ marginTop: 2 }}>
                      <CheckCircleIcon size={16} color="#10b981" />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>
                        Multi-Level Leave & Regularization Tiers
                      </div>
                      <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                        Manager review, HR verification, and executive Admin direct bypass.
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ marginTop: 2 }}>
                      <CheckCircleIcon size={16} color="#10b981" />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>
                        Automated Onboarding & SES Invites
                      </div>
                      <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                        One-click invite links, email credentials, and instant device activation.
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ marginTop: 2 }}>
                      <CheckCircleIcon size={16} color="#10b981" />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>
                        Comprehensive Reports & Timesheet Export
                      </div>
                      <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                        One-click CSV downloads, shift summaries, and attendance audits.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* MODAL 1: ADD EMPLOYEE VIA FORM                                            */}
      {/* ========================================================================= */}
      {showAddEmployeeModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <UserPlusIcon size={20} color="#818cf8" />
                <span>Onboard New Employee</span>
              </div>
              <button
                className={styles.modalClose}
                onClick={() => {
                  setShowAddEmployeeModal(false);
                  setCreatedEmployeeResult(null);
                }}
              >
                <CloseIcon size={18} />
              </button>
            </div>

            {createdEmployeeResult ? (
              <div className={styles.modalBody}>
                <div
                  style={{
                    background: "rgba(16, 185, 129, 0.12)",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                    padding: 16,
                    borderRadius: 12,
                    marginBottom: 20,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#34d399", fontWeight: 700 }}>
                    <CheckCircleIcon size={18} color="#34d399" />
                    <span>Employee Successfully Registered!</span>
                  </div>
                  <p style={{ fontSize: 13, color: "#cbd5e1", marginTop: 6 }}>
                    Employee account created. Share this enrollment invite token with the employee to onboard their mobile app.
                  </p>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>48-Hour Biometric Enrollment Token</label>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: "rgba(0, 0, 0, 0.4)",
                      padding: "10px 14px",
                      borderRadius: 8,
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      fontFamily: "monospace",
                      fontSize: 12,
                      color: "#fbbf24",
                    }}
                  >
                    <span style={{ wordBreak: "break-all" }}>{createdEmployeeResult.invite_token}</span>
                    <button
                      className={styles.btnSecondary}
                      onClick={() => {
                        navigator.clipboard.writeText(createdEmployeeResult.invite_token);
                        showToast("Copied invitation token to clipboard.");
                      }}
                    >
                      <CopyIcon size={14} />
                      <span>Copy</span>
                    </button>
                  </div>
                </div>

                <div className={styles.modalFooter} style={{ padding: "16px 0 0" }}>
                  <button
                    className={styles.btnPrimary}
                    onClick={() => {
                      setShowAddEmployeeModal(false);
                      setCreatedEmployeeResult(null);
                    }}
                  >
                    <span>Done & Close</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateEmployee}>
                <div className={styles.modalBody}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>First Name *</label>
                      <input
                        type="text"
                        required
                        className={styles.input}
                        placeholder="e.g. Alex"
                        value={empFirstName}
                        onChange={(e) => setEmpFirstName(e.target.value)}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Last Name *</label>
                      <input
                        type="text"
                        required
                        className={styles.input}
                        placeholder="e.g. Morgan"
                        value={empLastName}
                        onChange={(e) => setEmpLastName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Department *</label>
                      <input
                        type="text"
                        required
                        className={styles.input}
                        placeholder="e.g. Engineering"
                        value={empDepartment}
                        onChange={(e) => setEmpDepartment(e.target.value)}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Designation *</label>
                      <input
                        type="text"
                        required
                        className={styles.input}
                        placeholder="e.g. Software Engineer"
                        value={empDesignation}
                        onChange={(e) => setEmpDesignation(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 14 }}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Work Email Address *</label>
                      <input
                        type="email"
                        required
                        className={styles.input}
                        placeholder="alex.morgan@company.com"
                        value={empEmail}
                        onChange={(e) => setEmpEmail(e.target.value)}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Phone Number</label>
                      <input
                        type="tel"
                        className={styles.input}
                        placeholder="+1 555 123 4567"
                        value={empPhoneNumber}
                        onChange={(e) => setEmpPhoneNumber(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Employee Code (Optional, leave blank to auto-generate)</label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="e.g. EMP-1049"
                      value={empCode}
                      onChange={(e) => setEmpCode(e.target.value)}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Work Location Mode *</label>
                      <select
                        className={styles.select}
                        value={empWorkMode}
                        onChange={(e) => {
                          const mode = e.target.value as "on_site" | "remote";
                          setEmpWorkMode(mode);
                          if (mode === "on_site" && !empOfficeId && offices.length > 0) {
                            setEmpOfficeId(offices[0].id);
                          }
                        }}
                      >
                        <option value="on_site">On-Site Campus (Geofenced)</option>
                        <option value="remote">Remote (Work From Anywhere)</option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Portal Role</label>
                      <select
                        className={styles.select}
                        value={empRole}
                        onChange={(e) => setEmpRole(e.target.value)}
                      >
                        <option value="employee">Employee</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>
                  </div>

                  {/* Single Location Assignment (When On-Site) or Remote Info */}
                  {empWorkMode === "on_site" ? (
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Assigned Campus (Single Location) *</label>
                      {offices.length === 0 ? (
                        <div style={{ fontSize: 12, color: "#f59e0b", padding: "8px 12px", background: "rgba(245, 158, 11, 0.1)", borderRadius: 6 }}>
                          No office campuses created yet. Please create a campus first.
                        </div>
                      ) : (
                        <select
                          className={styles.select}
                          value={empOfficeId}
                          onChange={(e) => setEmpOfficeId(e.target.value)}
                          required
                        >
                          <option value="" disabled>Select Office Campus...</option>
                          {offices.map((off) => (
                            <option key={off.id} value={off.id}>
                              {off.name} ({off.radius_meters}m radius)
                            </option>
                          ))}
                        </select>
                      )}
                      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                        Staff can only belong to one physical campus location for attendance validation.
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: "10px 14px", background: "rgba(56, 189, 248, 0.08)", borderRadius: 8, border: "1px solid rgba(56, 189, 248, 0.2)", display: "flex", alignItems: "center", gap: 10 }}>
                      <LocationPinIcon size={16} color="#38bdf8" />
                      <div style={{ fontSize: 12, color: "#cbd5e1", lineHeight: "1.4" }}>
                        <strong>Remote Employee:</strong> Geofence validation is waived. Staff can check in from anywhere without office radius restrictions.
                      </div>
                    </div>
                  )}

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Direct Reporting Manager (Optional)</label>
                    <select
                      className={styles.select}
                      value={empManagerId}
                      onChange={(e) => setEmpManagerId(e.target.value)}
                    >
                      <option value="">None (Reports directly to Admin / Super Admin)</option>
                      {employees.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.full_name} ({e.role})
                        </option>
                      ))}
                    </select>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                      Leave requests will route to this manager for Level 1 approval before Level 2 HR/Admin.
                    </div>
                  </div>
                </div>

                <div className={styles.modalFooter}>
                  <button
                    type="button"
                    className={styles.btnSecondary}
                    onClick={() => setShowAddEmployeeModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" disabled={loading} className={styles.btnPrimary}>
                    <UserPlusIcon size={16} />
                    <span>{loading ? "Registering..." : "Add to Workforce"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1A: IMPORT EMPLOYEES VIA CSV (3-STEP WIZARD)                       */}
      {/* ========================================================================= */}
      {showImportModal && (
        <div className={styles.modalBackdrop}>
          <div
            className={styles.modalCard}
            style={{
              maxWidth: importStep === 2 ? 980 : 640,
              width: "100%",
              transition: "max-width 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {/* Modal Header */}
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <UploadCloudIcon size={20} color="#0284c7" />
                <span>Import Employees via CSV</span>
              </div>
              <button className={styles.modalClose} onClick={handleImportClose}>
                <CloseIcon size={18} />
              </button>
            </div>

            {/* Step Wizard Indicator */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "16px 24px",
                background: "#f8fafc",
                borderBottom: "1px solid #e2e8f0",
                gap: 8,
              }}
            >
              {[
                { n: 1 as const, label: "1. Upload File" },
                { n: 2 as const, label: "2. Verify & Preview" },
                { n: 3 as const, label: "3. Import Result" },
              ].map((step, idx) => {
                const isActive = importStep === step.n;
                const isDone = importStep > step.n;
                return (
                  <React.Fragment key={step.n}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          fontWeight: 700,
                          background: isDone ? "#10b981" : isActive ? "#0284c7" : "#e2e8f0",
                          color: isDone || isActive ? "#ffffff" : "#64748b",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {isDone ? <CheckCircleIcon size={14} color="#ffffff" /> : step.n}
                      </div>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: isActive ? 700 : 500,
                          color: isActive ? "#0f172a" : isDone ? "#059669" : "#64748b",
                        }}
                      >
                        {step.label}
                      </span>
                    </div>
                    {idx < 2 && (
                      <div
                        style={{
                          width: 36,
                          height: 2,
                          background: isDone ? "#10b981" : "#e2e8f0",
                          margin: "0 4px",
                        }}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* STEP 1: UPLOAD CSV FILE */}
            {importStep === 1 && (
              <div className={styles.modalBody} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                    Select or Drop Workforce CSV
                  </h3>
                  <p style={{ fontSize: 12, color: "#64748b", margin: "4px 0 0" }}>
                    Your CSV must include: First Name, Last Name, Email, Employee Code. Department, Designation, Phone Number, and Work Mode are optional.
                  </p>
                </div>

                {/* Template Download Banner */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 16px",
                    background: "#f0f9ff",
                    border: "1px solid #bae6fd",
                    borderRadius: 10,
                  }}
                >
                  <FileTextIcon size={18} color="#0284c7" />
                  <div style={{ fontSize: 12, color: "#0369a1", flex: 1 }}>
                    Need the formatted template?{" "}
                    <button
                      type="button"
                      onClick={handleDownloadImportTemplate}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#0284c7",
                        fontWeight: 700,
                        textDecoration: "underline",
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      Download CSV Template
                    </button>
                  </div>
                </div>

                {/* Drag and Drop Box */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setImportDragging(true);
                  }}
                  onDragLeave={() => setImportDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setImportDragging(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleImportFileSelect(file);
                  }}
                  onClick={() => {
                    const input = document.getElementById("csv_file_input") as HTMLInputElement;
                    if (input) input.click();
                  }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    padding: "36px 20px",
                    border: `2px dashed ${importDragging ? "#0284c7" : importFile ? "#10b981" : "#cbd5e1"}`,
                    background: importDragging ? "#f0f9ff" : importFile ? "#f0fdf4" : "#f8fafc",
                    borderRadius: 12,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <input
                    id="csv_file_input"
                    type="file"
                    accept=".csv,text/csv"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImportFileSelect(file);
                    }}
                  />
                  {importFile ? (
                    <>
                      <CheckCircleIcon size={32} color="#10b981" />
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{importFile.name}</div>
                        <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                          {(importFile.size / 1024).toFixed(1)} KB • Click to replace file
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <UploadCloudIcon size={32} color="#94a3b8" />
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>
                          Drop your CSV file here
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                          or click to browse your computer
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Error Banner */}
                {importError && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "10px 14px",
                      background: "#fef2f2",
                      border: "1px solid #fecaca",
                      borderRadius: 8,
                      color: "#dc2626",
                      fontSize: 12,
                    }}
                  >
                    <XCircleIcon size={16} color="#dc2626" />
                    <span>{importError}</span>
                  </div>
                )}

                {/* Footer Action */}
                <div className={styles.modalFooter} style={{ padding: "16px 0 0", margin: 0, background: "transparent", borderTop: "none" }}>
                  <button type="button" className={styles.btnSecondary} onClick={handleImportClose}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={styles.btnPrimary}
                    onClick={handleImportPreviewSubmit}
                    disabled={!importFile || importLoading}
                  >
                    <CheckCircleIcon size={16} />
                    <span>{importLoading ? "Analyzing CSV..." : "Preview Import"}</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: PREVIEW & VERIFICATION TABLE */}
            {importStep === 2 && importPreview && (
              <div className={styles.modalBody} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Metric Summary Badges */}
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      background: "#f0fdf4",
                      border: "1px solid #bbf7d0",
                      padding: "6px 14px",
                      borderRadius: 8,
                    }}
                  >
                    <CheckCircleIcon size={15} color="#16a34a" />
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#166534" }}>
                      {importPreview.valid_rows} Valid
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      background: "#fef2f2",
                      border: "1px solid #fecaca",
                      padding: "6px 14px",
                      borderRadius: 8,
                    }}
                  >
                    <XCircleIcon size={15} color="#dc2626" />
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#991b1b" }}>
                      {importPreview.invalid_rows} Invalid
                    </span>
                  </div>

                  {(() => {
                    const dupCount = importPreview.preview.filter((r) => r.is_duplicate).length;
                    return dupCount > 0 ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          background: "#fffbeb",
                          border: "1px solid #fde68a",
                          padding: "6px 14px",
                          borderRadius: 8,
                        }}
                      >
                        <AlertTriangleIcon size={15} color="#d97706" />
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#92400e" }}>
                          {dupCount} Duplicate{dupCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                    ) : null;
                  })()}

                  <div style={{ marginLeft: "auto", fontSize: 12, color: "#64748b" }}>
                    {importPreview.total_rows} total rows in CSV
                  </div>
                </div>

                {/* Error Banner */}
                {importError && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "10px 14px",
                      background: "#fef2f2",
                      border: "1px solid #fecaca",
                      borderRadius: 8,
                      color: "#dc2626",
                      fontSize: 12,
                    }}
                  >
                    <XCircleIcon size={16} color="#dc2626" />
                    <span>{importError}</span>
                  </div>
                )}

                {/* Row-by-Row Preview Table */}
                <div
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: 10,
                    overflow: "hidden",
                    maxHeight: 380,
                    overflowY: "auto",
                    overflowX: "auto",
                  }}
                >
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: "#f8fafc", textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>
                        <th style={{ padding: "8px 12px", color: "#64748b", fontWeight: 600, width: 44 }}>Row</th>
                        <th style={{ padding: "8px 12px", color: "#64748b", fontWeight: 600 }}>First Name</th>
                        <th style={{ padding: "8px 12px", color: "#64748b", fontWeight: 600 }}>Last Name</th>
                        <th style={{ padding: "8px 12px", color: "#64748b", fontWeight: 600 }}>Email</th>
                        <th style={{ padding: "8px 12px", color: "#64748b", fontWeight: 600 }}>Code</th>
                        <th style={{ padding: "8px 12px", color: "#64748b", fontWeight: 600 }}>Department</th>
                        <th style={{ padding: "8px 12px", color: "#64748b", fontWeight: 600 }}>Designation</th>
                        <th style={{ padding: "8px 12px", color: "#64748b", fontWeight: 600 }}>Mode</th>
                        <th style={{ padding: "8px 12px", color: "#64748b", fontWeight: 600 }}>Duplicate?</th>
                        <th style={{ padding: "8px 12px", color: "#64748b", fontWeight: 600 }}>Validation Errors</th>
                        <th style={{ padding: "8px 12px", color: "#64748b", fontWeight: 600, textAlign: "center", width: 50 }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importPreview.preview.map((row) => (
                        <tr
                          key={row.row}
                          style={{
                            borderBottom: "1px solid #f1f5f9",
                            background: !row.valid
                              ? "rgba(254, 242, 242, 0.5)"
                              : row.is_duplicate
                                ? "rgba(255, 251, 235, 0.5)"
                                : "#ffffff",
                          }}
                        >
                          <td style={{ padding: "8px 12px", fontFamily: "monospace", color: "#64748b" }}>{row.row}</td>
                          <td style={{ padding: "8px 12px", fontWeight: 600, color: "#0f172a" }}>
                            {row.first_name || <span style={{ color: "#94a3b8", fontStyle: "italic" }}>—</span>}
                          </td>
                          <td style={{ padding: "8px 12px", fontWeight: 600, color: "#0f172a" }}>
                            {row.last_name || <span style={{ color: "#94a3b8", fontStyle: "italic" }}>—</span>}
                          </td>
                          <td style={{ padding: "8px 12px", color: "#334155" }}>
                            {row.email || <span style={{ color: "#94a3b8", fontStyle: "italic" }}>—</span>}
                          </td>
                          <td style={{ padding: "8px 12px", fontFamily: "monospace", color: "#0284c7" }}>
                            {row.employee_code || <span style={{ color: "#94a3b8", fontStyle: "italic" }}>—</span>}
                          </td>
                          <td style={{ padding: "8px 12px", color: "#475569" }}>
                            {row.department || "General"}
                          </td>
                          <td style={{ padding: "8px 12px", color: "#475569" }}>
                            {row.designation || "Team Member"}
                          </td>
                          <td style={{ padding: "8px 12px" }}>
                            <span
                              style={{
                                padding: "2px 8px",
                                borderRadius: 12,
                                fontSize: 11,
                                fontWeight: 600,
                                background: row.work_mode === "remote" ? "#ede9fe" : "#e0f2fe",
                                color: row.work_mode === "remote" ? "#6d28d9" : "#0369a1",
                              }}
                            >
                              {row.work_mode === "remote" ? "Remote" : "On-Site"}
                            </span>
                          </td>
                          <td style={{ padding: "8px 12px" }}>
                            {row.is_duplicate ? (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#d97706", fontWeight: 600, fontSize: 11 }}>
                                <AlertTriangleIcon size={12} color="#d97706" /> Yes
                              </span>
                            ) : (
                              <span style={{ color: "#94a3b8" }}>—</span>
                            )}
                          </td>
                          <td style={{ padding: "8px 12px", maxWidth: 220 }}>
                            {row.errors.length > 0 ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                {row.errors.map((err, i) => (
                                  <span key={i} style={{ color: "#dc2626", fontSize: 11, lineHeight: 1.2 }}>
                                    • {err}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span style={{ color: "#94a3b8" }}>—</span>
                            )}
                          </td>
                          <td style={{ padding: "8px 12px", textAlign: "center" }}>
                            {row.valid ? (
                              <CheckCircleIcon size={16} color="#16a34a" />
                            ) : (
                              <XCircleIcon size={16} color="#dc2626" />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Footer Actions */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: 8,
                  }}
                >
                  <button
                    type="button"
                    className={styles.btnSecondary}
                    onClick={() => setImportStep(1)}
                    disabled={importLoading}
                  >
                    <ArrowLeftIcon size={14} />
                    <span>Upload Different File</span>
                  </button>

                  <button
                    type="button"
                    className={styles.btnPrimary}
                    onClick={handleImportCommitSubmit}
                    disabled={importPreview.valid_rows === 0 || importLoading}
                  >
                    <UploadCloudIcon size={16} />
                    <span>
                      {importLoading
                        ? "Importing Workforce..."
                        : `Import ${importPreview.valid_rows} Valid Row${importPreview.valid_rows !== 1 ? "s" : ""}`}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: RESULT SUMMARY */}
            {importStep === 3 && importResult && (
              <div className={styles.modalBody} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {/* Completion Banner */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "18px 20px",
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: 12,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: "#dcfce7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <CheckCircleIcon size={24} color="#16a34a" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#166534", margin: 0 }}>
                      Workforce Import Complete
                    </h3>
                    <p style={{ fontSize: 13, color: "#15803d", margin: "4px 0 0" }}>
                      <strong>{importResult.created} record{importResult.created !== 1 ? "s" : ""}</strong> successfully created
                      {importResult.skipped > 0 && (
                        <span>, <strong style={{ color: "#b45309" }}>{importResult.skipped} skipped</strong></span>
                      )}{" "}
                      out of {importResult.total_rows} rows processed.
                    </p>
                  </div>
                </div>

                {/* Created Records Table */}
                {importResult.created_records.length > 0 && (
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                      <CheckCircleIcon size={14} color="#16a34a" />
                      <span>Successfully Created Accounts ({importResult.created_records.length})</span>
                    </div>
                    <div
                      style={{
                        border: "1px solid #e2e8f0",
                        borderRadius: 8,
                        maxHeight: 200,
                        overflowY: "auto",
                      }}
                    >
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                        <thead>
                          <tr style={{ background: "#f8fafc", textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>
                            <th style={{ padding: "8px 12px", color: "#64748b", fontWeight: 600 }}>Code</th>
                            <th style={{ padding: "8px 12px", color: "#64748b", fontWeight: 600 }}>Employee Name</th>
                            <th style={{ padding: "8px 12px", color: "#64748b", fontWeight: 600 }}>Work Email</th>
                            <th style={{ padding: "8px 12px", color: "#64748b", fontWeight: 600 }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {importResult.created_records.map((rec) => (
                            <tr key={rec.row} style={{ borderBottom: "1px solid #f1f5f9" }}>
                              <td style={{ padding: "8px 12px", fontFamily: "monospace", color: "#0284c7" }}>
                                {rec.employee_code}
                              </td>
                              <td style={{ padding: "8px 12px", fontWeight: 600, color: "#0f172a" }}>
                                {rec.first_name} {rec.last_name}
                              </td>
                              <td style={{ padding: "8px 12px", color: "#475569" }}>{rec.email}</td>
                              <td style={{ padding: "8px 12px", color: "#16a34a", fontSize: 11, fontWeight: 600 }}>
                                Enrolled & Invite Sent
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Skipped Records Table */}
                {importResult.skipped_records.length > 0 && (
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#991b1b", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                      <AlertTriangleIcon size={14} color="#dc2626" />
                      <span>Skipped Records ({importResult.skipped_records.length})</span>
                    </div>
                    <div
                      style={{
                        border: "1px solid #fecaca",
                        borderRadius: 8,
                        maxHeight: 180,
                        overflowY: "auto",
                        background: "#fff5f5",
                      }}
                    >
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                        <thead>
                          <tr style={{ background: "#fee2e2", textAlign: "left", borderBottom: "1px solid #fecaca" }}>
                            <th style={{ padding: "8px 12px", color: "#991b1b", fontWeight: 600, width: 44 }}>Row</th>
                            <th style={{ padding: "8px 12px", color: "#991b1b", fontWeight: 600 }}>Employee Name</th>
                            <th style={{ padding: "8px 12px", color: "#991b1b", fontWeight: 600 }}>Email</th>
                            <th style={{ padding: "8px 12px", color: "#991b1b", fontWeight: 600 }}>Skip Reason</th>
                          </tr>
                        </thead>
                        <tbody>
                          {importResult.skipped_records.map((rec) => (
                            <tr key={rec.row} style={{ borderBottom: "1px solid #fecaca" }}>
                              <td style={{ padding: "8px 12px", fontFamily: "monospace", color: "#991b1b" }}>{rec.row}</td>
                              <td style={{ padding: "8px 12px", fontWeight: 600, color: "#991b1b" }}>
                                {rec.first_name} {rec.last_name}
                              </td>
                              <td style={{ padding: "8px 12px", color: "#991b1b" }}>{rec.email}</td>
                              <td style={{ padding: "8px 12px", color: "#dc2626", fontWeight: 600 }}>{rec.reason}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Footer Action */}
                <div className={styles.modalFooter} style={{ padding: "16px 0 0", margin: 0, background: "transparent", borderTop: "none" }}>
                  <button type="button" className={styles.btnPrimary} onClick={handleImportClose}>
                    <UsersIcon size={16} />
                    <span>Done & View in Roster</span>
                    <ChevronRightIcon size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1B: EDIT EMPLOYEE PROFILE                                           */}
      {/* ========================================================================= */}
      {showEditEmployeeModal && editingEmployee && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <PencilIcon size={20} color="#38bdf8" />
                <span>Edit Employee Profile</span>
              </div>
              <button
                className={styles.modalClose}
                onClick={() => {
                  setShowEditEmployeeModal(false);
                  setEditingEmployee(null);
                }}
              >
                <CloseIcon size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateEmployee}>
              <div className={styles.modalBody}>
                <div style={{ padding: "12px 14px", background: "rgba(0, 0, 0, 0.3)", borderRadius: 8, marginBottom: 14, border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                  <div style={{ fontWeight: 600, color: "#ffffff", fontSize: 14 }}>{editingEmployee.full_name}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                    {editingEmployee.email} • Code: <span style={{ fontFamily: "monospace", color: "#a5b4fc" }}>{editingEmployee.employee_code}</span>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>First Name *</label>
                    <input
                      type="text"
                      required
                      className={styles.input}
                      placeholder="e.g. Alex"
                      value={editEmpFirstName}
                      onChange={(e) => setEditEmpFirstName(e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Last Name *</label>
                    <input
                      type="text"
                      required
                      className={styles.input}
                      placeholder="e.g. Morgan"
                      value={editEmpLastName}
                      onChange={(e) => setEditEmpLastName(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Department</label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="e.g. Engineering"
                      value={editEmpDepartment}
                      onChange={(e) => setEditEmpDepartment(e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Designation</label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="e.g. Senior Lead"
                      value={editEmpDesignation}
                      onChange={(e) => setEditEmpDesignation(e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Phone Number</label>
                  <input
                    type="tel"
                    className={styles.input}
                    placeholder="e.g. +1 555 123 4567"
                    value={editEmpPhoneNumber}
                    onChange={(e) => setEditEmpPhoneNumber(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Portal Role *</label>
                  {editingEmployee.id === user?.id && user?.role === "super_admin" ? (
                    <div style={{ padding: "8px 12px", background: "rgba(99, 102, 241, 0.15)", borderRadius: 6, border: "1px solid rgba(99, 102, 241, 0.3)", color: "#818cf8", fontSize: 13, fontWeight: 600 }}>
                      Super Admin (Self - Protected)
                    </div>
                  ) : (
                    <select
                      className={styles.select}
                      value={editEmpRole}
                      onChange={(e) => setEditEmpRole(e.target.value)}
                    >
                      <option value="employee">Employee</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Administrator</option>
                    </select>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Work Location Mode *</label>
                  <select
                    className={styles.select}
                    value={editEmpWorkMode}
                    onChange={(e) => {
                      const mode = e.target.value as "on_site" | "remote";
                      setEditEmpWorkMode(mode);
                      if (mode === "on_site" && !editEmpOfficeId && offices.length > 0) {
                        setEditEmpOfficeId(offices[0].id);
                      }
                    }}
                  >
                    <option value="on_site">On-Site Campus (Geofenced)</option>
                    <option value="remote">Remote (Work From Anywhere)</option>
                  </select>
                </div>

                {editEmpWorkMode === "on_site" ? (
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Assigned Campus (Single Location) *</label>
                    {offices.length === 0 ? (
                      <div style={{ fontSize: 12, color: "#f59e0b", padding: "8px 12px", background: "rgba(245, 158, 11, 0.1)", borderRadius: 6 }}>
                        No office campuses configured yet.
                      </div>
                    ) : (
                      <select
                        className={styles.select}
                        value={editEmpOfficeId}
                        onChange={(e) => setEditEmpOfficeId(e.target.value)}
                        required
                      >
                        <option value="" disabled>Select Office Campus...</option>
                        {offices.map((off) => (
                          <option key={off.id} value={off.id}>
                            {off.name} ({off.radius_meters}m radius)
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                ) : (
                  <div style={{ padding: "10px 14px", background: "rgba(56, 189, 248, 0.08)", borderRadius: 8, border: "1px solid rgba(56, 189, 248, 0.2)", display: "flex", alignItems: "center", gap: 10 }}>
                    <LocationPinIcon size={16} color="#38bdf8" />
                    <div style={{ fontSize: 12, color: "#cbd5e1", lineHeight: "1.4" }}>
                      <strong>Remote Employee:</strong> Staff is not tied to any physical office and geofence validation is waived.
                    </div>
                  </div>
                )}

                <div className={styles.formGroup}>
                  <label className={styles.label}>Direct Reporting Manager (Level 1 Leave Approver)</label>
                  <select
                    className={styles.select}
                    value={editEmpManagerId}
                    onChange={(e) => setEditEmpManagerId(e.target.value)}
                  >
                    <option value="">None (Reports directly to Admin / Super Admin)</option>
                    {employees
                      .filter((e) => e.id !== editingEmployee.id)
                      .map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.full_name} ({e.role})
                        </option>
                      ))}
                  </select>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                    Leave applications will route to this manager for Level 1 approval.
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => {
                    setShowEditEmployeeModal(false);
                    setEditingEmployee(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" disabled={loading} className={styles.btnPrimary}>
                  <PencilIcon size={14} />
                  <span>{loading ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: REQUEST LEAVE FORM                                               */}
      {/* ========================================================================= */}
      {showLeaveModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <CalendarIcon size={20} color="#818cf8" />
                <span>Submit Leave Application</span>
              </div>
              <button className={styles.modalClose} onClick={() => setShowLeaveModal(false)}>
                <CloseIcon size={18} />
              </button>
            </div>

            <form onSubmit={handleApplyLeave}>
              <div className={styles.modalBody}>
                {employees.length > 0 && (
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Apply For Employee</label>
                    <select
                      className={styles.select}
                      value={leaveUserId}
                      onChange={(e) => setLeaveUserId(e.target.value)}
                    >
                      <option value="">Myself ({user?.full_name})</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.full_name} ({emp.employee_code})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className={styles.formGroup}>
                  <label className={styles.label}>Leave Type</label>
                  <select
                    className={styles.select}
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                  >
                    <option value="Annual Leave">Annual Leave</option>
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Casual Leave">Casual Leave</option>
                    <option value="Emergency Leave">Emergency Leave</option>
                    <option value="Remote Work Day">Remote Work Day</option>
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Start Date *</label>
                    <input
                      type="date"
                      required
                      className={styles.input}
                      value={leaveStartDate}
                      onChange={(e) => setLeaveStartDate(e.target.value)}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>End Date *</label>
                    <input
                      type="date"
                      required
                      className={styles.input}
                      value={leaveEndDate}
                      onChange={(e) => setLeaveEndDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Reason / Justification *</label>
                  <textarea
                    required
                    className={styles.textarea}
                    placeholder="Provide context or explanation for management review..."
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => setShowLeaveModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" disabled={loading} className={styles.btnPrimary}>
                  <CheckCircleIcon size={16} />
                  <span>{loading ? "Submitting..." : "Submit Application"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: REQUEST MISSED ATTENDANCE REGULARIZATION                         */}
      {/* ========================================================================= */}
      {showRegularizeModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <ClockIcon size={20} color="#818cf8" />
                <span>Regularize Missed Attendance</span>
              </div>
              <button className={styles.modalClose} onClick={() => setShowRegularizeModal(false)}>
                <CloseIcon size={18} />
              </button>
            </div>

            <form onSubmit={handleApplyRegularization}>
              <div className={styles.modalBody}>
                {employees.length > 0 && (
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Employee</label>
                    <select
                      className={styles.select}
                      value={regUserId}
                      onChange={(e) => setRegUserId(e.target.value)}
                    >
                      <option value="">Myself ({user?.full_name})</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.full_name} ({emp.employee_code})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className={styles.formGroup}>
                  <label className={styles.label}>Missed Punch Date *</label>
                  <input
                    type="date"
                    required
                    className={styles.input}
                    value={regDate}
                    onChange={(e) => setRegDate(e.target.value)}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Expected Check-In *</label>
                    <input
                      type="time"
                      required
                      className={styles.input}
                      value={regCheckInTime}
                      onChange={(e) => setRegCheckInTime(e.target.value)}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Expected Check-Out</label>
                    <input
                      type="time"
                      className={styles.input}
                      value={regCheckOutTime}
                      onChange={(e) => setRegCheckOutTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Reason for Missed Scan</label>
                  <select
                    className={styles.select}
                    value={regReasonSelect}
                    onChange={(e) => setRegReasonSelect(e.target.value)}
                  >
                    <option value="Battery Depleted">Mobile Device Battery Depleted</option>
                    <option value="Camera Scanner Sensor Error">Camera Scanner Glitch / Hardware Error</option>
                    <option value="Client Site Meeting">Off-Site Meeting Outside Office Geofence</option>
                    <option value="Network Connectivity Outage">Entrance Gate Network Connectivity Outage</option>
                    <option value="Emergency Office Arrival">Emergency Office Arrival / Urgent Escalation</option>
                    <option value="Other Explanation">Other Specific Reason</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Explanation Details *</label>
                  <textarea
                    required
                    className={styles.textarea}
                    placeholder="Describe reason for missed face recognition scan..."
                    value={regReasonNotes}
                    onChange={(e) => setRegReasonNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => setShowRegularizeModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" disabled={loading} className={styles.btnPrimary}>
                  <CheckCircleIcon size={16} />
                  <span>{loading ? "Submitting..." : "Submit Regularization"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: SET DATE-SPECIFIC WORK MODE OVERRIDE                             */}
      {/* ========================================================================= */}
      {showOverrideModal && overrideEmployee && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <LocationPinIcon size={20} color="#818cf8" />
                <span>Assign Single-Day Work Mode Override</span>
              </div>
              <button className={styles.modalClose} onClick={() => setShowOverrideModal(false)}>
                <CloseIcon size={18} />
              </button>
            </div>

            <form onSubmit={handleSetOverride}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Employee</label>
                  <div style={{ fontWeight: 700, color: "#ffffff" }}>
                    {overrideEmployee.full_name} ({overrideEmployee.employee_code})
                  </div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                    Default Mode: {overrideEmployee.default_work_mode}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Override Effective Date *</label>
                  <input
                    type="date"
                    required
                    className={styles.input}
                    value={overrideDate}
                    onChange={(e) => setOverrideDate(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Assigned Mode for this Date *</label>
                  <select
                    className={styles.select}
                    value={overrideMode}
                    onChange={(e) => setOverrideMode(e.target.value as "remote" | "on_site")}
                  >
                    <option value="remote">Remote Worker (Geofence Exempt)</option>
                    <option value="on_site">On-Site (Requires 200m Geofence)</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Reason / Administrative Note</label>
                  <textarea
                    className={styles.textarea}
                    placeholder="e.g. Field visit, transit day, client presentation..."
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => setShowOverrideModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" disabled={loading} className={styles.btnPrimary}>
                  <CheckCircleIcon size={16} />
                  <span>{loading ? "Saving..." : "Apply Date Override"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: ADD OFFICE GEOFENCE                                              */}
      {/* ========================================================================= */}
      {showOfficeModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <BuildingIcon size={20} color="#818cf8" />
                <span>Configure Campus Geofence</span>
              </div>
              <button className={styles.modalClose} onClick={() => setShowOfficeModal(false)}>
                <CloseIcon size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateOffice}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Campus / Facility Name *</label>
                  <input
                    type="text"
                    required
                    className={styles.input}
                    placeholder="e.g. Innovation Hub - Building B"
                    value={newOfficeName}
                    onChange={(e) => setNewOfficeName(e.target.value)}
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <OfficeMapPicker
                    lat={parseFloat(newOfficeLat) || 24.8607}
                    lng={parseFloat(newOfficeLng) || 67.0011}
                    radius={parseInt(newOfficeRadius, 10) || 200}
                    onChange={(lat, lng) => {
                      setNewOfficeLat(lat.toString());
                      setNewOfficeLng(lng.toString());
                    }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Latitude (or Pinpoint on Map Above) *</label>
                    <input
                      type="number"
                      step="any"
                      required
                      className={styles.input}
                      value={newOfficeLat}
                      onChange={(e) => setNewOfficeLat(e.target.value)}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Longitude *</label>
                    <input
                      type="number"
                      step="any"
                      required
                      className={styles.input}
                      value={newOfficeLng}
                      onChange={(e) => setNewOfficeLng(e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Geofence Radius (Meters) *</label>
                  <input
                    type="number"
                    min="50"
                    max="1000"
                    required
                    className={styles.input}
                    value={newOfficeRadius}
                    onChange={(e) => setNewOfficeRadius(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Campus Physical Address</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="e.g. 100 Main Parkway, Tech City"
                    value={newOfficeAddress}
                    onChange={(e) => setNewOfficeAddress(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => setShowOfficeModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" disabled={loading} className={styles.btnPrimary}>
                  <BuildingIcon size={16} />
                  <span>{loading ? "Registering..." : "Save Campus Geofence"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: EMPLOYEE ATTENDANCE CALENDAR VIEW                                */}
      {/* ========================================================================= */}
      {showCalendarModal && calendarEmployee && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalCardLarge}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <CalendarIcon size={20} color="#0284c7" />
                <span>
                  Attendance Calendar • {calendarEmployee.full_name} ({calendarEmployee.employee_code})
                </span>
              </div>
              <button className={styles.modalClose} onClick={() => setShowCalendarModal(false)}>
                <CloseIcon size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* Month Navigation & Shift info */}
              <div className={styles.calendarControls}>
                <div className={styles.calendarNavGroup}>
                  <button type="button" className={styles.btnSecondary} onClick={handlePrevMonth} title="Previous Month">
                    <ChevronLeftIcon size={16} />
                  </button>
                  <span style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", minWidth: 150, textAlign: "center" }}>
                    {calendarData?.month_name || `${calendarYear}-${String(calendarMonth).padStart(2, "0")}`}
                  </span>
                  <button type="button" className={styles.btnSecondary} onClick={handleNextMonth} title="Next Month">
                    <ChevronRightIcon size={16} />
                  </button>
                </div>

                <div style={{ fontSize: 12, color: "#64748b" }}>
                  <span>Shift: </span>
                  <strong style={{ color: "#0f172a" }}>
                    {calendarData?.shift_name || calendarData?.resolved_shift?.shift_name || "Office Shift"} (
                    {calendarData?.scheduled_start_time || calendarData?.resolved_shift?.work_start_time || "09:00"} -{" "}
                    {calendarData?.scheduled_end_time || calendarData?.resolved_shift?.work_end_time || "18:00"})
                  </strong>
                  <span> • {calendarData?.grace_period_minutes ?? calendarData?.resolved_shift?.grace_period_minutes ?? 15}m grace ({calendarData?.timezone || "UTC"})</span>
                </div>
              </div>

              {/* Monthly Executive Summary Metrics */}
              {calendarData?.summary && (
                <div className={styles.calendarMetricsGrid}>
                  <div className={styles.calendarMetricCard}>
                    <span className={styles.calendarMetricLabel}>Present Days</span>
                    <span className={styles.calendarMetricValue} style={{ color: "#059669" }}>
                      {calendarData.summary.present_days ?? calendarData.summary.days_present ?? 0}
                    </span>
                  </div>
                  <div className={styles.calendarMetricCard}>
                    <span className={styles.calendarMetricLabel}>Late Check-Ins</span>
                    <span className={styles.calendarMetricValue} style={{ color: "#d97706" }}>
                      {calendarData.summary.late_days ?? calendarData.summary.days_late ?? 0}
                    </span>
                  </div>
                  <div className={styles.calendarMetricCard}>
                    <span className={styles.calendarMetricLabel}>Absences</span>
                    <span className={styles.calendarMetricValue} style={{ color: "#dc2626" }}>
                      {calendarData.summary.absent_days ?? calendarData.summary.days_absent ?? 0}
                    </span>
                  </div>
                  <div className={styles.calendarMetricCard}>
                    <span className={styles.calendarMetricLabel}>Approved Leaves</span>
                    <span className={styles.calendarMetricValue} style={{ color: "#7c3aed" }}>
                      {calendarData.summary.leave_days ?? calendarData.summary.days_on_leave ?? 0}
                    </span>
                  </div>
                  <div className={styles.calendarMetricCard}>
                    <span className={styles.calendarMetricLabel}>Hours Worked</span>
                    <span className={styles.calendarMetricValue} style={{ color: "#0284c7" }}>
                      {calendarData.summary.total_hours_worked ?? 0}h
                    </span>
                  </div>
                  <div className={styles.calendarMetricCard}>
                    <span className={styles.calendarMetricLabel}>On-Time Arrival</span>
                    <span className={styles.calendarMetricValue} style={{ color: "#0f172a" }}>
                      {calendarData.summary.on_time_rate_pct ?? 0}%
                    </span>
                  </div>
                </div>
              )}

              {/* Calendar Grid */}
              {calendarLoading ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#64748b" }}>
                  <RefreshIcon size={24} />
                  <p style={{ marginTop: 8 }}>Loading Monthly Attendance Calendar...</p>
                </div>
              ) : (
                <>
                  <div className={styles.calendarWeekdayHeader}>
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((w) => (
                      <div key={w} className={styles.calendarWeekdayCol}>{w}</div>
                    ))}
                  </div>

                  <div className={styles.calendarMonthGrid}>
                    {/* Fill leading blank days based on first day weekday */}
                    {calendarData?.days && calendarData.days.length > 0 && (() => {
                      const firstDate = new Date(`${calendarData.days[0].date}T00:00:00`);
                      const dayOfWeek = (firstDate.getDay() + 6) % 7; // Monday = 0
                      const blanks = [];
                      for (let i = 0; i < dayOfWeek; i++) {
                        blanks.push(<div key={`blank-${i}`} style={{ opacity: 0.2 }} className={styles.calendarDayCell} />);
                      }
                      return blanks;
                    })()}

                    {calendarData?.days?.map((day: any) => {
                      const isToday = day.date === regDate;

                      let badgeClass = styles.statusBadgeWeekend;
                      if (day.status === "present") badgeClass = styles.statusBadgePresent;
                      else if (day.status === "late") badgeClass = styles.statusBadgeLate;
                      else if (day.status === "absent") badgeClass = styles.statusBadgeAbsent;
                      else if (day.status === "on_leave" || day.status === "leave") badgeClass = styles.statusBadgeLeave;

                      const isUpcoming = day.status === "upcoming" || day.is_future;
                      const checkIn = day.check_in_time || day.check_in_local;
                      const checkOut = day.check_out_time || day.check_out_local;
                      const dayNumber = day.day ?? day.day_of_month;

                      return (
                        <div
                          key={day.date}
                          className={`${styles.calendarDayCell} ${day.is_weekend ? styles.calendarDayCellWeekend : ""} ${isToday ? styles.calendarDayCellToday : ""}`}
                        >
                          <div className={styles.calendarDayTop}>
                            <span className={styles.calendarDayNum}>{dayNumber}</span>
                            {!isUpcoming && (
                              <span className={`${styles.calendarDayStatusBadge} ${badgeClass}`}>
                                {day.status === "on_leave" ? "Leave" : day.status}
                              </span>
                            )}
                          </div>

                          {!isUpcoming && (
                            <div className={styles.calendarDayTimes}>
                              {checkIn ? (
                                <div>
                                  <div>In: <strong>{checkIn}</strong></div>
                                  <div>Out: {checkOut || "—"}</div>
                                  {day.is_late && (
                                    <div style={{ color: "#d97706", fontSize: 9 }}>+{day.minutes_late}m late</div>
                                  )}
                                </div>
                              ) : (day.status === "on_leave" || day.is_on_leave) ? (
                                <div style={{ color: "#7c3aed" }}>{day.leave_reason || day.leave_type || "On Leave"}</div>
                              ) : day.is_weekend ? (
                                <div style={{ color: "#94a3b8" }}>Weekend</div>
                              ) : (
                                <div style={{ color: "#ef4444" }}>No Record</div>
                              )}
                            </div>
                          )}

                          {day.hours_worked != null && day.hours_worked > 0 && (
                            <div className={styles.calendarDayHours}>
                              {day.hours_worked_formatted || `${day.hours_worked} hrs`}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => setShowCalendarModal(false)}
              >
                Close Calendar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 7: EMPLOYEE SHIFT OVERRIDE CONFIGURATION                            */}
      {/* ========================================================================= */}
      {showShiftModal && shiftEmployee && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <ClockIcon size={20} color="#0284c7" />
                <span>Configure Work Shift • {shiftEmployee.full_name}</span>
              </div>
              <button className={styles.modalClose} onClick={() => setShowShiftModal(false)}>
                <CloseIcon size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveShift}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Shift Assignment Mode</label>
                  <div style={{ display: "flex", gap: 14, marginTop: 4 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
                      <input
                        type="radio"
                        name="shiftMode"
                        checked={!shiftIsCustom}
                        onChange={() => setShiftIsCustom(false)}
                      />
                      <span>Use Campus / Office Default</span>
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
                      <input
                        type="radio"
                        name="shiftMode"
                        checked={shiftIsCustom}
                        onChange={() => setShiftIsCustom(true)}
                      />
                      <span>Custom Shift (e.g. Night Shift)</span>
                    </label>
                  </div>
                </div>

                {shiftIsCustom ? (
                  <>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Shift Name</label>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="e.g. Night Shift, US Shift, Early Bird"
                        value={shiftName}
                        onChange={(e) => setShiftName(e.target.value)}
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Start Time *</label>
                        <input
                          type="time"
                          required
                          className={styles.input}
                          value={shiftStartTime}
                          onChange={(e) => setShiftStartTime(e.target.value)}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.label}>End Time *</label>
                        <input
                          type="time"
                          required
                          className={styles.input}
                          value={shiftEndTime}
                          onChange={(e) => setShiftEndTime(e.target.value)}
                        />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Grace Period (Minutes)</label>
                        <input
                          type="number"
                          min="0"
                          max="120"
                          required
                          className={styles.input}
                          value={shiftGraceMinutes}
                          onChange={(e) => setShiftGraceMinutes(parseInt(e.target.value, 10) || 0)}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.label}>Regional Timezone</label>
                        <select
                          className={styles.select}
                          value={shiftTimezone}
                          onChange={(e) => setShiftTimezone(e.target.value)}
                        >
                          <option value="Asia/Karachi">Asia/Karachi (PKT)</option>
                          <option value="America/New_York">America/New_York (EST)</option>
                          <option value="America/Chicago">America/Chicago (CST)</option>
                          <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                          <option value="Europe/London">Europe/London (GMT)</option>
                          <option value="Europe/Berlin">Europe/Berlin (CET)</option>
                          <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                          <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                          <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                          <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                          <option value="Australia/Sydney">Australia/Sydney (AEST)</option>
                          <option value="UTC">UTC</option>
                        </select>
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ padding: 14, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, color: "#64748b" }}>
                    This employee will follow their assigned campus office hours (or organization default) of{" "}
                    <strong>{defaultWorkStartTime} - {defaultWorkEndTime}</strong> with <strong>{defaultGracePeriodMinutes}m</strong> grace period.
                  </div>
                )}
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => setShowShiftModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" disabled={shiftSaving} className={styles.btnPrimary}>
                  <CheckCircleIcon size={16} />
                  <span>{shiftSaving ? "Saving..." : "Save Shift Settings"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 8: REGIONAL OFFICE TIMINGS MODAL                                    */}
      {/* ========================================================================= */}
      {showOfficeTimingsModal && selectedOfficeForTiming && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <ClockIcon size={20} color="#0284c7" />
                <span>Regional Office Timings • {selectedOfficeForTiming.name}</span>
              </div>
              <button className={styles.modalClose} onClick={() => setShowOfficeTimingsModal(false)}>
                <CloseIcon size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveOfficeTimings}>
              <div className={styles.modalBody}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Campus Work Start Time *</label>
                    <input
                      type="time"
                      required
                      className={styles.input}
                      value={officeTimingStart}
                      onChange={(e) => setOfficeTimingStart(e.target.value)}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Campus Work End Time *</label>
                    <input
                      type="time"
                      required
                      className={styles.input}
                      value={officeTimingEnd}
                      onChange={(e) => setOfficeTimingEnd(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Campus Grace Period (Minutes)</label>
                    <input
                      type="number"
                      min="0"
                      max="120"
                      required
                      className={styles.input}
                      value={officeTimingGrace}
                      onChange={(e) => setOfficeTimingGrace(parseInt(e.target.value, 10) || 0)}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Campus Regional Timezone</label>
                    <select
                      className={styles.select}
                      value={officeTimingTimezone}
                      onChange={(e) => setOfficeTimingTimezone(e.target.value)}
                    >
                      <option value="Asia/Karachi">Asia/Karachi (PKT)</option>
                      <option value="America/New_York">America/New_York (EST)</option>
                      <option value="America/Chicago">America/Chicago (CST)</option>
                      <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                      <option value="Europe/London">Europe/London (GMT)</option>
                      <option value="Europe/Berlin">Europe/Berlin (CET)</option>
                      <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                      <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                      <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                      <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                      <option value="Australia/Sydney">Australia/Sydney (AEST)</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => setShowOfficeTimingsModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" disabled={officeTimingSaving} className={styles.btnPrimary}>
                  <CheckCircleIcon size={16} />
                  <span>{officeTimingSaving ? "Saving..." : "Save Office Timings"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Action Toast */}
      {toastMessage && (
        <div
          className={`${styles.toast} ${toastMessage.type === "success" ? styles.toastSuccess : styles.toastError
            }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircleIcon size={18} color="#34d399" />
          ) : (
            <AlertCircleIcon size={18} color="#f87171" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}
    </div>
  );
}
