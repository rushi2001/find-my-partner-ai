// =========================================
// FIND MY PARTNER AI
// register.js
// =========================================


// =========================================
// API URL
// =========================================

const API_URL =
    "https://find-my-partner-ai.onrender.com";


// =========================================
// TELEGRAM WEB APP
// =========================================

const tg =
    window.Telegram.WebApp;

tg.ready();
tg.expand();


// =========================================
// GET TELEGRAM USER
// =========================================

function getTelegramUser() {

    if (
        tg.initDataUnsafe &&
        tg.initDataUnsafe.user
    ) {

        return tg.initDataUnsafe.user;

    }

    return null;
}


// =========================================
// PHOTO PREVIEW
// =========================================

const photoInput =
    document.getElementById("photo");

const photoPreview =
    document.getElementById("photoPreview");


if (photoInput) {

    photoInput.addEventListener(
        "change",
        function () {

            const file =
                this.files[0];


            if (!file) {

                return;

            }


            // Check image

            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                document.getElementById(
                    "message"
                ).innerText =
                    "❌ Please select an image.";

                return;

            }


            // Preview

            const reader =
                new FileReader();


            reader.onload =
                function (event) {

                    photoPreview.src =
                        event.target.result;

                };


            reader.readAsDataURL(
                file
            );

        }
    );

}


// =========================================
// REGISTER USER
// =========================================

async function registerUser() {


    const message =
        document.getElementById(
            "message"
        );


    // =====================================
    // TELEGRAM USER
    // =====================================

    const telegramUser =
        getTelegramUser();


    if (!telegramUser) {

        message.innerText =
            "❌ Please open this app from the Telegram bot.";

        return;

    }


    const telegramId =
        telegramUser.id;


    console.log(
        "Telegram User ID:",
        telegramId
    );


    // =====================================
    // GET FORM VALUES
    // =====================================

    const name =
        document.getElementById(
            "name"
        ).value.trim();


    const age =
        document.getElementById(
            "age"
        ).value.trim();


    const gender =
        document.getElementById(
            "gender"
        ).value;


    const looking =
        document.getElementById(
            "looking"
        ).value;


    const city =
        document.getElementById(
            "city"
        ).value.trim();


    const photo =
        document.getElementById(
            "photo"
        ).files[0];


    // =====================================
    // VALIDATION
    // =====================================

    if (!photo) {

        message.innerText =
            "❌ Please select your profile photo.";

        return;

    }


    if (!name) {

        message.innerText =
            "❌ Please enter your full name.";

        return;

    }


    if (!age) {

        message.innerText =
            "❌ Please enter your age.";

        return;

    }


    if (
        Number(age) < 18
    ) {

        message.innerText =
            "❌ You must be 18+ to use this app.";

        return;

    }


    if (!gender) {

        message.innerText =
            "❌ Please select your gender.";

        return;

    }


    if (!looking) {

        message.innerText =
            "❌ Please select who you are looking for.";

        return;

    }


    if (!city) {

        message.innerText =
            "❌ Please enter your city.";

        return;

    }


    // =====================================
    // LOADING
    // =====================================

    message.innerText =
        "⏳ Creating your profile...";


    // Disable button

    const button =
        document.querySelector(
            "button"
        );


    if (button) {

        button.disabled = true;

        button.innerText =
            "⏳ Creating Profile...";

    }


    // =====================================
    // CREATE FORM DATA
    // =====================================

    const formData =
        new FormData();


    formData.append(
        "telegram_id",
        telegramId
    );


    formData.append(
        "name",
        name
    );


    formData.append(
        "age",
        age
    );


    formData.append(
        "gender",
        gender
    );


    formData.append(
        "looking",
        looking
    );


    formData.append(
        "city",
        city
    );


    formData.append(
        "photo",
        photo
    );


    // =====================================
    // SEND TO BACKEND
    // =====================================

    try {


        console.log(
            "Sending registration..."
        );


        const response =
            await fetch(
                API_URL + "/register",
                {
                    method: "POST",

                    body: formData
                }
            );


        console.log(
            "Server status:",
            response.status
        );


        // =================================
        // READ RESPONSE
        // =================================

        const data =
            await response.json();


        console.log(
            "Register response:",
            data
        );


        // =================================
        // ERROR
        // =================================

        if (
            !response.ok ||
            !data.success
        ) {

            message.innerText =
                "❌ " +
                (
                    data.message ||
                    "Registration failed."
                );


            // Enable button again

            if (button) {

                button.disabled =
                    false;

                button.innerText =
                    "✅ Create My Profile";

            }


            return;

        }


        // =================================
        // SUCCESS
        // =================================

        message.innerText =
            "✅ Profile created successfully!";


        if (button) {

            button.innerText =
                "✅ Profile Created";

        }


        // =================================
        // TELEGRAM HAPTIC
        // =================================

        if (
            tg.HapticFeedback
        ) {

            tg.HapticFeedback.notificationOccurred(
                "success"
            );

        }


        // =================================
        // GO TO FIND PAGE
        // =================================

        setTimeout(
            function () {

                window.location.href =
                    "find.html";

            },
            1000
        );


    } catch (error) {


        console.error(
            "REGISTER ERROR:",
            error
        );


        message.innerText =
            "❌ Unable to connect to server.";


        // Enable button

        if (button) {

            button.disabled =
                false;

            button.innerText =
                "✅ Create My Profile";

        }

    }

}