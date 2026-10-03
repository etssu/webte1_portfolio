const START_SEMESTER = new Date(2026, 8, 14); // 14.09.2026
const END_SEMESTER = new Date(2026, 11, 12); // 12.12.2026

const weekdays = ["nedeľu", "pondelok", "utorok", "stredu", "štvrtok", "piatok"];
const lessonSelector = ".lecture, .seminar, .pe";


const menuToggle = document.getElementById("menu-toggle");
const mainNav = document.getElementById("main-nav");

menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";

    menuToggle.setAttribute("aria-expanded", !isOpen);
    mainNav.style.display = isOpen ? "none" : "flex";
});

// calculate semester progress
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

// update progress bar if it exists
if (progressText && progressFill) {
    progressText.textContent =
        `Semester je dokončený na ${Math.round(progress)} %.`;

    progressFill.style.width = `${progress}%`;
}

// handle filter button clicks
const filterButtons = document.querySelectorAll(".filter-button");

filterButtons.forEach(button => {
    button.addEventListener("click", function () {
        filterButtons.forEach(button => button.classList.remove("active"));
        this.classList.add("active");
    });
});

// lessons visibility 
function showLessons(type) {
    const lessons = document.querySelectorAll(lessonSelector);
    const message = document.getElementById("filter-message");

    if (!message) {
        return;
    }
    let visibleLessons = 0;

    lessons.forEach(lesson => {
        const visible = type === "all" || lesson.classList.contains(type);

        lesson.style.visibility = visible ? "visible" : "hidden";
        lesson.style.borderColor = visible ? "var(--color-border)" : "transparent";

        if (visible) {
            visibleLessons++;
        }
    });

    if (visibleLessons === 0) {
        message.textContent = "Pre tento filter sa nenašli žiadne predmety.";
        message.style.display = "block";
    } else {
        message.style.display = "none";
    }
}

// highlight current lesson or tell when is the next one
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

    const lessons = document.querySelectorAll(lessonSelector);
    let nextLesson = null;
    let currentLesson = false;

    lessons.forEach(lesson => {
        const lessonDay = Number(lesson.dataset.day);
        const start = Number(lesson.dataset.start);
        const end = Number(lesson.dataset.end);

        if (lessonDay === day && hour >= start && hour < end) {
            // highlight lesson
            lesson.classList.add("current-lesson");
            currentLesson = true;
        }

        if (lessonDay === day && hour < start) {
            if (nextLesson === null ||
                start < Number(nextLesson.dataset.start)) {
                nextLesson = lesson;
            }
        }
    });

    if (currentLesson) {
        message.style.display = "none";
        return;
    }

    if (nextLesson !== null) {
        const nextStart = Number(nextLesson.dataset.start);

        message.textContent =
            `Výučba momentálne neprebieha. Najbližšia hodina je dnes o ${nextStart}:00.`;

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

            if (lessonDay === nextDay &&
                (nextDayLesson === null ||
                start < Number(nextDayLesson.dataset.start))) {
                nextDayLesson = lesson;
            }
        });

        if (nextDayLesson !== null) {
            break;
        }
    }

    if (nextDayLesson !== null) {
        const nextStart = Number(nextDayLesson.dataset.start);

        message.textContent =
            `Výučba momentálne neprebieha. Najbližšia hodina je v ${weekdays[nextDay]} o ${nextStart}:00.`;

        message.style.display = "block";
    }
}

updateScheduleStatus();


