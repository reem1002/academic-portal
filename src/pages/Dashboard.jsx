import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiFileText, FiBookOpen, FiUserCheck, FiBarChart2, FiLock, FiAlertCircle } from "react-icons/fi";
import "./styles/Dashboard.css";
import { users } from "../data/users";

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [announcements, setAnnouncements] = useState([]);
    const [newAnnouncement, setNewAnnouncement] = useState("");

    useEffect(() => {
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        setUser(currentUser);

        const storedAnnouncements = JSON.parse(localStorage.getItem("announcements")) || [];
        setAnnouncements(storedAnnouncements);
    }, []);

    if (!user) return <div>Loading...</div>;

    // ================= Student Data =================
    let student = null;
    let totalCredits = 0;
    let progressPercent = 0;
    let graduationStatus = false;

    if (user.role === "student") {
        student = users.find(u => u.academicId === user.academicId);
        if (student) {
            totalCredits = student.regulation === "new" ? 165 : 180;
            progressPercent = Math.min((student.completedCredits / totalCredits) * 100, 100);
            graduationStatus = student.completedCredits >= totalCredits;
        }
    }

    // ================= Admin Add Announcement =================
    const handleAddAnnouncement = () => {
        if (!newAnnouncement.trim()) return;

        const updated = [
            ...announcements,
            {
                message: newAnnouncement,
                date: new Date().toLocaleString(),
                author: user.name
            },
        ];

        setAnnouncements(updated);
        localStorage.setItem("announcements", JSON.stringify(updated));
        setNewAnnouncement("");
    };

    return (
        <div className="dashboard-container">
            <h2>Welcome, {user.name}!</h2>

            <div className="cards-container">

                {/* ================= Student Dashboard ================= */}
                {user.role === "student" && student && (
                    <>
                        <Link to="/pre-registration" className="dashboard-card">
                            <FiBookOpen size={40} />
                            <h3>Pre-Registration</h3>
                            <p>Register your courses for the upcoming semester</p>
                        </Link>

                        <Link to="/my-courses" className="dashboard-card">
                            <FiFileText size={40} />
                            <h3>My Courses</h3>
                            <p>You have completed {student.completedCredits} / {totalCredits} credits</p>
                        </Link>

                        <div className="dashboard-card">
                            <FiUserCheck size={40} />
                            <h3>Graduation Status</h3>
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${progressPercent}%` }}>
                                    {Math.round(progressPercent)}%
                                </div>
                            </div>
                            {graduationStatus
                                ? <p style={{ color: "green" }}>You are eligible to graduate 🎓</p>
                                : <p>You are not yet eligible to graduate</p>}
                        </div>

                        <div className="dashboard-card coming-soon">
                            <FiBarChart2 size={40} />
                            <h3>Academic Advising</h3>
                            <p>Coming Soon</p>
                        </div>

                        {/* Announcements Section */}
                        <div className="announcements-section">
                            <h3><FiAlertCircle /> Announcements</h3>

                            {announcements.length === 0 ? (
                                <p>No announcements yet.</p>
                            ) : (
                                <>
                                    <ul>
                                        {announcements
                                            .slice(-3)
                                            .reverse()
                                            .map((a, idx) => (
                                                <li key={idx} className="announcement-item">
                                                    <div className="announcement-header">
                                                        <span className="announcement-author">
                                                            Posted by: {a.author}
                                                        </span>
                                                        <span className="announcement-date">
                                                            {a.date}
                                                        </span>
                                                    </div>
                                                    <p className="announcement-message">
                                                        {a.message}
                                                    </p>
                                                </li>
                                            ))}
                                    </ul>

                                    {announcements.length > 3 && (
                                        <Link to="/all-announcements" className="view-all">
                                            View All Announcements →
                                        </Link>
                                    )}
                                </>
                            )}
                        </div>
                    </>
                )}

                {/* ================= Admin Dashboard ================= */}
                {user.role === "admin" && (
                    <>
                        <Link to="/hod-courses" className="dashboard-card">
                            <FiBookOpen size={40} />
                            <h3>Course Management</h3>
                            <p>Create, edit, or delete courses</p>
                        </Link>

                        <Link to="/student-selections" className="dashboard-card">
                            <FiUserCheck size={40} />
                            <h3>Student Registrations</h3>
                            <p>View all student course selections</p>
                        </Link>

                        <Link to="/student-selections" className="dashboard-card">
                            <FiFileText size={40} />
                            <h3>Export Data</h3>
                            <p>Download course and student reports</p>
                        </Link>

                        <Link to="/hod-courses" className="dashboard-card">
                            <FiBarChart2 size={40} />
                            <h3>Statistics & Charts</h3>
                            <p>View course enrollment and graduation data</p>
                        </Link>

                        <Link to="/hod-courses" className="dashboard-card">
                            <FiLock size={40} />
                            <h3>Lock/Unlock Courses</h3>
                            <p>Manage course availability for students</p>
                        </Link>

                        {/* Admin Announcement */}
                        <div className="dashboard-card">
                            <h3>Add Announcement</h3>
                            <textarea
                                value={newAnnouncement}
                                onChange={(e) => setNewAnnouncement(e.target.value)}
                                placeholder="Write announcement here..."
                            />
                            <button className="export-btn" onClick={handleAddAnnouncement}>
                                Publish
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
