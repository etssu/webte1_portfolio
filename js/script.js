const START_SEMESTER = new Date(2026, 8, 14); // 14.09.2026
const END_SEMESTER = new Date(2026, 11, 12);  // 12.12.2026

const weekdays = ["nedeľu", "pondelok", "utorok", "stredu", "štvrtok", "piatok"];


function semesterProgress() {
    const today = new Date();

    const progress =
        (today - START_SEMESTER) /
        (END_SEMESTER - START_SEMESTER) * 100;

    return Math.max(0, Math.min(100, progress));
}

const progress = semesterProgress();

document.getElementById("progress-text").textContent =
    `Semester je dokončený na ${Math.round(progress)} %.`;

document.getElementById("progress-fill").style.width = `${progress}%`;

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
            lesson.style.borderColor = "#72AEB3";
        } else {
            lesson.style.visibility = "hidden";
            lesson.style.borderColor = "transparent";
        }
    });
}

function updateScheduleStatus() {
    const today = new Date();
    const day = today.getDay();
    const hour = today.getHours();
    const message = document.getElementById("schedule-message");

    if (today < START_SEMESTER || today > END_SEMESTER) {
        message.textContent = "Výučba momentálne neprebieha.";
        message.style.display = "block";
        return;
    }
     
    const lessons = document.querySelectorAll(".lecture, .seminar, .pe");
    let nextLesson = null;
    let currentLesson = false;

    lessons.forEach(lesson => {
        const lessonDay = Number(lesson.dataset.day);
        const start = Number(lesson.dataset.start);
        const end = Number(lesson.dataset.end);


        if (lessonDay === day && hour >= start && hour < end){
            // highlight lesson
            lesson.classList.add("current-lesson");
            currentLesson = true;
        } 
        if (lessonDay === day && hour < start) {
            if (nextLesson === null || start < Number(nextLesson.dataset.start)) {
                nextLesson = lesson;
            }
        }
    })

    if (currentLesson) {
    message.style.display = "none";
    return;
    }   

    if (nextLesson != null) {
        const nextStart = Number(nextLesson.dataset.start);
        message.textContent = `Výučba momentálne neprebieha. Najbližšia hodina je dnes o ${nextStart}:00.`;
        message.style.display = "block";
        return;
    }

    let nextDayLesson = null;
    let nextDay = day;

    for (let i = 0; i < 5; i++) {
        nextDay++;

        if (nextDay > 5) {
            nextDay = 1;
        }

        lessons.forEach(lesson => {
            const lessonDay = Number(lesson.dataset.day);
            const start = Number(lesson.dataset.start);

            if (lessonDay === nextDay) {
                if (nextDayLesson === null || start < Number(nextDayLesson.dataset.start)) {
                    nextDayLesson = lesson;
                }
            }
        });

        if (nextDayLesson !== null) {
            break;
        }
    }
    if (nextDayLesson != null) {
        const nextStart = Number(nextDayLesson.dataset.start);
        message.textContent = `Výučba momentálne neprebieha. Najbližšia hodina je v ${weekdays[nextDay]} o ${nextStart}:00.`;
        message.style.display = "block";
        return;
    }
}
updateScheduleStatus();

