import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/HODCoursesPage.css";
import bylawCourses from "../data/bylawCourses";

const HODCoursesPage = () => {
    const navigate = useNavigate();

    const [courses, setCourses] = useState([]);
    const [preRegDays, setPreRegDays] = useState(7);
    const [registrationInfo, setRegistrationInfo] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [levelFilter, setLevelFilter] = useState("All");
    const [typeFilter, setTypeFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All"); // All, Opened, Closed

    const [countdown, setCountdown] = useState("");

    useEffect(() => {
        // نجيب المواد المفتوحة فقط من الترم الحالي أو نبدأ من الصفر
        const savedCourses = JSON.parse(localStorage.getItem("openedCourses")) || [];
        setCourses(savedCourses.length > 0 ? savedCourses : bylawCourses.map(c => ({ ...c, enabled: false, capacity: 50 })));

        const preReg = JSON.parse(localStorage.getItem("preRegistrationInfo"));
        if (preReg && preReg.status === "open") setRegistrationInfo(preReg);
    }, []);

    useEffect(() => {
        if (!registrationInfo || registrationInfo.status !== "open") return;
        const interval = setInterval(() => {
            const now = new Date();
            const endDate = new Date(registrationInfo.endDate);
            const diff = endDate - now;

            if (diff <= 0) {
                clearInterval(interval);
                setCountdown("Registration closed!");
                handleRegistrationEnd();
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / (1000 * 60)) % 60);
            const seconds = Math.floor((diff / 1000) % 60);

            setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        }, 1000);

        return () => clearInterval(interval);
    }, [registrationInfo]);

    const handleRegistrationEnd = () => {
        setCourses(prev => prev.map(c => ({ ...c, enabled: false })));
        localStorage.removeItem("preRegistrationInfo");
        localStorage.removeItem("openedCourses");
        setRegistrationInfo(null);
        alert("Pre-registration has ended.");
    };



    const toggleCourse = (code) => {
        setCourses(prev => prev.map(c => c.code === code ? { ...c, enabled: !c.enabled } : c));
    };

    const updateCapacity = (code, value) => {
        setCourses(prev => prev.map(c => c.code === code ? { ...c, capacity: Number(value) } : c));
    };

    const publishCourses = () => {
        const now = new Date();
        const endDate = new Date();
        endDate.setDate(now.getDate() + preRegDays);

        const info = { status: "open", publishDate: now.toISOString(), endDate: endDate.toISOString() };
        localStorage.setItem("openedCourses", JSON.stringify(courses));
        localStorage.setItem("preRegistrationInfo", JSON.stringify(info));

        setRegistrationInfo(info);
        alert(`Courses published! Pre-registration is open for ${preRegDays} days.`);
    };

    const closeRegistrationNow = () => {
        handleRegistrationEnd();
        alert("Pre-registration closed immediately.");
    };

    const filteredCourses = courses
        .filter(c => searchTerm === "" || c.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter(c => levelFilter === "All" || c.level === levelFilter)
        .filter(c => typeFilter === "All" || (typeFilter === "Mandatory" ? c.mandatory : !c.mandatory))
        .filter(c => statusFilter === "All" || (statusFilter === "Opened" ? c.enabled : !c.enabled))
        .sort((a, b) => b.enabled - a.enabled);

    return (
        <div className="hod-container">
            <h2>Head of Department – Course Management</h2>

            {registrationInfo && registrationInfo.status === "open" ? (
                <div className="preReg-banner">
                    Pre-registration is OPEN! Ends in: <strong>{countdown}</strong>
                    <button className="close-now-btn" onClick={closeRegistrationNow}>Close Now</button>
                </div>
            ) : (
                <p className="hod-note">
                    Select courses to open for the upcoming semester. Pre-registration duration:{" "}
                    <input
                        type="number"
                        value={preRegDays}
                        min={1}
                        max={30}
                        onChange={(e) => setPreRegDays(Number(e.target.value))}
                        style={{ width: "50px" }}
                    />{" "}
                    days
                </p>
            )}

            <div className="hod-filters">
                <input
                    type="text"
                    className="hod-search-input"
                    placeholder="Search by course name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}>
                    <option value="All">All Levels</option>
                    <option value="Freshman">Freshman</option>
                    <option value="Sophomore">Sophomore</option>
                    <option value="Junior">Junior</option>
                    <option value="Senior">Senior</option>
                </select>
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                    <option value="All">All Types</option>
                    <option value="Mandatory">Mandatory</option>
                    <option value="Elective">Elective</option>
                </select>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="All">All Status</option>
                    <option value="Opened">Opened</option>
                    <option value="Closed">Closed</option>
                </select>
            </div>

            <table className="hod-table">
                <thead>
                    <tr>
                        <th>Open</th>
                        <th>Code</th>
                        <th>Course Name</th>
                        <th>Level</th>
                        <th>Credits</th>
                        <th>Type</th>
                        <th>Capacity</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredCourses.map(course => (
                        <tr key={course.code} className={course.enabled ? "hod-row-active" : ""}>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={course.enabled}
                                    onChange={() => toggleCourse(course.code)}
                                />
                            </td>
                            <td>{course.code}</td>
                            <td>{course.name}</td>
                            <td>{course.level}</td>
                            <td>{course.credits}</td>
                            <td>{course.mandatory ? "Mandatory" : "Elective"}</td>
                            <td>
                                <input
                                    type="number"
                                    value={course.capacity}
                                    disabled={!course.enabled}
                                    onChange={(e) => updateCapacity(course.code, e.target.value)}
                                    className="hod-capacity-input"
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <button className="hod-publish-btn" onClick={publishCourses}>
                {registrationInfo && registrationInfo.status === "open" ? "Update Courses" : "Publish Courses"}
            </button>

            <button
                className="hod-publish-btn"
                style={{ marginLeft: "50px" }}
                onClick={() => navigate("/student-selections")}
            >
                View Student Selections
            </button>
        </div>
    );
};

export default HODCoursesPage;