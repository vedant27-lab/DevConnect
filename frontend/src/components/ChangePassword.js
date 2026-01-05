import React, { useState } from "react";
import { useAuth } from '../context/AuthContext';

const ChangePassword = () => {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [msg, setMsg] = useState("");
    const [error, setError] = useState("");

    const { changePassword} = useAuth();

    const handleSubmit = async (e) => {
        e.prevnetDefault();
        setError("");
        setMsg("");

        try {
            await changePassword(oldPassword, newPassword);
            setMsg("Password changed Successfully");
            setOldPassword("");
            setNewPassword("");
        }catch (err) {
            setError(err.response?.data?.msg || "Something went wrong");
        }
    };


    return (
        <div className='auth-container'>
            <div className="auth-form-box">
                <h2>Forget Password</h2>
                {msg && <p style={{color: 'green'}}>{msg}</p>}
                {error && <p style={{color: 'red'}}>{msg}</p>}

                <form onSubmit={handleSubmit}>
                    <input 
                        type='password' 
                        placeholder="New Password" 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)} required
                    />

                    <button type="submit">Change Password</button>


                </form>
            </div>
        </div>
    )
}

export default ChangePassword;