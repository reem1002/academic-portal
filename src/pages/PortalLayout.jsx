import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
    FiLogOut,
    FiHome,
    FiBook,
    FiClock,
    FiMenu,
    FiChevronLeft,
    FiUsers,
    FiBookOpen
} from "react-icons/fi";
import "./styles/PortalLayout.css";

const PortalLayout = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        if (!currentUser) {
            navigate("/login");
        } else {
            setUser(currentUser);
        }
    }, [navigate]);

    if (!user) return null;

    const menuItems =
        user.role === "student"
            ? [
                { name: "Dashboard", path: "/", icon: <FiHome fontSize={20} /> },
                {
                    name: "Pre-Registration", path: "/pre-registration", icon: <FiBookOpen fontSize={20} />
                },
                { name: "My Courses", path: "/MyCourses", icon: <FiBook fontSize={20} /> },
            ]
            : [
                { name: "Dashboard", path: "/", icon: <FiHome fontSize={20} /> },
                { name: "Course Management", path: "/hod-courses", icon: <FiBook fontSize={20} /> },
                { name: "Semesters History", path: "/Semester-History", icon: <FiClock fontSize={20} /> },
                {
                    name: "Students", path: "/Students", icon: <FiUsers fontSize={20} />
                },


            ];

    return (
        <div className="portal-container">

            {/* Mobile Button */}
            <button
                className="mobile-toggle"
                onClick={() => setMobileOpen(true)}
            >
                <FiMenu fontSize={20} />
            </button>

            {/* Overlay */}
            {mobileOpen && (
                <div
                    className="overlay"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div
                className={`sidebar ${collapsed ? "collapsed" : ""
                    } ${mobileOpen ? "open" : ""}`}
            >
                <div className="sidebar-top">

                    {/* Collapse */}
                    <button
                        className="collapse-btn"
                        onClick={() => setCollapsed(!collapsed)}
                    >
                        <FiChevronLeft fontSize={20} />
                    </button>

                    {/* Logo Section */}
                    <div className="brand-section">
                        <img
                            src="/images/department-logo.png"
                            alt="Department Logo"
                            className="sidebar-logo"
                        />


                    </div>


                    {/* Menu */}
                    <ul className="sidebar-menu">
                        {menuItems.map((item) => (
                            <li key={item.name}>
                                <NavLink
                                    to={item.path}
                                    onClick={() => setMobileOpen(false)}
                                    className={({ isActive }) =>
                                        isActive
                                            ? "sidebar-link active"
                                            : "sidebar-link"
                                    }
                                >
                                    <span className="menu-icon">
                                        {item.icon}
                                    </span>
                                    {!collapsed && (
                                        <span>{item.name}</span>
                                    )}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </div>
                {!collapsed && (
                    <div className="user-card">
                        <h4 className="user-name">
                            {user.name}
                        </h4>

                        <span
                            className={`role-badge ${user.role === "admin"
                                ? "admin-badge"
                                : "student-badge"
                                }`}
                        >
                            {user.role}
                        </span>
                    </div>
                )}
                {/* Logout */}
                <button
                    className="logout-btn"
                    onClick={() => {
                        localStorage.removeItem("currentUser");
                        navigate("/login");
                    }}
                >
                    <FiLogOut fontSize={20} />
                    {!collapsed && "Logout"}
                </button>
            </div>

            {/* Main */}
            <div className="main-content">
                <Outlet />
            </div>
        </div>
    );
};

export default PortalLayout;
