// ========================== bylawCourses.js ==========================
export const bylawCourses = [
    { code: "CSE101", name: "Intro to Programming", credits: 3, mandatory: true, level: "Freshman", prerequisites: [] },
    { code: "CSE102", name: "Computer Basics", credits: 2, mandatory: true, level: "Freshman", prerequisites: [] },
    { code: "CSE201", name: "Data Structures", credits: 3, mandatory: true, level: "Sophomore", prerequisites: [] },
    { code: "CSE202", name: "Algorithms", credits: 3, mandatory: true, level: "Sophomore", prerequisites: [] },
    { code: "CSE301", name: "Operating Systems", credits: 3, mandatory: true, level: "Junior", prerequisites: ["CSE101"] },
    { code: "CSE302", name: "Database Systems", credits: 3, mandatory: true, level: "Junior", prerequisites: ["CSE102"] },
    { code: "CSE401", name: "Software Engineering", credits: 3, mandatory: true, level: "Senior", prerequisites: ["CSE101", "CSE102"] },
    { code: "CSE402", name: "Artificial Intelligence", credits: 3, mandatory: false, level: "Senior", prerequisites: ["CSE201"] },
    { code: "CSE451", name: "Cloud Computing", credits: 3, mandatory: false, level: "Senior", prerequisites: ["CSE201"] },
    { code: "CSE452", name: "Cybersecurity Basics", credits: 2, mandatory: false, level: "Senior", prerequisites: ["CSE202"] },
    { code: "CSE403", name: "Advanced AI", credits: 3, mandatory: false, level: "Senior", prerequisites: ["CSE402"] },
];

// ========================== Helper Functions ==========================
export const getLetterGrade = (grade) => {
    if (grade >= 93) return "A+";
    if (grade >= 90) return "A";
    if (grade >= 87) return "A-";
    if (grade >= 83) return "B+";
    if (grade >= 80) return "B";
    if (grade >= 77) return "B-";
    if (grade >= 73) return "C+";
    if (grade >= 70) return "C";
    if (grade >= 67) return "C-";
    if (grade >= 63) return "D+";
    if (grade >= 60) return "D";
    return "F";
};

export const getStudentLevel = (student) => {
    const totalCredits = student.regulation === "new" ? 165 : 180;
    const percent = (student.completedCredits / totalCredits) * 100;
    if (percent >= 0 && percent < 25) return "Freshman";
    if (percent >= 25 && percent < 50) return "Sophomore";
    if (percent >= 50 && percent < 75) return "Junior";
    if (percent >= 75 && percent < 100) return "Senior";
    return "Graduated";
};

export const getAllowedCredits = (student) => {
    if (student.allowedCreditsOverride) return student.allowedCreditsOverride;
    if (student.GPA >= 3) return 21;
    if (student.GPA >= 2) return 18;
    return 14;
};

export default bylawCourses;