// create map
const mapElement = document.getElementById("map");
if (mapElement) {
    const map = L.map("map").setView([48.151965, 17.072995], 15);

    L.tileLayer(
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }
    ).addTo(map);

    // fixed places
    const SCHOOL = {name: "FEI STU Bratislava",lat: 48.151965,lng: 17.072995};
    const HOME = {name: "Domov",lat: 48.17,lng: 17.08};

    const schoolMarker = L.marker([SCHOOL.lat, SCHOOL.lng])
        .addTo(map)
        .bindPopup(SCHOOL.name);

    const homeMarker = L.marker([HOME.lat, HOME.lng])
        .addTo(map)
        .bindPopup(HOME.name);

    // user places
    let places = JSON.parse(localStorage.getItem("places")) || [];
    const placeMarkers = [];

    // add and delete user markers
    function addPlaceMarker(place, index) {
        const marker = L.marker([place.lat, place.lng])
            .addTo(map)
            .bindPopup(`${place.name}<br>
                <button onclick="deletePlace(${index})">
                    Odstrániť
                </button>
            `);

        placeMarkers[index] = marker;
    }


    function deletePlace(index) {
        placeMarkers.forEach(marker => map.removeLayer(marker));

        // remove selected place from the list
        places.splice(index, 1);
        placeMarkers.length = 0;

        // recreate place markers with new indices
        places.forEach((place, index) => {
            addPlaceMarker(place, index);
        });

        localStorage.setItem("places", JSON.stringify(places));

        showPlaces();
        updatePlaceSelect();
    }

    places.forEach((place, index) => {
        addPlaceMarker(place, index);
    });

    showPlaces();
    updatePlaceSelect();


    map.on("click", function(event) {
        const name = prompt("Zadajte názov miesta:");

        if (!name) {
            return;
        }

        const place = {
            name: name,
            lat: event.latlng.lat,
            lng: event.latlng.lng
        };

        places.push(place);
        localStorage.setItem("places", JSON.stringify(places));

        addPlaceMarker(place, places.length - 1);
        showPlaces();
        updatePlaceSelect();
    });


    function showPlaces() {
    const placesList = document.getElementById("places-list");

    placesList.innerHTML = ""; // clear the places list

    if (places.length === 0) {
        placesList.textContent = "Zatiaľ neboli pridané žiadne miesta.";
        return;
    }

    places.forEach(place => { // fill the places list
        const li = document.createElement("li");
        li.textContent = place.name;
        placesList.appendChild(li);
    });
}

    function updatePlaceSelect() {
        const select = document.getElementById("place-select");

        // reset the place list
        select.innerHTML = '<option value="">Vyberte miesto</option>';

        places.forEach((place, index) => {
            const option = document.createElement("option");

            option.value = index;
            option.textContent = place.name;

            select.appendChild(option);
        });
    }


    function calculateDistance(latitude1, longitude1, latitude2, longitude2) {
        // Haversine
        const R = 6371;

        const lat1 = latitude1 * Math.PI / 180;
        const lat2 = latitude2 * Math.PI / 180;
        const latDifference = (latitude2 - latitude1) * Math.PI / 180;
        const lngDifference = (longitude2 - longitude1) * Math.PI / 180;

        const a =
            Math.sin(latDifference / 2) ** 2 +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(lngDifference / 2) ** 2;

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    // calculate route and draw a line
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
        const destination =
            destinationSelect.value === "school" ? SCHOOL : HOME;

        const distance = calculateDistance(
            place.lat,
            place.lng,
            destination.lat,
            destination.lng
        );
        // remove the previous route line
        if (routeLine !== null) {
            map.removeLayer(routeLine);
        }

        routeLine = L.polyline([
            [place.lat, place.lng],
            [destination.lat, destination.lng]
        ]).addTo(map);

        const placeMarker = placeMarkers[Number(placeSelect.value)];

        placeMarker.bindPopup(
            `<strong>${place.name}</strong><br>
            Vzdialenosť: ${distance.toFixed(2)} km <br>
            <button onclick="deletePlace(${Number(placeSelect.value)})">
                Odstrániť
            </button>`
        ).openPopup();

        const destinationMarker =
            destinationSelect.value === "school"
                ? schoolMarker
                : homeMarker;

        destinationMarker.bindPopup(
            `<strong>${destination.name}</strong><br>
            Vzdialenosť: ${distance.toFixed(2)} km`
        );

        result.textContent =
            `Vzdialenosť medzi ${place.name} a ${destination.name} je ${distance.toFixed(2)} km.`;
    });
}