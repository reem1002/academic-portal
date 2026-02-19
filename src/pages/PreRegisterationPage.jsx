import { useState, useEffect } from "react";
import "./styles/PreRegistrationPage.css";
import bylawCourses from "../data/bylawCourses";
import { FiTrash2, FiPlus } from "react-icons/fi";

const PreRegistrationPage = () => {
    const [openedCourses, setOpenedCourses] = useState([]);
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [activeLevel, setActiveLevel] = useState("Freshman");
    const [registrationEnd, setRegistrationEnd] = useState(null);
    const [countdown, setCountdown] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("All");
    const [submitMessage, setSubmitMessage] = useState("");

    const levels = ["Freshman", "Sophomore", "Junior", "Senior"];

    const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {};

    /* ===============================
       🎓 STUDENT STATUS CALCULATION
    =============================== */
    const getStudentStatus = (user) => {
        if (!user || user.role !== "student") return {};

        const requiredCredits = user.regulation === "old" ? 180 : 165;
        const remainingCredits = requiredCredits - (user.completedCredits || 0);

        return {
            requiredCredits,
            remainingCredits,
            isGraduating: remainingCredits <= 18 && remainingCredits > 0,
            isFinished: remainingCredits <= 0,
        };
    };

    const studentStatus = getStudentStatus(currentUser);
    const maxCredits = studentStatus.isGraduating ? 21 : 18;

    /* ===============================
    INITIAL LOAD
    =============================== */
    useEffect(() => {
        const opened = JSON.parse(localStorage.getItem("openedCourses")) || [];
        setOpenedCourses(opened);

        const preRegInfo = JSON.parse(localStorage.getItem("preRegistrationInfo"));

        if (preRegInfo && preRegInfo.status === "open") {
            setRegistrationEnd(new Date(preRegInfo.endDate));

            const allSelections = JSON.parse(localStorage.getItem("studentSelections")) || [];

            const userSelections = allSelections.filter(
                (s) => s.studentId === currentUser.academicId
            );

            setSelectedCourses(userSelections);
        }
    }, [currentUser.academicId]);

    /* ===============================
       COUNTDOWN
    =============================== */
    useEffect(() => {
        if (!registrationEnd) return;

        const interval = setInterval(() => {
            const now = new Date();
            const diff = registrationEnd - now;

            if (diff <= 0) {
                clearInterval(interval);
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
    }, [registrationEnd]);

    const canModify = () => registrationEnd && new Date() <= registrationEnd;

    const handleRegistrationEnd = () => {
        setRegistrationEnd(null);
        setCountdown("");

        const allSelections = JSON.parse(localStorage.getItem("studentSelections")) || [];
        const updatedSelections = allSelections.filter(
            (s) => s.studentId !== currentUser.academicId
        );

        localStorage.setItem("studentSelections", JSON.stringify(updatedSelections));
        setSelectedCourses([]);
        alert("Pre-registration has ended.");
    };

    /* ===============================
       ADD COURSE
    =============================== */
    const addCourse = (course) => {
        if (!canModify() || !course) return;

        const openedCourse = openedCourses.find((c) => c.code === course.code);

        if (openedCourse && openedCourse.isLocked) {
            alert("This course is currently locked by the department.");
            return;
        }

        const exists = selectedCourses.some((c) => c.code === course.code);
        if (exists) return;

        const totalCredits = selectedCourses.reduce((sum, c) => sum + c.credits, 0);
        if (totalCredits + course.credits > maxCredits) {
            alert(`You cannot exceed ${maxCredits} credit hours.`);
            return;
        }

        const currentSemester = localStorage.getItem("currentSemester");

        const newSelection = {
            semesterId: currentSemester,
            studentId: currentUser.academicId,
            studentName: currentUser.name,
            isGraduate: studentStatus.isGraduating,
            ...course,
        };

        const allSelections = JSON.parse(localStorage.getItem("studentSelections")) || [];

        setSelectedCourses((prev) => [...prev, newSelection]);
        localStorage.setItem("studentSelections", JSON.stringify([...allSelections, newSelection]));
    };

    /* ===============================
       REMOVE COURSE
    =============================== */
    const removeCourse = (code) => {
        if (!canModify()) return;

        const allSelections = JSON.parse(localStorage.getItem("studentSelections")) || [];
        const updatedSelections = allSelections.filter(
            (s) => !(s.studentId === currentUser.academicId && s.code === code)
        );

        const updatedSelectedCourses = selectedCourses.filter((c) => c.code !== code);

        setSelectedCourses(updatedSelectedCourses);
        localStorage.setItem("studentSelections", JSON.stringify(updatedSelections));
    };

    /* ===============================
       SAVE PRE-REGISTRATION
    =============================== */
    const submitSelection = () => {
        const allSelections = JSON.parse(localStorage.getItem("studentSelections")) || [];

        const filteredSelections = allSelections.filter(
            (s) => s.studentId !== currentUser.academicId
        );

        localStorage.setItem(
            "studentSelections",
            JSON.stringify([...filteredSelections, ...selectedCourses])
        );

        alert("Your pre-registration has been saved!");
    };

    /* ===============================
       FINISHED STUDENT BLOCK
    =============================== */
    if (studentStatus.isFinished) {
        return (
            <div className="pr-container">
                <h2>Academic Pre-Registration</h2>
                <div className="pr-closed-box">
                    You have already completed all required credits.
                </div>
            </div>
        );
    }

    /* ===============================
   FILTERED & DISPLAYED COURSES
=============================== */
    const filteredOpenedCourses = openedCourses
        .filter(course => course.level === activeLevel) // نفس المستوى
        .filter(course => {
            // الطالب ما خدش المادة قبل كده
            const taken = currentUser.coursesTaken.some(ct => ct.courseCode === course.code);
            if (taken) return false;

            // الطالب مستوفاش prerequisites
            const hasPrereqs = course.prerequisites.every(pr =>
                currentUser.coursesTaken.some(ct => ct.courseCode === pr)
            );
            if (!hasPrereqs) return false;

            // البحث بالاسم
            if (!course.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;

            // نوع المادة
            if (typeFilter === "Mandatory" && !course.mandatory) return false;
            if (typeFilter === "Elective" && course.mandatory) return false;

            return true;
        });


    const proposedCourses = bylawCourses.filter(
        (c) => !openedCourses.some((o) => o.code === c.code) && !selectedCourses.some((s) => s.code === c.code)
    );

    if (!registrationEnd) {
        return (
            <div className="pr-container">
                <h2>Academic Pre-Registration</h2>
                <div className="pr-closed-box">
                    Pre-registration is currently closed.
                </div>
            </div>
        );
    }

    /* ===============================
       RENDER
    =============================== */
    return (
        <div className="pr-container">
            <h2 className="pr-title">Academic Pre-Registration</h2>

            <div className="pr-banner">
                {localStorage.getItem("currentSemester")} is OPEN — Ends in: <strong>{countdown}</strong>
            </div>

            <div className="SubBanner">
                <p className="pr-credits">
                    Selected Credits: <strong>{selectedCourses.reduce((sum, c) => sum + c.credits, 0)}</strong> / {maxCredits}
                </p>

                {studentStatus.isGraduating && <div className="senior-badge">Final Year Student</div>}
            </div>

            {submitMessage && <div className="submit-message">{submitMessage}</div>}

            <div className="regHeader">
                <div className="pr-tabs">
                    {levels.map((level) => (
                        <button
                            key={level}
                            onClick={() => setActiveLevel(level)}
                            className={`pr-tab-btn ${activeLevel === level ? "active" : ""}`}
                        >
                            {level}
                        </button>
                    ))}
                </div>

                <div className="pr-filters">
                    <input
                        type="text"
                        placeholder="Search by course name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pr-search-input"
                    />
                    <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="pr-select">
                        <option value="All">All Types</option>
                        <option value="Mandatory">Mandatory</option>
                        <option value="Elective">Elective</option>
                    </select>
                </div>
            </div>

            <h4>Register From These Courses</h4>
            <table className="pr-table">
                <thead>
                    <tr>
                        <th>Code</th>
                        <th>Course Name</th>
                        <th>Credits</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredOpenedCourses.length === 0 ? (
                        <tr>
                            <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                                No available courses for {activeLevel} level
                            </td>
                        </tr>
                    ) : (
                        filteredOpenedCourses.map(course => {
                            const selected = selectedCourses.some(c => c.code === course.code);
                            return (
                                <tr
                                    key={course.code}
                                    style={{
                                        backgroundColor: course.isLocked
                                            ? "#f8d7da" // أحمر لو لوكد
                                            : course.enabled
                                                ? "#d1f0d1" // أخضر لو مفتوح
                                                : "white",
                                        fontWeight: course.isLocked || course.enabled ? "bold" : "normal",
                                    }}
                                >
                                    <td>{course.code}</td>
                                    <td>{course.name}</td>
                                    <td>{course.credits}</td>
                                    <td>{course.mandatory ? "Mandatory" : "Elective"}</td>
                                    <td>{course.isLocked ? "Locked" : course.enabled ? "Open" : "Proposed"}</td>
                                    <td>
                                        <button
                                            className="pr-action-btn"
                                            onClick={() =>
                                                selected ? removeCourse(course.code) : addCourse(course)
                                            }
                                            disabled={course.isLocked}
                                        >
                                            {selected ? <FiTrash2 size={16} /> : <FiPlus size={18} />}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>


            <h4>Selected Courses</h4>
            {selectedCourses.length === 0 ? (
                <p className="no-courses-msg">No courses selected yet.</p>
            ) : (
                <div className="selected-courses-table">
                    {selectedCourses.map((c) => (
                        <div key={c.code} className="table-row">
                            <span>{c.name}</span>
                            <span>{c.code}</span>
                            <span>{c.credits} credits</span>
                            <span>{c.mandatory ? "Mandatory" : "Elective"}</span>
                            <button className="remove-btn" onClick={() => removeCourse(c.code)}>
                                <FiTrash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <button className="pr-submit-btn" onClick={submitSelection} disabled={selectedCourses.length === 0}>
                Save Pre-Registration
            </button>
        </div>
    );
};

export default PreRegistrationPage;
