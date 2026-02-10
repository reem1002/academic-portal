import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/HODCoursesPage.css";
import bylawCourses from "../data/bylawCourses";

const HODCoursesPage = () => {
    const navigate = useNavigate();

    const [courses, setCourses] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("All");
    const [levelFilter, setLevelFilter] = useState("All");
    const [preRegDays, setPreRegDays] = useState(7); // مدة التسجيل المبدئي

    useEffect(() => {
        // جلب المواد السابقة أو إنشاء نسخة جديدة من bylawCourses
        const savedCourses = JSON.parse(localStorage.getItem("openedCourses")) || [];
        const mergedCourses = bylawCourses.map(c => {
            const saved = savedCourses.find(sc => sc.code === c.code);
            return {
                ...c,
                enabled: saved ? saved.enabled : false,
                capacity: saved ? saved.capacity : 50
            };
        });
        setCourses(mergedCourses);
    }, []);

    const toggleCourse = (code) => {
        setCourses(prev => prev.map(c => c.code === code ? { ...c, enabled: !c.enabled } : c));
    };

    const updateCapacity = (code, value) => {
        setCourses(prev => prev.map(c => c.code === code ? { ...c, capacity: value } : c));
    };

    const publishCourses = () => {
        const openedCourses = courses.filter(c => c.enabled);

        const existingPreReg = JSON.parse(localStorage.getItem("preRegistrationInfo"));

        let publishDate = existingPreReg?.publishDate || new Date().toISOString();
        let durationDays = preRegDays;

        // لو فيه preRegInfo موجودة بالفعل، نخلي التاريخ القديم والمدة القديمة إلا لو الدكتور غيرها
        if (existingPreReg) {
            publishDate = existingPreReg.publishDate;
            durationDays = preRegDays; // الدكتور يقدر يغيرها لو حب
        }

        localStorage.setItem("openedCourses", JSON.stringify(courses));
        localStorage.setItem("preRegistrationInfo", JSON.stringify({
            publishDate,
            durationDays
        }));

        alert(`Courses published! Pre-registration is open for ${durationDays} days.`);
    };


    // فلترة + بحث + ترتيب المواد المفتوحة أولًا
    const filteredCourses = courses
        .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter(c => typeFilter === "All" || (typeFilter === "Mandatory" ? c.mandatory : !c.mandatory))
        .filter(c => levelFilter === "All" || c.level === levelFilter)
        .sort((a, b) => b.enabled - a.enabled); // المواد المفتوحة أولًا

    return (
        <div className="hod-container">
            <h2>Head of Department – Course Management</h2>
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
                days (default 7)
            </p>

            {/* Filters */}
            <div className="hod-filters">
                <input
                    type="text"
                    placeholder="Search by course name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="hod-search-input"
                />

                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                    <option value="All">All Types</option>
                    <option value="Mandatory">Mandatory</option>
                    <option value="Elective">Elective</option>
                </select>

                <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}>
                    <option value="All">All Levels</option>
                    <option value="Freshman">Freshman</option>
                    <option value="Sophomore">Sophomore</option>
                    <option value="Junior">Junior</option>
                    <option value="Senior">Senior</option>
                </select>
            </div>

            <table className="hod-table">
                <thead>
                    <tr>
                        <th>Open</th>
                        <th>Code</th>
                        <th>Course Name</th>
                        <th>Level</th>
                        <th>Credits</th>
                        <th>Type</th>
                        <th>Capacity</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredCourses.map(course => (
                        <tr key={course.code} className={course.enabled ? "hod-row-active" : ""}>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={course.enabled}
                                    onChange={() => toggleCourse(course.code)}
                                />
                            </td>
                            <td>{course.code}</td>
                            <td>{course.name}</td>
                            <td>{course.level}</td>
                            <td>{course.credits}</td>
                            <td>{course.mandatory ? "Mandatory" : "Elective"}</td>
                            <td>
                                <input
                                    type="number"
                                    value={course.capacity}
                                    disabled={!course.enabled}
                                    onChange={(e) => updateCapacity(course.code, e.target.value)}
                                    className="hod-capacity-input"
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <button className="hod-publish-btn" onClick={publishCourses}>Publish Courses</button>
            <button
                className="hod-publish-btn"
                style={{ marginLeft: "10px" }}
                onClick={() => navigate("/student-selections")}
            >
                View Student Selections
            </button>
        </div>
    );
};

export default HODCoursesPage;
