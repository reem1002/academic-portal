import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./styles/StudentSelectionsPage.css";

const StudentSelectionsPage = () => {
    const [coursesData, setCoursesData] = useState([]);
    const [activeLevel, setActiveLevel] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("All");
    const [visibleCount, setVisibleCount] = useState(6);

    const [showExportModal, setShowExportModal] = useState(false);
    const [minimum, setMinimum] = useState(10);
    const [exportType, setExportType] = useState("all");
    const [selectedColumns, setSelectedColumns] = useState({
        code: true,
        name: true,
        level: true,
        count: true,
        graduateCount: true,
    });

    const levels = ["All", "Freshman", "Sophomore", "Junior", "Senior"];

    useEffect(() => {
        const preReg = JSON.parse(localStorage.getItem("preRegistrationInfo"));
        const studentSelections = JSON.parse(localStorage.getItem("studentSelections")) || [];
        const openedCourses = JSON.parse(localStorage.getItem("openedCourses")) || [];
        const bylawCourses = JSON.parse(localStorage.getItem("bylawCourses")) || [];

        const snapshot = JSON.parse(localStorage.getItem("studentSelectionsSnapshot"));
        const useSnapshot = !preReg || preReg.status !== "open";

        const selectionsToUse = useSnapshot && snapshot ? snapshot.studentSelections : studentSelections;
        const coursesToUse = useSnapshot && snapshot ? snapshot.courses : openedCourses;

        const grouped = {};

        selectionsToUse.forEach((selection) => {
            if (!grouped[selection.code]) {
                const opened = coursesToUse.find(c => c.code === selection.code && c.enabled);
                const bylaw = bylawCourses.find(c => c.code === selection.code);

                grouped[selection.code] = {
                    code: selection.code,
                    name: opened?.name || bylaw?.name || selection.name,
                    level: opened?.level || bylaw?.level || selection.level,
                    mandatory: bylaw?.mandatory ?? false,
                    isOpened: !!opened,
                    isLocked: opened?.isLocked || false, // ✅ حالة القفل
                    students: [],
                };
            }
            grouped[selection.code].students.push(selection);
        });

        const result = Object.values(grouped).map((course) => ({
            ...course,
            count: course.students.length,
            graduateCount: course.students.filter(s => s.isGraduate).length,
        }));

        setCoursesData(result);
    }, []);

    const filteredCourses = coursesData
        .filter((c) => (activeLevel === "All" ? true : c.level === activeLevel))
        .filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter((c) => {
            if (typeFilter === "All") return true;
            if (typeFilter === "Mandatory") return c.mandatory;
            if (typeFilter === "Elective") return !c.mandatory;
            return true;
        });

    // 🔒 دالة لقفل/فتح المادة وحذف الطلاب لو اتقفلت
    const handleLockCourse = (code) => {
        const updatedCourses = coursesData.map(c => {
            if (c.code === code) {
                return { ...c, isLocked: !c.isLocked };
            }
            return c;
        });

        setCoursesData(updatedCourses);

        // حذف الطلاب المسجلين في المادة لو اتقفلت
        const allSelections = JSON.parse(localStorage.getItem("studentSelections")) || [];
        const updatedSelections = allSelections.filter(s => {
            const course = updatedCourses.find(c => c.code === s.code);
            return !(s.code === code && course.isLocked);
        });

        localStorage.setItem("studentSelections", JSON.stringify(updatedSelections));
    };

    // 🔄 دالة export
    const handleAdvancedExport = () => {
        let coursesToExport = [...filteredCourses];

        if (exportType === "minimum") {
            coursesToExport = coursesToExport.filter(c => c.count >= minimum);
        }

        if (exportType === "graduates") {
            coursesToExport = coursesToExport.filter(c => c.graduateCount > 0);
        }

        const headers = [];
        if (selectedColumns.code) headers.push("Course Code");
        if (selectedColumns.name) headers.push("Course Name");
        if (selectedColumns.level) headers.push("Level");
        if (selectedColumns.count) headers.push("Total Students");
        if (selectedColumns.graduateCount) headers.push("Graduates");

        let csvContent = headers.join(",") + "\n";

        coursesToExport.forEach((c) => {
            const row = [];
            if (selectedColumns.code) row.push(c.code);
            if (selectedColumns.name) row.push(c.name);
            if (selectedColumns.level) row.push(c.level);
            if (selectedColumns.count) row.push(c.count);
            if (selectedColumns.graduateCount) row.push(c.graduateCount);

            csvContent += row.join(",") + "\n";
        });

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "Courses_Report.csv";
        link.click();

        setShowExportModal(false);
    };

    return (
        <div className="selections-container">
            <h2>Student Course Selections</h2>

            {/* ===== Filters ===== */}
            <div className="selectionheading">
                <div className="level-tabs">
                    {levels.map(level => (
                        <button
                            key={level}
                            onClick={() => { setActiveLevel(level); setVisibleCount(6); }}
                            className={activeLevel === level ? "active-tab" : ""}
                        >
                            {level}
                        </button>
                    ))}
                </div>

                <div className="filters-row">
                    <input
                        type="text"
                        placeholder="Search by course name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                        <option value="All">All Types</option>
                        <option value="Mandatory">Mandatory</option>
                        <option value="Elective">Elective</option>
                    </select>
                    {filteredCourses.length > 0 && (
                        <button className="export-btn" onClick={() => setShowExportModal(true)}>Export</button>
                    )}
                </div>
            </div>

            {/* ===== Courses Grid ===== */}
            <div className="courses-grid">
                {filteredCourses.length === 0 ? (
                    <p>No courses with student selections yet.</p>
                ) : (
                    filteredCourses.slice(0, visibleCount).map(course => {
                        const cardClass = `course-card ${course.isOpened ? "opened-card" : "proposed-card"}`;
                        return (
                            <div key={course.code} className="course-card-wrapper">
                                <Link to={`/course/${course.code}`} className="course-card-link">
                                    <div className={cardClass}>
                                        <div className="card-header">
                                            <h3>{course.name}</h3>
                                            <span className="course-code">{course.code}</span>
                                        </div>
                                        <div className="card-body">
                                            <div className="info-item">
                                                <span className="label">Level</span>
                                                <span>{course.level}</span>
                                            </div>
                                            <div className="info-item">
                                                <span className="label">Type</span>
                                                <span>{course.mandatory ? "Mandatory" : "Elective"}</span>
                                            </div>
                                            <div className="info-item">
                                                <span className="label">Students</span>
                                                <span>{course.count}</span>
                                            </div>
                                            <div className="info-item">
                                                <span className="label">Graduates</span>
                                                <span>{course.graduateCount}</span>
                                            </div>
                                        </div>
                                        <div className="card-footer">
                                            <span className={`status-badge ${course.isOpened ? "opened" : "proposed"}`}>
                                                {course.isOpened ? "Opened by Doctor" : "Proposed by Students"}
                                            </span>
                                        </div>
                                    </div>
                                </Link>


                                {/* {course.isOpened && (
                                    <button
                                        className="lock-btn"
                                        onClick={() => handleLockCourse(course.code)}
                                    >
                                        {course.isLocked ? "Unlock Course" : "Lock Course"}
                                    </button>
                                )} */}
                            </div>
                        );
                    })
                )}
            </div>

            {/* ===== Show More ===== */}
            {visibleCount < filteredCourses.length && (
                <div style={{ textAlign: "center", marginTop: "20px" }}>
                    <button className="export-btn" onClick={() => setVisibleCount(prev => prev + 6)}>Show More</button>
                </div>
            )}

            {/* ===== Export Modal ===== */}
            {showExportModal && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <h3>Export Settings</h3>

                        <div className="modal-section">
                            <label>Export Type:</label>
                            <select value={exportType} onChange={(e) => setExportType(e.target.value)}>
                                <option value="all">All Courses</option>
                                <option value="minimum">Courses Above Minimum</option>
                                <option value="graduates">Courses With Graduates</option>
                            </select>
                        </div>

                        {exportType === "minimum" && (
                            <div className="modal-section">
                                <label>Minimum Students:</label>
                                <input type="number" value={minimum} onChange={(e) => setMinimum(Number(e.target.value))} />
                            </div>
                        )}

                        <div className="modal-section">
                            <label>Columns:</label>
                            {Object.keys(selectedColumns).map(key => (
                                <div key={key}>
                                    <input type="checkbox" checked={selectedColumns[key]} onChange={() =>
                                        setSelectedColumns({ ...selectedColumns, [key]: !selectedColumns[key] })
                                    } />
                                    <span>{key}</span>
                                </div>
                            ))}
                        </div>

                        <div className="modal-actions">
                            <button className="export-btn" onClick={handleAdvancedExport}>Confirm Export</button>
                            <button className="cancel-btn" onClick={() => setShowExportModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentSelectionsPage;