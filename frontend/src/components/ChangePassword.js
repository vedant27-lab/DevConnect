import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const ChangePassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const { changePassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");

    try {
      await changePassword(newPassword);
      setMsg("Password changed successfully");
      setNewPassword("");
    } catch (err) {
      setError(err.response?.data?.msg || "Something went wrong");
    }
  };

  return (
    <>

      {msg && <p style={{ color: "green" }}>{msg}</p>}
      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        <button type="submit">Change Password</button>
      </form>
    </>
  );
};

export default ChangePassword;
