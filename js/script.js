const START_SEMESTER = new Date("14.09.2026");
const END_SEMESTER = new Date("11.12.2026");


function semesterProgress() {
    const today = new Date();

    const progress = (today - START_SEMESTER) / (END_SEMESTER - START_SEMESTER) * 100;
    return progress;
}

const filterButtons = document.querySelectorAll(".filter-button");

filterButtons.forEach(button => {
    button.addEventListener("click", function () {

        filterButtons.forEach(button => {
            button.classList.remove("active");
        });

        this.classList.add("active");
    });
});

function showLessons(type) {
    const lessons = document.querySelectorAll(".lecture, .seminar, .pe");

    lessons.forEach(lesson => {
        if (type === "all" || lesson.classList.contains(type)) {
            lesson.style.visibility = "visible";
        } else {
            lesson.style.visibility = "hidden";
        }
    });
}

