import React, { useEffect, useState } from "react";
import { api, getToken } from "../../api.js";
import { useT } from "../../LanguageContext.jsx";

export default function UsersPage() {
  const tr = useT();
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState(null);
  const [messageOk, setMessageOk] = useState(false);
  const showOk = (txt) => { setMessage(txt); setMessageOk(true); };
  const showErr = (txt) => { setMessage(txt); setMessageOk(false); };

  useEffect(() => {
    loadAllUsers();
  }, []);

  const loadAllUsers = async () => {
    setLoading(true);
    console.log("Loading all users...");
    try {
      const token = getToken();
      console.log("Token:", token ? "exists" : "missing");
      const res = await fetch(`${api.url}/api/auth/admin/all-users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Response status:", res.status);
      const data = await res.json();
      console.log("Response data:", data);
      if (res.ok) {
        setAllUsers(data.users || []);
      } else {
        console.error("Failed to load users:", data.error);
        showErr(data.error || tr("usersFailedLoad", "Failed to load users"));
      }
    } catch (err) {
      console.error("Failed to load users:", err);
      showErr(tr("usersFailedLoad", "Failed to load users") + ": " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId, createSite = false) => {
    if (actionLoading) return; // prevent double-submit
    setActionLoading(userId);
    setMessage(null);
    try {
      const res = await fetch(`${api.url}/api/auth/admin/approve-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ userId, createSite, siteName: "My Site" }),
      });
      const data = await res.json();
      if (res.ok) {
        showOk(tr("usersApprovedOk", "User approved successfully"));
        loadAllUsers();
      } else {
        showErr(data.error || tr("usersApproveFail", "Failed to approve user"));
      }
    } catch (err) {
      showErr(tr("usersApproveFail", "Failed to approve user"));
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId) => {
    setActionLoading(userId);
    setMessage(null);
    try {
      const res = await fetch(`${api.url}/api/auth/admin/reject-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (res.ok) {
        showOk(tr("usersRejectedOk", "User rejected successfully"));
        loadAllUsers();
      } else {
        showErr(data.error || tr("usersRejectFail", "Failed to reject user"));
      }
    } catch (err) {
      showErr(tr("usersRejectFail", "Failed to reject user"));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm(tr("usersConfirmDelete", "Are you sure you want to delete this user? They will not be able to register again with this email."))) return;
    setActionLoading(userId);
    setMessage(null);
    try {
      const res = await fetch(`${api.url}/api/auth/admin/delete-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (res.ok) {
        showOk(tr("usersDeletedOk", "User deleted successfully"));
        loadAllUsers();
      } else {
        showErr(data.error || tr("usersDeleteFail", "Failed to delete user"));
      }
    } catch (err) {
      showErr(tr("usersDeleteFail", "Failed to delete user"));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeactivate = async (userId) => {
    if (!confirm(tr("usersConfirmDeactivate", "Are you sure you want to deactivate this user?"))) return;
    setActionLoading(userId);
    setMessage(null);
    try {
      const res = await fetch(`${api.url}/api/auth/admin/deactivate-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (res.ok) {
        showOk(tr("usersDeactivatedOk", "User deactivated successfully"));
        loadAllUsers();
      } else {
        showErr(data.error || tr("usersDeactivateFail", "Failed to deactivate user"));
      }
    } catch (err) {
      showErr(tr("usersDeactivateFail", "Failed to deactivate user"));
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto bg-[#f6f8fb] p-5 space-y-6">
      <div>
        <h2 className="text-[20px] font-semibold text-[#111827]">{tr("usersAllUsers", "All Users")}</h2>
        <p className="mt-1 text-[13px] text-[#7c8aa5]">{tr("usersManageAll", "Manage all registered users")}</p>
      </div>

      {message && (
        <div className={`rounded-[10px] px-4 py-3 text-[13px] ${messageOk ? "border border-[#bbf7d0] bg-[#f0fdf4] text-[#15803d]" : "border border-[#fecaca] bg-[#fef2f2] text-[#b91c1c]"}`}>
          {message}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-[13px] text-[#7c8aa5]">{tr("loading", "Loading...")}</div>
      ) : allUsers.length === 0 ? (
        <div className="rounded-[14px] border border-[#e6ebf4] bg-[#f8fbff] p-8 text-center">
          <div className="text-[15px] text-[#7c8aa5]">{tr("usersNoneFound", "No users found")}</div>
        </div>
      ) : (
        <div className="rounded-[14px] border border-[#e6ebf4] bg-white overflow-hidden">
          <table className="w-full text-[13px]">
            <thead className="bg-[#f8fbff] border-b border-[#e6ebf4]">
              <tr>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#64748b] uppercase">{tr("name", "Name")}</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#64748b] uppercase">{tr("email", "Email")}</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#64748b] uppercase">{tr("role", "Role")}</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#64748b] uppercase">{tr("status", "Status")}</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#64748b] uppercase">{tr("createdAt", "Created At")}</th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold text-[#64748b] uppercase">{tr("usersActions", "Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map((user) => (
                <tr key={user.id} className="border-b border-[#f0f2f5] hover:bg-[#f8fbff]">
                  <td className="px-4 py-3 font-medium text-[#111827]">{user.name}</td>
                  <td className="px-4 py-3 text-[#64748b]">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      user.role === "SUPERADMIN" ? "bg-[#fef3c7] text-[#92400e]" :
                      user.role === "ADMIN" ? "bg-[#dbeafe] text-[#1e40af]" :
                      "bg-[#e0e7ff] text-[#3730a3]"
                    }`}>{tr("userRole_" + user.role, user.role)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      user.status === "APPROVED" ? "bg-[#bbf7d0] text-[#15803d]" :
                      user.status === "PENDING" ? "bg-[#fef3c7] text-[#92400e]" :
                      user.status === "REJECTED" ? "bg-[#fecaca] text-[#b91c1c]" :
                      user.status === "DELETED" ? "bg-[#e2e8f0] text-[#64748b]" :
                      "bg-[#f1f5f9] text-[#64748b]"
                    }`}>{tr("userStatus_" + user.status, user.status)}</span>
                  </td>
                  <td className="px-4 py-3 text-[#64748b]">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {user.status === "PENDING" && (
                        <>
                          <button
                            onClick={() => handleApprove(user.id, true)}
                            disabled={actionLoading === user.id}
                            className="rounded-[8px] bg-[#2563eb] px-3 py-1.5 text-[12px] font-medium text-white hover:bg-[#1d4ed8] disabled:opacity-50"
                          >
                            {actionLoading === user.id ? "..." : tr("usersApproveSite", "Approve + Site")}
                          </button>
                          <button
                            onClick={() => handleApprove(user.id, false)}
                            disabled={actionLoading === user.id}
                            className="rounded-[8px] border border-[#d5dde8] bg-white px-3 py-1.5 text-[12px] font-medium text-[#273449] hover:bg-[#f8fafc] disabled:opacity-50"
                          >
                            {actionLoading === user.id ? "..." : tr("usersApprove", "Approve")}
                          </button>
                          <button
                            onClick={() => handleReject(user.id)}
                            disabled={actionLoading === user.id}
                            className="rounded-[8px] border border-[#fecaca] bg-[#fff1f2] px-3 py-1.5 text-[12px] font-medium text-[#b91c1c] hover:bg-[#ffe4e6] disabled:opacity-50"
                          >
                            {actionLoading === user.id ? "..." : tr("usersReject", "Reject")}
                          </button>
                        </>
                      )}
                      {user.status === "APPROVED" && (
                        <button
                          onClick={() => handleDeactivate(user.id)}
                          disabled={actionLoading === user.id}
                          className="rounded-[8px] border border-[#fcd34d] bg-[#fffbeb] px-3 py-1.5 text-[12px] font-medium text-[#92400e] hover:bg-[#fef3c7] disabled:opacity-50"
                        >
                          {actionLoading === user.id ? "..." : tr("usersDeactivate", "Deactivate")}
                        </button>
                      )}
                      {user.status !== "DELETED" && (
                        <button
                          onClick={() => handleDelete(user.id)}
                          disabled={actionLoading === user.id}
                          className="rounded-[8px] border border-[#fecaca] bg-[#fff1f2] px-3 py-1.5 text-[12px] font-medium text-[#b91c1c] hover:bg-[#ffe4e6] disabled:opacity-50"
                        >
                          {actionLoading === user.id ? "..." : tr("delete", "Delete")}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
