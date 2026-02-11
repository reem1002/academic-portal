import { Outlet, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FiLogOut } from "react-icons/fi"; // أيقونة اللوجأوت
import "./styles/PortalLayout.css"; // فايل الـ CSS

const PortalLayout = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        if (!currentUser) {
            navigate("/login");
        } else {
            setUser(currentUser);
        }
    }, [navigate]);

    if (!user) return <p>Loading...</p>;

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
        <div className="portal-container">
            {/* Sidebar */}
            <div className="sidebar">
                <div className="sidebar-top">
                    <img
                        src="/images/department-logo.png" // ضع هنا مسار اللوجو
                        alt="Department Logo"
                        className="sidebar-logo"
                    />
                    <h3>Academic Portal</h3>
                    <ul className="sidebar-menu">
                        {menuItems.map((item) => (
                            <li key={item.name}>
                                <Link to={item.path} className="sidebar-link">
                                    {item.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Logout */}
                <button
                    className="logout-btn"
                    onClick={() => {
                        localStorage.removeItem("currentUser");
                        navigate("/login");
                    }}
                >
                    <FiLogOut size={20} />
                    Logout
                </button>
            </div>

            {/* Main Content */}
            <div className="main-content">
                <Outlet />
            </div>
        </div>
    );
};

export default PortalLayout;
