import { Outlet, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const PortalLayout = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        if (!currentUser) {
            navigate("/login"); // لو مش مسجل الدخول يرجع لل login
        } else {
            setUser(currentUser);
        }
    }, [navigate]);

    if (!user) return <p>Loading...</p>; // loading قبل ما user يحدد

    // Sidebar menu حسب الدور
    const menuItems =
        user.role === "student"
            ? [
                { name: "Dashboard", path: "/" },
                { name: "Pre-Registration", path: "/pre-registration" },
            ]
            : [
                { name: "Dashboard", path: "/" },
                { name: "Course Management", path: "/hod-courses" },
            ];

    return (
        <div style={{ display: "flex", height: "100vh" }}>
            {/* Sidebar */}
            <div
                style={{
                    width: "250px",
                    background: "#1f2937",
                    color: "#fff",
                    padding: "20px",
                }}
            >
                <h3>Academic Portal</h3>

                <ul style={{ listStyle: "none", padding: 0 }}>
                    {menuItems.map((item) => (
                        <li key={item.name} style={{ marginBottom: "15px" }}>
                            <Link to={item.path} style={linkStyle}>
                                {item.name}
                            </Link>
                        </li>
                    ))}
                    <li>
                        <button
                            onClick={() => {
                                localStorage.removeItem("currentUser");
                                navigate("/login");
                            }}
                            style={{
                                background: "transparent",
                                color: "#fff",
                                border: "none",
                                cursor: "pointer",
                                marginTop: "20px",
                            }}
                        >
                            Logout
                        </button>
                    </li>
                </ul>
            </div>

            {/* Main Content */}
            <div
                style={{
                    flex: 1,
                    padding: "30px",
                    background: "#f9fafb",
                    overflowY: "auto",
                }}
            >
                <Outlet />
            </div>
        </div>
    );
};

const linkStyle = {
    color: "#fff",
    textDecoration: "none",
    fontSize: "16px",
};

export default PortalLayout;
