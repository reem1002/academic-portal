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
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("All"); // All | Mandatory | Elective

    const levels = ["Freshman", "Sophomore", "Junior", "Senior"];
    const maxCredits = 18;

    useEffect(() => {
        const opened = JSON.parse(localStorage.getItem("openedCourses")) || [];
        setOpenedCourses(opened);

        const currentUser = JSON.parse(localStorage.getItem("currentUser"));

        // جميع اختيارات الطالب من الـ studentSelections
        const selections = JSON.parse(localStorage.getItem("studentSelections")) || [];
        const userSelections = selections.filter(s => s.studentName === currentUser.name);

        // المواد المقترحة (لكن بدون المواد المفتوحة من الدكتور)
        const proposed = bylawCourses.filter(
            c => !opened.some(o => o.code === c.code)
        );

        // دمج الـ selectedCourses مع أي اختيارات سابقة للطالب
        setSelectedCourses([...userSelections]);

        // حالة التخرج
        setIsGraduating(userSelections.some(s => s.isGraduate));

        // معلومات انتهاء Pre-registration
        const preRegInfo = JSON.parse(localStorage.getItem("preRegistrationInfo")) || {};
        if (preRegInfo.end) {
            setRegistrationEnd(new Date(preRegInfo.end));
        } else {
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + 7);
            setRegistrationEnd(endDate);
            localStorage.setItem("preRegistrationInfo", JSON.stringify({ end: endDate }));
        }
    }, []);

    const canModify = () => {
        if (!registrationEnd) return false;
        return new Date() <= registrationEnd;
    };

    // إضافة مادة
    const addCourse = (course) => {
        if (!course || !canModify()) return;

        const totalCredits = selectedCourses.reduce((sum, c) => sum + c.credits, 0);
        if (totalCredits + course.credits > maxCredits) {
            return alert("You exceeded the maximum allowed credits");
        }

        if (!selectedCourses.some(c => c.code === course.code)) {
            setSelectedCourses([...selectedCourses, course]);
        }
    };

    // إزالة مادة
    const removeCourse = (code) => {
        if (!canModify()) return;
        setSelectedCourses(selectedCourses.filter(c => c.code !== code));
    };

    // حفظ التسجيل
    const submitSelection = () => {
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        const allSelections = JSON.parse(localStorage.getItem("studentSelections")) || [];
        const updatedSelections = allSelections.filter(s => s.studentName !== currentUser.name);

        const newSelections = selectedCourses.map(c => ({
            studentName: currentUser.name,
            isGraduate: isGraduating,
            ...c
        }));

        localStorage.setItem("studentSelections", JSON.stringify([...updatedSelections, ...newSelections]));
        alert("Your pre-registration has been saved!");
    };

    // المواد المفتوحة للمستوى الحالي
    const filteredOpenedCourses = openedCourses
        .filter(course => course.level === activeLevel)
        .filter(course =>
            course.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .filter(course => {
            if (typeFilter === "All") return true;
            if (typeFilter === "Mandatory") return course.mandatory;
            if (typeFilter === "Elective") return !course.mandatory;
            return true;
        });


    // Proposed Courses (كل الـ bylawCourses مش مفتوحة من الدكتور)
    const proposedCourses = bylawCourses.filter(
        c =>
            !openedCourses.some(o => o.code === c.code) &&
            !selectedCourses.some(s => s.code === c.code)
    );

    return (
        <div className="pr-container">
            <h2 className="pr-title">Academic Pre-Registration</h2>
            <p className="pr-note">
                This is a <strong>pre-registration</strong>, not the official university registration.
            </p>

            <p className="pr-credits">
                Selected Credits: <strong>{selectedCourses.reduce((sum, c) => sum + c.credits, 0)}</strong> / {maxCredits}
            </p>

            <label className="pr-checkbox">
                <input
                    type="checkbox"
                    checked={isGraduating}
                    disabled={!canModify()}
                    onChange={() => setIsGraduating(!isGraduating)}
                />{" "}
                I am a graduating student
            </label>

            <p>
                {registrationEnd && (
                    <em>
                        Pre-registration closes on: {registrationEnd.toLocaleString()}
                        {!canModify() && " (Registration period ended)"}
                    </em>
                )}
            </p>

            <div className="regHeader">

                {/* Tabs حسب المستوى */}
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

                {/* Filters */}
                <div className="pr-filters">
                    <input
                        type="text"
                        placeholder="Search by course name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pr-search-input"
                    />

                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="pr-select"
                    >
                        <option value="All">All Types</option>
                        <option value="Mandatory">Mandatory</option>
                        <option value="Elective">Elective</option>
                    </select>
                </div>
            </div>

            {/* جدول المواد المفتوحة */}
            <h4>Opened Courses</h4>
            <table className="pr-table">
                <thead>
                    <tr>
                        <th>Code</th>
                        <th>Course Name</th>
                        <th>Credits</th>
                        <th>Type</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredOpenedCourses.map(course => {
                        const selected = selectedCourses.some(c => c.code === course.code);
                        return (
                            <tr
                                key={course.code}
                                className={selected ? "pr-row-selected" : ""}
                                style={{
                                    backgroundColor: selected ? "#d1f0d1" : "", // اللون الأخضر الخفيف للمواد المختارة
                                    fontWeight: selected ? "bold" : "normal"   // الخط العريض كمان للتمييز
                                }}
                            >
                                <td>{course.code}</td>
                                <td>{course.name}</td>
                                <td>{course.credits}</td>
                                <td>{course.mandatory ? "Mandatory" : "Elective"}</td>
                                <td>
                                    <button
                                        className="pr-action-btn"
                                        disabled={!canModify()}
                                        onClick={() => selected ? removeCourse(course.code) : addCourse(course)}
                                    >
                                        {selected ? <FiTrash2 size={16} /> : <FiPlus size={18} />} {/* بدل "Add" أيقونة زائد */}
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>


            {/* Dropdown لإضافة مواد مقترحة */}
            {proposedCourses.length > 0 && canModify() && (
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
                    <button
                        onClick={() => {
                            const course = bylawCourses.find(c => c.code === selectedDropdownCourse);
                            addCourse(course);
                            setSelectedDropdownCourse("");
                        }}
                    >
                        Add Course
                    </button>
                </div>
            )}

            <hr />

            {/* جدول المواد المختارة */}
            <h4 className="pr-selected-title">Selected Courses</h4>
            {selectedCourses.length === 0 ? (
                <p className="no-courses-msg">No courses selected yet.</p>
            ) : (
                <div className="selected-courses-table">
                    <div className="table-header">
                        <span>Course Name</span>
                        <span>Code</span>
                        <span>Credits</span>
                        <span>Type</span>
                        {canModify() && <span>Action</span>}
                    </div>

                    {selectedCourses.map(c => (
                        <div key={c.code} className="table-row">
                            <span>{c.name}</span>
                            <span>{c.code}</span>
                            <span>{c.credits} credits</span>
                            <span>{c.mandatory ? "Mandatory" : "Elective"}</span>
                            {canModify() && (
                                <button className="remove-btn" onClick={() => removeCourse(c.code)}>
                                    <FiTrash2 size={18} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <button
                className="pr-submit-btn"
                onClick={submitSelection}
                disabled={!canModify() || selectedCourses.length === 0}
            >
                Save Pre-Registration
            </button>
        </div>
    );
};

export default PreRegistrationPage;
