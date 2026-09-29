const START_SEMESTER = new Date("14.09.2026");
const END_SEMESTER = new Date("11.12.2026");


function semester_progress() {
    const today = new Date();

    const progress = (today - START_SEMESTER) / (END_SEMESTER - START_SEMESTER) * 100;
    return progress;
}