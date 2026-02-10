import { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
    const [role, setRole] = useState("student");
    const [name, setName] = useState("");
    const navigate = useNavigate();

    const handleLogin = () => {
        if (!name) return alert("Enter your name");
        const user = {
            name,
            role,
            isGraduate: false, 
        };
        localStorage.setItem("currentUser", JSON.stringify(user));
        navigate("/");
    };


    return (
        <div style={{ maxWidth: "400px", margin: "auto", padding: "50px" }}>
            <h2>Login / Select Role</h2>
            <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
            />
            <div style={{ marginBottom: "10px" }}>
                <label>
                    <input
                        type="radio"
                        name="role"
                        value="student"
                        checked={role === "student"}
                        onChange={() => setRole("student")}
                    />{" "}
                    Student
                </label>
                <label style={{ marginLeft: "20px" }}>
                    <input
                        type="radio"
                        name="role"
                        value="admin"
                        checked={role === "admin"}
                        onChange={() => setRole("admin")}
                    />{" "}
                    Head of Department
                </label>
            </div>
            <button onClick={handleLogin} style={{ padding: "10px 20px" }}>
                Login
            </button>
        </div>
    );
};

export default LoginPage;
