"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
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
  };

  const fetchTenantStats = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/management/tenant`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTenantStats(data);
      }
    } catch {
      // ignore
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
      <div className={styles.container}>
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
              <div className={styles.brandTitle}>FaceVerify Enterprise</div>
              <div className={styles.brandSubtitle}>Biometric Workforce Platform</div>
            </div>
          </div>
        </header>

        <div className={styles.authWrapper}>
          <div className={styles.authCard}>
            <div className={styles.authHeader}>
              <div className={styles.authIconWrapper}>
                <Image
                  src="/image.png"
                  alt="Face Attendance Logo"
                  width={64}
                  height={64}
                  className={styles.brandLogoImg}
                  priority
                />
              </div>
              <h1 className={styles.authTitle}>
                {authMode === "login" ? "Sign In to Organization" : "Create New Organization"}
              </h1>
              <p className={styles.authSubtitle}>
                {authMode === "login"
                  ? "Access the workforce management dashboard with your credentials."
                  : "Set up a high-security multi-tenant organization with ArcFace biometrics."}
              </p>
            </div>

            <div className={styles.authSwitcher}>
              <button
                type="button"
                className={`${styles.switchBtn} ${authMode === "login" ? styles.switchBtnActive : ""}`}
                onClick={() => setAuthMode("login")}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`${styles.switchBtn} ${authMode === "signup" ? styles.switchBtnActive : ""}`}
                onClick={() => setAuthMode("signup")}
              >
                New Organization
              </button>
            </div>

            {authMode === "login" ? (
              <form onSubmit={handleLogin}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Work Email Address</label>
                  <input
                    type="email"
                    required
                    className={styles.input}
                    placeholder="admin@company.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Password</label>
                  <input
                    type="password"
                    required
                    className={styles.input}
                    placeholder="Enter account password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className={styles.btnPrimary}
                  style={{ width: "100%", marginTop: 8 }}
                >
                  <ShieldIcon size={16} />
                  <span>{loading ? "Authenticating..." : "Sign In to Dashboard"}</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignupTenant}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Company / Organization Name</label>
                  <input
                    type="text"
                    required
                    className={styles.input}
                    placeholder="e.g. Acme Corporation"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Primary Office Campus Name</label>
                  <input
                    type="text"
                    required
                    className={styles.input}
                    placeholder="e.g. Headquarters Campus (200m Geofence)"
                    value={officeName}
                    onChange={(e) => setOfficeName(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Administrator Full Name</label>
                  <input
                    type="text"
                    required
                    className={styles.input}
                    placeholder="John Doe"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Administrator Email</label>
                  <input
                    type="email"
                    required
                    className={styles.input}
                    placeholder="admin@acme.com"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Account Password</label>
                  <input
                    type="password"
                    required
                    className={styles.input}
                    placeholder="Minimum 8 characters"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className={styles.btnPrimary}
                  style={{ width: "100%", marginTop: 8 }}
                >
                  <BuildingIcon size={16} />
                  <span>{loading ? "Initializing..." : "Create Organization Workspace"}</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {toastMessage && (
          <div
            className={`${styles.toast} ${
              toastMessage.type === "success" ? styles.toastSuccess : styles.toastError
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
                          <div style={{ display: "inline-flex", gap: 6 }}>
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
          <div className={styles.tableCard}>
            <div className={styles.tableToolbar}>
              <div className={styles.tableTitle}>
                <BuildingIcon size={18} color="#818cf8" />
                <span>Configured Campus Office Geofences (200-Meter Permitted Radii)</span>
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
                    <th className={styles.th}>Latitude</th>
                    <th className={styles.th}>Longitude</th>
                    <th className={styles.th}>Geofence Radius</th>
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
                          <div style={{ fontWeight: 600, color: "#ffffff" }}>{off.name}</div>
                        </td>
                        <td className={styles.td} style={{ fontFamily: "monospace" }}>
                          {off.latitude.toFixed(5)}
                        </td>
                        <td className={styles.td} style={{ fontFamily: "monospace" }}>
                          {off.longitude.toFixed(5)}
                        </td>
                        <td className={styles.td}>
                          <span className={styles.badgeInfo}>
                            {off.radius_meters} Meters Circle
                          </span>
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
                            <a
                              href={`https://www.openstreetmap.org/?mlat=${off.latitude}&mlon=${off.longitude}#map=16/${off.latitude}/${off.longitude}`}
                              target="_blank"
                              rel="noreferrer"
                              className={styles.btnSecondary}
                              title="Inspect Pin on Map"
                            >
                              <LocationPinIcon size={12} />
                              <span>Inspect Map</span>
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
        )}

        {/* ========================================================================= */}
        {/* TAB 6: BILLING & STRIPE SUBSCRIPTION                                      */}
        {/* ========================================================================= */}
        {activeTab === "billing" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Top Overview Card */}
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 14,
                padding: "24px 28px",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 16,
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      padding: "3px 10px",
                      borderRadius: 12,
                      background: billingInfo?.subscription_status === "active" ? "#ecfdf5" : "#eff6ff",
                      color: billingInfo?.subscription_status === "active" ? "#059669" : "#0284c7",
                      border: `1px solid ${billingInfo?.subscription_status === "active" ? "#a7f3d0" : "#bfdbfe"}`,
                    }}
                  >
                    {billingInfo?.subscription_status === "active" ? "Active Subscription" : "14-Day Free Trial Active"}
                  </span>

                  <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>
                    {billingInfo?.trial_days_remaining != null
                      ? `${billingInfo.trial_days_remaining} Days Remaining in Free Trial`
                      : "14 Days Free, Then $2.00 / User / Month"}
                  </span>
                </div>

                <h2 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", marginTop: 8 }}>
                  Enterprise Workforce Plan
                </h2>
                <p style={{ fontSize: 13, color: "#64748b", marginTop: 4, maxWidth: 640 }}>
                  Biometric face verification attendance, OpenStreetMap campus geofencing,
                  manager approval tiers, and automated SES dispatch. Flat rate of $2.00 per active employee per month.
                </p>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {billingInfo?.has_stripe_customer && (
                  <button
                    className={styles.btnSecondary}
                    onClick={handleOpenCustomerPortal}
                    disabled={billingLoading}
                  >
                    <CreditCardIcon size={14} />
                    <span>Customer Portal (Invoices & Cards)</span>
                  </button>
                )}

                <button
                  className={styles.btnPrimary}
                  onClick={handleStartSubscription}
                  disabled={billingLoading}
                  style={{ padding: "10px 22px" }}
                >
                  <ZapIcon size={14} color="#ffffff" />
                  <span>
                    {billingInfo?.subscription_status === "active"
                      ? "Update Plan in Stripe"
                      : "Start 14-Day Free Trial ($2/seat/mo)"}
                  </span>
                </button>
              </div>
            </div>

            {/* Pricing Breakdown & Features Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
              {/* Cost Calculation Card */}
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 14,
                  padding: "24px",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 16 }}>
                  Real-time Seat & Cost Calculation
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#475569" }}>
                    <span>Registered Workforce Members</span>
                    <strong style={{ color: "#0f172a" }}>{billingInfo?.seat_count || employees.length} Users</strong>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#475569" }}>
                    <span>Rate Per Employee</span>
                    <strong style={{ color: "#0f172a" }}>$2.00 USD / month</strong>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#475569" }}>
                    <span>Trial Period</span>
                    <span style={{ color: "#059669", fontWeight: 600 }}>14 Days Free ($0.00 today)</span>
                  </div>

                  <div
                    style={{
                      borderTop: "1px solid #f1f5f9",
                      paddingTop: 12,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontWeight: 700, color: "#0f172a", fontSize: 14 }}>Estimated Monthly Total:</span>
                    <span style={{ fontWeight: 800, color: "#0284c7", fontSize: 20 }}>
                      ${((billingInfo?.seat_count || employees.length) * 2).toFixed(2)} USD
                    </span>
                  </div>

                  <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 4, lineHeight: 1.4 }}>
                    * Stripe automatically updates and prorates your monthly subscription whenever employees are added or removed from your organization roster.
                  </p>
                </div>
              </div>

              {/* What's Included */}
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 14,
                  padding: "24px",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 14 }}>
                  What's Included in Your Plan
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#334155" }}>
                    <CheckCircleIcon size={16} color="#059669" />
                    <span>512-Dimensional Deep Biometric Face Recognition</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#334155" }}>
                    <CheckCircleIcon size={16} color="#059669" />
                    <span>Interactive OpenStreetMap Campus Geofencing</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#334155" }}>
                    <CheckCircleIcon size={16} color="#059669" />
                    <span>Automated AWS SES Credentials & Token Dispatch</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#334155" }}>
                    <CheckCircleIcon size={16} color="#059669" />
                    <span>Multi-Level Leave Approvals & Missed Punch Regularization</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#334155" }}>
                    <CheckCircleIcon size={16} color="#059669" />
                    <span>Instant CSV Timesheet Export & Analytics Dashboard</span>
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

      {/* Floating Action Toast */}
      {toastMessage && (
        <div
          className={`${styles.toast} ${
            toastMessage.type === "success" ? styles.toastSuccess : styles.toastError
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
