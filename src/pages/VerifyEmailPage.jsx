import React, { useEffect, useState } from "react";
import { api } from "../api.js";

export default function VerifyEmailPage({ onBackToLogin }) {
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided");
      return;
    }

    verifyEmail(token);
  }, []);

  async function verifyEmail(token) {
    try {
      const res = await fetch(`${api.url}/api/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage("Email verified successfully! Please login.");
      } else {
        setStatus("error");
        setMessage(data.error || "Verification failed");
      }
    } catch (err) {
      setStatus("error");
      setMessage("Network error");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6f8fb]">
      <div className="bg-white rounded-[16px] p-8 shadow-lg max-w-md w-full text-center">
        {status === "loading" && (
          <div>
            <div className="text-[20px] font-semibold text-[#111827] mb-2">Verifying your email...</div>
            <div className="text-[13px] text-[#64748b]">Please wait</div>
          </div>
        )}
        {status === "success" && (
          <div>
            <div className="text-[20px] font-semibold text-[#15803d] mb-2">✓ Email Verified</div>
            <div className="text-[13px] text-[#64748b] mb-4">{message}</div>
            <button
              onClick={() => onBackToLogin && onBackToLogin()}
              className="rounded-[10px] bg-[#2563eb] px-6 py-2 text-[13px] font-medium text-white hover:bg-[#1d4ed8]"
            >
              Go to Login
            </button>
          </div>
        )}
        {status === "error" && (
          <div>
            <div className="text-[20px] font-semibold text-[#b91c1c] mb-2">✕ Verification Failed</div>
            <div className="text-[13px] text-[#64748b] mb-4">{message}</div>
            <button
              onClick={() => onBackToLogin && onBackToLogin()}
              className="rounded-[10px] bg-[#64748b] px-6 py-2 text-[13px] font-medium text-white hover:bg-[#475569]"
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
