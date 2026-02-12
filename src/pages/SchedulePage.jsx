import { useState } from "react";
import Papa from "papaparse";
import {
    DragDropContext,
    Droppable,
    Draggable,
} from "@hello-pangea/dnd";
import "./styles/SchedulePage.css";

const days = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu"];
const periods = [
    "9:00-10:30",
    "10:45-12:15",
    "12:30-14:00",
    "14:15-15:45",
];

const SchedulePage = () => {
    const [maxPerSection, setMaxPerSection] = useState(30);
    const [schedule, setSchedule] = useState({});

    const createEmptyGrid = () => {
        const grid = {};
        days.forEach((day) => {
            periods.forEach((period) => {
                grid[`${day}-${period}`] = [];
            });
        });
        return grid;
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const loadedCourses = results.data
                    .filter((c) => c["Course Code"])

                    .map((c) => ({
                        code: c["Course Code"],
                        name: c["Course Name"],
                        studentsCount: Number(c["Students Count"]),
                    }));

                initializeSchedule(loadedCourses);
            },
        });
    };

    const initializeSchedule = (courses) => {
        const grid = createEmptyGrid();

        let lectureDayIndex = 0;

        courses.forEach((course) => {
            const totalStudents = course.studentsCount;
            const numSections = Math.ceil(
                totalStudents / maxPerSection
            );

            // ===== 1️⃣ نحط المحاضرة =====
            const lectureDay = days[lectureDayIndex % days.length];
            const lecturePeriod = periods[0]; // أول فترة
            const lectureKey = `${lectureDay}-${lecturePeriod}`;

            grid[lectureKey].push({
                id: `${course.code}-L`,
                code: course.code,
                name: course.name,
                type: "Lecture",
            });

            // ===== 2️⃣ نحط السكاشن بعد المحاضرة =====
            let sectionCounter = 0;
            let currentDayIndex = lectureDayIndex;
            let currentPeriodIndex = 1; // بعد المحاضرة

            for (let i = 0; i < numSections; i++) {
                if (currentPeriodIndex >= periods.length) {
                    currentDayIndex++;
                    currentPeriodIndex = 0;
                }

                const day =
                    days[currentDayIndex % days.length];
                const period = periods[currentPeriodIndex];
                const key = `${day}-${period}`;

                grid[key].push({
                    id: `${course.code}-S${i + 1}`,
                    code: course.code,
                    name: course.name,
                    type: "Section",
                    students: Math.min(
                        maxPerSection,
                        totalStudents - i * maxPerSection
                    ),
                });

                currentPeriodIndex++;
                sectionCounter++;
            }

            lectureDayIndex++;
        });

        setSchedule(grid);
    };

    const onDragEnd = (result) => {
        const { source, destination } = result;
        if (!destination) return;

        const sourceKey = source.droppableId;
        const destKey = destination.droppableId;

        const sourceClone = Array.from(schedule[sourceKey]);
        const destClone = Array.from(schedule[destKey]);

        const [moved] = sourceClone.splice(source.index, 1);
        destClone.splice(destination.index, 0, moved);

        setSchedule({
            ...schedule,
            [sourceKey]: sourceClone,
            [destKey]: destClone,
        });
    };

    return (
        <div className="schedule-container">
            <h2>Schedule Builder</h2>

            <div className="controls">
                <label>
                    Max Students per Section:
                    <input
                        type="number"
                        value={maxPerSection}
                        onChange={(e) =>
                            setMaxPerSection(Number(e.target.value))
                        }
                    />
                </label>

                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                />
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="schedule-grid">
                    {days.map((day) => (
                        <div key={day} className="day-column">
                            <h4>{day}</h4>

                            {periods.map((period) => {
                                const cellKey = `${day}-${period}`;

                                return (
                                    <Droppable
                                        droppableId={cellKey}
                                        key={cellKey}
                                    >
                                        {(provided) => (
                                            <div
                                                className="period-cell"
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                            >
                                                <strong>{period}</strong>

                                                {schedule[cellKey]?.map(
                                                    (item, index) => (
                                                        <Draggable
                                                            key={item.id}
                                                            draggableId={item.id}
                                                            index={index}
                                                        >
                                                            {(provided) => (
                                                                <div
                                                                    className={`card ${item.type}`}
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                >
                                                                    <div>{item.code}</div>
                                                                    <small>
                                                                        {item.type}
                                                                    </small>
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    )
                                                )}

                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </DragDropContext>
        </div>
    );
};

export default SchedulePage;
