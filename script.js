const API_URL = "https://find-my-partner-ai.onrender.com";

let profiles = [];
let current = 0;


// ===============================
// LOAD PROFILES FROM BACKEND
// ===============================

async function loadProfiles() {

    try {

        const response = await fetch(API_URL + "/users");

        if (!response.ok) {
            throw new Error("API Error");
        }

        const data = await response.json();

        profiles = data.map(user => ({
            telegram_id: user.telegram_id,
            name: user.name,
            age: user.age,
            gender: user.gender,
            looking: user.looking,
            city: user.city,

            // Temporary photo
            photo: "https://i.pravatar.cc/500?u=" + user.telegram_id
        }));


        if (profiles.length === 0) {

            document.getElementById("profileName").innerText =
                "No Profiles Found";

            document.getElementById("profileInfo").innerText =
                "Try again later";

            return;
        }


        current = 0;

        loadProfile();

    } catch (error) {

        console.error("Backend Error:", error);

        document.getElementById("profileName").innerText =
            "Connection Error";

        document.getElementById("profileInfo").innerText =
            "Unable to load profiles";
    }
}


// ===============================
// SHOW CURRENT PROFILE
// ===============================

function loadProfile() {

    if (profiles.length === 0) return;

    const profile = profiles[current];

    document.getElementById("profilePhoto").src =
        profile.photo;

    document.getElementById("profileName").innerText =
        profile.name;

    document.getElementById("profileInfo").innerText =
        profile.age + " Years • " +
        profile.city;

}


// ===============================
// NEXT PROFILE
// ===============================

function nextProfile() {

    if (profiles.length === 0) return;

    current++;

    if (current >= profiles.length) {
        current = 0;
    }

    loadProfile();

    document.getElementById("profileCard").style.transform =
        "translateX(0) rotate(0)";
}


// ===============================
// PREVIOUS PROFILE
// ===============================

function previousProfile() {

    if (profiles.length === 0) return;

    current--;

    if (current < 0) {
        current = profiles.length - 1;
    }

    loadProfile();

    document.getElementById("profileCard").style.transform =
        "translateX(0) rotate(0)";
}


// ===============================
// SKIP PROFILE
// ===============================

function skipProfile() {

    nextProfile();

}


// ===============================
// LIKE PROFILE
// ===============================

function likeProfile() {

    if (profiles.length === 0) return;

    const likedProfile = profiles[current];

    console.log("Liked:", likedProfile);

    // Temporary match system
    const isMatch = Math.random() < 0.5;

    if (isMatch) {

        showMatch(likedProfile.name);

    } else {

        nextProfile();

    }
}


// ===============================
// MATCH POPUP
// ===============================

function showMatch(name) {

    const matchBox = document.createElement("div");

    matchBox.className = "match-popup";

    matchBox.innerHTML = `
        <div class="match-content">

            <div class="match-heart">
                💕
            </div>

            <h1>It's a Match!</h1>

            <p>
                You and ${name} liked each other.
            </p>

            <button onclick="openChat()">
                💬 Start Chat
            </button>

            <button onclick="closeMatch()">
                Continue Finding
            </button>

        </div>
    `;

    document.body.appendChild(matchBox);
}


// ===============================
// CLOSE MATCH
// ===============================

function closeMatch() {

    const popup =
        document.querySelector(".match-popup");

    if (popup) {
        popup.remove();
    }

    nextProfile();
}


// ===============================
// OPEN CHAT
// ===============================

function openChat() {

    window.location.href = "chat.html";

}


// ===============================
// SWIPE SYSTEM
// ===============================

const card =
    document.getElementById("profileCard");

let startX = 0;
let currentX = 0;
let isDragging = false;


// Touch Start
card.addEventListener("touchstart", function(event) {

    startX = event.touches[0].clientX;

    currentX = startX;

    isDragging = true;

});


// Touch Move
card.addEventListener("touchmove", function(event) {

    if (!isDragging) return;

    currentX =
        event.touches[0].clientX;

    const moveX =
        currentX - startX;

    card.style.transform =
        `translateX(${moveX}px)
         rotate(${moveX / 20}deg)`;

});


// Touch End
card.addEventListener("touchend", function() {

    if (!isDragging) return;

    isDragging = false;

    const moveX =
        currentX - startX;


    // RIGHT = LIKE
    if (moveX > 120) {

        likeProfile();

    }

    // LEFT = SKIP
    else if (moveX < -120) {

        skipProfile();

    }

    // RETURN
    else {

        card.style.transform =
            "translateX(0) rotate(0)";

    }

});


// ===============================
// START APP
// ===============================

window.onload = function() {

    loadProfiles();

};    document.getElementById("profileName").innerText =
        profiles[current].name;

    document.getElementById("profileInfo").innerText =
        profiles[current].age + " Years • " +
        profiles[current].city;
}


// Go to next profile
function nextProfile() {

    current++;

    if (current >= profiles.length) {
        current = 0;
    }

    loadProfile();

    document.getElementById("profileCard").style.transform =
        "translateX(0) rotate(0)";
}


// Like button
function likeProfile() {

    const likedName = profiles[current].name;

    const isMatch = Math.random() < 0.5;

    if (isMatch) {

        showMatch(likedName);

    } else {

        nextProfile();

    }
}
function showMatch(name) {

    const matchBox = document.createElement("div");

    matchBox.className = "match-popup";

    matchBox.innerHTML = `
        <div class="match-content">

            <div class="match-heart">
                💕
            </div>

            <h1>It's a Match!</h1>

            <p>You and ${name} liked each other.</p>

            <button onclick="openChat()">
    💬 Start Chat
</button>

            <button onclick="closeMatch()">
                Continue Finding
            </button>

        </div>
    `;

    document.body.appendChild(matchBox);
}


function closeMatch() {

    const popup = document.querySelector(".match-popup");

    if (popup) {
        popup.remove();
    }

    nextProfile();
}

// Load first profile
window.onload = function() {

    loadProfile();

};
// ---------------- SWIPE ----------------

const card = document.getElementById("profileCard");

let startX = 0;
let currentX = 0;
let isDragging = false;


// Finger touches card
card.addEventListener("touchstart", function(event) {

    startX = event.touches[0].clientX;
    currentX = startX;
    isDragging = true;

});


// Finger moves
card.addEventListener("touchmove", function(event) {

    if (!isDragging) return;

    currentX = event.touches[0].clientX;

    const moveX = currentX - startX;

    card.style.transform =
        `translateX(${moveX}px) rotate(${moveX / 20}deg)`;

});


// Finger leaves screen
card.addEventListener("touchend", function() {

    if (!isDragging) return;

    isDragging = false;

    const moveX = currentX - startX;


    // Swipe Right = Like
    if (moveX > 120) {

        likeProfile();

    }

    // Swipe Left = Skip
    else if (moveX < -120) {

        skipProfile();

    }

    // Small movement = return card
    else {

        card.style.transform =
            "translateX(0) rotate(0)";

    }

});
function previousProfile() {

    current--;

    if (current < 0) {
        current = profiles.length - 1;
    }

    loadProfile();

    document.getElementById("profileCard").style.transform =
        "translateX(0) rotate(0)";
}
function openChat() {
    window.location.href = "chat.html";
}
