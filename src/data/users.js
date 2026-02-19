import { getLetterGrade } from "./bylawCourses";

export const users = [
    // ================= ADMIN =================
    {
        nationalId: "30101012345678",
        name: "Reem Mohamed",
        password: "1234",
        role: "admin",
    },

    // ================= NEW REGULATION (165 Credits) =================
    {
        nationalId: "30202098765432",
        name: "Ahmed Ali",
        password: "1234",
        role: "student",
        academicId: "20230001",
        regulation: "new",
        completedCredits: 30,
        GPA: 3.2,
        coursesTaken: [
            { courseCode: "CSE101", grade: 85, letterGrade: getLetterGrade(85) },
            { courseCode: "CSE102", grade: 79, letterGrade: getLetterGrade(79) },
            { courseCode: "CSE201", grade: 89, letterGrade: getLetterGrade(89) },
            { courseCode: "CSE202", grade: 95, letterGrade: getLetterGrade(95) },
        ],
    },
    {
        nationalId: "30203123456789",
        name: "Mona Khaled",
        password: "1234",
        role: "student",
        academicId: "20230002",
        regulation: "new",
        completedCredits: 60,
        GPA: 2.8,
        coursesTaken: [
            { courseCode: "CSE101", grade: 85, letterGrade: getLetterGrade(85) },
            { courseCode: "CSE102", grade: 79, letterGrade: getLetterGrade(79) },
        ],
    },
    {
        nationalId: "30111223344556",
        name: "Youssef Tarek",
        password: "1234",
        role: "student",
        academicId: "20220003",
        regulation: "new",
        completedCredits: 95,
        GPA: 3.5,
        coursesTaken: [
            { courseCode: "CSE101", grade: 92, letterGrade: getLetterGrade(92) },
            { courseCode: "CSE201", grade: 89, letterGrade: getLetterGrade(89) },
            { courseCode: "CSE202", grade: 95, letterGrade: getLetterGrade(95) },
        ],
    },
    {
        nationalId: "30010123456789",
        name: "Salma Hassan",
        password: "1234",
        role: "student",
        academicId: "20220004",
        regulation: "new",
        completedCredits: 110,
        GPA: 1.9,
        coursesTaken: [
            { courseCode: "CSE101", grade: 65, letterGrade: getLetterGrade(65) },
            { courseCode: "CSE201", grade: 70, letterGrade: getLetterGrade(70) },
            { courseCode: "CSE202", grade: 72, letterGrade: getLetterGrade(72) },
        ],
    },
    {
        nationalId: "30122334455667",
        name: "Omar Mostafa",
        password: "1234",
        role: "student",
        academicId: "20210005",
        regulation: "new",
        completedCredits: 150,
        GPA: 3.0,
        coursesTaken: [
            { courseCode: "CSE101", grade: 90, letterGrade: getLetterGrade(90) },
            { courseCode: "CSE301", grade: 85, letterGrade: getLetterGrade(85) },
            { courseCode: "CSE302", grade: 88, letterGrade: getLetterGrade(88) },
        ],
    },
    {
        nationalId: "30233445566778",
        name: "Nour Ibrahim",
        password: "1234",
        role: "student",
        academicId: "20210006",
        regulation: "new",
        completedCredits: 158,
        GPA: 3.7,
        coursesTaken: [
            { courseCode: "CSE401", grade: 93, letterGrade: getLetterGrade(93) },
            { courseCode: "CSE402", grade: 96, letterGrade: getLetterGrade(96) },
        ],
    },
    {
        nationalId: "30144556677889",
        name: "Karim Adel",
        password: "1234",
        role: "student",
        academicId: "20200007",
        regulation: "new",
        completedCredits: 165,
        GPA: 3.1,
        coursesTaken: [
            { courseCode: "CSE101", grade: 90, letterGrade: getLetterGrade(90) },
            { courseCode: "CSE401", grade: 94, letterGrade: getLetterGrade(94) },
        ],
    },

    // ================= OLD REGULATION (180 Credits) =================
    {
        nationalId: "30255667788990",
        name: "Farah Mahmoud",
        password: "1234",
        role: "student",
        academicId: "20190008",
        regulation: "old",
        completedCredits: 45,
        GPA: 2.5,
        coursesTaken: [
            { courseCode: "CSE101", grade: 72, letterGrade: getLetterGrade(72) },
            { courseCode: "CSE102", grade: 80, letterGrade: getLetterGrade(80) },
        ],
    },
    {
        nationalId: "30166778899001",
        name: "Hassan Amr",
        password: "1234",
        role: "student",
        academicId: "20190009",
        regulation: "old",
        completedCredits: 80,
        GPA: 3.3,
        coursesTaken: [
            { courseCode: "CSE101", grade: 90, letterGrade: getLetterGrade(90) },
            { courseCode: "CSE201", grade: 88, letterGrade: getLetterGrade(88) },
        ],
    },
    {
        nationalId: "30277889900112",
        name: "Laila Samy",
        password: "1234",
        role: "student",
        academicId: "20180010",
        regulation: "old",
        completedCredits: 120,
        GPA: 2.1,
        coursesTaken: [
            { courseCode: "CSE201", grade: 70, letterGrade: getLetterGrade(70) },
            { courseCode: "CSE202", grade: 75, letterGrade: getLetterGrade(75) },
            { courseCode: "CSE301", grade: 72, letterGrade: getLetterGrade(72) },
        ],
    },
    {
        nationalId: "29912345678901",
        name: "Mostafa Hany",
        password: "1234",
        role: "student",
        academicId: "20180011",
        regulation: "old",
        completedCredits: 140,
        GPA: 3.6,
        coursesTaken: [
            { courseCode: "CSE301", grade: 90, letterGrade: getLetterGrade(90) },
            { courseCode: "CSE302", grade: 87, letterGrade: getLetterGrade(87) },
        ],
    },
    {
        nationalId: "29988990011223",
        name: "Mahmoud Salah",
        password: "1234",
        role: "student",
        academicId: "20170015",
        regulation: "old",
        completedCredits: 170,
        GPA: 3.0,
        coursesTaken: [
            { courseCode: "CSE401", grade: 92, letterGrade: getLetterGrade(92) },
            { courseCode: "CSE402", grade: 88, letterGrade: getLetterGrade(88) },
        ],
    },
    {
        nationalId: "29877889900123",
        name: "Aya Gamal",
        password: "1234",
        role: "student",
        academicId: "20170016",
        regulation: "old",
        completedCredits: 178,
        GPA: 1.8,
        coursesTaken: [
            { courseCode: "CSE401", grade: 60, letterGrade: getLetterGrade(60) },
            { courseCode: "CSE402", grade: 55, letterGrade: getLetterGrade(55) },
        ],
    },
    {
        nationalId: "29766778899012",
        name: "Tamer Adel",
        password: "1234",
        role: "student",
        academicId: "20160017",
        regulation: "old",
        completedCredits: 180,
        GPA: 3.4,
        coursesTaken: [
            { courseCode: "CSE401", grade: 91, letterGrade: getLetterGrade(91) },
            { courseCode: "CSE451", grade: 85, letterGrade: getLetterGrade(85) },
        ],
    },
];


// ========================== Helper Functions ==========================


export const getStudentLevel = (student) => {
    const totalCredits = student.regulation === "new" ? 165 : 180;
    const percent = (student.completedCredits / totalCredits) * 100;

    if (percent >= 0 && percent < 25) return "Fresh";
    if (percent >= 25 && percent < 50) return "Junior";
    if (percent >= 50 && percent < 75) return "Mid";
    if (percent >= 75 && percent < 100) return "Senior";
    return "Graduated";
};

export const getAllowedCredits = (student) => {
    if (student.allowedCreditsOverride) return student.allowedCreditsOverride; // لو رئيس القسم غيرها
    if (student.GPA >= 3) return 21;
    if (student.GPA >= 2) return 18;
    return 14;
};
