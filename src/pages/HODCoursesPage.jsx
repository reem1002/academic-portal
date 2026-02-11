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
        // load current opened courses or bylawCourses if empty
        const savedCourses = JSON.parse(localStorage.getItem("openedCourses")) || [];
        setCourses(
            savedCourses.length > 0
                ? savedCourses
                : bylawCourses.map(c => ({ ...c, enabled: false, isLocked: false, capacity: 50 }))
        );

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
        // snapshot قبل الإغلاق
        const studentSelections = JSON.parse(localStorage.getItem("studentSelections")) || [];
        const snapshot = {
            timestamp: new Date().toISOString(),
            courses: courses,
            studentSelections,
        };
        localStorage.setItem("studentSelectionsSnapshot", JSON.stringify(snapshot));

        // اغلاق كل الكورسات
        setCourses(prev => prev.map(c => ({ ...c, enabled: false })));
        localStorage.removeItem("preRegistrationInfo");
        localStorage.setItem("openedCourses", JSON.stringify(courses));
        setRegistrationInfo(null);
        alert("Pre-registration has ended. Snapshot saved!");
    };

    const toggleCourseEnabled = (code) => {
        setCourses(prev =>
            prev.map(c => {
                if (c.code === code) {
                    if (c.isLocked) return c; // مش ممكن تفتح مادة مقفولة
                    return { ...c, enabled: !c.enabled };
                }
                return c;
            })
        );
    };

    const toggleCourseLocked = (code) => {
        setCourses(prev =>
            prev.map(c => {
                if (c.code === code) {
                    const newLockState = !c.isLocked;

                    // لو حوّلناها لـ Locked، لازم تبقى مش Open
                    let updatedCourse = { ...c, isLocked: newLockState };
                    if (newLockState) updatedCourse.enabled = false;

                    // لو المادة اتقفلت، نحذف أي تسجيلات الطلاب على المادة
                    if (newLockState) {
                        const studentSelections = JSON.parse(localStorage.getItem("studentSelections")) || [];
                        const updatedSelections = studentSelections.filter(s => s.code !== code);
                        localStorage.setItem("studentSelections", JSON.stringify(updatedSelections));
                    }

                    return updatedCourse;
                }
                return c;
            })
        );
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
                        <th>Locked</th>
                        <th>Code</th>
                        <th>Course Name</th>
                        <th>Level</th>
                        <th>Credits</th>
                        <th>Type</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredCourses.map(course => {
                        let rowColor = "";
                        if (course.isLocked) rowColor = "#f8d7da"; // أحمر لو Locked
                        else if (course.enabled) rowColor = "#d1f0d1"; // أخضر لو Open
                        // غيره يبقى proposed → بدون لون

                        return (
                            <tr key={course.code} style={{ backgroundColor: rowColor }}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={course.enabled}
                                        onChange={() => toggleCourseEnabled(course.code)}
                                        disabled={course.isLocked}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={course.isLocked || false}
                                        onChange={() => toggleCourseLocked(course.code)}
                                    />
                                </td>
                                <td>{course.code}</td>
                                <td>{course.name}</td>
                                <td>{course.level}</td>
                                <td>{course.credits}</td>
                                <td>{course.mandatory ? "Mandatory" : "Elective"}</td>
                            </tr>
                        )
                    })}
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