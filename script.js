const API_URL = "https://find-my-partner-ai.onrender.com";

const tg = window.Telegram.WebApp;

tg.ready();
tg.expand();

const currentUserId = tg.initDataUnsafe?.user?.id;

console.log("Telegram WebApp:", tg);
console.log("initData:", tg.initData);
console.log("initDataUnsafe:", tg.initDataUnsafe);
console.log("Telegram User:", tg.initDataUnsafe?.user);
let profiles = [];
let current = 0;


// ===============================
// LOAD PROFILES FOR CURRENT USER
// ===============================

async function loadProfiles() {

    try {

        if (!currentUserId) {

            document.getElementById("profileName").innerText =
                "Telegram Login Required";

            document.getElementById("profileInfo").innerText =
                "Open this app from Telegram.";

            return;
        }

        const response = await fetch(
            API_URL + "/profiles/" + currentUserId
        );

        const data = await response.json();

        console.log("PROFILE API:", data);

        if (!data.success) {

            document.getElementById("profileName").innerText =
                "Registration Required";

            document.getElementById("profileInfo").innerText =
                data.message || "Please register first.";

            return;
        }

        profiles = data.profiles || [];

        if (profiles.length === 0) {

            document.getElementById("profileName").innerText =
                "No Profiles Found";

            document.getElementById("profileInfo").innerText =
                "No matching profiles available.";

            return;
        }

        current = 0;

        loadProfile();

    } catch (error) {

        console.error("PROFILE ERROR:", error);

        document.getElementById("profileName").innerText =
            "Connection Error";

        document.getElementById("profileInfo").innerText =
            "Unable to connect to server.";
    }
}


// ===============================
// SHOW PROFILE
// ===============================

function loadProfile() {

    if (profiles.length === 0) {
        return;
    }

    const profile = profiles[current];

    const photo =
        profile.photo_id ||
        "https://i.pravatar.cc/500?u=" + profile.telegram_id;

    document.getElementById("profilePhoto").src = photo;

    document.getElementById("profileName").innerText =
        profile.name;

    document.getElementById("profileInfo").innerText =
        profile.age + " Years • " +
        profile.city;
}


// ===============================
// NEXT
// ===============================

function nextProfile() {

    if (profiles.length === 0) {
        return;
    }

    current++;

    if (current >= profiles.length) {
        current = 0;
    }

    loadProfile();

    resetCard();
}


// ===============================
// PREVIOUS
// ===============================

function previousProfile() {

    if (profiles.length === 0) {
        return;
    }

    current--;

    if (current < 0) {
        current = profiles.length - 1;
    }

    loadProfile();

    resetCard();
}


// ===============================
// SKIP
// ===============================

function skipProfile() {

    nextProfile();

}


// ===============================
// REAL LIKE
// ===============================

async function likeProfile() {

    if (profiles.length === 0) {
        return;
    }

    if (!currentUserId) {

        alert("Telegram user not detected.");

        return;
    }

    const likedProfile = profiles[current];

    try {

        const response = await fetch(
            API_URL +
            "/like/" +
            currentUserId +
            "/" +
            likedProfile.telegram_id,
            {
                method: "POST"
            }
        );

        const data = await response.json();

        console.log("LIKE RESPONSE:", data);

        if (!data.success) {

            alert(
                data.message ||
                "Like could not be saved."
            );

            return;
        }

        if (data.match) {

            showMatch(likedProfile.name);

        } else {

            nextProfile();

        }

    } catch (error) {

        console.error("LIKE ERROR:", error);

        alert(
            "Unable to save Like. Please try again."
        );
    }
}


// ===============================
// MATCH POPUP
// ===============================

function showMatch(name) {

    const matchBox =
        document.createElement("div");

    matchBox.className =
        "match-popup";

    matchBox.innerHTML = `
        <div class="match-content">

            <div class="match-heart">
                💕
            </div>

            <h1>It's a Match!</h1>

            <p>
                You and ${name}
                liked each other.
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
        document.querySelector(
            ".match-popup"
        );

    if (popup) {
        popup.remove();
    }

    nextProfile();
}


// ===============================
// OPEN CHAT
// ===============================

function openChat() {

    window.location.href =
        "chat.html";
}


// ===============================
// RESET CARD
// ===============================

function resetCard() {

    const card =
        document.getElementById(
            "profileCard"
        );

    if (card) {

        card.style.transform =
            "translateX(0) rotate(0)";
    }
}


// ===============================
// SWIPE
// ===============================

const card =
    document.getElementById(
        "profileCard"
    );

let startX = 0;
let currentX = 0;
let isDragging = false;


if (card) {

    card.addEventListener(
        "touchstart",
        function(event) {

            startX =
                event.touches[0].clientX;

            currentX = startX;

            isDragging = true;
        }
    );


    card.addEventListener(
        "touchmove",
        function(event) {

            if (!isDragging) {
                return;
            }

            currentX =
                event.touches[0].clientX;

            const moveX =
                currentX - startX;

            card.style.transform =
                `translateX(${moveX}px)
                 rotate(${moveX / 20}deg)`;
        }
    );


    card.addEventListener(
        "touchend",
        function() {

            if (!isDragging) {
                return;
            }

            isDragging = false;

            const moveX =
                currentX - startX;


            if (moveX > 120) {

                likeProfile();

            } else if (moveX < -120) {

                skipProfile();

            } else {

                resetCard();
            }
        }
    );
}


// ===============================
// START
// ===============================

window.addEventListener(
    "load",
    function() {

        loadProfiles();

    }
);