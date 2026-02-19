import React, { useState, useEffect } from "react";
import { users, getStudentLevel, getAllowedCredits } from "../data/users";
import "./styles/StudentsPage.css";
import Papa from "papaparse";

const StudentsPage = () => {
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterLevel, setFilterLevel] = useState("");
    const [showGraduated, setShowGraduated] = useState(false);
    const [editStudent, setEditStudent] = useState(null);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [newStudent, setNewStudent] = useState({
        name: "",
        academicId: "",
        regulation: "new",
        completedCredits: 0,
        GPA: 0,
    });

    useEffect(() => {
        const allStudents = users.filter((u) => u.role === "student");
        setStudents(allStudents);
    }, []);

    // ===== Filtered Students =====
    const filteredStudents = students.filter((s) => {
        const level = getStudentLevel(s);
        const graduated = level === "Graduated";
        if (showGraduated && !graduated) return false;
        if (!showGraduated && graduated) return false;
        if (filterLevel && filterLevel !== level) return false;
        if (
            searchTerm &&
            !s.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !s.academicId.includes(searchTerm)
        )
            return false;
        return true;
    });

    // ===== Edit Student =====
    const handleEdit = (student) => setEditStudent({ ...student });

    const handleSaveEdit = () => {
        setStudents((prev) =>
            prev.map((s) =>
                s.academicId === editStudent.academicId ? editStudent : s
            )
        );
        setEditStudent(null);
    };

    // ===== Add Student =====
    const handleAddStudent = () => {
        setStudents((prev) => [...prev, newStudent]);
        setNewStudent({
            name: "",
            academicId: "",
            regulation: "new",
            completedCredits: 0,
            GPA: 0,
        });
        setAddModalOpen(false);
    };

    // ===== Bulk Upload =====
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.type === "application/json") {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const data = JSON.parse(ev.target.result);
                setStudents((prev) => [...prev, ...data]);
            };
            reader.readAsText(file);
        } else if (file.type === "text/csv") {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const parsedData = results.data.map((row) => ({
                        ...row,
                        completedCredits: Number(row.completedCredits),
                        GPA: Number(row.GPA),
                    }));
                    setStudents((prev) => [...prev, ...parsedData]);
                },
            });
        } else {
            alert("Please upload JSON or CSV file");
        }
    };

    return (
        <div className="students-page">
            <h2>Students Management</h2>
            <div className="students-stats">
                <div className="stat-card">
                    <h3>Current Students</h3>
                    <p>{students.filter(s => s.completedCredits < (s.regulation === "new" ? 165 : 180)).length}</p>
                </div>
                <div className="stat-card">
                    <h3>Graduated Students</h3>
                    <p>{students.filter(s => s.completedCredits >= (s.regulation === "new" ? 165 : 180)).length}</p>
                </div>
                {/* <div className="stat-card">
                    <h3>Total Students</h3>
                    <p>{students.length}</p>
                </div> */}
            </div>

            {/* Controls */}
            <div className="controls">
                <div className="StuFilters">
                    <input
                        type="text"
                        placeholder="Search by Name or Academic ID"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <select
                        value={filterLevel}
                        onChange={(e) => setFilterLevel(e.target.value)}
                    >
                        <option value="">All Levels</option>
                        <option value="Freshman">Freshman</option>
                        <option value="Junior">Junior</option>
                        <option value="Mid-level">Mid-level</option>
                        <option value="Senior">Senior</option>
                        <option value="Graduated">Graduated</option>
                    </select>
                </div>
                <div className="StuBtns">
                    <button onClick={() => setShowGraduated(!showGraduated)}>
                        {showGraduated ? "Show Active Students" : "Show Graduated Students"}
                    </button>
                    <button onClick={() => setAddModalOpen(true)}>Add Student</button>
                    <input type="file" onChange={handleFileUpload} />
                </div>
            </div>

            {/* Students Table */}
            <div className="table-container">
                <table className="students-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Academic ID</th>
                            <th>Regulation</th>
                            <th>Completed Credits</th>
                            <th>GPA</th>
                            <th>Level</th>
                            <th>Allowed Credits</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.map((s) => (
                            <tr key={s.academicId}>
                                <td>{s.name}</td>
                                <td>{s.academicId}</td>
                                <td>{s.regulation}</td>
                                <td>{s.completedCredits}</td>
                                <td>{s.GPA}</td>
                                <td>{getStudentLevel(s)}</td>
                                <td>{getAllowedCredits(s)}</td>
                                <td>
                                    <button onClick={() => handleEdit(s)}>Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* ===== Edit Modal ===== */}
            {editStudent && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Edit {editStudent.name}</h3>
                        <label>
                            Name:
                            <input
                                value={editStudent.name}
                                onChange={(e) =>
                                    setEditStudent({ ...editStudent, name: e.target.value })
                                }
                            />
                        </label>
                        <label>
                            Completed Credits:
                            <input
                                type="number"
                                value={editStudent.completedCredits}
                                onChange={(e) =>
                                    setEditStudent({
                                        ...editStudent,
                                        completedCredits: Number(e.target.value),
                                    })
                                }
                            />
                        </label>
                        <label>
                            GPA:
                            <input
                                type="number"
                                step="0.1"
                                value={editStudent.GPA}
                                onChange={(e) =>
                                    setEditStudent({
                                        ...editStudent,
                                        GPA: Number(e.target.value),
                                    })
                                }
                            />
                        </label>
                        <label>
                            Allowed Credits (Override):
                            <input
                                type="number"
                                value={editStudent.allowedCreditsOverride || ""}
                                onChange={(e) =>
                                    setEditStudent({
                                        ...editStudent,
                                        allowedCreditsOverride: e.target.value
                                            ? Number(e.target.value)
                                            : null,
                                    })
                                }
                            />
                        </label>
                        <div className="modal-actions">
                            <button onClick={handleSaveEdit}>Save</button>
                            <button onClick={() => setEditStudent(null)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== Add Modal ===== */}
            {addModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Add New Student</h3>
                        <label>
                            Name:
                            <input
                                value={newStudent.name}
                                onChange={(e) =>
                                    setNewStudent({ ...newStudent, name: e.target.value })
                                }
                            />
                        </label>
                        <label>
                            Academic ID:
                            <input
                                value={newStudent.academicId}
                                onChange={(e) =>
                                    setNewStudent({ ...newStudent, academicId: e.target.value })
                                }
                            />
                        </label>
                        <label>
                            Regulation:
                            <select
                                value={newStudent.regulation}
                                onChange={(e) =>
                                    setNewStudent({ ...newStudent, regulation: e.target.value })
                                }
                            >
                                <option value="new">New (165 Credits)</option>
                                <option value="old">Old (180 Credits)</option>
                            </select>
                        </label>
                        <label>
                            Completed Credits:
                            <input
                                type="number"
                                value={newStudent.completedCredits}
                                onChange={(e) =>
                                    setNewStudent({
                                        ...newStudent,
                                        completedCredits: Number(e.target.value),
                                    })
                                }
                            />
                        </label>
                        <label>
                            GPA:
                            <input
                                type="number"
                                step="0.1"
                                value={newStudent.GPA}
                                onChange={(e) =>
                                    setNewStudent({ ...newStudent, GPA: Number(e.target.value) })
                                }
                            />
                        </label>
                        <div className="modal-actions">
                            <button onClick={handleAddStudent}>Add</button>
                            <button onClick={() => setAddModalOpen(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentsPage;