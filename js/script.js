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

const progressText = document.getElementById("progress-text");
const progressFill = document.getElementById("progress-fill");

if (progressText && progressFill) {
    progressText.textContent =
        `Semester je dokončený na ${Math.round(progress)} %.`;

    progressFill.style.width = `${progress}%`;
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

    if (!message) {
        return;
    }


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

// create map
const map = L.map("map").setView([48.151965, 17.072995],15);

L.tileLayer(
    "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        maxZoom: 19,
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }
).addTo(map);

const SCHOOL = {
    name: "FEI STU Bratislava",
    lat: 48.151965,
    lng: 17.072995
};

const HOME = {
    name: "Domov",
    lat: 48.17,
    lng: 17.08
};

const schoolMarker = L.marker([SCHOOL.lat, SCHOOL.lng]).addTo(map)
    .bindPopup(SCHOOL.name);

const homeMarker = L.marker([HOME.lat, HOME.lng]).addTo(map)
    .bindPopup(HOME.name);

let places = JSON.parse(localStorage.getItem("places")) || [];
const placeMarkers = [];

function addPlaceMarker(place, index) {
    const marker = L.marker([place.lat, place.lng])
        .addTo(map)
        .bindPopup(place.name);

    placeMarkers[index] = marker;
}

places.forEach((place,index) => {
    addPlaceMarker(place, index);
});

showPlaces();
updatePlaceSelect();

map.on("click", function(event) {
    const lat = event.latlng.lat;
    const lng = event.latlng.lng;

    const name = prompt("Zadajte názov miesta:");

    if (!name) {
        return;
    }

    const place = {
        name: name,
        lat: lat,
        lng: lng
    };

    places.push(place);

    localStorage.setItem("places", JSON.stringify(places));

    addPlaceMarker(place, places.length - 1);
    showPlaces();
    updatePlaceSelect();
});

function showPlaces() {
    const placesList = document.getElementById("places-list");

    placesList.innerHTML = "";

    places.forEach(place => {
        const li = document.createElement("li");
        li.textContent = place.name;

        placesList.appendChild(li);
    });
}

function updatePlaceSelect() {
    const select = document.getElementById("place-select");

    select.innerHTML = '<option value="">Vyberte miesto</option>';

    places.forEach((place, index) => {
        const option = document.createElement("option");

        option.value = index;
        option.textContent = place.name;

        select.appendChild(option);
    });
}

function calculateDistance(latitude1, longitude1, latitude2, longitude2){
    // Haversine 
    const R = 6371;

    const lat1Radians = latitude1 * Math.PI / 180;
    const lat2Radians = latitude2 * Math.PI / 180;

    const latDifference = (latitude2 - latitude1) * Math.PI / 180;
    const lngDifference = (longitude2 - longitude1) * Math.PI / 180;

    const a = Math.sin(latDifference / 2) ** 2 + 
    Math.cos(lat1Radians) * Math.cos(lat2Radians) * Math.sin(lngDifference / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
}

let routeLine = null;
const calculateButton = document.getElementById("calculate-route");

calculateButton.addEventListener("click", function() {
    const placeSelect = document.getElementById("place-select");
    const destinationSelect = document.getElementById("destination-select");
    const result = document.getElementById("distance-result");

    if (placeSelect.value === "") {
        result.textContent = "Najprv vyberte miesto.";
        return;
    }

    const place = places[Number(placeSelect.value)];

    let destination;

    if (destinationSelect.value === "school") {
        destination = SCHOOL;
    } else {
        destination = HOME;
    }

    const distance = calculateDistance(
        place.lat,
        place.lng,
        destination.lat,
        destination.lng
    );

    if (routeLine !== null) {
        map.removeLayer(routeLine);
    }

    routeLine = L.polyline([
        [place.lat, place.lng],
        [destination.lat, destination.lng]
    ]).addTo(map);

    const placeMarker = placeMarkers[Number(placeSelect.value)];

    placeMarker.bindPopup(
        `<strong>${place.name}</strong><br>Vzdialenosť: ${distance.toFixed(2)} km`
    ).openPopup();

    const destinationMarker =
        destinationSelect.value === "school"
            ? schoolMarker
            : homeMarker;

    destinationMarker.bindPopup(
        `<strong>${destination.name}</strong><br>Vzdialenosť: ${distance.toFixed(2)} km`
    );

    result.textContent =
        `Vzdialenosť medzi ${place.name} a ${destination.name} je ${distance.toFixed(2)} km.`;
});