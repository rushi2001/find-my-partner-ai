const profiles = [
    {
        name: "Priya",
        age: 22,
        city: "Pune",
        photo: "https://i.pravatar.cc/300?img=5"
    },
    {
        name: "Sneha",
        age: 24,
        city: "Mumbai",
        photo: "https://i.pravatar.cc/300?img=10"
    },
    {
        name: "Pooja",
        age: 21,
        city: "Nagpur",
        photo: "https://i.pravatar.cc/300?img=20"
    },
    {
        name: "Anjali",
        age: 23,
        city: "Nashik",
        photo: "https://i.pravatar.cc/300?img=30"
    }
];

let current = 0;


// Show current profile
function loadProfile() {

    document.getElementById("profilePhoto").src =
        profiles[current].photo;

    document.getElementById("profileName").innerText =
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
