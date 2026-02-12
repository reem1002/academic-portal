import { useState, useEffect } from "react";
import { saveAs } from "file-saver"; // تحتاج تثبيت: npm install file-saver
import "./styles/SemesterHistoryPage.css";

const SemesterHistoryPage = () => {
    const [history, setHistory] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState(null);
    const [yearFilter, setYearFilter] = useState("All");
    const [semesterFilter, setSemesterFilter] = useState("All");

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem("semesterHistory")) || [];
        setHistory(stored.reverse());
    }, []);

    // الفلترة حسب السنة أو السيمستر
    const filteredHistory = history.filter(h => {
        const year = new Date(h.endedAt).getFullYear();
        const yearMatch = yearFilter === "All" || year === Number(yearFilter);
        const semMatch = semesterFilter === "All" || h.semesterId === semesterFilter;
        return yearMatch && semMatch;
    });

    const handleExportCSV = () => {
        if (!selectedSemester) return;

        const studentSelections = selectedSemester.studentSelections || [];

        const selectedSemesterCourses = (selectedSemester.courses || [])
            .map(course => {
                const studentsInCourse = studentSelections.filter(s => s.code === course.code);
                return {
                    ...course,
                    students: studentsInCourse,
                    graduates: studentsInCourse.filter(s => s.isGraduate).length,
                };
            })
            .filter(course => course.students.length > 0);

        if (selectedSemesterCourses.length === 0) return;

        const header = [
            "Code",
            "Name",
            "Level",
            "Type",
            "Students",
            "Graduates",
            "Status",
        ];

        const rows = selectedSemesterCourses.map(course => [
            course.code,
            course.name,
            course.level,
            course.mandatory ? "Mandatory" : "Elective",
            course.students.length,
            course.graduates,
            course.enabled ? "Opened" : "Proposed",
        ]);

        const csvContent = [header, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        saveAs(blob, `${selectedSemester.semesterId}_snapshot.csv`);
    };

    const getDisplayedCourses = () => {
        if (!selectedSemester) return [];

        const studentSelections = selectedSemester.studentSelections || [];

        return (selectedSemester.courses || [])
            .map(course => {
                const studentsInCourse = studentSelections.filter(s => s.code === course.code);
                return {
                    ...course,
                    students: studentsInCourse,
                    graduates: studentsInCourse.filter(s => s.isGraduate).length,
                };
            })
            .filter(course => course.students.length > 0);
    };

    // استخراج السنوات المتاحة للفلترة
    const years = [...new Set(history.map(h => new Date(h.endedAt).getFullYear()))].sort((a, b) => b - a);

    return (
        <div className="history-container">
            <h2 className="history-title">Semester History</h2>


            <div className="historyheader">
                <div className="history-summary-card ">
                    {history.length === 0 ? (
                        <p>No archived semesters yet.</p>
                    ) : (
                        <p className="snapshot-summary1">
                            You have {history.length} archived semester{history.length > 1 ? "s" : ""}.
                        </p>
                    )}
                </div>

                {/* فلترة ديناميكية */}
                {history.length > 0 && (
                    <div className="history-filters">
                        <label>
                            Filter by Year:
                            <select
                                value={yearFilter}
                                onChange={(e) => setYearFilter(e.target.value)}
                            >
                                <option value="All">All</option>
                                {years.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </label>

                        <label>
                            Filter by Semester:
                            <select
                                value={semesterFilter}
                                onChange={(e) => setSemesterFilter(e.target.value)}
                            >
                                <option value="All">All</option>
                                {history.map(h => (
                                    <option key={h.semesterId} value={h.semesterId}>{h.semesterId}</option>
                                ))}
                            </select>
                        </label>
                    </div>
                )}
            </div>
            {/* جدول السيمسترات */}
            {filteredHistory.length === 0 ? (
                <div className="empty-state">No semesters match the selected filter.</div>
            ) : (
                <div className="history-table-wrapper">
                    <table className="history-table">
                        <thead>
                            <tr>
                                <th>Semester</th>
                                <th>Ended At</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredHistory.map((sem, index) => (
                                <tr key={index}>
                                    <td className="semester-id">{sem.semesterId}</td>
                                    <td>{new Date(sem.endedAt).toLocaleString()}</td>
                                    <td>
                                        <button
                                            className="view-btn"
                                            onClick={() => setSelectedSemester(sem)}
                                        >
                                            View Snapshot
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* بطاقة snapshot للكورسات */}
            {selectedSemester && (
                <div className="snapshot-card">
                    <div className="snapshot-header">
                        <h3>{selectedSemester.semesterId} Snapshot</h3>
                        <button className="export-btn2" onClick={handleExportCSV}>
                            Export CSV
                        </button>
                    </div>

                    <p className="snapshot-summary">
                        {getDisplayedCourses().length === 0
                            ? "No courses were taken by students this semester."
                            : `In this semester, ${getDisplayedCourses().length} course${getDisplayedCourses().length > 1 ? "s" : ""} were taken by students.`}
                    </p>

                    <div className="snapshot-table-wrapper">
                        <table className="snapshot-table">
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Name</th>
                                    <th>Level</th>
                                    <th>Type</th>
                                    <th>Students</th>
                                    <th>Graduates</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {getDisplayedCourses().map((course, i) => (
                                    <tr key={i}>
                                        <td>{course.code}</td>
                                        <td>{course.name}</td>
                                        <td>{course.level}</td>
                                        <td>{course.mandatory ? "Mandatory" : "Elective"}</td>
                                        <td>{course.students.length}</td>
                                        <td>{course.graduates}</td>
                                        <td
                                            className={`status ${course.enabled ? "opened" : "proposed"}`}
                                        >
                                            {course.enabled ? "Opened" : "Proposed"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SemesterHistoryPage;
