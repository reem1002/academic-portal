import { useState, useEffect } from "react";
import { saveAs } from "file-saver"; // تحتاج تثبيت: npm install file-saver
import "./styles/SemesterHistoryPage.css";

const SemesterHistoryPage = () => {
    const [history, setHistory] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState(null);

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem("semesterHistory")) || [];
        setHistory(stored.reverse());
    }, []);

    const handleExportCSV = () => {
        if (!selectedSemester) return;

        const header = [
            "Code",
            "Name",
            "Level",
            "Type",
            "Students",
            "Graduates",
            "Status",
        ];
        const rows = selectedSemester.courses
            .filter(course => course.enabled || (course.students && course.students.length > 0))
            .map(course => [
                course.code,
                course.name,
                course.level,
                course.mandatory ? "Mandatory" : "Elective",
                course.students ? course.students.length : 0,
                course.graduates || 0,
                course.enabled ? "Opened" : "Proposed",
            ]);


        const csvContent =
            [header, ...rows]
                .map((e) => e.join(","))
                .join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        saveAs(blob, `${selectedSemester.semesterId}_snapshot.csv`);
    };

    return (
        <div className="history-container">
            <h2 className="history-title">Semester History</h2>

            {history.length === 0 ? (
                <div className="empty-state">No archived semesters yet.</div>
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
                            {history.map((sem, index) => (
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

            {selectedSemester && (
                <div className="snapshot-card">
                    <div className="snapshot-header">
                        <h3>{selectedSemester.semesterId} Snapshot</h3>
                        <button className="export-btn" onClick={handleExportCSV}>
                            Export CSV
                        </button>
                    </div>

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
                                {selectedSemester.courses.map((course, i) => (
                                    <tr key={i}>
                                        <td>{course.code}</td>
                                        <td>{course.name}</td>
                                        <td>{course.level}</td>
                                        <td>{course.mandatory ? "Mandatory" : "Elective"}</td>
                                        <td>{course.students ? course.students.length : 0}</td>
                                        <td>{course.graduates || 0}</td>
                                        <td
                                            className={`status ${course.enabled ? "opened" : "proposed"
                                                }`}
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
