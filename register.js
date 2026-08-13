const tg = window.Telegram.WebApp;

tg.ready();
tg.expand();


// ==========================================
// TELEGRAM USER
// ==========================================

const user = tg.initDataUnsafe?.user;


// ==========================================
// TELEGRAM TEST
// ==========================================

const message = document.getElementById("message");

if (user) {

    message.innerHTML = `
        Telegram Connected ✅<br><br>
        User ID: ${user.id}<br>
        User Name: ${user.first_name || "No name"}
    `;

} else {

    message.innerHTML = `
        ⚠️ Telegram User Not Found<br><br>
        Please open this Mini App from Telegram.
    `;

}


// ==========================================
// PHOTO PREVIEW
// ==========================================

const photoInput = document.getElementById("photo");
const photoPreview = document.getElementById("photoPreview");

photoInput.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) {
        return;
    }

    const reader = new FileReader();

    reader.onload = function (event) {
        photoPreview.src = event.target.result;
    };

    reader.readAsDataURL(file);

});


// ==========================================
// CREATE PROFILE
// ==========================================

function registerUser() {

    const name =
        document.getElementById("name").value.trim();

    const age =
        document.getElementById("age").value.trim();

    const gender =
        document.getElementById("gender").value;

    const looking =
        document.getElementById("looking").value;

    const city =
        document.getElementById("city").value.trim();


    // --------------------------------------
    // VALIDATION
    // --------------------------------------

    if (!user) {

        message.innerHTML =
            "❌ Telegram User ID not found.";

        return;
    }


    if (!name) {

        message.innerHTML =
            "❌ Please enter your name.";

        return;
    }


    if (!age || Number(age) < 18) {

        message.innerHTML =
            "❌ Age must be 18 or above.";

        return;
    }


    if (!gender) {

        message.innerHTML =
            "❌ Please select your gender.";

        return;
    }


    if (!looking) {

        message.innerHTML =
            "❌ Please select what you are looking for.";

        return;
    }


    if (!city) {

        message.innerHTML =
            "❌ Please enter your city.";

        return;
    }


    // --------------------------------------
    // PROFILE DATA
    // --------------------------------------

    const profile = {

        telegram_id: user.id,

        telegram_name:
            user.first_name || "",

        name: name,

        age: Number(age),

        gender: gender,

        looking: looking,

        city: city
    };


    console.log(
        "PROFILE DATA:",
        profile
    );


    // --------------------------------------
    // SEND DATA TO TELEGRAM BOT
    // --------------------------------------

    try {

        tg.sendData(
            JSON.stringify(profile)
        );

        message.innerHTML =
            "✅ Profile submitted successfully!";

    } catch (error) {

        console.error(error);

        message.innerHTML =
            "❌ Something went wrong.";

    }

}