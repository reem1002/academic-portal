import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "./styles/CourseDetailsPage.css";

const CourseDetailsPage = () => {
    const { code } = useParams();
    const [course, setCourse] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All"); // All, Graduate, Regular
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportType, setExportType] = useState("all"); // <-- هنا عرفناه
    const [selectedColumns, setSelectedColumns] = useState({
        studentName: true,
        status: true,
    });


    useEffect(() => {
        const studentSelections =
            JSON.parse(localStorage.getItem("studentSelections")) || [];
        const openedCourses =
            JSON.parse(localStorage.getItem("openedCourses")) || [];

        const students = studentSelections.filter(
            (s) => s.code === code
        );

        const opened = openedCourses.find(
            (c) => c.code === code
        );

        if (students.length === 0) return;

        setCourse({
            code,
            name: opened ? opened.name : students[0].name,
            students,
            count: students.length,
            graduateCount: students.filter(
                (s) => s.isGraduate
            ).length,
        });
    }, [code]);

    if (!course)
        return <div className="details-container">No data found.</div>;

    // فلترة الطلاب حسب السيرش والحالة
    const filteredStudents = course.students.filter(s => {
        const matchesName = s.studentName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
            statusFilter === "All"
                ? true
                : statusFilter === "Graduate"
                    ? s.isGraduate
                    : !s.isGraduate;
        return matchesName && matchesStatus;
    });

    const handleExport = () => {
        let studentsToExport = [...course.students];

        if (exportType === "graduates") {
            studentsToExport = studentsToExport.filter(s => s.isGraduate);
        } else if (exportType === "regular") {
            studentsToExport = studentsToExport.filter(s => !s.isGraduate);
        }

        let csvContent = "";
        const headers = [];
        if (selectedColumns.studentName) headers.push("Student Name");
        if (selectedColumns.status) headers.push("Status");
        csvContent += headers.join(",") + "\n";

        studentsToExport.forEach((s) => {
            const row = [];
            if (selectedColumns.studentName) row.push(s.studentName);
            if (selectedColumns.status) row.push(s.isGraduate ? "Graduate" : "Regular");
            csvContent += row.join(",") + "\n";
        });

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${course.code}_report.csv`;
        link.click();

        setShowExportModal(false);
    };
    return (
        <div className="details-container">
            {/* ===== Header ===== */}
            <div className="details-header">
                <div>
                    <h2>{course.name}</h2>
                    <span className="course-code">{course.code}</span>
                </div>

                <button className="export-btn" onClick={() => setShowExportModal(true)}>
                    Export Report
                </button>
            </div>



            {/* ===== Stats Cards ===== */}
            <div className="stats-grid">
                <div className="stat-card">
                    <span>Total Students</span>
                    <h3>{course.count}</h3>
                </div>
                <div className="stat-card">
                    <span>Graduates</span>
                    <h3>{course.graduateCount}</h3>
                </div>
            </div>
            {/* ===== Filters ===== */}
            <div className="student-filters">
                <input
                    type="text"
                    placeholder="Search student..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="All">All Statuses</option>
                    <option value="Graduate">Graduate</option>
                    <option value="Regular">Regular</option>
                </select>
            </div>
            {/* ===== Table ===== */}
            <div className="table-wrapper">
                <table className="students-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Student Name</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.map((s, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{s.studentName}</td>
                                <td>
                                    <span className={`status-badge ${s.isGraduate ? "graduate" : "regular"}`}>
                                        {s.isGraduate ? "Graduate" : "Regular"}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ===== Export Modal ===== */}
            {showExportModal && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <h3>Export Settings</h3>
                        <div className="modal-section">
                            <label>Export Students:</label>
                            <select value={exportType} onChange={(e) => setExportType(e.target.value)}>
                                <option value="all">All Students</option>
                                <option value="graduates">Graduates Only</option>
                                <option value="regular">Regular Only</option>
                            </select>
                        </div>
                        <div className="modal-actions">
                            <button className="export-btn" onClick={handleExport}>Confirm Export</button>
                            <button className="cancel-btn" onClick={() => setShowExportModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseDetailsPage;