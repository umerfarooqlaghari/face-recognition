"use client";

import React, { useState, useEffect } from "react";
import styles from "./page.module.css";

// --- SVG Icons (Zero Emojis) ---

const ShieldIcon = ({ size = 20, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const UsersIcon = ({ size = 20, color = "currentColor" }: { size?: number; color?: string }) => (
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

const ClockIcon = ({ size = 18, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const LocationPinIcon = ({ size = 18, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const MailIcon = ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const KeyIcon = ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2l-2 2m-1.5 1.5L14 9l-1.5-1.5L11 9l-1.5-1.5L8 9a5 5 0 1 0 5 5l8-8z" />
  </svg>
);

const LogOutIcon = ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const RefreshIcon = ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

const CloseIcon = ({ size = 18, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function Home() {
  // Auth state
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [tenantStats, setTenantStats] = useState<any | null>(null);

  // Form states
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup fields
  const [companyName, setCompanyName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [officeName, setOfficeName] = useState("Headquarters");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Dashboard Tabs
  const [activeTab, setActiveTab] = useState<"employees" | "attendance" | "offices" | "ses">("employees");
  const [employees, setEmployees] = useState<any[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [offices, setOffices] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal: Add Employee
  const [showAddModal, setShowAddModal] = useState(false);
  const [empFullName, setEmpFullName] = useState("");
  const [empEmail, setEmpEmail] = useState("");
  const [empCode, setEmpCode] = useState("");
  const [empWorkMode, setEmpWorkMode] = useState("on_site");
  const [createdResult, setCreatedResult] = useState<any | null>(null);

  // Load token from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem("attend_token");
    const savedUser = localStorage.getItem("attend_user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Fetch Dashboard Data once authenticated
  useEffect(() => {
    if (token) {
      fetchDashboard();
      fetchEmployees();
      fetchAttendanceLogs();
      fetchOffices();
    }
  }, [token]);

  const fetchDashboard = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/management/tenant`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTenantStats(data);
      }
    } catch {
      // offline / starting up
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

  const fetchAttendanceLogs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/management/attendance/today`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAttendanceLogs(data);
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
      }
    } catch {
      // ignore
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Authentication failed");

      localStorage.setItem("attend_token", data.access_token);
      localStorage.setItem("attend_user", JSON.stringify(data.user));
      setToken(data.access_token);
      setUser(data.user);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/tenant/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: companyName,
          admin_name: adminName,
          admin_email: adminEmail,
          admin_password: adminPassword,
          office_name: officeName,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Organization registration failed");

      localStorage.setItem("attend_token", data.access_token);
      localStorage.setItem("attend_user", JSON.stringify(data.user));
      setToken(data.access_token);
      setUser(data.user);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("attend_token");
    localStorage.removeItem("attend_user");
    setToken(null);
    setUser(null);
    setTenantStats(null);
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/management/employees`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: empFullName,
          email: empEmail,
          employee_code: empCode.trim() ? empCode.trim() : null,
          default_work_mode: empWorkMode,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Employee creation failed");

      setCreatedResult(data);
      fetchEmployees();
      fetchDashboard();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendInvite = async (empId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/management/employees/${empId}/resend-invite`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        alert(`New password & invite dispatched via AWS SES!\nTemporary Password: ${data.temporary_password}`);
      } else {
        alert(data.detail || "Failed to dispatch email");
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const q = searchQuery.toLowerCase();
    return (
      emp.full_name?.toLowerCase().includes(q) ||
      emp.email?.toLowerCase().includes(q) ||
      emp.employee_code?.toLowerCase().includes(q)
    );
  });

  return (
    <div className={styles.container}>
      {/* Top Header */}
      <header className={styles.navbar}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}>
            <ShieldIcon size={20} color="#ffffff" />
          </div>
          <div>
            <div className={styles.brandTitle}>
              {tenantStats?.tenant?.name || "Enterprise Attendance"}
            </div>
            <div className={styles.brandSubtitle}>Multi-Tenant Biometric Platform</div>
          </div>
        </div>

        {token && user && (
          <div className={styles.navRight}>
            <div className={styles.tenantBadge}>
              <CheckCircleIcon size={14} color="#1e3a8a" />
              <span>Tenant Isolated</span>
            </div>
            <button className={styles.logoutBtn} onClick={handleLogout}>
              <LogOutIcon size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      {!token ? (
        /* Unauthenticated Auth Container */
        <div className={styles.authWrapper}>
          <div className={styles.authCard}>
            <div className={styles.authHeader}>
              <div style={{ display: "inline-flex", padding: 12, borderRadius: 12, backgroundColor: "#0f172a", color: "#ffffff", marginBottom: 12 }}>
                <ShieldIcon size={24} color="#ffffff" />
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a" }}>Management Portal</h1>
              <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
                Sign in or register your organization for biometric attendance
              </p>
            </div>

            <div className={styles.authTabs}>
              <button
                className={`${styles.authTab} ${authMode === "login" ? styles.authTabActive : ""}`}
                onClick={() => { setAuthMode("login"); setErrorMsg(null); }}
              >
                Sign In
              </button>
              <button
                className={`${styles.authTab} ${authMode === "signup" ? styles.authTabActive : ""}`}
                onClick={() => { setAuthMode("signup"); setErrorMsg(null); }}
              >
                Register Organization
              </button>
            </div>

            {errorMsg && <div className={styles.errorBanner}>{errorMsg}</div>}

            {authMode === "login" ? (
              <form onSubmit={handleLogin}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Work Email</label>
                  <input
                    type="email"
                    required
                    placeholder="admin@company.com"
                    className={styles.input}
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    className={styles.input}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </div>
                <button type="submit" className={styles.primaryBtn} disabled={loading}>
                  <KeyIcon size={16} />
                  <span>{loading ? "Authenticating..." : "Sign In to Management"}</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignup}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Company / Organization Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Acme Global Inc"
                    className={styles.input}
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Administrator Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    className={styles.input}
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Administrator Email</label>
                  <input
                    type="email"
                    required
                    placeholder="admin@acmeglobal.com"
                    className={styles.input}
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Master Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    className={styles.input}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Primary Office Name</label>
                  <input
                    type="text"
                    placeholder="Corporate Headquarters"
                    className={styles.input}
                    value={officeName}
                    onChange={(e) => setOfficeName(e.target.value)}
                  />
                </div>
                <button type="submit" className={styles.primaryBtn} disabled={loading}>
                  <BuildingIcon size={16} />
                  <span>{loading ? "Registering Tenant..." : "Create Tenant & Sign In"}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      ) : (
        /* Authenticated Management Dashboard */
        <main className={styles.dashboard}>
          <div className={styles.dashHeader}>
            <div>
              <h2 className={styles.dashTitle}>{tenantStats?.tenant?.name || "Corporate"} Administration</h2>
              <p className={styles.dashSubtitle}>
                Organization ID: <span style={{ fontFamily: "monospace" }}>{user?.tenant_id}</span> &bull; Admin: {user?.full_name}
              </p>
            </div>
            <button className={styles.btnAction} onClick={() => { setShowAddModal(true); setCreatedResult(null); }}>
              <UserPlusIcon size={16} />
              <span>Add Employee (AWS SES)</span>
            </button>
          </div>

          {/* Metric Cards */}
          <div className={styles.metricsGrid}>
            <div className={styles.metricCard}>
              <div className={styles.metricTop}>
                <span className={styles.metricLabel}>Total Workforce</span>
                <div className={styles.metricIcon}><UsersIcon size={18} /></div>
              </div>
              <div className={styles.metricValue}>{tenantStats?.total_employees ?? employees.length}</div>
              <div className={styles.metricNote}>Multi-Tenant Isolated</div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricTop}>
                <span className={styles.metricLabel}>On-Site vs Remote</span>
                <div className={styles.metricIcon}><LocationPinIcon size={18} /></div>
              </div>
              <div className={styles.metricValue}>
                {tenantStats?.on_site_employees ?? "-"} <span style={{ fontSize: 16, color: "#64748b" }}>/ {tenantStats?.remote_employees ?? "-"}</span>
              </div>
              <div className={styles.metricNote}>On-Site: 200m Geofenced</div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricTop}>
                <span className={styles.metricLabel}>Today's Check-Ins</span>
                <div className={styles.metricIcon}><ClockIcon size={18} /></div>
              </div>
              <div className={styles.metricValue}>{tenantStats?.today_checkins ?? attendanceLogs.length}</div>
              <div className={styles.metricNote}>Biometric 3D Verified</div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricTop}>
                <span className={styles.metricLabel}>Attendance Rate</span>
                <div className={styles.metricIcon}><CheckCircleIcon size={18} /></div>
              </div>
              <div className={styles.metricValue}>{tenantStats?.attendance_rate ?? 0}%</div>
              <div className={styles.metricNote}>Real-time compliance</div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className={styles.tabNav}>
            <button
              className={`${styles.tabItem} ${activeTab === "employees" ? styles.tabItemActive : ""}`}
              onClick={() => setActiveTab("employees")}
            >
              <UsersIcon size={16} />
              <span>Employees Directory ({employees.length})</span>
            </button>
            <button
              className={`${styles.tabItem} ${activeTab === "attendance" ? styles.tabItemActive : ""}`}
              onClick={() => setActiveTab("attendance")}
            >
              <ClockIcon size={16} />
              <span>Live Attendance Feed ({attendanceLogs.length})</span>
            </button>
            <button
              className={`${styles.tabItem} ${activeTab === "offices" ? styles.tabItemActive : ""}`}
              onClick={() => setActiveTab("offices")}
            >
              <BuildingIcon size={16} />
              <span>Office Geofences ({offices.length})</span>
            </button>
            <button
              className={`${styles.tabItem} ${activeTab === "ses" ? styles.tabItemActive : ""}`}
              onClick={() => setActiveTab("ses")}
            >
              <MailIcon size={16} />
              <span>AWS SES Status</span>
            </button>
          </div>

          {/* TAB 1: EMPLOYEES */}
          {activeTab === "employees" && (
            <div className={styles.tableCard}>
              <div className={styles.tableToolbar}>
                <input
                  type="text"
                  placeholder="Filter employees by name or code..."
                  className={styles.searchInput}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className={styles.btnSecondary} onClick={fetchEmployees}>
                  <RefreshIcon size={14} />
                  <span>Refresh</span>
                </button>
              </div>

              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>Employee</th>
                    <th className={styles.th}>Code</th>
                    <th className={styles.th}>Work Mode</th>
                    <th className={styles.th}>Assigned Office</th>
                    <th className={styles.th}>Biometric Face</th>
                    <th className={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: 32, color: "#64748b" }}>
                        No employees found. Click "Add Employee" to onboard team members via AWS SES.
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((emp) => (
                      <tr key={emp.id} className={styles.tr}>
                        <td className={styles.td}>
                          <div style={{ fontWeight: 700, color: "#0f172a" }}>{emp.full_name}</div>
                          <div style={{ fontSize: 12, color: "#64748b" }}>{emp.email}</div>
                        </td>
                        <td className={styles.td} style={{ fontFamily: "monospace", fontWeight: 700 }}>
                          {emp.employee_code}
                        </td>
                        <td className={styles.td}>
                          {emp.default_work_mode === "remote" ? (
                            <span className={styles.badgeWarning}>Remote Worker</span>
                          ) : (
                            <span className={styles.badgeInfo}>On-Site (200m)</span>
                          )}
                        </td>
                        <td className={styles.td}>{emp.office_name || "Headquarters"}</td>
                        <td className={styles.td}>
                          {emp.face_enrolled ? (
                            <span className={styles.badgeSuccess}>
                              <CheckCircleIcon size={12} color="#059669" />
                              <span>Enrolled</span>
                            </span>
                          ) : (
                            <span className={styles.badgeWarning}>Pending Setup</span>
                          )}
                        </td>
                        <td className={styles.td}>
                          <button
                            className={styles.btnSecondary}
                            onClick={() => handleResendInvite(emp.id)}
                            title="Resend auto-generated password via AWS SES"
                          >
                            <MailIcon size={12} />
                            <span>Resend SES Credentials</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: LIVE ATTENDANCE */}
          {activeTab === "attendance" && (
            <div className={styles.tableCard}>
              <div className={styles.tableToolbar}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                  Today's Biometric Check-Ins ({new Date().toISOString().split("T")[0]})
                </div>
                <button className={styles.btnSecondary} onClick={fetchAttendanceLogs}>
                  <RefreshIcon size={14} />
                  <span>Refresh Feed</span>
                </button>
              </div>

              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>Employee</th>
                    <th className={styles.th}>Check-In Time</th>
                    <th className={styles.th}>Verification Method</th>
                    <th className={styles.th}>Face Match Score</th>
                    <th className={styles.th}>Liveness</th>
                    <th className={styles.th}>Geofence Distance</th>
                    <th className={styles.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", padding: 32, color: "#64748b" }}>
                        No check-ins recorded today. Employees can scan their faces via the mobile app.
                      </td>
                    </tr>
                  ) : (
                    attendanceLogs.map((log) => (
                      <tr key={log.id} className={styles.tr}>
                        <td className={styles.td}>
                          <div style={{ fontWeight: 700 }}>{log.employee_name}</div>
                          <div style={{ fontSize: 12, color: "#64748b", fontFamily: "monospace" }}>{log.employee_code}</div>
                        </td>
                        <td className={styles.td}>
                          {log.check_in_time ? new Date(log.check_in_time).toLocaleTimeString() : "-"}
                        </td>
                        <td className={styles.td}>
                          {log.verification_type === "face_geo" ? (
                            <span className={styles.badgeInfo}>Face + Geofence</span>
                          ) : (
                            <span className={styles.badgeWarning}>Face Remote</span>
                          )}
                        </td>
                        <td className={styles.td} style={{ fontWeight: 700, color: "#0f172a" }}>
                          {log.similarity_score}%
                        </td>
                        <td className={styles.td}>
                          {log.liveness_score}%
                        </td>
                        <td className={styles.td}>
                          {log.distance_meters !== null ? `${log.distance_meters}m from Office` : "Waived (Remote)"}
                        </td>
                        <td className={styles.td}>
                          <span className={styles.badgeSuccess}>Present</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: OFFICES */}
          {activeTab === "offices" && (
            <div className={styles.tableCard}>
              <div className={styles.tableToolbar}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                  Tenant Offices & Geofencing Parameters
                </div>
                <button className={styles.btnSecondary} onClick={fetchOffices}>
                  <RefreshIcon size={14} />
                  <span>Refresh</span>
                </button>
              </div>

              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>Office Name</th>
                    <th className={styles.th}>Address</th>
                    <th className={styles.th}>Latitude</th>
                    <th className={styles.th}>Longitude</th>
                    <th className={styles.th}>Geofence Radius</th>
                  </tr>
                </thead>
                <tbody>
                  {offices.map((off) => (
                    <tr key={off.id} className={styles.tr}>
                      <td className={styles.td} style={{ fontWeight: 700 }}>{off.name}</td>
                      <td className={styles.td}>{off.address || "Corporate Campus"}</td>
                      <td className={styles.td} style={{ fontFamily: "monospace" }}>{off.latitude}</td>
                      <td className={styles.td} style={{ fontFamily: "monospace" }}>{off.longitude}</td>
                      <td className={styles.td}>
                        <span className={styles.badgeInfo}>{off.radius_meters} meters</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 4: AWS SES */}
          {activeTab === "ses" && (
            <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ padding: 10, borderRadius: 8, backgroundColor: "#eff6ff", color: "#1e3a8a" }}>
                  <MailIcon size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>AWS SES Automated Email Service</h3>
                  <p style={{ fontSize: 13, color: "#64748b" }}>
                    Automated delivery of high-entropy credentials & face enrollment keys upon employee generation.
                  </p>
                </div>
              </div>

              <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: 18, marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
                  <span style={{ fontWeight: 600, color: "#64748b" }}>Delivery Gateway:</span>
                  <span style={{ fontWeight: 700, color: "#0f172a" }}>Amazon SES (Simple Email Service)</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
                  <span style={{ fontWeight: 600, color: "#64748b" }}>Theme Design:</span>
                  <span style={{ fontWeight: 700, color: "#1e3a8a" }}>White & Navy Blue Executive HTML Template</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ fontWeight: 600, color: "#64748b" }}>Multi-Tenant Isolation:</span>
                  <span style={{ fontWeight: 700, color: "#059669" }}>Enforced (Scoped by Tenant ID)</span>
                </div>
              </div>

              <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
                To configure live AWS credentials, specify <code style={{ backgroundColor: "#f1f5f9", padding: "2px 6px", borderRadius: 4 }}>AWS_ACCESS_KEY_ID</code>,{" "}
                <code style={{ backgroundColor: "#f1f5f9", padding: "2px 6px", borderRadius: 4 }}>AWS_SECRET_ACCESS_KEY</code>, and{" "}
                <code style={{ backgroundColor: "#f1f5f9", padding: "2px 6px", borderRadius: 4 }}>AWS_SES_FROM_EMAIL</code> in <code style={{ backgroundColor: "#f1f5f9", padding: "2px 6px", borderRadius: 4 }}>backend/.env</code>.
                When keys are unset in local development, the service automatically logs credentials to the backend console safely without failing.
              </p>
            </div>
          )}

          {/* MODAL: ADD EMPLOYEE */}
          {showAddModal && (
            <div className={styles.modalOverlay}>
              <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                  <h3 className={styles.modalTitle}>Onboard Employee via AWS SES</h3>
                  <button className={styles.closeBtn} onClick={() => { setShowAddModal(false); setCreatedResult(null); }}>
                    <CloseIcon size={18} />
                  </button>
                </div>

                {errorMsg && <div className={styles.errorBanner}>{errorMsg}</div>}

                {createdResult ? (
                  <div>
                    <div className={styles.successBanner}>
                      <CheckCircleIcon size={16} />
                      <span>Employee created & credentials dispatched!</span>
                    </div>

                    <div className={styles.credentialsCard}>
                      <div className={styles.credRow}>
                        <span className={styles.credLabel}>Employee Name</span>
                        <span className={styles.credValue}>{createdResult.user.full_name}</span>
                      </div>
                      <div className={styles.credRow}>
                        <span className={styles.credLabel}>Work Email</span>
                        <span className={styles.credValue}>{createdResult.user.email}</span>
                      </div>
                      <div className={styles.credRow}>
                        <span className={styles.credLabel}>Employee Code</span>
                        <span className={styles.credValue}>{createdResult.user.employee_code}</span>
                      </div>
                      <div className={styles.credRow}>
                        <span className={styles.credLabel}>Generated Password</span>
                        <span className={styles.credValue} style={{ color: "#1e3a8a", fontSize: 15 }}>
                          {createdResult.auto_generated_password}
                        </span>
                      </div>
                      <div className={styles.credRow}>
                        <span className={styles.credLabel}>AWS SES Status</span>
                        <span className={styles.credValue} style={{ color: "#059669" }}>
                          {createdResult.email_dispatch?.status || "Delivered"}
                        </span>
                      </div>
                    </div>

                    <button
                      className={styles.primaryBtn}
                      style={{ marginTop: 20 }}
                      onClick={() => { setShowAddModal(false); setCreatedResult(null); }}
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleAddEmployee}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Full Legal Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Johnathan Davis"
                        className={styles.input}
                        value={empFullName}
                        onChange={(e) => setEmpFullName(e.target.value)}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Employee Work Email</label>
                      <input
                        type="email"
                        required
                        placeholder="j.davis@company.com"
                        className={styles.input}
                        value={empEmail}
                        onChange={(e) => setEmpEmail(e.target.value)}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Employee Code (Optional, auto-generated if blank)</label>
                      <input
                        type="text"
                        placeholder="e.g. EMP-1049"
                        className={styles.input}
                        value={empCode}
                        onChange={(e) => setEmpCode(e.target.value)}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Work Mode</label>
                      <select
                        className={styles.input}
                        value={empWorkMode}
                        onChange={(e) => setEmpWorkMode(e.target.value)}
                      >
                        <option value="on_site">On-Site (200m Geofenced)</option>
                        <option value="remote">Remote (Geofence Waived)</option>
                      </select>
                    </div>

                    <p style={{ fontSize: 12, color: "#64748b", margin: "12px 0 16px 0", lineHeight: 1.4 }}>
                      Upon submission, a temporary high-entropy password and 48-hour biometric enrollment link will be automatically generated and sent to this email via Amazon SES.
                    </p>

                    <button type="submit" className={styles.primaryBtn} disabled={loading}>
                      <MailIcon size={16} />
                      <span>{loading ? "Generating & Sending..." : "Create Employee & Send Credentials"}</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </main>
      )}
    </div>
  );
}
