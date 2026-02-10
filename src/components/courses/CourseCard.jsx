const CourseCard = ({ course, selected, onSelect }) => {
    return (
        <div className={`course-card ${selected ? "selected" : ""}`}>
            <h5>{course.name}</h5>
            <p>Code: {course.code}</p>
            <p>Credits: {course.credits}</p>
            <p>{course.mandatory ? "Mandatory" : "Elective"}</p>

            <button onClick={() => onSelect(course)}>
                {selected ? "Remove" : "Add"}
            </button>
        </div>
    );
};

export default CourseCard;
