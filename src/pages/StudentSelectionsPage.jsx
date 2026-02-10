import { useState, useEffect } from "react";
import "./styles/StudentSelectionsPage.css";

const StudentSelectionsPage = () => {
    const [courseStats, setCourseStats] = useState([]);
    const [filterStatus, setFilterStatus] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");

    const [showExportModal, setShowExportModal] = useState(false);
    const [reportType, setReportType] = useState("all");
    const [minStudents, setMinStudents] = useState(25);

    const allColumns = [
        "Course Code",
        "Course Name",
        "Students Count",
        "Graduates Count",
        "Minimum Students",
        "Type",
        "Credits",
        "Level",
        "Status"
    ];
    const [selectedColumns, setSelectedColumns] = useState([...allColumns]);

    useEffect(() => {
        const openedCourses = JSON.parse(localStorage.getItem("openedCourses")) || [];
        const studentSelections = JSON.parse(localStorage.getItem("studentSelections")) || [];

        // جلب المواد التي اختارها أي طالب فقط
        const coursesGrouped = {};
        studentSelections.forEach(s => {
            if (!coursesGrouped[s.code]) coursesGrouped[s.code] = [];
            coursesGrouped[s.code].push(s);
        });

        const coursesWithStats = Object.keys(coursesGrouped).map(code => {
            const students = coursesGrouped[code];
            const openedCourse = openedCourses.find(c => c.code === code);

            return {
                code,
                name: openedCourse ? openedCourse.name : students[0].name,
                credits: openedCourse ? openedCourse.credits : students[0].credits || 0,
                level: openedCourse ? openedCourse.level : students[0].level || "Unknown",
                mandatory: openedCourse ? openedCourse.mandatory : students[0].mandatory || false,
                students,
                count: students.length,
                graduateCount: students.filter(s => s.isGraduate).length,
                isOpened: openedCourse ? openedCourse.enabled : false, // false لو مقترحة
            };
        });

        setCourseStats(coursesWithStats);
    }, []);

    const handleGenerateCSV = () => {
        const coursesToExport = courseStats.filter(c => {
            if (reportType === "aboveMin") return c.count >= minStudents;
            if (reportType === "aboveMinOrGraduates") return c.count >= minStudents || c.graduateCount > 0;
            return true;
        });

        if (coursesToExport.length === 0) {
            alert("No courses meet the criteria!");
            return;
        }

        let csvContent = selectedColumns.join(",") + "\n";

        coursesToExport.forEach(c => {
            const row = selectedColumns.map(col => {
                switch (col) {
                    case "Course Code": return c.code;
                    case "Course Name": return c.name;
                    case "Students Count": return c.count;
                    case "Graduates Count": return c.graduateCount;
                    case "Minimum Students": return minStudents;
                    case "Type": return c.mandatory ? "Mandatory" : "Elective";
                    case "Credits": return c.credits;
                    case "Level": return c.level;
                    case "Status": return c.isOpened ? "Opened" : "Proposed";
                    default: return "";
                }
            }).join(",");
            csvContent += row + "\n";
        });

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "student_selections_report.csv";
        link.click();

        setShowExportModal(false);
    };

    const filteredCourses = courseStats.filter(c => {
        if (filterStatus === "opened" && !c.isOpened) return false;
        if (filterStatus === "proposed" && c.isOpened) return false;
        if (searchTerm && !c.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
    });

    return (
        <div className="student-report-container">
            <h2>Student Selections Report</h2>

            <div className="filters-container">
                <div className="filters">
                    <label>
                        Search by Course Name:{" "}
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Enter course name..."
                        />
                    </label>

                    <label style={{ marginLeft: "20px" }}>
                        Show:
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                            <option value="all">All</option>
                            <option value="opened">Opened</option>
                            <option value="proposed">Proposed</option>
                        </select>
                    </label>
                </div>

                <button className="export-btn" onClick={() => setShowExportModal(true)} style={{ marginLeft: "20px" }}>
                    Export as CSV
                </button>
            </div>

            {showExportModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Export Options</h3>
                        <div style={{ marginBottom: "10px" }}>
                            <strong>Report Type:</strong>
                            <label style={{ marginLeft: "10px" }}>
                                <input type="radio" value="all" checked={reportType === "all"} onChange={() => setReportType("all")} /> All Courses
                            </label>
                            <label style={{ marginLeft: "10px" }}>
                                <input type="radio" value="aboveMin" checked={reportType === "aboveMin"} onChange={() => setReportType("aboveMin")} /> Courses Above Minimum
                            </label>
                            <label style={{ marginLeft: "10px" }}>
                                <input type="radio" value="aboveMinOrGraduates" checked={reportType === "aboveMinOrGraduates"} onChange={() => setReportType("aboveMinOrGraduates")} /> Above Minimum or Has Graduates
                            </label>
                        </div>

                        <div style={{ marginBottom: "10px" }}>
                            Minimum Students: <input type="number" value={minStudents} onChange={(e) => setMinStudents(Number(e.target.value))} style={{ width: "60px" }} />
                        </div>

                        <div style={{ marginBottom: "10px" }}>
                            <strong>Columns to Include:</strong>
                            <div style={{ display: "flex", flexWrap: "wrap" }}>
                                {allColumns.map(col => (
                                    <label key={col} style={{ marginRight: "10px" }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedColumns.includes(col)}
                                            onChange={() => {
                                                setSelectedColumns(prev =>
                                                    prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
                                                );
                                            }}
                                        /> {col}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginTop: "15px", textAlign: "right" }}>
                            <button onClick={() => setShowExportModal(false)} style={{ marginRight: "10px" }}>Cancel</button>
                            <button onClick={handleGenerateCSV}>Generate CSV</button>
                        </div>
                    </div>
                </div>
            )}

            {filteredCourses.map(c => (
                <div
                    key={c.code}
                    className="course-section"
                    style={{ backgroundColor: c.isOpened ? "transparent" : "#f8f7ed", padding: "10px", borderRadius: "5px", marginBottom: "10px" }}
                >
                    <strong>{c.name} ({c.code})</strong> - Total Students: {c.count}, Graduates: {c.graduateCount} ({c.isOpened ? "Opened" : "Proposed"})

                    {c.students.length === 0 ? (
                        <p>No students registered yet.</p>
                    ) : (
                        <div className="course-table-container">
                            <table className="course-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Student Name</th>
                                        <th>Graduate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {c.students.map((s, index) => (
                                        <tr key={s.studentName}>
                                            <td>{index + 1}</td>
                                            <td>{s.studentName}</td>
                                            <td>{s.isGraduate ? "Yes" : "No"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default StudentSelectionsPage;