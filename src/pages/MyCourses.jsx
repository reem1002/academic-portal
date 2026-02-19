import React, { useState, useEffect } from "react";
import { bylawCourses } from "../data/bylawCourses";
import "./styles/MyCourses.css";

const MyCourses = () => {
    const [student, setStudent] = useState(null);
    const [currentTermCourses, setCurrentTermCourses] = useState([]);
    const [completedCourses, setCompletedCourses] = useState([]);
    const [remainingCourses, setRemainingCourses] = useState([]);

    useEffect(() => {
        // ==================== Load Student from Local Storage ====================
        const storedUser = JSON.parse(localStorage.getItem("currentUser") || "null");
        if (!storedUser) return;
        setStudent(storedUser);

        // ==================== Load Current Term Selections ====================
        const termSelections = JSON.parse(localStorage.getItem("studentSelections") || "[]");

        const mySelections = termSelections.filter(
            s => s.studentId === storedUser.academicId
        );

        setCurrentTermCourses(mySelections);


        // ==================== Completed Courses ====================
        const completed = storedUser.coursesTaken?.map(c => ({
            ...c,
            status: "Completed",
        })) || [];
        setCompletedCourses(completed);

        // ==================== Remaining Courses ====================
        const completedCodes = completed.map(c => c.courseCode);
        const remaining = bylawCourses
            .filter(c => !completedCodes.includes(c.code))
            .map(c => ({
                ...c,
                unmetPrerequisites: c.prerequisites.filter(pr => !completedCodes.includes(pr))
            }));
        setRemainingCourses(remaining);

    }, []);

    if (!student) return <p>Please log in to see your courses.</p>;

    return (
        <div className="my-courses-page">
            <h2>My Courses - {student.name}</h2>

            {/* Current Term Courses */}
            <section>
                <h3>Current Term Courses</h3>
                {currentTermCourses.length === 0 ? (
                    <p>You have not selected any courses for this term.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Course Code</th>
                                <th>Name</th>
                                <th>Credits</th>
                                <th>Level</th>
                                {/* <th>Prerequisites</th> */}
                            </tr>
                        </thead>
                        <tbody>
                            {currentTermCourses.map(c => (
                                <tr key={c.code}>
                                    <td>{c.code}</td>
                                    <td>{c.name}</td>
                                    <td>{c.credits}</td>
                                    <td>{c.level}</td>
                                    {/* <td>
                                        {c.prerequisites && c.prerequisites.length > 0
                                            ? `${c.prerequisites.join(", ")}`
                                            : "OK"}
                                    </td> */}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>

            {/* Completed Courses */}
            <section>
                <h3>Completed Courses</h3>
                {completedCourses.length === 0 ? (
                    <p>No completed courses yet.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Course Code</th>
                                <th>Name</th>
                                <th>Credits</th>
                                <th>Grade</th>
                                <th>Letter</th>
                            </tr>
                        </thead>
                        <tbody>
                            {completedCourses.map(c => {
                                const course = bylawCourses.find(b => b.code === c.courseCode);
                                return (
                                    <tr key={c.courseCode}>
                                        <td>{c.courseCode}</td>
                                        <td>{course?.name}</td>
                                        <td>{course?.credits}</td>
                                        <td>{c.grade}</td>
                                        <td>{c.letterGrade}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </section>

            {/* Remaining Courses */}
            <section>
                <h3>Remaining Courses</h3>
                {remainingCourses.length === 0 ? (
                    <p>You have completed all required courses.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Course Code</th>
                                <th>Name</th>
                                <th>Credits</th>
                                <th>Level</th>
                                <th>Prerequisites</th>
                            </tr>
                        </thead>
                        <tbody>
                            {remainingCourses.map(c => (
                                <tr key={c.code}>
                                    <td>{c.code}</td>
                                    <td>{c.name}</td>
                                    <td>{c.credits}</td>
                                    <td>{c.level}</td>
                                    <td>
                                        {c.unmetPrerequisites.length > 0
                                            ? c.unmetPrerequisites.join(", ")
                                            : "None"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>
        </div>
    );
};

export default MyCourses;
