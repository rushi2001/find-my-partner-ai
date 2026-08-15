const API_URL =
    "https://find-my-partner-ai.onrender.com";

const tg = window.Telegram.WebApp;

tg.ready();
tg.expand();

const currentUserId =
    tg.initDataUnsafe?.user?.id;

console.log("Telegram User:", currentUserId);

let profiles = [];
let current = 0;


// ==========================================
// LOAD PROFILES
// ==========================================

async function loadProfiles() {

    try {

        const nameElement =
            document.getElementById("profileName");

        const infoElement =
            document.getElementById("profileInfo");

        if (!currentUserId) {

            nameElement.innerText =
                "Telegram Login Required";

            infoElement.innerText =
                "Please open this app from Telegram.";

            return;
        }


        nameElement.innerText =
            "Loading...";

        infoElement.innerText =
            "Finding profiles...";


        const response = await fetch(
            API_URL +
            "/profiles/" +
            currentUserId
        );


        const data =
            await response.json();


        console.log(
            "PROFILE API:",
            data
        );


        if (!response.ok || !data.success) {

            nameElement.innerText =
                "Registration Required";

            infoElement.innerText =
                data.message ||
                "Please create your profile first.";

            return;
        }


        profiles =
            data.profiles || [];


        if (profiles.length === 0) {

            nameElement.innerText =
                "No Profiles Found";

            infoElement.innerText =
                "No matching profiles available.";

            document.getElementById(
                "profilePhoto"
            ).style.display = "none";

            return;
        }


        current = 0;

        document.getElementById(
            "profilePhoto"
        ).style.display = "block";


        loadProfile();


    } catch (error) {

        console.error(
            "PROFILE ERROR:",
            error
        );


        document.getElementById(
            "profileName"
        ).innerText =
            "Connection Error";


        document.getElementById(
            "profileInfo"
        ).innerText =
            "Unable to connect to server.";
    }
}


// ==========================================
// SHOW PROFILE
// ==========================================

function loadProfile() {

    if (!profiles.length) {
        return;
    }


    const profile =
        profiles[current];


    const photoElement =
        document.getElementById(
            "profilePhoto"
        );


    // IMPORTANT:
    // Backend returns "photo",
    // not "photo_id"

    if (profile.photo) {

        photoElement.src =
            profile.photo;

    } else {

        photoElement.src =
            "https://i.pravatar.cc/500?u=" +
            profile.telegram_id;
    }


    document.getElementById(
        "profileName"
    ).innerText =
        profile.name;


    document.getElementById(
        "profileInfo"
    ).innerText =
        profile.age +
        " Years • " +
        profile.city;


    resetCard();
}


// ==========================================
// NEXT
// ==========================================

function nextProfile() {

    if (!profiles.length) {
        return;
    }


    current++;


    if (current >= profiles.length) {

        current = 0;
    }


    loadProfile();
}


// ==========================================
// PREVIOUS
// ==========================================

function previousProfile() {

    if (!profiles.length) {
        return;
    }


    current--;


    if (current < 0) {

        current =
            profiles.length - 1;
    }


    loadProfile();
}


// ==========================================
// SKIP
// ==========================================

function skipProfile() {

    if (!profiles.length) {
        return;
    }


    nextProfile();
}


// ==========================================
// LIKE
// ==========================================

async function likeProfile() {

    if (!profiles.length) {
        return;
    }


    if (!currentUserId) {

        alert(
            "Telegram user not detected."
        );

        return;
    }


    const likedProfile =
        profiles[current];


    try {

        const response =
            await fetch(

                API_URL +
                "/like/" +
                currentUserId +
                "/" +
                likedProfile.telegram_id,

                {
                    method: "POST"
                }
            );


        const data =
            await response.json();


        console.log(
            "LIKE RESPONSE:",
            data
        );


        if (!response.ok ||
            !data.success) {

            alert(
                data.message ||
                "Like could not be saved."
            );

            return;
        }


        if (data.match) {

            showMatch(
                likedProfile.name
            );

        } else {

            nextProfile();
        }


    } catch (error) {

        console.error(
            "LIKE ERROR:",
            error
        );


        alert(
            "Unable to save Like."
        );
    }
}


// ==========================================
// MATCH POPUP
// ==========================================

function showMatch(name) {

    const oldPopup =
        document.querySelector(
            ".match-popup"
        );


    if (oldPopup) {
        oldPopup.remove();
    }


    const matchBox =
        document.createElement(
            "div"
        );


    matchBox.className =
        "match-popup";


    matchBox.innerHTML = `

        <div class="match-content">

            <div class="match-heart">
                💕
            </div>

            <h1>
                It's a Match!
            </h1>

            <p>
                You and
                <b>${name}</b>
                liked each other.
            </p>

            <button
                onclick="openChat()"
            >
                💬 Start Chat
            </button>

            <button
                onclick="closeMatch()"
            >
                Continue Finding
            </button>

        </div>

    `;


    document.body.appendChild(
        matchBox
    );
}


// ==========================================
// CLOSE MATCH
// ==========================================

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


// ==========================================
// OPEN CHAT
// ==========================================

function openChat() {

    window.location.href =
        "chat.html";
}


// ==========================================
// RESET CARD
// ==========================================

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


// ==========================================
// SWIPE
// ==========================================

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

            currentX =
                startX;

            isDragging =
                true;
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


            isDragging =
                false;


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


// ==========================================
// START
// ==========================================

window.addEventListener(
    "load",
    function() {

        loadProfiles();

    }
);