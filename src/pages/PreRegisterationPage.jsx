import { useState, useEffect } from "react";
import "./styles/PreRegistrationPage.css";
import bylawCourses from "../data/bylawCourses";
import { FiTrash2 } from "react-icons/fi";


const PreRegistrationPage = () => {
    const [openedCourses, setOpenedCourses] = useState([]);
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [selectedDropdownCourse, setSelectedDropdownCourse] = useState("");
    const [isGraduating, setIsGraduating] = useState(false);
    const [activeLevel, setActiveLevel] = useState("Freshman");
    const [registrationEnd, setRegistrationEnd] = useState(null); // نهاية التسجيل المبدئي

    const levels = ["Freshman", "Sophomore", "Junior", "Senior"];
    const maxCredits = 18;

    useEffect(() => {
        // جلب المواد المفتوحة
        const opened = JSON.parse(localStorage.getItem("openedCourses")) || [];
        setOpenedCourses(opened);

        // جلب اختيارات الطالب السابقة
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        const selections = JSON.parse(localStorage.getItem("studentSelections")) || [];
        const userSelections = selections.filter(s => s.studentName === currentUser.name);
        setSelectedCourses(userSelections);
        setIsGraduating(userSelections.some(s => s.isGraduate));

        // جلب مدة التسجيل المبدئي (Pre-registration)
        const preRegInfo = JSON.parse(localStorage.getItem("preRegistrationInfo")) || {};
        if (preRegInfo.end) {
            setRegistrationEnd(new Date(preRegInfo.end));
        } else {
            // إذا لم تكن محددة، نحدد 7 أيام من الآن (باي ديفولت)
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + 7);
            setRegistrationEnd(endDate);
            localStorage.setItem("preRegistrationInfo", JSON.stringify({ end: endDate }));
        }
    }, []);

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

    const removeCourse = (code) => {
        if (!canModify()) return;
        setSelectedCourses(selectedCourses.filter(c => c.code !== code));
    };

    const submitSelection = () => {
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        const allSelections = JSON.parse(localStorage.getItem("studentSelections")) || [];

        // إزالة أي تسجيل سابق لنفس الطالب
        const updatedSelections = allSelections.filter(s => s.studentName !== currentUser.name);

        const newSelections = selectedCourses.map(c => ({
            studentName: currentUser.name,
            isGraduate: isGraduating,
            ...c
        }));

        localStorage.setItem("studentSelections", JSON.stringify([...updatedSelections, ...newSelections]));
        alert("Your pre-registration has been saved!");
    };

    // التحقق إذا التسجيل المبدئي ما زال مفتوح
    const canModify = () => {
        if (!registrationEnd) return false;
        return new Date() <= registrationEnd;
    };

    // المواد المفتوحة للمستوى الحالي
    const filteredOpenedCourses = openedCourses.filter(course => course.level === activeLevel);

    // المواد اللي ممكن إضافتها من Dropdown (ليست مفتوحة بعد)
    const dropdownOptions = bylawCourses
        .filter(c => !openedCourses.some(o => o.code === c.code) && !selectedCourses.some(s => s.code === c.code));

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

            {/* جدول المواد المفتوحة للمستوى الحالي */}
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
                            <tr key={course.code} className={selected ? "pr-row-selected" : ""}>
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
                                        {selected ? "Remove" : "Add"}
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* Dropdown بعد الجدول لإضافة مواد مقترحة */}
            {dropdownOptions.length > 0 && canModify() && (
                <div className="pr-dropdown">
                    <h4>Add a Proposed Course</h4>
                    <select
                        value={selectedDropdownCourse}
                        onChange={(e) => setSelectedDropdownCourse(e.target.value)}
                    >
                        <option value="">-- Select a course --</option>
                        {dropdownOptions.map(c => (
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
