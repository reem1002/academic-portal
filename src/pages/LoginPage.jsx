import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { users } from "../data/users";
import "./styles/LoginPage.css";

const LoginPage = () => {
    const [nationalId, setNationalId] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = () => {
        const foundUser = users.find(
            (u) =>
                u.nationalId === nationalId &&
                u.password === password
        );

        if (!foundUser) {
            return alert("Invalid National ID or Password");
        }

        localStorage.setItem(
            "currentUser",
            JSON.stringify(foundUser)
        );

        navigate("/");
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-header">
                    <img
                        src="/images/department-logo.png"
                        alt="Department Logo"
                        className="login-logo"
                    />
                    <div className="login-title">
                        Academic Portal
                    </div>
                    <div className="login-subtitle">
                        Electrical and Computer Engineering Department
                    </div>
                </div>

                <div className="login-form">
                    <input
                        type="text"
                        placeholder="National ID"
                        className="login-input"
                        value={nationalId}
                        onChange={(e) =>
                            setNationalId(e.target.value)
                        }
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        className="login-input"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                    />

                    <button
                        className="login-button"
                        onClick={handleLogin}
                    >
                        Login
                    </button>
                </div>

                <div className="login-footer">
                    © 2026 ECE
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
