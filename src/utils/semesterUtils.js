export const generateSemesterId = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    let season;
    if (month >= 2 && month <= 6) season = "Spring";
    else if (month >= 7 && month <= 9) season = "Summer";
    else season = "Fall";

    return `${year}-${season}`;
};

export const getCurrentSemester = () => {
    return localStorage.getItem("currentSemester");
};
