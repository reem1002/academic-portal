import { useState, useEffect } from "react";
import "./styles/PreRegistrationPage.css";
import bylawCourses from "../data/bylawCourses";
import { FiTrash2, FiPlus } from 'react-icons/fi';

const PreRegistrationPage = () => {
    const [openedCourses, setOpenedCourses] = useState([]);
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [selectedDropdownCourse, setSelectedDropdownCourse] = useState("");
    const [isGraduating, setIsGraduating] = useState(false);
    const [activeLevel, setActiveLevel] = useState("Freshman");
    const [registrationEnd, setRegistrationEnd] = useState(null);
    const [countdown, setCountdown] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("All");

    const levels = ["Freshman", "Sophomore", "Junior", "Senior"];
    const maxCredits = 18;

    useEffect(() => {
        const opened = JSON.parse(localStorage.getItem("openedCourses")) || [];
        setOpenedCourses(opened);

        const preRegInfo = JSON.parse(localStorage.getItem("preRegistrationInfo"));
        const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {};

        if (preRegInfo && preRegInfo.status === "open") {
            setRegistrationEnd(new Date(preRegInfo.endDate));

            const allSelections = JSON.parse(localStorage.getItem("studentSelections")) || [];
            const userSelections = allSelections.filter(s => s.studentName === currentUser.name);
            setSelectedCourses(userSelections);
            if (userSelections.length > 0) {
                setIsGraduating(userSelections[0].isGraduate || false);
            }
        } else {
            setSelectedCourses(prev =>
                prev.map(course => ({
                    ...course,
                    isGraduate: isGraduating
                }))
            );

        }
    }, []);

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

        const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {};
        const allSelections = JSON.parse(localStorage.getItem("studentSelections")) || [];
        const updatedSelections = allSelections.filter(s => s.studentName !== currentUser.name);

        localStorage.setItem("studentSelections", JSON.stringify(updatedSelections));
        setSelectedCourses([]);
        alert("Pre-registration has ended.");
    };

    const addCourse = (course) => {
        if (!canModify() || !course) return;

        // منع اضافة المادة لو مقفولة
        const openedCourse = openedCourses.find(c => c.code === course.code);
        if (openedCourse && openedCourse.isLocked) {
            alert("This course is currently locked by the department.");
            return;
        }

        const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {};
        const allSelections = JSON.parse(localStorage.getItem("studentSelections")) || [];

        const exists = selectedCourses.some(c => c.code === course.code && c.studentName === currentUser.name);
        if (exists) return;

        const currentSemester = localStorage.getItem("currentSemester");

        const newSelection = {
            semesterId: currentSemester,
            studentName: currentUser.name,
            isGraduate: isGraduating,
            ...course
        };


        setSelectedCourses(prev => [...prev, newSelection]);
        localStorage.setItem("studentSelections", JSON.stringify([...allSelections, newSelection]));
    };

    const removeCourse = (code) => {
        if (!canModify()) return;

        const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {};
        const allSelections = JSON.parse(localStorage.getItem("studentSelections")) || [];

        const updatedSelections = allSelections.filter(
            s => !(s.studentName === currentUser.name && s.code === code)
        );

        const updatedSelectedCourses = selectedCourses.filter(
            c => !(c.studentName === currentUser.name && c.code === code)
        );

        setSelectedCourses(updatedSelectedCourses);
        localStorage.setItem("studentSelections", JSON.stringify(updatedSelections));
    };

    const submitSelection = () => {
        const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {};
        const allSelections = JSON.parse(localStorage.getItem("studentSelections")) || [];

        const filteredSelections = allSelections.filter(s => s.studentName !== currentUser.name);

        localStorage.setItem("studentSelections", JSON.stringify([...filteredSelections, ...selectedCourses]));
        alert("Your pre-registration has been saved!");
    };

    // المواد المفتوحة بعد فلترة المستوى والنوع
    const filteredOpenedCourses = openedCourses
        .filter(course => course.level === activeLevel)
        .filter(course => course.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter(course => {
            if (typeFilter === "All") return true;
            if (typeFilter === "Mandatory") return course.mandatory;
            if (typeFilter === "Elective") return !course.mandatory;
            return true;
        });

    // المواد المقترحة
    const proposedCourses = bylawCourses.filter(
        c => !openedCourses.some(o => o.code === c.code) && !selectedCourses.some(s => s.code === c.code)
    );

    if (!registrationEnd) {
        return (
            <div className="pr-container">
                <h2>Academic Pre-Registration</h2>
                <div className="pr-closed-box">
                    Pre-registration is currently closed. <br />
                    Please wait until the department opens registration.
                </div>
            </div>
        );
    }

    return (
        <div className="pr-container">
            <h2 className="pr-title">Academic Pre-Registration</h2>

            {registrationEnd && (
                <div className="pr-banner">
                    {localStorage.getItem("currentSemester")} Pre-registration is OPEN!
                    Ends in: <strong>{countdown}</strong>

                </div>
            )}

            <p className="pr-credits">
                Selected Credits: <strong>{selectedCourses.reduce((sum, c) => sum + c.credits, 0)}</strong> / {maxCredits}
            </p>

            <label className="pr-checkbox">
                <input
                    type="checkbox"
                    checked={isGraduating}
                    onChange={() => setIsGraduating(!isGraduating)}
                />{" "}
                I am a graduating student
            </label>

            <div className="regHeader">
                <div className="pr-tabs">
                    {levels.map(level => (
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

            <h4>Opened Courses</h4>
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
                    {filteredOpenedCourses.map(course => {
                        const selected = selectedCourses.some(c => c.code === course.code);
                        const isLocked = course.isLocked || false;

                        return (
                            <tr key={course.code}
                                style={{
                                    backgroundColor: course.isLocked
                                        ? "#f8d7da"
                                        : course.enabled
                                            ? "#d1f0d1"
                                            : "white",
                                    fontWeight: course.isLocked || course.enabled ? "bold" : "normal"
                                }}>
                                <td>{course.code}</td>
                                <td>{course.name}</td>
                                <td>{course.credits}</td>
                                <td>{course.mandatory ? "Mandatory" : "Elective"}</td>
                                <td>{course.isLocked ? "Locked" : course.enabled ? "Open" : "Proposed"}</td>
                                <td>
                                    <button
                                        className="pr-action-btn"
                                        onClick={() => selected ? removeCourse(course.code) : addCourse(course)}
                                        disabled={course.isLocked}
                                    >
                                        {selected ? <FiTrash2 size={16} /> : <FiPlus size={18} />}
                                    </button>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>

            {proposedCourses.length > 0 && (
                <div className="pr-dropdown">
                    <h4>Propose a Course</h4>
                    <select
                        value={selectedDropdownCourse}
                        onChange={(e) => setSelectedDropdownCourse(e.target.value)}
                    >
                        <option value="">-- Select a course --</option>
                        {proposedCourses.map(c => (
                            <option key={c.code} value={c.code}>
                                {c.name} ({c.code})
                            </option>
                        ))}
                    </select>
                    <button onClick={() => {
                        const course = bylawCourses.find(c => c.code === selectedDropdownCourse);
                        addCourse(course);
                        setSelectedDropdownCourse("");
                    }}>Add Course</button>
                </div>
            )}

            <h4>Selected Courses</h4>
            {selectedCourses.length === 0 ? (
                <p className="no-courses-msg">No courses selected yet.</p>
            ) : (
                <div className="selected-courses-table">
                    {selectedCourses.map(c => (
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
    )
}

export default PreRegistrationPage;